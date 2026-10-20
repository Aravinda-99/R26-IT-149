"""
Task families for the C2 synthetic Java error dataset.

Each family builds one "instance" (random names/values) and returns:
  lines     : list of (tag, text) for statements inside main()  tag in {decl, core, out}
  methods   : list of text lines for static methods (placed before main)
  mutations : list of (fine_reason, old, new, expect_compile_error)
The correct version is the unmutated instance.
"""
import random

ARR = ["arr", "nums", "numbers", "values", "marks", "data", "scores", "items"]
NV = ["n", "limit", "size", "end", "num", "times"]
IV = ["i", "i", "i", "i", "j", "k", "idx"]
SUMV = ["sum", "total", "result", "acc"]
NAMES = ["Kamal", "Nimal", "Saman", "Amaya", "Dilini", "Kasun", "Ruwan", "Tharushi"]


def pick(r, pool, used):
    c = [x for x in pool if x not in used]
    v = r.choice(c)
    used.add(v)
    return v


def arr_lit(r, k=None, lo=-5, hi=40, distinct=True):
    k = k or r.randint(4, 8)
    if distinct:
        vals = r.sample(range(lo, hi), k)
    else:
        vals = [r.randint(lo, hi) for _ in range(k)]
    return "{" + ", ".join(map(str, vals)) + "}", vals


# ---------------------------------------------------------------- LOOPS
def L_print_up(r):
    u = set(); n = pick(r, NV, u); i = pick(r, IV, u); N = r.randint(3, 9)
    loop = f"for (int {i} = 1; {i} <= {n}; {i}++) {{"
    lines = [("decl", f"int {n} = {N};"), ("core", loop),
             ("core", f"    System.out.println({i});"), ("core", "}")]
    m = [("LOOP_OFF_BY_ONE", f"{i} <= {n};", f"{i} < {n};", False),
         ("LOOP_OFF_BY_ONE", f"int {i} = 1;", f"int {i} = 0;", False),
         ("LOOP_WRONG_CONDITION", f"{i} <= {n};", f"{i} >= {n};", False),
         ("LOOP_WRONG_CONDITION", f"{i} <= {n};", f"{i} == {n};", False),
         ("LOOP_WRONG_COUNTER_DIRECTION", f"{i}++)", f"{i}--)", False),
         ("LOOP_MISSING_UPDATE", f"; {i}++)", "; )", False)]
    return "Loops", lines, [], m


def L_while_sum(r):
    u = set(); n = pick(r, NV, u); s = pick(r, SUMV, u); i = pick(r, IV, u); N = r.randint(4, 10)
    lines = [("decl", f"int {n} = {N};"), ("decl", f"int {s} = 0;"), ("decl", f"int {i} = 1;"),
             ("core", f"while ({i} <= {n}) {{"), ("core", f"    {s} += {i};"),
             ("core", f"    {i}++;"), ("core", "}"), ("out", f"System.out.println({s});")]
    m = [("LOOP_MISSING_UPDATE", f"    {i}++;\n", "", False),
         ("LOOP_OFF_BY_ONE", f"({i} <= {n})", f"({i} < {n})", False),
         ("LOOP_WRONG_CONDITION", f"({i} <= {n})", f"({i} > {n})", False),
         ("LOOP_WRONG_COUNTER_DIRECTION", f"    {i}++;", f"    {i}--;", False),
         ("LOOP_CONTINUE_SKIP_UPDATE", f"    {s} += {i};", f"    if ({i} % 2 == 0) continue;\n    {s} += {i};", False),
         ("LOOP_EARLY_BREAK", f"    {i}++;\n", f"    {i}++;\n    break;\n", False),
         ("VARIABLE_WRONG_INITIALIZATION", f"int {s} = 0;", f"int {s} = 1;", False)]
    return "Loops", lines, [], m


