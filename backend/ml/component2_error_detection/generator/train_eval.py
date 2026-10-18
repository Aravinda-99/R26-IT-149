"""
Component 2 — baseline vs improved models + Model 3 (stacking meta-corrector).

Usage: python3 train_eval.py DATASET_CSV OUT_DIR

Experiments
  E1  Original setup: TF-IDF default tokenizer (drops operators) + LinearSVC, two independent stages
  E2  Code-aware tokenizer (keeps <=, ++, [], ; ...) + LinearSVC, two independent stages
  E3  E2 + Model 3: a meta-classifier over out-of-fold Stage-1/Stage-2 scores + structural code features
  E4  E3 + Code Runner evidence (compile error category, runtime exception, non-termination)

Splits
  random   : stratified 80/20 on rows (optimistic; same template instance can sit in train and test)
  instance : grouped by instance_id (a program and all its mutants stay on one side)
  family   : GroupKFold by family (whole task types unseen at test time; hardest)
"""
import json, os, re, sys
import numpy as np, pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import (train_test_split, GroupShuffleSplit, GroupKFold, StratifiedKFold,
                                     cross_val_predict)
from sklearn.metrics import accuracy_score, f1_score, classification_report, confusion_matrix

# ---------------------------------------------------------------- preprocessing
def clean_java_code(code):  # same as production error_service.clean_java_code
    code = re.sub(r"/\*.*?\*/", " ", code, flags=re.S)
    code = re.sub(r"//.*", " ", code)
    code = re.sub(r"^\s*import\s+.*;", " ", code, flags=re.M)
    code = re.sub(r"^\s*package\s+.*;", " ", code, flags=re.M)
    code = re.sub(r"\[\s*", "[", code); code = re.sub(r"\s*\]", "]", code)
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


def old_vec(maxf):
    return TfidfVectorizer(max_features=maxf, ngram_range=(1, 2))


def new_vec():
    return TfidfVectorizer(preprocessor=code_normalize, token_pattern=CODE_TOKENS, lowercase=False,
                           ngram_range=(1, 3), sublinear_tf=True, min_df=2)


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
            args = c.group(1).strip(); k = 0 if not args else args.count(",") + 1
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


# ---------------------------------------------------------------- experiments
RUNNER_FEATS = ["compiled", "ce_not_statement", "ce_missing_return", "ce_incompatible", "ce_arg_mismatch",
                "ce_cannot_find", "ce_uninitialized", "ce_unexpected_return", "ce_syntax", "ce_other",
                "rt_array_index", "rt_other_exception", "rt_non_terminating"]


def runner_features(row):
    """Evidence the Code Runner can provide at inference time (no reference output needed)."""
    ce = str(row.get("compile_error") or "").lower(); exc = str(row.get("runtime_exception") or "")
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


def svm_pipe(vec):
    return Pipeline([("tfidf", vec), ("clf", LinearSVC(C=1.0, random_state=42))])


def metrics(y, p):
    return dict(accuracy=round(accuracy_score(y, p), 4), macro_f1=round(f1_score(y, p, average="macro"), 4),
                weighted_f1=round(f1_score(y, p, average="weighted"), 4))


GROUP2BROAD = lambda g: {"LOOP": "LOOP_ERROR", "VARIABLE": "VARIABLE_ERROR", "ARRAY": "ARRAY_ERROR",
                         "METHOD": "METHOD_ERROR", "CORRECT": "CORRECT"}[g.split("_")[0]]


