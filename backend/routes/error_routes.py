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
    data = request.get_json()
    result = ErrorService.analyze(data)
    return jsonify(result)


@error_bp.route("/history/<user_id>", methods=["GET"])
def get_error_history(user_id):
    """Return error analysis history for a user (last 10 items)."""
    result = ErrorService.get_history(user_id)
    return jsonify(result)


@error_bp.route("/summary/<user_id>", methods=["GET"])
def get_error_summary(user_id):
    """Return aggregated error summary per category."""
    result = ErrorService.get_summary(user_id)
    return jsonify(result)


@error_bp.route("/analytics/<user_id>", methods=["GET"])
def get_error_analytics(user_id):
    """
    Feature 1 — Error Progression Analytics.
    Returns weekly error trends, per-category counts, improvement percentages,
    most improved concept, most problematic concept, and error-free rate.
    Designed for direct consumption by Chart.js.
    """
    result = ErrorService.get_analytics(user_id)
    return jsonify(result)


@error_bp.route("/learning-report/<user_id>", methods=["GET"])
def get_learning_report(user_id):
    """
    Feature 3 — Personalized Learning Report.
    Returns a dynamically generated report covering strengths, recurring
    mistakes, recently improved concepts, new mistakes, and recommended
    focus areas derived from the learner's full submission history.
    """
    result = ErrorService.generate_learning_report(user_id)
    return jsonify(result)
