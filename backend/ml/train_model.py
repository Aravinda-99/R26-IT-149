import pandas as pd
import joblib
import os
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score

# ── Paths ───────────────────────────────────────────
BASE_DIR   = os.path.dirname(os.path.abspath(__file__))
DATA_PATH  = os.path.join(BASE_DIR, '..', 'data', 'final_dataset_ready.csv')
MODEL_PATH = os.path.join(BASE_DIR, 'model.pkl')

def train_and_save():
    # 1. Load dataset
    df = pd.read_csv(DATA_PATH)
    print(f"Loaded: {df.shape[0]} rows")

    # 2. Features (never include accuracy)
    FEATURES = ['avg_attempts', 'avg_time_sec',
                'engagement_score', 'difficulty']
    X = df[FEATURES]
    y = df['recommendation']

    # 3. Split into train and test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 4. Train model
    model = GradientBoostingClassifier(
        n_estimators=100, max_depth=4, random_state=42
    )
    model.fit(X_train, y_train)

    # 5. Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {acc:.4f}")
    print(classification_report(y_test, y_pred,
        target_names=['Maintain', 'Promote', 'Demote']))

    # 6. Save trained model to model.pkl
    joblib.dump(model, MODEL_PATH)
    print(f"Model saved → {MODEL_PATH}")
    return model

if __name__ == '__main__':
    train_and_save()