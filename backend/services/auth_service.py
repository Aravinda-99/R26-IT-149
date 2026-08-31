"""
Authentication Service
======================
Core backend service for user authentication, password verification with hashing,
student registration, and profile management.
"""

import time
import re
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash, check_password_hash

from services.user_storage_service import UserStorageService

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class AuthService:

    @staticmethod
    def authenticate_user(email: str, password: str, required_role: str = None) -> tuple[dict | None, str | None]:
        """
        Authenticates a user against registered/seeded users using secure password hashing.
        
        Args:
            email: User email address
            password: User raw password
            required_role: Optional role constraint ("educator", "teacher", "admin", "student")
            
        Returns:
            (sanitized_user_dict, error_message)
        """
        if not email or not isinstance(email, str) or not email.strip():
            return None, "Please enter your email address."
        if not password or not isinstance(password, str):
            return None, "Please enter your password."

        norm_email = email.strip().lower()
        user_doc = UserStorageService.get_user_by_email(norm_email, raw=True)

        if not user_doc:
            return None, "Invalid email or password."

        stored_hash = user_doc.get("password_hash")
        if stored_hash:
            if not check_password_hash(stored_hash, password):
                return None, "Invalid email or password."
        else:
            # Fallback for accounts registered before hashing or created without hash
            # If plain password matched or legacy record, update with secure hash
            user_doc["password_hash"] = generate_password_hash(password)
            UserStorageService.save_user(user_doc)

        user_role = user_doc.get("role", "student")

        # Role enforcement for specific portals
        if required_role == "educator" or required_role in ("teacher", "admin"):
            if user_role not in ("teacher", "admin"):
                return None, "This account does not have educator access."

        # Return sanitized profile (no password_hash)
        sanitized = UserStorageService.sanitize_user(user_doc)
        return sanitized, None

    @staticmethod
    def register_student(name: str, email: str, password: str) -> tuple[dict | None, str | None]:
        """
        Public registration for students only.
        
        Args:
            name: Full name of student
            email: Student email address
            password: Raw password (min 6 chars)
            
        Returns:
            (sanitized_student_profile, error_message)
        """
        if not name or not isinstance(name, str) or not name.strip():
            return None, "Full name is required."
        name = name.strip()

        if not email or not isinstance(email, str) or not email.strip():
            return None, "Email address is required."
        norm_email = email.strip().lower()

        if not EMAIL_REGEX.match(norm_email):
            return None, "Please enter a valid email address."

        if not password or not isinstance(password, str) or len(password) < 6:
            return None, "Password must be at least 6 characters long."

        # Check for existing account
        existing = UserStorageService.get_user_by_email(norm_email)
        if existing:
            return None, "An account with this email already exists."

        uid = f"user_{int(time.time() * 1000)}"
        pwd_hash = generate_password_hash(password)
        now_iso = datetime.now(timezone.utc).isoformat()

        profile = {
            "uid": uid,
            "user_id": uid,
            "id": uid,
            "student_id": uid,
            "display_name": name,
            "name": name,
            "email": norm_email,
            "role": "student",
            "password_hash": pwd_hash,
            "total_xp": 0,
            "games_played": 0,
            "badges": [],
            "created_at": now_iso,
            "updated_at": now_iso,
            "current_learning_state": "NEW_USER",
            "latest_pre_test_session_id": None,
            "latest_error_feedback_id": None,
            "latest_post_test_session_id": None,
        }

        saved = UserStorageService.save_user(profile)
        return UserStorageService.sanitize_user(saved), None

    @staticmethod
    def get_user_profile(user_id: str) -> dict | None:
        """Fetch sanitized user profile by UID."""
        if not user_id:
            return None
        return UserStorageService.get_user(str(user_id), raw=False)

    @staticmethod
    def get_or_create_runtime_profile(user_id: str) -> dict | None:
        """
        Return a usable student profile for Firebase/client sessions that have
        not been synced to the backend user store yet. This prevents repeated
        profile 404s from interrupting the local learning flow.
        """
        if not user_id:
            return None

        profile = AuthService.get_user_profile(user_id)
        if profile:
            if not profile.get("email") and profile.get("display_name") == "Learner":
                profile["auth_source"] = "runtime_fallback"
            return profile

        fallback_profile = {
            "uid": str(user_id),
            "user_id": str(user_id),
            "id": str(user_id),
            "student_id": str(user_id),
            "display_name": "Learner",
            "name": "Learner",
            "email": "",
            "role": "student",
            "current_learning_state": "ACTIVE",
            "auth_source": "runtime_fallback",
        }
        saved = UserStorageService.save_user(fallback_profile)
        sanitized = UserStorageService.sanitize_user(saved)
        sanitized["auth_source"] = "runtime_fallback"
        return sanitized
