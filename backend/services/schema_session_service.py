"""
Component 4 / Multi-Component: Learning Session Service
======================================================
Manages persistent learning session context for each student across the 4 components:
  1. Component 1: Diagnostic Pre-Test (concept_name, weak_concept, pre_test_score, attempt_count, time_taken_seconds)
  2. Component 2: Error Feedback (error_type, error_pattern_score, error_reason)
  3. Component 3: Game Lessons (recommended_game_id, recommended_game_name, completed)
  4. Component 4: Schema Mastery / Post-Test (unlocked, post_test_completed, mastery_level, next_action)

Dual-layer persistence:
  - Local JSON: backend/data/schema_mastery/schema_mastery_sessions.json (Primary offline & local fallback)
  - Firestore: collection 'learning_sessions' (Best-effort background sync)
"""

import json
import os
import re
import threading
import uuid
from datetime import datetime, timezone

from firebase.firebase_service import db

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data", "schema_mastery")
SESSIONS_FILE = os.path.join(DATA_DIR, "schema_mastery_sessions.json")
FIRESTORE_COOLDOWN_SECONDS = 300

_lock = threading.RLock()
_firestore_cooldown_until = 0
_last_firestore_warning_at = 0


def _now_iso():
    return datetime.now(timezone.utc).isoformat()


def _safe_id(value):
    cleaned = re.sub(r"[^A-Za-z0-9_.-]+", "_", str(value or "").strip())
    return cleaned.strip("_") or uuid.uuid4().hex[:10]


