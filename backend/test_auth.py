"""
Test Suite: Authentication & User Registration Flow
===================================================
Verifies end-to-end user registration, database persistence, password hashing,
duplicate email prevention, server-side role enforcement, and login compatibility.
"""

import sys
import os
import json
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import app
from services.auth_service import (
    register_student,
    authenticate_user,
    find_user_by_email,
    find_user_by_id,
)

def run_auth_tests():
    print("=" * 70)
    print(" CODEQUEST USER REGISTRATION & AUTH TEST SUITE")
    print("=" * 70)

    client = app.test_client()
    test_email = f"test_student_{int(time.time())}@example.com"
    test_password = "SecurePassword123!"
    test_name = "Alex Silva"

    # Test 1: Register New Valid Student
    print("\n--> 1. Testing Valid User Registration (POST /api/auth/register)...")
    payload = {
        "name": test_name,
        "email": test_email,
        "password": test_password,
        "experience": "beginner",
        "learningGoal": "coursework",
        "learningPace": "steady",
    }
    res = client.post("/api/auth/register", json=payload)
    data = res.get_json()
    assert res.status_code == 201, f"Expected 201, got {res.status_code}: {data}"
    assert data["success"] is True, "Expected success: True"
    assert "user" in data, "Expected user DTO in response"
    assert data["user"]["email"] == test_email.lower()
    assert data["user"]["role"] == "student"
    assert "token" in data, "Expected JWT token in response"
    user_id = data["user"]["id"]
    print(f"    [PASS] User registered successfully with ID: {user_id}")

    # Test 2: Database Record Verification (Verify Hash & Fields)
    print("\n--> 2. Testing Database Record & Password Hashing...")
    db_user = find_user_by_email(test_email)
    assert db_user is not None, "User not found in database!"
    assert "password_hash" in db_user, "Password hash missing from database record!"
    assert db_user["password_hash"] != test_password, "Plaintext password stored!"
    assert db_user["password_hash"].startswith("pbkdf2:"), "Password hash does not use pbkdf2!"
    assert db_user["role"] == "student", "Role must be 'student'!"
    print(f"    [PASS] Database record confirmed. Password securely hashed with PBKDF2.")

    # Test 3: Duplicate Email Prevention
    print("\n--> 3. Testing Duplicate Email Protection...")
    dup_res = client.post("/api/auth/register", json=payload)
    dup_data = dup_res.get_json()
    assert dup_res.status_code == 409, f"Expected 409 Conflict, got {dup_res.status_code}"
    assert "already exists" in dup_data.get("error", "").lower()
    print("    [PASS] Duplicate registration rejected with HTTP 409 Conflict.")

    # Test 4: Role Escalation Protection (Attempting to register as ADMIN)
    print("\n--> 4. Testing Role Escalation Protection...")
    admin_attempt_email = f"hacker_{int(time.time())}@example.com"
    escalation_payload = {
        "name": "Malicious User",
        "email": admin_attempt_email,
        "password": "Password123!",
        "role": "admin",
    }
    esc_res = client.post("/api/auth/register", json=escalation_payload)
    esc_data = esc_res.get_json()
    assert esc_res.status_code == 201, f"Expected 201, got {esc_res.status_code}"
    assert esc_data["user"]["role"] == "student", f"Expected role 'student', got {esc_data['user']['role']}"
    esc_db_user = find_user_by_email(admin_attempt_email)
    assert esc_db_user["role"] == "student", "Server failed to enforce student role in database!"
    print("    [PASS] Role escalation prevented. User created as 'student'.")

    # Test 5: Validation Failures (Missing Name / Invalid Email / Short Password)
    print("\n--> 5. Testing Server-side Validation Rejections...")
    bad_res1 = client.post("/api/auth/register", json={"name": "", "email": "valid@example.com", "password": "pass"})
    assert bad_res1.status_code == 400
    bad_res2 = client.post("/api/auth/register", json={"name": "Test", "email": "invalid-email", "password": "pass"})
    assert bad_res2.status_code == 400
    bad_res3 = client.post("/api/auth/register", json={"name": "Test", "email": "valid@example.com", "password": "123"})
    assert bad_res3.status_code == 400
    print("    [PASS] Invalid inputs correctly rejected with HTTP 400 Bad Request.")

    # Test 6: Login with Newly Registered Credentials
    print("\n--> 6. Testing Login with Newly Registered User (POST /api/auth/login)...")
    login_res = client.post("/api/auth/login", json={"email": test_email, "password": test_password})
    login_data = login_res.get_json()
    assert login_res.status_code == 200, f"Expected 200, got {login_res.status_code}: {login_data}"
    assert login_data["success"] is True
    assert login_data["user"]["email"] == test_email.lower()
    assert login_data["user"]["role"] == "student"
    assert "token" in login_data
    print("    [PASS] Login successful with new credentials.")

    # Test 7: Login Rejection with Wrong Password
    print("\n--> 7. Testing Login with Incorrect Password...")
    wrong_res = client.post("/api/auth/login", json={"email": test_email, "password": "WrongPassword123"})
    assert wrong_res.status_code == 401, f"Expected 401, got {wrong_res.status_code}"
    print("    [PASS] Wrong password rejected with HTTP 401 Unauthorized.")

    # Test 8: Fetch User Profile (GET /api/auth/profile/<user_id>)
    print("\n--> 8. Testing Profile Retrieval (GET /api/auth/profile/<user_id>)...")
    prof_res = client.get(f"/api/auth/profile/{user_id}")
    prof_data = prof_res.get_json()
    assert prof_res.status_code == 200, f"Expected 200, got {prof_res.status_code}"
    assert prof_data["email"] == test_email.lower()
    assert prof_data["name"] == test_name
    print("    [PASS] User profile retrieved from database.")

    # Test 9: List Users (GET /api/auth/users)
    print("\n--> 9. Testing Database Users Listing (GET /api/auth/users)...")
    list_res = client.get("/api/auth/users")
    list_data = list_res.get_json()
    assert list_res.status_code == 200, f"Expected 200, got {list_res.status_code}"
    emails = [u["email"] for u in list_data.get("users", [])]
    assert test_email.lower() in emails, f"Registered user {test_email} not found in users list!"
    print(f"    [PASS] User listing verified. Total users in database: {list_data.get('total')}")

    print("\n" + "=" * 70)
    print(" ALL AUTHENTICATION & REGISTRATION TESTS PASSED (100% SUCCESS)")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    run_auth_tests()
