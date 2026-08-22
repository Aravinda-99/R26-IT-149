# Component 4: Legacy Rule-Based / Formula Approach

These files contain the previous rule-based/formula approach for Schema Mastery calculation.
They are kept only for baseline comparison for research evaluation and fallback, not as the main prediction method.

---

## 📁 Files Included

- **`mastery_calculator.py`**: The previous deterministic weighted formula and heuristic overrides module.
- **`test_mastery_calculator.py`**: Unit test suite for the legacy formula calculator.

---

## 🔬 Current Production System

The primary Component 4 prediction flow is now powered by the trained machine learning pipeline:
- **ML Model**: `ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl`
- **Main Service**: `services/schema_mastery_service.py`
- **API Endpoint**: `POST /api/schema-mastery/predict`
