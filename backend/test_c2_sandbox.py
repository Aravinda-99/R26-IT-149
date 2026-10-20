"""
Component 2 Java sandbox — unit tests (real javac/java; skipped without a JDK)
=============================================================================
Covers the snippet wrapper, compile-error line mapping, runtime errors
(ArrayIndexOutOfBounds, StackOverflowError, infinite loops with and without output),
stdin, the /run-tests runner with a fixture spec, and the Flask routes.

Run from backend/:
  python -m unittest test_c2_sandbox -v
"""

import os
import sys
import time
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from services import code_runner_service as cr  # noqa: E402
from services import sandbox_tests_service as st  # noqa: E402

try:
    cr.find_jdk()
    HAVE_JDK = True
except cr.JdkNotFound:
    HAVE_JDK = False

# Q25-style fixture: the student fills in the recursive argument.
TEMPLATE = "static int mystery(int n) { if (n == 1) { return 1; } return n + mystery({BLANK}); }"
SPEC = {
    "question_id": 999,
    "mode": "template",
    "harness": "{STUDENT_CODE}\nScanner tIn = new Scanner(System.in);\nSystem.out.println(mystery(tIn.nextInt()));",
    "tests": [
        {"name": "n = 1", "stdin": "1", "expected_stdout": "1", "description_en": "base case"},
        {"name": "n = 3", "stdin": "3", "expected_stdout": "6", "description_en": "3 + 2 + 1"},
        {"name": "n = 5", "stdin": "5", "expected_stdout": "15", "description_en": "1..5"},
    ],
}


class TestWrapper(unittest.TestCase):
    def test_method_and_statement_on_one_line(self):
        code = "static int add(int a, int b) { return a + b; } System.out.println(add(3, 4));"
        kinds = [k for k, _, _ in cr.split_snippet(code)]
        self.assertEqual(kinds, ["method", "statement"])
        src = cr.wrap_code(code)["source"]
        self.assertLess(src.index("static int add"), src.index("public static void main"))
        self.assertGreater(src.index("System.out.println(add(3, 4));"), src.index("public static void main"))

    def test_control_flow_is_not_a_method(self):
        code = "for (int i = 0; i < 3; i++) { if (i == 1) { continue; } } while (true) { break; }"
        self.assertEqual({k for k, _, _ in cr.split_snippet(code)}, {"statement"})

    def test_line_map_points_at_student_lines(self):
        code = "int a = 1;\nstatic int twice(int x) {\n    return 2 * x;\n}\nSystem.out.println(twice(a));"
        w = cr.wrap_code(code)
        lines = w["source"].split("\n")
        self.assertEqual(w["line_map"][lines.index("    return 2 * x;")], 3)
        self.assertEqual(w["line_map"][lines.index("System.out.println(twice(a));")], 5)

    def test_full_program_is_not_wrapped(self):
        code = "public class Hello {\n  public static void main(String[] a) { System.out.println(1); }\n}"
        w = cr.wrap_code(code)
        self.assertEqual((w["filename"], w["main_class"], w["source"]), ("Hello.java", "Hello", code))


