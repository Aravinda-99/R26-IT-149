"""
Component 4: Schema Mastery Service
===================================
Business logic and ML prediction pipeline for Schema Mastery (Component 4).
Loads the trained Random Forest / scikit-learn pipeline to predict student
mastery probability, mastery level, and recommended next action.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd

# Paths to ML artifacts
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "ml", "component4_schema_mastery", "models", "schema_mastery_pipeline.pkl")
META_PATH = os.path.join(BASE_DIR, "ml", "component4_schema_mastery", "models", "schema_mastery_model_metadata.json")

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

_model = None
_metadata = None


def load_model():
    """Loads the trained schema mastery ML pipeline model from disk."""
    global _model
    if _model is not None:
        return _model

    if os.path.exists(MODEL_PATH):
        try:
            _model = joblib.load(MODEL_PATH)
            print(f"[OK] Component 4 Schema Mastery model loaded from {MODEL_PATH}")
            return _model
        except Exception as e:
            print(f"[WARN] Failed to load Component 4 pipeline from {MODEL_PATH}: {e}")
    else:
        # Fallback check for relative paths
        alt_paths = [
            os.path.join("ml", "component4_schema_mastery", "models", "schema_mastery_pipeline.pkl"),
            os.path.join("ml", "schema_mastery_pipeline.pkl")
        ]
        for alt_path in alt_paths:
            if os.path.exists(alt_path):
                try:
                    _model = joblib.load(alt_path)
                    print(f"[OK] Component 4 Schema Mastery model loaded from {alt_path}")
                    return _model
                except Exception as e:
                    print(f"[WARN] Failed to load Component 4 pipeline from {alt_path}: {e}")

    return None


def load_metadata():
    """Loads metadata associated with the schema mastery model."""
    global _metadata
    if _metadata is not None:
        return _metadata

    target_path = META_PATH if os.path.exists(META_PATH) else os.path.join("ml", "component4_schema_mastery", "models", "schema_mastery_model_metadata.json")
    if os.path.exists(target_path):
        try:
            with open(target_path, "r") as f:
                _metadata = json.load(f)
                return _metadata
        except Exception as e:
            print(f"[WARN] Failed to load metadata from {target_path}: {e}")
    return {}


def normalize_score(val):
    """
    Normalizes a score value to a [0.0, 1.0] scale.
    Handles numeric, string percentages (e.g. '80%'), and values > 1.0 (e.g. 75 -> 0.75).
    """
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
    """
    Maps mastery probability to understanding level:
      >= 0.85 -> Strong Understanding
      >= 0.70 -> Good Progress
      >= 0.50 -> Needs More Practice
      < 0.50  -> Learn Again
    """
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
    """
    Maps understanding level to next action:
      'Strong Understanding' / 'Good Progress' -> DONE
      'Needs More Practice' / 'Learn Again'   -> LEARN_AGAIN
    """
    if level in ("Strong Understanding", "Good Progress"):
        return "DONE"
    return "LEARN_AGAIN"


def clean_input_data(data: dict) -> dict:
    """Sanitizes and extracts the 11 expected features for inference."""
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


def fallback_predict(data: dict) -> dict:
    """
    Heuristic rule-based fallback calculation when the ML model
    is unavailable or prediction fails.
    """
    if not isinstance(data, dict):
        data = {}

    post_test = normalize_score(data.get("post_test_score", 0.0))
    error_score = normalize_score(data.get("error_pattern_score", 0.5))
    pre_test = normalize_score(data.get("pre_test_score", 0.5))

    # Weighted fallback probability calculation
    prob = round(0.50 * post_test + 0.30 * error_score + 0.20 * pre_test, 4)
    level = probability_to_level(prob)
    action = level_to_action(level)

    return {
        "mastery_probability": prob,
        "mastery_level": level,
        "next_action": action,
        "model_used": "rule_based_fallback",
    }


def predict_schema_mastery(data: dict) -> dict:
    """
    Main prediction entry point for Schema Mastery.
    Uses trained ML pipeline to predict mastery probability, level, and next action.
    """
    if not isinstance(data, dict):
        return fallback_predict({})

    model = load_model()
    if model is None:
        return fallback_predict(data)

    try:
        cleaned = clean_input_data(data)
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
        print(f"[WARN] Error during schema mastery ML prediction: {e}")
        return fallback_predict(data)


class SchemaMasteryService:
    """Service wrapper for Schema Mastery predictions and utilities."""

    @staticmethod
    def predict(data: dict) -> dict:
        return predict_schema_mastery(data)

    @staticmethod
    def normalize_score(val) -> float:
        return normalize_score(val)

    @staticmethod
    def probability_to_level(prob: float) -> str:
        return probability_to_level(prob)

    @staticmethod
    def level_to_action(level: str) -> str:
        return level_to_action(level)


__all__ = [
    "load_model",
    "load_metadata",
    "normalize_score",
    "probability_to_level",
    "level_to_action",
    "clean_input_data",
    "fallback_predict",
    "predict_schema_mastery",
    "SchemaMasteryService",
    "FEATURE_COLUMNS",
    "MODEL_PATH",
    "META_PATH",
]