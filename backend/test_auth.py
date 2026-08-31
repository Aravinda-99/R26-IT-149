"""
Authentication & Role Guard Verification Test Suite
===================================================
Tests all aspects of the real authentication workflow:
1. Seeding default accounts (Student, Teacher, Admin)
2. Password hashing & validation
3. Rejection of invalid credentials
4. Real Student login & profile response
5. Real Educator login & role verification
6. Role constraint enforcement (student blocked from educator portal)
7. New student registration with duplicate detection
8. Profile retrieval (/api/auth/me, /api/auth/profile/<uid>)
9. Sanitization (zero password hash leaks)
"""

import os
import sys
import unittest

# Ensure backend root on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from services.auth_service import AuthService
from services.user_storage_service import UserStorageService
from scripts.seed_users import seed_default_users


class TestAuthWorkflow(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = create_app()
        cls.client = cls.app.test_client()
        seed_default_users()

    def test_01_seed_accounts_exist(self):
        """Verify that default student, teacher, and admin accounts are seeded."""
        student = UserStorageService.get_user_by_email("student001@codequest.lk", raw=True)
        self.assertIsNotNone(student, "Seeded student account should exist")
        self.assertEqual(student.get("role"), "student")
        self.assertTrue(student.get("password_hash"), "Password must be hashed")

        teacher = UserStorageService.get_user_by_email("teacher001@codequest.lk", raw=True)
        self.assertIsNotNone(teacher, "Seeded teacher account should exist")
        self.assertEqual(teacher.get("role"), "teacher")
        self.assertTrue(teacher.get("password_hash"), "Password must be hashed")

        admin = UserStorageService.get_user_by_email("admin001@codequest.lk", raw=True)
        self.assertIsNotNone(admin, "Seeded admin account should exist")
        self.assertEqual(admin.get("role"), "admin")

    def test_02_invalid_credentials_rejected(self):
        """Verify that invalid passwords and random emails are strictly rejected."""
        # 1. Random unregistered email
        res = self.client.post("/api/auth/login", json={
            "email": "random_fake_user@example.com",
            "password": "RandomPassword123"
        })
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("Invalid email or password", data["error"])

        # 2. Existing email with wrong password
        res2 = self.client.post("/api/auth/login", json={
            "email": "student001@codequest.lk",
            "password": "WrongPassword123"
        })
        self.assertEqual(res2.status_code, 401)
        data2 = res2.get_json()
        self.assertFalse(data2["success"])
        self.assertIn("Invalid email or password", data2["error"])

        # 3. Empty credentials
        res3 = self.client.post("/api/auth/login", json={
            "email": "",
            "password": ""
        })
        self.assertEqual(res3.status_code, 400)

    def test_03_student_login_success(self):
        """Verify student login returns sanitized user profile and token."""
        res = self.client.post("/api/auth/login", json={
            "email": "student001@codequest.lk",
            "password": "Student@12345"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("token", data)
        user = data["user"]
        self.assertEqual(user["email"], "student001@codequest.lk")
        self.assertEqual(user["role"], "student")
        self.assertEqual(user["name"], "Student 001")
        self.assertNotIn("password_hash", user, "Password hash must never leak in API responses")

    def test_04_teacher_login_success(self):
        """Verify educator login returns teacher profile."""
        res = self.client.post("/api/auth/login", json={
            "email": "teacher001@codequest.lk",
            "password": "Teacher@12345",
            "required_role": "educator"
        })
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        user = data["user"]
        self.assertEqual(user["email"], "teacher001@codequest.lk")
        self.assertEqual(user["role"], "teacher")
        self.assertNotIn("password_hash", user)

    def test_05_student_blocked_from_educator_login(self):
        """Verify student account is rejected when logging in via teacher portal."""
        res = self.client.post("/api/auth/login", json={
            "email": "student001@codequest.lk",
            "password": "Student@12345",
            "required_role": "educator"
        })
        self.assertEqual(res.status_code, 401)
        data = res.get_json()
        self.assertFalse(data["success"])
        self.assertIn("This account does not have educator access", data["error"])

    def test_06_student_registration(self):
        """Verify student registration creates student account with hashed password."""
        test_email = "test_student_reg@codequest.lk"
        res = self.client.post("/api/auth/register", json={
            "name": "Test Student",
            "email": test_email,
            "password": "SecurePassword123"
        })
        self.assertEqual(res.status_code, 201)
        data = res.get_json()
        self.assertTrue(data["success"])
        user = data["user"]
        self.assertEqual(user["email"], test_email)
        self.assertEqual(user["role"], "student")
        self.assertNotIn("password_hash", user)

        # Verify duplicate registration fails
        res_dup = self.client.post("/api/auth/register", json={
            "name": "Test Student Again",
            "email": test_email,
            "password": "SecurePassword123"
        })
        self.assertEqual(res_dup.status_code, 400)
        dup_data = res_dup.get_json()
        self.assertFalse(dup_data["success"])
        self.assertIn("already exists", dup_data["error"])

    def test_07_get_me_and_profile(self):
        """Verify /api/auth/me and /api/auth/profile/<uid> return accurate profile data."""
        student = UserStorageService.get_user_by_email("student001@codequest.lk")
        uid = student["uid"]

        # 1. Profile endpoint
        res = self.client.get(f"/api/auth/profile/{uid}")
        self.assertEqual(res.status_code, 200)
        p_data = res.get_json()
        self.assertEqual(p_data["email"], "student001@codequest.lk")
        self.assertNotIn("password_hash", p_data)

        # 2. Me endpoint via query
        res_me = self.client.get(f"/api/auth/me?uid={uid}")
        self.assertEqual(res_me.status_code, 200)
        me_data = res_me.get_json()
        self.assertTrue(me_data["success"])
        self.assertEqual(me_data["user"]["uid"], uid)


if __name__ == "__main__":
    unittest.main()
