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

def analyze_object_structure(obj):
    """Analyze an object's structure to understand its properties"""
    if not hasattr(obj, '__dict__'):
        return None
    
    attrs = get_object_attributes(obj)
    if not attrs:
        return None
    
    analysis = {
        'has_object_references': [],
        'has_primitive_data': [],
        'self_references': [],
        'circular_references': [],
        'total_attrs': len(attrs)
    }
    
    for attr_name, attr_value in attrs.items():
        if attr_value is None:
            continue
            
        # Check if it's a primitive data type
        if isinstance(attr_value, (int, float, str, bool)):
            analysis['has_primitive_data'].append(attr_name)
        
        # Check if it's an object reference
        elif hasattr(attr_value, '__dict__'):
            analysis['has_object_references'].append(attr_name)
            
            # Check for self-reference (pointing to same type)
            if type(attr_value) == type(obj):
                analysis['self_references'].append(attr_name)
            
            # Check for circular reference
            if attr_value is obj:
                analysis['circular_references'].append(attr_name)
    
    return analysis

def is_likely_container(obj, analysis):
    """Check if an object is more likely a container than a node"""
    attrs = get_object_attributes(obj)
    
    # Container indicators:
    # 1. Has very few attributes (usually just 1-3: head, size, etc.)
    # 2. Points to objects that look like nodes
    # 3. Doesn't have typical "data" attributes
    # 4. Often has only one main object reference
    
    if analysis['total_attrs'] > 3:
        return False  # Containers are usually very simple
    
    if len(analysis['has_primitive_data']) > 1:
        return False  # Containers usually don't store much data
    
    # Check if it points to potential nodes
    for attr_name, attr_value in attrs.items():
        if attr_value and hasattr(attr_value, '__dict__'):
            node_analysis = analyze_object_structure(attr_value)
            if node_analysis:
                # Check if the referenced object looks like a node
                has_data = len(node_analysis['has_primitive_data']) > 0
                has_refs = len(node_analysis['has_object_references']) > 0
                is_small = node_analysis['total_attrs'] <= 4
                
                if has_data and has_refs and is_small:
                    return True  # This points to a node-like object
    
    return False

def detect_node_pattern(obj):
    """Detect if an object follows a node pattern"""
    analysis = analyze_object_structure(obj)
    if not analysis:
        return None
    
    # Node characteristics:
    # 1. Has at least one object reference (for linking)
    # 2. Usually has some data storage
    # 3. Object references often point to same type (self-references)
    # 4. Typically small number of attributes (2-4)
    # 5. CRITICAL: Should NOT be a container
    
    has_object_refs = len(analysis['has_object_references']) > 0
    has_self_refs = len(analysis['self_references']) > 0
    has_data = len(analysis['has_primitive_data']) > 0
    is_small = analysis['total_attrs'] <= 6
    
    # IMPROVED: Check if this looks more like a container first
    if is_likely_container(obj, analysis):
        return None  # Don't classify containers as nodes
    
    if has_object_refs and is_small:
        # Must have some data or be part of a clear chain
        if has_data or has_self_refs:
            # Determine node type
            if len(analysis['self_references']) >= 2:
                return "doubly_linked_node"
            elif has_self_refs or len(analysis['has_object_references']) >= 1:
                return "linked_list_node"
        
    return None

def detect_container_pattern(obj):
    """Detect if an object follows a container pattern"""
    analysis = analyze_object_structure(obj)
    if not analysis:
        return None
    
    # First check if it's likely a container
    if not is_likely_container(obj, analysis):
        return None
    
    attrs = get_object_attributes(obj)
    
    for attr_name, attr_value in attrs.items():
        if attr_value is None:
            continue
            
        if hasattr(attr_value, '__dict__'):
            # Check if the referenced object looks like a node
            node_type = detect_node_pattern(attr_value)
            if node_type:
                # This container points to a node-like object
                if node_type == "doubly_linked_node":
                    return "doubly_linked_list"
                else:
                    return "linked_list"
            
            # Even if not detected as node, check structure
            node_analysis = analyze_object_structure(attr_value)
            if node_analysis:
                has_data = len(node_analysis['has_primitive_data']) > 0
                has_refs = len(node_analysis['has_object_references']) > 0
                
                if has_data and has_refs:
                    # Determine list type by checking for bidirectional references
                    ref_attrs = get_object_attributes(attr_value)
                    bidirectional_count = 0
                    for ref_attr_name, ref_attr_value in ref_attrs.items():
                        if ref_attr_value and hasattr(ref_attr_value, '__dict__'):
                            bidirectional_count += 1
                    
                    if bidirectional_count >= 2:
                        return "doubly_linked_list"
                    else:
                        return "linked_list"
    
    return None

