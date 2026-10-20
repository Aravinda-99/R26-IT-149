"""
Component 2: Code Runner (Java sandbox)
=======================================
Compiles and runs beginner Java snippets for the Pre-Test sandbox.

Wrapping
  A snippet without its own class + main is wrapped into `public class Main`:
  top-level method definitions (`static ... {`, or `type name(params) {`) become
  static methods of Main, other statements go into main() in their original order,
  `class` / `interface` / `enum` / `record` declarations go after Main, `import`s go
  to the top, and `import java.util.*;` is always added (Scanner for stdin).
  Every wrapper line remembers which student line it came from, so compiler errors
  and stack traces are reported against the student's code.

Execution
  javac: 10 s timeout. java: 5 s timeout, -Xmx64m, stdin supported, stdout capped at
  10 KB (the process is killed as soon as it exceeds the cap). The real JDK binaries are
  used, not the Windows "javapath" launcher shim (its JVM child can keep pipes open
  after the shim dies). Pipes are drained on daemon threads, so we never block on them,
  and on timeout the whole process tree is killed (taskkill /T on Windows, the process
  group elsewhere).

Security note: code runs as the backend's OS user with no further isolation. This is
fine for a local research deployment; a public deployment needs a container/VM.

JDK selection: C2_JAVA_HOME, else JAVA_HOME, else the java.home reported by `java` on PATH.
"""

import os
import re
import shutil
import signal
import subprocess
import tempfile
import threading
import time

COMPILE_TIMEOUT_SECONDS = 10
RUN_TIMEOUT_SECONDS = 5
OUTPUT_CAP_BYTES = 10 * 1024
MAX_CODE_CHARS = 20000
MAX_STDIN_CHARS = 10000
MAX_CONCURRENT_RUNS = 4

_run_slots = threading.BoundedSemaphore(MAX_CONCURRENT_RUNS)
_jdk_lock = threading.Lock()
_jdk = None

MODIFIERS = ("public", "private", "protected", "static", "final", "abstract", "synchronized")
NOT_METHOD_NAMES = {"if", "for", "while", "switch", "catch", "synchronized", "return", "new", "else", "do",
                    "try", "throw", "case", "assert"}
NOT_TYPES = {"else", "return", "new", "do", "case", "throw", "if", "for", "while", "try", "catch", "finally"}
_MODIFIER_METHOD_RE = re.compile(r"(?:(?:public|private|protected|static|final|abstract|synchronized)\s+)+[^;{}]*\{")
_TYPED_METHOD_RE = re.compile(
    r"([A-Za-z_][\w.]*(?:\s*<[^;{}()]*>)?(?:\s*\[\s*\])*)\s+([A-Za-z_]\w*)\s*\([^;{}]*\)\s*(?:throws\s+[\w.,\s]+)?\{")
_TYPE_DECL_RE = re.compile(r"(?:(?:public|private|protected|static|final|abstract)\s+)*(?:class|interface|enum|record)\s+\w+")
_IMPORT_RE = re.compile(r"import\s+(?:static\s+)?[\w.]+(?:\.\*)?\s*;")


class JdkNotFound(RuntimeError):
    pass


# ----------------------------------------------------------------------
# JDK discovery
# ----------------------------------------------------------------------

def _exe(home, name):
    path = os.path.join(home, "bin", name + (".exe" if os.name == "nt" else ""))
    return path if os.path.isfile(path) else None


