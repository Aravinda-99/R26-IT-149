"""
Component 2: Explanation Service (RAG-grounded LLM explanations)
================================================================
Per-question explanations for the pre-test in English, Sinhala and Singlish.

Flow for POST /api/errors/explain
---------------------------------
  1. cache      backend/data/c2_explanations_cache.json (built offline by
                scripts/build_explanation_cache.py), keyed "<question_id>::<option text>"
  2. llm        ONE live call with the Component 4 LLM settings (LLM_PROVIDER / LLM_MODEL,
                Gemini by default), 15 s timeout, JSON validated, no retries. After a
                429 / quota / 503 the circuit breaker skips the LLM for 10 minutes.
  3. template   reason-group templates in EN (ErrorService._get_reason_details) and
                Sinhala / Singlish (services/explanation_templates.py)
Any internal error also ends in the template, so the endpoint always explains.
The response's "source" says which one answered.

Grounding
---------
The prompt carries the question, the student's option and code, the answer key, the
C2 label (reason group + Model 3 calibrated confidence), optional compiler / runtime
output, the question's own knowledge-base chunk and the top-4 reason-group / concept-
note chunks retrieved by TF-IDF within the question's concept (ml/component2_error_detection/rag).

LLM verification policy
-----------------------
For wrong answers, if Model 3's prediction_confidence < 0.5 and the LLM says the label
does not fit, the LLM's llm_suggested_reason_group becomes the final explanation label
(label_source "llm_verified"); otherwise the C2 label is kept (label_source "model3").
If Model 3 says CORRECT_NO_ERROR for an answer the answer key marks wrong, the LLM's
(error) group is used whatever the confidence. Cached answers are re-checked on every
request, so a policy change applies to them without regenerating.
Correct answers are labelled by the answer key (label_source "answer_key"). Both the C2
and the LLM labels are returned. The prompt (c2-expl-v2) requires every text field to
describe exactly the label the card shows, so card and explanation never disagree.

Free code (mode "free", the Java Sandbox's "Analyze with AI")
-------------------------------------------------------------
Any Java code without a pre-test question: Model 3 decides (no answer key), then ONE live
LLM call explains its label (template on failure). Never cached or memoised, so every
request really reaches the model.
"""

import copy
import datetime
import json
import os
import re
import threading
import time

import requests

from config import Config
from services.explanation_templates import localised_template

BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CACHE_PATH = os.path.join(BACKEND_DIR, "data", "c2_explanations_cache.json")

PROMPT_VERSION = "c2-expl-v2"
TEMPERATURE = 0.2
LIVE_TIMEOUT_SECONDS = float(os.getenv("EXPLANATION_LLM_TIMEOUT_SECONDS", "15"))
# Optional overrides for this service only; default to the Component 4 LLM_MODEL.
# Gemini 3 "thinking" adds latency, so explanations ask for a low thinking level.
EXPLANATION_LLM_MODEL = os.getenv("EXPLANATION_LLM_MODEL", "").strip()
EXPLANATION_THINKING_LEVEL = os.getenv("EXPLANATION_LLM_THINKING_LEVEL", "low").strip().lower()
# false = never call the LLM from POST /api/errors/explain (cache, else template).
EXPLANATION_USE_LLM = os.getenv("EXPLANATION_USE_LLM", "true").strip().lower() in ("1", "true", "yes")
CIRCUIT_BREAK_SECONDS = 600  # after a 429 / quota / 503, live requests skip the LLM for 10 minutes
VERIFY_MAX_CONF = 0.5  # verification policy threshold on Model 3 calibrated confidence
TOP_K = 4

REASON_GROUPS = [
    "VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_CALCULATION_ISSUE",
    "LOOP_BOUNDARY_ISSUE", "LOOP_CONDITION_ISSUE", "LOOP_UPDATE_ISSUE", "LOOP_CONTROL_FLOW_ISSUE",
    "ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_TRAVERSAL_ISSUE",
    "METHOD_SIGNATURE_ISSUE", "METHOD_RETURN_ISSUE", "METHOD_PARAMETER_USAGE_ISSUE",
    "CORRECT_NO_ERROR",
]
BROAD_OF_PREFIX = {"VARIABLE": "VARIABLE_ERROR", "LOOP": "LOOP_ERROR", "ARRAY": "ARRAY_ERROR",
                   "METHOD": "METHOD_ERROR", "CORRECT": "CORRECT"}

PARTS = ("summary", "why", "fix", "tip")
EN_FIELDS = [f"{p}_en" for p in PARTS]
SI_FIELDS = [f"{p}_si" for p in PARTS]
SINGLISH_FIELDS = [f"{p}_singlish" for p in PARTS]
REQUIRED_FIELDS = (["is_correct", "summary_en", "where", "why_en", "fix_en", "correct_code", "tip_en"]
                   + SI_FIELDS + SINGLISH_FIELDS + ["llm_agrees_with_label", "llm_suggested_reason_group"])
MAX_TEXT_CHARS = 600
MAX_CODE_CHARS = 2000
SINHALA_RE = re.compile(r"[඀-෿]")


def _foreign_letters(text):
    """Letters that are neither Sinhala nor Latin (e.g. a Thai or Cyrillic look-alike inside Sinhala words)."""
    import unicodedata
    out = []
    for ch in text:
        if ch.isalpha() and not ("඀" <= ch <= "෿") and not unicodedata.name(ch, "").startswith("LATIN"):
            out.append(ch)
    return out


class LLMError(Exception):
    pass


class LLMRateLimited(LLMError):
    def __init__(self, message, retry_after=None):
        super().__init__(message)
        self.retry_after = retry_after


class LLMTimeout(LLMError):
    pass


class LLMUnavailable(LLMError):
    """Transient provider overload (HTTP 500/503); worth retrying later."""


