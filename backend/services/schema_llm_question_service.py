"""
Component 4: LLM-Assisted Question Generator Service
====================================================
Generates concept-specific draft post-test questions with option quality labels:
  - Correct (1.0)
  - Nearly Correct (0.5 - misconception/partial understanding)
  - Wrong (0.0 - weak understanding)
  - Clearly Wrong (0.0 - serious confusion)

Saves drafts to `generated_questions` with status PENDING for teacher review.
Includes an extensible structure for real LLM APIs (OpenAI / Gemini) with
a high-fidelity mock generator fallback.
"""

import os
import uuid
import random
from datetime import datetime
from services.schema_question_bank_service import SchemaQuestionBankService

VALID_CONCEPTS = ["Variables", "Operators", "Loops", "Arrays", "Methods"]
VALID_TYPES = ["Basic Understanding", "Code Output Prediction", "Error Recognition", "Application", "Transfer"]
VALID_DIFFICULTIES = ["Easy", "Medium", "Hard"]

# Template library for high-fidelity draft generation
QUESTION_TEMPLATES = {
    "Variables": [
        {
            "type": "Basic Understanding",
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
            "error_type": "TYPE_MISMATCH",
        },
        {
            "type": "Code Output Prediction",
            "text": "What is the output of the following integer division and type conversion?",
            "code": "int a = 7;\nint b = 2;\ndouble result = a / b;\nSystem.out.println(result);",
            "opt_a": "3.0", "q_a": "Correct",
            "opt_b": "3.5", "q_b": "Nearly Correct",
            "opt_c": "3", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "a / b performs integer division (7 / 2 = 3). The integer 3 is then widened to double 3.0.",
            "group": "GRP_VAR_DIV_TRUNC",
            "outcome": "Trace integer division truncation before double assignment",
            "error_type": "TYPE_MISMATCH",
        },
        {
            "type": "Error Recognition",
            "text": "Which error will be reported by the Java compiler for the following code?",
            "code": "final int MAX_USERS = 50;\nMAX_USERS = 60;",
            "opt_a": "Cannot assign a value to final variable MAX_USERS", "q_a": "Correct",
            "opt_b": "Variable MAX_USERS is out of scope", "q_b": "Nearly Correct",
            "opt_c": "NullPointerException at runtime", "q_c": "Wrong",
            "opt_d": "MAX_USERS must be declared as double", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Variables marked 'final' cannot be reassigned once initialized.",
            "group": "GRP_VAR_FINAL_ERR",
            "outcome": "Identify final variable immutability compiler errors",
            "error_type": "VARIABLE_SCOPE_ERROR",
        },
        {
            "type": "Application",
            "text": "Which statement correctly converts a String '125' into a primitive int in Java?",
            "code": "String s = \"125\";",
            "opt_a": "int num = Integer.parseInt(s);", "q_a": "Correct",
            "opt_b": "int num = (int) s;", "q_b": "Nearly Correct",
            "opt_c": "int num = s.toInt();", "q_c": "Wrong",
            "opt_d": "int num = new Integer(s);", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Integer.parseInt() parses the string argument as a signed decimal integer.",
            "group": "GRP_VAR_PARSE_INT",
            "outcome": "Apply wrapper parsing methods for string-to-numeric conversions",
            "error_type": "TYPE_MISMATCH",
        },
        {
            "type": "Transfer",
            "text": "How does Java manage memory for a primitive 'int' compared to an object reference variable on the JVM stack?",
            "code": "",
            "opt_a": "The primitive stores its raw binary value directly on the stack frame, while an object variable stores a heap address", "q_a": "Correct",
            "opt_b": "Primitives are stored on the garbage collected heap while references live on the CPU cache", "q_b": "Nearly Correct",
            "opt_c": "Both primitives and objects are stored in the metaspace", "q_c": "Wrong",
            "opt_d": "Primitives have methods and fields just like objects", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Primitive local variables hold their actual values directly on the thread stack frame.",
            "group": "GRP_VAR_JVM_MEM",
            "outcome": "Transfer memory layout principles between stack primitives and heap references",
            "error_type": "TYPE_MISMATCH",
        },
    ],
    "Operators": [
        {
            "type": "Basic Understanding",
            "text": "What is the effect of the bitwise XOR operator (^) when applied to two boolean values in Java?",
            "code": "boolean result = (a ^ b);",
            "opt_a": "Returns true if exactly one operand is true, and false if both are equal", "q_a": "Correct",
            "opt_b": "Returns true only if both operands are true", "q_b": "Nearly Correct",
            "opt_c": "Performs logical negation of variable a", "q_c": "Wrong",
            "opt_d": "Raises an operator precedence compilation error", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "The XOR (^) operator evaluates to true if and only if its arguments differ.",
            "group": "GRP_OP_XOR",
            "outcome": "Understand logical XOR behavior",
            "error_type": "SYNTAX_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "text": "What is the printed value of x after this compound assignment executes?",
            "code": "int x = 10;\nx += 5 * 2;\nSystem.out.println(x);",
            "opt_a": "20", "q_a": "Correct",
            "opt_b": "30", "q_b": "Nearly Correct",
            "opt_c": "25", "q_c": "Wrong",
            "opt_d": "15", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Multiplication has higher precedence than compound addition: 5 * 2 = 10, then x = 10 + 10 = 20.",
            "group": "GRP_OP_PREC_COMPOUND",
            "outcome": "Trace operator precedence with compound assignment operators",
            "error_type": "SYNTAX_ERROR",
        },
        {
            "type": "Error Recognition",
            "text": "Identify why the following equality check produces unexpected logic behavior for Strings:",
            "code": "String s1 = new String(\"hello\");\nString s2 = new String(\"hello\");\nif (s1 == s2) {\n    System.out.println(\"Equal\");\n}",
            "opt_a": "'==' compares memory references, not String contents. It should use s1.equals(s2)", "q_a": "Correct",
            "opt_b": "String objects cannot be initialized with 'new'", "q_b": "Nearly Correct",
            "opt_c": "The code will not compile due to type mismatch", "q_c": "Wrong",
            "opt_d": "System.out.println cannot print inside an if statement", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "'==' tests for reference identity. Two distinct objects with identical characters have different references.",
            "group": "GRP_OP_STR_EQUALS",
            "outcome": "Recognize reference equality vs content equality bug patterns",
            "error_type": "LOGIC_ERROR",
        },
        {
            "type": "Application",
            "text": "Which expression checks if an integer 'val' is strictly between 10 and 50 (exclusive)?",
            "code": "int val = 25;",
            "opt_a": "(val > 10) && (val < 50)", "q_a": "Correct",
            "opt_b": "10 < val < 50", "q_b": "Nearly Correct",
            "opt_c": "(val >= 10) || (val <= 50)", "q_c": "Wrong",
            "opt_d": "(val == 10) && (val == 50)", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Java requires explicit compound conditions joined by logical AND (&&). '10 < val < 50' is invalid Java syntax.",
            "group": "GRP_OP_RANGE_CHECK",
            "outcome": "Apply compound logical conditions for range verification",
            "error_type": "SYNTAX_ERROR",
        },
        {
            "type": "Transfer",
            "text": "In Java bit shifting, what is the key difference between '>>' (arithmetic right shift) and '>>>' (logical right shift)?",
            "code": "int neg = -8;\nint r1 = neg >> 2;\nint r2 = neg >>> 2;",
            "opt_a": "'>>' preserves the sign bit (fills with 1s for negatives), whereas '>>>' always fills the leftmost bits with 0s", "q_a": "Correct",
            "opt_b": "'>>>' performs floating point shifts while '>>' is integer only", "q_b": "Nearly Correct",
            "opt_c": "'>>' multiplies by 2 while '>>>' divides by 2", "q_c": "Wrong",
            "opt_d": "'>>>' is only valid in C++, not in Java", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "'>>>' is the unsigned right shift operator in Java, padding the leading bits with zero regardless of sign.",
            "group": "GRP_OP_BIT_SHIFT",
            "outcome": "Transfer binary two's complement knowledge to bitwise operations",
            "error_type": "LOGIC_ERROR",
        },
    ],
    "Loops": [
        {
            "type": "Basic Understanding",
            "text": "What is the key structural difference between a 'while' loop and a 'do-while' loop?",
            "code": "",
            "opt_a": "A do-while loop evaluates its condition after the body, guaranteeing at least one execution", "q_a": "Correct",
            "opt_b": "A while loop can only iterate over arrays", "q_b": "Nearly Correct",
            "opt_c": "A do-while loop does not support the break statement", "q_c": "Wrong",
            "opt_d": "A while loop always executes an infinite number of times", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "'do-while' is a post-test loop: the condition is checked after executing the loop body.",
            "group": "GRP_LOOP_DOWHILE",
            "outcome": "Distinguish pre-test and post-test loop execution mechanics",
            "error_type": "LOOP_CONDITION_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "text": "What will be printed to the screen when this code runs?",
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
            "text": "What causes this while loop to never terminate?",
            "code": "int i = 1;\nwhile (i != 10) {\n    System.out.println(i);\n    i += 2;\n}",
            "opt_a": "i skips 10 (1, 3, 5, 7, 9, 11...), so the condition i != 10 is never false", "q_a": "Correct",
            "opt_b": "i is not initialized properly", "q_b": "Nearly Correct",
            "opt_c": "System.out.println freezes the CPU", "q_c": "Wrong",
            "opt_d": "while loops cannot use '!=' as a condition", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Incrementing by 2 produces odd numbers. i jumps from 9 to 11, missing 10 and looping indefinitely.",
            "group": "GRP_LOOP_OFF_BY_TWO",
            "outcome": "Recognize parity mismatch causing infinite loop condition failures",
            "error_type": "LOOP_CONDITION_ERROR",
        },
        {
            "type": "Application",
            "text": "Which loop correctly computes the factorial of an integer N (e.g. 5! = 120)?",
            "code": "int N = 5;\nlong fact = 1;",
            "opt_a": "for (int i = 1; i <= N; i++) { fact *= i; }", "q_a": "Correct",
            "opt_b": "for (int i = 0; i < N; i++) { fact *= i; }", "q_b": "Nearly Correct",
            "opt_c": "for (int i = 1; i < N; i++) { fact += i; }", "q_c": "Wrong",
            "opt_d": "while (N > 0) { fact += N; N--; }", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Starting at 1 up to N with multiplication (fact *= i) computes N! correctly. Starting at 0 makes fact 0.",
            "group": "GRP_LOOP_FACTORIAL",
            "outcome": "Apply accumulator loops for mathematical series calculations",
            "error_type": "OFF_BY_ONE",
        },
        {
            "type": "Transfer",
            "text": "When rewriting a traditional index-based for loop into an enhanced for-each loop in Java, what capability is lost?",
            "code": "// Traditional\nfor (int i = 0; i < arr.length; i++) { ... }\n// Enhanced\nfor (int x : arr) { ... }",
            "opt_a": "Direct access to the current index position and the ability to modify array elements in-place", "q_a": "Correct",
            "opt_b": "The ability to read array element values", "q_b": "Nearly Correct",
            "opt_c": "Type safety during iteration", "q_c": "Wrong",
            "opt_d": "Enhanced for loops cannot run on primitive arrays", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Enhanced for-each loops do not provide an explicit index variable, making in-place assignment to array slots impossible.",
            "group": "GRP_LOOP_FOREACH_LIMIT",
            "outcome": "Transfer iteration paradigms between indexed and iterator-based loops",
            "error_type": "LOGIC_ERROR",
        },
    ],
    "Arrays": [
        {
            "type": "Basic Understanding",
            "text": "What are all elements of a newly created 'int[] data = new int[4];' initialized to by default?",
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
            "text": "What is the output of the following array reference assignment?",
            "code": "int[] a = {1, 2, 3};\nint[] b = a;\nb[0] = 99;\nSystem.out.println(a[0]);",
            "opt_a": "99 (Both a and b reference the exact same array in heap memory)", "q_a": "Correct",
            "opt_b": "1 (b is an independent deep copy of a)", "q_b": "Nearly Correct",
            "opt_c": "0", "q_c": "Wrong",
            "opt_d": "Compilation Error", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "'b = a' copies the object reference, meaning modifications via 'b' affect the array pointed to by 'a'.",
            "group": "GRP_ARR_ALIASING",
            "outcome": "Predict array aliasing and reference sharing side effects",
            "error_type": "VARIABLE_SCOPE_ERROR",
        },
        {
            "type": "Error Recognition",
            "text": "What error occurs when trying to access 'arr[arr.length]' on an array?",
            "code": "int[] arr = {10, 20, 30};\nSystem.out.println(arr[arr.length]);",
            "opt_a": "ArrayIndexOutOfBoundsException because valid indices end at arr.length - 1", "q_a": "Correct",
            "opt_b": "NullPointerException", "q_b": "Nearly Correct",
            "opt_c": "Prints 0", "q_c": "Wrong",
            "opt_d": "Compilation error because .length is a method", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "An array with length 3 has valid indices 0, 1, and 2. Index 3 is out of bounds.",
            "group": "GRP_ARR_LEN_BOUND",
            "outcome": "Recognize classic length boundary off-by-one errors",
            "error_type": "INDEX_ERROR",
        },
        {
            "type": "Application",
            "text": "Which code snippet correctly makes an independent copy of array 'src' into 'dest' without reference aliasing?",
            "code": "int[] src = {5, 10, 15};",
            "opt_a": "int[] dest = src.clone();", "q_a": "Correct",
            "opt_b": "int[] dest = src;", "q_b": "Nearly Correct",
            "opt_c": "int[] dest = (int[]) src.toString();", "q_c": "Wrong",
            "opt_d": "int[] dest = new int[src];", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "src.clone() or Arrays.copyOf() creates a new array object with copied elements.",
            "group": "GRP_ARR_CLONE",
            "outcome": "Apply cloning techniques to avoid unintended reference sharing",
            "error_type": "INDEX_ERROR",
        },
        {
            "type": "Transfer",
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
            "text": "In Java, what does declaring a method with the 'static' keyword mean?",
            "code": "public static int add(int a, int b) { return a + b; }",
            "opt_a": "The method belongs to the class itself and can be called without instantiating an object", "q_a": "Correct",
            "opt_b": "The method return value can never change", "q_b": "Nearly Correct",
            "opt_c": "The method cannot take parameters", "q_c": "Wrong",
            "opt_d": "The method is executed automatically when the program launches", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Static methods are associated with the class rather than any specific instance of the class.",
            "group": "GRP_METH_STATIC",
            "outcome": "Understand static vs instance method mechanics",
            "error_type": "METHOD_SIGNATURE_ERROR",
        },
        {
            "type": "Code Output Prediction",
            "text": "What is the return value of mystery(3, 4)?",
            "code": "public static int mystery(int a, int b) {\n    if (b == 0) return 0;\n    return a + mystery(a, b - 1);\n}",
            "opt_a": "12 (Multiplies a and b using recursive addition)", "q_a": "Correct",
            "opt_b": "7", "q_b": "Nearly Correct",
            "opt_c": "0", "q_c": "Wrong",
            "opt_d": "StackOverflowError", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "The recursion computes 3 + 3 + 3 + 3 + 0 = 12 (multiplication via repeated addition).",
            "group": "GRP_METH_REC_MULT",
            "outcome": "Trace recursive method accumulation and base-case termination",
            "error_type": "RECURSION_ERROR",
        },
        {
            "type": "Error Recognition",
            "text": "What compiler error is produced by this method signature conflict?",
            "code": "public class Calc {\n    public int compute(int x) { return x * 2; }\n    public double compute(int x) { return x * 2.0; }\n}",
            "opt_a": "Method compute(int) is already defined (Overloading cannot differ only by return type)", "q_a": "Correct",
            "opt_b": "Variable x is declared twice", "q_b": "Nearly Correct",
            "opt_c": "Methods cannot return double", "q_c": "Wrong",
            "opt_d": "compute is a reserved keyword in Java", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "In Java, method signatures consist of the method name and parameter list only. Return types are not part of the signature.",
            "group": "GRP_METH_OVERLOAD_ERR",
            "outcome": "Recognize invalid method overload definitions",
            "error_type": "METHOD_SIGNATURE_ERROR",
        },
        {
            "type": "Application",
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
            "text": "How do object references passed as method arguments behave when their internal fields are mutated inside the method?",
            "code": "public static void reset(StringBuilder sb) {\n    sb.append(\" world\");\n}",
            "opt_a": "The caller's object is modified because both the caller and method parameter point to the same heap object", "q_a": "Correct",
            "opt_b": "The caller's object is unchanged because Java is strictly pass-by-value", "q_b": "Nearly Correct",
            "opt_c": "Causes a concurrent modification exception", "q_c": "Wrong",
            "opt_d": "Strings and StringBuilders are completely immutable in Java", "q_d": "Clearly Wrong",
            "correct": "A",
            "explanation": "Java passes object references by value (copy of reference address). Mutating the referenced object affects the shared heap instance.",
            "group": "GRP_METH_MUTATION_TRANSFER",
            "outcome": "Transfer pass-by-value-of-reference concepts to mutable object modification",
            "error_type": "VARIABLE_SCOPE_ERROR",
        },
    ],
}


