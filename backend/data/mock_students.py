"""
Mock Student Data
=================
Simulated student behaviour data for testing the Schema Mastery Tracker.
Each student has interaction metrics for 5 programming concepts:
  - Variables, Conditionals, Loops, Arrays, Methods

Metrics per concept:
  totalSubmissions   — total code submissions
  correctSubmissions — number of correct submissions
  numberOfAttempts   — number of attempts before passing
  timeToComplete     — time in seconds to complete the activity
  quizMarks          — marks scored on the concept quiz
  quizTotal          — total marks available on the quiz
  errorPatternScore  — error severity indicator (0 = no errors, 1 = many errors)
"""

mock_students = [
    {
        "studentId": "STU001",
        "studentName": "Good Student",
        # Expected result: Stable
        "concepts": {
            "variables": {
                "totalSubmissions": 10,
                "correctSubmissions": 9,
                "numberOfAttempts": 1,
                "timeToComplete": 25,
                "quizMarks": 9,
                "quizTotal": 10,
                "errorPatternScore": 0.1,
            },
            "conditionals": {
                "totalSubmissions": 10,
                "correctSubmissions": 8,
                "numberOfAttempts": 2,
                "timeToComplete": 35,
                "quizMarks": 8,
                "quizTotal": 10,
                "errorPatternScore": 0.15,
            },
            "loops": {
                "totalSubmissions": 10,
                "correctSubmissions": 8,
                "numberOfAttempts": 2,
                "timeToComplete": 40,
                "quizMarks": 8,
                "quizTotal": 10,
                "errorPatternScore": 0.2,
            },
            "arrays": {
                "totalSubmissions": 10,
                "correctSubmissions": 9,
                "numberOfAttempts": 1,
                "timeToComplete": 30,
                "quizMarks": 9,
                "quizTotal": 10,
                "errorPatternScore": 0.1,
            },
            "methods": {
                "totalSubmissions": 10,
                "correctSubmissions": 7,
                "numberOfAttempts": 3,
                "timeToComplete": 45,
                "quizMarks": 7,
                "quizTotal": 10,
                "errorPatternScore": 0.25,
            },
        },
    },
    {
        "studentId": "STU002",
        "studentName": "Average Student",
        # Expected result: Developing
        "concepts": {
            "variables": {
                "totalSubmissions": 10,
                "correctSubmissions": 6,
                "numberOfAttempts": 4,
                "timeToComplete": 70,
                "quizMarks": 6,
                "quizTotal": 10,
                "errorPatternScore": 0.45,
            },
            "conditionals": {
                "totalSubmissions": 10,
                "correctSubmissions": 7,
                "numberOfAttempts": 3,
                "timeToComplete": 60,
                "quizMarks": 6,
                "quizTotal": 10,
                "errorPatternScore": 0.4,
            },
            "loops": {
                "totalSubmissions": 10,
                "correctSubmissions": 6,
                "numberOfAttempts": 5,
                "timeToComplete": 80,
                "quizMarks": 5,
                "quizTotal": 10,
                "errorPatternScore": 0.5,
            },
            "arrays": {
                "totalSubmissions": 10,
                "correctSubmissions": 7,
                "numberOfAttempts": 4,
                "timeToComplete": 65,
                "quizMarks": 6,
                "quizTotal": 10,
                "errorPatternScore": 0.4,
            },
            "methods": {
                "totalSubmissions": 10,
                "correctSubmissions": 5,
                "numberOfAttempts": 5,
                "timeToComplete": 90,
                "quizMarks": 5,
                "quizTotal": 10,
                "errorPatternScore": 0.55,
            },
        },
    },
    {
        "studentId": "STU003",
        "studentName": "Struggling Student",
        # Expected result: Fragile / Misconception
        "concepts": {
            "variables": {
                "totalSubmissions": 10,
                "correctSubmissions": 2,
                "numberOfAttempts": 9,
                "timeToComplete": 150,
                "quizMarks": 2,
                "quizTotal": 10,
                "errorPatternScore": 0.9,
            },
            "conditionals": {
                "totalSubmissions": 10,
                "correctSubmissions": 3,
                "numberOfAttempts": 8,
                "timeToComplete": 130,
                "quizMarks": 3,
                "quizTotal": 10,
                "errorPatternScore": 0.85,
            },
            "loops": {
                "totalSubmissions": 10,
                "correctSubmissions": 2,
                "numberOfAttempts": 10,
                "timeToComplete": 160,
                "quizMarks": 1,
                "quizTotal": 10,
                "errorPatternScore": 0.95,
            },
            "arrays": {
                "totalSubmissions": 10,
                "correctSubmissions": 4,
                "numberOfAttempts": 7,
                "timeToComplete": 120,
                "quizMarks": 3,
                "quizTotal": 10,
                "errorPatternScore": 0.8,
            },
            "methods": {
                "totalSubmissions": 10,
                "correctSubmissions": 3,
                "numberOfAttempts": 8,
                "timeToComplete": 140,
                "quizMarks": 2,
                "quizTotal": 10,
                "errorPatternScore": 0.88,
            },
        },
    },
]
