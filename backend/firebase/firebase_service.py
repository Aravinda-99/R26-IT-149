"""
Firebase Admin SDK Service
==========================
Initializes Firebase Admin and provides a shared Firestore client.
Searches for serviceAccountKey.json in the project root, firebase folder, or environment path.
"""

import os

try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False
    print("[WARN] firebase-admin package not installed. Running in OFFLINE mode.")


def get_service_account_path():
    """Finds the serviceAccountKey.json file across multiple candidate locations."""
    candidates = [
        os.getenv("FIREBASE_CREDENTIALS_PATH", ""),
        os.getenv("FIREBASE_SERVICE_ACCOUNT", ""),
        os.path.join(os.path.dirname(__file__), "..", "serviceAccountKey.json"),
        os.path.join(os.path.dirname(__file__), "serviceAccountKey.json"),
        os.path.join(os.getcwd(), "serviceAccountKey.json"),
        os.path.join(os.getcwd(), "backend", "serviceAccountKey.json"),
        os.path.join(os.getcwd(), "backend", "firebase", "serviceAccountKey.json"),
    ]

    for p in candidates:
        if p and os.path.exists(p):
            return os.path.abspath(p)
    return None


def init_firebase():
    """Initialize Firebase Admin SDK. Returns Firestore client or None."""
    if not HAS_FIREBASE:
        return None

    cred_path = get_service_account_path()
    if not cred_path:
        print("[WARN] serviceAccountKey.json not found in candidate paths. Running in OFFLINE mode.")
        return None

    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
        print(f"[OK] Firebase Admin initialized with credentials: {cred_path}")
        return firestore.client()
    except Exception as e:
        print(f"[WARN] Firebase initialization error: {e}. Running in OFFLINE mode.")
        return None


# Shared Firestore client (None if offline)
db = init_firebase()
