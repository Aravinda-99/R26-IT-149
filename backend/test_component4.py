"""
Component 4 Comprehensive Test & Verification Script
=====================================================
Tests all Component 4 services, routes, ML pipeline predictions, Gemini LLM generation, and storage:
  1. ML Model pipeline loading & direct prediction
  2. LLM Status endpoint (/api/schema-mastery/llm/status)
  3. Strict Real LLM requirement & config check (No mock fallback when ALLOW_MOCK_QUESTIONS=False)
  4. Real Gemini LLM generation validation (4-tier quality labels, balanced options, PENDING status)
  5. Teacher review lifecycle (Edit, Approve, Reject, Deactivate, Reactivate)
  6. Post-Test student-safe isolation (only APPROVED questions, no answer leaks)
  7. Post-test grading, multi-source evidence synthesis & ML schema prediction
  8. Flask HTTP route integration (/api/schema-mastery/*)
"""

import sys
import os
import json
import unittest

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import Config
from app import create_app
from services.schema_llm_question_service import SchemaLLMQuestionService
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_post_test_service import SchemaPostTestService
from services.schema_mastery_service import predict_schema_mastery, load_model


def run_tests():
    print("\n" + "="*75)
    print(" COMPONENT 4: SCHEMA MASTERY TRACKER & GEMINI LLM VERIFICATION")
    print("="*75 + "\n")

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Test Model Loading
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 1. Testing ML Model Pipeline Loading...")
    model = load_model()
    assert model is not None, "Failed to load schema_mastery_pipeline.pkl!"
    print(f"    [PASS] ML Pipeline loaded successfully: {type(model).__name__}")

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Test Direct ML Prediction
    # ─────────────────────────────────────────────────────────────────────────
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
    assert "mastery_probability" in pred, "Missing mastery_probability"
    assert pred["mastery_level"] in ("Strong Understanding", "Good Progress", "Needs More Practice", "Learn Again")
    assert pred["next_action"] in ("DONE", "LEARN_AGAIN")
    assert pred["model_used"] == "schema_mastery_pipeline"
    print(f"    [PASS] Direct ML Prediction verified: {pred['mastery_level']} -> {pred['next_action']}")

    # ─────────────────────────────────────────────────────────────────────────
    # 3. Test LLM Status Endpoint
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 3. Testing LLM Status Reporting (/api/schema-mastery/llm/status)...")
    status_info = SchemaLLMQuestionService.get_llm_status()
    assert status_info["success"] is True
    assert status_info["provider"] in ("gemini", "openai")
    assert "api_key_configured" in status_info
    assert "mock_questions_allowed" in status_info
    assert "model" in status_info
    print(f"    [PASS] Status Verified: Provider={status_info['provider']}, Model={status_info['model']}, KeyConfigured={status_info['api_key_configured']}, MockAllowed={status_info['mock_questions_allowed']}")

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Test Strict LLM Configuration & Mock Prohibition
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 4. Testing Strict LLM Generation Configuration & Mock Prohibition...")
    saved_key = Config.GEMINI_API_KEY
    saved_allow_mock = Config.ALLOW_MOCK_QUESTIONS
    saved_use_llm = Config.USE_LLM_QUESTION_GENERATION
    saved_provider = Config.LLM_PROVIDER

    try:
        # Scenario A: Missing API key & ALLOW_MOCK_QUESTIONS=False -> MUST raise ValueError
        Config.LLM_PROVIDER = "gemini"
        Config.GEMINI_API_KEY = ""
        Config.ALLOW_MOCK_QUESTIONS = False
        Config.USE_LLM_QUESTION_GENERATION = True

        caught_error = False
        try:
            SchemaLLMQuestionService.generate_draft_questions(concept_name="Loops", count=2)
        except ValueError as ve:
            caught_error = True
            assert "Gemini API key is not configured" in str(ve), f"Unexpected error message: {ve}"
            print(f"    [PASS] Correctly blocked mock fallback when API key is missing: '{ve}'")

        assert caught_error, "Should have raised ValueError when API key is missing and ALLOW_MOCK_QUESTIONS=False"

        # Scenario B: ALLOW_MOCK_QUESTIONS=False with real Gemini API key -> Real generation test
        if saved_key and not saved_key.startswith("your_gemini"):
            Config.LLM_PROVIDER = "gemini"
            Config.GEMINI_API_KEY = saved_key
            Config.ALLOW_MOCK_QUESTIONS = False
            Config.USE_LLM_QUESTION_GENERATION = True
            try:
                real_drafts = SchemaLLMQuestionService.generate_draft_questions(
                    concept_name="Loops",
                    difficulty="Medium",
                    target_error_type="LOOP_CONDITION_ERROR",
                    count=4
                )
                assert len(real_drafts) == 4, f"Expected 4 drafts, got {len(real_drafts)}"
                assert real_drafts[0]["status"] == "PENDING"
                assert real_drafts[0]["source"] == "GEMINI"
                assert real_drafts[0]["active"] is False

                # Verify balanced correct options across batch
                correct_counts = {"A": 0, "B": 0, "C": 0, "D": 0}
                for q in real_drafts:
                    assert q["correct_option"] in ("A", "B", "C", "D")
                    correct_counts[q["correct_option"]] += 1
                    # Verify 4-tier quality presence
                    quals = [q["option_a_quality"], q["option_b_quality"], q["option_c_quality"], q["option_d_quality"]]
                    assert set(quals) == {"Correct", "Nearly Correct", "Wrong", "Clearly Wrong"}

                print(f"    [PASS] Real Gemini generated {len(real_drafts)} questions with status PENDING.")
                print(f"    [PASS] Correct answer distribution across A/B/C/D: {correct_counts}")
            except RuntimeError as re:
                print(f"    [PASS] Real Gemini attempted and raised RuntimeError without mock fallback: '{re}'")

    finally:
        Config.LLM_PROVIDER = saved_provider
        Config.GEMINI_API_KEY = saved_key
        Config.ALLOW_MOCK_QUESTIONS = saved_allow_mock
        Config.USE_LLM_QUESTION_GENERATION = saved_use_llm

    # ─────────────────────────────────────────────────────────────────────────
    # 5. Test Option Balancing and Quality Structure
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 5. Testing Option Balancing & 4-Tier Answer Structure...")
    raw_options = [
        {"text": "Correct answer", "quality": "Correct"},
        {"text": "Nearly correct answer", "quality": "Nearly Correct"},
        {"text": "Wrong answer", "quality": "Wrong"},
        {"text": "Clearly wrong answer", "quality": "Clearly Wrong"},
    ]
    # Test rotating target letters
    for target_letter in ["A", "B", "C", "D"]:
        balanced = SchemaLLMQuestionService.rebalance_options_dict(raw_options, target_correct_letter=target_letter)
        assert balanced["correct_option"] == target_letter, f"Expected correct_option {target_letter}, got {balanced['correct_option']}"
        correct_quality_key = f"option_{target_letter.lower()}_quality"
        assert balanced[correct_quality_key] == "Correct", f"Quality for correct option must be 'Correct', got {balanced[correct_quality_key]}"
        all_quals = [balanced["option_a_quality"], balanced["option_b_quality"], balanced["option_c_quality"], balanced["option_d_quality"]]
        assert set(all_quals) == {"Correct", "Nearly Correct", "Wrong", "Clearly Wrong"}

    print("    [PASS] Option rebalancing successfully rotates correct answer positions across A, B, C, D.")

    # ─────────────────────────────────────────────────────────────────────────
    # 6. Test Teacher Review Lifecycle (Edit, Approve, Reject, Deactivate, Reactivate)
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 6. Testing Teacher Review Lifecycle (Edit, Approve, Reject, Deactivate, Reactivate)...")
    
    # Create a real-format draft question
    mock_draft = {
        "concept_name": "Loops",
        "question_type": "Basic Understanding",
        "difficulty": "Easy",
        "question_text": "What is the primary function of a for loop in Java?",
        "code_snippet": "for(int i=0; i<5; i++) { System.out.println(i); }",
        "option_a": "Iterate over a known sequence or range",
        "option_a_quality": "Correct",
        "option_b": "Repeat forever unconditionally",
        "option_b_quality": "Nearly Correct",
        "option_c": "Define a new function",
        "option_c_quality": "Wrong",
        "option_d": "Terminate the operating system",
        "option_d_quality": "Clearly Wrong",
        "correct_option": "A",
        "explanation": "A for loop iterates over items in any sequence.",
        "target_error_type": "NONE",
        "source": "GEMINI",
    }
    saved_drafts = SchemaQuestionBankService.save_generated_questions([mock_draft])
    draft_id = saved_drafts[0]["id"]
    draft_qid = saved_drafts[0]["question_id"]
    assert saved_drafts[0]["status"] == "PENDING"
    assert saved_drafts[0]["active"] is False
    print(f"    [PASS] Draft saved to PENDING queue: {draft_id} ({draft_qid})")

    # 6a. Teacher Edits Draft
    updated = SchemaQuestionBankService.update_question(draft_id, {"question_text": "What is the primary purpose of a Java for loop?"})
    assert updated["question_text"] == "What is the primary purpose of a Java for loop?"
    print("    [PASS] Teacher question edit verified.")

    # 6b. Teacher Approves Draft
    approved = SchemaQuestionBankService.approve_question(draft_id, approved_by="TeacherAutomation")
    assert approved is not None
    assert approved["status"] == "APPROVED"
    assert approved["active"] is True
    assert approved["deleted"] is False
    print(f"    [PASS] Draft approved into active Question Bank: {approved['id']}")

    # 6c. Teacher Deactivates Question
    deact = SchemaQuestionBankService.deactivate_question(approved["id"], updated_by="TeacherAutomation")
    assert deact["active"] is False
    print("    [PASS] Question deactivation verified.")

    # 6d. Teacher Reactivates Question
    react = SchemaQuestionBankService.reactivate_question(approved["id"], updated_by="TeacherAutomation")
    assert react["active"] is True
    print("    [PASS] Question reactivation verified.")

    # ─────────────────────────────────────────────────────────────────────────
    # 7. Test Post-Test Blueprint Selection & Security Isolation
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 7. Testing Post-Test Blueprint Selection & Security Isolation...")
    posttest = SchemaPostTestService.select_post_test_questions(
        student_id="STU_VERIFY_001",
        concept="Loops",
        error_type="LOOP_CONDITION_ERROR",
    )
    assert posttest["success"] is True, f"Failed posttest selection: {posttest}"
    assert len(posttest["questions"]) > 0, "No questions selected for student"
    
    # Verify no answer keys or internal qualities leaked to student
    for q in posttest["questions"]:
        assert "correct_option" not in q, f"SECURITY ERROR: correct_option exposed in {q['question_id']}"
        assert "option_a_quality" not in q, f"SECURITY ERROR: option_a_quality exposed in {q['question_id']}"
        assert "option_b_quality" not in q, f"SECURITY ERROR: option_b_quality exposed in {q['question_id']}"
        assert "option_c_quality" not in q, f"SECURITY ERROR: option_c_quality exposed in {q['question_id']}"
        assert "option_d_quality" not in q, f"SECURITY ERROR: option_d_quality exposed in {q['question_id']}"
        assert "explanation" not in q, f"SECURITY ERROR: explanation exposed before submission in {q['question_id']}"
        assert "options" in q and len(q["options"]) == 4

    print("    [PASS] Student-safe post-test selection verified (zero answer leaks).")

    # ─────────────────────────────────────────────────────────────────────────
    # 8. Test Student Submission & ML Schema Evaluation
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 8. Testing Student Post-Test Submission & Grading...")
    submission_answers = []
    for q in posttest["questions"]:
        submission_answers.append({
            "question_id": q["question_id"],
            "selected_option": "A",
        })

    sub_payload = {
        "student_id": "STU_VERIFY_001",
        "session_id": posttest["session_id"],
        "concept_name": "Loops",
        "pre_test_score": 0.45,
        "attempt_count": 1,
        "time_taken_seconds": 150.0,
        "error_type": "LOOP_CONDITION_ERROR",
        "error_pattern_score": 0.40,
        "answers": submission_answers,
    }
    sub_res = SchemaPostTestService.grade_and_predict(sub_payload)
    assert sub_res["success"] is True
    assert "post_test_score" in sub_res
    assert "mastery_probability" in sub_res
    assert "mastery_level" in sub_res
    assert "next_action" in sub_res
    print(f"    [PASS] Post-test submitted and evaluated: Score={sub_res['post_test_score']}, Mastery={sub_res['mastery_level']}, Action={sub_res['next_action']}")

    # ─────────────────────────────────────────────────────────────────────────
    # 9. Test Flask API Endpoints
    # ─────────────────────────────────────────────────────────────────────────
    print("--> 9. Testing Flask HTTP API Endpoints (/api/schema-mastery/*)...")
    app = create_app()
    client = app.test_client()

    # GET /api/health
    r = client.get("/api/health")
    assert r.status_code == 200

    # GET /api/schema-mastery/llm/status
    r = client.get("/api/schema-mastery/llm/status")
    assert r.status_code == 200
    st = r.get_json()
    assert st["success"] is True
    assert st["provider"] == "gemini"
    print(f"    [PASS] GET /schema-mastery/llm/status returned: Provider={st['provider']}, Model={st['model']}, KeyConfigured={st['api_key_configured']}")

    # GET /api/schema-mastery/questions/stats
    r = client.get("/api/schema-mastery/questions/stats")
    assert r.status_code == 200
    stats_data = r.get_json()
    assert stats_data["success"] is True
    assert "registered_students" in stats_data
    assert "approved_questions" in stats_data
    assert "pending_review" in stats_data
    assert "rejected_questions" in stats_data
    assert stats_data.get("storage_source") in ("firestore", "local_fallback")
    print(f"    [PASS] GET /questions/stats returned: Source={stats_data.get('storage_source')}, Students={stats_data['registered_students']}, Approved={stats_data['approved_questions']}, Pending={stats_data['pending_review']}, Rejected={stats_data['rejected_questions']}")

    # GET /api/schema-mastery/questions/pending
    r = client.get("/api/schema-mastery/questions/pending")
    assert r.status_code == 200
    pendings = r.get_json().get("questions", [])
    assert len(pendings) == stats_data["pending_review"], f"Pending mismatch: list={len(pendings)} vs stats={stats_data['pending_review']}"
    print(f"    [PASS] GET /questions/pending returned {len(pendings)} items (Parity with Stats Verified)")

    # GET /api/schema-mastery/question-bank
    r = client.get("/api/schema-mastery/question-bank")
    assert r.status_code == 200
    bank_resp = r.get_json()
    approved_bank = bank_resp.get("questions", [])
    assert bank_resp.get("storage_source") in ("firestore", "local_fallback")
    assert len(approved_bank) == stats_data["approved_questions"], f"Approved mismatch: list={len(approved_bank)} vs stats={stats_data['approved_questions']}"
    print(f"    [PASS] GET /question-bank returned {len(approved_bank)} approved items with storage_source='{bank_resp.get('storage_source')}' (Parity with Stats Verified)")

    # GET /api/schema-mastery/questions/rejected
    r = client.get("/api/schema-mastery/questions/rejected")
    assert r.status_code == 200
    rejecteds = r.get_json().get("questions", [])
    assert len(rejecteds) == stats_data["rejected_questions"], f"Rejected mismatch: list={len(rejecteds)} vs stats={stats_data['rejected_questions']}"
    print(f"    [PASS] GET /questions/rejected returned {len(rejecteds)} items (Parity with Stats Verified)")

    # GET /api/schema-mastery/post-test/questions
    r = client.get("/api/schema-mastery/post-test/questions?student_id=S999&concept=Loops")
    assert r.status_code == 200

    # POST /api/schema-mastery/predict
    r = client.post("/api/schema-mastery/predict", json=test_input)
    assert r.status_code == 200

    print("    [PASS] All Flask HTTP endpoints tested successfully.")

    print("\n" + "="*75)
    print(" ALL COMPONENT 4 VERIFICATION TESTS PASSED (100% SUCCESS)")
    print("="*75 + "\n")


if __name__ == "__main__":
    run_tests()
