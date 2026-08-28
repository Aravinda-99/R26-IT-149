"""
Authentication & User Management Service — CodeQuest LMS
=========================================================
Handles:
- User registration with robust server-side validation
- PBKDF2:SHA256 password hashing (Werkzeug security)
- Duplicate email prevention (checks Firestore & local store)
- Default role enforcement (public registration is always 'student')
- Database persistence (Firestore primary with persistent JSON/SQLite store)
- User login with password hash verification
- Secure JWT/token generation
- User profile retrieval
"""

import os
import re
import json
import uuid
import jwt
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from firebase.firebase_service import db

JWT_SECRET = os.getenv("JWT_SECRET", "codequest-super-secure-lms-jwt-secret-key-2026")
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 7  # 7 days

LOCAL_USERS_FILE = os.path.join(os.path.dirname(__file__), "..", "data", "users.json")

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def _ensure_local_store():
    """Ensure local users fallback store exists."""
    os.makedirs(os.path.dirname(LOCAL_USERS_FILE), exist_ok=True)
    if not os.path.exists(LOCAL_USERS_FILE):
        # Seed standard default institutional accounts if store is brand new
        initial_users = {
            "student@codequest.lk": {
                "id": "STU_DEMO_01",
                "name": "Demo Student",
                "display_name": "Demo Student",
                "email": "student@codequest.lk",
                "password_hash": generate_password_hash("student123", method="pbkdf2:sha256"),
                "role": "student",
                "total_xp": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "onboarding_completed": True,
            },
            "teacher@codequest.lk": {
                "id": "TCH_DEMO_01",
                "name": "Prof. Sarah Johnson",
                "display_name": "Prof. Sarah Johnson",
                "email": "teacher@codequest.lk",
                "password_hash": generate_password_hash("teacher123", method="pbkdf2:sha256"),
                "role": "teacher",
                "total_xp": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "onboarding_completed": True,
            },
            "admin@codequest.lk": {
                "id": "ADM_DEMO_01",
                "name": "System Administrator",
                "display_name": "System Administrator",
                "email": "admin@codequest.lk",
                "password_hash": generate_password_hash("admin123", method="pbkdf2:sha256"),
                "role": "admin",
                "total_xp": 0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "onboarding_completed": True,
            }
        }
        with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
            json.dump(initial_users, f, indent=2)