def find_jdk():
    """Returns {"home", "java", "javac", "version"}; raises JdkNotFound."""
    global _jdk
    with _jdk_lock:
        if _jdk:
            return _jdk
        homes = [os.getenv("C2_JAVA_HOME", "").strip(), os.getenv("JAVA_HOME", "").strip()]
        java_on_path = shutil.which("java")
        if java_on_path:
            try:
                out = subprocess.run([java_on_path, "-XshowSettings:properties", "-version"],
                                     capture_output=True, text=True, timeout=20)
                m = re.search(r"java\.home\s*=\s*(.+)", out.stderr + out.stdout)
                if m:
                    homes.append(m.group(1).strip())
            except (OSError, subprocess.SubprocessError):
                pass
        for home in filter(None, homes):
            java, javac = _exe(home, "java"), _exe(home, "javac")
            if java and javac:
                try:
                    v = subprocess.run([javac, "-version"], capture_output=True, text=True, timeout=20)
                    version = (v.stdout + v.stderr).strip()
                except (OSError, subprocess.SubprocessError):
                    version = "unknown"
                _jdk = {"home": home, "java": java, "javac": javac, "version": version}
                return _jdk
        raise JdkNotFound("No JDK with javac found (set C2_JAVA_HOME to a JDK folder, e.g. Eclipse Temurin 21).")


# ----------------------------------------------------------------------
# Wrapping
# ----------------------------------------------------------------------

def _skip_literal(code, i):
    """If code[i] starts a string/char literal or comment, return the index after it, else None."""
    c = code[i]
    if code.startswith("//", i):
        j = code.find("\n", i)
        return len(code) if j < 0 else j
    if code.startswith("/*", i):
        j = code.find("*/", i + 2)
        return len(code) if j < 0 else j + 2
    if code.startswith('"""', i):
        j = code.find('"""', i + 3)
        return len(code) if j < 0 else j + 3
    if c in "\"'":
        j = i + 1
        while j < len(code) and code[j] != c and code[j] != "\n":
            j += 2 if code[j] == "\\" else 1
        return min(j + 1, len(code))
    return None


def _block_end(code, open_brace):
    """Index just after the brace matching code[open_brace] ('{')."""
    depth, i = 0, open_brace
    while i < len(code):
        skip = _skip_literal(code, i)
        if skip is not None:
            i = skip
            continue
        if code[i] == "{":
            depth += 1
        elif code[i] == "}":
            depth -= 1
            if depth == 0:
                return i + 1
        i += 1
    return len(code)


def _statement_end(code, i):
    """End of one top-level statement starting at i: a ';' or a block closing back to depth 0."""
    paren = brace = 0
    while i < len(code):
        skip = _skip_literal(code, i)
        if skip is not None:
            i = skip
            continue
        c = code[i]
        if c == "(":
            paren += 1
        elif c == ")":
            paren = max(0, paren - 1)
        elif c == "{":
            brace += 1
        elif c == "}":
            brace -= 1
            if brace <= 0 and paren == 0:
                return i + 1
        elif c == ";" and paren == 0 and brace == 0:
            return i + 1
        i += 1
    return len(code)


def _is_method_start(code, i):
    """Match end (index of the opening '{') if a method definition starts at i, else None."""
    m = _MODIFIER_METHOD_RE.match(code, i)
    if m and "(" in m.group(0) and not _TYPE_DECL_RE.match(code, i):
        return m.end() - 1
    m = _TYPED_METHOD_RE.match(code, i)
    if m and m.group(2) not in NOT_METHOD_NAMES and m.group(1).split("<")[0].strip() not in NOT_TYPES:
        return m.end() - 1
    return None


def split_snippet(code):
    """Split a snippet into segments: list of (kind, start, end), kind in import/type/method/statement."""
    segs, i, n = [], 0, len(code)
    while i < n:
        while i < n and code[i].isspace():
            i += 1
        if i >= n:
            break
        skip = _skip_literal(code, i) if code.startswith(("//", "/*"), i) else None
        if skip is not None:  # comment between statements: keep it with the statements
            segs.append(("statement", i, skip))
            i = skip
            continue
        m = _IMPORT_RE.match(code, i)
        if m:
            segs.append(("import", i, m.end()))
            i = m.end()
            continue
        if _TYPE_DECL_RE.match(code, i):
            brace = code.find("{", i)
            end = _block_end(code, brace) if brace >= 0 else n
            segs.append(("type", i, end))
            i = end
            continue
        brace = _is_method_start(code, i)
        if brace is not None:
            end = _block_end(code, brace)
            segs.append(("method", i, end))
            i = end
            continue
        end = _statement_end(code, i)
        segs.append(("statement", i, end))
        i = end
    return segs


