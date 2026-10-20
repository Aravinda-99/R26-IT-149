"""Regressions for the deployed time-excluded pipeline; no database writes."""
import os
import sys
import unittest
from unittest.mock import patch

import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../../..")))
from services import schema_mastery_service as service
from ml.component4_schema_mastery.inference_features import scale_answer_counts, MODEL_VERSION


def sample(**changes):
    return dict({
        "concept_name": "Methods", "pre_test_score": .57, "attempt_count": 1,
        "time_taken_seconds": 437, "error_type": "METHOD_RETURN_ISSUE",
        "error_pattern_score": .68, "post_test_correct_count": 14,
        "post_test_nearly_correct_count": 1, "post_test_wrong_count": 0,
        "post_test_clearly_wrong_count": 0, "post_test_score": .9667,
    }, **changes)


class TimingModelTests(unittest.TestCase):
    def test_reported_case_runs_actual_ml_without_score_override(self):
        result = service.predict_schema_mastery(sample())
        self.assertEqual(result["model_version"], MODEL_VERSION)
        self.assertEqual(result["model_name"], "LogisticRegression")
        self.assertEqual(result["model_used"], "schema_mastery_pipeline")
        self.assertEqual(result["next_action"], "DONE")
        model = service.load_model()
        direct = model.predict_proba(pd.DataFrame([service.clean_input_data(sample())]))[0, list(model.classes_).index(1)]
        self.assertEqual(result["mastery_probability"], round(float(direct), 4))

    def test_elapsed_time_cannot_change_prediction(self):
        results = [service.predict_schema_mastery(sample(time_taken_seconds=t))
                   for t in (0, 60, 120, 240, 437, 900, 7200)]
        self.assertTrue(all(result == results[0] for result in results))

    def test_prediction_route_uses_active_pipeline(self):
        from flask import Flask
        from routes.schema_mastery_routes import schema_mastery_bp
        app = Flask(__name__)
        app.register_blueprint(schema_mastery_bp, url_prefix="/api/schema-mastery")
        response = app.test_client().post("/api/schema-mastery/predict", json=sample())
        self.assertEqual(response.status_code, 200)
        result = response.get_json()
        self.assertEqual(result["next_action"], "DONE")
        self.assertEqual(result["model_version"], MODEL_VERSION)

    def test_equivalent_answer_proportions_have_identical_predictions(self):
        results = [service.predict_schema_mastery(sample(
            post_test_correct_count=8*k, post_test_nearly_correct_count=2*k,
            post_test_score=.9,
        )) for k in (1, 1.5, 3)]
        self.assertTrue(all(result == results[0] for result in results))

    def test_feature_scaling_preserves_original_data(self):
        data = pd.DataFrame([sample()])
        scaled = scale_answer_counts(data)
        self.assertEqual(data.iloc[0].post_test_correct_count, 14)
        self.assertAlmostEqual(scaled.iloc[0].post_test_correct_count, 14*10/15)
        self.assertEqual(scaled.iloc[0].time_taken_seconds, 437)

    def test_weak_answers_are_not_forced_to_done(self):
        result = service.predict_schema_mastery(sample(
            pre_test_score=.2, error_pattern_score=.3, attempt_count=3,
            post_test_correct_count=2, post_test_nearly_correct_count=0,
            post_test_wrong_count=8, post_test_clearly_wrong_count=5,
            post_test_score=2/15,
        ))
        self.assertEqual(result["model_used"], "schema_mastery_pipeline")
        self.assertEqual(result["next_action"], "LEARN_AGAIN")

    def test_unavailable_model_uses_existing_explicit_fallback(self):
        with patch.object(service, "load_model", return_value=None):
            result = service.predict_schema_mastery(sample())
        self.assertEqual(result["model_used"], "rule_based_fallback")

    def test_original_dataset_has_not_been_relabelled(self):
        import hashlib
        from pathlib import Path
        path = Path(__file__).resolve().parents[1] / "datasets/processed/schema_mastery_dataset.csv"
        metadata = service.load_metadata()
        self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), metadata["dataset_sha256"])
        self.assertFalse(metadata["source_labels_recomputed"])
        frame = pd.read_csv(path)
        self.assertEqual(frame.future_success.value_counts().to_dict(), {1: 18044, 0: 5988})


if __name__ == "__main__":
    unittest.main()
