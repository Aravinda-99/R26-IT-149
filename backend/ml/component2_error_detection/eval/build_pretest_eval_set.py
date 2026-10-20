"""
Build eval/pretest_eval_set.csv from the real pre-test question bank
=====================================================================
For EVERY option of EVERY question with a `codeTemplate` in
frontend/src/learningPathGen/data.js, the option is substituted into the template
exactly like quizLab.js `buildFullCodeFromTemplate` (JS String.replace with a string
pattern → only the first "{BLANK}" is replaced).

Labels are PROPOSED (label_status="proposed") and must be reviewed by hand:
  - correct option   → CORRECT / CORRECT_NO_ERROR
  - wrong option     → best of the 12 reason groups (see PROPOSED below; `review_note`
                       flags the ambiguous ones)

If javac/java are on PATH, each snippet is also compiled and run (2 s timeout) to fill
verified_outcome / compile_error / runtime_exception / actual_output. These columns are
evidence for the reviewer and the runner features for the Model 3 "with_runner" variant.

Usage (from backend/):
  python ml/component2_error_detection/eval/build_pretest_eval_set.py
Requires: node (to read the ES module data.js); javac/java optional.
"""

import csv
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

EVAL_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.abspath(os.path.join(EVAL_DIR, "..", "..", "..", ".."))
DATA_JS = os.path.join(REPO_ROOT, "frontend", "src", "learningPathGen", "data.js")
OUT_CSV = os.path.join(EVAL_DIR, "pretest_eval_set.csv")

