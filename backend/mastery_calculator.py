"""
Mastery Calculator — Concept-Specific Schema Mastery Tracking Algorithm
========================================================================
Calculates schema mastery scores and classifies schema states for individual
programming concepts using a rule-based, scoring-based mechanism grounded
in Schema Theory (Piaget, 1952; Sweller, 1988).

This module does NOT use machine learning.  Component 2 handles ML.
Component 4 relies entirely on deterministic weighted formulas and
rule-based heuristic overrides.

Final Schema Mastery Score formula (weighted composite of 4 normalised sources):
  FinalSchemaMasteryScore =
      (0.20 × ConceptPreTestScore)
    + (0.20 × InteractionScore)
    + (0.20 × GamifiedActivityScore)
    + (0.40 × ConceptPostTestValidationScore)

  Where:
    ConceptPreTestScore            — from Component 1 (pre-test for this concept)
    InteractionScore               — derived from attempts, time, and error severity
    GamifiedActivityScore          — from Component 3 (gamified activity result)
    ConceptPostTestValidationScore — from Component 4 post-test (accuracy + confidence)

Interaction Score sub-formula:
    InteractionScore = (0.40 × AttemptScore) + (0.30 × TimeScore)
                     + (0.30 × ErrorSeverityScore)

Post-Test Validation Score sub-formula:
    ConceptPostTestValidationScore = (0.70 × PostTestAccuracy)
                                   + (0.30 × AverageConfidence)

Schema State Classification:
  0.80 – 1.00  →  Stable Schema       (green)   — well understood
  0.60 – 0.79  →  Developing Schema   (yellow)  — partial, improving
  0.40 – 0.59  →  Fragile Schema      (orange)  — unstable understanding
  0.00 – 0.39  →  Misconception Schema (red)    — fundamental misunderstanding

Rule-Based Heuristic Overrides:
  RULE 1  High accuracy + low confidence  →  Fragile (guessing detected)
  RULE 2  Recurring misconception          →  Misconception (intervention failed)
  RULE 3  Post-test > pre-test             →  Record positive Learning Gain
  RULE 4  Post-test accuracy < 0.40        →  At least Fragile
"""


# ═══════════════════════════════════════════════════════════════════════
# WEIGHTS — Final Schema Mastery Score
# ═══════════════════════════════════════════════════════════════════════
WEIGHT_PRETEST = 0.20
WEIGHT_INTERACTION = 0.20
WEIGHT_GAMIFIED = 0.20
WEIGHT_POSTTEST = 0.40

# ═══════════════════════════════════════════════════════════════════════
# WEIGHTS — Interaction Score sub-components
# ═══════════════════════════════════════════════════════════════════════
WEIGHT_ATTEMPT = 0.40
WEIGHT_TIME = 0.30
WEIGHT_ERROR_SEVERITY = 0.30

# ═══════════════════════════════════════════════════════════════════════
# WEIGHTS — Post-Test Validation Score sub-components
# ═══════════════════════════════════════════════════════════════════════
WEIGHT_ACCURACY = 0.70
WEIGHT_CONFIDENCE = 0.30

# ═══════════════════════════════════════════════════════════════════════
# SCHEMA STATE THRESHOLDS
# ═══════════════════════════════════════════════════════════════════════
THRESHOLD_STABLE = 0.80
THRESHOLD_DEVELOPING = 0.60
THRESHOLD_FRAGILE = 0.40

# ═══════════════════════════════════════════════════════════════════════
# HEURISTIC RULE THRESHOLDS
# ═══════════════════════════════════════════════════════════════════════
GUESSING_ACCURACY_THRESHOLD = 0.70    # Rule 1: accuracy >= this …
GUESSING_CONFIDENCE_THRESHOLD = 0.50  # Rule 1: … but confidence < this
LOW_POSTTEST_THRESHOLD = 0.40         # Rule 4: accuracy < this

# ═══════════════════════════════════════════════════════════════════════
# CONSTANTS
# ═══════════════════════════════════════════════════════════════════════
MAX_ALLOWED_TIME = 600  # seconds (10 minutes) for time normalisation

# Confidence level mapping (self-reported → numeric)
CONFIDENCE_MAP = {
    "low": 0.33,
    "medium": 0.67,
    "high": 1.00,
}

# Valid programming concepts
VALID_CONCEPTS = {"variables", "operators", "loops", "arrays", "methods"}


# ═══════════════════════════════════════════════════════════════════════
#  STEP 3 — NORMALISE INDIVIDUAL INDICATORS
# ═══════════════════════════════════════════════════════════════════════

