// A runnable mini-visualizer embedded inside a doc article. Reuses the SAME
// engine + Stage + Timeline as the full visualizer -- this is the content AI
// search can't replace, and the reason students stay on the page.

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { runCode } from "../../lib/api";
import { usePlayback } from "../../hooks/usePlayback";
import Stage from "../Stage";
import Timeline from "../Timeline";
import { Button, Icon } from "../ui";

export default function EmbeddedViz({ demo }) {
  const [trace, setTrace] = useState(null);
  const [loading, setLoading] = useState(false);
  const pb = usePlayback(trace);

  async function run() {
    setLoading(true);
    try {
      const t = await runCode(demo.code, demo.stdin || "", demo.language || "python");
      setTrace(t);
      pb.reset();
    } catch (e) {
      const msg = (e && e.response && e.response.data && e.response.data.error) || e.message;
      setTrace({ meta: { error: msg, num_steps: 0, analysis: {} }, steps: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-surface overflow-hidden my-6 shadow-soft">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
        <span className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-brand">
          <Icon name="code" size={13} /> Live demo · {demo.language || "python"}
        </span>
        <Button size="sm" onClick={run} disabled={loading}>
          {loading ? <><Icon name="reset" size={14} className="animate-spin" /> Running…</> : <><Icon name="zap" size={14} /> {trace ? "Re-run" : "Run"}</>}
        </Button>
      </div>
      <pre className="px-4 py-3 text-2xs font-mono text-fg-muted overflow-auto max-h-44 whitespace-pre leading-5 scrollbar-thin">
        {demo.code}
      </pre>
      <AnimatePresence>
        {trace && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-border">
            {trace.meta.error && (
              <div className="m-3 rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-sm text-danger">{trace.meta.error}</div>
            )}
            <div className="h-[340px] overflow-auto scrollbar-thin">
              <Stage trace={trace} current={pb.current} stepIndex={pb.stepIndex} />
            </div>
            {pb.visibleCount > 0 && <Timeline pb={pb} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
