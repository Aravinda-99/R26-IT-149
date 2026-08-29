"""
Manual / Automated Test Script for Component 4 Schema Mastery API
=================================================================
Can test against live Flask server (http://127.0.0.1:5000) or using Flask test client.
"""

import sys
import os
import json

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

def run_tests():
    from app import create_app
    app = create_app()
    client = app.test_client()

    test_cases = [
        {
            "description": "High Performance Case (Strong Understanding / DONE)",
            "payload": {
                "concept_name": "Loops",
                "pre_test_score": 0.85,
                "attempt_count": 1,
                "time_taken_seconds": 120,
                "error_type": "LOOP_CONDITION_ERROR",
                "error_pattern_score": 0.90,
                "post_test_correct_count": 9,
                "post_test_nearly_correct_count": 1,
                "post_test_wrong_count": 0,
                "post_test_clearly_wrong_count": 0,
                "post_test_score": 0.92
            }
        },
        {
            "description": "Moderate Performance Case (Good Progress / Needs More Practice)",
            "payload": {
                "concept_name": "Variables",
                "pre_test_score": 0.55,
                "attempt_count": 2,
                "time_taken_seconds": 240,
                "error_type": "TYPE_MISMATCH",
                "error_pattern_score": 0.65,
                "post_test_correct_count": 7,
                "post_test_nearly_correct_count": 1,
                "post_test_wrong_count": 1,
                "post_test_clearly_wrong_count": 1,
                "post_test_score": 0.70
            }
        },
        {
            "description": "Low Performance Case (Learn Again / LEARN_AGAIN)",
            "payload": {
                "concept_name": "Arrays",
                "pre_test_score": 0.15,
                "attempt_count": 5,
                "time_taken_seconds": 520,
                "error_type": "INDEX_ERROR",
                "error_pattern_score": 0.20,
                "post_test_correct_count": 2,
                "post_test_nearly_correct_count": 0,
                "post_test_wrong_count": 5,
                "post_test_clearly_wrong_count": 3,
                "post_test_score": 0.20
            }
        }
    ]

    for tc in test_cases:
        print(f"\n--- {tc['description']} ---")
        response = client.post(
            "/api/schema-mastery/predict",
            data=json.dumps(tc["payload"]),
            content_type="application/json"
        )
        print(f"Status: {response.status_code}")
        print("Response:", json.dumps(response.get_json(), indent=2))

if __name__ == "__main__":
    run_tests()
