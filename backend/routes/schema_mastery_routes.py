"""
Component 4: Schema Mastery ML & Question Bank Routes
=====================================================
Endpoints for:
  - Teacher LLM-assisted draft question generation:
      * Mode 1: Manual Draft Batch
      * Mode 2: Auto Balanced Pack
      * Mode 3: Fill Missing Gaps
  - Question Bank Coverage Analytics & Gap Analysis
  - Draft Question Review, Edit, Approval, and Rejection
  - Approved Question Bank Management
  - Student post-test question generation (blueprint-based, answer-safe)
  - Student post-test submission, scoring, and ML schema mastery prediction
  - Direct ML schema mastery prediction API
"""

from flask import Blueprint, jsonify, request
from services.schema_mastery_service import predict_schema_mastery
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_llm_question_service import SchemaLLMQuestionService, CONCEPT_ERROR_MAP
from services.schema_post_test_service import SchemaPostTestService

schema_mastery_bp = Blueprint("schema_mastery", __name__)


# ─────────────────────────────────────────────────────────────────────────────
# 1. Mode 1: Manual LLM Draft Question Generation (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/generate", methods=["POST"])
def generate_questions():
    """
    Teacher generates a manual draft batch.
    Drafts are saved into generated_questions with status PENDING.
    """
    data = request.get_json(silent=True) or {}
    concept_name = data.get("concept_name", "Loops")
    question_type = data.get("question_type")
    if question_type and question_type.startswith("All"):
        question_type = None
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
# 1b. Mode 2: Auto Balanced Pack Generation (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/generate-balanced", methods=["POST"])
def generate_balanced_pack():
    """
    Generates a balanced multi-concept draft pack according to the 4-tier blueprint.
    Drafts are saved with status PENDING.
    """
    data = request.get_json(silent=True) or {}
    concepts = data.get("concepts", ["Variables", "Operators", "Loops", "Arrays", "Methods"])
    questions_per_concept = int(data.get("questions_per_concept", 15))
    difficulty_distribution = data.get("difficulty_distribution")
    blueprint = data.get("blueprint")

    try:
        result = SchemaLLMQuestionService.generate_balanced_pack(
            concepts=concepts,
            questions_per_concept=questions_per_concept,
            difficulty_distribution=difficulty_distribution,
            blueprint=blueprint,
        )
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 1c. Mode 3: Fill Missing Question Bank Gaps (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/fill-gaps", methods=["POST"])
def fill_missing_gaps():
    """
    Inspects coverage gaps in the approved question bank and generates targeted draft questions.
    """
    data = request.get_json(silent=True) or {}
    gaps = data.get("gaps")
    max_per_gap = data.get("max_per_gap", 2)

    try:
        result = SchemaLLMQuestionService.generate_gap_fill_questions(gaps=gaps, max_per_gap=max_per_gap)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 1d. Question Bank Coverage Analysis (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/question-bank/coverage", methods=["GET"])
def get_question_bank_coverage():
    """
    Returns question bank coverage matrix across concepts, types, difficulties, and error patterns.
    """
    try:
        coverage = SchemaQuestionBankService.get_coverage_analysis()
        return jsonify({"success": True, "coverage": coverage}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schema_mastery_bp.route("/questions/concept-errors", methods=["GET"])
def get_concept_error_map():
    """Returns valid concept-specific error types mapping."""
    return jsonify({"success": True, "concept_error_map": CONCEPT_ERROR_MAP}), 200


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
# 3. Edit Draft Question (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/questions/<question_id>", methods=["PUT"])
def edit_question(question_id):
    """
    Teacher edits a draft question before approving.
    """
    updates = request.get_json(silent=True) or {}
    try:
        updated = SchemaQuestionBankService.update_generated_question(question_id, updates)
        if not updated:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' updated successfully",
            "question": updated,
        }), 200
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

    try:
        rejected = SchemaQuestionBankService.reject_question(question_id, reason=reason)
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
# 6. View Approved Question Bank (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/question-bank", methods=["GET"])
def get_approved_bank():
    """
    Teacher views approved questions with exposure statistics and answer keys.
    """
    concept = request.args.get("concept")
    active_only = request.args.get("active_only", "false").lower() == "true"
    try:
        bank = SchemaQuestionBankService.get_approved_question_bank(concept=concept, active_only=active_only)
        return jsonify({
            "success": True,
            "count": len(bank),
            "questions": bank,
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─────────────────────────────────────────────────────────────────────────────
# 6b. Teacher Dashboard Overview & Rejected Questions (Teacher/Admin)
# ─────────────────────────────────────────────────────────────────────────────
@schema_mastery_bp.route("/teacher/overview", methods=["GET"])
def get_teacher_overview():
    """Returns overview counts for teacher dashboard cards."""
    try:
        stats = SchemaQuestionBankService.get_teacher_overview_stats()
        return jsonify({"success": True, "stats": stats}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schema_mastery_bp.route("/questions/rejected", methods=["GET"])
def get_rejected_questions():
    """Returns all rejected questions for teacher archive inspection."""
    concept = request.args.get("concept")
    try:
        rejected = SchemaQuestionBankService.get_rejected_questions(concept=concept)
        return jsonify({"success": True, "count": len(rejected), "questions": rejected}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@schema_mastery_bp.route("/questions/<question_id>/toggle-active", methods=["POST"])
def toggle_question_active(question_id):
    """Toggles active state of an approved question."""
    data = request.get_json(silent=True) or {}
    active_val = data.get("active")
    try:
        updated = SchemaQuestionBankService.toggle_approved_question_active(question_id, active=active_val)
        if not updated:
            return jsonify({"success": False, "error": f"Question '{question_id}' not found"}), 404
        return jsonify({
            "success": True,
            "message": f"Question '{question_id}' active status set to {updated.get('active')}",
            "question": updated,
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
    session_id = request.args.get("session_id")

    try:
        payload = SchemaPostTestService.select_post_test_questions(
            student_id=student_id,
            concept=concept,
            error_type=error_type,
            session_id=session_id,
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
