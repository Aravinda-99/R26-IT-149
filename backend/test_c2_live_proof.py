"""
Component 2 "live proof" — unit tests (LLM mocked, no network)
==============================================================
A panel member must be able to see that the AI runs live and is not hard-coded:
  * POST /api/errors/analyze reports computed_at + inference_ms (Model 3, run for that answer)
  * POST /api/errors/explain reports where an explanation came from (generated_at / model)
  * POST /api/errors/explain {mode: "live"} regenerates one answer's explanation without
    reading or writing the explanation cache, and falls back to the template on failure.

Run from backend/:
  python -m unittest test_c2_live_proof -v
"""

import datetime
import hashlib
import json
import os
import sys
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import services.error_service as es  # noqa: E402

es.db = None  # never write test runs to Firestore

from services import explanation_service as xs  # noqa: E402
from services.error_service import ErrorService  # noqa: E402
from services.explanation_service import ExplanationService  # noqa: E402
from test_c2_explanations import valid_payload  # noqa: E402

LOOP_CODE = "for (int i = 0; i <= arr.length; i++) { sum += arr[i]; }"
Q1_CODE = "Int age = 25;"


def file_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha256(f.read()).hexdigest()


class TestAnalyzeLiveProof(unittest.TestCase):
    def check_fields(self, res):
        self.assertTrue(res["success"])
        stamp = datetime.datetime.fromisoformat(res["computed_at"])
        self.assertIsNotNone(stamp.tzinfo, "computed_at must carry a UTC offset so the browser can show local time")
        age = (datetime.datetime.now(datetime.timezone.utc) - stamp).total_seconds()
        self.assertTrue(0 <= age < 60, f"computed_at should be 'now', got {age:.1f}s ago")
        self.assertIsInstance(res["inference_ms"], (int, float))
        self.assertTrue(0 < res["inference_ms"] < 10_000)

    def test_service_returns_computed_at_and_inference_ms(self):
        self.check_fields(ErrorService.analyze({"student_id": "t", "code": LOOP_CODE}, persist=False))

    def test_answer_key_result_is_timed_too(self):
        res = ErrorService.analyze({"student_id": "t", "code": "int age = 25;", "is_correct_option": True}, persist=False)
        self.check_fields(res)
        self.assertEqual(res["source"], "answer_key")

    def test_every_call_is_a_fresh_run(self):
        a = ErrorService.analyze({"student_id": "t", "code": LOOP_CODE}, persist=False)
        b = ErrorService.analyze({"student_id": "t", "code": LOOP_CODE}, persist=False)
        self.assertGreaterEqual(b["computed_at"], a["computed_at"])
        self.assertIsNot(a, b)

    def test_route_returns_the_fields_as_json(self):
        from app import create_app
        client = create_app().test_client()
        res = client.post("/api/errors/analyze", json={"student_id": "t", "code": LOOP_CODE, "persist": False})
        self.assertEqual(res.status_code, 200)
        self.check_fields(res.get_json())


class TestExplainSource(unittest.TestCase):
    def setUp(self):
        ExplanationService._memo = {}
        ExplanationService._llm_blocked_until = 0.0
        ExplanationService._cache = None

    def tearDown(self):
        ExplanationService._llm_blocked_until = 0.0
        ExplanationService._cache = None

    def test_cache_hit_reports_generated_at_and_model(self):
        res = ExplanationService.explain({"question_id": 1, "chosen_option": "Int", "code": Q1_CODE, "is_correct": False})
        self.assertEqual(res["source"], "cache")
        self.assertTrue(res["generated_at"])
        datetime.datetime.fromisoformat(res["generated_at"])
        self.assertTrue(res["model"])

    def test_live_llm_reports_model_and_time(self):
        reply = json.dumps(valid_payload(), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "model-x")), \
                mock.patch.object(xs, "llm_status", return_value=("gemini", "model-x", True)):
            res = ExplanationService.explain({"question_id": 1, "chosen_option": "Int", "code": Q1_CODE,
                                              "is_correct": False, "mode": "live"})
        self.assertEqual((res["source"], res["mode"], res["model"]), ("llm", "live", "model-x"))
        datetime.datetime.fromisoformat(res["generated_at"])

    def test_template_has_no_model_or_time(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMTimeout("slow")), \
                mock.patch.object(xs, "llm_status", return_value=("gemini", "m", True)), \
                mock.patch.object(ExplanationService, "lookup_cache", return_value=None):
            res = ExplanationService.explain({"question_id": 1, "chosen_option": "Int", "code": Q1_CODE,
                                              "is_correct": False, "mode": "live"})
        self.assertEqual(res["source"], "template")
        self.assertIsNone(res["model"])
        self.assertIsNone(res["generated_at"])