def normalise_attempt_score(num_attempts):
    """
    Normalise the number of attempts to [0, 1].

    Fewer attempts indicate stronger understanding.
        AttemptScore = 1 / max(NumberOfAttempts, 1)

    Args:
        num_attempts (int): Number of attempts on the gamified activity.

    Returns:
        float: Normalised attempt score in [0.0, 1.0].
    """
    return min(1.0 / max(num_attempts, 1), 1.0)


def normalise_time_score(time_taken):
    """
    Normalise time taken to [0, 1].

    Shorter time (relative to the maximum) indicates more efficient processing.
        TimeScore = 1 − min(TimeTaken / MaxAllowedTime, 1.0)

    Args:
        time_taken (float): Seconds spent on the activity.

    Returns:
        float: Normalised time score in [0.0, 1.0].
    """
    return max(0.0, 1.0 - min(time_taken / MAX_ALLOWED_TIME, 1.0))


def normalise_error_severity(error_severity):
    """
    Invert error severity so that lower severity yields a higher score.

        ErrorSeverityScore = 1 − ErrorSeverity

    Args:
        error_severity (float): Raw severity in [0, 1] (0 = none, 1 = severe).

    Returns:
        float: Inverted score in [0.0, 1.0].
    """
    return max(0.0, 1.0 - min(error_severity, 1.0))


def map_confidence(level_str):
    """
    Map a self-reported confidence string to a numeric value.

    Args:
        level_str (str): One of "low", "medium", "high" (case-insensitive).

    Returns:
        float: Numeric confidence in {0.33, 0.67, 1.00}.
    """
    return CONFIDENCE_MAP.get(str(level_str).lower().strip(), 0.33)


# ═══════════════════════════════════════════════════════════════════════
#  STEP 4 — CALCULATE INTERACTION SCORE
# ═══════════════════════════════════════════════════════════════════════

def calculate_interaction_score(num_attempts, time_taken, error_severity):
    """
    Calculate the Interaction Score from learner activity metrics.

        InteractionScore = (0.40 × AttemptScore)
                         + (0.30 × TimeScore)
                         + (0.30 × ErrorSeverityScore)

    Args:
        num_attempts (int):    Number of attempts on the gamified activity.
        time_taken (float):    Seconds spent on the activity.
        error_severity (float): Error severity from Component 2 [0, 1].

    Returns:
        dict: Breakdown containing attempt_score, time_score,
              error_severity_score, and the combined interaction_score.
    """
    attempt = normalise_attempt_score(num_attempts)
    time_s = normalise_time_score(time_taken)
    error_s = normalise_error_severity(error_severity)

    interaction = (
        (WEIGHT_ATTEMPT * attempt)
        + (WEIGHT_TIME * time_s)
        + (WEIGHT_ERROR_SEVERITY * error_s)
    )
    interaction = max(0.0, min(interaction, 1.0))

    return {
        "attempt_score": round(attempt, 4),
        "time_score": round(time_s, 4),
        "error_severity_score": round(error_s, 4),
        "interaction_score": round(interaction, 4),
    }


# ═══════════════════════════════════════════════════════════════════════
#  STEP 5 & 6 — GRADE POST-TEST & CALCULATE VALIDATION SCORE
# ═══════════════════════════════════════════════════════════════════════

def calculate_posttest_validation_score(correct_count, total_questions,
                                        confidence_levels):
    """
    Calculate the Concept Post-Test Validation Score.

        PostTestAccuracy = CorrectCount / TotalQuestions
        AverageConfidence = mean(confidence_levels)
        ValidationScore = (0.70 × PostTestAccuracy) + (0.30 × AverageConfidence)

    Args:
        correct_count (int):       Number of correctly answered MCQs.
        total_questions (int):     Total MCQ questions (typically 10).
        confidence_levels (list):  List of numeric confidence values [0–1].

    Returns:
        dict: post_test_accuracy, average_confidence,
              post_test_validation_score.
    """
    total_questions = max(total_questions, 1)
    accuracy = correct_count / total_questions

    if confidence_levels:
        avg_confidence = sum(confidence_levels) / len(confidence_levels)
    else:
        avg_confidence = 0.5  # default when no confidence data

    validation = (WEIGHT_ACCURACY * accuracy) + (WEIGHT_CONFIDENCE * avg_confidence)
    validation = max(0.0, min(validation, 1.0))

    return {
        "post_test_accuracy": round(accuracy, 4),
        "average_confidence": round(avg_confidence, 4),
        "post_test_validation_score": round(validation, 4),
    }


