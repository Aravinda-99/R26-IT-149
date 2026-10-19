"""
Component 1: Adaptive Learning Path Generator — Routes
=======================================================
Adaptive routes with ML-powered recommendation endpoint.
"""

from flask import Blueprint, request, jsonify
from services.adaptive_service import AdaptiveService
from services.placement_service import PlacementService

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


@adaptive_bp.route("/placement", methods=["POST"])
def placement():
    """
    Model A — estimates the student's CURRENT level (Rasch / IRT, EAP).

    Expected JSON body:
    {
        "responses": [
            {"id": "var_b1", "level": "beginner", "correct": true},
            ...
        ]
    }
    A bare list of responses is also accepted.
    """
    data = request.get_json(silent=True)
    responses = data.get('responses') if isinstance(data, dict) else data

    error = PlacementService.validate_responses(responses)
    if error:
        return jsonify({'error': error}), 400

    try:
        return jsonify(PlacementService.place(responses)), 200
    except Exception as e:
        return jsonify({'error': f'Placement failed: {str(e)}'}), 500


@adaptive_bp.route("/predict", methods=["POST"])
def predict():
    """
    Model B — Level Check progression: promote / maintain / demote from
    the student's current level, plus the persistence baseline action.

    Expected JSON body:
    {
        "accuracy":           0.7,      (optional; else from topic_scores)
        "avg_time_sec":       18.5,     mean time to FIRST answer
        "avg_attempts":       1.2,      safety layer only
        "engagement_score":   0.98,     safety layer only
        "current_difficulty": "intermediate",
        "topic_scores": {
            "variables":   0.9,
            "operators":   0.5,
            "loops":       0.8,
            "arrays":      0.7,
            "methods":     0.6
        }
    }
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({'error': 'Request body must be a JSON object'}), 400

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

    if avg_time_sec < 0:
        return jsonify({'error': 'avg_time_sec must be >= 0'}), 400

    if 'accuracy' in data:
        try:
            accuracy = float(data['accuracy'])
        except (ValueError, TypeError):
            return jsonify({'error': 'accuracy must be a number'}), 400
        if not (0.0 <= accuracy <= 1.0):
            return jsonify({'error': 'accuracy must be between 0.0 and 1.0'}), 400

    valid_difficulties = ['beginner', 'intermediate', 'advanced']
    if data['current_difficulty'] not in valid_difficulties:
        return jsonify({'error': f'current_difficulty must be one of {valid_difficulties}'}), 400

    # ── Call ML model ────────────────────────────────────────────────
    try:
        result = AdaptiveService.predict_recommendation(data)
        return jsonify(result), 200

    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500