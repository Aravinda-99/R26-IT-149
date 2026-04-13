"""
Component 1: Adaptive Learning Path Generator — Routes
=======================================================
Placeholder routes. Implement your adaptive algorithm here.
"""

from flask import Blueprint, request, jsonify
from services.adaptive_service import AdaptiveService

adaptive_bp = Blueprint("adaptive", __name__)


@adaptive_bp.route("/next-activity/<user_id>", methods=["GET"])
def get_next_activity(user_id):
    """TODO: Return the next recommended activity for a learner."""
    result = AdaptiveService.get_recommendation(user_id)
    return jsonify(result)


@adaptive_bp.route("/update-progress", methods=["POST"])
def update_progress():
    """TODO: Update learner progress after completing an activity."""
    data = request.get_json()
    result = AdaptiveService.update_progress(data)
    return jsonify(result)


@adaptive_bp.route("/learning-path/<user_id>", methods=["GET"])
def get_learning_path(user_id):
    """TODO: Return the full learning path with status."""
    result = AdaptiveService.get_learning_path(user_id)
    return jsonify(result)
