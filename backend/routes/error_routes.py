"""
Component 2: Intelligent Error Pattern Detector — Routes
=========================================================
Routes for ML-powered error analysis, history, summary,
error progression analytics (Feature 1), and personalized
learning report (Feature 3).
"""

import logging
import re
import time

from flask import Blueprint, request, jsonify
from services.error_service import ErrorService

error_bp = Blueprint("errors", __name__)

_ERROR_ROUTE_CACHE = {}
_ERROR_ROUTE_CACHE_TTL_SECONDS = 60
_ROUTE_WARN_LOG = {}
_ROUTE_WARN_THROTTLE_SECONDS = 60
_ERROR_GET_CACHE_KINDS = {"history", "summary", "analytics", "learning-report"}


class _RepeatedErrorAccessLogFilter(logging.Filter):
    _pattern = re.compile(
        r'"GET\s+/api/errors/(history|summary|analytics|learning-report)/([^?\s]+)'
    )

    def __init__(self, ttl_seconds=60):
        super().__init__()
        self.ttl_seconds = ttl_seconds
        self.last_seen = {}

    def filter(self, record):
        message = record.getMessage()
        match = self._pattern.search(message)
        if not match:
            return True

        cache_key = f"{match.group(1)}:{match.group(2)}"
        now = time.time()
        last_seen = self.last_seen.get(cache_key, 0)
        if now - last_seen < self.ttl_seconds:
            return False

        self.last_seen[cache_key] = now
        return True


def _install_error_access_log_filter():
    werkzeug_logger = logging.getLogger("werkzeug")
    for existing_filter in werkzeug_logger.filters:
        if isinstance(existing_filter, _RepeatedErrorAccessLogFilter):
            return
    werkzeug_logger.addFilter(_RepeatedErrorAccessLogFilter())


_install_error_access_log_filter()


def _get_cached_route_response(kind, user_id):
    cache_key = f"{kind}:{user_id}"
    cached = _ERROR_ROUTE_CACHE.get(cache_key)
    if not cached:
        return None

    now = time.time()
    if now - cached.get("timestamp", 0) >= _ERROR_ROUTE_CACHE_TTL_SECONDS:
        _ERROR_ROUTE_CACHE.pop(cache_key, None)
        return None

    return cached.get("payload"), cached.get("status", 200)


def _set_cached_route_response(kind, user_id, payload, status=200):
    cache_key = f"{kind}:{user_id}"
    _ERROR_ROUTE_CACHE[cache_key] = {
        "timestamp": time.time(),
        "payload": payload,
        "status": status,
    }


def _clear_cached_route_responses(user_id):
    suffix = f":{user_id}"
    for cache_key in list(_ERROR_ROUTE_CACHE.keys()):
        if cache_key.endswith(suffix):
            _ERROR_ROUTE_CACHE.pop(cache_key, None)


def _log_route_warning_once(cache_key, message):
    now = time.time()
    last_logged = _ROUTE_WARN_LOG.get(cache_key, 0)
    if now - last_logged >= _ROUTE_WARN_THROTTLE_SECONDS:
        _ROUTE_WARN_LOG[cache_key] = now
        print(message)


def _cached_error_route(kind, user_id, loader, fallback_factory):
    cached = _get_cached_route_response(kind, user_id)
    if cached:
        payload, status = cached
        response = jsonify(payload)
        if kind in _ERROR_GET_CACHE_KINDS:
            response.headers["Cache-Control"] = f"private, max-age={_ERROR_ROUTE_CACHE_TTL_SECONDS}"
        return response, status

    try:
        payload, status = loader()
    except Exception as e:
        _log_route_warning_once(
            f"{kind}:{user_id}:{type(e).__name__}",
            f"[WARN] /api/errors/{kind}/{user_id} failed; using fallback response: {e}",
        )
        payload, status = fallback_factory(e), 200

    _set_cached_route_response(kind, user_id, payload, status)
    response = jsonify(payload)
    if kind in _ERROR_GET_CACHE_KINDS:
        response.headers["Cache-Control"] = f"private, max-age={_ERROR_ROUTE_CACHE_TTL_SECONDS}"
    return response, status


def _is_teacher_like_user_id(user_id):
    normalized = str(user_id or "").strip().upper()
    return normalized.startswith(("TEA", "TCH", "ADMIN"))


def _teacher_skip_response(user_id, kind):
    base = {
        "success": True,
        "user_id": user_id,
        "student_id": user_id,
        "source": "skipped",
        "message": "Error-analysis data is only loaded for student learning sessions.",
    }
    if kind == "history":
        return {**base, "total": 0, "history": []}
    if kind == "latest":
        return {**base, "success": False, "message": "No recent student analysis found."}
    if kind == "summary":
        return {**base, "total_analyses": 0, "counts": {}, "most_frequent_error": "None", "recommended_focus": "General"}
    if kind == "analytics":
        return {
            **base,
            "has_data": False,
            "total_submissions": 0,
            "weeks": [],
            "weekly_totals": [],
            "category_weekly": {},
            "improvement_scores": {},
            "overall_improvement_pct": 0,
            "most_improved": None,
            "most_problematic": None,
            "error_free_rate": 0,
            "total_counts": {},
        }
    if kind == "report":
        return {
            **base,
            "has_data": False,
            "total_submissions": 0,
            "summary": "No submission history found.",
            "strengths": [],
            "recurring_mistakes": [],
            "recently_improved": [],
            "new_mistakes": [],
            "recommended_focus": [],
            "avoid_patterns": [],
        }
    return base


