"""
C2 consistency audit (read-only)
================================
For every pre-test (question, option) pair (20 fill-in-the-blank questions x 4 = 80 code
rows + 5 text-only Operators questions x 4 = 20 rows) checks that what a student sees
agrees with itself:

  label        Model 3 run live on the option's code, exactly as quizLab.js does for a
               wrong answer (no answer-key flag, no history writes), vs the reviewed label
               in pretest_eval_set.csv (information only — model accuracy, not consistency).
  stale        the cached explanation was generated for a different C2 label than the one
               Model 3 gives today (the card would then describe another mistake).
  shown label  the label the AI Error Detector card shows: the explanation's final label
               under the current verification policy (explanation_service.choose_final_label,
               re-applied to cached answers on every request).
  explanation  an LLM judge reads the cached English explanation and says whether it
               describes a mistake of the shown label's type — the type's scope is the
               knowledge-base concept notes filed under it (judge results are cached in
               results/consistency_judge_cache.json, keyed by judge version + judged text).
  sandbox      the question's test cases run live: a wrong option must fail at least one
               test (or not compile) unless the eval set marks it as behaviourally
               equivalent; the correct option must pass all. Operators options are prose,
               so their rows report the starter program's run instead.

Writes results/consistency_report.csv and results/consistency_report.md. Never writes
the explanation cache, the models, the eval set or any history.

Usage (from backend/):
  python ml/component2_error_detection/eval/consistency_audit.py [--judge-model gemini-3.5-flash-lite]
                                                                  [--no-judge] [--min-interval 4]
"""

import argparse
import csv
import hashlib
import json
import os
import sys
import time
from collections import Counter

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import services.error_service as es  # noqa: E402

es.db = None  # the audit never writes to Firestore

from services import explanation_service as xs  # noqa: E402
from services import sandbox_tests_service as st  # noqa: E402
from services.error_service import ErrorService  # noqa: E402
from services.explanation_service import ExplanationService, build_code, cache_key  # noqa: E402

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
EVAL_CSV = os.path.join(EVAL_DIR, "pretest_eval_set.csv")
RESULTS_DIR = os.path.join(EVAL_DIR, "results")
REPORT_CSV = os.path.join(RESULTS_DIR, "consistency_report.csv")
REPORT_MD = os.path.join(RESULTS_DIR, "consistency_report.md")
JUDGE_CACHE = os.path.join(RESULTS_DIR, "consistency_judge_cache.json")

COLUMNS = [
    "question_id", "topic", "option", "is_correct", "has_code", "reviewed_label",
    "model3_label", "model3_confidence", "model3_matches_reviewed",
    "cached_label", "cached_confidence", "stale_cache_label",
    "llm_agrees_with_label", "llm_suggested_reason_group", "final_label_source", "shown_label",
    "explanation_matches_label", "judge_described_group", "judge_reason",
    "sandbox_mode", "sandbox_compiled", "sandbox_passed", "sandbox_total", "sandbox_ok",
    "explanation_source_model", "issues", "consistent",
]

JUDGE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "matches_label": {"type": "BOOLEAN"},
        "described_group": {"type": "STRING", "enum": xs.REASON_GROUPS},
        "reason": {"type": "STRING"},
    },
    "required": ["matches_label", "described_group", "reason"],
    "propertyOrdering": ["matches_label", "described_group", "reason"],
}


def load_reviewed():
    with open(EVAL_CSV, encoding="utf-8", newline="") as f:
        return {(int(r["question_id"]), r["option"]): r for r in csv.DictReader(f)}


def load_json(path, default):
    if os.path.exists(path):
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    return default


