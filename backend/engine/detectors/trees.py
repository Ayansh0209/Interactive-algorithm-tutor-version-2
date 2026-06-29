"""Detect tree-shaped custom node objects from their attribute names."""

from __future__ import annotations

from typing import Any

from ..serialize import LEFT_ATTRS, RIGHT_ATTRS

_LEFT = set(LEFT_ATTRS)
_RIGHT = set(RIGHT_ATTRS)


def detect(obj: Any) -> str | None:
    if not hasattr(obj, "__dict__"):
        return None
    attrs = set(vars(obj).keys())

    has_left = bool(attrs & _LEFT)
    has_right = bool(attrs & _RIGHT)

    # Segment tree: binary node + an explicit range.
    if has_left and has_right and (attrs & {"start", "lo", "left_range"}) and \
            (attrs & {"end", "hi", "right_range"}):
        return "segment_tree"

    # Binary family.
    if has_left and has_right:
        if attrs & {"color", "is_red", "red"}:
            return "red_black_tree"
        if attrs & {"height", "balance", "bf"}:
            return "avl_tree"
        return "binary_tree"

    # Trie: a children map + a word-end flag.
    if (attrs & {"children", "next", "edges", "links"}) and \
            (attrs & {"is_end_of_word", "is_word", "is_end", "end", "word"}):
        return "trie"

    # N-ary tree: a value + a list of children.
    if attrs & {"children", "kids", "child"}:
        children = None
        for n in ("children", "kids", "child"):
            if n in attrs:
                children = getattr(obj, n)
                break
        if isinstance(children, (list, tuple)):
            return "nary_tree"

    return None
