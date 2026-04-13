"""
Component 3: Gamified Reinforcement — Service
===============================================
TODO: Implement game data, scoring, XP, and leaderboard here.
"""

from firebase.firebase_service import db


# Placeholder game catalog
GAME_CATALOG = [
    {"game_id": "var_quest", "title": "Variable Quest", "concept": "variables", "levels": 3, "xp_reward": 50},
    {"game_id": "op_arena", "title": "Operator Arena", "concept": "operators", "levels": 3, "xp_reward": 60},
    {"game_id": "if_maze", "title": "If-Else Maze", "concept": "conditionals", "levels": 4, "xp_reward": 75},
    {"game_id": "loop_runner", "title": "Loop Runner", "concept": "loops", "levels": 4, "xp_reward": 80},
    {"game_id": "array_sorter", "title": "Array Sorter", "concept": "arrays", "levels": 3, "xp_reward": 70},
    {"game_id": "func_factory", "title": "Function Factory", "concept": "methods", "levels": 3, "xp_reward": 90},
]


class GamificationService:

    @staticmethod
    def get_games():
        """Return the game catalog."""
        return {"games": GAME_CATALOG, "total": len(GAME_CATALOG)}

    @staticmethod
    def submit_score(data):
        """TODO: Store score and update XP."""
        return {"message": "Score submitted (placeholder)", "xp_earned": 0}

    @staticmethod
    def get_leaderboard():
        """TODO: Fetch leaderboard from Firestore."""
        return {"leaderboard": []}

    @staticmethod
    def get_profile(user_id):
        """TODO: Fetch user gamification profile."""
        return {"user_id": user_id, "total_xp": 0, "level": 1, "badges": [], "games_played": 0}
