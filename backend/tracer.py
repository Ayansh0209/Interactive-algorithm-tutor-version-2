import sys
import linecache
import ast
import io
import json

tracer = []
prevVars = {}
CodeDepth = 0  # tracks depth of function calls (useful for recursion/backtracking)
print_buffer = io.StringIO()
FORBIDDEN_KEYWORDS = [
    "import os", "import sys", "subprocess", "open(", "exec(", "eval(",
    "import shutil", "from os", "from sys", "socket", "threading", "multiprocessing"
]

def is_code_safe(code):
    lowered = code.lower()
    return not any(kw in lowered for kw in FORBIDDEN_KEYWORDS)


def detectType(val):
    if isinstance(val, list):
        return "array"
    elif isinstance(val, dict):
        return "object"
    elif callable(val):
        return "function"
    return "primitive"

# new code of linked list need to be checked



def dataStruct(val):
    """Detects and serializes known data structures into JSON-friendly formats."""
    # Linked List (manual)
    if hasattr(val, "next") and not isinstance(val, (str, bytes)):
        try:
            nodes = []
            current = val
            visited = set()
            while current and id(current) not in visited:
                visited.add(id(current))
                node_repr = {}
                for attr in dir(current):
                    if not attr.startswith("_") and not callable(getattr(current, attr)):
                        node_repr[attr] = repr(getattr(current, attr))
                nodes.append(node_repr)
                current = getattr(current, "next", None)
            return {"type": "linked_list", "nodes": nodes}
        except Exception as e:
            return {"type": "linked_list", "error": str(e)}

    # Linked List from prebuilt library (llist, deque, etc.)
    try:
        from llist import sllist
        if isinstance(val, sllist):
            return {"type": "linked_list", "nodes": [repr(x) for x in val]}
    except ImportError:
        pass

    # Queue from collections.deque (stack/queue detection comes later)
    from collections import deque
    if isinstance(val, deque):
        return {"type": "deque", "elements": list(val)}

    # Default: try normal JSON serialization
    try:
        return json.loads(json.dumps(val))
    except:
        return repr(val)



# Check for doubly linked list
if hasattr(val, "next") and hasattr(val, "prev") and not isinstance(val, (str, bytes)):
    try:
        nodes = []
        current = val
        visited = set()
        while current and id(current) not in visited:
            visited.add(id(current))
            node_repr = {}
            for attr in dir(current):
                if not attr.startswith("_") and not callable(getattr(current, attr)):
                    node_repr[attr] = repr(getattr(current, attr))
            nodes.append(node_repr)
            current = getattr(current, "next", None)
        return {"type": "doubly_linked_list", "nodes": nodes}
    except Exception as e:
        return {"type": "doubly_linked_list", "error": str(e)}

# Check for llist.dllist
try:
    from llist import dllist
    if isinstance(val, dllist):
        return {"type": "doubly_linked_list", "nodes": [repr(x) for x in val]}
except ImportError:
    pass

# Check for queue.Queue
try:
    from queue import Queue
    if isinstance(val, Queue):
        return {"type": "queue", "elements": list(val.queue)}
except ImportError:
    pass












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
        
        safe_val = dataStruct(val)
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
    
    if not is_code_safe(code):
        return [{
            "event": "exception",
            "error": "Unsafe code detected. Use of restricted functions/modules is not allowed."
        }]

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