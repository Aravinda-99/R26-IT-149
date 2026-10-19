"""
Component 1 — Model B (progression): Method A wrapper
======================================================
Unweighted GradientBoostingClassifier + per-class multipliers on its
predicted probabilities. The predicted action is

    argmax_c ( w_c * P(c | x) )        with w_maintain = 1

The multipliers are tuned on out-of-fold probabilities to maximise
macro-F1 (see ml/fit_final_progression_model.py). They shift decisions
toward the rarer classes (mainly demote) without retraining the model.

INPUT FLOORS: each feature in `input_floors` is raised to its floor before
prediction (and was raised the same way in training). avg_time_sec is
floored at the training data's 5th percentile, because the model has
almost no training rows below it and extrapolates badly there.

Pickled into ml_models/model_b.pkl. Kept in this module (not in the
training script) so the pickle loads from the Flask app.
"""

import numpy as np
import pandas as pd


class ThresholdedGBClassifier:

    def __init__(self, model, class_weights: dict, input_floors: dict | None = None):
        self.model = model
        self.class_weights = {str(k): float(v) for k, v in class_weights.items()}
        self.input_floors = {str(k): float(v) for k, v in (input_floors or {}).items()}

    @property
    def classes_(self):
        return self.model.classes_

    @property
    def feature_names_in_(self):
        return self.model.feature_names_in_

    def apply_floors(self, X) -> tuple:
        """Return (floored DataFrame, {feature: bool array — floor applied})."""
        if isinstance(X, pd.DataFrame):
            X = X[list(self.feature_names_in_)].astype(float)
        else:
            X = pd.DataFrame(np.asarray(X, dtype=float), columns=list(self.feature_names_in_))
        applied = {}
        for feature, floor in self.input_floors.items():
            applied[feature] = (X[feature] < floor).to_numpy()
            X[feature] = np.maximum(X[feature], floor)
        return X, applied

    def predict_proba(self, X):
        """Raw GB probabilities, columns in classes_ order (multipliers NOT applied)."""
        return self.model.predict_proba(self.apply_floors(X)[0])

    def predict(self, X):
        w = np.array([self.class_weights[c] for c in self.classes_])
        return self.classes_[np.argmax(self.predict_proba(X) * w, axis=1)]
