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
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini").strip().lower()
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
    USE_LLM_QUESTION_GENERATION = os.getenv("USE_LLM_QUESTION_GENERATION", "true").lower() in ("true", "1")
    ALLOW_MOCK_QUESTIONS = os.getenv("ALLOW_MOCK_QUESTIONS", "false").lower() in ("true", "1")

    # Model resolution
    _raw_model = os.getenv("LLM_MODEL", "").strip()
    if _raw_model:
        LLM_MODEL = _raw_model
    else:
        LLM_MODEL = "gemini-flash-latest" if LLM_PROVIDER == "gemini" else "gpt-4o-mini"
