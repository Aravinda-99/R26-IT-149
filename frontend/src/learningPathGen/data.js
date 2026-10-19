export const DEFAULT_PATH = [
    { name: "Variables & Data Types", mastery: 20, status: "started" },
    { name: "Operators", mastery: 15, status: "not_started" },
    { name: "Loops", mastery: 10, status: "not_started" },
    { name: "Arrays", mastery: 5, status: "not_started" },
    { name: "Methods", mastery: 0, status: "not_started" },
    { name: "Recursion", mastery: 0, status: "not_started" },
];

// ─────────────────────────────────────────────────────────────────────────
// QUIZ_BANK — 30-question Placement Test (5 topics × 3 levels × 2)
// ─────────────────────────────────────────────────────────────────────────
// Every question now has a `level` field: "beginner" | "intermediate" |
// "advanced". The backend Placement Service (Model A, Rasch/IRT scoring)
// uses `level` as the item's expert-assigned difficulty:
//     beginner = -1.0, intermediate = 0.0, advanced = +1.0
//
// Balance (each topic): 2 beginner + 2 intermediate + 2 advanced = 6
// Total: 5 topics × 6 = 30 questions
//
// The old `difficulty` field (easy/medium/hard) is kept unchanged so that
// nothing else in the codebase that might read it breaks.
//   easy   → beginner
//   medium → intermediate
//   hard   → advanced
//
// Every Variables/Loops/Arrays/Methods question carries a `codeTemplate`:
// a real Java snippet with a single `{BLANK}` placeholder. quizLab.js
// substitutes the student's chosen option into the template to build one
// complete Java snippet, which is sent to Component 2 (Error Pattern
// Detector) as live telemetry. Operators questions are text MCQs.
// ─────────────────────────────────────────────────────────────────────────

export const LEVELS = ["beginner", "intermediate", "advanced"];

