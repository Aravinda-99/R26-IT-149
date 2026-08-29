"""
Component 4: Schema Mastery ML Inference Module
=================================================
Loads the production Random Forest pipeline model from `models/schema_mastery_pipeline.pkl`
to predict schema understanding probability, mastery level, and recommended next action.

Usage:
    python ml/component4_schema_mastery/scripts/predict_schema_mastery.py
"""

import os
import json
import joblib
import pandas as pd

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.abspath(os.path.join(BASE_DIR, "..", "models"))
MODEL_PATH = os.path.join(MODELS_DIR, "schema_mastery_pipeline.pkl")
METADATA_PATH = os.path.join(MODELS_DIR, "schema_mastery_model_metadata.json")

FEATURE_COLUMNS = [
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

_pipeline_model = None
_metadata = None


def load_model():
    """Loads the trained schema mastery scikit-learn pipeline."""
    global _pipeline_model
    if _pipeline_model is not None:
        return _pipeline_model

    if os.path.exists(MODEL_PATH):
        try:
            _pipeline_model = joblib.load(MODEL_PATH)
            print(f"[OK] Loaded Schema Mastery Pipeline from: {MODEL_PATH}")
            return _pipeline_model
        except Exception as e:
            print(f"[WARN] Failed to load model from {MODEL_PATH}: {e}")
    else:
        # Fallback path search
        alt_paths = [
            os.path.abspath("ml/component4_schema_mastery/models/schema_mastery_pipeline.pkl"),
            os.path.abspath("ml/schema_mastery_pipeline.pkl"),
        ]
        for p in alt_paths:
            if os.path.exists(p):
                try:
                    _pipeline_model = joblib.load(p)
                    print(f"[OK] Loaded Schema Mastery Pipeline from: {p}")
                    return _pipeline_model
                except Exception as e:
                    print(f"[WARN] Failed to load model from {p}: {e}")

    return None


def normalize_score(val):
    """Normalizes score to [0.0, 1.0]."""
    if val is None:
        return 0.0
    if isinstance(val, str):
        val = val.strip().rstrip("%")
    try:
        num = float(val)
    except (ValueError, TypeError):
        return 0.0

    if num < 0.0:
        return 0.0
    if num > 1.0:
        num = num / 100.0
    return max(0.0, min(1.0, num))


def probability_to_level(prob: float) -> str:
    """Maps probability to human-readable mastery level."""
    try:
        p = float(prob)
    except (ValueError, TypeError):
        p = 0.0

    if p >= 0.85:
        return "Strong Understanding"
    elif p >= 0.70:
        return "Good Progress"
    elif p >= 0.50:
        return "Needs More Practice"
    else:
        return "Learn Again"


def level_to_action(level: str) -> str:
    """Maps mastery level to progression action."""
    if level in ("Strong Understanding", "Good Progress"):
        return "DONE"
    return "LEARN_AGAIN"


def _rule_based_fallback(data: dict) -> dict:
    """Fallback calculation if ML model cannot be loaded."""
    post_test = normalize_score(data.get("post_test_score", 0.0))
    error_score = normalize_score(data.get("error_pattern_score", 0.5))
    pre_test = normalize_score(data.get("pre_test_score", 0.5))

    prob = round(0.50 * post_test + 0.30 * error_score + 0.20 * pre_test, 4)
    level = probability_to_level(prob)
    action = level_to_action(level)

    return {
        "mastery_probability": prob,
        "mastery_level": level,
        "next_action": action,
        "model_used": "rule_based_fallback",
    }


def clean_input(data: dict) -> dict:
    """Extracts and sanitizes the 11 features required by the pipeline."""
    if not isinstance(data, dict):
        data = {}

    return {
        "concept_name": str(data.get("concept_name", "General Programming")),
        "pre_test_score": normalize_score(data.get("pre_test_score", 0.5)),
        "attempt_count": int(data.get("attempt_count", 1) or 1),
        "time_taken_seconds": float(data.get("time_taken_seconds", data.get("time_taken", 60.0)) or 60.0),
        "error_type": str(data.get("error_type", "UNKNOWN_ERROR")),
        "error_pattern_score": normalize_score(data.get("error_pattern_score", 0.5)),
        "post_test_correct_count": int(data.get("post_test_correct_count", 0) or 0),
        "post_test_nearly_correct_count": int(data.get("post_test_nearly_correct_count", 0) or 0),
        "post_test_wrong_count": int(data.get("post_test_wrong_count", 0) or 0),
        "post_test_clearly_wrong_count": int(data.get("post_test_clearly_wrong_count", 0) or 0),
        "post_test_score": normalize_score(data.get("post_test_score", 0.0)),
    }


def predict_mastery(data: dict) -> dict:
    """Predicts mastery level, probability, and next action for given learner data."""
    model = load_model()
    if model is None:
        return _rule_based_fallback(data)

    try:
        cleaned = clean_input(data)
        df_input = pd.DataFrame([cleaned])[FEATURE_COLUMNS]

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(df_input)[0]
            classes = list(model.classes_)
            pos_idx = classes.index(1) if 1 in classes else 1
            prob = float(probs[pos_idx])
        else:
            pred = model.predict(df_input)[0]
            prob = float(pred)

        prob = round(prob, 4)
        level = probability_to_level(prob)
        action = level_to_action(level)

        return {
            "mastery_probability": prob,
            "mastery_level": level,
            "next_action": action,
            "model_used": "schema_mastery_pipeline",
        }
    except Exception as e:
        print(f"[WARN] Error during inference: {e}")
        return _rule_based_fallback(data)


# Alias for consistency
predict_schema_mastery = predict_mastery


if __name__ == "__main__":
    print("=" * 70)
    print("  COMPONENT 4: SCHEMA MASTERY ML PREDICTION TEST")
    print("=" * 70)

    test_cases = [
        {
            "name": "High Performing Student (Loops)",
            "data": {
                "concept_name": "Loops",
                "pre_test_score": 0.85,
                "attempt_count": 1,
                "time_taken_seconds": 120,
                "error_type": "LOOP_CONDITION_ERROR",
                "error_pattern_score": 0.90,
                "post_test_correct_count": 9,
                "post_test_nearly_correct_count": 1,
                "post_test_wrong_count": 0,
                "post_test_clearly_wrong_count": 0,
                "post_test_score": 0.90,
            },
        },
        {
            "name": "Developing Student (Variables)",
            "data": {
                "concept_name": "Variables",
                "pre_test_score": 0.60,
                "attempt_count": 2,
                "time_taken_seconds": 210,
                "error_type": "TYPE_MISMATCH",
                "error_pattern_score": 0.70,
                "post_test_correct_count": 7,
                "post_test_nearly_correct_count": 1,
                "post_test_wrong_count": 1,
                "post_test_clearly_wrong_count": 1,
                "post_test_score": 0.75,
            },
        },
        {
            "name": "Struggling Student (Arrays)",
            "data": {
                "concept_name": "Arrays",
                "pre_test_score": 0.20,
                "attempt_count": 5,
                "time_taken_seconds": 550,
                "error_type": "INDEX_ERROR",
                "error_pattern_score": 0.20,
                "post_test_correct_count": 2,
                "post_test_nearly_correct_count": 0,
                "post_test_wrong_count": 5,
                "post_test_clearly_wrong_count": 3,
                "post_test_score": 0.20,
            },
        },
    ]

    for tc in test_cases:
        print(f"\nTest: {tc['name']}")
        result = predict_mastery(tc["data"])
        print(json.dumps(result, indent=2))

    print("\n" + "=" * 70)