class LLMConnectionError(LLMError):
    """Network failure reaching the provider; the cache builder retries it."""


class ExplanationValidationError(ValueError):
    def __init__(self, errors):
        super().__init__("; ".join(errors))
        self.errors = errors


# ----------------------------------------------------------------------
# Helpers
# ----------------------------------------------------------------------

def cache_key(question_id, option):
    return f"{int(question_id)}::{option}"


def build_code(question, option):
    """Same substitution as quizLab.js buildFullCodeFromTemplate (first {BLANK} only)."""
    template = (question or {}).get("codeTemplate")
    if not template or option is None:
        return ""
    return template.replace("{BLANK}", str(option), 1)


def _norm_code(code):
    return re.sub(r"\s+", " ", code or "").strip()


def _sentence_count(text):
    return len([s for s in re.split(r"(?<=[.!?।])\s+", text.strip()) if s])



def _to_bool(value):
    if isinstance(value, bool):
        return value
    if isinstance(value, str) and value.strip().lower() in ("true", "false"):
        return value.strip().lower() == "true"
    raise ValueError


def _parse_json(raw_text):
    from services.schema_llm_question_service import SchemaLLMQuestionService
    return SchemaLLMQuestionService._parse_llm_json(raw_text)


def validate_explanation(obj, code=None):
    """
    Validates the LLM JSON against the explanation schema.
    Returns (clean_dict, warnings); raises ExplanationValidationError on hard errors.
    Soft issues (too many sentences, a "where" that is not in the code) are warnings;
    a "where" that cannot be found in the code is set to None so the UI never
    highlights something that is not there.
    """
    if not isinstance(obj, dict):
        raise ExplanationValidationError(["response is not a JSON object"])
    errors, warnings = [], []
    missing = [k for k in REQUIRED_FIELDS if k not in obj]
    if missing:
        errors.append(f"missing keys: {missing}")

    clean = {}
    for k in EN_FIELDS + SI_FIELDS + SINGLISH_FIELDS + ["correct_code"]:
        if k not in obj:
            continue
        v = obj[k]
        if not isinstance(v, str) or not v.strip():
            errors.append(f"{k} must be a non-empty string")
            continue
        v = v.strip()
        limit = MAX_CODE_CHARS if k == "correct_code" else MAX_TEXT_CHARS
        if len(v) > limit:
            errors.append(f"{k} is longer than {limit} characters")
        if k in SI_FIELDS and not SINHALA_RE.search(v):
            errors.append(f"{k} is not written in Sinhala script")
        if k in SINGLISH_FIELDS and SINHALA_RE.search(v):
            errors.append(f"{k} must use English letters only (no Sinhala script)")
        if k in SI_FIELDS + SINGLISH_FIELDS and _foreign_letters(v):
            errors.append(f"{k} contains letters from another script: {''.join(sorted(set(_foreign_letters(v))))!r}")
        if k != "correct_code" and _sentence_count(v) > 3:
            warnings.append(f"{k} has more than 3 sentences")
        clean[k] = v

    for k in ("is_correct", "llm_agrees_with_label"):
        if k in obj:
            try:
                clean[k] = _to_bool(obj[k])
            except ValueError:
                errors.append(f"{k} must be a boolean")

    if "llm_suggested_reason_group" in obj:
        rg = str(obj["llm_suggested_reason_group"] or "").strip().upper()
        if rg in REASON_GROUPS:
            clean["llm_suggested_reason_group"] = rg
        else:
            errors.append(f"llm_suggested_reason_group must be one of the 12 groups, got {obj['llm_suggested_reason_group']!r}")

    if "where" in obj:
        w = obj["where"]
        if w is None or (isinstance(w, str) and w.strip().lower() in ("", "null", "none")):
            clean["where"] = None
        elif not isinstance(w, str):
            errors.append("where must be a string or null")
        else:
            w = w.strip().strip("`")
            if code and w not in code:
                if _norm_code(w) and _norm_code(w) in _norm_code(code):
                    warnings.append("where matched the code only after whitespace normalisation")
                else:
                    warnings.append(f"where {w!r} is not in the student's code; set to null")
                    w = None
            clean["where"] = w

    if errors:
        raise ExplanationValidationError(errors)
    return clean, warnings


def choose_final_label(c2_reason_group, prediction_confidence, is_correct, llm_expl, answer_key=True):
    """
    Verification policy. Returns (final_reason_group, label_source).
    answer_key=False (free sandbox code): nothing is known to be wrong, so a "no error"
    label is only re-checked under the low-confidence rule.
    """
    if is_correct:
        return "CORRECT_NO_ERROR", "answer_key"
    if c2_reason_group is None:
        return None, "not_applicable"
    suggested = (llm_expl or {}).get("llm_suggested_reason_group")
    # The answer key says this answer is wrong, so "no error" is certainly not the mistake:
    # use the LLM's group whatever Model 3's confidence was.
    if (answer_key and llm_expl and c2_reason_group == "CORRECT_NO_ERROR"
            and suggested in REASON_GROUPS and suggested != "CORRECT_NO_ERROR"):
        return suggested, "llm_verified"
    if (llm_expl and prediction_confidence is not None and prediction_confidence < VERIFY_MAX_CONF
            and llm_expl.get("llm_agrees_with_label") is False
            and llm_expl.get("llm_suggested_reason_group") in REASON_GROUPS
            and llm_expl["llm_suggested_reason_group"] != c2_reason_group):
        return llm_expl["llm_suggested_reason_group"], "llm_verified"
    return c2_reason_group, ("model3" if prediction_confidence is not None else "c2_ml")


# ----------------------------------------------------------------------
# LLM client (Component 4 settings: LLM_PROVIDER / LLM_MODEL / API keys)
# ----------------------------------------------------------------------

