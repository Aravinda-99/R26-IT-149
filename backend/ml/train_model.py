import pandas as pd
import numpy as np
import joblib
import os
import warnings
warnings.filterwarnings('ignore')

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.metrics import classification_report, accuracy_score, recall_score
from sklearn.utils.class_weight import compute_sample_weight, compute_class_weight

# ── Paths ──────────────────────────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, '..', 'data', 'final_dataset_ready.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')

# ── Constants ──────────────────────────────────────────────────────────
# 4 features only — accuracy is EXCLUDED because it was used to create
# the recommendation label (Bloom's thresholds). Including it causes
# data leakage (100% accuracy). The model predicts using behavioral
# signals: how the student interacted, not what they scored.
#
# The production fix for correct predictions is in adaptive_service.py
# where avg_time_sec is floored at 10s to match the training data range.
FEATURES  = ['avg_attempts', 'avg_time_sec', 'engagement_score', 'difficulty']
LABELS    = ['Maintain', 'Promote', 'Demote']
label_map = {0: 'Maintain', 1: 'Promote', 2: 'Demote'}


def train_and_save():

    # ── 1. Load dataset ───────────────────────────────────────────────
    print("=" * 62)
    print(" ADAPTIVE LEARNING PATH — MODEL TRAINING")
    print("=" * 62)

    df = pd.read_csv(DATA_PATH, low_memory=False)

    print(f" Model            : Gradient Boosting Classifier")
    print(f" Features         : {len(FEATURES)} ({', '.join(FEATURES)})")
    print(f" Balance method   : sample_weight='balanced'")
    print(f" Synthetic data   : None — real data only")
    print(f" Dataset rows     : {len(df):,}")
    print()

    # ── 2. Class distribution ─────────────────────────────────────────
    print(" Class Distribution:")
    vc = df['recommendation'].value_counts().sort_index()
    for i, n in vc.items():
        bar = '█' * int(n / len(df) * 40)
        print(f"   {label_map[i]:<10}: {n:>6,} ({n/len(df)*100:.1f}%)  {bar}")
    print()

    # ── 3. Prepare features ───────────────────────────────────────────
    X = df[FEATURES].astype(float)
    y = df['recommendation'].astype(int)

    # ── Show feature statistics ───────────────────────────────────────
    print(" Feature Statistics:")
    for feat in FEATURES:
        col = X[feat]
        print(f"   {feat:<20}: min={col.min():.4f}  max={col.max():.4f}  mean={col.mean():.4f}")
    print()

    # ── 4. Split into train and test ──────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y,
        test_size    = 0.2,
        random_state = 42,
        stratify     = y
    )

    print(f" Training rows    : {len(X_train):,}")
    print(f" Test rows        : {len(X_test):,}")
    print()

    # ── 5. Compute balanced sample weights ────────────────────────────
    # This is the balancing step — no synthetic data created
    # Gives more attention to minority class (Demote) during training
    sample_weights = compute_sample_weight(
        class_weight = 'balanced',
        y            = y_train
    )

    class_weights = compute_class_weight(
        class_weight = 'balanced',
        classes      = np.array([0, 1, 2]),
        y            = y_train
    )

    print(" Balanced Sample Weights:")
    for name, w in zip(LABELS, class_weights):
        note = '<-- most attention (smallest class)' if w == max(class_weights) else ''
        print(f"   {name:<10}: {w:.4f}  {note}")
    print()

    # ── 6. Train model with balanced weights ──────────────────────────
    model = GradientBoostingClassifier(
        n_estimators  = 100,
        max_depth     = 4,
        learning_rate = 0.1,
        random_state  = 42,
    )

    print(" Training Gradient Boosting Classifier...")
    model.fit(X_train, y_train, sample_weight=sample_weights)
    print(" Training complete.")
    print()

    # ── 7. Evaluate on test set ───────────────────────────────────────
    y_pred  = model.predict(X_test)
    acc     = accuracy_score(y_test, y_pred)
    recalls = recall_score(y_test, y_pred, average=None)

    print("=" * 62)
    print(" TEST SET RESULTS")
    print("=" * 62)
    print(f" Overall Accuracy : {acc*100:.2f}%")
    print()
    print(classification_report(y_test, y_pred, target_names=LABELS))

    # ── 8. Cross validation ───────────────────────────────────────────
    cv        = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(
        model, X, y,
        cv      = cv,
        scoring = 'accuracy',
        n_jobs  = -1
    )

    print("=" * 62)
    print(" CROSS VALIDATION (5-Fold)")
    print("=" * 62)
    print(f" Mean Accuracy    : {cv_scores.mean()*100:.2f}%")
    print(f" Std Deviation    : +-{cv_scores.std()*100:.2f}%")
    print(f" All Folds        : {[round(s*100, 2) for s in cv_scores]}")
    print()

    # ── 9. Feature importance ─────────────────────────────────────────
    print("=" * 62)
    print(" FEATURE IMPORTANCE")
    print("=" * 62)
    fi = pd.Series(
        model.feature_importances_,
        index = FEATURES
    ).sort_values(ascending=False)

    for feat, imp in fi.items():
        bar = '█' * int(imp * 50)
        print(f"   {feat:<20}: {imp:.4f}  {bar}")
    print()

    # ── 10. Per class recall with improvement shown ───────────────────
    print("=" * 62)
    print(" PER CLASS RECALL SUMMARY")
    print("=" * 62)
    baseline = {0: 74.4, 1: 94.1, 2: 68.6}
    for i, (name, recall) in enumerate(zip(LABELS, recalls)):
        change = recall * 100 - baseline[i]
        arrow  = f"+{change:.1f}% improved" if change > 0 else f"{change:.1f}%"
        bar    = '█' * int(recall * 30)
        print(f"   {name:<10}: {recall*100:.1f}%  {bar}")
        print(f"               was {baseline[i]}% without balancing → {arrow}")
    print()

    # ── 11. Save trained model ────────────────────────────────────────
    joblib.dump(model, MODEL_PATH)

    print("=" * 62)
    print(f" Model saved → {MODEL_PATH}")
    print("=" * 62)
    print()
    print(" Training summary:")
    print(f"   Features       : {len(FEATURES)} ({', '.join(FEATURES)})")
    print(f"   Method         : sample_weight=balanced")
    print(f"   Synthetic data : None")
    print(f"   Data removed   : None")
    print(f"   Real rows used : {len(df):,}")
    print(f"   Test accuracy  : {acc*100:.2f}%")
    print(f"   CV accuracy    : {cv_scores.mean()*100:.2f}%")
    print(f"   Demote recall  : 68.6% → {recalls[2]*100:.1f}%")

    return model


if __name__ == '__main__':
    train_and_save()