# ═══════════════════════════════════════════════════════════════════════
#  STEP 7 — CALCULATE FINAL SCHEMA MASTERY SCORE
# ═══════════════════════════════════════════════════════════════════════

def calculate_final_mastery_score(pretest_score, interaction_score,
                                  gamified_score, posttest_validation_score):
    """
    Calculate the Final Schema Mastery Score using the weighted formula.

        FinalSchemaMasteryScore =
            (0.20 × ConceptPreTestScore)
          + (0.20 × InteractionScore)
          + (0.20 × GamifiedActivityScore)
          + (0.40 × ConceptPostTestValidationScore)

    Args:
        pretest_score (float):            Concept pre-test score [0, 1].
        interaction_score (float):        Interaction score [0, 1].
        gamified_score (float):           Gamified activity score [0, 1].
        posttest_validation_score (float): Post-test validation score [0, 1].

    Returns:
        float: Final mastery score clamped to [0.0, 1.0].
    """
    score = (
        (WEIGHT_PRETEST * pretest_score)
        + (WEIGHT_INTERACTION * interaction_score)
        + (WEIGHT_GAMIFIED * gamified_score)
        + (WEIGHT_POSTTEST * posttest_validation_score)
    )
    return round(max(0.0, min(score, 1.0)), 4)


# ═══════════════════════════════════════════════════════════════════════
#  STEP 8 — CLASSIFY SCHEMA STATE
# ═══════════════════════════════════════════════════════════════════════

def classify_schema_state(mastery_score):
    """
    Classify a mastery score into a schema state.

    Thresholds:
      >= 0.80  →  Stable Schema
      >= 0.60  →  Developing Schema
      >= 0.40  →  Fragile Schema
      <  0.40  →  Misconception Schema

    Args:
        mastery_score (float): Score between 0.0 and 1.0.

    Returns:
        str: One of "Stable", "Developing", "Fragile", "Misconception".
    """
    if mastery_score >= THRESHOLD_STABLE:
        return "Stable"
    elif mastery_score >= THRESHOLD_DEVELOPING:
        return "Developing"
    elif mastery_score >= THRESHOLD_FRAGILE:
        return "Fragile"
    else:
        return "Misconception"


# ═══════════════════════════════════════════════════════════════════════
#  STEP 9 — RULE-BASED HEURISTIC OVERRIDES
# ═══════════════════════════════════════════════════════════════════════

def apply_heuristic_overrides(schema_state, post_test_accuracy,
                              average_confidence, error_category,
                              post_test_errors):
    """
    Apply rule-based heuristic overrides to adjust the schema state.

    RULE 1 — Guessing Detection:
      If accuracy >= 0.70 AND confidence < 0.50 → Fragile.
    RULE 2 — Recurring Misconception Detection:
      If the same error category (from Component 2) reappears in post-test
      incorrect answers → Misconception.
    RULE 4 — Low Post-Test Override:
      If accuracy < 0.40 → at least Fragile.

    Args:
        schema_state (str):        Initial classification from Step 8.
        post_test_accuracy (float): Post-test accuracy [0, 1].
        average_confidence (float): Average confidence [0, 1].
        error_category (str|None): Error type from Component 2.
        post_test_errors (list):   List of misconception tags from wrong
                                   post-test answers.

    Returns:
        tuple: (adjusted_schema_state, list_of_applied_rules)
    """
    applied_rules = []
    adjusted = schema_state

    # RULE 1: Guessing Detection
    if (post_test_accuracy >= GUESSING_ACCURACY_THRESHOLD
            and average_confidence < GUESSING_CONFIDENCE_THRESHOLD):
        if adjusted not in ("Misconception",):
            adjusted = "Fragile"
            applied_rules.append(
                "RULE 1: High accuracy with low confidence — guessing detected"
            )

    # RULE 2: Recurring Misconception Detection
    if error_category and post_test_errors:
        category_lower = error_category.lower()
        for err in post_test_errors:
            if category_lower in str(err).lower():
                adjusted = "Misconception"
                applied_rules.append(
                    "RULE 2: Same misconception reappeared after reinforcement"
                )
                break

    # RULE 4: Low Post-Test Override
    if post_test_accuracy < LOW_POSTTEST_THRESHOLD:
        if adjusted in ("Stable", "Developing"):
            adjusted = "Fragile"
            applied_rules.append(
                "RULE 4: Very low post-test accuracy overrides to Fragile"
            )

    return adjusted, applied_rules


# ═══════════════════════════════════════════════════════════════════════
#  STEP 3 (RULE 3) — LEARNING GAIN
# ═══════════════════════════════════════════════════════════════════════