export const QUIZ_BANK = [
    // ── Variables ───────────────────────────────────────────────────────
    {
        id: 1,
        topic: "Variables",
        difficulty: "easy",
        level: "beginner",
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
        level: "beginner",
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
        level: "intermediate",
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
        level: "intermediate",
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
        level: "advanced",
        question: "Fill in the blank so that b ends up 10 while a becomes 11 afterward:",
        codeTemplate: "int a = 10; int b = {BLANK}; System.out.println(a + \" \" + b);",
        options: ["a++", "++a", "a + 1", "a"],
        correctIndex: 0,
        explanation: "a++ is post-increment: b receives the current value of a (10) first, then a becomes 11."
    },
    {
        id: 26,
        topic: "Variables",
        difficulty: "hard",
        level: "advanced",
        question: "Fill in the blank so the program prints 3.5 (not 3.0):",
        codeTemplate: "int a = 7; int b = 2; double result = {BLANK}; System.out.println(result);",
        options: ["(double) a / b", "(double) (a / b)", "a / b", "(int) a / b"],
        correctIndex: 0,
        explanation: "(double) a / b casts a to 7.0 first, so the division is done in double: 7.0 / 2 = 3.5. In (double) (a / b), the integer division 7 / 2 = 3 happens first, giving 3.0."
    },

    // ── Operators ───────────────────────────────────────────────────────
    {
        id: 6,
        topic: "Operators",
        difficulty: "easy",
        level: "beginner",
        question: "What does the % operator do in Java?",
        options: ["Calculates percentage", "Returns the remainder of division", "Divides two numbers", "Multiplies two numbers"],
        correctIndex: 1,
        explanation: "% is the modulus operator — it returns the remainder after division."
    },
    {
        id: 7,
        topic: "Operators",
        difficulty: "easy",
        level: "beginner",
        question: "What is the result of 10 == 10 in Java?",
        options: ["10", "0", "true", "false"],
        correctIndex: 2,
        explanation: "== is the equality operator and returns a boolean. 10 == 10 evaluates to true."
    },
    {
        id: 8,
        topic: "Operators",
        difficulty: "medium",
        level: "intermediate",
        question: "What is the output of System.out.println(7 % 3);?",
        options: ["2", "1", "3", "0"],
        correctIndex: 1,
        explanation: "7 divided by 3 is 2 remainder 1. So 7 % 3 = 1."
    },
    {
        id: 9,
        topic: "Operators",
        difficulty: "medium",
        level: "intermediate",
        question: "What does && mean in Java?",
        options: ["Bitwise AND", "String concatenation", "Logical AND — both conditions must be true", "Logical OR — at least one must be true"],
        correctIndex: 2,
        explanation: "&& is the logical AND operator. Both sides must be true for the overall expression to be true."
    },
    {
        id: 10,
        topic: "Operators",
        difficulty: "hard",
        level: "advanced",
        question: "What is the output of: int x = 5; System.out.println(x > 3 ? \"big\" : \"small\");",
        options: ["big", "small", "true", "Compile error"],
        correctIndex: 0,
        explanation: "This is the ternary operator. Since 5 > 3 is true, the result is \"big\"."
    },
    {
        id: 27,
        topic: "Operators",
        difficulty: "hard",
        level: "advanced",
        question: "What is the output of: int x = 5; int y = x++ + ++x; System.out.println(y);",
        options: ["12", "11", "10", "13"],
        correctIndex: 0,
        explanation: "x++ returns 5 and then x becomes 6. ++x makes x 7 and returns 7. So y = 5 + 7 = 12."
    },

    // ── Loops ───────────────────────────────────────────────────────────
    {
        id: 11,
        topic: "Loops",
        difficulty: "easy",
        level: "beginner",
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
        level: "beginner",
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
        level: "intermediate",
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
        level: "intermediate",
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
        level: "advanced",
        question: "Fill in the blank so the output is \"0 2 \" (i = 1 is skipped, not printed):",
        codeTemplate: "for (int i = 0; i < 3; i++) { if (i == 1) { {BLANK}; } System.out.print(i + \" \"); }",
        options: ["continue", "break", "return", "exit"],
        correctIndex: 0,
        explanation: "continue skips only the rest of the current iteration (the print), unlike break which would exit the loop entirely."
    },
    {
        id: 28,
        topic: "Loops",
        difficulty: "hard",
        level: "advanced",
        question: "Fill in the blank so the program prints 6:",
        codeTemplate: "int count = 0; for (int i = 0; i < 3; i++) { for (int j = {BLANK}; j < 3; j++) { count++; } } System.out.println(count);",
        options: ["i", "0", "i + 1", "3"],
        correctIndex: 0,
        explanation: "With j starting at i, the inner loop runs 3 + 2 + 1 = 6 times. Starting at 0 gives 9, i + 1 gives 3, and 3 gives 0."
    },

    // ── Arrays ──────────────────────────────────────────────────────────
    {
        id: 16,
        topic: "Arrays",
        difficulty: "easy",
        level: "beginner",
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
        level: "beginner",
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
        level: "intermediate",
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
        level: "intermediate",
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
        level: "advanced",
        question: "Fill in the blank so sum correctly accumulates the total of all array elements:",
        codeTemplate: "int[] nums = {1,2,3,4,5}; int sum = 0; for (int n : nums) { sum {BLANK} n; } System.out.println(sum);",
        options: ["+=", "=", "*=", "-="],
        correctIndex: 0,
        explanation: "+= adds each element into the running total. Using = would overwrite sum with just the last element instead of accumulating."
    },
    {
        id: 29,
        topic: "Arrays",
        difficulty: "hard",
        level: "advanced",
        question: "Fill in the blank so changing b does NOT change a (the program should print 1):",
        codeTemplate: "int[] a = {1, 2, 3}; int[] b = {BLANK}; b[0] = 99; System.out.println(a[0]);",
        options: ["a.clone()", "a", "(int[]) a", "b"],
        correctIndex: 0,
        explanation: "a.clone() creates a new array with the same values. Using a or (int[]) a copies only the reference, so both variables point to the same array and a[0] becomes 99."
    },

    // ── Methods ─────────────────────────────────────────────────────────
    {
        id: 21,
        topic: "Methods",
        difficulty: "easy",
        level: "beginner",
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
        level: "beginner",
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
        level: "intermediate",
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
        level: "intermediate",
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
        level: "advanced",
        question: "Fill in the blank so each recursive call moves toward the base case (n == 1):",
        codeTemplate: "static int mystery(int n) { if (n == 1) { return 1; } return n + mystery({BLANK}); }",
        options: ["n - 1", "n", "n + 1", "1"],
        correctIndex: 0,
        explanation: "Each call must decrease n so it eventually reaches the base case. Calling mystery(n) again would recurse forever."
    },
    {
        id: 30,
        topic: "Methods",
        difficulty: "hard",
        level: "advanced",
        question: "Fill in the blank so the program prints 50:",
        codeTemplate: "static int change(int x) { x = 50; return x; } int n = 10; {BLANK}; System.out.println(n);",
        options: ["n = change(n)", "change(n)", "change(n) = n", "int n = change(n)"],
        correctIndex: 0,
        explanation: "Java passes primitives by value, so change(n) alone only changes the method's copy and n stays 10. The returned value must be assigned back: n = change(n)."
    },
];

