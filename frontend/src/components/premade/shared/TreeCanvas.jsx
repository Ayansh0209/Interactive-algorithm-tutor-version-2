// Reusable SVG canvas for binary trees (BST / AVL / red-black). Lays nodes out
// by in-order x and depth y, then draws edges + circles. States: active (on the
// search/compare path), found, and optional red-black coloring / AVL heights.

import { motion } from "framer-motion";
import { cx } from "../../ui";

function layout(root) {
  const nodes = [];
  const edges = [];
  let order = 0;
  function walk(n, depth, parentId) {
    if (!n) return;
    walk(n.left, depth + 1, n.id);
    const x = order++;
    nodes.push({ id: n.id, value: n.value, color: n.color, height: n.height, x, depth });
    if (parentId != null) edges.push([parentId, n.id]);
    walk(n.right, depth + 1, n.id);
  }
  walk(root, 0, null);
  return { nodes, edges };
}

export default function TreeCanvas({ root, activeIds = [], foundId = null, height = 220 }) {
  if (!root) return null;
  const { nodes, edges } = layout(root);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...nodes.map((n) => n.x), 0);
  const maxD = Math.max(...nodes.map((n) => n.depth), 0);
  const GAP_X = 52, GAP_Y = 60;
  const W = (maxX + 1) * GAP_X + 36;
  const H = (maxD + 1) * GAP_Y + 24;
  const X = (n) => n.x * GAP_X + 26;
  const Y = (n) => n.depth * GAP_Y + 24;
  const active = new Set(activeIds);

  return (
    <div className="overflow-auto scrollbar-thin" style={{ maxHeight: height }}>
      <svg width={Math.max(W, 200)} height={H} className="mx-auto">
        {edges.map(([a, b], i) => (
          <line key={i} x1={X(pos[a])} y1={Y(pos[a])} x2={X(pos[b])} y2={Y(pos[b])} className="stroke-border-strong" strokeWidth="1.5" />
        ))}
        {nodes.map((n) => {
          const red = n.color === "red";
          const black = n.color === "black";
          const found = n.id === foundId;
          const act = active.has(n.id);
          const fill = found ? "fill-success-soft" : act ? "fill-warning-soft" : red ? "fill-danger" : black ? "fill-fg/80" : "fill-cat-tree/20";
          const stroke = found ? "stroke-success" : act ? "stroke-warning" : red ? "stroke-danger" : black ? "stroke-fg/60" : "stroke-cat-tree";
          const text = (red || black) && !found && !act ? "fill-on-brand" : "fill-fg";
          return (
            <motion.g key={n.id} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 26 }}>
              <circle cx={X(n)} cy={Y(n)} r="16" strokeWidth="2" className={cx("transition-[fill,stroke] duration-200", fill, stroke)} />
              <text x={X(n)} y={Y(n) + 4} textAnchor="middle" fontSize="12" className={cx("font-mono", text)}>{n.value}</text>
              {n.height != null && <text x={X(n) + 18} y={Y(n) - 12} fontSize="8" className="font-mono fill-cat-tree">h{n.height}</text>}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
