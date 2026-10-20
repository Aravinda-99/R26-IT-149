#Component 1: Adaptive Learning Path — Service


import os
import joblib
import pandas as pd
from firebase.firebase_service import db

# ── Load Model B once when app starts (persistence rule if missing) ──
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'model_b.pkl')
try:
    model = joblib.load(MODEL_PATH)       # models.progression_model.ThresholdedGBClassifier
except Exception as e:                    # missing file or failed unpickle
    print(f"[WARN] Model B not loaded ({e}) — using persistence rule for progression.")
    model = None

TOPICS      = ["variables", "operators", "conditionals", "loops", "arrays", "methods"]
DIFFICULTY  = ['beginner', 'intermediate', 'advanced']

# Label thresholds — the same ones that generated Model B's training labels
PROMOTE_MIN = 0.80
DEMOTE_MAX  = 0.40

RAPID_GUESSING_SEC = 5.0    # mean first-answer time below this → flag (action unchanged)
LOW_CONFIDENCE     = 0.40   # probability of the chosen action below this → flag


PROMOTE_ACCURACY_MIN   = 0.80   # extreme guard: at/above this, cannot demote
DEMOTE_ACCURACY_MAX    = 0.40   # extreme guard: below this, cannot promote

# Narrow combined-evidence guard (all three must hold together)
DEMOTE_BLOCK_ACCURACY_MIN   = 0.60   # clearly passing, not just "not failing"
DEMOTE_BLOCK_ATTEMPTS_MAX   = 1.5    # efficient — matches original Promote bar
DEMOTE_BLOCK_ENGAGEMENT_MIN = 0.85   # matches original Demote-safe threshold



