"""
Component 2: Error Pattern Detector — Service
===============================================
Implements ML-powered Java error detection using a Two-stage Linear SVM model.
Provides beginner-friendly explanations and gamification payloads.

Hybrid Safety Layer
-------------------
When the ML model returns a Low-confidence prediction, a rule-based
validation pass is executed.  Currently implemented rules:
  • detect_method_argument_mismatch — detects Java arity mismatches
    (method declared with N params but called with M args, N ≠ M)

The response always includes:
  original_ml_label   – raw model output
  final_label         – label after optional rule override
  override_applied    – bool, True when a rule changed the label
  override_reason     – human-readable explanation of the override
"""

import os
import re
import time
import joblib
import datetime
from firebase.firebase_service import db

# Path to the saved models
MODEL_1_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_models", "best_error_detection_model.pkl"))
MODEL_2_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ml_models", "best_reason_detection_model.pkl"))

class ErrorService:
    _model_1 = None
    _model_2 = None
    _history = []  # In-memory history (fallback if Firestore is offline)
    _last_analysis = {} # Store full response of last analysis per user for Component 2 polling
    _history_cache = {} # Cache by student_id: student_id -> {"timestamp": float, "data": list, "source": str}
    _cache_ttl_seconds = 60 # TTL 60 seconds
    _firestore_cooldown_until = 0 # Timestamp until which Firestore reads are skipped on 429
    _firestore_cooldown_duration = 300 # 5 minutes (300 seconds) cooldown
    _last_firestore_warn_time = 0 # Timestamp of last logged warning to avoid log spam


    @classmethod
    def _load_models(cls):
        """Loads both saved Linear SVM models once."""
        if cls._model_1 is None:
            if os.path.exists(MODEL_1_PATH):
                try:
                    cls._model_1 = joblib.load(MODEL_1_PATH)
                except Exception as e:
                    print(f"CRITICAL ERROR loading model 1: {e}")
            else:
                print(f"Model file NOT found at {MODEL_1_PATH}")
                
        if cls._model_2 is None:
            if os.path.exists(MODEL_2_PATH):
                try:
                    cls._model_2 = joblib.load(MODEL_2_PATH)
                except Exception as e:
                    print(f"CRITICAL ERROR loading model 2: {e}")
            else:
                print(f"Model file NOT found at {MODEL_2_PATH}")
                
        return cls._model_1, cls._model_2

    @staticmethod
    def clean_java_code(code):
        """Preprocesses Java code to match training data format."""
        if not code:
            return ""
        # Remove block comments
        code = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        # Remove line comments
        code = re.sub(r'//.*', '', code)
        # Remove import statements
        code = re.sub(r'import\s+.*?;', '', code)
        # Remove package statements
        code = re.sub(r'package\s+.*?;', '', code)
        # Clean whitespaces inside square brackets to handle copy-paste visual wraps
        code = re.sub(r'\[([^]]+)\]', lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', code)
        # Normalize whitespace (replace tabs/newlines with single space)
        code = re.sub(r'\s+', ' ', code)
        return code.strip()

    @staticmethod
    def validate_java_submission(code):
        if not code or not code.strip():
            return {
                "valid": False,
                "reason": "Empty input."
            }

        text = code.strip()

        java_patterns = [
            r"\bpublic\s+class\b",
            r"\bclass\s+\w+",
            r"\bpublic\s+static\s+void\s+main\b",
            r"\bstatic\s+(int|void|double|float|String|boolean|char)\s+\w+\s*\(",
            r"\b(int|double|float|String|boolean|char)\s+\w+\s*=",
            r"\bint\s*\[\]\s+\w+\s*=",
            r"\bfor\s*\(",
            r"\bwhile\s*\(",
            r"\bSystem\.out\.println\s*\("
        ]

        for pattern in java_patterns:
            if re.search(pattern, text):
                return {
                    "valid": True,
                    "reason": "Java-like structure detected."
                }

        return {
            "valid": False,
            "reason": "Input does not contain recognizable Java code structure."
        }

    # ------------------------------------------------------------------
    # Rule-Based Safety Layer
    # ------------------------------------------------------------------

    @staticmethod
    def detect_obviously_correct_java(code):
        if not code:
            return {"is_correct": False, "reason": "No code provided", "matched_pattern": None}

        stripped = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        stripped = re.sub(r'//.*', '', stripped)
        # Clean whitespaces inside square brackets to handle copy-paste visual wraps
        stripped = re.sub(r'\[([^]]+)\]', lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', stripped)

        # 1. Method argument mismatch exists
        mismatch_res = ErrorService.detect_method_argument_mismatch(code)
        if mismatch_res.get("mismatch_found"):
            return {"is_correct": False, "reason": "Method argument mismatch found", "matched_pattern": "method_argument_mismatch"}

        # 2. Array length used directly as index
        if re.search(r'\b\w+\s*\[\s*\w+\.length\s*\]', stripped):
            return {"is_correct": False, "reason": "Array length used directly as index", "matched_pattern": "array_length_index"}

        # 3. Direct array out-of-bounds when simple literal array is available
        literal_arrays = re.findall(r'int\s*\[\]\s+(\w+)\s*=\s*\{([^}]+)\}', stripped)
        for arr_name, elements in literal_arrays:
            num_elements = len([e for e in elements.split(',') if e.strip()])
            accesses = re.findall(r'\b' + re.escape(arr_name) + r'\s*\[\s*(\d+)\s*\]', stripped)
            for acc in accesses:
                if int(acc) >= num_elements:
                    return {"is_correct": False, "reason": "Direct array out-of-bounds access detected", "matched_pattern": "array_out_of_bounds"}

        # 4. Loop boundary issues (off-by-one / <= array length access check)
        if re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*\w+\.length', stripped) or re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*[^;]+;', stripped):
            return {"is_correct": False, "reason": "Loop boundary issue (off-by-one `<=` comparison risk)", "matched_pattern": "loop_boundary_risk"}
        
        # Loop starting at 1 instead of 0
        if re.search(r'for\s*\(\s*int\s+\w+\s*=\s*1\s*;', stripped):
            return {"is_correct": False, "reason": "Loop counter starting at 1 instead of 0", "matched_pattern": "loop_start_at_1"}

        # For loop has an empty update expression
        if re.search(r'for\s*\([^;]+;\s*[^;]+;\s*\)', stripped):
            return {"is_correct": False, "reason": "For-loop update expression is missing", "matched_pattern": "for_empty_update"}

        # 5. Infinite loop detection
        while_true_loops = re.findall(r'while\s*\(\s*(true|1)\s*\)\s*\{([^}]*)\}', stripped)
        for condition, body in while_true_loops:
            if not re.search(r'\bbreak\b', body):
                return {"is_correct": False, "reason": "Infinite while loop has no break statement", "matched_pattern": "infinite_loop_no_break"}

        # 6. While loop uses counter but no counter update inside body
        while_loops = re.findall(r'while\s*\(([^)]+)\)\s*\{([^}]*)\}', stripped)
        for condition, body in while_loops:
            if re.search(r'\b\w+\s*(?:<|<=|>|>=|!=|==)\s*\d+', condition):
                if not re.search(r'\+\+|--|\+=|-=|=', body):
                    return {"is_correct": False, "reason": "While loop has no counter variable update inside the body", "matched_pattern": "while_no_update"}

        # 7. Discount calculation uses wrong operator (not subtraction)
        wrong_discount = re.search(r'\b\w+\s*([\+\*\/])\s*\w*discount\w*', stripped, re.IGNORECASE)
        if wrong_discount:
            op = wrong_discount.group(1)
            reason = f"Discount variable is used with '{op}' instead of being subtracted"
            return {"is_correct": False, "reason": reason, "matched_pattern": "discount_wrong_operator"}
        
        wrong_discount2 = re.search(r'\b\w*discount\w*\s*([\+\*\/])\s*\w+', stripped, re.IGNORECASE)
        if wrong_discount2:
            op = wrong_discount2.group(1)
            reason = f"Discount variable is used with '{op}' instead of being subtracted"
            return {"is_correct": False, "reason": reason, "matched_pattern": "discount_wrong_operator"}

        # 8. Method named add returns subtraction
        add_methods = re.findall(r'(?:int|double|float|long)\s+add\s*\([^)]*\)\s*\{([^}]+)\}', stripped)
        for body in add_methods:
            if '-' in body and '+' not in body:
                return {"is_correct": False, "reason": "Method named add performs subtraction instead of addition", "matched_pattern": "add_returns_subtraction"}

        # 9. Void method returns a value, or non-void method missing return
        if re.search(r'\bvoid\b[^{]+\{[^}]*\breturn\b[^;]+;', stripped):
            return {"is_correct": False, "reason": "Void method attempts to return a value", "matched_pattern": "void_method_returns_value"}
        
        non_void_methods = re.findall(r'\b(int|double|float|long|boolean|String)\b\s+[a-zA-Z_]\w*\s*\([^)]*\)\s*\{([^}]+)\}', stripped)
        for m_type, body in non_void_methods:
            if "return" not in body:
                return {"is_correct": False, "reason": "Non-void method is missing a return statement", "matched_pattern": "non_void_method_missing_return"}

        # 10. Self-assignment pattern check
        if re.search(r'\b(\w+)\s*=\s*\1\s*;', stripped):
            return {"is_correct": False, "reason": "Self-assignment detected (e.g. x = x)", "matched_pattern": "self_assignment"}

        # Safe patterns list (Strict fullmatch to avoid false positives on partial snippets)
        safe_patterns = [
            (r'^\s*int\s+[a-zA-Z_$][\w$]*\s*=\s*\d+\s*;\s*$', "simple valid integer declaration"),
            (r'^\s*boolean\s+[a-zA-Z_$][\w$]*\s*=\s*(true|false)\s*;\s*$', "simple valid boolean declaration"),
            (r'^\s*int\s+[a-zA-Z_$][\w$]*\s*=\s*\d+\s*;\s*if\s*\(\s*[a-zA-Z_$][\w$]*\s*==\s*\d+\s*\)\s*\{\s*System\.out\.println\([^)]*\)\s*;\s*\}\s*$', "valid if-condition equality check"),
            (r'^\s*int\s+a\s*=\s*10\s*;\s*int\s+b\s*=\s*a\+\+\s*;\s*System\.out\.println\([^)]*\)\s*;\s*$', "valid post-increment logic"),
            (r'^\s*\w+\s*=\s*\w+\s*[-+*/]\s*\w+\s*;\s*$', "simple variable calculation with normal arithmetic"),
            (r'^\s*\w+\s*\([^)]*\)\s*;\s*$', "simple method call"),
            (r'^\s*\w+\s*\[\s*\d+\s*\]\s*;\s*$', "simple array access with valid constant index"),
            (r'^\s*while\s*\([^)]+\)\s*\{[^}]*(\+\+|--|\+=|-=|=)[^}]*\}\s*$', "simple while loop with counter update"),
            (r'^\s*for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*[^;]+\s*;\s*\1\s*\+\+\s*\)\s*\{[^}]*\}\s*$', "standard for-loop with safe iteration"),
            (r'^\s*System\.out\.println\s*\(\s*[^)]+\s*\)\s*;\s*$', "simple print statement with valid variable"),
            (r'^\s*(?:int|double|float|boolean|String|char)\s+\w+\s*=\s*[^;]+;\s*$', "simple variable declaration and initialization"),
            (r'^\s*(?:int|double|float|boolean|String|char)\s*\[\s*\]\s+\w+\s*=\s*(?:\{[^}]*\}|new\s+[^;]+)\s*;\s*$', "simple array declaration and initialization"),
            (r'^\s*(?:public|private|protected|static|\s)*(?:void|int|double|String)\s+\w+\s*\([^)]*\)\s*\{[^}]*\}\s*$', "simple valid method definition")
        ]
        
        has_simple_pattern = False
        reason = ""
        pattern_name = ""
        
        for pattern, desc in safe_patterns:
            if re.fullmatch(pattern, stripped.strip()):
                has_simple_pattern = True
                reason = desc
                pattern_name = desc.replace(" ", "_")
                break
                
        if has_simple_pattern:
            return {"is_correct": True, "reason": reason, "matched_pattern": pattern_name}

        return {"is_correct": False, "reason": "Code does not match any obvious correct patterns; deferring to ML model.", "matched_pattern": "unknown"}

    @staticmethod
    def detect_method_argument_mismatch(code):
        """
        Scans raw Java source for arity mismatches between a method
        declaration and its call sites.
        """
        if not code:
            return {"mismatch_found": False}

        stripped = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        stripped = re.sub(r'//.*', '', stripped)

        decl_pattern = re.compile(
            r'\b(?:public|private|protected|static|final|synchronized|\s)*'
            r'(?:void|int|long|double|float|boolean|char|byte|short|String'
            r'|[A-Z][\w<>\[\]]*)'
            r'\s+'
            r'(?P<mname>[a-z][\w]*)'
            r'\s*\((?P<params>[^)]*)\)',
            re.MULTILINE
        )

        declarations = {}
        for m in decl_pattern.finditer(stripped):
            name = m.group('mname')
            params_str = m.group('params').strip()
            if params_str == '':
                param_count = 0
            else:
                param_count = len([p for p in params_str.split(',') if p.strip()])
            declarations.setdefault(name, set()).add(param_count)

        if not declarations:
            return {"mismatch_found": False}

        for method_name, declared_param_counts in declarations.items():
            call_pattern = re.compile(
                r'\b' + re.escape(method_name) + r'\s*\((?P<args>[^)]*)\)',
                re.MULTILINE
            )
            for call_match in call_pattern.finditer(stripped):
                args_str = call_match.group('args').strip()
                if args_str == '':
                    call_arg_count = 0
                else:
                    call_arg_count = len([a for a in args_str.split(',') if a.strip()])

                if call_arg_count not in declared_param_counts:
                    declared_count = next(iter(declared_param_counts))
                    reason = (
                        f"The method '{method_name}' is declared with "
                        f"{declared_count} parameter(s), but called with "
                        f"{call_arg_count} argument(s)."
                    )
                    return {
                        "mismatch_found": True,
                        "method_name": method_name,
                        "declared_params": declared_count,
                        "called_args": call_arg_count,
                        "reason": reason
                    }

        return {"mismatch_found": False}

    @staticmethod
    def _extract_evidence(code, reason_group):
        """Extracts a supporting code snippet based on the predicted reason_group."""
        if not code:
            return {"evidence_found": False, "matched_snippet": "", "evidence_note": "No code provided."}
            
        stripped = re.sub(r'/\*.*?\*/', '', code, flags=re.DOTALL)
        stripped = re.sub(r'//.*', '', stripped)
        # Clean whitespaces inside square brackets to handle copy-paste visual wraps
        stripped = re.sub(r'\[([^]]+)\]', lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', stripped)
        
        snippet = ""
        note = ""
        
        if reason_group == "ARRAY_BOUNDARY_INDEX_ISSUE":
            m = re.search(r'\b\w+\s*\[\s*\w+\.length\s*\]', stripped)
            if m: snippet = m.group(0)
            note = "Found array access using .length directly as an index."
            
        elif reason_group == "LOOP_BOUNDARY_ISSUE":
            m = re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*[^;]+;', stripped)
            if m: snippet = m.group(0) + " ... )"
            note = "Found loop condition using '<=' which may cause off-by-one errors."
            
        elif reason_group == "LOOP_CONTROL_FLOW_ISSUE":
            m = re.search(r'while\s*\(\s*true\s*\)', stripped)
            if m: snippet = m.group(0)
            note = "Found an infinite loop condition."
            
        elif reason_group == "LOOP_UPDATE_ISSUE":
            m = re.search(r'for\s*\([^;]+;\s*[^;]+;\s*\)', stripped)
            if m: snippet = m.group(0)
            note = "Found a for-loop with an empty update expression."
            
        elif reason_group == "METHOD_RETURN_ISSUE":
            m = re.search(r'\bvoid\b[^{]+\{[^}]*\breturn\b[^;]+;', stripped)
            if m: 
                snippet = m.group(0)
                note = "Found a return statement with a value in a void method."
            else:
                m = re.search(r'\b(int|long|double|float|boolean|String)\b[^{]+\{[^}]*\}', stripped)
                if m and "return" not in m.group(0):
                    snippet = m.group(0)[:50] + "..."
                    note = "Found a method with a return type but no return statement."
                    
        elif reason_group == "VARIABLE_ASSIGNMENT_ISSUE":
            m = re.search(r'\b(\w+)\s*=\s*\1\s*;', stripped)
            if m: snippet = m.group(0)
            note = "Found self-assignment of a variable."
            
        elif reason_group == "VARIABLE_CALCULATION_ISSUE":
            m = re.search(r'\b\w+\s*\+\s*\w*discount\w*', stripped, re.IGNORECASE)
            if m: snippet = m.group(0)
            note = "Found addition involving a discount variable instead of subtraction."

        if snippet:
            return {"evidence_found": True, "matched_snippet": snippet.strip(), "evidence_note": note}
            
        return {"evidence_found": False, "matched_snippet": "", "evidence_note": "No explicit code snippet could be cleanly extracted, but the ML model detected abstract patterns supporting this reason."}

    # ------------------------------------------------------------------
    # XAI Helpers (Feature 2 — Explainable AI)
    # ------------------------------------------------------------------

    @staticmethod
    def _compute_confidence_pct(confidence_level, decision_scores=None):
        """
        Converts the qualitative confidence level to a numeric percentage.
        Uses raw decision_function scores when available for a finer estimate.
        """
        if decision_scores is not None:
            try:
                raw = float(max(decision_scores))
                # Map decision margin → percentage (clamped 35–97)
                pct = min(97, max(35, int(50 + raw * 22)))
                return pct
            except Exception:
                pass
        # Fallback when decision_function is unavailable
        return {"High": 87, "Medium": 64, "Low": 42}.get(confidence_level, 64)

    @staticmethod
    def _generate_xai_explanation(code, reason_group, final_label, confidence_level, decision_scores=None, recalibrated_confidence_pct=None):
        """
        Feature 2 — Explainable AI (XAI)
        =================================
        Synthesises a structured, human-readable explanation for the ML prediction
        by combining:
          • reason-group-specific regex pattern checks on the submitted code
          • decision_function confidence score
          • existing evidence and model trace signals

        Returns:
            dict:
              xai_label          – human-readable error category name
              xai_confidence_pct – numeric confidence percentage (0–100)
              xai_bullet_points  – list of dicts { icon: str, text: str }
              xai_narrative      – 2-3 sentence plain-English explanation
              xai_code_signals   – list of detected code pattern descriptions
        """
        stripped = re.sub(r'/\*.*?\*/', '', code or '', flags=re.DOTALL)
        stripped = re.sub(r'//.*', '', stripped)
        # Clean whitespaces inside square brackets to handle copy-paste visual wraps
        stripped = re.sub(r'\[([^]]+)\]', lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', stripped)

        if recalibrated_confidence_pct is not None:
            confidence_pct = recalibrated_confidence_pct
        else:
            confidence_pct = ErrorService._compute_confidence_pct(confidence_level, decision_scores)

        label_names = {
            "LOOP_ERROR":     "Loop Logic Error",
            "VARIABLE_ERROR": "Variable Usage Error",
            "ARRAY_ERROR":    "Array Boundary Error",
            "METHOD_ERROR":   "Method Signature Error",
            "CORRECT":        "No Error Detected",
        }
        xai_label = label_names.get(final_label, final_label.replace("_", " ").title())

        bullets, signals, narrative = [], [], ""

        # ── ARRAY errors ───────────────────────────────────────────────
        if reason_group == "ARRAY_BOUNDARY_INDEX_ISSUE":
            if re.search(r'\b\w+\s*\[\s*\w+\.length\s*\]', stripped):
                bullets.append({"icon": "🔴", "text": "Array accessed using `.length` directly as index — this is always out of bounds."})
                signals.append("array[array.length] access detected")
            if re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*\w+\.length', stripped):
                bullets.append({"icon": "🔴", "text": "Loop uses `<= array.length` — valid indices are 0 to length−1."})
                signals.append("loop boundary includes .length (off-by-one)")
            if re.search(r'\b\w+\s*\[\s*\d+\s*\]', stripped):
                bullets.append({"icon": "🟡", "text": "Constant index detected — verify it is within bounds."})
                signals.append("constant array index access")
            if not bullets:
                bullets.append({"icon": "🔴", "text": "ML detected an array indexing pattern consistent with a boundary violation."})
                bullets.append({"icon": "🟡", "text": "Java arrays are 0-indexed: valid range is index 0 to length−1."})
            narrative = (
                f"The model classified this as an Array Boundary Error with {confidence_pct}% confidence. "
                "Patterns consistent with out-of-bounds array access were detected. "
                "The most common cause is using the array's length directly as the last valid index."
            )

        elif reason_group == "ARRAY_TRAVERSAL_ISSUE":
            if re.search(r'for\s*\([^;]+;\s*[^;]+;\s*\)', stripped):
                bullets.append({"icon": "🔴", "text": "For-loop has an empty update expression — the counter never advances."})
                signals.append("for-loop with empty update clause")
            bullets.append({"icon": "🟡", "text": "Array traversal detected — ensure all elements are visited exactly once."})
            bullets.append({"icon": "🔵", "text": "Standard pattern: `for (int i = 0; i < arr.length; i++)`"})
            narrative = (
                f"The model detected an array traversal issue with {confidence_pct}% confidence. "
                "The loop structure does not correctly iterate over all array elements. "
                "Check the starting index, boundary condition, and counter update."
            )

        # ── LOOP errors ────────────────────────────────────────────────
        elif reason_group == "LOOP_BOUNDARY_ISSUE":
            if re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*[^;]+;', stripped):
                bullets.append({"icon": "🔴", "text": "Loop uses `<=` — this runs one extra iteration (off-by-one error)."})
                signals.append("'<=' in loop boundary condition")
            if re.search(r'for\s*\(\s*int\s+\w+\s*=\s*1\s*;', stripped):
                bullets.append({"icon": "🟡", "text": "Loop counter starts at 1 — may skip the first element (index 0)."})
                signals.append("loop counter initialised at 1 instead of 0")
            if not bullets:
                bullets.append({"icon": "🔴", "text": "The loop executes one too many or one too few iterations."})
                bullets.append({"icon": "🟡", "text": "Check start value, stopping condition (`<` vs `<=`), and step."})
            narrative = (
                f"The model classified this as a Loop Boundary Error with {confidence_pct}% confidence. "
                "Using `<=` instead of `<` causes the loop to overrun its intended range. "
                "Trace through the first and last iterations manually to confirm correctness."
            )

        elif reason_group == "LOOP_CONDITION_ISSUE":
            bullets.append({"icon": "🔴", "text": "The loop condition does not correctly control when the loop starts or stops."})
            if re.search(r'while\s*\(\s*(true|1)\s*\)', stripped):
                bullets.append({"icon": "🔴", "text": "`while(true)` detected — loop will not naturally terminate."})
                signals.append("while(true) pattern")
            bullets.append({"icon": "🟡", "text": "A loop condition must eventually evaluate to `false` for the loop to exit."})
            narrative = (
                f"The model detected a loop condition problem with {confidence_pct}% confidence. "
                "The condition controlling the loop either prevents it from running or never becomes false. "
                "Ensure your condition accurately reflects when the loop should end."
            )

        elif reason_group == "LOOP_CONTROL_FLOW_ISSUE":
            if re.search(r'while\s*\(\s*(true|1)\s*\)', stripped):
                bullets.append({"icon": "🔴", "text": "`while(true)` detected — runs indefinitely without a `break`."})
                signals.append("while(true) without break")
            if not re.search(r'\bbreak\b', stripped):
                bullets.append({"icon": "🔴", "text": "No `break` statement found — the loop has no exit path."})
                signals.append("no break in loop body")
            bullets.append({"icon": "🟡", "text": "Every infinite-loop construct needs a conditional `break` to exit safely."})
            narrative = (
                f"The model detected an infinite loop risk with {confidence_pct}% confidence. "
                "The loop contains a condition that is always true and lacks a `break` statement. "
                "Add a `break` or update the condition variable to ensure the loop terminates."
            )

        elif reason_group == "LOOP_UPDATE_ISSUE":
            if re.search(r'for\s*\([^;]+;\s*[^;]+;\s*\)', stripped):
                bullets.append({"icon": "🔴", "text": "For-loop has an empty update clause — counter is never changed."})
                signals.append("for-loop empty update expression")
            while_blocks = re.findall(r'while\s*\(([^)]+)\)\s*\{([^}]*)\}', stripped)
            for cond, body in while_blocks:
                if re.search(r'\b\w+\s*(?:<|<=|>|>=|!=|==)\s*\d+', cond):
                    if not re.search(r'\+\+|--|\+=|-=', body):
                        bullets.append({"icon": "🔴", "text": "While-loop counter not updated inside the body — infinite loop risk."})
                        signals.append("while-loop body missing counter increment")
            if not bullets:
                bullets.append({"icon": "🔴", "text": "The loop variable is not updated — the condition never becomes false."})
            bullets.append({"icon": "🟡", "text": "Add `i++`, `i--`, or `i += n` to ensure the loop progresses."})
            narrative = (
                f"The model detected a loop update problem with {confidence_pct}% confidence. "
                "The loop counter or control variable is never modified, causing an infinite loop. "
                "Ensure the variable changes with every iteration."
            )

        # ── METHOD errors ──────────────────────────────────────────────
        elif reason_group == "METHOD_RETURN_ISSUE":
            if re.search(r'\bvoid\b[^{]+\{[^}]*\breturn\b[^;]+;', stripped):
                bullets.append({"icon": "🔴", "text": "A `void` method contains a `return` with a value — void methods cannot return values."})
                signals.append("return-with-value inside void method")
            else:
                m = re.search(r'\b(int|long|double|float|boolean|String)\b[^{]+\{[^}]*\}', stripped)
                if m and "return" not in m.group(0):
                    bullets.append({"icon": "🔴", "text": "A typed (non-void) method is missing a `return` statement."})
                    signals.append("non-void method missing return")
            bullets.append({"icon": "🟡", "text": "Match the declared return type to what the method actually returns."})
            bullets.append({"icon": "🔵", "text": "Use `System.out.println()` to print; use `return` to send a value back to the caller."})
            narrative = (
                f"The model classified this as a Method Return Error with {confidence_pct}% confidence. "
                "The method's declared return type and its actual return behaviour are inconsistent. "
                "Ensure every code path returns the correct type."
            )

        elif reason_group == "METHOD_SIGNATURE_ISSUE":
            mismatch = ErrorService.detect_method_argument_mismatch(code)
            if mismatch.get("mismatch_found"):
                bullets.append({"icon": "🔴", "text": (
                    f"Method `{mismatch['method_name']}` declared with {mismatch['declared_params']} "
                    f"parameter(s) but called with {mismatch['called_args']} argument(s)."
                )})
                signals.append(f"arity mismatch: declared={mismatch['declared_params']}, called={mismatch['called_args']}")
            bullets.append({"icon": "🟡", "text": "Argument count in the call must match the parameter count in the declaration."})
            bullets.append({"icon": "🔵", "text": "Compare the method signature with every call site — count must agree."})
            narrative = (
                f"The model detected a method signature mismatch with {confidence_pct}% confidence. "
                "The method is called with a different number of arguments than it declares. "
                "Update either the declaration or the call site to make them consistent."
            )

        elif reason_group == "METHOD_PARAMETER_USAGE_ISSUE":
            bullets.append({"icon": "🔴", "text": "One or more method parameters appear unused or incorrectly used inside the body."})
            bullets.append({"icon": "🟡", "text": "Every declared parameter should contribute to the computation or return value."})
            bullets.append({"icon": "🔵", "text": "Trace each parameter through the method body and verify it affects the result."})
            narrative = (
                f"The model detected a parameter usage problem with {confidence_pct}% confidence. "
                "The method receives values through its parameters but does not use them correctly. "
                "Trace each parameter and confirm it is applied where intended."
            )

        # ── VARIABLE errors ────────────────────────────────────────────
        elif reason_group == "VARIABLE_ASSIGNMENT_ISSUE":
            if re.search(r'\b(\w+)\s*=\s*\1\s*;', stripped):
                bullets.append({"icon": "🔴", "text": "Self-assignment detected (e.g. `x = x`) — has no effect on the value."})
                signals.append("self-assignment x = x detected")
            bullets.append({"icon": "🟡", "text": "Ensure the variable receives a distinct, meaningful value on the right-hand side."})
            bullets.append({"icon": "🔵", "text": "Java requires all local variables to be initialised before they are read."})
            narrative = (
                f"The model classified this as a Variable Assignment Error with {confidence_pct}% confidence. "
                "The variable is being assigned to itself or in a logically incorrect way. "
                "Check that the right-hand side provides the intended new value."
            )

        elif reason_group == "VARIABLE_CALCULATION_ISSUE":
            wrong_op = re.search(r'\b\w+\s*([\+\*\/])\s*\w*discount\w*', stripped, re.IGNORECASE) or re.search(r'\b\w*discount\w*\s*([\+\*\/])\s*\w+', stripped, re.IGNORECASE)
            if wrong_op:
                op = wrong_op.group(1)
                bullets.append({"icon": "🔴", "text": f"Discount is being applied with '{op}' instead of being subtracted."})
                signals.append(f"discount wrong operator '{op}'")
            add_methods = re.findall(r'(?:int|double|float|long)\s+add\s*\([^)]*\)\s*\{([^}]+)\}', stripped)
            for body in add_methods:
                if '-' in body and '+' not in body:
                    bullets.append({"icon": "🔴", "text": "Method named `add` performs subtraction instead of addition."})
                    signals.append("add() body contains subtraction not addition")
            if not bullets:
                bullets.append({"icon": "🔴", "text": "A calculation uses the wrong operator (e.g. `+` where `−` is needed)."})
            bullets.append({"icon": "🟡", "text": "Verify each operator (+, -, *, /) reflects the intended mathematical operation."})
            narrative = (
                f"The model classified this as a Variable Calculation Error with {confidence_pct}% confidence. "
                "A calculation in the code uses an incorrect arithmetic operator. "
                "Review each expression and confirm the operator matches the intended semantics."
            )

        elif reason_group == "CORRECT_NO_ERROR":
            bullets.append({"icon": "✅", "text": "No common beginner error patterns were detected."})
            bullets.append({"icon": "✅", "text": "The code structure appears logically sound."})
            bullets.append({"icon": "🔵", "text": "Continue practising to reinforce this pattern."})
            narrative = (
                f"The model classified this submission as correct with {confidence_pct}% confidence. "
                "No error signatures associated with common beginner mistakes were detected. "
                "Well done — move on to the next challenge."
            )

        else:
            # Generic fallback for any unmapped reason group
            bullets.append({"icon": "🔴", "text": f"The ML model detected a pattern consistent with {final_label.replace('_', ' ').title()}."})
            bullets.append({"icon": "🟡", "text": "Review the Repair Strategy and Beginner Insight below for targeted guidance."})
            narrative = (
                f"The model identified a {final_label.replace('_', ' ').lower()} with {confidence_pct}% confidence. "
                "Review the explanation and suggested fix for correction advice."
            )

        concept_names = {
            "LOOP_ERROR": "Loops",
            "VARIABLE_ERROR": "Variables",
            "ARRAY_ERROR": "Arrays",
            "METHOD_ERROR": "Methods",
            "CORRECT": "General"
        }
        concept = concept_names.get(final_label, "General")
        
        # Dynamic why_not_correct
        if final_label == "CORRECT":
            why_not_correct = "No error detected. The submission behaves correctly."
        else:
            why_not_correct = f"This code was not marked correct because a logic mistake was detected under the {concept} concept, specifically flagged as {reason_group.replace('_', ' ').title()}."

        # Debugging steps mapping
        steps_map = {
            "ARRAY_BOUNDARY_INDEX_ISSUE": [
                "1. Locate where the array is indexed (e.g., arr[index]).",
                "2. Check if you are accessing arr[arr.length]. Remember that Java arrays are 0-indexed.",
                "3. Adjust the index boundary by subtracting 1 (arr[arr.length - 1]) to safely access the last item."
            ],
            "ARRAY_TRAVERSAL_ISSUE": [
                "1. Inspect the loop header controlling the array traversal.",
                "2. Ensure the condition is strictly 'i < arr.length' (strictly less than length) and not '<='.",
                "3. Double-check that your index counter is updated inside the loop header or body."
            ],
            "LOOP_BOUNDARY_ISSUE": [
                "1. Find the loop boundary condition (usually in the middle of the loop header).",
                "2. If you are starting at 0, using '<=' instead of '<' will execute the loop one extra time.",
                "3. Change the condition to '<' to avoid off-by-one index overruns."
            ],
            "LOOP_CONDITION_ISSUE": [
                "1. Review the condition in your loop header (e.g. while(condition)).",
                "2. Make sure it starts as true so the loop runs, and eventually evaluates to false so the loop terminates.",
                "3. Verify that the variables used in the condition are properly modified inside the loop."
            ],
            "LOOP_CONTROL_FLOW_ISSUE": [
                "1. Check if the loop has a clear exit condition and a reachable 'break;' statement.",
                "2. If using 'while(true)', trace the flow to ensure the break statement runs when needed.",
                "3. Make sure there are no unreachable statements after a break/continue."
            ],
            "LOOP_UPDATE_ISSUE": [
                "1. Find the loop counter variable in the condition.",
                "2. Verify that this variable is incremented/decremented (e.g., i++ or i--) inside the loop.",
                "3. If inside a while-loop, confirm the increment statement exists at the end of the body."
            ],
            "METHOD_RETURN_ISSUE": [
                "1. Check the declared return type in your method header (e.g., void, int, String).",
                "2. If the return type is void, ensure there are no return statements that return values.",
                "3. If the return type is non-void, verify that every execution path contains a return statement."
            ],
            "METHOD_SIGNATURE_ISSUE": [
                "1. Locate the declared method header and count its parameters.",
                "2. Locate the place in your code where the method is called and count the arguments passed.",
                "3. Update the declaration or call to make the parameter and argument counts match."
            ],
            "METHOD_PARAMETER_USAGE_ISSUE": [
                "1. Check the list of parameters declared in your method signature.",
                "2. Confirm that every parameter is referenced and used in the method body.",
                "3. Make sure you do not declare a local variable that hides the parameter name."
            ],
            "VARIABLE_ASSIGNMENT_ISSUE": [
                "1. Check the assignment statements in your code (e.g., x = y;).",
                "2. Ensure you are not assigning a variable to itself (e.g., x = x;).",
                "3. Check that the variable on the right-hand side has been initialized before reading it."
            ],
            "VARIABLE_CALCULATION_ISSUE": [
                "1. Examine mathematical calculations in your code (e.g., adding discount).",
                "2. If subtracting a discount, use the subtraction operator (-) instead of addition (+).",
                "3. Trace math operations with simple trace values to verify correctness."
            ],
            "CORRECT_NO_ERROR": [
                "1. Logic is clean and behaves as expected.",
                "2. Continue practice on the next challenges."
            ]
        }
        explanation_steps = steps_map.get(reason_group, [
            "1. Locate the flagged concept and matching code evidence.",
            "2. Refer to the recommended repair strategy.",
            "3. Correct the mistake and run the diagnostic again."
        ])

        return {
            "xai_label":          xai_label,
            "xai_confidence_pct": confidence_pct,
            "xai_bullet_points":  bullets,
            "xai_narrative":      narrative,
            "xai_code_signals":   signals,
            "why_not_correct":    why_not_correct,
            "explanation_steps":  explanation_steps
        }

    @classmethod
    def analyze(cls, data):
        """
        Detect error patterns in submitted code using Two-stage Linear SVM models
        backed by a rule-based safety layer.
        """
        student_id = data.get("student_id", "anonymous")
        code = data.get("code", "")
        pretest = data.get("pretest_results", {})

        validation = cls.validate_java_submission(code)

        if not validation["valid"]:
            return {
                "success": False,
                "error_type": "INVALID_JAVA_INPUT",
                "error": "The submitted text does not appear to be valid Java code.",
                "message": "Please enter a valid Java class, method, variable declaration, loop, array declaration, or Java code snippet.",
                "validation_reason": validation["reason"]
            }

        model_1, model_2 = cls._load_models()
        if not model_1 or not model_2:
            return {"success": False, "error": "ML Models not available on backend"}

        # ------------------------------------------------------------------
        # Step 1 — ML predictions
        # ------------------------------------------------------------------
        cleaned_code = cls.clean_java_code(code)
        decision_scores_raw = None  # raw decision_function output, used for XAI confidence %
        try:
            ml_label = model_1.predict([cleaned_code])[0]
            reason_group = model_2.predict([cleaned_code])[0]

            confidence = "Medium"
            if hasattr(model_1, "decision_function"):
                decision_scores_raw = model_1.decision_function([cleaned_code])[0]
                if max(decision_scores_raw) > 1.0:
                    confidence = "High"
                elif max(decision_scores_raw) < 0.3:
                    confidence = "Low"
        except Exception as e:
            return {"success": False, "error": f"Prediction failed: {str(e)}"}

        # ------------------------------------------------------------------
        # Step 1.5 — Hybrid Confidence Recalibration Layer
        # ------------------------------------------------------------------
        svm_conf_pct = cls._compute_confidence_pct(confidence, decision_scores_raw)
        
        # Calculate rule-based validation score (base is 0.5)
        rule_validation_score = 0.5
        stripped = re.sub(r'/\*.*?\*/', '', code or '', flags=re.DOTALL)
        stripped = re.sub(r'//.*', '', stripped)
        # Clean whitespaces inside square brackets to handle copy-paste visual wraps
        stripped = re.sub(r'\[([^]]+)\]', lambda m: '[' + re.sub(r'\s+', '', m.group(1)) + ']', stripped)
        
        if ml_label == "LOOP_ERROR":
            loop_errors = (
                re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*[^;]+;', stripped) or
                re.search(r'for\s*\(\s*int\s+\w+\s*=\s*1\s*;', stripped) or
                re.search(r'for\s*\([^;]+;\s*[^;]+;\s*\)', stripped) or
                re.search(r'while\s*\(\s*(true|1)\s*\)', stripped)
            )
            while_blocks = re.findall(r'while\s*\(([^)]+)\)\s*\{([^}]*)\}', stripped)
            for cond, body in while_blocks:
                if re.search(r'\b\w+\s*(?:<|<=|>|>=|!=|==)\s*\d+', cond):
                    if not re.search(r'\+\+|--|\+=|-=', body):
                        loop_errors = True
            
            if loop_errors:
                rule_validation_score += 0.4
            else:
                safe_loop = re.search(r'for\s*\(\s*int\s+(\w+)\s*=\s*0\s*;\s*\1\s*<\s*[^;]+\s*;\s*\1\s*\+\+\s*\)', stripped)
                if safe_loop:
                    rule_validation_score -= 0.3
                    
        elif ml_label == "ARRAY_ERROR":
            arr_errors = (
                re.search(r'\b\w+\s*\[\s*\w+\.length\s*\]', stripped) or
                re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*\w+\.length', stripped)
            )
            literal_arrays = re.findall(r'int\s*\[\]\s+(\w+)\s*=\s*\{([^}]+)\}', stripped)
            for arr_name, elements in literal_arrays:
                num_elements = len([e for e in elements.split(',') if e.strip()])
                accesses = re.findall(r'\b' + re.escape(arr_name) + r'\s*\[\s*(\d+)\s*\]', stripped)
                for acc in accesses:
                    if int(acc) >= num_elements:
                        arr_errors = True
            
            if arr_errors:
                rule_validation_score += 0.4
            else:
                if re.search(r'\b\w+\s*\[\s*0\s*\]', stripped) or re.search(r'\.length\s*-\s*1', stripped):
                    rule_validation_score -= 0.3
                    
        elif ml_label == "METHOD_ERROR":
            mismatch = cls.detect_method_argument_mismatch(code)
            method_errors = (
                mismatch.get("mismatch_found") or
                re.search(r'\bvoid\b[^{]+\{[^}]*\breturn\b[^;]+;', stripped)
            )
            m = re.search(r'\b(int|long|double|float|boolean|String)\b[^{]+\{[^}]*\}', stripped)
            if m and "return" not in m.group(0):
                method_errors = True
                
            if method_errors:
                rule_validation_score += 0.4
            else:
                rule_validation_score -= 0.2
                
        elif ml_label == "VARIABLE_ERROR":
            var_errors = (
                re.search(r'\b(\w+)\s*=\s*\1\b', stripped) or
                re.search(r'\b\w+\s*[\+\*\/]\s*\w*discount\w*', stripped, re.IGNORECASE) or
                re.search(r'\b\w*discount\w*\s*[\+\*\/]\s*\w+', stripped, re.IGNORECASE)
            )
            add_methods = re.findall(r'(?:int|double|float|long)\s+add\s*\([^)]*\)\s*\{([^}]+)\}', stripped)
            for body in add_methods:
                if '-' in body and '+' not in body:
                    var_errors = True
                    
            if var_errors:
                rule_validation_score += 0.4
            else:
                if re.search(r'\b(?:int|double|float|boolean|String|char)\s+\w+\s*=\s*[^;]+;', stripped):
                    rule_validation_score -= 0.3
                    
        elif ml_label == "CORRECT":
            has_error = (
                cls.detect_method_argument_mismatch(code).get("mismatch_found") or
                re.search(r'\b\w+\s*\[\s*\w+\.length\s*\]', stripped) or
                re.search(r'for\s*\([^;]+;\s*[^;]+<=\s*[^;]+;', stripped) or
                re.search(r'\b(\w+)\s*=\s*\1\b', stripped)
            )
            if has_error:
                rule_validation_score -= 0.4
            else:
                rule_validation_score += 0.4
                
        rule_validation_score = max(0.0, min(1.0, rule_validation_score))
        
        # Fused confidence calculation (0.6 SVM + 0.4 Rules)
        final_confidence_pct = int(0.6 * svm_conf_pct + 40.0 * rule_validation_score)
        final_confidence_pct = max(0, min(100, final_confidence_pct))
        
        # Reset qualitative confidence based on fusion
        if final_confidence_pct >= 80:
            confidence = "High"
        elif final_confidence_pct >= 50:
            confidence = "Medium"
        else:
            confidence = "Low"

        # ------------------------------------------------------------------
        # Step 2 — Rule-based safety layer (unconditional for definitive errors)
        # ------------------------------------------------------------------
        original_ml_label = ml_label
        final_label = ml_label
        override_applied = False
        override_reason = None
        hybrid_correction_badge = None
        correctness_validation_applied = False
        correctness_validation_reason = None
        correctness_check = None

        mismatch = cls.detect_method_argument_mismatch(code)
        if mismatch["mismatch_found"]:
            final_label = "METHOD_ERROR"
            override_applied = True
            override_reason = mismatch["reason"]
            hybrid_correction_badge = "Rule-based correction applied"

        if not override_applied:
            correctness_check = cls.detect_obviously_correct_java(code)
            if correctness_check.get("is_correct"):
                final_label = "CORRECT"
                override_applied = True
                override_reason = "Correctness validation identified a simple valid Java pattern with no obvious beginner error."
                correctness_validation_applied = True
                correctness_validation_reason = correctness_check.get("reason")
                hybrid_correction_badge = "Validated as Correct"
            else:
                # ML model falsely predicted CORRECT, but rule validation detected an error pattern
                if final_label == "CORRECT":
                    pattern_map = {
                        "method_argument_mismatch": "METHOD_ERROR",
                        "array_length_index": "ARRAY_ERROR",
                        "array_out_of_bounds": "ARRAY_ERROR",
                        "loop_boundary_risk": "LOOP_ERROR",
                        "loop_start_at_1": "LOOP_ERROR",
                        "for_empty_update": "LOOP_ERROR",
                        "infinite_loop_no_break": "LOOP_ERROR",
                        "while_no_update": "LOOP_ERROR",
                        "discount_wrong_operator": "VARIABLE_ERROR",
                        "add_returns_subtraction": "VARIABLE_ERROR",
                        "void_method_returns_value": "METHOD_ERROR",
                        "non_void_method_missing_return": "METHOD_ERROR",
                        "self_assignment": "VARIABLE_ERROR"
                    }
                    mp = correctness_check.get("matched_pattern")
                    mapped_label = pattern_map.get(mp)
                    if mapped_label:
                        final_label = mapped_label
                        override_applied = True
                        override_reason = correctness_check.get('reason')
                        hybrid_correction_badge = "Rule-based correction applied"

        # ------------------------------------------------------------------
        # Step 2b — Consistency Validation
        # ------------------------------------------------------------------
        reason_group_original = reason_group
        reason_group_final = reason_group
        reason_group_adjusted = False
        reason_group_adjustment_reason = "None"
        
        allowed_mapping = {
            "VARIABLE_ERROR": ["VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_CALCULATION_ISSUE"],
            "LOOP_ERROR": ["LOOP_BOUNDARY_ISSUE", "LOOP_CONDITION_ISSUE", "LOOP_UPDATE_ISSUE", "LOOP_CONTROL_FLOW_ISSUE", "LOOP_CONDITION_BOUNDARY_ISSUE", "LOOP_UPDATE_CONTROL_ISSUE"],
            "ARRAY_ERROR": ["ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_TRAVERSAL_ISSUE"],
            "METHOD_ERROR": ["METHOD_SIGNATURE_ISSUE", "METHOD_RETURN_ISSUE", "METHOD_PARAMETER_USAGE_ISSUE"],
            "CORRECT": ["CORRECT_NO_ERROR"]
        }
        
        fallback_mapping = {
            "VARIABLE_ERROR": "VARIABLE_CALCULATION_ISSUE",
            "LOOP_ERROR": "LOOP_CONDITION_ISSUE",
            "ARRAY_ERROR": "ARRAY_BOUNDARY_INDEX_ISSUE",
            "METHOD_ERROR": "METHOD_SIGNATURE_ISSUE",
            "CORRECT": "CORRECT_NO_ERROR"
        }
        
        if override_applied and final_label == "METHOD_ERROR" and mismatch.get("mismatch_found"):
            reason_group_final = "METHOD_SIGNATURE_ISSUE"
            reason_group_adjusted = True
            reason_group_adjustment_reason = "Method signature mismatch rule overrode the predicted sub-reason."
        elif override_applied and correctness_check and not correctness_check.get("is_correct"):
            sub_reason_map = {
                "method_argument_mismatch": "METHOD_SIGNATURE_ISSUE",
                "array_length_index": "ARRAY_BOUNDARY_INDEX_ISSUE",
                "array_out_of_bounds": "ARRAY_BOUNDARY_INDEX_ISSUE",
                "loop_boundary_risk": "LOOP_BOUNDARY_ISSUE",
                "loop_start_at_1": "LOOP_BOUNDARY_ISSUE",
                "for_empty_update": "LOOP_UPDATE_ISSUE",
                "infinite_loop_no_break": "LOOP_CONTROL_FLOW_ISSUE",
                "while_no_update": "LOOP_UPDATE_ISSUE",
                "discount_wrong_operator": "VARIABLE_CALCULATION_ISSUE",
                "add_returns_subtraction": "VARIABLE_CALCULATION_ISSUE",
                "void_method_returns_value": "METHOD_RETURN_ISSUE",
                "non_void_method_missing_return": "METHOD_RETURN_ISSUE",
                "self_assignment": "VARIABLE_ASSIGNMENT_ISSUE"
            }
            mp = correctness_check.get("matched_pattern")
            mapped_sub = sub_reason_map.get(mp)
            if mapped_sub:
                reason_group_final = mapped_sub
                reason_group_adjusted = True
                reason_group_adjustment_reason = "Sub-reason group was set to match the rule-based error override."
        elif reason_group_original not in allowed_mapping.get(final_label, []):
            reason_group_final = fallback_mapping.get(final_label, "CORRECT_NO_ERROR")
            reason_group_adjusted = True
            reason_group_adjustment_reason = "Reason group was adjusted to remain consistent with the broad error prediction."
            
        reason_group = reason_group_final

        # ------------------------------------------------------------------
        # Step 3 — Build response using the reason group
        # ------------------------------------------------------------------
        details = cls._get_reason_details(reason_group, final_label)
        
        evidence = cls._extract_evidence(code, reason_group)
        
        model_trace = {
            "preprocessing": "Java code cleaned using training preprocessing pipeline",
            "broad_model": "Linear SVM + TF-IDF",
            "original_broad_prediction": original_ml_label,
            "final_broad_prediction": final_label,
            "reason_model": "Linear SVM + TF-IDF",
            "original_reason_prediction": reason_group_original,
            "final_reason_group": reason_group_final,
            "reason_group_adjusted": "Yes" if reason_group_adjusted else "No",
            "feedback_source": "reason_group_feedback_template",
            "rule_override_applied": override_applied,
            "rule_override_reason": override_reason if override_reason else "None",
            "correctness_validation_applied": correctness_validation_applied,
            "correctness_validation_reason": correctness_validation_reason if correctness_validation_applied else "None"
        }

        if override_applied and override_reason:
            details = dict(details)
            details["reason"] = override_reason
            if mismatch and mismatch.get("mismatch_found"):
                details["misconception"] = (
                    "The learner may misunderstand that method arguments must "
                    "match the parameter list exactly in number and order."
                )
                details["suggested_fix"] = (
                    "Either update the method call to pass the correct number of "
                    "arguments, or modify the method declaration to accept the "
                    "number of arguments you are providing."
                )

        alignment = cls._align_with_pretest(final_label, pretest)

        # ------------------------------------------------------------------
        # Step 3b — Explainable AI (XAI) — Feature 2
        # ------------------------------------------------------------------
        xai_explanation = cls._generate_xai_explanation(
            code=code,
            reason_group=reason_group,
            final_label=final_label,
            confidence_level=confidence,
            decision_scores=decision_scores_raw,
            recalibrated_confidence_pct=final_confidence_pct,
        )

        response = {
            "success": True,
            "student_id": student_id,
            "predicted_label": final_label,
            "reason_group": reason_group_final,
            "confidence_score": final_confidence_pct,
            "rule_override_status": {
                "applied": override_applied,
                "reason": override_reason or "None",
                "badge": hybrid_correction_badge or "None"
            },
            "explanation_steps": xai_explanation["explanation_steps"],
            "why_not_correct": xai_explanation["why_not_correct"],
            "analysis_source": "Two-stage ML prediction",
            "model_1": "Linear SVM broad error classifier",
            "model_2": "Linear SVM reason-group classifier",
            "broad_label": ml_label,
            "reason_group_original": reason_group_original,
            "reason_group_adjusted": reason_group_adjusted,
            "reason_group_adjustment_reason": reason_group_adjustment_reason,
            "model_trace": model_trace,
            "evidence": evidence,
            "original_ml_label": original_ml_label,
            "final_label": final_label,
            "override_applied": override_applied,
            "override_reason": override_reason,
            "hybrid_correction_badge": hybrid_correction_badge,
            "pattern_hint_applied": False,
            "pattern_hint_matched": None,
            "xai_explanation": xai_explanation,
            "prediction": {
                "label": final_label,
                "concept": details["concept"],
                "confidence_level": confidence,
                "severity": "High" if final_label != "CORRECT" else "None"
            },
            "explanation": {
                "reason": details["reason"],
                "misconception": details["misconception"],
                "suggested_fix": details["suggested_fix"],
                "beginner_explanation": details["beginner_explanation"]
            },
            "pretest_alignment": alignment,
            "gamification_payload": details["gamification"],
            "adaptive_payload": details["adaptive"],
            "schema_mastery_payload": {
                "concept": details["concept"],
                "schema_status": "Stable" if final_label == "CORRECT" else "Fragile",
                "evidence": (
                    f"ML prediction: {original_ml_label}. "
                    f"Final label after rule validation: {final_label}."
                )
            }
        }

        # ------------------------------------------------------------------
        # Step 4 — Persist to history using the final label
        # Also stores week_bucket (for analytics) and reason_group (for report)
        # ------------------------------------------------------------------
        _now = datetime.datetime.now()
        _week_bucket = _now.strftime("%Y-W%V")   # ISO week string e.g. "2025-W32"

        history_entry = {
            "student_id": student_id,
            "code": code if len(code) <= 100 else code[:100] + "...",
            "label": final_label,
            "original_ml_label": original_ml_label,
            "override_applied": override_applied,
            "concept": details["concept"],
            "timestamp": _now.isoformat(),
            "activity": details["gamification"]["recommended_activity"],
            "week_bucket": _week_bucket,
            "reason_group": reason_group,
            "error_reason": details.get("reason", ""),
            "misconception": details.get("misconception", ""),
            "full_response": response,
        }

        cls._history.append(history_entry)

        if db:
            try:
                db.collection("error_history").add(history_entry)
                print(f"[OK] Saved error analysis to Firestore error_history for student {student_id}")
            except Exception as e:
                print(f"[WARN] Failed to save error analysis to Firestore: {e}")

        cls._last_analysis[student_id] = response

        return response

    @staticmethod
    def _get_reason_details(reason_group, broad_label):
        """Central mapping for all explanation templates based on reason_group."""
        
        # Base fallback templates by broad label
        base_templates = {
            "LOOP_ERROR": {
                "concept": "Loops",
                "reason": "The code shows a pattern commonly associated with loop boundary, condition, or update issues.",
                "misconception": "Likely misunderstanding of loop termination conditions (e.g., using <= instead of <) or how the counter variable updates.",
                "suggested_fix": "Verify your loop starting point, the termination condition, and how the counter (e.g., i++) changes each time.",
                "beginner_explanation": "A loop is like a race. If the finish line is in the wrong place, or if you forget to step forward, you'll never finish correctly!",
                "gamification": {
                    "target_concept": "Loops",
                    "recommended_activity": "Loop Boundary Debugging Challenge",
                    "game_type": "debugging_challenge",
                    "difficulty": "medium",
                    "reward_badge": "Loop Fixer",
                    "mastery_action": "reduce_loop_mastery_score"
                },
                "adaptive": {
                    "recommended_topic": "Loop Conditions and Counter Updates",
                    "next_learning_step": "Practice tracing loop iterations manually",
                    "priority": "High"
                }
            },
            "VARIABLE_ERROR": {
                "concept": "Variables",
                "reason": "The code contains issues related to variable assignment, initialization, or unexpected value overwriting.",
                "misconception": "Likely misunderstanding of how variable state changes over time or how operators affect the stored value.",
                "suggested_fix": "Trace the value of your variables line-by-line. Ensure they are initialized before use and assigned correctly.",
                "beginner_explanation": "Variables are boxes that hold data. If you put the wrong thing in the box or forget to label it, your program gets confused.",
                "gamification": {
                    "target_concept": "Variables",
                    "recommended_activity": "Variable Tracing Mission",
                    "game_type": "tracing_mission",
                    "difficulty": "easy",
                    "reward_badge": "Variable Tracker",
                    "mastery_action": "reduce_variable_mastery_score"
                },
                "adaptive": {
                    "recommended_topic": "Variable Scope and Assignment",
                    "next_learning_step": "Complete a variable state tracing exercise",
                    "priority": "Medium"
                }
            },
            "ARRAY_ERROR": {
                "concept": "Arrays",
                "reason": "The code pattern suggests a problem with array indexing, length access, or traversal boundaries.",
                "misconception": "Commonly occurs when forgetting that Java arrays are 0-indexed, leading to 'Off-by-One' errors.",
                "suggested_fix": "Check your array indices. Remember that for an array of size N, the last valid index is N-1.",
                "beginner_explanation": "Think of an array as a row of lockers. The first locker is always number 0. If you try to open locker number 10 in a row of 10, it won't exist!",
                "gamification": {
                    "target_concept": "Arrays",
                    "recommended_activity": "Array Index Rescue Game",
                    "game_type": "arcade_rescue",
                    "difficulty": "hard",
                    "reward_badge": "Array Guardian",
                    "mastery_action": "reduce_array_mastery_score"
                },
                "adaptive": {
                    "recommended_topic": "Zero-based Indexing and Array Bounds",
                    "next_learning_step": "Solve the Array Boundary Challenge",
                    "priority": "High"
                }
            },
            "METHOD_ERROR": {
                "concept": "Methods",
                "reason": "The detected pattern relates to method signatures, return values, or incorrect argument passing.",
                "misconception": "Likely misunderstanding of how data flows in and out of methods (parameters vs. return values).",
                "suggested_fix": "Check your method definition. Ensure the return type matches the 'return' statement and arguments match the parameters.",
                "beginner_explanation": "A method is like a machine. You give it ingredients (parameters), and it gives you a result (return value). Make sure you're using the right ingredients!",
                "gamification": {
                    "target_concept": "Methods",
                    "recommended_activity": "Method Repair Challenge",
                    "game_type": "puzzle_repair",
                    "difficulty": "medium",
                    "reward_badge": "Method Master",
                    "mastery_action": "reduce_method_mastery_score"
                },
                "adaptive": {
                    "recommended_topic": "Method Parameters and Return Types",
                    "next_learning_step": "Build a modular program using multiple methods",
                    "priority": "Medium"
                }
            },
            "CORRECT": {
                "concept": "General",
                "reason": "No common beginner error pattern was detected.",
                "misconception": "The learner correctly applies the required logic.",
                "suggested_fix": "Everything looks good. You can continue to the next challenge.",
                "beginner_explanation": "Great job. Your code follows the expected logic for this concept.",
                "gamification": {
                    "target_concept": "General",
                    "recommended_activity": "Next Challenge",
                    "game_type": "advanced_project",
                    "difficulty": "pro",
                    "reward_badge": "Clean Coder",
                    "mastery_action": "maintain_mastery_score"
                },
                "adaptive": {
                    "recommended_topic": "Advanced Logic and Optimization",
                    "next_learning_step": "Move to the next module in the learning path",
                    "priority": "Low"
                }
            }
        }
        
        reason_templates = {
            "ARRAY_BOUNDARY_INDEX_ISSUE": {
                "base": "ARRAY_ERROR",
                "reason": "The code accesses an array index that is out of bounds (e.g. array.length).",
                "misconception": "A common mistake is thinking the highest index is equal to the array's length, when it is actually length - 1.",
                "suggested_fix": "Subtract 1 from the length when accessing the last element: array[array.length - 1].",
                "beginner_explanation": "Java arrays start counting at 0. So an array with 5 items has lockers 0, 1, 2, 3, and 4. Locker 5 doesn't exist!"
            },
            "ARRAY_TRAVERSAL_ISSUE": {
                "base": "ARRAY_ERROR",
                "reason": "The code improperly loops through or updates an array's elements.",
                "misconception": "Learners often struggle to match loop counters to array indices, skipping elements or crashing.",
                "suggested_fix": "Check your loop bounds. Usually, it should be 'for (int i = 0; i < array.length; i++)'.",
                "beginner_explanation": "When walking through an array, make sure your steps match the locker numbers perfectly, from 0 to the end."
            },
            "LOOP_BOUNDARY_ISSUE": {
                "base": "LOOP_ERROR",
                "reason": "The loop executes one time too many or one time too few.",
                "misconception": "Confusing '<=' with '<' in loop conditions leads to off-by-one errors.",
                "suggested_fix": "Change '<=' to '<' if you are trying to iterate 'n' times starting from 0.",
                "beginner_explanation": "If you start running at 0 and want to run 5 laps, you stop before you reach 5. Using '<=' means you'll run an extra lap!"
            },
            "LOOP_CONDITION_ISSUE": {
                "base": "LOOP_ERROR",
                "reason": "The condition controlling the loop is incorrect, preventing it from running or stopping.",
                "misconception": "The learner may not realize the condition must evaluate to true for the loop to start and false for it to end.",
                "suggested_fix": "Make sure your loop condition accurately reflects when the loop should terminate.",
                "beginner_explanation": "A loop condition is a bouncer at a club. If it says 'true', you go in. If it says 'false', you stop."
            },
            "LOOP_CONTROL_FLOW_ISSUE": {
                "base": "LOOP_ERROR",
                "reason": "The loop has a while(true) or similar construct with no break, causing an infinite loop.",
                "misconception": "Forgetting to provide an exit path out of a continuous loop block.",
                "suggested_fix": "Add a 'break;' statement when the desired condition is met.",
                "beginner_explanation": "An infinite loop is like being stuck on a merry-go-round. You need a 'break' to get off!"
            },
            "LOOP_UPDATE_ISSUE": {
                "base": "LOOP_ERROR",
                "reason": "The loop counter is never updated, causing an infinite loop.",
                "misconception": "Forgetting to increment or decrement the loop variable inside or at the end of the loop.",
                "suggested_fix": "Ensure the loop variable changes. Add 'i++' or 'i--' so the condition eventually becomes false.",
                "beginner_explanation": "If you don't take a step forward in a race, you'll never reach the finish line. Always update your counter!"
            },
            "METHOD_PARAMETER_USAGE_ISSUE": {
                "base": "METHOD_ERROR",
                "reason": "The method appears to ignore or incorrectly use one of its parameters.",
                "misconception": "The learner may not understand how parameter values should be used inside the method body.",
                "suggested_fix": "Trace each parameter inside the method and check whether it contributes correctly to the returned result.",
                "beginner_explanation": "If a vending machine asks for two coins, giving it one coin won't give you a snack. Match the ingredients exactly!"
            },
            "METHOD_RETURN_ISSUE": {
                "base": "METHOD_ERROR",
                "reason": "The method does not return a value when it should, or returns a value in a void method.",
                "misconception": "Misunderstanding the difference between printing a value and returning it, or between void and typed methods.",
                "suggested_fix": "If the method says it returns an 'int', make sure you have a 'return' statement with a number.",
                "beginner_explanation": "A 'return' is like handing a completed test back to the teacher. Don't just show it, give it back!"
            },
            "METHOD_SIGNATURE_ISSUE": {
                "base": "METHOD_ERROR",
                "reason": "The code suggests an issue with method arguments, parameters, or how the method is called.",
                "misconception": "The learner may misunderstand that method calls must match the method declaration in number, order, and type of arguments.",
                "suggested_fix": "Compare the method call with the method declaration and make sure the arguments match the parameters.",
                "beginner_explanation": "A method call must give the method the exact inputs it expects. If the method asks for one value, giving two values will cause an error."
            },
            "VARIABLE_ASSIGNMENT_ISSUE": {
                "base": "VARIABLE_ERROR",
                "reason": "A variable is assigned to itself, left uninitialized, or updated incorrectly.",
                "misconception": "Assigning 'x = x;' has no effect, and reading an uninitialized variable is illegal in Java.",
                "suggested_fix": "Assign a distinct, correct value to the variable, e.g., 'x = 5;' or 'x = y;'.",
                "beginner_explanation": "Assigning a box to itself doesn't change what's inside. Put something new in the box!"
            },
            "VARIABLE_CALCULATION_ISSUE": {
                "base": "VARIABLE_ERROR",
                "reason": "A mathematical calculation is logically flawed. Review your use of operators.",
                "misconception": "Confusion with operators or misunderstanding the semantic meaning of the variables (e.g., discounts reduce total).",
                "suggested_fix": "Check your math operators. If computing a discount, use subtraction '-'. If computing tax, use addition and multiplication.",
                "beginner_explanation": "Math in Java is just like math in school. If a discount makes things cheaper, use a minus sign, not a plus sign!"
            },
            "CORRECT_NO_ERROR": {
                "base": "CORRECT",
                "reason": "No common beginner error pattern was detected.",
                "misconception": "The learner correctly applies the required logic.",
                "suggested_fix": "Everything looks good. You can continue to the next challenge.",
                "beginner_explanation": "Great job. Your code follows the expected logic for this concept."
            }
        }
        
        if reason_group in reason_templates:
            specifics = reason_templates[reason_group]
            base = base_templates[specifics["base"]]
            
            merged = dict(base)
            merged["reason"] = specifics["reason"]
            merged["misconception"] = specifics["misconception"]
            merged["suggested_fix"] = specifics["suggested_fix"]
            merged["beginner_explanation"] = specifics["beginner_explanation"]
            return merged
        else:
            return base_templates.get(broad_label, base_templates["CORRECT"])

    @staticmethod
    def _align_with_pretest(label, pretest):
        """Aligns ML prediction with pre-test scores for a more holistic feedback."""
        if not pretest:
            return {
                "used": False,
                "message": "Pre-test results were not provided. Analysis is based only on submitted code."
            }

        mapping = {
            "VARIABLE_ERROR": "variables",
            "LOOP_ERROR": "loops",
            "ARRAY_ERROR": "arrays",
            "METHOD_ERROR": "methods",
            "CORRECT": None
        }

        concept_key = mapping.get(label)
        if not concept_key:
            return {"used": True, "related_score": None, "message": "Code is correct; pre-test alignment not required."}

        score = pretest.get(concept_key)
        if score is None:
            return {"used": False, "message": f"Pre-test score for {concept_key} missing."}

        if score <= 2:
            msg = f"The predicted error ({label}) matches a weak area identified in your pre-test for {concept_key}."
        else:
            msg = f"An error was detected, but your pre-test score for {concept_key} suggest you have some conceptual foundation."

        return {
            "used": True,
            "related_score": score,
            "message": msg
        }

    @classmethod
    def _get_user_history_data(cls, user_id):
        """
        Retrieves user history with 60-second in-memory cache and 5-minute Firestore 429 quota cooldown.
        Returns tuple: (user_history_list, source_str)
        """
        now = time.time()

        # 1. Check in-memory cache first (60s TTL)
        cached = cls._history_cache.get(user_id)
        if cached and (now - cached.get("timestamp", 0) < cls._cache_ttl_seconds):
            return cached.get("data", []), "cache"

        # 2. Check if Firestore is in 5-minute quota cooldown
        if now < cls._firestore_cooldown_until:
            if cached:
                return cached.get("data", []), "cache"
            fallback_data = [h for h in cls._history if h.get("student_id") == user_id]
            return fallback_data, "fallback"

        # 3. Attempt Firestore query if client is available
        if db:
            try:
                docs = db.collection("error_history").where("student_id", "==", user_id).stream()
                user_history = [doc.to_dict() for doc in docs]
                user_history.sort(key=lambda x: x.get("timestamp", ""))

                # Store in cache
                cls._history_cache[user_id] = {
                    "timestamp": now,
                    "data": user_history,
                    "source": "firestore"
                }
                return user_history, "firestore"

            except Exception as e:
                err_str = str(e)
                # Catch 429 quota exceeded and enter 5-minute cooldown
                if "429" in err_str or "Quota exceeded" in err_str or "ResourceExhausted" in err_str:
                    cls._firestore_cooldown_until = now + cls._firestore_cooldown_duration
                    # Log warning only once per cooldown period
                    if now - cls._last_firestore_warn_time > cls._firestore_cooldown_duration:
                        cls._last_firestore_warn_time = now
                        print("[WARN] Firestore quota exceeded for error_history. Using fallback for 5 minutes.")
                else:
                    print(f"[WARN] Error reading from Firestore error_history: {e}")

                if cached:
                    return cached.get("data", []), "cache"
                fallback_data = [h for h in cls._history if h.get("student_id") == user_id]
                return fallback_data, "fallback"

        # 4. Fallback if db is None (offline)
        fallback_data = [h for h in cls._history if h.get("student_id") == user_id]
        return fallback_data, "fallback"

    @classmethod
    def _get_user_history(cls, user_id):
        """Helper to get user history from cached/Firestore data."""
        data, _ = cls._get_user_history_data(user_id)
        return data

    @classmethod
    def get_history(cls, user_id):
        """Returns error analysis history (last 10 items) with safe fallback."""
        user_history, source = cls._get_user_history_data(user_id)
        return {
            "success": True,
            "student_id": user_id,
            "source": source,
            "total": len(user_history),
            "history": user_history[-10:] if user_history else [],
            "message": "No error history available yet" if not user_history else None
        }

    @classmethod
    def get_latest(cls, user_id):
        """Returns the full response payload of the user's most recent analysis."""
        if user_id in cls._last_analysis:
            return cls._last_analysis[user_id]
        
        user_history = cls._get_user_history(user_id)
        if user_history:
            latest_entry = user_history[-1]
            code = latest_entry.get("code", "")
            if code:
                try:
                    res = cls.analyze({
                        "student_id": user_id,
                        "code": code
                    })
                    return res
                except Exception as e:
                    print(f"Error analyzing latest history entry: {e}")
        return None

    @classmethod
    def get_summary(cls, user_id):
        """Aggregates error patterns for the user with safe fallback."""
        user_history, source = cls._get_user_history_data(user_id)
        if not user_history:
            return {
                "success": True,
                "user_id": user_id,
                "source": source,
                "total_analyses": 0,
                "counts": {},
                "most_frequent_error": "None",
                "recommended_focus": "General"
            }

        counts = {}
        for h in user_history:
            lbl = h.get("label")
            if lbl and lbl != "CORRECT":
                counts[lbl] = counts.get(lbl, 0) + 1

        most_freq = max(counts, key=counts.get) if counts else "None"
        
        if most_freq == "None":
            rec_focus = "General"
        else:
            concept_map = {
                "LOOP_ERROR": "Loops",
                "VARIABLE_ERROR": "Variables",
                "ARRAY_ERROR": "Arrays",
                "METHOD_ERROR": "Methods",
                "CORRECT": "General"
            }
            rec_focus = concept_map.get(most_freq, "General")
        
        return {
            "success": True,
            "user_id": user_id,
            "source": source,
            "total_analyses": len(user_history),
            "counts": counts,
            "most_frequent_error": most_freq,
            "recommended_focus": rec_focus
        }

    # ======================================================================
    # Feature 1 — Error Progression Analytics
    # ======================================================================

    @classmethod
    def get_analytics(cls, user_id):
        """
        Computes error progression analytics for a learner with safe fallback.
        """
        user_history, source = cls._get_user_history_data(user_id)

        if not user_history:
            return {
                "success": True,
                "user_id": user_id,
                "source": source,
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

        all_error_cats = ["LOOP_ERROR", "VARIABLE_ERROR", "ARRAY_ERROR", "METHOD_ERROR"]

        # ── Group by ISO week ──────────────────────────────────────────
        week_buckets = {}
        for entry in user_history:
            week_key = entry.get("week_bucket")
            if not week_key:
                try:
                    dt = datetime.datetime.fromisoformat(entry.get("timestamp", ""))
                    week_key = dt.strftime("%Y-W%V")
                except Exception:
                    week_key = "Unknown"

            if week_key not in week_buckets:
                week_buckets[week_key] = {"total": 0, "errors": {}, "correct": 0}

            week_buckets[week_key]["total"] += 1
            label = entry.get("label", "CORRECT")
            if label == "CORRECT":
                week_buckets[week_key]["correct"] += 1
            else:
                week_buckets[week_key]["errors"][label] = (
                    week_buckets[week_key]["errors"].get(label, 0) + 1
                )

        sorted_weeks = sorted(week_buckets.keys())

        # ── Weekly totals (line chart data) ───────────────────────────
        weekly_totals = []
        for week in sorted_weeks:
            error_count = sum(week_buckets[week]["errors"].values())
            weekly_totals.append({
                "week": week,
                "total_errors": error_count,
                "total_submissions": week_buckets[week]["total"],
                "correct": week_buckets[week]["correct"],
            })

        # ── Per-category weekly counts (bar / multi-line chart) ───────
        category_weekly = {}
        for cat in all_error_cats:
            category_weekly[cat] = [
                week_buckets[w]["errors"].get(cat, 0) for w in sorted_weeks
            ]

        # ── Improvement scores (first-half vs second-half) ────────────
        n = len(user_history)
        midpoint = max(1, n // 2)
        first_half  = user_history[:midpoint]
        second_half = user_history[midpoint:]

        improvement_scores = {}
        for cat in all_error_cats:
            first_count  = sum(1 for h in first_half  if h.get("label") == cat)
            second_count = sum(1 for h in second_half if h.get("label") == cat)

            if first_count == 0 and second_count == 0:
                improvement_scores[cat] = {"pct": 0,    "direction": "stable",   "first": 0, "second": 0}
            elif first_count == 0:
                improvement_scores[cat] = {"pct": -100, "direction": "worse",    "first": 0, "second": second_count}
            else:
                pct = round(((first_count - second_count) / first_count) * 100)
                direction = "improved" if pct > 0 else ("worse" if pct < 0 else "stable")
                improvement_scores[cat] = {"pct": pct, "direction": direction,
                                           "first": first_count, "second": second_count}

        # ── Overall improvement ───────────────────────────────────────
        total_first_errors  = sum(1 for h in first_half  if h.get("label") != "CORRECT")
        total_second_errors = sum(1 for h in second_half if h.get("label") != "CORRECT")
        if total_first_errors == 0:
            overall_improvement_pct = 0
        else:
            overall_improvement_pct = round(
                ((total_first_errors - total_second_errors) / total_first_errors) * 100
            )

        # ── Most improved ─────────────────────────────────────────────
        most_improved  = None
        best_gain = -999
        for cat, data in improvement_scores.items():
            if data["direction"] == "improved" and data["pct"] > best_gain:
                best_gain = data["pct"]
                most_improved = cat

        # ── Most problematic (by total count) ─────────────────────────
        total_counts = {}
        for h in user_history:
            if h.get("label") != "CORRECT":
                total_counts[h["label"]] = total_counts.get(h["label"], 0) + 1
        most_problematic = max(total_counts, key=total_counts.get) if total_counts else None

        # ── Error-free rate ───────────────────────────────────────────
        correct_count    = sum(1 for h in user_history if h.get("label") == "CORRECT")
        error_free_rate  = round((correct_count / len(user_history)) * 100) if user_history else 0

        return {
            "success":               True,
            "user_id":               user_id,
            "source":                source,
            "has_data":              True,
            "total_submissions":     n,
            "weeks":                 sorted_weeks,
            "weekly_totals":         weekly_totals,
            "category_weekly":       category_weekly,
            "improvement_scores":    improvement_scores,
            "overall_improvement_pct": overall_improvement_pct,
            "most_improved":         most_improved,
            "most_problematic":      most_problematic,
            "error_free_rate":       error_free_rate,
            "total_counts":          total_counts,
        }

    # ======================================================================
    # Feature 3 — Personalized Learning Report
    # ======================================================================

    @classmethod
    def generate_learning_report(cls, user_id):
        """
        Generates a dynamic, personalized learning report for a learner with safe fallback.
        """
        user_history, source = cls._get_user_history_data(user_id)

        if not user_history:
            return {
                "success": True,
                "user_id": user_id,
                "source": source,
                "has_data": False,
                "total_submissions": 0,
                "summary": "No submission history found. Submit code to generate your learning report.",
                "strengths": [],
                "recurring_mistakes": [],
                "recently_improved": [],
                "new_mistakes": [],
                "recommended_focus": [],
                "avoid_patterns": [],
            }

        all_error_cats = ["LOOP_ERROR", "VARIABLE_ERROR", "ARRAY_ERROR", "METHOD_ERROR"]

        concept_map = {
            "LOOP_ERROR":     "Loops",
            "VARIABLE_ERROR": "Variables",
            "ARRAY_ERROR":    "Arrays",
            "METHOD_ERROR":   "Methods",
        }

        reason_friendly = {
            "LOOP_BOUNDARY_ISSUE":         "loop boundary conditions (using <= instead of <)",
            "LOOP_UPDATE_ISSUE":            "missing loop counter updates",
            "LOOP_CONTROL_FLOW_ISSUE":      "infinite loop conditions",
            "LOOP_CONDITION_ISSUE":         "incorrect loop termination conditions",
            "LOOP_CONDITION_BOUNDARY_ISSUE":"loop condition and boundary combined",
            "LOOP_UPDATE_CONTROL_ISSUE":    "loop update and control flow combined",
            "ARRAY_BOUNDARY_INDEX_ISSUE":   "array index out-of-bounds access",
            "ARRAY_TRAVERSAL_ISSUE":        "incorrect array traversal",
            "METHOD_RETURN_ISSUE":          "method return type mismatches",
            "METHOD_SIGNATURE_ISSUE":       "method argument count mismatches",
            "METHOD_PARAMETER_USAGE_ISSUE": "unused or incorrect parameter usage",
            "VARIABLE_ASSIGNMENT_ISSUE":    "incorrect variable assignment",
            "VARIABLE_CALCULATION_ISSUE":   "incorrect arithmetic operations",
        }

        n          = len(user_history)
        recent     = user_history[-5:]              # last 5 submissions
        very_recent = user_history[-3:]             # last 3 submissions
        early      = user_history[:max(1, n - 5)]  # all except last 5

        all_labels    = [h.get("label", "CORRECT") for h in user_history]
        recent_labels = [h.get("label", "CORRECT") for h in recent]

        # ── Strengths ─────────────────────────────────────────────────
        strengths = []
        for cat in all_error_cats:
            total_occ  = all_labels.count(cat)
            recent_occ = recent_labels.count(cat)
            concept    = concept_map[cat]
            if total_occ > 0 and recent_occ == 0:
                strengths.append({
                    "concept": concept,
                    "message": f"You have not made {concept.lower()} errors in your recent submissions.",
                    "icon": "💪",
                })
            elif total_occ == 0:
                strengths.append({
                    "concept": concept,
                    "message": f"No {concept.lower()} errors detected across all your submissions.",
                    "icon": "✅",
                })

        # ── Recurring mistakes ────────────────────────────────────────
        recurring_mistakes = []
        for cat in all_error_cats:
            count = all_labels.count(cat)
            rate  = count / len(user_history) if user_history else 0
            if rate >= 0.25:
                concept = concept_map[cat]
                reasons = [h.get("reason_group", "") for h in user_history
                           if h.get("label") == cat and h.get("reason_group")]
                top_reason = max(set(reasons), key=reasons.count) if reasons else None
                reason_text = reason_friendly.get(top_reason, "various issues") if top_reason else "various issues"
                recurring_mistakes.append({
                    "concept":   concept,
                    "count":     count,
                    "rate_pct":  round(rate * 100),
                    "message":   (
                        f"{concept} errors appear in {round(rate * 100)}% of your submissions, "
                        f"particularly around {reason_text}."
                    ),
                    "icon": "⚠️",
                })

        # ── Recently improved ─────────────────────────────────────────
        recently_improved = []
        if len(user_history) >= 4 and early:
            early_labels = [h.get("label", "CORRECT") for h in early]
            for cat in all_error_cats:
                early_rate  = early_labels.count(cat)  / len(early_labels)  if early_labels  else 0
                recent_rate = recent_labels.count(cat) / len(recent_labels) if recent_labels else 0
                if early_rate >= 0.3 and recent_rate < early_rate * 0.5:
                    concept         = concept_map[cat]
                    improvement_pct = round((1 - recent_rate / early_rate) * 100) if early_rate > 0 else 0
                    recently_improved.append({
                        "concept":         concept,
                        "improvement_pct": improvement_pct,
                        "message": (
                            f"Your {concept.lower()} error rate has dropped by approximately "
                            f"{improvement_pct}% compared to your earlier submissions."
                        ),
                        "icon": "📈",
                    })

        # ── New mistakes ──────────────────────────────────────────────
        new_mistakes  = []
        older         = user_history[:-3] if len(user_history) > 3 else []
        recent3_cats  = {h.get("label") for h in very_recent if h.get("label") != "CORRECT"}
        older_cats    = {h.get("label") for h in older}
        for cat in recent3_cats - older_cats:
            if cat:
                concept = concept_map.get(cat, cat)
                new_mistakes.append({
                    "concept": concept,
                    "message": f"A new {concept.lower()} error pattern appeared in your most recent submissions.",
                    "icon": "🆕",
                })

        # ── Recommended focus ─────────────────────────────────────────
        reason_advice = {
            "LOOP_ERROR": {
                "focus":  ["Nested loop structures", "Loop termination conditions", "While-loop counter management"],
                "avoid":  ["Using <= instead of < in for-loops", "Missing loop variable increments", "Infinite while(true) patterns"],
            },
            "VARIABLE_ERROR": {
                "focus":  ["Variable initialisation before use", "Assignment vs. equality operator", "Variable scope rules"],
                "avoid":  ["Self-assignment (x = x)", "Adding discounts instead of subtracting", "Reading uninitialised variables"],
            },
            "ARRAY_ERROR": {
                "focus":  ["Zero-based indexing", "Array length vs. last valid index", "Enhanced for-each loops"],
                "avoid":  ["Using array.length directly as an index", "Starting array loops at 1", "Accessing indices beyond length−1"],
            },
            "METHOD_ERROR": {
                "focus":  ["Matching argument count to parameter count", "Return type declarations", "Parameter vs. local variable distinction"],
                "avoid":  ["Returning values from void methods", "Missing return in typed methods", "Calling methods with wrong argument count"],
            },
        }

        recent_error_counts = {}
        for h in recent:
            if h.get("label") != "CORRECT":
                recent_error_counts[h["label"]] = recent_error_counts.get(h["label"], 0) + 1

        sorted_recent  = sorted(recent_error_counts.items(), key=lambda x: x[1], reverse=True)
        recommended_focus, avoid_patterns = [], []

        for cat, count in sorted_recent[:2]:
            concept = concept_map.get(cat, cat)
            advice  = reason_advice.get(cat, {"focus": [concept], "avoid": []})
            recommended_focus.append({
                "concept": concept,
                "count":   count,
                "topics":  advice["focus"],
                "icon":    "🎯",
            })
            for pattern in advice["avoid"]:
                avoid_patterns.append({"text": pattern, "concept": concept})

        # ── Summary narrative (dynamic) ───────────────────────────────
        error_submissions = [h for h in user_history if h.get("label") != "CORRECT"]

        if not error_submissions:
            summary = (
                "Excellent performance! All your submissions are error-free. "
                "Keep advancing to more complex challenges."
            )
        elif recently_improved:
            improved_list = ", ".join(x["concept"] for x in recently_improved)
            summary = f"You are showing clear improvement in {improved_list}. "
            if recurring_mistakes:
                rec_list = ", ".join(x["concept"] for x in recurring_mistakes[:2])
                summary += (
                    f"However, {rec_list} errors continue to appear frequently "
                    "and need focused attention."
                )
            else:
                summary += "Keep up this momentum and move to the next challenge."
        elif recurring_mistakes:
            rec_list = ", ".join(x["concept"] for x in recurring_mistakes[:2])
            summary = (
                f"Your main challenge areas are {rec_list}. "
                "Targeted practice on these concepts will significantly improve your results."
            )
        else:
            summary = (
                "Your submission history shows a mix of error types. "
                "Review the focus areas below and work through related exercises."
            )

        return {
            "success":           True,
            "user_id":           user_id,
            "source":            source,
            "has_data":          True,
            "total_submissions": n,
            "summary":           summary,
            "strengths":         strengths,
            "recurring_mistakes": recurring_mistakes,
            "recently_improved": recently_improved,
            "new_mistakes":      new_mistakes,
            "recommended_focus": recommended_focus,
            "avoid_patterns":    avoid_patterns,
        }

