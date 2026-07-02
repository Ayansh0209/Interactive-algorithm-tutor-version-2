"""Heuristic pattern analysis for C++ source (no execution, regex-based).

Produces the SAME advisory ``analysis`` dict the Python engine emits
(``primary`` + ranked ``hints`` + ``uses``) so the frontend badge and the AI
layer get grounded context. Heuristics are intentionally simple and never used
to fake execution -- the real visualization always comes from the gdb trace.
"""

import re

KEYWORDS = {"if", "for", "while", "switch", "return", "sizeof", "new", "delete",
            "catch", "int", "void", "bool", "double", "float", "long", "char",
            "auto", "const", "static", "struct", "class", "template", "typename"}


def _functions(code):
    """Names of user-defined functions (best effort)."""
    names = []
    for m in re.finditer(r"\b([A-Za-z_]\w*)\s*\([^;{}]*\)\s*(?:const\s*)?\{", code):
        name = m.group(1)
        if name not in KEYWORDS and name not in names:
            names.append(name)
    return names


def _is_recursive(code, funcs):
    for fn in funcs:
        # crude: does the function body call its own name (>1 occurrence total)?
        if len(re.findall(r"\b" + re.escape(fn) + r"\s*\(", code)) >= 2 and fn != "main":
            return True
    return False


def analyze_source(code):
    src = code
    low = code.lower()
    funcs = _functions(src)
    recursive = _is_recursive(src, funcs)

    has_nested_loop = bool(re.search(
        r"for\s*\(.*?\)[^;]*\{[^}]*for\s*\(", src, re.S)) or \
        bool(re.search(r"while\s*\(.*?\)[^;]*\{[^}]*(for|while)\s*\(", src, re.S))
    twod = bool(re.search(r"\w+\s*\[[^\]]+\]\s*\[[^\]]+\]", src)) or \
        "vector<vector" in src.replace(" ", "")
    uses = {
        "deque": "deque<" in src.replace(" ", "") or "deque <" in src,
        "heapq": "priority_queue" in src,
        "set": "set<" in src.replace(" ", "") or "visited" in low or "unordered_set" in src,
        "stack": "stack<" in src.replace(" ", ""),
        "queue": "queue<" in src.replace(" ", "") or "queue " in src,
        "memo": "memo" in low or "dp[" in low or "dp [" in low or "cache" in low or "vector<vector" in src.replace(" ", ""),
        "sort": "sort(" in src.replace(" ", "") or "sort (" in src,
    }
    idx = set(re.findall(r"\b(left|right|lo|hi|l|r|low|high|slow|fast|i|j)\b", src))

    hints = []

    def add(pattern, conf, evidence):
        hints.append({"pattern": pattern, "confidence": conf, "evidence": evidence})

    push = "push_back" in src or "emplace_back" in src
    pop = "pop_back" in src
    if recursive and push and pop:
        add("backtracking", 0.8, "recursion + push_back/pop_back of a path")
    elif recursive and uses["memo"]:
        add("dynamic_programming", 0.85, "recursion + memo/dp table")
    elif recursive:
        add("recursion", 0.6, "a function calls itself")

    if (twod or uses["memo"]) and (has_nested_loop or uses["memo"]):
        add("dynamic_programming", 0.75, "2D table / dp fill with loops")

    if bool(re.search(r"while\s*\(\s*\w+\s*[<!]=?\s*\w+", src)) and \
            re.search(r"\bmid\b", src) and ("lo" in idx or "low" in idx or "l" in idx):
        add("binary_search", 0.7, "mid + lo/hi loop")

    if {"slow", "fast"} <= idx:
        add("fast_slow_pointers", 0.7, "slow & fast pointers")
    elif len(idx & {"left", "right", "lo", "hi", "l", "r", "low", "high"}) >= 2:
        add("two_pointer", 0.6, "two converging index variables")

    if uses["deque"] or (uses["queue"] and uses["set"]):
        add("bfs", 0.7, "queue/deque + visited")
    if (uses["stack"] and uses["set"]) or (recursive and "adj" in low):
        add("dfs", 0.55, "stack/recursion + visited on a graph")
    if uses["heapq"]:
        add("greedy_or_dijkstra", 0.6, "priority_queue")
    if uses["sort"] and not recursive:
        add("greedy_or_sorting", 0.5, "sort-based approach")
    if "window" in low:
        add("sliding_window", 0.5, "sliding window")

    hints.sort(key=lambda h: h["confidence"], reverse=True)
    return {
        "hints": hints,
        "functions": funcs,
        "is_recursive": recursive,
        "uses": uses,
        "primary": hints[0]["pattern"] if hints else None,
    }