class AdaptiveService:

    @staticmethod
    def get_recommendation(user_id):
        """TODO: Analyze learner data and return next activity."""
        return {
            "user_id":           user_id,
            "recommended_topic": "variables",
            "difficulty":        "easy",
            "activity_type":     "lesson",
            "reason":            "Placeholder — implement adaptive logic"
        }

    @staticmethod
    def update_progress(data):
        """TODO: Store learner progress in Firestore."""
        return {"message": "Progress updated (placeholder)"}

    @staticmethod
    def get_learning_path(user_id):
        """TODO: Build personalized learning path."""
        path = [
            {
                "id":     t,
                "name":   t.replace("_", " ").title(),
                "order":  i + 1,
                "mastery": 0,
                "status": "locked"
            }
            for i, t in enumerate(TOPICS)
        ]
        path[0]["status"] = "started"
        return {"user_id": user_id, "learning_path": path}

    @staticmethod
    def _get_overall_accuracy(session_data: dict) -> float:
        """
        Calculate the student's real overall accuracy for this session.

        Prefers an explicit 'accuracy' field if the frontend sends one.
        Otherwise derives it from topic_scores (average of per-topic
        accuracy ratios), which is always available since it comes
        directly from the quiz results.
        """
        if 'accuracy' in session_data:
            return float(session_data['accuracy'])

        topic_scores = session_data.get('topic_scores', {})
        if topic_scores:
            values = list(topic_scores.values())
            return sum(values) / len(values)

        return 0.5  # neutral fallback if no data available at all

    @staticmethod
    def _apply_safety_validation(action: str, accuracy: float,
                                  attempts: float, engagement: float) -> tuple:
        """
        Safety Validation Layer — Model B remains the PRIMARY decision-
        maker. This function only overrides predictions that are clearly
        contradictory or extreme; it does NOT re-derive the full Bloom's
        rule as a blanket replacement for the model's judgment (that
        approach was tested and rejected — it made Model 1's prediction
        irrelevant in every case, defeating the purpose of training it).

        Returns (final_action, was_overridden, reason).

        THREE GUARDS, IN ORDER:

        1. Extreme-low guard: accuracy < 40% and action == 'promote'
           → never promote a student who failed outright.

        2. Extreme-high guard: accuracy >= 80% and action == 'demote'
           → never demote a student who has clearly mastered the material.

        3. Combined-evidence guard (narrow, added after testing found a
           real gap): a 'demote' prediction is blocked ONLY when
           accuracy, attempts, AND engagement ALL independently indicate
           solid performance at once (accuracy >= 60%, attempts <= 1.5,
           engagement >= 85%). Example: accuracy=72%, attempts=1,
           engagement=87.4% — Model 1 predicted 'demote' at 97.9%
           confidence here, which is indefensible given how much
           favorable evidence exists together. A single borderline
           number does NOT trigger this guard; all three must agree.
           The result is bumped to 'maintain' — NOT forced up to
           'promote' — since disproving demotion is not the same as
           proving the student is ready to advance.

        Everywhere else (including cases like accuracy=76% with a
        'promote' prediction), Model 1's raw prediction is trusted and
        returned unchanged — it is not "clearly contradictory," just a
        judgment call in ambiguous territory that ML is meant to make.
        """
        # ── Guard 1: extreme-low accuracy blocks Promote ────────────────
        if accuracy < DEMOTE_ACCURACY_MAX and action == 'promote':
            return 'demote', True, (
                f"Model predicted 'promote' but accuracy ({accuracy*100:.0f}%) "
                f"is below the {DEMOTE_ACCURACY_MAX*100:.0f}% floor — "
                f"overridden to 'demote'."
            )

        # ── Guard 2: extreme-high accuracy blocks Demote ────────────────
        if accuracy >= PROMOTE_ACCURACY_MIN and action == 'demote':
            return 'promote', True, (
                f"Model predicted 'demote' but accuracy ({accuracy*100:.0f}%) "
                f"meets the {PROMOTE_ACCURACY_MIN*100:.0f}% mastery threshold — "
                f"overridden to 'promote'."
            )

        # ── Guard 3: combined evidence blocks an indefensible Demote ────
        if (action == 'demote' and
                accuracy   >= DEMOTE_BLOCK_ACCURACY_MIN and
                attempts   <= DEMOTE_BLOCK_ATTEMPTS_MAX and
                engagement >= DEMOTE_BLOCK_ENGAGEMENT_MIN):
            return 'maintain', True, (
                f"Model predicted 'demote' but accuracy ({accuracy*100:.0f}%), "
                f"attempts ({attempts:.1f}), and engagement ({engagement*100:.0f}%) "
                f"together show solid performance — overridden to 'maintain'."
            )

        # ── No guard triggered — trust Model B's judgment ───────────────
        return action, False, "Model prediction accepted (no contradiction detected)."

    @staticmethod
    def _persistence_action(accuracy: float) -> str:
        """Baseline: label thresholds applied to the CURRENT accuracy."""
        if accuracy >= PROMOTE_MIN:
            return 'promote'
        if accuracy < DEMOTE_MAX:
            return 'demote'
        return 'maintain'

    @staticmethod
    def predict_recommendation(session_data: dict) -> dict:
        """
        Level Check progression: Model B decides promote / maintain /
        demote, the Safety Validation Layer bounds it, and the current
        level moves by one.

        Expected session_data keys:
            accuracy           (float, optional) — Level Check accuracy;
                                derived from topic_scores if absent
            avg_time_sec       (float) — mean time to FIRST answer (s)
            avg_attempts       (float) — safety layer only (not a model feature)
            engagement_score   (float) — safety layer only
            current_difficulty (str)   — beginner / intermediate / advanced
            topic_scores       (dict)  — {topic: score} e.g. {"variables": 0.8}
        """
        curr_diff        = session_data.get('current_difficulty', 'beginner')
        overall_accuracy = AdaptiveService._get_overall_accuracy(session_data)
        raw_time         = float(session_data.get('avg_time_sec', 30.0))
        raw_attempts     = float(session_data.get('avg_attempts', 1.0))
        raw_engagement   = float(session_data.get('engagement_score', 0.9))

        baseline_action = AdaptiveService._persistence_action(overall_accuracy)

        # ── Model B prediction (persistence rule if the model is missing) ─
        if model is not None:
            inputs = {'accuracy': overall_accuracy, 'avg_time_sec': raw_time,
                      'avg_attempts': raw_attempts}
            X = pd.DataFrame([[inputs[f] for f in model.feature_names_in_]],
                             columns=list(model.feature_names_in_))
            X_used, floor_flags = model.apply_floors(X)

            raw_action    = str(model.predict(X)[0])
            proba         = model.predict_proba(X)[0]
            probabilities = {str(c): round(float(p), 4) for c, p in zip(model.classes_, proba)}
            p_chosen      = probabilities[raw_action]
            model_source  = 'model_b'
            time_floor    = model.input_floors.get('avg_time_sec')
            floor_applied = bool(floor_flags.get('avg_time_sec', [False])[0])
            time_used     = float(X_used['avg_time_sec'].iloc[0]) if 'avg_time_sec' in X_used else raw_time
        else:
            raw_action    = baseline_action
            probabilities = None
            p_chosen      = None
            model_source  = 'persistence_fallback'
            time_floor    = None
            floor_applied = False
            time_used     = raw_time

        # ── Safety Validation Layer (guardrail on Model B's action) ─────
        action, was_overridden, validation_reason = AdaptiveService._apply_safety_validation(
            raw_action, overall_accuracy, raw_attempts, raw_engagement
        )

        # ── Calculate next difficulty (using FINAL action) ─────────────
        curr_idx = DIFFICULTY.index(curr_diff) if curr_diff in DIFFICULTY else 0
        if action == 'promote':
            next_difficulty = DIFFICULTY[min(curr_idx + 1, 2)]
        elif action == 'demote':
            next_difficulty = DIFFICULTY[max(curr_idx - 1, 0)]
        else:
            next_difficulty = curr_diff

        # ── Find weakest topic to recommend next ───────────────────────
        topic_scores = session_data.get('topic_scores', {})
        if topic_scores:
            # Check if all topics are mastered (>= 90%)
            all_mastered = all(v >= 0.9 for v in topic_scores.values())
            if all_mastered:
                next_topic = 'all_mastered'
            else:
                next_topic = min(topic_scores, key=topic_scores.get)
        else:
            next_topic = 'variables'

        return {
            'action':            action,             # FINAL action (post-validation)
            'next_difficulty':   next_difficulty,     # current level +/- 1
            'next_topic':        next_topic,          # weakest topic to study next
            'current':           curr_diff,           # level the Level Check was taken at
            'accuracy':          round(overall_accuracy, 4),
            'model_source':      model_source,        # 'model_b' or 'persistence_fallback'
            'model_prediction':  raw_action,          # Model B's action before the safety layer
            # Raw model probability of model_prediction, as % (None on fallback)
            'confidence':        round(p_chosen * 100, 1) if p_chosen is not None else None,
            'low_confidence':    p_chosen is not None and p_chosen < LOW_CONFIDENCE,
            'probabilities':     probabilities,
            'baseline_action':   baseline_action,     # persistence rule, for transparency
            'was_overridden':    was_overridden,       # True if safety layer intervened
            'validation_reason': validation_reason,
            'avg_time_sec':      round(raw_time, 2),   # as received (first-answer mean)
            'avg_time_sec_used': round(time_used, 2),  # after the floor
            'time_floor_sec':    round(time_floor, 2) if time_floor is not None else None,
            'time_floor_applied': floor_applied,
            'rapid_guessing':    raw_time < RAPID_GUESSING_SEC,  # flag only, action unchanged
        }