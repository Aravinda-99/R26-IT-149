"""
Component 2 v2 — final training on the FULL synthetic dataset
==============================================================
Trains and saves (never touches best_error_detection_model.pkl / best_reason_detection_model.pkl):

  ml_models/c2_stage1_v2.pkl       code-aware TF-IDF + LinearSVC, 5 broad labels
  ml_models/c2_stage2_v2.pkl       code-aware TF-IDF + LinearSVC, 12 reason groups
  ml_models/c2_model3_meta.pkl     Model 3 (production): HistGradientBoosting meta-corrector over
                                   out-of-fold stage scores + struct_features, wrapped in isotonic
                                   CalibratedClassifierCV(cv=5, ensemble=False). Key "no_runner" only.
  ml_models/c2_v2_metadata.json    classes, feature names, versions, metrics

  ml/component2_error_detection/research_models/c2_model3_research.pkl   (git-ignored)
                                   research-only variants for eval_pretest.py:
    "no_runner_uncalibrated" — raw HGB, stage scores + struct features      (ablation E3)
    "with_runner"            — calibrated, + Code Runner features           (ablation E4)
    "with_runner_uncalibrated"

The backend has no Java Code Runner, so ErrorService uses "no_runner" at inference.
Calibration quality (Brier score, ECE) before vs after is estimated with an outer 5-fold
CV on the out-of-fold features and stored in the metadata.

Usage (from backend/):
  python scripts/train_final_c2.py
"""

import datetime
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, f1_score, log_loss
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.svm import LinearSVC

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from ml.component2_error_detection.features import (  # noqa: E402
    CODE_TOKENS, FEATS, RUNNER_FEATS, brier_score, code_normalize, expected_calibration_error,
    runner_features, struct_features,
)

C2_DIR = os.path.join(BACKEND_DIR, "ml", "component2_error_detection")
DATASET_PATH = os.path.join(C2_DIR, "dataset", "c2_synthetic_dataset.csv")
ABLATION_PATH = os.path.join(C2_DIR, "results", "ablation_results.json")  # v2 ablation, sklearn 1.8.0
MODELS_DIR = os.path.join(BACKEND_DIR, "ml_models")

STAGE1_PATH = os.path.join(MODELS_DIR, "c2_stage1_v2.pkl")
STAGE2_PATH = os.path.join(MODELS_DIR, "c2_stage2_v2.pkl")
MODEL3_PATH = os.path.join(MODELS_DIR, "c2_model3_meta.pkl")
RESEARCH_MODEL3_PATH = os.path.join(C2_DIR, "research_models", "c2_model3_research.pkl")
META_PATH = os.path.join(MODELS_DIR, "c2_v2_metadata.json")

PROTECTED = {"best_error_detection_model.pkl", "best_reason_detection_model.pkl"}


def svm_pipe():
    vec = TfidfVectorizer(preprocessor=code_normalize, token_pattern=CODE_TOKENS, lowercase=False,
                          ngram_range=(1, 3), sublinear_tf=True, min_df=2)
    return Pipeline([("tfidf", vec), ("clf", LinearSVC(C=1.0, random_state=42))])


def hgb():
    return HistGradientBoostingClassifier(max_iter=300, learning_rate=0.08, random_state=42)


def calibrated(base):
    # Shuffled folds: the dataset CSV is ordered by family, so unshuffled folds would hold out whole families.
    # ensemble=False: one HGB refit on all rows + one isotonic map fitted on its 5-fold CV predictions
    # (a single model instead of 5, so the pickle stays small).
    return CalibratedClassifierCV(base, method="isotonic", ensemble=False,
                                  cv=StratifiedKFold(5, shuffle=True, random_state=42))


def metrics(y, p):
    return {"accuracy": round(accuracy_score(y, p), 4), "macro_f1": round(f1_score(y, p, average="macro"), 4)}


def proba_metrics(y, proba, classes):
    pred = np.asarray(classes)[proba.argmax(1)]
    return {**metrics(y, pred),
            "brier": round(brier_score(y, proba, classes), 4),
            "ece_15bin": round(expected_calibration_error(y, proba, classes), 4),
            "log_loss": round(log_loss(y, np.clip(proba, 1e-15, 1), labels=classes), 4),
            "mean_max_proba": round(float(proba.max(1).mean()), 4)}


