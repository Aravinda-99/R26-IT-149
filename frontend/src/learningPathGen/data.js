export const DEFAULT_PATH = [
    { name: "Variables & Data Types", mastery: 20, status: "started" },
    { name: "Operators", mastery: 15, status: "not_started" },
    { name: "Loops", mastery: 10, status: "not_started" },
    { name: "Arrays", mastery: 5, status: "not_started" },
    { name: "Methods", mastery: 0, status: "not_started" },
    { name: "Recursion", mastery: 0, status: "not_started" },
];

// ─────────────────────────────────────────────────────────────────────────
// QUIZ_BANK
// ─────────────────────────────────────────────────────────────────────────
// Questions marked "Code-Snippet MCQ" below use real Java statements as
// their `options` — every WRONG option is itself a buggy snippet that
// represents a common beginner mistake, so it can be sent as-is to
// Component 2 (Error Pattern Detector) for ML analysis + XAI feedback.
//
// Questions marked "Fill-in-the-blank MCQ" carry an extra `codeTemplate`
// field with an {ANSWER} placeholder. The chosen option is a short
// statement (not a full snippet); quizLab.js substitutes it into the
// template to build a complete, analyzable Java method before sending it
// to Component 2 — this also guarantees the snippet passes
// ErrorService.validate_java_submission (it needs a recognizable Java
// structure, e.g. a `static ... method(...) { }` declaration).
//
// Wrong options are deliberately written to trigger these Component 2
// reason_group categories (see backend/services/error_service.py):
//   LOOP_BOUNDARY_ISSUE, LOOP_UPDATE_ISSUE, LOOP_CONTROL_FLOW_ISSUE,
//   ARRAY_BOUNDARY_INDEX_ISSUE, VARIABLE_ASSIGNMENT_ISSUE,
//   VARIABLE_CALCULATION_ISSUE, METHOD_RETURN_ISSUE
// ─────────────────────────────────────────────────────────────────────────

