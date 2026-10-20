"""
Build backend/data/c2_sandbox_tests.json
=========================================
For each of the 25 pre-test questions, asks the LLM (explanation_service LLM settings,
default model gemini-3.5-flash-lite) for a runnable harness with a {STUDENT_CODE} slot
and 4-5 test cases {name, stdin, expected_stdout, description_en, description_si,
description_singlish}, then VALIDATES them by compiling and running real Java
(services/code_runner_service.py):

  template questions (20 fill-in-the-blank): the correct option must pass every test;
      tests it fails are dropped. Every wrong option must then fail at least one test or
      not compile. Wrong options the reviewed eval set labels CORRECT_NO_ERROR (behaviour
      identical to the key, e.g. Q24 "n") are exempt and recorded as equivalent_options.
  concept questions (5 text-only Operators MCQs): the LLM also writes a starter program
      and 2-3 wrong variants; the starter must pass every test, each variant must fail one.

A candidate that leaves an option uncaught, or has fewer than 4 surviving tests, is
regenerated with feedback (up to --attempts times, default 5). Malformed tests and tests that
repeat an earlier test's stdin are dropped individually, and the surviving tests must expect
at least 2 different outputs (so they check different things). Ablation: a test that still
passes when the student's code is replaced by a comment does not check it and is dropped. If no attempt reaches 4 tests, the
best valid attempt with >= 3 tests is saved with status "partial".

Requests are throttled (--min-interval, default 7 s); 429 / 503 / timeouts / connection
errors back off and retry. Progress is saved after every question; a re-run skips
questions with status "ok" (use --force to regenerate); "partial" and "failed" ones are retried. The API key is never printed.

Usage (from backend/):
  python scripts/build_sandbox_tests.py [--model gemini-3.5-flash-lite] [--question 13] [--force] [--revalidate]
"""

import argparse
import csv
import json
import os
import re
import sys
import time

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from services import explanation_service as xs  # noqa: E402
from services import sandbox_tests_service as st  # noqa: E402
from services import code_runner_service as cr  # noqa: E402
from services.code_runner_service import find_jdk  # noqa: E402

EVAL_CSV = os.path.join(BACKEND_DIR, "ml", "component2_error_detection", "eval", "pretest_eval_set.csv")
DEFAULT_MODEL = "gemini-3.5-flash-lite"
MIN_TESTS, MAX_TESTS = 4, 5
MIN_DISTINCT_OUTPUTS = 2  # tests must check different things, not repeat one check (true/false questions have 2)
ABLATION_CODE = "// student code removed"

WRAPPER_RULES = """HOW THE CODE IS RUN (follow exactly):
- Write Java SNIPPET code only: no `class` declaration and no `main` method. They are added automatically, and `import java.util.*;` is already there (Scanner is available).
- Top-level methods (e.g. `static int f(int n) { ... }`) become static methods of class Main. All other top-level statements run inside main(), in the order written.
- The harness must contain the exact text {STUDENT_CODE} exactly once, on its own line. The student's code replaces it.
- The student's statements and your statements share the same scope in main(): do not re-declare their variables; give your own variables distinctive names (e.g. tIn, tMode).
- Each test runs the program once with its own stdin, and every test must use a DIFFERENT stdin. Use stdin to choose what to check or to supply values, e.g. `Scanner tIn = new Scanner(System.in); int tMode = tIn.nextInt();` then print a different value for each mode.
- When the student's code uses fixed values (no input), put {STUDENT_CODE} FIRST, then read the mode and print a different fact about the student's variables or methods per mode, e.g. for `int i = 0; while (i < 3) { ...; i++; }`: mode 1 prints nothing extra, mode 2 prints i, mode 3 prints i * 10. Removing the student's code must make every test fail or not compile.
- expected_stdout must be the EXACT output of the correct program for that stdin, including anything the student code itself prints. Use println so each value is on its own line."""


def test_schema(concept):
    text = {"type": "STRING"}
    test = {"type": "OBJECT", "properties": {k: dict(text) for k in (
        "name", "stdin", "expected_stdout", "description_en", "description_si", "description_singlish")},
        "required": ["name", "stdin", "expected_stdout", "description_en", "description_si", "description_singlish"]}
    props = {"harness": dict(text), "tests": {"type": "ARRAY", "items": test}}
    required = ["harness", "tests"]
    if concept:
        props["starter_code"] = dict(text)
        props["wrong_variants"] = {"type": "ARRAY", "items": dict(text)}
        required += ["starter_code", "wrong_variants"]
    return {"type": "OBJECT", "properties": props, "required": required}


