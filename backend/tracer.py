import sys
import linecache
import ast
import io
import json

tracer = []
prevVars = {}
CodeDepth = 0  # tracks depth of function calls (useful for recursion/backtracking)
print_buffer = io.StringIO()

def detectType(val):
    if isinstance(val, list):
        return "array"
    elif isinstance(val, dict):
        return "object"
    elif callable(val):
        return "function"
    return "primitive"

def traceSteps(frame, event, arg):
    global prevVars, CodeDepth

    if event not in ["call", "line", "return"]:
        return traceSteps

    codeLine = linecache.getline(frame.f_code.co_filename, frame.f_lineno).strip()
    if not codeLine and "__code_lines__" in frame.f_globals:
        try:
            codeLine = frame.f_globals["__code_lines__"][frame.f_lineno - 1].strip()
        except:
            codeLine = ""

    funcName = frame.f_code.co_name
    PyNoise = frame.f_locals.copy()

    # Remove built-in clutter
    if "__builtins__" in PyNoise:
        del PyNoise["__builtins__"]

    # Make all locals JSON-safe + record their type
    safe_locals = {}
    type_info = {}
    changed_values = {}  # NEW: store changed values

    for var, val in PyNoise.items():
        try:
            safe_val = json.loads(json.dumps(val))
        except:
            safe_val = repr(val)
        safe_locals[var] = safe_val
        type_info[var] = detectType(val)

        # Track only changed values
        if var not in prevVars or prevVars[var] != safe_val:
            changed_values[var] = safe_val

    changedVars = list(changed_values.keys())

    # Detect loop or condition scope
    scope_type = None
    if codeLine.startswith("for") or codeLine.startswith("while"):
        scope_type = "loop"
    elif codeLine.startswith("if") or codeLine.startswith("elif") or codeLine.startswith("else"):
        scope_type = "conditional"
    elif event == "call":
        scope_type = "function"

    # Try to detect if a conditional branch is taken (True/False)
    branch_taken = None
    if scope_type == "conditional":
        try:
            branch_taken = eval(codeLine, frame.f_globals, frame.f_locals)
        except:
            branch_taken = None

    # Track call depth
    if event == "call":
        CodeDepth += 1
    elif event == "return":
        CodeDepth -= 1

    # Append full trace snapshot
    tracer.append({
        "event": event,
        "line": frame.f_lineno,
        "function": funcName,
        "locals": safe_locals,
        "code": codeLine,
        "changed_vars": changedVars,
        "changed_values": changed_values,  # NEW: add changed_values dict
        "scope": scope_type,
        "depth": CodeDepth,
        "var_types": type_info,
        "branch_taken": branch_taken
    })

    prevVars = safe_locals.copy()
    return traceSteps

def runCode(code: str):
    global tracer, prevVars, CodeDepth, print_buffer

    tracer = []
    prevVars = {}
    CodeDepth = 0
    print_buffer = io.StringIO()

    try:
        globals_dict = {"__code_lines__": code.splitlines()}

        old_stdout = sys.stdout
        sys.stdout = print_buffer

        compiled = compile(code, "<string>", "exec")
        sys.settrace(traceSteps)
        exec(compiled, globals_dict)
        sys.settrace(None)

        sys.stdout = old_stdout
        printed_output = print_buffer.getvalue()
        if printed_output.strip():
            tracer.append({
                "event": "print",
                "output": printed_output.strip()
            })

    except Exception as e:
        sys.settrace(None)
        sys.stdout = old_stdout
        tracer.append({
            "event": "exception",
            "error": str(e)
        })

    return tracer