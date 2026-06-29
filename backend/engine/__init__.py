"""
DSA Visualizer execution engine.

A modular replacement for the old monolithic ``tracer.py``.

Pipeline:
    source code
      -> safety.check_code            (reject dangerous code)
      -> analyze.analyze_source       (static AST hints: DP / two-pointer / BFS ...)
      -> runner.run_code              (sys.settrace, ground-truth execution)
           -> detectors.detect_type   (what data structure is this value?)
           -> serialize.*             (turn live objects into JSON scenes)
           -> scope.*                 (loop metadata, branch outcomes)
           -> semantic.*              (compare / swap / recursion enter|exit ...)
      -> normalized Trace envelope    (meta + ordered steps)

Everything below is language-agnostic in spirit: a future C++/Java tracer only
has to emit the same Trace envelope and the whole frontend works unchanged.
"""

from .runner import run_code, Trace

__all__ = ["run_code", "Trace"]
