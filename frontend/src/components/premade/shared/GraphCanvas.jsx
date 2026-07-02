// Renders one graph-algorithm frame: edges (normal / in-tree / active), nodes
// (idle / visited / current), optional distance labels and edge weights.
// Shared by every graph-algorithm premade.

import { motion } from "framer-motion";
import { cx } from "../../ui";

const has = (list, u, v) => (list || []).some(([a, b]) => (a === u && b === v) || (a === v && b === u));

export default function GraphCanvas({ graph, frame }) {
  const byId = Object.fromEntries(graph.nodes.map((n) => [n.id, n]));
  const visited = new Set(frame?.visited || []);
  const directed = !!graph.directed;

  return (
    <svg viewBox="0 0 360 220" className="w-full h-56 select-none" role="img" aria-label="Graph algorithm visualization">
      {directed && (
        <defs>
          <marker id="gc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" className="fill-fg-faint" />
          </marker>
        </defs>
      )}
      {graph.edges.map(([u, v, w], i) => {
        const A = byId[u], B = byId[v];
        const tree = has(frame?.treeEdges, u, v);
        const active = frame?.activeEdge && has([frame.activeEdge], u, v);
        // shorten directed edges so the arrow sits at the node edge
        const dx = B.x - A.x, dy = B.y - A.y, len = Math.hypot(dx, dy) || 1;
        const ex = B.x - (dx / len) * (directed ? 19 : 0), ey = B.y - (dy / len) * (directed ? 19 : 0);
        return (
          <g key={i}>
            <line
              x1={A.x} y1={A.y} x2={ex} y2={ey}
              markerEnd={directed ? "url(#gc-arrow)" : undefined}
              className={cx("transition-[stroke] duration-300", active ? "stroke-warning" : tree ? "stroke-cat-graph/70" : "stroke-border-strong")}
              strokeWidth={active || tree ? 2.5 : 1.5}
            />
            {w != null && graph.weighted && (
              <text x={(A.x + B.x) / 2} y={(A.y + B.y) / 2 - 4} textAnchor="middle" fontSize="10" className="font-mono fill-fg-faint">{w}</text>
            )}
          </g>
        );
      })}
      {graph.nodes.map((n) => {
        const current = frame?.current === n.id;
        const seen = visited.has(n.id);
        const d = frame?.dist?.[n.id];
        return (
          <g key={n.id}>
            {current && (
              <motion.circle cx={n.x} cy={n.y} r={16} className="fill-none stroke-brand"
                initial={{ scale: 1, opacity: 0.5 }} animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "easeOut" }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }} strokeWidth={2} />
            )}
            <circle cx={n.x} cy={n.y} r={16} strokeWidth={2}
              className={cx("transition-[fill,stroke] duration-300",
                current ? "fill-brand stroke-brand" : seen ? "fill-cat-graph/35 stroke-cat-graph" : "fill-surface-2 stroke-border-strong")} />
            <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize="13" fontWeight="600"
              className={cx("font-mono transition-[fill] duration-300", current ? "fill-on-brand" : "fill-fg")}>{n.id}</text>
            {d != null && d !== Infinity && (
              <text x={n.x} y={n.y - 22} textAnchor="middle" fontSize="9" className="font-mono fill-fg-faint">d{d}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
