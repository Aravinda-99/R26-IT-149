"""
Component 4 post-test result persistence.

Stores completed schema mastery post-test results locally first, then syncs
Firestore as a best-effort background task so quota/deadline failures do not
block the student result page or teacher visibility.
"""

import json
import os
import re
import threading
import time
import uuid
from datetime import datetime, timezone

from firebase.firebase_service import db


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "schema_mastery")
RESULTS_FILE = os.path.join(DATA_DIR, "post_test_results.json")
FIRESTORE_COOLDOWN_SECONDS = 300

_lock = threading.RLock()
_firestore_cooldown_until = 0
_last_firestore_warning_at = 0


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _safe_id(value):
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", str(value or "").strip())
    return cleaned.strip("_") or uuid.uuid4().hex[:10]


def _read_results():
    if not os.path.exists(RESULTS_FILE):
        return []
    try:
        with open(RESULTS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, list) else []
    except Exception as e:
        print(f"[WARN] Failed to read Component 4 post-test results: {e}")
        return []


def _write_results(results):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp_path = f"{RESULTS_FILE}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    os.replace(tmp_path, RESULTS_FILE)


def _matches_filters(record, filters):
    student_id = filters.get("student_id")
    concept = filters.get("concept")
    mastery_level = filters.get("mastery_level")
    next_action = filters.get("next_action")

    if student_id and str(record.get("student_id")) != str(student_id):
        return False
    if concept and str(record.get("concept_name", "")).strip().lower() != str(concept).strip().lower():
        return False
    if mastery_level and str(record.get("mastery_level", "")).strip().lower() != str(mastery_level).strip().lower():
        return False
    if next_action and str(record.get("next_action", "")).strip().upper() != str(next_action).strip().upper():
        return False
    return True


def _is_firestore_unavailable_error(error):
    text = str(error)
    markers = ("429", "Quota", "ResourceExhausted", "504", "Deadline", "Deadline Exceeded", "timeout")
    return any(marker.lower() in text.lower() for marker in markers)


class SchemaPostTestResultService:
    """Local-first storage and teacher-facing result retrieval."""

    @staticmethod
    def make_result_id(student_id, session_id):
        return f"PTR_{_safe_id(student_id)}_{_safe_id(session_id)}"

    @staticmethod
    def learning_status_for_level(mastery_level):
        mapping = {
            "Strong Understanding": "Stable",
            "Good Progress": "Progressing Well",
            "Needs More Practice": "Developing",
            "Learn Again": "Needs Support",
        }
        return mapping.get(str(mastery_level or ""), "Developing")

    @staticmethod
    def student_next_action_label(next_action):
        return "Continue" if str(next_action or "").upper() == "DONE" else "Review Again"

    @classmethod
    def save_local_result(cls, record):
        now = _now_iso()
        saved = dict(record)
        saved["result_id"] = saved.get("result_id") or cls.make_result_id(
            saved.get("student_id"),
            saved.get("session_id"),
        )
        saved["created_at"] = saved.get("created_at") or now
        saved["updated_at"] = now

        with _lock:
            results = _read_results()
            replaced = False
            for idx, existing in enumerate(results):
                same_result = existing.get("result_id") == saved["result_id"]
                same_session = (
                    existing.get("student_id") == saved.get("student_id")
                    and existing.get("session_id") == saved.get("session_id")
                )
                if same_result or same_session:
                    saved["created_at"] = existing.get("created_at") or saved["created_at"]
                    results[idx] = {**existing, **saved, "updated_at": now}
                    replaced = True
                    break

            if not replaced:
                results.append(saved)

            _write_results(results)

        return saved

    @classmethod
    def list_results(cls, filters=None):
        filters = filters or {}
        with _lock:
            results = list(_read_results())
        results = [r for r in results if _matches_filters(r, filters)]
        results.sort(key=lambda r: r.get("created_at") or r.get("updated_at") or "", reverse=True)
        return results

    @classmethod
    def get_latest_for_student(cls, student_id, session_id=None):
        filters = {"student_id": student_id}
        results = cls.list_results(filters)
        if session_id:
            session_results = [r for r in results if str(r.get("session_id")) == str(session_id)]
            if session_results:
                return session_results[0]
        return results[0] if results else None

    @classmethod
    def get_latest_for_student_concept(cls, student_id, concept_name):
        results = cls.list_results({"student_id": student_id, "concept": concept_name})
        return results[0] if results else None

    @classmethod
    def _sync_firestore_worker(cls, result_record, mcq_record):
        global _firestore_cooldown_until, _last_firestore_warning_at

        if not db:
            return

        now = time.time()
        if now < _firestore_cooldown_until:
            return

        try:
            result_id = result_record["result_id"]
            db.collection("schema_mastery_post_test_results").document(result_id).set(result_record, merge=True, timeout=3)

            concept_key = str(result_record.get("concept_name", "")).strip().lower()
            mcq_doc_id = f"{result_record.get('student_id')}_{concept_key}"
            db.collection("mcq_posttest_results").document(mcq_doc_id).set(mcq_record, merge=True, timeout=3)
            result_record["persistence_status"] = "local_and_firestore_saved"
            cls.save_local_result(result_record)
        except Exception as e:
            result_record["persistence_status"] = "local_saved_firestore_failed"
            cls.save_local_result(result_record)
            if _is_firestore_unavailable_error(e):
                _firestore_cooldown_until = time.time() + FIRESTORE_COOLDOWN_SECONDS
                if time.time() - _last_firestore_warning_at > FIRESTORE_COOLDOWN_SECONDS:
                    _last_firestore_warning_at = time.time()
                    print("[WARN] Firestore unavailable for post-test results. Saved locally for 5 minutes.")
            else:
                print(f"[WARN] Firestore post-test result sync failed: {e}")

    @classmethod
    def save_firestore_best_effort(cls, result_record, mcq_record):
        if not db:
            return "local_saved_firestore_failed"

        if time.time() < _firestore_cooldown_until:
            return "local_saved_firestore_failed"

        worker = threading.Thread(
            target=cls._sync_firestore_worker,
            args=(dict(result_record), dict(mcq_record)),
            daemon=True,
        )
        worker.start()
        return "local_saved_firestore_pending"


__all__ = ["SchemaPostTestResultService", "RESULTS_FILE"]
