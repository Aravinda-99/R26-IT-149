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

# Collection: student_behaviour  (Stage 1 input — raw behaviour data per concept)
STUDENT_BEHAVIOUR = {
    "studentId": "",
    "studentName": "",
    "concepts": {
        # Each concept key (variables, conditionals, loops, arrays, methods) maps to:
        # {
        #     "totalSubmissions": 0,
        #     "correctSubmissions": 0,
        #     "numberOfAttempts": 0,
        #     "timeToComplete": 0,
        #     "quizMarks": 0,
        #     "quizTotal": 0,
        #     "errorPatternScore": 0.0,
        # }
    },
}

# Collection: schema_mastery  (Stage 1 output — calculated mastery per concept)
SCHEMA_MASTERY = {
    "user_id": "",
    "concept": "",
    "mastery_score": 0.0,           # Weighted mastery score (0.0 – 1.0)
    "schema_state": "",             # Stable | Developing | Fragile | Misconception
    "correctness_score": 0.0,       # Normalized correctness (0.0 – 1.0)
    "attempt_score": 0.0,           # Normalized attempt score (0.0 – 1.0)
    "quiz_score": 0.0,              # Normalized quiz score (0.0 – 1.0)
    "error_pattern_score": 0.0,     # Raw error severity (0.0 – 1.0)
    "needs_posttest": False,        # Whether Stage 2 is triggered
    "diagnostic_validated": False,  # Whether Stage 2 has been completed
    "final_state": "",              # Final state after Stage 2 (if applicable)
    "last_assessed": "",            # ISO timestamp
}

# Collection: diagnostic_results  (Stage 2 output — MCQ post-test results)
DIAGNOSTIC_RESULT = {
    "user_id": "",
    "concept": "",
    "questions_asked": 0,
    "correct_answers": 0,
    "answers": [],                  # List of { question_id, selected, correct, is_correct }
    "pre_test_state": "",           # Schema state before MCQ
    "final_state": "",              # Schema state after MCQ
    "timestamp": "",
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
