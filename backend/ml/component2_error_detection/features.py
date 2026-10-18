"""
Component 2 v2 — shared preprocessing and feature extraction
=============================================================
Single source of truth for the v2 models. Imported by:
  - scripts/train_final_c2.py          (training)
  - eval/eval_pretest.py               (evaluation)
  - services/error_service.py          (inference)

The pickled TF-IDF vectorizers reference `code_normalize` from this module by
import path (`ml.component2_error_detection.features`), so this module must stay
importable from the backend root and its functions must not be renamed.

Copied from generator/train_eval.py so v2 inference matches the ablation exactly.
"""

import re

# ---------------------------------------------------------------- preprocessing
def clean_java_code(code):
    code = re.sub(r"/\*.*?\*/", " ", code or "", flags=re.S)
    code = re.sub(r"//.*", " ", code)
    code = re.sub(r"^\s*import\s+.*;", " ", code, flags=re.M)
    code = re.sub(r"^\s*package\s+.*;", " ", code, flags=re.M)
    code = re.sub(r"\[\s*", "[", code)
    code = re.sub(r"\s*\]", "]", code)
    return re.sub(r"\s+", " ", code).strip()


def code_normalize(code):
    code = clean_java_code(code)
    code = re.sub(r'"(?:[^"\\]|\\.)*"', " STR ", code)
    code = re.sub(r"'(?:[^'\\]|\\.)*'", " CHR ", code)
    code = re.sub(r"\b\d+\.\d+\b", " FLT ", code)
    code = re.sub(r"\b(?!0\b|1\b|2\b)\d+\b", " NUM ", code)  # keep 0/1/2: they matter for bounds/steps
    return code


CODE_TOKENS = (r"[A-Za-z_]\w*|\d+|<=|>=|==|!=|\+\+|--|\+=|-=|\*=|/=|&&|\|\||"
               r"[-+*/%<>=!\[\](){};.,]")


# ---------------------------------------------------------------- structural features
FEATS = ["n_le", "le_length", "lt_length_minus1", "idx_length", "idx_plus1", "for_start1", "for_no_update",
         "decrement_with_lt", "while_no_update", "has_continue", "has_break", "n_return", "int_method_no_return",
         "void_returns_value", "arity_mismatch", "string_arg_to_int", "int_div_2", "self_assign", "not_a_statement",
         "typed_decl_no_init", "invalid_ident", "type_str_to_int", "n_for", "n_while", "n_methods", "has_array",
         "loop_step2", "returns_const_expr"]


def _method_arity(code):
    decl = {m.group(1): (0 if not m.group(2).strip() else m.group(2).count(",") + 1)
            for m in re.finditer(r"static\s+\w+\s+(\w+)\s*\(([^)]*)\)\s*\{", code)}
    mism = 0
    for name, n in decl.items():
        for c in re.finditer(r"(?<![\w.])" + name + r"\s*\(([^()]*)\)\s*[;)]", code):
            args = c.group(1).strip()
            k = 0 if not args else args.count(",") + 1
            if k != n:
                mism = 1
    return decl, mism


def struct_features(code):
    c = clean_java_code(code)
    decl, mism = _method_arity(c)
    f = {}
    f["n_le"] = c.count("<=")
    f["le_length"] = int(bool(re.search(r"<=\s*\w+\.length", c)))
    f["lt_length_minus1"] = int(bool(re.search(r"<\s*\w+\.length\s*-\s*1", c)))
    f["idx_length"] = int(bool(re.search(r"\[\s*\w+\.length\s*\]", c)))
    f["idx_plus1"] = int(bool(re.search(r"\[\s*\w+\s*\+\s*1\s*\]", c)))
    f["for_start1"] = int(bool(re.search(r"for\s*\(\s*int\s+\w+\s*=\s*1\s*;", c)))
    f["for_no_update"] = int(bool(re.search(r"for\s*\([^;]*;[^;]*;\s*\)", c)))
    f["decrement_with_lt"] = int(bool(re.search(r"for\s*\([^;]*;\s*\w+\s*<=?[^;]*;\s*\w+\s*--", c)) or
                                 bool(re.search(r"for\s*\([^;]*;\s*\w+\s*>=?[^;]*;\s*\w+\s*\+\+", c)))
    wl = re.search(r"while\s*\(\s*(\w+)[^)]*\)\s*\{(.*?)\}", c)
    f["while_no_update"] = int(bool(wl) and not re.search(re.escape(wl.group(1)) + r"\s*(\+\+|--|\+=|-=|=)", wl.group(2)))
    f["has_continue"] = int("continue" in c)
    f["has_break"] = int("break" in c)
    f["n_return"] = len(re.findall(r"\breturn\b", c))
    f["int_method_no_return"] = int(bool(re.search(r"static\s+(int|double|boolean|String)\s+\w+\s*\([^)]*\)\s*\{", c))
                                    and f["n_return"] == 0)
    f["void_returns_value"] = int(bool(re.search(r"static\s+void\b", c)) and bool(re.search(r"return\s+[^;\s]", c)))
    f["arity_mismatch"] = mism
    f["string_arg_to_int"] = int(bool(re.search(r'\w+\(\s*"\d+"', c)))
    f["int_div_2"] = int(bool(re.search(r"\)\s*/\s*\d+\s*[;)]", c)) or bool(re.search(r"\(\s*\d+\s*/\s*\d+\s*\)", c)))
    f["self_assign"] = int(bool(re.search(r"(?<![\w.])(\w+)\s*=\s*\1\s*;", c)))
    f["not_a_statement"] = int(bool(re.search(r"(?:^|[;{}])\s*\w+\s*[+\-]\s*\w+\s*;", c)) or
                               bool(re.search(r";\s*\w+\s*\+\s*\d+\s*\)", c)))
    f["typed_decl_no_init"] = int(bool(re.search(r"\b(int|double|String|char|boolean)\s+\w+\s*;", c)))
    f["invalid_ident"] = int(bool(re.search(r"\b(int|double|String|char|boolean)\s+\d\w*", c)))
    f["type_str_to_int"] = int(bool(re.search(r'\bint\s+\w+\s*=\s*"', c)) or bool(re.search(r"\bint\s+\w+\s*=\s*\d+\.\d+", c))
                               or bool(re.search(r"\bString\s+\w+\s*=\s*[\d\w]+\s*;", c) and not re.search(r'\bString\s+\w+\s*=\s*"', c)))
    f["n_for"] = c.count("for (") + c.count("for(")
    f["n_while"] = c.count("while")
    f["n_methods"] = len(decl)
    f["has_array"] = int("[" in c)
    f["loop_step2"] = int(bool(re.search(r"\+=\s*2\s*\)", c)))
    f["returns_const_expr"] = int(bool(re.search(r"return\s+\d+\s*[*+\-/]\s*\d+\s*;", c)))
    return [f[k] for k in FEATS]


