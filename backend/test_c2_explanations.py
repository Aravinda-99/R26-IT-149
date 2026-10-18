"""
Component 2 explanation service — unit tests (LLM mocked, no network)
=====================================================================
Covers: JSON validation, cache lookup, template fallback (EN / Sinhala / Singlish),
the one-retry rule (cache builder) vs one attempt (live), the circuit breaker,
and the LLM verification policy.

Run from backend/:
  python -m unittest test_c2_explanations -v
"""

import json
import os
import sys
import tempfile
import unittest
from unittest import mock

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import services.error_service as es  # noqa: E402

es.db = None

from services import explanation_service as xs  # noqa: E402
from services.explanation_service import ExplanationService, validate_explanation, choose_final_label  # noqa: E402

CODE = "Int age = 25;"


def valid_payload(**overrides):
    obj = {
        "is_correct": False,
        "summary_en": "You wrote Int instead of int.",
        "where": "Int",
        "why_en": "Java is case-sensitive. Int is not a type.",
        "fix_en": "Change Int to int.",
        "correct_code": "int age = 25;",
        "tip_en": "Primitive types are lowercase.",
        "summary_si": "ඔබ int වෙනුවට Int ලියා ඇත.",
        "why_si": "Java case-sensitive නිසා Int වර්ගයක් නොවේ.",
        "fix_si": "Int වෙනුවට int ලියන්න.",
        "tip_si": "Primitive types සැමවිටම lowercase වේ.",
        "summary_singlish": "Oya int wenuwata Int liyala.",
        "why_singlish": "Java case-sensitive nisa Int kiyana type ekak na.",
        "fix_singlish": "Int wenuwata int danna.",
        "tip_singlish": "Primitive types hama welema lowercase.",
        "llm_agrees_with_label": True,
        "llm_suggested_reason_group": "VARIABLE_ASSIGNMENT_ISSUE",
    }
    obj.update(overrides)
    return obj


def make_ctx(option="Int", is_correct=False, reason_group="VARIABLE_ASSIGNMENT_ISSUE", conf=0.98):
    return ExplanationService.build_context(
        1, option, None, is_correct,
        {"reason_group": reason_group, "prediction_confidence": conf, "error_pattern_score": conf}, None)


class TestValidation(unittest.TestCase):
    def test_valid_payload_passes(self):
        clean, warnings = validate_explanation(valid_payload(), CODE)
        self.assertEqual(clean["where"], "Int")
        self.assertEqual(clean["llm_suggested_reason_group"], "VARIABLE_ASSIGNMENT_ISSUE")
        self.assertEqual(warnings, [])

    def test_missing_key_fails(self):
        obj = valid_payload()
        del obj["tip_singlish"]
        with self.assertRaises(xs.ExplanationValidationError) as cm:
            validate_explanation(obj, CODE)
        self.assertIn("tip_singlish", str(cm.exception))

    def test_unknown_reason_group_fails(self):
        with self.assertRaises(xs.ExplanationValidationError):
            validate_explanation(valid_payload(llm_suggested_reason_group="SYNTAX_ERROR"), CODE)

    def test_sinhala_field_must_use_sinhala_script(self):
        with self.assertRaises(xs.ExplanationValidationError):
            validate_explanation(valid_payload(why_si="Java is case-sensitive."), CODE)

    def test_singlish_field_must_use_latin_letters(self):
        with self.assertRaises(xs.ExplanationValidationError):
            validate_explanation(valid_payload(fix_singlish="Int වෙනුවට int"), CODE)

    def test_where_not_in_code_becomes_null(self):
        clean, warnings = validate_explanation(valid_payload(where="boolean"), CODE)
        self.assertIsNone(clean["where"])
        self.assertTrue(any("not in the student's code" in w for w in warnings))

    def test_string_booleans_are_coerced(self):
        clean, _ = validate_explanation(valid_payload(is_correct="false", llm_agrees_with_label="true"), CODE)
        self.assertIs(clean["is_correct"], False)
        self.assertIs(clean["llm_agrees_with_label"], True)

    def test_overlong_field_fails(self):
        with self.assertRaises(xs.ExplanationValidationError):
            validate_explanation(valid_payload(why_en="x" * (xs.MAX_TEXT_CHARS + 1)), CODE)


