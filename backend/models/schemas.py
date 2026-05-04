"""
Data Schemas / Models
=====================
Firestore document schemas defining the shape of data stored in each collection.
Updated for the improved Component 4 algorithm with confidence tracking,
learning gain, and progression decisions.
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
    "error_category": "",           # Misconception type (e.g. "off-by-one")
    "error_severity": 0.0,         # Severity [0, 1]
    "timestamp": "",
}

# Collection: game_scores
GAME_SCORE = {
    "user_id": "",
    "game_id": "",
    "concept": "",
    "score": 0,
    "gamified_activity_score": 0.0,  # Normalised [0, 1]
    "level": 1,
    "stars_earned": 0,
    "num_attempts": 1,
    "time_taken": 0,                 # Seconds
    "completed": False,
    "timestamp": "",
}

# Collection: student_behaviour  (Stage 1 input — raw behaviour data per concept)
STUDENT_BEHAVIOUR = {
    "studentId": "",
    "studentName": "",
    "concepts": {
        # Each concept key (variables, operators, loops, arrays, methods) maps to:
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

# Collection: schema_mastery  (per-concept mastery record)
SCHEMA_MASTERY = {
    "user_id": "",
    "concept": "",
    "concept_name": "",
    "mastery_score": 0.0,               # Stage 1 weighted mastery [0, 1]
    "schema_state": "",                  # Stable | Developing | Fragile | Misconception
    "color": "",                         # Hex colour for UI
    "correctness_score": 0.0,
    "attempt_score": 0.0,
    "quiz_score": 0.0,
    "error_pattern_score": 0.0,
    "needs_posttest": False,
    "diagnostic_validated": False,       # Whether post-test has been completed
    "final_state": "",                   # Final schema state after post-test
    "final_mastery_score": 0.0,          # Final score after full algorithm
    "progression_decision": "",          # ADVANCE | ADVANCE_WITH_MONITORING | REINFORCE
    "learning_gain": 0.0,               # Post-test − pre-test
    "last_assessed": "",
}

# Collection: diagnostic_results  (concept-specific post-test results)
DIAGNOSTIC_RESULT = {
    "user_id": "",
    "concept": "",
    "concept_name": "",
    "questions_asked": 0,               # Always 10 per concept
    "correct_answers": 0,
    "wrong_answers": 0,
    "score_percentage": 0.0,
    "current_level": "",                # Stable Level | Developing Level | Fragile Level | Misconception Level
    "post_test_accuracy": 0.0,          # CorrectCount / TotalQuestions
    "average_confidence": 0.0,          # Mean of confidence levels
    "answers": [],                      # List of per-question results
    # Each answer: {
    #     "question_id": "",
    #     "selected": "",
    #     "correct": "",
    #     "is_correct": False,
    #     "confidence": "high",         # low | medium | high
    #     "confidence_value": 1.0,
    #     "explanation": "",
    #     "schema_validation_purpose": "",
    # }
    "pretest_score": 0.0,
    "gamified_score": 0.0,
    "interaction_score": 0.0,
    "post_test_validation_score": 0.0,
    "final_mastery_score": 0.0,
    "schema_state": "",
    "color": "",
    "learning_gain": {
        "raw_gain": 0.0,
        "normalised_gain": 0.0,
        "improved": False,
    },
    "progression_decision": "",
    "rules_applied": [],
    "timestamp": "",
}

# Collection: mcq_posttest_results (per-student per-concept MCQ summary)
MCQ_POSTTEST_RESULT = {
    "studentId": "",
    "conceptName": "",
    "totalQuestions": 0,
    "correctAnswers": 0,
    "wrongAnswers": 0,
    "scorePercentage": 0.0,
    "currentLevel": "",                 # Stable Level | Developing Level | Fragile Level | Misconception Level
    "submittedAnswers": [],
    "createdAt": "",
    "updatedAt": "",
}

# Collection: mcq_questions  (10 per concept, 50 total)
MCQ_QUESTION = {
    "id": "",
    "concept": "",
    "type": "",                         # output_prediction | code_tracing | conceptual_reasoning
    "question": "",
    "code": None,                       # Java code snippet (null if conceptual)
    "options": {},                      # {"A": "...", "B": "...", "C": "...", "D": "..."}
    "answer": "",                       # Correct option letter
    "difficulty": "",                   # easy | medium | hard
    "confidence_prompt": "How confident are you about this answer? Low / Medium / High",
    "schema_validation_purpose": "",    # What schema aspect this question tests
    "explanation": "",
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
