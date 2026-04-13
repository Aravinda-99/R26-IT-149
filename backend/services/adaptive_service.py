"""
Component 1: Adaptive Learning Path — Service
===============================================
TODO: Implement adaptive recommendation algorithm here.
"""

from firebase.firebase_service import db


TOPICS = ["variables", "operators", "conditionals", "loops", "arrays", "methods"]


class AdaptiveService:

    @staticmethod
    def get_recommendation(user_id):
        """TODO: Analyze learner data and return next activity."""
        # Placeholder response
        return {
            "user_id": user_id,
            "recommended_topic": "variables",
            "difficulty": "easy",
            "activity_type": "lesson",
            "reason": "Placeholder — implement adaptive logic"
        }

    @staticmethod
    def update_progress(data):
        """TODO: Store learner progress in Firestore."""
        # Placeholder
        return {"message": "Progress updated (placeholder)"}

    @staticmethod
    def get_learning_path(user_id):
        """TODO: Build personalized learning path."""
        path = [
            {"id": t, "name": t.replace("_", " ").title(), "order": i + 1, "mastery": 0, "status": "locked"}
            for i, t in enumerate(TOPICS)
        ]
        path[0]["status"] = "started"
        return {"user_id": user_id, "learning_path": path}