def build_prompt(q, concept, feedback=None):
    lang_rule = ("description_en: one short sentence on what the test checks. description_si: the same in simple Sinhala "
                 "(Sinhala script, Java keywords and code in English). description_singlish: the same in Sinhala written "
                 "with English letters (no Sinhala script).")
    if concept:
        body = f"""QUESTION (text-only multiple choice, topic {q['topic']}): {q['question']}
OPTIONS: {' | '.join(q['options'])}
CORRECT ANSWER: {q['correct_option']}
AUTHOR'S EXPLANATION: {q.get('explanation', '')}

There is no student code for this question. Write:
- starter_code: a short beginner Java snippet (3-8 lines) that demonstrates the concept of this question and reads its input values from stdin with Scanner, so students can experiment with it.
- harness: exactly {{STUDENT_CODE}} and nothing else (the starter program reads stdin and prints the results itself).
- tests: {MIN_TESTS}-{MAX_TESTS} tests for the starter code (different stdin values, including an edge case).
- wrong_variants: 2-3 versions of starter_code with one typical beginner misconception each (e.g. / instead of %, || instead of &&). Each must compile and must FAIL at least one test."""
    else:
        wrongs = [o for o in q["options"] if o != q["correct_option"]]
        listing = "\n".join(f"  {'CORRECT' if o == q['correct_option'] else 'wrong  '} option {o!r}: {xs.build_code(q, o)}"
                            for o in q["options"])
        body = f"""QUESTION (fill in the blank, topic {q['topic']}): {q['question']}
TEMPLATE: {q['codeTemplate']}
STUDENT CODE FOR EACH OPTION:
{listing}
AUTHOR'S EXPLANATION: {q.get('explanation', '')}

Write a harness and {MIN_TESTS}-{MAX_TESTS} tests. The CORRECT option's code must pass every test. Every wrong option
({', '.join(repr(w) for w in wrongs)}) must fail at least one test or fail to compile. Test the behaviour the question
asks for (values of variables, printed output, return values for several inputs, loop counts, ...).
EVERY test must depend on the student's code: we also run each test with the student's code removed, and a test
that still passes is discarded. Never add harness code that prints things unrelated to the student's code."""
    fb = f"\n\nYOUR PREVIOUS ATTEMPT FAILED VALIDATION (we compiled and ran it):\n{feedback}\nFix this." if feedback else ""
    return f"""You write automated tests for a beginner Java exercise in a learning platform.

{body}

{WRAPPER_RULES}
- {lang_rule}
- name: 2-5 words.

Return ONLY one JSON object.{fb}"""


SLOT_VARIANTS = re.compile(r"\{+\s*STUDENT_CODE\s*\}+|/\*\s*STUDENT_CODE\s*\*/|//\s*STUDENT_CODE[^\n]*")


def structural_errors(cand, concept):
    """Candidate-level problems (reject the attempt). Normalises slot spellings like {{STUDENT_CODE}}."""
    errs = []
    if isinstance(cand.get("harness"), str):
        cand["harness"] = SLOT_VARIANTS.sub(st.SLOT, cand["harness"])
    h = cand.get("harness")
    if not isinstance(h, str) or h.count(st.SLOT) != 1:
        errs.append("harness must contain {STUDENT_CODE} exactly once")
    if concept and not (isinstance(cand.get("starter_code"), str) and cand["starter_code"].strip()):
        errs.append("starter_code is missing")
    if concept and st.SLOT in (cand.get("starter_code") or ""):
        errs.append("starter_code must not contain {STUDENT_CODE}")
    if concept:
        cand["harness"] = st.SLOT  # the starter program itself must read stdin and print; tests that need more fail
    if not isinstance(cand.get("tests"), list) or not cand["tests"]:
        errs.append("tests must be a non-empty list")
    return errs


