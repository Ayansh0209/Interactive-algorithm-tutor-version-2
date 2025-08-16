import sys
import linecache
import ast
import io
import json

tracer = []
prevVars = {}
CodeDepth = 0
print_buffer = io.StringIO()
FORBIDDEN_KEYWORDS = [
    "import os", "import sys", "subprocess", "open(", "exec(", "eval(",
    "import shutil", "from os", "from sys", "socket", "threading", "multiprocessing"
]

def is_code_safe(code):
    lowered = code.lower()
    return not any(kw in lowered for kw in FORBIDDEN_KEYWORDS)

def get_object_attributes(obj):
    """Get non-method attributes of an object"""
    attrs = {}
    if not hasattr(obj, '__dict__'):
        return attrs
    
    try:
        for attr_name, attr_value in obj.__dict__.items():
            if not callable(attr_value):
                attrs[attr_name] = attr_value
    except:
        pass
    return attrs

def detect_linked_list_type(obj):
    """Detect if object is a linked list container or node"""
    if not hasattr(obj, '__dict__'):
        return None
    
    attrs = get_object_attributes(obj)
    class_name = type(obj).__name__.lower()
    
    # Use class name as primary indicator
    if 'doublylinkedlist' in class_name or 'doublelinkedlist' in class_name:
        return "doubly_linked_list"
    elif 'linkedlist' in class_name:
        return "linked_list"
    elif 'dnode' in class_name or ('node' in class_name and any(attr in attrs for attr in ['prev', 'prev_ref'])):
        return "doubly_linked_node"
    elif 'node' in class_name:
        return "linked_list_node"
    
    # Check for container patterns (has head/root reference)
    container_indicators = ['head', 'head_node', 'root', 'first']
    for indicator in container_indicators:
        if indicator in attrs:
            ref_obj = attrs[indicator]
            if ref_obj is not None and hasattr(ref_obj, '__dict__'):
                # Check if referenced object looks like a node
                ref_attrs = get_object_attributes(ref_obj)
                node_indicators = ['next', 'next_ref', 'prev', 'prev_ref', 'left', 'right', 'data', 'value']
                if any(ind in ref_attrs for ind in node_indicators):
                    # Determine list type based on node structure
                    if any(ind in ref_attrs for ind in ['prev', 'prev_ref']):
                        return "doubly_linked_list"
                    else:
                        return "linked_list"
            # Empty container - check class name for hints
            elif ref_obj is None:
                if 'doubly' in class_name.lower():
                    return "doubly_linked_list"
                else:
                    return "linked_list"
    
    # Check for node patterns
    node_indicators = ['next', 'next_ref', 'prev', 'prev_ref', 'left', 'right']
    data_indicators = ['data', 'value', 'val']
    
    has_node_ref = any(ind in attrs for ind in node_indicators)
    has_data = any(ind in attrs for ind in data_indicators)
    
    if has_node_ref or has_data:
        # Check if it's doubly linked
        if any(ind in attrs for ind in ['prev', 'prev_ref']):
            return "doubly_linked_node"
        else:
            return "linked_list_node"
    
    return None

def traverse_linked_structure(start_obj):
    """Traverse and map a linked structure"""
    if not start_obj:
        return []
    
    # If it's a container, find the head
    head_node = start_obj
    container_attrs = get_object_attributes(start_obj)
    
    for head_attr in ['head', 'head_node', 'root', 'first']:
        if head_attr in container_attrs and container_attrs[head_attr] is not None:
            head_node = container_attrs[head_attr]
            break
    
    if not head_node or not hasattr(head_node, '__dict__'):
        return []
    
    # Traverse the linked structure
    nodes = []
    visited = set()
    current = head_node
    node_id = 0
    id_to_index = {}
    
    # First pass: collect all nodes
    while current and id(current) not in visited:
        visited.add(id(current))
        id_to_index[id(current)] = node_id
        
        attrs = get_object_attributes(current)
        
        # Find data value
        data_value = None
        for data_attr in ['data', 'value', 'val']:
            if data_attr in attrs:
                data_value = attrs[data_attr]
                break
        
        # Store raw connections for now
        raw_connections = {}
        for ref_attr in ['next', 'next_ref', 'prev', 'prev_ref', 'left', 'right']:
            if ref_attr in attrs and attrs[ref_attr] is not None:
                raw_connections[ref_attr] = id(attrs[ref_attr])
        
        nodes.append({
            'id': node_id,
            'value': data_value,
            'raw_connections': raw_connections
        })
        
        node_id += 1
        
        # Move to next node (prefer 'next' or 'next_ref')
        next_node = None
        for next_attr in ['next', 'next_ref']:
            if next_attr in attrs:
                next_node = attrs[next_attr]
                break
        current = next_node
        
        # Safety limit
        if len(nodes) > 50:
            break
    
    # Second pass: convert object IDs to node indices
    for node in nodes:
        connections = {}
        for attr, obj_id in node['raw_connections'].items():
            if obj_id in id_to_index:
                connections[attr] = id_to_index[obj_id]
        node['connections'] = connections
        del node['raw_connections']
    
    return nodes