# ---------------------------------------------------------------- Code Runner evidence
RUNNER_FEATS = ["compiled", "ce_not_statement", "ce_missing_return", "ce_incompatible", "ce_arg_mismatch",
                "ce_cannot_find", "ce_uninitialized", "ce_unexpected_return", "ce_syntax", "ce_other",
                "rt_array_index", "rt_other_exception", "rt_non_terminating"]


def runner_features(row):
    """Runner evidence from a row with compile_error / runtime_exception / verified_outcome."""
    ce = str(row.get("compile_error") or "").lower()
    exc = str(row.get("runtime_exception") or "")
    f = dict.fromkeys(RUNNER_FEATS, 0)
    f["compiled"] = int(ce == "" or ce == "nan")
    if not f["compiled"]:
        if "not a statement" in ce: f["ce_not_statement"] = 1
        elif "missing return" in ce: f["ce_missing_return"] = 1
        elif "incompatible types" in ce or "lossy conversion" in ce: f["ce_incompatible"] = 1
        elif "cannot be applied" in ce or "actual and formal argument" in ce or "no suitable method" in ce: f["ce_arg_mismatch"] = 1
        elif "cannot find symbol" in ce: f["ce_cannot_find"] = 1
        elif "might not have been initialized" in ce: f["ce_uninitialized"] = 1
        elif "unexpected return value" in ce or "incompatible types: unexpected" in ce: f["ce_unexpected_return"] = 1
        elif "expected" in ce or "illegal start" in ce: f["ce_syntax"] = 1
        else: f["ce_other"] = 1
    if exc and exc != "nan":
        if "ArrayIndexOutOfBounds" in exc: f["rt_array_index"] = 1
        else: f["rt_other_exception"] = 1
    if row.get("verified_outcome") == "NON_TERMINATING": f["rt_non_terminating"] = 1
    return [f[k] for k in RUNNER_FEATS]


# ---------------------------------------------------------------- labels
REASON_GROUPS = ["ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_TRAVERSAL_ISSUE", "CORRECT_NO_ERROR", "LOOP_BOUNDARY_ISSUE",
                 "LOOP_CONDITION_ISSUE", "LOOP_CONTROL_FLOW_ISSUE", "LOOP_UPDATE_ISSUE", "METHOD_PARAMETER_USAGE_ISSUE",
                 "METHOD_RETURN_ISSUE", "METHOD_SIGNATURE_ISSUE", "VARIABLE_ASSIGNMENT_ISSUE",
                 "VARIABLE_CALCULATION_ISSUE"]

_BROAD = {"LOOP": "LOOP_ERROR", "VARIABLE": "VARIABLE_ERROR", "ARRAY": "ARRAY_ERROR",
          "METHOD": "METHOD_ERROR", "CORRECT": "CORRECT"}


def broad_of(reason_group):
    return _BROAD[reason_group.split("_")[0]]


# ---------------------------------------------------------------- calibration metrics
def brier_score(y, proba, classes):
    """Multiclass Brier score: mean over rows of sum_k (p_k - 1[y == k])^2 (0 = perfect, 2 = worst)."""
    import numpy as np
    onehot = (np.asarray(y)[:, None] == np.asarray(classes)[None, :]).astype(float)
    return float(np.mean(np.sum((np.asarray(proba) - onehot) ** 2, axis=1)))


def expected_calibration_error(y, proba, classes, n_bins=15):
    """Top-label ECE: |accuracy - mean max-probability|, weighted over equal-width confidence bins."""
    import numpy as np
    proba = np.asarray(proba)
    conf = proba.max(1)
    correct = (np.asarray(classes)[proba.argmax(1)] == np.asarray(y)).astype(float)
    bins = np.minimum((conf * n_bins).astype(int), n_bins - 1)
    ece = 0.0
    for b in range(n_bins):
        m = bins == b
        if m.any():
            ece += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(ece)
