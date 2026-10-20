"""
Pre-test-style fill-in-the-blank families for the C2 dataset (v2).

They mirror the *kinds* of questions in the CodeQuest pre-test (type keyword, identifier,
comparison operator, loop keyword, loop update, break/continue, array declaration, index,
.length, compound assignment, return keyword, void, argument type, recursion), but with
different contexts, names and values. The real pre-test rows are NOT used here, so they stay
a held-out test set.

Interface is the same as families.py: returns (concept, lines, methods, mutations).
"""
import random

NAMES = ["Kamal", "Nimal", "Saman", "Amaya", "Dilini", "Kasun"]


def _blank(lines_before, template, lines_after, correct, wrongs, concept, methods=None, method_has_blank=False):
    """template: list of lines (inside main or inside methods) with exactly one '{_}'."""
    filled = [t.replace("{_}", correct) for t in template]
    blank_line = next(t for t in template if "{_}" in t)
    old = blank_line.replace("{_}", correct)
    muts = [(fine, old, blank_line.replace("{_}", w), ce) for w, fine, ce in wrongs]
    if method_has_blank:
        meth = filled
        lines = [("decl", x) for x in lines_before] + [("core", x) for x in lines_after]
    else:
        meth = methods or []
        lines = ([("decl", x) for x in lines_before] + [("core", x) for x in filled] +
                 [("out", x) for x in lines_after])
    return concept, lines, meth, muts


# ------------------------------------------------------------------ VARIABLES
def B_type_keyword(r):
    opts = [
        ("int", r.choice(["age", "marks", "count", "year", "score", "qty"]), str(r.randint(2, 99)),
         [("Int", True), ("integer", True), ("void", True), ("String", True), ("num", True)]),
        ("double", r.choice(["price", "height", "salary", "avg", "weight"]), f"{r.randint(1, 99)}.{r.randint(1, 9)}",
         [("Double", False), ("int", True), ("float", True), ("decimal", True), ("Real", True)]),
        ("boolean", r.choice(["isActive", "passed", "isValid", "done", "hasKey"]), r.choice(["true", "false"]),
         [("bool", True), ("Bool", True), ("bit", True), ("int", True), ("Boolean", False)]),
        ("String", r.choice(["name", "city", "course", "msg"]), f'"{r.choice(NAMES)}"',
         [("string", True), ("str", True), ("char", True), ("Text", True)]),
        ("char", r.choice(["grade", "letter", "initial"]), f"'{r.choice('ABCDXYZ')}'",
         [("Char", True), ("character", True), ("string", True), ("String", True)]),
    ]
    typ, var, val, wr = r.choice(opts)
    wrongs = [(w, "VARIABLE_INVALID_TYPE", ce) for w, ce in r.sample(wr, k=min(3, len(wr)))]
    return _blank([], ["{_} " + f"{var} = {val};"], [f"System.out.println({var});"], typ, wrongs, "Variables")


def B_identifier(r):
    good = r.choice(["_count", "total", "myVar", "studentAge", "$price", "num1", "itemCount", "_x"])
    val = r.randint(1, 99)
    bad = r.sample(["2count", "my-var", "class", "int", "for", "my var", "#total", "1st", "new", "public",
                    "my.var", "total%"], 3)
    wrongs = [(b, "VARIABLE_INVALID_NAME", True) for b in bad]
    return _blank([], ["int {_} = " + f"{val};"], [f"System.out.println({good});"], good, wrongs, "Variables")


def B_compare_op(r):
    x = r.choice(["score", "marks", "age", "x", "count"]); V = r.randint(5, 50)
    kind = r.choice(["eq", "ge", "le"])
    if kind == "eq":
        before = [f"int {x} = {V};"]; correct = "=="
        pool = [("=", True), ("===", True), ("equals", True), ("=!", True), ("<>", True)]
    elif kind == "ge":
        before = [f"int {x} = {V + 3};"]; correct = ">="
        pool = [("=>", True), ("=", True), ("> =", True), ("=>=", True)]
    else:
        before = [f"int {x} = {V - 3};"]; correct = "<="
        pool = [("=<", True), ("=", True), ("< =", True), ("<<=", True)]
    wrongs = [(w, "VARIABLE_ASSIGN_VS_COMPARE" if w == "=" else "VARIABLE_INVALID_OPERATOR", ce)
              for w, ce in r.sample(pool, 3)]
    tmpl = [f"if ({x} " + "{_}" + f" {V}) {{", '    System.out.println("Yes");', "}"]
    return _blank(before, tmpl, ['System.out.println("End");'], correct, wrongs, "Variables")