def _read_sessions():
    if not os.path.exists(SESSIONS_FILE):
        return {}
    try:
        with open(SESSIONS_FILE, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data if isinstance(data, dict) else {}
    except Exception as e:
        print(f"[WARN] Failed to read schema mastery sessions: {e}")
        return {}


def _write_sessions(sessions):
    os.makedirs(DATA_DIR, exist_ok=True)
    tmp_path = f"{SESSIONS_FILE}.tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(sessions, f, indent=2, ensure_ascii=False)
    os.replace(tmp_path, SESSIONS_FILE)


def _is_firestore_unavailable_error(error):
    text = str(error)
    markers = ("429", "Quota", "ResourceExhausted", "504", "Deadline", "Deadline Exceeded", "timeout")
    return any(marker.lower() in text.lower() for marker in markers)


def _normalize_score(val):
    if val is None:
        return 0.0
    if isinstance(val, str):
        val = val.strip().rstrip("%")
    try:
        num = float(val)
    except (ValueError, TypeError):
        return 0.0
    if num < 0.0:
        return 0.0
    if num > 1.0:
        num = num / 100.0
    return max(0.0, min(1.0, round(num, 4)))


def calculate_error_pattern_score(error_analysis_result: dict) -> dict:
    """
    Calculates or extracts the normalized error_pattern_score (0.0 to 1.0)
    indicating how strongly the detected error pattern appears in the learner's evidence.
    
    Priority Hierarchy:
      1. Component 2 confidence / probability (confidence_score, final_confidence_pct,
         xai_confidence_pct, confidence, probability, score) -> normalized to 0.0 - 1.0
      2. Dominant error count / total error count ratio (if repeated error counts are present)
      3. Severity label mapping (HIGH -> 0.85, MEDIUM -> 0.60, LOW -> 0.35)
      4. Safe labeled fallback: 0.50 with source 'fallback_no_confidence_available'
    """
    if not isinstance(error_analysis_result, dict):
        return {
            "error_pattern_score": 0.50,
            "error_pattern_score_source": "fallback_no_confidence_available",
            "dominant_error_count": None,
            "total_error_count": None,
        }

    # 1. Check direct numerical confidence / probability fields
    conf_raw = None
    for field in (
        "confidence_score",
        "final_confidence_pct",
        "recalibrated_confidence_pct",
        "xai_confidence_pct",
        "confidence",
        "probability",
        "error_pattern_score",
        "score",
    ):
        val = error_analysis_result.get(field)
        if val is not None:
            if isinstance(val, (int, float)):
                conf_raw = float(val)
                break
            elif isinstance(val, str) and val.strip().replace(".", "", 1).replace("%", "").isdigit():
                conf_raw = float(val.strip().rstrip("%"))
                break

    # Also check nested xai_explanation or prediction confidence
    if conf_raw is None:
        xai = error_analysis_result.get("xai_explanation") or {}
        if isinstance(xai, dict) and xai.get("xai_confidence_pct") is not None:
            try:
                conf_raw = float(xai.get("xai_confidence_pct"))
            except (ValueError, TypeError):
                pass

    if conf_raw is None:
        pred_dict = error_analysis_result.get("prediction") or {}
        if isinstance(pred_dict, dict) and pred_dict.get("confidence_score") is not None:
            try:
                conf_raw = float(pred_dict.get("confidence_score"))
            except (ValueError, TypeError):
                pass

    if conf_raw is not None:
        norm_score = _normalize_score(conf_raw)
        return {
            "error_pattern_score": norm_score,
            "error_pattern_score_source": "component2_confidence",
            "dominant_error_count": error_analysis_result.get("dominant_error_count"),
            "total_error_count": error_analysis_result.get("total_error_count"),
        }

    # 2. Check repeated error count ratio: dominant_error_count / total_error_count
    dom_count = error_analysis_result.get("dominant_error_count") or error_analysis_result.get("pattern_count") or error_analysis_result.get("error_count")
    tot_count = error_analysis_result.get("total_error_count") or error_analysis_result.get("total_wrong") or error_analysis_result.get("total_submissions")
    if dom_count is not None and tot_count is not None:
        try:
            d_val = float(dom_count)
            t_val = float(tot_count)
            if t_val > 0:
                ratio = max(0.0, min(1.0, round(d_val / t_val, 4)))
                return {
                    "error_pattern_score": ratio,
                    "error_pattern_score_source": "dominant_error_ratio",
                    "dominant_error_count": int(d_val),
                    "total_error_count": int(t_val),
                }
        except (ValueError, TypeError):
            pass

    # 3. Check severity label mapping
    severity = error_analysis_result.get("severity")
    if not severity and isinstance(error_analysis_result.get("prediction"), dict):
        severity = error_analysis_result["prediction"].get("severity") or error_analysis_result["prediction"].get("confidence_level")
    if not severity:
        severity = error_analysis_result.get("confidence_level")

    if severity and isinstance(severity, str):
        sev_clean = severity.strip().upper()
        if "HIGH" in sev_clean:
            return {
                "error_pattern_score": 0.85,
                "error_pattern_score_source": "severity_mapping",
                "dominant_error_count": None,
                "total_error_count": None,
            }
        elif "MED" in sev_clean:
            return {
                "error_pattern_score": 0.60,
                "error_pattern_score_source": "severity_mapping",
                "dominant_error_count": None,
                "total_error_count": None,
            }
        elif "LOW" in sev_clean:
            return {
                "error_pattern_score": 0.35,
                "error_pattern_score_source": "severity_mapping",
                "dominant_error_count": None,
                "total_error_count": None,
            }

    # 4. Safe fallback
    return {
        "error_pattern_score": 0.50,
        "error_pattern_score_source": "fallback_no_confidence_available",
        "dominant_error_count": None,
        "total_error_count": None,
    }


class SchemaSessionService:
    """Service to track and synchronize student learning flow across components."""

    @classmethod
    def _sync_to_firestore_background(cls, session_data):
        """Asynchronously sync session document to Firestore."""
        global _firestore_cooldown_until, _last_firestore_warning_at

        def _worker():
            global _firestore_cooldown_until, _last_firestore_warning_at
            if db is None:
                return

            now = datetime.now(timezone.utc).timestamp()
            if now < _firestore_cooldown_until:
                return

            student_id = session_data.get("student_id")
            session_id = session_data.get("session_id")
            if not student_id:
                return

            doc_id = f"SESSION_{_safe_id(student_id)}"
            try:
                db.collection("learning_sessions").document(doc_id).set(session_data, merge=True)
            except Exception as e:
                if _is_firestore_unavailable_error(e):
                    _firestore_cooldown_until = now + FIRESTORE_COOLDOWN_SECONDS
                    if now - _last_firestore_warning_at > 60:
                        _last_firestore_warning_at = now
                        print(f"[WARN] Firestore unavailable for learning session sync, continuing in local mode: {e}")
                else:
                    print(f"[WARN] Firestore sync failed for session {session_id}: {e}")

        threading.Thread(target=_worker, daemon=True).start()

    @classmethod
    def _create_default_session(cls, student_id: str, student_name: str = "Learner", student_email: str = "") -> dict:
        sess_id = f"SESS_{uuid.uuid4().hex[:8].upper()}"
        now = _now_iso()
        return {
            "session_id": sess_id,
            "student_id": student_id,
            "student_name": student_name,
            "student_email": student_email,
            "component_1": {
                "completed": False,
                "concept_name": None,
                "weak_concept": None,
                "pre_test_score": None,
                "attempt_count": 0,
                "time_taken_seconds": 0,
                "completed_at": None,
            },
            "component_2": {
                "completed": False,
                "error_type": None,
                "error_pattern_score": None,
                "error_reason": None,
                "completed_at": None,
            },
            "component_3": {
                "completed": False,
                "recommended_game_id": None,
                "recommended_game_name": None,
                "completed_at": None,
            },
            "component_4": {
                "unlocked": False,
                "post_test_started": False,
                "post_test_completed": False,
                "post_test_score": None,
                "mastery_level": None,
                "next_action": None,
                "completed_at": None,
            },
            "current_stage": "PRE_TEST_PENDING",
            "created_at": now,
            "updated_at": now,
        }

    @classmethod
    def get_or_create_session(cls, student_id: str, student_name: str = None, student_email: str = None) -> dict:
        """Retrieves active learning session for the student or initializes a fresh one."""
        if not student_id:
            return cls._create_default_session("STU_ANON")

        with _lock:
            sessions = _read_sessions()
            student_key = str(student_id).strip()
            session = sessions.get(student_key)

            if not session:
                session = cls._create_default_session(
                    student_id=student_key,
                    student_name=student_name or "Learner",
                    student_email=student_email or ""
                )
                sessions[student_key] = session
                _write_sessions(sessions)
                cls._sync_to_firestore_background(session)
            else:
                # Update name/email if provided
                if student_name and session.get("student_name") in ("Learner", None, ""):
                    session["student_name"] = student_name
                if student_email and not session.get("student_email"):
                    session["student_email"] = student_email

            return session

    @classmethod
    def get_current_session(cls, student_id: str) -> dict:
        """Returns the current session for student without forcing a new session creation."""
        return cls.get_or_create_session(student_id)

    @classmethod
    def save_component_1_data(cls, student_id: str, data: dict) -> dict:
        """
        Saves Component 1 Pre-Test outcomes into the session:
          concept_name, weak_concept, pre_test_score, attempt_count, time_taken_seconds.
        Transitions stage to 'ERROR_FEEDBACK_READY'.
        """
        with _lock:
            session = cls.get_or_create_session(
                student_id,
                student_name=data.get("student_name"),
                student_email=data.get("student_email")
            )
            student_key = str(student_id).strip()

            concept = data.get("concept_name") or data.get("weak_concept") or data.get("targetConcept") or "Arrays"
            weak_concept = data.get("weak_concept") or data.get("weakConcept") or concept
            score = _normalize_score(data.get("pre_test_score", data.get("score", data.get("percent", 0.5))))
            attempts = int(data.get("attempt_count", data.get("attempts", 1)) or 1)
            duration = float(data.get("time_taken_seconds", data.get("durationSeconds", data.get("time_taken", 60.0))) or 60.0)

            session["component_1"] = {
                "completed": True,
                "concept_name": concept,
                "weak_concept": weak_concept,
                "pre_test_score": score,
                "attempt_count": max(1, attempts),
                "time_taken_seconds": round(duration, 1),
                "completed_at": _now_iso(),
            }

            # If component 2 is not completed, advance stage to ERROR_FEEDBACK_READY
            if not session["component_2"].get("completed"):
                session["current_stage"] = "ERROR_FEEDBACK_READY"

            session["updated_at"] = _now_iso()

            sessions = _read_sessions()
            sessions[student_key] = session
            _write_sessions(sessions)
            cls._sync_to_firestore_background(session)
            return session

    @classmethod
    def save_component_2_data(cls, student_id: str, data: dict) -> dict:
        """
        Saves Component 2 Error Feedback outcomes into the session:
          error_type, error_pattern_score, error_pattern_score_source, error_reason.
        Transitions stage to 'GAME_LESSON_READY'.
        """
        with _lock:
            session = cls.get_or_create_session(student_id)
            student_key = str(student_id).strip()

            error_type = data.get("error_type") or data.get("reason_group") or data.get("predicted_label") or "UNKNOWN_ERROR"
            
            # Calculate error_pattern_score and source using priority hierarchy
            score_meta = calculate_error_pattern_score(data)
            error_pattern_score = score_meta["error_pattern_score"]
            error_pattern_score_source = score_meta["error_pattern_score_source"]

            error_reason = data.get("error_reason") or data.get("reason") or data.get("misconception")
            if not error_reason and isinstance(data.get("explanation"), dict):
                error_reason = data["explanation"].get("misconception") or data["explanation"].get("reason") or ""
            if not error_reason:
                error_reason = ""

            session["component_2"] = {
                "completed": True,
                "error_type": error_type,
                "error_pattern_score": error_pattern_score,
                "error_pattern_score_source": error_pattern_score_source,
                "error_reason": error_reason,
                "dominant_error_count": score_meta.get("dominant_error_count"),
                "total_error_count": score_meta.get("total_error_count"),
                "completed_at": _now_iso(),
            }

            # Top-level convenience mirrors for Component 4
            session["error_type"] = error_type
            session["error_pattern_score"] = error_pattern_score
            session["error_pattern_score_source"] = error_pattern_score_source

            # If component 3 is not completed, advance stage to GAME_LESSON_READY
            if not session["component_3"].get("completed"):
                session["current_stage"] = "GAME_LESSON_READY"

            session["updated_at"] = _now_iso()

            sessions = _read_sessions()
            sessions[student_key] = session
            _write_sessions(sessions)
            cls._sync_to_firestore_background(session)
            return session

    @classmethod
    def save_component_3_data(cls, student_id: str, data: dict) -> dict:
        """
        Saves Component 3 Game Lesson completion into the session:
          recommended_game_id, recommended_game_name, completed.
        Unlocks Component 4 and sets current_stage to 'UNDERSTANDING_CHECK_READY'.
        """
        with _lock:
            session = cls.get_or_create_session(student_id)
            student_key = str(student_id).strip()

            game_id = data.get("recommended_game_id") or data.get("game_id") or "game_foundation"
            game_name = data.get("recommended_game_name") or data.get("game_name") or "Java Concept Trilogy"

            session["component_3"] = {
                "completed": True,
                "recommended_game_id": game_id,
                "recommended_game_name": game_name,
                "completed_at": _now_iso(),
            }

            session["component_4"]["unlocked"] = True
            session["current_stage"] = "UNDERSTANDING_CHECK_READY"
            session["updated_at"] = _now_iso()

            sessions = _read_sessions()
            sessions[student_key] = session
            _write_sessions(sessions)
            cls._sync_to_firestore_background(session)
            return session

    @classmethod
    def save_component_4_data(cls, student_id: str, data: dict) -> dict:
        """
        Saves Component 4 Post-Test outcomes into the session:
          post_test_score, mastery_level, next_action.
        Sets current_stage to 'MASTERY_EVALUATED'.
        """
        with _lock:
            session = cls.get_or_create_session(student_id)
            student_key = str(student_id).strip()

            post_test_score = _normalize_score(data.get("post_test_score", 0.0))
            mastery_level = str(data.get("mastery_level", "Developing"))
            next_action = str(data.get("next_action", "LEARN_AGAIN"))

            session["component_4"].update({
                "unlocked": True,
                "post_test_started": True,
                "post_test_completed": True,
                "post_test_score": post_test_score,
                "mastery_level": mastery_level,
                "next_action": next_action,
                "completed_at": _now_iso(),
            })

            session["current_stage"] = "MASTERY_EVALUATED"
            session["updated_at"] = _now_iso()

            sessions = _read_sessions()
            sessions[student_key] = session
            _write_sessions(sessions)
            cls._sync_to_firestore_background(session)
            return session

    @classmethod
    def get_context_summary(cls, student_id: str) -> dict:
        """
        Returns full structured verification and prerequisite context for a student.
        Checked before starting Understanding Check.
        """
        session = cls.get_or_create_session(student_id)

        c1 = session.get("component_1", {})
        c2 = session.get("component_2", {})
        c3 = session.get("component_3", {})
        c4 = session.get("component_4", {})

        c1_completed = bool(c1.get("completed") and c1.get("concept_name"))
        c2_completed = bool(c2.get("completed") and c2.get("error_type"))
        c3_completed = bool(c3.get("completed"))

        missing_fields = []
        if not c1.get("concept_name"):
            missing_fields.append("concept_name")
        if c1.get("pre_test_score") is None:
            missing_fields.append("pre_test_score")
        if not c1.get("attempt_count"):
            missing_fields.append("attempt_count")
        if not c1.get("time_taken_seconds"):
            missing_fields.append("time_taken_seconds")
        if not c2.get("error_type"):
            missing_fields.append("error_type")
        if c2.get("error_pattern_score") is None:
            missing_fields.append("error_pattern_score")
        if not c3.get("completed"):
            missing_fields.append("game_lesson_completed")

        # Ready for post-test if Pre-Test and Error Feedback are done (Game lesson recommended)
        ready_for_post_test = c1_completed and c2_completed and c3_completed

        # Auto-unlock component_4 if prerequisites are met
        if ready_for_post_test and not c4.get("unlocked"):
            c4["unlocked"] = True

        return {
            "success": True,
            "student_id": session.get("student_id"),
            "session_id": session.get("session_id"),
            "student_name": session.get("student_name"),
            "ready_for_post_test": ready_for_post_test,
            "current_stage": session.get("current_stage"),
            "missing_fields": missing_fields,
            "component_1": c1,
            "component_2": c2,
            "component_3": c3,
            "component_4": c4,
            "created_at": session.get("created_at"),
            "updated_at": session.get("updated_at"),
        }

    @classmethod
    def reset_session(cls, student_id: str) -> dict:
        """Resets the learning session for a fresh retry cycle."""
        with _lock:
            student_key = str(student_id).strip()
            sessions = _read_sessions()
            old_sess = sessions.get(student_key, {})
            name = old_sess.get("student_name", "Learner")
            email = old_sess.get("student_email", "")

            fresh = cls._create_default_session(student_key, student_name=name, student_email=email)
            sessions[student_key] = fresh
            _write_sessions(sessions)
            cls._sync_to_firestore_background(fresh)
            return fresh
