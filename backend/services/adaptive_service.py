"""
Component 1: Adaptive Learning Path — Service
===============================================
Adaptive recommendation algorithm using trained ML model.
"""

import os
import joblib
from firebase.firebase_service import db

# ── Load trained ML model once when app starts ──────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml', 'model.pkl')
model = joblib.load(MODEL_PATH)

TOPICS      = ["variables", "operators", "conditionals", "loops", "arrays", "methods"]
LABEL_MAP   = {0: 'maintain', 1: 'promote', 2: 'demote'}
DIFFICULTY  = ['beginner', 'intermediate', 'advanced']
DIFF_ENCODE = {'beginner': 0, 'intermediate': 1, 'advanced': 2}


class AdaptiveService:

    @staticmethod
    def get_recommendation(user_id):
        """TODO: Analyze learner data and return next activity."""
        # Placeholder response
        return {
            "user_id":           user_id,
            "recommended_topic": "variables",
            "difficulty":        "easy",
            "activity_type":     "lesson",
            "reason":            "Placeholder — implement adaptive logic"
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
            {
                "id":     t,
                "name":   t.replace("_", " ").title(),
                "order":  i + 1,
                "mastery": 0,
                "status": "locked"
            }
            for i, t in enumerate(TOPICS)
        ]
        path[0]["status"] = "started"
        return {"user_id": user_id, "learning_path": path}

    @staticmethod
    def predict_recommendation(session_data: dict) -> dict:
        """
        Uses trained ML model to predict next difficulty level and topic.

        Expected session_data keys:
            avg_attempts      (float) — average attempts per question
            avg_time_sec      (float) — average time in seconds
            engagement_score  (float) — 0.0 to 1.0
            current_difficulty (str)  — beginner / intermediate / advanced
            topic_scores      (dict)  — {topic: score} e.g. {"variables": 0.8}
        """
        # ── Encode difficulty ────────────────────────────────────────
        curr_diff   = session_data.get('current_difficulty', 'beginner')
        diff_enc    = DIFF_ENCODE.get(curr_diff, 0)

        # ── Build feature array (same order as training) ─────────────
        features = [[
            float(session_data.get('avg_attempts',     1.0)),
            float(session_data.get('avg_time_sec',    30.0)),
            float(session_data.get('engagement_score', 0.9)),
            diff_enc
        ]]

        # ── ML model prediction ──────────────────────────────────────
        prediction    = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        action        = LABEL_MAP[int(prediction)]
        confidence    = round(float(max(probabilities)) * 100, 1)

        # ── Calculate next difficulty ────────────────────────────────
        curr_idx = DIFFICULTY.index(curr_diff) if curr_diff in DIFFICULTY else 0
        if action == 'promote':
            next_difficulty = DIFFICULTY[min(curr_idx + 1, 2)]
        elif action == 'demote':
            next_difficulty = DIFFICULTY[max(curr_idx - 1, 0)]
        else:
            next_difficulty = curr_diff

        # ── Find weakest topic to recommend next ─────────────────────
        topic_scores = session_data.get('topic_scores', {})
        if topic_scores:
            next_topic = min(topic_scores, key=topic_scores.get)
        else:
            next_topic = 'variables'

        return {
            'action':          action,           # promote / maintain / demote
            'next_difficulty': next_difficulty,  # beginner / intermediate / advanced
            'next_topic':      next_topic,       # weakest topic to study next
            'confidence':      confidence,       # model confidence %
            'current':         curr_diff         # what they just completed
        }