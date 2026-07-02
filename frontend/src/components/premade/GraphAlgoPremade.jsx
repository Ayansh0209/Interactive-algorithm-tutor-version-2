// Premade: graph algorithms, parameterized by `algo` (dfs / dijkstra / prim /
// kruskal / topo / hamiltonian). Computes frames once, then the step player
// scrubs them over the shared GraphCanvas, with an optional side strip
// (stack / frontier / ready queue).

import { useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, Select, EmptyState, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";
import GraphCanvas from "./shared/GraphCanvas";
import { GRAPH_ALGOS, GRAPH_ALGO_META, WGRAPH } from "./shared/graphAlgos";

export default function GraphAlgoPremade({ algo = "dfs" }) {
  const meta = GRAPH_ALGO_META[algo] || GRAPH_ALGO_META.dfs;
  const [start, setStart] = useState(0);
  const [run, setRun] = useState(null); // { graph, frames }
  const player = useStepPlayer(run?.frames || []);
  const frame = run ? player.frame : null;

  const go = () => setRun(GRAPH_ALGOS[algo](meta.needsStart ? start : undefined));
  const startOptions = WGRAPH.nodes.map((n) => ({ value: String(n.id), label: `node ${n.id}` }));

  return (
    <PremadeShell
      title={meta.label}
      accent={meta.accent}
      headerRight={
        <div className="flex items-center gap-2">
          {meta.needsStart && <Select value={String(start)} onChange={(v) => setStart(Number(v))} options={startOptions} />}
          <OpButton icon="zap" tone="brand" onClick={go}>{run ? "Re-run" : "Run"}</OpButton>
        </div>
      }
      legend={
        <Legend items={[
          { label: "current", color: "bg-brand" },
          { label: "visited", color: "bg-cat-graph" },
          { label: "tree edge", color: "bg-cat-graph/70" },
          { label: "active edge", color: "bg-warning" },
        ]} />
      }
      status={<StatusBar tone={frame?.done ? "success" : frame?.current != null ? "brand" : "neutral"}>{frame ? frame.note : meta.blurb}</StatusBar>}
      footer={run ? <StepTransport player={player} /> : null}
      empty={!run}
      emptyState={<EmptyState icon={<Icon name="layers" size={22} />} title={meta.label} hint={meta.blurb} action={<OpButton icon="zap" tone="brand" onClick={go}>Run</OpButton>} />}
      minH="min-h-72"
    >
      {run && (
      <div className="px-4 py-4">
        <GraphCanvas graph={run.graph} frame={frame} />
        {frame?.side && (
          <div className="mt-3 flex items-center gap-2">
            <span className="text-3xs uppercase tracking-wider text-fg-faint w-14 shrink-0">{frame.side.label}</span>
            <div className="flex items-center gap-1.5 min-h-9 flex-wrap">
              {frame.side.items.length ? frame.side.items.map((it, i) => (
                <motion.div key={`${it}-${i}`} layout initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={T.spring}
                  className={cx("h-8 min-w-8 px-2 grid place-items-center rounded-lg border font-mono text-2xs",
                    i === 0 && frame.side.head ? "border-cat-graph bg-cat-graph/15 text-fg" : "border-border bg-surface-2 text-fg-muted")}>
                  {String(it)}
                </motion.div>
              )) : <span className="text-2xs text-fg-faint italic">empty</span>}
            </div>
          </div>
        )}
      </div>
      )}
    </PremadeShell>
  );
}