class SchemaLLMQuestionService:
    """Orchestrates LLM generation of draft questions for teacher review."""

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
        Generates `count` draft questions for the given concept and filters.
        Saves all generated questions to `generated_questions` with status PENDING.
        """
        concept = concept_name.strip() if concept_name else "Loops"
        if concept not in VALID_CONCEPTS:
            matched = [c for c in VALID_CONCEPTS if c.lower() == concept.lower()]
            concept = matched[0] if matched else "Loops"

        count = max(1, min(20, int(count or 5)))

        # 1. Attempt real LLM generation if API configured
        generated_raw = None
        try:
            generated_raw = cls._generate_with_real_llm(concept, question_type, difficulty, target_error_type, count)
        except Exception as e:
            print(f"[INFO] Real LLM generation skipped/failed: {e}")
            generated_raw = None

        # 2. Fallback to rich template mock generator
        if not generated_raw:
            generated_raw = cls._generate_mock_questions(concept, question_type, difficulty, target_error_type, count)

        # 3. Save into generated_questions table as PENDING
        saved = SchemaQuestionBankService.save_generated_questions(generated_raw)
        return saved

    @classmethod
    def rebalance_options_dict(cls, opt_items: list, target_correct_letter: str = None) -> dict:
        """
        Given a list of 4 (text, quality) tuples/dicts, places 'Correct' at target_correct_letter
        (or rotates across A/B/C/D) and distributes distractors across the other slots.
        Returns a dictionary with option_a..d, option_a_quality..d_quality, and correct_option.
        """
        letters = ["A", "B", "C", "D"]
        correct_item = None
        distractors = []

        for item in opt_items:
            t = str(item.get("text", "")).strip()
            q = str(item.get("quality", "")).strip()
            if q == "Correct":
                correct_item = (t, q)
            else:
                distractors.append((t, q))

        # Fallback if no Correct label found
        if not correct_item:
            if distractors:
                correct_item = (distractors[0][0], "Correct")
                distractors = distractors[1:]
            else:
                correct_item = ("Correct Answer", "Correct")

        # Ensure we have exactly 3 distractors
        default_qualities = ["Nearly Correct", "Wrong", "Clearly Wrong"]
        while len(distractors) < 3:
            dq = default_qualities[len(distractors)]
            distractors.append((f"Distractor ({dq})", dq))
        distractors = distractors[:3]

        random.shuffle(distractors)

        if not target_correct_letter or target_correct_letter.upper() not in letters:
            target_correct_letter = random.choice(letters)
        else:
            target_correct_letter = target_correct_letter.upper()

        assigned = {}
        dist_idx = 0
        for l in letters:
            if l == target_correct_letter:
                assigned[l] = correct_item
            else:
                assigned[l] = distractors[dist_idx]
                dist_idx += 1

        return {
            "option_a": assigned["A"][0],
            "option_a_quality": assigned["A"][1],
            "option_b": assigned["B"][0],
            "option_b_quality": assigned["B"][1],
            "option_c": assigned["C"][0],
            "option_c_quality": assigned["C"][1],
            "option_d": assigned["D"][0],
            "option_d_quality": assigned["D"][1],
            "correct_option": target_correct_letter,
        }

    @classmethod
    def _generate_with_real_llm(cls, concept, question_type, difficulty, target_error_type, count):
        """
        Generates draft questions using OpenAI API if OPENAI_API_KEY is available.
        Validates JSON schema, 4-tier answer qualities, and enforces balanced A/B/C/D positions.
        """
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
- "correct_option" MUST be "A", "B", "C", or "D" corresponding to the option marked "Correct".
- BALANCED ANSWER DISTRIBUTION: You MUST vary and distribute the "Correct" option across A, B, C, and D evenly throughout the {count} questions (e.g. Q1 -> A, Q2 -> B, Q3 -> C, Q4 -> D, etc.). Do NOT make option A always the correct answer!
- Include Java code snippet if applicable (or empty string "")
- Include concise pedagogical explanation
- Include learning_outcome and target_error_type

Return ONLY a JSON object with a single key "questions" containing a list of {count} question objects formatted as:
{{
  "questions": [
    {{
      "question_type": "Basic Understanding",
      "question_text": "...",
      "code_snippet": "...",
      "option_a": "...",
      "option_a_quality": "Wrong",
      "option_b": "...",
      "option_b_quality": "Correct",
      "option_c": "...",
      "option_c_quality": "Nearly Correct",
      "option_d": "...",
      "option_d_quality": "Clearly Wrong",
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
                    {"role": "system", "content": "You are a CS Education AI that generates structured JSON post-test questions with 4-tier answer quality labels and balanced option positions."},
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
            letters = ["A", "B", "C", "D"]
            for idx, item in enumerate(raw_list):
                target_letter = letters[idx % len(letters)]
                val_q = cls._validate_and_format_question(item, concept, difficulty, target_error_type, now, source="OpenAI GPT-4o-mini", target_correct_letter=target_letter)
                if val_q:
                    validated.append(val_q)

            if len(validated) > 0:
                print(f"[OK] OpenAI generated {len(validated)} validated draft questions for {concept}")
                return validated

        except Exception as e:
            print(f"[WARN] OpenAI generation failed: {e}. Falling back to mock template generator.")

        return None

    @classmethod
    def _validate_and_format_question(cls, q, concept, difficulty, target_error_type, timestamp, source="LLM_Generator", target_correct_letter=None):
        """Validates and enforces strict 4-tier quality labels and 4 options A/B/C/D with balanced positions."""
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

        raw_opts = [
            {"text": opt_a, "quality": qual_a},
            {"text": opt_b, "quality": qual_b},
            {"text": opt_c, "quality": qual_c},
            {"text": opt_d, "quality": qual_d},
        ]

        # Rebalance options so correct answer is at target_correct_letter
        balanced = cls.rebalance_options_dict(raw_opts, target_correct_letter=target_correct_letter)

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
            "option_a": balanced["option_a"],
            "option_b": balanced["option_b"],
            "option_c": balanced["option_c"],
            "option_d": balanced["option_d"],
            "correct_option": balanced["correct_option"],
            "option_a_quality": balanced["option_a_quality"],
            "option_b_quality": balanced["option_b_quality"],
            "option_c_quality": balanced["option_c_quality"],
            "option_d_quality": balanced["option_d_quality"],
            "explanation": q.get("explanation") or f"The correct answer is Option {balanced['correct_option']}.",
            "generated_by": f"{source} (Teacher-Review Pipeline)",
            "status": "PENDING",
            "active": True,
            "deleted": False,
            "created_at": timestamp,
            "updated_at": timestamp,
        }

    @classmethod
    def _generate_mock_questions(cls, concept, question_type, difficulty, target_error_type, count):
        """High-fidelity template generator producing varied questions with balanced A/B/C/D correct options."""
        templates = QUESTION_TEMPLATES.get(concept, QUESTION_TEMPLATES.get("Loops", []))
        
        # Filter by question_type if specified
        if question_type and question_type in VALID_TYPES:
            filtered = [t for t in templates if t["type"] == question_type]
            if filtered:
                templates = filtered

        results = []
        now = datetime.utcnow().isoformat() + "Z"
        letters = ["A", "B", "C", "D"]

        for i in range(count):
            base = templates[i % len(templates)]
            variant_suffix = f"_{random.randint(100, 999)}"
            qid_prefix = concept[:4].upper()
            q_id = f"{qid_prefix}_Q{uuid.uuid4().hex[:4].upper()}"
            target_letter = letters[i % len(letters)]

            raw_opts = [
                {"text": base.get("opt_a", "Option A"), "quality": base.get("q_a", "Correct")},
                {"text": base.get("opt_b", "Option B"), "quality": base.get("q_b", "Nearly Correct")},
                {"text": base.get("opt_c", "Option C"), "quality": base.get("q_c", "Wrong")},
                {"text": base.get("opt_d", "Option D"), "quality": base.get("q_d", "Clearly Wrong")},
            ]

            balanced = cls.rebalance_options_dict(raw_opts, target_correct_letter=target_letter)

            question_obj = {
                "id": f"GEN_{uuid.uuid4().hex[:8].upper()}",
                "question_id": q_id,
                "concept_name": concept,
                "learning_outcome": base.get("outcome", f"Demonstrate understanding of {concept}"),
                "question_type": base.get("type", question_type or "Basic Understanding"),
                "difficulty": difficulty or "Medium",
                "target_error_type": target_error_type if target_error_type != "UNKNOWN_ERROR" else base.get("error_type", "UNKNOWN_ERROR"),
                "equivalent_group_id": f"{base.get('group', 'GRP_' + concept[:3].upper())}{variant_suffix}",
                "question_text": base.get("text", f"Question about {concept}"),
                "code_snippet": base.get("code", ""),
                "option_a": balanced["option_a"],
                "option_b": balanced["option_b"],
                "option_c": balanced["option_c"],
                "option_d": balanced["option_d"],
                "correct_option": balanced["correct_option"],
                "option_a_quality": balanced["option_a_quality"],
                "option_b_quality": balanced["option_b_quality"],
                "option_c_quality": balanced["option_c_quality"],
                "option_d_quality": balanced["option_d_quality"],
                "explanation": base.get("explanation") or f"The correct answer is Option {balanced['correct_option']}.",
                "generated_by": "LLM_Generator (Teacher-Review Pipeline)",
                "status": "PENDING",
                "active": True,
                "deleted": False,
                "created_at": now,
                "updated_at": now,
            }
            results.append(question_obj)

        return results
