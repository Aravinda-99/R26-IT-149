"""
Safe Sync Script: Local Approved Questions -> Firestore DB
==========================================================
Synchronizes valid teacher-approved questions from local storage into Firestore collection
`approved_question_bank` without creating duplicate records or overwriting existing records
(unless --force is passed).

Usage:
  python scripts/sync_generated_questions_to_firestore.py [--force] [--dry-run] [--allow-mock]
"""

import os
import sys
import json
import argparse
from datetime import datetime

# Add backend directory to sys.path
backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from firebase.firebase_service import db
from services.schema_question_bank_service import SchemaQuestionBankService


def read_json_file(filepath):
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"[WARN] Error reading {filepath}: {e}")
        return []


def sync_questions(force=False, dry_run=False, allow_mock=False):
    print("=" * 70)
    print(" SYNC LOCAL APPROVED QUESTIONS TO FIRESTORE DB")
    print("=" * 70)

    if not db:
        print("[ERROR] Firebase DB client is not initialized. Please ensure serviceAccountKey.json is present.")
        sys.exit(1)

    storage_dir = os.path.join(backend_dir, "ml", "component4_schema_mastery", "question_bank", "local_storage")
    gen_file = os.path.join(storage_dir, "generated_questions.json")
    app_file = os.path.join(storage_dir, "approved_question_bank.json")

    gen_data = read_json_file(gen_file)
    app_data = read_json_file(app_file)

    # 1. Collect candidate approved questions across local files
    combined_candidates = []
    seen_qids = set()

    # Prioritize approved_question_bank.json entries
    for q in app_data:
        norm = SchemaQuestionBankService._normalize_question_record(q)
        norm["status"] = "APPROVED"
        qid = norm.get("question_id") or norm.get("id")
        if qid and qid not in seen_qids:
            seen_qids.add(qid)
            combined_candidates.append(norm)

    # Also incorporate approved entries in generated_questions.json
    for q in gen_data:
        if str(q.get("status", "")).upper() == "APPROVED" and not q.get("deleted", False):
            norm = SchemaQuestionBankService._normalize_question_record(q)
            norm["status"] = "APPROVED"
            qid = norm.get("question_id") or norm.get("id")
            if qid and qid not in seen_qids:
                seen_qids.add(qid)
                combined_candidates.append(norm)

    local_approved_found = len(combined_candidates)

    # 2. Fetch existing Firestore questions to prevent duplicates
    existing_fs_by_qid = {}
    existing_fs_by_docid = {}
    try:
        docs = db.collection("approved_question_bank").stream()
        for doc in docs:
            d = doc.to_dict()
            doc_id = doc.id
            existing_fs_by_docid[doc_id] = d
            qid = d.get("question_id") or d.get("id")
            if qid:
                existing_fs_by_qid[qid] = doc_id
    except Exception as e:
        print(f"[ERROR] Failed to query Firestore approved_question_bank: {e}")
        sys.exit(1)

    existing_fs_count = len(existing_fs_by_docid)

    # 3. Filter, validate, and prepare sync payloads
    to_sync = []
    skipped_duplicates = 0
    invalid_skipped = 0
    mock_skipped = 0

    mock_sources = {"MOCK", "DEV_MOCK_ONLY", "DEV_SEED", "FALLBACK_MOCK"}

    for item in combined_candidates:
        # Check source
        source = str(item.get("source", "LLM")).upper()
        if not allow_mock and (source in mock_sources or item.get("source_generated_question_id") == "SEED" or str(item.get("id", "")).startswith("SEED_")):
            mock_skipped += 1
            continue

        # Check soft delete
        if item.get("deleted", False):
            continue

        # Validate 4-tier schema
        is_valid, err = SchemaQuestionBankService.validate_question_data(item)
        if not is_valid:
            print(f"[WARN] Skipping invalid question {item.get('question_id')}: {err}")
            invalid_skipped += 1
            continue

        qid = item.get("question_id")
        doc_id = item.get("id") or f"APP_{qid}"

        # Duplicate check against Firestore
        if qid in existing_fs_by_qid and not force:
            skipped_duplicates += 1
            continue

        # Preserve and format all required fields
        now_iso = datetime.utcnow().isoformat() + "Z"
        doc_payload = {
            "id": doc_id,
            "question_id": qid,
            "concept_name": item.get("concept_name", "Loops"),
            "question_type": item.get("question_type", "Basic Understanding"),
            "difficulty": item.get("difficulty", "Medium"),
            "target_error_type": item.get("target_error_type", "NONE"),
            "question_text": item.get("question_text", ""),
            "code_snippet": item.get("code_snippet", ""),
            "option_a": item.get("option_a", ""),
            "option_b": item.get("option_b", ""),
            "option_c": item.get("option_c", ""),
            "option_d": item.get("option_d", ""),
            "option_a_quality": item.get("option_a_quality", "Wrong"),
            "option_b_quality": item.get("option_b_quality", "Wrong"),
            "option_c_quality": item.get("option_c_quality", "Wrong"),
            "option_d_quality": item.get("option_d_quality", "Wrong"),
            "options": item.get("options", []),
            "option_qualities": item.get("option_qualities", {}),
            "correct_option": item.get("correct_option", "A"),
            "explanation": item.get("explanation", ""),
            "status": "APPROVED",
            "active": True,
            "deleted": False,
            "source": item.get("source", "GEMINI"),
            "created_at": item.get("created_at") or now_iso,
            "updated_at": item.get("updated_at") or now_iso,
            "approved_at": item.get("approved_at") or now_iso,
            "approved_by": item.get("approved_by") or "Teacher Sync",
            "exposure_count": int(item.get("exposure_count", 0)),
        }

        to_sync.append((doc_id, doc_payload))

    # 4. Perform Firestore write operations
    synced_count = 0
    if not dry_run:
        batch = db.batch()
        batch_count = 0

        for doc_id, payload in to_sync:
            doc_ref = db.collection("approved_question_bank").document(doc_id)
            batch.set(doc_ref, payload)
            batch_count += 1
            synced_count += 1

            # Commit batch in chunks of 400 (Firestore limit is 500)
            if batch_count >= 400:
                batch.commit()
                batch = db.batch()
                batch_count = 0

        if batch_count > 0:
            batch.commit()
    else:
        synced_count = len(to_sync)

    # 5. Print Execution Summary
    print("\n--- SYNC SUMMARY ---")
    print(f"Local approved found       : {local_approved_found}")
    print(f"Existing Firestore approved: {existing_fs_count}")
    print(f"Synced to Firestore        : {synced_count} {'(DRY RUN - No writes)' if dry_run else ''}")
    print(f"Skipped duplicates (in FS) : {skipped_duplicates}")
    print(f"Invalid skipped            : {invalid_skipped}")
    if mock_skipped:
        print(f"Mock/Seed skipped          : {mock_skipped}")
    print(f"Total in Firestore (est.)  : {existing_fs_count + (0 if dry_run else synced_count)}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync approved questions from local storage to Firestore DB")
    parser.add_argument("--force", action="store_true", help="Overwrite existing Firestore documents with local version")
    parser.add_argument("--dry-run", action="store_true", help="Simulate sync without writing to Firestore")
    parser.add_argument("--allow-mock", action="store_true", help="Include seed/mock questions in sync")
    args = parser.parse_args()

    sync_questions(force=args.force, dry_run=args.dry_run, allow_mock=args.allow_mock)
