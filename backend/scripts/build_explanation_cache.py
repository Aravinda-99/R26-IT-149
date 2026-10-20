"""
Build backend/data/c2_explanations_cache.json
=============================================
Generates an LLM explanation (EN / Sinhala / Singlish) for EVERY (question, option)
pair of the pre-test in data.js, correct and wrong: the 20 fill-in-the-blank questions
and the 5 text-only Operators questions (25 x 4 = 100 pairs), using the same pipeline as
POST /api/errors/explain:
  C2 label (ErrorService.analyze, answer-key gate for the correct option, no history
  writes; none for text-only questions) + RAG chunks + LLM + JSON validation (one retry).

Compiler / runtime evidence comes from eval/pretest_eval_set.csv (verified_outcome,
compile_error, runtime_exception, actual_output; expected_output = the correct option's
output). Its reviewed labels are NOT used.

Rate limits: one request every --min-interval seconds (default 7 s, under the Gemini
free tier's ~10 requests/minute); 429 / 503 / timeouts / connection errors back off (server retryDelay if
given, else 15 s doubling, max 120 s) and retry up to --max-retries times. Progress is
saved after every item; a re-run skips items already in the cache (use --force to
regenerate). The API key is never printed.

Usage (from backend/):
  python scripts/build_explanation_cache.py [--model gemini-3.5-flash] [--limit N]
                                            [--question 4] [--key "18::<="] [--force] [--revalidate]
                                            [--min-interval 7]
"""

import argparse
import csv
import json
import os
import sys
import time

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

import services.error_service as es  # noqa: E402

es.db = None  # never write cache-building runs to Firestore

from services import explanation_service as xs  # noqa: E402
from services.explanation_service import ExplanationService, cache_key, build_code  # noqa: E402

EVAL_CSV = os.path.join(BACKEND_DIR, "ml", "component2_error_detection", "eval", "pretest_eval_set.csv")


def load_runner_evidence():
    """(question_id, option) -> runner dict, from the execution columns of the eval set."""
    if not os.path.exists(EVAL_CSV):
        return {}
    with open(EVAL_CSV, encoding="utf-8", newline="") as f:
        rows = list(csv.DictReader(f))
    expected = {int(r["question_id"]): r.get("actual_output", "") for r in rows if r["is_correct_option"] == "1"}
    out = {}
    for r in rows:
        qid = int(r["question_id"])
        out[(qid, r["option"])] = {
            "verified_outcome": r.get("verified_outcome", ""),
            "compile_error": r.get("compile_error", ""),
            "runtime_exception": r.get("runtime_exception", ""),
            "actual_output": r.get("actual_output", ""),
            "expected_output": expected.get(qid, ""),
        }
    return out


def load_cache():
    if os.path.exists(xs.CACHE_PATH):
        with open(xs.CACHE_PATH, encoding="utf-8") as f:
            cache = json.load(f)
        cache.setdefault("items", {})
        return cache
    return {"version": 1, "prompt_version": xs.PROMPT_VERSION, "items": {}}


def save_cache(cache):
    cache["updated_at"] = xs.now_iso()
    cache["n_items"] = len(cache["items"])
    tmp = xs.CACHE_PATH + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(cache, f, ensure_ascii=False, indent=1, sort_keys=False)
    os.replace(tmp, xs.CACHE_PATH)


