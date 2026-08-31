"""
Application Configuration
=========================
Centralized configuration loaded from environment variables.
"""

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    FLASK_PORT = int(os.getenv("FLASK_PORT", 5000))
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "False").lower() in ("true", "1")
    FIREBASE_CREDENTIALS_PATH = os.getenv(
        "FIREBASE_CREDENTIALS_PATH", "firebase/serviceAccountKey.json"
    )
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*")

    # --- Component 4: LLM Configuration ---
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
    USE_LLM_QUESTION_GENERATION = os.getenv("USE_LLM_QUESTION_GENERATION", "true").lower() in ("true", "1")
    ALLOW_MOCK_QUESTIONS = os.getenv("ALLOW_MOCK_QUESTIONS", "false").lower() in ("true", "1")
    LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini").strip()