def clean_tests(tests):
    """Drops malformed tests and tests repeating an earlier stdin. Returns (kept, problems)."""
    kept, problems, seen_names, seen_stdin = [], [], set(), set()
    for i, t in enumerate(tests):
        why = None
        if not isinstance(t, dict):
            why = "not an object"
        else:
            for k in ("name", "stdin", "expected_stdout", "description_en", "description_si", "description_singlish"):
                if not isinstance(t.get(k), str):
                    why = f"{k} must be a string"
                    break
        if not why:
            if t["name"] in seen_names:
                why = "duplicate name"
            elif st.normalise_output(t["stdin"]) in seen_stdin:
                why = ("same stdin as an earlier test, so it checks the same thing (every test needs a different "
                       "stdin; make the harness use it, e.g. a mode number that selects what to print)")
        if not why:
            t = dict(t)
            si, sg = t["description_si"], t["description_singlish"]
            if not xs.SINHALA_RE.search(si) or xs._foreign_letters(si):
                t["description_si"] = None
                problems.append(f"test {i + 1}: description_si was not clean Sinhala; cleared (UI shows English)")
            if xs.SINHALA_RE.search(sg) or xs._foreign_letters(sg):
                t["description_singlish"] = None
                problems.append(f"test {i + 1}: description_singlish was not in English letters; cleared")
        if why:
            problems.append(f"test {i + 1} ({(t or {}).get('name') if isinstance(t, dict) else '?'}) dropped: {why}")
            continue
        seen_names.add(t["name"])
        seen_stdin.add(st.normalise_output(t["stdin"]))
        kept.append(t)
    return kept, problems


def load_equivalent_options():
    """question_id -> wrong options whose reviewed label is CORRECT_NO_ERROR (behaviourally equivalent)."""
    out = {}
    if os.path.exists(EVAL_CSV):
        with open(EVAL_CSV, encoding="utf-8", newline="") as f:
            for r in csv.DictReader(f):
                if r["is_correct_option"] == "0" and r["reason_group"] == "CORRECT_NO_ERROR":
                    out.setdefault(int(r["question_id"]), []).append(r["option"])
    return out


def call_with_backoff(prompt, args, concept):
    delay = 15.0
    for attempt in range(args.max_retries + 1):
        try:
            raw, model = xs.call_llm(prompt, args.timeout, model=args.model, response_schema=test_schema(concept))
            return xs._parse_json(raw), model
        except (xs.LLMRateLimited, xs.LLMUnavailable, xs.LLMTimeout, xs.LLMConnectionError) as e:
            if attempt == args.max_retries:
                raise
            wait = min(max(getattr(e, "retry_after", None) or delay, args.min_interval), 120.0)
            print(f"    {type(e).__name__}: {e} -> waiting {wait:.0f}s")
            time.sleep(wait)
            delay = min(delay * 2, 120.0)


def feedback_text(report, struct):
    lines = list(struct)
    if report:
        if report.get("reason"):
            lines.append(report["reason"] + ": " + "; ".join(e["message"] for e in report["correct"].get("compile_errors", [])))
        for d in report.get("dropped", []):
            lines.append(f"test {d['name']!r}: the correct code printed {d['actual']!r} (error: {d['error']}), "
                         f"not the expected {d['expected']!r} -> test dropped")
        for label in report.get("uncaught", []):
            lines.append(f"wrong option/variant {label!r} passes every test: add a test it fails")
        if report.get("ok") is not None and len(report.get("tests", [])) < MIN_TESTS:
            lines.append(f"only {len(report.get('tests', []))} valid tests; write {MIN_TESTS}-{MAX_TESTS}")
    return "\n".join(f"- {ln}" for ln in lines[:15])


def ablation_code(code):
    """
    The student's code with its behaviour removed: statements are dropped and every method keeps its
    signature but only throws. The harness still compiles when it calls the student's methods, so a test
    that passes on this does not depend on the student's code.
    """
    parts = []
    for kind, s0, e0 in cr.split_snippet(code):
        if kind == "method":
            brace = cr._is_method_start(code, s0)
            parts.append(code[s0:brace] + '{ throw new RuntimeException("student code removed"); }')
        elif kind in ("import", "type"):
            parts.append(code[s0:e0])
    return "\n".join(parts) or ABLATION_CODE


def option_codes(q, stored=None):
    """(correct_code, wrong_codes, exempt) for a question; concept mode uses the stored starter / variants."""
    if not q.get("codeTemplate"):
        stored = stored or {}
        wrong = {f"variant {i + 1}": v for i, v in enumerate(stored.get("wrong_variants") or []) if isinstance(v, str)}
        return stored.get("starter_code"), wrong, ()
    wrong = {o: xs.build_code(q, o) for o in q["options"] if o != q["correct_option"]}
    return xs.build_code(q, q["correct_option"]), wrong, None