def calculate_learning_gain(pretest_score, posttest_validation_score):
    """
    Calculate the Learning Gain for a concept (RULE 3).

        LearningGain = PostTestValidationScore − ConceptPreTestScore
        NormalisedGain = LearningGain / (1.0 − PreTestScore)   [Hake, 1998]

    Args:
        pretest_score (float):             Concept pre-test score [0, 1].
        posttest_validation_score (float): Post-test validation score [0, 1].

    Returns:
        dict: raw_gain, normalised_gain, improved (bool).
    """
    raw_gain = round(posttest_validation_score - pretest_score, 4)

    if pretest_score < 1.0:
        normalised = raw_gain / (1.0 - pretest_score)
    else:
        normalised = 0.0  # already perfect

    return {
        "raw_gain": raw_gain,
        "normalised_gain": round(normalised, 4),
        "improved": raw_gain > 0,
    }


# ═══════════════════════════════════════════════════════════════════════
#  STEP 10 — PROGRESSION DECISION
# ═══════════════════════════════════════════════════════════════════════

def determine_progression(schema_state):
    """
    Determine whether the learner may advance to the next concept.

    - Stable         → ADVANCE
    - Developing     → ADVANCE_WITH_MONITORING
    - Fragile        → REINFORCE
    - Misconception  → REINFORCE

    Args:
        schema_state (str): Final classified schema state.

    Returns:
        str: One of "ADVANCE", "ADVANCE_WITH_MONITORING", "REINFORCE".
    """
    if schema_state == "Stable":
        return "ADVANCE"
    elif schema_state == "Developing":
        return "ADVANCE_WITH_MONITORING"
    else:
        return "REINFORCE"


# ═══════════════════════════════════════════════════════════════════════
#  HELPER — STATE COLOURS
# ═══════════════════════════════════════════════════════════════════════

def get_state_color(schema_state):
    """
    Return the display colour for a schema state.

    Args:
        schema_state (str): Schema state classification.

    Returns:
        str: CSS-friendly hex colour.
    """
    colors = {
        "Stable": "#34d399",        # green
        "Developing": "#fbbf24",    # yellow
        "Fragile": "#f97316",       # orange
        "Misconception": "#ef4444", # red
    }
    return colors.get(schema_state, "#8899aa")


# ═══════════════════════════════════════════════════════════════════════
#  FULL PIPELINE — Process a complete diagnostic cycle
# ═══════════════════════════════════════════════════════════════════════

def process_diagnostic(concept_id, pretest_score, error_category,
                       error_severity, gamified_score, num_attempts,
                       time_taken, correct_count, total_questions,
                       confidence_levels, post_test_errors=None):
    """
    Execute the full Concept-Specific Schema Mastery Tracking algorithm.

    This is the main entry point that orchestrates Steps 1–11 of the
    algorithm defined in the research document.

    Args:
        concept_id (str):          The concept reinforced (e.g. "loops").
        pretest_score (float):     Concept pre-test score [0, 1].
        error_category (str|None): Misconception type from Component 2.
        error_severity (float):    Error severity [0, 1].
        gamified_score (float):    Gamified activity score [0, 1].
        num_attempts (int):        Attempts on the gamified activity.
        time_taken (float):        Seconds spent on the activity.
        correct_count (int):       Correct post-test answers.
        total_questions (int):     Total post-test questions (10).
        confidence_levels (list):  Numeric confidence per answer [0–1].
        post_test_errors (list):   Misconception tags from wrong answers.

    Returns:
        dict: Complete diagnostic result including scores, breakdowns,
              schema state, learning gain, and progression decision.
    """
    if post_test_errors is None:
        post_test_errors = []

    # STEP 1: Validate concept
    assert concept_id in VALID_CONCEPTS, (
        f"Invalid concept '{concept_id}'. Must be one of {VALID_CONCEPTS}"
    )

    # STEP 3: Normalise — pre-test and gamified are already [0, 1]
    pretest_score = max(0.0, min(float(pretest_score), 1.0))
    gamified_score = max(0.0, min(float(gamified_score), 1.0))

    # STEP 4: Interaction Score
    interaction = calculate_interaction_score(
        num_attempts, time_taken, error_severity
    )

    # STEP 5 & 6: Post-Test Validation Score
    posttest = calculate_posttest_validation_score(
        correct_count, total_questions, confidence_levels
    )

    # STEP 7: Final Schema Mastery Score
    final_score = calculate_final_mastery_score(
        pretest_score,
        interaction["interaction_score"],
        gamified_score,
        posttest["post_test_validation_score"],
    )

    # STEP 8: Classify
    schema_state = classify_schema_state(final_score)

    # STEP 9: Heuristic Overrides
    schema_state, rules_applied = apply_heuristic_overrides(
        schema_state,
        posttest["post_test_accuracy"],
        posttest["average_confidence"],
        error_category,
        post_test_errors,
    )

    # RULE 3: Learning Gain
    learning_gain = calculate_learning_gain(
        pretest_score, posttest["post_test_validation_score"]
    )

    # STEP 10: Progression Decision
    progression = determine_progression(schema_state)

    return {
        "concept": concept_id,
        "final_mastery_score": final_score,
        "schema_state": schema_state,
        "color": get_state_color(schema_state),
        "progression_decision": progression,
        "learning_gain": learning_gain,
        "rules_applied": rules_applied,
        "breakdown": {
            "pretest_score": round(pretest_score, 4),
            "interaction": interaction,
            "gamified_activity_score": round(gamified_score, 4),
            "posttest": posttest,
        },
    }


