"""
Data Schemas / Models
=====================
Placeholder for Firestore document schemas.
These define the shape of data stored in each collection.
Extend as needed when implementing each component.
"""

# --- Firestore Collections ---

# Collection: learner_progress
LEARNER_PROGRESS = {
    "user_id": "",
    "current_topic": "variables",
    "recent_accuracy": 0,
    "total_attempts": 0,
    "last_time_spent": 0,
    "updated_at": "",
}

# Collection: error_analyses
ERROR_ANALYSIS = {
    "user_id": "",
    "code_snippet": "",
    "error_output": "",
    "detected_errors": [],
    "topic": "",
    "timestamp": "",
}

# Collection: game_scores
GAME_SCORE = {
    "user_id": "",
    "game_id": "",
    "concept": "",
    "score": 0,
    "level": 1,
    "stars_earned": 0,
    "completed": False,
    "timestamp": "",
}

# Collection: schema_mastery
SCHEMA_MASTERY = {
    "user_id": "",
    "schema": "",
    "level": 0,
    "sub_skills": {},
    "diagnostic_validated": False,
    "last_assessed": "",
}

# Collection: user_profiles
USER_PROFILE = {
    "display_name": "",
    "email": "",
    "total_xp": 0,
    "games_played": 0,
    "badges": [],
    "created_at": "",
}
