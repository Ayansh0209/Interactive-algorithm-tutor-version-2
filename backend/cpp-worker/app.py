"""FastAPI C++ trace worker (mirrors the Python worker's contract).

POST /trace  {code, max_steps?, stdin?}  ->  normalized Trace envelope

Pipeline per request:
    1. write user code to a temp prog.cpp
    2. compile with g++ -g -O0   (debug info, no optimization = clean stepping)
    3. run the binary under gdb, driven by gdb_tracer.py, which single-steps and
       emits the envelope's `steps`; the program's stdin/stdout are redirected to
       files so we can feed input and capture output
    4. attach heuristic `meta.analysis`

Run (kept warm, like the other workers):
    uvicorn app:app --host 127.0.0.1 --port 8002 --workers 1   (from this folder)

NOTE: this executes untrusted native code. In dev it runs directly (as the
Python/Java workers do); production must sandbox it (container, no network,
cpu/mem/time limits) -- see HANDOFF task 5.
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
import time
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

sys.path.insert(0, str(Path(__file__).resolve().parent))
from analyze_cpp import analyze_source  # noqa: E402

app = FastAPI(title="DSA Visualizer C++ Worker", version="0.1")

HERE = Path(__file__).resolve().parent
TRACER = str(HERE / "gdb_tracer.py")
GPP = shutil.which("g++") or "g++"
GDB = shutil.which("gdb") or "gdb"
COMPILE_TIMEOUT = 20
DEFAULT_MAX_SECONDS = 8.0


def _find_printers():
    """Locate libstdc++'s gdb pretty-printer python package (share/gcc-*/python)
    so the tracer can render std::map/set/stack/queue nicely."""
    try:
        root = Path(GPP).resolve().parent.parent  # <toolchain>/bin -> <toolchain>
        for p in (root / "share").glob("gcc-*/python"):
            if (p / "libstdcxx").is_dir():
                return str(p)
    except Exception:
        pass
    return ""


PYPRINTERS = _find_printers()

# Prepend the compiler's bin dir to PATH so its spawned tools (cc1plus, as, ld)
# and the traced binary resolve the RIGHT runtime DLLs -- otherwise, launched
# from a shell with a conflicting toolchain on PATH (e.g. Git-bash), cc1plus
# dies on DLL load with no diagnostics.
def _tool_env():
    env = os.environ.copy()
    extra = []
    for tool in (GPP, GDB):
        d = os.path.dirname(tool)
        if d and d not in extra:
            extra.append(d)
    if extra:
        env["PATH"] = os.pathsep.join(extra) + os.pathsep + env.get("PATH", "")
    return env


# Light safety net (NOT a sandbox). Blocks the most obviously dangerous calls so
# a careless paste can't trivially harm the dev box; real isolation is task 5.
_BANNED = [
    r"\bsystem\s*\(", r"\bpopen\s*\(", r"\bexecl\w*\s*\(", r"\bexecv\w*\s*\(",
    r"\bfork\s*\(", r"\bWinExec\b", r"\bShellExecute\w*\b", r"\bCreateProcess\w*\b",
    r"#\s*include\s*<\s*windows\.h\s*>", r"\bremove\s*\(", r"\bunlink\s*\(",
    r"std::filesystem", r"\bsystem\b\s*\(",
]


def _unsafe(code):
    for pat in _BANNED:
        if re.search(pat, code, re.IGNORECASE):
            return "Blocked for safety: use of a system/process/file call (" + pat + ")."
    return None


class TraceRequest(BaseModel):
    code: str = Field(..., description="C++ source to trace")
    max_steps: int = Field(4000, ge=1, le=50000)
    stdin: str = Field("", description="Fed to the program's stdin")


def _envelope(error=None, analysis=None, steps=None, output="", truncated=False):
    return {
        "meta": {
            "language": "cpp",
            "analysis": analysis or {"primary": None, "hints": []},
            "output": output,
            "error": error,
            "truncated": truncated,
            "num_steps": len(steps or []),
        },
        "steps": steps or [],
    }


@app.get("/health")
def health():
    return {"ok": True, "service": "cpp-worker", "g++": GPP, "gdb": GDB}


@app.post("/trace")
def trace(req: TraceRequest):
    code = req.code
    if not code.strip():
        return _envelope(error="No code provided.")
    analysis = analyze_source(code)

    bad = _unsafe(code)
    if bad:
        return _envelope(error=bad, analysis=analysis)

    if not shutil.which(GPP) and not os.path.exists(GPP):
        return _envelope(error="g++ not found on PATH. Install MSYS2/MinGW g++.",
                         analysis=analysis)

    max_seconds = DEFAULT_MAX_SECONDS
    env = _tool_env()

    with tempfile.TemporaryDirectory(prefix="cpptrace_") as td:
        d = Path(td)
        src = d / "prog.cpp"
        exe = d / ("prog.exe" if os.name == "nt" else "prog")
        out_json = d / "trace.json"
        prog_out = d / "stdout.txt"
        prog_in = d / "stdin.txt"
        src.write_text(code, encoding="utf-8")
        prog_in.write_text(req.stdin or "", encoding="utf-8")

        # 1. Compile.
        try:
            cc = subprocess.run(
                [GPP, "-g", "-O0", "-std=gnu++17", "-w", str(src), "-o", str(exe)],
                capture_output=True, text=True, timeout=COMPILE_TIMEOUT, env=env, cwd=str(d),
            )
        except subprocess.TimeoutExpired:
            return _envelope(error="Compilation timed out.", analysis=analysis)
        except FileNotFoundError:
            return _envelope(error="g++ not found. Install MSYS2/MinGW g++.", analysis=analysis)
        if cc.returncode != 0 or not exe.exists():
            msg = (cc.stderr or cc.stdout or "Compilation failed.").strip()
            msg = _clean_compile_error(msg, str(src))
            return _envelope(error=msg, analysis=analysis)

        # 2. Trace under gdb.
        tenv = dict(env)
        tenv.update({
            "CPP_SRC": str(src),
            "CPP_EXE": str(exe),
            "CPP_OUT": str(out_json),
            "CPP_STDIN": str(prog_in),
            "CPP_STDOUT": str(prog_out),
            "CPP_MAX_STEPS": str(req.max_steps),
            "CPP_MAX_SECONDS": str(max_seconds),
            "CPP_PYPRINTERS": PYPRINTERS,
        })
        try:
            subprocess.run(
                [GDB, "--batch", "-nx", "-x", TRACER],
                capture_output=True, text=True, timeout=max_seconds + 25, env=tenv, cwd=str(d),
            )
        except subprocess.TimeoutExpired:
            partial = _read_trace(out_json)
            if partial:
                partial["meta"]["truncated"] = True
                partial["meta"]["analysis"] = analysis
                partial["meta"]["output"] = _read_text(prog_out)
                return partial
            return _envelope(error="Tracing timed out.", analysis=analysis, truncated=True)
        except FileNotFoundError:
            return _envelope(error="gdb not found on PATH. Install gdb (MSYS2/MinGW).",
                             analysis=analysis)

        env_out = _read_trace(out_json)
        program_output = _read_text(prog_out)
        if not env_out:
            return _envelope(error="Tracer produced no output (gdb may have failed).",
                             analysis=analysis, output=program_output)

        env_out["meta"]["analysis"] = analysis
        env_out["meta"]["output"] = program_output
        env_out["meta"]["language"] = "cpp"
        return env_out


def _read_trace(path):
    try:
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    except Exception:
        return None


def _read_text(path):
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            return fh.read()
    except Exception:
        return ""


def _clean_compile_error(msg, src_path):
    """Trim the compiler dump to the first few meaningful lines, drop temp paths."""
    lines = []
    base = os.path.basename(src_path)
    for ln in msg.splitlines():
        ln = ln.replace(src_path, base).replace(src_path.replace("\\", "/"), base)
        if ln.strip():
            lines.append(ln)
        if len(lines) >= 8:
            lines.append("...")
            break
    return "\n".join(lines) if lines else "Compilation failed."