class TestCache(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8")
        json.dump({"items": {"1::Int": {"question_id": 1, "option": "Int", "code": CODE,
                                        "response": {"success": True, "source": "llm", "question_id": 1,
                                                     "explanation": valid_payload()}}}}, self.tmp)
        self.tmp.close()
        self.patch = mock.patch.object(xs, "CACHE_PATH", self.tmp.name)
        self.patch.start()
        ExplanationService._cache = None
        ExplanationService._memo = {}

    def tearDown(self):
        self.patch.stop()
        ExplanationService._cache = None
        os.unlink(self.tmp.name)

    def test_hit_by_question_and_option(self):
        self.assertIsNotNone(ExplanationService.lookup_cache(1, "Int", CODE))

    def test_other_option_is_a_miss(self):
        self.assertIsNone(ExplanationService.lookup_cache(1, "int", "int age = 25;"))

    def test_different_code_is_a_miss(self):
        self.assertIsNone(ExplanationService.lookup_cache(1, "Int", "Int age = 99;"))

    def test_whitespace_difference_still_hits(self):
        self.assertIsNotNone(ExplanationService.lookup_cache(1, "Int", "Int   age = 25; "))

    def test_explain_returns_cache_source_without_llm(self):
        with mock.patch.object(xs, "call_llm", side_effect=AssertionError("LLM must not be called")):
            res = ExplanationService.explain({"student_id": "S1", "question_id": 1, "chosen_option": "Int",
                                              "code": CODE, "is_correct": False})
        self.assertEqual(res["source"], "cache")
        self.assertEqual(res["student_id"], "S1")

    def test_missing_fields_rejected(self):
        self.assertFalse(ExplanationService.explain({"question_id": 1})["success"])


class TestFallbackAndRetry(unittest.TestCase):
    def setUp(self):
        ExplanationService._memo = {}

    def test_timeout_falls_back_to_template(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMTimeout("timed out")):
            res = ExplanationService.generate(make_ctx())
        self.assertEqual(res["source"], "template")
        self.assertTrue(res["explanation"]["summary_en"])
        self.assertEqual(res["explanation"]["where"], "Int")
        self.assertEqual(res["explanation"]["correct_code"], "int age = 25;")
        self.assertEqual(res["languages"], ["en", "si", "singlish"])
        self.assertEqual(res["label_source"], "model3")
        self.assertIn("LLMTimeout", res["llm_error"])

    def test_invalid_json_twice_falls_back_to_template(self):
        with mock.patch.object(xs, "call_llm", return_value=("not json at all", "mock")) as m:
            res = ExplanationService.generate(make_ctx())
        self.assertEqual(m.call_count, 2)  # first try + one retry
        self.assertEqual(res["source"], "template")

    def test_retry_once_then_valid(self):
        replies = [("{\"summary_en\": \"half\"}", "mock"), (json.dumps(valid_payload(), ensure_ascii=False), "mock")]
        with mock.patch.object(xs, "call_llm", side_effect=replies) as m:
            res = ExplanationService.generate(make_ctx())
        self.assertEqual(m.call_count, 2)
        self.assertEqual(res["source"], "llm")
        self.assertEqual(res["languages"], ["en", "si", "singlish"])
        self.assertIn("PREVIOUS ANSWER WAS INVALID", m.call_args_list[1][0][0])

    def test_answer_key_overrides_llm_is_correct(self):
        reply = json.dumps(valid_payload(is_correct=True), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "mock")):
            res = ExplanationService.generate(make_ctx())
        self.assertIs(res["explanation"]["is_correct"], False)

    def test_no_api_key_uses_template(self):
        with mock.patch.object(xs, "llm_status", return_value=("gemini", "m", False)), \
                mock.patch.object(xs, "call_llm", side_effect=AssertionError("LLM must not be called")), \
                mock.patch.object(ExplanationService, "lookup_cache", return_value=None):
            res = ExplanationService.explain({"question_id": 1, "chosen_option": "Int", "code": CODE,
                                              "is_correct": False, "reason_group": "VARIABLE_ASSIGNMENT_ISSUE",
                                              "prediction_confidence": 0.98})
        self.assertEqual(res["source"], "template")

    def test_client_is_correct_is_checked_against_answer_key(self):
        ctx = ExplanationService.build_context(1, "Int", None, True, {"reason_group": "VARIABLE_ASSIGNMENT_ISSUE"}, None)
        self.assertFalse(ctx["is_correct"])
        self.assertTrue(ctx["warnings"])


