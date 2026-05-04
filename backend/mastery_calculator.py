"""
Mastery Calculator -- Stage 1 Algorithm
=======================================
Calculates mastery scores and classifies schema states for programming concepts.

Mastery Score formula (weighted composite of 4 normalized indicators):
  mastery = (0.4 x correctness) + (0.2 x attempt) + (0.2 x quiz) + (0.2 x (1 - error_pattern))

  Where each indicator is normalized to [0.0, 1.0]:
    correctness_score  = correctSubmissions / totalSubmissions
    attempt_score      = 1 / numberOfAttempts   (capped at 1.0)
    quiz_score         = quizMarks / quizTotal
    error_pattern_score = errorPatternScore      (already 0-1, inverted in formula)

Schema State Classification:
  0.80 - 1.00  ->  Stable        (green)   -- concept is well understood
  0.60 - 0.79  ->  Developing    (yellow)  -- partial understanding, improving
  0.40 - 0.59  ->  Fragile       (orange)  -- unstable understanding
  0.00 - 0.39  ->  Misconception (red)     -- fundamental misunderstanding

Stage 2 Final State Logic (combines Stage 1 mastery + MCQ post-test results):
  High mastery + correct MCQs    ->  Stable
  High mastery + incorrect MCQs  ->  Fragile     (guessing/memorizing)
  Low mastery  + correct MCQs    ->  Developing  (improving understanding)
  Low mastery  + poor MCQs       ->  Misconception
"""


# --- Weights for the mastery score formula ---
WEIGHT_CORRECTNESS = 0.4
WEIGHT_ATTEMPT = 0.2
WEIGHT_QUIZ = 0.2
WEIGHT_ERROR = 0.2

# --- Schema state thresholds ---
THRESHOLD_STABLE = 0.80
THRESHOLD_DEVELOPING = 0.60
THRESHOLD_FRAGILE = 0.40

# --- Stage 2 thresholds ---
HIGH_MASTERY_THRESHOLD = 0.60     # Mastery score >= this is considered "high"
GOOD_MCQ_THRESHOLD = 0.67         # MCQ accuracy >= this (e.g. 2/3) is "correct"


def calculate_mastery_score(concept_data):
    """
    Calculate a weighted mastery score (0.0 - 1.0) from raw behaviour data.

    Normalizes each indicator to [0, 1] and applies the weighted formula:
      mastery = (0.4 x correctness) + (0.2 x attempt) + (0.2 x quiz) + (0.2 x (1 - error))

    Args:
        concept_data (dict): Raw behaviour metrics for a single concept.
            Required keys:
                totalSubmissions   (int)   - total code submissions
                correctSubmissions (int)   - number of correct submissions
                numberOfAttempts   (int)   - number of attempts before passing
                quizMarks          (int)   - marks scored on the concept quiz
                quizTotal          (int)   - total marks available on the quiz
                errorPatternScore  (float) - error severity (0 = none, 1 = severe)

    Returns:
        dict: Breakdown of all scores + final mastery score.
            Keys: correctness_score, attempt_score, quiz_score,
                  error_pattern_score, mastery_score
    """
    total = concept_data.get("totalSubmissions", 1)
    correct = concept_data.get("correctSubmissions", 0)
    attempts = concept_data.get("numberOfAttempts", 1)
    quiz_marks = concept_data.get("quizMarks", 0)
    quiz_total = concept_data.get("quizTotal", 1)
    error_pattern = concept_data.get("errorPatternScore", 0.0)

    # Prevent division by zero
    total = max(total, 1)
    attempts = max(attempts, 1)
    quiz_total = max(quiz_total, 1)

    # Normalize each indicator to [0.0, 1.0]
    correctness_score = min(correct / total, 1.0)
    attempt_score = min(1.0 / attempts, 1.0)
    quiz_score = min(quiz_marks / quiz_total, 1.0)
    error_pattern_score = max(0.0, min(error_pattern, 1.0))  # clamp to [0, 1]

    # Weighted mastery score
    mastery_score = (
        (WEIGHT_CORRECTNESS * correctness_score)
        + (WEIGHT_ATTEMPT * attempt_score)
        + (WEIGHT_QUIZ * quiz_score)
        + (WEIGHT_ERROR * (1.0 - error_pattern_score))
    )

    # Clamp final score to [0.0, 1.0]
    mastery_score = max(0.0, min(mastery_score, 1.0))

    return {
        "correctness_score": round(correctness_score, 4),
        "attempt_score": round(attempt_score, 4),
        "quiz_score": round(quiz_score, 4),
        "error_pattern_score": round(error_pattern_score, 4),
        "mastery_score": round(mastery_score, 4),
    }


