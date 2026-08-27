import os
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "datasets", "raw"))

if not os.path.exists(RAW_DIR):
    # Fallback for cwd execution
    RAW_DIR = os.path.abspath("ml/component4_schema_mastery/datasets/raw")

print(f"[INFO] Inspecting raw datasets in: {RAW_DIR}")

if not os.path.exists(RAW_DIR):
    print(f"[ERROR] Directory does not exist: {RAW_DIR}")
    exit(1)

for file_name in os.listdir(RAW_DIR):
    if not file_name.lower().endswith(".csv"):
        continue

    path = os.path.join(RAW_DIR, file_name)

    print("\n" + "=" * 80)
    print("FILE:", file_name)

    try:
        df = pd.read_csv(path, nrows=5)
        full_df = pd.read_csv(path)

        print("Shape:", full_df.shape)
        print("Columns:")
        for col in full_df.columns:
            print(" -", col)

        print("\nFirst 5 rows:")
        print(df.head())

        print("\nMissing values:")
        print(full_df.isnull().sum().head(20))

    except Exception as e:
        print("ERROR reading file:", e)
