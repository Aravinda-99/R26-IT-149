"""
Gameplay Struggle Detector — Service
====================================
Uses an Isolation Forest anomaly-detection model to flag when a player's
in-round behaviour (attempts, time taken, misconception repeats, combo
breaks) looks anomalous compared to typical play — a proxy for "struggling".
"""

import os
import numpy as np
import joblib

# Path to the saved model + scaler
SCALER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_models", "behavioral_scaler.joblib"))
MODEL_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_models", "isolation_forest_model.joblib"))

# Order matters — must match the order the scaler was fit on.
FEATURE_ORDER = ["attempts_count", "time_taken_seconds", "misconception_repeat_count", "combo_breaks"]


class WellbeingService:
    _scaler = None
    _model = None

    @classmethod
    def _load_models(cls):
        """Loads the scaler and Isolation Forest model once."""
        if cls._scaler is None:
            if os.path.exists(SCALER_PATH):
                try:
                    cls._scaler = joblib.load(SCALER_PATH)
                except Exception as e:
                    print(f"CRITICAL ERROR loading behavioral scaler: {e}")
            else:
                print(f"Scaler file NOT found at {SCALER_PATH}")

        if cls._model is None:
            if os.path.exists(MODEL_PATH):
                try:
                    cls._model = joblib.load(MODEL_PATH)
                except Exception as e:
                    print(f"CRITICAL ERROR loading isolation forest model: {e}")
            else:
                print(f"Model file NOT found at {MODEL_PATH}")

        return cls._scaler, cls._model

    @classmethod
    def predict_struggle(cls, data):
        """
        Runs the 4 behavioural features through the scaler + Isolation Forest
        and returns a simple struggling/typical verdict.

        Expects JSON body:
        {
            "attempts_count": 3,
            "time_taken_seconds": 45,
            "misconception_repeat_count": 2,
            "combo_breaks": 1
        }
        """
        missing = [f for f in FEATURE_ORDER if f not in data]
        if missing:
            return {"error": f"Missing required fields: {', '.join(missing)}"}

        try:
            features = [float(data[f]) for f in FEATURE_ORDER]
        except (TypeError, ValueError):
            return {"error": "All fields must be numeric"}

        scaler, model = cls._load_models()
        if scaler is None or model is None:
            return {"error": "Struggle detection model not available on backend"}

        try:
            scaled = scaler.transform(np.array([features]))
            raw_prediction = model.predict(scaled)[0]
        except Exception as e:
            return {"error": f"Prediction failed: {str(e)}"}

        return {"prediction": "struggling" if raw_prediction == -1 else "typical"}
