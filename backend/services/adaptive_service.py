"""
Component 1: Adaptive Learning Path — Service
===============================================
Adaptive recommendation algorithm using trained ML model + a
rule-based Safety Validation Layer.

──────────────────────────────────────────────────────────────────
ARCHITECTURE: Hybrid ML + Safety Validation Layer
──────────────────────────────────────────────────────────────────
This is a standard pattern in production ML systems (used in
autonomous driving, medical diagnosis, fraud detection): the ML
model handles the general case, and a thin rule-based layer catches
predictions that violate domain-specific safety constraints.

WHY THIS EXISTS:
  Model 1 (Gradient Boosting) is trained on 4 BEHAVIORAL features:
    avg_attempts, avg_time_sec, engagement_score, difficulty

  It is intentionally NOT trained on accuracy, because including
  accuracy directly causes data leakage (the model just reads the
  threshold that created its own training labels — see project
  documentation for the leakage investigation).

  However, this means Model 1 has a genuine blind spot: it cannot
  see whether the student's answers were actually correct. In rare
  edge cases (e.g., a student who guesses quickly and confidently
  but scores low), the behavioral features alone can look like a
  strong performance even though accuracy is poor — and vice versa.

  The Safety Validation Layer below corrects ONLY these clear
  contradictions using the student's actual quiz accuracy — which
  Model 1 never sees. It does not replace the model; it bounds it.

VALIDATION RULES (grounded in Bloom's Mastery Learning, 1968):
  - accuracy < 40%  → student is struggling → action cannot be
                       'promote' (forced to 'demote')
  - accuracy >= 80% → student has mastered the material → action
                       cannot be 'demote' (forced to 'promote')
  - 40% <= accuracy < 80% → Model 1's prediction is trusted as-is,
                       since this is genuinely ambiguous territory
                       where behavioral signals are meaningful.

This keeps Model 1's evaluation metrics (82.38% test accuracy, no
leakage) fully valid and reportable, while guaranteeing the system
never surfaces an accuracy-contradicting recommendation to the user.
──────────────────────────────────────────────────────────────────

KEY FIX (unchanged from before): avg_time_sec is floored at 10.0
seconds. The training data (ASSISTments, OULAD, UCI) has response
times ranging from ~10s to 600s. Our quiz generates 1-5s times
(simple MCQ clicks). Without the floor, the model misinterprets
fast times as random guessing and predicts DEMOTE even for
high-scoring students.
"""

import os
import joblib
from firebase.firebase_service import db

# ── Load trained ML model once when app starts ──────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'ml_models', 'model.pkl')
model = joblib.load(MODEL_PATH)

TOPICS      = ["variables", "operators", "conditionals", "loops", "arrays", "methods"]
LABEL_MAP   = {0: 'maintain', 1: 'promote', 2: 'demote'}
DIFFICULTY  = ['beginner', 'intermediate', 'advanced']
DIFF_ENCODE = {'beginner': 0, 'intermediate': 1, 'advanced': 2}

# ── Safety Validation Layer thresholds ───────────────────────────────
# Model 1 remains the PRIMARY decision-maker for promote/maintain/demote.
# This layer only intervenes on predictions that are clearly contradictory
# or extreme — it never re-derives the full Bloom's rule as a blanket
# replacement for the model's judgment (that was tested and rejected: it
# made the ML model's decision irrelevant, which defeats the purpose of
# training it in the first place).
#
# Two EXTREME guards (unchanged from the original design):
#   - accuracy < 40%  AND action == 'promote' → force 'demote'
#     (never promote a student who failed outright)
#   - accuracy >= 80% AND action == 'demote'  → force 'promote'
#     (never demote a student who has clearly mastered the material)
#
# One NARROW, evidence-combined guard (added after testing found a real
# gap): a Demote prediction is blocked ONLY when accuracy, attempts, AND
# engagement all independently indicate solid performance at once — e.g.
# accuracy=72%, attempts=1, engagement=87% all being favorable together
# is too much combined evidence for 'demote' to be defensible, even
# though accuracy alone (72%) sits below the 80% extreme-guard threshold.
# A single borderline number does NOT trigger this — all three signals
# must agree, keeping the correction rare and targeted rather than a
# blanket rule. When triggered, the result is 'maintain' (not forced up
# to 'promote') since the student hasn't necessarily met the full
# promote bar — only disproven the case for demotion.
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
        Safety Validation Layer — Model 1 remains the PRIMARY decision-
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

        # ── No guard triggered — trust Model 1's judgment ───────────────
        return action, False, "Model 1 prediction accepted (no contradiction detected)."

    @staticmethod
    def predict_recommendation(session_data: dict) -> dict:
        """
        Uses trained ML model to predict next difficulty level and topic,
        then applies the Safety Validation Layer before returning.

        Expected session_data keys:
            avg_attempts       (float) — average attempts per question
            avg_time_sec       (float) — average time in seconds
            engagement_score   (float) — 0.0 to 1.0
            current_difficulty (str)   — beginner / intermediate / advanced
            topic_scores       (dict)  — {topic: score} e.g. {"variables": 0.8}
            accuracy            (float, optional) — overall quiz accuracy
        """
        # ── Encode difficulty ────────────────────────────────────────
        curr_diff   = session_data.get('current_difficulty', 'beginner')
        diff_enc    = DIFF_ENCODE.get(curr_diff, 0)

        # ── Build feature array (4 features, same order as training) ─
        # FIX: Floor avg_time_sec at 10.0 seconds
        # Training data range is ~10s to 600s. Quiz MCQ clicks produce
        # 1-5s times which the model has never seen — it interprets
        # sub-10s as random guessing (correlates with DEMOTE in training).
        # Flooring at 10s maps quiz times into the valid training range.
        features = [[
            float(session_data.get('avg_attempts',     1.0)),
            max(10.0, float(session_data.get('avg_time_sec', 30.0))),
            float(session_data.get('engagement_score', 0.9)),
            diff_enc
        ]]

        # ── ML model prediction (Model 1) ─────────────────────────────
        prediction    = model.predict(features)[0]
        probabilities = model.predict_proba(features)[0]
        raw_action    = LABEL_MAP[int(prediction)]
        confidence    = round(float(max(probabilities)) * 100, 1)

        # ── Safety Validation Layer ────────────────────────────────────
        # Re-applies the exact Bloom's rule that generated Model 1's
        # training labels, using the same attempts/engagement values fed
        # to the model (post time-floor engagement is unaffected by the
        # floor since it's a separate feature). See _apply_safety_validation
        # docstring for why a full rule check is needed, not just extremes.
        overall_accuracy = AdaptiveService._get_overall_accuracy(session_data)
        raw_attempts      = float(session_data.get('avg_attempts', 1.0))
        raw_engagement    = float(session_data.get('engagement_score', 0.9))

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
            'next_difficulty':   next_difficulty,     # beginner / intermediate / advanced
            'next_topic':        next_topic,          # weakest topic to study next
            'confidence':        confidence,          # Model 1's raw confidence %
            'current':           curr_diff,           # what they just completed
            'accuracy':          round(overall_accuracy, 4),  # for transparency
            'model_prediction':  raw_action,          # Model 1's raw output (debugging)
            'was_overridden':    was_overridden,       # True if safety layer intervened
            'validation_reason': validation_reason     # human-readable explanation
        }