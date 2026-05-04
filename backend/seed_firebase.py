"""
Seed Firebase Firestore
=======================
Uploads mock student behaviour data and MCQ questions to Firestore for testing.

Creates the following Firestore collections:
  - student_behaviour   -> 3 mock student documents
  - mcq_questions        -> 15 MCQ questions (3 per concept x 5 concepts)
  - schema_mastery       -> (empty, populated by mastery_calculator later)
  - diagnostic_results   -> (empty, populated after post-tests)

Usage:
  cd backend
  venv\\Scripts\\activate
  python seed_firebase.py

Flags:
  --clear   Clear existing data before seeding
  --verify  Read back and print seeded data to verify
"""

import sys
import os
import io

# Fix Windows console encoding for Unicode characters
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Ensure we can import from the backend directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from dotenv import load_dotenv
load_dotenv()

import firebase_admin
from firebase_admin import credentials, firestore
from data.mock_students import mock_students
from data.mcq_questions import mcq_questions
from datetime import datetime, timezone


# --- Firebase Init -----------------------------------------------------------
def get_firestore_client():
    """Initialize Firebase Admin SDK and return a Firestore client."""
    cred_path = os.getenv(
        "FIREBASE_CREDENTIALS_PATH",
        os.path.join(os.path.dirname(__file__), "firebase", "serviceAccountKey.json")
    )

    if not os.path.exists(cred_path):
        print(f"[ERROR] Firebase credentials not found at: {cred_path}")
        print()
        print("  To fix this:")
        print("  1. Go to Firebase Console > Project Settings > Service Accounts")
        print("  2. Click 'Generate New Private Key'")
        print("  3. Save the file as: backend/firebase/serviceAccountKey.json")
        print()
        sys.exit(1)

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    return firestore.client()


# --- Clear Collections -------------------------------------------------------
def clear_collection(db, collection_name):
    """Delete all documents in a Firestore collection."""
    docs = db.collection(collection_name).stream()
    count = 0
    for doc in docs:
        doc.reference.delete()
        count += 1
    return count


# --- Seed Student Behaviour Data ---------------------------------------------
def seed_student_behaviour(db):
    """Upload mock student behaviour data to Firestore."""
    collection = db.collection("student_behaviour")
    now = datetime.now(timezone.utc).isoformat()

    for student in mock_students:
        doc_id = student["studentId"]
        doc_data = {
            "studentId": student["studentId"],
            "studentName": student["studentName"],
            "concepts": student["concepts"],
            "seeded_at": now,
        }
        collection.document(doc_id).set(doc_data)
        print(f"  [OK] {doc_id} - {student['studentName']}")

    return len(mock_students)


# --- Seed MCQ Questions ------------------------------------------------------
def seed_mcq_questions(db):
    """Upload MCQ diagnostic questions to Firestore."""
    collection = db.collection("mcq_questions")
    count = 0

    for concept, questions in mcq_questions.items():
        for question in questions:
            doc_id = question["id"]
            doc_data = {
                "id": question["id"],
                "concept": question["concept"],
                "type": question["type"],
                "question": question["question"],
                "code": question.get("code"),
                "options": question["options"],
                "answer": question["answer"],
                "explanation": question["explanation"],
            }
            collection.document(doc_id).set(doc_data)
            count += 1

    print(f"  [OK] {count} MCQ questions across {len(mcq_questions)} concepts")
    return count


# --- Verify Seeded Data ------------------------------------------------------
def verify_data(db):
    """Read back and print seeded data to verify upload."""
    print()
    print("=" * 60)
    print("VERIFICATION - Reading data back from Firestore")
    print("=" * 60)

    # Verify student_behaviour
    print()
    print(">> student_behaviour collection:")
    docs = db.collection("student_behaviour").stream()
    for doc in docs:
        data = doc.to_dict()
        concepts = list(data.get("concepts", {}).keys())
        print(f"   {doc.id}: {data.get('studentName', '?')} - concepts: {concepts}")

    # Verify mcq_questions
    print()
    print(">> mcq_questions collection:")
    docs = db.collection("mcq_questions").stream()
    by_concept = {}
    for doc in docs:
        data = doc.to_dict()
        concept = data.get("concept", "unknown")
        by_concept.setdefault(concept, []).append(data.get("type", "?"))
    for concept, types in sorted(by_concept.items()):
        print(f"   {concept}: {types}")

    # Check schema_mastery
    print()
    print(">> schema_mastery collection:")
    docs = list(db.collection("schema_mastery").stream())
    print(f"   {len(docs)} documents (populated after mastery calculation)")

    # Check diagnostic_results
    print()
    print(">> diagnostic_results collection:")
    docs = list(db.collection("diagnostic_results").stream())
    print(f"   {len(docs)} documents (populated after post-tests)")


# --- Main --------------------------------------------------------------------
def main():
    args = sys.argv[1:]
    do_clear = "--clear" in args
    do_verify = "--verify" in args

    print()
    print("=" * 60)
    print("  Schema Mastery Tracker - Firebase Data Seeder")
    print("  Project: R26-IT-149 | Component 4")
    print("=" * 60)
    print()

    # Connect to Firestore
    print("[1/4] Connecting to Firebase...")
    db = get_firestore_client()
    print("  [OK] Connected to Firestore")
    print()

    # Clear existing data (optional)
    if do_clear:
        print("[2/4] Clearing existing data...")
        for coll in ["student_behaviour", "mcq_questions", "schema_mastery", "diagnostic_results"]:
            deleted = clear_collection(db, coll)
            print(f"  [OK] {coll}: {deleted} documents deleted")
        print()
    else:
        print("[2/4] Skipping clear (use --clear flag to clear first)")
        print()

    # Seed student behaviour data
    print("[3/4] Seeding student behaviour data...")
    student_count = seed_student_behaviour(db)
    print(f"  -> {student_count} students uploaded")
    print()

    # Seed MCQ questions
    print("[4/4] Seeding MCQ diagnostic questions...")
    mcq_count = seed_mcq_questions(db)
    print(f"  -> {mcq_count} questions uploaded")
    print()

    # Summary
    print("-" * 60)
    print(f"  DONE! Seeding complete.")
    print(f"  Students:  {student_count}")
    print(f"  Questions: {mcq_count}")
    print("-" * 60)

    # Verify (optional)
    if do_verify:
        verify_data(db)

    print()


if __name__ == "__main__":
    main()
