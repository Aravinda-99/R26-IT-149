"""
Component 2 — old pipeline vs v2 + Model 3 on the real pre-test inputs
=======================================================================
Evaluates on eval/pretest_eval_set.csv (built by build_pretest_eval_set.py).

Systems compared
  old_raw            original models (best_*_model.pkl), no rules
  old_full           ErrorService.analyze with USE_C2_V2=false (original models + rule layer)
  v2_stages          v2 stage 1 / stage 2 alone (code-aware TF-IDF + LinearSVC)
  v2_model3_uncal    v2 + Model 3 no_runner, raw HGB before isotonic calibration
  v2_model3          v2 + Model 3 no_runner, calibrated  (what ErrorService uses)
  v2_model3_runner   v2 + Model 3 with_runner, using the javac/java evidence columns in the CSV
  v2_full            ErrorService.analyze with USE_C2_V2=true (v2 + Model 3 + rule layer), ML only
  v2_full_gate       v2_full + answer-key gate: rows whose option is the quiz key are sent with
                     is_correct_option=true (as quizLab.js does), others go through ML only

Metrics: broad (5 labels) and reason-group accuracy / macro-F1, plus
correct_recall (rows labelled CORRECT predicted CORRECT) and error_recall (rows
labelled as an error predicted as any error). These use the reviewed label, not the
quiz key, so a valid-Java distractor relabelled CORRECT (e.g. Q3 "Boolean") counts
as correct. Calibration (Brier, ECE) of Model 3 before vs after is reported too.

Usage (from backend/):
  python ml/component2_error_detection/eval/eval_pretest.py [--exclude-ambiguous] [--reviewed-only]
Writes eval/results/pretest_eval_results.json and pretest_eval_predictions.csv.
Firestore writes are disabled during the run.
"""

import argparse
import json
import os
import sys

import joblib
import numpy as np
import pandas as pd
from sklearn.metrics import accuracy_score, f1_score

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(EVAL_DIR, "..", "..", ".."))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)

from ml.component2_error_detection.features import (  # noqa: E402
    brier_score, broad_of, expected_calibration_error, runner_features, struct_features,
)
import services.error_service as es  # noqa: E402

es.db = None  # never write evaluation runs to Firestore

CSV_PATH = os.path.join(EVAL_DIR, "pretest_eval_set.csv")
OUT_DIR = os.path.join(EVAL_DIR, "results")
RESEARCH_MODEL3_PATH = os.path.join(EVAL_DIR, "..", "research_models", "c2_model3_research.pkl")
SYSTEMS = ["old_raw", "old_full", "v2_stages", "v2_model3_uncal", "v2_model3", "v2_model3_runner", "v2_full",
           "v2_full_gate"]


