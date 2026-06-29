// AI tutor panel. Sits on top of the deterministic trace -- it asks the gateway
// to explain the run / suggest approaches / explain the current step. Works
// offline via the rule-based fallback (the response says which source it used).

import { useState } from "react";
import { explain } from "../lib/api";
import { Button, Badge } from "./ui";

export default function AIPanel({ code, trace, stepIndex }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analysis = trace?.meta?.analysis;
  const hints = analysis?.hints || [];

  async function ask(mode) {
    if (!trace) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await explain({ code, trace, mode, step: mode === "step" ? stepIndex : null });
      setResult(r);
    } catch (e) {
      setResult({ text: "AI request failed: " + (e?.message || "unknown error"), source: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 space-y-3 overflow-auto flex-1">
        {analysis?.primary && (
          <div className="flex flex-wrap gap-1.5">
            <Badge color="green">{analysis.primary.replace(/_/g, " ")}</Badge>
            {hints.slice(1, 3).map((h) => (
              <Badge key={h.pattern} color="slate">
                {h.pattern.replace(/_/g, " ")}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={() => ask("explain")} disabled={loading || !trace}>
            Explain run
          </Button>
          <Button variant="subtle" onClick={() => ask("approaches")} disabled={loading || !trace}>
            Better approaches
          </Button>
          <Button variant="subtle" onClick={() => ask("step")} disabled={loading || !trace}>
            Explain this step
          </Button>
        </div>

        {loading && <div className="text-sm text-white/40 animate-pulse">Thinking...</div>}

        {result && (
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
            <div className="mb-1.5">
              <Badge color={result.source === "llm" ? "indigo" : "slate"}>
                {result.source === "llm" ? "AI" : result.source === "error" ? "error" : "offline tutor"}
              </Badge>
            </div>
            <p className="text-sm text-white/80 whitespace-pre-wrap leading-relaxed">{result.text}</p>
          </div>
        )}

        {!trace && (
          <p className="text-sm text-white/30 italic">
            Run code first. The AI explains the actual execution -- it never guesses values.
          </p>
        )}
      </div>
    </div>
  );
}
