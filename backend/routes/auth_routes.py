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


from werkzeug.security import generate_password_hash
import uuid

@auth_bp.route("/register", methods=["POST"])
@require_json("email", "display_name", "password")
def register_user():
    """Create user profile in Firestore directly in 'users' collection."""
    if not db:
        return jsonify({"error": "Database not available"}), 503
        
    data = request.get_json()
    email = data["email"]
    display_name = data["display_name"]
    password = data["password"]
    
    # Check if user exists
    users_ref = db.collection("users")
    existing_users = list(users_ref.where("email", "==", email).stream())
    if existing_users:
        return jsonify({"error": "User with this email already exists"}), 400
        
    # Create custom user ID like STU_XXXXXXXXXX
    uid = f"STU_{uuid.uuid4().hex[:10].upper()}"
    
    profile = {
        "id": uid,
        "name": display_name,
        "display_name": display_name,
        "email": email,
        "password_hash": generate_password_hash(password),
        "role": "student",
        "experience": "beginner",
        "learning_goal": "coursework",
        "learning_pace": "steady",
        "games_played": 0,
        "onboarding_completed": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    # Save to 'users' collection for auth/login
    db.collection("users").document(uid).set(profile)

    # Save to 'user_profiles' collection for app usage
    user_profile = {
        "user_id": uid,
        "display_name": display_name,
        "email": email,
        "total_xp": 0,
        "games_played": 0,
        "badges": [],
        "role": "student",
        "created_at": profile["created_at"]
    }
    db.collection("user_profiles").document(uid).set(user_profile)

    # Return profile without password
    user_data = profile.copy()
    user_data.pop("password_hash", None)
    
    return jsonify({
        "message": "User registered successfully", 
        "user": user_data
    }), 201


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
        # Fallback for accounts created during testing before dual-write
        user_doc = db.collection("users").document(user_id).get()
        if not user_doc.exists:
            abort(404, description="User not found")
        profile = user_doc.to_dict()
    else:
        profile = doc.to_dict()
        
    profile["user_id"] = user_id
    
    # Ensure all required fields exist for the UI
    profile.setdefault("total_xp", 0)
    profile.setdefault("games_played", 0)
    profile.setdefault("badges", [])
    
    return jsonify(profile)

from werkzeug.security import check_password_hash

@auth_bp.route("/login", methods=["POST"])
@require_json("email", "password")
def custom_login():
    """Custom login against the 'users' collection."""
    if not db:
        return jsonify({"error": "Database not available"}), 503
        
    data = request.get_json()
    email = data["email"]
    password = data["password"]
    
    users_ref = db.collection("users")
    query = users_ref.where("email", "==", email).stream()
    
    user_doc = None
    for doc in query:
        user_doc = doc
        break
        
    if not user_doc:
        return jsonify({"error": "Invalid login credentials"}), 401
        
    user_data = user_doc.to_dict()
    # verify password hash
    pw_hash = user_data.get("password_hash")
    if not pw_hash or not check_password_hash(pw_hash, password):
        return jsonify({"error": "Invalid login credentials"}), 401
        
    # Remove password hash before sending to frontend
    user_data.pop("password_hash", None)
    
    return jsonify({
        "message": "Login successful",
        "user": user_data
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