def is_full_program(code):
    return bool(re.search(r"\bclass\s+\w+", code) and re.search(r"\bstatic\s+void\s+main\s*\(", code))


def wrap_code(code):
    """
    Returns {"source", "filename", "main_class", "line_map"}: line_map[k] is the 1-based
    snippet line of wrapper line k+1 (None for lines added by the wrapper).
    """
    if is_full_program(code):
        pub = re.search(r"\bpublic\s+(?:final\s+)?class\s+(\w+)", code)
        main_idx = re.search(r"\bstatic\s+void\s+main\s*\(", code).start()
        owners = [m.group(1) for m in re.finditer(r"\bclass\s+(\w+)", code[:main_idx])]
        main_class = owners[-1] if owners else "Main"
        filename = (pub.group(1) if pub else "Main") + ".java"
        n_lines = code.count("\n") + 1
        return {"source": code, "filename": filename, "main_class": main_class, "line_map": list(range(1, n_lines + 1))}

    def line_of(pos):
        return code.count("\n", 0, pos) + 1

    groups = {"import": [], "type": [], "method": [], "statement": []}
    for kind, s, e in split_snippet(code):
        groups[kind].append((s, e))

    out, line_map = [], []

    def emit(text, src_line=None):
        for k, ln in enumerate(text.split("\n")):
            out.append(ln)
            line_map.append(None if src_line is None else src_line + k)

    for s, e in groups["import"]:
        emit(code[s:e], line_of(s))
    emit("import java.util.*;")
    emit("public class Main {")
    for s, e in groups["method"]:
        emit(code[s:e], line_of(s))
    emit("public static void main(String[] args) throws Exception {")
    for s, e in groups["statement"]:
        emit(code[s:e], line_of(s))
    emit("}")
    emit("}")
    for s, e in groups["type"]:
        emit(code[s:e], line_of(s))
    return {"source": "\n".join(out) + "\n", "filename": "Main.java", "main_class": "Main", "line_map": line_map}


# ----------------------------------------------------------------------
# Error mapping
# ----------------------------------------------------------------------

COMPILE_CATEGORIES = [
    ("unknown_name", r"cannot find symbol", "A name is not defined: check the spelling and case of variables, types and methods."),
    ("return_value_in_void", r"unexpected return value", "A void method cannot return a value."),
    ("missing_return", r"missing return statement", "A method with a return type must return a value on every path."),
    ("type_mismatch", r"incompatible types|lossy conversion", "The value's type does not match the variable or parameter type."),
    ("wrong_arguments", r"cannot be applied to|actual and formal argument|no suitable method", "The call's arguments do not match the method's parameters."),
    ("uninitialized_variable", r"might not have been initialized", "Give the variable a value before you use it."),
    ("duplicate_name", r"is already defined", "This name is already used in the same scope."),
    ("unreachable_code", r"unreachable statement", "This statement can never run (e.g. after break, return or an infinite loop)."),
    ("jump_outside_loop", r"outside (?:switch or )?loop|outside of loop", "break / continue can only be used inside a loop."),
    ("not_a_statement", r"not a statement", "This line is not a valid Java statement (e.g. an unknown keyword or a bare value)."),
    ("syntax", r"expected|illegal start|reached end of file|class, interface, enum, or record expected|illegal character|unclosed",
     "Syntax error: check brackets, semicolons and keywords."),
]


def categorize_compile_error(message):
    for name, pattern, hint in COMPILE_CATEGORIES:
        if re.search(pattern, message):
            return name, hint
    return "other", "Read the compiler message and check this line."


