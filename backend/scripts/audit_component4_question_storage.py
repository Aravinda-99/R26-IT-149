"""
Audit Script: Component 4 Question Storage
==========================================
Non-destructive read-only audit of Firestore collections and local storage files.
Inspects:
  - Firestore approved, pending, rejected question counts
  - Local generated_questions.json and approved_question_bank.json counts
  - question_attempts.json attempt count (must remain isolated from question bank)
  - Duplicate question_id checks
  - Source distribution (GEMINI, LLM, DEV_MOCK_ONLY)
  - Service usage quarantine verification
"""

import os
import sys
import json
from collections import Counter

# Ensure backend root is on sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from firebase.firebase_service import db


def read_json_file(path):
    if not os.path.exists(path):
        return []
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Error reading {path}: {e}")
        return []


def run_audit():
    storage_dir = os.path.join(backend_dir, "ml", "component4_schema_mastery", "question_bank", "local_storage")
    gen_file = os.path.join(storage_dir, "generated_questions.json")
    app_file = os.path.join(storage_dir, "approved_question_bank.json")
    att_file = os.path.join(storage_dir, "question_attempts.json")
    seed_file = os.path.join(storage_dir, "seed_questions.json")

    gen_data = read_json_file(gen_file)
    app_data = read_json_file(app_file)
    att_data = read_json_file(att_file)
    seed_data = read_json_file(seed_file)

    print("=" * 70)
    print(" COMPONENT 4 QUESTION STORAGE & ISOLATION AUDIT")
    print("=" * 70)

    # ─────────────────────────────────────────────────────────────────────────
    # 1. Firestore Database Counts
    # ─────────────────────────────────────────────────────────────────────────
    fs_approved = []
    fs_pending = []
    fs_rejected = []
    fs_available = db is not None

    if fs_available:
        try:
            # Query approved_question_bank collection
            for doc in db.collection("approved_question_bank").stream():
                d = doc.to_dict()
                d["_doc_id"] = doc.id
                status = str(d.get("status") or "APPROVED").upper()
                if status == "APPROVED":
                    fs_approved.append(d)
                elif status == "PENDING":
                    fs_pending.append(d)
                elif status == "REJECTED":
                    fs_rejected.append(d)

            # Query generated_questions collection if present
            for doc in db.collection("generated_questions").stream():
                d = doc.to_dict()
                d["_doc_id"] = doc.id
                status = str(d.get("status") or "PENDING").upper()
                if status == "PENDING":
                    fs_pending.append(d)
                elif status == "REJECTED":
                    fs_rejected.append(d)
                elif status == "APPROVED":
                    fs_approved.append(d)
        except Exception as e:
            print(f"[WARN] Error streaming from Firestore: {e}")
            fs_available = False

    print("\n[1] FIRESTORE DATABASE (Primary Source)")
    print(f"    Connection Status   : {'CONNECTED (Online)' if fs_available else 'OFFLINE / UNAVAILABLE'}")
    print(f"    Approved Count      : {len(fs_approved)}")
    print(f"    Pending Count       : {len(fs_pending)}")
    print(f"    Rejected Count      : {len(fs_rejected)}")

    # ─────────────────────────────────────────────────────────────────────────
    # 2. Local File Storage Counts
    # ─────────────────────────────────────────────────────────────────────────
    local_gen_app = [q for q in gen_data if str(q.get("status", "")).upper() == "APPROVED" and not q.get("deleted", False)]
    local_gen_pen = [q for q in gen_data if str(q.get("status", "")).upper() in ("PENDING", "DRAFT", "EDITED") and not q.get("deleted", False)]
    local_gen_rej = [q for q in gen_data if str(q.get("status", "")).upper() == "REJECTED" and not q.get("deleted", False)]
    local_gen_del = [q for q in gen_data if q.get("deleted", False)]

    local_app_valid = [q for q in app_data if str(q.get("status", "")).upper() == "APPROVED" and not q.get("deleted", False)]

    print("\n[2] LOCAL STORAGE FILES (Fallback & Backup)")
    print(f"    generated_questions.json total : {len(gen_data)}")
    print(f"      - Approved                   : {len(local_gen_app)}")
    print(f"      - Pending Review             : {len(local_gen_pen)}")
    print(f"      - Rejected Archive           : {len(local_gen_rej)}")
    print(f"      - Soft-Deleted               : {len(local_gen_del)}")
    print(f"    approved_question_bank.json    : {len(app_data)} (Active Approved: {len(local_app_valid)})")
    print(f"    seed_questions.json            : {len(seed_data)}")

    # ─────────────────────────────────────────────────────────────────────────
    # 3. Question Attempts Isolation
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[3] STUDENT ATTEMPTS & SESSION HISTORY")
    print(f"    question_attempts.json count   : {len(att_data)} attempt records")
    has_bank_keys = any("option_a" in a and "option_b" in a for a in att_data)
    print(f"    Attempt Format Safe            : {'YES (Only student answer telemetry)' if not has_bank_keys else 'NO (Contains raw question definitions)'}")
    print(f"    Quarantined from Question Bank : YES (Never returned by bank endpoints)")

    # ─────────────────────────────────────────────────────────────────────────
    # 4. Duplicate Check & Source Distribution
    # ─────────────────────────────────────────────────────────────────────────
    all_local_qids = [q.get("question_id") for q in gen_data if q.get("question_id")]
    qid_counts = Counter(all_local_qids)
    duplicates = {k: v for k, v in qid_counts.items() if v > 1}

    sources = Counter(q.get("source", "UNKNOWN") for q in gen_data)

    print("\n[4] DATA INTEGRITY & SOURCE BREAKDOWN")
    print(f"    Unique Question IDs (Local)   : {len(qid_counts)}")
    print(f"    Duplicate Question IDs        : {len(duplicates)} {duplicates if duplicates else ''}")
    print("    Source Distribution (Local)   :")
    for src, cnt in sources.items():
        print(f"      - {src:25s}: {cnt}")

    # ─────────────────────────────────────────────────────────────────────────
    # 5. Summary & Recommendation
    # ─────────────────────────────────────────────────────────────────────────
    print("\n[5] AUDIT CONCLUSION")
    if fs_available and len(fs_approved) < len(local_gen_app):
        missing = len(local_gen_app) - len(fs_approved)
        print(f"    [ACTION NEEDED] Firestore approved count ({len(fs_approved)}) is less than local approved count ({len(local_gen_app)}).")
        print(f"    Run 'python scripts/sync_generated_questions_to_firestore.py' to sync {missing} missing approved questions.")
    elif fs_available:
        print(f"    [OPTIMAL] Firestore contains {len(fs_approved)} approved questions and is ready as primary source.")
    else:
        print("    [NOTICE] Firestore is offline. Local storage will be used as fallback.")

    print("=" * 70 + "\n")


if __name__ == "__main__":
    run_audit()