def B_compound_assign(r):
    s = r.choice(["sum", "total", "result"]); a = r.choice(["nums", "marks", "values"])
    vals = ", ".join(str(r.randint(2, 20)) for _ in range(r.randint(3, 6)))
    v = r.choice(["n", "x", "num", "m"])
    wrongs = [("=", "VARIABLE_OVERWRITTEN_VALUE", False), ("=+", "VARIABLE_OVERWRITTEN_VALUE", False),
              ("-=", "VARIABLE_WRONG_CALCULATION", False), ("*=", "VARIABLE_WRONG_CALCULATION", False)]
    tmpl = [f"for (int {v} : {a}) {{", f"    {s} " + "{_}" + f" {v};", "}"]
    return _blank([f"int[] {a} = {{{vals}}};", f"int {s} = 0;"], tmpl, [f"System.out.println({s});"],
                  "+=", r.sample(wrongs, 3), "Variables")


# ------------------------------------------------------------------ LOOPS
def B_loop_cond_var(r):
    i = r.choice(["i", "i", "j", "k", "count"]); N = r.randint(3, 9)
    others = [x for x in ["i", "j", "k", "n", "x"] if x != i]
    wrongs = [(o, "LOOP_WRONG_CONDITION", True) for o in r.sample(others, 2)] + [(str(N), "LOOP_WRONG_CONDITION", False)]
    tmpl = [f"for (int {i} = 0; " + "{_}" + f" < {N}; {i}++) {{", f"    System.out.println({i});", "}"]
    return _blank([], tmpl, [], i, wrongs, "Loops")


def B_do_keyword(r):
    i = r.choice(["i", "x", "count"]); S = r.randint(0, 3); N = S + r.randint(2, 5)
    wrongs = [(w, "LOOP_WRONG_KEYWORD", True) for w in r.sample(["while", "for", "if", "repeat", "loop"], 3)]
    tmpl = ["{_} {", f"    System.out.println({i});", f"    {i}++;", f"}} while ({i} < {N});"]
    return _blank([f"int {i} = {S};"], tmpl, [], "do", wrongs, "Loops")


def B_loop_update(r):
    i = r.choice(["i", "x", "count", "n"]); N = r.randint(3, 7)
    correct = r.choice([f"{i}++", f"{i} += 1", f"{i} = {i} + 1"])
    pool = [(f"{i}--", "LOOP_WRONG_COUNTER_DIRECTION", False), (f"{i}", "LOOP_MISSING_UPDATE", True),
            ("continue", "LOOP_CONTINUE_SKIP_UPDATE", False), (f"{i} + 1", "LOOP_MISSING_UPDATE", True)]
    tmpl = [f"while ({i} < {N}) {{", f"    System.out.println({i});", "    {_};", "}"]
    return _blank([f"int {i} = 0;"], tmpl, [], correct, r.sample(pool, 3), "Loops")


def B_jump_keyword(r):
    i = r.choice(["i", "j", "k"]); N = r.randint(5, 9); K = r.randint(2, N - 1)
    if r.random() < 0.5:
        correct = "break"
        pool = [("continue", "LOOP_WRONG_JUMP", False), ("return", "LOOP_WRONG_JUMP", False),
                ("sleep", "LOOP_INVALID_JUMP_KEYWORD", True), ("stop", "LOOP_INVALID_JUMP_KEYWORD", True),
                ("exit", "LOOP_INVALID_JUMP_KEYWORD", True), ("pause", "LOOP_INVALID_JUMP_KEYWORD", True)]
    else:
        correct = "continue"
        pool = [("break", "LOOP_WRONG_JUMP", False), ("return", "LOOP_WRONG_JUMP", False),
                ("skip", "LOOP_INVALID_JUMP_KEYWORD", True), ("next", "LOOP_INVALID_JUMP_KEYWORD", True),
                ("exit", "LOOP_INVALID_JUMP_KEYWORD", True)]
    tmpl = [f"for (int {i} = 1; {i} <= {N}; {i}++) {{", f"    if ({i} == {K}) {{", "        {_};", "    }",
            f"    System.out.println({i});", "}"]
    return _blank([], tmpl, ['System.out.println("Done");'], correct, r.sample(pool, 3), "Loops")


# ------------------------------------------------------------------ ARRAYS
def B_array_decl(r):
    a = r.choice(["arr", "nums", "marks", "scores"]); L = r.randint(3, 9)
    if r.random() < 0.6:
        tmpl = ["int{_} " + f"{a} = new int[{L}];"]; correct = "[]"
        pool = ["()", "{}", "<>", "[L]"]
        pool = [p.replace("L", str(L)) for p in pool]
    else:
        tmpl = [f"int[] {a} = new int" + "{_};"]; correct = f"[{L}]"
        pool = [f"({L})", f"{{{L}}}", f"<{L}>", "[]"]
    wrongs = [(w, "ARRAY_INVALID_DECLARATION", True) for w in r.sample(pool, 3)]
    return _blank([], tmpl, [f"System.out.println({a}.length);"], correct, wrongs, "Arrays")