def _gemini_response_schema():
    text = {"type": "STRING"}
    props = {k: dict(text) for k in EN_FIELDS + SI_FIELDS + SINGLISH_FIELDS + ["correct_code"]}
    props["where"] = {"type": "STRING", "nullable": True}
    props["is_correct"] = {"type": "BOOLEAN"}
    props["llm_agrees_with_label"] = {"type": "BOOLEAN"}
    props["llm_suggested_reason_group"] = {"type": "STRING", "enum": REASON_GROUPS}
    return {"type": "OBJECT", "properties": props, "required": REQUIRED_FIELDS,
            "propertyOrdering": REQUIRED_FIELDS}


def _retry_delay_seconds(body):
    try:
        for d in body.get("error", {}).get("details", []):
            if str(d.get("@type", "")).endswith("RetryInfo") and d.get("retryDelay"):
                return float(str(d["retryDelay"]).rstrip("s"))
    except Exception:
        pass
    return None


def _call_gemini(prompt, timeout, api_key, model, response_schema=None):
    # Key goes in a header, not the URL, so it can never appear in exception text.
    headers = {"x-goog-api-key": api_key, "Content-Type": "application/json"}
    gen_config = {
        "temperature": TEMPERATURE,
        "responseMimeType": "application/json",
        "responseSchema": response_schema or _gemini_response_schema(),
    }
    if EXPLANATION_THINKING_LEVEL and EXPLANATION_THINKING_LEVEL != "none":
        gen_config["thinkingConfig"] = {"thinkingLevel": EXPLANATION_THINKING_LEVEL}
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": gen_config}
    attempts = [m for m in dict.fromkeys([model, "gemini-flash-latest"])]
    while attempts:
        candidate = attempts[0]
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{candidate}:generateContent"
        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=timeout)
        except requests.Timeout as e:
            raise LLMTimeout(f"Gemini request timed out after {timeout:.0f}s") from e
        except requests.RequestException as e:
            raise LLMConnectionError(f"Gemini request failed: {type(e).__name__}") from e
        if resp.status_code == 404:
            attempts.pop(0)
            continue
        if resp.status_code == 400 and "thinking" in resp.text.lower() and "thinkingConfig" in gen_config:
            gen_config.pop("thinkingConfig")  # model without thinking levels: retry plainly
            continue
        if resp.status_code in (500, 503):
            raise LLMUnavailable(f"Gemini unavailable ({resp.status_code})")
        if resp.status_code == 429:
            try:
                body = resp.json()
            except ValueError:
                body = {}
            raise LLMRateLimited("Gemini rate limit (429)", retry_after=_retry_delay_seconds(body))
        if resp.status_code != 200:
            raise LLMError(f"Gemini API error {resp.status_code}: {resp.text[:300]}")
        data = resp.json()
        try:
            return data["candidates"][0]["content"]["parts"][0]["text"], candidate
        except (KeyError, IndexError, TypeError):
            raise LLMError(f"Gemini returned no text (finishReason="
                           f"{(data.get('candidates') or [{}])[0].get('finishReason')})")
    raise LLMError(f"Gemini model {model!r} not found")


def _call_openai(prompt, timeout, api_key, model):
    from openai import OpenAI
    try:
        client = OpenAI(api_key=api_key, timeout=timeout)
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "system", "content": "You are a Java tutor. Reply with one JSON object only."},
                      {"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=TEMPERATURE,
        )
    except Exception as e:
        name = type(e).__name__
        if "RateLimit" in name:
            raise LLMRateLimited("OpenAI rate limit") from e
        if "Timeout" in name:
            raise LLMTimeout("OpenAI request timed out") from e
        raise LLMError(f"OpenAI request failed: {name}") from e
    return resp.choices[0].message.content, model


def llm_status(model_override=None):
    provider = (Config.LLM_PROVIDER or "gemini").strip().lower()
    key = Config.GEMINI_API_KEY if provider == "gemini" else Config.OPENAI_API_KEY
    configured = bool(key) and not key.startswith("your_")
    return provider, (model_override or EXPLANATION_LLM_MODEL or Config.LLM_MODEL), configured


def call_llm(prompt, timeout, model=None, response_schema=None):
    """Returns (raw_text, model_used). Raises LLMError / LLMTimeout / LLMRateLimited / LLMUnavailable."""
    provider, model, configured = llm_status(model)
    if not configured:
        raise LLMError(f"No API key configured for LLM_PROVIDER={provider}")
    if provider == "gemini":
        return _call_gemini(prompt, timeout, Config.GEMINI_API_KEY, model, response_schema)
    if provider == "openai":
        return _call_openai(prompt, timeout, Config.OPENAI_API_KEY, model)
    raise LLMError(f"Unsupported LLM_PROVIDER {provider!r}")


# ----------------------------------------------------------------------
# Prompt
# ----------------------------------------------------------------------

def _format_runner(runner):
    if not runner:
        return "not available"
    if isinstance(runner, str):
        return runner.strip()[:800] or "not available"
    parts = []
    for key, label in (("verified_outcome", "outcome"), ("compile_error", "compile error"),
                       ("runtime_exception", "runtime exception"), ("actual_output", "student's output"),
                       ("expected_output", "output of the correct code")):
        val = runner.get(key)
        if val not in (None, ""):
            parts.append(f"{label}: {str(val).strip()[:300]}")
    return "; ".join(parts) or "not available"


def group_scope(reason_group):
    """
    What a reason group covers: the title of each knowledge-base concept note filed under
    it (one note per fine error type of the dataset taxonomy). The group's one-line reason
    text is narrower than the group (e.g. VARIABLE_ASSIGNMENT_ISSUE also covers wrong type
    keywords), so prompts and the consistency audit use this list.
    """
    if not reason_group:
        return []
    if reason_group == "CORRECT_NO_ERROR":
        return ["The code has no mistake."]
    from ml.component2_error_detection.rag.retriever import get_retriever
    notes = [c for c in get_retriever().chunks
             if c["type"] == "concept_note" and c.get("reason_group") == reason_group]
    return [c["text"].split("\n", 1)[0].split(" (")[0] for c in notes]


