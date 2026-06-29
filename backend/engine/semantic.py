"""Derive *semantic events* from raw frame-to-frame changes.

Semantic events are the difference between "1000 raw line steps" and "the 40
moments a learner actually cares about": a swap, a comparison, a value written
to an array cell, a recursion enter/exit. The frontend's default timeline shows
semantic steps; raw stepping is opt-in.

All functions here are pure (no global state) so they are trivially testable.
"""

from __future__ import annotations

from typing import Any

# Lightweight keyword classification of the current source line.
_KEYWORDS = {
    "append": "push", "push": "push", "add(": "push",
    "pop": "pop", "popleft": "pop", "heappush": "push", "heappop": "pop",
    "return": "return", "swap": "swap",
}


def classify_line(code_line: str):
    s = code_line.strip()
    if s.startswith(("if ", "elif ", "while ")):
        return "compare"
    if s.startswith("return"):
        return "return"
    for needle, tag in _KEYWORDS.items():
        if needle in s:
            return tag
    if "=" in s and not s.startswith(("def ", "class ", "for ", "==")):
        return "assign"
    return None


def changed_vars(prev: dict, cur: dict):
    """Names whose serialized value changed (or appeared) since the last step."""
    out = []
    for k, v in cur.items():
        if k not in prev or prev[k] != v:
            out.append(k)
    return out


def array_writes(prev_val: Any, cur_val: Any):
    """Index-level writes between two list states; flags pairwise swaps."""
    if not isinstance(prev_val, list) or not isinstance(cur_val, list):
        return []
    if len(prev_val) != len(cur_val):
        return []
    diffs = [i for i in range(len(cur_val)) if prev_val[i] != cur_val[i]]
    if not diffs:
        return []
    # Detect a clean swap (exactly two positions exchanged).
    if len(diffs) == 2:
        i, j = diffs
        if prev_val[i] == cur_val[j] and prev_val[j] == cur_val[i]:
            return [{"kind": "swap", "i": i, "j": j,
                     "values": [cur_val[i], cur_val[j]]}]
    return [{"kind": "write", "index": i, "from": prev_val[i], "to": cur_val[i]}
            for i in diffs]


def build_events(code_line: str, prev_locals: dict, cur_locals: dict,
                 event: str, function: str = ""):
    """Assemble the semantic events for one step."""
    events = []

    # Only real function frames count as recursion enter/exit (not <module>).
    if function and function != "<module>":
        if event == "call":
            events.append({"kind": "recursion_enter"})
        elif event == "return":
            events.append({"kind": "recursion_exit"})

    tag = classify_line(code_line)
    if tag:
        events.append({"kind": tag})

    # Array-level writes/swaps for any list local that changed.
    for name, cur in cur_locals.items():
        prev = prev_locals.get(name)
        for w in array_writes(prev, cur):
            events.append({"target": name, **w})

    return events
