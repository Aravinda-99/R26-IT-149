"""
Component 4: Schema Mastery Tracker — Routes
==============================================
Placeholder routes. Implement mastery tracking logic here.
"""

from flask import Blueprint, request, jsonify
from services.mastery_service import MasteryService

mastery_bp = Blueprint("mastery", __name__)


@mastery_bp.route("/status/<user_id>", methods=["GET"])
def get_mastery_status(user_id):
    """TODO: Return overall mastery status."""
    result = MasteryService.get_status(user_id)
    return jsonify(result)


@mastery_bp.route("/update", methods=["POST"])
def update_mastery():
    """TODO: Update mastery after activity completion."""
    data = request.get_json()
    result = MasteryService.update(data)
    return jsonify(result)


@mastery_bp.route("/diagnostic", methods=["POST"])
def submit_diagnostic():
    """TODO: Submit diagnostic MCQ results."""
    data = request.get_json()
    result = MasteryService.submit_diagnostic(data)
    return jsonify(result)


@mastery_bp.route("/history/<user_id>/<schema>", methods=["GET"])
def get_history(user_id, schema):
    """TODO: Return mastery trend data."""
    result = MasteryService.get_history(user_id, schema)
    return jsonify(result)
