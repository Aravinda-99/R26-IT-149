"""
MCQ Question Bank — Stage 2 Diagnostic Post-Test
=================================================
Three MCQ types per concept for validating schema mastery:
  1. Output Prediction  — "What does this code print?"
  2. Code Tracing       — "Step through this code, what is the value of x?"
  3. Conceptual Reasoning — "Why does this loop run 5 times?"

Each question has:
  - id:       unique identifier
  - concept:  the programming concept being tested
  - type:     output_prediction | code_tracing | conceptual_reasoning
  - question: the question text
  - code:     optional code snippet
  - options:  list of 4 answer choices (A, B, C, D)
  - answer:   the correct option key
  - explanation: why the answer is correct
"""

mcq_questions = {
    # =========================================
    # VARIABLES
    # =========================================
    "variables": [
        {
            "id": "VAR_OP_01",
            "concept": "variables",
            "type": "output_prediction",
            "question": "What does this code print?",
            "code": "x = 5\ny = x\nx = 10\nprint(y)",
            "options": {
                "A": "5",
                "B": "10",
                "C": "15",
                "D": "Error",
            },
            "answer": "A",
            "explanation": "y is assigned the value of x (5) at the time of assignment. Changing x later does not affect y.",
        },
        {
            "id": "VAR_CT_01",
            "concept": "variables",
            "type": "code_tracing",
            "question": "After running this code, what is the value of result?",
            "code": "a = 3\nb = 7\nresult = a + b\na = 0",
            "options": {
                "A": "0",
                "B": "3",
                "C": "7",
                "D": "10",
            },
            "answer": "D",
            "explanation": "result = a + b evaluates to 3 + 7 = 10. Changing a afterwards does not change result.",
        },
        {
            "id": "VAR_CR_01",
            "concept": "variables",
            "type": "conceptual_reasoning",
            "question": "Why can you assign a string to a variable that previously held an integer in Python?",
            "code": None,
            "options": {
                "A": "Python automatically converts the string to an integer",
                "B": "Python is dynamically typed — variables can hold any type",
                "C": "Python creates a new variable with the same name",
                "D": "This causes a runtime error",
            },
            "answer": "B",
            "explanation": "Python is dynamically typed, meaning variable types are determined at runtime and can change.",
        },
    ],
    # =========================================
    # CONDITIONALS
    # =========================================
    "conditionals": [
        {
            "id": "COND_OP_01",
            "concept": "conditionals",
            "type": "output_prediction",
            "question": "What does this code print?",
            "code": "x = 15\nif x > 20:\n    print('A')\nelif x > 10:\n    print('B')\nelse:\n    print('C')",
            "options": {
                "A": "A",
                "B": "B",
                "C": "C",
                "D": "B and C",
            },
            "answer": "B",
            "explanation": "x is 15. It is not greater than 20, so the if block is skipped. It is greater than 10, so 'B' is printed.",
        },
        {
            "id": "COND_CT_01",
            "concept": "conditionals",
            "type": "code_tracing",
            "question": "After running this code, what is the value of grade?",
            "code": "score = 72\nif score >= 90:\n    grade = 'A'\nelif score >= 80:\n    grade = 'B'\nelif score >= 70:\n    grade = 'C'\nelse:\n    grade = 'F'",
            "options": {
                "A": "A",
                "B": "B",
                "C": "C",
                "D": "F",
            },
            "answer": "C",
            "explanation": "score is 72. It is not >= 90, not >= 80, but it is >= 70, so grade = 'C'.",
        },
        {
            "id": "COND_CR_01",
            "concept": "conditionals",
            "type": "conceptual_reasoning",
            "question": "Why does Python execute only the first matching branch in an if-elif-else chain?",
            "code": None,
            "options": {
                "A": "Python evaluates all conditions and picks the best match",
                "B": "elif is just another name for a separate if statement",
                "C": "Once a condition is True, the remaining branches are skipped",
                "D": "Python always executes the else block as a fallback",
            },
            "answer": "C",
            "explanation": "In an if-elif-else chain, Python stops evaluating as soon as it finds the first True condition.",
        },
    ],
    # =========================================
    # LOOPS
    # =========================================
    "loops": [
        {
            "id": "LOOP_OP_01",
            "concept": "loops",
            "type": "output_prediction",
            "question": "What does this code print?",
            "code": "total = 0\nfor i in range(1, 4):\n    total += i\nprint(total)",
            "options": {
                "A": "3",
                "B": "6",
                "C": "10",
                "D": "4",
            },
            "answer": "B",
            "explanation": "range(1, 4) produces 1, 2, 3. The sum is 1 + 2 + 3 = 6.",
        },
        {
            "id": "LOOP_CT_01",
            "concept": "loops",
            "type": "code_tracing",
            "question": "How many times does this loop execute?",
            "code": "count = 0\nwhile count < 5:\n    count += 1",
            "options": {
                "A": "4",
                "B": "5",
                "C": "6",
                "D": "Infinite loop",
            },
            "answer": "B",
            "explanation": "count starts at 0 and increments by 1 each iteration. It runs for count = 0, 1, 2, 3, 4 → 5 iterations.",
        },
        {
            "id": "LOOP_CR_01",
            "concept": "loops",
            "type": "conceptual_reasoning",
            "question": "Why does range(5) produce values 0 through 4 instead of 1 through 5?",
            "code": None,
            "options": {
                "A": "Python counts from 0 by default (zero-indexed)",
                "B": "range() always skips the last number due to a bug",
                "C": "range(5) means 'repeat 5 times starting from 1'",
                "D": "The end value is always included in the range",
            },
            "answer": "A",
            "explanation": "Python uses zero-based indexing. range(n) produces n values starting from 0: 0, 1, ..., n-1.",
        },
    ],
    # =========================================
    # ARRAYS (LISTS)
    # =========================================
    "arrays": [
        {
            "id": "ARR_OP_01",
            "concept": "arrays",
            "type": "output_prediction",
            "question": "What does this code print?",
            "code": "nums = [10, 20, 30, 40]\nprint(nums[2])",
            "options": {
                "A": "10",
                "B": "20",
                "C": "30",
                "D": "40",
            },
            "answer": "C",
            "explanation": "List indexing is zero-based. nums[0]=10, nums[1]=20, nums[2]=30.",
        },
        {
            "id": "ARR_CT_01",
            "concept": "arrays",
            "type": "code_tracing",
            "question": "After running this code, what is the value of nums?",
            "code": "nums = [1, 2, 3]\nnums.append(4)\nnums[0] = 10",
            "options": {
                "A": "[1, 2, 3, 4]",
                "B": "[10, 2, 3, 4]",
                "C": "[10, 2, 3]",
                "D": "[1, 2, 3, 10]",
            },
            "answer": "B",
            "explanation": "append(4) adds 4 to the end → [1,2,3,4]. Then nums[0]=10 changes the first element → [10,2,3,4].",
        },
        {
            "id": "ARR_CR_01",
            "concept": "arrays",
            "type": "conceptual_reasoning",
            "question": "Why does accessing nums[5] on a list of 3 elements raise an IndexError?",
            "code": None,
            "options": {
                "A": "Python returns None for invalid indices",
                "B": "Lists automatically grow to accommodate any index",
                "C": "Index 5 is out of bounds — valid indices are 0, 1, 2",
                "D": "Python converts out-of-range indices to the last element",
            },
            "answer": "C",
            "explanation": "A list of 3 elements has valid indices 0, 1, 2. Index 5 exceeds the list size, causing an IndexError.",
        },
    ],
    # =========================================
    # METHODS (FUNCTIONS)
    # =========================================
    "methods": [
        {
            "id": "METH_OP_01",
            "concept": "methods",
            "type": "output_prediction",
            "question": "What does this code print?",
            "code": "def add(a, b):\n    return a + b\n\nresult = add(3, 4)\nprint(result)",
            "options": {
                "A": "3",
                "B": "4",
                "C": "7",
                "D": "None",
            },
            "answer": "C",
            "explanation": "add(3, 4) returns 3 + 4 = 7. This value is stored in result and printed.",
        },
        {
            "id": "METH_CT_01",
            "concept": "methods",
            "type": "code_tracing",
            "question": "What is the value of x after running this code?",
            "code": "def double(n):\n    n = n * 2\n    return n\n\nx = 5\ny = double(x)",
            "options": {
                "A": "5",
                "B": "10",
                "C": "25",
                "D": "None",
            },
            "answer": "A",
            "explanation": "x is passed by value. The function modifies its local copy of n, but x in the outer scope remains 5.",
        },
        {
            "id": "METH_CR_01",
            "concept": "methods",
            "type": "conceptual_reasoning",
            "question": "Why does a function without a return statement return None in Python?",
            "code": None,
            "options": {
                "A": "Python raises an error if no return is specified",
                "B": "Functions without return automatically return 0",
                "C": "None is Python's default return value for functions",
                "D": "The function does not actually execute without a return",
            },
            "answer": "C",
            "explanation": "In Python, if a function does not explicitly return a value, it implicitly returns None.",
        },
    ],
}
