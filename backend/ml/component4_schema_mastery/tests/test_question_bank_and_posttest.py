"""
Component 4: Unit & Integration Tests for Question Bank & Post-Test Workflow
============================================================================
Tests:
  - Mock LLM question generation
  - Draft question retrieval, editing, approval, rejection
  - Approved question bank queries
  - Student post-test question delivery (15 blueprint questions, student-safe)
  - Post-test submission, answer quality scoring, ML pipeline execution
"""

import sys
import os
import unittest
import json

# Ensure backend root is on sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from app import create_app
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_llm_question_service import SchemaLLMQuestionService
from services.schema_post_test_service import SchemaPostTestService


class TestComponent4FullWorkflow(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_01_predict_endpoint(self):
        """Test direct ML prediction endpoint."""
        res = self.client.post("/api/schema-mastery/predict", json={
            "concept_name": "Loops",
            "pre_test_score": 0.45,
            "attempt_count": 3,
            "time_taken_seconds": 360,
            "error_type": "LOOP_CONDITION_ERROR",
            "error_pattern_score": 0.40,
            "post_test_correct_count": 9,
            "post_test_nearly_correct_count": 3,
            "post_test_wrong_count": 2,
            "post_test_clearly_wrong_count": 1,
            "post_test_score": 0.70,
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("mastery_probability", data)
        self.assertIn("mastery_level", data)
        self.assertIn("next_action", data)
        self.assertIn(data["next_action"], ["DONE", "LEARN_AGAIN"])

    def test_02_llm_draft_generation(self):
        """Test teacher LLM draft question generation."""
        res = self.client.post("/api/schema-mastery/questions/generate", json={
            "concept_name": "Loops",
            "question_type": "Code Output Prediction",
            "difficulty": "Medium",
            "target_error_type": "LOOP_CONDITION_ERROR",
            "count": 3,
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertEqual(data["count"], 3)
        self.assertEqual(data["questions"][0]["status"], "PENDING")
        self.assertIn("option_a_quality", data["questions"][0])

    def test_03_pending_questions_and_approval(self):
        """Test fetching pending questions and approving a draft question."""
        res_pen = self.client.get("/api/schema-mastery/questions/pending?concept=Loops")
        self.assertEqual(res_pen.status_code, 200)
        pending_list = res_pen.get_json()["questions"]
        self.assertTrue(len(pending_list) > 0)

        target_id = pending_list[0]["id"]

        # Edit draft
        res_edit = self.client.put(f"/api/schema-mastery/questions/{target_id}", json={
            "difficulty": "Hard",
            "explanation": "Updated explanation by teacher reviewer.",
        })
        self.assertEqual(res_edit.status_code, 200)

        # Approve draft
        res_app = self.client.post(f"/api/schema-mastery/questions/{target_id}/approve", json={
            "approved_by": "Senior Teacher",
        })
        self.assertEqual(res_app.status_code, 200)
        approved_q = res_app.get_json()["question"]
        self.assertEqual(approved_q["active"], True)
        self.assertEqual(approved_q["approved_by"], "Senior Teacher")

    def test_04_post_test_question_delivery(self):
        """Test student post-test question generation (blueprint adherence, student-safe)."""
        res = self.client.get("/api/schema-mastery/post-test/questions?student_id=STU_TEST_01&concept=Loops&error_type=LOOP_CONDITION_ERROR")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        questions = data["questions"]
        self.assertEqual(len(questions), 15)

        # Ensure answers are completely stripped
        for q in questions:
            self.assertNotIn("correct_option", q)
            self.assertNotIn("option_a_quality", q)
            self.assertNotIn("explanation", q)
            self.assertIn("options", q)
            self.assertIn("A", q["options"])

    def test_05_post_test_submission_and_ml_prediction(self):
        """Test student submitting post-test and receiving ML mastery outcome."""
        # 1. Fetch questions
        res_q = self.client.get("/api/schema-mastery/post-test/questions?student_id=STU_TEST_01&concept=Loops")
        q_list = res_q.get_json()["questions"]

        # 2. Answer with Option A for all
        answers = [{"question_id": q["question_id"], "selected_option": "A"} for q in q_list]

        # 3. Submit
        res_sub = self.client.post("/api/schema-mastery/post-test/submit", json={
            "student_id": "STU_TEST_01",
            "concept_name": "Loops",
            "pre_test_score": 0.45,
            "attempt_count": 3,
            "time_taken_seconds": 360,
            "error_type": "LOOP_CONDITION_ERROR",
            "error_pattern_score": 0.40,
            "answers": answers,
        })
        self.assertEqual(res_sub.status_code, 200)
        result = res_sub.get_json()
        self.assertTrue(result["success"])
        self.assertIn("mastery_probability", result)
        self.assertIn("mastery_level", result)
        self.assertIn("next_action", result)
        self.assertIn("model_used", result)
        self.assertIn("post_test_correct_count", result)
        self.assertIn("post_test_nearly_correct_count", result)
        self.assertIn("results", result)
        self.assertEqual(len(result["results"]), 15)


if __name__ == "__main__":
    unittest.main()
