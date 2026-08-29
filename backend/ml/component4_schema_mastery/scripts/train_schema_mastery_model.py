"""
Component 4: Schema Mastery ML Training & Evaluation Pipeline
=============================================================
Trains scikit-learn models (Logistic Regression & Random Forest) using
StratifiedGroupKFold cross-validation on `schema_mastery_dataset.csv`.

Generates evaluation artifacts in `ml/component4_schema_mastery/evaluation/`:
  - `model_comparison_chart.png`
  - `confusion_matrices.png`
  - `per_class_f1_comparison.png`
  - `feature_importance.png`
  - `cv_stability_chart.png`

Saves:
  - `ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl`
  - `ml/component4_schema_mastery/models/schema_mastery_model_metadata.json`

Usage:
    python ml/component4_schema_mastery/scripts/train_schema_mastery_model.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import matplotlib
matplotlib.use("Agg")  # Non-interactive backend for headless execution
import matplotlib.pyplot as plt

from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedGroupKFold, cross_val_predict
from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    confusion_matrix,
    classification_report,
)

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
DATA_PATH = os.path.join(ROOT_DIR, "datasets", "processed", "schema_mastery_dataset.csv")
MODELS_DIR = os.path.join(ROOT_DIR, "models")
EVAL_DIR = os.path.join(ROOT_DIR, "evaluation")
MODEL_PATH = os.path.join(MODELS_DIR, "schema_mastery_pipeline.pkl")
META_PATH = os.path.join(MODELS_DIR, "schema_mastery_model_metadata.json")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(EVAL_DIR, exist_ok=True)

if not os.path.exists(DATA_PATH):
    alt_data = os.path.abspath("ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv")
    if os.path.exists(alt_data):
        DATA_PATH = alt_data

print(f"[INFO] Loading Component 4 dataset from: {DATA_PATH}")
df = pd.read_csv(DATA_PATH)

print(f"Dataset shape: {df.shape}")
print(f"Unique students: {df['student_id'].nunique()}")
print(f"Class distribution in target ('future_success'):")
print(df["future_success"].value_counts(normalize=True).round(4) * 100)

required_columns = [
    "student_id",
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

missing_cols = [col for col in required_columns if col not in df.columns]
if missing_cols:
    raise ValueError(f"Missing required columns in dataset: {missing_cols}")

# Normalization & preprocessing
score_cols = ["pre_test_score", "error_pattern_score", "post_test_score"]
for col in score_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[col] = df[col].apply(lambda x: x / 100.0 if pd.notnull(x) and x > 1.0 else x)
    df[col] = df[col].clip(0.0, 1.0)

numeric_cols = [
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

for col in numeric_cols:
    df[col] = pd.to_numeric(df[col], errors="coerce")
    df[col] = df[col].fillna(df[col].median())

df["concept_name"] = df["concept_name"].fillna("General Programming").astype(str)
df["error_type"] = df["error_type"].fillna("UNKNOWN_ERROR").astype(str)
df["future_success"] = df["future_success"].astype(int)

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

X = df[feature_columns]
y = df["future_success"]
groups = df["student_id"]

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore"), categorical_features),
        ("num", StandardScaler(), numeric_features),
    ]
)

models = {
    "logistic_regression": Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", LogisticRegression(max_iter=1000, class_weight="balanced", random_state=42)),
    ]),
    "random_forest": Pipeline(steps=[
        ("preprocess", preprocessor),
        ("model", RandomForestClassifier(
            n_estimators=120,
            max_depth=8,
            min_samples_leaf=5,
            class_weight="balanced",
            n_jobs=-1,
            random_state=42,
        )),
    ]),
}

# ─────────────────────────────────────────────────────────────────────────────
# 1. Rule-Based Baseline Evaluation
# ─────────────────────────────────────────────────────────────────────────────
baseline_pred = (df["post_test_score"] >= 0.65).astype(int)

baseline_results = {
    "accuracy": float(accuracy_score(y, baseline_pred)),
    "balanced_accuracy": float(balanced_accuracy_score(y, baseline_pred)),
    "macro_f1": float(f1_score(y, baseline_pred, average="macro")),
    "precision_macro": float(precision_score(y, baseline_pred, average="macro", zero_division=0)),
    "recall_macro": float(recall_score(y, baseline_pred, average="macro", zero_division=0)),
}

print("\n===== Rule-Based Baseline Metrics =====")
for k, v in baseline_results.items():
    print(f"  {k}: {v:.4f}")

# ─────────────────────────────────────────────────────────────────────────────
# 2. 5-Fold StratifiedGroupKFold Cross-Validation
# ─────────────────────────────────────────────────────────────────────────────
unique_students = df["student_id"].nunique()
n_splits = 5 if unique_students >= 5 else 3

cv = StratifiedGroupKFold(n_splits=n_splits, shuffle=True, random_state=42)

cv_fold_scores = {name: [] for name in models.keys()}
oof_predictions = {}
oof_predictions["baseline"] = baseline_pred

print("\n===== Running StratifiedGroupKFold Cross-Validation =====")

for model_name, pipeline in models.items():
    print(f"\nEvaluating: {model_name}...")
    fold_metrics = []
    
    # Store out-of-fold predictions
    oof_preds = np.zeros(len(df), dtype=int)
    
    for fold_idx, (train_idx, val_idx) in enumerate(cv.split(X, y, groups=groups)):
        X_train, y_train = X.iloc[train_idx], y.iloc[train_idx]
        X_val, y_val = X.iloc[val_idx], y.iloc[val_idx]
        
        pipeline.fit(X_train, y_train)
        y_val_pred = pipeline.predict(X_val)
        oof_preds[val_idx] = y_val_pred
        
        acc = accuracy_score(y_val, y_val_pred)
        bacc = balanced_accuracy_score(y_val, y_val_pred)
        f1 = f1_score(y_val, y_val_pred, average="macro")
        prec = precision_score(y_val, y_val_pred, average="macro", zero_division=0)
        rec = recall_score(y_val, y_val_pred, average="macro", zero_division=0)
        
        fold_metrics.append({
            "fold": fold_idx + 1,
            "accuracy": acc,
            "balanced_accuracy": bacc,
            "macro_f1": f1,
            "precision_macro": prec,
            "recall_macro": rec,
        })
    
    cv_fold_scores[model_name] = fold_metrics
    oof_predictions[model_name] = oof_preds
    
    mean_f1 = np.mean([f["macro_f1"] for f in fold_metrics])
    std_f1 = np.std([f["macro_f1"] for f in fold_metrics])
    mean_bacc = np.mean([f["balanced_accuracy"] for f in fold_metrics])
    std_bacc = np.std([f["balanced_accuracy"] for f in fold_metrics])
    print(f"  Macro F1:          {mean_f1:.4f} ± {std_f1:.4f}")
    print(f"  Balanced Accuracy: {mean_bacc:.4f} ± {std_bacc:.4f}")

# Aggregate summary results
model_results = {}
for model_name, folds in cv_fold_scores.items():
    model_results[model_name] = {
        metric: {
            "mean": float(np.mean([f[metric] for f in folds])),
            "std": float(np.std([f[metric] for f in folds])),
        }
        for metric in ["accuracy", "balanced_accuracy", "macro_f1", "precision_macro", "recall_macro"]
    }

best_model_name = max(model_results.keys(), key=lambda m: model_results[m]["macro_f1"]["mean"])
print(f"\n[OK] Best Performing Model: {best_model_name}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. Fit Best Model 1 on Full Dataset & Train Model 2 (Next Action Model)
# ─────────────────────────────────────────────────────────────────────────────
best_pipeline = models[best_model_name]
print(f"\nTraining Model 1 ({best_model_name}) on full dataset (N={len(df)})...")
best_pipeline.fit(X, y)
joblib.dump(best_pipeline, MODEL_PATH)

# Train Model 2: Next Action Recommendation Model
from sklearn.tree import DecisionTreeClassifier
print("\nTraining Model 2: Next Action Recommendation Decision Model...")
ACTION_MODEL_PATH = os.path.join(MODELS_DIR, "schema_next_action_model.pkl")

# Generate Model 1 probabilities on full dataset to serve as an input feature for Model 2
m1_probs = best_pipeline.predict_proba(X)[:, 1] if hasattr(best_pipeline, "predict_proba") else best_pipeline.predict(X)

# Model 2 uses preprocessed features + Model 1 mastery probability
prep_transformer = best_pipeline.named_steps["preprocess"]
X_trans = prep_transformer.transform(X)
if hasattr(X_trans, "toarray"):
    X_trans = X_trans.toarray()

X_action = np.column_stack([X_trans, m1_probs])
y_action = y.copy()

action_model = DecisionTreeClassifier(max_depth=6, min_samples_leaf=10, class_weight="balanced", random_state=42)

# Cross-validate Model 2
action_f1_scores = []
action_acc_scores = []
for fold_idx, (train_idx, val_idx) in enumerate(cv.split(X, y, groups=groups)):
    X_tr, y_tr = X_action[train_idx], y_action.iloc[train_idx]
    X_va, y_va = X_action[val_idx], y_action.iloc[val_idx]
    action_model.fit(X_tr, y_tr)
    y_va_pred = action_model.predict(X_va)
    action_f1_scores.append(f1_score(y_va, y_va_pred, average="macro"))
    action_acc_scores.append(accuracy_score(y_va, y_va_pred))

action_model.fit(X_action, y_action)
joblib.dump(action_model, ACTION_MODEL_PATH)
print(f"[OK] Model 2 (Next Action) Macro F1: {np.mean(action_f1_scores):.4f} ± {np.std(action_f1_scores):.4f}")

# Also save standalone Level Model and Preprocessor
LEVEL_MODEL_PATH = os.path.join(MODELS_DIR, "schema_mastery_level_model.pkl")
PREPROCESSOR_PATH = os.path.join(MODELS_DIR, "schema_preprocessor.pkl")
joblib.dump(best_pipeline.named_steps["model"], LEVEL_MODEL_PATH)
joblib.dump(prep_transformer, PREPROCESSOR_PATH)

metadata = {
    "architecture": "Dual ML Model Pipeline",
    "model_1": {
        "name": "schema_mastery_pipeline",
        "type": f"Pipeline (ColumnTransformer + {best_model_name})",
        "target": "future_success / mastery_probability",
        "results": model_results[best_model_name],
    },
    "model_2": {
        "name": "schema_next_action_model",
        "type": "DecisionTreeClassifier (Evidence + Mastery Probability)",
        "target": "next_action (DONE vs LEARN_AGAIN)",
        "macro_f1": float(np.mean(action_f1_scores)),
        "accuracy": float(np.mean(action_acc_scores)),
    },
    "dataset_path": "ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv",
    "dataset_rows": int(len(df)),
    "unique_students": int(unique_students),
    "concept_distribution": df["concept_name"].value_counts().to_dict(),
    "error_type_distribution": df["error_type"].value_counts().to_dict(),
    "features": feature_columns,
    "score_scale": "0.0-1.0",
    "validation_method": f"StratifiedGroupKFold grouped by student_id, n_splits={n_splits}",
    "baseline_results": baseline_results,
    "model_results": model_results,
}

with open(META_PATH, "w") as f:
    json.dump(metadata, f, indent=2)

print(f"[SUCCESS] Model 1 saved to: {MODEL_PATH}")
print(f"[SUCCESS] Model 2 saved to: {ACTION_MODEL_PATH}")
print(f"[SUCCESS] Metadata saved to: {META_PATH}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. Generate Fresh Component 4 Evaluation Charts
# ─────────────────────────────────────────────────────────────────────────────
print("\n===== Generating Component 4 Evaluation Charts =====")

plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

# Chart 1: Model Comparison Bar Chart
chart1_path = os.path.join(EVAL_DIR, "model_comparison_chart.png")
fig, ax = plt.subplots(figsize=(10, 6))

metrics = ["accuracy", "balanced_accuracy", "macro_f1", "precision_macro", "recall_macro"]
metric_labels = ["Accuracy", "Balanced Acc", "Macro F1", "Macro Precision", "Macro Recall"]
x = np.arange(len(metrics))
width = 0.25

b_vals = [baseline_results[m] for m in metrics]
lr_vals = [model_results["logistic_regression"][m]["mean"] for m in metrics]
rf_vals = [model_results["random_forest"][m]["mean"] for m in metrics]

rects1 = ax.bar(x - width, b_vals, width, label="Rule-Based Baseline", color="#94a3b8")
rects2 = ax.bar(x, lr_vals, width, label="Logistic Regression", color="#3b82f6")
rects3 = ax.bar(x + width, rf_vals, width, label="Random Forest (Pipeline)", color="#10b981")

ax.set_ylabel("Score (0.0 - 1.0)", fontsize=12)
ax.set_title("Component 4: Schema Mastery Model Performance Benchmark (5-Fold Grouped CV)", fontsize=13, fontweight="bold", pad=15)
ax.set_xticks(x)
ax.set_xticklabels(metric_labels, fontsize=10)
ax.set_ylim(0, 1.15)
ax.legend(loc="upper right", frameon=True)

for rects in [rects1, rects2, rects3]:
    for rect in rects:
        height = rect.get_height()
        ax.annotate(f"{height:.2f}",
                    xy=(rect.get_x() + rect.get_width() / 2, height),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha="center", va="bottom", fontsize=8)

plt.tight_layout()
plt.savefig(chart1_path, dpi=150)
plt.close()
print(f"[OK] Generated: {chart1_path}")

# Chart 2: Confusion Matrices (Baseline vs Logistic Regression vs Random Forest)
chart2_path = os.path.join(EVAL_DIR, "confusion_matrices.png")
fig, axes = plt.subplots(1, 3, figsize=(15, 4.5))

model_display = [
    ("Rule-Based Baseline", oof_predictions["baseline"]),
    ("Logistic Regression", oof_predictions["logistic_regression"]),
    ("Random Forest (Pipeline)", oof_predictions["random_forest"]),
]

class_labels = ["Needs Practice (0)", "Mastered (1)"]

for idx, (title, preds) in enumerate(model_display):
    cm = confusion_matrix(y, preds)
    ax = axes[idx]
    cax = ax.matshow(cm, cmap=plt.cm.Blues, alpha=0.85)
    
    for i in range(cm.shape[0]):
        for j in range(cm.shape[1]):
            ax.text(x=j, y=i, s=f"{cm[i, j]:,}", va="center", ha="center", size="large", fontweight="bold")
            
    ax.set_xlabel("Predicted Label", fontsize=10, labelpad=10)
    ax.set_ylabel("True Label" if idx == 0 else "", fontsize=10)
    ax.set_title(title, fontsize=11, fontweight="bold", pad=15)
    ax.set_xticks([0, 1])
    ax.set_yticks([0, 1])
    ax.set_xticklabels(class_labels, fontsize=9)
    ax.set_yticklabels(class_labels if idx == 0 else ["", ""], fontsize=9)

fig.suptitle("Component 4: Out-of-Fold Confusion Matrices on Schema Mastery Validation", fontsize=13, fontweight="bold", y=1.02)
plt.tight_layout()
plt.savefig(chart2_path, dpi=150, bbox_inches="tight")
plt.close()
print(f"[OK] Generated: {chart2_path}")

# Chart 3: Per-Class F1 Score Comparison
chart3_path = os.path.join(EVAL_DIR, "per_class_f1_comparison.png")
fig, ax = plt.subplots(figsize=(8, 5))

classes = ["Class 0: Needs Practice / Review", "Class 1: Mastered / Successful"]
b_f1 = f1_score(y, oof_predictions["baseline"], average=None)
lr_f1 = f1_score(y, oof_predictions["logistic_regression"], average=None)
rf_f1 = f1_score(y, oof_predictions["random_forest"], average=None)

x = np.arange(len(classes))
width = 0.25

r1 = ax.bar(x - width, b_f1, width, label="Rule-Based Baseline", color="#94a3b8")
r2 = ax.bar(x, lr_f1, width, label="Logistic Regression", color="#3b82f6")
r3 = ax.bar(x + width, rf_f1, width, label="Random Forest", color="#10b981")

ax.set_ylabel("F1 Score", fontsize=11)
ax.set_title("Component 4: Per-Class F1 Score Comparison", fontsize=12, fontweight="bold", pad=12)
ax.set_xticks(x)
ax.set_xticklabels(classes, fontsize=10)
ax.set_ylim(0, 1.15)
ax.legend(loc="lower right")

for rects in [r1, r2, r3]:
    for rect in rects:
        h = rect.get_height()
        ax.annotate(f"{h:.3f}",
                    xy=(rect.get_x() + rect.get_width() / 2, h),
                    xytext=(0, 3),
                    textcoords="offset points",
                    ha="center", va="bottom", fontsize=8)

plt.tight_layout()
plt.savefig(chart3_path, dpi=150)
plt.close()
print(f"[OK] Generated: {chart3_path}")

# Chart 4: Random Forest Feature Importance
chart4_path = os.path.join(EVAL_DIR, "feature_importance.png")
rf_model = best_pipeline.named_steps["model"]
prep = best_pipeline.named_steps["preprocess"]

cat_enc = prep.named_transformers_["cat"]
cat_names = list(cat_enc.get_feature_names_out(categorical_features))
all_feat_names = cat_names + numeric_features

importances = rf_model.feature_importances_
feat_df = pd.DataFrame({"feature": all_feat_names, "importance": importances})
feat_df = feat_df.sort_values("importance", ascending=True).tail(12)  # top 12 features

fig, ax = plt.subplots(figsize=(9, 6))
bars = ax.barh(feat_df["feature"], feat_df["importance"], color="#0284c7")
ax.set_xlabel("Feature Importance (Gini Impurity Reduction)", fontsize=10)
ax.set_title("Component 4: Random Forest Top Feature Importances", fontsize=12, fontweight="bold", pad=12)

for bar in bars:
    w = bar.get_width()
    ax.annotate(f"{w:.3f}",
                xy=(w, bar.get_y() + bar.get_height() / 2),
                xytext=(4, 0),
                textcoords="offset points",
                ha="left", va="center", fontsize=8)

plt.tight_layout()
plt.savefig(chart4_path, dpi=150)
plt.close()
print(f"[OK] Generated: {chart4_path}")

# Chart 5: 5-Fold Cross-Validation Stability Chart
chart5_path = os.path.join(EVAL_DIR, "cv_stability_chart.png")
fig, ax = plt.subplots(figsize=(9, 5))

folds_range = [f"Fold {i}" for i in range(1, n_splits + 1)]
rf_fold_f1 = [f["macro_f1"] for f in cv_fold_scores["random_forest"]]
rf_fold_bacc = [f["balanced_accuracy"] for f in cv_fold_scores["random_forest"]]
lr_fold_f1 = [f["macro_f1"] for f in cv_fold_scores["logistic_regression"]]

ax.plot(folds_range, rf_fold_f1, marker="o", linewidth=2.2, color="#10b981", label="Random Forest (Macro F1)")
ax.plot(folds_range, rf_fold_bacc, marker="s", linewidth=2.0, color="#059669", linestyle="--", label="Random Forest (Balanced Acc)")
ax.plot(folds_range, lr_fold_f1, marker="^", linewidth=1.8, color="#3b82f6", label="Logistic Regression (Macro F1)")

ax.set_ylabel("Score (0.0 - 1.0)", fontsize=11)
ax.set_title(f"Component 4: {n_splits}-Fold Student-Grouped Cross-Validation Stability", fontsize=12, fontweight="bold", pad=12)
ax.set_ylim(0.90, 1.01)
ax.legend(loc="lower right")

plt.tight_layout()
plt.savefig(chart5_path, dpi=150)
plt.close()
print(f"[OK] Generated: {chart5_path}")

print("\n[COMPLETE] All Component 4 training and evaluation charts successfully generated!")
