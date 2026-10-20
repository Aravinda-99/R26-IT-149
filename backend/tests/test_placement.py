"""
Component 1 — Model A (Rasch / IRT placement) tests
====================================================
Exercises POST /api/adaptive/placement with five response patterns that
span the ability range, plus four malformed payloads.

Each pattern answers 10 items per level (30 total, matching the quiz bank)
and is described as "correct at beginner / intermediate / advanced".

Run from backend/:
    python -m pytest tests/test_placement.py -v
"""

import os
import sys

import pytest
from flask import Flask

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from routes.adaptive_routes import adaptive_bp          # noqa: E402
from services.placement_service import PlacementService  # noqa: E402

URL = '/api/adaptive/placement'


@pytest.fixture(scope='module')
def client():
    # Register only the adaptive blueprint — avoids create_app()'s user seeding.
    app = Flask(__name__)
    app.register_blueprint(adaptive_bp, url_prefix='/api/adaptive')
    app.testing = True
    return app.test_client()


def make_responses(n_beg, n_int, n_adv, per_level=10):
    """Build a response list with n_* correct answers at each level."""
    responses = []
    for level, k in (('beginner', n_beg), ('intermediate', n_int), ('advanced', n_adv)):
        responses += [
            {'id': f'{level}_{i}', 'level': level, 'correct': i < k}
            for i in range(per_level)
        ]
    return responses


# ── Valid response patterns ───────────────────────────────────────────
# (beg, int, adv) correct → expected theta (EAP), SE, level, difficulty
PATTERNS = [
    pytest.param((0, 0, 0),    -2.667, 0.533, 'Beginner',   'beginner',     id='all-wrong'),
    pytest.param((6, 2, 0),    -1.002, 0.396, 'Beginner',   'beginner',     id='beg-6-int-2-adv-0'),
    pytest.param((9, 5, 2),     0.137, 0.371, 'Developing', 'intermediate', id='beg-9-int-5-adv-2'),
    pytest.param((10, 10, 0),   0.700, 0.382,'Developing', 'intermediate', id='beg-10-int-10-adv-0'),
    pytest.param((10, 8, 5),    1.162, 0.405, 'Proficient', 'advanced',     id='beg-10-int-8-adv-5'),
    pytest.param((10, 10, 10),  2.667, 0.533, 'Proficient', 'advanced',     id='all-correct'),
]


@pytest.mark.parametrize('counts, theta, se, level, difficulty', PATTERNS)
def test_placement_patterns(client, counts, theta, se, level, difficulty):
    resp = client.post(URL, json={'responses': make_responses(*counts)})
    assert resp.status_code == 200

    body = resp.get_json()
    assert body['theta'] == pytest.approx(theta, abs=1e-3)
    assert body['se'] == pytest.approx(se, abs=1e-3)
    assert body['level'] == level
    assert body['difficulty'] == difficulty
    assert body['n_items'] == 30
    assert body['n_correct'] == sum(counts)
    assert body['by_level'] == {
        'beginner':     {'correct': counts[0], 'total': 10},
        'intermediate': {'correct': counts[1], 'total': 10},
        'advanced':     {'correct': counts[2], 'total': 10},
    }


@pytest.mark.parametrize('theta, level', [
    (-0.001, 'Beginner'), (0.0, 'Developing'),
    (0.999, 'Developing'), (1.0, 'Proficient'),
])
def test_rp50_cutoffs(theta, level):
    """Cut-offs sit at the intermediate (b=0) and advanced (b=1) item difficulties."""
    assert PlacementService.classify(theta) == level


def test_theta_increases_with_correct_answers():
    """More correct answers must never lower the ability estimate."""
    thetas = [PlacementService.estimate_theta(make_responses(k, k, k))[0]
              for k in range(11)]
    assert thetas == sorted(thetas)


def test_bare_list_accepted(client):
    resp = client.post(URL, json=make_responses(5, 5, 5))
    assert resp.status_code == 200


# ── Malformed payloads ────────────────────────────────────────────────
BAD_INPUTS = [
    pytest.param({'responses': []},
                 'responses must be a non-empty list',
                 id='empty'),
    pytest.param({'responses': [{'id': 1, 'level': 'expert', 'correct': True}]},
                 "responses[0].level must be one of ['beginner', 'intermediate', 'advanced']",
                 id='bad-level'),
    pytest.param({'responses': [{'id': 1, 'level': 'beginner'}]},
                 'responses[0] missing required field: correct',
                 id='missing-field'),
    pytest.param({'responses': [{'id': 1, 'level': 'beginner', 'correct': 'yes'}]},
                 'responses[0].correct must be a boolean',
                 id='correct-not-bool'),
]


@pytest.mark.parametrize('payload, message', BAD_INPUTS)
def test_placement_rejects_bad_input(client, payload, message):
    resp = client.post(URL, json=payload)
    assert resp.status_code == 400
    assert resp.get_json() == {'error': message}
