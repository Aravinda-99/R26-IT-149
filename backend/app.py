"""
Main Flask Application
======================
Entry point for the Gamified Adaptive Learning Framework.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from middleware.error_handler import register_error_handlers


def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})

    register_error_handlers(app)

    # --- Register Blueprints ---
    from routes.adaptive_routes import adaptive_bp
    from routes.error_routes import error_bp
    from routes.gamification_routes import gamification_bp
    from routes.mastery_routes import mastery_bp
    from routes.auth_routes import auth_bp

    app.register_blueprint(adaptive_bp, url_prefix="/api/adaptive")
    app.register_blueprint(error_bp, url_prefix="/api/errors")
    app.register_blueprint(gamification_bp, url_prefix="/api/gamification")
    app.register_blueprint(mastery_bp, url_prefix="/api/mastery")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")

    # --- Health Check ---
    @app.route("/api/health")
    def health():
        from firebase.firebase_service import db
        return jsonify({
            "status": "ok",
            "message": "API is running",
            "firebase": "connected" if db else "offline",
        })

    return app


if __name__ == "__main__":
    app = create_app()
    port = Config.FLASK_PORT
    print(f"\n  Server running at http://localhost:{port}")
    print(f"  Health check:    http://localhost:{port}/api/health\n")
    app.run(debug=Config.FLASK_DEBUG, port=port)