RUNTIME_CATEGORIES = {
    "ArrayIndexOutOfBoundsException": ("array_index_out_of_bounds", "An array index is outside 0 .. length - 1."),
    "StringIndexOutOfBoundsException": ("string_index_out_of_bounds", "A String index is outside 0 .. length() - 1."),
    "StackOverflowError": ("stack_overflow", "Infinite recursion: the recursive calls never reach the base case."),
    "ArithmeticException": ("arithmetic", "Arithmetic error, usually division by zero."),
    "NullPointerException": ("null_pointer", "A variable is null where an object is needed."),
    "InputMismatchException": ("input_mismatch", "The input does not match the type being read (e.g. text for nextInt())."),
    "NoSuchElementException": ("missing_input", "The program tried to read more input than was given."),
    "NumberFormatException": ("number_format", "Text could not be converted to a number."),
    "OutOfMemoryError": ("out_of_memory", "The program used too much memory (limit 64 MB)."),
    "ClassCastException": ("class_cast", "An object was cast to a type it does not have."),
}


def _student_line(line_map, wrapper_line):
    if wrapper_line and 1 <= wrapper_line <= len(line_map):
        return line_map[wrapper_line - 1]
    return None


def parse_compile_errors(stderr, filename, line_map, student_lines):
    errors = []
    lines = stderr.splitlines()
    pat = re.compile(r"^(?:.*[\\/])?" + re.escape(filename) + r":(\d+): error: (.*)$")
    for k, ln in enumerate(lines):
        m = pat.match(ln)
        if not m:
            continue
        wline, msg = int(m.group(1)), m.group(2).strip()
        # javac prints the source line and a caret line; the caret position is the column.
        col = None
        if k + 2 < len(lines) and lines[k + 2].strip() == "^":
            col = len(lines[k + 2]) - len(lines[k + 2].lstrip()) + 1
        detail = []
        for extra in lines[k + 3:k + 6]:
            if pat.match(extra) or not extra.startswith("  "):
                break
            detail.append(extra.strip())
        sline = _student_line(line_map, wline)
        category, hint = categorize_compile_error(msg)
        errors.append({
            "line": sline,
            "column": col if sline is not None else None,
            "message": msg + (f" ({'; '.join(detail)})" if detail else ""),
            "category": category,
            "hint": hint,
            "code_line": student_lines[sline - 1] if sline and sline <= len(student_lines) else None,
            "in_student_code": sline is not None,
        })
    if not errors and stderr.strip():
        errors.append({"line": None, "column": None, "message": stderr.strip()[:500], "category": "other",
                       "hint": "The compiler reported a problem.", "code_line": None, "in_student_code": False})
    return errors


def parse_runtime_error(stderr, line_map, main_class="Main"):
    m = re.search(r"Exception in thread \"[^\"]*\" ([\w.$]+)(?::\s*(.*))?", stderr)
    if not m:
        m = re.search(r"^([\w.$]+(?:Exception|Error))(?::\s*(.*))?", stderr, re.M)
    if not m:
        return None
    qualified, msg = m.group(1), (m.group(2) or "").strip()
    simple = qualified.rsplit(".", 1)[-1]
    category, hint = RUNTIME_CATEGORIES.get(simple, ("exception", "The program stopped with an exception."))
    line = None
    for fm in re.finditer(r"at [\w.$<>]+\((\w+)\.java:(\d+)\)", stderr):
        line = _student_line(line_map, int(fm.group(2)))
        if line is not None:
            break
    return {"type": simple, "qualified_type": qualified, "message": msg[:300], "line": line,
            "category": category, "hint": hint}


# ----------------------------------------------------------------------
# Process handling
# ----------------------------------------------------------------------

def _kill_tree(proc):
    if proc.poll() is not None:
        return
    try:
        if os.name == "nt":
            subprocess.run(["taskkill", "/F", "/T", "/PID", str(proc.pid)], capture_output=True, timeout=10)
        else:
            os.killpg(proc.pid, signal.SIGKILL)
    except Exception:
        pass
    try:
        proc.kill()
    except Exception:
        pass


