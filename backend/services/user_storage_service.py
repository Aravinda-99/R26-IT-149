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
    def save_user(profile: dict) -> dict:
        """
        Saves user profile to local persistent disk and syncs to Firestore.
        """
        global _in_memory_users
        uid = str(profile.get("uid") or profile.get("user_id") or profile.get("id") or f"user_{int(time.time()*1000)}")
        name = profile.get("display_name") or profile.get("name") or profile.get("email", "").split("@")[0] or "Learner"
        role = profile.get("role", "student")

        user_doc = {
            "uid": uid,
            "user_id": uid,
            "id": uid,
            "display_name": name,
            "name": name,
            "email": profile.get("email", ""),
            "role": role,
            "total_xp": profile.get("total_xp", 0),
            "games_played": profile.get("games_played", 0),
            "badges": profile.get("badges", []),
            "created_at": profile.get("created_at") or profile.get("joinedAt") or datetime.now(timezone.utc).isoformat(),
        }

        # 1. Update in-memory & save to disk
        _in_memory_users[uid] = user_doc
        _save_to_disk()

        # 2. Attempt Firestore sync
        if db:
            try:
                db.collection("user_profiles").document(uid).set(user_doc, merge=True)
            except Exception as e:
                # Quota or network issue - already safely saved to local disk
                pass

        return user_doc

    @staticmethod
    def get_user(user_id: str) -> dict:
        """Fetch user by ID from memory/disk, with Firestore fallback."""
        _load_from_disk()
        if user_id in _in_memory_users:
            return _in_memory_users[user_id]

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
                    return u
            except Exception as e:
                if "429" in str(e) or "Quota" in str(e):
                    _firestore_cooldown_until = now + COOLDOWN_SECONDS

        return {
            "user_id": user_id,
            "uid": user_id,
            "display_name": user_id,
            "email": "",
            "role": "student",
            "total_xp": 0,
            "games_played": 0,
            "badges": [],
        }

    @staticmethod
    def get_all_users() -> list:
        """
        Returns all registered users.
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
                    users_dict[doc.id] = u
                
                # Update persistent disk with any new records from Firestore
                _in_memory_users = users_dict
                _save_to_disk()
            except Exception as e:
                if "429" in str(e) or "Quota" in str(e):
                    _firestore_cooldown_until = now + COOLDOWN_SECONDS
                    # Silently fallback to persistent local storage

        return list(users_dict.values())

    @staticmethod
    def get_all_students() -> list:
        """Returns only users who are students."""
        users = UserStorageService.get_all_users()
        return [u for u in users if u.get("role") != "teacher" and u.get("role") != "admin"]
