"""
Component 4: Post-Test Orchestration & ML Integration Service
=============================================================
Manages:
  1. Blueprint-based selection of 15 approved post-test questions
     (4 Basic + 4 Code Output + 3 Error Recognition + 2 Application + 2 Transfer)
  2. Exclusion of previously used question_ids / equivalent_group_ids per student
  3. Student-safe sanitization (stripping answer keys & quality labels)
  4. Post-test grading via hidden option qualities
  5. Multi-source evidence assembly (Component 1 + 2 + 4) and ML pipeline prediction
  6. Mastery session and question attempt persistence
"""

import uuid
import random
from services.schema_question_bank_service import SchemaQuestionBankService
from services.schema_mastery_service import predict_schema_mastery, normalize_score

BLUEPRINT = {
    "Basic Understanding": 4,
    "Code Output Prediction": 4,
    "Error Recognition": 3,
    "Application": 2,
    "Transfer": 2,
}
TOTAL_POSTTEST_QUESTIONS = 15


class SchemaPostTestService:
    """Handles post-test generation, student answer grading, and ML mastery evaluation."""

    @classmethod
    def select_post_test_questions(
        cls,
        student_id: str,
        concept: str,
        error_type: str = None,
        session_id: str = None,
    ) -> dict:
        """
        Selects 15 approved questions using the blueprint rules.
        Filters by concept, avoids previously answered questions,
        prioritizes error_type for Error Recognition, and prefers lower exposure_count.
        Randomizes option order per session while saving displayed -> canonical mapping.
        Returns student-safe question objects (no correct_option or option_quality leaks).
        """
        concept_clean = concept.strip() if concept else "Loops"
        if not session_id:
            session_id = f"SES_{uuid.uuid4().hex[:8].upper()}"
        
        # 1. Fetch all active approved questions for this concept
        all_approved = SchemaQuestionBankService.get_approved_question_bank(concept=concept_clean, active_only=True)
        
        # Fallback to all approved if concept has few questions
        if not all_approved:
            all_approved = SchemaQuestionBankService.get_approved_question_bank(active_only=True)

        # 2. Retrieve student history to avoid repeats
        used_qids, used_groups = SchemaQuestionBankService.get_student_used_questions(student_id, concept_clean)

        # Sort candidate pool: unused questions first, then by lowest exposure_count
        def sort_key(q):
            is_used = 1 if q.get("question_id") in used_qids or q.get("equivalent_group_id") in used_groups else 0
            exposure = int(q.get("exposure_count", 0))
            return (is_used, exposure)

        # Group candidates by question_type
        by_type = {}
        for q in all_approved:
            q_type = q.get("question_type", "Basic Understanding")
            by_type.setdefault(q_type, []).append(q)

        for q_type in by_type:
            by_type[q_type].sort(key=sort_key)

        selected_questions = []
        selected_ids = set()

        # 3. Pick questions adhering to the Blueprint
        for q_type, target_count in BLUEPRINT.items():
            candidates = by_type.get(q_type, [])
            
            # Special rule: for Error Recognition, prioritize matching error_type
            if q_type == "Error Recognition" and error_type:
                err_clean = str(error_type).strip().upper()
                matching_err = [c for c in candidates if str(c.get("target_error_type", "")).upper() == err_clean]
                other_err = [c for c in candidates if str(c.get("target_error_type", "")).upper() != err_clean]
                candidates = matching_err + other_err

            picked_for_type = 0
            for c in candidates:
                if c.get("question_id") not in selected_ids and picked_for_type < target_count:
                    selected_questions.append(c)
                    selected_ids.add(c.get("question_id"))
                    picked_for_type += 1

        # 4. If blueprint didn't fill 15 questions (small question bank), backfill with remaining available questions
        if len(selected_questions) < TOTAL_POSTTEST_QUESTIONS:
            remaining_pool = sorted(all_approved, key=sort_key)
            for q in remaining_pool:
                if q.get("question_id") not in selected_ids:
                    selected_questions.append(q)
                    selected_ids.add(q.get("question_id"))
                    if len(selected_questions) >= TOTAL_POSTTEST_QUESTIONS:
                        break

        # 5. If still under 15, allow cycling of low-exposure questions to ensure a 15-question test
        if selected_questions and len(selected_questions) < TOTAL_POSTTEST_QUESTIONS:
            pool = list(selected_questions)
            idx = 0
            while len(selected_questions) < TOTAL_POSTTEST_QUESTIONS and pool:
                selected_questions.append(pool[idx % len(pool)])
                idx += 1

        # 6. Randomize/shuffle options per question and save hidden mapping for this session
        student_safe_questions = []
        session_mappings = {}

        for q in selected_questions:
            qid = q.get("question_id")
            canonical_options = {
                "A": q.get("option_a", ""),
                "B": q.get("option_b", ""),
                "C": q.get("option_c", ""),
                "D": q.get("option_d", ""),
            }

            canonical_keys = ["A", "B", "C", "D"]
            shuffled_canonical = random.sample(canonical_keys, len(canonical_keys))

            display_options = {}
            q_mapping = {}  # displayed_key (A,B,C,D) -> canonical_key (e.g. C,A,D,B)

            for disp_key, canon_key in zip(["A", "B", "C", "D"], shuffled_canonical):
                display_options[disp_key] = canonical_options.get(canon_key, "")
                q_mapping[disp_key] = canon_key

            session_mappings[qid] = q_mapping

            student_safe_questions.append({
                "question_id": qid,
                "concept_name": q.get("concept_name"),
                "question_type": q.get("question_type"),
                "difficulty": q.get("difficulty"),
                "question_text": q.get("question_text") or q.get("question"),
                "code_snippet": q.get("code_snippet") or q.get("code", ""),
                "options": display_options,
            })

        # Persist the shuffled option mapping for this session
        SchemaQuestionBankService.save_session_option_mappings(session_id, session_mappings)

        return {
            "success": True,
            "session_id": session_id,
            "student_id": student_id,
            "concept_name": concept_clean,
            "total_questions": len(student_safe_questions),
            "questions": student_safe_questions,
        }

    @classmethod
    def grade_and_predict(cls, submission: dict) -> dict:
        """
        Grades submitted student answers against approved_question_bank quality labels,
        constructs the 11-feature ML vector, and calls predict_schema_mastery.
        """
        student_id = str(submission.get("student_id", "STU_ANON"))
        session_id = submission.get("session_id") or f"SES_{uuid.uuid4().hex[:8].upper()}"
        concept_name = str(submission.get("concept_name", "Loops"))
        
        pre_test_score = normalize_score(submission.get("pre_test_score", 0.5))
        attempt_count = int(submission.get("attempt_count", 1) or 1)
        time_taken_seconds = float(submission.get("time_taken_seconds", 120.0) or 120.0)
        error_type = str(submission.get("error_type", "UNKNOWN_ERROR"))
        error_pattern_score = normalize_score(submission.get("error_pattern_score", 0.5))

        answers = submission.get("answers", [])
        total_questions = len(answers) if answers else 1

        correct_count = 0
        nearly_correct_count = 0
        wrong_count = 0
        clearly_wrong_count = 0

        question_attempts = []
        used_qids = []
        review_items = []

        # Evaluate each answer
        for idx, item in enumerate(answers):
            qid = item.get("question_id")
            selected_displayed = str(item.get("selected_option", "")).strip().upper()
            used_qids.append(qid)

            # Look up hidden metadata
            q_meta = SchemaQuestionBankService.get_approved_question_by_id(qid)
            if not q_meta:
                # Fallback search in pending or mock defaults
                q_meta = SchemaQuestionBankService.get_generated_question_by_id(qid) or {}

            # Retrieve option mapping for this session and question
            q_mapping = SchemaQuestionBankService.get_option_mapping(session_id, qid)
            if q_mapping:
                # Map student's displayed selection (A, B, C, D) back to canonical option key
                canonical_selected = q_mapping.get(selected_displayed, selected_displayed)
            else:
                canonical_selected = selected_displayed

            correct_canonical = str(q_meta.get("correct_option", "A")).upper()
            
            # Map quality of selected option using canonical key
            quality_map = {
                "A": q_meta.get("option_a_quality", "Correct" if correct_canonical == "A" else "Wrong"),
                "B": q_meta.get("option_b_quality", "Correct" if correct_canonical == "B" else "Wrong"),
                "C": q_meta.get("option_c_quality", "Correct" if correct_canonical == "C" else "Wrong"),
                "D": q_meta.get("option_d_quality", "Correct" if correct_canonical == "D" else "Wrong"),
            }
            selected_quality = quality_map.get(canonical_selected, "Wrong")

            if selected_quality == "Correct":
                correct_count += 1
                is_correct = True
            elif selected_quality == "Nearly Correct":
                nearly_correct_count += 1
                is_correct = False
            elif selected_quality == "Clearly Wrong":
                clearly_wrong_count += 1
                is_correct = False
            else:  # "Wrong"
                wrong_count += 1
                is_correct = False

            # Question attempt record
            question_attempts.append({
                "session_id": session_id,
                "student_id": student_id,
                "concept_name": concept_name,
                "question_id": qid,
                "equivalent_group_id": q_meta.get("equivalent_group_id", "GRP_DEFAULT"),
                "selected_option": selected_displayed,
                "canonical_selected_option": canonical_selected,
                "answer_quality": selected_quality,
                "is_correct": is_correct,
                "attempt_no": attempt_count,
            })

            # Canonical options dict
            canonical_options = {
                "A": q_meta.get("option_a", ""),
                "B": q_meta.get("option_b", ""),
                "C": q_meta.get("option_c", ""),
                "D": q_meta.get("option_d", ""),
            }

            # Review item for post-submit feedback
            if q_mapping:
                # Find which displayed option corresponds to the correct canonical answer
                displayed_correct = next((k for k, v in q_mapping.items() if v == correct_canonical), correct_canonical)
                # Reconstruct options exactly as displayed to the student
                displayed_options_dict = {
                    disp_k: canonical_options.get(canon_k, "")
                    for disp_k, canon_k in q_mapping.items()
                }
            else:
                displayed_correct = correct_canonical
                displayed_options_dict = canonical_options

            review_items.append({
                "question_id": qid,
                "question": q_meta.get("question_text") or f"Question {idx+1}",
                "selected": selected_displayed,
                "correct": displayed_correct,
                "is_correct": is_correct,
                "answer_quality": selected_quality,
                "explanation": q_meta.get("explanation", ""),
                "options": displayed_options_dict,
            })

        # Calculate post_test_score: Correct = 1.0, Nearly Correct = 0.5, Others = 0.0
        post_test_score = ((correct_count * 1.0) + (nearly_correct_count * 0.5)) / max(1, total_questions)
        post_test_score = round(post_test_score, 4)

        # Build 11-feature ML input vector
        ml_input = {
            "concept_name": concept_name,
            "pre_test_score": pre_test_score,
            "attempt_count": attempt_count,
            "time_taken_seconds": time_taken_seconds,
            "error_type": error_type,
            "error_pattern_score": error_pattern_score,
            "post_test_correct_count": correct_count,
            "post_test_nearly_correct_count": nearly_correct_count,
            "post_test_wrong_count": wrong_count,
            "post_test_clearly_wrong_count": clearly_wrong_count,
            "post_test_score": post_test_score,
        }

        # Predict using trained ML pipeline
        ml_prediction = predict_schema_mastery(ml_input)

        mastery_probability = ml_prediction.get("mastery_probability", 0.5)
        mastery_level = ml_prediction.get("mastery_level", "Needs More Practice")
        next_action = ml_prediction.get("next_action", "LEARN_AGAIN")
        model_used = ml_prediction.get("model_used", "schema_mastery_pipeline")

        # Friendly explanation message for student
        if next_action == "DONE":
            explanation_msg = "You have demonstrated sufficient schema mastery for this concept and are ready to advance to the next learning activity."
        else:
            explanation_msg = "Your schema mastery validation indicates additional reinforcement is needed. Please review the gamified learning lesson for this topic."

        # Save session & attempts to persistence store
        session_record = {
            "session_id": session_id,
            "student_id": student_id,
            "concept_name": concept_name,
            "pre_test_score": pre_test_score,
            "attempt_count": attempt_count,
            "time_taken_seconds": time_taken_seconds,
            "error_type": error_type,
            "error_pattern_score": error_pattern_score,
            "post_test_correct_count": correct_count,
            "post_test_nearly_correct_count": nearly_correct_count,
            "post_test_wrong_count": wrong_count,
            "post_test_clearly_wrong_count": clearly_wrong_count,
            "post_test_score": post_test_score,
            "mastery_probability": mastery_probability,
            "mastery_level": mastery_level,
            "next_action": next_action,
            "model_used": model_used,
        }

        SchemaQuestionBankService.save_mastery_session(session_record)
        SchemaQuestionBankService.save_question_attempts(question_attempts)
        SchemaQuestionBankService.increment_exposure_counts(used_qids)

        return {
            "success": True,
            "session_id": session_id,
            "student_id": student_id,
            "concept_name": concept_name,
            "post_test_score": post_test_score,
            "score_percentage": round(post_test_score * 100, 1),
            "total": total_questions,
            "post_test_correct_count": correct_count,
            "post_test_nearly_correct_count": nearly_correct_count,
            "post_test_wrong_count": wrong_count,
            "post_test_clearly_wrong_count": clearly_wrong_count,
            "mastery_probability": mastery_probability,
            "mastery_level": mastery_level,
            "next_action": next_action,
            "model_used": model_used,
            "explanation_message": explanation_msg,
            "results": review_items,
        }
