"""Regression coverage for the misconception -> lesson -> post-test boundary."""
import copy
import os
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from services.schema_session_service import SchemaSessionService, assessment_target_for_session
from services.schema_post_test_service import SchemaPostTestService


def learning_session():
    return {
        "component_1": {"completed": True, "concept_name": "Operators", "weak_concept": "Operators",
                        "pre_test_score": 0.2, "attempt_count": 1, "time_taken_seconds": 60,
                        "completed_at": "attempt-1"},
        "component_2": {"completed": True, "error_type": "ARRAY_BOUNDARY_INDEX_ISSUE",
                        "error_pattern_score": 0.64},
        "component_3": {"completed": True}, "component_4": {},
    }


def question(qid, concept="Arrays", error="ARRAY_BOUNDARY_INDEX_ISSUE"):
    return {"question_id": qid, "concept_name": concept, "target_error_type": error,
            "question_type": "Basic Understanding", "question_text": "Choose an answer",
            "option_a": "a", "option_b": "b", "option_c": "c", "option_d": "d",
            "correct_option": "A", "option_a_quality": "Correct"}


class TestLearningTarget(unittest.TestCase):
    def setUp(self):
        self.session = learning_session()
        self.session_patch = patch.object(SchemaSessionService, "get_current_session", return_value=self.session)
        self.session_patch.start()
        self.addCleanup(self.session_patch.stop)
        self.addCleanup(SchemaPostTestService._SESSION_SHUFFLE_CACHE.clear)
        self.addCleanup(SchemaPostTestService._SESSION_TARGET_CACHE.clear)

    def select(self, questions):
        with patch("services.schema_post_test_service.SchemaQuestionBankService.get_approved_question_bank",
                   return_value=(questions, "test")), patch(
                   "services.schema_post_test_service.SchemaQuestionBankService.get_student_used_questions",
                   return_value=(set(), set())):
            return SchemaPostTestService.select_post_test_questions("student_001", "Operators", "OPERATOR_ERROR")

    def test_c2_array_target_overrides_c1_operators(self):
        self.assertEqual(assessment_target_for_session(self.session)["concept_name"], "Arrays")
        self.assertEqual(self.session["component_1"]["concept_name"], "Operators")

    def test_each_supported_misconception_resolves(self):
        for prefix, concept in [("VARIABLE", "Variables"), ("OPERATOR", "Operators"),
                                ("LOOP", "Loops"), ("ARRAY", "Arrays"), ("METHOD", "Methods")]:
            self.session["component_2"]["error_type"] = prefix + "_ERROR"
            self.assertEqual(assessment_target_for_session(self.session)["concept_name"], concept)

    def test_questions_stay_in_target_concept_even_with_matching_other_error(self):
        result = self.select([question("array-1"), question("operator-1", "Operators")])
        self.assertTrue(result["success"])
        self.assertEqual(result["concept_name"], "Arrays")
        self.assertEqual([q["question_id"] for q in result["questions"]], ["array-1"])
        self.assertNotIn("correct_option", result["questions"][0])

    def test_missing_concept_never_falls_back_to_other_concepts(self):
        result = self.select([question("operator-1", "Operators")])
        self.assertFalse(result["success"])
        self.assertEqual(result["questions"], [])
        self.assertIn("Arrays", result["error"])

    def test_full_bank_delivers_fifteen_unique_array_questions(self):
        result = self.select([question(f"array-{i}") for i in range(20)])
        self.assertEqual(result["total_questions"], 15)
        self.assertEqual(len({q["question_id"] for q in result["questions"]}), 15)

    def test_summary_target_survives_individual_explanation_update(self):
        session_store = {"student_001": self.session}
        def write_sessions(value):
            session_store.update(copy.deepcopy(value))
        with patch("services.schema_session_service._read_sessions", side_effect=lambda: copy.deepcopy(session_store)), \
             patch("services.schema_session_service._write_sessions", side_effect=write_sessions), \
             patch.object(SchemaSessionService, "_sync_to_firestore_background"):
            SchemaSessionService.save_component_2_data("student_001", {
                "context_scope": "top_misconception", "concept_name": "Arrays",
                "error_type": "ARRAY_BOUNDARY_INDEX_ISSUE", "error_pattern_score": 0.64,
            })
            saved = SchemaSessionService.save_component_2_data("student_001", {
                "error_type": "METHOD_RETURN_ISSUE", "error_pattern_score": 0.9,
            })
        target = assessment_target_for_session(saved)
        self.assertEqual(target["concept_name"], "Arrays")
        self.assertEqual(target["error_type"], "ARRAY_BOUNDARY_INDEX_ISSUE")
        self.assertEqual(target["error_pattern_score"], 0.64)

    def test_old_attempt_summary_is_not_reused(self):
        self.session["assessment_target"] = {"concept_name": "Loops", "pre_test_completed_at": "attempt-0"}
        self.assertEqual(assessment_target_for_session(self.session)["concept_name"], "Arrays")

    def test_wrong_concept_answer_rejected_before_ml(self):
        with patch("services.schema_post_test_service.SchemaQuestionBankService.get_approved_question_bank",
                   return_value=[question("operator-1", "Operators")]), patch(
                   "services.schema_post_test_service.predict_schema_mastery") as predict:
            result = SchemaPostTestService.grade_and_predict({
                "student_id": "student_001", "concept_name": "Operators",
                "answers": [{"question_id": "operator-1", "selected_option": "A"}],
            })
        self.assertFalse(result["success"])
        predict.assert_not_called()

    def test_scoring_uses_issued_array_target_and_shuffled_answers(self):
        bank = [question("array-1")]
        issued = self.select(bank)
        displayed = next(k for k, v in SchemaPostTestService._SESSION_SHUFFLE_CACHE[issued["session_id"]]["array-1"].items() if v == "A")
        with patch("services.schema_post_test_service.SchemaQuestionBankService.get_approved_question_bank", return_value=bank), \
             patch("services.schema_post_test_service.predict_schema_mastery", return_value={"mastery_probability": 0.9, "mastery_level": "Strong Understanding", "next_action": "DONE"}) as predict, \
             patch("services.schema_post_test_service.SchemaQuestionBankService.save_mastery_session"), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.save_question_attempts"), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.increment_exposure_counts"), \
             patch("services.schema_post_test_service.SchemaPostTestResultService.save_local_result", side_effect=lambda record: record), \
             patch("services.schema_post_test_service.SchemaPostTestResultService.save_firestore_best_effort", return_value="test"), \
             patch.object(SchemaSessionService, "save_component_4_data"), \
             patch("services.user_storage_service.UserStorageService.get_user", return_value={}):
            result = SchemaPostTestService.grade_and_predict({
                "student_id": "student_001", "session_id": issued["session_id"],
                "concept_name": "Operators", "error_type": "OPERATOR_ERROR",
                "answers": [{"question_id": "array-1", "selected_option": displayed}],
            })
        self.assertTrue(result["success"])
        self.assertEqual(result["concept_name"], "Arrays")
        features = predict.call_args.args[0]
        self.assertEqual(features["concept_name"], "Arrays")
        self.assertEqual(features["error_type"], "ARRAY_BOUNDARY_INDEX_ISSUE")
        self.assertEqual(features["post_test_correct_count"], 1)


if __name__ == "__main__":
    unittest.main()
