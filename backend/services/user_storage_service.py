"""
User Storage Service
====================
Persistent local storage + Firestore sync for registered CodeQuest users.
Prevents data loss when Firebase Free Spark plan hits 429 Quota Exceeded.
"""

import os
import json
import time
from datetime import datetime, timezone
from firebase.firebase_service import db

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
STORAGE_FILE = os.path.join(DATA_DIR, "registered_users.json")

# In-memory fast cache
_in_memory_users = {}
_firestore_cooldown_until = 0  # Timestamp until which Firestore reads are skipped on 429
COOLDOWN_SECONDS = 300  # 5 minutes


def _load_from_disk():
    global _in_memory_users
    if os.path.exists(STORAGE_FILE):
        try:
            with open(STORAGE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                if isinstance(data, dict):
                    _in_memory_users = data
                elif isinstance(data, list):
                    _in_memory_users = {u.get("uid") or u.get("id"): u for u in data if u}
        except Exception as e:
            print(f"[WARN] Error reading registered_users.json: {e}")


def _save_to_disk():
    try:
        os.makedirs(DATA_DIR, exist_ok=True)
        with open(STORAGE_FILE, "w", encoding="utf-8") as f:
            json.dump(_in_memory_users, f, indent=2)
    except Exception as e:
        print(f"[WARN] Error saving registered_users.json: {e}")


# Initialize on module load
_load_from_disk()


class UserStorageService:

    @staticmethod
    def sanitize_user(user_doc: dict) -> dict:
        """Strips sensitive fields like password_hash from user dictionary."""
        if not user_doc or not isinstance(user_doc, dict):
            return None
        safe_copy = dict(user_doc)
        safe_copy.pop("password_hash", None)
        return safe_copy

    @staticmethod
    def save_user(profile: dict) -> dict:
        """
        Saves user profile to local persistent disk and syncs to Firestore.
        Preserves password_hash and metadata.
        """
        global _in_memory_users
        uid = str(profile.get("uid") or profile.get("user_id") or profile.get("id") or f"user_{int(time.time()*1000)}")
        name = profile.get("display_name") or profile.get("name") or profile.get("email", "").split("@")[0] or "Learner"
        role = profile.get("role", "student")
        now_iso = datetime.now(timezone.utc).isoformat()

        # Check existing user doc to preserve created_at and password_hash if not provided
        existing = _in_memory_users.get(uid, {})
        created_at = profile.get("created_at") or profile.get("joinedAt") or existing.get("created_at") or now_iso
        password_hash = profile.get("password_hash") or existing.get("password_hash")

        user_doc = {
            "uid": uid,
            "user_id": uid,
            "id": uid,
            "student_id": uid if role == "student" else None,
            "teacher_id": uid if role in ("teacher", "admin") else None,
            "display_name": name,
            "name": name,
            "email": (profile.get("email") or existing.get("email") or "").strip().lower(),
            "role": role,
            "total_xp": profile.get("total_xp", existing.get("total_xp", 0)),
            "games_played": profile.get("games_played", existing.get("games_played", 0)),
            "badges": profile.get("badges", existing.get("badges", [])),
            "created_at": created_at,
            "updated_at": now_iso,
            "current_learning_state": profile.get("current_learning_state", existing.get("current_learning_state", "NEW_USER")),
            "latest_pre_test_session_id": profile.get("latest_pre_test_session_id", existing.get("latest_pre_test_session_id")),
            "latest_error_feedback_id": profile.get("latest_error_feedback_id", existing.get("latest_error_feedback_id")),
            "latest_post_test_session_id": profile.get("latest_post_test_session_id", existing.get("latest_post_test_session_id")),
        }

        if password_hash:
            user_doc["password_hash"] = password_hash

        # 1. Update in-memory & save to disk
        _in_memory_users[uid] = user_doc
        _save_to_disk()

        # 2. Attempt Firestore sync (without sensitive password_hash in Firestore)
        if db:
            try:
                fs_doc = UserStorageService.sanitize_user(user_doc)
                db.collection("user_profiles").document(uid).set(fs_doc, merge=True)
            except Exception:
                # Quota or network issue - already safely saved to local disk
                pass

        return user_doc

    @staticmethod
    def get_user(user_id: str, raw: bool = False) -> dict:
        """Fetch user by ID from memory/disk, with Firestore fallback."""
        _load_from_disk()
        user_doc = _in_memory_users.get(user_id)

        if not user_doc:
            global _firestore_cooldown_until
            now = time.time()
            if db and now > _firestore_cooldown_until:
                try:
                    doc = db.collection("user_profiles").document(user_id).get()
                    if doc.exists:
                        u = doc.to_dict()
                        u["uid"] = user_id
                        u["user_id"] = user_id
                        _in_memory_users[user_id] = u
                        _save_to_disk()
                        user_doc = u
                except Exception as e:
                    if "429" in str(e) or "Quota" in str(e):
                        _firestore_cooldown_until = now + COOLDOWN_SECONDS

        if not user_doc:
            return None

        return user_doc if raw else UserStorageService.sanitize_user(user_doc)

    @staticmethod
    def get_user_by_email(email: str, raw: bool = False) -> dict:
        """Lookup user by email address (case-insensitive)."""
        if not email:
            return None
        _load_from_disk()
        norm_email = email.strip().lower()

        # Check in memory first
        for user_doc in _in_memory_users.values():
            if str(user_doc.get("email", "")).strip().lower() == norm_email:
                return user_doc if raw else UserStorageService.sanitize_user(user_doc)

        # Check Firestore if not found locally
        global _firestore_cooldown_until
        now = time.time()
        if db and now > _firestore_cooldown_until:
            try:
                docs = db.collection("user_profiles").where("email", "==", norm_email).limit(1).stream()
                for doc in docs:
                    u = doc.to_dict()
                    u["uid"] = doc.id
                    u["user_id"] = doc.id
                    _in_memory_users[doc.id] = u
                    _save_to_disk()
                    return u if raw else UserStorageService.sanitize_user(u)
            except Exception as e:
                if "429" in str(e) or "Quota" in str(e):
                    _firestore_cooldown_until = now + COOLDOWN_SECONDS

        return None

    @staticmethod
    def get_all_users() -> list:
        """
        Returns all registered users (sanitized).
        Merges local persistent storage with Firestore (with 429 quota protection).
        """
        global _firestore_cooldown_until, _in_memory_users
        _load_from_disk()
        users_dict = dict(_in_memory_users)

        now = time.time()
        if db and now > _firestore_cooldown_until:
            try:
                docs = db.collection("user_profiles").stream()
                for doc in docs:
                    u = doc.to_dict()
                    u["uid"] = doc.id
                    u["user_id"] = doc.id
                    u["id"] = doc.id
                    if doc.id in users_dict:
                        # Keep existing local password_hash if present
                        if "password_hash" in users_dict[doc.id]:
                            u["password_hash"] = users_dict[doc.id]["password_hash"]
                    users_dict[doc.id] = u
                
                # Update persistent disk
                _in_memory_users = users_dict
                _save_to_disk()
            except Exception as e:
                if "429" in str(e) or "Quota" in str(e):
                    _firestore_cooldown_until = now + COOLDOWN_SECONDS

        return [UserStorageService.sanitize_user(u) for u in users_dict.values()]

    @staticmethod
    def get_all_students() -> list:
        """Returns only users who are students (sanitized)."""
        users = UserStorageService.get_all_users()
        return [u for u in users if u.get("role") != "teacher" and u.get("role") != "admin"]
