import json

concepts = {
    "variables": [
        # Output Prediction
        {"q": "What does this Java code print?\nint x = 10;\nx = x + 5;\nSystem.out.println(x);", "type": "output_prediction", "opts": {"A":"10", "B":"15", "C":"20", "D":"Error"}, "ans": "B", "exp": "x starts at 10, then 5 is added."},
        {"q": "What does this Java code print?\nString name = \"Java\";\nSystem.out.println(name + 8);", "type": "output_prediction", "opts": {"A":"Java8", "B":"Error", "C":"8", "D":"Java"}, "ans": "A", "exp": "String concatenation converts the number to string."},
        {"q": "What does this Java code print?\nboolean flag = true;\nSystem.out.println(!flag);", "type": "output_prediction", "opts": {"A":"true", "B":"false", "C":"1", "D":"0"}, "ans": "B", "exp": "The logical NOT operator (!) inverts the boolean value."},
        # Code Tracing
        {"q": "Step through this Java code, what is 'b'?\nint a = 5;\nint b = a;\na = 10;", "type": "code_tracing", "opts": {"A":"0", "B":"5", "C":"10", "D":"Error"}, "ans": "B", "exp": "Primitive types are copied by value in Java."},
        {"q": "Trace the variable values:\nint x = 2;\nint y = 3;\nx = y;\ny = 4;", "type": "code_tracing", "opts": {"A":"x=2, y=3", "B":"x=3, y=4", "C":"x=4, y=4", "D":"x=3, y=3"}, "ans": "B", "exp": "x gets y's value (3), then y is changed to 4."},
        {"q": "What is the final value of result?\ndouble d = 4.5;\nint result = (int) d;", "type": "code_tracing", "opts": {"A":"4", "B":"5", "C":"4.5", "D":"Error"}, "ans": "A", "exp": "Casting double to int truncates the decimal part."},
        # Conceptual Reasoning
        {"q": "Why does 'int num = 5.5;' cause a compilation error?", "type": "conceptual_reasoning", "opts": {"A":"Must use float", "B":"Lossy conversion without cast", "C":"Cannot initialize inline", "D":"Keyword reserved"}, "ans": "B", "exp": "Java prevents implicit conversion from double to int due to precision loss."},
        {"q": "What is variable scope in Java?", "type": "conceptual_reasoning", "opts": {"A":"The memory size of a variable", "B":"The block of code where the variable is accessible", "C":"The type of data it holds", "D":"Its accessibility across classes"}, "ans": "B", "exp": "Scope refers to the region where a variable can be accessed."},
        {"q": "Which of these is a reference type?", "type": "conceptual_reasoning", "opts": {"A":"int", "B":"boolean", "C":"String", "D":"char"}, "ans": "C", "exp": "String is a class in Java, making it a reference type."},
    ],
    "operators": [
        # Output Prediction
        {"q": "What does this Java code print?\nint result = 10 % 3;\nSystem.out.println(result);", "type": "output_prediction", "opts": {"A":"3", "B":"1", "C":"3.33", "D":"0"}, "ans": "B", "exp": "Modulus operator (%) returns remainder."},
        {"q": "What does this Java code print?\nSystem.out.println(5 + 2 * 3);", "type": "output_prediction", "opts": {"A":"21", "B":"11", "C":"15", "D":"10"}, "ans": "B", "exp": "Multiplication has higher precedence than addition."},
        {"q": "What does this Java code print?\nint x = 5;\nSystem.out.println(x++);", "type": "output_prediction", "opts": {"A":"5", "B":"6", "C":"4", "D":"Error"}, "ans": "A", "exp": "Post-increment returns the value before incrementing."},
        # Code Tracing
        {"q": "What is 'isTrue'?\nint x = 5;\nint y = 8;\nboolean isTrue = (x > 3) && (y == 8);", "type": "code_tracing", "opts": {"A":"true", "B":"false", "C":"1", "D":"Error"}, "ans": "A", "exp": "Both conditions are true."},
        {"q": "Trace the logic:\nboolean a = true;\nboolean b = false;\nboolean c = a || b;", "type": "code_tracing", "opts": {"A":"true", "B":"false", "C":"Error", "D":"null"}, "ans": "A", "exp": "Logical OR (||) returns true if at least one operand is true."},
        {"q": "What is the value of z?\nint x = 10;\nint y = 5;\nint z = x / y;", "type": "code_tracing", "opts": {"A":"2.0", "B":"2", "C":"15", "D":"5"}, "ans": "B", "exp": "Integer division truncates decimals."},
        # Conceptual Reasoning
        {"q": "Difference between '=' and '=='?", "type": "conceptual_reasoning", "opts": {"A":"Same thing", "B":"= assigns, == compares", "C":"= compares, == assigns", "D":"Only == exists"}, "ans": "B", "exp": "= is the assignment operator, == is the equality operator."},
        {"q": "What does the '!=' operator do?", "type": "conceptual_reasoning", "opts": {"A":"Assigns inverse value", "B":"Checks if strictly equal", "C":"Checks if not equal", "D":"Logical NOT"}, "ans": "C", "exp": "The != operator checks if two values are not equal."},
        {"q": "Why does 5 / 2 evaluate to 2 in Java?", "type": "conceptual_reasoning", "opts": {"A":"Bug in Java", "B":"Integer division truncates the decimal", "C":"Rounds to nearest even", "D":"It actually equals 2.5"}, "ans": "B", "exp": "Dividing two integers performs integer division, discarding the remainder."},
    ],
    "loops": [
        # Output Prediction
        {"q": "What does this Java code print?\nfor (int i = 0; i < 3; i++) {\n    System.out.print(i);\n}", "type": "output_prediction", "opts": {"A":"123", "B":"012", "C":"0123", "D":"Error"}, "ans": "B", "exp": "Loop runs for i = 0, 1, 2."},
        {"q": "What does this Java code print?\nint i = 0;\nwhile (i < 2) {\n    System.out.print(\"*\");\n    i++;\n}", "type": "output_prediction", "opts": {"A":"*", "B":"**", "C":"***", "D":"None"}, "ans": "B", "exp": "The loop runs twice."},
        {"q": "What does this print?\nfor (int i=5; i>3; i--) {\n    System.out.print(i);\n}", "type": "output_prediction", "opts": {"A":"54", "B":"543", "C":"43", "D":"Error"}, "ans": "A", "exp": "Loop runs for i=5 and i=4."},
        # Code Tracing
        {"q": "How many times does 'Hello' print?\nint count = 3;\nwhile (count > 0) {\n    System.out.println(\"Hello\");\n    count--;\n}", "type": "code_tracing", "opts": {"A":"2", "B":"3", "C":"4", "D":"Infinite"}, "ans": "B", "exp": "Runs for count = 3, 2, 1."},
        {"q": "What is sum at the end?\nint sum = 0;\nfor (int i=1; i<=3; i++) {\n    sum += i;\n}", "type": "code_tracing", "opts": {"A":"3", "B":"5", "C":"6", "D":"0"}, "ans": "C", "exp": "1 + 2 + 3 = 6."},
        {"q": "How many times does this loop run?\ndo {\n    System.out.print(\"X\");\n} while (false);", "type": "code_tracing", "opts": {"A":"0", "B":"1", "C":"Infinite", "D":"Error"}, "ans": "B", "exp": "A do-while loop always executes at least once."},
        # Conceptual Reasoning
        {"q": "What causes an 'infinite loop' in Java?", "type": "conceptual_reasoning", "opts": {"A":"Using while instead of for", "B":"A condition that never becomes false", "C":"Too many statements", "D":"Variables inside loop"}, "ans": "B", "exp": "If the exit condition is never met, the loop runs forever."},
        {"q": "When is a 'do-while' loop preferred over a 'while' loop?", "type": "conceptual_reasoning", "opts": {"A":"When execution must happen at least once", "B":"For iterating arrays", "C":"Never", "D":"When bounds are known"}, "ans": "A", "exp": "do-while checks the condition after execution, ensuring at least one run."},
        {"q": "What does the 'break' statement do in a loop?", "type": "conceptual_reasoning", "opts": {"A":"Skips the current iteration", "B":"Exits the loop entirely", "C":"Pauses execution", "D":"Throws an error"}, "ans": "B", "exp": "break immediately terminates the loop it is inside."},
    ],
    "arrays": [
        # Output Prediction
        {"q": "What does this Java code print?\nint[] numbers = {10, 20, 30};\nSystem.out.println(numbers[1]);", "type": "output_prediction", "opts": {"A":"10", "B":"20", "C":"30", "D":"Error"}, "ans": "B", "exp": "Array indices start at 0."},
        {"q": "What does this Java code print?\nint[] arr = new int[3];\nSystem.out.println(arr.length);", "type": "output_prediction", "opts": {"A":"0", "B":"2", "C":"3", "D":"4"}, "ans": "C", "exp": "The length property returns the size of the array."},
        {"q": "What does this print?\nint[] nums = {5, 10};\nSystem.out.println(nums[0] + nums[1]);", "type": "output_prediction", "opts": {"A":"5", "B":"10", "C":"15", "D":"Error"}, "ans": "C", "exp": "5 + 10 = 15."},
        # Code Tracing
        {"q": "What is 'sum'?\nint[] arr = {1, 2, 3};\nint sum = 0;\nfor (int i = 0; i < arr.length; i++) {\n    sum += arr[i];\n}", "type": "code_tracing", "opts": {"A":"3", "B":"5", "C":"6", "D":"Error"}, "ans": "C", "exp": "Iterates and adds 1 + 2 + 3 = 6."},
        {"q": "Trace the array values:\nint[] a = {1, 2};\na[0] = a[1];", "type": "code_tracing", "opts": {"A":"{1, 2}", "B":"{2, 2}", "C":"{2, 1}", "D":"Error"}, "ans": "B", "exp": "The first element is replaced by the second."},
        {"q": "What happens here?\nint[] x = new int[2];\nx[0] = 5;\nx[1] = 6;\nx[2] = 7;", "type": "code_tracing", "opts": {"A":"Array resizes", "B":"Syntax error", "C":"ArrayIndexOutOfBoundsException", "D":"x becomes {5,6,7}"}, "ans": "C", "exp": "Valid indices are 0 and 1. Index 2 is out of bounds."},
        # Conceptual Reasoning
        {"q": "Why does 'System.out.println(arr[5]);' throw an Exception if size is 5?", "type": "conceptual_reasoning", "opts": {"A":"Size is wrong", "B":"Index 5 doesn't exist (valid: 0-4)", "C":"Arrays start at 1", "D":"Cannot be printed"}, "ans": "B", "exp": "Indices are 0-based, so size 5 means valid indices are 0 through 4."},
        {"q": "How is the size of an array determined in Java?", "type": "conceptual_reasoning", "opts": {"A":"It is infinite", "B":"Fixed at creation time", "C":"Changes dynamically", "D":"Depends on OS"}, "ans": "B", "exp": "Arrays in Java have a fixed size defined when they are created."},
        {"q": "What is the default value of an int array element in Java?", "type": "conceptual_reasoning", "opts": {"A":"null", "B":"0", "C":"-1", "D":"Undefined"}, "ans": "B", "exp": "Primitive int arrays are initialized to 0."},
    ],
    "methods": [
        # Output Prediction
        {"q": "What does this print?\npublic static int add(int a, int b) {\n    return a + b;\n}\nSystem.out.println(add(3, 4));", "type": "output_prediction", "opts": {"A":"3", "B":"4", "C":"7", "D":"12"}, "ans": "C", "exp": "Returns 3 + 4 = 7."},
        {"q": "What does this print?\npublic static void sayHi() {\n    System.out.print(\"Hi\");\n}\nsayHi();\nsayHi();", "type": "output_prediction", "opts": {"A":"Hi", "B":"HiHi", "C":"Error", "D":"None"}, "ans": "B", "exp": "Method is called twice, printing Hi each time."},
        {"q": "What does this print?\npublic static int getNum() {\n    return 5;\n}\nSystem.out.println(getNum() * 2);", "type": "output_prediction", "opts": {"A":"5", "B":"10", "C":"25", "D":"Error"}, "ans": "B", "exp": "Method returns 5, which is then multiplied by 2."},
        # Code Tracing
        {"q": "What gets printed?\nvoid change(int x) {\n    x = 100;\n}\nint x = 10;\nchange(x);\nSystem.out.println(x);", "type": "code_tracing", "opts": {"A":"10", "B":"100", "C":"0", "D":"Error"}, "ans": "A", "exp": "Primitives are passed by value; original x is unchanged."},
        {"q": "Trace the execution:\nint calc(int x) {\n    return x * x;\n}\nint a = calc(3) + calc(2);", "type": "code_tracing", "opts": {"A":"5", "B":"13", "C":"25", "D":"Error"}, "ans": "B", "exp": "calc(3) is 9, calc(2) is 4. 9 + 4 = 13."},
        {"q": "What is the result?\nString greet(String n) {\n    return \"Hello \" + n;\n}\nSystem.out.println(greet(\"Bob\"));", "type": "code_tracing", "opts": {"A":"Hello Bob", "B":"Hello n", "C":"Bob", "D":"Error"}, "ans": "A", "exp": "The parameter 'n' takes the value 'Bob'."},
        # Conceptual Reasoning
        {"q": "Difference between 'void' and a return type like 'int'?", "type": "conceptual_reasoning", "opts": {"A":"Same thing", "B":"void takes no params", "C":"void returns nothing, int returns an integer", "D":"Cannot call void"}, "ans": "C", "exp": "void indicates the method does not return a value."},
        {"q": "What are method arguments?", "type": "conceptual_reasoning", "opts": {"A":"The method's name", "B":"Values passed into the method", "C":"The return value", "D":"Variables declared inside"}, "ans": "B", "exp": "Arguments are the actual values passed to the method's parameters."},
        {"q": "Why use methods in Java?", "type": "conceptual_reasoning", "opts": {"A":"To make code run slower", "B":"To avoid writing classes", "C":"For code reusability and organization", "D":"It is required by the OS"}, "ans": "C", "exp": "Methods allow you to reuse code blocks without rewriting them."},
    ]
}

