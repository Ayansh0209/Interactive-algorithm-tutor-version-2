"""Static safety checks for untrusted user code.

This is a *first line* of defence only. Real isolation must come from the
sandbox the process runs in (container, resource limits, no network). See
the architecture spec, section 3.4.
"""

from __future__ import annotations

import ast

# Substring blocklist (fast, catches the obvious).
FORBIDDEN_SUBSTRINGS = (
    "subprocess", "socket", "shutil", "threading", "multiprocessing",
    "__import__", "importlib", "ctypes", "pty", "fork", "popen",
)

# Modules that must never be imported by traced code.
FORBIDDEN_MODULES = {
    "os", "sys", "subprocess", "socket", "shutil", "threading",
    "multiprocessing", "ctypes", "importlib", "pickle", "marshal",
    "pathlib", "requests", "urllib", "http", "ftplib", "smtplib",
}

# Builtins that allow code execution / filesystem access.
# NOTE: input() is allowed -- it reads from a controlled in-memory stdin buffer
# (see runner.run_code), never the real terminal, so it is safe.
FORBIDDEN_CALLS = {"exec", "eval", "open", "compile", "__import__"}


class UnsafeCodeError(Exception):
    """Raised when user code uses a forbidden construct."""


def check_code(code: str) -> None:
    """Raise :class:`UnsafeCodeError` if ``code`` is unsafe. Otherwise return None."""
    lowered = code.lower()
    for bad in FORBIDDEN_SUBSTRINGS:
        if bad in lowered:
            raise UnsafeCodeError("Use of '" + bad + "' is not allowed.")

    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        raise UnsafeCodeError("Syntax error: " + str(exc.msg) +
                              " (line " + str(exc.lineno) + ")") from exc

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                root = alias.name.split(".")[0]
                if root in FORBIDDEN_MODULES:
                    raise UnsafeCodeError("Import of '" + root + "' is not allowed.")
        elif isinstance(node, ast.ImportFrom):
            root = (node.module or "").split(".")[0]
            if root in FORBIDDEN_MODULES:
                raise UnsafeCodeError("Import from '" + root + "' is not allowed.")
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in FORBIDDEN_CALLS:
                raise UnsafeCodeError("Call to '" + node.func.id + "()' is not allowed.")


def is_code_safe(code: str) -> bool:
    """Boolean convenience wrapper around :func:`check_code`."""
    try:
        check_code(code)
        return True
    except UnsafeCodeError:
        return False
