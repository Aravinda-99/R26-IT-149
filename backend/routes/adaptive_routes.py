"""
Component 1: Adaptive Learning Path Generator — Routes
=======================================================
Adaptive routes with ML-powered recommendation endpoint.
"""

from flask import Blueprint, request, jsonify
from services.adaptive_service import AdaptiveService

adaptive_bp = Blueprint("adaptive", __name__)


@adaptive_bp.route("/next-activity/<user_id>", methods=["GET"])
def get_next_activity(user_id):
    """Return the next recommended activity for a learner."""
    result = AdaptiveService.get_recommendation(user_id)
    return jsonify(result)


@adaptive_bp.route("/update-progress", methods=["POST"])
def update_progress():
    """Update learner progress after completing an activity."""
    data = request.get_json()
    result = AdaptiveService.update_progress(data)
    return jsonify(result)


@adaptive_bp.route("/learning-path/<user_id>", methods=["GET"])
def get_learning_path(user_id):
    """Return the full learning path with status."""
    result = AdaptiveService.get_learning_path(user_id)
    return jsonify(result)


@adaptive_bp.route("/predict", methods=["POST"])
def predict():
    """
    ML-powered endpoint — predicts next difficulty and topic.

    Expected JSON body:
    {
        "avg_attempts":       1.2,
        "avg_time_sec":       18.5,
        "engagement_score":   0.98,
        "current_difficulty": "beginner",
        "topic_scores": {
            "variables":   0.9,
            "operators":   0.5,
            "loops":       0.8,
            "arrays":      0.7,
            "methods":     0.6
        }
    }
    """
    data = request.get_json()

    # ── Validate required fields ─────────────────────────────────────
    required = [
        'avg_attempts',
        'avg_time_sec',
        'engagement_score',
        'current_difficulty'
    ]
    for field in required:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    # ── Validate data types and ranges ───────────────────────────────
    try:
        avg_attempts     = float(data['avg_attempts'])
        avg_time_sec     = float(data['avg_time_sec'])
        engagement_score = float(data['engagement_score'])
    except (ValueError, TypeError):
        return jsonify({'error': 'avg_attempts, avg_time_sec, engagement_score must be numbers'}), 400

    if not (0.0 <= engagement_score <= 1.0):
        return jsonify({'error': 'engagement_score must be between 0.0 and 1.0'}), 400

    valid_difficulties = ['beginner', 'intermediate', 'advanced']
    if data['current_difficulty'] not in valid_difficulties:
        return jsonify({'error': f'current_difficulty must be one of {valid_difficulties}'}), 400

    # ── Call ML model ────────────────────────────────────────────────
    try:
        result = AdaptiveService.predict_recommendation(data)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500