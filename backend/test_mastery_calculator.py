"""
Test Mastery Calculator
=======================
Verifies the Stage 1 algorithm against the 3 mock students.

Expected results:
  STU001 (Good Student)       -> Stable
  STU002 (Average Student)    -> Developing
  STU003 (Struggling Student) -> Fragile / Misconception

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
)
from data.mock_students import mock_students


def print_separator():
    print("-" * 70)


def test_individual_functions():
    """Test each function independently."""
    print()
    print("=" * 70)
    print("  TEST 1: Individual Function Tests")
    print("=" * 70)

    # Test calculate_mastery_score with STU001 variables
    data = {"totalSubmissions": 10, "correctSubmissions": 9, "numberOfAttempts": 1,
            "quizMarks": 9, "quizTotal": 10, "errorPatternScore": 0.1}
    result = calculate_mastery_score(data)
    print()
    print("  calculate_mastery_score (STU001 variables):")
    print(f"    Correctness: {result['correctness_score']}")
    print(f"    Attempt:     {result['attempt_score']}")
    print(f"    Quiz:        {result['quiz_score']}")
    print(f"    Error:       {result['error_pattern_score']}")
    print(f"    MASTERY:     {result['mastery_score']}")

    # Test classify_schema_state
    print()
    print("  classify_schema_state:")
    for score in [0.92, 0.75, 0.50, 0.25]:
        state = classify_schema_state(score)
        print(f"    {score:.2f} -> {state}")

    # Test needs_posttest
    print()
    print("  needs_posttest:")
    for state in ["Stable", "Developing", "Fragile", "Misconception"]:
        print(f"    {state} -> {needs_posttest(state)}")

    # Test determine_final_state
    print()
    print("  determine_final_state:")
    cases = [
        (0.75, 3, 3, "High mastery + good MCQ"),
        (0.75, 1, 3, "High mastery + poor MCQ"),
        (0.40, 3, 3, "Low mastery + good MCQ"),
        (0.40, 0, 3, "Low mastery + poor MCQ"),
    ]
    for mastery, correct, total, desc in cases:
        final = determine_final_state(mastery, correct, total)
        print(f"    {desc}: mastery={mastery}, MCQ={correct}/{total} -> {final}")


def test_full_pipeline():
    """Test the full pipeline with all 3 mock students."""
    print()
    print("=" * 70)
    print("  TEST 2: Full Pipeline (process_student)")
    print("=" * 70)

    for student in mock_students:
        result = process_student(student)
        print()
        print_separator()
        print(f"  Student: {result['studentName']} ({result['studentId']})")
        print(f"  Overall: {result['overall_mastery']:.2%} -> {result['overall_state']}")
        print_separator()

        for concept, data in result["concepts"].items():
            posttest_flag = " [NEEDS POST-TEST]" if data["needs_posttest"] else ""
            print(f"    {concept:15s}  {data['mastery_score']:.2%}  {data['schema_state']:15s}{posttest_flag}")
            b = data["breakdown"]
            print(f"                     correctness={b['correctness_score']:.2f}  "
                  f"attempt={b['attempt_score']:.2f}  "
                  f"quiz={b['quiz_score']:.2f}  "
                  f"error={b['error_pattern_score']:.2f}")

    print()


def test_edge_cases():
    """Test edge cases for robustness."""
    print()
    print("=" * 70)
    print("  TEST 3: Edge Cases")
    print("=" * 70)

    # All zeros
    zero_data = {"totalSubmissions": 0, "correctSubmissions": 0, "numberOfAttempts": 0,
                 "quizMarks": 0, "quizTotal": 0, "errorPatternScore": 0.0}
    result = calculate_mastery_score(zero_data)
    state = classify_schema_state(result["mastery_score"])
    print(f"\n  All zeros:  mastery={result['mastery_score']:.4f} -> {state}")

    # Perfect scores
    perfect_data = {"totalSubmissions": 10, "correctSubmissions": 10, "numberOfAttempts": 1,
                    "quizMarks": 10, "quizTotal": 10, "errorPatternScore": 0.0}
    result = calculate_mastery_score(perfect_data)
    state = classify_schema_state(result["mastery_score"])
    print(f"  Perfect:    mastery={result['mastery_score']:.4f} -> {state}")

    # Worst case
    worst_data = {"totalSubmissions": 10, "correctSubmissions": 0, "numberOfAttempts": 10,
                  "quizMarks": 0, "quizTotal": 10, "errorPatternScore": 1.0}
    result = calculate_mastery_score(worst_data)
    state = classify_schema_state(result["mastery_score"])
    print(f"  Worst:      mastery={result['mastery_score']:.4f} -> {state}")

    print()


if __name__ == "__main__":
    test_individual_functions()
    test_full_pipeline()
    test_edge_cases()
    print("All tests completed!")
    print()
