export const DEFAULT_PATH = [
    { name: "Variables & Data Types", mastery: 20, status: "started" },
    { name: "Operators", mastery: 15, status: "not_started" },
    { name: "Loops", mastery: 10, status: "not_started" },
    { name: "Arrays", mastery: 5, status: "not_started" },
    { name: "Methods", mastery: 0, status: "not_started" },
    { name: "Recursion", mastery: 0, status: "not_started" },
];

// ─────────────────────────────────────────────────────────────────────────
// QUIZ_BANK — Code-Snippet / Fill-in-the-Blank MCQs
// ─────────────────────────────────────────────────────────────────────────
// Every Variables/Loops/Arrays/Methods question below carries a
// `codeTemplate`: a real Java snippet with a single `{BLANK}` placeholder.
// `options` are just the possible completions for that blank (e.g. "i",
// "0", "i++") — NOT full alternate snippets. quizLab.js substitutes the
// student's chosen option into the template to build one complete,
// analyzable Java snippet, which is what gets sent to Component 2 (Error
// Pattern Detector) as live telemetry.
//
// Operators questions are left as standard text MCQs (not part of this
// rewrite's scope).
// ─────────────────────────────────────────────────────────────────────────

export const QUIZ_BANK = [
    // ── Variables ───────────────────────────────────────────────────────
    {
        id: 1,
        topic: "Variables",
        difficulty: "easy",
        question: "Fill in the blank to correctly declare an integer variable named age:",
        codeTemplate: "{BLANK} age = 25;",
        options: ["int", "Int", "integer", "void"],
        correctIndex: 0,
        explanation: "Java uses lowercase 'int' as the primitive integer type keyword."
    },
    {
        id: 2,
        topic: "Variables",
        difficulty: "easy",
        question: "Fill in the blank with a valid Java variable name:",
        codeTemplate: "int {BLANK} = 10;",
        options: ["_count", "2count", "my-var", "class"],
        correctIndex: 0,
        explanation: "_count is valid. Variable names cannot start with a digit, contain hyphens, or use reserved keywords like 'class'."
    },
    {
        id: 3,
        topic: "Variables",
        difficulty: "medium",
        question: "Fill in the blank to declare a variable that stores true or false:",
        codeTemplate: "{BLANK} isActive = true;",
        options: ["boolean", "bool", "Boolean", "bit"],
        correctIndex: 0,
        explanation: "Java's primitive boolean type stores true/false. 'Boolean' (uppercase) is the wrapper class, and 'bool' isn't a Java keyword."
    },
    {
        id: 4,
        topic: "Variables",
        difficulty: "medium",
        question: "Fill in the blank so the condition correctly checks if score equals 10 (rather than assigning it):",
        codeTemplate: "int score = 10; if (score {BLANK} 10) { System.out.println(\"Match\"); }",
        options: ["==", "=", "===", "equals"],
        correctIndex: 0,
        explanation: "== compares two values. A single = is assignment, not comparison, and isn't valid as a boolean condition here."
    },
    {
        id: 5,
        topic: "Variables",
        difficulty: "hard",
        question: "Fill in the blank so that b ends up 10 while a becomes 11 afterward:",
        codeTemplate: "int a = 10; int b = {BLANK}; System.out.println(a + \" \" + b);",
        options: ["a++", "++a", "a + 1", "a"],
        correctIndex: 0,
        explanation: "a++ is post-increment: b receives the current value of a (10) first, then a becomes 11."
    },

    // ── Operators (unchanged — outside this rewrite's scope) ────────────
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
        question: "Fill in the blank so this loop counts i from 0 up to 9:",
        codeTemplate: "for (int i = 0; {BLANK} < 10; i++) { System.out.println(i); }",
        options: ["i", "j", "10", "n"],
        correctIndex: 0,
        explanation: "The loop condition must test the same variable (i) that was declared and is being incremented."
    },
    {
        id: 12,
        topic: "Loops",
        difficulty: "easy",
        question: "Fill in the blank to create a loop that always runs its body at least once:",
        codeTemplate: "int i = 0; {BLANK} { System.out.println(\"run\"); } while (i < 0);",
        options: ["do", "while", "for", "if"],
        correctIndex: 0,
        explanation: "do-while checks its condition after executing the body, so it always runs at least once."
    },
    {
        id: 13,
        topic: "Loops",
        difficulty: "medium",
        question: "Fill in the blank so this loop terminates after printing 0 1 2:",
        codeTemplate: "int i = 0; while (i < 3) { System.out.print(i + \" \"); {BLANK}; }",
        options: ["i++", "i--", "i", "continue"],
        correctIndex: 0,
        explanation: "Without incrementing i, the loop condition (i < 3) never becomes false — i++ is required to make progress."
    },
    {
        id: 14,
        topic: "Loops",
        difficulty: "medium",
        question: "Fill in the blank so the loop stops immediately once i equals 3:",
        codeTemplate: "for (int i = 0; i < 5; i++) { if (i == 3) { {BLANK}; } System.out.print(i); }",
        options: ["break", "sleep", "wait", "pause"],
        correctIndex: 0,
        explanation: "break exits the nearest enclosing loop immediately."
    },
    {
        id: 15,
        topic: "Loops",
        difficulty: "hard",
        question: "Fill in the blank so the output is \"0 2 \" (i = 1 is skipped, not printed):",
        codeTemplate: "for (int i = 0; i < 3; i++) { if (i == 1) { {BLANK}; } System.out.print(i + \" \"); }",
        options: ["continue", "break", "return", "exit"],
        correctIndex: 0,
        explanation: "continue skips only the rest of the current iteration (the print), unlike break which would exit the loop entirely."
    },

    // ── Arrays ──────────────────────────────────────────────────────────
    {
        id: 16,
        topic: "Arrays",
        difficulty: "easy",
        question: "Fill in the blank to correctly declare an integer array:",
        codeTemplate: "int{BLANK} arr = new int[5];",
        options: ["[]", "()", "{}", "<>"],
        correctIndex: 0,
        explanation: "Square brackets after the type declare an array: int[] arr = new int[5];"
    },
    {
        id: 17,
        topic: "Arrays",
        difficulty: "easy",
        question: "Fill in the blank to correctly access the FIRST element of the array:",
        codeTemplate: "int[] arr = {10, 20, 30}; System.out.println(arr[{BLANK}]);",
        options: ["0", "1", "-1", "arr.length"],
        correctIndex: 0,
        explanation: "Java arrays are zero-indexed — the first element is always at index 0."
    },
    {
        id: 18,
        topic: "Arrays",
        difficulty: "medium",
        question: "Fill in the blank so this loop prints every element without going out of bounds:",
        codeTemplate: "int[] arr = new int[5]; for (int i = 0; i {BLANK} arr.length; i++) { System.out.println(arr[i]); }",
        options: ["<", "<=", ">", "=="],
        correctIndex: 0,
        explanation: "Valid indices run from 0 to arr.length - 1. Using <= would read one index past the end of the array."
    },
    {
        id: 19,
        topic: "Arrays",
        difficulty: "medium",
        question: "Fill in the blank to correctly get the number of elements the array can hold:",
        codeTemplate: "int[] arr = new int[7]; System.out.println(arr.{BLANK});",
        options: ["length", "length()", "size", "count"],
        correctIndex: 0,
        explanation: "Arrays expose length as a property (no parentheses) — unlike String's length() method."
    },
    {
        id: 20,
        topic: "Arrays",
        difficulty: "hard",
        question: "Fill in the blank so sum correctly accumulates the total of all array elements:",
        codeTemplate: "int[] nums = {1,2,3,4,5}; int sum = 0; for (int n : nums) { sum {BLANK} n; } System.out.println(sum);",
        options: ["+=", "=", "*=", "-="],
        correctIndex: 0,
        explanation: "+= adds each element into the running total. Using = would overwrite sum with just the last element instead of accumulating."
    },

    // ── Methods ─────────────────────────────────────────────────────────
    {
        id: 21,
        topic: "Methods",
        difficulty: "easy",
        question: "Fill in the blank to send a value back from this method:",
        codeTemplate: "static int getFive() { {BLANK} 5; }",
        options: ["return", "print", "output", "give"],
        correctIndex: 0,
        explanation: "The return keyword exits the method and passes a value back to the caller."
    },
    {
        id: 22,
        topic: "Methods",
        difficulty: "easy",
        question: "Fill in the blank so this method compiles correctly (it never returns a value):",
        codeTemplate: "static {BLANK} printHello() { System.out.println(\"Hello\"); }",
        options: ["void", "int", "return", "null"],
        correctIndex: 0,
        explanation: "void means the method does not return any value."
    },
    {
        id: 23,
        topic: "Methods",
        difficulty: "medium",
        question: "Fill in the blank so add(3, {BLANK}) prints 7:",
        codeTemplate: "static int add(int a, int b) { return a + b; } System.out.println(add(3, {BLANK}));",
        options: ["4", "four", "\"4\"", "IV"],
        correctIndex: 0,
        explanation: "add() expects two int arguments. 3 + 4 = 7 — the other options aren't valid int literals."
    },
    {
        id: 24,
        topic: "Methods",
        difficulty: "medium",
        question: "Fill in the blank so the recursion has a base case that stops it:",
        codeTemplate: "static int mystery(int n) { if (n == 1) { return {BLANK}; } return n + mystery(n - 1); }",
        options: ["1", "0", "n", "mystery(n)"],
        correctIndex: 0,
        explanation: "The base case must return a fixed value (1) rather than recursing further, or the recursion never stops."
    },
    {
        id: 25,
        topic: "Methods",
        difficulty: "hard",
        question: "Fill in the blank so each recursive call moves toward the base case (n == 1):",
        codeTemplate: "static int mystery(int n) { if (n == 1) { return 1; } return n + mystery({BLANK}); }",
        options: ["n - 1", "n", "n + 1", "1"],
        correctIndex: 0,
        explanation: "Each call must decrease n so it eventually reaches the base case. Calling mystery(n) again would recurse forever."
    },
];
