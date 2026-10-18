"""
Component 2: Sandbox test cases
===============================
Runs the precomputed, execution-validated test cases in backend/data/c2_sandbox_tests.json
(built by scripts/build_sandbox_tests.py) against the student's code.

Each question has a harness: a Java snippet with one {STUDENT_CODE} slot (statements
and/or static methods; code_runner_service wraps it into Main). The student's code is
put in the slot, compiled once, and every test runs it with its own stdin; a test passes
when the program exits normally and its stdout equals expected_stdout (line endings and
trailing spaces ignored).

Modes
  template  fill-in-the-blank questions: the student's code is the template filled with
            their option. Validation: the correct option passes every test; each wrong
            option fails at least one test or does not compile (options the reviewed eval
            set marks as behaviourally equivalent, e.g. Q24 "n", are exempt).
  concept   text-only Operators questions: the sandbox starts from an LLM-written
            starter program. Validation: the starter passes every test; each LLM-written
            wrong variant fails at least one.
"""

import json
import os
import shutil
import tempfile
import threading
import time
from concurrent.futures import ThreadPoolExecutor

from services import code_runner_service as cr

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
TESTS_PATH = os.path.join(BACKEND_DIR, "data", "c2_sandbox_tests.json")
SLOT = "{STUDENT_CODE}"

_cache = {"mtime": None, "data": None}
_lock = threading.Lock()


def load_tests(path=None):
    path = path or TESTS_PATH
    try:
        mtime = os.path.getmtime(path)
    except OSError:
        return {"questions": {}}
    with _lock:
        if _cache["data"] is None or _cache["mtime"] != (path, mtime):
            with open(path, encoding="utf-8") as f:
                _cache["data"] = json.load(f)
            _cache["mtime"] = (path, mtime)
        return _cache["data"]


def get_spec(question_id, path=None):
    try:
        return load_tests(path).get("questions", {}).get(str(int(question_id)))
    except (TypeError, ValueError):
        return None


def public_spec(spec):
    """What the sandbox UI needs before running (no harness)."""
    return {
        "question_id": spec["question_id"],
        "mode": spec["mode"],
        "starter_code": spec.get("starter_code"),
        "tests": [{k: t.get(k) for k in ("name", "stdin", "expected_stdout", "description_en", "description_si",
                                         "description_singlish")} for t in spec["tests"]],
    }


def normalise_output(text):
    lines = (text or "").replace("\r\n", "\n").replace("\r", "\n").split("\n")
    return "\n".join(ln.rstrip() for ln in lines).strip("\n")


def fill_harness(harness, code):
    """Returns (filled_snippet, first_student_line, n_student_lines)."""
    idx = harness.index(SLOT)
    start = harness.count("\n", 0, idx) + 1
    return harness[:idx] + code + harness[idx + len(SLOT):], start, code.count("\n") + 1


def _to_student_line(line, start, n):
    if line is None or not (start <= line < start + n):
        return None
    return line - start + 1


def _remap_errors(errors, start, n, code):
    student_lines = code.split("\n")
    out = []
    for e in errors:
        e = dict(e)
        e["line"] = _to_student_line(e.get("line"), start, n)
        e["in_student_code"] = e["line"] is not None
        e["code_line"] = student_lines[e["line"] - 1] if e["line"] else None
        if e["line"] is None:
            e["column"] = None
            e["message"] += " (in the test code around your answer)"
        out.append(e)
    return out


def run_tests(question_id, code, spec=None, run_timeout=None):
    """POST /api/errors/run-tests: per-test {name, passed, expected, actual, error}."""
    spec = spec or get_spec(question_id)
    if not spec:
        return {"success": False, "error": "No sandbox tests are available for this question."}
    problem = cr._check_inputs(code, "")
    if problem:
        return {"success": False, "error": problem}
    t0 = time.monotonic()
    filled, start, n = fill_harness(spec["harness"], code)
    workdir = tempfile.mkdtemp(prefix="c2_tests_")
    try:
        wrapped, comp = cr.compile_code(filled, workdir)
        errors = _remap_errors(comp["compile_errors"], start, n, code)
        tests = spec["tests"]
        results = []
        if comp["compiled"] and tests:
            with ThreadPoolExecutor(max_workers=min(len(tests), 5)) as ex:
                runs = list(ex.map(lambda t: cr.execute(wrapped, workdir, t.get("stdin", ""), run_timeout), tests))
            for t, r in zip(tests, runs):
                err = r["runtime_error"]
                if err and err.get("line") is not None:
                    err = dict(err, line=_to_student_line(err["line"], start, n))
                passed = err is None and normalise_output(r["stdout"]) == normalise_output(t["expected_stdout"])
                results.append(_test_result(t, passed, r["stdout"], err, r["time_ms"]))
        else:
            for t in tests:
                results.append(_test_result(t, False, None, {"type": "CompileError", "category": "compile_error",
                                                              "message": "Your code did not compile.", "line": None,
                                                              "hint": "Fix the compile errors first."}, None))
        passed = sum(r["passed"] for r in results)
        return {
            "success": True,
            "question_id": spec["question_id"],
            "mode": spec["mode"],
            "compiled": comp["compiled"],
            "compile_errors": errors,
            "all_passed": comp["compiled"] and passed == len(results),
            "passed_count": passed,
            "total": len(results),
            "tests": results,
            "time_ms": int((time.monotonic() - t0) * 1000),
        }
    except cr.JdkNotFound as e:
        return {"success": False, "error": str(e)}
    finally:
        shutil.rmtree(workdir, ignore_errors=True)


def _test_result(t, passed, actual, error, time_ms):
    return {
        "name": t["name"],
        "passed": bool(passed),
        "stdin": t.get("stdin", ""),
        "expected": t["expected_stdout"],
        "actual": actual,
        "error": error,
        "description_en": t.get("description_en"),
        "description_si": t.get("description_si"),
        "description_singlish": t.get("description_singlish"),
        "time_ms": time_ms,
    }


def validate_spec(spec, correct_code, wrong_codes, exempt=(), run_timeout=None):
    """
    Execution check of a candidate spec.
    correct_code must pass every surviving test; tests the correct code fails are dropped.
    Returns {ok, tests (surviving), dropped, correct, wrong: {label: {...}}, uncaught: [labels]}.
    """
    report = {"dropped": [], "wrong": {}, "uncaught": []}
    res = run_tests(spec["question_id"], correct_code, spec=spec, run_timeout=run_timeout)
    report["correct"] = {"compiled": res.get("compiled"), "compile_errors": res.get("compile_errors", [])[:3]}
    if not res.get("success") or not res.get("compiled"):
        report.update(ok=False, tests=[], reason="the correct code does not compile with this harness")
        return report
    keep = [t for t, r in zip(spec["tests"], res["tests"]) if r["passed"]]
    report["dropped"] = [{"name": r["name"], "expected": r["expected"], "actual": r["actual"],
                          "error": (r["error"] or {}).get("message")} for r in res["tests"] if not r["passed"]]
    pruned = dict(spec, tests=keep)
    for label, code in wrong_codes.items():
        if not keep:
            break
        r = run_tests(spec["question_id"], code, spec=pruned, run_timeout=run_timeout)
        failed = [t["name"] for t in r.get("tests", []) if not t["passed"]]
        caught = (not r.get("compiled")) or bool(failed)
        report["wrong"][label] = {"compiled": r.get("compiled"), "failed_tests": failed, "caught": caught,
                                  "exempt": label in exempt}
        if not caught and label not in exempt:
            report["uncaught"].append(label)
    report["tests"] = keep
    report["ok"] = bool(keep) and not report["uncaught"]
    return report
