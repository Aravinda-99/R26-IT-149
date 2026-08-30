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

schema_mastery_bp = Blueprint("schema_mastery", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1. LLM Draft Question Generation (Teacher/Admin)
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
        return jsonify({
            "success": True,
            "message": f"Generated {len(drafts)} draft questions for {concept_name} with status PENDING",
            "count": len(drafts),
            "questions": drafts,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


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
        pending = SchemaQuestionBankService.get_pending_questions(concept=concept)
        return jsonify({
            "success": True,
            "count": len(pending),
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
        rejected = SchemaQuestionBankService.get_rejected_questions(concept=concept)
        return jsonify({
            "success": True,
            "count": len(rejected),
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
    active_only = request.args.get("active_only", "false").lower() == "true"
    include_deleted = request.args.get("include_deleted", "false").lower() == "true"
    try:
        bank = SchemaQuestionBankService.get_approved_question_bank(
            concept=concept,
            active_only=active_only,
            include_deleted=include_deleted
        )
        return jsonify({
            "success": True,
            "count": len(bank),
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
    concept = request.args.get("concept") or request.args.get("concept_name", "Loops")
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