def _drain(stream, buf, cap, on_overflow=None):
    """Read a pipe to EOF; keep the first `cap` bytes, discard the rest so the child never blocks."""
    try:
        while True:
            chunk = stream.read(4096)
            if not chunk:
                break
            room = cap - len(buf["data"])
            if room > 0:
                buf["data"] += chunk[:room]
            if len(chunk) > max(room, 0):
                buf["overflow"] = True
                if on_overflow:
                    on_overflow()
                    on_overflow = None
    except (OSError, ValueError):
        pass
    finally:
        try:
            stream.close()
        except Exception:
            pass


def run_process(cmd, cwd, timeout, stdin_text="", stdout_cap=OUTPUT_CAP_BYTES, stderr_cap=OUTPUT_CAP_BYTES,
                kill_on_stdout_overflow=False):
    """Runs cmd; returns dict(returncode, stdout, stderr, timed_out, stdout_overflow, time_ms)."""
    kwargs = {}
    if os.name == "nt":
        kwargs["creationflags"] = subprocess.CREATE_NEW_PROCESS_GROUP | getattr(subprocess, "CREATE_NO_WINDOW", 0)
    else:
        kwargs["start_new_session"] = True
    t0 = time.monotonic()
    proc = subprocess.Popen(cmd, cwd=cwd, stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            **kwargs)
    out, err = {"data": b"", "overflow": False}, {"data": b"", "overflow": False}
    killer = (lambda: _kill_tree(proc)) if kill_on_stdout_overflow else None
    threads = [threading.Thread(target=_drain, args=(proc.stdout, out, stdout_cap, killer), daemon=True),
               threading.Thread(target=_drain, args=(proc.stderr, err, stderr_cap), daemon=True)]
    for t in threads:
        t.start()

    def feed():
        try:
            if stdin_text:
                proc.stdin.write(stdin_text.encode("utf-8"))
            proc.stdin.close()
        except (OSError, ValueError):
            pass
    feeder = threading.Thread(target=feed, daemon=True)
    feeder.start()

    timed_out = False
    try:
        proc.wait(timeout=timeout)
    except subprocess.TimeoutExpired:
        timed_out = True
        _kill_tree(proc)
        try:
            proc.wait(timeout=5)
        except subprocess.TimeoutExpired:
            pass
    for t in threads:
        t.join(timeout=2)  # daemon threads: never block the request on a stuck pipe
    return {
        "returncode": proc.returncode,
        "stdout": out["data"].decode("utf-8", errors="replace"),
        "stderr": err["data"].decode("utf-8", errors="replace"),
        "timed_out": timed_out and not out["overflow"],
        "stdout_overflow": out["overflow"],
        "time_ms": int((time.monotonic() - t0) * 1000),
    }


# ----------------------------------------------------------------------
# Public API
# ----------------------------------------------------------------------

def compile_code(code, workdir):
    """Wraps and compiles code in workdir. Returns (wrapped, compile_result_dict)."""
    jdk = find_jdk()
    wrapped = wrap_code(code)
    with open(os.path.join(workdir, wrapped["filename"]), "w", encoding="utf-8") as f:
        f.write(wrapped["source"])
    res = run_process([jdk["javac"], "-J-Xmx256m", "-nowarn", "-encoding", "UTF-8", "-proc:none", "-Xmaxerrs", "20",
                       "-d", workdir, wrapped["filename"]], cwd=workdir, timeout=COMPILE_TIMEOUT_SECONDS)
    student_lines = code.split("\n")
    errors = []
    if res["timed_out"]:
        errors = [{"line": None, "column": None, "message": f"Compilation took longer than {COMPILE_TIMEOUT_SECONDS} s.",
                   "category": "compile_timeout", "hint": "Try again; if it repeats, simplify the code.",
                   "code_line": None, "in_student_code": False}]
    elif res["returncode"] != 0:
        errors = parse_compile_errors(res["stderr"], wrapped["filename"], wrapped["line_map"], student_lines)
    return wrapped, {"compiled": not errors, "compile_errors": errors, "compile_time_ms": res["time_ms"]}