# ═══════════════════════════════════════════════════════════════════════
#  LEGACY COMPAT — process_student (Stage 1 only, for dashboard)
# ═══════════════════════════════════════════════════════════════════════

def calculate_mastery_score(concept_data):
    """
    Legacy Stage-1-only mastery calculation from raw behaviour data.

    Retained for backward compatibility with the dashboard overview.
    Uses the old formula:
        mastery = (0.4 × correctness) + (0.2 × attempt)
                + (0.2 × quiz) + (0.2 × (1 − error_pattern))

    Args:
        concept_data (dict): Raw behaviour metrics for a single concept.

    Returns:
        dict: Breakdown of all scores + mastery_score.
    """
    total = max(concept_data.get("totalSubmissions", 1), 1)
    correct = concept_data.get("correctSubmissions", 0)
    attempts = max(concept_data.get("numberOfAttempts", 1), 1)
    quiz_marks = concept_data.get("quizMarks", 0)
    quiz_total = max(concept_data.get("quizTotal", 1), 1)
    error_pattern = concept_data.get("errorPatternScore", 0.0)

    correctness_score = min(correct / total, 1.0)
    attempt_score = min(1.0 / attempts, 1.0)
    quiz_score = min(quiz_marks / quiz_total, 1.0)
    error_pattern_score = max(0.0, min(error_pattern, 1.0))
    gamified_score = min(concept_data.get("gamifiedScore", correctness_score), 1.0)

    # Calculate EvidenceScore using the requested formula
    evidence_score = (
        (0.25 * correctness_score)
        + (0.20 * attempt_score)
        + (0.20 * gamified_score)
        + (0.20 * quiz_score)
        + (0.15 * (1.0 - error_pattern_score))
    )
    evidence_score = max(0.0, min(evidence_score, 1.0))

    return {
        "correctness_score": round(correctness_score, 4),
        "attempt_score": round(attempt_score, 4),
        "quiz_score": round(quiz_score, 4),
        "error_pattern_score": round(error_pattern_score, 4),
        "gamified_score": round(gamified_score, 4),
        "evidence_score": round(evidence_score, 4),
        "mastery_score": round(evidence_score, 4), # Keep mastery_score mapped to evidence_score for backward compat
    }


def needs_posttest(schema_state):
    """
    Determine whether a diagnostic post-test should be triggered.

    Post-test is ALWAYS required before confirming Stable Schema.
    """
    return True


def determine_final_state(mastery_score, mcq_correct, mcq_total):
    """
    Legacy Stage-2 validation (kept for backward compat).

    Uses the new algorithm internally when possible.

    Args:
        mastery_score (float): Stage 1 mastery score.
        mcq_correct (int):     Correct MCQ answers.
        mcq_total (int):       Total MCQ questions.

    Returns:
        str: Final schema state.
    """
    mcq_total = max(mcq_total, 1)
    mcq_accuracy = mcq_correct / mcq_total

    # Use improved thresholds
    high_mastery = mastery_score >= THRESHOLD_DEVELOPING
    good_mcq = mcq_accuracy >= 0.67

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
    Process all concepts for a single student (Stage 1 dashboard view).

    Args:
        student_data (dict): Student document from Firestore.

    Returns:
        dict: Complete mastery analysis for the student.
    """
    student_id = student_data.get("studentId", "unknown")
    student_name = student_data.get("studentName", "Unknown")
    concepts = student_data.get("concepts", {})

    results = {}
    total_mastery = 0.0
    concept_count = 0

    for concept_name, concept_data in concepts.items():
        scores = calculate_mastery_score(concept_data)
        mastery = scores["mastery_score"]
        state = classify_schema_state(mastery)
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
