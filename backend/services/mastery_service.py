"""
Component 4: Schema Mastery Tracker -- Service
===============================================
Business logic for concept-specific schema mastery tracking,
diagnostic post-tests, and dashboard data.

Handles:
  - Stage 1: Fetching behaviour data and computing mastery scores
  - Stage 2: Concept-specific diagnostic post-test with confidence
  - Stage 3: Dashboard-ready data, history, and progression decisions
"""

from firebase.firebase_service import db
from mastery_calculator import (
    VALID_CONCEPTS,
    calculate_mastery_score,
    classify_schema_state,
    needs_posttest,
    determine_final_state,
    get_state_color,
    process_student,
    calculate_interaction_score,
    calculate_posttest_validation_score,
    calculate_final_mastery_score,
    apply_heuristic_overrides,
    calculate_learning_gain,
    determine_progression,
    map_confidence,
    process_diagnostic,
)
from utils.helpers import timestamp_now


# Display names for concepts
CONCEPT_NAMES = {
    "variables": "Variables & Data Types",
    "operators": "Operators & Expressions",
    "loops": "Loops & Iteration",
    "arrays": "Arrays & Lists",
    "methods": "Methods & Functions",
}


class MasteryService:

    # -----------------------------------------------------------------
    # COMPONENT 4 FEATURE: MCQ score -> level + feedback
    # -----------------------------------------------------------------
    @staticmethod
    def _classify_mcq_level(score_percentage):
        """
        Classify MCQ score percentage into a level for Component 4.

        80% – 100% = Stable Level
        60% – 79%  = Developing Level
        40% – 59%  = Fragile Level
        0%  – 39%  = Misconception Level
        """
        pct = max(0.0, min(float(score_percentage), 100.0))
        if pct >= 80.0:
            return "Stable Level"
        if pct >= 60.0:
            return "Developing Level"
        if pct >= 40.0:
            return "Fragile Level"
        return "Misconception Level"

    @staticmethod
    def _mcq_level_feedback(level):
        feedback = {
            "Stable Level": (
                "Great work! Your answers show stable understanding of this concept. "
                "You are ready to move to the next concept."
            ),
            "Developing Level": (
                "Good progress! You understand the concept, but more practice will help you strengthen your knowledge."
            ),
            "Fragile Level": (
                "You have some understanding, but your concept is still unstable. "
                "Please review the gamified activity and try again."
            ),
            "Misconception Level": (
                "You may have misunderstood this concept. "
                "Please repeat the reinforcement activity before moving forward."
            ),
        }
        return feedback.get(level, "Keep practicing to improve your mastery.")

    @staticmethod
    def _mcq_pass_fail(score_percentage):
        return float(score_percentage) >= 60.0

    @staticmethod
    def _mcq_pass_fail_feedback(passed, level):
        if passed and level == "Stable Level":
            return "Great work! You have shown stable understanding of this concept. You can move forward."
        if passed and level == "Developing Level":
            return "Good progress! You passed this post-test, but you can still improve with more practice."
        if not passed and level == "Fragile Level":
            return "Your understanding is still not stable. Please repeat the gamified lesson and try the quiz again."
        if not passed and level == "Misconception Level":
            return "You may have misunderstood this concept. Please learn this concept again through the gamified activity before retrying the quiz."
        # Fallbacks (should not happen with the defined thresholds)
        return MasteryService._mcq_level_feedback(level)

    # -----------------------------------------------------------------
    # GET STATUS — Stage 1 mastery calculation
    # -----------------------------------------------------------------
    @staticmethod
    def get_status(user_id):
        """
        Fetch student behaviour data from Firestore, run the mastery
        calculator, save results, and return the full mastery status.
        """
        if not db:
            return MasteryService._offline_status(user_id)

        doc_ref = db.collection("student_behaviour").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return {
                "error": f"No behaviour data found for student '{user_id}'",
                "user_id": user_id,
                "found": False,
            }

        student_data = doc.to_dict()
        result = process_student(student_data)

        now = timestamp_now()
        for concept_name, concept_result in result["concepts"].items():
            mastery_doc = {
                "user_id": user_id,
                "concept": concept_name,
                "concept_name": CONCEPT_NAMES.get(concept_name, concept_name),
                "mastery_score": concept_result["mastery_score"],
                "schema_state": concept_result["schema_state"],
                "color": concept_result["color"],
                "needs_posttest": concept_result["needs_posttest"],
                "correctness_score": concept_result["breakdown"]["correctness_score"],
                "attempt_score": concept_result["breakdown"]["attempt_score"],
                "quiz_score": concept_result["breakdown"]["quiz_score"],
                "error_pattern_score": concept_result["breakdown"]["error_pattern_score"],
                "diagnostic_validated": False,
                "final_state": "",
                "progression_decision": "",
                "learning_gain": 0.0,
                "last_assessed": now,
            }
            doc_id = f"{user_id}_{concept_name}"
            db.collection("schema_mastery").document(doc_id).set(mastery_doc)

        history_entry = {
            "user_id": user_id,
            "overall_mastery": result["overall_mastery"],
            "overall_state": result["overall_state"],
            "concepts": {
                name: {
                    "mastery_score": data["mastery_score"],
                    "schema_state": data["schema_state"],
                }
                for name, data in result["concepts"].items()
            },
            "timestamp": now,
        }
        db.collection("mastery_history").add(history_entry)

        return {
            "user_id": user_id,
            "found": True,
            "studentName": result["studentName"],
            "overall_mastery": result["overall_mastery"],
            "overall_state": result["overall_state"],
            "overall_color": result["overall_color"],
            "total_concepts": result["total_concepts"],
            "concepts": result["concepts"],
        }

    # -----------------------------------------------------------------
    # GET ALL STUDENTS
    # -----------------------------------------------------------------
    @staticmethod
    def get_all_students():
        """Fetch all students from Firestore and compute mastery for each."""
        if not db:
            return []

        docs = db.collection("student_behaviour").stream()
        students = []

        for doc in docs:
            student_data = doc.to_dict()
            result = process_student(student_data)
            students.append({
                "studentId": result["studentId"],
                "studentName": result["studentName"],
                "overall_mastery": result["overall_mastery"],
                "overall_state": result["overall_state"],
                "overall_color": result["overall_color"],
                "total_concepts": result["total_concepts"],
            })

        return students

    # -----------------------------------------------------------------
    # UPDATE MASTERY — Re-calculate after new activity data
    # -----------------------------------------------------------------
    @staticmethod
    def update(data):
        """Update behaviour data for a student and recalculate mastery."""
        user_id = data.get("user_id")
        concept = data.get("concept")
        metrics = data.get("metrics", {})

        if not user_id or not concept:
            return {"error": "Missing user_id or concept"}

        if not db:
            return {"message": "Offline mode - cannot update"}

        doc_ref = db.collection("student_behaviour").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return {"error": f"No behaviour data found for '{user_id}'"}

        doc_ref.update({f"concepts.{concept}": metrics})

        scores = calculate_mastery_score(metrics)
        state = classify_schema_state(scores["mastery_score"])
        requires_posttest = needs_posttest(state)

        now = timestamp_now()
        mastery_doc = {
            "user_id": user_id,
            "concept": concept,
            "concept_name": CONCEPT_NAMES.get(concept, concept),
            "mastery_score": scores["mastery_score"],
            "schema_state": state,
            "color": get_state_color(state),
            "needs_posttest": requires_posttest,
            "correctness_score": scores["correctness_score"],
            "attempt_score": scores["attempt_score"],
            "quiz_score": scores["quiz_score"],
            "error_pattern_score": scores["error_pattern_score"],
            "diagnostic_validated": False,
            "final_state": "",
            "progression_decision": "",
            "learning_gain": 0.0,
            "last_assessed": now,
        }
        doc_id = f"{user_id}_{concept}"
        db.collection("schema_mastery").document(doc_id).set(mastery_doc)

        return {
            "message": "Mastery updated successfully",
            "user_id": user_id,
            "concept": concept,
            "mastery_score": scores["mastery_score"],
            "schema_state": state,
            "color": get_state_color(state),
            "needs_posttest": requires_posttest,
        }

    # -----------------------------------------------------------------
    # GET MCQ QUESTIONS — Concept-specific diagnostic questions
    # -----------------------------------------------------------------
    @staticmethod
    def get_questions(concept):
        """
        Fetch MCQ diagnostic questions for a specific concept.
        Only returns questions for the requested concept (not all 50).
        Answers are stripped before sending to the client.
        """
        if not db:
            from data.mcq_questions import mcq_questions
            questions = mcq_questions.get(concept, [])
            return {
                "concept": concept,
                "concept_name": CONCEPT_NAMES.get(concept, concept),
                "total_questions": len(questions),
                "questions": [
                    {
                        "id": q["id"],
                        "type": q["type"],
                        "question": q["question"],
                        "code": q.get("code"),
                        "options": q["options"],
                        "difficulty": q.get("difficulty", "medium"),
                        "confidence_prompt": q.get(
                            "confidence_prompt",
                            "How confident are you about this answer? Low / Medium / High"
                        ),
                    }
                    for q in questions
                ],
            }

        docs = db.collection("mcq_questions").where("concept", "==", concept).stream()
        questions = []
        for doc in docs:
            data = doc.to_dict()
            questions.append({
                "id": data["id"],
                "type": data["type"],
                "question": data["question"],
                "code": data.get("code"),
                "options": data["options"],
                "difficulty": data.get("difficulty", "medium"),
                "confidence_prompt": data.get(
                    "confidence_prompt",
                    "How confident are you about this answer? Low / Medium / High"
                ),
            })

        return {
            "concept": concept,
            "concept_name": CONCEPT_NAMES.get(concept, concept),
            "total_questions": len(questions),
            "questions": questions,
        }

    # -----------------------------------------------------------------
    # SUBMIT DIAGNOSTIC — Concept-specific post-test with confidence
    # -----------------------------------------------------------------
    @staticmethod
    def submit_diagnostic(data):
        """
        Process submitted MCQ diagnostic answers with confidence levels
        and determine final schema state using the improved algorithm.

        Expects JSON body:
        {
            "user_id": "STU001",
            "concept": "loops",
            "pretest_score": 0.30,
            "error_category": "off-by-one error",
            "error_severity": 0.7,
            "gamified_score": 0.75,
            "num_attempts": 2,
            "time_taken": 180,
            "answers": [
                {"question_id": "LOOPS_OP_01", "selected_option": "B",
                 "confidence": "high"},
                ...
            ]
        }
        """
        user_id = data.get("user_id")
        concept = data.get("concept")
        answers = data.get("answers", [])

        if not user_id or not concept or not answers:
            return {"error": "Missing user_id, concept, or answers"}

        if concept not in VALID_CONCEPTS:
            return {
                "error": f"Invalid concept '{concept}'",
                "valid_concepts": sorted(VALID_CONCEPTS),
            }

        # --- Collect input parameters ---
        pretest_score = float(data.get("pretest_score", 0.0))
        error_category = data.get("error_category", None)
        error_severity = float(data.get("error_severity", 0.0))
        gamified_score = float(data.get("gamified_score", 0.0))
        num_attempts = int(data.get("num_attempts", 1))
        time_taken = float(data.get("time_taken", 0))

        # --- Get correct answers ---
        correct_answers = {}
        explanations = {}
        schema_purposes = {}
        if db:
            docs = db.collection("mcq_questions").where("concept", "==", concept).stream()
            for doc in docs:
                q = doc.to_dict()
                correct_answers[q["id"]] = q["answer"]
                explanations[q["id"]] = q.get("explanation", "")
                schema_purposes[q["id"]] = q.get("schema_validation_purpose", "")
        else:
            from data.mcq_questions import mcq_questions
            for q in mcq_questions.get(concept, []):
                correct_answers[q["id"]] = q["answer"]
                explanations[q["id"]] = q.get("explanation", "")
                schema_purposes[q["id"]] = q.get("schema_validation_purpose", "")

        # --- Grade answers and collect confidence ---
        results = []
        correct_count = 0
        confidence_values = []
        post_test_errors = []

        for answer in answers:
            q_id = answer.get("question_id")
            selected = answer.get("selected_option")
            confidence_str = answer.get("confidence", "medium")
            correct_option = correct_answers.get(q_id, "")
            is_correct = selected == correct_option

            conf_value = map_confidence(confidence_str)
            confidence_values.append(conf_value)

            if is_correct:
                correct_count += 1
            else:
                post_test_errors.append(q_id)

            results.append({
                "question_id": q_id,
                "selected": selected,
                "correct": correct_option,
                "is_correct": is_correct,
                "confidence": confidence_str,
                "confidence_value": conf_value,
                "explanation": explanations.get(q_id, ""),
                "schema_validation_purpose": schema_purposes.get(q_id, ""),
            })

        total_questions = len(answers)
        wrong_count = max(0, total_questions - correct_count)
        score_percentage = (correct_count / max(total_questions, 1)) * 100.0
        current_level = MasteryService._classify_mcq_level(score_percentage)
        passed = MasteryService._mcq_pass_fail(score_percentage)
        post_test_status = "PASSED" if passed else "FAILED"
        next_action = "DONE" if passed else "LEARN_AGAIN"
        feedback_message = MasteryService._mcq_pass_fail_feedback(passed, current_level)

        # --- Load Stage-1 mastery from Firestore when not sent in the request ---
        mastery_data_from_db = None
        if db:
            mastery_doc_id = f"{user_id}_{concept}"
            mastery_doc = db.collection("schema_mastery").document(mastery_doc_id).get()
            if mastery_doc.exists:
                mastery_data_from_db = mastery_doc.to_dict()
                if pretest_score == 0.0:
                    pretest_score = float(
                        mastery_data_from_db.get("mastery_score", 0.0) or 0.0
                    )

        pre_test_state = data.get("schema_state_before") or data.get("pre_test_state")
        if not pre_test_state and mastery_data_from_db:
            pre_test_state = mastery_data_from_db.get("schema_state")
        if not pre_test_state:
            pre_test_state = classify_schema_state(
                max(0.0, min(float(pretest_score), 1.0))
            )

        # --- Run the full diagnostic algorithm ---
        diagnostic_result = process_diagnostic(
            concept_id=concept,
            pretest_score=pretest_score,
            error_category=error_category,
            error_severity=error_severity,
            gamified_score=gamified_score,
            num_attempts=num_attempts,
            time_taken=time_taken,
            correct_count=correct_count,
            total_questions=total_questions,
            confidence_levels=confidence_values,
            post_test_errors=post_test_errors,
        )

        # --- Save to Firestore ---
        now = timestamp_now()
        diagnostic_doc = {
            "user_id": user_id,
            "concept": concept,
            "concept_name": CONCEPT_NAMES.get(concept, concept),
            "questions_asked": total_questions,
            "correct_answers": correct_count,
            "post_test_accuracy": diagnostic_result["breakdown"]["posttest"]["post_test_accuracy"],
            "average_confidence": diagnostic_result["breakdown"]["posttest"]["average_confidence"],
            "answers": results,
            "pretest_score": pretest_score,
            "gamified_score": gamified_score,
            "interaction_score": diagnostic_result["breakdown"]["interaction"]["interaction_score"],
            "post_test_validation_score": diagnostic_result["breakdown"]["posttest"]["post_test_validation_score"],
            "final_mastery_score": diagnostic_result["final_mastery_score"],
            "pre_test_state": pre_test_state,
            "schema_state": diagnostic_result["schema_state"],
            "color": diagnostic_result["color"],
            "learning_gain": diagnostic_result["learning_gain"],
            "progression_decision": diagnostic_result["progression_decision"],
            "rules_applied": diagnostic_result["rules_applied"],
            "timestamp": now,
        }

        if db:
            db.collection("diagnostic_results").add(diagnostic_doc)

            mastery_doc_id = f"{user_id}_{concept}"
            db.collection("schema_mastery").document(mastery_doc_id).update({
                "diagnostic_validated": True,
                "final_state": diagnostic_result["schema_state"],
                "final_mastery_score": diagnostic_result["final_mastery_score"],
                "progression_decision": diagnostic_result["progression_decision"],
                "learning_gain": diagnostic_result["learning_gain"]["raw_gain"],
                "last_assessed": now,
                # Component 4 feature fields (MCQ validation level)
                "mcq_score_percentage": round(score_percentage, 2),
                "current_level": current_level,
                "post_test_status": post_test_status,
            })

            # Component 4: store/update MCQ result per student+concept
            # Document shape required by the research feature specification.
            mcq_doc_id = f"{user_id}_{concept}"
            mcq_ref = db.collection("mcq_posttest_results").document(mcq_doc_id)
            existing = mcq_ref.get()
            created_at = now
            attempt_number = 1
            if existing.exists:
                prev = existing.to_dict() or {}
                created_at = prev.get("createdAt", now)
                attempt_number = int(prev.get("attemptNumber", 0) or 0) + 1

            mcq_ref.set({
                "studentId": user_id,
                "conceptName": CONCEPT_NAMES.get(concept, concept),
                "totalQuestions": total_questions,
                "correctAnswers": correct_count,
                "wrongAnswers": wrong_count,
                "scorePercentage": round(score_percentage, 2),
                "currentLevel": current_level,
                "postTestStatus": post_test_status,
                "attemptNumber": attempt_number,
                "submittedAnswers": results,
                "nextAction": next_action,
                "createdAt": created_at,
                "updatedAt": now,
            })

        post_acc = diagnostic_result["breakdown"]["posttest"]["post_test_accuracy"]

        return {
            "user_id": user_id,
            "concept": concept,
            "concept_name": CONCEPT_NAMES.get(concept, concept),
            "correct": correct_count,
            "total": total_questions,
            "wrong": wrong_count,
            "score_percentage": round(score_percentage, 2),
            "current_level": current_level,
            "feedback_message": feedback_message,
            "post_test_status": post_test_status,
            "attempt_number": int(attempt_number) if db else 1,
            "next_action": next_action,
            "post_test_accuracy": post_acc,
            "average_confidence": diagnostic_result["breakdown"]["posttest"]["average_confidence"],
            "final_mastery_score": diagnostic_result["final_mastery_score"],
            "pretest_score": float(pretest_score),
            "mastery_score": float(pretest_score),
            "mcq_accuracy": post_acc,
            "pre_test_state": pre_test_state,
            "final_state": diagnostic_result["schema_state"],
            "final_color": diagnostic_result["color"],
            "schema_state": diagnostic_result["schema_state"],
            "color": diagnostic_result["color"],
            "progression_decision": diagnostic_result["progression_decision"],
            "learning_gain": diagnostic_result["learning_gain"],
            "rules_applied": diagnostic_result["rules_applied"],
            "breakdown": diagnostic_result["breakdown"],
            "results": results,
        }

    # -----------------------------------------------------------------
    # GET HISTORY — Mastery trend data for charts
    # -----------------------------------------------------------------
    @staticmethod
    def get_history(user_id, concept):
        """Return mastery trend data for a specific student and concept."""
        if not db:
            return {"user_id": user_id, "concept": concept, "history": []}

        query = db.collection("mastery_history").where("user_id", "==", user_id)
        docs = query.order_by("timestamp").stream()

        history = []
        for doc in docs:
            entry = doc.to_dict()
            if concept == "overall":
                history.append({
                    "mastery_score": entry.get("overall_mastery", 0),
                    "schema_state": entry.get("overall_state", "Unknown"),
                    "timestamp": entry.get("timestamp", ""),
                })
            else:
                concept_data = entry.get("concepts", {}).get(concept, {})
                if concept_data:
                    history.append({
                        "mastery_score": concept_data.get("mastery_score", 0),
                        "schema_state": concept_data.get("schema_state", "Unknown"),
                        "timestamp": entry.get("timestamp", ""),
                    })

        return {
            "user_id": user_id,
            "concept": concept,
            "concept_name": CONCEPT_NAMES.get(concept, concept),
            "history": history,
        }

    # -----------------------------------------------------------------
    # OFFLINE FALLBACK
    # -----------------------------------------------------------------
    @staticmethod
    def _offline_status(user_id):
        """Fallback when Firebase is offline: use local mock data."""
        from data.mock_students import mock_students

        student = None
        for s in mock_students:
            if s["studentId"] == user_id:
                student = s
                break

        if not student:
            if mock_students:
                student = mock_students[0]
            else:
                return {"user_id": user_id, "found": False, "error": "No data available"}

        result = process_student(student)
        return {
            "user_id": user_id,
            "found": True,
            "offline": True,
            "studentName": result["studentName"],
            "overall_mastery": result["overall_mastery"],
            "overall_state": result["overall_state"],
            "overall_color": result["overall_color"],
            "total_concepts": result["total_concepts"],
            "concepts": result["concepts"],
        }
