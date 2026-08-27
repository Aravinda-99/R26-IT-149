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
OPTION_MAPPINGS_FILE = os.path.join(STORAGE_DIR, "post_test_option_mappings.json")

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
    def initialize_seed_data(cls):
        """Ensures the approved question bank has initial seed questions if empty."""
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        if not approved:
            seed_data = _read_json(SEED_FILE, default=[])
            if seed_data:
                _write_json(APP_QUESTIONS_FILE, seed_data)
                print(f"[OK] Seeded {len(seed_data)} questions into approved_question_bank.json")
            else:
                print("[WARN] Seed questions file was empty or missing.")
        return approved

    @classmethod
    def seed_approved_questions_if_empty(cls):
        """Alias for initialize_seed_data."""
        return cls.initialize_seed_data()

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
            q_copy["created_at"] = q_copy.get("created_at") or now
            q_copy["updated_at"] = now
            existing.append(q_copy)
            saved.append(q_copy)

        _write_json(GEN_QUESTIONS_FILE, existing)
        return saved

    @classmethod
    def get_pending_questions(cls, concept: str = None) -> list:
        """Returns all questions with status PENDING for teacher review."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        pending = [q for q in all_gen if q.get("status") == "PENDING"]
        if concept:
            concept_lower = concept.strip().lower()
            pending = [q for q in pending if q.get("concept_name", "").strip().lower() == concept_lower]
        return pending

    @classmethod
    def get_generated_question_by_id(cls, question_id: str) -> dict:
        """Finds a generated question by its primary ID or question_id."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        for q in all_gen:
            if q.get("id") == question_id or q.get("question_id") == question_id:
                return q
        return None

    @classmethod
    def update_generated_question(cls, question_id: str, updates: dict) -> dict:
        """Updates fields of a generated question (e.g. edited text, options, qualities)."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        updated_q = None

        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                # Merge updates
                for k, v in updates.items():
                    if k not in ("id", "created_at"):
                        q[k] = v
                q["status"] = "EDITED" if q.get("status") == "PENDING" else q.get("status")
                q["updated_at"] = _now_iso()
                all_gen[idx] = q
                updated_q = q
                break

        if updated_q:
            _write_json(GEN_QUESTIONS_FILE, all_gen)
        return updated_q

    @classmethod
    def approve_question(cls, question_id: str, approved_by: str = "Teacher") -> dict:
        """
        Approves a draft question:
          1. Sets generated_question status to APPROVED.
          2. Copies it into approved_question_bank with active=True, exposure_count=0.
        """
        cls.initialize_seed_data()
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["status"] = "APPROVED"
                q["updated_at"] = _now_iso()
                all_gen[idx] = q
                target_q = q
                break

        if not target_q:
            # Check if it was already in approved bank
            approved_list = _read_json(APP_QUESTIONS_FILE, default=[])
            for aq in approved_list:
                if aq.get("id") == question_id or aq.get("question_id") == question_id:
                    return aq
            return None

        _write_json(GEN_QUESTIONS_FILE, all_gen)

        # Add to approved bank
        approved_list = _read_json(APP_QUESTIONS_FILE, default=[])
        app_entry = dict(target_q)
        app_entry["id"] = f"APP_{uuid.uuid4().hex[:8].upper()}"
        app_entry["approved_by"] = approved_by
        app_entry["source_generated_question_id"] = target_q.get("id")
        app_entry["exposure_count"] = 0
        app_entry["active"] = True
        app_entry["updated_at"] = _now_iso()

        # Prevent duplicate question_id in approved bank
        approved_list = [item for item in approved_list if item.get("question_id") != target_q.get("question_id")]
        approved_list.append(app_entry)
        _write_json(APP_QUESTIONS_FILE, approved_list)

        # Also sync to Firestore if online
        if db:
            try:
                db.collection("approved_question_bank").document(app_entry["id"]).set(app_entry)
            except Exception as e:
                print(f"[WARN] Firestore sync failed for approved question: {e}")

        return app_entry

    @classmethod
    def reject_question(cls, question_id: str, reason: str = "") -> dict:
        """Rejects a draft question, updating status to REJECTED."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(all_gen):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                q["status"] = "REJECTED"
                q["rejection_reason"] = reason
                q["updated_at"] = _now_iso()
                all_gen[idx] = q
                target_q = q
                break

        if target_q:
            _write_json(GEN_QUESTIONS_FILE, all_gen)
        return target_q

    # ─────────────────────────────────────────────────────────────────────────
    # Approved Question Bank Queries
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    def get_approved_question_bank(cls, concept: str = None, active_only: bool = True) -> list:
        """Retrieves questions from approved_question_bank."""
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
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
            if q.get("question_id") == question_id or q.get("id") == question_id:
                return q
        return None

    @classmethod
    def get_rejected_questions(cls, concept: str = None) -> list:
        """Returns all questions with status REJECTED."""
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        rejected = [q for q in all_gen if q.get("status") == "REJECTED"]
        if concept:
            concept_lower = concept.strip().lower()
            rejected = [q for q in rejected if q.get("concept_name", "").strip().lower() == concept_lower]
        return rejected

    @classmethod
    def toggle_approved_question_active(cls, question_id: str, active: bool = None) -> dict:
        """Toggles or sets the active state of an approved question."""
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        target_q = None

        for idx, q in enumerate(approved):
            if q.get("id") == question_id or q.get("question_id") == question_id:
                if active is None:
                    q["active"] = not q.get("active", True)
                else:
                    q["active"] = bool(active)
                q["updated_at"] = _now_iso()
                approved[idx] = q
                target_q = q
                break

        if target_q:
            _write_json(APP_QUESTIONS_FILE, approved)
        return target_q

    @classmethod
    def increment_exposure_counts(cls, question_ids: list):
        """Increments the exposure_count for all questions used in a session."""
        if not question_ids:
            return
        cls.initialize_seed_data()
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        qid_set = set(question_ids)
        modified = False

        for q in approved:
            if q.get("id") in qid_set or q.get("question_id") in qid_set:
                q["exposure_count"] = q.get("exposure_count", 0) + 1
                modified = True

        if modified:
            _write_json(APP_QUESTIONS_FILE, approved)

    @classmethod
    def get_teacher_overview_stats(cls) -> dict:
        """Returns aggregate metrics for teacher/admin dashboard."""
        cls.initialize_seed_data()
        all_gen = _read_json(GEN_QUESTIONS_FILE, default=[])
        approved = _read_json(APP_QUESTIONS_FILE, default=[])
        sessions = _read_json(SESSIONS_FILE, default=[])
        attempts = _read_json(ATTEMPTS_FILE, default=[])

        pending_count = len([q for q in all_gen if q.get("status") == "PENDING"])
        rejected_count = len([q for q in all_gen if q.get("status") == "REJECTED"])
        approved_active_count = len([q for q in approved if q.get("active", True) is True])
        approved_total_count = len(approved)
        sessions_count = len(sessions)
        attempts_count = len(attempts)

        return {
            "pending_count": pending_count,
            "approved_active_count": approved_active_count,
            "approved_total_count": approved_total_count,
            "rejected_count": rejected_count,
            "sessions_count": sessions_count,
            "attempts_count": attempts_count,
        }

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

    # ─────────────────────────────────────────────────────────────────────────
    # Post-Test Option Mappings (Option Shuffling Persistence)
    # ─────────────────────────────────────────────────────────────────────────

    @classmethod
    def save_session_option_mappings(cls, session_id: str, mappings: dict) -> bool:
        """
        Saves shuffled option mappings for a post-test session.
        mappings format: {
            "question_id_1": {"A": "C", "B": "A", "C": "D", "D": "B"}, # displayed -> canonical
            ...
        }
        """
        existing = _read_json(OPTION_MAPPINGS_FILE, default={})
        if isinstance(existing, list):
            existing = {}
        existing[str(session_id)] = {
            "session_id": str(session_id),
            "created_at": _now_iso(),
            "mappings": mappings,
        }
        return _write_json(OPTION_MAPPINGS_FILE, existing)

    @classmethod
    def get_session_option_mappings(cls, session_id: str) -> dict:
        """Retrieves all question option mappings for a given session."""
        all_mappings = _read_json(OPTION_MAPPINGS_FILE, default={})
        if isinstance(all_mappings, list):
            return {}
        session_data = all_mappings.get(str(session_id), {})
        return session_data.get("mappings", {})

    @classmethod
    def get_option_mapping(cls, session_id: str, question_id: str) -> dict:
        """
        Retrieves the displayed_key -> canonical_key mapping for a specific question in a session.
        Returns dict like {"A": "C", "B": "A", "C": "D", "D": "B"} or {} if not found.
        """
        session_mappings = cls.get_session_option_mappings(session_id)
        return session_mappings.get(str(question_id), {})


# Initialize seed data upon module load
SchemaQuestionBankService.initialize_seed_data()