def calibration_report(Z, y):
    """Outer 5-fold CV on the Model 3 features: raw HGB vs isotonic-calibrated HGB, same folds."""
    outer = StratifiedKFold(5, shuffle=True, random_state=7)
    classes = np.unique(y)
    raw, cal = np.zeros((len(y), len(classes))), np.zeros((len(y), len(classes)))
    for tr, te in outer.split(Z, y):
        raw[te] = hgb().fit(Z[tr], y[tr]).predict_proba(Z[te])
        cal[te] = calibrated(hgb()).fit(Z[tr], y[tr]).predict_proba(Z[te])
    return {"before": proba_metrics(y, raw, classes), "after": proba_metrics(y, cal, classes)}


def main():
    for p in (STAGE1_PATH, STAGE2_PATH, MODEL3_PATH, RESEARCH_MODEL3_PATH):
        assert os.path.basename(p) not in PROTECTED

    df = pd.read_csv(DATASET_PATH)
    X = df.code.values
    y_broad = df.label.values
    y_reason = df.reason_group.values
    print(f"rows={len(df)}  sklearn={sklearn.__version__}")

    # Out-of-fold stage scores: Model 3 must not be trained on over-confident in-sample scores.
    skf = StratifiedKFold(5, shuffle=True, random_state=42)
    print("out-of-fold stage scores ...", flush=True)
    oof1 = cross_val_predict(svm_pipe(), X, y_broad, cv=skf, method="decision_function")
    oof2 = cross_val_predict(svm_pipe(), X, y_reason, cv=skf, method="decision_function")

    print("fitting stage 1 / stage 2 on full data ...", flush=True)
    stage1 = svm_pipe().fit(X, y_broad)
    stage2 = svm_pipe().fit(X, y_reason)

    S = np.array([struct_features(x) for x in X])
    R = np.array([runner_features(r) for _, r in df.iterrows()])
    Z = np.hstack([oof1, oof2, S])

    print("calibration report (outer 5-fold, raw vs isotonic) ...", flush=True)
    calib = {"no_runner": calibration_report(Z, y_reason)}
    print(json.dumps(calib["no_runner"], indent=1), flush=True)

    print("fitting Model 3 (no_runner, with_runner; raw + calibrated) ...", flush=True)
    ZR = np.hstack([Z, R])
    m3_no_runner_raw = hgb().fit(Z, y_reason)
    m3_with_runner_raw = hgb().fit(ZR, y_reason)
    m3_no_runner = calibrated(hgb()).fit(Z, y_reason)
    m3_with_runner = calibrated(hgb()).fit(ZR, y_reason)

    stage1_classes = list(stage1.classes_)
    stage2_classes = list(stage2.classes_)
    score_names = [f"s1_score__{c}" for c in stage1_classes] + [f"s2_score__{c}" for c in stage2_classes]
    no_runner_features = score_names + FEATS
    with_runner_features = no_runner_features + RUNNER_FEATS

    calibration_desc = "isotonic CalibratedClassifierCV, 5-fold (shuffled, stratified), ensemble=False"
    model3_bundle = {
        "no_runner": m3_no_runner,
        "calibration": calibration_desc,
        "feature_names": {"no_runner": no_runner_features},
        "stage1_classes": stage1_classes,
        "stage2_classes": stage2_classes,
        "classes": list(m3_no_runner.classes_),
        "default_variant": "no_runner",
    }
    research_bundle = {
        "no_runner_uncalibrated": m3_no_runner_raw,
        "with_runner": m3_with_runner,
        "with_runner_uncalibrated": m3_with_runner_raw,
        "calibration": calibration_desc,
        "feature_names": {"no_runner": no_runner_features, "with_runner": with_runner_features},
        "classes": list(m3_no_runner.classes_),
    }

    os.makedirs(MODELS_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(RESEARCH_MODEL3_PATH), exist_ok=True)
    joblib.dump(stage1, STAGE1_PATH)
    joblib.dump(stage2, STAGE2_PATH)
    joblib.dump(model3_bundle, MODEL3_PATH)
    joblib.dump(research_bundle, RESEARCH_MODEL3_PATH)

    # Metrics: out-of-fold (5-fold stratified, rows) on the full dataset for the stages,
    # plus the grouped-split v2 ablation from results/ (sklearn 1.8.0; the honest estimates).
    oof_pred1 = np.array(stage1_classes)[oof1.argmax(1)]
    oof_pred2 = np.array(stage2_classes)[oof2.argmax(1)]
    ablation = {}
    if os.path.exists(ABLATION_PATH):
        with open(ABLATION_PATH) as fh:
            raw = json.load(fh)
        for split in ("random", "instance", "family"):
            ablation[split] = {k: {s: raw[split][k][s] for s in ("stage1_broad", "stage2_reason")}
                               for k in ("E1", "E2", "E3", "E4")}

    metadata = {
        "created_at": datetime.datetime.now().isoformat(timespec="seconds"),
        "sklearn_version": sklearn.__version__,
        "numpy_version": np.__version__,
        "pandas_version": pd.__version__,
        "python_version": sys.version.split()[0],
        "dataset": {"path": os.path.relpath(DATASET_PATH, BACKEND_DIR).replace("\\", "/"), "rows": int(len(df)),
                    "families": int(df.family.nunique())},
        "files": {"stage1": "c2_stage1_v2.pkl", "stage2": "c2_stage2_v2.pkl", "model3": "c2_model3_meta.pkl"},
        "stage1": {"classes": stage1_classes, "vectorizer": "code-aware TF-IDF (1-3 grams, CODE_TOKENS, min_df=2, sublinear_tf)",
                   "classifier": "LinearSVC(C=1.0)", "vocab_size": len(stage1.named_steps["tfidf"].vocabulary_)},
        "stage2": {"classes": stage2_classes, "vectorizer": "same as stage1", "classifier": "LinearSVC(C=1.0)",
                   "vocab_size": len(stage2.named_steps["tfidf"].vocabulary_)},
        "model3": {"classifier": "HistGradientBoostingClassifier(max_iter=300, learning_rate=0.08)",
                   "calibration": model3_bundle["calibration"],
                   "classes": model3_bundle["classes"], "variants": research_bundle["feature_names"],
                   "default_variant": "no_runner",
                   "research_variants_file": os.path.relpath(RESEARCH_MODEL3_PATH, BACKEND_DIR).replace("\\", "/"),
                   "note": "Trained on 5-fold out-of-fold stage decision scores. Only the calibrated 'no_runner' "
                           "variant ships in c2_model3_meta.pkl; 'with_runner' needs Code Runner evidence (javac/java), "
                           "which the backend does not provide, and lives in the git-ignored research file."},
        "metrics": {
            "full_data_oof_5fold_stratified": {"stage1_broad": metrics(y_broad, oof_pred1),
                                               "stage2_reason": metrics(y_reason, oof_pred2)},
            "model3_calibration_outer_cv": calib,
            "ablation_sklearn_1_8_0": ablation,
            "ablation_key": {"E2": "v2 stages only", "E3": "v2 + Model 3 no_runner", "E4": "v2 + Model 3 with_runner"},
            "note": "random/instance splits are in-distribution (optimistic); family split = unseen task types. "
                    "Calibration report: outer 5-fold CV over the out-of-fold stage features (the stage OOF scores "
                    "were computed once on all rows, so both raw and calibrated share the same small optimism).",
        },
    }
    with open(META_PATH, "w") as fh:
        json.dump(metadata, fh, indent=2)

    print(json.dumps(metadata["metrics"]["full_data_oof_5fold_stratified"], indent=1))
    for p in (STAGE1_PATH, STAGE2_PATH, MODEL3_PATH, RESEARCH_MODEL3_PATH, META_PATH):
        print("saved", os.path.relpath(p, BACKEND_DIR), os.path.getsize(p), "bytes")


if __name__ == "__main__":
    main()
