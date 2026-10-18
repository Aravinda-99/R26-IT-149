"""
Beginner Java concept notes for the C2 explanation knowledge base
=================================================================
One short note per fine error type in generator/families.py (REASON_GROUP) and
generator/families_blank.py (BLANK_REASON_GROUP). Each note says what the mistake
is, why Java rejects it or why it gives the wrong result, and the fix, at a level
a first-year student can follow. build_kb.py turns every note into one chunk.

Recursion notes use concept "Methods", the pre-test topic recursion falls under.
"""

NOTES = [
    # ── Variables: types, identifiers, assignment ──────────────────────────
    {
        "fine_reason": "VARIABLE_TYPE_MISMATCH",
        "concept": "Variables",
        "title": "Type keywords are case-sensitive",
        "text": "Java type names must be spelled exactly: int, double, boolean, char are lowercase primitive types. "
                "Int, integer, bool or bit are not Java types, so javac reports 'cannot find symbol'. "
                "void is only for methods that return nothing; a variable can never have type void. "
                "Boolean (capital B) is a wrapper class: it compiles, but a quiz asking for the primitive type expects boolean.",
    },
    {
        "fine_reason": "VARIABLE_INVALID_TYPE",
        "concept": "Variables",
        "title": "Use a real Java type in a declaration",
        "text": "A declaration has the form type name = value; and the type must be a real Java type such as int, double, "
                "boolean, char or String. Made-up or wrongly capitalised types (Int, integer, bool) do not exist. "
                "Pick the type that matches the value: whole numbers use int, true/false uses boolean.",
    },
    {
        "fine_reason": "VARIABLE_INVALID_NAME",
        "concept": "Variables",
        "title": "Rules for identifiers (variable names)",
        "text": "A Java identifier may contain letters, digits, _ and $, but it cannot start with a digit (2count is invalid). "
                "It cannot contain a hyphen or spaces (my-var is read as my minus var). "
                "It cannot be a reserved keyword such as class, int, for or return. _count and count2 are valid names.",
    },
    {
        "fine_reason": "VARIABLE_ASSIGN_VS_COMPARE",
        "concept": "Variables",
        "title": "= assigns, == compares",
        "text": "A single = stores a value into a variable (score = 10). A double == checks whether two values are equal and gives true or false. "
                "An if condition needs a boolean, so if (score = 10) does not compile in Java: 'int cannot be converted to boolean'. "
                "Use if (score == 10) to compare.",
    },
    {
        "fine_reason": "VARIABLE_INVALID_OPERATOR",
        "concept": "Variables",
        "title": "Java has no === operator",
        "text": "=== is a JavaScript operator; Java only has == for comparing primitive values. "
                "Writing score equals 10 is also not valid syntax; .equals() is a method used on objects like Strings, as in a.equals(b). "
                "For two int values, always write a == b.",
    },
    {
        "fine_reason": "VARIABLE_WRONG_ASSIGNMENT",
        "concept": "Variables",
        "title": "Assign the value you actually need",
        "text": "An assignment copies the right-hand side into the variable on the left. If the right-hand side is the wrong expression, "
                "the variable silently holds a wrong value and later output is wrong. "
                "Increment forms differ: b = a++ gives b the old value of a and then increases a; b = ++a increases a first, so b gets the new value; "
                "b = a + 1 changes only b and b = a changes neither.",
    },
    {
        "fine_reason": "VARIABLE_SELF_ASSIGNMENT",
        "concept": "Variables",
        "title": "x = x does nothing",
        "text": "Assigning a variable to itself (x = x;) leaves its value unchanged, so the intended update never happens. "
                "Usually the student meant to use another variable or an expression such as x = x + 1 or x = y.",
    },
    {
        "fine_reason": "VARIABLE_UNINITIALIZED",
        "concept": "Variables",
        "title": "Local variables must be initialised",
        "text": "Java does not give local variables a default value. Reading one before assigning it gives the compile error "
                "'variable might not have been initialized'. Give it a starting value when you declare it, for example int sum = 0;.",
    },
    {
        "fine_reason": "VARIABLE_WRONG_INITIALIZATION",
        "concept": "Variables",
        "title": "Choose the right starting value",
        "text": "The first value of a variable matters. A sum or counter usually starts at 0, a product starts at 1, and a maximum often starts at the first array element. "
                "Starting a sum at 1 makes every result one too big.",
    },
    {
        "fine_reason": "VARIABLE_OVERWRITTEN_VALUE",
        "concept": "Variables",
        "title": "= overwrites, += accumulates",
        "text": "sum = n replaces the old value of sum with n, so after a loop sum only holds the last element. "
                "sum += n means sum = sum + n and keeps a running total. Swapping two variables also needs a temporary variable, or one value is lost.",
    },
    {
        "fine_reason": "VARIABLE_WRONG_CALCULATION",
        "concept": "Variables",
        "title": "Use the operator the problem asks for",
        "text": "+ adds, - subtracts, * multiplies, / divides and % gives the remainder. Using the wrong one (for example adding a discount instead of subtracting it) "
                "compiles fine but gives the wrong answer. Check the formula with small numbers by hand.",
    },
    {
        "fine_reason": "VARIABLE_INTEGER_DIVISION",
        "concept": "Variables",
        "title": "int / int drops the decimal part",
        "text": "When both operands are int, / does integer division: 7 / 2 is 3, not 3.5. "
                "To get a decimal result, make one operand a double, for example 7 / 2.0 or (double) a / b.",
    },

    # ── Loops ──────────────────────────────────────────────────────────────
    {
        "fine_reason": "LOOP_OFF_BY_ONE",
        "concept": "Loops",
        "title": "< versus <= in a loop condition",
        "text": "for (int i = 0; i < n; i++) runs exactly n times (i = 0 .. n-1). Using i <= n runs one extra time. "
                "Starting at 1 instead of 0 runs one time too few. Trace the first and last value of i to check the count.",
    },
    {
        "fine_reason": "LOOP_WRONG_CONDITION",
        "concept": "Loops",
        "title": "The loop condition must test the loop variable",
        "text": "The condition decides when the loop stops, so it must use the variable that the loop changes. "
                "If the loop updates i but the condition tests j, n or a constant like 10 < 10, the loop never runs, never stops, or does not compile because j does not exist.",
    },
    {
        "fine_reason": "LOOP_MISSING_UPDATE",
        "concept": "Loops",
        "title": "A loop needs an update step",
        "text": "If the loop variable never changes, the condition stays true forever and the program hangs in an infinite loop. "
                "A while loop must update its counter inside the body, for example i++;. A plain i; statement does nothing and does not even compile.",
    },
    {
        "fine_reason": "LOOP_WRONG_COUNTER_DIRECTION",
        "concept": "Loops",
        "title": "Move the counter towards the stopping value",
        "text": "If the condition is i < 3, the counter must grow (i++) to reach 3. Writing i-- moves away from the limit, so the loop never ends. "
                "Counting down needs the opposite pair: i-- with a condition like i >= 0.",
    },
    {
        "fine_reason": "LOOP_CONTINUE_SKIP_UPDATE",
        "concept": "Loops",
        "title": "continue skips the rest of the body",
        "text": "continue jumps straight to the next iteration, so every statement after it in the body is skipped for that iteration. "
                "In a while loop, if the counter update comes after continue, it is skipped too and the loop can run forever. "
                "continue is not a way to update the counter.",
    },
    {
        "fine_reason": "LOOP_EARLY_BREAK",
        "concept": "Loops",
        "title": "break ends the whole loop",
        "text": "break exits the nearest loop immediately, and no further iterations run. A break placed too early, or without the right if condition, "
                "stops the loop before it has done its job.",
    },
    {
        "fine_reason": "LOOP_EARLY_BREAK_MISSING",
        "concept": "Loops",
        "title": "Stop the loop when the goal is reached",
        "text": "When a loop must stop as soon as something happens (for example i == 3), put break inside that if block. "
                "Without break, or with continue instead, the loop keeps running and does extra work.",
    },
    {
        "fine_reason": "LOOP_WRONG_KEYWORD",
        "concept": "Loops",
        "title": "do-while runs the body at least once",
        "text": "A do-while loop is written do { body } while (condition); and it checks the condition after the body, so the body always runs once. "
                "Only the keyword do can start this form; while, for or if in that position do not compile or behave differently.",
    },
    {
        "fine_reason": "LOOP_INVALID_JUMP_KEYWORD",
        "concept": "Loops",
        "title": "Java's loop jump keywords",
        "text": "Java has only break (leave the loop), continue (skip to the next iteration) and return (leave the method). "
                "Words like sleep, wait, pause or exit are not statements in Java, so writing them alone gives a compile error.",
    },
    {
        "fine_reason": "LOOP_WRONG_JUMP",
        "concept": "Loops",
        "title": "break, continue or return?",
        "text": "Use continue to skip just one iteration, break to stop the loop completely, and return to leave the whole method. "
                "Using break where continue is needed stops printing early; using return inside main ends the program.",
    },

    # ── Arrays ─────────────────────────────────────────────────────────────
    {
        "fine_reason": "ARRAY_INVALID_DECLARATION",
        "concept": "Arrays",
        "title": "Declare arrays with square brackets",
        "text": "An array type is written with square brackets: int[] arr = new int[5];. "
                "() is for method calls, {} is for blocks and array initial values, and <> is for generics, so int() or int{} is not a valid type.",
    },
    {
        "fine_reason": "ARRAY_OUT_OF_BOUNDS",
        "concept": "Arrays",
        "title": "Valid indexes are 0 to length - 1",
        "text": "An array of size n has indexes 0, 1, ..., n-1. Index -1 or index n does not exist, so Java throws ArrayIndexOutOfBoundsException at run time. "
                "The first element is arr[0], the last is arr[arr.length - 1].",
    },
    {
        "fine_reason": "ARRAY_LENGTH_AS_INDEX",
        "concept": "Arrays",
        "title": "arr[arr.length] is always out of bounds",
        "text": "arr.length is the number of elements, which is one more than the last index. arr[arr.length] therefore always throws ArrayIndexOutOfBoundsException. "
                "Use arr[arr.length - 1] for the last element and arr[0] for the first.",
    },
    {
        "fine_reason": "ARRAY_WRONG_INDEX_VARIABLE",
        "concept": "Arrays",
        "title": "Index with the right position",
        "text": "Arrays are zero-indexed: arr[1] is the second element, not the first. Using the wrong index, or the index i itself instead of arr[i], "
                "reads the wrong value even though the code compiles.",
    },
    {
        "fine_reason": "ARRAY_WRONG_LENGTH_SYNTAX",
        "concept": "Arrays",
        "title": "Array length is a field: arr.length",
        "text": "For arrays, length is a field and has no brackets: arr.length. Strings use a method with brackets: s.length(). "
                "arr.length(), arr.size or arr.count do not exist for arrays and do not compile.",
    },
    {
        "fine_reason": "ARRAY_WRONG_TRAVERSAL",
        "concept": "Arrays",
        "title": "Visit every element exactly once",
        "text": "The standard traversal is for (int i = 0; i < arr.length; i++) and reads arr[i]. Stepping by 2, reading arr[0] every time, "
                "or comparing with the wrong operator in the condition visits the wrong elements or none at all.",
    },
    {
        "fine_reason": "ARRAY_SKIPPED_ELEMENT",
        "concept": "Arrays",
        "title": "Don't skip the first or last element",
        "text": "Starting the loop at 1 skips arr[0]; stopping at i < arr.length - 1 skips the last element. "
                "To process every element start at 0 and use i < arr.length.",
    },

    # ── Methods ────────────────────────────────────────────────────────────
    {
        "fine_reason": "METHOD_MISSING_RETURN_KEYWORD",
        "concept": "Methods",
        "title": "return sends a value back",
        "text": "A method with a return type such as int must end with return value;. Words like print, output or give are not Java keywords, so print 5; does not compile. "
                "Printing shows a value on screen; returning hands it back to the caller.",
    },
    {
        "fine_reason": "METHOD_VOID_RETURNS_VALUE",
        "concept": "Methods",
        "title": "void means no return value",
        "text": "A method declared void returns nothing, so it may not contain return value;. A method that only prints should be void. "
                "If you write int as the return type, the method must return an int on every path.",
    },
    {
        "fine_reason": "METHOD_WRONG_RETURN_TYPE",
        "concept": "Methods",
        "title": "The return type must match",
        "text": "The type before the method name says what it returns. A printing method declared int fails with 'missing return statement'. "
                "return and null are not types, so static return printHello() or static null printHello() does not compile.",
    },
    {
        "fine_reason": "METHOD_MISSING_RETURN",
        "concept": "Methods",
        "title": "Every path must return a value",
        "text": "In a non-void method, javac checks that every path through the method ends with a return. If one branch of an if has no return, "
                "you get 'missing return statement'.",
    },
    {
        "fine_reason": "METHOD_WRONG_RETURN_OPERATION",
        "concept": "Methods",
        "title": "Return the right expression",
        "text": "A method can compile and still return the wrong result, for example return a - b inside a method called add. "
                "Check the returned expression against what the method name and task promise.",
    },
    {
        "fine_reason": "METHOD_ARGUMENT_MISMATCH",
        "concept": "Methods",
        "title": "Arguments must match parameters",
        "text": "A call must pass exactly as many arguments as the method has parameters, each of a compatible type. add(int a, int b) needs two ints, as in add(3, 4). "
                "Passing \"4\" (a String) or four (an undefined name) does not compile.",
    },
    {
        "fine_reason": "METHOD_WRONG_CALL",
        "concept": "Methods",
        "title": "int literals have no quotes",
        "text": "4 is an int literal, \"4\" is a String and four is just an unknown name. A parameter of type int only accepts int values, "
                "so add(3, \"4\") gives 'incompatible types: String cannot be converted to int'. Roman numerals like IV are not numbers in Java.",
    },
    {
        "fine_reason": "METHOD_PARAMETER_ORDER_ERROR",
        "concept": "Methods",
        "title": "Arguments are matched by position",
        "text": "Java matches arguments to parameters by order: the first argument goes to the first parameter. Swapping them, as in divide(b, a), "
                "compiles but computes the wrong result when the order matters.",
    },
    {
        "fine_reason": "METHOD_IGNORED_PARAMETER",
        "concept": "Methods",
        "title": "Use the parameters you receive",
        "text": "Parameters carry the input of a method. If the body ignores a parameter or uses a constant instead, the method gives the same answer for every input.",
    },
    {
        "fine_reason": "METHOD_WRONG_BASE_CASE",
        "concept": "Methods",
        "title": "Recursion needs a correct base case",
        "text": "A recursive method needs a base case that returns a fixed value without calling itself, otherwise the calls never stop and you get StackOverflowError. "
                "For mystery(n) = n + mystery(n - 1) with base case n == 1 the base value is 1. Returning mystery(n) there recurses forever; "
                "returning 0 gives a sum that is 1 too small; returning n is valid Java and returns 1 here because n == 1.",
    },
    {
        "fine_reason": "METHOD_WRONG_RECURSIVE_ARG",
        "concept": "Methods",
        "title": "Each recursive call must move towards the base case",
        "text": "The argument of a recursive call must get closer to the base case, for example mystery(n - 1) when the base case is n == 1. "
                "mystery(n) or mystery(n + 1) never reaches it and causes StackOverflowError; mystery(1) jumps straight to the base case and gives the wrong sum.",
    },
]
