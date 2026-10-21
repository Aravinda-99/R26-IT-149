"""
Component 1: Adaptive Learning Path — Placement Service (Model A)


    P(correct | theta, b) = 1 / (1 + exp(-(theta - b)))


The cut-offs are therefore read directly from ITEM_DIFFICULTY:
    theta <  0.0        → Beginner    → beginner difficulty
    0.0 <= theta < 1.0  → Developing  → intermediate difficulty
    theta >= 1.0        → Proficient  → advanced difficulty

"""

import numpy as np

# ── Expert-assigned item difficulties (Rasch b parameter) ────────────
ITEM_DIFFICULTY = {
    'beginner':     -1.0,
    'intermediate':  0.0,
    'advanced':      1.0,
}

# ── EAP grid and prior ───────────────────────────────────────────────
THETA_GRID = np.linspace(-4.0, 4.0, 161)            # step 0.05
PRIOR      = np.exp(-0.5 * THETA_GRID ** 2)           # N(0, 1), unnormalised
PRIOR      = PRIOR / PRIOR.sum()

# ── Level cut-offs on theta (RP50: P(correct) = 0.5 when theta = b) ──
DEVELOPING_MIN = ITEM_DIFFICULTY['intermediate']   # 0.0
PROFICIENT_MIN = ITEM_DIFFICULTY['advanced']       # 1.0

LEVEL_TO_DIFFICULTY = {
    'Beginner':   'beginner',
    'Developing': 'intermediate',
    'Proficient': 'advanced',
}


class PlacementService:

    @staticmethod
    def validate_responses(responses) -> str | None:
        """Return an error message if the payload is invalid, else None."""
        if not isinstance(responses, list) or len(responses) == 0:
            return 'responses must be a non-empty list'

        for i, r in enumerate(responses):
            if not isinstance(r, dict):
                return f'responses[{i}] must be an object'
            for field in ('id', 'level', 'correct'):
                if field not in r:
                    return f'responses[{i}] missing required field: {field}'
            if r['level'] not in ITEM_DIFFICULTY:
                return (f'responses[{i}].level must be one of '
                        f'{list(ITEM_DIFFICULTY)}')
            if not isinstance(r['correct'], bool):
                return f'responses[{i}].correct must be a boolean'
        return None

    @staticmethod
    def estimate_theta(responses: list) -> tuple:
        """
        EAP estimate of ability under the Rasch model.
        Returns (theta, standard_error).
        """
        b = np.array([ITEM_DIFFICULTY[r['level']] for r in responses])
        u = np.array([1.0 if r['correct'] else 0.0 for r in responses])

        # P[q, k] = P(correct on item k | theta = grid[q])
        p = 1.0 / (1.0 + np.exp(-(THETA_GRID[:, None] - b[None, :])))

        # Log-likelihood per grid point (log-space for numerical stability)
        log_lik = (u * np.log(p) + (1.0 - u) * np.log(1.0 - p)).sum(axis=1)
        log_post = log_lik + np.log(PRIOR)
        post = np.exp(log_post - log_post.max())
        post = post / post.sum()

        theta = float((THETA_GRID * post).sum())
        se    = float(np.sqrt(((THETA_GRID - theta) ** 2 * post).sum()))
        return theta, se

    @staticmethod
    def classify(theta: float) -> str:
        if theta >= PROFICIENT_MIN:
            return 'Proficient'
        if theta >= DEVELOPING_MIN:
            return 'Developing'
        return 'Beginner'

    @staticmethod
    def place(responses: list) -> dict:
        """Score a placement quiz and return the student's current level."""
        theta, se = PlacementService.estimate_theta(responses)
        level     = PlacementService.classify(theta)

        # Per-level raw accuracy — for transparency on the result card
        by_level = {}
        for lvl in ITEM_DIFFICULTY:
            items = [r for r in responses if r['level'] == lvl]
            if items:
                by_level[lvl] = {
                    'correct': sum(1 for r in items if r['correct']),
                    'total':   len(items),
                }

        n_correct = sum(1 for r in responses if r['correct'])

        return {
            'theta':      round(theta, 3),
            'se':         round(se, 3),
            'level':      level,
            'difficulty': LEVEL_TO_DIFFICULTY[level],
            'n_items':    len(responses),
            'n_correct':  n_correct,
            'accuracy':   round(n_correct / len(responses), 4),
            'by_level':   by_level,
            'method':     'Rasch EAP, N(0,1) prior, expert-assigned item difficulty',
        }
