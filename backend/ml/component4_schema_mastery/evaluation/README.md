# Component 4: Schema Mastery ML Evaluation & Benchmark Artifacts

This directory contains evaluation charts, confusion matrices, feature importance plots, cross-validation stability diagrams, and benchmark artifacts for **Component 4 (Schema Mastery Tracker / Post-Learning Understanding Validation)**.

---

## 📊 Confirmed Component 4 Evaluation Charts

All active charts in this directory were generated directly by:
- **Generating Script**: [`ml/component4_schema_mastery/scripts/train_schema_mastery_model.py`](file:///c:/Users/BRAVO/OneDrive/Documents/R26-IT-149/backend/ml/component4_schema_mastery/scripts/train_schema_mastery_model.py)
- **Dataset Used**: [`ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv`](file:///c:/Users/BRAVO/OneDrive/Documents/R26-IT-149/backend/ml/component4_schema_mastery/datasets/processed/schema_mastery_dataset.csv) (24,032 student-problem sessions across 506 unique students)
- **Primary Model**: [`ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl`](file:///c:/Users/BRAVO/OneDrive/Documents/R26-IT-149/backend/ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl) (Random Forest Classifier + ColumnTransformer Pipeline)
- **Validation Methodology**: 5-Fold `StratifiedGroupKFold` grouped strictly by `student_id` to prevent data leakage across student sessions.
- **Status**: **CONFIRMED COMPONENT 4 ARTIFACTS**

---

### Chart Descriptions & Metric Interpretations

| File Name | Chart Description | Metric / Clinical Insight | Status |
|---|---|---|---|
| **`model_comparison_chart.png`** | Compares Rule-Based Baseline vs. Logistic Regression vs. Random Forest across 5 evaluation metrics (Accuracy, Balanced Accuracy, Macro F1, Macro Precision, Macro Recall). | Shows the Random Forest ML pipeline achieving **98.79% Balanced Accuracy** and **98.04% Macro F1**, outperforming the rule-based baseline (53.58% Balanced Accuracy). | **Confirmed Component 4** |
| **`confusion_matrices.png`** | Out-of-fold confusion matrices for the Rule-Based Baseline, Logistic Regression, and Random Forest models across Class 0 (*Needs Practice / Learn Again*) and Class 1 (*Mastered / Done*). | Validates low false positive and false negative rates for learner mastery classification under student-grouped cross-validation. | **Confirmed Component 4** |
| **`per_class_f1_comparison.png`** | Compares per-class F1 performance across models for both Class 0 (*Needs Practice*) and Class 1 (*Mastered*). | Highlights how ML models maintain high classification performance even on minority class distributions compared to deterministic thresholds. | **Confirmed Component 4** |
| **`feature_importance.png`** | Top feature importances extracted from the fitted Random Forest classifier (Gini impurity reduction) across one-hot encoded and normalized numeric features. | Highlights key predictive signals: `post_test_score`, `error_pattern_score`, `time_taken_seconds`, `attempt_count`, and `pre_test_score`. | **Confirmed Component 4** |
| **`cv_stability_chart.png`** | Fold-by-fold performance tracking (Folds 1–5) for Macro F1 and Balanced Accuracy. | Confirms model generalization stability across independent student folds without overfitting (standard deviation < 0.003). | **Confirmed Component 4** |

---

## 🗄️ Archived / Unverified Files (`old_or_unverified/`)

The directory `old_or_unverified/` contains legacy charts and a notebook (`final_data_details.ipynb`) that were previously located in the backend root:
- **Origin**: Generated using `data/final_dataset_ready.csv` (94,818 rows, features: `avg_attempts`, `avg_time_sec`, `engagement_score`, `difficulty`, targets: `Maintain`, `Promote`, `Demote`).
- **Component Affiliation**: Belonged to **Component 1 (Adaptive Learning)**.
- **Status**: **UNVERIFIED FOR COMPONENT 4 / MOVED TO ARCHIVE**. Preserved safely for historical reference without polluting Component 4 artifacts.

---

## 🔄 Command to Regenerate Component 4 Evaluation Charts

From the `backend/` root directory:
```bash
python ml/component4_schema_mastery/scripts/train_schema_mastery_model.py
```
This single command re-evaluates the dataset via 5-fold `StratifiedGroupKFold`, serializes the trained model and metadata, and exports all 5 updated charts directly into this directory.