def score(df, broad_col, reason_col):
    y_b, p_b = df.label, df[broad_col]
    y_r, p_r = df.reason_group, df[reason_col]
    corr = df.label == "CORRECT"
    labels_r = sorted(set(y_r))
    return {
        "n": int(len(df)),
        "broad_accuracy": round(accuracy_score(y_b, p_b), 4),
        "broad_macro_f1": round(f1_score(y_b, p_b, average="macro", labels=sorted(set(y_b)), zero_division=0), 4),
        "reason_accuracy": round(accuracy_score(y_r, p_r), 4),
        "reason_macro_f1": round(f1_score(y_r, p_r, average="macro", labels=labels_r, zero_division=0), 4),
        "correct_recall": round(float((p_b[corr] == "CORRECT").mean()), 4) if corr.any() else None,
        "error_recall": round(float((p_b[~corr] != "CORRECT").mean()), 4) if (~corr).any() else None,
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--exclude-ambiguous", action="store_true", help="drop rows whose review_note starts with AMBIGUOUS")
    ap.add_argument("--reviewed-only", action="store_true", help="keep only rows with label_status == reviewed")
    args = ap.parse_args()

    df = pd.read_csv(CSV_PATH, keep_default_na=False)
    if args.reviewed_only:
        df = df[df.label_status == "reviewed"]
    if args.exclude_ambiguous:
        df = df[~df.review_note.str.startswith("AMBIGUOUS")]
    df = df[df.reason_group != ""].reset_index(drop=True)
    if df.empty:
        sys.exit("no rows to evaluate")
    has_runner = (df.verified_outcome != "NOT_RUN").all()

    # old raw
    m1, m2 = es.ErrorService._load_models()
    cleaned = [es.ErrorService.clean_java_code(c) for c in df.code]
    df["old_raw_broad"] = m1.predict(cleaned)
    df["old_raw_reason"] = m2.predict(cleaned)

    # v2 raw
    st1 = joblib.load(es.C2_V2_STAGE1_PATH)
    st2 = joblib.load(es.C2_V2_STAGE2_PATH)
    bundle = joblib.load(es.C2_V2_MODEL3_PATH)  # production: calibrated no_runner only
    if os.path.exists(RESEARCH_MODEL3_PATH):     # uncalibrated / with_runner variants (git-ignored)
        bundle = {**joblib.load(RESEARCH_MODEL3_PATH), **bundle}
    codes = list(df.code)
    s1, s2 = st1.decision_function(codes), st2.decision_function(codes)
    df["v2_stages_broad"] = st1.classes_[s1.argmax(1)]
    df["v2_stages_reason"] = st2.classes_[s2.argmax(1)]
    Z = np.hstack([s1, s2, np.array([struct_features(c) for c in codes])])
    calibration = {}
    for key, name in (("no_runner_uncalibrated", "v2_model3_uncal"), ("no_runner", "v2_model3")):
        if key not in bundle:
            continue
        m = bundle[key]
        proba = m.predict_proba(Z)
        df[f"{name}_reason"] = m.classes_[proba.argmax(1)]
        df[f"{name}_broad"] = [broad_of(r) for r in df[f"{name}_reason"]]
        df[f"{name}_proba"] = proba.max(1).round(4)
        calibration[name] = {"brier": round(brier_score(df.reason_group, proba, m.classes_), 4),
                             "ece_15bin": round(expected_calibration_error(df.reason_group, proba, m.classes_), 4),
                             "mean_max_proba": round(float(proba.max(1).mean()), 4)}
    if has_runner and "with_runner" in bundle:
        R = np.array([runner_features(r) for _, r in df.iterrows()])
        df["v2_model3_runner_reason"] = bundle["with_runner"].predict(np.hstack([Z, R]))
        df["v2_model3_runner_broad"] = [broad_of(r) for r in df.v2_model3_runner_reason]

    # full ErrorService pipelines
    for flag, name, gate in (("false", "old_full", False), ("true", "v2_full", False), ("true", "v2_full_gate", True)):
        os.environ["USE_C2_V2"] = flag
        b, r, m3c, src, eps, ovr, sup = [], [], [], [], [], [], []
        for c, key_ok in zip(codes, df.is_correct_option == 1):
            payload = {"student_id": "EVAL_PRETEST", "code": c}
            if gate and key_ok:
                payload["is_correct_option"] = True
            res = es.ErrorService.analyze(payload)
            b.append(res.get("final_label") or "INVALID")
            r.append(res.get("reason_group") or "INVALID")
            m3c.append(res.get("model3_changed_output"))
            src.append(res.get("source"))
            eps.append(res.get("error_pattern_score"))
            trace = res.get("model_trace") or {}
            ovr.append(len(trace.get("rule_overrides", [])))
            sup.append(len(trace.get("rules_suppressed", [])))
        df[f"{name}_broad"], df[f"{name}_reason"] = b, r
        if name != "old_full":
            df[f"{name}_model3_changed_output"] = m3c
            df[f"{name}_source"], df[f"{name}_error_pattern_score"] = src, eps
            df[f"{name}_n_rule_overrides"], df[f"{name}_n_rules_suppressed"] = ovr, sup
    os.environ.pop("USE_C2_V2", None)

    systems = [s for s in SYSTEMS if f"{s}_broad" in df]
    results = {"filters": {"exclude_ambiguous": args.exclude_ambiguous, "reviewed_only": args.reviewed_only},
               "label_status_counts": df.label_status.value_counts().to_dict(),
               "systems": {s: score(df, f"{s}_broad", f"{s}_reason") for s in systems},
               "model3_calibration": calibration,
               "v2_rule_layer": {s: {"rows_overridden": int((df[f"{s}_n_rule_overrides"] > 0).sum()),
                                     "rows_with_suppressed_rule": int((df[f"{s}_n_rules_suppressed"] > 0).sum())}
                                 for s in ("v2_full", "v2_full_gate")},
               "by_topic": {t: {s: score(g, f"{s}_broad", f"{s}_reason")["reason_accuracy"] for s in systems}
                            for t, g in df.groupby("topic")}}

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "pretest_eval_results.json"), "w") as fh:
        json.dump(results, fh, indent=2)
    keep = ["sample_id", "topic", "option", "is_correct_option", "label", "reason_group", "review_note"]
    df[keep + [c for c in df.columns
               if c.endswith(("_broad", "_reason", "_changed_output", "_proba", "_source", "_error_pattern_score", "_n_rule_overrides", "_n_rules_suppressed"))]].to_csv(
        os.path.join(OUT_DIR, "pretest_eval_predictions.csv"), index=False)

    print(f"rows={len(df)}  (labels are '{'/'.join(results['label_status_counts'])}')")
    hdr = f"{'system':18}{'broad acc':>10}{'broad F1':>10}{'reason acc':>11}{'reason F1':>10}{'corr rec':>9}{'err rec':>9}"
    print(hdr)
    for s, m in results["systems"].items():
        print(f"{s:18}{m['broad_accuracy']:>10.3f}{m['broad_macro_f1']:>10.3f}{m['reason_accuracy']:>11.3f}"
              f"{m['reason_macro_f1']:>10.3f}{m['correct_recall']:>9.3f}{m['error_recall']:>9.3f}")
    print("\nreason accuracy by topic:")
    print(pd.DataFrame(results["by_topic"]).T.to_string())
    print("\nModel 3 calibration on these rows (Brier, 15-bin ECE):")
    print(pd.DataFrame(calibration).T.to_string())
    print("\nv2 rule layer:", results["v2_rule_layer"])


if __name__ == "__main__":
    main()
