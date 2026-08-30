"""
Component 3: Gamified Reinforcement Module — Routes
=====================================================
Placeholder routes. Implement game data logic here.
"""

from flask import Blueprint, request, jsonify
from services.gamification_service import GamificationService
from firebase.firebase_service import db

gamification_bp = Blueprint("gamification", __name__)


@gamification_bp.route("/games", methods=["GET"])
def get_games():
    """TODO: Return list of available games."""
    result = GamificationService.get_games()
    return jsonify(result)


@gamification_bp.route("/submit-score", methods=["POST"])
def submit_score():
    """TODO: Submit a game score and update XP."""
    data = request.get_json()
    result = GamificationService.submit_score(data)
    return jsonify(result)


@gamification_bp.route("/leaderboard", methods=["GET"])
def get_leaderboard():
    """TODO: Return the leaderboard."""
    result = GamificationService.get_leaderboard()
    return jsonify(result)


@gamification_bp.route("/profile/<user_id>", methods=["GET"])
def get_profile(user_id):
    """TODO: Return user gamification profile."""
    result = GamificationService.get_profile(user_id)
    return jsonify(result)


@gamification_bp.route("/state", methods=["POST"])
def save_game_state():
    """Persist a player's full game state via the Admin SDK."""
    if not db:
        return jsonify({"message": "Offline mode, state not saved"}), 200

    data = request.get_json()
    uid = data.get("uid")
    state = data.get("state")

    if not uid or not state:
        return jsonify({"error": "Missing uid or state"}), 400

    db.collection("players").document(uid).set(data, merge=True)
    return jsonify({"message": "State saved successfully"}), 200


@gamification_bp.route("/state/<user_id>", methods=["GET"])
def load_game_state(user_id):
    """Load a player's full game state via the Admin SDK."""
    if not db:
        return jsonify({"error": "Offline mode"}), 503

    doc = db.collection("players").document(user_id).get()
    if doc.exists:
        return jsonify(doc.to_dict()), 200
    return jsonify(None), 200


@gamification_bp.route("/state/<user_id>", methods=["DELETE"])
def delete_game_state(user_id):
    """Delete a player's saved game state (used by the Menu's Reset button)."""
    if not db:
        return jsonify({"message": "Offline mode, nothing to delete"}), 200

    db.collection("players").document(user_id).delete()
    return jsonify({"message": "State deleted successfully"}), 200
