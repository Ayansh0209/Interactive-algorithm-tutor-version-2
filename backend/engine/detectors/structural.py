"""Detect linked-list-shaped custom objects by structure.

A *node* has a value plus at least one reference to another same-shaped object
through a ``next``/``prev`` style attribute. A *container* (e.g. ``LinkedList``)
is a thin wrapper holding a ``head``. We classify either as a linked list so the
serializer can walk it.
"""

from __future__ import annotations

from typing import Any

from ..serialize import NEXT_ATTRS, PREV_ATTRS, VAL_ATTRS, get_attrs

_LINK = set(NEXT_ATTRS) | set(PREV_ATTRS)
_VAL = set(VAL_ATTRS)
_HEAD = {"head", "root", "front", "first"}


def _is_node(obj: Any) -> bool:
    if not hasattr(obj, "__dict__"):
        return False
    attrs = set(get_attrs(obj).keys())
    has_link = bool(attrs & _LINK)
    has_val = bool(attrs & _VAL) or len(attrs) <= 3
    return has_link and has_val


def detect(obj: Any) -> str | None:
    if not hasattr(obj, "__dict__"):
        return None

    # Direct node?
    if _is_node(obj):
        attrs = set(get_attrs(obj).keys())
        return "doubly_linked_list" if (attrs & set(PREV_ATTRS)) else "linked_list"

    # Container wrapping a head node?
    attrs = get_attrs(obj)
    for key in _HEAD:
        if key in attrs and _is_node(attrs[key]):
            inner = set(get_attrs(attrs[key]).keys())
            return "doubly_linked_list" if (inner & set(PREV_ATTRS)) else "linked_list"

    return None
