"""Approximate reconstruction of the 20 pre-test fill-in-blank questions (from the Claude Code report table).
Only for a quick sanity check; the real evaluation is eval_pretest.py on the real data.js."""
import csv, sys

VA, VC = "VARIABLE_ASSIGNMENT_ISSUE", "VARIABLE_CALCULATION_ISSUE"
LC, LU, LF = "LOOP_CONDITION_ISSUE", "LOOP_UPDATE_ISSUE", "LOOP_CONTROL_FLOW_ISSUE"
AB, AT = "ARRAY_BOUNDARY_INDEX_ISSUE", "ARRAY_TRAVERSAL_ISSUE"
MR, MS, MP = "METHOD_RETURN_ISSUE", "METHOD_SIGNATURE_ISSUE", "METHOD_PARAMETER_USAGE_ISSUE"
C = "CORRECT_NO_ERROR"

Q = [
    ("{_} age = 25;", "int", [("Int", VA), ("integer", VA), ("void", VA)]),
    ("int {_} = 10;", "_count", [("2count", VA), ("my-var", VA), ("class", VA)]),
    ("{_} isActive = true;", "boolean", [("bool", VA), ("bit", VA), ("Boolean", C)]),
    ("if (score {_} 10) {\n    System.out.println(\"Ten\");\n}", "==", [("=", VA), ("===", VA), ("equals", VA)]),
    ("int a = 5;\nint b = {_};", "a++", [("++a", VA), ("a", VA), ("a + 1", VC)]),
    ("for (int i = 0; {_} < 10; i++) {\n    System.out.println(i);\n}", "i", [("j", LC), ("10", LC), ("n", LC)]),
    ("{_} {\n    System.out.println(i);\n    i++;\n} while (i < 0);", "do", [("while", LF), ("for", LF), ("if", LF)]),
    ("while (i < 3) {\n    System.out.println(i);\n    {_};\n}", "i++", [("i--", LU), ("i", LU), ("continue", LF)]),
    ("if (i == 3) {\n    {_};\n}", "break", [("sleep", LF), ("wait", LF), ("pause", LF)]),
    ("if (i == 1) {\n    {_};\n}", "continue", [("break", LF), ("return", LF), ("exit", LF)]),
    ("int{_} arr = new int[5];", "[]", [("()", AB), ("{}", AB), ("<>", AB)]),
    ("int first = arr[{_}];", "0", [("1", AB), ("-1", AB), ("arr.length", AB)]),
    ("for (int i = 0; i {_} arr.length; i++) {\n    System.out.println(arr[i]);\n}", "<", [("<=", AB), (">", AT), ("==", AT)]),
    ("int size = arr.{_};", "length", [("length()", AB), ("size", AB), ("count", AB)]),
    ("for (int n : nums) {\n    sum {_} n;\n}", "+=", [("=", VA), ("*=", VC), ("-=", VC)]),
    ("static int getFive() {\n    {_} 5;\n}", "return", [("print", MR), ("output", MR), ("give", MR)]),
    ("static {_} printHello() {\n    System.out.println(\"Hello\");\n}", "void", [("int", MR), ("return", MR), ("null", MR)]),
    ("static int add(int a, int b) {\n    return a + b;\n}\nSystem.out.println(add(3, {_}));", "4", [("four", MS), ("\"4\"", MS), ("IV", MS)]),
    ("static int mystery(int n) {\n    if (n == 1) {\n        return {_};\n    }\n    return n * mystery(n - 1);\n}", "1", [("0", MR), ("mystery(n)", MR), ("n", C)]),
    ("static int mystery(int n) {\n    if (n == 1) {\n        return 1;\n    }\n    return n * mystery({_});\n}", "n - 1", [("n", MP), ("n + 1", MP), ("1", MP)]),
]

rows = []
for qi, (t, correct, wrongs) in enumerate(Q, 1):
    rows.append(dict(qid=qi, option=correct, code=t.replace("{_}", correct), reason_group=C))
    for w, g in wrongs:
        rows.append(dict(qid=qi, option=w, code=t.replace("{_}", w), reason_group=g))
w = csv.DictWriter(open(sys.argv[1], "w", newline=""), fieldnames=list(rows[0]))
w.writeheader(); w.writerows(rows)
print(len(rows), "rows")