def save_json(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
    os.replace(tmp, path)


JUDGE_VERSION = "v2-group-scope"


def judge_prompt(label, code, correct_code, expl):
    scope = "\n".join(f"- {s}" for s in (xs.group_scope(label) or [ExplanationService._reason_text(label)]))
    return f"""You audit a Java tutoring app for consistency. A student's wrong answer is shown with a card naming ONE
mistake type, and an explanation under it. Decide whether the explanation describes a mistake of the SAME type as the card.

CARD MISTAKE TYPE: {label}
This mistake type covers these specific mistakes:
{scope}

STUDENT'S CODE: {code}
CORRECT CODE: {correct_code}

EXPLANATION SHOWN UNDER THE CARD
summary: {expl.get('summary_en', '')}
where: {expl.get('where')}
why: {expl.get('why_en', '')}
fix: {expl.get('fix_en', '')}
tip: {expl.get('tip_en', '')}

matches_label = true when the explanation is about one of the specific mistakes this type covers (different wording
is fine, and mentioning the fix is fine). false when it explains a mistake of a different type, so a student would
read two different diagnoses. described_group = the reason group the explanation itself describes, from:
{', '.join(xs.REASON_GROUPS)}. reason = one short sentence.
"""


def judge(label, code, correct_code, expl, args, judge_cache, state):
    text = json.dumps([JUDGE_VERSION, label, code, expl.get("summary_en"), expl.get("where"), expl.get("why_en"),
                       expl.get("fix_en"), expl.get("tip_en")], ensure_ascii=False)
    key = hashlib.sha1(text.encode("utf-8")).hexdigest()
    if key in judge_cache:
        return judge_cache[key]
    delay = 15.0
    for attempt in range(args.max_retries + 1):
        wait = args.min_interval - (time.monotonic() - state["last"])
        if wait > 0:
            time.sleep(wait)
        state["last"] = time.monotonic()
        try:
            raw, model = xs.call_llm(judge_prompt(label, code, correct_code, expl), 60, model=args.judge_model,
                                     response_schema=JUDGE_SCHEMA)
            obj = json.loads(raw)
            verdict = {"matches_label": bool(obj["matches_label"]), "described_group": obj.get("described_group"),
                       "reason": str(obj.get("reason", ""))[:300], "model": model}
            judge_cache[key] = verdict
            save_json(JUDGE_CACHE, judge_cache)
            return verdict
        except (xs.LLMRateLimited, xs.LLMUnavailable, xs.LLMTimeout, xs.LLMConnectionError) as e:
            if attempt == args.max_retries:
                raise
            pause = min(max(getattr(e, "retry_after", None) or delay, args.min_interval), 120.0)
            print(f"    judge {type(e).__name__} -> waiting {pause:.0f}s")
            time.sleep(pause)
            delay = min(delay * 2, 120.0)
        except (ValueError, KeyError) as e:
            print(f"    judge returned invalid JSON ({e}); retrying")
    return None


def sandbox_check(q, opt, code, is_correct, reviewed_row, starter_runs):
    spec = st.get_spec(q["id"])
    if not spec:
        return {"sandbox_mode": "none", "sandbox_ok": "no tests"}
    if spec["mode"] == "concept":
        if q["id"] not in starter_runs:
            starter_runs[q["id"]] = st.run_tests(q["id"], spec.get("starter_code") or "")
        r = starter_runs[q["id"]]
        return {"sandbox_mode": "concept (starter)", "sandbox_compiled": r.get("compiled"),
                "sandbox_passed": r.get("passed_count"), "sandbox_total": r.get("total"),
                "sandbox_ok": "yes" if r.get("all_passed") else "no"}
    r = st.run_tests(q["id"], code)
    if not r.get("success"):
        return {"sandbox_mode": "template", "sandbox_ok": f"error: {r.get('error')}"}
    out = {"sandbox_mode": "template", "sandbox_compiled": r["compiled"], "sandbox_passed": r["passed_count"],
           "sandbox_total": r["total"]}
    if is_correct:
        out["sandbox_ok"] = "yes" if r["all_passed"] else "no"
    elif not r["all_passed"]:
        out["sandbox_ok"] = "yes"
    elif opt in (spec.get("equivalent_options") or []):
        out["sandbox_ok"] = "exempt (behaviourally equivalent)"
    else:
        out["sandbox_ok"] = "no"
    return out


def audit_row(q, opt, cache_items, reviewed, args, judge_cache, state, starter_runs):
    code = build_code(q, opt) or ""
    is_correct = opt == q["correct_option"]
    rev = reviewed.get((q["id"], opt), {})
    entry = cache_items.get(cache_key(q["id"], opt)) or {}
    resp = entry.get("response") or {}
    expl = resp.get("explanation") or {}
    row = {"question_id": q["id"], "topic": q["topic"], "option": opt, "is_correct": is_correct,
           "has_code": bool(code), "reviewed_label": rev.get("reason_group", "n/a (text question)"),
           "cached_label": resp.get("c2_reason_group"), "cached_confidence": resp.get("prediction_confidence"),
           "llm_agrees_with_label": expl.get("llm_agrees_with_label"),
           "llm_suggested_reason_group": expl.get("llm_suggested_reason_group"),
           "final_label_source": resp.get("label_source"), "explanation_source_model": entry.get("model")}
    issues = []
    if not entry:
        issues.append("no cached explanation")

    if code:
        # What quizLab.js stores for a wrong answer: Model 3, no answer-key flag.
        m3 = ErrorService.analyze({"student_id": "consistency_audit", "code": code}, persist=False)
        row["model3_label"] = m3.get("reason_group")
        row["model3_confidence"] = m3.get("prediction_confidence")
        if rev:
            row["model3_matches_reviewed"] = row["model3_label"] == rev.get("reason_group")

    if is_correct:
        row["shown_label"] = "CORRECT_NO_ERROR (answer key)"
        if expl and expl.get("is_correct") is not True:
            issues.append("explanation does not say the answer is correct")
    elif not code:
        row["shown_label"] = "n/a (text question)"
    else:
        row["stale_cache_label"] = resp.get("c2_reason_group") != row["model3_label"]
        if row["stale_cache_label"]:
            issues.append(f"stale: explanation generated for {resp.get('c2_reason_group')}, Model 3 now says {row['model3_label']}")
        # The card shows the explanation's final label (the policy is re-applied on every cached request).
        shown, row["final_label_source"] = xs.choose_final_label(
            resp.get("c2_reason_group"), resp.get("prediction_confidence"), False, expl or None)
        row["shown_label"] = shown
        if expl and not args.no_judge:
            v = judge(shown, code, build_code(q, q["correct_option"]), expl, args, judge_cache, state)
            if v:
                row["explanation_matches_label"] = v["matches_label"]
                row["judge_described_group"] = v["described_group"]
                row["judge_reason"] = v["reason"]
                if not v["matches_label"]:
                    issues.append(f"explanation describes {v['described_group']}, card shows {shown}")
            else:
                row["explanation_matches_label"] = "judge failed"

    row.update(sandbox_check(q, opt, code, is_correct, rev, starter_runs))
    if row.get("sandbox_ok") == "no":
        issues.append("correct option fails a test" if is_correct else "wrong option passes every test")
    elif str(row.get("sandbox_ok", "")).startswith("error"):
        issues.append(f"sandbox {row['sandbox_ok']}")

    row["issues"] = "; ".join(issues)
    row["consistent"] = not issues
    return row


def write_markdown(rows, args):
    code_wrong = [r for r in rows if r["has_code"] and not r["is_correct"]]
    judged = [r for r in code_wrong if isinstance(r.get("explanation_matches_label"), bool)]
    bad = [r for r in rows if not r["consistent"]]
    rev_rows = [r for r in rows if isinstance(r.get("model3_matches_reviewed"), bool)]
    low_disagree = [r for r in code_wrong if r.get("final_label_source") == "llm_verified"]
    sandbox_rows = [r for r in rows if r.get("sandbox_mode") == "template"]
    counts = Counter()
    for r in bad:
        for issue in r["issues"].split("; "):
            counts[issue.split(":")[0].split(",")[0]] += 1

    lines = [
        "# C2 consistency audit",
        "",
        f"Generated by `ml/component2_error_detection/eval/consistency_audit.py` "
        f"(judge: {'off' if args.no_judge else args.judge_model}).",
        "",
        "| Check | Result |",
        "|---|---|",
        f"| Rows audited | {len(rows)} ({sum(r['has_code'] for r in rows)} code rows, "
        f"{sum(not r['has_code'] for r in rows)} Operators text rows) |",
        f"| Model 3 = reviewed label (code rows) | {sum(r['model3_matches_reviewed'] for r in rev_rows)} / {len(rev_rows)} |",
        f"| Cached explanation built for today's Model 3 label (wrong code rows) | "
        f"{sum(not r.get('stale_cache_label') for r in code_wrong)} / {len(code_wrong)} |",
        f"| Explanation describes the card's label (judged wrong code rows) | "
        f"{sum(r['explanation_matches_label'] for r in judged)} / {len(judged)} |",
        f"| LLM-verified label shown instead of Model 3 (conf < 0.5 and LLM disagrees, or 'no error' on a wrong answer) "
        f"| {len(low_disagree)} |",
        f"| Sandbox: correct option passes all tests | "
        f"{sum(r['sandbox_ok'] == 'yes' for r in sandbox_rows if r['is_correct'])} / {sum(r['is_correct'] for r in sandbox_rows)} |",
        f"| Sandbox: wrong option fails ≥ 1 test | "
        f"{sum(r['sandbox_ok'] == 'yes' for r in sandbox_rows if not r['is_correct'])} / "
        f"{sum(not r['is_correct'] for r in sandbox_rows)} "
        f"(+ {sum(str(r['sandbox_ok']).startswith('exempt') for r in sandbox_rows)} exempt as equivalent) |",
        f"| Operators starter programs pass all tests | "
        f"{len({r['question_id'] for r in rows if r.get('sandbox_mode', '').startswith('concept') and r['sandbox_ok'] == 'yes'})} / "
        f"{len({r['question_id'] for r in rows if r.get('sandbox_mode', '').startswith('concept')})} |",
        f"| **Inconsistent rows** | **{len(bad)}** |",
        "",
    ]
    if counts:
        lines += ["Issue types: " + ", ".join(f"{k} ({v})" for k, v in counts.most_common()), ""]
    if bad:
        lines += ["## Inconsistent rows", "", "| Q | Topic | Option | Correct? | Model 3 (conf) | Card shows | Issues |",
                  "|---|---|---|---|---|---|---|"]
        for r in bad:
            conf = r.get("model3_confidence")
            m3 = f"{r.get('model3_label')} ({conf:.2f})" if isinstance(conf, (int, float)) else str(r.get("model3_label") or "—")
            lines.append(f"| {r['question_id']} | {r['topic']} | `{r['option']}` | {'yes' if r['is_correct'] else 'no'} | "
                         f"{m3} | {r.get('shown_label') or '—'} | {r['issues']} |")
        lines.append("")
    mism = [r for r in rev_rows if not r["model3_matches_reviewed"]]
    if mism:
        lines += ["## Model 3 vs reviewed label (information — model accuracy, not a UI inconsistency)", "",
                  "| Q | Option | Reviewed | Model 3 (conf) |", "|---|---|---|---|"]
        for r in mism:
            lines.append(f"| {r['question_id']} | `{r['option']}` | {r['reviewed_label']} | "
                         f"{r['model3_label']} ({r['model3_confidence']:.2f}) |")
        lines.append("")
    with open(REPORT_MD, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--judge-model", default="gemini-3.5-flash-lite")
    ap.add_argument("--no-judge", action="store_true", help="skip the LLM explanation check")
    ap.add_argument("--min-interval", type=float, default=4.0, help="seconds between judge requests")
    ap.add_argument("--max-retries", type=int, default=6)
    args = ap.parse_args()
    if not args.no_judge and not xs.llm_status(args.judge_model)[2]:
        raise SystemExit("No LLM API key configured; use --no-judge to skip the explanation check.")

    os.makedirs(RESULTS_DIR, exist_ok=True)
    questions = [q for _, q in sorted(ExplanationService._retriever().questions.items())]
    cache_items = ExplanationService.load_cache().get("items", {})
    reviewed = load_reviewed()
    judge_cache = load_json(JUDGE_CACHE, {})
    state, starter_runs = {"last": 0.0}, {}

    rows = []
    for q in questions:
        for opt in q["options"]:
            row = audit_row(q, opt, cache_items, reviewed, args, judge_cache, state, starter_runs)
            rows.append(row)
            print(f"[{'OK ' if row['consistent'] else 'BAD'}] {cache_key(q['id'], opt):<28} {row['issues']}")

    with open(REPORT_CSV, "w", encoding="utf-8", newline="") as f:
        w = csv.DictWriter(f, fieldnames=COLUMNS, extrasaction="ignore")
        w.writeheader()
        w.writerows(rows)
    write_markdown(rows, args)
    print(f"\n{sum(not r['consistent'] for r in rows)} / {len(rows)} rows inconsistent -> {REPORT_CSV}, {REPORT_MD}")


if __name__ == "__main__":
    main()
