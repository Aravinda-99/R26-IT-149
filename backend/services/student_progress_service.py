"""
Component 1 — Student Progress persistence
=========================================
Stores the per-session adaptive-quiz metrics under each student:

  student_progress/{student_id}                  -> rolling "latest" snapshot
  student_progress/{student_id}/sessions/{auto}  -> one doc per completed quiz

Saved fields: accuracy, avg_attempts, avg_time_sec, engagement_score,
current_level, next_level.

Falls back to an in-memory store when Firestore is offline (db is None).
"""

import datetime
from firebase.firebase_service import db

# In-memory fallback: {student_id: [record, ...]}
_fallback = {}


def _num(value, default=0.0):
    try:
        return round(float(value), 4)
    except (TypeError, ValueError):
        return default


class StudentProgressService:

    @staticmethod
    def save_metrics(data: dict) -> dict:
        student_id = str(data.get("student_id") or "anonymous")
        now = datetime.datetime.now()

        record = {
            "student_id":       student_id,
            "accuracy":         _num(data.get("accuracy")),
            "avg_attempts":     _num(data.get("avg_attempts")),
            "avg_time_sec":     _num(data.get("avg_time_sec")),
            "engagement_score": _num(data.get("engagement_score")),
            "current_level":    data.get("current_level") or "beginner",
            "next_level":       data.get("next_level")
                                or data.get("next_difficulty")
                                or "beginner",
            "created_at":       now.isoformat(),
        }

        # ---- Offline fallback --------------------------------------------
        if db is None:
            _fallback.setdefault(student_id, []).append(record)
            return {
                "success": True,
                "storage": "memory",
                "session_count": len(_fallback[student_id]),
                "saved": record,
            }

        # ---- Firestore -------------------------------------------------
        student_ref = db.collection("student_progress").document(student_id)

        session_ref = student_ref.collection("sessions").document()
        session_ref.set(record)

        # Keep a rolling snapshot of the most recent result on the parent doc
        student_ref.set({
            "student_id": student_id,
            "latest":     record,
            "updated_at": now.isoformat(),
        }, merge=True)

        return {
            "success": True,
            "storage": "firestore",
            "session_id": session_ref.id,
            "saved": record,
        }

    @staticmethod
    def get_history(student_id: str) -> dict:
        student_id = str(student_id)

        if db is None:
            return {
                "student_id": student_id,
                "sessions": _fallback.get(student_id, []),
            }

        docs = (
            db.collection("student_progress")
              .document(student_id)
              .collection("sessions")
              .order_by("created_at")
              .stream()
        )
        return {
            "student_id": student_id,
            "sessions": [d.to_dict() for d in docs],
        }