def L_countdown(r):
    u = set(); n = pick(r, NV, u); i = pick(r, IV, u); N = r.randint(3, 9)
    lines = [("decl", f"int {n} = {N};"),
             ("core", f"for (int {i} = {n}; {i} > 0; {i}--) {{"),
             ("core", f"    System.out.println({i});"), ("core", "}")]
    m = [("LOOP_OFF_BY_ONE", f"{i} > 0;", f"{i} >= 0;", False),
         ("LOOP_OFF_BY_ONE", f"int {i} = {n};", f"int {i} = {n} - 1;", False),
         ("LOOP_WRONG_CONDITION", f"{i} > 0;", f"{i} < 0;", False),
         ("LOOP_WRONG_COUNTER_DIRECTION", f"{i}--)", f"{i}++)", False)]
    return "Loops", lines, [], m


def L_even_step(r):
    u = set(); n = pick(r, NV, u); i = pick(r, IV, u); N = r.choice([4, 6, 8, 10, 12])
    lines = [("decl", f"int {n} = {N};"),
             ("core", f"for (int {i} = 0; {i} <= {n}; {i} += 2) {{"),
             ("core", f"    System.out.println({i});"), ("core", "}")]
    m = [("LOOP_OFF_BY_ONE", f"{i} <= {n};", f"{i} < {n};", False),
         ("LOOP_WRONG_CONDITION", f"{i} <= {n};", f"{i} >= {n};", False),
         ("LOOP_MISSING_UPDATE", f"{i} += 2)", f"{i} + 2)", True),
         ("LOOP_MISSING_UPDATE", f"{i} += 2)", f"{i} += 0)", False)]
    return "Loops", lines, [], m


def L_first_multiple(r):
    u = set(); n = pick(r, NV, u); i = pick(r, IV, u)
    k = r.randint(3, 5); N = r.randint(3 * k, 5 * k)
    lines = [("decl", f"int {n} = {N};"),
             ("core", f"for (int {i} = 1; {i} <= {n}; {i}++) {{"),
             ("core", f"    if ({i} % {k} == 0) {{"),
             ("core", f"        System.out.println({i});"),
             ("core", "        break;"), ("core", "    }"), ("core", "}")]
    m = [("LOOP_EARLY_BREAK_MISSING", "        break;\n", "", False),
         ("LOOP_EARLY_BREAK_MISSING", "        break;", "        continue;", False),
         ("LOOP_EARLY_BREAK", "        break;\n    }\n", "    }\n    break;\n", False),
         ("LOOP_WRONG_CONDITION", f"{i} <= {n};", f"{i} >= {n};", False)]
    return "Loops", lines, [], m


# ---------------------------------------------------------------- ARRAYS
def A_print_all(r):
    u = set(); a = pick(r, ARR, u); i = pick(r, IV, u); lit, _ = arr_lit(r)
    lines = [("decl", f"int[] {a} = {lit};"),
             ("core", f"for (int {i} = 0; {i} < {a}.length; {i}++) {{"),
             ("core", f"    System.out.println({a}[{i}]);"), ("core", "}")]
    m = [("ARRAY_OUT_OF_BOUNDS", f"{i} < {a}.length", f"{i} <= {a}.length", False),
         ("ARRAY_SKIPPED_ELEMENT", f"int {i} = 0;", f"int {i} = 1;", False),
         ("ARRAY_SKIPPED_ELEMENT", f"{i} < {a}.length;", f"{i} < {a}.length - 1;", False),
         ("ARRAY_WRONG_TRAVERSAL", f"{i}++)", f"{i} += 2)", False),
         ("ARRAY_OUT_OF_BOUNDS", f"{a}[{i}]", f"{a}[{i} + 1]", False),
         ("ARRAY_WRONG_TRAVERSAL", f"{a}[{i}]", f"{a}[0]", False),
         ("ARRAY_LENGTH_AS_INDEX", f"{a}[{i}]", f"{a}[{a}.length]", False)]
    return "Arrays", lines, [], m