@unittest.skipUnless(HAVE_JDK, "no JDK (javac) available")
class TestRunner(unittest.TestCase):
    def test_correct_code_runs(self):
        r = cr.run_code('int x = 2;\nSystem.out.println("x = " + (x * 21));')
        self.assertTrue(r["compiled"])
        self.assertIsNone(r["runtime_error"])
        self.assertEqual(r["stdout"].strip(), "x = 42")
        self.assertFalse(r["timed_out"])

    def test_stdin(self):
        r = cr.run_code("Scanner s = new Scanner(System.in);\nSystem.out.println(s.nextInt() * 2);", stdin="21\n")
        self.assertEqual(r["stdout"].strip(), "42")

    def test_compile_error_is_mapped_to_student_line(self):
        r = cr.run_code("int a = 1;\nint b = 2;\nSystem.out.println(c);")
        self.assertFalse(r["compiled"])
        e = r["compile_errors"][0]
        self.assertEqual((e["line"], e["category"]), (3, "unknown_name"))
        self.assertEqual(e["code_line"], "System.out.println(c);")
        self.assertTrue(e["column"])

    def test_pretest_style_compile_errors(self):
        self.assertEqual(cr.run_code("Int age = 25;")["compile_errors"][0]["category"], "unknown_name")
        self.assertEqual(cr.run_code('int score = 10; if (score = 10) { System.out.println("Match"); }')
                         ["compile_errors"][0]["category"], "type_mismatch")
        self.assertEqual(cr.run_code('static int printHello() { System.out.println("Hello"); }')
                         ["compile_errors"][0]["category"], "missing_return")

    def test_array_index_out_of_bounds(self):
        r = cr.run_code("int[] arr = {10, 20, 30};\nSystem.out.println(arr[3]);")
        self.assertTrue(r["compiled"])
        err = r["runtime_error"]
        self.assertEqual((err["type"], err["category"], err["line"]),
                         ("ArrayIndexOutOfBoundsException", "array_index_out_of_bounds", 2))

    def test_stack_overflow(self):
        r = cr.run_code("static int f(int n) { return f(n + 1); }\nSystem.out.println(f(1));")
        self.assertEqual(r["runtime_error"]["type"], "StackOverflowError")
        self.assertEqual(r["runtime_error"]["category"], "stack_overflow")

    def test_infinite_loop_without_output_times_out(self):
        t0 = time.monotonic()
        r = cr.run_code("int i = 0;\nwhile (i < 3) { }", run_timeout=2)
        self.assertTrue(r["timed_out"])
        self.assertEqual(r["runtime_error"]["category"], "timeout")
        self.assertLess(time.monotonic() - t0, 15)  # process tree killed, no hang on pipes

    def test_infinite_printing_loop_hits_output_cap(self):
        t0 = time.monotonic()
        r = cr.run_code('int i = 0;\nwhile (i < 3) { System.out.print(i + " "); i--; }')
        self.assertTrue(r["output_truncated"])
        self.assertEqual(r["runtime_error"]["category"], "output_limit")
        self.assertLessEqual(len(r["stdout"].encode()), cr.OUTPUT_CAP_BYTES)
        self.assertLess(time.monotonic() - t0, cr.RUN_TIMEOUT_SECONDS + 10)

    def test_full_program(self):
        r = cr.run_code("public class Hello {\n  public static void main(String[] a) {\n    System.out.println(\"hi\");\n  }\n}")
        self.assertEqual(r["stdout"].strip(), "hi")

    def test_rejects_empty_code(self):
        self.assertFalse(cr.run_code("   ")["success"])


@unittest.skipUnless(HAVE_JDK, "no JDK (javac) available")
class TestRunTests(unittest.TestCase):
    def test_correct_option_passes_all(self):
        r = st.run_tests(999, TEMPLATE.replace("{BLANK}", "n - 1"), spec=SPEC)
        self.assertTrue(r["all_passed"])
        self.assertEqual((r["passed_count"], r["total"]), (3, 3))
        self.assertEqual({t["actual"].strip() for t in r["tests"]}, {"1", "6", "15"})

    def test_wrong_option_fails(self):
        r = st.run_tests(999, TEMPLATE.replace("{BLANK}", "n + 1"), spec=SPEC)  # infinite recursion
        self.assertFalse(r["all_passed"])
        failed = [t for t in r["tests"] if not t["passed"]]
        self.assertEqual(len(failed), 2)  # n = 1 still hits the base case
        self.assertEqual(failed[0]["error"]["type"], "StackOverflowError")

    def test_compile_error_in_student_code_maps_to_student_line(self):
        code = "static int mystery(int n) {\n    if (n == 1) { return 1; }\n    return n + mystery(n - 1)\n}"
        r = st.run_tests(999, code, spec=SPEC)
        self.assertFalse(r["compiled"])
        self.assertEqual(r["compile_errors"][0]["line"], 3)
        self.assertTrue(all(not t["passed"] for t in r["tests"]))
        self.assertTrue(all(t.get("status") == "not_run" for t in r["tests"]))

    def test_output_comparison_ignores_line_endings_and_trailing_spaces(self):
        self.assertEqual(st.normalise_output("0 1 2 \r\n"), st.normalise_output("0 1 2"))

    def test_validate_spec_flags_uncaught_option(self):
        weak = dict(SPEC, tests=[SPEC["tests"][0]])  # only n = 1: "n + 1" passes it too
        report = st.validate_spec(weak, TEMPLATE.replace("{BLANK}", "n - 1"),
                                  {"n + 1": TEMPLATE.replace("{BLANK}", "n + 1")})
        self.assertFalse(report["ok"])
        self.assertEqual(report["uncaught"], ["n + 1"])


def _load_builder():
    import importlib.util
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts", "build_sandbox_tests.py")
    spec = importlib.util.spec_from_file_location("build_sandbox_tests", path)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


