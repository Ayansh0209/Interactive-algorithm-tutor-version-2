// graph_adjacency_list / graph_weighted -> nodes on a circle with edges.
// Highlights nodes present in a "visited" set local if one exists in the step,
// so BFS/DFS frontier expansion is visible. Weighted edges show their weight.

import { motion } from "framer-motion";
import { cx } from "../ui";

export default function GraphView({ value, step }) {
  const adj = value?.adjacency || {};
  const weighted = value?.type === "graph_weighted";
  const nodes = Object.keys(adj);
  if (!nodes.length) return <div className="px-4 py-3 text-fg-faint italic text-sm">empty graph</div>;

  const R = Math.min(120, 44 + nodes.length * 9);
  const cx0 = R + 40, cy0 = R + 30;
  const pos = {};
  nodes.forEach((n, i) => {
    const a = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    pos[n] = { x: cx0 + R * Math.cos(a), y: cy0 + R * Math.sin(a) };
  });

  // visited set overlay
  const visited = new Set();
  for (const v of Object.values(step?.locals || {})) {
    if (v && typeof v === "object" && v.type === "set") (v.values || []).forEach((x) => visited.add(String(x)));
  }

  const edges = [];
  for (const [u, nbrs] of Object.entries(adj)) {
    if (Array.isArray(nbrs)) nbrs.forEach((w) => pos[String(w)] && edges.push([u, String(w), null]));
    else Object.entries(nbrs || {}).forEach(([w, wt]) => pos[String(w)] && edges.push([u, String(w), wt]));
  }

  return (
    <div className="px-4 py-3 overflow-auto scrollbar-thin">
      <svg width={cx0 * 2 - 20} height={cy0 * 2 - 20} className="overflow-visible">
        {edges.map(([u, w, wt], i) => {
          const mx = (pos[u].x + pos[w].x) / 2, my = (pos[u].y + pos[w].y) / 2;
          return (
            <g key={i}>
              <line x1={pos[u].x} y1={pos[u].y} x2={pos[w].x} y2={pos[w].y} className="stroke-border-strong" strokeWidth="1.5" />
              {weighted && wt != null && (
                <text x={mx} y={my - 3} textAnchor="middle" fontSize="10" className="font-mono fill-fg-faint">{String(wt)}</text>
              )}
            </g>
          );
        })}
        {nodes.map((n) => {
          const seen = visited.has(String(n));
          return (
            <motion.g key={n} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 26 }} style={{ transformOrigin: `${pos[n].x}px ${pos[n].y}px` }}>
              <circle cx={pos[n].x} cy={pos[n].y} r="18" className={cx("transition-[fill,stroke] duration-300", seen ? "fill-cat-graph/30 stroke-cat-graph" : "fill-surface-2 stroke-border-strong")} strokeWidth="1.75" />
              <text x={pos[n].x} y={pos[n].y + 4} textAnchor="middle" fontSize="12" className="font-mono fill-fg">{n}</text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