def B_array_index(r):
    a = r.choice(["arr", "nums", "marks", "data"]); vals = r.sample(range(1, 60), r.randint(4, 7))
    lit = "{" + ", ".join(map(str, vals)) + "}"
    v = r.choice(["x", "value", "item"])
    if r.random() < 0.5:  # first element
        correct = "0"
        pool = [("1", "ARRAY_WRONG_INDEX_VARIABLE", False), ("-1", "ARRAY_OUT_OF_BOUNDS", False),
                (f"{a}.length", "ARRAY_LENGTH_AS_INDEX", False), ("first", "ARRAY_WRONG_INDEX_VARIABLE", True)]
    else:  # last element
        correct = f"{a}.length - 1"
        pool = [(f"{a}.length", "ARRAY_LENGTH_AS_INDEX", False), ("-1", "ARRAY_OUT_OF_BOUNDS", False),
                (f"{a}.length()", "ARRAY_WRONG_LENGTH_SYNTAX", True), (str(len(vals)), "ARRAY_LENGTH_AS_INDEX", False)]
    return _blank([f"int[] {a} = {lit};"], [f"int {v} = {a}[" + "{_}];"], [f"System.out.println({v});"],
                  correct, r.sample(pool, 3), "Arrays")


def B_traversal_op(r):
    a = r.choice(["arr", "nums", "marks", "items"]); i = r.choice(["i", "j", "k"])
    lit = "{" + ", ".join(str(r.randint(1, 50)) for _ in range(r.randint(3, 6))) + "}"
    pool = [("<=", "ARRAY_OUT_OF_BOUNDS", False), (">", "ARRAY_WRONG_TRAVERSAL", False),
            ("==", "ARRAY_WRONG_TRAVERSAL", False), (">=", "ARRAY_WRONG_TRAVERSAL", False)]
    tmpl = [f"for (int {i} = 0; {i} " + "{_}" + f" {a}.length; {i}++) {{", f"    System.out.println({a}[{i}]);", "}"]
    return _blank([f"int[] {a} = {lit};"], tmpl, [], "<", r.sample(pool, 3), "Arrays")


def B_length_syntax(r):
    a = r.choice(["arr", "nums", "marks", "list"])
    lit = "{" + ", ".join(str(r.randint(1, 50)) for _ in range(r.randint(3, 6))) + "}"
    wrongs = [(w, "ARRAY_WRONG_LENGTH_SYNTAX", True) for w in r.sample(["length()", "size()", "size", "count", "len"], 3)]
    if r.random() < 0.5:
        tmpl = [f"System.out.println({a}." + "{_});"]
        return _blank([f"int[] {a} = {lit};"], tmpl, [], "length", wrongs, "Arrays")
    tmpl = [f"for (int i = 0; i < {a}." + "{_}; i++) {", f"    System.out.println({a}[i]);", "}"]
    return _blank([f"int[] {a} = {lit};"], tmpl, [], "length", wrongs, "Arrays")


# ------------------------------------------------------------------ METHODS
def B_return_keyword(r):
    f = r.choice(["add", "getTotal", "square", "doubleIt", "getFive"])
    if f == "getFive":
        sig, expr, call = f"static int {f}() {{", str(r.randint(2, 9)), f"{f}()"
    elif f in ("square", "doubleIt"):
        sig = f"static int {f}(int n) {{"; expr = "n * n" if f == "square" else "n * 2"; call = f"{f}({r.randint(2, 9)})"
    else:
        sig, expr, call = f"static int {f}(int a, int b) {{", "a + b", f"{f}({r.randint(1, 9)}, {r.randint(1, 9)})"
    wrongs = [(w, "METHOD_MISSING_RETURN_KEYWORD", True) for w in r.sample(["print", "output", "give", "send", "returns", "result"], 3)]
    return _blank([], [sig, "    {_} " + f"{expr};", "}"], [f"System.out.println({call});"], "return",
                  wrongs, "Methods", method_has_blank=True)


def B_void_keyword(r):
    f = r.choice(["printHello", "showMenu", "greet", "displayMsg"]); msg = r.choice(["Hello", "Welcome", "Hi", "Menu"])
    wrongs = [(w, "METHOD_WRONG_RETURN_TYPE", True) for w in r.sample(["int", "return", "null", "String", "Void", "empty"], 3)]
    return _blank([], ["static {_} " + f"{f}() {{", f'    System.out.println("{msg}");', "}"], [f"{f}();"],
                  "void", wrongs, "Methods", method_has_blank=True)