def A_sum(r):
    u = set(); a = pick(r, ARR, u); s = pick(r, SUMV, u); i = pick(r, IV, u)
    lit, _ = arr_lit(r, lo=1, hi=50)
    lines = [("decl", f"int[] {a} = {lit};"), ("decl", f"int {s} = 0;"),
             ("core", f"for (int {i} = 0; {i} < {a}.length; {i}++) {{"),
             ("core", f"    {s} += {a}[{i}];"), ("core", "}"),
             ("out", f"System.out.println({s});")]
    m = [("ARRAY_WRONG_TRAVERSAL", f"{s} += {a}[{i}];", f"{s} += {i};", False),
         ("ARRAY_OUT_OF_BOUNDS", f"{i} < {a}.length", f"{i} <= {a}.length", False),
         ("ARRAY_SKIPPED_ELEMENT", f"int {i} = 0;", f"int {i} = 1;", False),
         ("VARIABLE_OVERWRITTEN_VALUE", f"{s} += {a}[{i}];", f"{s} = {a}[{i}];", False),
         ("VARIABLE_WRONG_INITIALIZATION", f"int {s} = 0;", f"int {s} = {a}[0];", False),
         ("ARRAY_LENGTH_AS_INDEX", f"{s} += {a}[{i}];", f"{s} += {a}[{a}.length];", False)]
    return "Arrays", lines, [], m


def A_last(r):
    u = set(); a = pick(r, ARR, u); lit, _ = arr_lit(r)
    v = r.choice(["last", "lastValue", "end", "lastItem"])
    lines = [("decl", f"int[] {a} = {lit};"),
             ("core", f"int {v} = {a}[{a}.length - 1];"),
             ("out", f"System.out.println({v});")]
    m = [("ARRAY_LENGTH_AS_INDEX", f"{a}[{a}.length - 1]", f"{a}[{a}.length]", False),
         ("ARRAY_WRONG_INDEX_VARIABLE", f"{a}[{a}.length - 1]", f"{a}[{a}.length - 2]", False),
         ("ARRAY_LENGTH_AS_INDEX", f"int {v} = {a}[{a}.length - 1];", f"int {v} = {a}.length;", False)]
    return "Arrays", lines, [], m


def A_first(r):
    u = set(); a = pick(r, ARR, u); lit, _ = arr_lit(r)
    v = r.choice(["first", "firstValue", "start", "head"])
    lines = [("decl", f"int[] {a} = {lit};"), ("core", f"int {v} = {a}[0];"),
             ("out", f"System.out.println({v});")]
    m = [("ARRAY_WRONG_INDEX_VARIABLE", f"{a}[0]", f"{a}[1]", False),
         ("ARRAY_OUT_OF_BOUNDS", f"{a}[0]", f"{a}[-1]", False)]
    return "Arrays", lines, [], m


def A_max(r):
    u = set(); a = pick(r, ARR, u); i = pick(r, IV, u)
    mx = r.choice(["max", "largest", "biggest", "maxVal"])
    lit, _ = arr_lit(r)
    lines = [("decl", f"int[] {a} = {lit};"), ("decl", f"int {mx} = {a}[0];"),
             ("core", f"for (int {i} = 1; {i} < {a}.length; {i}++) {{"),
             ("core", f"    if ({a}[{i}] > {mx}) {{"),
             ("core", f"        {mx} = {a}[{i}];"), ("core", "    }"), ("core", "}"),
             ("out", f"System.out.println({mx});")]
    m = [("ARRAY_OUT_OF_BOUNDS", f"{i} < {a}.length", f"{i} <= {a}.length", False),
         ("ARRAY_WRONG_TRAVERSAL", f"{a}[{i}] > {mx}", f"{a}[{i}] < {mx}", False),
         ("ARRAY_SKIPPED_ELEMENT", f"{i} < {a}.length;", f"{i} < {a}.length - 1;", False),
         ("ARRAY_WRONG_INDEX_VARIABLE", f"        {mx} = {a}[{i}];", f"        {mx} = {i};", False)]
    return "Arrays", lines, [], m


def A_reverse(r):
    u = set(); a = pick(r, ARR, u); i = pick(r, IV, u); lit, _ = arr_lit(r)
    lines = [("decl", f"int[] {a} = {lit};"),
             ("core", f"for (int {i} = {a}.length - 1; {i} >= 0; {i}--) {{"),
             ("core", f"    System.out.println({a}[{i}]);"), ("core", "}")]
    m = [("ARRAY_LENGTH_AS_INDEX", f"int {i} = {a}.length - 1;", f"int {i} = {a}.length;", False),
         ("ARRAY_SKIPPED_ELEMENT", f"{i} >= 0;", f"{i} > 0;", False),
         ("ARRAY_WRONG_TRAVERSAL", f"{i}--)", f"{i}++)", False)]
    return "Arrays", lines, [], m


