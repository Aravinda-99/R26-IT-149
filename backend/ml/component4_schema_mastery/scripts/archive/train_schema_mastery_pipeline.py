import os
import json
import joblib
import numpy as np
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedGroupKFold, cross_validate, cross_val_predict
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    classification_report,
    confusion_matrix
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "datasets", "processed", "schema_mastery_dataset.csv"))
MODEL_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "models", "schema_mastery_pipeline.pkl"))
META_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "models", "schema_mastery_model_metadata.json"))

if not os.path.exists(DATA_PATH):
    DATA_PATH = os.path.abspath("ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv")

print(f"[INFO] Training pipeline on dataset: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

# Standardize score scale safety (0.0 - 1.0)
score_cols = [
    "pre_test_score",
    "error_pattern_score",
    "post_test_score",
    "future_test_score"
]

for col in score_cols:
    if col in df.columns and df[col].max() > 1.0:
        df[col] = df[col] / 100.0

feature_columns = [
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
]

target_column = "future_success"
group_column = "student_id"

X = df[feature_columns]
y = df[target_column]
groups = df[group_column]

categorical_features = ["concept_name", "error_type"]

numeric_features = [
    "pre_test_score",
    "attempt_count",
    "time_taken_seconds",
    "error_pattern_score",
    "post_test_correct_count",
    "post_test_nearly_correct_count",
    "post_test_wrong_count",
    "post_test_clearly_wrong_count",
    "post_test_score",
]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", StandardScaler(), numeric_features),
    ]
)

models = {
    "logistic_regression": Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", LogisticRegression(
            max_iter=1000,
            class_weight="balanced",
            random_state=42
        ))
    ]),
    "random_forest": Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", RandomForestClassifier(
            n_estimators=200,
            max_depth=6,
            min_samples_leaf=4,
            class_weight="balanced",
            random_state=42
        ))
    ])
}


# Rule-based baseline: post_test_score >= 0.65
def rule_based_predict(dataframe):
    return (dataframe["post_test_score"] >= 0.65).astype(int)


baseline_pred = rule_based_predict(df)
baseline_cm = confusion_matrix(y, baseline_pred)

print("\n===== RULE BASELINE ON FULL DATASET =====")
print("Accuracy:          ", round(float(accuracy_score(y, baseline_pred)), 4))
print("Balanced Accuracy: ", round(float(balanced_accuracy_score(y, baseline_pred)), 4))
print("Macro F1:          ", round(float(f1_score(y, baseline_pred, average="macro")), 4))
print("Precision Macro:   ", round(float(precision_score(y, baseline_pred, average="macro")), 4))
print("Recall Macro:      ", round(float(recall_score(y, baseline_pred, average="macro")), 4))
print("Confusion Matrix:")
print(baseline_cm)

cv = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=42)

scoring = {
    "accuracy": "accuracy",
    "balanced_accuracy": "balanced_accuracy",
    "macro_f1": "f1_macro",
    "precision_macro": "precision_macro",
    "recall_macro": "recall_macro",
}

results = {}

print("\n===== CROSS VALIDATION RESULTS =====")

for name, pipeline in models.items():
    scores = cross_validate(
        pipeline,
        X,
        y,
        groups=groups,
        cv=cv,
        scoring=scoring,
        return_train_score=False
    )

    oof_preds = cross_val_predict(
        pipeline,
        X,
        y,
        groups=groups,
        cv=cv
    )
    oof_cm = confusion_matrix(y, oof_preds)

    results[name] = {
        metric: {
            "mean": float(np.mean(values)),
            "std": float(np.std(values))
        }
        for metric, values in scores.items()
        if metric.startswith("test_")
    }
    results[name]["oof_confusion_matrix"] = oof_cm.tolist()
    results[name]["oof_classification_report"] = classification_report(y, oof_preds, output_dict=True)

    print(f"\nModel: {name}")
    for metric, values in scores.items():
        if metric.startswith("test_"):
            print(f"  {metric}: {np.mean(values):.4f} ± {np.std(values):.4f}")
    print("  Out-of-fold Confusion Matrix:")
    print(oof_cm)

# Select best model by macro F1
best_model_name = max(
    results.keys(),
    key=lambda model_name: results[model_name]["test_macro_f1"]["mean"]
)

best_pipeline = models[best_model_name]
best_pipeline.fit(X, y)

os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)
joblib.dump(best_pipeline, MODEL_PATH)

metadata = {
    "model_name": best_model_name,
    "dataset_file": "ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv",
    "records": int(len(df)),
    "features": feature_columns,
    "target": target_column,
    "score_scale": "0.0-1.0",
    "validation": "StratifiedGroupKFold (5-fold) grouped by student_id",
    "rule_baseline": {
        "rule": "post_test_score >= 0.65",
        "accuracy": float(accuracy_score(y, baseline_pred)),
        "balanced_accuracy": float(balanced_accuracy_score(y, baseline_pred)),
        "macro_f1": float(f1_score(y, baseline_pred, average="macro")),
        "precision_macro": float(precision_score(y, baseline_pred, average="macro")),
        "recall_macro": float(recall_score(y, baseline_pred, average="macro")),
        "confusion_matrix": baseline_cm.tolist(),
    },
    "results": results
}

with open(META_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print("\n===== SAVED MODEL =====")
print("Best model:", best_model_name)
print("Saved:", MODEL_PATH)
print("Metadata:", META_PATH)
