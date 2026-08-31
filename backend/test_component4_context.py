"""
Automated Verification Suite for Component 4 Prerequisites & Learning Session Data Integration
"""

import sys
import os

# Ensure backend root is on path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import app
from services.schema_session_service import SchemaSessionService, calculate_error_pattern_score


def run_tests():
    client = app.test_client()
    test_stu_id = "STU_VERIFY_FLOW_999"

    print("================================================================")
    print("RUNNING COMPONENT 4 PREREQUISITE & SESSION DATA INTEGRATION TESTS")
    print("================================================================")

    # 0. Test calculate_error_pattern_score Priority Hierarchy Unit Logic
    # 0a. Confidence percentage
    s1 = calculate_error_pattern_score({"confidence_score": 85, "reason_group": "ARRAY_BOUNDARY_INDEX_ISSUE"})
    assert s1["error_pattern_score"] == 0.85, f"Expected 0.85, got {s1['error_pattern_score']}"
    assert s1["error_pattern_score_source"] == "component2_confidence"

    # 0b. Dominant error count ratio
    s2 = calculate_error_pattern_score({"dominant_error_count": 3, "total_error_count": 4})
    assert s2["error_pattern_score"] == 0.75, f"Expected 0.75, got {s2['error_pattern_score']}"
    assert s2["error_pattern_score_source"] == "dominant_error_ratio"

    # 0c. Severity label mapping
    s3_high = calculate_error_pattern_score({"severity": "HIGH"})
    assert s3_high["error_pattern_score"] == 0.85
    assert s3_high["error_pattern_score_source"] == "severity_mapping"

    s3_med = calculate_error_pattern_score({"severity": "MEDIUM"})
    assert s3_med["error_pattern_score"] == 0.60
    assert s3_med["error_pattern_score_source"] == "severity_mapping"

    s3_low = calculate_error_pattern_score({"severity": "LOW"})
    assert s3_low["error_pattern_score"] == 0.35
    assert s3_low["error_pattern_score_source"] == "severity_mapping"

    # 0d. Fallback
    s4 = calculate_error_pattern_score({})
    assert s4["error_pattern_score"] == 0.50
    assert s4["error_pattern_score_source"] == "fallback_no_confidence_available"
    print("[PASS] 0. Helper calculate_error_pattern_score unit tests passed (All 4 hierarchy branches)")

    # 1. Reset any existing test session
    reset_res = client.post("/api/schema-mastery/context/reset", json={"student_id": test_stu_id})
    assert reset_res.status_code == 200, f"Reset failed: {reset_res.text}"
    print("[PASS] 1. Reset student test session")

    # 2. Initial State Check (Locked)
    ctx_res = client.get(f"/api/schema-mastery/context/current?student_id={test_stu_id}")
    assert ctx_res.status_code == 200, f"Context get failed: {ctx_res.text}"
    ctx_data = ctx_res.get_json()
    assert ctx_data["ready_for_post_test"] is False, "Should NOT be ready for post-test initially"
    assert ctx_data["component_4"]["unlocked"] is False, "Component 4 should be locked initially"
    assert "concept_name" in ctx_data["missing_fields"], "concept_name should be reported missing"
    assert "error_type" in ctx_data["missing_fields"], "error_type should be reported missing"
    assert "error_pattern_score" in ctx_data["missing_fields"], "error_pattern_score should be reported missing"
    print(f"[PASS] 2. Initial gating state verified (Locked, missing: {ctx_data['missing_fields']})")

    # 3. Save Component 1 Data (Pre-Test Completed)
    c1_payload = {
        "student_id": test_stu_id,
        "student_name": "Test Learner 999",
        "student_email": "test999@codequest.edu",
        "concept_name": "Arrays",
        "weak_concept": "Arrays",
        "pre_test_score": 0.40,
        "attempt_count": 2,
        "time_taken_seconds": 95.0
    }
    c1_res = client.post("/api/schema-mastery/session/component1", json=c1_payload)
    assert c1_res.status_code == 200, f"Component 1 save failed: {c1_res.text}"
    c1_data = c1_res.get_json()
    assert c1_data["current_stage"] == "ERROR_FEEDBACK_READY"
    assert c1_data["session"]["component_1"]["concept_name"] == "Arrays"
    print("[PASS] 3. Component 1 Pre-Test data saved (Target: Arrays, Score: 40%)")

    # 4. Check State After Component 1 (Still Locked for Component 2)
    ctx_res = client.get(f"/api/schema-mastery/context/current?student_id={test_stu_id}")
    ctx_data = ctx_res.get_json()
    assert ctx_data["component_1"]["completed"] is True
    assert ctx_data["component_2"]["completed"] is False
    assert ctx_data["ready_for_post_test"] is False
    print("[PASS] 4. Prerequisite barrier holds after Component 1")

    # 5. Save Component 2 Data (Error Feedback Completed with Error Pattern Score)
    c2_payload = {
        "student_id": test_stu_id,
        "error_type": "ARRAY_BOUNDARY_INDEX_ISSUE",
        "confidence_score": 85,
        "error_reason": "Index out of bounds due to loop terminating at <= length instead of < length"
    }
    c2_res = client.post("/api/schema-mastery/session/component2", json=c2_payload)
    assert c2_res.status_code == 200, f"Component 2 save failed: {c2_res.text}"
    c2_data = c2_res.get_json()
    assert c2_data["current_stage"] == "GAME_LESSON_READY"
    assert c2_data["session"]["component_2"]["error_pattern_score"] == 0.85
    assert c2_data["session"]["component_2"]["error_pattern_score_source"] == "component2_confidence"
    print("[PASS] 5. Component 2 Error Feedback data saved (Error: ARRAY_BOUNDARY_INDEX_ISSUE, Pattern Score: 0.85, Source: component2_confidence)")

    # 6. Check State After Component 2 (Still Locked for Component 3)
    ctx_res = client.get(f"/api/schema-mastery/context/current?student_id={test_stu_id}")
    ctx_data = ctx_res.get_json()
    assert ctx_data["component_1"]["completed"] is True
    assert ctx_data["component_2"]["completed"] is True
    assert ctx_data["component_2"]["error_pattern_score"] == 0.85
    assert ctx_data["component_3"]["completed"] is False
    assert ctx_data["ready_for_post_test"] is False
    print("[PASS] 6. Prerequisite barrier holds after Component 2 (Game lesson pending)")

    # 7. Save Component 3 Data (Game Lesson Completed)
    c3_payload = {
        "student_id": test_stu_id,
        "recommended_game_id": "arrays",
        "recommended_game_name": "Array Index Rescue Game"
    }
    c3_res = client.post("/api/schema-mastery/session/component3", json=c3_payload)
    assert c3_res.status_code == 200, f"Component 3 save failed: {c3_res.text}"
    c3_data = c3_res.get_json()
    assert c3_data["current_stage"] == "UNDERSTANDING_CHECK_READY"
    print("[PASS] 7. Component 3 Game Lesson marked complete")

    # 8. Check State After Component 3 (Unlocked & Ready for Post-Test!)
    ctx_res = client.get(f"/api/schema-mastery/context/current?student_id={test_stu_id}")
    ctx_data = ctx_res.get_json()
    assert ctx_data["ready_for_post_test"] is True
    assert ctx_data["component_4"]["unlocked"] is True
    assert len(ctx_data["missing_fields"]) == 0
    assert ctx_data["component_1"]["concept_name"] == "Arrays"
    assert ctx_data["component_2"]["error_type"] == "ARRAY_BOUNDARY_INDEX_ISSUE"
    assert ctx_data["component_2"]["error_pattern_score"] == 0.85
    print("[PASS] 8. Component 4 Understanding Check unlocked with full multi-component context!")

    # 9. Test Automatic Session Fallback in Post-Test Question Generation
    q_res = client.get(f"/api/schema-mastery/post-test/questions?student_id={test_stu_id}")
    assert q_res.status_code == 200, f"Questions fetch failed: {q_res.text}"
    q_data = q_res.get_json()
    assert q_data["success"] is True
    assert q_data["total_questions"] == 15
    print(f"[PASS] 9. 15 Post-Test questions selected dynamically for concept '{ctx_data['component_1']['concept_name']}'")

    # 10. Test Post-Test Submission & ML Pipeline Prediction
    answers = [{"question_id": q["question_id"], "selected_option": "A"} for q in q_data["questions"]]
    sub_payload = {
        "student_id": test_stu_id,
        "answers": answers
    }
    sub_res = client.post("/api/schema-mastery/post-test/submit", json=sub_payload)
    assert sub_res.status_code == 200, f"Submit failed: {sub_res.text}"
    sub_data = sub_res.get_json()
    assert sub_data["success"] is True
    assert sub_data["concept_name"] == "Arrays"
    assert "mastery_level" in sub_data
    assert "next_action" in sub_data
    assert "mastery_probability" in sub_data
    print(f"[PASS] 10. Post-test evaluated: Mastery Level = {sub_data['mastery_level']}, Action = {sub_data['next_action']}, ML Score = {sub_data['post_test_score']}")

    # 11. Check Final Learning Session State (Completed)
    ctx_res = client.get(f"/api/schema-mastery/context/current?student_id={test_stu_id}")
    ctx_data = ctx_res.get_json()
    assert ctx_data["component_4"]["post_test_completed"] is True
    assert ctx_data["current_stage"] == "MASTERY_EVALUATED"
    print(f"[PASS] 11. Final session state verified: {ctx_data['current_stage']}")

    print("\n================================================================")
    print("ALL 11 VERIFICATION CHECKS PASSED PERFECTLY!")
    print("================================================================")


if __name__ == "__main__":
    run_tests()