def A_count_even(r):
    u = set(); a = pick(r, ARR, u); i = pick(r, IV, u)
    c = r.choice(["count", "evens", "evenCount", "c"])
    lit, _ = arr_lit(r, lo=1, hi=60)
    lines = [("decl", f"int[] {a} = {lit};"), ("decl", f"int {c} = 0;"),
             ("core", f"for (int {i} = 0; {i} < {a}.length; {i}++) {{"),
             ("core", f"    if ({a}[{i}] % 2 == 0) {{"), ("core", f"        {c}++;"),
             ("core", "    }"), ("core", "}"), ("out", f"System.out.println({c});")]
    m = [("ARRAY_WRONG_TRAVERSAL", f"({a}[{i}] % 2 == 0)", f"({i} % 2 == 0)", False),
         ("ARRAY_OUT_OF_BOUNDS", f"{i} < {a}.length", f"{i} <= {a}.length", False),
         ("ARRAY_SKIPPED_ELEMENT", f"int {i} = 0;", f"int {i} = 1;", False)]
    return "Arrays", lines, [], m


# ---------------------------------------------------------------- METHODS
FN_ADD = ["add", "sum", "addNumbers", "plus", "total"]


def M_add(r):
    f = r.choice(FN_ADD); p, q = r.choice([("a", "b"), ("x", "y"), ("num1", "num2"), ("first", "second")])
    X, Y, Z = r.randint(3, 20), r.randint(3, 20), r.randint(1, 9)
    meth = [f"static int {f}(int {p}, int {q}) {{", f"    return {p} + {q};", "}"]
    lines = [("core", f"System.out.println({f}({X}, {Y}));")]
    m = [("METHOD_WRONG_RETURN_OPERATION", f"return {p} + {q};", f"return {p} - {q};", False),
         ("METHOD_WRONG_RETURN_OPERATION", f"return {p} + {q};", f"return {p} * {q};", False),
         ("METHOD_IGNORED_PARAMETER", f"return {p} + {q};", f"return {p} + {p};", False),
         ("METHOD_IGNORED_PARAMETER", f"return {p} + {q};", f"return {p};", False),
         ("METHOD_ARGUMENT_MISMATCH", f"{f}({X}, {Y})", f"{f}({X})", True),
         ("METHOD_ARGUMENT_MISMATCH", f"{f}({X}, {Y})", f"{f}({X}, {Y}, {Z})", True),
         ("METHOD_WRONG_CALL", f"{f}({X}, {Y})", f'{f}("{X}", {Y})', True),
         ("METHOD_MISSING_RETURN", f"    return {p} + {q};", f"    int r = {p} + {q};", True)]
    return "Methods", lines, meth, m


def M_subtract(r):
    f = r.choice(["subtract", "difference", "minus", "diff"])
    p, q = r.choice([("a", "b"), ("x", "y"), ("big", "small"), ("num1", "num2")])
    X, Y = r.randint(20, 40), r.randint(2, 15)
    meth = [f"static int {f}(int {p}, int {q}) {{", f"    return {p} - {q};", "}"]
    lines = [("core", f"System.out.println({f}({X}, {Y}));")]
    m = [("METHOD_PARAMETER_ORDER_ERROR", f"{f}({X}, {Y})", f"{f}({Y}, {X})", False),
         ("METHOD_PARAMETER_ORDER_ERROR", f"return {p} - {q};", f"return {q} - {p};", False),
         ("METHOD_WRONG_RETURN_OPERATION", f"return {p} - {q};", f"return {p} + {q};", False),
         ("METHOD_ARGUMENT_MISMATCH", f"{f}({X}, {Y})", f"{f}({X})", True)]
    return "Methods", lines, meth, m