class TestLiveRequests(unittest.TestCase):
    """POST /api/errors/explain behaviour: one LLM attempt, circuit breaker, never an error."""

    def setUp(self):
        ExplanationService._memo = {}
        ExplanationService._llm_blocked_until = 0.0
        self.no_cache = mock.patch.object(ExplanationService, "lookup_cache", return_value=None)
        self.configured = mock.patch.object(xs, "llm_status", return_value=("gemini", "m", True))
        self.no_cache.start()
        self.configured.start()

    def tearDown(self):
        self.no_cache.stop()
        self.configured.stop()
        ExplanationService._llm_blocked_until = 0.0

    def body(self, **kw):
        b = {"question_id": 1, "chosen_option": "Int", "code": CODE, "is_correct": False,
             "reason_group": "VARIABLE_ASSIGNMENT_ISSUE", "prediction_confidence": 0.98}
        b.update(kw)
        return b

    def test_live_makes_one_attempt_on_invalid_json(self):
        with mock.patch.object(xs, "call_llm", return_value=("not json", "mock")) as m:
            res = ExplanationService.explain(self.body())
        self.assertEqual(m.call_count, 1)
        self.assertEqual(res["source"], "template")
        self.assertTrue(res["success"])

    def test_rate_limit_opens_circuit_breaker(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMRateLimited("429")) as m:
            first = ExplanationService.explain(self.body())
            second = ExplanationService.explain(self.body(chosen_option="integer", code="integer age = 25;"))
        self.assertEqual(m.call_count, 1)  # the second request skipped the LLM
        self.assertEqual((first["source"], second["source"]), ("template", "template"))
        self.assertIn("circuit breaker", second["llm_error"])
        self.assertTrue(ExplanationService.circuit_open())

    def test_unavailable_opens_circuit_breaker(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMUnavailable("503")):
            ExplanationService.explain(self.body())
        self.assertTrue(ExplanationService.circuit_open())

    def test_timeout_does_not_open_circuit_breaker(self):
        with mock.patch.object(xs, "call_llm", side_effect=xs.LLMTimeout("slow")):
            ExplanationService.explain(self.body())
        self.assertFalse(ExplanationService.circuit_open())

    def test_unexpected_exception_still_returns_template(self):
        with mock.patch.object(xs, "call_llm", side_effect=KeyError("boom")):
            res = ExplanationService.explain(self.body())
        self.assertTrue(res["success"])
        self.assertEqual(res["source"], "template")

    def test_context_failure_still_returns_template(self):
        with mock.patch.object(xs, "call_llm", side_effect=AssertionError("LLM must not be needed")),                 mock.patch.object(ExplanationService, "run_c2", side_effect=RuntimeError("models missing")),                 mock.patch.object(xs, "EXPLANATION_USE_LLM", False):
            res = ExplanationService.explain(self.body(reason_group=None, prediction_confidence=None))
        self.assertTrue(res["success"])
        self.assertEqual(res["source"], "template")
        self.assertIsNone(res["c2_reason_group"])

    def test_llm_disabled_uses_template(self):
        with mock.patch.object(xs, "EXPLANATION_USE_LLM", False),                 mock.patch.object(xs, "call_llm", side_effect=AssertionError("LLM must not be called")):
            res = ExplanationService.explain(self.body())
        self.assertEqual(res["source"], "template")


