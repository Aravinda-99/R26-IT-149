"""
Component 3: Gamified Reinforcement Module — Routes
=====================================================
Placeholder routes. Implement game data logic here.
"""

from flask import Blueprint, request, jsonify
from services.gamification_service import GamificationService

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
