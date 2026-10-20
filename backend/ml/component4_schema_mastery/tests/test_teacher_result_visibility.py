"""Teacher roster must reflect durable post-test results, including cache hits."""
import os
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..")))

from services.mastery_service import MasteryService
from services.schema_post_test_result_service import SchemaPostTestResultService
from services.schema_post_test_service import SchemaPostTestService


class TestTeacherResultVisibility(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory(dir=os.path.dirname(__file__), prefix="result-test-")
        self.addCleanup(directory.cleanup)
        patcher = patch("services.schema_post_test_result_service.RESULTS_FILE", os.path.join(directory.name, "results.json"))
        patcher.start()
        self.addCleanup(patcher.stop)

    def save_result(self, **fields):
        return SchemaPostTestResultService.save_local_result({
            "student_id": "student-1", "session_id": "post-1", "concept_name": "Arrays",
            "post_test_score": 0.7, "mastery_level": "Good Progress",
            "next_action": "DONE", "created_at": "2026-10-20T10:00:00Z", **fields,
        })

    def test_registered_student_gets_latest_result_without_losing_profile(self):
        self.save_result()
        self.save_result(session_id="older", post_test_score=0.2, mastery_level="Learn Again", created_at="2026-10-19")
        roster = MasteryService._students_with_latest_results([
            {"studentId": "student-1", "studentName": "Real Student", "email": "learner@example.com"}])
        self.assertEqual(len(roster), 1)
        self.assertEqual(roster[0]["studentName"], "Real Student")
        self.assertEqual(roster[0]["masteryLevel"], "Good Progress")
        self.assertEqual(roster[0]["postTestScore"], 0.7)

    def test_cached_roster_immediately_observes_new_saved_submission(self):
        import time
        with patch("services.mastery_service._students_cache", {"data": [{"studentId": "student-1"}], "timestamp": time.time()}):
            self.assertNotIn("postTestCompleted", MasteryService.get_all_students()[0])
            self.save_result()
            self.assertTrue(MasteryService.get_all_students()[0]["postTestCompleted"])

    def test_submit_persists_same_result_for_teacher_and_student(self):
        session = {"component_1": {"pre_test_score": 0.2},
                   "component_2": {"error_type": "ARRAY_ERROR", "error_pattern_score": 0.6}}
        question = {"question_id": "array-1", "concept_name": "Arrays", "option_a": "Answer",
                    "option_a_quality": "Correct", "correct_option": "A"}
        with patch.object(SchemaPostTestService, "_SESSION_TARGET_CACHE", {}), \
             patch.object(SchemaPostTestService, "_SESSION_SHUFFLE_CACHE", {}), \
             patch("services.schema_post_test_service.SchemaSessionService.get_current_session", return_value=session), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.get_approved_question_bank", return_value=[question]), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.save_mastery_session"), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.save_question_attempts"), \
             patch("services.schema_post_test_service.SchemaQuestionBankService.increment_exposure_counts"), \
             patch("services.schema_post_test_service.SchemaSessionService.save_component_4_data"), \
             patch("services.user_storage_service.UserStorageService.get_user", return_value={"name": "Real Student"}), \
             patch.object(SchemaPostTestResultService, "save_firestore_best_effort", return_value="local_saved_firestore_failed"), \
             patch("services.schema_post_test_service.predict_schema_mastery", return_value={
                 "mastery_probability": 0.8, "mastery_level": "Good Progress", "next_action": "DONE", "model_used": "test"}):
            submitted = SchemaPostTestService.grade_and_predict({"student_id": "student-1", "session_id": "post-1",
                "concept_name": "Arrays", "answers": [{"question_id": "array-1", "selected_option": "A"}]})
        self.assertTrue(submitted["success"])
        student_result = SchemaPostTestResultService.get_latest_for_student("student-1")
        teacher_row = MasteryService._students_with_latest_results([])[0]
        self.assertEqual(student_result["result_id"], submitted["result_id"])
        self.assertEqual(teacher_row["latestResultId"], submitted["result_id"])
        self.assertEqual(teacher_row["masteryLevel"], submitted["mastery_level"])
        self.assertEqual(teacher_row["postTestScore"], submitted["post_test_score"])


if __name__ == "__main__":
    unittest.main()
