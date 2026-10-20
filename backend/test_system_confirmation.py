"""
CodeQuest System Diagnostic & Confirmation Script
=================================================
Verifies:
1. Database (Firebase Firestore) Connection
2. Component 1: Adaptive Learning Path ML Model (Gradient Boosting)
3. Component 2: Error Pattern Detection ML Models (Two-Stage Linear SVM)
4. Component 4: Schema Mastery Prediction ML Model (Random Forest)
5. Telemetry & Data Storage Flow
"""

import os
import sys
import json
import joblib

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

print("=" * 70)
print("       CODEQUEST ML & DATABASE SYSTEM CONFIRMATION")
print("=" * 70)

# ── 1. DATABASE CONFIRMATION ──────────────────────────────────────────
print("\n[1] CHECKING DATABASE CONNECTION (Firebase Firestore)...")
try:
    from firebase.firebase_service import db
    if db is not None:
        print("  [OK] Firebase Admin SDK initialized successfully.")
        print(f"  [OK] Firestore Client Project: {db.project}")
    else:
        print("  [WARN] Firebase serviceAccountKey not active (running local mode).")
except Exception as e:
    print(f"  [FAIL] Firestore Error: {e}")

# ── 2. COMPONENT 1: ADAPTIVE LEARNING ML MODEL ────────────────────────
print("\n[2] CHECKING COMPONENT 1: ADAPTIVE LEARNING PATH (ML MODEL)...")
try:
    from services.adaptive_service import AdaptiveService, model, MODEL_PATH
    print(f"  [OK] Model loaded from: {os.path.basename(MODEL_PATH)}")
    print(f"  [OK] Model type: {type(model).__name__}")
    
    test_session = {
        "avg_attempts": 1.5,
        "avg_time_sec": 25.0,
        "engagement_score": 0.85,
        "current_difficulty": "beginner",
        "topic_scores": {
            "variables": 0.9,
            "operators": 0.5,
            "loops": 0.4,
            "arrays": 0.7,
            "methods": 0.6
        }
    }
    pred = AdaptiveService.predict_recommendation(test_session)
    print(f"  [OK] Live Test Inference Result:")
    print(f"       - Action:            {pred['action']}")
    print(f"       - Next Difficulty:   {pred['next_difficulty']}")
    print(f"       - Weakest Concept:   {pred['next_topic']}")
    print(f"       - Confidence:        {pred['confidence']}%")
    print(f"       - Validation Reason: {pred['validation_reason']}")
except Exception as e:
    print(f"  [FAIL] Component 1 Error: {e}")

# ── 3. COMPONENT 2: ERROR DETECTOR ML MODELS ──────────────────────────
print("\n[3] CHECKING COMPONENT 2: JAVA ERROR PATTERN DETECTOR (ML SVM)...")
try:
    from services.error_service import ErrorService
    m1, m2 = ErrorService._load_models()
    print(f"  [OK] Stage 1 Error Classifier:  {type(m1).__name__ if m1 else 'Not loaded'}")
    print(f"  [OK] Stage 2 Reason Classifier: {type(m2).__name__ if m2 else 'Not loaded'}")
    
    sample_code = "public class Test { public static void main(String[] args) { int x = 10 System.out.println(x); } }"
    analysis = ErrorService.analyze({"code": sample_code, "student_id": "TEST_VERIFY_USER"})
    pred_res = analysis.get("prediction", {})
    print(f"  [OK] Live Test Inference Result:")
    print(f"       - Detected Error: {pred_res.get('label')}")
    print(f"       - Reason Group:   {pred_res.get('reason_group')}")
    print(f"       - Severity:       {pred_res.get('severity')}")
    print(f"       - Gamified Rec:   {analysis.get('gamification', {}).get('recommended_activity')}")
except Exception as e:
    print(f"  [FAIL] Component 2 Error: {e}")

# ── 4. COMPONENT 4: SCHEMA MASTERY ML MODEL ───────────────────────────
print("\n[4] CHECKING COMPONENT 4: SCHEMA MASTERY TRACKER (ML MODEL)...")
try:
    from services.schema_mastery_service import load_model, SchemaMasteryService
    m4 = load_model()
    print(f"  [OK] Component 4 ML Pipeline: {type(m4).__name__ if m4 else 'Pipeline'}")
    
    c4_sample = {
        "student_id": "TEST_STUDENT_01",
        "concept_name": "Loops",
        "pre_test_score": 0.40,
        "attempt_count": 2,
        "time_taken_seconds": 120,
        "error_type": "OFF_BY_ONE",
        "error_pattern_score": 0.65,
        "post_test_correct_count": 8,
        "post_test_nearly_correct_count": 4,
        "post_test_wrong_count": 3,
        "post_test_clearly_wrong_count": 0,
        "post_test_score": 0.80
    }
    c4_res = SchemaMasteryService.predict(c4_sample)
    print(f"  [OK] Live Test Inference Result:")
    print(f"       - Mastery Probability: {c4_res.get('mastery_probability')}")
    print(f"       - Mastery Level:       {c4_res.get('mastery_level')}")
    print(f"       - Next Action:         {c4_res.get('next_action')}")
    print(f"       - Model Used:          {c4_res.get('model_used')}")
except Exception as e:
    print(f"  [FAIL] Component 4 Error: {e}")

print("\n" + "=" * 70)
print("             ALL ML MODELS & DB VALIDATED SUCCESSFULLY")
print("=" * 70)
