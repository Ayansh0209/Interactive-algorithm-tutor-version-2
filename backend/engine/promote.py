"""Access-pattern promotion: relabel list-like variables by HOW they are used
across the whole trace, not by their name.

Runs once after execution. For each list/array variable it scans the source
line of every step it appears on and classifies the role:
  append + popleft/pop(0)      -> queue
  append + pop() (end only)    -> stack
  heappush/heappop             -> heap
  self-referential index       -> dsu  (parent[x] = parent[parent[x]])
Then it rewrites ``var_types[name]`` to that role in every step. Scenes are
already plain lists, which the stack/queue renderers accept, so only the type
tag changes. Genuine linked lists / trees / graphs are never touched.
"""

from __future__ import annotations

import re

LISTLIKE = {"array", "dp_array", "matrix", "dp_grid", "stack", "queue", "deque", "heap", "dsu"}

_APPEND = re.compile(r"\b(\w+)\s*\.\s*append\s*\(")
_ADD = re.compile(r"\b(\w+)\s*\.\s*add\s*\(")
_POP_END = re.compile(r"\b(\w+)\s*\.\s*pop\s*\(\s*\)")
_POPLEFT = re.compile(r"\b(\w+)\s*\.\s*popleft\s*\(")
_POP0 = re.compile(r"\b(\w+)\s*\.\s*pop\s*\(\s*0\s*\)")
_HEAPPUSH = re.compile(r"heappush\s*\(\s*(\w+)")
_HEAPPOP = re.compile(r"heappop\s*\(\s*(\w+)")
# nested self-index: parent[ parent[x] ] -> union-find path compression (strong, unambiguous)
_SELF_INDEX = re.compile(r"\b(\w+)\s*\[[^\]]*\b\1\s*\[")


def _sig():
    return {"append": 0, "pop_end": 0, "pop_front": 0, "heap": 0, "self_index": 0}


def promote(steps: list) -> None:
    """Mutate ``steps`` in place: relabel list-like vars by access pattern."""
    usage: dict[str, dict] = {}

    def bump(name, key):
        usage.setdefault(name, _sig())[key] += 1

    for s in steps:
        code = s.get("code", "") or ""
        for m in _APPEND.finditer(code): bump(m.group(1), "append")
        for m in _ADD.finditer(code): bump(m.group(1), "append")
        for m in _POPLEFT.finditer(code): bump(m.group(1), "pop_front")
        for m in _POP0.finditer(code): bump(m.group(1), "pop_front")
        for m in _POP_END.finditer(code): bump(m.group(1), "pop_end")
        for m in _HEAPPUSH.finditer(code): bump(m.group(1), "heap")
        for m in _HEAPPOP.finditer(code): bump(m.group(1), "heap")
        for m in _SELF_INDEX.finditer(code): bump(m.group(1), "self_index")

    role: dict[str, str] = {}
    for name, u in usage.items():
        if u["heap"]:
            role[name] = "heap"
        elif u["append"] and u["pop_front"]:
            role[name] = "queue"
        elif u["append"] and u["pop_end"]:
            role[name] = "stack"
        elif u["self_index"]:
            role[name] = "dsu"

    if not role:
        return

    # Relabel across every step, but only when the current tag is generic
    # list-like (never override a detected linked_list / tree / graph).
    for s in steps:
        vt = s.get("var_types", {})
        for name, r in role.items():
            if name in vt and vt[name] in LISTLIKE:
                vt[name] = r
