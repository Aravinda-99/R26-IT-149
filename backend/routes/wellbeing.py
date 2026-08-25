"""
Gameplay Struggle Detector — Routes
====================================
Flask API endpoints for detecting when a player's in-round behaviour
looks like struggling, using an Isolation Forest anomaly-detection model.

Endpoints:
  POST /api/wellbeing/predict-struggle - Predict struggling vs typical
"""

from flask import Blueprint, request, jsonify
from services.wellbeing_service import WellbeingService

wellbeing_bp = Blueprint("wellbeing", __name__)


@wellbeing_bp.route("/predict-struggle", methods=["POST"])
def predict_struggle():
    """
    Predict whether current round behaviour indicates struggling.

    Expects JSON body:
    {
        "attempts_count": 3,
        "time_taken_seconds": 45,
        "misconception_repeat_count": 2,
        "combo_breaks": 1
    }
    """
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body must be valid JSON"}), 400

    try:
        result = WellbeingService.predict_struggle(data)
        if "error" in result:
            return jsonify(result), 400
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