def _scope_line(reason_group):
    scope = group_scope(reason_group)
    return ("LABEL COVERS (any one of these specific mistakes): " + "; ".join(scope)) if scope else ""


def _label_rule(ctx):
    """Rule 1 of the prompt: which mistake the explanation must describe (c2-expl-v2)."""
    rg, conf = ctx["c2_reason_group"], ctx["prediction_confidence"]
    same_mistake = ("Every text field (summary, where, why, fix, tip, in all three languages) must describe that one "
                    "mistake and nothing else: the student sees it named on a card right above your text, so a "
                    "different diagnosis would contradict the card. Do not mention other problems, even if you see one.")
    if rg is None:
        return "Explain the answer using the question and the reference notes. Set llm_agrees_with_label=true."
    if ctx["is_correct"] and not ctx.get("free"):
        return "The answer is correct (answer key). Explain why. Set llm_agrees_with_label=true."
    if rg == "CORRECT_NO_ERROR" and not ctx.get("free"):
        return ("The error detector found no error pattern, but the answer key says this answer is WRONG, so the "
                "label cannot be right. Find the student's real mistake: set llm_agrees_with_label=false, put its "
                "group in llm_suggested_reason_group and explain THAT mistake — the card will show your group. "
                + same_mistake)
    if rg == "CORRECT_NO_ERROR":
        return ("The error detector found no mistake. Explain what the code does correctly. If you clearly see a real "
                "mistake, set llm_agrees_with_label=false and put its group in llm_suggested_reason_group, but keep "
                "the text about the code being correct.")
    if conf is not None and conf < VERIFY_MAX_CONF:
        return (f"The label's confidence is below {VERIFY_MAX_CONF}, so it may be wrong. Check it against the code. "
                "If it fits: set llm_agrees_with_label=true and explain THE LABEL'S mistake. If it clearly does not "
                "fit: set llm_agrees_with_label=false, put the right group in llm_suggested_reason_group and explain "
                "THAT group's mistake instead — the card will then show your group. " + same_mistake)
    return ("Explain THE LABEL'S mistake as it appears in this code. " + same_mistake + " If you think another group "
            "fits better, still explain the label's mistake; only report your view in llm_agrees_with_label=false "
            "and llm_suggested_reason_group.")


def build_prompt(ctx, chunks):
    if ctx.get("free"):
        return build_free_prompt(ctx, chunks)
    q = ctx["question"] or {}
    verdict = "CORRECT" if ctx["is_correct"] else "WRONG"
    rg, conf = ctx["c2_reason_group"], ctx["prediction_confidence"]
    if rg is None:
        label_line = "not applicable (text question, not analysed by the error detector)"
    elif ctx["is_correct"]:
        label_line = f"{rg} (set by the answer key)"
    else:
        conf_txt = f"{conf:.2f}" if conf is not None else "unknown"
        label_line = f"{rg} (Model 3, calibrated confidence {conf_txt})"
    rg_desc = ctx.get("c2_reason_text") or ""
    label_rule = _label_rule(ctx)

    notes = "\n".join(f"[{i + 1}] {c['text']}" for i, c in enumerate(chunks))
    options = " | ".join(q.get("options") or [])
    code_block = ctx["code"] or "(no code: this is a text question)"
    correct_code = build_code(q, q.get("correct_option")) or "(not applicable)"

    return f"""You are a patient Java tutor for first-year university students in Sri Lanka. Explain ONE pre-test answer.

QUESTION ({q.get('topic', '')}): {q.get('question', '')}
CODE TEMPLATE: {q.get('codeTemplate') or '(none)'}
OPTIONS: {options}
CORRECT OPTION (answer key): {q.get('correct_option', '')}
CORRECT CODE: {correct_code}

STUDENT'S CHOSEN OPTION: {ctx['chosen_option']}
STUDENT'S CODE: {code_block}
VERDICT (answer key): {verdict}

ERROR DETECTOR (C2) LABEL: {label_line}
{('LABEL MEANING: ' + rg_desc) if rg_desc else ''}
{_scope_line(rg) if rg and not ctx['is_correct'] else ''}
COMPILER / RUNTIME OUTPUT: {_format_runner(ctx.get('runner_output'))}

REFERENCE NOTES (retrieved from the course knowledge base; use them, do not cite their numbers):
{notes}

RULES
1. {label_rule}
2. If the verdict is CORRECT, explain WHY the chosen option is correct; fix fields say nothing needs fixing; "where" is null; llm_suggested_reason_group is CORRECT_NO_ERROR.
3. If the compiler/runtime output shows the student's code compiles and behaves like the correct code, say so honestly and explain why the answer key still expects "{q.get('correct_option', '')}".
4. Beginner level, friendly tone. Every text field has at most 3 short sentences.
5. "where": the exact wrong token or line copied character-for-character from STUDENT'S CODE, or null.
6. "correct_code": the full corrected code.
7. *_si fields: simple, natural Sinhala in Sinhala script. *_singlish fields: the same meaning in Sinhala written with English letters, the way Sri Lankan students chat (e.g. "meka compile wenne na, mokada..."). In both, keep Java keywords, identifiers, operators and code in English exactly as written (int, boolean, ==, arr.length, break).
8. llm_suggested_reason_group: the single best group from: {', '.join(REASON_GROUPS)}.
9. is_correct must be {str(ctx['is_correct']).lower()}.
10. Before answering, check: does summary_en name the same mistake as rule 1 requires? If not, rewrite it.

Return ONLY one JSON object with exactly these keys:
{json.dumps(REQUIRED_FIELDS)}
"""