def evaluate(q, spec, correct_code, wrong, exempt, concept):
    """
    All execution checks for one candidate spec:
      1. the correct code must pass (tests it fails are dropped);
      2. ablation: tests that still pass with the student's code removed are dropped;
      3. every wrong option / variant must fail a remaining test or not compile (exempt ones excepted);
      4. status "ok" needs >= MIN_TESTS tests and >= MIN_DISTINCT_OUTPUTS different expected outputs;
         otherwise "partial" keeps one test per distinct expected output; None = unusable.
    """
    problems = []
    report = st.validate_spec(spec, correct_code, wrong, exempt=exempt)
    ablated_n = 0
    if report["tests"]:
        ablated = st.run_tests(q["id"], ablation_code(correct_code), spec=dict(spec, tests=report["tests"]))
        if ablated.get("compiled"):
            independent = {r["name"] for r in ablated["tests"] if r["passed"]}
            ablated_n = len(independent)
            for name in sorted(independent):
                problems.append(f"test {name!r} dropped: it passes even when the student's code is removed, "
                                f"so it does not check the student's code")
            report["tests"] = [t for t in report["tests"] if t["name"] not in independent]
    remaining = {t["name"] for t in report["tests"]}
    for w in report["wrong"].values():
        w["failed_tests"] = [n for n in w["failed_tests"] if n in remaining]
        w["caught"] = (not w["compiled"]) or bool(w["failed_tests"])
    report["uncaught"] = [lb for lb, w in report["wrong"].items() if not w["caught"] and not w["exempt"]]
    if concept and not wrong:
        report["uncaught"] = ["(no wrong variants given)"]
    valid = bool(report["tests"]) and not report["uncaught"] and report.get("reason") is None
    unique, seen = [], set()
    for t in report["tests"]:
        key = st.normalise_output(t["expected_stdout"])
        if key not in seen:
            seen.add(key)
            unique.append(t)
    distinct = len(unique)
    if valid and distinct < MIN_DISTINCT_OUTPUTS:
        problems.append(f"the tests expect only {distinct} different output(s): they check the same thing. The harness "
                        f"must READ stdin (Scanner) and print different values for different tests; at least "
                        f"{MIN_DISTINCT_OUTPUTS} tests need different expected_stdout")
    status, tests = None, []
    if valid and len(report["tests"]) >= MIN_TESTS and distinct >= MIN_DISTINCT_OUTPUTS:
        status, tests = "ok", report["tests"][:MAX_TESTS]
    elif valid:
        status, tests = "partial", unique[:MAX_TESTS]
    report["ok"] = status == "ok"
    return {"status": status, "tests": tests, "report": report, "problems": problems, "distinct": distinct,
            "ablated": ablated_n,
            "validation": {"correct_passes_all": True, "wrong": report["wrong"], "dropped_tests": report["dropped"],
                           "ablation_dropped": ablated_n}}


def revalidate(q, stored, equivalent):
    """Re-runs every execution check on a stored spec (no LLM). Returns the updated spec, or None if unusable."""
    concept = not q.get("codeTemplate")
    correct_code, wrong, exempt = option_codes(q, stored)
    if exempt is None:
        exempt = tuple(equivalent.get(q["id"], []))
    if not correct_code or not stored.get("tests"):
        return None
    result = evaluate(q, dict(stored), correct_code, wrong, exempt, concept)
    if not result["status"]:
        return None
    return dict(stored, tests=result["tests"], status=result["status"], validation=result["validation"],
                revalidated_at=xs.now_iso())


def build_question(q, args, equivalent, last_request):
    concept = not q.get("codeTemplate")
    feedback, best = None, None
    for attempt in range(1, args.attempts + 1):
        wait = args.min_interval - (time.monotonic() - last_request[0])
        if wait > 0:
            time.sleep(wait)
        last_request[0] = time.monotonic()
        try:
            cand, model = call_with_backoff(build_prompt(q, concept, feedback), args, concept)
        except (xs.LLMError, ValueError) as e:
            print(f"    attempt {attempt}: LLM failed ({type(e).__name__}: {e})")
            feedback = None
            if isinstance(e, xs.LLMError):
                raise
            continue
        struct = structural_errors(cand, concept) if isinstance(cand, dict) else ["response is not an object"]
        if struct:
            print(f"    attempt {attempt}: structure: {struct[:3]}")
            feedback = feedback_text(None, struct)
            continue
        tests, test_problems = clean_tests(cand["tests"])
        if not tests:
            print(f"    attempt {attempt}: every test was malformed: {test_problems[:2]}")
            feedback = feedback_text(None, test_problems)
            continue
        spec = {"question_id": q["id"], "mode": "concept" if concept else "template", "harness": cand["harness"],
                "tests": tests[:MAX_TESTS + 1]}
        if concept:
            spec["starter_code"] = cand["starter_code"]
            correct_code = cand["starter_code"]
            wrong = {f"variant {i + 1}": v for i, v in enumerate(cand.get("wrong_variants") or []) if isinstance(v, str)}
            exempt = ()
        else:
            correct_code = xs.build_code(q, q["correct_option"])
            wrong = {o: xs.build_code(q, o) for o in q["options"] if o != q["correct_option"]}
            exempt = tuple(equivalent.get(q["id"], []))
        result = evaluate(q, spec, correct_code, wrong, exempt, concept)
        report, test_problems = result["report"], test_problems + result["problems"]
        print(f"    attempt {attempt}: {len(report['tests'])} valid tests, {result['distinct']} distinct outputs, "
              f"dropped {len(report['dropped'])} by execution, {result['ablated']} by ablation, "
              f"{sum('dropped' in t for t in test_problems) - result['ablated']} by format, uncaught {report['uncaught']}")
        if result["status"]:
            spec.update(model=model, attempts=attempt, generated_at=xs.now_iso(), equivalent_options=list(exempt),
                        validation=result["validation"], tests=result["tests"], status=result["status"])
            if concept:
                spec["wrong_variants"] = list(wrong.values())
            if result["status"] == "ok":
                return spec
            if best is None or len(spec["tests"]) > len(best["tests"]):
                best = spec
        feedback = feedback_text(report, test_problems)
    return best