class TestExplainLiveMode(unittest.TestCase):
    """mode "live": THIS question + option, regenerated now; the cache is never read or written."""

    def setUp(self):
        ExplanationService._memo = {}
        ExplanationService._llm_blocked_until = 0.0
        self.configured = mock.patch.object(xs, "llm_status", return_value=("gemini", "m", True))
        self.configured.start()

    def tearDown(self):
        self.configured.stop()
        ExplanationService._llm_blocked_until = 0.0
        ExplanationService._memo = {}

    def body(self, **kw):
        b = {"question_id": 1, "chosen_option": "Int", "code": Q1_CODE, "is_correct": False, "mode": "live",
             "reason_group": "VARIABLE_ASSIGNMENT_ISSUE", "prediction_confidence": 0.98}
        b.update(kw)
        return b

    def test_does_not_modify_the_cache_file(self):
        before = file_hash(xs.CACHE_PATH)
        reply = json.dumps(valid_payload(), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "mock")):
            ok = ExplanationService.explain(self.body())
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMRateLimited("429")):
            failed = ExplanationService.explain(self.body())
        self.assertEqual(ok["source"], "llm")
        self.assertEqual(failed["source"], "cache")
        self.assertTrue(failed.get("live_failed"))
        self.assertEqual(file_hash(xs.CACHE_PATH), before, "explanation cache file changed")

    def test_bypasses_cache_and_memo(self):
        reply = json.dumps(valid_payload(summary_en="Brand new text."), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "mock")) as llm, \
                mock.patch.object(ExplanationService, "lookup_cache", side_effect=AssertionError("cache read")):
            first = ExplanationService.explain(self.body())
            second = ExplanationService.explain(self.body())
        self.assertEqual(llm.call_count, 2)  # a cached/memoised answer would have skipped the second call
        self.assertEqual(first["explanation"]["summary_en"], "Brand new text.")
        self.assertEqual(second["source"], "llm")
        self.assertEqual(ExplanationService._memo, {}, "live results must not be memoised")

    def test_normal_request_still_uses_the_cache(self):
        with mock.patch.object(xs, "call_llm", side_effect=AssertionError("LLM must not be called")):
            res = ExplanationService.explain(self.body(mode=None))
        self.assertEqual(res["source"], "cache")

    def test_failure_returns_template_with_reason(self):
        for err in (xs.LLMTimeout("slow"), xs.LLMRateLimited("429"), xs.LLMUnavailable("503"), xs.LLMError("boom")):
            with self.subTest(err=type(err).__name__):
                ExplanationService._llm_blocked_until = 0.0
                with mock.patch.object(xs, "call_llm", side_effect=err):
                    res = ExplanationService.explain(self.body())
                self.assertTrue(res["success"])
                self.assertEqual((res["source"], res["mode"]), ("cache", "live"))
                self.assertTrue(res.get("live_failed"))
                self.assertIn(type(err).__name__, res["llm_error"])
                self.assertTrue(res["explanation"]["summary_en"])
                self.assertTrue(res["explanation"]["summary_si"])  # the language switch still works

    def test_failure_falls_back_to_template_when_no_cache_exists(self):
        ExplanationService._llm_blocked_until = 0.0
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMTimeout("slow")), \
                mock.patch.object(ExplanationService, "lookup_cache", return_value=None):
            res = ExplanationService.explain(self.body())
        self.assertTrue(res["success"])
        self.assertEqual((res["source"], res["mode"]), ("template", "live"))
        self.assertFalse(res.get("live_failed", False))
        self.assertIn("LLMTimeout", res["llm_error"])
        self.assertTrue(res["explanation"]["summary_en"])
        self.assertTrue(res["explanation"]["summary_si"])

    def test_same_circuit_breaker_as_normal_requests(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMRateLimited("429")) as llm:
            ExplanationService.explain(self.body())
            res = ExplanationService.explain(self.body())  # breaker is open: no second LLM call
        self.assertEqual(llm.call_count, 1)
        self.assertEqual(res["source"], "cache")
        self.assertTrue(res.get("live_failed"))
        self.assertIn("circuit breaker", res["llm_error"])

    def test_one_attempt_only(self):
        with mock.patch.object(xs, "call_llm", return_value=("not json", "mock")) as llm:
            res = ExplanationService.explain(self.body())
        self.assertEqual(llm.call_count, 1)
        self.assertEqual(res["source"], "cache")
        self.assertTrue(res.get("live_failed"))

    def test_llm_switched_off_says_so(self):
        with mock.patch.object(xs, "llm_status", return_value=("gemini", "m", False)):
            res = ExplanationService.explain(self.body())
        self.assertEqual(res["source"], "cache")
        self.assertTrue(res.get("live_failed"))
        self.assertIn("not configured", res["llm_error"])

    def test_missing_fields_rejected(self):
        self.assertFalse(ExplanationService.explain({"mode": "live", "question_id": 1})["success"])

    def test_route_accepts_live_mode(self):
        from app import create_app
        client = create_app().test_client()
        reply = json.dumps(valid_payload(), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "mock")):
            res = client.post("/api/errors/explain", json=self.body())
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.get_json()["mode"], "live")


if __name__ == "__main__":
    unittest.main()
