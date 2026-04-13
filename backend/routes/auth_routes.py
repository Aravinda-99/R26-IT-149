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

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@require_json("uid", "email", "display_name")
def register_user():
    """Create user profile in Firestore after Firebase Auth registration."""
    data = request.get_json()
    uid = data["uid"]
    profile = {
        "display_name": data["display_name"],
        "email": data["email"],
        "total_xp": 0,
        "games_played": 0,
        "badges": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    if db:
        db.collection("user_profiles").document(uid).set(profile)
    else:
        print(f"[OFFLINE] Would create profile for {uid}")

    return jsonify({"message": "User registered", "user_id": uid}), 201


@auth_bp.route("/profile/<user_id>", methods=["GET"])
def get_user_profile(user_id):
    """Fetch a user profile from Firestore."""
    if not db:
        return jsonify({
            "user_id": user_id,
            "display_name": "Offline User",
            "email": "",
            "total_xp": 0,
            "games_played": 0,
            "badges": [],
        })

    doc = db.collection("user_profiles").document(user_id).get()
    if not doc.exists:
        abort(404, description="User not found")

    profile = doc.to_dict()
    profile["user_id"] = user_id
    return jsonify(profile)


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
