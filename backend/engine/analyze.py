"""Static (AST) analysis of user source to guess the *algorithmic pattern*.

This does NOT execute code. It produces hints like ``two_pointer`` /
``dynamic_programming`` / ``backtracking`` / ``bfs`` that (a) help the frontend
pick a default view and (b) give the AI layer grounded context for explanation.

Hints are heuristic and ranked by confidence; they are advisory, never used to
fake execution.
"""

from __future__ import annotations

import ast
from dataclasses import dataclass, field


@dataclass
class Hint:
    pattern: str
    confidence: float
    evidence: str


@dataclass
class Analysis:
    hints: list[Hint] = field(default_factory=list)
    functions: list[str] = field(default_factory=list)
    is_recursive: bool = False
    uses: dict[str, bool] = field(default_factory=dict)

    def as_dict(self) -> dict:
        return {
            "hints": [h.__dict__ for h in sorted(
                self.hints, key=lambda h: h.confidence, reverse=True)],
            "functions": self.functions,
            "is_recursive": self.is_recursive,
            "uses": self.uses,
            "primary": (max(self.hints, key=lambda h: h.confidence).pattern
                        if self.hints else None),
        }


def analyze_source(code: str) -> dict:
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return Analysis().as_dict()

    a = Analysis()
    func_names = {n.name for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)}
    a.functions = sorted(func_names)

    names_used: set[str] = set()
    calls_used: set[str] = set()
    attr_calls: set[str] = set()
    has_nested_loop = False
    two_index_vars = set()
    list_subscript_assign = False
    twod_indexing = False

    # Recursion: a function that calls itself.
    for fn in (n for n in ast.walk(tree) if isinstance(n, ast.FunctionDef)):
        for sub in ast.walk(fn):
            if isinstance(sub, ast.Call) and isinstance(sub.func, ast.Name) \
                    and sub.func.id == fn.name:
                a.is_recursive = True

    for node in ast.walk(tree):
        if isinstance(node, ast.Name):
            names_used.add(node.id)
            if node.id in ("left", "right", "lo", "hi", "i", "j", "l", "r", "slow", "fast"):
                two_index_vars.add(node.id)
        elif isinstance(node, ast.Call):
            if isinstance(node.func, ast.Name):
                calls_used.add(node.func.id)
            elif isinstance(node.func, ast.Attribute):
                attr_calls.add(node.func.attr)
        elif isinstance(node, (ast.For, ast.While)):
            for sub in ast.walk(node):
                if sub is not node and isinstance(sub, (ast.For, ast.While)):
                    has_nested_loop = True
        elif isinstance(node, ast.Subscript):
            # 2D indexing like dp[i][j]
            if isinstance(node.value, ast.Subscript):
                twod_indexing = True
        elif isinstance(node, ast.Assign):
            for tgt in node.targets:
                if isinstance(tgt, ast.Subscript):
                    list_subscript_assign = True

    a.uses = {
        "deque": "deque" in names_used or "deque" in calls_used,
        "heapq": "heapq" in names_used or "heappush" in calls_used or "heappop" in calls_used,
        "set": "set" in calls_used or "visited" in names_used,
        "stack": "stack" in names_used,
        "queue": "queue" in names_used or "q" in names_used,
        "memo": "memo" in names_used or "cache" in names_used or "dp" in names_used,
        "sort": "sort" in attr_calls or "sorted" in calls_used,
    }

    # --- Pattern scoring -------------------------------------------------- #
    def add(pattern, conf, evidence):
        a.hints.append(Hint(pattern, conf, evidence))

    if a.is_recursive and (list_subscript_assign or "append" in attr_calls) \
            and ("pop" in attr_calls or "remove" in attr_calls):
        add("backtracking", 0.8, "recursion + add/remove of a path list")
    elif a.is_recursive and a.uses["memo"]:
        add("dynamic_programming", 0.85, "recursion + memo/cache")
    elif a.is_recursive:
        add("recursion", 0.6, "function calls itself")

    if (twod_indexing or a.uses["memo"]) and (has_nested_loop or a.uses["memo"]):
        add("dynamic_programming", 0.75, "2D table indexing / memo with loops")

    if len(two_index_vars & {"left", "right", "lo", "hi", "l", "r", "slow", "fast"}) >= 2:
        if {"slow", "fast"} <= two_index_vars:
            add("fast_slow_pointers", 0.7, "slow & fast pointers")
        else:
            add("two_pointer", 0.65, "two converging index variables")

    if a.uses["deque"] or (a.uses["queue"] and a.uses["set"]):
        add("bfs", 0.7, "queue/deque + visited set")
    if a.uses["stack"] and a.uses["set"]:
        add("dfs", 0.6, "stack + visited set")
    if a.uses["heapq"]:
        add("greedy_or_dijkstra", 0.6, "priority queue (heapq)")
    if a.uses["sort"] and not a.is_recursive:
        add("greedy_or_sorting", 0.5, "sort-based approach")
    if "window" in " ".join(names_used).lower() or \
            ({"left", "right"} <= two_index_vars and has_nested_loop is False and a.uses.get("sort") is False):
        add("sliding_window", 0.5, "window indices")

    return a.as_dict()