def _load_local_users():
    _ensure_local_store()
    try:
        with open(LOCAL_USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Error reading local users store: {e}")
        return {}


def _save_local_user(user_data):
    _ensure_local_store()
    users = _load_local_users()
    users[user_data["email"]] = user_data
    with open(LOCAL_USERS_FILE, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2)


def normalize_email(email):
    """Trims whitespace and lowercases email."""
    if not email:
        return ""
    return str(email).strip().lower()


def find_user_by_email(email):
    """Looks up a user record by email across Firestore and local store."""
    norm_email = normalize_email(email)
    if not norm_email:
        return None

    # 1. Check Firestore
    if db:
        try:
            users_ref = db.collection("users").where("email", "==", norm_email).limit(1).stream()
            for doc in users_ref:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            print(f"[WARN] Firestore find_user_by_email query failed: {e}")

    # 2. Check local persistent store
    local_users = _load_local_users()
    return local_users.get(norm_email)


def find_user_by_id(user_id):
    """Looks up a user record by user_id across Firestore and local store."""
    if not user_id:
        return None

    if db:
        try:
            doc = db.collection("users").document(user_id).get()
            if doc.exists:
                data = doc.to_dict()
                data["id"] = doc.id
                return data
        except Exception as e:
            print(f"[WARN] Firestore find_user_by_id query failed: {e}")

    local_users = _load_local_users()
    for u in local_users.values():
        if u.get("id") == user_id or u.get("uid") == user_id:
            return u
    return None


def generate_jwt_token(user_id, email, role):
    """Creates a signed JWT token for session authentication."""
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def register_student(name, email, password, extra_data=None):
    """
    Registers a new student account.
    Returns (success_bool, result_dict, status_code).
    """
    # 1. Server-side validation
    name = (name or "").strip()
    norm_email = normalize_email(email)
    password = str(password or "")
    extra = extra_data or {}

    if not name:
        return False, {"error": "Full Name is required."}, 400

    if not norm_email or not EMAIL_REGEX.match(norm_email):
        return False, {"error": "A valid email address is required."}, 400

    if len(password) < 6:
        return False, {"error": "Password must be at least 6 characters long."}, 400

    # 2. Duplicate account protection
    existing = find_user_by_email(norm_email)
    if existing:
        return False, {"error": "An account with this email already exists."}, 409

    # 3. Secure password hashing
    password_hash = generate_password_hash(password, method="pbkdf2:sha256")

    # 4. Construct user record with strictly enforced student role
    user_id = f"STU_{uuid.uuid4().hex[:10].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()

    user_record = {
        "id": user_id,
        "name": name,
        "display_name": name,
        "email": norm_email,
        "password_hash": password_hash,
        "role": "student",  # Server-side forced default role
        "experience": extra.get("experience", "beginner"),
        "learning_goal": extra.get("learningGoal") or extra.get("learning_goal", "coursework"),
        "learning_pace": extra.get("learningPace") or extra.get("learning_pace", "steady"),
        "total_xp": 0,
        "games_played": 0,
        "onboarding_completed": True,
        "created_at": now_iso,
        "updated_at": now_iso,
    }

    # Profile DTO for user_profiles collection
    profile_record = {
        "user_id": user_id,
        "display_name": name,
        "email": norm_email,
        "role": "student",
        "total_xp": 0,
        "games_played": 0,
        "badges": [],
        "created_at": now_iso,
    }

    # 5. Database Insert
    saved_to_firestore = False
    if db:
        try:
            # Atomic set in users and user_profiles
            batch = db.batch()
            user_doc_ref = db.collection("users").document(user_id)
            profile_doc_ref = db.collection("user_profiles").document(user_id)
            batch.set(user_doc_ref, user_record)
            batch.set(profile_doc_ref, profile_record)
            batch.commit()
            saved_to_firestore = True
            print(f"[OK] User {norm_email} registered in Firestore with ID {user_id}")
        except Exception as e:
            print(f"[WARN] Firestore user insert failed: {e}. Falling back to local store.")

    # Always mirror to local store for resilience
    _save_local_user(user_record)

    # 6. Generate Session Token & Safe Response DTO
    token = generate_jwt_token(user_id, norm_email, "student")

    safe_user = {
        "id": user_id,
        "uid": user_id,
        "name": name,
        "displayName": name,
        "email": norm_email,
        "role": "student",
        "onboardingCompleted": True,
        "createdAt": now_iso,
    }

    return True, {
        "success": True,
        "message": "User registered successfully",
        "token": token,
        "user": safe_user,
    }, 201


def authenticate_user(email, password):
    """
    Authenticates an existing user by email and password.
    Returns (success_bool, result_dict, status_code).
    """
    norm_email = normalize_email(email)
    password = str(password or "")

    if not norm_email or not password:
        return False, {"error": "Email and password are required."}, 400

    user_record = find_user_by_email(norm_email)
    if not user_record:
        return False, {"error": "Invalid email or password."}, 401

    # Verify password hash
    stored_hash = user_record.get("password_hash")
    if not stored_hash or not check_password_hash(stored_hash, password):
        return False, {"error": "Invalid email or password."}, 401

    user_id = user_record.get("id") or user_record.get("uid") or f"USR_{uuid.uuid4().hex[:8]}"
    role = user_record.get("role", "student")
    name = user_record.get("name") or user_record.get("display_name", "Student")

    token = generate_jwt_token(user_id, norm_email, role)

    safe_user = {
        "id": user_id,
        "uid": user_id,
        "name": name,
        "displayName": name,
        "email": norm_email,
        "role": role,
        "onboardingCompleted": user_record.get("onboarding_completed", True),
        "totalXp": user_record.get("total_xp", 0),
    }

    return True, {
        "success": True,
        "message": "Login successful",
        "token": token,
        "user": safe_user,
    }, 200