lines = [
    '"""',
    'MCQ Question Bank — Stage 2 Diagnostic Post-Test',
    '=================================================',
    'Three MCQ types per concept for validating schema mastery, strictly in Java.',
    '45 Questions Total (9 per concept).',
    '"""',
    '',
    'mcq_questions = {'
]

for concept, qlist in concepts.items():
    lines.append(f'    "{concept}": [')
    for i, q in enumerate(qlist):
        qid = f"{concept.upper()}_{q['type'].upper()}_{i+1}"
        lines.append('        {')
        lines.append(f'            "id": "{qid}",')
        lines.append(f'            "concept": "{concept}",')
        lines.append(f'            "type": "{q["type"]}",')
        lines.append(f'            "question": {json.dumps(q["q"].split(chr(10))[0])},')
        if '\n' in q["q"]:
            code_part = "\n".join(q["q"].split('\n')[1:])
            lines.append(f'            "code": {json.dumps(code_part)},')
        else:
            lines.append(f'            "code": None,')
        lines.append('            "options": {')
        for k, v in q['opts'].items():
            lines.append(f'                "{k}": {json.dumps(v)},')
        lines.append('            },')
        lines.append(f'            "answer": "{q["ans"]}",')
        lines.append(f'            "explanation": {json.dumps(q["exp"])},')
        lines.append('        },')
    lines.append('    ],')

lines.append('}')

with open('backend/data/mcq_questions.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(lines) + '\n')

print("Created 45 questions")