@error_bp.route("/analyze", methods=["POST"])
def analyze_code():
    """Analyze submitted code for error patterns (includes XAI — Feature 2)."""
    try:
        data = request.get_json() or {}
        student_id = data.get("student_id") or data.get("studentId") or data.get("user_id") or data.get("userId")
        if _is_teacher_like_user_id(student_id):
            return jsonify(_teacher_skip_response(student_id, "analyze")), 200
        result = ErrorService.analyze(data)
        if student_id:
            _clear_cached_route_responses(student_id)
            if result.get("success"):
                try:
                    from services.schema_session_service import SchemaSessionService, calculate_error_pattern_score
                    score_info = calculate_error_pattern_score(result)
                    result["error_pattern_score"] = score_info["error_pattern_score"]
                    result["error_pattern_score_source"] = score_info["error_pattern_score_source"]
                    
                    err_type = result.get("reason_group") or result.get("predicted_label") or "UNKNOWN_ERROR"
                    expl = result.get("explanation") or {}
                    reason = expl.get("misconception") or expl.get("reason") or ""
                    
                    SchemaSessionService.save_component_2_data(student_id, {
                        "error_type": err_type,
                        "error_pattern_score": score_info["error_pattern_score"],
                        "error_pattern_score_source": score_info["error_pattern_score_source"],
                        "error_reason": reason,
                        "dominant_error_count": score_info.get("dominant_error_count"),
                        "total_error_count": score_info.get("total_error_count"),
                    })
                except Exception as se:
                    print(f"[WARN] Failed to auto-save Component 2 session for {student_id}: {se}")
        return jsonify(result)
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "prediction": "General Error",
            "reason": "Could not complete analysis",
            "recommendation": "Review your code logic and syntax."
        }), 200


@error_bp.route("/history/<user_id>", methods=["GET"])
def get_error_history(user_id):
    """Return error analysis history for a user (last 10 items)."""
    if _is_teacher_like_user_id(user_id):
        return jsonify(_teacher_skip_response(user_id, "history")), 200

    def load_history():
        return ErrorService.get_history(user_id), 200

    def history_fallback(e):
        return {
            "success": True,
            "student_id": user_id,
            "source": "fallback",
            "total": 0,
            "history": [],
            "message": f"Error loading history: {e}"
        }

    return _cached_error_route("history", user_id, load_history, history_fallback)


@error_bp.route("/latest/<user_id>", methods=["GET"])
def get_latest_analysis(user_id):
    """Return the most recent full analysis response for a user."""
    if _is_teacher_like_user_id(user_id):
        return jsonify(_teacher_skip_response(user_id, "latest")), 200

    def load_latest():
        result = ErrorService.get_latest(user_id)
        if result:
            return result, 200
        return {
            "success": False,
            "student_id": user_id,
            "message": "No recent analysis found"
        }, 404

    def latest_fallback(e):
        return {
            "success": False,
            "student_id": user_id,
            "message": f"Error retrieving latest analysis: {e}"
        }

    return _cached_error_route("latest", user_id, load_latest, latest_fallback)


@error_bp.route("/summary/<user_id>", methods=["GET"])
def get_error_summary(user_id):
    """Return aggregated error summary per category."""
    if _is_teacher_like_user_id(user_id):
        return jsonify(_teacher_skip_response(user_id, "summary")), 200

    def load_summary():
        return ErrorService.get_summary(user_id), 200

    def summary_fallback(e):
        return {
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "total_analyses": 0,
            "counts": {},
            "most_frequent_error": "None",
            "recommended_focus": "General"
        }

    return _cached_error_route("summary", user_id, load_summary, summary_fallback)


@error_bp.route("/top-misconception", methods=["POST"])
def save_top_misconception():
    """Save student's top misconception directly to the database."""
    data = request.get_json() or {}
    student_id = data.get("student_id")
    if not student_id:
        return jsonify({"error": "student_id is required"}), 400
    res = ErrorService.save_top_misconception(data)
    _clear_cached_route_responses(student_id)
    return jsonify(res), 200


@error_bp.route("/analytics/<user_id>", methods=["GET"])
def get_error_analytics(user_id):
    """
    Feature 1 — Error Progression Analytics.
    Returns weekly error trends, per-category counts, improvement percentages,
    most improved concept, most problematic concept, and error-free rate.
    Designed for direct consumption by Chart.js.
    """
    if _is_teacher_like_user_id(user_id):
        return jsonify(_teacher_skip_response(user_id, "analytics")), 200

    def load_analytics():
        return ErrorService.get_analytics(user_id), 200

    def analytics_fallback(e):
        return {
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "has_data": False,
            "total_submissions": 0,
            "weeks": [],
            "weekly_totals": [],
            "category_weekly": {},
            "improvement_scores": {},
            "overall_improvement_pct": 0,
            "most_improved": None,
            "most_problematic": None,
            "error_free_rate": 0,
            "total_counts": {},
        }

    return _cached_error_route("analytics", user_id, load_analytics, analytics_fallback)


@error_bp.route("/learning-report/<user_id>", methods=["GET"])
def get_learning_report(user_id):
    """
    Feature 3 — Personalized Learning Report.
    Returns a dynamically generated report covering strengths, recurring
    mistakes, recently improved concepts, new mistakes, and recommended
    focus areas derived from the learner's full submission history.
    """
    if _is_teacher_like_user_id(user_id):
        return jsonify(_teacher_skip_response(user_id, "report")), 200

    def load_learning_report():
        return ErrorService.generate_learning_report(user_id), 200

    def learning_report_fallback(e):
        return {
            "success": True,
            "user_id": user_id,
            "source": "fallback",
            "has_data": False,
            "total_submissions": 0,
            "summary": "No submission history found.",
            "strengths": [],
            "recurring_mistakes": [],
            "recently_improved": [],
            "new_mistakes": [],
            "recommended_focus": [],
            "avoid_patterns": [],
        }

    return _cached_error_route("learning-report", user_id, load_learning_report, learning_report_fallback)
