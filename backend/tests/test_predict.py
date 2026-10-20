"""
Component 1 — Model B (progression) /predict tests
===================================================
POST /api/adaptive/predict for a Level Check: Model B's action (Method A,
GB + tuned thresholds on accuracy + time-to-first-answer), the Safety
Validation Layer, the persistence baseline, the time floor, the
rapid-guessing / low-confidence flags, and the persistence fallback
when model_b.pkl is unavailable.

Run from backend/:
    python -m pytest tests/test_predict.py -v
"""

import os
import sys

import pytest
from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import services.adaptive_service as adaptive_service          # noqa: E402
from routes.adaptive_routes import adaptive_bp                  # noqa: E402
from services.adaptive_service import AdaptiveService           # noqa: E402

URL = '/api/adaptive/predict'


@pytest.fixture(scope='module')
def client():
    app = Flask(__name__)
    app.register_blueprint(adaptive_bp, url_prefix='/api/adaptive')
    app.testing = True
    return app.test_client()


def payload(accuracy, time_sec=30.0, level='intermediate', attempts=1.0, engagement=0.95):
    return {
        'accuracy': accuracy,
        'avg_time_sec': time_sec,
        'avg_attempts': attempts,
        'engagement_score': engagement,
        'current_difficulty': level,
        'topic_scores': {'variables': accuracy},
    }


def post(client, body):
    resp = client.post(URL, json=body)
    return resp.status_code, resp.get_json()


# ── Model B is loaded and the response is complete ───────────────────
def test_model_b_loaded():
    assert adaptive_service.model is not None
    assert list(adaptive_service.model.feature_names_in_) == ['accuracy', 'avg_time_sec']
    assert 'avg_time_sec' in adaptive_service.model.input_floors


def test_response_fields(client):
    status, body = post(client, payload(0.7))
    assert status == 200
    for key in ('action', 'next_difficulty', 'current', 'model_source', 'model_prediction',
                'confidence', 'low_confidence', 'probabilities', 'baseline_action',
                'was_overridden', 'validation_reason', 'avg_time_sec', 'avg_time_sec_used',
                'time_floor_sec', 'time_floor_applied', 'rapid_guessing'):
        assert key in body, key
    assert body['model_source'] == 'model_b'
    assert sum(body['probabilities'].values()) == pytest.approx(1.0, abs=1e-3)
    assert body['confidence'] == pytest.approx(body['probabilities'][body['model_prediction']] * 100, abs=0.1)
    assert body['low_confidence'] == (body['confidence'] < 40)


# ── Promote / maintain / demote and the level moving by one ──────────
@pytest.mark.parametrize('accuracy, level, action, next_level', [
    (0.9, 'intermediate', 'promote',  'advanced'),
    (0.7, 'intermediate', 'maintain', 'intermediate'),
    (0.2, 'intermediate', 'demote',   'beginner'),
    (1.0, 'advanced',     'promote',  'advanced'),   # already at the top
    (0.0, 'beginner',     'demote',   'beginner'),   # already at the bottom
])
def test_actions_and_next_level(client, accuracy, level, action, next_level):
    status, body = post(client, payload(accuracy, level=level))
    assert status == 200
    assert body['action'] == action
    assert body['current'] == level
    assert body['next_difficulty'] == next_level


@pytest.mark.parametrize('accuracy, baseline', [
    (0.85, 'promote'), (0.80, 'promote'), (0.79, 'maintain'),
    (0.40, 'maintain'), (0.39, 'demote'),
])
def test_baseline_action_is_persistence(client, accuracy, baseline):
    assert post(client, payload(accuracy))[1]['baseline_action'] == baseline


# ── Time floor and rapid guessing ────────────────────────────────────
def test_screenshot_case_is_not_promoted(client):
    """21/30-style 70% with 1.79 s answers was promoted by the old model.pkl."""
    status, body = post(client, payload(0.7, time_sec=1.79, attempts=1.0, engagement=1.0))
    assert status == 200
    assert body['action'] == 'maintain'
    assert body['rapid_guessing'] is True
    assert body['time_floor_applied'] is True
    assert body['avg_time_sec_used'] == pytest.approx(body['time_floor_sec'], abs=0.01)


def test_floor_not_applied_above_floor(client):
    body = post(client, payload(0.7, time_sec=30.0))[1]
    assert body['time_floor_applied'] is False
    assert body['avg_time_sec_used'] == 30.0
    assert body['rapid_guessing'] is False


def test_rapid_guessing_does_not_change_action(client):
    """Below the floor, 4.9 s (flagged) and 6.0 s (not flagged) feed the model the same input."""
    fast = post(client, payload(0.7, time_sec=4.9))[1]
    slower = post(client, payload(0.7, time_sec=6.0))[1]
    assert fast['rapid_guessing'] is True and slower['rapid_guessing'] is False
    assert fast['action'] == slower['action']
    assert fast['confidence'] == slower['confidence']


# ── Safety Validation Layer still bounds the model ───────────────────
@pytest.mark.parametrize('raw, accuracy, expected', [
    ('promote', 0.30, 'demote'),
    ('demote',  0.90, 'promote'),
    ('demote',  0.65, 'maintain'),   # combined-evidence guard (attempts 1, engagement 0.95)
    ('maintain', 0.65, 'maintain'),
])
def test_safety_layer(raw, accuracy, expected):
    action, overridden, _ = AdaptiveService._apply_safety_validation(raw, accuracy, 1.0, 0.95)
    assert action == expected
    assert overridden == (raw != expected)


# ── Fallback to persistence when model_b.pkl is unavailable ──────────
def test_persistence_fallback(client, monkeypatch):
    monkeypatch.setattr(adaptive_service, 'model', None)
    status, body = post(client, payload(0.5, level='advanced'))
    assert status == 200
    assert body['model_source'] == 'persistence_fallback'
    assert body['action'] == body['baseline_action'] == 'maintain'
    assert body['confidence'] is None
    assert body['low_confidence'] is False
    assert body['time_floor_applied'] is False


# ── Request validation ───────────────────────────────────────────────
@pytest.mark.parametrize('body, message', [
    ({k: v for k, v in payload(0.5).items() if k != 'avg_time_sec'}, 'Missing required field: avg_time_sec'),
    ({**payload(0.5), 'accuracy': 1.5}, 'accuracy must be between 0.0 and 1.0'),
    ({**payload(0.5), 'accuracy': 'high'}, 'accuracy must be a number'),
    ({**payload(0.5), 'avg_time_sec': -1}, 'avg_time_sec must be >= 0'),
    ({**payload(0.5), 'current_difficulty': 'expert'},
     "current_difficulty must be one of ['beginner', 'intermediate', 'advanced']"),
])
def test_predict_rejects_bad_input(client, body, message):
    assert post(client, body) == (400, {'error': message})


def test_predict_rejects_non_object(client):
    resp = client.post(URL, data='not json', content_type='application/json')
    assert resp.status_code == 400
