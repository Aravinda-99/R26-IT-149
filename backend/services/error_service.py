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
        try:
            ml_label = model_1.predict([cleaned_code])[0]
            reason_group = model_2.predict([cleaned_code])[0]

            confidence = "Medium"
            if hasattr(model_1, "decision_function"):
                decision_scores = model_1.decision_function([cleaned_code])[0]
                if max(decision_scores) > 1.0:
                    confidence = "High"
                elif max(decision_scores) < 0.3:
                    confidence = "Low"
        except Exception as e:
            return {"success": False, "error": f"Prediction failed: {str(e)}"}

        # ------------------------------------------------------------------
        # Step 2 — Rule-based safety layer (triggered on Low confidence)
        # ------------------------------------------------------------------
        original_ml_label = ml_label
        final_label = ml_label
        override_applied = False
        override_reason = None
        hybrid_correction_badge = None

        if confidence == "Low":
            mismatch = cls.detect_method_argument_mismatch(code)
            if mismatch["mismatch_found"]:
                final_label = "METHOD_ERROR"
                override_applied = True
                override_reason = mismatch["reason"]
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
        
        if reason_group_original not in allowed_mapping.get(final_label, []):
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
            "broad_prediction": ml_label,
            "reason_model": "Linear SVM + TF-IDF",
            "reason_prediction": reason_group_original,
            "reason_group_final": reason_group_final,
            "reason_group_adjusted": "Yes" if reason_group_adjusted else "No",
            "feedback_source": "reason_group_feedback_template",
            "rule_override_applied": override_applied,
            "rule_override_reason": override_reason if override_reason else "None"
        }

        if override_applied and override_reason:
            details = dict(details)
            details["reason"] = override_reason
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

        response = {
            "success": True,
            "student_id": student_id,
            "analysis_source": "Two-stage ML prediction",
            "model_1": "Linear SVM broad error classifier",
            "model_2": "Linear SVM reason-group classifier",
            "broad_label": ml_label,
            "reason_group": reason_group_final,
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
        # ------------------------------------------------------------------
        cls._history.append({
            "student_id": student_id,
            "code": code if len(code) <= 100 else code[:100] + "...",
            "label": final_label,
            "original_ml_label": original_ml_label,
            "override_applied": override_applied,
            "concept": details["concept"],
            "timestamp": datetime.datetime.now().isoformat(),
            "activity": details["gamification"]["recommended_activity"]
        })

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
                "reason": "No common beginner error patterns were detected in the submitted code.",
                "misconception": "The learner appears to have a stable grasp of the implemented concepts.",
                "suggested_fix": "Everything looks good! You can try a more complex challenge to further test your skills.",
                "beginner_explanation": "Great job! Your code follows the expected logic and structure for these programming concepts.",
                "gamification": {
                    "target_concept": "General",
                    "recommended_activity": "Advanced Java Challenge",
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
                "reason": "A mathematical calculation is logically flawed, such as adding a discount instead of subtracting.",
                "misconception": "Confusion with operators or misunderstanding the semantic meaning of the variables (e.g., discounts reduce total).",
                "suggested_fix": "Check your math operators. If computing a discount, use subtraction '-'. If computing tax, use addition and multiplication.",
                "beginner_explanation": "Math in Java is just like math in school. If a discount makes things cheaper, use a minus sign, not a plus sign!"
            },
            "CORRECT_NO_ERROR": {
                "base": "CORRECT",
                "reason": "No errors were found in the reasoning structure.",
                "misconception": "The learner correctly applies the required logic.",
                "suggested_fix": "Code looks completely fine.",
                "beginner_explanation": "Perfect reasoning! The logic follows exactly what is expected."
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
    def get_history(cls, user_id):
        """Returns error analysis history (last 10 items)."""
        user_history = [h for h in cls._history if h["student_id"] == user_id]
        return {
            "user_id": user_id,
            "total": len(user_history),
            "history": user_history[-10:]
        }

    @classmethod
    def get_summary(cls, user_id):
        """Aggregates error patterns for the user."""
        user_history = [h for h in cls._history if h["student_id"] == user_id]
        if not user_history:
            return {"user_id": user_id, "total_analyses": 0, "counts": {}}

        counts = {}
        for h in user_history:
            lbl = h["label"]
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
            "user_id": user_id,
            "total_analyses": len(user_history),
            "counts": counts,
            "most_frequent_error": most_freq,
            "recommended_focus": rec_focus
        }
