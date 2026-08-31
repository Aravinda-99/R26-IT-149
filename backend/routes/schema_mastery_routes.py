"""
Component 4: Schema Mastery ML & Question Bank Routes
=====================================================
Endpoints for:
  - Teacher LLM-assisted draft question generation, review, edit, approval, and rejection
  - Approved question bank inspection
  - Student post-test question generation (blueprint-based, answer-safe)
  - Student post-test submission, scoring, and ML schema mastery prediction
  - Direct ML schema mastery prediction API
"""

from flask import Blueprint, jsonify, request
from services.schema_mastery_service import predict_schema_mastery
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_llm_question_service import SchemaLLMQuestionService
from services.schema_post_test_service import SchemaPostTestService
from services.schema_post_test_result_service import SchemaPostTestResultService
from services.schema_session_service import SchemaSessionService

schema_mastery_bp = Blueprint("schema_mastery", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1. LLM Status & Health Check
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/llm/status", methods=["GET"])
def get_llm_status():
    """
    Returns safe LLM provider and configuration status (never exposes secret keys).
    """
    try:
        status_info = SchemaLLMQuestionService.get_llm_status()
        return jsonify(status_info), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 1a. Unified Question Bank & Cohort Statistics (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/stats", methods=["GET"])
def get_question_stats():
    """
    Returns unified counts for registered students, approved questions,
    pending review questions, and rejected archive questions.
    """
    try:
        stats = SchemaQuestionBankService.get_question_stats()
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 1b. LLM Draft Question Generation (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/generate", methods=["POST"])
def generate_questions():
    """
    Teacher/Admin generates draft questions via LLM / template generator.
    Drafts are saved into generated_questions with status PENDING.
    """
    data = request.get_json(silent=True) or {}
    concept_name = data.get("concept_name", "Loops")
    question_type = data.get("question_type")
    difficulty = data.get("difficulty", "Medium")
    target_error_type = data.get("target_error_type", "UNKNOWN_ERROR")
    count = data.get("count", 5)

    try:
        drafts = SchemaLLMQuestionService.generate_draft_questions(
            concept_name=concept_name,
            question_type=question_type,
            difficulty=difficulty,
            target_error_type=target_error_type,
            count=count,
        )
        generated_count = len(drafts)
        invalid_count = max(0, int(count or 0) - generated_count)
        return jsonify({
            "success": True,
            "message": f"Generated {len(drafts)} draft questions for {concept_name} with status PENDING",
            "count": generated_count,
            "generated_count": generated_count,
            "invalid_count": invalid_count,
            "storage_source": SchemaQuestionBankService.get_storage_status(),
            "questions": drafts,
        }), 200
    except (ValueError, RuntimeError) as e:
        err_msg = str(e)
        code = "LLM_NOT_CONFIGURED" if "OPENAI_API_KEY" in err_msg or "not configured" in err_msg else "LLM_GENERATION_FAILED"
        return jsonify({
            "success": False,
            "message": "Gemini question generation failed. Please try again.",
            "error": err_msg,
            "code": code,
        }), 400
    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Gemini question generation failed. Please try again.",
            "error": str(e),
            "code": "INTERNAL_ERROR",
        }), 500


# ─────────────────────────────────────────────────────────────────────────────
# 2. Get Pending Draft Questions (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/pending", methods=["GET"])
def get_pending_questions():
    """
    Retrieves all pending draft questions for teacher review,
    including correct answer keys and option quality labels.
    """
    concept = request.args.get("concept")
    try:
        pending, storage_source = SchemaQuestionBankService.get_pending_questions(concept=concept, return_source=True)
        return jsonify({
            "success": True,
            "count": len(pending),
            "storage_source": storage_source,
            "questions": pending,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 2b. Get Rejected Questions Archive (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/rejected", methods=["GET"])
def get_rejected_questions():
    """
    Retrieves all rejected draft questions for teacher audit & reactivation.
    """
    concept = request.args.get("concept")
    try:
        rejected, storage_source = SchemaQuestionBankService.get_rejected_questions(concept=concept, return_source=True)
        return jsonify({
            "success": True,
            "count": len(rejected),
            "storage_source": storage_source,
            "questions": rejected,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 3. Edit Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>", methods=["PUT"])
def edit_question(question_id):
    """
    Teacher edits a draft or approved question.
    """
    updates = request.get_json(silent=True) or {}
    updated_by = updates.get("updated_by", "Teacher")
    try:
        updated = SchemaQuestionBankService.update_question(question_id, updates, updated_by=updated_by)
        if not updated:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' updated successfully",
            "question": updated,
        }), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 4. Approve Draft Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>/approve", methods=["POST"])
def approve_question(question_id):
    """
    Teacher approves a draft question, transferring it into approved_question_bank.
    """
    data = request.get_json(silent=True) or {}
    approved_by = data.get("approved_by", "Teacher")

    try:
        approved = SchemaQuestionBankService.approve_question(question_id, approved_by=approved_by)
        if not approved:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' approved and added to active question bank",
            "question": approved,
        }), 200
    except ValueError as ve:
        return jsonify({"success": False, "error": str(ve)}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 5. Reject Draft Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>/reject", methods=["POST"])
def reject_question(question_id):
    """
    Teacher rejects a draft question, preventing it from entering the question bank.
    """
    data = request.get_json(silent=True) or {}
    reason = data.get("reason", "Rejected by teacher review")
    rejected_by = data.get("rejected_by", "Teacher")

    try:
        rejected = SchemaQuestionBankService.reject_question(question_id, reason=reason, rejected_by=rejected_by)
        if not rejected:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' marked as REJECTED",
            "question": rejected,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 5b. Deactivate Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>/deactivate", methods=["POST"])
def deactivate_question(question_id):
    """
    Deactivates an approved question so it is not sampled for student post-tests.
    """
    data = request.get_json(silent=True) or {}
    updated_by = data.get("updated_by", "Teacher")
    try:
        deactivated = SchemaQuestionBankService.deactivate_question(question_id, updated_by=updated_by)
        if not deactivated:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' deactivated",
            "question": deactivated,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 5c. Reactivate Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>/reactivate", methods=["POST"])
def reactivate_question(question_id):
    """
    Reactivates a deactivated or rejected question.
    """
    data = request.get_json(silent=True) or {}
    updated_by = data.get("updated_by", "Teacher")
    try:
        reactivated = SchemaQuestionBankService.reactivate_question(question_id, updated_by=updated_by)
        if not reactivated:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' reactivated",
            "question": reactivated,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 5d. Delete Question (Teacher/Admin - Soft Delete)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>", methods=["DELETE"])
@schema_mastery_bp.route("/questions/<question_id>/delete", methods=["POST"])
def delete_question(question_id):
    """
    Soft deletes a question, removing it from active assessment rotation.
    """
    data = request.get_json(silent=True) or {}
    deleted_by = data.get("deleted_by", "Teacher")
    try:
        deleted = SchemaQuestionBankService.delete_question(question_id, deleted_by=deleted_by)
        if not deleted:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' deleted successfully",
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 6. View Approved Question Bank (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/question-bank", methods=["GET"])
def get_approved_bank():
    """
    Teacher views approved questions with exposure statistics and answer keys.
    """
    concept = request.args.get("concept")
    active_only = request.args.get("active_only", "true").lower() == "true"
    include_deleted = request.args.get("include_deleted", "false").lower() == "true"
    try:
        bank, storage_source = SchemaQuestionBankService.get_approved_question_bank(
            concept=concept,
            active_only=active_only,
            include_deleted=include_deleted,
            return_source=True
        )
        return jsonify({
            "success": True,
            "count": len(bank),
            "storage_source": storage_source,
            "questions": bank,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 7. Student Post-Test Question Delivery (Student-Safe)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/post-test/questions", methods=["GET"])
def get_post_test_questions():
    """
    Selects 15 approved questions using blueprint & student history.
    Does NOT reveal correct_option or option_quality.
    """
    student_id = request.args.get("student_id", "STU001")
    concept = request.args.get("concept") or request.args.get("concept_name")
    error_type = request.args.get("error_type")

    try:
        payload = SchemaPostTestService.select_post_test_questions(
            student_id=student_id,
            concept=concept,
            error_type=error_type,
        )
        return jsonify(payload), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 8. Student Post-Test Submission & ML Prediction
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/post-test/submit", methods=["POST"])
def submit_post_test():
    """
    Grading and ML schema mastery evaluation.
    Computes answer quality counts, queries the Random Forest pipeline,
    and returns mastery_level and next_action.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"success": False, "error": "Request body must be valid JSON"}), 400

    try:
        result = SchemaPostTestService.grade_and_predict(data)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 8b. Teacher-facing Post-Test Result Retrieval
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/post-test/results", methods=["GET"])
def get_post_test_results():
    """
    Returns locally persisted Component 4 post-test result records.
    Firestore is not required for teacher dashboard visibility.
    """
    filters = {
        "student_id": request.args.get("student_id"),
        "concept": request.args.get("concept"),
        "mastery_level": request.args.get("mastery_level"),
        "next_action": request.args.get("next_action"),
    }
    filters = {k: v for k, v in filters.items() if v}
    results = SchemaPostTestResultService.list_results(filters)
    return jsonify({
        "success": True,
        "source": "local",
        "count": len(results),
        "results": results,
    }), 200


@schema_mastery_bp.route("/post-test/results/latest/<student_id>", methods=["GET"])
def get_latest_post_test_result(student_id):
    """Returns the latest locally saved Component 4 result for one student."""
    result = SchemaPostTestResultService.get_latest_for_student(student_id)
    return jsonify({
        "success": True,
        "source": "local",
        "count": 1 if result else 0,
        "results": [result] if result else [],
        "result": result,
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# 8c. Learning Session Context & Prerequisite Gating (Component 1 -> 4)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/context/current", methods=["GET"])
@schema_mastery_bp.route("/context", methods=["GET"])
def get_schema_mastery_context():
    """
    Returns the student's active learning session context, prerequisite completeness,
    and missing fields. Used to unlock/lock Understanding Check.
    """
    student_id = request.args.get("student_id", "").strip() or request.args.get("studentId", "").strip()
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    context_summary = SchemaSessionService.get_context_summary(student_id)
    return jsonify(context_summary), 200


@schema_mastery_bp.route("/context/save", methods=["POST"])
def save_schema_mastery_context():
    """
    Saves or updates multi-component learning session data for a student.
    Accepts component_1, component_2, component_3, or general session payloads.
    """
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or data.get("studentId")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required in request body"}), 400

    # If component specific payload
    if "component_1" in data or "weak_concept" in data or "pre_test_score" in data:
        c1_payload = data.get("component_1") or data
        SchemaSessionService.save_component_1_data(student_id, c1_payload)

    if "component_2" in data or "error_type" in data or "reason_group" in data:
        c2_payload = data.get("component_2") or data
        SchemaSessionService.save_component_2_data(student_id, c2_payload)

    if "component_3" in data or "recommended_game_id" in data or "learning_completed" in data:
        c3_payload = data.get("component_3") or data
        SchemaSessionService.save_component_3_data(student_id, c3_payload)

    updated_context = SchemaSessionService.get_context_summary(student_id)
    return jsonify(updated_context), 200


@schema_mastery_bp.route("/session/component1", methods=["POST"])
def save_component_1_session():
    """Endpoint called after Pre-Test completes."""
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or data.get("studentId")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    session = SchemaSessionService.save_component_1_data(student_id, data)
    return jsonify({
        "success": True,
        "message": "Component 1 Pre-Test data saved to learning session",
        "current_stage": session.get("current_stage"),
        "session": session,
    }), 200


@schema_mastery_bp.route("/session/component2", methods=["POST"])
def save_component_2_session():
    """Endpoint called after Error Analysis completes/telemetry."""
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or data.get("studentId")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    session = SchemaSessionService.save_component_2_data(student_id, data)
    return jsonify({
        "success": True,
        "message": "Component 2 Error Feedback data saved to learning session",
        "current_stage": session.get("current_stage"),
        "session": session,
    }), 200


@schema_mastery_bp.route("/session/component3", methods=["POST"])
def save_component_3_session():
    """Endpoint called after Recommended Game Lesson completes."""
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or data.get("studentId")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    session = SchemaSessionService.save_component_3_data(student_id, data)
    return jsonify({
        "success": True,
        "message": "Component 3 Game Lesson marked complete. Understanding Check unlocked.",
        "current_stage": session.get("current_stage"),
        "session": session,
    }), 200


@schema_mastery_bp.route("/context/reset", methods=["POST"])
def reset_schema_mastery_context():
    """Resets the learning session for a fresh retry cycle."""
    data = request.get_json(silent=True) or {}
    student_id = data.get("student_id") or data.get("studentId") or request.args.get("student_id")
    if not student_id:
        return jsonify({"success": False, "error": "student_id is required"}), 400

    session = SchemaSessionService.reset_session(student_id)
    return jsonify({
        "success": True,
        "message": "Learning session reset successfully",
        "session": session,
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# 9. Direct ML Schema Mastery Prediction Endpoint (Testing / Research)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/predict", methods=["POST"])
def predict_schema_mastery_route():
    """
    Direct ML prediction from the 11 feature inputs.
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON"}), 400

    result = predict_schema_mastery(data)
    return jsonify(result), 200