def M_square(r):
    f = r.choice(["square", "sq", "squareOf", "power2"]); p = r.choice(["n", "x", "num", "value"])
    X = r.randint(3, 12)
    meth = [f"static int {f}(int {p}) {{", f"    return {p} * {p};", "}"]
    lines = [("core", f"System.out.println({f}({X}));")]
    m = [("METHOD_WRONG_RETURN_OPERATION", f"return {p} * {p};", f"return {p} * 2;", False),
         ("METHOD_WRONG_RETURN_OPERATION", f"return {p} * {p};", f"return {p} + {p};", False),
         ("METHOD_IGNORED_PARAMETER", f"return {p} * {p};", f"return {X + 1} * {X + 1};", False),
         ("METHOD_ARGUMENT_MISMATCH", f"{f}({X})", f"{f}()", True),
         ("METHOD_ARGUMENT_MISMATCH", f"{f}({X})", f"{f}({X}, {X})", True),
         ("METHOD_WRONG_RETURN_TYPE", f"static int {f}", f"static void {f}", True)]
    return "Methods", lines, meth, m


def M_is_even(r):
    f = r.choice(["isEven", "checkEven", "even"]); p = r.choice(["n", "num", "x", "number"])
    X = r.randint(2, 30)
    meth = [f"static boolean {f}(int {p}) {{", f"    return {p} % 2 == 0;", "}"]
    lines = [("core", f"System.out.println({f}({X}));")]
    m = [("METHOD_MISSING_RETURN", f"    return {p} % 2 == 0;", f"    if ({p} % 2 == 0) return true;", True),
         ("METHOD_WRONG_RETURN_OPERATION", f"{p} % 2 == 0;", f"{p} % 2 == 1;", False),
         ("METHOD_WRONG_RETURN_TYPE", f"static boolean {f}", f"static int {f}", True),
         ("METHOD_WRONG_CALL", f"{f}({X})", f'{f}("{X}")', True)]
    return "Methods", lines, meth, m


def M_greet(r):
    f = r.choice(["greet", "sayHello", "welcome", "printGreeting"]); p = r.choice(["name", "user", "person"])
    N1, N2 = r.sample(NAMES, 2)
    meth = [f"static void {f}(String {p}) {{", f'    System.out.println("Hello, " + {p});', "}"]
    lines = [("core", f'{f}("{N1}");')]
    m = [("METHOD_IGNORED_PARAMETER", f'"Hello, " + {p}', f'"Hello, {p}"', False),
         ("METHOD_IGNORED_PARAMETER", f'"Hello, " + {p}', f'"Hello, " + "{N2}"', False),
         ("METHOD_ARGUMENT_MISMATCH", f'{f}("{N1}");', f"{f}();", True),
         ("METHOD_ARGUMENT_MISMATCH", f'{f}("{N1}");', f'{f}("{N1}", "{N2}");', True),
         ("METHOD_VOID_RETURNS_VALUE", f'    System.out.println("Hello, " + {p});',
          f'    System.out.println("Hello, " + {p});\n    return {p};', True)]
    return "Methods", lines, meth, m


def M_max2(r):
    f = r.choice(["max", "maxOf", "larger", "bigger"]); p, q = r.choice([("a", "b"), ("x", "y"), ("n1", "n2")])
    X, Y = r.sample(range(1, 50), 2)
    meth = [f"static int {f}(int {p}, int {q}) {{", f"    if ({p} > {q}) {{", f"        return {p};",
            "    }", f"    return {q};", "}"]
    lines = [("core", f"System.out.println({f}({X}, {Y}));")]
    m = [("METHOD_MISSING_RETURN", f"    return {q};\n", "", True),
         ("METHOD_WRONG_RETURN_OPERATION", f"({p} > {q})", f"({p} < {q})", False),
         ("METHOD_IGNORED_PARAMETER", f"    return {q};", f"    return {p};", False)]
    return "Methods", lines, meth, m


# ---------------------------------------------------------------- VARIABLES
def V_area(r):
    w, h, ar = r.choice([("width", "height", "area"), ("w", "h", "area"), ("length", "breadth", "area"), ("l", "b", "rectArea")])
    W, H = r.randint(3, 15), r.randint(3, 15)
    lines = [("decl", f"int {w} = {W};"), ("decl", f"int {h} = {H};"),
             ("core", f"int {ar} = {w} * {h};"), ("out", f"System.out.println({ar});")]
    m = [("VARIABLE_WRONG_CALCULATION", f"{w} * {h};", f"{w} + {h};", False),
         ("VARIABLE_WRONG_CALCULATION", f"{w} * {h};", f"2 * ({w} + {h});", False),
         ("VARIABLE_WRONG_ASSIGNMENT", f"int {ar} = {w} * {h};", f"int {ar} = {w};", False)]
    return "Variables", lines, [], m


