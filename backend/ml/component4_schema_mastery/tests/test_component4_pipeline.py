"""
Test Component 4 Schema Mastery Pipeline and API Integration
============================================================
Tests model loading, probability predictions, level mapping, fallback behavior,
and verifies Component 1 and 2 routes remain intact.
"""

import sys
import os
import json
import unittest

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app import create_app
from services.schema_mastery_service import (
    predict_schema_mastery,
    probability_to_level,
    level_to_action,
    normalize_score,
    fallback_predict
)


class TestSchemaMasteryPipeline(unittest.TestCase):

    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()

    def test_probability_to_level_and_action(self):
        # >= 0.85 -> Strong Understanding -> DONE
        self.assertEqual(probability_to_level(0.92), "Strong Understanding")
        self.assertEqual(level_to_action("Strong Understanding"), "DONE")

        self.assertEqual(probability_to_level(0.85), "Strong Understanding")
        self.assertEqual(level_to_action("Strong Understanding"), "DONE")

        # >= 0.70 -> Good Progress -> DONE
        self.assertEqual(probability_to_level(0.84), "Good Progress")
        self.assertEqual(level_to_action("Good Progress"), "DONE")

        self.assertEqual(probability_to_level(0.70), "Good Progress")
        self.assertEqual(level_to_action("Good Progress"), "DONE")

        # >= 0.50 -> Needs More Practice -> LEARN_AGAIN
        self.assertEqual(probability_to_level(0.69), "Needs More Practice")
        self.assertEqual(level_to_action("Needs More Practice"), "LEARN_AGAIN")

        self.assertEqual(probability_to_level(0.50), "Needs More Practice")
        self.assertEqual(level_to_action("Needs More Practice"), "LEARN_AGAIN")

        # < 0.50 -> Learn Again -> LEARN_AGAIN
        self.assertEqual(probability_to_level(0.49), "Learn Again")
        self.assertEqual(level_to_action("Learn Again"), "LEARN_AGAIN")

        self.assertEqual(probability_to_level(0.12), "Learn Again")
        self.assertEqual(level_to_action("Learn Again"), "LEARN_AGAIN")

    def test_score_normalization(self):
        self.assertEqual(normalize_score(0.75), 0.75)
        self.assertEqual(normalize_score(75), 0.75)
        self.assertEqual(normalize_score("80%"), 0.80)
        self.assertEqual(normalize_score(1.5), 0.015)
        self.assertEqual(normalize_score(-0.2), 0.0)

    def test_predict_schema_mastery_high_performing(self):
        payload = {
            "concept_name": "Loops",
            "pre_test_score": 0.85,
            "attempt_count": 1,
            "time_taken_seconds": 150,
            "error_type": "LOOP_CONDITION_ERROR",
            "error_pattern_score": 0.90,
            "post_test_correct_count": 9,
            "post_test_nearly_correct_count": 1,
            "post_test_wrong_count": 0,
            "post_test_clearly_wrong_count": 0,
            "post_test_score": 0.90
        }
        res = predict_schema_mastery(payload)
        self.assertIn("mastery_probability", res)
        self.assertIn("mastery_level", res)
        self.assertIn("next_action", res)
        self.assertIn("model_used", res)
        self.assertGreaterEqual(res["mastery_probability"], 0.70)
        self.assertEqual(res["next_action"], "DONE")

    def test_predict_schema_mastery_low_performing(self):
        payload = {
            "concept_name": "Loops",
            "pre_test_score": 0.15,
            "attempt_count": 5,
            "time_taken_seconds": 550,
            "error_type": "INFINITE_LOOP",
            "error_pattern_score": 0.20,
            "post_test_correct_count": 2,
            "post_test_nearly_correct_count": 0,
            "post_test_wrong_count": 5,
            "post_test_clearly_wrong_count": 3,
            "post_test_score": 0.20
        }
        res = predict_schema_mastery(payload)
        self.assertIn("mastery_probability", res)
        self.assertIn("mastery_level", res)
        self.assertIn("next_action", res)
        self.assertIn("model_used", res)
        self.assertLess(res["mastery_probability"], 0.70)
        self.assertEqual(res["next_action"], "LEARN_AGAIN")

    def test_api_schema_mastery_endpoint(self):
        payload = {
            "concept_name": "Variables",
            "pre_test_score": 0.75,
            "attempt_count": 2,
            "time_taken_seconds": 210,
            "error_type": "TYPE_MISMATCH",
            "error_pattern_score": 0.80,
            "post_test_correct_count": 8,
            "post_test_nearly_correct_count": 1,
            "post_test_wrong_count": 1,
            "post_test_clearly_wrong_count": 0,
            "post_test_score": 0.85
        }
        response = self.client.post(
            "/api/schema-mastery/predict",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("mastery_probability", data)
        self.assertIn("mastery_level", data)
        self.assertIn("next_action", data)
        self.assertIn("model_used", data)
        self.assertEqual(data["model_used"], "schema_mastery_pipeline")

    def test_fallback_predict(self):
        data = {
            "post_test_score": 0.88,
            "error_pattern_score": 0.80,
            "pre_test_score": 0.70
        }
        fallback = fallback_predict(data)
        self.assertEqual(fallback["model_used"], "rule_based_fallback")
        self.assertGreaterEqual(fallback["mastery_probability"], 0.70)
        self.assertIn(fallback["mastery_level"], ["Good Progress", "Strong Understanding"])
        self.assertEqual(fallback["next_action"], "DONE")

    def test_component_1_adaptive_predict(self):
        payload = {
            "avg_attempts": 1.2,
            "avg_time_sec": 18.5,
            "engagement_score": 0.98,
            "current_difficulty": "beginner",
            "topic_scores": {
                "variables": 0.9,
                "operators": 0.5,
                "loops": 0.8,
                "arrays": 0.7,
                "methods": 0.6
            }
        }
        response = self.client.post(
            "/api/adaptive/predict",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn("action", data)
        self.assertIn("next_difficulty", data)
        self.assertIn("next_topic", data)

    def test_component_2_error_analyze(self):
        payload = {
            "code": "int x = 10;",
            "student_id": "test_student"
        }
        response = self.client.post(
            "/api/errors/analyze",
            data=json.dumps(payload),
            content_type="application/json"
        )
        self.assertEqual(response.status_code, 200)


if __name__ == "__main__":
    unittest.main()
