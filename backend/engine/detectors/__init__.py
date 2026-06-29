"""Data-structure inference.

``detect_type(value, name)`` returns a short type tag (e.g. ``"linked_list"``,
``"binary_tree"``, ``"dp_grid"``, ``"stack"``) by asking each detector family
in priority order. The first confident answer wins; otherwise we fall back to
``"array"`` / ``"object"`` / ``"primitive"`` so something always renders.

Adding support for a new structure = add a detector here. That is the whole
"scalable engine" idea: renderers key off these tags, so one new tag can unlock
a whole class of problems.
"""

from __future__ import annotations

from typing import Any

from . import trees, graph, linear, structural

# Order matters: most specific first.
PRIMITIVE = (int, float, str, bool, type(None))


def detect_type(val: Any, name: str = "") -> str:
    try:
        if isinstance(val, PRIMITIVE):
            return "primitive"

        # Custom classes: trees, then linked structures.
        if hasattr(val, "__dict__"):
            t = trees.detect(val)
            if t:
                return t
            t = structural.detect(val)
            if t:
                return t
            return "object" if vars(val) else "constructing"

        # dict-like.
        if isinstance(val, dict):
            t = graph.detect(val, name)
            if t:
                return t
            return "object"

        # list / tuple / deque / set.
        t = linear.detect(val, name)
        if t:
            return t

        if callable(val):
            return "function"
        return type(val).__name__.lower()
    except Exception:
        return "unknown"
