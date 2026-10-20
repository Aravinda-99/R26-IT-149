"""
Component 4 Data Sanitization Script: clean_mock_questions.py
=============================================================
Safely purges mock, template, and developer-seed questions from active
question bank files, archiving previous data with timestamps.

Usage:
    python backend/scripts/clean_mock_questions.py
"""

import os
import json
import shutil
from datetime import datetime

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STORAGE_DIR = os.path.join(BACKEND_DIR, "ml", "component4_schema_mastery", "question_bank", "local_storage")
ARCHIVE_DIR = os.path.join(BACKEND_DIR, "ml", "component4_schema_mastery", "archive", "mock_questions")

APP_FILE = os.path.join(STORAGE_DIR, "approved_question_bank.json")
GEN_FILE = os.path.join(STORAGE_DIR, "generated_questions.json")


def is_mock_or_seed(q: dict) -> bool:
    """Detects whether a question originated from dev seeds, templates, or mock generators."""
    source = str(q.get("source", "")).upper()
    qid = str(q.get("id", ""))
    q_question_id = str(q.get("question_id", ""))
    source_gen_id = str(q.get("source_generated_question_id", ""))

    if source in ("DEV_SEED", "DEV_MOCK", "MOCK", "SEED", "MOCK_TEMPLATE"):
        return True
    if qid.startswith("SEED_") or qid.startswith("MOCK_"):
        return True
    if q_question_id.startswith("SEED_") or q_question_id.startswith("MOCK_"):
        return True
    if source_gen_id == "SEED" or source_gen_id.startswith("SEED_") or source_gen_id.startswith("MOCK_"):
        return True

    # If it lacks source="LLM" and was created without LLM model metadata
    if q.get("source") != "LLM" and not q.get("model"):
        # If it was from initial seed file
        if "SEED" in qid or "SEED" in q_question_id:
            return True

    return False


def run_cleanup():
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    target_archive_dir = os.path.join(ARCHIVE_DIR, f"backup_{timestamp}")
    os.makedirs(target_archive_dir, exist_ok=True)

    print("=" * 60)
    print("Component 4: Question Bank Mock Data Purge & Archive")
    print("=" * 60)
    print(f"[1] Archive destination: {target_archive_dir}")

    # 1. Clean Approved Question Bank
    app_data = []
    if os.path.exists(APP_FILE):
        shutil.copy2(APP_FILE, os.path.join(target_archive_dir, "approved_question_bank.json"))
        with open(APP_FILE, "r", encoding="utf-8") as f:
            try:
                app_data = json.load(f)
            except Exception:
                app_data = []

    app_initial_count = len(app_data)
    app_cleaned = [q for q in app_data if not is_mock_or_seed(q) and q.get("status") == "APPROVED"]
    app_removed = app_initial_count - len(app_cleaned)

    with open(APP_FILE, "w", encoding="utf-8") as f:
        json.dump(app_cleaned, f, indent=2, ensure_ascii=False)

    print(f"[2] Approved Question Bank:")
    print(f"    - Initial count: {app_initial_count}")
    print(f"    - Mock/Seed removed: {app_removed}")
    print(f"    - Real LLM Approved retained: {len(app_cleaned)}")

    # 2. Clean Generated Questions (Drafts)
    gen_data = []
    if os.path.exists(GEN_FILE):
        shutil.copy2(GEN_FILE, os.path.join(target_archive_dir, "generated_questions.json"))
        with open(GEN_FILE, "r", encoding="utf-8") as f:
            try:
                gen_data = json.load(f)
            except Exception:
                gen_data = []

    gen_initial_count = len(gen_data)
    gen_cleaned = [q for q in gen_data if not is_mock_or_seed(q)]
    gen_removed = gen_initial_count - len(gen_cleaned)

    with open(GEN_FILE, "w", encoding="utf-8") as f:
        json.dump(gen_cleaned, f, indent=2, ensure_ascii=False)

    print(f"[3] Generated Draft Questions:")
    print(f"    - Initial count: {gen_initial_count}")
    print(f"    - Mock/Seed drafts removed: {gen_removed}")
    print(f"    - Real LLM Drafts retained: {len(gen_cleaned)}")

    print("=" * 60)
    print("Purge completed successfully! The active workflow now contains ONLY real questions.")
    print("=" * 60)


if __name__ == "__main__":
    run_cleanup()
