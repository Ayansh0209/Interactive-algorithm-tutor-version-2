// Premade: Breadth-First Search on a graph. "Compute then replay" pattern --
// BFS is run to completion into immutable frames, then useStepPlayer scrubs
// them. Shows current node, frontier (queue), visited set, and distances.

import { useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, Select, EmptyState, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

// A small, deliberately pretty undirected graph (positions in a 360x220 box).
const GRAPH = {
  nodes: [
    { id: 0, x: 44, y: 110 },
    { id: 1, x: 120, y: 48 },
    { id: 2, x: 120, y: 172 },
    { id: 3, x: 212, y: 40 },
    { id: 4, x: 208, y: 110 },
    { id: 5, x: 212, y: 180 },
    { id: 6, x: 308, y: 110 },
  ],
  edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5], [3, 6], [4, 6], [5, 6]],
};

function buildAdj() {
  const adj = {};
  GRAPH.nodes.forEach((n) => (adj[n.id] = []));
  GRAPH.edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a); });
  Object.values(adj).forEach((l) => l.sort((x, y) => x - y));
  return adj;
}

// Run BFS, recording a snapshot frame at each meaningful event.
function bfsFrames(start) {
  const adj = buildAdj();
  const visited = new Set([start]);
  const dist = { [start]: 0 };
  const order = [];
  let queue = [start];
  const frames = [{
    current: null, queue: [...queue], visited: new Set(visited), dist: { ...dist },
    order: [...order], note: `Start at ${start}: mark it, set dist 0, enqueue it.`,
  }];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    const newly = [];
    for (const nb of adj[u]) {
      if (!visited.has(nb)) {
        visited.add(nb); dist[nb] = dist[u] + 1; queue.push(nb); newly.push(nb);
      }
    }
    frames.push({
      current: u, queue: [...queue], visited: new Set(visited), dist: { ...dist }, order: [...order],
      note: newly.length
        ? `Dequeue ${u}, visit it. Discover ${newly.join(", ")} at dist ${dist[u] + 1} → enqueue.`
        : `Dequeue ${u}, visit it. All neighbours already seen.`,
    });
  }
  frames.push({
    current: null, queue: [], visited, dist, order: [...order],
    note: `Done. BFS visit order: ${order.join(" → ")}.`,
  });
  return frames;
}

export default function BFSPremade() {
  const [start, setStart] = useState(0);
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;

  const run = () => setFrames(bfsFrames(start));
  const startOptions = GRAPH.nodes.map((n) => ({ value: String(n.id), label: `node ${n.id}` }));

  // Visual state of a node in the current frame.
  const nodeState = (id) => {
    if (!frame) return "idle";
    if (frame.current === id) return "current";
    if (frame.queue.includes(id)) return "frontier";
    if (frame.order.includes(id)) return "done";
    return "idle";
  };

  return (
    <PremadeShell
      title="Breadth-First Search"
      accent="bg-cat-graph"
      headerRight={
        <div className="flex items-center gap-2">
          <Select value={String(start)} onChange={(v) => setStart(Number(v))} options={startOptions} />
          <OpButton icon="zap" tone="brand" onClick={run}>{frames ? "Re-run" : "Run BFS"}</OpButton>
        </div>
      }
      legend={
        <Legend items={[
          { label: "current", color: "bg-brand" },
          { label: "frontier (queue)", color: "bg-cat-graph/30 border border-cat-graph" },
          { label: "visited", color: "bg-cat-graph" },
          { label: "unseen", color: "bg-surface-2 border border-border-strong" },
        ]} />
      }
      status={<StatusBar tone={frame?.current != null ? "brand" : "neutral"}>
        {frame ? frame.note : "Pick a start node and run BFS to watch it explore level by level."}
      </StatusBar>}
      footer={frames ? <StepTransport player={player} label="BFS steps" /> : null}
      empty={!frames}
      emptyState={
        <EmptyState
          icon={<Icon name="layers" size={22} />}
          title="Breadth-first search"
          hint="BFS fans out from a start node one level at a time using a queue, so it finds the fewest-edges path."
          action={<OpButton icon="zap" tone="brand" onClick={run}>Run BFS</OpButton>}
        />
      }
      minH="min-h-72"
    >
      <div className="px-4 py-4">
        <svg viewBox="0 0 360 220" className="w-full h-56 select-none" role="img" aria-label="Graph being explored by BFS">
          {GRAPH.edges.map(([a, b], i) => {
            const A = GRAPH.nodes[a], B = GRAPH.nodes[b];
            const tree = frame && frame.order.includes(a) && frame.order.includes(b);
            return (
              <line
                key={i} x1={A.x} y1={A.y} x2={B.x} y2={B.y}
                className={cx("transition-[stroke] duration-300", tree ? "stroke-cat-graph/50" : "stroke-border-strong")}
                strokeWidth={tree ? 2.5 : 1.5}
              />
            );
          })}
          {GRAPH.nodes.map((n) => (
            <GraphNode key={n.id} node={n} state={nodeState(n.id)} dist={frame?.dist[n.id]} />
          ))}
        </svg>

        {/* Queue strip */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-3xs uppercase tracking-wider text-fg-faint w-12 shrink-0">queue</span>
          <div className="flex items-center gap-1.5 min-h-9 flex-wrap">
            {frame && frame.queue.length ? (
              frame.queue.map((id, i) => (
                <motion.div
                  key={id} layout
                  initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }}
                  transition={T.spring}
                  className={cx(
                    "h-8 min-w-8 px-2 grid place-items-center rounded-lg border font-mono text-2xs",
                    i === 0 ? "border-cat-graph bg-cat-graph/15 text-fg" : "border-border bg-surface-2 text-fg-muted"
                  )}
                >
                  {id}
                </motion.div>
              ))
            ) : (
              <span className="text-2xs text-fg-faint italic">{frame ? "empty" : "—"}</span>
            )}
            {frame && frame.queue.length > 0 && <span className="ml-1 text-3xs text-fg-faint">← front dequeues first</span>}
          </div>
        </div>
      </div>
    </PremadeShell>
  );
}

const NODE_FILL = {
  idle: "fill-surface-2 stroke-border-strong",
  frontier: "fill-surface-2 stroke-cat-graph",
  current: "fill-brand stroke-brand",
  done: "fill-cat-graph/35 stroke-cat-graph",
};
const NODE_TEXT = {
  idle: "fill-fg-muted",
  frontier: "fill-fg",
  current: "fill-on-brand",
  done: "fill-fg",
};

function GraphNode({ node, state, dist }) {
  return (
    <g>
      {state === "current" && (
        <motion.circle
          cx={node.x} cy={node.y} r={16}
          className="fill-none stroke-brand"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
          style={{ transformOrigin: `${node.x}px ${node.y}px` }}
          strokeWidth={2}
        />
      )}
      <circle
        cx={node.x} cy={node.y} r={16} strokeWidth={2}
        strokeDasharray={state === "frontier" ? "4 3" : undefined}
        className={cx("transition-[fill,stroke] duration-300", NODE_FILL[state])}
      />
      <text
        x={node.x} y={node.y + 4} textAnchor="middle" fontSize="13" fontWeight="600"
        className={cx("font-mono transition-[fill] duration-300", NODE_TEXT[state])}
      >
        {node.id}
      </text>
      {dist != null && (
        <text x={node.x} y={node.y - 22} textAnchor="middle" fontSize="9" className="font-mono fill-fg-faint">
          d{dist}
        </text>
      )}
    </g>
  );
}
