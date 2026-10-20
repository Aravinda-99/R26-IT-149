"""
Component 2 — LLM explanation layer on the real pre-test (80 reviewed rows)
============================================================================
Reads eval/pretest_eval_set.csv (reviewed labels = ground truth) and the explanation
cache backend/data/c2_explanations_cache.json (built by scripts/build_explanation_cache.py),
then compares reason-group accuracy of

  model3_gate     Model 3 + rule layer + answer-key gate (the C2 label in the cache;
                  equals v2_full_gate in eval_pretest.py)
  llm_alone       llm_suggested_reason_group
  policy          verification policy: model3_gate, but for wrong options with Model 3
                  confidence < 0.5 where the LLM disagrees, the LLM's group

Caveat: the LLM sees the C2 label in its prompt, so llm_alone is anchored on Model 3
and is not an independent classifier.

Also exports eval/results/explanation_review_sheet.csv: 20 sampled rows (5 correct,
15 wrong options; seed 42) with EN / SI / Singlish text and empty rating columns.

Usage (from backend/):
  python ml/component2_error_detection/eval/eval_llm.py
Writes eval/results/llm_eval_results.json and explanation_review_sheet.csv.
"""

import json
import os
import sys

import pandas as pd
from sklearn.metrics import accuracy_score, f1_score

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(EVAL_DIR, "..", "..", ".."))
sys.path.insert(0, BACKEND_DIR)

from services.explanation_service import CACHE_PATH, VERIFY_MAX_CONF, cache_key, choose_final_label  # noqa: E402

CSV_PATH = os.path.join(EVAL_DIR, "pretest_eval_set.csv")
PRED_PATH = os.path.join(EVAL_DIR, "results", "pretest_eval_predictions.csv")
OUT_DIR = os.path.join(EVAL_DIR, "results")
SHEET_PATH = os.path.join(OUT_DIR, "explanation_review_sheet.csv")
SYSTEMS = ["model3_gate", "llm_alone", "policy"]
TEXT_COLS = ["summary_en", "where", "why_en", "fix_en", "tip_en",
             "summary_si", "why_si", "fix_si", "tip_si",
             "summary_singlish", "why_singlish", "fix_singlish", "tip_singlish"]


def score(y_true, y_pred):
    labels = sorted(set(y_true))
    return {
        "n": int(len(y_true)),
        "reason_accuracy": round(accuracy_score(y_true, y_pred), 4),
        "reason_macro_f1": round(f1_score(y_true, y_pred, average="macro", labels=labels, zero_division=0), 4),
    }