@unittest.skipUnless(HAVE_JDK, "no JDK (javac) available")
class TestBuilderValidation(unittest.TestCase):
    """build_sandbox_tests.evaluate(): execution checks applied to every LLM candidate (no LLM here)."""

    @classmethod
    def setUpClass(cls):
        cls.b = _load_builder()
        cls.q = {"id": 999, "codeTemplate": TEMPLATE, "options": ["n - 1", "n", "n + 1", "1"], "correct_option": "n - 1"}
        cls.correct = TEMPLATE.replace("{BLANK}", "n - 1")
        cls.wrong = {o: TEMPLATE.replace("{BLANK}", o) for o in ("n", "n + 1", "1")}

    def test_good_spec_is_ok(self):
        spec = dict(SPEC, tests=SPEC["tests"] + [{"name": "n = 4", "stdin": "4", "expected_stdout": "10"}])
        r = self.b.evaluate(self.q, spec, self.correct, self.wrong, (), False)
        self.assertEqual(r["status"], "ok")
        self.assertEqual(r["report"]["uncaught"], [])

    def test_ablation_drops_harness_only_test(self):
        harness = SPEC["harness"].replace("System.out.println(mystery(tIn.nextInt()));",
                                          "int tM = tIn.nextInt();\nif (tM == 0) { System.out.println(\"hello\"); }\n"
                                          "else { System.out.println(mystery(tM)); }")
        tests = SPEC["tests"] + [{"name": "harness only", "stdin": "0", "expected_stdout": "hello"}]
        r = self.b.evaluate(self.q, dict(SPEC, harness=harness, tests=tests), self.correct, self.wrong, (), False)
        self.assertNotIn("harness only", [t["name"] for t in r["report"]["tests"]])
        self.assertEqual(r["ablated"], 1)

    def test_wrong_option_must_still_be_caught_after_ablation(self):
        # Only the base-case test survives, and "1" (mystery(1)) passes it: uncaught -> not usable.
        tests = [SPEC["tests"][0]]
        r = self.b.evaluate(self.q, dict(SPEC, tests=tests), self.correct, {"1": self.wrong["1"]}, (), False)
        self.assertIsNone(r["status"])
        self.assertEqual(r["report"]["uncaught"], ["1"])

    def test_few_valid_tests_are_partial(self):
        r = self.b.evaluate(self.q, dict(SPEC, tests=SPEC["tests"][1:]), self.correct, self.wrong, (), False)
        self.assertEqual(r["status"], "partial")
        self.assertEqual(len(r["tests"]), 2)


@unittest.skipUnless(HAVE_JDK, "no JDK (javac) available")
class TestRoutes(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        import io
        import contextlib
        import services.error_service as es
        es.db = None
        from app import create_app
        with contextlib.redirect_stdout(io.StringIO()):
            cls.client = create_app().test_client()

    def test_run_route(self):
        r = self.client.post("/api/errors/run", json={"code": "System.out.println(7 % 3);"})
        j = r.get_json()
        self.assertEqual(r.status_code, 200)
        for k in ("compiled", "compile_errors", "runtime_error", "stdout", "timed_out", "time_ms"):
            self.assertIn(k, j)
        self.assertEqual(j["stdout"].strip(), "1")

    def test_run_route_rejects_empty(self):
        self.assertEqual(self.client.post("/api/errors/run", json={"code": ""}).status_code, 400)

    def test_run_tests_route(self):
        with mock.patch.object(st, "get_spec", return_value=SPEC):
            j = self.client.post("/api/errors/run-tests",
                                 json={"question_id": 999, "code": TEMPLATE.replace("{BLANK}", "n - 1")}).get_json()
        self.assertTrue(j["all_passed"])
        self.assertEqual(set(j["tests"][0]), {"name", "passed", "stdin", "expected", "actual", "error", "description_en",
                                              "description_si", "description_singlish", "time_ms"})

    def test_run_tests_unknown_question(self):
        with mock.patch.object(st, "get_spec", return_value=None):
            r = self.client.post("/api/errors/run-tests", json={"question_id": 12345, "code": "int x = 1;"})
        self.assertEqual(r.status_code, 400)

    def test_run_tests_compile_error(self):
        with mock.patch.object(st, "get_spec", return_value=SPEC):
            code = "static int mystery(int n) {\n    if (n == 1) { return 1; }\n    return n + mystery(n - 1)\n}"
            r = self.client.post("/api/errors/run-tests", json={"question_id": 999, "code": code})
        self.assertEqual(r.status_code, 200)
        j = r.get_json()
        self.assertFalse(j["compiled"])
        self.assertFalse(j["all_passed"])
        self.assertEqual(j["compile_errors"][0]["line"], 3)
        self.assertTrue(len(j["tests"]) > 0)
        for t in j["tests"]:
            self.assertEqual(t["status"], "not_run")
            self.assertFalse(t["passed"])


if __name__ == "__main__":
    unittest.main()
