"""
Component 4 Comprehensive Test & Verification Script
=====================================================
Tests all Component 4 services, routes, ML pipeline predictions, and storage.
"""

import sys
import os
import json

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from services.schema_llm_question_service import SchemaLLMQuestionService
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_post_test_service import SchemaPostTestService
from services.schema_mastery_service import predict_schema_mastery, load_model

def run_tests():
    print("\n" + "="*70)
    print(" COMPONENT 4: SCHEMA MASTERY TRACKER VERIFICATION SUITE")
    print("="*70 + "\n")

    # 1. Test Model Loading
    print("--> 1. Testing ML Model Pipeline Loading...")
    model = load_model()
    assert model is not None, "Failed to load schema_mastery_pipeline.pkl!"
    print(f"    [PASS] ML Pipeline loaded successfully: {type(model).__name__}")

    # 2. Test Direct ML Prediction
    print("--> 2. Testing Direct ML Prediction (predict_schema_mastery)...")
    test_input = {
        "concept_name": "Loops",
        "pre_test_score": 0.45,
        "attempt_count": 1,
        "time_taken_seconds": 180.0,
        "error_type": "LOOP_CONDITION_ERROR",
        "error_pattern_score": 0.40,
        "post_test_correct_count": 12,
        "post_test_nearly_correct_count": 2,
        "post_test_wrong_count": 1,
        "post_test_clearly_wrong_count": 0,
        "post_test_score": 0.8667,
    }
    pred = predict_schema_mastery(test_input)
    print(f"    Prediction result: {json.dumps(pred, indent=2)}")
    assert "mastery_probability" in pred, "Missing mastery_probability"
    assert pred["mastery_level"] in ("Strong Understanding", "Good Progress", "Needs More Practice", "Learn Again")
    assert pred["next_action"] in ("DONE", "LEARN_AGAIN")
    assert pred["model_used"] == "schema_mastery_pipeline"
    print("    [PASS] Direct ML Prediction verified.")

    # 3. Test Draft Question Generation & Quality Labels
    print("--> 3. Testing Draft Question Generation & 4-Tier Answer Qualities...")
    drafts = SchemaLLMQuestionService.generate_draft_questions(
        concept_name="Loops",
        count=3,
    )
    assert len(drafts) >= 3, f"Expected at least 3 drafts, got {len(drafts)}"
    sample = drafts[0]
    print(f"    Generated Draft ID: {sample['id']} ({sample['question_id']})")
    assert sample["status"] == "PENDING", f"Draft status should be PENDING, got {sample['status']}"
    assert "option_a" in sample and "option_b" in sample and "option_c" in sample and "option_d" in sample
    assert sample["correct_option"] in ("A", "B", "C", "D")
    qualities = [sample["option_a_quality"], sample["option_b_quality"], sample["option_c_quality"], sample["option_d_quality"]]
    assert "Correct" in qualities, "Missing Correct option quality"
    assert "Nearly Correct" in qualities, "Missing Nearly Correct option quality"
    print("    [PASS] Draft generation & 4-tier answer validation passed.")

    # 4. Test Question Approval / Reject / Edit Workflow
    print("--> 4. Testing Teacher Review (Edit / Approve / Reject)...")
    gen_id = sample["id"]
    
    # Edit
    updated = SchemaQuestionBankService.update_generated_question(gen_id, {"question_text": "Edited Teacher Text"})
    assert updated["question_text"] == "Edited Teacher Text", "Edit failed"
    print("    [PASS] Teacher question edit verified.")

    # Approve
    approved_res = SchemaQuestionBankService.approve_question(gen_id, approved_by="TeacherTest")
    assert approved_res is not None, "Approve returned None"
    assert approved_res["active"] is True, "Approved question should be active"
    print("    [PASS] Teacher question approval verified.")

    # Reject another draft
    if len(drafts) > 1:
        reject_id = drafts[1]["id"]
        rejected_res = SchemaQuestionBankService.reject_question(reject_id, reason="Testing rejection")
        assert rejected_res["status"] == "REJECTED"
        print("    [PASS] Teacher question rejection verified.")

    # 5. Test 15-Question Post-Test Selection & Student-Safe Sanitization
    print("--> 5. Testing Student Post-Test Blueprint Selection...")
    posttest = SchemaPostTestService.select_post_test_questions(
        student_id="STU_TEST_001",
        concept="Loops",
        error_type="LOOP_CONDITION_ERROR",
    )
    assert posttest["success"] is True
    assert posttest["total_questions"] == 15, f"Expected 15 questions, got {posttest['total_questions']}"
    for q in posttest["questions"]:
        assert "correct_option" not in q, f"SECURITY LEAK: correct_option exposed in question {q['question_id']}!"
        assert "option_a_quality" not in q, f"SECURITY LEAK: option_a_quality exposed in question {q['question_id']}!"
        assert "explanation" not in q, f"SECURITY LEAK: explanation exposed before submit in question {q['question_id']}!"
        assert "options" in q and len(q["options"]) == 4
    print("    [PASS] 15 student-safe questions selected without answer leaks.")

    # 6. Test Student Post-Test Submission, Grading & ML Integration
    print("--> 6. Testing Student Post-Test Submission & Grading...")
    submission_answers = []
    for q in posttest["questions"]:
        submission_answers.append({
            "question_id": q["question_id"],
            "selected_option": "A",
        })

    sub_payload = {
        "student_id": "STU_TEST_001",
        "concept_name": "Loops",
        "pre_test_score": 0.45,
        "attempt_count": 1,
        "time_taken_seconds": 150.0,
        "error_type": "LOOP_CONDITION_ERROR",
        "error_pattern_score": 0.40,
        "answers": submission_answers,
    }
    sub_res = SchemaPostTestService.grade_and_predict(sub_payload)
    print(f"    Grade & Predict result:")
    print(f"      - Total Questions: {sub_res['total']}")
    print(f"      - Correct (+1.0): {sub_res['post_test_correct_count']}")
    print(f"      - Nearly Correct (+0.5): {sub_res['post_test_nearly_correct_count']}")
    print(f"      - Wrong (0.0): {sub_res['post_test_wrong_count']}")
    print(f"      - Clearly Wrong (0.0): {sub_res['post_test_clearly_wrong_count']}")
    print(f"      - Post-Test Score: {sub_res['post_test_score']}")
    print(f"      - Mastery Probability: {sub_res['mastery_probability']}")
    print(f"      - Mastery Level: {sub_res['mastery_level']}")
    print(f"      - Next Action: {sub_res['next_action']}")
    print(f"      - Model Used: {sub_res['model_used']}")
    assert sub_res["success"] is True
    assert sub_res["total"] == 15
    print("    [PASS] Post-test grading & ML pipeline submission verified.")

    # 7. Test Flask HTTP Endpoints via Test Client
    print("--> 7. Testing All Flask API Endpoints (/api/schema-mastery/*)...")
    app = create_app()
    client = app.test_client()

    # GET health
    r = client.get("/api/health")
    assert r.status_code == 200, f"Health check failed: {r.status_code}"

    # POST questions/generate
    r = client.post("/api/schema-mastery/questions/generate", json={"concept_name": "Variables", "count": 2})
    assert r.status_code == 200, f"Generate failed: {r.data}"

    # GET questions/pending
    r = client.get("/api/schema-mastery/questions/pending")
    assert r.status_code == 200, f"Pending failed: {r.data}"
    pendings = r.get_json().get("questions", [])

    # GET question-bank
    r = client.get("/api/schema-mastery/question-bank")
    assert r.status_code == 200, f"Bank failed: {r.data}"

    # GET post-test/questions
    r = client.get("/api/schema-mastery/post-test/questions?student_id=S001&concept=Loops&error_type=LOOP_CONDITION_ERROR")
    assert r.status_code == 200, f"Post-test get failed: {r.data}"
    pt_qs = r.get_json().get("questions", [])
    assert len(pt_qs) == 15

    # POST post-test/submit
    submit_body = {
        "student_id": "S001",
        "concept_name": "Loops",
        "pre_test_score": 0.5,
        "attempt_count": 1,
        "time_taken_seconds": 120,
        "error_type": "LOOP_CONDITION_ERROR",
        "error_pattern_score": 0.5,
        "answers": [{"question_id": q["question_id"], "selected_option": "A"} for q in pt_qs],
    }
    r = client.post("/api/schema-mastery/post-test/submit", json=submit_body)
    assert r.status_code == 200, f"Submit failed: {r.data}"

    # POST predict
    r = client.post("/api/schema-mastery/predict", json=test_input)
    assert r.status_code == 200, f"Predict failed: {r.data}"

    print("    [PASS] All Flask HTTP endpoints tested successfully.")

    print("\n" + "="*70)
    print(" ALL COMPONENT 4 TESTS PASSED (100% SUCCESS)")
    print("="*70 + "\n")

if __name__ == "__main__":
    run_tests()
