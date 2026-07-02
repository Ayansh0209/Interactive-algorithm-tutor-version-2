// AI tutor panel. Sits on top of the deterministic trace -- it asks the gateway
// to explain the run / suggest approaches / explain the current step. Works
// offline via the rule-based fallback (the response says which source it used).

import { useState } from "react";
import { motion } from "framer-motion";
import { explain } from "../lib/api";
import { T } from "../lib/motion";
import { Button, Badge, EmptyState, Icon } from "./ui";

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

  if (!trace) {
    return (
      <EmptyState
        icon={<Icon name="sparkles" size={22} />}
        title="AI tutor"
        hint="Run code first. The tutor explains the actual execution — it never guesses values."
      />
    );
  }

  return (
    <div className="p-3 space-y-3">
      {analysis?.primary && (
        <div className="flex flex-wrap gap-1.5">
          <Badge color="success">{analysis.primary.replace(/_/g, " ")}</Badge>
          {hints.slice(1, 3).map((h) => (
            <Badge key={h.pattern} color="slate">{h.pattern.replace(/_/g, " ")}</Badge>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => ask("explain")} disabled={loading}>Explain run</Button>
        <Button size="sm" variant="subtle" onClick={() => ask("approaches")} disabled={loading}>Better approaches</Button>
        <Button size="sm" variant="subtle" onClick={() => ask("step")} disabled={loading}>Explain this step</Button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-fg-muted">
          <Icon name="reset" size={14} className="animate-spin" /> Thinking…
        </div>
      )}

      {result && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={T.base} className="rounded-xl border border-border bg-surface-2 p-3">
          <div className="mb-1.5">
            <Badge color={result.source === "gemini" || result.source === "llm" ? "brand" : result.source === "error" ? "rose" : "slate"}>
              {result.source === "gemini" || result.source === "llm" ? "AI" : result.source === "error" ? "error" : "offline tutor"}
            </Badge>
          </div>
          <p className="text-sm text-fg whitespace-pre-wrap leading-relaxed">{result.text}</p>
        </motion.div>
      )}
    </div>
  );
}
