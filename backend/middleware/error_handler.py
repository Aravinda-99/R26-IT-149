"""
Error Handling Middleware
========================
Provides consistent JSON error responses and request validation helpers.
"""

from flask import jsonify
from functools import wraps


def register_error_handlers(app):
    """Attach error handlers to the Flask app."""

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"error": "Bad request", "message": str(e)}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found", "message": str(e)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error", "message": str(e)}), 500


def require_json(*required_fields):
    """Decorator that validates required JSON fields in POST requests."""
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            from flask import request, abort
            data = request.get_json(silent=True)
            if data is None:
                abort(400, description="Request body must be valid JSON")
            missing = [field for field in required_fields if field not in data]
            if missing:
                abort(400, description=f"Missing required fields: {', '.join(missing)}")
            return f(*args, **kwargs)
        return wrapper
    return decorator
