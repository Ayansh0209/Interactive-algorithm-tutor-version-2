"""Turn live Python values into JSON-safe scene data.

Two layers:
  * ``json_safe`` / ``deep_json_safe`` -- last-resort "make it serializable".
  * The structure serializers (linked list, tree, trie, segment tree, graph)
    -- produce rich, renderer-ready scene dicts.

Every serializer is cycle-safe (tracks visited object ids) and depth-capped so
a pathological input can never hang the worker.
"""

from __future__ import annotations

from typing import Any

MAX_NODES = 500          # hard cap on nodes walked per structure
MAX_DEPTH = 64           # recursion depth cap for tree/trie walks


# --------------------------------------------------------------------------- #
# Generic JSON safety
# --------------------------------------------------------------------------- #
def deep_json_safe(obj: Any, _depth: int = 0) -> Any:
    """Recursively coerce any object into something ``json.dumps`` accepts."""
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj
    if _depth > MAX_DEPTH:
        return "<max-depth>"
    if isinstance(obj, dict):
        return {str(k): deep_json_safe(v, _depth + 1) for k, v in obj.items()}
    if isinstance(obj, (list, tuple, set, frozenset)):
        return [deep_json_safe(v, _depth + 1) for v in obj]
    if type(obj).__name__ == "deque":
        return [deep_json_safe(v, _depth + 1) for v in obj]
    if hasattr(obj, "__dict__"):
        # Compact tag with the node's value ("<ListNode 4>"), not an opaque
        # "<ListNode object>" -- heaps of (key, node) tuples stay readable.
        return _compact_obj(obj)
    return str(obj)


def json_safe(val: Any) -> Any:
    """Single-value JSON coercion (alias kept for readability at call sites)."""
    return deep_json_safe(val)


# --------------------------------------------------------------------------- #
# Object attribute helpers (shared by detectors + serializers)
# --------------------------------------------------------------------------- #
def get_attrs(obj: Any) -> dict[str, Any]:
    """Non-callable instance attributes of ``obj`` (empty dict if none)."""
    if not hasattr(obj, "__dict__"):
        return {}
    out = {}
    try:
        for name, value in vars(obj).items():
            if not callable(value):
                out[name] = value
    except Exception:
        pass
    return out


def _first_attr(node: Any, names: tuple[str, ...]) -> Any:
    for name in names:
        if hasattr(node, name):
            return getattr(node, name)
    return None


VAL_ATTRS_EARLY = ("val", "value", "key", "data", "item")


def _compact_obj(v: Any) -> Any:
    """A short tag for a nested object field: ``<Node 4>`` (class + its value)
    or ``<Node>``, so an object's attributes read cleanly instead of dumping
    ``<Node object>`` for every pointer field. Containers summarize shallowly
    (never recurse -- deep_json_safe may call us from inside a cycle)."""
    if v is None or isinstance(v, (int, float, str, bool)):
        return v
    if isinstance(v, (list, tuple)):
        if len(v) <= 6 and all(isinstance(x, (int, float, str, bool, type(None))) for x in v):
            return list(v)
        return f"[{len(v)} items]"
    if isinstance(v, (set, frozenset)):
        return f"{{{len(v)} items}}"
    if isinstance(v, dict):
        if len(v) <= 6 and all(isinstance(x, (int, float, str, bool, type(None))) for x in v.values()):
            return {str(k): x for k, x in v.items()}
        return f"{{{len(v)} entries}}"
    if hasattr(v, "__dict__"):
        name = type(v).__name__
        inner = _first_attr(v, VAL_ATTRS_EARLY)
        if isinstance(inner, (int, float, str, bool)):
            return f"<{name} {inner}>"
        return f"<{name}>"
    return str(v)


def serialize_object(obj: Any) -> Any:
    """A class instance / mapping -> ``{type:'object', cls, fields}`` so the UI
    can show its attributes (e.g. a Node's ``val`` / ``next``) or a dict's
    key->value pairs, instead of an opaque ``<Foo object>`` / empty box. Nested
    objects are shown as compact tags."""
    if obj is None or isinstance(obj, (int, float, str, bool)):
        return obj
    # A plain dict used as a map/lookup: show its items as fields.
    if isinstance(obj, dict):
        fields = {}
        for k, v in list(obj.items())[:MAX_NODES]:
            fields[str(k)] = _compact_obj(v)
        return {"type": "object", "cls": "dict", "fields": fields}
    cls = type(obj).__name__
    fields: dict[str, Any] = {}
    try:
        for k, v in vars(obj).items():
            if k.startswith("__") or callable(v):
                continue
            fields[str(k)] = _compact_obj(v)
    except Exception:
        pass
    return {"type": "object", "cls": cls, "fields": fields}


VAL_ATTRS = ("val", "value", "key", "data", "item")
LEFT_ATTRS = ("left", "left_child", "lc", "l")
RIGHT_ATTRS = ("right", "right_child", "rc", "r")
NEXT_ATTRS = ("next", "nxt", "next_node")
PREV_ATTRS = ("prev", "previous", "prev_node")


