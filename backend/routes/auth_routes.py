"""
Authentication Routes
=====================
Handles user login, student registration, profile fetching, and token verification.
"""

from flask import Blueprint, request, jsonify
from services.auth_service import AuthService
from services.user_storage_service import UserStorageService

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticates a user with email and password.
    Returns sanitized user profile and auth token.
    """
    data = request.get_json(silent=True) or {}
    email = data.get("email")
    password = data.get("password")
    required_role = data.get("required_role")

    if not email or not password:
        return jsonify({
            "success": False,
            "error": "Please enter both email and password."
        }), 400

    user_profile, err = AuthService.authenticate_user(email, password, required_role=required_role)
    if err or not user_profile:
        return jsonify({
            "success": False,
            "error": err or "Invalid email or password."
        }), 401

    return jsonify({
        "success": True,
        "message": "Login successful",
        "user": user_profile,
        "token": f"cq_token_{user_profile['uid']}"
    }), 200


@auth_bp.route("/register", methods=["POST"])
def register():
    """
    Public student registration endpoint.
    Strictly creates student accounts with hashed passwords.
    """
    data = request.get_json(silent=True) or {}
    name = data.get("name") or data.get("display_name")
    email = data.get("email")
    password = data.get("password")

    # If password is provided, use secure student registration
    if password:
        profile, err = AuthService.register_student(name, email, password)
        if err or not profile:
            return jsonify({
                "success": False,
                "error": err or "Registration failed."
            }), 400

        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "user": profile,
            "token": f"cq_token_{profile['uid']}"
        }), 201

    # Legacy profile sync from Firebase client registration
    if not data.get("uid") or not email:
        return jsonify({"success": False, "error": "Missing uid or email"}), 400

    profile = UserStorageService.save_user(data)
    sanitized = UserStorageService.sanitize_user(profile)
    return jsonify({
        "success": True,
        "message": "User registered",
        "user_id": sanitized["uid"],
        "user": sanitized,
        "profile": sanitized
    }), 201


@auth_bp.route("/me", methods=["GET"])
def get_current_session_user():
    """
    Returns current authenticated user profile based on query parameter or header.
    """
    user_id = request.args.get("uid") or request.args.get("user_id")
    auth_header = request.headers.get("Authorization", "")
    if not user_id and auth_header.startswith("Bearer cq_token_"):
        user_id = auth_header.replace("Bearer cq_token_", "").strip()

    if not user_id:
        return jsonify({"success": False, "error": "No active session"}), 401

    profile = AuthService.get_user_profile(user_id)
    if not profile:
        return jsonify({"success": False, "error": "User profile not found"}), 404

    return jsonify({
        "success": True,
        "user": profile
    }), 200


@auth_bp.route("/profile/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Fetch a user profile by ID."""
    profile = AuthService.get_user_profile(user_id)
    if not profile:
        return jsonify({"error": "User not found"}), 404
    return jsonify(profile), 200


@auth_bp.route("/users", methods=["GET"])
@auth_bp.route("/students", methods=["GET"])
def get_all_registered_users():
    """Fetch all real registered students/users."""
    all_users = UserStorageService.get_all_users()
    students = UserStorageService.get_all_students()
    
    return jsonify({
        "success": True,
        "count": len(students),
        "users": all_users,
        "students": students,
    }), 200


@auth_bp.route("/verify-token", methods=["POST"])
def verify_token():
    """Verify a Firebase ID token server-side."""
    data = request.get_json(silent=True) or {}
    id_token = data.get("id_token")
    if not id_token:
        return jsonify({"valid": False, "error": "Missing id_token"}), 400

    try:
        import firebase_admin.auth as firebase_auth
        decoded = firebase_auth.verify_id_token(id_token)
        return jsonify({"valid": True, "uid": decoded["uid"], "email": decoded.get("email", "")}), 200
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 401