def build_free_prompt(ctx, chunks):
    """Prompt for free sandbox code: no question and no answer key; Model 3's label decides."""
    rg, conf = ctx["c2_reason_group"], ctx["prediction_confidence"]
    conf_txt = f"{conf:.2f}" if conf is not None else "unknown"
    rg_desc = ctx.get("c2_reason_text") or ""
    notes = "\n".join(f"[{i + 1}] {c['text']}" for i, c in enumerate(chunks))
    return f"""You are a patient Java tutor for first-year university students in Sri Lanka. A student wrote this Java code in a
practice sandbox (there is no quiz question and no answer key). Explain what the error detector found.

STUDENT'S CODE:
{ctx['code']}

ERROR DETECTOR (Model 3) LABEL: {rg} (calibrated confidence {conf_txt})
{('LABEL MEANING: ' + rg_desc) if rg_desc else ''}
{_scope_line(rg)}
COMPILER / RUNTIME OUTPUT: {_format_runner(ctx.get('runner_output'))}

REFERENCE NOTES (retrieved from the course knowledge base; use them, do not cite their numbers):
{notes}

RULES
1. {_label_rule(ctx)}
2. Beginner level, friendly tone. Every text field has at most 3 short sentences.
3. "where": the exact wrong token or line copied character-for-character from STUDENT'S CODE, or null if there is no mistake.
4. "correct_code": the student's code with the mistake fixed (unchanged if it has no mistake).
5. *_si fields: simple, natural Sinhala in Sinhala script. *_singlish fields: the same meaning in Sinhala written with English letters, the way Sri Lankan students chat. In both, keep Java keywords, identifiers, operators and code in English exactly as written.
6. llm_suggested_reason_group: the single best group from: {', '.join(REASON_GROUPS)}.
7. is_correct must be {str(ctx['is_correct']).lower()}.
8. Before answering, check: does summary_en name the same mistake as rule 1 requires? If not, rewrite it.

Return ONLY one JSON object with exactly these keys:
{json.dumps(REQUIRED_FIELDS)}
"""


# ----------------------------------------------------------------------
# Service
# ----------------------------------------------------------------------