def generate_with_backoff(ctx, args):
    """LLM explanation with retries on rate limits / overload / timeouts. Returns (expl, meta) or raises."""
    delay = 15.0
    for attempt in range(args.max_retries + 1):
        try:
            return ExplanationService.generate_llm(ctx, timeout=args.timeout, model=args.model)
        except (xs.LLMRateLimited, xs.LLMUnavailable, xs.LLMTimeout, xs.LLMConnectionError) as e:
            if attempt == args.max_retries:
                raise
            wait = getattr(e, "retry_after", None) or delay
            wait = min(max(wait, args.min_interval), 120.0)
            print(f"    {type(e).__name__}: {e} -> waiting {wait:.0f}s (retry {attempt + 1}/{args.max_retries})")
            time.sleep(wait)
            delay = min(delay * 2, 120.0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=None, help="LLM model (default: EXPLANATION_LLM_MODEL or LLM_MODEL)")
    ap.add_argument("--limit", type=int, default=None, help="generate at most N new items")
    ap.add_argument("--question", type=int, action="append", help="only these question ids (repeatable)")
    ap.add_argument("--key", action="append",
                    help='only these cache keys, e.g. --key "18::<=" (repeatable; combine with --force)')
    ap.add_argument("--force", action="store_true", help="regenerate items already in the cache")
    ap.add_argument("--revalidate", action="store_true",
                    help="re-check cached items with the current validator and regenerate those that fail")
    ap.add_argument("--min-interval", type=float, default=7.0, help="seconds between LLM requests")
    ap.add_argument("--timeout", type=float, default=90.0, help="per-request timeout in seconds")
    ap.add_argument("--max-retries", type=int, default=6)
    args = ap.parse_args()

    provider, model, configured = xs.llm_status(args.model)
    if not configured:
        raise SystemExit(f"No API key configured for LLM_PROVIDER={provider} (set it in backend/.env).")
    print(f"LLM provider={provider} model={model} (key configured)")

    retriever = ExplanationService._retriever()
    questions = [q for qid, q in sorted(retriever.questions.items())]
    if args.question:
        questions = [q for q in questions if q["id"] in set(args.question)]
    runner = load_runner_evidence()
    cache = load_cache()
    cache["prompt_version"] = xs.PROMPT_VERSION
    cache["generated_with"] = {"provider": provider, "model": model, "temperature": xs.TEMPERATURE}

    todo = [(q, opt) for q in questions for opt in q["options"]]
    if args.key:
        unknown = set(args.key) - {cache_key(q["id"], o) for q, o in todo}
        if unknown:
            raise SystemExit(f"Unknown cache key(s): {sorted(unknown)}")
        todo = [(q, opt) for q, opt in todo if cache_key(q["id"], opt) in set(args.key)]
    if args.revalidate:
        for q, opt in todo:
            entry = cache["items"].get(cache_key(q["id"], opt))
            if not entry:
                continue
            try:
                xs.validate_explanation(entry["response"]["explanation"], entry.get("code"))
            except xs.ExplanationValidationError as e:
                print(f"[REVALIDATE] {cache_key(q['id'], opt)} fails now ({e}); will regenerate")
                del cache["items"][cache_key(q["id"], opt)]
        save_cache(cache)
    print(f"{len(todo)} (question, option) pairs, {sum(cache_key(q['id'], o) in cache['items'] for q, o in todo)} already cached")

    done = failed = 0
    consecutive_failures = 0
    last_request = 0.0
    for q, opt in todo:
        key = cache_key(q["id"], opt)
        if key in cache["items"] and not args.force:
            continue
        if args.limit is not None and done >= args.limit:
            break
        code = build_code(q, opt)
        is_correct = opt == q["correct_option"]
        ctx = ExplanationService.build_context(q["id"], opt, code, is_correct, None, runner.get((q["id"], opt)))

        wait = args.min_interval - (time.monotonic() - last_request)
        if wait > 0:
            time.sleep(wait)
        last_request = time.monotonic()
        t0 = time.monotonic()
        try:
            expl, meta = generate_with_backoff(ctx, args)
        except (xs.LLMError, xs.ExplanationValidationError) as e:
            failed += 1
            consecutive_failures += 1
            print(f"[FAIL] {key}: {type(e).__name__}: {e}")
            if consecutive_failures >= 3:
                print("Three failures in a row (quota exhausted?). Progress is saved; re-run later to resume.")
                break
            continue
        consecutive_failures = 0
        resp = ExplanationService._response(ctx, expl, "llm", meta)
        resp["student_id"] = None
        cache["items"][key] = {
            "question_id": q["id"],
            "option": opt,
            "is_correct": is_correct,
            "code": code,
            "model": meta["model"],
            "prompt_version": xs.PROMPT_VERSION,
            "generated_at": xs.now_iso(),
            "response": resp,
        }
        save_cache(cache)
        done += 1
        mark = "OK " if is_correct else "ERR"
        print(f"[{mark}] {key:<22} c2={resp['c2_reason_group']} conf={resp['prediction_confidence']} "
              f"llm={resp['llm_suggested_reason_group']} final={resp['final_reason_group']} ({resp['label_source']}) "
              f"{time.monotonic() - t0:.1f}s attempts={meta['attempts']}{' warn=' + str(meta['warnings']) if meta['warnings'] else ''}")

    total = sum(cache_key(q["id"], o) in cache["items"] for q, o in todo)
    print(f"\nGenerated {done}, failed {failed}. Cache now covers {total}/{len(todo)} pairs -> {xs.CACHE_PATH}")


if __name__ == "__main__":
    main()