def V_average(r):
    a, b, avg = r.choice([("a", "b", "avg"), ("x", "y", "average"), ("mark1", "mark2", "avg"), ("num1", "num2", "mean")])
    A = r.randint(10, 90); B = A + 2 * r.randint(1, 5) + 1
    lines = [("decl", f"int {a} = {A};"), ("decl", f"int {b} = {B};"),
             ("core", f"double {avg} = ({a} + {b}) / 2.0;"), ("out", f"System.out.println({avg});")]
    m = [("VARIABLE_INTEGER_DIVISION", f"({a} + {b}) / 2.0;", f"({a} + {b}) / 2;", False),
         ("VARIABLE_WRONG_CALCULATION", f"({a} + {b}) / 2.0;", f"{a} + {b} / 2.0;", False),
         ("VARIABLE_WRONG_CALCULATION", f"({a} + {b}) / 2.0;", f"({a} + {b}) * 2.0;", False)]
    return "Variables", lines, [], m


def V_swap(r):
    a, b = r.choice([("a", "b"), ("x", "y"), ("first", "second"), ("p", "q")])
    t = r.choice(["temp", "tmp", "t"])
    A, B = r.sample(range(1, 50), 2)
    lines = [("decl", f"int {a} = {A};"), ("decl", f"int {b} = {B};"),
             ("core", f"int {t} = {a};"), ("core", f"{a} = {b};"), ("core", f"{b} = {t};"),
             ("out", f'System.out.println({a} + " " + {b});')]
    m = [("VARIABLE_OVERWRITTEN_VALUE", f"int {t} = {a};\n{a} = {b};\n{b} = {t};", f"{a} = {b};\n{b} = {a};", False),
         ("VARIABLE_WRONG_ASSIGNMENT", f"{b} = {t};", f"{b} = {a};", False),
         ("VARIABLE_WRONG_ASSIGNMENT", f"int {t} = {a};", f"int {t} = {b};", False)]
    return "Variables", lines, [], m


def V_counter(r):
    c = r.choice(["count", "counter", "score", "points", "lives"]); C = r.randint(2, 20)
    lines = [("decl", f"int {c} = {C};"), ("core", f"{c} = {c} + 1;"), ("out", f"System.out.println({c});")]
    m = [("VARIABLE_WRONG_ASSIGNMENT", f"{c} = {c} + 1;", f"{c} = 1;", False),
         ("VARIABLE_WRONG_ASSIGNMENT", f"{c} = {c} + 1;", f"{c} + 1;", True),
         ("VARIABLE_SELF_ASSIGNMENT", f"{c} = {c} + 1;", f"{c} = {c};", False),
         ("VARIABLE_WRONG_CALCULATION", f"{c} = {c} + 1;", f"{c} = {c} - 1;", False)]
    return "Variables", lines, [], m


def V_declare(r):
    v, typ, val = r.choice([("age", "int", str(r.randint(10, 60))), ("marks", "int", str(r.randint(10, 99))),
                            ("price", "double", f"{r.randint(10, 999)}.{r.randint(1, 9)}"),
                            ("year", "int", str(r.randint(2000, 2026))), ("total", "int", str(r.randint(10, 500))),
                            ("grade", "char", f"'{r.choice('ABCDS')}'"), ("isPassed", "boolean", r.choice(["true", "false"])),
                            ("name", "String", f'"{r.choice(NAMES)}"'), ("num", "int", str(r.randint(1, 100))),
                            ("x", "int", str(r.randint(1, 100)))])
    lines = [("core", f"{typ} {v} = {val};"), ("out", f"System.out.println({v});")]
    decl = f"{typ} {v} = {val};"
    m = [("VARIABLE_UNINITIALIZED", decl, f"{typ} {v};", True),
         ("VARIABLE_INVALID_NAME", decl, f"{typ} 1{v} = {val};", True)]
    if typ == "int":
        m += [("VARIABLE_TYPE_MISMATCH", decl, f"int {v} = {val}.5;", True),
              ("VARIABLE_TYPE_MISMATCH", decl, f'int {v} = "{val}";', True),
              ("VARIABLE_TYPE_MISMATCH", decl, f"String {v} = {val};", True)]
    elif typ == "double":
        m += [("VARIABLE_TYPE_MISMATCH", decl, f"int {v} = {val};", True)]
    elif typ == "String":
        m += [("VARIABLE_TYPE_MISMATCH", decl, f"String {v} = {val[1:-1]};", True),
              ("VARIABLE_TYPE_MISMATCH", decl, f"string {v} = {val};", True)]
    elif typ == "char":
        m += [("VARIABLE_TYPE_MISMATCH", decl, f'char {v} = "{val[1:-1]}";', True)]
    elif typ == "boolean":
        m += [("VARIABLE_TYPE_MISMATCH", decl, f'boolean {v} = "{val}";', True)]
    return "Variables", lines, [], m


