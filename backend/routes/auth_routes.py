"""
Authentication Routes
=====================
Handles user registration and login via Firebase Auth.
Token verification is done server-side using Firebase Admin SDK.
"""

from flask import Blueprint, request, jsonify, abort
from firebase.firebase_service import db
from middleware.error_handler import require_json
from datetime import datetime, timezone

from services.user_storage_service import UserStorageService

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@require_json("uid", "email")
def register_user():
    """Create and persist user profile."""
    data = request.get_json()
    profile = UserStorageService.save_user(data)
    return jsonify({"message": "User registered", "user_id": profile["uid"], "profile": profile}), 201


@auth_bp.route("/profile/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Fetch a user profile."""
    profile = UserStorageService.get_user(user_id)
    return jsonify(profile)


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
    })


@auth_bp.route("/verify-token", methods=["POST"])
@require_json("id_token")
def verify_token():
    """Verify a Firebase ID token server-side."""
    import firebase_admin.auth as firebase_auth

    data = request.get_json()
    try:
        decoded = firebase_auth.verify_id_token(data["id_token"])
        return jsonify({"valid": True, "uid": decoded["uid"], "email": decoded.get("email", "")})
    except Exception as e:
        return jsonify({"valid": False, "error": str(e)}), 401
