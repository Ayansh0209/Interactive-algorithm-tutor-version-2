// trie -> an SVG prefix tree with CHARACTER-LABELLED EDGES. Word-end nodes are
// highlighted and show the stored word (if the trie keeps one, e.g. word
// search). Scene shape: { type: "trie", root: { is_word, children: {ch: node},
// word? } }. Scales to the card width via FitWidth.

import { motion } from "framer-motion";
import { cx } from "../ui";
import { FitWidth } from "../AutoFit";

function collect(root) {
  const nodes = [];
  const edges = [];   // [parentId, childId, char]
  let order = 0;

  function walk(n, depth, ch) {
    const id = nodes.length;
    const node = { id, depth, ch, isWord: !!n.is_word, word: n.word || null, x: 0 };
    nodes.push(node);
    const kids = Object.entries(n.children || {});
    if (kids.length) {
      const childIds = kids.map(([c, child]) => {
        const cid = walk(child, depth + 1, c);
        edges.push([id, cid, c]);
        return cid;
      });
      node.x = childIds.reduce((a, b) => a + nodes[b].x, 0) / childIds.length;
    } else {
      node.x = order++;
    }
    return id;
  }
  walk(root, 0, null);
  return { nodes, edges };
}

export default function TrieView({ value }) {
  const root = value?.root;
  if (!root) return <div className="px-4 py-3 text-fg-faint italic text-sm">empty trie</div>;

  const { nodes, edges } = collect(root);
  if (!nodes.length) return null;

  const GAP_X = 56, GAP_Y = 62;
  const maxX = Math.max(...nodes.map((n) => n.x), 0);
  const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);
  const W = (maxX + 1) * GAP_X + 40;
  const H = (maxDepth + 1) * GAP_Y + 34;
  const px = (n) => n.x * GAP_X + 30;
  const py = (n) => n.depth * GAP_Y + 22;

  return (
    <div className="px-4 py-3">
      <FitWidth min={0.4}>
        <svg width={W} height={H} className="overflow-visible">
          {edges.map(([a, b, c]) => {
            const x1 = px(nodes[a]), y1 = py(nodes[a]);
            const x2 = px(nodes[b]), y2 = py(nodes[b]);
            const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
            return (
              <g key={`${a}-${b}`}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className="stroke-border-strong" strokeWidth="1.5" />
                {/* character label on the edge */}
                <rect x={mx - 9} y={my - 9} width="18" height="18" rx="5" className="fill-surface-2 stroke-border" strokeWidth="1" />
                <text x={mx} y={my + 3.5} textAnchor="middle" fontSize="11" className="font-mono fill-brand font-semibold">{c}</text>
              </g>
            );
          })}
          {nodes.map((n) => (
            <motion.g
              key={n.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 380, damping: 26, delay: Math.min(n.id * 0.015, 0.3) }}
              style={{ transformOrigin: `${px(n)}px ${py(n)}px` }}
            >
              <circle
                cx={px(n)} cy={py(n)} r={n.depth === 0 ? 11 : 9}
                strokeWidth="1.75"
                className={cx(n.isWord ? "fill-success-soft stroke-success" : n.depth === 0 ? "fill-cat-tree/25 stroke-cat-tree" : "fill-surface-2 stroke-border-strong")}
              />
              {n.depth === 0 && (
                <text x={px(n)} y={py(n) + 3.5} textAnchor="middle" fontSize="9" className="fill-fg-muted font-mono">◦</text>
              )}
              {n.isWord && (
                <text x={px(n)} y={py(n) + 3.5} textAnchor="middle" fontSize="9" className="fill-success font-bold">✓</text>
              )}
              {n.word && (
                <text x={px(n)} y={py(n) + 22} textAnchor="middle" fontSize="9.5" className="font-mono fill-success">“{n.word}”</text>
              )}
            </motion.g>
          ))}
        </svg>
      </FitWidth>
    </div>
  );
}
