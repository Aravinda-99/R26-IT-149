"""
Component 2: Intelligent Error Pattern Detector — Routes
=========================================================
Routes for ML-powered error analysis, history, summary,
error progression analytics (Feature 1), and personalized
learning report (Feature 3).
"""

from flask import Blueprint, request, jsonify
from services.error_service import ErrorService

error_bp = Blueprint("errors", __name__)


@error_bp.route("/analyze", methods=["POST"])
def analyze_code():
    """Analyze submitted code for error patterns (includes XAI — Feature 2)."""
    try:
        data = request.get_json() or {}
        result = ErrorService.analyze(data)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "prediction": "General Error",
            "reason": "Could not complete analysis",
            "recommendation": "Review your code logic and syntax."
        }), 200


@error_bp.route("/history/<user_id>", methods=["GET"])
def get_error_history(user_id):
    """Return error analysis history for a user (last 10 items)."""
    try:
        result = ErrorService.get_history(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": True,
            "student_id": user_id,
            "source": "fallback",
            "total": 0,
            "history": [],
            "message": f"Error loading history: {e}"
        }), 200


@error_bp.route("/latest/<user_id>", methods=["GET"])
def get_latest_analysis(user_id):
    """Return the most recent full analysis response for a user."""
    try:
        result = ErrorService.get_latest(user_id)
        if result:
            return jsonify(result)
        return jsonify({
            "success": False,
            "student_id": user_id,
            "message": "No recent analysis found"
        }), 404
    except Exception as e:
        return jsonify({
            "success": False,
            "student_id": user_id,
            "message": f"Error retrieving latest analysis: {e}"
        }), 200


@error_bp.route("/summary/<user_id>", methods=["GET"])
def get_error_summary(user_id):
    """Return aggregated error summary per category."""
    try:
        result = ErrorService.get_summary(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "total_analyses": 0,
            "counts": {},
            "most_frequent_error": "None",
            "recommended_focus": "General"
        }), 200


@error_bp.route("/analytics/<user_id>", methods=["GET"])
def get_error_analytics(user_id):
    """
    Feature 1 — Error Progression Analytics.
    Returns weekly error trends, per-category counts, improvement percentages,
    most improved concept, most problematic concept, and error-free rate.
    Designed for direct consumption by Chart.js.
    """
    try:
        result = ErrorService.get_analytics(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "has_data": False,
            "total_submissions": 0,
            "weeks": [],
            "weekly_totals": [],
            "category_weekly": {},
            "improvement_scores": {},
            "overall_improvement_pct": 0,
            "most_improved": None,
            "most_problematic": None,
            "error_free_rate": 0,
            "total_counts": {},
        }), 200


@error_bp.route("/learning-report/<user_id>", methods=["GET"])
def get_learning_report(user_id):
    """
    Feature 3 — Personalized Learning Report.
    Returns a dynamically generated report covering strengths, recurring
    mistakes, recently improved concepts, new mistakes, and recommended
    focus areas derived from the learner's full submission history.
    """
    try:
        result = ErrorService.generate_learning_report(user_id)
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "has_data": False,
            "total_submissions": 0,
            "summary": "No submission history found.",
            "strengths": [],
            "recurring_mistakes": [],
            "recently_improved": [],
            "new_mistakes": [],
            "recommended_focus": [],
            "avoid_patterns": [],
        }), 200
