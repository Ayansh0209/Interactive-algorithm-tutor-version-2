// binary_tree / avl_tree / red_black_tree / segment_tree / nary_tree -> SVG tree.
// A single layout routine positions nodes by in-order x and depth y, then draws
// edges + circles. Red-black nodes are colored; AVL nodes show height. Nodes
// pop in with a spring.

import { motion } from "framer-motion";
import { cx } from "../ui";

function collect(root, kind) {
  const nodes = [];
  const edges = [];
  let order = 0;
  const children = (n) => (kind === "nary_tree" ? (n.children || []).filter(Boolean) : [n.left, n.right].filter(Boolean));
  const label = (n) => (kind === "segment_tree" ? `${n.val}\n[${n.start},${n.end}]` : String(n.val));

  function walk(n, depth) {
    if (!n) return null;
    const id = nodes.length;
    const node = { id, depth, color: n.color, height: n.height, x: 0 };
    nodes.push(node);
    const kids = children(n);
    if (kind !== "nary_tree" && kids.length) {
      const leftChild = n.left ? walk(n.left, depth + 1) : null;
      node.x = order++;
      const rightChild = n.right ? walk(n.right, depth + 1) : null;
      if (leftChild !== null) edges.push([id, leftChild]);
      if (rightChild !== null) edges.push([id, rightChild]);
    } else if (kids.length) {
      const childIds = kids.map((c) => walk(c, depth + 1));
      node.x = childIds.reduce((a, b) => a + nodes[b].x, 0) / childIds.length;
      childIds.forEach((cid) => edges.push([id, cid]));
    } else {
      node.x = order++;
    }
    node.label = label(n);
    return id;
  }
  walk(root, 0);
  return { nodes, edges };
}

export default function TreeView({ value }) {
  const root = value?.root;
  const kind = value?.type || "binary_tree";
  if (!root) return <div className="px-4 py-3 text-fg-faint italic text-sm">empty tree</div>;

  const { nodes, edges } = collect(root, kind);
  if (!nodes.length) return null;

  const GAP_X = 58, GAP_Y = 72;
  const maxX = Math.max(...nodes.map((n) => n.x), 0);
  const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);
  const W = (maxX + 1) * GAP_X + 40;
  const H = (maxDepth + 1) * GAP_Y + 20;
  const px = (n) => n.x * GAP_X + 30;
  const py = (n) => n.depth * GAP_Y + 26;

  return (
    <div className="px-4 py-3 overflow-auto scrollbar-thin">
      <svg width={W} height={H} className="overflow-visible">
        {edges.map(([a, b], i) => (
          <line key={i} x1={px(nodes[a])} y1={py(nodes[a])} x2={px(nodes[b])} y2={py(nodes[b])} className="stroke-border-strong" strokeWidth="1.5" />
        ))}
        {nodes.map((n) => {
          const red = n.color === "red";
          const black = n.color === "black";
          const fill = red ? "fill-danger" : black ? "fill-fg/80" : "fill-cat-tree/20";
          const stroke = red ? "stroke-danger" : black ? "stroke-fg/60" : "stroke-cat-tree";
          const textCls = red || black ? "fill-on-brand" : "fill-fg";
          return (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 26, delay: Math.min(n.id * 0.012, 0.25) }} style={{ transformOrigin: `${px(n)}px ${py(n)}px` }}>
              <circle cx={px(n)} cy={py(n)} r="17" className={cx(fill, stroke)} strokeWidth="1.75" />
              <text x={px(n)} y={py(n) + 4} textAnchor="middle" fontSize="12" className={cx("font-mono", textCls)}>
                {String(n.label).split("\n")[0]}
              </text>
              {n.height != null && (
                <text x={px(n) + 20} y={py(n) - 12} fontSize="9" className="fill-cat-tree font-mono">h{n.height}</text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
