export const DEFAULT_PATH = [
    { name: "Variables & Data Types", mastery: 20, status: "started" },
    { name: "Operators", mastery: 15, status: "not_started" },
    { name: "Loops", mastery: 10, status: "not_started" },
    { name: "Arrays", mastery: 5, status: "not_started" },
    { name: "Methods", mastery: 0, status: "not_started" },
    { name: "Recursion", mastery: 0, status: "not_started" },
];

export const QUIZ_BANK = [
    {
        id: 1,
        topic: "Variables",
        difficulty: "easy",
        question: "What is the correct way to declare an integer variable in Java?",
        options: ["int x = 5;", "integer x = 5;", "Int x = 5;", "x = 5;"],
        correctIndex: 0,
        explanation: "Java uses lowercase 'int' as the primitive integer type keyword."
    },
    {
        id: 2,
        topic: "Variables",
        difficulty: "easy",
        question: "Which of these is a valid variable name in Java?",
        options: ["2count", "my-var", "_total", "class"],
        correctIndex: 2,
        explanation: "_total is valid. Variable names cannot start with a digit, contain hyphens, or use reserved keywords like 'class'."
    },
    {
        id: 3,
        topic: "Variables",
        difficulty: "medium",
        question: "What is the output of: double x = 5 / 2; System.out.println(x);",
        options: ["2.5", "2.0", "2", "Compile error"],
        correctIndex: 1,
        explanation: "5/2 performs integer division first (result: 2), which is then stored as a double → 2.0."
    },
    {
        id: 4,
        topic: "Variables",
        difficulty: "medium",
        question: "Which data type is used to store true or false in Java?",
        options: ["bit", "bool", "boolean", "Boolean only"],
        correctIndex: 2,
        explanation: "Java's primitive boolean type stores true/false. 'Boolean' (uppercase) is the wrapper class."
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
    {
        id: 11,
        topic: "Loops",
        difficulty: "easy",
        question: "How many times does this loop run? for (int i = 0; i < 5; i++) { }",
        options: ["4", "5", "6", "Infinite"],
        correctIndex: 1,
        explanation: "i goes from 0 to 4 (while i < 5), so the loop body executes 5 times."
    },
    {
        id: 12,
        topic: "Loops",
        difficulty: "easy",
        question: "Which loop is guaranteed to execute at least once?",
        options: ["for loop", "while loop", "do-while loop", "Enhanced for loop"],
        correctIndex: 2,
        explanation: "do-while checks the condition after executing the body, so it always runs at least once."
    },
    {
        id: 13,
        topic: "Loops",
        difficulty: "medium",
        question: "What is the output of: int i = 0; while (i < 3) { System.out.print(i + \" \"); i++; }",
        options: ["1 2 3", "0 1 2 3", "0 1 2", "1 2"],
        correctIndex: 2,
        explanation: "i starts at 0 and prints before incrementing. Loop stops when i reaches 3 (not printed). Output: 0 1 2."
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
    {
        id: 16,
        topic: "Arrays",
        difficulty: "easy",
        question: "How do you correctly declare an integer array in Java?",
        options: ["int arr = new int[];", "int[] arr = new int[5];", "array int arr[5];", "int arr[5];"],
        correctIndex: 1,
        explanation: "The correct syntax is int[] arr = new int[5]; — type with brackets, then new keyword with size."
    },
    {
        id: 17,
        topic: "Arrays",
        difficulty: "easy",
        question: "What is the index of the first element in a Java array?",
        options: ["1", "-1", "0", "Depends on array size"],
        correctIndex: 2,
        explanation: "Java arrays are zero-indexed. The first element is always at index 0."
    },
    {
        id: 18,
        topic: "Arrays",
        difficulty: "medium",
        question: "What is the output of: int[] arr = {10, 20, 30}; System.out.println(arr[1]);",
        options: ["10", "20", "30", "0"],
        correctIndex: 1,
        explanation: "arr[1] accesses the second element (index 1), which is 20."
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
    {
        id: 21,
        topic: "Methods",
        difficulty: "easy",
        question: "What keyword sends a value back from a method in Java?",
        options: ["send", "output", "return", "give"],
        correctIndex: 2,
        explanation: "The return keyword exits the method and optionally passes a value back to the caller."
    },
    {
        id: 22,
        topic: "Methods",
        difficulty: "easy",
        question: "What does void mean in a Java method declaration?",
        options: ["The method takes no parameters", "The method returns nothing", "The method is private", "The method is static"],
        correctIndex: 1,
        explanation: "void means the method does not return any value."
    },
    {
        id: 23,
        topic: "Methods",
        difficulty: "medium",
        question: "What is the output of: static int add(int a, int b) { return a + b; } System.out.println(add(3, 4));",
        options: ["34", "7", "12", "Compile error"],
        correctIndex: 1,
        explanation: "add(3, 4) returns 3 + 4 = 7."
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