def find_head_node(obj):
    """Find the head node from a container or node object"""
    if not hasattr(obj, '__dict__'):
        return None
    
    attrs = get_object_attributes(obj)
    analysis = analyze_object_structure(obj)
    
    # Strategy 1: If this looks like a container, find its head reference
    if analysis and is_likely_container(obj, analysis):
        for attr_name, attr_value in attrs.items():
            if attr_value and hasattr(attr_value, '__dict__'):
                if detect_node_pattern(attr_value):
                    return attr_value
                # Even if not perfect node, if it has the right structure
                node_analysis = analyze_object_structure(attr_value)
                if (node_analysis and 
                    len(node_analysis['has_primitive_data']) > 0 and 
                    len(node_analysis['has_object_references']) >= 0):  # Allow 0 for single nodes
                    return attr_value
    
    # Strategy 2: If this object looks like a node itself, use it
    elif detect_node_pattern(obj):
        return obj
    
    return None

def find_chain_structure(start_obj):
    """Find and analyze a chain structure starting from an object"""
    if not start_obj or not hasattr(start_obj, '__dict__'):
        return None
    
    # Try to find the actual starting node
    head_node = find_head_node(start_obj)
    if not head_node:
        return None
    
    # Analyze the chain
    chain_info = {
        'nodes': [],
        'is_circular': False,
        'is_doubly_linked': False,
        'chain_length': 0
    }
    
    visited = set()
    current = head_node
    node_id = 0
    
    while current and id(current) not in visited and node_id < 100:  # Safety limit
        visited.add(id(current))
        
        # Analyze current node
        attrs = get_object_attributes(current)
        if not attrs:
            break
        
        # Find data value (first primitive found)
        data_value = None
        for attr_name, attr_value in attrs.items():
            if isinstance(attr_value, (int, float, str, bool)):
                data_value = attr_value
                break
        
        # Find next node and track connections
        next_node = None
        prev_node = None
        connections = {}
        
        for attr_name, attr_value in attrs.items():
            if attr_value and hasattr(attr_value, '__dict__'):
                # Check if this points to a previous node
                for i, prev_node_info in enumerate(chain_info['nodes']):
                    if attr_value is prev_node_info['object']:
                        connections['prev'] = i
                        prev_node = attr_value
                        chain_info['is_doubly_linked'] = True
                        break
                else:
                    # This might be the next node
                    if next_node is None:
                        next_node = attr_value
                        connections['next'] = 'pending'
        
        # Store node info
        chain_info['nodes'].append({
            'id': node_id,
            'object': current,
            'value': data_value,
            'connections': connections
        })
        
        current = next_node
        node_id += 1
        chain_info['chain_length'] += 1
    
    # Update pending next connections
    for i, node in enumerate(chain_info['nodes']):
        if 'next' in node['connections'] and node['connections']['next'] == 'pending':
            if i + 1 < len(chain_info['nodes']):
                node['connections']['next'] = i + 1
            else:
                del node['connections']['next']
    
    return chain_info

def detect_linked_list_type_structural(obj):
    """Main structural detection function with improved logic"""
    if not obj or not hasattr(obj, '__dict__'):
        return None
    
    # FIXED: Check container pattern FIRST, then node pattern
    container_type = detect_container_pattern(obj)
    if container_type:
        return container_type
    
    # Only check node pattern if it's not a container
    node_type = detect_node_pattern(obj)
    if node_type:
        return node_type
    
    # If neither works, try chain analysis as fallback
    chain_info = find_chain_structure(obj)
    if chain_info and chain_info['chain_length'] > 0:
        if chain_info['is_doubly_linked']:
            return "doubly_linked_list" if chain_info['chain_length'] > 1 else "doubly_linked_node"
        else:
            return "linked_list" if chain_info['chain_length'] > 1 else "linked_list_node"
    
    return None

def traverse_linked_structure_structural(start_obj):
    """Traverse linked structure using structural analysis"""
    chain_info = find_chain_structure(start_obj)
    if not chain_info or not chain_info['nodes']:
        return []
    
    # Convert to the expected format
    nodes = []
    for node_info in chain_info['nodes']:
        # Clean up connections (remove object references, keep only indices)
        clean_connections = {}
        for conn_type, conn_value in node_info['connections'].items():
            if isinstance(conn_value, int):
                clean_connections[conn_type] = conn_value
        
        nodes.append({
            'id': node_info['id'],
            'value': safe_json_serialize(node_info['value']),
            'connections': clean_connections
        })
    
    return nodes

def create_linked_structure_json_structural(obj, structure_type):
    """Create JSON representation using structural analysis"""
    nodes = traverse_linked_structure_structural(obj)
    
    # Normalize type name for display
    display_type = structure_type
    if display_type.endswith('_node'):
        display_type = display_type[:-5]  # Remove '_node' suffix
    
    return {
        "type": display_type,
        "nodes": nodes,
        "head": 0 if nodes else None
    }

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

def detectType(val):
    """Main type detection function using structural analysis"""
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
        
        # Check for linked structures using structural analysis
        linked_type = detect_linked_list_type_structural(val)
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
            
        var_type = detectType(val)  # Uses structural analysis
        type_info[var] = var_type
        
        # Handle linked structures - these get special JSON representation
        if var_type in ("linked_list", "linked_list_node", "doubly_linked_list", "doubly_linked_node"):
            try:
                linked_json = create_linked_structure_json_structural(val, var_type)
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