def main():
    df = pd.read_csv(CSV_PATH, keep_default_na=False)
    with open(CACHE_PATH, encoding="utf-8") as f:
        items = json.load(f)["items"]

    rows, missing = [], []
    for r in df.itertuples():
        entry = items.get(cache_key(r.question_id, r.option))
        if not entry:
            missing.append(r.sample_id)
            continue
        resp = entry["response"]
        expl = resp["explanation"]
        is_correct = bool(int(r.is_correct_option))
        final, source = choose_final_label(resp["c2_reason_group"], resp["prediction_confidence"], is_correct, expl)
        rows.append({
            "sample_id": r.sample_id, "question_id": r.question_id, "topic": r.topic, "option": r.option,
            "is_correct_option": int(r.is_correct_option), "code": r.code,
            "label": r.label, "reason_group": r.reason_group, "review_note": r.review_note,
            "prediction_confidence": resp["prediction_confidence"],
            "llm_agrees_with_label": expl.get("llm_agrees_with_label"),
            "model3_gate": resp["c2_reason_group"],
            "llm_alone": expl.get("llm_suggested_reason_group"),
            "policy": final, "label_source": source,
            "model": entry.get("model"),
            **{c: expl.get(c) for c in TEXT_COLS},
        })
    if missing:
        print(f"[WARN] {len(missing)} rows have no cache entry and are excluded: {missing}")
    res = pd.DataFrame(rows)

    results = {
        "n_rows": int(len(res)), "missing_rows": missing, "verify_max_conf": VERIFY_MAX_CONF,
        "models": sorted(res.model.dropna().unique().tolist()),
        "caveat": "The LLM sees the C2 label in its prompt, so llm_alone is anchored on Model 3.",
        "all_rows": {s: score(res.reason_group, res[s]) for s in SYSTEMS},
        "wrong_option_rows": {s: score(res[res.is_correct_option == 0].reason_group,
                                       res[res.is_correct_option == 0][s]) for s in SYSTEMS},
    }

    low = res[(res.is_correct_option == 0) & (res.prediction_confidence < VERIFY_MAX_CONF)]
    changed = res[res.policy != res.model3_gate]
    results["policy_effect"] = {
        "wrong_rows_with_model3_conf_below_threshold": int(len(low)),
        "llm_disagreed_on_those": int((low.llm_agrees_with_label == False).sum()),  # noqa: E712
        "labels_changed": int(len(changed)),
        "changes_fixed_an_error": int(((changed.policy == changed.reason_group) & (changed.model3_gate != changed.reason_group)).sum()),
        "changes_broke_a_correct_label": int(((changed.model3_gate == changed.reason_group) & (changed.policy != changed.reason_group)).sum()),
        "changed_rows": changed[["sample_id", "option", "reason_group", "model3_gate", "llm_alone", "prediction_confidence"]].to_dict("records"),
    }
    llm_wrong = res[res.llm_alone != res.reason_group]
    results["llm_alone_errors"] = llm_wrong[["sample_id", "option", "reason_group", "model3_gate", "llm_alone"]].to_dict("records")
    results["llm_disagreements_with_c2"] = int((res.llm_agrees_with_label == False).sum())  # noqa: E712

    # Cross-check: the cached C2 label should equal v2_full_gate from eval_pretest.py.
    if os.path.exists(PRED_PATH):
        pred = pd.read_csv(PRED_PATH, keep_default_na=False)[["sample_id", "v2_full_gate_reason"]]
        m = res.merge(pred, on="sample_id")
        results["cache_c2_matches_eval_pretest_v2_full_gate"] = round(float((m.model3_gate == m.v2_full_gate_reason).mean()), 4)

    os.makedirs(OUT_DIR, exist_ok=True)
    with open(os.path.join(OUT_DIR, "llm_eval_results.json"), "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    sample = pd.concat([res[res.is_correct_option == 1].sample(5, random_state=42),
                        res[res.is_correct_option == 0].sample(15, random_state=42)]).sort_values("sample_id")
    sheet = sample[["sample_id", "question_id", "topic", "option", "is_correct_option", "code", "reason_group",
                    "model3_gate", "llm_alone", "policy", "label_source"] + TEXT_COLS].rename(
        columns={"reason_group": "reviewed_reason_group", "model3_gate": "c2_reason_group",
                 "llm_alone": "llm_suggested_reason_group", "policy": "final_reason_group"})
    for c in ["correctness_1to5", "clarity_1to5", "sinhala_quality_1to5", "notes"]:
        sheet[c] = ""
    sheet.to_csv(SHEET_PATH, index=False, encoding="utf-8-sig")  # BOM so Excel shows Sinhala correctly

    print(f"Rows evaluated: {len(res)}  (models: {results['models']})")
    for subset in ("all_rows", "wrong_option_rows"):
        print(f"\n{subset}")
        for s in SYSTEMS:
            m = results[subset][s]
            print(f"  {s:<12} reason acc {m['reason_accuracy']:.4f}  macro-F1 {m['reason_macro_f1']:.4f}  (n={m['n']})")
    pe = results["policy_effect"]
    print(f"\nPolicy: {pe['wrong_rows_with_model3_conf_below_threshold']} wrong rows with conf < {VERIFY_MAX_CONF}, "
          f"LLM disagreed on {pe['llm_disagreed_on_those']}, {pe['labels_changed']} labels changed "
          f"({pe['changes_fixed_an_error']} fixed, {pe['changes_broke_a_correct_label']} broke)")
    if "cache_c2_matches_eval_pretest_v2_full_gate" in results:
        print(f"Cached C2 label == eval_pretest v2_full_gate on {results['cache_c2_matches_eval_pretest_v2_full_gate']:.0%} of rows")
    print(f"\nWrote {os.path.join(OUT_DIR, 'llm_eval_results.json')}\nWrote {SHEET_PATH} ({len(sheet)} rows)")


if __name__ == "__main__":
    main()