def V_percent(r):
    mk, tot, pct = r.choice([("marks", "total", "percentage"), ("score", "maxScore", "pct"), ("got", "full", "percent")])
    T = r.choice([50, 80, 120, 200]); M = r.randint(T // 3, T - 1)
    lines = [("decl", f"int {mk} = {M};"), ("decl", f"int {tot} = {T};"),
             ("core", f"double {pct} = {mk} * 100.0 / {tot};"), ("out", f"System.out.println({pct});")]
    m = [("VARIABLE_INTEGER_DIVISION", f"{mk} * 100.0 / {tot};", f"{mk} / {tot} * 100;", False),
         ("VARIABLE_WRONG_CALCULATION", f"{mk} * 100.0 / {tot};", f"{mk} * {tot} / 100.0;", False),
         ("VARIABLE_WRONG_CALCULATION", f"{mk} * 100.0 / {tot};", f"{tot} * 100.0 / {mk};", False)]
    return "Variables", lines, [], m


def V_discount(r):
    p, d, f = r.choice([("price", "discount", "finalPrice"), ("cost", "off", "toPay"), ("amount", "discount", "total")])
    P = r.randint(500, 5000); D = r.randint(50, 400)
    lines = [("decl", f"double {p} = {P};"), ("decl", f"double {d} = {D};"),
             ("core", f"double {f} = {p} - {d};"), ("out", f"System.out.println({f});")]
    m = [("VARIABLE_WRONG_CALCULATION", f"{p} - {d};", f"{p} + {d};", False),
         ("VARIABLE_WRONG_CALCULATION", f"{p} - {d};", f"{d} - {p};", False),
         ("VARIABLE_WRONG_INITIALIZATION", f"double {d} = {D};", f"double {d} = 0;", False),
         ("VARIABLE_WRONG_ASSIGNMENT", f"double {f} = {p} - {d};", f"double {f} = {p};", False)]
    return "Variables", lines, [], m


def V_overwrite(r):
    x, y, s = r.choice([("a", "b", "sum"), ("x", "y", "total"), ("n1", "n2", "result")])
    A, B = r.randint(1, 40), r.randint(1, 40)
    lines = [("decl", f"int {x} = {A};"), ("decl", f"int {y} = {B};"),
             ("core", f"int {s} = {x} + {y};"), ("out", f"System.out.println({s});")]
    m = [("VARIABLE_OVERWRITTEN_VALUE", f"int {s} = {x} + {y};", f"int {s} = {x} + {y};\n{s} = 0;", False),
         ("VARIABLE_OVERWRITTEN_VALUE", f"int {y} = {B};", f"int {y} = {B};\n{y} = {x};", False),
         ("VARIABLE_WRONG_CALCULATION", f"{x} + {y};", f"{x} - {y};", False)]
    return "Variables", lines, [], m


def V_celsius(r):
    c, fv = r.choice([("c", "f"), ("celsius", "fahrenheit"), ("tempC", "tempF")])
    C = r.randint(1, 45)
    lines = [("decl", f"double {c} = {C};"), ("core", f"double {fv} = {c} * 9 / 5 + 32;"),
             ("out", f"System.out.println({fv});")]
    m = [("VARIABLE_INTEGER_DIVISION", f"{c} * 9 / 5 + 32;", f"{c} * (9 / 5) + 32;", False),
         ("VARIABLE_WRONG_CALCULATION", f"{c} * 9 / 5 + 32;", f"{c} * 9 / 5 - 32;", False),
         ("VARIABLE_WRONG_CALCULATION", f"{c} * 9 / 5 + 32;", f"({c} - 32) * 5 / 9;", False)]
    return "Variables", lines, [], m


FAMILIES = {f.__name__: f for f in [
    L_print_up, L_while_sum, L_countdown, L_even_step, L_first_multiple,
    A_print_all, A_sum, A_last, A_first, A_max, A_reverse, A_count_even,
    M_add, M_subtract, M_square, M_is_even, M_greet, M_max2,
    V_area, V_average, V_swap, V_counter, V_declare, V_percent, V_discount, V_overwrite, V_celsius]}

# fine reason -> production reason group (matches the 12 classes in best_reason_detection_model.pkl)
REASON_GROUP = {
    "LOOP_OFF_BY_ONE": "LOOP_BOUNDARY_ISSUE",
    "LOOP_WRONG_CONDITION": "LOOP_CONDITION_ISSUE",
    "LOOP_MISSING_UPDATE": "LOOP_UPDATE_ISSUE",
    "LOOP_WRONG_COUNTER_DIRECTION": "LOOP_UPDATE_ISSUE",
    "LOOP_CONTINUE_SKIP_UPDATE": "LOOP_CONTROL_FLOW_ISSUE",
    "LOOP_EARLY_BREAK": "LOOP_CONTROL_FLOW_ISSUE",
    "LOOP_EARLY_BREAK_MISSING": "LOOP_CONTROL_FLOW_ISSUE",
    "VARIABLE_WRONG_CALCULATION": "VARIABLE_CALCULATION_ISSUE",
    "VARIABLE_INTEGER_DIVISION": "VARIABLE_CALCULATION_ISSUE",
    "VARIABLE_WRONG_INITIALIZATION": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_OVERWRITTEN_VALUE": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_WRONG_ASSIGNMENT": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_SELF_ASSIGNMENT": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_UNINITIALIZED": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_INVALID_NAME": "VARIABLE_ASSIGNMENT_ISSUE",
    "VARIABLE_TYPE_MISMATCH": "VARIABLE_ASSIGNMENT_ISSUE",
    "ARRAY_OUT_OF_BOUNDS": "ARRAY_BOUNDARY_INDEX_ISSUE",
    "ARRAY_LENGTH_AS_INDEX": "ARRAY_BOUNDARY_INDEX_ISSUE",
    "ARRAY_WRONG_INDEX_VARIABLE": "ARRAY_BOUNDARY_INDEX_ISSUE",
    "ARRAY_WRONG_TRAVERSAL": "ARRAY_TRAVERSAL_ISSUE",
    "ARRAY_SKIPPED_ELEMENT": "ARRAY_TRAVERSAL_ISSUE",
    "METHOD_ARGUMENT_MISMATCH": "METHOD_SIGNATURE_ISSUE",
    "METHOD_PARAMETER_ORDER_ERROR": "METHOD_SIGNATURE_ISSUE",
    "METHOD_WRONG_CALL": "METHOD_SIGNATURE_ISSUE",
    "METHOD_MISSING_RETURN": "METHOD_RETURN_ISSUE",
    "METHOD_WRONG_RETURN_OPERATION": "METHOD_RETURN_ISSUE",
    "METHOD_WRONG_RETURN_TYPE": "METHOD_RETURN_ISSUE",
    "METHOD_VOID_RETURNS_VALUE": "METHOD_RETURN_ISSUE",
    "METHOD_IGNORED_PARAMETER": "METHOD_PARAMETER_USAGE_ISSUE",
    "CORRECT_NO_ERROR": "CORRECT_NO_ERROR",
}

BROAD = {"LOOP": "LOOP_ERROR", "VARIABLE": "VARIABLE_ERROR", "ARRAY": "ARRAY_ERROR",
         "METHOD": "METHOD_ERROR", "CORRECT": "CORRECT"}


def broad_of(group):
    return BROAD[group.split("_")[0]]


# ---------------------------------------------------------------- v2: pre-test-style blanks
from families_blank import BLANK_FAMILIES, BLANK_REASON_GROUP  # noqa: E402
FAMILIES.update(BLANK_FAMILIES)
REASON_GROUP.update(BLANK_REASON_GROUP)