def classify_schema_state(mastery_score):
    """
    Classify a mastery score into a schema state.

    Thresholds:
      >= 0.80  ->  Stable        (green)
      >= 0.60  ->  Developing    (yellow)
      >= 0.40  ->  Fragile       (orange)
      <  0.40  ->  Misconception (red)

    Args:
        mastery_score (float): Score between 0.0 and 1.0

    Returns:
        str: One of "Stable", "Developing", "Fragile", "Misconception"
    """
    if mastery_score >= THRESHOLD_STABLE:
        return "Stable"
    elif mastery_score >= THRESHOLD_DEVELOPING:
        return "Developing"
    elif mastery_score >= THRESHOLD_FRAGILE:
        return "Fragile"
    else:
        return "Misconception"


def get_state_color(schema_state):
    """
    Return the display color for a schema state.

    Args:
        schema_state (str): Schema state classification

    Returns:
        str: CSS-friendly color name
    """
    colors = {
        "Stable": "#34d399",        # green
        "Developing": "#fbbf24",    # yellow
        "Fragile": "#f97316",       # orange
        "Misconception": "#ef4444", # red
    }
    return colors.get(schema_state, "#8899aa")


def needs_posttest(schema_state):
    """
    Determine whether Stage 2 diagnostic post-test should be triggered.

    The post-test is triggered for any state other than Stable, to validate
    whether the student truly understands the concept or is guessing/memorizing.

    Args:
        schema_state (str): Current schema state classification

    Returns:
        bool: True if post-test is needed (Developing / Fragile / Misconception)
    """
    return schema_state != "Stable"


def determine_final_state(mastery_score, mcq_correct, mcq_total):
    """
    Combine behaviour-based mastery score with MCQ results for final state.

    This is the Stage 2 validation logic. It cross-references the student's
    behavioural performance (Stage 1) with their conceptual understanding
    demonstrated through diagnostic MCQs.

    Decision matrix:
      +------------------+------------------+------------------+
      |                  | Good MCQ (>=67%) | Poor MCQ (<67%)  |
      +------------------+------------------+------------------+
      | High mastery     | Stable           | Fragile          |
      | (score >= 0.60)  | (true mastery)   | (memorizing)     |
      +------------------+------------------+------------------+
      | Low mastery      | Developing       | Misconception    |
      | (score < 0.60)   | (improving)      | (no understand)  |
      +------------------+------------------+------------------+

    Args:
        mastery_score (float): Stage 1 mastery score (0.0 - 1.0)
        mcq_correct (int): Number of correct MCQ answers
        mcq_total (int): Total MCQ questions

    Returns:
        str: Final schema state
    """
    mcq_total = max(mcq_total, 1)  # prevent division by zero
    mcq_accuracy = mcq_correct / mcq_total

    high_mastery = mastery_score >= HIGH_MASTERY_THRESHOLD
    good_mcq = mcq_accuracy >= GOOD_MCQ_THRESHOLD

    if high_mastery and good_mcq:
        return "Stable"
    elif high_mastery and not good_mcq:
        return "Fragile"
    elif not high_mastery and good_mcq:
        return "Developing"
    else:
        return "Misconception"


def process_student(student_data):
    """
    Process all concepts for a single student and return mastery results.

    Runs the Stage 1 algorithm for each concept, classifies schema states,
    and determines whether Stage 2 post-tests are needed.

    Args:
        student_data (dict): Student document from Firestore.
            Must contain 'studentId', 'studentName', and 'concepts' dict.

    Returns:
        dict: Complete mastery analysis for the student.
            Keys: studentId, studentName, concepts (dict of per-concept results),
                  overall_mastery, overall_state
    """
    student_id = student_data.get("studentId", "unknown")
    student_name = student_data.get("studentName", "Unknown")
    concepts = student_data.get("concepts", {})

    results = {}
    total_mastery = 0.0
    concept_count = 0

    for concept_name, concept_data in concepts.items():
        # Stage 1: Calculate mastery score
        scores = calculate_mastery_score(concept_data)
        mastery = scores["mastery_score"]

        # Classify schema state
        state = classify_schema_state(mastery)

        # Check if post-test is needed
        requires_posttest = needs_posttest(state)

        results[concept_name] = {
            "mastery_score": mastery,
            "schema_state": state,
            "color": get_state_color(state),
            "needs_posttest": requires_posttest,
            "breakdown": {
                "correctness_score": scores["correctness_score"],
                "attempt_score": scores["attempt_score"],
                "quiz_score": scores["quiz_score"],
                "error_pattern_score": scores["error_pattern_score"],
            },
        }

        total_mastery += mastery
        concept_count += 1

    # Overall mastery (average across all concepts)
    overall_mastery = round(total_mastery / max(concept_count, 1), 4)
    overall_state = classify_schema_state(overall_mastery)

    return {
        "studentId": student_id,
        "studentName": student_name,
        "concepts": results,
        "overall_mastery": overall_mastery,
        "overall_state": overall_state,
        "overall_color": get_state_color(overall_state),
        "total_concepts": concept_count,
    }
