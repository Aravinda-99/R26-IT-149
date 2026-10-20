"""Evaluate timing fixes without changing labels or replacing the active model."""

import hashlib
import json
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.base import clone
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, balanced_accuracy_score, f1_score
from sklearn.model_selection import StratifiedGroupKFold
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

ROOT = Path(__file__).resolve().parents[1]
COUNTS = [f"post_test_{name}_count" for name in (
    "correct", "nearly_correct", "wrong", "clearly_wrong",
)]
CATEGORIES = ["concept_name", "error_type"]
NUMBERS = ["pre_test_score", "attempt_count", "time_taken_seconds",
           "error_pattern_score", *COUNTS, "post_test_score"]


def features(frame, variant):
    result = frame[CATEGORIES + NUMBERS].copy()
    if variant == "without_time_scaled_counts":
        totals = result[COUNTS].sum(axis=1).replace(0, np.nan)
        # Preserve training's ten-answer scale without rounding away evidence.
        for name in COUNTS:
            result[name] = result[name].div(totals).mul(10).fillna(0)
    return result


def pipeline(variant, model):
    numbers = [name for name in NUMBERS
               if variant == "original_features" or name != "time_taken_seconds"]
    preprocess = ColumnTransformer([
        ("categories", OneHotEncoder(handle_unknown="ignore"), CATEGORIES),
        ("numbers", Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
        ]), numbers),
    ])
    return Pipeline([("preprocess", preprocess), ("model", clone(model))])


def metrics(y, predictions):
    return {
        "accuracy": float(accuracy_score(y, predictions)),
        "balanced_accuracy": float(balanced_accuracy_score(y, predictions)),
        "macro_f1": float(f1_score(y, predictions, average="macro")),
    }


def main():
    path = ROOT / "datasets/processed/schema_mastery_dataset.csv"
    frame = pd.read_csv(path)
    y = frame["future_success"]
    groups = frame["student_id"]
    splits = list(StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)
                  .split(frame, y, groups))
    for train, test in splits:
        assert set(groups.iloc[train]).isdisjoint(groups.iloc[test])
    sample = pd.DataFrame([{
        "concept_name": "Methods", "error_type": "METHOD_RETURN_ISSUE",
        "pre_test_score": .57, "attempt_count": 1, "time_taken_seconds": 437,
        "error_pattern_score": .68, "post_test_score": .9667,
        **dict(zip(COUNTS, [14, 1, 0, 0])),
    }])
    models = {
        "logistic_regression": LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42),
        "random_forest": RandomForestClassifier(n_estimators=120, max_depth=8,
            min_samples_leaf=5, class_weight="balanced", n_jobs=-1, random_state=42),
    }
    report = {
        "purpose": "Diagnostic ablation, not production promotion or an independent final test",
        "dataset_sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "rows": len(frame), "students": int(groups.nunique()),
        "labels_changed": False,
        "validation": "Identical five student-disjoint StratifiedGroupKFold splits, seed 42",
        "baseline": metrics(y, (frame.post_test_score >= .65).astype(int)),
        "limitations": [
            "Target is an engineered proxy containing time, retries and error recovery, not observed mastery.",
            "Removing time cannot remove the speed assumptions already encoded in the target.",
            "Training retries/error recovery differ from live pre-test attempts/detector confidence.",
            "Training answer counts are synthetic; rescaling cannot validate their live semantics.",
            "The reported case is a regression probe, not an independent evaluation dataset.",
            "Classifier accuracy uses predict (usually threshold .5), whereas DONE requires probability >= .70.",
        ],
        "results": {},
    }
    for variant in ("original_features", "without_time", "without_time_scaled_counts"):
        x = features(frame, variant)
        for name, model in models.items():
            estimator = pipeline(variant, model)
            folds = []
            oof = np.zeros(len(frame), dtype=int)
            for train, test in splits:
                fitted = clone(estimator).fit(x.iloc[train], y.iloc[train])
                predictions = fitted.predict(x.iloc[test])
                oof[test] = predictions
                folds.append(metrics(y.iloc[test], predictions))
            estimator.fit(x, y)
            positive = list(estimator.classes_).index(1)
            probes = {}
            for seconds in (60, 120, 240, 437, 900):
                probe = sample.assign(time_taken_seconds=seconds)
                probability = float(estimator.predict_proba(features(probe, variant))[0, positive])
                probes[str(seconds)] = {"probability": probability,
                                       "next_action": "DONE" if probability >= .70 else "LEARN_AGAIN"}
            result = {
                "mean_cv": {metric: float(np.mean([f[metric] for f in folds])) for metric in folds[0]},
                "std_cv": {metric: float(np.std([f[metric] for f in folds])) for metric in folds[0]},
                "folds": folds, "pooled_oof": metrics(y, oof),
                "reported_case_by_seconds": probes,
            }
            report["results"][f"{variant}/{name}"] = result
            print(variant, name, result["mean_cv"], "437s:", probes["437"], flush=True)
    output = ROOT / "evaluation/timing_ablation.json"
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"Saved diagnostic report: {output}. Active model and metadata were not modified.")


if __name__ == "__main__":
    main()