def B_arg_type(r):
    f = r.choice(["add", "multiply", "sum", "total"]); op = "*" if f == "multiply" else "+"
    A, B = r.randint(1, 9), r.choice([3, 4, 5, 7])
    words = {3: ("three", "III"), 4: ("four", "IV"), 5: ("five", "V"), 7: ("seven", "VII")}[B]
    pool = [(words[0], "METHOD_WRONG_CALL", True), (f'"{B}"', "METHOD_WRONG_CALL", True),
            (words[1], "METHOD_WRONG_CALL", True), (f"{B}.5", "METHOD_WRONG_CALL", True), (f"'{B}'", "METHOD_WRONG_CALL", False)]
    meth = [f"static int {f}(int a, int b) {{", f"    return a {op} b;", "}"]
    return _blank([], [f"System.out.println({f}({A}, " + "{_}));"], [], str(B), r.sample(pool, 3), "Methods", methods=meth)


def B_recursion_base(r):
    if r.random() < 0.5:
        f = r.choice(["fact", "factorial"]); N = r.randint(3, 6)
        tmpl = [f"static int {f}(int n) {{", "    if (n == 1) {", "        return {_};", "    }",
                f"    return n * {f}(n - 1);", "}"]
        correct = "1"
        pool = [("0", "METHOD_WRONG_BASE_CASE", False), (f"{f}(n)", "METHOD_WRONG_BASE_CASE", False),
                ("n", "METHOD_WRONG_BASE_CASE", False), ("-1", "METHOD_WRONG_BASE_CASE", False)]
    else:
        f = r.choice(["sumTo", "addAll"]); N = r.randint(3, 8)
        tmpl = [f"static int {f}(int n) {{", "    if (n == 0) {", "        return {_};", "    }",
                f"    return n + {f}(n - 1);", "}"]
        correct = "0"
        pool = [("1", "METHOD_WRONG_BASE_CASE", False), (f"{f}(n)", "METHOD_WRONG_BASE_CASE", False),
                ("n", "METHOD_WRONG_BASE_CASE", False), ("n - 1", "METHOD_WRONG_BASE_CASE", False)]
    return _blank([], tmpl, [f"System.out.println({f}({N}));"], correct, r.sample(pool, 3), "Methods",
                  method_has_blank=True)


def B_recursion_arg(r):
    if r.random() < 0.5:
        f = r.choice(["fact", "factorial"]); N = r.randint(3, 6)
        tmpl = [f"static int {f}(int n) {{", "    if (n == 1) {", "        return 1;", "    }",
                f"    return n * {f}(" + "{_});", "}"]
    else:
        f = r.choice(["sumTo", "addAll"]); N = r.randint(3, 8)
        tmpl = [f"static int {f}(int n) {{", "    if (n == 0) {", "        return 0;", "    }",
                f"    return n + {f}(" + "{_});", "}"]
    pool = [("n", "METHOD_WRONG_RECURSIVE_ARG", False), ("n + 1", "METHOD_WRONG_RECURSIVE_ARG", False),
            ("1", "METHOD_WRONG_RECURSIVE_ARG", False), ("n - 2", "METHOD_WRONG_RECURSIVE_ARG", False)]
    return _blank([], tmpl, [f"System.out.println({f}({N}));"], "n - 1", r.sample(pool, 3), "Methods",
                  method_has_blank=True)


BLANK_FAMILIES = {f.__name__: f for f in [
    B_type_keyword, B_identifier, B_compare_op, B_compound_assign,
    B_loop_cond_var, B_do_keyword, B_loop_update, B_jump_keyword,
    B_array_decl, B_array_index, B_traversal_op, B_length_syntax,
    B_return_keyword, B_void_keyword, B_arg_type, B_recursion_base, B_recursion_arg]}

BLANK_REASON_GROUP = {
    "VARIABLE_INVALID_TYPE": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_ASSIGN_VS_COMPARE": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_INVALID_OPERATOR": "VARIABLE_ASSIGNMENT_ISSUE",
    "LOOP_WRONG_KEYWORD": "LOOP_CONTROL_FLOW_ISSUE",
    "LOOP_INVALID_JUMP_KEYWORD": "LOOP_CONTROL_FLOW_ISSUE",
    "LOOP_WRONG_JUMP": "LOOP_CONTROL_FLOW_ISSUE",
    "ARRAY_INVALID_DECLARATION": "ARRAY_BOUNDARY_INDEX_ISSUE",
    "ARRAY_WRONG_LENGTH_SYNTAX": "ARRAY_BOUNDARY_INDEX_ISSUE",
    "METHOD_MISSING_RETURN_KEYWORD": "METHOD_RETURN_ISSUE",
    "METHOD_WRONG_BASE_CASE": "METHOD_RETURN_ISSUE",
    "METHOD_WRONG_RECURSIVE_ARG": "METHOD_PARAMETER_USAGE_ISSUE",
}