def create_linked_structure_json(obj, structure_type):
    """Create JSON representation of linked structure"""
    nodes = traverse_linked_structure(obj)
    
    # Normalize type name for display
    display_type = structure_type
    if display_type.endswith('_node'):
        display_type = display_type[:-5]  # Remove '_node' suffix
    
    # Ensure all values in nodes are JSON serializable
    safe_nodes = []
    for node in nodes:
        safe_node = {
            "id": node["id"],
            "value": safe_json_serialize(node["value"]),
            "connections": node["connections"]  # These should be integers
        }
        safe_nodes.append(safe_node)
    
    return {
        "type": display_type,
        "nodes": safe_nodes,
        "head": 0 if safe_nodes else None
    }

def detectType(val):
    """Main type detection function"""
    try:
        # Handle None and primitives
        if val is None or isinstance(val, (int, float, str, bool)):
            return "primitive"
        if isinstance(val, (list, tuple)):
            return "array"
        if isinstance(val, dict):
            return "object"
        if callable(val):
            return "function"
        
        # Check for linked structures
        linked_type = detect_linked_list_type(val)
        if linked_type:
            return linked_type
        
        # Check if object is being constructed (has no attributes yet)
        if hasattr(val, '__dict__'):
            attrs = get_object_attributes(val)
            if not attrs:
                return "constructing"
            
        # Default to class name
        return type(val).__name__.lower()
        
    except Exception:
        return "unknown"

def ensure_json_serializable(obj):
    """Recursively ensure all objects are JSON serializable"""
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj
    elif isinstance(obj, dict):
        return {k: ensure_json_serializable(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [ensure_json_serializable(item) for item in obj]
    else:
        # Any other type - convert to string
        if hasattr(obj, '__dict__'):
            return f"<{type(obj).__name__} object>"
        else:
            return str(obj)
def safe_json_serialize(val):
    """Safely serialize a value to JSON-compatible format"""
    return ensure_json_serializable(val)

def FilterCode(sourceCode):
    """Filter executable lines from source code"""
    tree = ast.parse(sourceCode)
    exec_lines = set()

    def is_skipped_top_stmt(node):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef, ast.Import, ast.ImportFrom)):
            return True
        if isinstance(node, ast.Expr) and isinstance(getattr(node, "value", None), ast.Constant) and isinstance(node.value.value, str):
            return True
        return False

    for node in getattr(tree, "body", []):
        if is_skipped_top_stmt(node):
            continue
        start = getattr(node, "lineno", None)
        end = getattr(node, "end_lineno", start)
        if start is not None:
            exec_lines.update(range(start, (end or start) + 1))

    return sorted(exec_lines)

tracingSteps = False
MainLines = set()
    