class TestTemplates(unittest.TestCase):
    def test_every_group_has_sinhala_and_singlish(self):
        for rg in xs.REASON_GROUPS:
            if rg == "CORRECT_NO_ERROR":
                continue
            expl = ExplanationService.template_explanation(make_ctx(reason_group=rg, conf=0.9))
            for part in xs.PARTS:
                self.assertTrue(xs.SINHALA_RE.search(expl[f"{part}_si"]), f"{rg} {part}_si")
                self.assertFalse(xs.SINHALA_RE.search(expl[f"{part}_singlish"]), f"{rg} {part}_singlish")
                self.assertTrue(expl[f"{part}_en"])

    def test_correct_answer_template(self):
        expl = ExplanationService.template_explanation(make_ctx(option="int", is_correct=True))
        self.assertIn("int", expl["summary_si"])
        self.assertIsNone(expl["where"])

    def test_text_question_template(self):
        # Q8 (Operators): "What is the output of System.out.println(7 % 3);?" -> correct "1"
        ctx = ExplanationService.build_context(8, "2", "", False, None, None)
        self.assertIsNone(ctx["c2_reason_group"])
        expl = ExplanationService.template_explanation(ctx)
        self.assertIn("'1'", expl["summary_singlish"])
        self.assertTrue(xs.SINHALA_RE.search(expl["why_si"]))


class TestVerificationPolicy(unittest.TestCase):
    disagree = {"llm_agrees_with_label": False, "llm_suggested_reason_group": "LOOP_CONTROL_FLOW_ISSUE"}

    def test_low_confidence_and_disagreement_uses_llm_label(self):
        self.assertEqual(choose_final_label("LOOP_CONDITION_ISSUE", 0.42, False, self.disagree),
                         ("LOOP_CONTROL_FLOW_ISSUE", "llm_verified"))

    def test_high_confidence_keeps_model3(self):
        self.assertEqual(choose_final_label("LOOP_CONDITION_ISSUE", 0.8, False, self.disagree),
                         ("LOOP_CONDITION_ISSUE", "model3"))

    def test_agreement_keeps_model3(self):
        agree = {"llm_agrees_with_label": True, "llm_suggested_reason_group": "LOOP_CONDITION_ISSUE"}
        self.assertEqual(choose_final_label("LOOP_CONDITION_ISSUE", 0.3, False, agree),
                         ("LOOP_CONDITION_ISSUE", "model3"))

    def test_correct_answer_uses_answer_key(self):
        self.assertEqual(choose_final_label("CORRECT_NO_ERROR", 0.3, True, self.disagree),
                         ("CORRECT_NO_ERROR", "answer_key"))

    def test_template_has_no_llm_vote(self):
        self.assertEqual(choose_final_label("LOOP_CONDITION_ISSUE", 0.3, False, None),
                         ("LOOP_CONDITION_ISSUE", "model3"))

    def test_policy_applied_in_generate(self):
        reply = json.dumps(valid_payload(llm_agrees_with_label=False,
                                         llm_suggested_reason_group="VARIABLE_CALCULATION_ISSUE"), ensure_ascii=False)
        with mock.patch.object(xs, "call_llm", return_value=(reply, "mock")):
            res = ExplanationService.generate(make_ctx(conf=0.41))
        self.assertEqual(res["final_reason_group"], "VARIABLE_CALCULATION_ISSUE")
        self.assertEqual(res["label_source"], "llm_verified")
        self.assertEqual(res["c2_reason_group"], "VARIABLE_ASSIGNMENT_ISSUE")


if __name__ == "__main__":
    unittest.main()
