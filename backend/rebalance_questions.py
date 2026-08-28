"""
Rebalances seed_questions.json and approved_question_bank.json so correct answers
are evenly distributed across positions A, B, C, and D.
"""
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORAGE_DIR = os.path.join(BASE_DIR, "ml", "component4_schema_mastery", "question_bank", "local_storage")

SEED_FILE = os.path.join(STORAGE_DIR, "seed_questions.json")
APP_FILE = os.path.join(STORAGE_DIR, "approved_question_bank.json")
GEN_FILE = os.path.join(STORAGE_DIR, "generated_questions.json")

letters = ["A", "B", "C", "D"]

def rebalance_file(filepath):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return

    with open(filepath, "r", encoding="utf-8") as f:
        data = json.load(f)

    if not isinstance(data, list):
        return

    for i, q in enumerate(data):
        target_letter = letters[i % 4]
        
        # Collect existing options & qualities
        items = []
        for k in letters:
            items.append({
                "text": q.get(f"option_{k.lower()}", ""),
                "quality": q.get(f"option_{k.lower()}_quality", "Wrong"),
            })

        correct_item = next((it for it in items if it["quality"] == "Correct"), items[0])
        other_items = [it for it in items if it is not correct_item]

        target_idx = letters.index(target_letter)
        assigned = [None, None, None, None]
        assigned[target_idx] = correct_item

        other_idx = 0
        for pos in range(4):
            if assigned[pos] is None:
                assigned[pos] = other_items[other_idx]
                other_idx += 1

        q["option_a"] = assigned[0]["text"]
        q["option_b"] = assigned[1]["text"]
        q["option_c"] = assigned[2]["text"]
        q["option_d"] = assigned[3]["text"]
        q["option_a_quality"] = assigned[0]["quality"]
        q["option_b_quality"] = assigned[1]["quality"]
        q["option_c_quality"] = assigned[2]["quality"]
        q["option_d_quality"] = assigned[3]["quality"]
        q["correct_option"] = target_letter

    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Successfully rebalanced {len(data)} questions in {filepath}")

rebalance_file(SEED_FILE)
rebalance_file(APP_FILE)
rebalance_file(GEN_FILE)
