"""The execution core: run user code under ``sys.settrace`` and emit a Trace.

Design notes
------------
* State lives on a :class:`Tracer` instance (no module globals) so it is
  re-entrant and easy to unit test.
* ``call_id`` / ``parent_id`` are assigned on every function call so the
  frontend can reconstruct the recursion tree directly from the step stream.
* Hard ``max_steps`` / ``max_seconds`` caps guarantee we never blow up on
  N-Queens-sized runs or infinite loops; when a cap is hit we ABORT execution
  (not just recording) and mark the trace ``truncated``.
* ``stdin`` is fed via an in-memory buffer so input()-based solutions run.
"""

from __future__ import annotations

import ast
import io
import linecache
import sys
import time
from dataclasses import dataclass, field
from typing import Any

from . import promote as promote_mod
from . import scope as scope_mod
from . import semantic as sem
from . import serialize as ser
from .analyze import analyze_source
from .detectors import detect_type
from .safety import UnsafeCodeError, check_code

DEFAULT_MAX_STEPS = 5000
DEFAULT_MAX_SECONDS = 8.0


class _Abort(Exception):
    """Internal signal to stop execution when a limit is hit (not a user error)."""


@dataclass
class Trace:
    meta: dict
    steps: list = field(default_factory=list)

    def as_dict(self) -> dict:
        return {"meta": self.meta, "steps": self.steps}


# --------------------------------------------------------------------------- #
# Scene building: detected type -> renderer-ready JSON
# --------------------------------------------------------------------------- #
def build_scene(val: Any, vtype: str, name: str = "") -> Any:
    try:
        if vtype in ("linked_list", "doubly_linked_list"):
            return ser.serialize_linked_list(val)
        if vtype in ("binary_tree", "avl_tree", "red_black_tree"):
            return {"type": vtype, "root": ser.serialize_tree(val, vtype)}
        if vtype == "segment_tree":
            return {"type": vtype, "root": ser.serialize_segment_tree(val)}
        if vtype == "nary_tree":
            return {"type": vtype, "root": ser.serialize_nary_tree(val)}
        if vtype == "trie":
            return {"type": vtype, "root": ser.serialize_trie(val)}
        if vtype in ("graph_adjacency_list", "graph_weighted"):
            return {"type": vtype, "adjacency": ser.json_safe(val)}
        if vtype in ("stack", "queue", "deque", "heap", "dp_array"):
            return {"type": vtype, "values": ser.json_safe(list(val))}
        if vtype == "dsu":
            return {"type": "dsu", "parent": ser.json_safe(list(val))}
        if vtype in ("matrix", "dp_grid"):
            return {"type": vtype, "rows": ser.json_safe(val)}
        if vtype == "set":
            return {"type": "set", "values": ser.json_safe(list(val))}
        if vtype == "array":
            return ser.json_safe(list(val))
        if vtype in ("object", "constructing"):
            return ser.serialize_object(val)
        return ser.json_safe(val)
    except Exception as exc:  # never let one bad value kill the trace
        return {"type": vtype, "error": str(exc)[:120]}


def executable_lines(code: str) -> set:
    """Line numbers that count as real execution (skip defs/imports/docstrings)."""
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return set()
    lines = set()
    for node in getattr(tree, "body", []):
        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef,
                             ast.Import, ast.ImportFrom)):
            continue
        if isinstance(node, ast.Expr) and isinstance(getattr(node, "value", None), ast.Constant):
            continue
        start = getattr(node, "lineno", None)
        end = getattr(node, "end_lineno", start)
        if start is not None:
            lines.update(range(start, (end or start) + 1))
    return lines


