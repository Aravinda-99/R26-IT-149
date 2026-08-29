"""
Authentication Routes — CodeQuest LMS
======================================
Provides database-backed user registration, login, token verification,
and profile management.
"""

from flask import Blueprint, request, jsonify, abort
from services.auth_service import (
    register_student,
    authenticate_user,
    find_user_by_id,
    _load_local_users,
)
from firebase.firebase_service import db

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register_user():
    """
    Register a new user in the database.
    Payload: { name, email, password, confirm_password, experience, learningGoal, learningPace }
    """
    data = request.get_json() or {}

    # Support both 'name' and 'display_name'
    name = data.get("name") or data.get("display_name")
    email = data.get("email")
    password = data.get("password")

    # If Firebase Auth already created the user and passed uid:
    if not password and data.get("uid"):
        # Legacy profile sync
        uid = data["uid"]
        profile = {
            "id": uid,
            "display_name": name or "Student",
            "name": name or "Student",
            "email": (email or "").strip().lower(),
            "role": "student",
            "total_xp": 0,
            "games_played": 0,
            "badges": [],
            "onboarding_completed": True,
            "created_at": data.get("created_at") or "",
        }
        if db:
            try:
                db.collection("users").document(uid).set(profile, merge=True)
                db.collection("user_profiles").document(uid).set(profile, merge=True)
            except Exception as e:
                print(f"[WARN] Firestore sync warning: {e}")
        return jsonify({"success": True, "message": "Profile synced", "user_id": uid}), 201

    # Standard database registration with password hashing
    success, result, status_code = register_student(
        name=name,
        email=email,
        password=password,
        extra_data=data,
    )

    return jsonify(result), status_code


@auth_bp.route("/login", methods=["POST"])
def login_user():
    """
    Authenticate a user with email and password against the database.
    Payload: { email, password }
    """
    data = request.get_json() or {}
    email = data.get("email")
    password = data.get("password")

    success, result, status_code = authenticate_user(email, password)
    return jsonify(result), status_code


@auth_bp.route("/profile/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Fetch a user profile from the database."""
    user = find_user_by_id(user_id)
    if not user:
        # Check user_profiles collection directly
        if db:
            try:
                doc = db.collection("user_profiles").document(user_id).get()
                if doc.exists:
                    p = doc.to_dict()
                    p["user_id"] = user_id
                    return jsonify(p)
            except Exception:
                pass
        abort(404, description="User not found")

    # Return safe user profile
    safe_profile = {
        "user_id": user.get("id") or user_id,
        "name": user.get("name") or user.get("display_name", "Student"),
        "display_name": user.get("display_name") or user.get("name", "Student"),
        "email": user.get("email", ""),
        "role": user.get("role", "student"),
        "total_xp": user.get("total_xp", 0),
        "games_played": user.get("games_played", 0),
        "badges": user.get("badges", []),
        "created_at": user.get("created_at", ""),
    }
    return jsonify(safe_profile)


@auth_bp.route("/verify-token", methods=["POST"])
def verify_token():
    """Verify a JWT or Firebase ID token server-side."""
    data = request.get_json() or {}
    token = data.get("token") or data.get("id_token")

    if not token:
        return jsonify({"valid": False, "error": "Token missing"}), 400

    # 1. Check if it's our own JWT token
    import jwt
    from services.auth_service import JWT_SECRET, JWT_ALGORITHM

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return jsonify({
            "valid": True,
            "uid": decoded["sub"],
            "email": decoded.get("email", ""),
            "role": decoded.get("role", "student"),
        })
    except Exception:
        pass

    # 2. Check if it's a Firebase ID token
    try:
        import firebase_admin.auth as firebase_auth
        decoded = firebase_auth.verify_id_token(token)
        return jsonify({
            "valid": True,
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
        })
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 401


@auth_bp.route("/users", methods=["GET"])
def list_users():
    """List all registered users from database (for admin / monitoring)."""
    users_list = []

    if db:
        try:
            docs = db.collection("users").stream()
            for d in docs:
                data = d.to_dict()
                users_list.append({
                    "id": d.id,
                    "name": data.get("name") or data.get("display_name", "Student"),
                    "email": data.get("email", ""),
                    "role": data.get("role", "student"),
                    "total_xp": data.get("total_xp", 0),
                    "created_at": data.get("created_at", ""),
                })
        except Exception as e:
            print(f"[WARN] Error streaming Firestore users: {e}")

    if not users_list:
        local_users = _load_local_users()
        for u in local_users.values():
            users_list.append({
                "id": u.get("id") or u.get("uid"),
                "name": u.get("name") or u.get("display_name", "Student"),
                "email": u.get("email", ""),
                "role": u.get("role", "student"),
                "total_xp": u.get("total_xp", 0),
                "created_at": u.get("created_at", ""),
            })

    return jsonify({"success": True, "users": users_list, "total": len(users_list)})
