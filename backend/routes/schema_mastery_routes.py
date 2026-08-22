"""
Component 4: Schema Mastery ML Prediction Routes
================================================
Dedicated endpoint for post-learning understanding validation.
"""

from flask import Blueprint, jsonify, request
from services.schema_mastery_service import SchemaMasteryService, predict_schema_mastery

schema_mastery_bp = Blueprint("schema_mastery", __name__)


@schema_mastery_bp.route("/predict", methods=["POST"])
def predict_schema_mastery_route():
    """
    Predict Component 4 mastery probability, level, and next action.

    Expected JSON body:
    {
        "concept_name": "Loops",
        "pre_test_score": 0.35,
        "attempt_count": 2,
        "time_taken_seconds": 180,
        "error_type": "LOOP_CONDITION_ERROR",
        "error_pattern_score": 0.40,
        "post_test_correct_count": 7,
        "post_test_nearly_correct_count": 1,
        "post_test_wrong_count": 1,
        "post_test_clearly_wrong_count": 1,
        "post_test_score": 0.70
    }
    """
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be valid JSON"}), 400

    result = predict_schema_mastery(data)
    return jsonify(result), 200
