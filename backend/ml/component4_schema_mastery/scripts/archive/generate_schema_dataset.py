import os
import random
import numpy as np
import pandas as pd

random.seed(42)
np.random.seed(42)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "datasets", "processed", "schema_mastery_dataset.csv"))
os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"]

ERROR_TYPES = {
    "Variables": ["DECLARATION_ERROR", "TYPE_MISMATCH", "INITIALIZATION_ERROR"],
    "Operators": ["OPERATOR_CONFUSION", "PRECEDENCE_ERROR", "COMPARISON_ERROR"],
    "Loops": ["LOOP_CONDITION_ERROR", "BOUNDARY_ERROR", "INFINITE_LOOP"],
    "Arrays": ["INDEX_ERROR", "ARRAY_LENGTH_ERROR", "ACCESS_ERROR"],
    "Methods": ["PARAMETER_ERROR", "RETURN_TYPE_ERROR", "METHOD_CALL_ERROR"],
}


def clamp(value, min_value=0.0, max_value=1.0):
    return max(min_value, min(max_value, value))


rows = []

for i in range(1, 1001):
    student_id = f"S{random.randint(1, 250):03d}"
    session_id = f"SES{i:04d}"
    concept = random.choice(CONCEPTS)
    error_type = random.choice(ERROR_TYPES[concept])

    # Hidden real ability / mastery value
    latent_mastery = np.random.beta(2.2, 2.0)

    # Pre-test is noisy signal of mastery
    pre_test_score = clamp(np.random.normal(latent_mastery * 0.75, 0.15))

    # Low mastery usually needs more attempts
    attempt_count = int(clamp(round(np.random.normal(5 - latent_mastery * 3.2, 1.0)), 1, 6))

    # Low mastery usually takes more time
    time_taken_seconds = int(clamp(np.random.normal(420 - latent_mastery * 220, 60), 90, 600))

    # Error pattern score: higher means less severe / better error recovery
    error_pattern_score = clamp(np.random.normal(latent_mastery, 0.18))

    # Post-test performance after gamified learning
    learning_gain = np.random.normal(0.18, 0.08)
    post_test_score = clamp(pre_test_score + learning_gain + latent_mastery * 0.15)

    total_questions = 10

    correct_count = int(round(post_test_score * total_questions))
    correct_count = max(0, min(total_questions, correct_count))

    remaining = total_questions - correct_count
    nearly_correct_count = int(round(remaining * clamp(latent_mastery, 0.1, 0.8) * 0.5))
    nearly_correct_count = max(0, min(remaining, nearly_correct_count))

    remaining_after_nearly = total_questions - correct_count - nearly_correct_count

    clearly_wrong_count = int(round(remaining_after_nearly * (1 - latent_mastery) * 0.4))
    clearly_wrong_count = max(0, min(remaining_after_nearly, clearly_wrong_count))

    wrong_count = total_questions - correct_count - nearly_correct_count - clearly_wrong_count

    # Future unseen question score: this is target evidence, not direct post-score
    future_test_score = clamp(
        0.35 * pre_test_score +
        0.20 * error_pattern_score +
        0.35 * post_test_score +
        0.10 * latent_mastery +
        np.random.normal(0, 0.10)
    )

    future_success = 1 if future_test_score >= 0.65 else 0

    rows.append({
        "student_id": student_id,
        "session_id": session_id,
        "concept_name": concept,
        "pre_test_score": round(pre_test_score, 3),
        "attempt_count": attempt_count,
        "time_taken_seconds": time_taken_seconds,
        "error_type": error_type,
        "error_pattern_score": round(error_pattern_score, 3),
        "post_test_correct_count": correct_count,
        "post_test_nearly_correct_count": nearly_correct_count,
        "post_test_wrong_count": wrong_count,
        "post_test_clearly_wrong_count": clearly_wrong_count,
        "post_test_score": round(post_test_score, 3),
        "future_test_score": round(future_test_score, 3),
        "future_success": future_success,
    })

df = pd.DataFrame(rows)
df.to_csv(OUTPUT_PATH, index=False)

print(f"[SUCCESS] Dataset saved: {OUTPUT_PATH}")
print(df.head())
print("\nClass balance:")
print(df["future_success"].value_counts())
