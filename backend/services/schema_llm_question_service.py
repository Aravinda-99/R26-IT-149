"""
Component 4: LLM-Assisted Question Generator Service
====================================================
Generates concept-specific draft post-test questions with option quality labels:
  - Correct (1.0)
  - Nearly Correct (0.5 - misconception/partial understanding)
  - Wrong (0.0 - weak understanding)
  - Clearly Wrong (0.0 - serious confusion)

Supports 3 Generation Modes:
  1. Manual Draft Batch (single concept, type, difficulty, error misconception)
  2. Auto Balanced Pack (full-pack multi-concept generation following 4-tier pedagogical blueprints)
  3. Fill Missing Gaps (targeted generation for deficit areas identified by Question Bank Coverage analysis)

Saves all drafts to `generated_questions` with status PENDING for teacher review.
Guarantees balanced correct answer option distribution across A, B, C, and D.
"""

import os
import uuid
import random
from datetime import datetime
from services.schema_question_bank_service import SchemaQuestionBankService

VALID_CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"]
VALID_TYPES = ["Basic Understanding", "Code Output Prediction", "Error Recognition", "Application", "Transfer"]
VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"]

# Concept-Specific Target Error Types Mapping
CONCEPT_ERROR_MAP = {
    "Variables": [
        "VARIABLE_SCOPE_ERROR",
        "TYPE_MISMATCH",
        "UNINITIALIZED_VARIABLE",
        "SYNTAX_ERROR",
        "LOGIC_ERROR",
    ],
    "Operators": [
        "TYPE_MISMATCH",
        "OPERATOR_PRECEDENCE_ERROR",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
    "Loops": [
        "LOOP_CONDITION_ERROR",
        "OFF_BY_ONE",
        "INFINITE_LOOP",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
    "Arrays": [
        "INDEX_ERROR",
        "OFF_BY_ONE",
        "ARRAY_BOUNDS_ERROR",
        "TYPE_MISMATCH",
        "LOGIC_ERROR",
    ],
    "Methods": [
        "METHOD_SIGNATURE_ERROR",
        "PARAMETER_MISMATCH",
        "RETURN_TYPE_ERROR",
        "VARIABLE_SCOPE_ERROR",
        "RECURSION_ERROR",
        "LOGIC_ERROR",
        "SYNTAX_ERROR",
    ],
}

# Template library covering all concepts, cognitive levels, and concept-specific error types
QUESTION_TEMPLATES = {
    "Variables": [
        {
            "type": "Basic Understanding",
            "difficulty": "Easy",
            "text": "What is the default value of an uninitialized instance variable of type boolean in Java?",
            "code": "public class Demo {\n    boolean flag;\n}",
            "opt_a": "false", "q_a": "Correct",
            "opt_b": "true", "q_b": "Nearly Correct",
            "opt_c": "0", "q_c": "Wrong",
            "opt_d": "null", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Instance boolean variables in Java default to 'false'. Primitive booleans cannot be null.",
            "group": "GRP_VAR_BOOL_DEF",
            "outcome": "Recognize default primitive initialization values in Java",
            "error_type": "UNINITIALIZED_VARIABLE",
        },
        {
            "type": "Code Output Prediction",
            "difficulty": "Medium",
            "text": "What is the output of the following integer division and type conversion?",
            "code": "int a = 7;\nint b = 2;\ndouble result = a / b;\nSystem.out.println(result);",
            "opt_a": "3.5", "q_a": "Nearly Correct",
            "opt_b": "3.0", "q_b": "Correct",
            "opt_c": "3", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "a / b performs integer division (7 / 2 = 3). The integer 3 is then widened to double 3.0.",
            "group": "GRP_VAR_DIV_TRUNC",
            "outcome": "Trace integer division truncation before double assignment",
            "error_type": "TYPE_MISMATCH",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "Which error will be reported by the Java compiler for the following local variable usage?",
            "code": "int total;\nif (args.length > 0) {\n    total = 100;\n}\nSystem.out.println(total);",
            "opt_a": "Variable total might not have been initialized", "q_a": "Correct",
            "opt_b": "Cannot assign integer to total", "q_b": "Nearly Correct",
            "opt_c": "NullPointerException at runtime", "q_c": "Wrong",
            "opt_d": "args is out of scope", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Local variables in Java are not given default values and must be definitively initialized before use.",
            "group": "GRP_VAR_UNINIT_LOCAL",
            "outcome": "Identify uninitialized local variable compiler errors",
            "error_type": "UNINITIALIZED_VARIABLE",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What error occurs when accessing variable 'count' outside the inner block?",
            "code": "public void process() {\n    if (true) {\n        int count = 5;\n    }\n    System.out.println(count);\n}",
            "opt_a": "count is out of scope and cannot be resolved as a variable", "q_a": "Correct",
            "opt_b": "count is initialized to null", "q_b": "Nearly Correct",
            "opt_c": "count overflows heap memory", "q_c": "Wrong",
            "opt_d": "if statement cannot contain variable declarations", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "The variable 'count' has block scope limited to the if-statement body.",
            "group": "GRP_VAR_BLOCK_SCOPE",
            "outcome": "Recognize block scoping boundaries in Java",
            "error_type": "VARIABLE_SCOPE_ERROR",
        },
        {
            "type": "Application",
            "difficulty": "Medium",
            "text": "Which statement correctly converts a String '125' into a primitive int in Java?",
            "code": "String s = \"125\";",
            "opt_a": "int num = (int) s;", "q_a": "Nearly Correct",
            "opt_b": "int num = s.toInt();", "q_b": "Wrong",
            "opt_c": "int num = new Integer(s);", "q_c": "Clearly Wrong",
            "opt_d": "int num = Integer.parseInt(s);", "q_d": "Correct",
            "correct": "D",
            "explanation": "Integer.parseInt() parses the string argument as a signed decimal integer.",
            "group": "GRP_VAR_PARSE_INT",
            "outcome": "Apply wrapper parsing methods for string-to-numeric conversions",
            "error_type": "TYPE_MISMATCH",
        },
        {
            "type": "Transfer",
            "difficulty": "Hard",
            "text": "How does Java manage memory for a primitive 'int' compared to an object reference variable on the JVM stack?",
            "code": "",
            "opt_a": "Primitives are stored on the garbage collected heap while references live on the CPU cache", "q_a": "Nearly Correct",
            "opt_b": "The primitive stores its raw binary value directly on the stack frame, while an object variable stores a heap address", "q_b": "Correct",
            "opt_c": "Both primitives and objects are stored in the metaspace", "q_c": "Wrong",
            "opt_d": "Primitives have methods and fields just like objects", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Primitive local variables hold their actual values directly on the thread stack frame.",
            "group": "GRP_VAR_JVM_MEM",
            "outcome": "Transfer memory layout principles between stack primitives and heap references",
            "error_type": "TYPE_MISMATCH",
        },
    ],
    "Operators": [
        {
            "type": "Basic Understanding",
            "difficulty": "Easy",
            "text": "What is the result of applying the modulus operator '17 % 5' in Java?",
            "code": "int r = 17 % 5;",
            "opt_a": "3 (quotient)", "q_a": "Nearly Correct",
            "opt_b": "2 (remainder)", "q_b": "Correct",
            "opt_c": "3.4", "q_c": "Wrong",
            "opt_d": "0", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "The modulus operator (%) returns the remainder of integer division: 17 = 5 * 3 + 2.",
            "group": "GRP_OP_MOD",
            "outcome": "Understand modulus arithmetic operator rules",
            "error_type": "LOGIC_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "difficulty": "Medium",
            "text": "What is the printed value of x after this compound assignment executes?",
            "code": "int x = 10;\nx += 5 * 2;\nSystem.out.println(x);",
            "opt_a": "30", "q_a": "Nearly Correct",
            "opt_b": "25", "q_b": "Wrong",
            "opt_c": "15", "q_c": "Clearly Wrong",
            "opt_d": "20", "q_d": "Correct",
            "correct": "D",
            "explanation": "Multiplication has higher precedence than compound addition: 5 * 2 = 10, then x = 10 + 10 = 20.",
            "group": "GRP_OP_PREC_COMPOUND",
            "outcome": "Trace operator precedence with compound assignment operators",
            "error_type": "OPERATOR_PRECEDENCE_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "Why does the expression '1 + 2 + \"3\" + 4 + 5' output '3345' instead of '15'?",
            "code": "System.out.println(1 + 2 + \"3\" + 4 + 5);",
            "opt_a": "1 + 2 evaluates to 3, then encountering String '3' converts all subsequent + operations to String concatenation", "q_a": "Correct",
            "opt_b": "The compiler adds brackets around the String literal", "q_b": "Nearly Correct",
            "opt_c": "Integer values cannot be combined with string literals", "q_c": "Wrong",
            "opt_d": "Java evaluates addition from right to left", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "+ is left-associative: 1 + 2 = 3. 3 + '3' = '33'. '33' + 4 = '334'. '334' + 5 = '3345'.",
            "group": "GRP_OP_STR_CONCAT_PREC",
            "outcome": "Recognize string concatenation precedence behavior",
            "error_type": "OPERATOR_PRECEDENCE_ERROR",
        },
        {
            "type": "Application",
            "difficulty": "Medium",
            "text": "Which expression checks if an integer 'val' is strictly between 10 and 50 (exclusive)?",
            "code": "int val = 25;",
            "opt_a": "10 < val < 50", "q_a": "Nearly Correct",
            "opt_b": "(val > 10) && (val < 50)", "q_b": "Correct",
            "opt_c": "(val >= 10) || (val <= 50)", "q_c": "Wrong",
            "opt_d": "(val == 10) && (val == 50)", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Java requires explicit compound conditions joined by logical AND (&&). '10 < val < 50' is invalid Java syntax.",
            "group": "GRP_OP_RANGE_CHECK",
            "outcome": "Apply compound logical conditions for range verification",
            "error_type": "SYNTAX_ERROR",
        },
        {
            "type": "Transfer",
            "difficulty": "Hard",
            "text": "What is the result of the short-circuit evaluation in this expression?",
            "code": "int a = 5;\nboolean res = (a > 10) && (++a > 5);\nSystem.out.println(a);",
            "opt_a": "6 (both sides always execute)", "q_a": "Nearly Correct",
            "opt_b": "5 (the right operand is skipped because the left operand is false)", "q_b": "Correct",
            "opt_c": "0", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "The logical AND (&&) short-circuits: since 'a > 10' is false, '++a > 5' is never evaluated, leaving 'a' at 5.",
            "group": "GRP_OP_SHORT_CIRCUIT",
            "outcome": "Transfer short-circuit evaluation to side-effect analysis",
            "error_type": "LOGIC_ERROR",
        },
    ],
    "Loops": [
        {
            "type": "Basic Understanding",
            "difficulty": "Easy",
            "text": "What is the key structural difference between a 'while' loop and a 'do-while' loop?",
            "code": "",
            "opt_a": "A while loop can only iterate over arrays", "q_a": "Nearly Correct",
            "opt_b": "A do-while loop does not support the break statement", "q_b": "Wrong",
            "opt_c": "A while loop always executes an infinite number of times", "q_c": "Clearly Wrong",
            "opt_d": "A do-while loop evaluates its condition after the body, guaranteeing at least one execution", "q_d": "Correct",
            "correct": "D",
            "explanation": "'do-while' is a post-test loop: the condition is checked after executing the loop body.",
            "group": "GRP_LOOP_DOWHILE",
            "outcome": "Distinguish pre-test and post-test loop execution mechanics",
            "error_type": "LOOP_CONDITION_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "difficulty": "Medium",
            "text": "What will be printed to the screen when this loop runs?",
            "code": "for (int i = 0; i < 6; i += 2) {\n    if (i == 2) continue;\n    System.out.print(i + \" \");\n}",
            "opt_a": "0 4 ", "q_a": "Correct",
            "opt_b": "0 2 4 ", "q_b": "Nearly Correct",
            "opt_c": "0 2 4 6 ", "q_c": "Wrong",
            "opt_d": "2 4 ", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "i starts at 0 (printed). Next i=2 hits 'continue' (skipped). Next i=4 (printed). At i=6 loop ends.",
            "group": "GRP_LOOP_CONT_STEP",
            "outcome": "Trace continue statements and step increments in for-loops",
            "error_type": "LOOP_CONDITION_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What causes this while loop to never terminate (infinite loop)?",
            "code": "int i = 1;\nwhile (i != 10) {\n    System.out.println(i);\n    i += 2;\n}",
            "opt_a": "i is not initialized properly", "q_a": "Nearly Correct",
            "opt_b": "i steps over 10 (1, 3, 5, 7, 9, 11...), so i != 10 is never false", "q_b": "Correct",
            "opt_c": "System.out.println freezes the CPU", "q_c": "Wrong",
            "opt_d": "while loops cannot use '!=' as a condition", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Incrementing by 2 produces odd numbers. i jumps from 9 to 11, missing 10 and looping indefinitely.",
            "group": "GRP_LOOP_OFF_BY_TWO",
            "outcome": "Recognize parity mismatch causing infinite loop condition failures",
            "error_type": "INFINITE_LOOP",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "How many times does this loop execute, and what error occurs?",
            "code": "int count = 0;\nfor (int i = 0; i <= 5; i++) {\n    count++;\n}",
            "opt_a": "Executes 5 times with no error", "q_a": "Nearly Correct",
            "opt_b": "Executes 6 times due to '<=' causing an off-by-one iteration", "q_b": "Correct",
            "opt_c": "Executes 4 times", "q_c": "Wrong",
            "opt_d": "Causes an infinite loop", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Indices 0, 1, 2, 3, 4, 5 total 6 iterations. For 5 iterations, 'i < 5' should be used.",
            "group": "GRP_LOOP_OFF_BY_ONE",
            "outcome": "Identify off-by-one loop condition boundaries",
            "error_type": "OFF_BY_ONE",
        },
        {
            "type": "Application",
            "difficulty": "Medium",
            "text": "Which loop correctly computes the factorial of an integer N (e.g. 5! = 120)?",
            "code": "int N = 5;\nlong fact = 1;",
            "opt_a": "for (int i = 0; i < N; i++) { fact *= i; }", "q_a": "Nearly Correct",
            "opt_b": "for (int i = 1; i < N; i++) { fact += i; }", "q_b": "Wrong",
            "opt_c": "for (int i = 1; i <= N; i++) { fact *= i; }", "q_c": "Correct",
            "opt_d": "while (N > 0) { fact += N; N--; }", "q_d": "Clearly Wrong",
            "correct": "C",
            "explanation": "Starting at 1 up to N with multiplication (fact *= i) computes N! correctly. Starting at 0 makes fact 0.",
            "group": "GRP_LOOP_FACTORIAL",
            "outcome": "Apply accumulator loops for mathematical series calculations",
            "error_type": "OFF_BY_ONE",
        },
        {
            "type": "Transfer",
            "difficulty": "Hard",
            "text": "When rewriting a traditional index-based for loop into an enhanced for-each loop in Java, what capability is lost?",
            "code": "// Traditional\nfor (int i = 0; i < arr.length; i++) { ... }\n// Enhanced\nfor (int x : arr) { ... }",
            "opt_a": "The ability to read array element values", "q_a": "Nearly Correct",
            "opt_b": "Type safety during iteration", "q_b": "Wrong",
            "opt_c": "Enhanced for loops cannot run on primitive arrays", "q_c": "Clearly Wrong",
            "opt_d": "Direct access to the current index position and the ability to modify array elements in-place", "q_d": "Correct",
            "correct": "D",
            "explanation": "Enhanced for-each loops do not provide an explicit index variable, making in-place assignment to array slots impossible.",
            "group": "GRP_LOOP_FOREACH_LIMIT",
            "outcome": "Transfer iteration paradigms between indexed and iterator-based loops",
            "error_type": "LOGIC_ERROR",
        },
    ],
    "Arrays": [
        {
            "type": "Basic Understanding",
            "difficulty": "Easy",
            "text": "What are all elements of a newly created 'int[] data = new int[4];' initialized to by default in Java?",
            "code": "int[] data = new int[4];",
            "opt_a": "0", "q_a": "Correct",
            "opt_b": "null", "q_b": "Nearly Correct",
            "opt_c": "-1", "q_c": "Wrong",
            "opt_d": "Undefined random memory garbage", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Numeric primitive arrays in Java are automatically zero-filled upon heap allocation.",
            "group": "GRP_ARR_DEFAULT",
            "outcome": "Understand array element default initialization in Java",
            "error_type": "INDEX_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "difficulty": "Medium",
            "text": "What is the output of the following array reference assignment?",
            "code": "int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);",
            "opt_a": "1 (b is an independent deep copy of a)", "q_a": "Nearly Correct",
            "opt_b": "99 (Both a and b reference the exact same array in heap memory)", "q_b": "Correct",
            "opt_c": "0", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "'b = a' copies the object reference, meaning modifications via 'b' affect the array pointed to by 'a'.",
            "group": "GRP_ARR_ALIASING",
            "outcome": "Predict array aliasing and reference sharing side effects",
            "error_type": "LOGIC_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What exception is thrown when executing 'arr[arr.length]' on an array of length 3?",
            "code": "int[] arr = {10, 20, 30};\nSystem.out.println(arr[arr.length]);",
            "opt_a": "NullPointerException", "q_a": "Nearly Correct",
            "opt_b": "Prints 0", "q_b": "Wrong",
            "opt_c": "ArrayIndexOutOfBoundsException because valid indices end at arr.length - 1", "q_c": "Correct",
            "opt_d": "Compilation error because .length is a method", "q_d": "Clearly Wrong",
            "correct": "C",
            "explanation": "An array with length 3 has valid indices 0, 1, and 2. Index 3 is out of bounds.",
            "group": "GRP_ARR_LEN_BOUND",
            "outcome": "Recognize classic length boundary off-by-one errors",
            "error_type": "ARRAY_BOUNDS_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What runtime error occurs in this backward array traversal loop?",
            "code": "int[] nums = {4, 8, 12};\nfor (int i = nums.length; i >= 0; i--) {\n    System.out.println(nums[i]);\n}",
            "opt_a": "ArrayIndexOutOfBoundsException on the very first iteration at index nums.length", "q_a": "Correct",
            "opt_b": "Infinite loop", "q_b": "Nearly Correct",
            "opt_c": "NullPointerException", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "The loop starts at i = nums.length, which is out of bounds. It must start at nums.length - 1.",
            "group": "GRP_ARR_REVERSE_BOUNDS",
            "outcome": "Identify boundary initialization errors in reverse array traversal",
            "error_type": "OFF_BY_ONE",
        },
        {
            "type": "Application",
            "difficulty": "Medium",
            "text": "Which code snippet correctly makes an independent copy of array 'src' into 'dest' without reference aliasing?",
            "code": "int[] src = {5, 10, 15};",
            "opt_a": "int[] dest = src;", "q_a": "Nearly Correct",
            "opt_b": "int[] dest = (int[]) src.toString();", "q_b": "Wrong",
            "opt_c": "int[] dest = new int[src];", "q_c": "Clearly Wrong",
            "opt_d": "int[] dest = src.clone();", "q_d": "Correct",
            "correct": "D",
            "explanation": "src.clone() or Arrays.copyOf() creates a new array object with copied elements.",
            "group": "GRP_ARR_CLONE",
            "outcome": "Apply cloning techniques to avoid unintended reference sharing",
            "error_type": "INDEX_ERROR",
        },
        {
            "type": "Transfer",
            "difficulty": "Hard",
            "text": "How does the memory layout of an Array compare with an ArrayList in Java?",
            "code": "",
            "opt_a": "Arrays use fixed contiguous memory blocks for primitives/references; ArrayList is a resizable object wrapper over an internal array", "q_a": "Correct",
            "opt_b": "ArrayList stores elements in linked nodes without an array backing", "q_b": "Nearly Correct",
            "opt_c": "Arrays can dynamically grow without reallocation", "q_c": "Wrong",
            "opt_d": "ArrayList does not support index-based random access", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "ArrayList encapsulates a dynamic array that automatically resizes when capacity is exceeded.",
            "group": "GRP_ARR_LIST_COMP",
            "outcome": "Transfer static array concepts to dynamic collection data structures",
            "error_type": "TYPE_MISMATCH",
        },
    ],
    "Methods": [
        {
            "type": "Basic Understanding",
            "difficulty": "Easy",
            "text": "In Java, what does declaring a method with the 'static' keyword mean?",
            "code": "public static int add(int a, int b) { return a + b; }",
            "opt_a": "The method return value can never change", "q_a": "Nearly Correct",
            "opt_b": "The method belongs to the class itself and can be called without instantiating an object", "q_b": "Correct",
            "opt_c": "The method cannot take parameters", "q_c": "Wrong",
            "opt_d": "The method is executed automatically when the program launches", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Static methods are associated with the class rather than any specific instance of the class.",
            "group": "GRP_METH_STATIC",
            "outcome": "Understand static vs instance method mechanics",
            "error_type": "METHOD_SIGNATURE_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "difficulty": "Medium",
            "text": "What is the return value of mystery(3, 4)?",
            "code": "public static int mystery(int a, int b) {\n    if (b == 0) return 0;\n    return a + mystery(a, b - 1);\n}",
            "opt_a": "7", "q_a": "Nearly Correct",
            "opt_b": "0", "q_b": "Wrong",
            "opt_c": "12 (Multiplies a and b using recursive addition)", "q_c": "Correct",
            "opt_d": "StackOverflowError", "q_d": "Clearly Wrong",
            "correct": "C",
            "explanation": "The recursion computes 3 + 3 + 3 + 3 + 0 = 12 (multiplication via repeated addition).",
            "group": "GRP_METH_REC_MULT",
            "outcome": "Trace recursive method accumulation and base-case termination",
            "error_type": "RECURSION_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What compiler error is produced by this method signature conflict?",
            "code": "public class Calc {\n    public int compute(int x) { return x * 2; }\n    public double compute(int x) { return x * 2.0; }\n}",
            "opt_a": "Variable x is declared twice", "q_a": "Nearly Correct",
            "opt_b": "Methods cannot return double", "q_b": "Wrong",
            "opt_c": "compute is a reserved keyword in Java", "q_c": "Clearly Wrong",
            "opt_d": "Method compute(int) is already defined (Overloading cannot differ only by return type)", "q_d": "Correct",
            "correct": "D",
            "explanation": "In Java, method signatures consist of the method name and parameter list only. Return types are not part of the signature.",
            "group": "GRP_METH_OVERLOAD_ERR",
            "outcome": "Recognize invalid method overload definitions",
            "error_type": "METHOD_SIGNATURE_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "Why does the following method fail to compile?",
            "code": "public int getGrade(int score) {\n    if (score >= 50) {\n        return 1;\n    }\n}",
            "opt_a": "Missing return statement for paths where score < 50", "q_a": "Correct",
            "opt_b": "Return type must be void", "q_b": "Nearly Correct",
            "opt_c": "if statements cannot return values", "q_c": "Wrong",
            "opt_d": "getGrade is an invalid identifier", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Non-void methods must guarantee a return statement along all possible execution branches.",
            "group": "GRP_METH_RET_BRANCH",
            "outcome": "Identify missing return statement compiler errors",
            "error_type": "RETURN_TYPE_ERROR",
        },
        {
            "type": "Error Recognition",
            "difficulty": "Medium",
            "text": "What compiler error occurs when calling 'printSum(5, 3.2)' on 'void printSum(int a, int b)'?",
            "code": "public static void printSum(int a, int b) { ... }\n// Call:\nprintSum(5, 3.2);",
            "opt_a": "Incompatible types: possible lossy conversion from double to int for parameter 2", "q_a": "Correct",
            "opt_b": "printSum is not defined", "q_b": "Nearly Correct",
            "opt_c": "Too many arguments passed to method", "q_c": "Wrong",
            "opt_d": "Methods cannot take two parameters", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "A double literal (3.2) cannot be automatically narrowed to primitive int in a method argument.",
            "group": "GRP_METH_PARAM_MISMATCH",
            "outcome": "Recognize parameter type mismatch compiler errors",
            "error_type": "PARAMETER_MISMATCH",
        },
        {
            "type": "Application",
            "difficulty": "Medium",
            "text": "Which method header correctly defines a method that takes an array of Strings and returns a single concatenated String?",
            "code": "",
            "opt_a": "public static String joinWords(String[] words)", "q_a": "Correct",
            "opt_b": "public static void joinWords(String words[])", "q_b": "Nearly Correct",
            "opt_c": "public static String[] joinWords(String words)", "q_c": "Wrong",
            "opt_d": "public String joinWords(int[] words)", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Return type must be String, and the parameter must be String[] words.",
            "group": "GRP_METH_SIGNATURE_APP",
            "outcome": "Apply proper method signature specifications for array parameters",
            "error_type": "METHOD_SIGNATURE_ERROR",
        },
        {
            "type": "Transfer",
            "difficulty": "Hard",
            "text": "How do object references passed as method arguments behave when their internal fields are mutated inside the method?",
            "code": "public static void reset(StringBuilder sb) {\n    sb.append(\" world\");\n}",
            "opt_a": "The caller's object is unchanged because Java is strictly pass-by-value", "q_a": "Nearly Correct",
            "opt_b": "The caller's object is modified because both the caller and method parameter point to the same heap object", "q_b": "Correct",
            "opt_c": "Causes a concurrent modification exception", "q_c": "Wrong",
            "opt_d": "Strings and StringBuilders are completely immutable in Java", "q_d": "Clearly Wrong",
            "correct": "B",
            "explanation": "Java passes object references by value (copy of reference address). Mutating the referenced object affects the shared heap instance.",
            "group": "GRP_METH_MUTATION_TRANSFER",
            "outcome": "Transfer pass-by-value-of-reference concepts to mutable object modification",
            "error_type": "VARIABLE_SCOPE_ERROR",
        },
    ],
}


def _rotate_question_options(opt_dict, qual_dict, target_correct_letter):
    """
    Given 4 options and their 4 qualities, rearranges them so that the option
    with quality 'Correct' is placed at target_correct_letter ('A', 'B', 'C', or 'D'),
    and the remaining options/qualities fill the other positions.
    """
    letters = ["A", "B", "C", "D"]
    items = []
    for k in letters:
        items.append({
            "text": opt_dict.get(k, ""),
            "quality": qual_dict.get(k, "Wrong"),
        })

    correct_item = next((it for it in items if it["quality"] == "Correct"), items[0])
    other_items = [it for it in items if it is not correct_item]

    target_idx = letters.index(target_correct_letter) if target_correct_letter in letters else 0
    assigned = [None, None, None, None]
    assigned[target_idx] = correct_item

    other_idx = 0
    for i in range(4):
        if assigned[i] is None:
            assigned[i] = other_items[other_idx]
            other_idx += 1

    return {
        "option_a": assigned[0]["text"],
        "option_b": assigned[1]["text"],
        "option_c": assigned[2]["text"],
        "option_d": assigned[3]["text"],
        "option_a_quality": assigned[0]["quality"],
        "option_b_quality": assigned[1]["quality"],
        "option_c_quality": assigned[2]["quality"],
        "option_d_quality": assigned[3]["quality"],
        "correct_option": target_correct_letter,
    }


class SchemaLLMQuestionService:
    """Orchestrates LLM generation of draft questions for teacher review."""

    @classmethod
    def get_concept_errors(cls, concept: str) -> list:
        """Returns valid concept-specific error types."""
        return CONCEPT_ERROR_MAP.get(concept, CONCEPT_ERROR_MAP["Loops"])

    # ─────────────────────────────────────────────────────────────────────────
    # Mode 1: Manual Draft Batch Generation
    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def generate_draft_questions(
        cls,
        concept_name: str,
        question_type: str = None,
        difficulty: str = "Medium",
        target_error_type: str = "UNKNOWN_ERROR",
        count: int = 5,
    ) -> list:
        """
        Generates `count` draft questions for a single concept & filters.
        Saves all generated questions to `generated_questions` with status PENDING.
        """
        concept = concept_name.strip() if concept_name else "Loops"
        if concept not in VALID_CONCEPTS:
            matched = [c for c in VALID_CONCEPTS if c.lower() == concept.lower()]
            concept = matched[0] if matched else "Loops"

        count = max(1, min(20, int(count or 5)))

        # Validate target_error_type is concept-relevant
        valid_errors = cls.get_concept_errors(concept)
        if target_error_type and target_error_type != "UNKNOWN_ERROR" and target_error_type not in valid_errors:
            target_error_type = valid_errors[0]

        # 1. Attempt real LLM generation if configured
        generated_raw = None
        try:
            generated_raw = cls._generate_with_real_llm(concept, question_type, difficulty, target_error_type, count)
        except Exception as e:
            print(f"[INFO] Real LLM generation skipped/failed: {e}")
            generated_raw = None

        # 2. Fallback to rich template mock generator
        if not generated_raw:
            generated_raw = cls._generate_mock_questions(concept, question_type, difficulty, target_error_type, count)

        # 3. Post-process to guarantee balanced correct option distribution across the batch
        generated_balanced = cls._rebalance_batch_options(generated_raw)

        # 4. Save into generated_questions table as PENDING
        saved = SchemaQuestionBankService.save_generated_questions(generated_balanced)
        return saved

    # ─────────────────────────────────────────────────────────────────────────
    # Mode 2: Auto Balanced Pack Generation
    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def generate_balanced_pack(
        cls,
        concepts: list = None,
        questions_per_concept: int = 15,
        difficulty_distribution: dict = None,
        blueprint: dict = None,
    ) -> dict:
        """
        Generates a full balanced draft question pack across multiple concepts in safe sub-batches.
        All generated questions are saved with status PENDING for teacher review.
        """
        selected_concepts = concepts or VALID_CONCEPTS
        selected_concepts = [c for c in selected_concepts if c in VALID_CONCEPTS]
        if not selected_concepts:
            selected_concepts = list(VALID_CONCEPTS)

        q_count = int(questions_per_concept or 15)
        if q_count not in (10, 15, 20, 30):
            q_count = 15

        # Blueprint counts per concept
        # Default 15: 4 Basic, 4 Output, 3 Error, 2 App, 2 Transfer
        type_ratios = {
            "Basic Understanding": 4 / 15,
            "Code Output Prediction": 4 / 15,
            "Error Recognition": 3 / 15,
            "Application": 2 / 15,
            "Transfer": 2 / 15,
        }
        if blueprint and isinstance(blueprint, dict):
            total_b = sum(blueprint.values())
            if total_b > 0:
                type_ratios = {k: v / total_b for k, v in blueprint.items()}

        # Difficulty ratios (Default: 30% Easy, 50% Med, 20% Hard)
        diff_ratios = {"Easy": 0.30, "Medium": 0.50, "Hard": 0.20}
        if difficulty_distribution and isinstance(difficulty_distribution, dict):
            total_d = sum(difficulty_distribution.values())
            if total_d > 0:
                diff_ratios = {k: v / total_d for k, v in difficulty_distribution.items()}

        all_generated = []
        breakdown_by_concept = {}
        breakdown_by_difficulty = {"Easy": 0, "Medium": 0, "Hard": 0}
        breakdown_by_type = {t: 0 for t in VALID_TYPES}

        for concept in selected_concepts:
            concept_questions = []
            concept_errors = cls.get_concept_errors(concept)

            # Build item blueprint plan for this concept
            items_plan = []
            for q_type, ratio in type_ratios.items():
                num_for_type = max(1, round(ratio * q_count))
                for _ in range(num_for_type):
                    if len(items_plan) < q_count:
                        items_plan.append(q_type)

            # Fill remainder if any due to rounding
            while len(items_plan) < q_count:
                items_plan.append(VALID_TYPES[len(items_plan) % len(VALID_TYPES)])

            # Assign difficulties
            num_easy = max(1, round(diff_ratios.get("Easy", 0.3) * q_count))
            num_hard = max(1, round(diff_ratios.get("Hard", 0.2) * q_count))
            num_med = q_count - (num_easy + num_hard)
            if num_med < 1:
                num_med = 1

            diff_assignments = (["Easy"] * num_easy) + (["Medium"] * num_med) + (["Hard"] * num_hard)
            while len(diff_assignments) < q_count:
                diff_assignments.append("Medium")
            random.shuffle(diff_assignments)

            # Safe sub-batch generation (e.g. batches of 3-5)
            batch_size = 5
            for i in range(0, q_count, batch_size):
                sub_types = items_plan[i : i + batch_size]
                sub_diffs = diff_assignments[i : i + batch_size]
                sub_count = len(sub_types)

                sub_generated = []
                for j in range(sub_count):
                    curr_type = sub_types[j]
                    curr_diff = sub_diffs[j]
                    curr_error = concept_errors[j % len(concept_errors)]

                    # Generate single or small sub-item
                    single_raw = None
                    try:
                        single_raw = cls._generate_with_real_llm(concept, curr_type, curr_diff, curr_error, 1)
                    except Exception:
                        single_raw = None

                    if not single_raw:
                        single_raw = cls._generate_mock_questions(concept, curr_type, curr_diff, curr_error, 1)

                    if single_raw:
                        sub_generated.extend(single_raw)

                # Rebalance correct options across this sub-batch
                rebalanced_sub = cls._rebalance_batch_options(sub_generated)
                saved_sub = SchemaQuestionBankService.save_generated_questions(rebalanced_sub)
                concept_questions.extend(saved_sub)

            all_generated.extend(concept_questions)
            breakdown_by_concept[concept] = len(concept_questions)
            for q in concept_questions:
                diff = q.get("difficulty", "Medium")
                qtype = q.get("question_type", "Basic Understanding")
                breakdown_by_difficulty[diff] = breakdown_by_difficulty.get(diff, 0) + 1
                breakdown_by_type[qtype] = breakdown_by_type.get(qtype, 0) + 1

        total_requested = len(selected_concepts) * q_count
        return {
            "success": True,
            "total_requested": total_requested,
            "total_generated": len(all_generated),
            "questions": all_generated,
            "by_concept": breakdown_by_concept,
            "by_difficulty": breakdown_by_difficulty,
            "by_question_type": breakdown_by_type,
            "warnings": [] if len(all_generated) == total_requested else [f"Generated {len(all_generated)} of {total_requested} requested questions."],
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Mode 3: Fill Missing Gaps Generation
    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def generate_gap_fill_questions(cls, gaps: list = None, max_per_gap: int = 2) -> dict:
        """
        Generates targeted draft questions to fill identified gaps in the approved question bank.
        Saves all generated questions with status PENDING for teacher review.
        """
        if gaps is None:
            coverage = SchemaQuestionBankService.get_coverage_analysis()
            gaps = coverage.get("gaps_list", [])

        if not gaps:
            return {
                "success": True,
                "message": "No missing question gaps detected in the approved bank.",
                "total_generated": 0,
                "questions": [],
                "by_concept": {},
            }

        generated_all = []
        breakdown_by_concept = {}

        for gap in gaps:
            concept = gap.get("concept_name", "Loops")
            gap_type = gap.get("gap_type", "question_type")
            target_value = gap.get("target_value")
            needed = min(max(1, int(gap.get("gap_count", 1))), int(max_per_gap or 2))

            concept_errors = cls.get_concept_errors(concept)

            q_type = None
            diff = "Medium"
            err_type = concept_errors[0]

            if gap_type == "question_type":
                q_type = target_value
            elif gap_type == "difficulty":
                diff = target_value
            elif gap_type == "error_type":
                err_type = target_value
                q_type = "Error Recognition"

            raw = None
            try:
                raw = cls._generate_with_real_llm(concept, q_type, diff, err_type, needed)
            except Exception:
                raw = None

            if not raw:
                raw = cls._generate_mock_questions(concept, q_type, diff, err_type, needed)

            balanced = cls._rebalance_batch_options(raw)
            saved = SchemaQuestionBankService.save_generated_questions(balanced)
            generated_all.extend(saved)
            breakdown_by_concept[concept] = breakdown_by_concept.get(concept, 0) + len(saved)

        return {
            "success": True,
            "message": f"Generated {len(generated_all)} gap-filling draft questions across {len(breakdown_by_concept)} concepts.",
            "total_generated": len(generated_all),
            "questions": generated_all,
            "by_concept": breakdown_by_concept,
        }

    # ─────────────────────────────────────────────────────────────────────────
    # Batch Option Rebalancing
    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def _rebalance_batch_options(cls, questions: list) -> list:
        """
        Ensures that within any generated batch, correct_option values are distributed
        evenly across A, B, C, D so no single letter dominates.
        """
        if not questions:
            return []

        letters = ["A", "B", "C", "D"]
        correct_positions = [q.get("correct_option", "A") for q in questions]
        all_same = len(set(correct_positions)) == 1

        rebalanced = []
        for i, q in enumerate(questions):
            q_copy = dict(q)
            target_letter = letters[i % 4]

            if all_same or q_copy.get("correct_option") != target_letter:
                opt_dict = {
                    "A": q_copy.get("option_a", ""),
                    "B": q_copy.get("option_b", ""),
                    "C": q_copy.get("option_c", ""),
                    "D": q_copy.get("option_d", ""),
                }
                qual_dict = {
                    "A": q_copy.get("option_a_quality", "Correct"),
                    "B": q_copy.get("option_b_quality", "Nearly Correct"),
                    "C": q_copy.get("option_c_quality", "Wrong"),
                    "D": q_copy.get("option_d_quality", "Clearly Wrong"),
                }
                rotated = _rotate_question_options(opt_dict, qual_dict, target_letter)
                q_copy.update(rotated)

            rebalanced.append(q_copy)

        return rebalanced

    # ─────────────────────────────────────────────────────────────────────────
    # Real LLM API Integration (OpenAI GPT-4o-mini with JSON Schema)
    # ─────────────────────────────────────────────────────────────────────────
    @classmethod
    def _generate_with_real_llm(cls, concept, question_type, difficulty, target_error_type, count):
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key or api_key.startswith("your_openai"):
            return None

        try:
            from openai import OpenAI
            import json

            client = OpenAI(api_key=api_key)
            q_type_str = f" of type '{question_type}'" if question_type else " covering diverse cognitive levels (Basic Understanding, Code Output Prediction, Error Recognition, Application, Transfer)"
            err_str = f" targeting error pattern '{target_error_type}'" if target_error_type and target_error_type != "UNKNOWN_ERROR" else ""

            prompt = f"""You are an expert Java Computer Science educator.
Generate {count} multiple-choice draft diagnostic questions on the concept '{concept}' at '{difficulty}' difficulty{q_type_str}{err_str}.

Each question MUST strictly follow this exact 4-tier schema:
- Exactly 4 options: option_a, option_b, option_c, option_d
- Option quality labels:
    - Exactly one "Correct" (worth 1.0)
    - Exactly one "Nearly Correct" (worth 0.5 - represents a common misconception or off-by-one/partial reasoning)
    - Exactly one "Wrong" (worth 0.0 - weak conceptual understanding)
    - Exactly one "Clearly Wrong" (worth 0.0 - severe misconception or nonsense)
- IMPORTANT: Distribute correct_option across A, B, C, and D across the questions in the batch. DO NOT make option A the correct answer for every question!
- "correct_option" MUST be "A", "B", "C", or "D" corresponding to the option marked "Correct"
- Include Java code snippet if applicable (or empty string "")
- Include concise pedagogical explanation for teachers
- Include learning_outcome and target_error_type

Return ONLY a JSON object with a single key "questions" containing a list of {count} question objects formatted as:
{{
  "questions": [
    {{
      "question_type": "Basic Understanding",
      "question_text": "...",
      "code_snippet": "...",
      "option_a": "...",
      "option_a_quality": "...",
      "option_b": "...",
      "option_b_quality": "...",
      "option_c": "...",
      "option_c_quality": "...",
      "option_d": "...",
      "option_d_quality": "...",
      "correct_option": "B",
      "explanation": "...",
      "learning_outcome": "...",
      "target_error_type": "..."
    }}
  ]
}}
"""

            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a CS Education AI that generates structured JSON post-test questions with 4-tier answer quality labels. You ensure correct answer positions are evenly distributed across A, B, C, D."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.7,
            )

            content = response.choices[0].message.content
            parsed = json.loads(content)
            raw_list = parsed.get("questions", []) if isinstance(parsed, dict) else parsed

            validated = []
            now = datetime.utcnow().isoformat() + "Z"
            for item in raw_list:
                val_q = cls._validate_and_format_question(item, concept, difficulty, target_error_type, now, source="OpenAI GPT-4o-mini")
                if val_q:
                    validated.append(val_q)

            if len(validated) > 0:
                return validated

        except Exception as e:
            print(f"[WARN] OpenAI generation failed: {e}. Falling back to mock template generator.")

        return None

    @classmethod
    def _validate_and_format_question(cls, q, concept, difficulty, target_error_type, timestamp, source="LLM_Generator"):
        """Validates and enforces strict 4-tier quality labels and 4 options A/B/C/D."""
        if not isinstance(q, dict):
            return None

        text = q.get("question_text") or q.get("text") or q.get("question")
        if not text or not str(text).strip():
            return None

        opt_a = str(q.get("option_a") or q.get("opt_a") or "").strip()
        opt_b = str(q.get("option_b") or q.get("opt_b") or "").strip()
        opt_c = str(q.get("option_c") or q.get("opt_c") or "").strip()
        opt_d = str(q.get("option_d") or q.get("opt_d") or "").strip()

        if not (opt_a and opt_b and opt_c and opt_d):
            return None

        qual_a = q.get("option_a_quality") or q.get("q_a") or "Correct"
        qual_b = q.get("option_b_quality") or q.get("q_b") or "Nearly Correct"
        qual_c = q.get("option_c_quality") or q.get("q_c") or "Wrong"
        qual_d = q.get("option_d_quality") or q.get("q_d") or "Clearly Wrong"

        valid_qualities = {"Correct", "Nearly Correct", "Wrong", "Clearly Wrong"}
        qualities = [qual_a, qual_b, qual_c, qual_d]
        if not all(k in valid_qualities for k in qualities):
            qual_a, qual_b, qual_c, qual_d = "Correct", "Nearly Correct", "Wrong", "Clearly Wrong"

        correct_letter = "A"
        if qual_a == "Correct":
            correct_letter = "A"
        elif qual_b == "Correct":
            correct_letter = "B"
        elif qual_c == "Correct":
            correct_letter = "C"
        elif qual_d == "Correct":
            correct_letter = "D"
        else:
            qual_a = "Correct"
            correct_letter = "A"

        qid_prefix = concept[:4].upper()
        return {
            "id": f"GEN_{uuid.uuid4().hex[:8].upper()}",
            "question_id": f"{qid_prefix}_Q{uuid.uuid4().hex[:4].upper()}",
            "concept_name": concept,
            "learning_outcome": q.get("learning_outcome") or f"Demonstrate understanding of {concept}",
            "question_type": q.get("question_type") or "Basic Understanding",
            "difficulty": difficulty or "Medium",
            "target_error_type": target_error_type if target_error_type != "UNKNOWN_ERROR" else q.get("target_error_type", "UNKNOWN_ERROR"),
            "equivalent_group_id": q.get("equivalent_group_id") or f"GRP_{concept[:3].upper()}_{random.randint(100, 999)}",
            "question_text": str(text).strip(),
            "code_snippet": q.get("code_snippet") or q.get("code", ""),
            "option_a": opt_a,
            "option_b": opt_b,
            "option_c": opt_c,
            "option_d": opt_d,
            "correct_option": correct_letter,
            "option_a_quality": qual_a,
            "option_b_quality": qual_b,
            "option_c_quality": qual_c,
            "option_d_quality": qual_d,
            "explanation": q.get("explanation") or f"The correct answer is {correct_letter}.",
            "generated_by": f"{source} (Teacher-Review Pipeline)",
            "status": "PENDING",
            "created_at": timestamp,
            "updated_at": timestamp,
        }

    @classmethod
    def _generate_mock_questions(cls, concept, question_type, difficulty, target_error_type, count):
        """High-fidelity template generator producing varied questions with distributed answer positions."""
        templates = QUESTION_TEMPLATES.get(concept, QUESTION_TEMPLATES["Loops"])

        # Filter by question_type if specified
        if question_type and question_type in VALID_TYPES:
            filtered_by_type = [t for t in templates if t.get("type") == question_type]
            if filtered_by_type:
                templates = filtered_by_type

        # Filter by target_error_type if specified
        if target_error_type and target_error_type != "UNKNOWN_ERROR":
            filtered_by_err = [t for t in templates if t.get("error_type") == target_error_type]
            if filtered_by_err:
                templates = filtered_by_err

        results = []
        now = datetime.utcnow().isoformat() + "Z"
        letters = ["A", "B", "C", "D"]

        for i in range(count):
            base = templates[i % len(templates)]
            variant_suffix = f"_{random.randint(100, 999)}"
            qid_prefix = concept[:4].upper()
            q_id = f"{qid_prefix}_Q{uuid.uuid4().hex[:4].upper()}"
            target_letter = letters[i % 4]

            opt_dict = {
                "A": base.get("opt_a", "Option A"),
                "B": base.get("opt_b", "Option B"),
                "C": base.get("opt_c", "Option C"),
                "D": base.get("opt_d", "Option D"),
            }
            qual_dict = {
                "A": base.get("q_a", "Correct"),
                "B": base.get("q_b", "Nearly Correct"),
                "C": base.get("q_c", "Wrong"),
                "D": base.get("q_d", "Clearly Wrong"),
            }

            rotated = _rotate_question_options(opt_dict, qual_dict, target_letter)

            question_obj = {
                "id": f"GEN_{uuid.uuid4().hex[:8].upper()}",
                "question_id": q_id,
                "concept_name": concept,
                "learning_outcome": base.get("outcome", f"Demonstrate understanding of {concept}"),
                "question_type": base.get("type", question_type or "Basic Understanding"),
                "difficulty": difficulty or base.get("difficulty", "Medium"),
                "target_error_type": target_error_type if target_error_type != "UNKNOWN_ERROR" else base.get("error_type", "UNKNOWN_ERROR"),
                "equivalent_group_id": f"{base.get('group', 'GRP_' + concept[:3].upper())}{variant_suffix}",
                "question_text": base.get("text", f"Question about {concept}"),
                "code_snippet": base.get("code", ""),
                "option_a": rotated["option_a"],
                "option_b": rotated["option_b"],
                "option_c": rotated["option_c"],
                "option_d": rotated["option_d"],
                "correct_option": rotated["correct_option"],
                "option_a_quality": rotated["option_a_quality"],
                "option_b_quality": rotated["option_b_quality"],
                "option_c_quality": rotated["option_c_quality"],
                "option_d_quality": rotated["option_d_quality"],
                "explanation": base.get("explanation", ""),
                "generated_by": "LLM_Generator (Teacher-Review Pipeline)",
                "status": "PENDING",
                "created_at": now,
                "updated_at": now,
            }
            results.append(question_obj)

        return results
