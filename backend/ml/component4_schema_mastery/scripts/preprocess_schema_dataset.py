import os
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "datasets", "raw"))
if not os.path.exists(RAW_DIR):
    RAW_DIR = os.path.abspath("ml/component4_schema_mastery/datasets/raw")

OUTPUT_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "datasets", "processed", "schema_mastery_dataset.csv"))

CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"]


def map_concept(problem_id):
    try:
        pid = int(problem_id)
        return CONCEPTS[pid % len(CONCEPTS)]
    except Exception:
        return "General Programming"


def map_error_type(msg):
    s = str(msg).lower()
    if "variable" in s or "symbol" in s or "type" in s or "cannot find" in s:
        return "TYPE_MISMATCH"
    if "loop" in s or "while" in s or "for" in s or "condition" in s:
        return "LOOP_CONDITION_ERROR"
    if "array" in s or "index" in s or "bound" in s:
        return "INDEX_ERROR"
    if "operator" in s or "compar" in s or "precedence" in s:
        return "OPERATOR_CONFUSION"
    if "method" in s or "return" in s or "parameter" in s:
        return "METHOD_CALL_ERROR"
    if "error" in s or "syntax" in s:
        return "SYNTAX_ERROR"
    return "UNKNOWN_ERROR"


def read_csv_safe(file_name):
    path = os.path.join(RAW_DIR, file_name)
    if not os.path.exists(path):
        print(f"[WARN] Missing file: {file_name}")
        return None
    return pd.read_csv(path)


def build_from_main_table():
    main = read_csv_safe("MainTable.csv")
    if main is None:
        main = read_csv_safe("MainTable1.csv")

    if main is None:
        raise FileNotFoundError(f"MainTable.csv or MainTable1.csv not found in {RAW_DIR}")

    print("[INFO] Processing MainTable from:", RAW_DIR)
    print("Shape:", main.shape)

    # Ensure score numeric
    main["Score"] = pd.to_numeric(main.get("Score"), errors="coerce")
    student_col = "SubjectID" if "SubjectID" in main.columns else main.columns[0]
    problem_col = "ProblemID" if "ProblemID" in main.columns else main.columns[1]

    # Aggregate by student and problem
    grp = main.groupby([student_col, problem_col], sort=False)
    records = []

    for (sid, pid), group in grp:
        scores = group["Score"].dropna()
        best_score = float(scores.max()) if len(scores) > 0 else 0.0
        if best_score > 1.0:
            best_score = best_score / 100.0
        best_score = max(0.0, min(1.0, best_score))

        attempts = int((group.get("EventType") == "Run.Program").sum())
        attempts = max(1, min(10, attempts))

        err_events = int((group.get("EventType") == "Compile.Error").sum())
        total_events = len(group)
        err_score = max(0.0, min(1.0, 1.0 - (err_events / max(1, total_events))))

        last_err = "none"
        if "CompileMessageData" in group.columns:
            err_series = group["CompileMessageData"].dropna()
            if len(err_series) > 0:
                last_err = str(err_series.iloc[-1])

        error_type = map_error_type(last_err)
        concept = map_concept(pid)

        # Approximate duration in seconds
        time_sec = min(600, max(45, attempts * 45 + err_events * 15))

        records.append({
            "student_id": str(sid),
            "problem_id": str(pid),
            "concept_name": concept,
            "post_test_score": round(best_score, 3),
            "attempt_count": attempts,
            "time_taken_seconds": time_sec,
            "error_type": error_type,
            "error_pattern_score": round(err_score, 3),
        })

    df = pd.DataFrame(records)
    print(f"[INFO] Formed {len(df)} problem sessions across students.")

    # Calculate pre_test_score as past average performance
    df["pre_test_score"] = (
        df.groupby("student_id")["post_test_score"]
        .expanding()
        .mean()
        .reset_index(level=0, drop=True)
    )
    df["pre_test_score"] = df.groupby("student_id")["pre_test_score"].shift(1)
    df["pre_test_score"] = df["pre_test_score"].fillna(df["post_test_score"].median()).round(3)

    # Multi-factor Evidence score combining pre-test, post-test, attempt efficiency, time, and error recovery
    attempt_eff = np.clip(1.0 - (df["attempt_count"] - 1) / 5.0, 0.0, 1.0)
    time_eff = np.clip(1.0 - (df["time_taken_seconds"] - 60) / 400.0, 0.0, 1.0)

    evidence_score = (
        0.25 * df["pre_test_score"] +
        0.30 * df["post_test_score"] +
        0.15 * attempt_eff +
        0.15 * time_eff +
        0.15 * df["error_pattern_score"]
    )
    df["future_success"] = (evidence_score >= 0.70).astype(int)

    # Question breakdown (10-question MCQ validation proxy)
    total_q = 10
    df["post_test_correct_count"] = (df["post_test_score"] * total_q).round().astype(int).clip(0, total_q)

    rem = total_q - df["post_test_correct_count"]
    df["post_test_nearly_correct_count"] = (rem * df["error_pattern_score"] * 0.5).round().astype(int).clip(0, total_q)
    rem_after = total_q - df["post_test_correct_count"] - df["post_test_nearly_correct_count"]
    df["post_test_clearly_wrong_count"] = (rem_after * (1.0 - df["error_pattern_score"]) * 0.6).round().astype(int).clip(0, total_q)
    df["post_test_wrong_count"] = (
        total_q - df["post_test_correct_count"] - df["post_test_nearly_correct_count"] - df["post_test_clearly_wrong_count"]
    ).clip(0, total_q)

    df["session_id"] = ["SES" + str(i).zfill(6) for i in range(len(df))]

    final_cols = [
        "student_id",
        "session_id",
        "concept_name",
        "pre_test_score",
        "attempt_count",
        "time_taken_seconds",
        "error_type",
        "error_pattern_score",
        "post_test_correct_count",
        "post_test_nearly_correct_count",
        "post_test_wrong_count",
        "post_test_clearly_wrong_count",
        "post_test_score",
        "future_success",
    ]

    return df[final_cols].copy()


def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    final_df = build_from_main_table()
    final_df = final_df.dropna()
    final_df = final_df.drop_duplicates()

    final_df.to_csv(OUTPUT_PATH, index=False)

    print("\n[SUCCESS] Saved processed dataset:", OUTPUT_PATH)
    print("Shape:", final_df.shape)
    print("\nClass balance:")
    print(final_df["future_success"].value_counts())
    print("\nConcept distribution:")
    print(final_df["concept_name"].value_counts())
    print("\nError types:")
    print(final_df["error_type"].value_counts())
    print("\nFirst rows:")
    print(final_df.head())


if __name__ == "__main__":
    main()