class ExplanationService:
    _cache = None
    _cache_mtime = None
    _memo = {}  # live LLM results for this process: key -> response
    _lock = threading.Lock()
    _llm_blocked_until = 0.0  # circuit breaker (time.monotonic); live requests skip the LLM until then
    _llm_block_reason = None

    # ---------------- cache ----------------

    @classmethod
    def load_cache(cls, path=None):
        path = path or CACHE_PATH
        try:
            mtime = os.path.getmtime(path)
        except OSError:
            cls._cache, cls._cache_mtime = {"items": {}}, None
            return cls._cache
        if cls._cache is None or cls._cache_mtime != mtime:
            with open(path, encoding="utf-8") as f:
                cls._cache = json.load(f)
            cls._cache.setdefault("items", {})
            cls._cache_mtime = mtime
        return cls._cache

    @classmethod
    def lookup_cache(cls, question_id, option, code=None, path=None):
        """Cache entry for (question_id, option), or None. A different code string is a miss."""
        try:
            key = cache_key(question_id, option)
        except (TypeError, ValueError):
            return None
        entry = cls.load_cache(path)["items"].get(key)
        if entry and code and entry.get("code") and _norm_code(code) != _norm_code(entry["code"]):
            return None
        return entry

    # ---------------- context ----------------

    @staticmethod
    def _retriever():
        from ml.component2_error_detection.rag.retriever import get_retriever
        return get_retriever()

    @classmethod
    def get_question(cls, question_id):
        return cls._retriever().get_question(question_id)

    @staticmethod
    def _reason_text(reason_group):
        if not reason_group:
            return ""
        from services.error_service import ErrorService
        d = ErrorService._get_reason_details(reason_group, BROAD_OF_PREFIX.get(reason_group.split("_")[0], "CORRECT"))
        return d["reason"]

    @classmethod
    def run_c2(cls, code, is_correct):
        """C2 label for code without writing history (ErrorService.analyze persist=False)."""
        from services.error_service import ErrorService
        res = ErrorService.analyze({"student_id": "explanation_service", "code": code,
                                    "is_correct_option": bool(is_correct)}, persist=False)
        if not res.get("success"):
            return None
        return {"reason_group": res.get("reason_group"),
                "prediction_confidence": res.get("prediction_confidence"),
                "error_pattern_score": res.get("error_pattern_score"),
                "source": res.get("source")}

    @classmethod
    def build_context(cls, question_id, chosen_option, code=None, is_correct=None, c2_result=None, runner_output=None,
                      run_ml=True):
        question = cls.get_question(question_id)
        warnings = []
        if question:
            key_correct = str(chosen_option) == question["correct_option"]
            if is_correct is not None and bool(is_correct) != key_correct:
                warnings.append("is_correct from the client disagrees with the answer key; using the answer key")
            is_correct = key_correct
            expected_code = build_code(question, chosen_option)
            if not code:
                code = expected_code
        is_correct = bool(is_correct)
        code = code or ""

        c2 = dict(c2_result or {})
        if run_ml and not c2.get("reason_group") and code:
            c2 = cls.run_c2(code, is_correct) or {}
        rg = c2.get("reason_group") or None
        if is_correct and rg:
            rg = "CORRECT_NO_ERROR"  # answer-key gate
        conf = c2.get("prediction_confidence")
        try:
            conf = float(conf) if conf is not None else None
        except (TypeError, ValueError):
            conf = None
        return {
            "question_id": question_id,
            "question": question,
            "chosen_option": chosen_option,
            "code": code,
            "is_correct": is_correct,
            "c2": c2,
            "c2_reason_group": rg,
            "c2_reason_text": cls._reason_text(rg),
            "prediction_confidence": conf,
            "runner_output": runner_output,
            "warnings": warnings,
        }

    @classmethod
    def build_free_context(cls, code, c2_result=None, runner_output=None, run_ml=True):
        """Context for free sandbox code: no question, no answer key; Model 3's label decides."""
        c2 = dict(c2_result or {})
        if run_ml and not c2.get("reason_group"):
            c2 = cls.run_c2(code, False) or {}
        rg = c2.get("reason_group") or None
        try:
            conf = float(c2["prediction_confidence"]) if c2.get("prediction_confidence") is not None else None
        except (TypeError, ValueError):
            conf = None
        prefix = (rg or "").split("_")[0]
        return {
            "free": True,
            "question_id": None,
            "question": None,
            "concept": {"VARIABLE": "Variables", "LOOP": "Loops", "ARRAY": "Arrays", "METHOD": "Methods"}.get(prefix),
            "chosen_option": None,
            "code": code,
            "is_correct": rg == "CORRECT_NO_ERROR",
            "c2": c2,
            "c2_reason_group": rg,
            "c2_reason_text": cls._reason_text(rg),
            "prediction_confidence": conf,
            "runner_output": runner_output,
            "warnings": [],
        }

    @classmethod
    def minimal_context(cls, question_id, chosen_option, code=None, is_correct=None, runner_output=None):
        """Context without the C2 label (ML skipped); without the question too if even that lookup fails."""
        try:
            return cls.build_context(question_id, chosen_option, code, is_correct,
                                     {"reason_group": None, "source": "unavailable"}, runner_output, run_ml=False)
        except Exception:
            return {"question_id": question_id, "question": None, "chosen_option": chosen_option, "code": code or "",
                    "is_correct": bool(is_correct), "c2": {}, "c2_reason_group": None, "c2_reason_text": "",
                    "prediction_confidence": None, "runner_output": runner_output, "warnings": []}

    @classmethod
    def retrieve_chunks(cls, ctx):
        r = cls._retriever()
        q = ctx["question"] or {}
        query = " ".join(filter(None, [q.get("question"), ctx["code"], str(ctx["chosen_option"]),
                                       ctx["c2_reason_group"], ctx.get("c2_reason_text"),
                                       _format_runner(ctx.get("runner_output"))]))
        hits = r.retrieve(query, concept=q.get("topic") or ctx.get("concept"), top_k=TOP_K,
                          types=("reason_group", "concept_note"))
        own = r.by_id.get(f"question:{q.get('id')}")
        if own:
            hits = [{"id": own["id"], "type": own["type"], "concept": own["concept"], "score": None,
                     "text": own["text"]}] + hits
        return hits

    # ---------------- generation ----------------

    @classmethod
    def generate_llm(cls, ctx, timeout=LIVE_TIMEOUT_SECONDS, deadline=None, model=None, max_attempts=2):
        """
        One LLM explanation, validated. max_attempts=2 retries once on invalid JSON
        (cache builder); live requests use max_attempts=1.
        Returns (explanation, meta). Raises LLMError subclasses or ExplanationValidationError.
        `deadline` (time.monotonic) caps the total time spent, retry included.
        """
        chunks = cls.retrieve_chunks(ctx)
        prompt = build_prompt(ctx, chunks)
        last_err = None
        for attempt in range(max_attempts):
            t = timeout
            if deadline is not None:
                t = min(timeout, deadline - time.monotonic())
                if t < 2:
                    raise LLMTimeout("explanation time budget exhausted")
            p = prompt if attempt == 0 else (
                prompt + f"\n\nYOUR PREVIOUS ANSWER WAS INVALID ({last_err}). Return only the corrected JSON object.")
            raw, model_used = call_llm(p, t, model=model)
            try:
                obj = _parse_json(raw)
                clean, warnings = validate_explanation(obj, ctx["code"])
            except (ValueError, ExplanationValidationError) as e:
                last_err = str(e)[:400]
                continue
            clean["is_correct"] = ctx["is_correct"]  # the answer key decides, not the LLM
            correct_code = build_code(ctx["question"], (ctx["question"] or {}).get("correct_option"))
            if correct_code:
                clean["correct_code"] = correct_code
            return clean, {"model": model_used, "attempts": attempt + 1, "warnings": warnings,
                           "retrieved_chunk_ids": [c["id"] for c in chunks], "prompt_version": PROMPT_VERSION}
        raise ExplanationValidationError([f"invalid LLM JSON ({max_attempts} attempt(s)): {last_err}"])

    @classmethod
    def template_explanation(cls, ctx):
        """Explanation from the reason-group templates (no LLM), in EN, Sinhala and Singlish."""
        from services.error_service import ErrorService
        q = ctx["question"] or {}
        correct = q.get("correct_option")
        opt = ctx["chosen_option"]
        rg = ctx["c2_reason_group"]
        if ctx.get("free"):
            return cls._free_template(ctx)
        if ctx["is_correct"]:
            kind = "correct"
            summary = f"Correct! '{opt}' is the right answer."
            why = q.get("explanation") or "Your answer matches the answer key."
            fix = "Nothing to fix."
            tip = "Keep practising this pattern so it becomes automatic."
        elif rg and rg != "CORRECT_NO_ERROR":
            kind = "group"
            d = ErrorService._get_reason_details(rg, BROAD_OF_PREFIX.get(rg.split("_")[0], "CORRECT"))
            summary = f"'{opt}' is not correct here. {d['reason']}"
            # The group template is generic (e.g. it talks about x = x for every
            # VARIABLE_ASSIGNMENT_ISSUE); the best retrieved concept note is specific.
            try:
                note = next((c for c in cls.retrieve_chunks(ctx) if c["type"] == "concept_note"), None)
            except Exception:
                note = None
            why = note["text"].split("\n", 1)[-1] if note else d["misconception"]
            fix = (f"Use '{correct}'. " if correct else "") + d["suggested_fix"]
            tip = d["beginner_explanation"]
        else:
            kind = "text"
            summary = f"'{opt}' is not correct here." + (f" The correct answer is '{correct}'." if correct else "")
            why = q.get("explanation") or "Compare your answer with the correct option."
            fix = f"Choose '{correct}'." if correct else "Review the question and try again."
            tip = "Read each option carefully and test it with a small example."
        where = None
        if not ctx["is_correct"] and opt is not None and ctx["code"] and str(opt) in ctx["code"]:
            where = str(opt)
        expl = {"is_correct": ctx["is_correct"], "summary_en": summary, "where": where, "why_en": why,
                "fix_en": fix, "correct_code": build_code(q, correct) or "", "tip_en": tip,
                "llm_agrees_with_label": None, "llm_suggested_reason_group": None}
        for lang in ("si", "singlish"):
            loc = localised_template(lang, kind, rg, opt=str(opt), correct=correct or "")
            for part in PARTS:
                expl[f"{part}_{lang}"] = loc[part]
        return expl

    @staticmethod
    def _free_template(ctx):
        """Template for free sandbox code: the reason group's text (no answer to compare with)."""
        from services.error_service import ErrorService
        from services.explanation_templates import GROUP_TEXT
        rg = ctx["c2_reason_group"]
        if rg and rg != "CORRECT_NO_ERROR":
            d = ErrorService._get_reason_details(rg, BROAD_OF_PREFIX.get(rg.split("_")[0], "CORRECT"))
            en = {"summary": d["reason"], "why": d["misconception"], "fix": d["suggested_fix"],
                  "tip": d["beginner_explanation"]}
        elif rg:
            en = {"summary": "The error detector found no mistake in this code.",
                  "why": "None of the beginner error patterns it knows appear here.",
                  "fix": "Nothing to fix.",
                  "tip": "Run it with a few different inputs to be sure it behaves as you expect."}
        else:
            en = {"summary": "The error detector could not analyse this code.",
                  "why": "It needs Java statements, methods or a class to look at.",
                  "fix": "Check that the code is Java and try again.",
                  "tip": "Use Run to see compiler messages first."}
        expl = {"is_correct": ctx["is_correct"], "where": None, "correct_code": "",
                "llm_agrees_with_label": None, "llm_suggested_reason_group": None}
        for part in PARTS:
            expl[f"{part}_en"] = en[part]
        if rg in GROUP_TEXT:
            for lang in ("si", "singlish"):
                for part in PARTS:
                    expl[f"{part}_{lang}"] = GROUP_TEXT[rg][lang][part]
        return expl

    @classmethod
    def _response(cls, ctx, expl, source, meta=None, error=None, student_id=None):
        # Free code has no answer key: Model 3's label stands (subject to the low-confidence check).
        final_rg, label_source = choose_final_label(ctx["c2_reason_group"], ctx["prediction_confidence"],
                                                    ctx["is_correct"] and not ctx.get("free"),
                                                    expl if source != "template" else None,
                                                    answer_key=not ctx.get("free"))
        q = ctx["question"] or {}
        languages = ["en"] + (["si", "singlish"] if expl.get("summary_si") else [])
        return {
            "success": True,
            "student_id": student_id,
            "question_id": ctx["question_id"],
            "chosen_option": ctx["chosen_option"],
            "is_correct": ctx["is_correct"],
            "source": source,
            "explanation": expl,
            "languages": languages,
            "code": ctx["code"],
            "question": {"text": q.get("question"), "topic": q.get("topic"), "code_template": q.get("codeTemplate"),
                         "correct_option": q.get("correct_option"), "options": q.get("options")},
            "c2": {k: ctx["c2"].get(k) for k in ("reason_group", "prediction_confidence", "error_pattern_score", "source")},
            "c2_reason_group": ctx["c2_reason_group"],
            "prediction_confidence": ctx["prediction_confidence"],
            "llm_agrees_with_label": expl.get("llm_agrees_with_label"),
            "llm_suggested_reason_group": expl.get("llm_suggested_reason_group"),
            "final_reason_group": final_rg,
            "label_source": label_source,
            "model": (meta or {}).get("model"),
            "generated_at": now_iso() if source == "llm" else None,
            "retrieved_chunk_ids": (meta or {}).get("retrieved_chunk_ids", []),
            "warnings": ctx["warnings"] + (meta or {}).get("warnings", []),
            "llm_error": error,
        }

    # ---------------- circuit breaker (live requests only) ----------------

    @classmethod
    def circuit_open(cls):
        return time.monotonic() < cls._llm_blocked_until

    @classmethod
    def open_circuit(cls, reason):
        cls._llm_blocked_until = time.monotonic() + CIRCUIT_BREAK_SECONDS
        cls._llm_block_reason = reason
        print(f"[WARN] C2 explanation LLM paused for {CIRCUIT_BREAK_SECONDS // 60} min after: {reason}")

    @classmethod
    def generate(cls, ctx, use_llm=True, timeout=LIVE_TIMEOUT_SECONDS, deadline=None, student_id=None, model=None,
                 max_attempts=2, live=False):
        """
        LLM explanation, or the template if the LLM is off / fails / times out / is paused.
        Never raises because of the LLM. live=True: a 429 / quota / 503 opens the
        circuit breaker so later live requests go straight to the template.
        """
        if use_llm and live and cls.circuit_open():
            return cls._response(ctx, cls.template_explanation(ctx), "template",
                                 error=f"LLM paused (circuit breaker) after: {cls._llm_block_reason}",
                                 student_id=student_id)
        if use_llm:
            try:
                expl, meta = cls.generate_llm(ctx, timeout=timeout, deadline=deadline, model=model,
                                              max_attempts=max_attempts)
                return cls._response(ctx, expl, "llm", meta, student_id=student_id)
            except Exception as e:
                if live and isinstance(e, (LLMRateLimited, LLMUnavailable)):
                    cls.open_circuit(f"{type(e).__name__}: {e}")
                print(f"[WARN] C2 explanation LLM failed for q{ctx['question_id']} ({type(e).__name__}): {e}")
                return cls._response(ctx, cls.template_explanation(ctx), "template",
                                     error=f"{type(e).__name__}: {e}", student_id=student_id)
        return cls._response(ctx, cls.template_explanation(ctx), "template", student_id=student_id)

    @classmethod
    def explain(cls, data):
        """
        POST /api/errors/explain: cache hit, else ONE live LLM attempt (15 s), else template.
        Any internal failure still returns a template explanation (success=True).
        mode "free": explain free sandbox code (no question) live — see explain_free.
        mode "live": regenerate THIS question + option now: the cache and the in-process memo
            are neither read nor written; the circuit breaker, timeout and template fallback
            are the same as a normal live request. The response says where it came from
            ("source": "llm" | "template", "mode": "live", "generated_at", "model").
        A cache hit reports the entry's "generated_at" and "model".
        """
        mode = data.get("mode")
        if mode == "free":
            return cls.explain_free(data)
        live_only = mode == "live"
        question_id = data.get("question_id")
        chosen_option = data.get("chosen_option")
        if question_id is None or chosen_option is None:
            return {"success": False, "error": "question_id and chosen_option are required"}
        try:
            int(question_id)
        except (TypeError, ValueError):
            return {"success": False, "error": "question_id must be an integer"}
        chosen_option = str(chosen_option)
        student_id = data.get("student_id")
        code = data.get("code") or ""

        memo_key = (cache_key(question_id, chosen_option), _norm_code(code))
        if not live_only:
            try:
                entry = cls.lookup_cache(question_id, chosen_option, code)
            except Exception as e:  # unreadable cache file: carry on without it
                print(f"[WARN] explanation cache unavailable: {e}")
                entry = None
            if entry and entry.get("response"):
                resp = copy.deepcopy(entry["response"])
                resp.update({"source": "cache", "student_id": student_id,
                             "generated_at": entry.get("generated_at"),
                             "model": entry.get("model") or resp.get("model")})
                return cls._reapply_policy(resp)

            with cls._lock:
                memo = cls._memo.get(memo_key)
            if memo:
                resp = copy.deepcopy(memo)
                resp.update({"source": "cache", "student_id": student_id})
                return cls._reapply_policy(resp)

        c2_result = data.get("c2_result") or {
            k: data.get(k) for k in ("reason_group", "prediction_confidence", "error_pattern_score") if k in data}
        runner = data.get("runner_output") or data.get("compiler_output")
        try:
            ctx = cls.build_context(question_id, chosen_option, code, data.get("is_correct"), c2_result, runner)
        except Exception as e:  # e.g. C2 models failed: explain without a label
            print(f"[WARN] explanation context failed ({type(e).__name__}: {e}); continuing without the C2 label")
            ctx = cls.minimal_context(question_id, chosen_option, code, data.get("is_correct"), runner)
        _, _, configured = llm_status()
        use_llm = configured and EXPLANATION_USE_LLM
        resp = cls.generate(ctx, use_llm=use_llm, timeout=LIVE_TIMEOUT_SECONDS,
                            student_id=student_id, max_attempts=1, live=True)
        if live_only:
            resp["mode"] = "live"
            if not use_llm and not resp.get("llm_error"):
                resp["llm_error"] = "The explanation LLM is not configured or is switched off"
            # LLM failed → keep the cached explanation instead of showing the template.
            if resp.get("source") == "template":
                try:
                    entry = cls.lookup_cache(question_id, chosen_option, code)
                except Exception:
                    entry = None
                if entry and entry.get("response"):
                    cached = copy.deepcopy(entry["response"])
                    cached.update({
                        "source": "cache",
                        "student_id": student_id,
                        "generated_at": entry.get("generated_at"),
                        "model": entry.get("model") or cached.get("model"),
                        "mode": "live",
                        "live_failed": True,
                        "llm_error": resp.get("llm_error"),
                    })
                    return cls._reapply_policy(cached)
        elif resp["source"] == "llm":
            with cls._lock:
                cls._memo[memo_key] = copy.deepcopy(resp)
        return resp

    @staticmethod
    def _reapply_policy(resp):
        """Stored LLM answers (cache / memo) follow the current verification policy."""
        resp["final_reason_group"], resp["label_source"] = choose_final_label(
            resp.get("c2_reason_group"), resp.get("prediction_confidence"), resp.get("is_correct"),
            resp.get("explanation") or None)
        return resp

    @classmethod
    def explain_free(cls, data):
        """Free sandbox code: Model 3 label (from the caller's /analyze result, else run here) and
        ONE live LLM explanation, template on failure. No cache, no memo, no history."""
        code = data.get("code") or ""
        if not code.strip():
            return {"success": False, "error": "code is required"}
        c2_result = data.get("c2_result") or {
            k: data.get(k) for k in ("reason_group", "prediction_confidence", "error_pattern_score") if k in data}
        runner = data.get("runner_output") or data.get("compiler_output")
        try:
            ctx = cls.build_free_context(code, c2_result, runner)
        except Exception as e:  # C2 models failed: explain without a label
            print(f"[WARN] free explanation context failed ({type(e).__name__}: {e}); continuing without the C2 label")
            ctx = cls.build_free_context(code, {"reason_group": None, "source": "unavailable"}, runner, run_ml=False)
        _, _, configured = llm_status()
        resp = cls.generate(ctx, use_llm=configured and EXPLANATION_USE_LLM, timeout=LIVE_TIMEOUT_SECONDS,
                            student_id=data.get("student_id"), max_attempts=1, live=True)
        resp["mode"] = "free"
        return resp

def now_iso():
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")
