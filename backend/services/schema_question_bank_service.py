"""
Component 4: Schema Question Bank Storage Service
=================================================
Local JSON and Firestore storage manager for:
  1. generated_questions (LLM draft questions with status PENDING, APPROVED, REJECTED, EDITED)
  2. approved_question_bank (active approved questions for student post-tests)
  3. schema_mastery_sessions (post-test session records)
  4. schema_mastery_question_attempts (student question attempt tracking)
"""

import os
import json
import uuid
import threading
from datetime import datetime

from firebase.firebase_service import db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_DIR = os.path.join(BASE_DIR, "ml", "component4_schema_mastery", "question_bank", "local_storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

GEN_QUESTIONS_FILE = os.path.join(STORAGE_DIR, "generated_questions.json")
APP_QUESTIONS_FILE = os.path.join(STORAGE_DIR, "approved_question_bank.json")
SESSIONS_FILE = os.path.join(STORAGE_DIR, "schema_mastery_sessions.json")
ATTEMPTS_FILE = os.path.join(STORAGE_DIR, "question_attempts.json")
SEED_FILE = os.path.join(STORAGE_DIR, "seed_questions.json")

_lock = threading.Lock()


def _now_iso():
    return datetime.utcnow().isoformat() + "Z"


def _read_json(filepath, default=None):
    if default is None:
        default = []
    if not os.path.exists(filepath):
        return default
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Failed to read {filepath}: {e}")
        return default


def _write_json(filepath, data):
    with _lock:
        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            print(f"[ERROR] Failed to write {filepath}: {e}")
            return False


class SchemaQuestionBankService:
    """Provides CRUD operations for draft & approved question banks and test session history."""

    @classmethod
    def validate_question_data(cls, data: dict) -> tuple:
        """
        Validates question payload:
          - Non-empty text, concept, question_type, difficulty, explanation
          - 4 non-empty options A, B, C, D
          - Exactly one 'Correct', one 'Nearly Correct', one 'Wrong', one 'Clearly Wrong'
          - correct_option matches the 'Correct' quality key
        Returns (is_valid: bool, error_message: str)
        """
        if not isinstance(data, dict):
            return False, "Question data must be a JSON object"

        text = str(data.get("question_text") or data.get("text") or "").strip()
        if not text:
            return False, "Question text cannot be empty"

        concept = str(data.get("concept_name") or "").strip()
        if not concept:
            return False, "Concept name is required"

        opt_a = str(data.get("option_a", "")).strip()
        opt_b = str(data.get("option_b", "")).strip()
        opt_c = str(data.get("option_c", "")).strip()
        opt_d = str(data.get("option_d", "")).strip()

        if not (opt_a and opt_b and opt_c and opt_d):
            return False, "All four options (A, B, C, D) must have non-empty text"

        # Check for identical duplicate option texts
        opts_lower = [opt_a.lower(), opt_b.lower(), opt_c.lower(), opt_d.lower()]
        if len(set(opts_lower)) < 4:
            return False, "All four options must be distinct"

        qa = str(data.get("option_a_quality", "")).strip()
        qb = str(data.get("option_b_quality", "")).strip()
        qc = str(data.get("option_c_quality", "")).strip()
        qd = str(data.get("option_d_quality", "")).strip()

        valid_qualities = {"Correct", "Nearly Correct", "Wrong", "Clearly Wrong"}
        all_qualities = [qa, qb, qc, qd]

        if not all(q in valid_qualities for q in all_qualities):
            return False, "Option qualities must be one of: Correct, Nearly Correct, Wrong, Clearly Wrong"

        if set(all_qualities) != valid_qualities:
            return False, "Each question must have exactly one Correct, one Nearly Correct, one Wrong, and one Clearly Wrong option"

        correct_opt = str(data.get("correct_option", "")).strip().upper()
        if correct_opt not in {"A", "B", "C", "D"}:
            return False, "correct_option must be one of 'A', 'B', 'C', 'D'"

        quality_map = {"A": qa, "B": qb, "C": qc, "D": qd}
        if quality_map.get(correct_opt) != "Correct":
            return False, f"correct_option is '{correct_opt}' but its quality is '{quality_map.get(correct_opt)}' (must be 'Correct')"

        return True, ""

    @classmethod
    def initialize_seed_data(cls):
        """Ensures the approved question bank has initial seed questions if empty with balanced option positions."""
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        if not approved:
            seed_data = _read_json(SEED_FILE, default=[])
            if seed_data:
                # Rebalance seed questions across A, B, C, D
                letters = ["A", "B", "C", "D"]
                from services.schema_llm_question_service import SchemaLLMQuestionService
                rebalanced_seeds = []
                for idx, s in enumerate(seed_data):
                    target_letter = letters[idx % len(letters)]
                    raw_opts = [
                        {"text": s.get("option_a", ""), "quality": s.get("option_a_quality", "Correct")},
                        {"text": s.get("option_b", ""), "quality": s.get("option_b_quality", "Nearly Correct")},
                        {"text": s.get("option_c", ""), "quality": s.get("option_c_quality", "Wrong")},
                        {"text": s.get("option_d", ""), "quality": s.get("option_d_quality", "Clearly Wrong")},
                    ]
                    bal = SchemaLLMQuestionService.rebalance_options_dict(raw_opts, target_correct_letter=target_letter)
                    s_copy = dict(s)
                    s_copy.update(bal)
                    s_copy["active"] = True
                    s_copy["deleted"] = False
                    rebalanced_seeds.append(s_copy)

                _write_json(APP_QUESTIONS_FILE, rebalanced_seeds)
                print(f"[OK] Seeded {len(rebalanced_seeds)} balanced questions into approved_question_bank.json")
            else:
                print("[WARN] Seed questions file was empty or missing.")

    # ─────────────────────────────────────────────────────────────────────────
    # Generated / Draft Questions CRUD
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    def save_generated_questions(cls, questions: list) -> list:
        """Saves a batch of generated draft questions with status PENDING."""
        existing = _read_json(GEN_QUESTIONS_FILE, default=[])
        now = _now_iso()
        saved = []

        for q in questions:
            q_copy = dict(q)
            if not q_copy.get("id"):
                q_copy["id"] = f"GEN_{uuid.uuid4().hex[:8].upper()}"
            if not q_copy.get("question_id"):
                prefix = (q_copy.get("concept_name") or "GEN")[:4].upper()
                q_copy["question_id"] = f"{prefix}_Q{uuid.uuid4().hex[:4].upper()}"
            q_copy["status"] = q_copy.get("status") or "PENDING"
            q_copy["active"] = q_copy.get("active", True)
            q_copy["deleted"] = False
            q_copy["created_at"] = q_copy.get("created_at") or now
            q_copy["updated_at"] = now
            existing.append(q_copy)
            saved.append(q_copy)

        _write_json(GEN_QUESTIONS_FILE, existing)
        return saved

    @classmethod
    def get_pending_questions(cls, concept: str = None) -> list:
        """Returns all non-deleted questions with status PENDING for teacher review."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        pending = [q for q in all_gen if q.get("status") == "PENDING" and not q.get("deleted", False)]
        if concept:
            concept_lower = concept.strip().lower()
            pending = [q for q in pending if q.get("concept_name", "").strip().lower() == concept_lower]
        return pending

    @classmethod
    def get_rejected_questions(cls, concept: str = None) -> list:
        """Returns all non-deleted questions with status REJECTED for teacher inspection."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        rejected = [q for q in all_gen if q.get("status") == "REJECTED" and not q.get("deleted", False)]
        if concept:
            concept_lower = concept.strip().lower()
            rejected = [q for q in rejected if q.get("concept_name", "").strip().lower() == concept_lower]
        return rejected

    @classmethod
    def get_generated_question_by_id(cls, question_id: str) -> dict:
        """Finds a generated question by its primary ID or question_id."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        for q in all_gen:
            if q.get("id") == question_id or q.get("question_id") == question_id:
                return q
        return None

    @classmethod
    def update_question(cls, question_id: str, updates: dict, updated_by: str = "Teacher") -> dict:
        """
        Updates fields of a question in generated_questions or approved_question_bank.
        Validates 4-tier option consistency before persisting.
        """
        now = _now_iso()
        updated_q = None

        # 1. Check generated questions
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        gen_found = False
        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                merged = dict(q)
                for k, v in updates.items():
                    if k not in ("id", "created_at"):
                        merged[k] = v
                
                # If options were updated, validate
                is_valid, err = cls.validate_question_data(merged)
                if not is_valid:
                    raise ValueError(err)

                merged["status"] = "EDITED" if merged.get("status") == "PENDING" else merged.get("status")
                merged["updated_at"] = now
                merged["updated_by"] = updated_by
                all_gen[idx] = merged
                updated_q = merged
                gen_found = True
                break

        if gen_found:
            _write_json(GEN_QUESTIONS_FILE, all_gen)

        # 2. Check approved questions
        all_app = _read_json(APP_QUESTIONS_FILE, default=[])
        app_found = False
        for idx, q in enumerate(all_app):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                merged = dict(q)
                for k, v in updates.items():
                    if k not in ("id", "created_at", "source_generated_question_id"):
                        merged[k] = v

                is_valid, err = cls.validate_question_data(merged)
                if not is_valid:
                    raise ValueError(err)

                merged["updated_at"] = now
                merged["updated_by"] = updated_by
                all_app[idx] = merged
                updated_q = merged
                app_found = True
                break

        if app_found:
            _write_json(APP_QUESTIONS_FILE, all_app)
            if db and updated_q:
                try:
                    db.collection("approved_question_bank").document(updated_q["id"]).set(updated_q)
                except Exception as e:
                    print(f"[WARN] Firestore update failed: {e}")

        return updated_q

    @classmethod
    def approve_question(cls, question_id: str, approved_by: str = "Teacher") -> dict:
        """
        Approves a draft question:
          1. Validates 4-tier schema.
          2. Sets generated_question status to APPROVED.
          3. Copies it into approved_question_bank with active=True, deleted=False, exposure_count=0.
        """
        cls.initialize_seed_data()
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                target_q = q
                all_gen[idx]["status"] = "APPROVED"
                all_gen[idx]["active"] = True
                all_gen[idx]["deleted"] = False
                all_gen[idx]["approved_by"] = approved_by
                all_gen[idx]["approved_at"] = _now_iso()
                all_gen[idx]["updated_at"] = _now_iso()
                break

        if not target_q:
            # Check if it was already in approved bank
            approved_list = _read_json(APP_QUESTIONS_FILE, default=[])
            for aq in approved_list:
                if aq.get("id") == question_id or aq.get("question_id") == question_id:
                    return aq
            return None

        # Validate question before approval
        is_valid, err = cls.validate_question_data(target_q)
        if not is_valid:
            raise ValueError(f"Cannot approve invalid question: {err}")

        _write_json(GEN_QUESTIONS_FILE, all_gen)

        # Add / update in approved bank
        approved_list = _read_json(APP_QUESTIONS_FILE, default=[])
        app_entry = dict(target_q)
        app_entry["id"] = f"APP_{uuid.uuid4().hex[:8].upper()}"
        app_entry["status"] = "APPROVED"
        app_entry["approved_by"] = approved_by
        app_entry["approved_at"] = _now_iso()
        app_entry["source_generated_question_id"] = target_q.get("id")
        app_entry["exposure_count"] = int(target_q.get("exposure_count", 0))
        app_entry["active"] = True
        app_entry["deleted"] = False
        app_entry["updated_at"] = _now_iso()

        # Prevent duplicate question_id in approved bank
        approved_list = [item for item in approved_list if item.get("question_id") != target_q.get("question_id")]
        approved_list.append(app_entry)
        _write_json(APP_QUESTIONS_FILE, approved_list)

        # Sync to Firestore if online
        if db:
            try:
                db.collection("approved_question_bank").document(app_entry["id"]).set(app_entry)
            except Exception as e:
                print(f"[WARN] Firestore sync failed for approved question: {e}")

        return app_entry

    @classmethod
    def reject_question(cls, question_id: str, reason: str = "", rejected_by: str = "Teacher") -> dict:
        """Rejects a draft question, updating status to REJECTED."""
        now = _now_iso()
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["status"] = "REJECTED"
                q["rejection_reason"] = reason
                q["rejected_by"] = rejected_by
                q["rejected_at"] = now
                q["active"] = False
                q["updated_at"] = now
                all_gen[idx] = q
                target_q = q
                break

        if target_q:
            _write_json(GEN_QUESTIONS_FILE, all_gen)

        # If it was in approved bank, deactivate it
        all_app = _read_json(APP_QUESTIONS_FILE, default=[])
        for idx, aq in enumerate(all_app):
            if aq.get("id") == question_id or aq.get("question_id") == question_id:
                aq["active"] = False
                aq["updated_at"] = now
                all_app[idx] = aq
                _write_json(APP_QUESTIONS_FILE, all_app)
                break

        return target_q

    @classmethod
    def deactivate_question(cls, question_id: str, updated_by: str = "Teacher") -> dict:
        """Deactivates an approved question so it will not be sampled for student post-tests."""
        cls.initialize_seed_data()
        now = _now_iso()
        all_app = _read_json(APP_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_app):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["active"] = False
                q["updated_at"] = now
                q["updated_by"] = updated_by
                all_app[idx] = q
                target_q = q
                break

        if target_q:
            _write_json(APP_QUESTIONS_FILE, all_app)
            if db:
                try:
                    db.collection("approved_question_bank").document(target_q["id"]).update({"active": False, "updated_at": now})
                except Exception as e:
                    print(f"[WARN] Firestore deactivate failed: {e}")

        return target_q

    @classmethod
    def reactivate_question(cls, question_id: str, updated_by: str = "Teacher") -> dict:
        """Reactivates an approved question so it can be sampled for student post-tests."""
        cls.initialize_seed_data()
        now = _now_iso()
        all_app = _read_json(APP_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_app):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["active"] = True
                q["deleted"] = False
                q["status"] = "APPROVED"
                q["updated_at"] = now
                q["updated_by"] = updated_by
                all_app[idx] = q
                target_q = q
                break

        if target_q:
            _write_json(APP_QUESTIONS_FILE, all_app)
            if db:
                try:
                    db.collection("approved_question_bank").document(target_q["id"]).update({"active": True, "deleted": False, "updated_at": now})
                except Exception as e:
                    print(f"[WARN] Firestore reactivate failed: {e}")

        return target_q

    @classmethod
    def delete_question(cls, question_id: str, deleted_by: str = "Teacher") -> bool:
        """Soft deletes a question from approved bank and generated questions."""
        now = _now_iso()
        found = False

        # Soft delete in approved bank
        all_app = _read_json(APP_QUESTIONS_FILE, default=[])
        for idx, q in enumerate(all_app):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["deleted"] = True
                q["active"] = False
                q["deleted_at"] = now
                q["deleted_by"] = deleted_by
                q["updated_at"] = now
                all_app[idx] = q
                found = True
                break
        if found:
            _write_json(APP_QUESTIONS_FILE, all_app)

        # Soft delete in generated questions
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["deleted"] = True
                q["active"] = False
                q["deleted_at"] = now
                q["deleted_by"] = deleted_by
                q["updated_at"] = now
                all_gen[idx] = q
                found = True
                break
        if found:
            _write_json(GEN_QUESTIONS_FILE, all_gen)

        return found

    # ─────────────────────────────────────────────────────────────────────────
    # Approved Question Bank Queries
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    def get_approved_question_bank(cls, concept: str = None, active_only: bool = True, include_deleted: bool = False) -> list:
        """Retrieves questions from approved_question_bank with active and non-deleted filtering."""
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        
        if not include_deleted:
            approved = [q for q in approved if not q.get("deleted", False)]
            
        if active_only:
            approved = [q for q in approved if q.get("active", True) is True]
            
        if concept:
            concept_clean = concept.strip().lower()
            approved = [q for q in approved if q.get("concept_name", "").strip().lower() == concept_clean]
            
        return approved

    @classmethod
    def get_approved_question_by_id(cls, question_id: str) -> dict:
        """Fetches a specific approved question by question_id or id."""
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        for q in approved:
            if (q.get("question_id") == question_id or q.get("id") == question_id) and not q.get("deleted", False):
                return q
        return None

    @classmethod
    def increment_exposure_counts(cls, question_ids: list):
        """Increments exposure_count for the specified question IDs."""
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        changed = False

        for q in approved:
            if q.get("question_id") in question_ids or q.get("id") in question_ids:
                q["exposure_count"] = int(q.get("exposure_count", 0)) + 1
                q["updated_at"] = _now_iso()
                changed = True

        if changed:
            _write_json(APP_QUESTIONS_FILE, approved)

    # ─────────────────────────────────────────────────────────────────────────
    # Student Question Attempts & Session Tracking
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    def get_student_used_questions(cls, student_id: str, concept: str) -> tuple:
        """
        Returns (set_of_used_question_ids, set_of_used_equivalent_group_ids)
        for a given student and concept.
        """
        attempts = _read_json(ATTEMPTS_FILE, default=[])
        used_qids = set()
        used_groups = set()
        concept_lower = concept.strip().lower()

        for a in attempts:
            if str(a.get("student_id")) == str(student_id) and a.get("concept_name", "").strip().lower() == concept_lower:
                if a.get("question_id"):
                    used_qids.add(a.get("question_id"))
                if a.get("equivalent_group_id"):
                    used_groups.add(a.get("equivalent_group_id"))

        return used_qids, used_groups

    @classmethod
    def save_question_attempts(cls, attempts: list) -> bool:
        """Saves individual question attempts."""
        existing = _read_json(ATTEMPTS_FILE, default=[])
        now = _now_iso()

        for att in attempts:
            att_copy = dict(att)
            if not att_copy.get("id"):
                att_copy["id"] = f"ATT_{uuid.uuid4().hex[:8].upper()}"
            att_copy["created_at"] = att_copy.get("created_at") or now
            existing.append(att_copy)

        return _write_json(ATTEMPTS_FILE, existing)

    @classmethod
    def save_mastery_session(cls, session_data: dict) -> dict:
        """Saves a completed Schema Mastery post-test session."""
        existing = _read_json(SESSIONS_FILE, default=[])
        s_copy = dict(session_data)
        if not s_copy.get("session_id"):
            s_copy["session_id"] = f"SES_{uuid.uuid4().hex[:8].upper()}"
        s_copy["created_at"] = s_copy.get("created_at") or _now_iso()
        existing.append(s_copy)

        _write_json(SESSIONS_FILE, existing)

        # Firestore sync if available
        if db:
            try:
                db.collection("schema_mastery_sessions").document(s_copy["session_id"]).set(s_copy)
            except Exception as e:
                print(f"[WARN] Firestore sync failed for session: {e}")

        return s_copy


# Initialize seed data upon module load
SchemaQuestionBankService.initialize_seed_data()