export const LEVEL_CHECK_BANK = [
    {
        id: 31,
        topic: "Variables",
        difficulty: "medium",
        level: "level_check",
        question: "A delivery application stores a package's weight as a decimal number. Which declaration correctly creates a variable that can later be updated?",
        codeTemplate: "public class DeliveryApp {\n    public static void main(String[] args) {\n        {BLANK}\n        packageWeight = 4.75;\n        System.out.println(packageWeight);\n    }\n}",
        options: [
            "double packageWeight = 2.5;",
            "final double packageWeight = 2.5;",
            "int packageWeight = 2.5;",
            "String packageWeight = 2.5;"
        ],
        correctIndex: 0,
        explanation: "A double stores decimal values and can be reassigned. A final variable cannot be reassigned after initialization."
    },
    {
        id: 32,
        topic: "Variables",
        difficulty: "medium",
        level: "level_check",
        question: "A weather application needs to display a temperature reading with its decimal precision preserved. Which declaration correctly stores the calculated reading?",
        codeTemplate: "public class WeatherStation {\n    public static void main(String[] args) {\n        double morningTemp = 23.6;\n        double eveningTemp = 19.2;\n        {BLANK}\n        System.out.println(averageTemp);\n    }\n}",
        options: [
            "double averageTemp = (morningTemp + eveningTemp) / 2;",
            "int averageTemp = (morningTemp + eveningTemp) / 2;",
            "boolean averageTemp = morningTemp > eveningTemp;",
            "char averageTemp = 'A';"
        ],
        correctIndex: 0,
        explanation: "The double type preserves the fractional part of the calculated average. The expression evaluates to a double because both temperature variables are doubles."
    },
    {
        id: 33,
        topic: "Operators",
        difficulty: "medium",
        level: "level_check",
        question: "A game awards 12 points for each completed mission and a fixed bonus of 8 points. A player completes 3 missions. Which expression correctly calculates the total points using Java's operator precedence?",
        options: [
            "12 * 3 + 8",
            "12 * (3 + 8)",
            "(12 + 8) * 3",
            "12 + 3 * 8"
        ],
        correctIndex: 0,
        explanation: "Multiplication has higher precedence than addition, so 12 * 3 is evaluated first. Adding the bonus gives 44 points."
    },
    {
        id: 34,
        topic: "Operators",
        difficulty: "medium",
        level: "level_check",
        question: "A digital library allows access when a member has a valid subscription OR possesses a temporary access pass. Which Java expression correctly represents this requirement?",
        options: [
            "hasSubscription || hasTemporaryPass",
            "hasSubscription && hasTemporaryPass",
            "hasSubscription & hasTemporaryPass",
            "!hasSubscription && !hasTemporaryPass"
        ],
        correctIndex: 0,
        explanation: "The || operator evaluates to true when at least one condition is true. It also short-circuits when the first condition is true."
    },
    {
        id: 35,
        topic: "Loops",
        difficulty: "medium",
        level: "level_check",
        question: "A fitness application displays a countdown from 5 to 1. Which loop condition correctly includes 1 but stops before displaying 0?",
        codeTemplate: "public class WorkoutTimer {\n    public static void main(String[] args) {\n        for (int secondsLeft = 5; {BLANK}; secondsLeft--) {\n            System.out.println(secondsLeft);\n        }\n    }\n}",
        options: [
            "secondsLeft >= 1",
            "secondsLeft > 1",
            "secondsLeft >= 0",
            "secondsLeft == 1"
        ],
        correctIndex: 0,
        explanation: "The condition secondsLeft >= 1 keeps the loop running from 5 through 1. Once secondsLeft becomes 0, the loop terminates."
    },
    {
        id: 36,
        topic: "Loops",
        difficulty: "medium",
        level: "level_check",
        question: "A warehouse system processes shipment batches numbered 2, 4, 6, and 8. Which update expression correctly visits only these batch numbers?",
        codeTemplate: "public class ShipmentProcessor {\n    public static void main(String[] args) {\n        for (int batchNumber = 2; batchNumber <= 8; {BLANK}) {\n            System.out.println(\"Processing batch \" + batchNumber);\n        }\n    }\n}",
        options: [
            "batchNumber += 2",
            "batchNumber *= 2",
            "batchNumber += 3",
            "batchNumber -= 2"
        ],
        correctIndex: 0,
        explanation: "Increasing batchNumber by 2 produces the sequence 2, 4, 6, and 8. The loop ends when the next value exceeds 8."
    },
    {
        id: 37,
        topic: "Arrays",
        difficulty: "medium",
        level: "level_check",
        question: "A cinema application stores seat availability as boolean values. Which expression correctly checks whether the third seat is available?",
        codeTemplate: "public class CinemaBooking {\n    public static void main(String[] args) {\n        boolean[] availableSeats = {true, false, true, false, true};\n        if ({BLANK}) {\n            System.out.println(\"Seat available\");\n        } else {\n            System.out.println(\"Seat occupied\");\n        }\n    }\n}",
        options: [
            "availableSeats[2]",
            "availableSeats[3]",
            "availableSeats[1]",
            "availableSeats[4]"
        ],
        correctIndex: 0,
        explanation: "Java arrays use zero-based indexing, so the third element is accessed using index 2. Its value is true, meaning the seat is available."
    },
    {
        id: 38,
        topic: "Arrays",
        difficulty: "medium",
        level: "level_check",
        question: "A sensor system stores five readings in an array. Which statement correctly prints every reading on a separate line using an enhanced for-loop?",
        codeTemplate: "int[] readings = {45, 32, 67, 12, 89};\nfor ({BLANK}) {\n    System.out.println(val);\n}",
        options: [
            "int val : readings",
            "int val = readings",
            "readings : int val",
            "int val; readings"
        ],
        correctIndex: 0,
        explanation: "The enhanced for-loop syntax is for (type variable : array). Each iteration assigns the next element to val automatically."
    },
    {
        id: 39,
        topic: "Methods",
        difficulty: "medium",
        level: "level_check",
        question: "A shopping application needs a reusable method that calculates the discounted price of an item. Which method declaration correctly accepts two double arguments and produces a double result?",
        codeTemplate: "public class ShoppingCart {\n    {BLANK}\n        double discountAmount = price * discountRate;\n        return price - discountAmount;\n    }\n\n    public static void main(String[] args) {\n        double finalPrice = calculateDiscount(500.0, 0.10);\n        System.out.println(finalPrice);\n    }\n}",
        options: [
            "public static double calculateDiscount(double price, double discountRate) {",
            "public static int calculateDiscount(double price, double discountRate) {",
            "public static double calculateDiscount(int price, int discountRate) {",
            "public double calculateDiscount(double price, double discountRate) {"
        ],
        correctIndex: 0,
        explanation: "The method must be static to be called directly from main and must accept two double parameters. Its double result preserves decimal precision."
    },
    {
        id: 40,
        topic: "Methods",
        difficulty: "medium",
        level: "level_check",
        question: "A ticketing system has two methods named formatTicket, one accepting a String and another accepting an int. Which method call selects the version that accepts a String?",
        codeTemplate: "public class TicketSystem {\n    public static String formatTicket(String ticketCode) {\n        return \"Ticket: \" + ticketCode;\n    }\n\n    public static String formatTicket(int ticketNumber) {\n        return \"Number: \" + ticketNumber;\n    }\n\n    public static void main(String[] args) {\n        String ticketLabel = {BLANK};\n        System.out.println(ticketLabel);\n    }\n}",
        options: [
            "formatTicket(\"VIP-202\")",
            "formatTicket(202)",
            "formatTicket(Integer.valueOf(202))",
            "formatTicket((int) 202.5)"
        ],
        correctIndex: 0,
        explanation: "Java selects overloaded methods based on the argument types. Passing a String selects formatTicket(String), while the other options select formatTicket(int)."
    }
];
