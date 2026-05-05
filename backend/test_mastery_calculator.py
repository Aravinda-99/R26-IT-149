"""
Test Mastery Calculator — Improved Algorithm
=============================================
Tests the full Concept-Specific Schema Mastery Tracking algorithm
including interaction scores, post-test validation with confidence,
heuristic overrides, learning gain, and progression decisions.

Usage:
  cd backend
  venv\\Scripts\\activate
  python test_mastery_calculator.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from mastery_calculator import (
    calculate_mastery_score,
    classify_schema_state,
    needs_posttest,
    determine_final_state,
    process_student,
    calculate_interaction_score,
    calculate_posttest_validation_score,
    calculate_final_mastery_score,
    apply_heuristic_overrides,
    calculate_learning_gain,
    determine_progression,
    map_confidence,
    process_diagnostic,
    normalise_attempt_score,
    normalise_time_score,
    normalise_error_severity,
)
from data.mock_students import mock_students


def print_separator():
    print("-" * 70)


def test_normalisation():
    """Test individual normalisation functions."""
    print()
    print("=" * 70)
    print("  TEST 1: Normalisation Functions")
    print("=" * 70)

    print("\n  normalise_attempt_score:")
    for attempts in [1, 2, 3, 5, 10]:
        score = normalise_attempt_score(attempts)
        print(f"    {attempts} attempts -> {score:.4f}")

    print("\n  normalise_time_score:")
    for t in [0, 60, 180, 300, 600, 900]:
        score = normalise_time_score(t)
        print(f"    {t}s -> {score:.4f}")

    print("\n  normalise_error_severity:")
    for sev in [0.0, 0.25, 0.5, 0.75, 1.0]:
        score = normalise_error_severity(sev)
        print(f"    {sev} -> {score:.4f}")

    print("\n  map_confidence:")
    for level in ["low", "medium", "high", "Low", "HIGH"]:
        val = map_confidence(level)
        print(f"    '{level}' -> {val}")


def test_interaction_score():
    """Test the Interaction Score calculation."""
    print()
    print("=" * 70)
    print("  TEST 2: Interaction Score")
    print("=" * 70)

    cases = [
        (1, 60, 0.1, "Excellent learner"),
        (3, 200, 0.5, "Average learner"),
        (8, 500, 0.9, "Struggling learner"),
    ]
    for attempts, time, severity, desc in cases:
        result = calculate_interaction_score(attempts, time, severity)
        print(f"\n  {desc} (attempts={attempts}, time={time}s, error={severity}):")
        print(f"    Attempt Score:  {result['attempt_score']}")
        print(f"    Time Score:     {result['time_score']}")
        print(f"    Error Score:    {result['error_severity_score']}")
        print(f"    INTERACTION:    {result['interaction_score']}")


def test_posttest_validation():
    """Test the Post-Test Validation Score calculation."""
    print()
    print("=" * 70)
    print("  TEST 3: Post-Test Validation Score")
    print("=" * 70)

    cases = [
        (9, 10, [1.0]*10, "High accuracy + high confidence"),
        (8, 10, [0.33]*10, "High accuracy + low confidence"),
        (3, 10, [1.0]*10, "Low accuracy + high confidence"),
        (2, 10, [0.33]*10, "Low accuracy + low confidence"),
    ]
    for correct, total, conf, desc in cases:
        result = calculate_posttest_validation_score(correct, total, conf)
        print(f"\n  {desc} ({correct}/{total}):")
        print(f"    Accuracy:    {result['post_test_accuracy']}")
        print(f"    Avg Conf:    {result['average_confidence']}")
        print(f"    VALIDATION:  {result['post_test_validation_score']}")


def test_final_mastery_score():
    """Test the weighted Final Schema Mastery Score."""
    print()
    print("=" * 70)
    print("  TEST 4: Final Schema Mastery Score")
    print("=" * 70)

    cases = [
        (0.9, 0.85, 0.9, 0.92, "Strong learner"),
        (0.5, 0.6, 0.7, 0.65, "Average learner"),
        (0.3, 0.3, 0.4, 0.25, "Weak learner"),
    ]
    for pre, inter, gam, post, desc in cases:
        score = calculate_final_mastery_score(pre, inter, gam, post)
        state = classify_schema_state(score)
        prog = determine_progression(state)
        print(f"\n  {desc}:")
        print(f"    Pre={pre} Inter={inter} Gam={gam} Post={post}")
        print(f"    FINAL SCORE: {score:.4f} -> {state} -> {prog}")


def test_heuristic_overrides():
    """Test rule-based heuristic overrides."""
    print()
    print("=" * 70)
    print("  TEST 5: Heuristic Override Rules")
    print("=" * 70)

    # Rule 1: Guessing Detection
    state, rules = apply_heuristic_overrides(
        "Stable", 0.80, 0.40, None, [])
    print(f"\n  RULE 1 (high acc + low conf): {state}")
    for r in rules:
        print(f"    -> {r}")

    # Rule 2: Recurring Misconception
    state, rules = apply_heuristic_overrides(
        "Developing", 0.60, 0.70, "off-by-one", ["off-by-one_q3"])
    print(f"\n  RULE 2 (recurring misconception): {state}")
    for r in rules:
        print(f"    -> {r}")

    # Rule 4: Low Post-Test
    state, rules = apply_heuristic_overrides(
        "Developing", 0.30, 0.70, None, [])
    print(f"\n  RULE 4 (low post-test acc): {state}")
    for r in rules:
        print(f"    -> {r}")

    # No rules triggered
    state, rules = apply_heuristic_overrides(
        "Stable", 0.85, 0.80, None, [])
    print(f"\n  No rules triggered: {state} (rules: {rules})")


def test_learning_gain():
    """Test Learning Gain calculation."""
    print()
    print("=" * 70)
    print("  TEST 6: Learning Gain")
    print("=" * 70)

    cases = [
        (0.30, 0.80, "Big improvement"),
        (0.70, 0.75, "Small improvement"),
        (0.60, 0.50, "Regression"),
        (1.00, 1.00, "Already perfect"),
    ]
    for pre, post, desc in cases:
        gain = calculate_learning_gain(pre, post)
        print(f"\n  {desc} (pre={pre}, post={post}):")
        print(f"    Raw Gain:        {gain['raw_gain']}")
        print(f"    Normalised Gain: {gain['normalised_gain']}")
        print(f"    Improved:        {gain['improved']}")


def test_full_diagnostic_pipeline():
    """Test the complete process_diagnostic pipeline."""
    print()
    print("=" * 70)
    print("  TEST 7: Full Diagnostic Pipeline")
    print("=" * 70)

    cases = [
        {
            "desc": "Strong learner — Loops",
            "concept_id": "loops",
            "pretest_score": 0.70,
            "error_category": "off-by-one",
            "error_severity": 0.3,
            "gamified_score": 0.85,
            "num_attempts": 1,
            "time_taken": 120,
            "correct_count": 9,
            "total_questions": 10,
            "confidence_levels": [1.0]*10,
        },
        {
            "desc": "Guesser — Arrays (high acc, low conf)",
            "concept_id": "arrays",
            "pretest_score": 0.40,
            "error_category": None,
            "error_severity": 0.5,
            "gamified_score": 0.60,
            "num_attempts": 3,
            "time_taken": 300,
            "correct_count": 8,
            "total_questions": 10,
            "confidence_levels": [0.33]*10,
        },
        {
            "desc": "Struggling — Methods",
            "concept_id": "methods",
            "pretest_score": 0.20,
            "error_category": "missing return",
            "error_severity": 0.8,
            "gamified_score": 0.40,
            "num_attempts": 7,
            "time_taken": 500,
            "correct_count": 3,
            "total_questions": 10,
            "confidence_levels": [0.33]*10,
        },
    ]

    for case in cases:
        desc = case.pop("desc")
        result = process_diagnostic(**case)
        print(f"\n  {desc}:")
        print_separator()
        print(f"    Concept:            {result['concept']}")
        print(f"    Final Mastery:      {result['final_mastery_score']:.4f}")
        print(f"    Schema State:       {result['schema_state']}")
        print(f"    Progression:        {result['progression_decision']}")
        print(f"    Learning Gain:      {result['learning_gain']['raw_gain']}")
        print(f"    Normalised Gain:    {result['learning_gain']['normalised_gain']}")
        if result["rules_applied"]:
            for rule in result["rules_applied"]:
                print(f"    Rule Applied:       {rule}")


def test_legacy_pipeline():
    """Test legacy Stage 1 pipeline with mock students."""
    print()
    print("=" * 70)
    print("  TEST 8: Legacy Stage 1 Pipeline (Mock Students)")
    print("=" * 70)

    for student in mock_students:
        result = process_student(student)
        print()
        print_separator()
        print(f"  Student: {result['studentName']} ({result['studentId']})")
        print(f"  Overall: {result['overall_mastery']:.2%} -> {result['overall_state']}")
        print_separator()

        for concept, data in result["concepts"].items():
            flag = " [NEEDS POST-TEST]" if data["needs_posttest"] else ""
            print(f"    {concept:15s}  {data['mastery_score']:.2%}  "
                  f"{data['schema_state']:15s}{flag}")

    print()


if __name__ == "__main__":
    test_normalisation()
    test_interaction_score()
    test_posttest_validation()
    test_final_mastery_score()
    test_heuristic_overrides()
    test_learning_gain()
    test_full_diagnostic_pipeline()
    test_legacy_pipeline()
    print("All tests completed!")
    print()