export const QUIZ_BANK = [
    // ── Variables ───────────────────────────────────────────────────────
    {
        id: 1,
        topic: "Variables",
        difficulty: "easy",
        // Fill-in-the-blank MCQ — targets VARIABLE_ASSIGNMENT_ISSUE
        question: "A method receives a parameter named total and should add 5 to it. Which line correctly updates the value?",
        codeTemplate: "static void updateTotal(int total) {\n    {ANSWER}\n    System.out.println(total);\n}",
        options: [
            "total = total + 5;",
            "total = total;",
            "int total = 5;",
            "total == total + 5;"
        ],
        correctIndex: 0,
        explanation: "Option B reassigns total to itself (self-assignment) — it has no effect. Option C re-declares the parameter. Option D uses == (comparison), not = (assignment)."
    },
    {
        id: 2,
        topic: "Variables",
        difficulty: "medium",
        // Fill-in-the-blank MCQ — targets VARIABLE_CALCULATION_ISSUE
        question: "A checkout method should subtract a discount from the total price. Which line does this correctly?",
        codeTemplate: "static double applyDiscount(double total, double discount) {\n    {ANSWER}\n    return total;\n}",
        options: [
            "total = total - discount;",
            "total = total + discount;",
            "total = discount + total;",
            "total = total * discount;"
        ],
        correctIndex: 0,
        explanation: "A discount should be subtracted from the total. Adding it (options B and C) increases the price instead of reducing it."
    },
    {
        id: 3,
        topic: "Variables",
        difficulty: "hard",
        // Code-Snippet MCQ — reinforces VARIABLE_ASSIGNMENT_ISSUE
        question: "Which line correctly declares and initializes a variable to store a student's average score?",
        options: [
            "double average = 0;",
            "double average = average;",
            "int average = 0;",
            "double average;"
        ],
        correctIndex: 0,
        explanation: "Option B references average before it has a value (self-assignment pattern). Option C uses int, which loses decimal precision for an average. Option D is declared but never initialized."
    },
    {
        id: 4,
        topic: "Variables",
        difficulty: "medium",
        question: "What is the output of: double x = 5 / 2; System.out.println(x);",
        options: ["2.5", "2.0", "2", "Compile error"],
        correctIndex: 1,
        explanation: "5/2 performs integer division first (result: 2), which is then stored as a double → 2.0."
    },
    {
        id: 5,
        topic: "Variables",
        difficulty: "hard",
        question: "What is the output of: int a = 10; int b = a++; System.out.println(a + \" \" + b);",
        options: ["10 10", "11 10", "10 11", "11 11"],
        correctIndex: 1,
        explanation: "a++ is post-increment: b gets the current value of a (10), then a becomes 11. Output: 11 10."
    },

    // ── Operators (unchanged) ───────────────────────────────────────────
    {
        id: 6,
        topic: "Operators",
        difficulty: "easy",
        question: "What does the % operator do in Java?",
        options: ["Calculates percentage", "Returns the remainder of division", "Divides two numbers", "Multiplies two numbers"],
        correctIndex: 1,
        explanation: "% is the modulus operator — it returns the remainder after division."
    },
    {
        id: 7,
        topic: "Operators",
        difficulty: "easy",
        question: "What is the result of 10 == 10 in Java?",
        options: ["10", "0", "true", "false"],
        correctIndex: 2,
        explanation: "== is the equality operator and returns a boolean. 10 == 10 evaluates to true."
    },
    {
        id: 8,
        topic: "Operators",
        difficulty: "medium",
        question: "What is the output of System.out.println(7 % 3);?",
        options: ["2", "1", "3", "0"],
        correctIndex: 1,
        explanation: "7 divided by 3 is 2 remainder 1. So 7 % 3 = 1."
    },
    {
        id: 9,
        topic: "Operators",
        difficulty: "medium",
        question: "What does && mean in Java?",
        options: ["Bitwise AND", "String concatenation", "Logical AND — both conditions must be true", "Logical OR — at least one must be true"],
        correctIndex: 2,
        explanation: "&& is the logical AND operator. Both sides must be true for the overall expression to be true."
    },
    {
        id: 10,
        topic: "Operators",
        difficulty: "hard",
        question: "What is the output of: int x = 5; System.out.println(x > 3 ? \"big\" : \"small\");",
        options: ["big", "small", "true", "Compile error"],
        correctIndex: 0,
        explanation: "This is the ternary operator. Since 5 > 3 is true, the result is \"big\"."
    },

    // ── Loops ───────────────────────────────────────────────────────────
    {
        id: 11,
        topic: "Loops",
        difficulty: "easy",
        // Code-Snippet MCQ — targets LOOP_BOUNDARY_ISSUE
        question: "Which loop correctly prints every index of an array named arr (length 5) without going out of bounds?",
        options: [
            "for (int i = 0; i < arr.length; i++) { System.out.println(arr[i]); }",
            "for (int i = 0; i <= arr.length; i++) { System.out.println(arr[i]); }",
            "for (int i = 1; i < arr.length; i++) { System.out.println(arr[i]); }",
            "for (int i = arr.length; i > 0; i--) { System.out.println(arr[i]); }"
        ],
        correctIndex: 0,
        explanation: "Valid indices run from 0 to arr.length - 1. Using <= (B) causes an off-by-one out-of-bounds access. Starting at 1 (C) skips index 0. Counting down from arr.length (D) accesses arr.length first, which is invalid."
    },
    {
        id: 12,
        topic: "Loops",
        difficulty: "medium",
        // Code-Snippet MCQ — targets LOOP_UPDATE_ISSUE
        question: "Which loop correctly counts from 0 to 4, printing each value?",
        options: [
            "for (int i = 0; i < 5; i++) { System.out.println(i); }",
            "for (int i = 0; i < 5; ) { System.out.println(i); }",
            "int i = 0; while (i < 5) { System.out.println(i); }",
            "for (int i = 0; i < 5; i--) { System.out.println(i); }"
        ],
        correctIndex: 0,
        explanation: "Option B has an empty update clause, so i never changes — infinite loop. Option C's while loop never increments i inside the body — also infinite. Option D decrements instead of incrementing."
    },
    {
        id: 13,
        topic: "Loops",
        difficulty: "hard",
        // Code-Snippet MCQ — targets LOOP_CONTROL_FLOW_ISSUE
        question: "Which loop correctly searches for the number 7 in an array named arr and stops as soon as it's found?",
        options: [
            "for (int i = 0; i < arr.length; i++) { if (arr[i] == 7) { break; } }",
            "int i = 0; while (true) { if (arr[i] == 7) { System.out.println(\"found\"); } i++; }",
            "for (int i = 0; i <= arr.length; i++) { if (arr[i] == 7) { break; } }",
            "for (int i = 0; i < arr.length; i++) { if (arr[i] == 7) { continue; } }"
        ],
        correctIndex: 0,
        explanation: "Option B is a while(true) loop with no break — it never stops, even after finding the value. Option C has an off-by-one boundary. Option D uses continue instead of break, so the loop keeps running."
    },
    {
        id: 14,
        topic: "Loops",
        difficulty: "medium",
        question: "What does the break statement do inside a loop?",
        options: ["Skips the current iteration", "Restarts the loop from the beginning", "Exits the loop immediately", "Pauses the loop"],
        correctIndex: 2,
        explanation: "break terminates the nearest enclosing loop immediately and continues after it."
    },
    {
        id: 15,
        topic: "Loops",
        difficulty: "hard",
        question: "What is the output of: for (int i = 0; i < 3; i++) { if (i == 1) continue; System.out.print(i + \" \"); }",
        options: ["0 1 2", "0 2", "1 2", "0 1"],
        correctIndex: 1,
        explanation: "continue skips the rest of the loop body for i=1. So only 0 and 2 are printed. Output: 0 2."
    },

    // ── Arrays ──────────────────────────────────────────────────────────
    {
        id: 16,
        topic: "Arrays",
        difficulty: "easy",
        // Code-Snippet MCQ — targets ARRAY_BOUNDARY_INDEX_ISSUE
        question: "Which line correctly accesses the LAST element of a 5-element integer array named arr?",
        options: [
            "System.out.println(arr[arr.length - 1]);",
            "System.out.println(arr[arr.length]);",
            "System.out.println(arr[5]);",
            "System.out.println(arr[arr.length + 1]);"
        ],
        correctIndex: 0,
        explanation: "arr.length (5) is one past the last valid index. The last element is always at arr.length - 1. Options B, C, and D all read past the end of the array."
    },
    {
        id: 17,
        topic: "Arrays",
        difficulty: "easy",
        question: "How do you correctly declare an integer array in Java?",
        options: ["int arr = new int[];", "int[] arr = new int[5];", "array int arr[5];", "int arr[5];"],
        correctIndex: 1,
        explanation: "The correct syntax is int[] arr = new int[5]; — type with brackets, then new keyword with size."
    },
    {
        id: 18,
        topic: "Arrays",
        difficulty: "medium",
        // Code-Snippet MCQ — reinforces ARRAY_BOUNDARY_INDEX_ISSUE + LOOP_UPDATE_ISSUE
        question: "Which loop correctly fills every element of a 5-element integer array named arr with its own index value?",
        options: [
            "for (int i = 0; i < arr.length; i++) { arr[i] = i; }",
            "for (int i = 0; i <= arr.length; i++) { arr[i] = i; }",
            "for (int i = 0; i < arr.length; ) { arr[i] = i; }",
            "for (int i = 0; i < arr.length; i++) { arr[i] = arr[i]; }"
        ],
        correctIndex: 0,
        explanation: "Option B writes to arr[arr.length], which is out of bounds. Option C never updates i — infinite loop. Option D assigns each slot to itself instead of to i, so nothing actually changes."
    },
    {
        id: 19,
        topic: "Arrays",
        difficulty: "medium",
        question: "What does arr.length return for int[] arr = new int[7];?",
        options: ["6", "7", "8", "0"],
        correctIndex: 1,
        explanation: "arr.length returns the total number of elements the array was created to hold, which is 7."
    },
    {
        id: 20,
        topic: "Arrays",
        difficulty: "hard",
        question: "What is the output of: int[] nums = {1,2,3,4,5}; int sum = 0; for (int n : nums) sum += n; System.out.println(sum);",
        options: ["12", "15", "14", "10"],
        correctIndex: 1,
        explanation: "The enhanced for loop sums all elements: 1+2+3+4+5 = 15."
    },

    // ── Methods ─────────────────────────────────────────────────────────
    {
        id: 21,
        topic: "Methods",
        difficulty: "easy",
        // Code-Snippet MCQ — targets METHOD_RETURN_ISSUE (void returning a value)
        question: "Which method correctly prints the sum of two numbers without returning a value?",
        options: [
            "static void printSum(int a, int b) { System.out.println(a + b); }",
            "static void printSum(int a, int b) { return a + b; }",
            "static int printSum(int a, int b) { System.out.println(a + b); }",
            "static void printSum(int a, int b) { System.out.println(a); }"
        ],
        correctIndex: 0,
        explanation: "Option B tries to return a value from a void method — void methods cannot return anything. Option C declares int but never returns. Option D ignores parameter b entirely."
    },
    {
        id: 22,
        topic: "Methods",
        difficulty: "medium",
        // Code-Snippet MCQ — targets METHOD_RETURN_ISSUE (missing return)
        question: "Which method correctly returns the larger of two integers?",
        options: [
            "static int max(int a, int b) { if (a > b) { return a; } return b; }",
            "static int max(int a, int b) { if (a > b) { System.out.println(a); } }",
            "static void max(int a, int b) { if (a > b) { return a; } return b; }",
            "static int max(int a, int b) { if (a < b) { return a; } return b; }"
        ],
        correctIndex: 0,
        explanation: "Option B is declared int but has no return statement at all. Option C is void but tries to return values. Option D uses the wrong comparison (<), so it returns the smaller value."
    },
    {
        id: 23,
        topic: "Methods",
        difficulty: "hard",
        // Code-Snippet MCQ — method call correctness
        question: "A method named add takes two int parameters and returns their sum. Which call correctly uses it?",
        options: [
            "int result = add(3, 4);",
            "int result = add(3, 4, 5);",
            "int result = add(3);",
            "String result = add(3, 4);"
        ],
        correctIndex: 0,
        explanation: "add() takes exactly two int parameters and returns an int. Options B and C pass the wrong number of arguments. Option D tries to store an int result in a String variable."
    },
    {
        id: 24,
        topic: "Methods",
        difficulty: "medium",
        question: "What is method overloading in Java?",
        options: ["Calling a method more than once", "A method calling itself", "Two methods with the same name but different parameters", "A method inside another method"],
        correctIndex: 2,
        explanation: "Overloading allows multiple methods with the same name as long as their parameter lists differ."
    },
    {
        id: 25,
        topic: "Methods",
        difficulty: "hard",
        question: "What is the output of: static int mystery(int n) { if (n == 1) return 1; return n + mystery(n - 1); } System.out.println(mystery(4));",
        options: ["4", "8", "10", "24"],
        correctIndex: 2,
        explanation: "This is recursion: mystery(4) = 4 + mystery(3) = 4 + 3 + mystery(2) = 4+3+2+mystery(1) = 4+3+2+1 = 10."
    },
];
