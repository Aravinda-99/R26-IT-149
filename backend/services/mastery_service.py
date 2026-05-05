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

    @staticmethod
    def _map_current_level_to_schema_state(current_level: str):
        """
        Component 4 post-test uses labels like "Fragile Level".
        Dashboard UI expects: Stable | Developing | Fragile | Misconception.
        """
        if not current_level:
            return None
        s = str(current_level).strip()
        if s.endswith("Level"):
            s = s.replace("Level", "").strip()
        # Normalise common variants
        mapping = {
            "Stable": "Stable",
            "Developing": "Developing",
            "Fragile": "Fragile",
            "Misconception": "Misconception",
        }
        return mapping.get(s, None)

    # -----------------------------------------------------------------
    # COMPONENT 4 IMPROVEMENT: Evidence + mandatory MCQ validation
    # -----------------------------------------------------------------
    @staticmethod
    def _clamp01(x):
        try:
            return max(0.0, min(float(x), 1.0))
        except Exception:
            return 0.0

    @staticmethod
    def _compute_evidence_score(
        pretest_score,
        gamified_score,
        attempt_score,
        time_score,
        error_severity_score,
    ):
        """
        EvidenceScore combines prior components (no ML):
          (0.25 × ConceptPreTestScore) +
          (0.30 × GamifiedActivityScore) +
          (0.15 × AttemptScore) +
          (0.15 × TimeScore) +
          (0.15 × ErrorSeverityScore)
        All inputs are expected normalised to [0, 1].
        """
        p = MasteryService._clamp01(pretest_score)
        g = MasteryService._clamp01(gamified_score)
        a = MasteryService._clamp01(attempt_score)
        t = MasteryService._clamp01(time_score)
        e = MasteryService._clamp01(error_severity_score)
        score = (0.25 * p) + (0.30 * g) + (0.15 * a) + (0.15 * t) + (0.15 * e)
        return MasteryService._clamp01(score)

    @staticmethod
    def _confidence_summary(results):
        """
        Summarise confidence distribution and detect risky patterns:
        - high_correct_low_confidence: correct but mostly low confidence → fragile
        - wrong_high_confidence: wrong with high confidence → possible misconception
        """
        conf_counts = {"low": 0, "medium": 0, "high": 0}
        wrong_high_conf = 0
        correct_low_conf = 0
        total = 0
        for r in results or []:
            c = str(r.get("confidence", "medium")).lower().strip()
            if c not in conf_counts:
                c = "medium"
            conf_counts[c] += 1
            total += 1
            if not r.get("is_correct") and c == "high":
                wrong_high_conf += 1
            if r.get("is_correct") and c == "low":
                correct_low_conf += 1

        total = max(total, 1)
        return {
            "counts": conf_counts,
            "ratios": {
                "low": round(conf_counts["low"] / total, 4),
                "medium": round(conf_counts["medium"] / total, 4),
                "high": round(conf_counts["high"] / total, 4),
            },
            "wrong_high_confidence": wrong_high_conf,
            "correct_low_confidence": correct_low_conf,
        }

    @staticmethod
    def _classify_schema_from_score(final_schema_score):
        """
        Component 4 classification (same thresholds as schema states):
          0.80–1.00 Stable, 0.60–0.79 Developing, 0.40–0.59 Fragile, else Misconception.
        """
        return classify_schema_state(MasteryService._clamp01(final_schema_score))

    @staticmethod
    def _final_decision(evidence_score, mcq_score, confidence_summary):
        """
        FinalSchemaScore = (0.40 × EvidenceScore) + (0.60 × MCQScore)

        Mandatory validation rule:
        Stable only if:
          - FinalSchemaScore >= 0.80
          - MCQScore >= 0.80
          - confidence is not mostly low

        If EvidenceScore is high but MCQScore is low, do not classify Stable.
        """
        ev = MasteryService._clamp01(evidence_score)
        mcq = MasteryService._clamp01(mcq_score)
        final_score = MasteryService._clamp01((0.40 * ev) + (0.60 * mcq))

        mostly_low_conf = (confidence_summary or {}).get("ratios", {}).get("low", 0) >= 0.5
        wrong_high_conf = (confidence_summary or {}).get("wrong_high_confidence", 0) > 0

        # Base classification from combined score
        state = MasteryService._classify_schema_from_score(final_score)

        # Enforce "Stable requires MCQ >= 0.80"
        if mcq < 0.80 and state == "Stable":
            # Downgrade based on MCQ band
            if mcq >= 0.60:
                state = "Developing"
            elif mcq >= 0.40:
                state = "Fragile"
            else:
                state = "Misconception"

        # Confidence validation: high MCQ but mostly low confidence → Fragile
        if mcq >= 0.80 and mostly_low_conf:
            state = "Fragile"

        # If wrong answers have high confidence, treat as possible misconception signal.
        # Do not jump straight to Misconception unless MCQ is already weak.
        if wrong_high_conf and mcq < 0.60:
            state = "Misconception"

        # Recommendation messages (UI text only)
        messages = {
            "Stable": "Your learning activity performance and post-test answers show stable understanding. You can move to the next concept.",
            "Developing": "You are improving, but your understanding is not fully stable yet. More practice is recommended.",
            "Fragile": "Your activity performance and post-test result do not fully match. Please learn this concept again to strengthen your understanding.",
            "Misconception": "Your answers show that this concept may be misunderstood. Please repeat the gamified lesson before trying again.",
        }

        # Post-test status / next action (kept consistent with the project's existing flow)
        post_test_status = "PASSED" if mcq >= 0.60 else "FAILED"
        next_action = "DONE" if post_test_status == "PASSED" and state in ("Stable", "Developing") else "LEARN_AGAIN"

        return {
            "evidenceScore": round(ev, 4),
            "mcqScore": round(mcq, 4),
            "finalSchemaScore": round(final_score, 4),
            "schema_state": state,
            "color": get_state_color(state),
            "post_test_status": post_test_status,
            "next_action": next_action,
            "recommendation": messages.get(state, ""),
        }

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

        # Component 4 sync:
        # If the student has completed a post-test for a concept, prefer the latest
        # post-test "currentLevel" as the dashboard schema state for that concept.
        # This does NOT change scoring or pass/fail logic — it only synchronizes
        # what the dashboard shows.
        if db:
            for concept_key, concept_view in result.get("concepts", {}).items():
                mcq_doc_id = f"{user_id}_{concept_key}"
                mcq_doc = db.collection("mcq_posttest_results").document(mcq_doc_id).get()
                if not mcq_doc.exists:
                    continue
                mcq = mcq_doc.to_dict() or {}
                mapped_state = MasteryService._map_current_level_to_schema_state(
                    mcq.get("currentLevel")
                )
                if not mapped_state:
                    continue

                concept_view["schema_state"] = mapped_state
                concept_view["color"] = get_state_color(mapped_state)
                concept_view["needs_posttest"] = needs_posttest(mapped_state)
                # expose fields for UI/debugging (optional consumers)
                concept_view["post_test_status"] = mcq.get("postTestStatus", "")
                concept_view["mcq_score_percentage"] = mcq.get("scorePercentage", None)
                concept_view["level_updated_at"] = mcq.get("updatedAt", "")

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
        # MCQScore is the mandatory validation signal for final state.
        mcq_score = correct_count / max(total_questions, 1)  # normalised [0, 1]
        current_level = MasteryService._classify_mcq_level(score_percentage)

        # Keep existing pass/fail message mapping (UI-only) but final schema state
        # will be decided by EvidenceScore + MCQScore (below).
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
            # Component 4 improvement:
            # Final schema state must combine EvidenceScore (prior components)
            # with the mandatory MCQScore, so we compute and save the improved decision here.
            interaction = (diagnostic_result.get("breakdown", {}) or {}).get("interaction", {}) or {}
            evidence_score = MasteryService._compute_evidence_score(
                pretest_score=pretest_score,
                gamified_score=gamified_score,
                attempt_score=interaction.get("attempt_score", 0),
                time_score=interaction.get("time_score", 0),
                error_severity_score=interaction.get("error_severity_score", 0),
            )
            conf_summary = MasteryService._confidence_summary(results)
            decision = MasteryService._final_decision(evidence_score, mcq_score, conf_summary)

            db.collection("schema_mastery").document(mastery_doc_id).update({
                "diagnostic_validated": True,
                # Use improved final decision (do not allow Stable without MCQ validation)
                "final_state": decision["schema_state"],
                "final_mastery_score": diagnostic_result["final_mastery_score"],
                "progression_decision": diagnostic_result["progression_decision"],
                "learning_gain": diagnostic_result["learning_gain"]["raw_gain"],
                "last_assessed": now,
                # Component 4 feature fields (MCQ validation level)
                "mcq_score_percentage": round(score_percentage, 2),
                "current_level": current_level,
                # Use improved pass/fail (MCQ thresholds) for dashboard sync
                "post_test_status": decision["post_test_status"],
                # Store the new combined scoring signals (for dashboard / audit)
                "evidence_score": decision["evidenceScore"],
                "mcq_score": decision["mcqScore"],
                "final_schema_score": decision["finalSchemaScore"],
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

            prev_level = None
            if existing.exists:
                prev = existing.to_dict() or {}
                prev_level = prev.get("currentLevel")

            mcq_ref.set({
                "studentId": user_id,
                "conceptName": CONCEPT_NAMES.get(concept, concept),
                # Component 4 spec: keep previous level alongside current
                "previousLevel": prev_level,
                # Component 4 improvement: store combined decision evidence
                "evidenceScore": decision["evidenceScore"],
                "mcqScore": decision["mcqScore"],
                "finalSchemaScore": decision["finalSchemaScore"],
                "totalQuestions": total_questions,
                "correctAnswers": correct_count,
                "wrongAnswers": wrong_count,
                "scorePercentage": round(score_percentage, 2),
                # Dashboard should display latest final decision level
                "currentLevel": f"{decision['schema_state']} Level",
                "postTestStatus": decision["post_test_status"],
                "confidenceSummary": conf_summary,
                "recommendation": decision["recommendation"],
                "attemptNumber": attempt_number,
                "submittedAnswers": results,
                "nextAction": decision["next_action"],
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
            # Component 4 improvement: return improved decision outputs
            "post_test_status": decision["post_test_status"] if db else post_test_status,
            "attempt_number": int(attempt_number) if db else 1,
            "next_action": decision["next_action"] if db else next_action,
            "post_test_accuracy": post_acc,
            "average_confidence": diagnostic_result["breakdown"]["posttest"]["average_confidence"],
            "final_mastery_score": diagnostic_result["final_mastery_score"],
            "pretest_score": float(pretest_score),
            "mastery_score": float(pretest_score),
            "mcq_accuracy": post_acc,
            "pre_test_state": pre_test_state,
            "final_state": decision["schema_state"] if db else diagnostic_result["schema_state"],
            "final_color": decision["color"] if db else diagnostic_result["color"],
            "schema_state": decision["schema_state"] if db else diagnostic_result["schema_state"],
            "color": decision["color"] if db else diagnostic_result["color"],
            "evidence_score": decision["evidenceScore"] if db else None,
            "mcq_score": decision["mcqScore"] if db else None,
            "final_schema_score": decision["finalSchemaScore"] if db else None,
            "confidence_summary": conf_summary if db else None,
            "recommendation": decision["recommendation"] if db else "",
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