class Tracer:
    def __init__(self, code: str, max_steps: int = DEFAULT_MAX_STEPS,
                 max_seconds: float = DEFAULT_MAX_SECONDS):
        self.code = code
        self.code_lines = code.splitlines()
        self.max_steps = max_steps
        self.max_seconds = max_seconds
        self.start_time = time.monotonic()

        self.steps = []
        self.depth = 0
        self.call_counter = 0
        self.call_stack = []                  # stack of call_ids
        self.prev_locals_by_call = {}
        self.main_lines = executable_lines(code)
        self.start_at = min(self.main_lines) if self.main_lines else 1
        self.tracing = False
        self.truncated = False

    # -- frame helpers ----------------------------------------------------- #
    def _line_text(self, frame) -> str:
        text = linecache.getline(frame.f_code.co_filename, frame.f_lineno).strip()
        if not text and 0 <= frame.f_lineno - 1 < len(self.code_lines):
            text = self.code_lines[frame.f_lineno - 1].strip()
        return text

    def _call_stack(self, frame):
        stack, curr = [], frame
        while curr:
            name = curr.f_code.co_name
            if name in ("<module>", "_run", "exec"):
                curr = curr.f_back
                continue
            argc = curr.f_code.co_argcount
            arg_names = curr.f_code.co_varnames[:argc]
            args = {n: ser.json_safe(curr.f_locals[n])
                    for n in arg_names
                    if n in curr.f_locals and not callable(curr.f_locals[n])}
            stack.append({"function": name, "args": args})
            curr = curr.f_back
        stack.reverse()
        return stack

    def _serialize_locals(self, frame):
        clean = {k: v for k, v in frame.f_locals.items()
                 if not k.startswith("__") and not k.startswith(".")
                 and k != "fromlist" and not callable(v)}
        scenes, types = {}, {}
        for name, val in clean.items():
            vtype = detect_type(val, name)
            types[name] = vtype
            scenes[name] = build_scene(val, vtype, name)
        return scenes, types

    # -- the trace callback ------------------------------------------------ #
    def __call__(self, frame, event, arg):
        if event not in ("call", "line", "return"):
            return self
        # Hard limits: stop EXECUTION (not just recording) so infinite loops and
        # runaway recursion cannot hang the worker.
        if len(self.steps) >= self.max_steps:
            self.truncated = True
            raise _Abort
        if time.monotonic() - self.start_time > self.max_seconds:
            self.truncated = True
            raise _Abort

        # Skip the harness module lines before user code begins.
        if frame.f_code.co_name == "<module>" and frame.f_lineno < self.start_at:
            return self
        if not self.tracing and frame.f_lineno not in self.main_lines \
                and frame.f_code.co_name == "<module>":
            return self
        self.tracing = True

        # Maintain call ids / depth.
        call_id = self.call_stack[-1] if self.call_stack else 0
        parent_id = None
        if event == "call":
            self.call_counter += 1
            parent_id = self.call_stack[-1] if self.call_stack else None
            call_id = self.call_counter
            self.call_stack.append(call_id)
            self.depth += 1

        code_line = self._line_text(frame)
        scenes, types = self._serialize_locals(frame)

        prev = self.prev_locals_by_call.get(call_id, {})
        highlight = sem.changed_vars(prev, scenes)
        events = sem.build_events(code_line, prev, scenes, event,
                                  frame.f_code.co_name)

        st = scope_mod.scope_type(event, code_line)
        step = {
            "i": len(self.steps),
            "event": event,
            "line": frame.f_lineno,
            "function": frame.f_code.co_name,
            "code": code_line,
            "locals": scenes,
            "var_types": types,
            "highlight_vars": highlight,
            "scope": st,
            "depth": self.depth,
            "call_id": call_id,
            "parent_id": parent_id,
            "semantic": events,
            "call_stack": self._call_stack(frame),
        }
        if st == "loop":
            step["loop_meta"] = scope_mod.loop_meta(code_line, frame.f_locals, frame.f_globals)
        if st == "conditional":
            step["branch_taken"] = scope_mod.branch_taken(
                code_line, frame.f_locals, frame.f_globals)
        # Capture the returned value (settrace passes it as `arg` on return) so
        # the recursion tree can show values bubbling up to the parent call.
        if event == "return":
            try:
                step["return_value"] = ser.json_safe(arg)
            except Exception:
                pass

        self.steps.append(step)
        self.prev_locals_by_call[call_id] = scenes

        if event == "return":
            self.depth = max(0, self.depth - 1)
            if self.call_stack:
                self.call_stack.pop()

        return self


def run_code(code: str, max_steps: int = DEFAULT_MAX_STEPS,
             max_seconds: float = DEFAULT_MAX_SECONDS, stdin: str = "") -> dict:
    """Public entry point: returns a normalized Trace envelope as a dict.

    ``stdin`` is fed to the program as if typed at the terminal, so solutions
    that call ``input()`` / read ``sys.stdin`` work (Codeforces-style). It is an
    in-memory buffer, never the real terminal.
    """
    meta = {
        "language": "python",
        "analysis": analyze_source(code),
        "output": "",
        "error": None,
        "truncated": False,
        "num_steps": 0,
    }

    # Safety gate.
    try:
        check_code(code)
    except UnsafeCodeError as exc:
        meta["error"] = str(exc)
        return Trace(meta=meta).as_dict()

    tracer = Tracer(code, max_steps=max_steps, max_seconds=max_seconds)
    buffer = io.StringIO()
    old_stdout = sys.stdout
    old_stdin = sys.stdin
    old_trace = sys.gettrace()

    try:
        compiled = compile(code, "<user-code>", "exec")
        linecache.cache["<user-code>"] = (
            len(code), None, code.splitlines(True), "<user-code>")
        sys.stdout = buffer
        sys.stdin = io.StringIO(stdin)
        globals_dict = {"__name__": "__main__"}
        sys.settrace(tracer)
        exec(compiled, globals_dict)
    except _Abort:
        # Hit a step/time limit; partial trace is intentional, not an error.
        pass
    except Exception as exc:  # surface user runtime errors with line info
        tb = sys.exc_info()[2]
        lineno = None
        while tb:
            if tb.tb_frame.f_code.co_filename == "<user-code>":
                lineno = tb.tb_lineno
            tb = tb.tb_next
        meta["error"] = type(exc).__name__ + ": " + str(exc)
        if lineno:
            meta["error_line"] = lineno
    finally:
        sys.settrace(old_trace)
        sys.stdout = old_stdout
        sys.stdin = old_stdin

    meta["output"] = buffer.getvalue()
    promote_mod.promote(tracer.steps)  # access-pattern relabel (name-independent)
    meta["truncated"] = tracer.truncated
    meta["num_steps"] = len(tracer.steps)
    return Trace(meta=meta, steps=tracer.steps).as_dict()
