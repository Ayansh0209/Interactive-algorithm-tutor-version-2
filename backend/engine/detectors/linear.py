"""Detect linear / indexed structures: arrays, matrices, stacks, queues, heaps.

Detection blends two signals:
  * the value's shape (1D vs 2D, all-numeric, etc.), and
  * the variable's *name* (``stack``, ``q``, ``dp``, ``parent`` ...), which in
    DSA code is a strong, conventional hint.

Access-pattern based promotion (a list used purely with append/pop -> stack)
is applied later in the runner using usage stats; here we use name + shape.
"""

from __future__ import annotations

from typing import Any

STACK_NAMES = {"stack", "st", "stk", "callstack"}
QUEUE_NAMES = {"q", "queue", "que", "deque", "dq", "frontier"}
HEAP_NAMES = {"heap", "pq", "priorityqueue", "minheap", "maxheap"}
DSU_NAMES = {"parent", "parents", "par", "uf", "dsu", "root", "rank"}
DP_NAMES = {"dp", "memo", "cache", "table", "tab", "cost"}


def _is_matrix(val) -> bool:
    if not val or not isinstance(val, (list, tuple)):
        return False
    if not all(isinstance(row, (list, tuple)) for row in val):
        return False
    # Rectangular-ish and scalar cells.
    return all(
        all(isinstance(x, (int, float, str, bool, type(None))) for x in row)
        for row in val
    )


def detect(val: Any, name: str = "") -> str | None:
    is_deque = type(val).__name__ == "deque"
    if not isinstance(val, (list, tuple)) and not is_deque and not isinstance(val, (set, frozenset)):
        return None

    low = name.lower()

    if isinstance(val, (set, frozenset)):
        return "set"

    if is_deque:
        return "deque"

    # 2D numeric/scalar grid.
    if _is_matrix(val):
        # DP tables are matrices conventionally named dp/memo/cost/...
        if low in DP_NAMES:
            return "dp_grid"
        return "matrix"

    # Name-driven linear roles.
    if low in DSU_NAMES and all(isinstance(x, int) for x in val):
        return "dsu"
    if low in STACK_NAMES:
        return "stack"
    if low in QUEUE_NAMES:
        return "queue"
    if low in HEAP_NAMES:
        return "heap"
    if low in DP_NAMES:
        return "dp_array"

    return "array"