def run_fold(tr, te, df):
    Xtr, Xte = df.code.values[tr], df.code.values[te]
    yb_tr, yb_te = df.label.values[tr], df.label.values[te]
    yr_tr, yr_te = df.reason_group.values[tr], df.reason_group.values[te]
    out = {}
    # E1 original
    m1 = svm_pipe(old_vec(5000)).fit([clean_java_code(x) for x in Xtr], yb_tr)
    m2 = svm_pipe(old_vec(7000)).fit([clean_java_code(x) for x in Xtr], yr_tr)
    pb = m1.predict([clean_java_code(x) for x in Xte]); pr = m2.predict([clean_java_code(x) for x in Xte])
    out["E1"] = (pb, pr)
    # E2 code-aware
    n1 = svm_pipe(new_vec()).fit(Xtr, yb_tr); n2 = svm_pipe(new_vec()).fit(Xtr, yr_tr)
    pb2, pr2 = n1.predict(Xte), n2.predict(Xte)
    out["E2"] = (pb2, pr2)
    # E3 Model 3 — out-of-fold base scores on train, full-fit base scores on test
    skf = StratifiedKFold(5, shuffle=True, random_state=42)
    oof1 = cross_val_predict(svm_pipe(new_vec()), Xtr, yb_tr, cv=skf, method="decision_function")
    oof2 = cross_val_predict(svm_pipe(new_vec()), Xtr, yr_tr, cv=skf, method="decision_function")
    S_tr = np.array([struct_features(x) for x in Xtr]); S_te = np.array([struct_features(x) for x in Xte])
    Ztr = np.hstack([oof1, oof2, S_tr]); Zte = np.hstack([n1.decision_function(Xte), n2.decision_function(Xte), S_te])
    m3 = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.08, random_state=42).fit(Ztr, yr_tr)
    pr3 = m3.predict(Zte)
    out["E3"] = (np.array([GROUP2BROAD(g) for g in pr3]), pr3)
    # E4 Model 3 + Code Runner evidence
    R_tr = np.array([runner_features(r) for _, r in df.iloc[tr].iterrows()])
    R_te = np.array([runner_features(r) for _, r in df.iloc[te].iterrows()])
    m4 = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.08, random_state=42).fit(np.hstack([Ztr, R_tr]), yr_tr)
    pr4 = m4.predict(np.hstack([Zte, R_te]))
    out["E4"] = (np.array([GROUP2BROAD(g) for g in pr4]), pr4)
    out["_y"] = (yb_te, yr_te)
    out["_consistency"] = {k: float(np.mean([GROUP2BROAD(r) == b for b, r in zip(*out[k])])) for k in ("E1", "E2")}
    return out


def evaluate(df, split):
    if split == "random":
        idx = np.arange(len(df))
        tr, te = train_test_split(idx, test_size=0.2, random_state=42, stratify=df.reason_group)
        folds = [(tr, te)]
    elif split == "instance":
        gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
        folds = list(gss.split(df, groups=df.instance_id))
    else:
        folds = list(GroupKFold(n_splits=5).split(df, groups=df.family))
    agg = {k: ([], [], [], []) for k in ("E1", "E2", "E3", "E4")}
    cons = {"E1": [], "E2": []}
    for tr, te in folds:
        o = run_fold(tr, te, df)
        yb, yr = o["_y"]
        for k in agg:
            agg[k][0].extend(yb); agg[k][1].extend(o[k][0]); agg[k][2].extend(yr); agg[k][3].extend(o[k][1])
        for k in cons:
            cons[k].append(o["_consistency"][k])
    res = {}
    for k, (yb, pb, yr, pr) in agg.items():
        res[k] = {"stage1_broad": metrics(yb, pb), "stage2_reason": metrics(yr, pr)}
        if k in cons:
            res[k]["stage1_stage2_agreement"] = round(float(np.mean(cons[k])), 4)
    res["_reports"] = {k: classification_report(agg[k][2], agg[k][3], zero_division=0, output_dict=True) for k in agg}
    return res


def main():
    path, out = sys.argv[1], sys.argv[2]
    os.makedirs(out, exist_ok=True)
    df = pd.read_csv(path)
    print("rows", len(df))
    allres = {}
    for split in ("random", "instance", "family"):
        print("split:", split, flush=True)
        allres[split] = evaluate(df, split)
        for k in ("E1", "E2", "E3", "E4"):
            print(f"  {k}", allres[split][k])
    json.dump(allres, open(os.path.join(out, "ablation_results.json"), "w"), indent=2)


if __name__ == "__main__":
    main()
