"""
Utility Helpers
===============
Shared helper functions used across services.
"""

from datetime import datetime, timezone


def timestamp_now():
    """Return current UTC timestamp as ISO string."""
    return datetime.now(timezone.utc).isoformat()


def classify_mastery(level):
    """Return a human-readable mastery classification from a 0-100 score."""
    if level >= 90:
        return "expert"
    if level >= 70:
        return "proficient"
    if level >= 50:
        return "developing"
    if level >= 25:
        return "beginner"
    return "novice"


def clamp(value, minimum=0, maximum=100):
    """Clamp a numeric value between min and max."""
    return max(minimum, min(maximum, value))
