"""Detect graph-shaped values held in dicts."""

from __future__ import annotations

from typing import Any


def detect(val: dict, name: str = "") -> str | None:
    if not isinstance(val, dict) or not val:
        return None

    # Adjacency list: every key maps to an iterable of neighbours.
    looks_adj = True
    for k, v in val.items():
        if not isinstance(k, (int, str, tuple)):
            looks_adj = False
            break
        if not isinstance(v, (list, tuple, set)):
            looks_adj = False
            break
    if looks_adj:
        return "graph_adjacency_list"

    # Weighted adjacency: key -> {neighbour: weight}.
    if all(isinstance(v, dict) for v in val.values()):
        inner_ok = all(
            all(isinstance(w, (int, float)) for w in v.values())
            for v in val.values() if v
        )
        if inner_ok:
            return "graph_weighted"

    return None