# (question_id, option) -> (reason_group, fine_reason, review_note)
# fine_reason uses the generator's taxonomy (generator/families.py REASON_GROUP).
AMBIG = "AMBIGUOUS: "
PROPOSED = {
    # Q1 "{BLANK} age = 25;"
    (1, "Int"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH", "unknown type 'Int' (cannot find symbol)"),
    (1, "integer"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH", "unknown type 'integer'"),
    (1, "void"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH", "'void' is not a variable type"),
    # Q2 "int {BLANK} = 10;"
    (2, "2count"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_INVALID_NAME", "identifier starts with a digit"),
    (2, "my-var"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_INVALID_NAME", "hyphen in identifier"),
    (2, "class"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_INVALID_NAME", "reserved keyword as identifier"),
    # Q3 "{BLANK} isActive = true;"
    (3, "bool"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH", "'bool' is not a Java type"),
    (3, "Boolean"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH",
                     AMBIG + "compiles and runs (wrapper type, autoboxing); quiz marks it wrong. Consider CORRECT_NO_ERROR"),
    (3, "bit"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_TYPE_MISMATCH", "'bit' is not a Java type"),
    # Q4 "if (score {BLANK} 10)"
    (4, "="): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_WRONG_ASSIGNMENT", "assignment instead of comparison (int cannot convert to boolean)"),
    (4, "==="): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_WRONG_ASSIGNMENT",
                 AMBIG + "comparison-operator confusion; taxonomy has no operator/condition group outside loops"),
    (4, "equals"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_WRONG_ASSIGNMENT",
                    AMBIG + "syntax error; comparison-operator confusion"),
    # Q5 "int b = {BLANK};"  (spec: b == 10, a == 11)
    (5, "++a"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_WRONG_ASSIGNMENT", "pre-increment: b gets 11"),
    (5, "a + 1"): ("VARIABLE_CALCULATION_ISSUE", "VARIABLE_WRONG_CALCULATION", "b = 11 and a is never incremented"),
    (5, "a"): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_WRONG_ASSIGNMENT", "a is never incremented (prints 10 10)"),
    # Q11 "for (int i = 0; {BLANK} < 10; i++)"
    (11, "j"): ("LOOP_CONDITION_ISSUE", "LOOP_WRONG_CONDITION", "undeclared variable in condition"),
    (11, "10"): ("LOOP_CONDITION_ISSUE", "LOOP_WRONG_CONDITION", "10 < 10 is false: loop never runs"),
    (11, "n"): ("LOOP_CONDITION_ISSUE", "LOOP_WRONG_CONDITION", "undeclared variable in condition"),
    # Q12 "{BLANK} { ... } while (i < 0);"
    (12, "while"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_WRONG_CONDITION",
                    AMBIG + "wrong loop construct (syntax error); could be LOOP_CONDITION_ISSUE"),
    (12, "for"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_WRONG_CONDITION", AMBIG + "wrong loop construct (syntax error)"),
    (12, "if"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_WRONG_CONDITION", AMBIG + "wrong loop construct (syntax error)"),
    # Q13 "while (i < 3) { ...; {BLANK}; }"
    (13, "i--"): ("LOOP_UPDATE_ISSUE", "LOOP_WRONG_COUNTER_DIRECTION", "counter moves away from bound: infinite loop"),
    (13, "i"): ("LOOP_UPDATE_ISSUE", "LOOP_MISSING_UPDATE", "'i;' is not a statement; no update"),
    (13, "continue"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_CONTINUE_SKIP_UPDATE", "no update ever runs: infinite loop"),
    # Q14 "if (i == 3) { {BLANK}; }"  (intended: break)
    (14, "sleep"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK_MISSING", "not a Java statement; loop exit missing"),
    (14, "wait"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK_MISSING", "not a Java statement; loop exit missing"),
    (14, "pause"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK_MISSING", "not a Java statement; loop exit missing"),
    # Q15 "if (i == 1) { {BLANK}; }"  (intended: continue)
    (15, "break"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK", "exits loop early (prints '0 ')"),
    (15, "return"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK", "returns from method instead of skipping"),
    (15, "exit"): ("LOOP_CONTROL_FLOW_ISSUE", "LOOP_EARLY_BREAK", "not a Java statement"),
    # Q16 "int{BLANK} arr = new int[5];"
    (16, "()"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_WRONG_INDEX_VARIABLE",
                 AMBIG + "array declaration syntax; no declaration group in the 12-class taxonomy"),
    (16, "{}"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_WRONG_INDEX_VARIABLE", AMBIG + "array declaration syntax"),
    (16, "<>"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_WRONG_INDEX_VARIABLE", AMBIG + "array declaration syntax"),
    # Q17 "System.out.println(arr[{BLANK}]);"  (intended: first element)
    (17, "1"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_WRONG_INDEX_VARIABLE", "one-based index: prints 20"),
    (17, "-1"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_OUT_OF_BOUNDS", "ArrayIndexOutOfBoundsException"),
    (17, "arr.length"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_LENGTH_AS_INDEX", "ArrayIndexOutOfBoundsException"),
    # Q18 "for (int i = 0; i {BLANK} arr.length; i++)"
    (18, "<="): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_OUT_OF_BOUNDS", "dataset convention: '<= arr.length' -> ARRAY_BOUNDARY_INDEX_ISSUE"),
    (18, ">"): ("ARRAY_TRAVERSAL_ISSUE", "ARRAY_WRONG_TRAVERSAL", "condition false at start: no element visited"),
    (18, "=="): ("ARRAY_TRAVERSAL_ISSUE", "ARRAY_WRONG_TRAVERSAL", "condition false at start: no element visited"),
    # Q19 "System.out.println(arr.{BLANK});"
    (19, "length()"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_LENGTH_AS_INDEX",
                       AMBIG + "length is a field, not a method; no array-length-API group in taxonomy"),
    (19, "size"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_LENGTH_AS_INDEX", AMBIG + "no such field"),
    (19, "count"): ("ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_LENGTH_AS_INDEX", AMBIG + "no such field"),
    # Q20 "for (int n : nums) { sum {BLANK} n; }"
    (20, "="): ("VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_OVERWRITTEN_VALUE", "dataset convention (A_sum): accumulator overwritten"),
    (20, "*="): ("VARIABLE_CALCULATION_ISSUE", "VARIABLE_WRONG_CALCULATION", "wrong operator: result 0"),
    (20, "-="): ("VARIABLE_CALCULATION_ISSUE", "VARIABLE_WRONG_CALCULATION", "wrong operator: result -15"),
    # Q21 "static int getFive() { {BLANK} 5; }"
    (21, "print"): ("METHOD_RETURN_ISSUE", "METHOD_MISSING_RETURN", "not a statement; int method has no return"),
    (21, "output"): ("METHOD_RETURN_ISSUE", "METHOD_MISSING_RETURN", "not a statement; int method has no return"),
    (21, "give"): ("METHOD_RETURN_ISSUE", "METHOD_MISSING_RETURN", "not a statement; int method has no return"),
    # Q22 "static {BLANK} printHello() { println }"
    (22, "int"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_TYPE", "missing return statement"),
    (22, "return"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_TYPE", "'return' is not a type (syntax error)"),
    (22, "null"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_TYPE", "'null' is not a type (syntax error)"),
    # Q23 "add(3, {BLANK})"
    (23, "four"): ("METHOD_SIGNATURE_ISSUE", "METHOD_WRONG_CALL", "undeclared identifier as argument"),
    (23, '"4"'): ("METHOD_SIGNATURE_ISSUE", "METHOD_WRONG_CALL", "String argument for int parameter"),
    (23, "IV"): ("METHOD_SIGNATURE_ISSUE", "METHOD_WRONG_CALL", "undeclared identifier as argument"),
    # Q24 base case "return {BLANK};"
    (24, "0"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_OPERATION", "wrong base-case value: sum off by 1"),
    (24, "n"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_OPERATION",
                AMBIG + "EQUIVALENT MUTANT: when n == 1, 'return n' returns 1, same behaviour as correct. Consider CORRECT_NO_ERROR"),
    (24, "mystery(n)"): ("METHOD_RETURN_ISSUE", "METHOD_WRONG_RETURN_OPERATION", "infinite recursion (StackOverflowError when called)"),
    # Q25 recursive call "mystery({BLANK})"
    (25, "n"): ("METHOD_PARAMETER_USAGE_ISSUE", "METHOD_IGNORED_PARAMETER",
                AMBIG + "argument not reduced: infinite recursion; could be METHOD_SIGNATURE_ISSUE (wrong call)"),
    (25, "n + 1"): ("METHOD_PARAMETER_USAGE_ISSUE", "METHOD_IGNORED_PARAMETER", AMBIG + "moves away from base case: infinite recursion"),
    (25, "1"): ("METHOD_PARAMETER_USAGE_ISSUE", "METHOD_IGNORED_PARAMETER", AMBIG + "parameter ignored: returns n + 1"),
}

COLUMNS = ["sample_id", "question_id", "topic", "option_index", "option", "is_correct_option", "code",
           "label", "reason_group", "fine_reason", "label_status", "review_note",
           "verified_outcome", "compile_error", "runtime_exception", "actual_output"]


def load_quiz_bank():
    script = ("import { QUIZ_BANK } from " + json.dumps("file:///" + DATA_JS.replace("\\", "/")) + ";"
              "console.log(JSON.stringify(QUIZ_BANK.filter(q => q.codeTemplate)));")
    out = subprocess.run(["node", "--input-type=module", "-e", script], capture_output=True, text=True, check=True)
    return json.loads(out.stdout)


def build_full_code(template, option):
    # quizLab.js: question.codeTemplate.replace("{BLANK}", answer) — first occurrence only
    return template.replace("{BLANK}", option, 1)


# ---------------------------------------------------------------- optional Code Runner
def _split_methods(code):
    """Split top-level `static ... { ... }` method declarations from plain statements."""
    methods, body, i = [], [], 0
    while i < len(code):
        m = re.compile(r"\s*static\b[^;{]*\{").match(code, i)
        if m:
            depth, j = 0, m.end() - 1
            while j < len(code):
                depth += {"{": 1, "}": -1}.get(code[j], 0)
                j += 1
                if depth == 0:
                    break
            methods.append(code[i:j].strip())
            i = j
        else:
            body.append(code[i])
            i += 1
    return methods, "".join(body).strip()


def run_java(code, work):
    methods, body = _split_methods(code)
    src = "public class Main {\n" + "\n".join(methods) + "\npublic static void main(String[] args) {\n" + body + "\n}\n}\n"
    d = tempfile.mkdtemp(dir=work)
    with open(os.path.join(d, "Main.java"), "w", encoding="utf-8") as fh:
        fh.write(src)
    c = subprocess.run(["javac", "-nowarn", "-encoding", "UTF-8", "Main.java"], cwd=d, capture_output=True, text=True)
    if c.returncode != 0:
        first = next((ln for ln in c.stderr.splitlines() if "error:" in ln), c.stderr.strip()[:200])
        return "COMPILE_ERROR", first.split("error:", 1)[-1].strip(), "", ""
    # Output goes to files, not pipes: on Windows the `java` on PATH can be a launcher shim
    # whose JVM child keeps a pipe open after the shim is killed, blocking forever.
    out_path, err_path = os.path.join(d, "out.txt"), os.path.join(d, "err.txt")
    with open(out_path, "wb") as out_f, open(err_path, "wb") as err_f:
        p = subprocess.Popen(["java", "-Xss8m", "-cp", d, "Main"], stdout=out_f, stderr=err_f)
        try:
            rc = p.wait(timeout=2)
        except subprocess.TimeoutExpired:
            _kill_tree(p)
            rc = None
    with open(out_path, "rb") as fh:
        stdout = fh.read(200).decode(errors="replace")
    with open(err_path, "rb") as fh:
        stderr = fh.read(4000).decode(errors="replace")
    if rc is None:
        return "NON_TERMINATING", "", "", stdout
    if rc != 0:
        exc = next((ln.split(":")[0].split()[-1] for ln in stderr.splitlines() if "Exception" in ln or "Error" in ln), "")
        return "RUNTIME_EXCEPTION", "", exc, stdout
    return "RAN", "", "", stdout


def _kill_tree(p):
    if os.name == "nt":
        subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
    else:
        p.kill()
    try:
        p.wait(timeout=5)
    except subprocess.TimeoutExpired:
        pass


def main():
    bank = load_quiz_bank()
    have_java = bool(shutil.which("javac") and shutil.which("java"))
    work = tempfile.mkdtemp(prefix="c2_pretest_")
    rows, missing = [], []
    try:
        for q in bank:
            for idx, opt in enumerate(q["options"]):
                code = build_full_code(q["codeTemplate"], opt)
                correct = idx == q["correctIndex"]
                if correct:
                    rg, fine, note = "CORRECT_NO_ERROR", "CORRECT_NO_ERROR", ""
                elif (q["id"], opt) in PROPOSED:
                    rg, fine, note = PROPOSED[(q["id"], opt)]
                else:
                    rg, fine, note = "", "", "NO PROPOSAL — label manually"
                    missing.append((q["id"], opt))
                outcome, ce, exc, out = run_java(code, work) if have_java else ("NOT_RUN", "", "", "")
                broad = ("CORRECT" if rg == "CORRECT_NO_ERROR" else
                         {"LOOP": "LOOP_ERROR", "VARIABLE": "VARIABLE_ERROR", "ARRAY": "ARRAY_ERROR",
                          "METHOD": "METHOD_ERROR"}.get(rg.split("_")[0], ""))
                rows.append({
                    "sample_id": f"PT{q['id']:02d}_{idx}", "question_id": q["id"], "topic": q["topic"],
                    "option_index": idx, "option": opt, "is_correct_option": int(correct), "code": code,
                    "label": broad, "reason_group": rg, "fine_reason": fine, "label_status": "proposed",
                    "review_note": note, "verified_outcome": outcome, "compile_error": ce,
                    "runtime_exception": exc, "actual_output": out.strip().replace("\n", "\\n"),
                })
    finally:
        shutil.rmtree(work, ignore_errors=True)

    with open(OUT_CSV, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=COLUMNS)
        w.writeheader()
        w.writerows(rows)

    print(f"wrote {len(rows)} rows -> {os.path.relpath(OUT_CSV, REPO_ROOT)}  (java runner: {have_java})")
    if missing:
        print("WARNING: options without a proposal:", missing)


if __name__ == "__main__":
    sys.exit(main())
