"""
Seed Users Script
=================
Seeds default testing users (Student, Teacher, Admin) into persistent storage.
Reads email and passwords from environment variables if present, or uses standard secure defaults.
Passwords are automatically hashed and never stored in plain text.
"""

import os
import sys
from datetime import datetime, timezone
from werkzeug.security import generate_password_hash

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.user_storage_service import UserStorageService


def seed_default_users():
    """Seeds verified student, teacher, and admin accounts into persistent storage."""
    student_email = os.getenv("SEED_STUDENT_EMAIL", "student001@codequest.lk").strip().lower()
    student_password = os.getenv("SEED_STUDENT_PASSWORD", "Student@12345")

    teacher_email = os.getenv("SEED_TEACHER_EMAIL", "teacher001@codequest.lk").strip().lower()
    teacher_password = os.getenv("SEED_TEACHER_PASSWORD", "Teacher@12345")

    admin_email = os.getenv("SEED_ADMIN_EMAIL", "admin001@codequest.lk").strip().lower()
    admin_password = os.getenv("SEED_ADMIN_PASSWORD", "Admin@12345")

    users_to_seed = [
        {
            "uid": "student_001",
            "user_id": "student_001",
            "id": "student_001",
            "student_id": "student_001",
            "name": "Student 001",
            "display_name": "Student 001",
            "email": student_email,
            "role": "student",
            "password_hash": generate_password_hash(student_password),
            "total_xp": 150,
            "games_played": 2,
            "badges": ["First Lesson", "Quiz Ace"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "current_learning_state": "PRACTICING",
        },
        {
            "uid": "teacher_001",
            "user_id": "teacher_001",
            "id": "teacher_001",
            "teacher_id": "teacher_001",
            "name": "Educator 001",
            "display_name": "Educator 001",
            "email": teacher_email,
            "role": "teacher",
            "password_hash": generate_password_hash(teacher_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        },
        {
            "uid": "admin_001",
            "user_id": "admin_001",
            "id": "admin_001",
            "teacher_id": "admin_001",
            "name": "System Admin",
            "display_name": "System Admin",
            "email": admin_email,
            "role": "admin",
            "password_hash": generate_password_hash(admin_password),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    ]

    seeded_count = 0
    for u in users_to_seed:
        existing = UserStorageService.get_user_by_email(u["email"], raw=True)
        if not existing:
            UserStorageService.save_user(u)
            seeded_count += 1
            print(f"[SEED] Created verified {u['role']} account: {u['email']}")
        else:
            # Ensure password hash is updated and valid
            existing["password_hash"] = u["password_hash"]
            existing["role"] = u["role"]
            existing["name"] = existing.get("name") or u["name"]
            existing["display_name"] = existing.get("display_name") or u["display_name"]
            UserStorageService.save_user(existing)
            seeded_count += 1
            print(f"[SEED] Updated {u['role']} account: {u['email']}")

    print(f"[SEED] Seeded/Verified {seeded_count} default users in storage.")
    return seeded_count


if __name__ == "__main__":
    seed_default_users()