def traceSteps(frame, event, arg):
    global prevVars, CodeDepth, tracingSteps

    if event not in ["call", "line", "return"]:
        return traceSteps

    codeLine = linecache.getline(frame.f_code.co_filename, frame.f_lineno).strip()
    if not codeLine and "__code_lines__" in frame.f_globals:
        try:
            codeLine = frame.f_globals["__code_lines__"][frame.f_lineno - 1].strip()
        except:
            codeLine = ""

    funcName = frame.f_code.co_name
    
    # Skip lines before main execution starts
    if frame.f_code.co_name == "<module>" and frame.f_lineno < START_AT:
        return traceSteps

    # Only start tracing when we hit main execution lines
    if not tracingSteps:
        if frame.f_lineno not in MainLines:
            return traceSteps
    
    # Check if we have user variables to start tracing
    user_locals = {k: v for k, v in frame.f_locals.items() if not k.startswith("__")}
    if any(not callable(v) for v in user_locals.values()):
        tracingSteps = True
    else:
        return traceSteps

    # Clean up frame locals - exclude Python internals
    clean_locals = {k: v for k, v in frame.f_locals.items() 
                   if not k.startswith("__") and k != "__code_lines__"}

    safe_locals = {}
    type_info = {}

    for var, val in clean_locals.items():
        if callable(val):
            continue
            
        var_type = detectType(val)
        type_info[var] = var_type
        
        # Handle linked structures - these get special JSON representation
        if var_type in ("linked_list", "linked_list_node", "doubly_linked_list", "doubly_linked_node"):
            try:
                linked_json = create_linked_structure_json(val, var_type)
                safe_locals[var] = linked_json
            except Exception as e:
                # Fallback for errors
                display_type = var_type.replace("_node", "") if var_type.endswith("_node") else var_type
                safe_locals[var] = {
                    "type": display_type,
                    "nodes": [],
                    "head": None,
                    "error": str(e)[:100]
                }
        # Handle constructing objects
        elif var_type == "constructing":
            safe_locals[var] = f"<{type(val).__name__} constructing...>"
        else:
            # Handle ALL other values through safe serialization
            safe_locals[var] = safe_json_serialize(val)

    # Detect scope type
    scope_type = None
    if event == "call":
        scope_type = "function"
    elif codeLine.startswith(("for ", "while ")):
        scope_type = "loop"
    elif codeLine.startswith(("if ", "elif ", "else")):
        scope_type = "conditional"

    # Branch detection for conditionals
    branch_taken = None
    if scope_type == "conditional" and event == "line":
        try:
            # Simple heuristic - this is approximate
            if codeLine.startswith("if "):
                condition = codeLine[3:].rstrip(":")
                branch_taken = eval(condition, frame.f_globals, frame.f_locals)
            elif codeLine.startswith("elif "):
                condition = codeLine[5:].rstrip(":")
                branch_taken = eval(condition, frame.f_globals, frame.f_locals)
            elif codeLine.startswith("else"):
                branch_taken = True
        except:
            branch_taken = None

    # Track call depth
    if event == "call":
        CodeDepth += 1
    elif event == "return":
        CodeDepth -= 1

    # Create trace entry - ensure everything is JSON serializable
    trace_entry = {
        "event": event,
        "line": frame.f_lineno,
        "function": funcName,
        "locals": ensure_json_serializable(safe_locals),
        "scope": scope_type,
        "depth": CodeDepth,
        "var_types": type_info,
        "branch_taken": branch_taken
    }

    tracer.append(trace_entry)
    prevVars = {k: v for k, v in safe_locals.items()}
    return traceSteps

def runCode(code: str):
    global tracer, prevVars, CodeDepth, print_buffer, tracingSteps, MainLines, START_AT

    # Reset global state
    tracer = []
    prevVars = {}
    CodeDepth = 0
    print_buffer = io.StringIO()
    tracingSteps = False
    MainLines = set(FilterCode(code))
    START_AT = min(MainLines) if MainLines else 1

    # Safety check
    if not is_code_safe(code):
        return [{
            "event": "exception",
            "error": "Unsafe code detected. Use of restricted functions/modules is not allowed."
        }]

    try:
        # Prepare execution environment
        globals_dict = {"__code_lines__": code.splitlines()}
        
        # Capture stdout
        old_stdout = sys.stdout
        sys.stdout = print_buffer

        # Execute with tracing
        compiled = compile(code, "<string>", "exec")
        sys.settrace(traceSteps)
        exec(compiled, globals_dict)
        sys.settrace(None)

        # Restore stdout
        sys.stdout = old_stdout
        
        # Capture any printed output
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

    # FINAL SAFETY: Ensure the entire tracer output is JSON serializable
    safe_tracer = ensure_json_serializable(tracer)
    return safe_tracer