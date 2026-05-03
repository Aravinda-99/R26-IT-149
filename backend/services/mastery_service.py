"""
Component 4: Schema Mastery Tracker -- Service
===============================================
Provides business logic for mastery tracking, connecting Firestore data
with the mastery calculator algorithm.

Handles:
  - Stage 1: Fetching behaviour data and computing mastery scores
  - Stage 2: Fetching MCQ questions and processing diagnostic results
  - Stage 3: Returning dashboard-ready data and history
"""

from firebase.firebase_service import db
from mastery_calculator import (
    calculate_mastery_score,
    classify_schema_state,
    needs_posttest,
    determine_final_state,
    get_state_color,
    process_student,
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
    # GET STATUS — Stage 1 mastery calculation
    # -----------------------------------------------------------------
    @staticmethod
    def get_status(user_id):
        """
        Fetch student behaviour data from Firestore, run the mastery
        calculator, save results, and return the full mastery status.

        Args:
            user_id (str): Student ID (e.g. "STU001")

        Returns:
            dict: Complete mastery status with per-concept breakdowns
        """
        if not db:
            return MasteryService._offline_status(user_id)

        # Fetch behaviour data from Firestore
        doc_ref = db.collection("student_behaviour").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return {
                "error": f"No behaviour data found for student '{user_id}'",
                "user_id": user_id,
                "found": False,
            }

        student_data = doc.to_dict()

        # Run Stage 1 mastery calculation
        result = process_student(student_data)

        # Save calculated mastery to Firestore (for history tracking)
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
                "last_assessed": now,
            }
            doc_id = f"{user_id}_{concept_name}"
            db.collection("schema_mastery").document(doc_id).set(mastery_doc)

        # Also save a history entry for trend tracking
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
    # GET ALL STUDENTS — List all students with mastery overview
    # -----------------------------------------------------------------
    @staticmethod
    def get_all_students():
        """
        Fetch all students from Firestore and compute mastery for each.

        Returns:
            list: List of student summaries with overall mastery
        """
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
        """
        Update behaviour data for a student and recalculate mastery.

        Args:
            data (dict): Must contain 'user_id' and 'concept' with new metrics.

        Returns:
            dict: Updated mastery result for the affected concept
        """
        user_id = data.get("user_id")
        concept = data.get("concept")
        metrics = data.get("metrics", {})

        if not user_id or not concept:
            return {"error": "Missing user_id or concept"}

        if not db:
            return {"message": "Offline mode - cannot update"}

        # Update the behaviour data in Firestore
        doc_ref = db.collection("student_behaviour").document(user_id)
        doc = doc_ref.get()

        if not doc.exists:
            return {"error": f"No behaviour data found for '{user_id}'"}

        # Update the specific concept metrics
        doc_ref.update({f"concepts.{concept}": metrics})

        # Recalculate mastery for this concept
        scores = calculate_mastery_score(metrics)
        state = classify_schema_state(scores["mastery_score"])
        requires_posttest = needs_posttest(state)

        # Save updated mastery
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
    # GET MCQ QUESTIONS — Fetch diagnostic questions for a concept
    # -----------------------------------------------------------------
    @staticmethod
    def get_questions(concept):
        """
        Fetch MCQ diagnostic questions for a specific concept.

        Args:
            concept (str): Concept name (e.g. "variables", "loops")

        Returns:
            dict: List of MCQ questions (answers excluded for client)
        """
        if not db:
            # Fallback to local data
            from data.mcq_questions import mcq_questions
            questions = mcq_questions.get(concept, [])
            # Strip answers for client
            return {
                "concept": concept,
                "questions": [
                    {
                        "id": q["id"],
                        "type": q["type"],
                        "question": q["question"],
                        "code": q.get("code"),
                        "options": q["options"],
                    }
                    for q in questions
                ],
            }

        docs = db.collection("mcq_questions").where("concept", "==", concept).stream()
        questions = []
        for doc in docs:
            data = doc.to_dict()
            # Don't send answers to the client
            questions.append({
                "id": data["id"],
                "type": data["type"],
                "question": data["question"],
                "code": data.get("code"),
                "options": data["options"],
            })

        return {"concept": concept, "questions": questions}

    # -----------------------------------------------------------------
    # SUBMIT DIAGNOSTIC — Stage 2 MCQ post-test submission
    # -----------------------------------------------------------------
    @staticmethod
    def submit_diagnostic(data):
        """
        Process submitted MCQ diagnostic answers and determine final schema state.

        Args:
            data (dict): Must contain:
                user_id (str): Student ID
                concept (str): Concept being tested
                answers (list): List of {question_id, selected_option}

        Returns:
            dict: Diagnostic result with final schema state
        """
        user_id = data.get("user_id")
        concept = data.get("concept")
        answers = data.get("answers", [])

        if not user_id or not concept or not answers:
            return {"error": "Missing user_id, concept, or answers"}

        # Get correct answers from Firestore (or local data)
        correct_answers = {}
        explanations = {}
        if db:
            docs = db.collection("mcq_questions").where("concept", "==", concept).stream()
            for doc in docs:
                q = doc.to_dict()
                correct_answers[q["id"]] = q["answer"]
                explanations[q["id"]] = q.get("explanation", "")
        else:
            from data.mcq_questions import mcq_questions
            for q in mcq_questions.get(concept, []):
                correct_answers[q["id"]] = q["answer"]
                explanations[q["id"]] = q.get("explanation", "")

        # Grade the answers
        results = []
        correct_count = 0
        for answer in answers:
            q_id = answer.get("question_id")
            selected = answer.get("selected_option")
            correct_option = correct_answers.get(q_id, "")
            is_correct = selected == correct_option

            if is_correct:
                correct_count += 1

            results.append({
                "question_id": q_id,
                "selected": selected,
                "correct": correct_option,
                "is_correct": is_correct,
                "explanation": explanations.get(q_id, ""),
            })

        total_questions = len(answers)

        # Get current mastery score for this concept
        mastery_score = 0.0
        pre_test_state = "Unknown"
        if db:
            mastery_doc_id = f"{user_id}_{concept}"
            mastery_doc = db.collection("schema_mastery").document(mastery_doc_id).get()
            if mastery_doc.exists:
                mastery_data = mastery_doc.to_dict()
                mastery_score = mastery_data.get("mastery_score", 0.0)
                pre_test_state = mastery_data.get("schema_state", "Unknown")

        # Determine final schema state using Stage 2 logic
        final_state = determine_final_state(mastery_score, correct_count, total_questions)

        # Save diagnostic result to Firestore
        now = timestamp_now()
        diagnostic_doc = {
            "user_id": user_id,
            "concept": concept,
            "questions_asked": total_questions,
            "correct_answers": correct_count,
            "mcq_accuracy": round(correct_count / max(total_questions, 1), 4),
            "answers": results,
            "mastery_score": mastery_score,
            "pre_test_state": pre_test_state,
            "final_state": final_state,
            "final_color": get_state_color(final_state),
            "timestamp": now,
        }

        if db:
            # Save diagnostic result
            db.collection("diagnostic_results").add(diagnostic_doc)

            # Update schema_mastery with final state
            mastery_doc_id = f"{user_id}_{concept}"
            db.collection("schema_mastery").document(mastery_doc_id).update({
                "diagnostic_validated": True,
                "final_state": final_state,
                "last_assessed": now,
            })

        return {
            "user_id": user_id,
            "concept": concept,
            "correct": correct_count,
            "total": total_questions,
            "mcq_accuracy": round(correct_count / max(total_questions, 1), 4),
            "mastery_score": mastery_score,
            "pre_test_state": pre_test_state,
            "final_state": final_state,
            "final_color": get_state_color(final_state),
            "results": results,
        }

    # -----------------------------------------------------------------
    # GET HISTORY — Mastery trend data for charts
    # -----------------------------------------------------------------
    @staticmethod
    def get_history(user_id, concept):
        """
        Return mastery trend data for a specific student and concept.

        Args:
            user_id (str): Student ID
            concept (str): Concept name (or "overall" for all)

        Returns:
            dict: History entries with timestamps and scores
        """
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
    # OFFLINE FALLBACK — Returns calculated data from local mock data
    # -----------------------------------------------------------------
    @staticmethod
    def _offline_status(user_id):
        """Fallback when Firebase is offline: use local mock data."""
        from data.mock_students import mock_students

        # Find the student in mock data
        student = None
        for s in mock_students:
            if s["studentId"] == user_id:
                student = s
                break

        if not student:
            # Default: process first student
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
