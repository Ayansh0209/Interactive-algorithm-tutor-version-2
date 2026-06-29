"""FastAPI trace worker.

Endpoints
---------
GET  /health           -> liveness probe
POST /trace            -> {code, max_steps?, stdin?} -> normalized Trace envelope
POST /run-reference    -> run a reference solution for AI bug-diff (see ai layer)

Run (kept warm):
    uvicorn worker.app:app --host 127.0.0.1 --port 8000 --workers 1

This service is INTERNAL. Only the Node gateway should call it; do not expose
it publicly. All real isolation (container, no network, resource limits) is
expected to wrap this process in production.
"""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

# Allow "import engine" when launched from the backend/ directory.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from engine import run_code  # noqa: E402

app = FastAPI(title="DSA Visualizer Trace Worker", version="0.1")


class TraceRequest(BaseModel):
    code: str = Field(..., description="Python source to trace")
    max_steps: int = Field(5000, ge=1, le=50000)
    stdin: str = Field("", description="Input fed to input()/sys.stdin")


@app.get("/health")
def health() -> dict:
    return {"ok": True, "service": "trace-worker"}


@app.post("/trace")
def trace(req: TraceRequest) -> dict:
    if not req.code.strip():
        return {"meta": {"error": "No code provided.", "num_steps": 0}, "steps": []}
    return run_code(req.code, max_steps=req.max_steps, stdin=req.stdin)


@app.post("/run-reference")
def run_reference(req: TraceRequest) -> dict:
    """Trace a reference solution. Used by the AI bug-diff feature to compare
    the user's execution path against a known-correct one."""
    return run_code(req.code, max_steps=req.max_steps, stdin=req.stdin)
