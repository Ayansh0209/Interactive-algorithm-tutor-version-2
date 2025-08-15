import sys
import linecache
import ast
import io
import json

tracer = []
prevVars = {}
# tracks depth of function calls (useful for recursion/backtracking)
CodeDepth = 0
print_buffer = io.StringIO()
FORBIDDEN_KEYWORDS = [
    "import os", "import sys", "subprocess", "open(", "exec(", "eval(",
    "import shutil", "from os", "from sys", "socket", "threading", "multiprocessing"
]


def is_code_safe(code):
    lowered = code.lower()
    return not any(kw in lowered for kw in FORBIDDEN_KEYWORDS)

def nextAttribute(obj, exclude=()):
    """Find an attribute that points to another object of the same type."""
    for attr in dir(obj):
        if attr.startswith("__") or attr in exclude:
            continue
        try:
           val = getattr(obj, attr)
           if isinstance(val, type(obj)) or val is None:
                return attr
        except:
            continue
    return None

def detectType(val):
    try:
        if isinstance(val, (int, float, str, bool, type(None))):
            return "primitive"
        if isinstance(val, list):
            return "array"
        if isinstance(val, dict):
            return "object"
        if callable(val):
            return "function"

        tname = type(val).__name__.lower()

        # Detect linked list container
        if hasattr(val, "__dict__"):
            for attr in dir(val):
                if attr.startswith("__"):
                    continue
                node = getattr(val, attr, None)
                if hasattr(node, "__dict__"):
                    link_attr = nextAttribute(node)
                    if link_attr:
                        if hasattr(node, "prev") or nextAttribute(node, exclude=(link_attr,)):
                            return "doubly_linked_list"
                        return "linked_list"

        # Detect linked list node
        link_attr = nextAttribute(val)
        if link_attr:
            if hasattr(val, "prev") or nextAttribute(val, exclude=(link_attr,)):
                return "doubly_linked_node"
            return "linked_list_node"

        return tname
    except Exception:
        return "unknown"

def visualFormat(container):
    """Return JSON-safe visualization format for supported data structures."""
    result = {"type": "linked_list", "head": None, "nodes": [], "current": None}
    visited = {}
    node_id_counter = 0

    # Find starting node dynamically
    start_node = None
    for attr in dir(container):
        if attr.startswith("__"):
            continue
        node = getattr(container, attr, None)
        if hasattr(node, "__dict__") and nextAttribute(node) is not None:

            start_node = node
            result["head"] = 0
            break
    if not start_node:
        return None

    current = start_node
    prev_id = None
    while current and id(current) not in visited:
        node_id = node_id_counter
        visited[id(current)] = node_id
        node_data = None
        for attr in dir(current):
            if attr.startswith("__"):
                continue
            val = getattr(current, attr, None)
            if not hasattr(val, "__dict__"):
                node_data = val
                break

        next_node = getattr(current, nextAttribute(current), None)
        next_id = None
        if next_node and id(next_node) not in visited:
            next_id = node_id_counter + 1

        result["nodes"].append({
            "id": node_id,
            "value": node_data,
            "next": next_id,
            "prev": prev_id
        })

        prev_id = node_id
        current = next_node
        node_id_counter += 1

    return result

        
        
   

def FilterCode(sourceCode):
    tree = ast.parse(sourceCode)
    exec_lines = set()

    def is_skipped_top_stmt(node):
        # Skip defs/imports
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)):
            return True
        # Skip module docstring (Expr[str])
        if isinstance(node, ast.Expr) and isinstance(getattr(node, "value", None), ast.Constant) and isinstance(node.value.value, str):
            return True
        return False

    # Only consider top-level statements
    for node in getattr(tree, "body", []):
        if is_skipped_top_stmt(node):
            continue
        start = getattr(node, "lineno", None)
        end = getattr(node, "end_lineno", start)
        if start is not None:
            exec_lines.update(range(start, (end or start) + 1))

    return sorted(exec_lines)


    
tracingSteps =False # global flag it wont be true until we wil get value output for out visualizer
MainLines = set()
    
def traceSteps(frame, event, arg):
    global prevVars, CodeDepth,tracingSteps

    if event not in ["call", "line", "return"]:
        return traceSteps

    codeLine = linecache.getline(
        frame.f_code.co_filename, frame.f_lineno).strip()
    if not codeLine and "__code_lines__" in frame.f_globals:
        try:
            codeLine = frame.f_globals["__code_lines__"][frame.f_lineno - 1].strip()
        except:
            codeLine = ""

    funcName = frame.f_code.co_name
    # Don't trace module lines before the first executable top-level statement
    if frame.f_code.co_name == "<module>" and frame.f_lineno < START_AT:
        return traceSteps


    # Start tracing when we hit the first allowed executable line
    if not tracingSteps:
        if frame.f_lineno not in MainLines:
            return traceSteps
    user_locals = {k: v for k, v in frame.f_locals.items() if not k.startswith("__")}
    if any(not callable(v) for v in user_locals.values()):
        tracingSteps = True
    else:
        return traceSteps



  
    
    PyNoise = frame.f_locals.copy()

    # Remove built-in clutter
    if "__builtins__" in PyNoise:
        del PyNoise["__builtins__"]

    if "__code_lines__" in PyNoise:
        del PyNoise["__code_lines__"]

   
    safe_locals = {}
    type_info = {}
    # changed_values = {}  # NEW: store changed values

    for var, val in PyNoise.items():
        if callable(val):
            continue
        var_type = detectType(val)
        type_info[var] = var_type
        
        if var_type in ("linked_list", "linked_list_node", "doubly_linked_list", "doubly_linked_node"):
            try:
                safe_locals[var] = visualFormat(val) 
            except:
                safe_locals[var] = repr(val) 
            continue 
        
        try:
            safe_locals[var] = json.loads(json.dumps(val))
        except:
            safe_locals[var] = repr(val)
       
        
            
        
        
     
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
        # "code": codeLine,
        #  "changed_vars": changedVars,
        # "changed_values": changed_values,  # NEW: add changed_values dict
        "scope": scope_type,
        "depth": CodeDepth,
        "var_types": type_info,
        "branch_taken": branch_taken
    })

    prevVars = {k: v for k, v in safe_locals.items() if k != "__code_lines__"}
    return traceSteps


def runCode(code: str):
    global tracer, prevVars, CodeDepth, print_buffer,tracingSteps, MainLines,START_AT

    tracer = []
    prevVars = {}
    CodeDepth = 0
    print_buffer = io.StringIO()
    tracingSteps = False
    MainLines = set(FilterCode(code)) # this is tho hold lines number not def class import lines 
    START_AT = min(MainLines) if MainLines else 1

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
