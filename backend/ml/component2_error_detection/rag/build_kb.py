"""
Build rag/knowledge_base.json for the C2 explanation layer
==========================================================
Chunks come from three sources:
  question       every pre-test question in frontend/src/learningPathGen/data.js
                 (question text, code template, options, correct option, author explanation)
  reason_group   ErrorService._get_reason_details for each of the 12 reason groups
                 (reason, misconception, fix, analogy)
  concept_note   rag/concept_notes.py, one beginner note per fine error type

The reviewed labels in eval/pretest_eval_set.csv are NOT put in the knowledge base:
they are the ground truth for eval/eval_llm.py.

Question chunks keep the raw question in "meta" so the backend can look questions up
without node (services/explanation_service.py reads them from this file).

Usage (from backend/):
  python ml/component2_error_detection/rag/build_kb.py
Requires: node (to read the ES module data.js).
"""

import json
import os
import subprocess
import sys

RAG_DIR = os.path.dirname(os.path.abspath(__file__))
C2_DIR = os.path.dirname(RAG_DIR)
BACKEND_DIR = os.path.abspath(os.path.join(C2_DIR, "..", ".."))
REPO_ROOT = os.path.dirname(BACKEND_DIR)
DATA_JS = os.path.join(REPO_ROOT, "frontend", "src", "learningPathGen", "data.js")
OUT_PATH = os.path.join(RAG_DIR, "knowledge_base.json")

sys.path.insert(0, BACKEND_DIR)
sys.path.insert(0, os.path.join(C2_DIR, "generator"))

from families import REASON_GROUP  # noqa: E402
from families_blank import BLANK_REASON_GROUP  # noqa: E402
from ml.component2_error_detection.rag.concept_notes import NOTES  # noqa: E402

REASON_GROUPS = [
    "VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_CALCULATION_ISSUE",
    "LOOP_BOUNDARY_ISSUE", "LOOP_CONDITION_ISSUE", "LOOP_UPDATE_ISSUE", "LOOP_CONTROL_FLOW_ISSUE",
    "ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_TRAVERSAL_ISSUE",
    "METHOD_SIGNATURE_ISSUE", "METHOD_RETURN_ISSUE", "METHOD_PARAMETER_USAGE_ISSUE",
    "CORRECT_NO_ERROR",
]
BROAD_OF_PREFIX = {"VARIABLE": "VARIABLE_ERROR", "LOOP": "LOOP_ERROR", "ARRAY": "ARRAY_ERROR",
                   "METHOD": "METHOD_ERROR", "CORRECT": "CORRECT"}


def load_quiz_bank():
    script = ("import { QUIZ_BANK } from " + json.dumps("file:///" + DATA_JS.replace("\\", "/")) + ";"
              "console.log(JSON.stringify(QUIZ_BANK));")
    out = subprocess.run(["node", "--input-type=module", "-e", script], capture_output=True, text=True,
                         check=True, encoding="utf-8")
    return json.loads(out.stdout)


def question_chunks(bank):
    chunks = []
    for q in bank:
        correct = q["options"][q["correctIndex"]]
        lines = [f"Pre-test question {q['id']} ({q['topic']}, {q.get('difficulty', '')}): {q['question']}"]
        if q.get("codeTemplate"):
            lines.append(f"Code template: {q['codeTemplate']}")
            lines.append(f"Correct code: {q['codeTemplate'].replace('{BLANK}', correct, 1)}")
        lines.append("Options: " + " | ".join(q["options"]))
        lines.append(f"Correct option: {correct}")
        if q.get("explanation"):
            lines.append(f"Explanation: {q['explanation']}")
        chunks.append({
            "id": f"question:{q['id']}",
            "type": "question",
            "concept": q["topic"],
            "question_id": q["id"],
            "text": "\n".join(lines),
            "meta": {
                "id": q["id"],
                "topic": q["topic"],
                "difficulty": q.get("difficulty"),
                "question": q["question"],
                "codeTemplate": q.get("codeTemplate"),
                "options": q["options"],
                "correct_option": correct,
                "explanation": q.get("explanation", ""),
            },
        })
    return chunks


def reason_group_chunks():
    from services.error_service import ErrorService  # imported late: pulls in firebase
    chunks = []
    for rg in REASON_GROUPS:
        d = ErrorService._get_reason_details(rg, BROAD_OF_PREFIX[rg.split("_")[0]])
        chunks.append({
            "id": f"reason_group:{rg}",
            "type": "reason_group",
            "concept": d["concept"],
            "reason_group": rg,
            "text": (f"Reason group {rg} ({d['concept']}).\n"
                     f"Reason: {d['reason']}\n"
                     f"Misconception: {d['misconception']}\n"
                     f"Fix: {d['suggested_fix']}\n"
                     f"Analogy: {d['beginner_explanation']}"),
        })
    return chunks


def concept_note_chunks():
    groups = {**REASON_GROUP, **BLANK_REASON_GROUP}
    chunks = []
    for n in NOTES:
        if n["fine_reason"] not in groups:
            raise SystemExit(f"concept note {n['fine_reason']} is not a fine reason in families.py / families_blank.py")
        chunks.append({
            "id": f"concept_note:{n['fine_reason']}",
            "type": "concept_note",
            "concept": n["concept"],
            "fine_reason": n["fine_reason"],
            "reason_group": groups[n["fine_reason"]],
            "text": f"{n['title']} ({n['fine_reason']} -> {groups[n['fine_reason']]}).\n{n['text']}",
        })
    missing = sorted(set(groups) - {n["fine_reason"] for n in NOTES} - {"CORRECT_NO_ERROR"})
    if missing:
        print(f"[WARN] fine reasons without a concept note: {missing}")
    return chunks


def main():
    bank = load_quiz_bank()
    chunks = question_chunks(bank) + reason_group_chunks() + concept_note_chunks()
    kb = {
        "version": 1,
        "sources": {
            "question": os.path.relpath(DATA_JS, REPO_ROOT).replace("\\", "/"),
            "reason_group": "backend/services/error_service.py ErrorService._get_reason_details",
            "concept_note": "backend/ml/component2_error_detection/rag/concept_notes.py",
        },
        "counts": {t: sum(c["type"] == t for c in chunks) for t in ("question", "reason_group", "concept_note")},
        "chunks": chunks,
    }
    with open(OUT_PATH, "w", encoding="utf-8") as f:
        json.dump(kb, f, ensure_ascii=False, indent=2)
    print(f"Wrote {len(chunks)} chunks {kb['counts']} -> {OUT_PATH}")


if __name__ == "__main__":
    main()