# --------------------------------------------------------------------------- #
# Linked list serialization (singly / doubly / circular)
# --------------------------------------------------------------------------- #
def serialize_linked_list(head: Any) -> dict:
    """Walk a node chain into ``{type, nodes, head}``.

    A node is anything exposing a value attr and a ``next``-style attr. Handles
    a wrapper object (``LinkedList`` with ``.head``) by unwrapping first.
    """
    # Unwrap a container that holds the real head.
    if head is not None and not _looks_like_node(head):
        inner = _first_attr(head, ("head", "root", "front", "first"))
        if inner is not None:
            head = inner

    nodes: list[dict] = []
    index_by_id: dict[int, int] = {}
    is_doubly = False
    is_circular = False

    current = head
    while current is not None and len(nodes) < MAX_NODES:
        if id(current) in index_by_id:
            is_circular = True
            break
        idx = len(nodes)
        index_by_id[id(current)] = idx

        value = _first_attr(current, VAL_ATTRS)
        if _first_attr(current, PREV_ATTRS) is not None:
            is_doubly = True

        nodes.append({"id": idx, "value": json_safe(value), "next": None, "prev": None})
        current = _first_attr(current, NEXT_ATTRS)

    # Resolve next/prev indices.
    for i, node in enumerate(nodes):
        if i + 1 < len(nodes):
            node["next"] = i + 1
    if is_circular and nodes:
        nodes[-1]["next"] = index_by_id.get(id(head), 0)
    if is_doubly:
        for i in range(1, len(nodes)):
            nodes[i]["prev"] = i - 1

    return {
        "type": "doubly_linked_list" if is_doubly else "linked_list",
        "circular": is_circular,
        "nodes": nodes,
        "head": 0 if nodes else None,
    }


def _looks_like_node(obj: Any) -> bool:
    attrs = get_attrs(obj)
    if not attrs:
        return False
    has_link = any(k in attrs for k in NEXT_ATTRS + PREV_ATTRS)
    return has_link


# --------------------------------------------------------------------------- #
# Tree serialization (binary / BST / AVL / red-black)
# --------------------------------------------------------------------------- #
def serialize_tree(node: Any, kind: str = "binary_tree", visited: set | None = None,
                   depth: int = 0) -> Any:
    if visited is None:
        visited = set()
    if node is None:
        return None
    if depth > MAX_DEPTH or len(visited) > MAX_NODES:
        return {"val": "<truncated>"}
    if id(node) in visited:
        return {"val": "<cycle>"}
    visited.add(id(node))

    out = {
        "val": json_safe(_first_attr(node, VAL_ATTRS)),
        "left": serialize_tree(_first_attr(node, LEFT_ATTRS), kind, visited, depth + 1),
        "right": serialize_tree(_first_attr(node, RIGHT_ATTRS), kind, visited, depth + 1),
    }
    if kind == "red_black_tree":
        color = _first_attr(node, ("color", "is_red", "red"))
        out["color"] = "red" if color in (True, "red", "r", "R", 1) else "black"
    elif kind == "avl_tree":
        out["height"] = _first_attr(node, ("height", "balance", "bf"))
    return out


def serialize_nary_tree(node: Any, visited: set | None = None, depth: int = 0) -> Any:
    if visited is None:
        visited = set()
    if node is None:
        return None
    if depth > MAX_DEPTH or id(node) in visited or len(visited) > MAX_NODES:
        return {"val": "<truncated>"}
    visited.add(id(node))
    children = _first_attr(node, ("children", "child", "kids", "neighbors")) or []
    return {
        "val": json_safe(_first_attr(node, VAL_ATTRS)),
        "children": [serialize_nary_tree(c, visited, depth + 1) for c in children
                     if c is not None][:MAX_NODES],
    }


def serialize_segment_tree(node: Any, visited: set | None = None, depth: int = 0) -> Any:
    if visited is None:
        visited = set()
    if node is None:
        return None
    if depth > MAX_DEPTH or id(node) in visited:
        return {"val": "<cycle>"}
    visited.add(id(node))
    return {
        "start": json_safe(_first_attr(node, ("start", "lo", "left_range", "l"))),
        "end": json_safe(_first_attr(node, ("end", "hi", "right_range", "r"))),
        "val": json_safe(_first_attr(node, ("val", "sum", "min", "max", "value"))),
        "left": serialize_segment_tree(_first_attr(node, LEFT_ATTRS), visited, depth + 1),
        "right": serialize_segment_tree(_first_attr(node, RIGHT_ATTRS), visited, depth + 1),
    }


def serialize_trie(node: Any, visited: set | None = None, depth: int = 0) -> Any:
    if visited is None:
        visited = set()
    if node is None:
        return None
    if depth > MAX_DEPTH or id(node) in visited:
        return {"is_word": False, "children": {}}
    visited.add(id(node))

    children_obj = _first_attr(node, ("children", "next", "edges", "links"))
    # Keep the STORED WORD if the node carries one (word-search tries store the
    # matched string, e.g. "oath") -- don't collapse it to a bare boolean.
    word_attr = _first_attr(node, ("word",))
    end_attr = _first_attr(node, ("is_end_of_word", "is_word", "is_end", "end"))
    is_word = bool(end_attr) or (isinstance(word_attr, str) and word_attr != "")

    children: dict[str, Any] = {}
    if isinstance(children_obj, dict):
        for k, v in children_obj.items():
            if v is not None:
                children[str(k)] = serialize_trie(v, visited, depth + 1)
    elif isinstance(children_obj, (list, tuple)):
        for i, v in enumerate(children_obj):
            if v is not None:
                children[chr(ord("a") + i) if i < 26 else str(i)] = \
                    serialize_trie(v, visited, depth + 1)
    out = {"is_word": is_word, "children": children}
    if isinstance(word_attr, str) and word_attr:
        out["word"] = word_attr
    return out