def execute(wrapped, workdir, stdin="", run_timeout=None):
    """Runs an already compiled program. Returns the run part of the /run response."""
    jdk = find_jdk()
    timeout = run_timeout or RUN_TIMEOUT_SECONDS
    cmd = [jdk["java"], "-Xmx64m", "-XX:+UseSerialGC", "-XX:TieredStopAtLevel=1", "-Xshare:auto",
           "-Dfile.encoding=UTF-8", "-Dstdout.encoding=UTF-8", "-Dstderr.encoding=UTF-8",
           "-cp", workdir, wrapped["main_class"]]
    with _run_slots:
        res = run_process(cmd, cwd=workdir, timeout=timeout, stdin_text=(stdin or "")[:MAX_STDIN_CHARS],
                          kill_on_stdout_overflow=True)
    runtime_error = None
    if res["timed_out"]:
        runtime_error = {"type": "Timeout", "qualified_type": None, "line": None, "category": "timeout",
                         "message": f"The program did not finish within {timeout} s.",
                         "hint": "Possible infinite loop: check that the loop condition eventually becomes false."}
    elif res["stdout_overflow"]:
        runtime_error = {"type": "OutputLimit", "qualified_type": None, "line": None, "category": "output_limit",
                         "message": f"The program printed more than {OUTPUT_CAP_BYTES // 1024} KB and was stopped.",
                         "hint": "Possible infinite loop: the program kept printing without stopping."}
    elif res["returncode"] not in (0, None):
        runtime_error = parse_runtime_error(res["stderr"], wrapped["line_map"], wrapped["main_class"]) or {
            "type": "ExitCode", "qualified_type": None, "line": None, "category": "nonzero_exit",
            "message": f"The program exited with code {res['returncode']}.", "hint": res["stderr"].strip()[:300]}
    return {
        "stdout": res["stdout"].replace("\r\n", "\n"),
        "stderr": res["stderr"].replace("\r\n", "\n")[:4000],
        "runtime_error": runtime_error,
        "timed_out": res["timed_out"],
        "output_truncated": res["stdout_overflow"],
        "exit_code": res["returncode"],
        "time_ms": res["time_ms"],
    }


def _check_inputs(code, stdin):
    if not isinstance(code, str) or not code.strip():
        return "No code to run."
    if len(code) > MAX_CODE_CHARS:
        return f"Code is longer than {MAX_CODE_CHARS} characters."
    if stdin is not None and not isinstance(stdin, str):
        return "stdin must be text."
    return None


def run_code(code, stdin="", run_timeout=None):
    """POST /api/errors/run: compile + run. Returns {compiled, compile_errors, runtime_error, stdout, timed_out, time_ms, ...}."""
    problem = _check_inputs(code, stdin)
    if problem:
        return {"success": False, "error": problem}
    t0 = time.monotonic()
    workdir = tempfile.mkdtemp(prefix="c2_run_")
    try:
        wrapped, comp = compile_code(code, workdir)
        result = {"success": True, "compiled": comp["compiled"], "compile_errors": comp["compile_errors"],
                  "runtime_error": None, "stdout": "", "stderr": "", "timed_out": False, "output_truncated": False,
                  "exit_code": None, "compile_time_ms": comp["compile_time_ms"], "run_time_ms": None}
        if comp["compiled"]:
            run = execute(wrapped, workdir, stdin, run_timeout)
            result.update({k: run[k] for k in ("stdout", "stderr", "runtime_error", "timed_out", "output_truncated",
                                               "exit_code")})
            result["run_time_ms"] = run["time_ms"]
        result["time_ms"] = int((time.monotonic() - t0) * 1000)
        result["wrapped"] = not is_full_program(code)
        return result
    except JdkNotFound as e:
        return {"success": False, "error": str(e)}
    finally:
        shutil.rmtree(workdir, ignore_errors=True)
