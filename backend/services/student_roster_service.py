"""Reversible teacher-roster visibility; never deletes accounts or learning data."""
import json
import os
import secrets
import threading
from datetime import datetime, timezone

from itsdangerous import URLSafeTimedSerializer, BadSignature, SignatureExpired
from services.user_storage_service import UserStorageService
from services.schema_post_test_result_service import SchemaPostTestResultService

ARCHIVES_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "schema_mastery", "student_roster_archives.json")
_lock = threading.RLock()
_signer = URLSafeTimedSerializer(os.environ.get("ROSTER_SESSION_SECRET") or secrets.token_hex(32), salt="teacher-roster")


class StudentRosterService:
    @staticmethod
    def issue_token(profile):
        return _signer.dumps({"uid": profile["uid"]})

    @staticmethod
    def verify_teacher(token):
        try:
            payload = _signer.loads(token, max_age=12 * 60 * 60)
        except (BadSignature, SignatureExpired):
            raise PermissionError("Please sign in to the Faculty Portal again.")
        profile = UserStorageService.get_user(payload.get("uid"))
        if not profile or profile.get("role") not in ("teacher", "admin"):
            raise PermissionError("Teacher or admin access is required.")
        return profile

    @staticmethod
    def _read():
        if not os.path.exists(ARCHIVES_FILE):
            return {}
        with open(ARCHIVES_FILE, encoding="utf-8") as source:
            data = json.load(source)
        if not isinstance(data, dict):
            raise ValueError("Student archive metadata is invalid.")
        return data

    @classmethod
    def archived_students(cls):
        with _lock:
            return [dict(record) for record in cls._read().values() if record.get("archived") is True]

    @classmethod
    def active_students(cls, students):
        archived = cls.archived_students()
        ids = {r["student_id"] for r in archived}
        emails = {r.get("email", "").strip().lower() for r in archived if r.get("email")}
        return [s for s in students if str(s.get("studentId") or s.get("uid") or s.get("id")) not in ids
                and str(s.get("email") or "").strip().lower() not in emails]

    @classmethod
    def set_archived(cls, student_id, archived, actor):
        with _lock:
            records = cls._read()
            record = records.get(student_id)
            if archived:
                profile = UserStorageService.get_user(student_id)
                if profile and profile.get("role") in ("teacher", "admin"):
                    raise ValueError("Faculty accounts cannot be removed from the student roster.")
                result = None if profile else SchemaPostTestResultService.get_latest_for_student(student_id)
                if not profile and not result and not record:
                    raise LookupError("Student not found.")
                profile = profile or {}
                result = result or {}
                record = {
                    **(record or {}), "student_id": student_id,
                    "name": profile.get("display_name") or profile.get("name") or result.get("student_name") or (record or {}).get("name") or student_id,
                    "email": profile.get("email") or result.get("student_email") or (record or {}).get("email", ""),
                }
            elif not record:
                raise LookupError("Archived student not found.")
            now = datetime.now(timezone.utc).isoformat()
            record.update({"archived": archived,
                           "archived_at" if archived else "restored_at": now,
                           "archived_by" if archived else "restored_by": actor["uid"]})
            records[student_id] = record
            os.makedirs(os.path.dirname(ARCHIVES_FILE), exist_ok=True)
            with open(ARCHIVES_FILE + ".tmp", "w", encoding="utf-8") as destination:
                json.dump(records, destination, indent=2)
            os.replace(ARCHIVES_FILE + ".tmp", ARCHIVES_FILE)
            return dict(record)
