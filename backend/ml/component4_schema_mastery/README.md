# Component 4: Schema Mastery Tracker / Post-Learning Understanding Validation

This directory contains the machine learning pipelines, dataset artifacts, inspection utilities, evaluation assets, test suites, and trained models for **Component 4 (Schema Mastery Tracker)** of the CodeQuest / R26-IT-149 research project.

---

## 📁 Directory Architecture

```
backend/
├── routes/
│   ├── schema_mastery_routes.py                       # Active Flask API route (POST /api/schema-mastery/predict)
│   └── mastery_routes.py                              # Mastery dashboard & diagnostic post-test routes
├── services/
│   ├── schema_mastery_service.py                      # Active primary ML prediction service
│   └── mastery_service.py                             # Mastery dashboard & diagnostic service
└── ml/
    └── component4_schema_mastery/                     # Isolated Component 4 ML directory
        ├── README.md                                  # Component 4 documentation (this file)
        ├── datasets/
        │   ├── raw/                                   # Original public / raw student interaction datasets
        │   │   ├── MainTable.csv
        │   │   ├── MainTable1.csv
        │   │   ├── CodeStates.csv
        │   │   ├── Subject.csv
        │   │   ├── DatasetMetadata.csv
        │   │   ├── Predict.csv
        │   │   ├── early.csv
        │   │   └── late.csv
        │   └── processed/                             # Processed & cleaned training datasets
        │       └── schema_mastery_dataset.csv         # Aggregated multi-factor sessions (24,032 records)
        ├── models/                                    # Serialized trained machine learning models
        │   ├── schema_mastery_pipeline.pkl            # Active production Random Forest pipeline model
        │   ├── schema_mastery_model_metadata.json     # 5-fold CV metrics and training metadata
        │   ├── schema_mastery_level_model.pkl         # Mastery level classifier artifact
        │   ├── schema_next_action_model.pkl           # Next action classifier artifact
        │   └── schema_preprocessor.pkl                # ColumnTransformer feature preprocessor
        ├── scripts/                                   # Preprocessing, training, and prediction scripts
        │   ├── inspect_raw_datasets.py                # Inspects column schemas & statistics of raw CSVs
        │   ├── preprocess_schema_dataset.py           # Preprocesses raw logs into schema_mastery_dataset.csv
        │   ├── train_schema_mastery_model.py          # Trains Random Forest pipeline with StratifiedGroupKFold
        │   ├── predict_schema_mastery.py              # Production CLI inference tester & sample runner
        │   └── archive/                               # Archived experimental/duplicate scripts
        │       ├── generate_schema_dataset.py
        │       ├── train_schema_mastery_pipeline.py
        │       └── train_schema_mastery_models.py
        ├── evaluation/                                # Evaluation charts, confusion matrices & analysis
        │   ├── confusion_matrices.png                 # Multi-class and binary confusion matrices
        │   ├── cv_stability_chart.png                 # 5-fold cross-validation stability chart
        │   ├── feature_importance.png                 # Random Forest Gini feature importance plot
        │   ├── model_comparison_chart.png             # Classifier benchmark comparison
        │   ├── per_class_f1_comparison.png            # Class-level F1 score breakdown
        │   └── final_data_details.ipynb               # Exploratory data analysis & evaluation notebook
        ├── tests/                                     # Component 4 automated test suites
        │   ├── test_component4_pipeline.py            # Unit test suite (pipeline, normalization, API routes)
        │   ├── test_schema_mastery_api.py             # Schema mastery prediction API test client
        │   └── test_predict.py                        # Endpoint connectivity test script
        ├── demos/                                     # Demonstration & presentation scripts
        │   └── demo_ml_predictions.py                 # Live demo script for student performance profiles
        └── legacy_rule_based/                         # Baseline formula/rule-based logic (kept for comparison)
            ├── README.md                              # Legacy documentation
            ├── mastery_calculator.py                  # Previous deterministic weighted formula calculator
            └── test_mastery_calculator.py             # Legacy calculator test suite
```

---

## 🚀 Execution & Training Workflow

All commands should be executed from the `backend/` root directory:

### 1. Inspect Raw Datasets
Examine data types, shapes, and null counts in `datasets/raw/`:
```bash
python ml/component4_schema_mastery/scripts/inspect_raw_datasets.py
```

### 2. Preprocess Raw Data into Training Dataset
Parse, aggregate, and normalize raw student logs into `datasets/processed/schema_mastery_dataset.csv`:
```bash
python ml/component4_schema_mastery/scripts/preprocess_schema_dataset.py
```

### 3. Train the Schema Mastery Model
Train the scikit-learn pipeline (Random Forest Classifier + ColumnTransformer) using 5-fold `StratifiedGroupKFold` grouped by student:
```bash
python ml/component4_schema_mastery/scripts/train_schema_mastery_model.py
```
Outputs saved:
- Model: `ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl`
- Metadata: `ml/component4_schema_mastery/models/schema_mastery_model_metadata.json`

### 4. Run Standalone Inference Test
Test sample learner inputs directly against the trained pipeline:
```bash
python ml/component4_schema_mastery/scripts/predict_schema_mastery.py
```

### 5. Run Automated Unit Tests
Verify model inference, probability calibration, fallback safety, and route status:
```bash
python -m unittest ml/component4_schema_mastery/tests/test_component4_pipeline.py
```

---

## 🌐 Active API & Service Integration

- **Active Blueprint / Route**: [`backend/routes/schema_mastery_routes.py`](file:///c:/Users/BRAVO/OneDrive/Documents/R26-IT-149/backend/routes/schema_mastery_routes.py)
- **Active Service**: [`backend/services/schema_mastery_service.py`](file:///c:/Users/BRAVO/OneDrive/Documents/R26-IT-149/backend/services/schema_mastery_service.py)
- **API Endpoint**: `POST /api/schema-mastery/predict`

### Example Request (JSON):
```json
{
  "concept_name": "Loops",
  "pre_test_score": 0.75,
  "attempt_count": 2,
  "time_taken_seconds": 210,
  "error_type": "LOOP_CONDITION_ERROR",
  "error_pattern_score": 0.80,
  "post_test_correct_count": 8,
  "post_test_nearly_correct_count": 1,
  "post_test_wrong_count": 1,
  "post_test_clearly_wrong_count": 0,
  "post_test_score": 0.85
}
```

### Example Response (JSON):
```json
{
  "mastery_probability": 0.8491,
  "mastery_level": "Good Progress",
  "next_action": "DONE",
  "model_used": "schema_mastery_pipeline"
}
```

---

## 🧪 PowerShell Testing Command

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/schema-mastery/predict" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"concept_name":"Loops","pre_test_score":0.75,"attempt_count":2,"time_taken_seconds":210,"error_type":"LOOP_CONDITION_ERROR","error_pattern_score":0.80,"post_test_correct_count":8,"post_test_nearly_correct_count":1,"post_test_wrong_count":1,"post_test_clearly_wrong_count":0,"post_test_score":0.85}'
```
