"""
Firebase Admin SDK Service
==========================
Initializes Firebase Admin and provides a shared Firestore client.
Place your serviceAccountKey.json in this folder.
"""

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    HAS_FIREBASE = True
except ImportError:
    HAS_FIREBASE = False
    print("[WARN] firebase-admin package not installed. Running in OFFLINE mode.")
import os


def init_firebase():
    """Initialize Firebase Admin SDK. Returns Firestore client or None."""
    if not HAS_FIREBASE:
        return None

    cred_path = os.getenv(
        "FIREBASE_CREDENTIALS_PATH",
        os.path.join(os.path.dirname(__file__), "serviceAccountKey.json")
    )

    if not os.path.exists(cred_path):
        print("[WARN] serviceAccountKey.json not found. Running in OFFLINE mode.")
        return None

    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)

    return firestore.client()


# Shared Firestore client (None if offline)
db = init_firebase()
