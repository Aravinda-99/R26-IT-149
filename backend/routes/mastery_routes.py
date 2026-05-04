"""
Component 4: Schema Mastery Tracker -- Routes
==============================================
Flask API endpoints for mastery tracking, diagnostic post-tests,
and dashboard data.

Endpoints:
  GET  /api/mastery/status/<user_id>         - Get mastery status for a student
  GET  /api/mastery/students                 - List all students with mastery overview
  POST /api/mastery/update                   - Update mastery after activity completion
  GET  /api/mastery/questions/<concept>       - Get MCQ questions for Stage 2
  POST /api/mastery/diagnostic               - Submit diagnostic MCQ results
  GET  /api/mastery/history/<user_id>/<schema> - Get mastery trend data
"""

from flask import Blueprint, request, jsonify
from services.mastery_service import MasteryService

mastery_bp = Blueprint("mastery", __name__)


@mastery_bp.route("/status/<user_id>", methods=["GET"])
def get_mastery_status(user_id):
    """
    Stage 1: Calculate and return mastery status for a student.

    Fetches behaviour data from Firestore, runs the mastery calculator,
    and returns per-concept schema states with score breakdowns.
    """
    try:
        result = MasteryService.get_status(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mastery_bp.route("/students", methods=["GET"])
def get_all_students():
    """
    List all students with their overall mastery scores.
    Used by the dashboard to show a student selector.
    """
    try:
        students = MasteryService.get_all_students()
        return jsonify({"students": students})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mastery_bp.route("/update", methods=["POST"])
def update_mastery():
    """
    Update behaviour data for a student and recalculate mastery.

    Expects JSON body:
    {
        "user_id": "STU001",
        "concept": "variables",
        "metrics": { ... }
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        result = MasteryService.update(data)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mastery_bp.route("/questions/<concept>", methods=["GET"])
def get_questions(concept):
    """
    Stage 2: Get MCQ diagnostic questions for a specific concept.
    Returns questions without answers (answers are checked server-side).
    """
    valid_concepts = ["variables", "operators", "loops", "arrays", "methods"]
    if concept not in valid_concepts:
        return jsonify({
            "error": f"Invalid concept '{concept}'",
            "valid_concepts": valid_concepts,
        }), 400

    try:
        result = MasteryService.get_questions(concept)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mastery_bp.route("/diagnostic", methods=["POST"])
def submit_diagnostic():
    """
    Stage 2: Submit diagnostic MCQ answers and get final schema state.

    Expects JSON body:
    {
        "user_id": "STU001",
        "concept": "variables",
        "answers": [
            {"question_id": "VAR_OP_01", "selected_option": "A"},
            {"question_id": "VAR_CT_01", "selected_option": "D"},
            {"question_id": "VAR_CR_01", "selected_option": "B"}
        ]
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        result = MasteryService.submit_diagnostic(data)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@mastery_bp.route("/history/<user_id>/<schema>", methods=["GET"])
def get_history(user_id, schema):
    """
    Stage 3: Return mastery trend data for a student and concept.
    Use schema="overall" for aggregate trend data.
    """
    try:
        result = MasteryService.get_history(user_id, schema)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
