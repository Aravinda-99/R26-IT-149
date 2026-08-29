"""
Component 4: Schema Mastery ML Training Script
================================================
Trains two machine learning models for Component 4 (Post-Learning Validation):
1. Model 1: Random Forest Classifier for `mastery_level`
   ("Strong Understanding", "Good Progress", "Needs More Practice", "Learn Again")
2. Model 2: Decision Tree Classifier for `next_action`
   ("DONE", "LEARN_AGAIN")

Usage:
    python ml/component4_schema_mastery/scripts/train_schema_mastery_models.py
"""

import os
import sys
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import classification_report, accuracy_score, confusion_matrix

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'datasets', 'processed', 'schema_mastery_dataset.csv'))
MODEL_LEVEL_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'models', 'schema_mastery_level_model.pkl'))
MODEL_ACTION_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'models', 'schema_next_action_model.pkl'))
PREPROCESSOR_PATH = os.path.abspath(os.path.join(BASE_DIR, '..', 'models', 'schema_preprocessor.pkl'))

FEATURE_COLS_CAT = ['concept_name', 'error_type']
FEATURE_COLS_NUM = [
    'pre_test_score',
    'attempt_count',
    'time_taken',
    'error_pattern_score',
    'post_test_correct_count',
    'post_test_nearly_correct_count',
    'post_test_wrong_count',
    'post_test_clearly_wrong_count',
    'post_test_score',
]
ALL_FEATURE_COLS = FEATURE_COLS_CAT + FEATURE_COLS_NUM


def train_models():
    print("=" * 70)
    print("  COMPONENT 4: SCHEMA MASTERY ML MODEL TRAINING")
    print("=" * 70)

    if not os.path.exists(DATA_PATH):
        print(f"[ERROR] Dataset file not found at: {DATA_PATH}")
        sys.exit(1)

    df = pd.read_csv(DATA_PATH)
    print(f"[INFO] Loaded dataset with {len(df)} records.")

    # Validate required columns
    required_cols = ALL_FEATURE_COLS + ['mastery_level', 'next_action']
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"[ERROR] Missing required columns in CSV: {missing}")
        sys.exit(1)

    X = df[ALL_FEATURE_COLS]
    y_level = df['mastery_level']
    y_action = df['next_action']

    # Preprocessor for categorical & numerical features
    preprocessor = ColumnTransformer(
        transformers=[
            ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), FEATURE_COLS_CAT),
            ('num', 'passthrough', FEATURE_COLS_NUM)
        ]
    )

    X_transformed = preprocessor.fit_transform(X)

    # -------------------------------------------------------------------------
    # Train Model 1: Random Forest Classifier for mastery_level
    # -------------------------------------------------------------------------
    print("\n--- Training Model 1: Random Forest Classifier (mastery_level) ---")
    X_train_l, X_test_l, y_train_l, y_test_l = train_test_split(
        X_transformed, y_level, test_size=0.25, random_state=42, stratify=y_level
    )

    rf_model = RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10)
    rf_model.fit(X_train_l, y_train_l)

    y_pred_l = rf_model.predict(X_test_l)
    acc_l = accuracy_score(y_test_l, y_pred_l)
    print(f"Mastery Level Accuracy: {acc_l * 100:.2f}%")
    print("\nClassification Report (Mastery Level):")
    print(classification_report(y_test_l, y_pred_l))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test_l, y_pred_l))

    # -------------------------------------------------------------------------
    # Train Model 2: Decision Tree Classifier for next_action
    # -------------------------------------------------------------------------
    print("\n--- Training Model 2: Decision Tree Classifier (next_action) ---")
    X_train_a, X_test_a, y_train_a, y_test_a = train_test_split(
        X_transformed, y_action, test_size=0.25, random_state=42, stratify=y_action
    )

    dt_model = DecisionTreeClassifier(random_state=42, max_depth=6)
    dt_model.fit(X_train_a, y_train_a)

    y_pred_a = dt_model.predict(X_test_a)
    acc_a = accuracy_score(y_test_a, y_pred_a)
    print(f"Next Action Accuracy: {acc_a * 100:.2f}%")
    print("\nClassification Report (Next Action):")
    print(classification_report(y_test_a, y_pred_a))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test_a, y_pred_a))

    # -------------------------------------------------------------------------
    # Save Artifacts
    # -------------------------------------------------------------------------
    os.makedirs(os.path.dirname(PREPROCESSOR_PATH), exist_ok=True)
    joblib.dump(preprocessor, PREPROCESSOR_PATH)
    joblib.dump(rf_model, MODEL_LEVEL_PATH)
    joblib.dump(dt_model, MODEL_ACTION_PATH)

    print("\n[SUCCESS] Saved model artifacts:")
    print(f"  - Preprocessor: {PREPROCESSOR_PATH}")
    print(f"  - Level Model:   {MODEL_LEVEL_PATH}")
    print(f"  - Action Model:  {MODEL_ACTION_PATH}")
    print("=" * 70)


if __name__ == '__main__':
    train_models()
