"""Scope, loop-metadata and branch-outcome detection for a single frame.

These give the frontend what it needs to draw the "for-loop box that counts up"
and to highlight which branch of an if/elif/else was actually taken.
"""

from __future__ import annotations

import re
from typing import Any

_FOR_RANGE = re.compile(
    r"for\s+(?P<var>\w+)\s+in\s+range\s*\((?P<args>[^)]*)\)"
)
_FOR_ENUM = re.compile(r"for\s+(?P<vars>[\w,\s]+)\s+in\s+enumerate\s*\(")
_FOR_IN = re.compile(r"for\s+(?P<var>[\w,\s]+)\s+in\s+(?P<iter>.+):")
_WHILE = re.compile(r"while\s+(?P<cond>.+):")


def scope_type(event: str, code_line: str) -> str | None:
    if event == "call":
        return "function"
    s = code_line.strip()
    if s.startswith(("for ", "for(")) or s.startswith(("while ", "while(")):
        return "loop"
    if s.startswith(("if ", "elif ", "else")):
        return "conditional"
    return None


def loop_meta(code_line: str, frame_locals: dict, frame_globals: dict) -> dict | None:
    """Best-effort structured description of a ``for``/``while`` header."""
    s = code_line.strip()

    m = _FOR_RANGE.search(s)
    if m:
        var = m.group("var")
        raw = [a.strip() for a in m.group("args").split(",") if a.strip()]
        bounds = []
        for a in raw:
            try:
                bounds.append(int(eval(a, {"__builtins__": {}}, {**frame_globals, **frame_locals})))
            except Exception:
                bounds.append(None)
        if len(bounds) == 1:
            start, stop, step = 0, bounds[0], 1
        elif len(bounds) == 2:
            start, stop, step = bounds[0], bounds[1], 1
        else:
            start, stop, step = bounds[0], bounds[1], bounds[2] or 1
        total = None
        if None not in (start, stop, step) and step != 0:
            total = max(0, (stop - start + (step - (1 if step > 0 else -1))) // step)
        current = frame_locals.get(var)
        cur_iter = None
        if isinstance(current, int) and start is not None and step:
            try:
                cur_iter = (current - start) // step
            except Exception:
                cur_iter = None
        return {
            "kind": "for_range", "index_var": var,
            "start": start, "stop": stop, "step": step,
            "total_iterations": total, "current_value": current,
            "current_iteration": cur_iter,
        }

    m = _FOR_ENUM.search(s)
    if m:
        return {"kind": "for_enumerate", "vars": [v.strip() for v in m.group("vars").split(",")]}

    m = _FOR_IN.search(s)
    if m and "range(" not in s and "enumerate(" not in s:
        return {"kind": "for_in", "vars": [v.strip() for v in m.group("var").split(",")],
                "iterable": m.group("iter").strip()}

    m = _WHILE.search(s)
    if m:
        return {"kind": "while", "condition": m.group("cond").strip()}

    return None


def branch_taken(code_line: str, frame_locals: dict, frame_globals: dict) -> bool | None:
    """Evaluate an if/elif condition to record which branch was taken.

    Uses a restricted ``eval`` (no builtins) on the condition only. Returns
    ``None`` if it cannot be evaluated safely.
    """
    s = code_line.strip().rstrip(":")
    try:
        if s.startswith("if "):
            cond = s[3:]
        elif s.startswith("elif "):
            cond = s[5:]
        elif s.startswith("else"):
            return True
        else:
            return None
        return bool(eval(cond, {"__builtins__": {}}, {**frame_globals, **frame_locals}))
    except Exception:
        return None