def save(data):
    data["updated_at"] = xs.now_iso()
    tmp = st.TESTS_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=1)
    os.replace(tmp, st.TESTS_PATH)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--question", type=int, action="append", help="only these question ids (repeatable)")
    ap.add_argument("--force", action="store_true", help="regenerate questions already marked ok")
    ap.add_argument("--revalidate", action="store_true",
                    help="re-run all execution checks on stored specs first (no LLM); unusable ones are regenerated")
    ap.add_argument("--attempts", type=int, default=5, help="LLM attempts per question")
    ap.add_argument("--min-interval", type=float, default=7.0)
    ap.add_argument("--timeout", type=float, default=90.0)
    ap.add_argument("--max-retries", type=int, default=6)
    args = ap.parse_args()

    provider, model, configured = xs.llm_status(args.model)
    if not configured:
        raise SystemExit(f"No API key configured for LLM_PROVIDER={provider} (set it in backend/.env).")
    print(f"LLM provider={provider} model={model} (key configured); JDK: {find_jdk()['version']}")

    questions = [q for _, q in sorted(xs.ExplanationService._retriever().questions.items())]
    if args.question:
        questions = [q for q in questions if q["id"] in set(args.question)]
    equivalent = load_equivalent_options()
    data = st.load_tests() if os.path.exists(st.TESTS_PATH) else {}
    data = {"version": 1, "questions": dict(data.get("questions", {}))}
    data["generated_with"] = {"provider": provider, "model": model}

    if args.revalidate:
        for q in questions:
            key = str(q["id"])
            stored = data["questions"].get(key)
            if not stored or not stored.get("tests"):
                continue
            updated = revalidate(q, stored, equivalent)
            before = (stored.get("status"), len(stored.get("tests", [])))
            if updated is None:
                print(f"[REVALIDATE] Q{q['id']}: {before} -> unusable, will regenerate")
                data["questions"][key] = {"question_id": q["id"], "status": "failed", "tests": [],
                                          "mode": stored.get("mode")}
            else:
                print(f"[REVALIDATE] Q{q['id']}: {before} -> {(updated['status'], len(updated['tests']))}")
                data["questions"][key] = updated
        save(data)

    last_request = [0.0]
    for q in questions:
        key = str(q["id"])
        if data["questions"].get(key, {}).get("status") == "ok" and not args.force:
            continue
        print(f"[Q{q['id']}] {q['topic']}: {q['question'][:70]}")
        try:
            spec = build_question(q, args, equivalent, last_request)
        except xs.LLMError as e:
            print(f"[FAIL] Q{q['id']}: {type(e).__name__}: {e}. Progress saved; re-run to resume.")
            break
        if spec:
            data["questions"][key] = spec
            print(f"[{spec['status'].upper()}] Q{q['id']}: {len(spec['tests'])} tests, attempts={spec['attempts']}")
        else:
            # Never keep an older spec that did not pass this validation run.
            data["questions"][key] = {"question_id": q["id"], "status": "failed", "tests": [],
                                      "mode": "concept" if not q.get("codeTemplate") else "template"}
            print(f"[FAIL] Q{q['id']}: no valid test set after {args.attempts} attempts (saved as failed; re-run to retry)")
        save(data)

    counts = {}
    for v in data["questions"].values():
        counts[v.get("status")] = counts.get(v.get("status"), 0) + 1
    print(f"\nStatus over {len(data['questions'])} questions: {counts} -> {st.TESTS_PATH}")


if __name__ == "__main__":
    main()
