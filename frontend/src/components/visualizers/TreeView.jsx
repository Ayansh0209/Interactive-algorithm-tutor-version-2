// binary_tree / avl_tree / red_black_tree / segment_tree / nary_tree -> SVG tree.
// A single layout routine positions nodes by in-order x and depth y, then draws
// edges + circles. Red-black nodes are colored; AVL nodes show height.

function collect(root, kind) {
  // Returns {nodes:[{id,label,depth,xOrder,color}], edges:[[parentId,childId]]}
  const nodes = [];
  const edges = [];
  let order = 0;

  function children(n) {
    if (kind === "nary_tree") return (n.children || []).filter(Boolean);
    return [n.left, n.right].filter(Boolean);
  }
  function label(n) {
    if (kind === "segment_tree") return `${n.val}\n[${n.start},${n.end}]`;
    return String(n.val);
  }

  function walk(n, depth) {
    if (!n) return null;
    const id = nodes.length;
    const node = { id, depth, color: n.color, height: n.height, x: 0 };
    nodes.push(node);
    // In-order placement: left subtree, self, right subtree.
    const kids = children(n);
    if (kind !== "nary_tree" && kids.length) {
      // binary: place left, then self, then right
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
  if (!root) return <div className="px-4 py-3 text-white/30 italic text-sm">empty tree</div>;

  const { nodes, edges } = collect(root, kind);
  if (!nodes.length) return null;

  const GAP_X = 56;
  const GAP_Y = 70;
  const maxX = Math.max(...nodes.map((n) => n.x), 0);
  const maxDepth = Math.max(...nodes.map((n) => n.depth), 0);
  const W = (maxX + 1) * GAP_X + 40;
  const H = (maxDepth + 1) * GAP_Y + 20;
  const px = (n) => n.x * GAP_X + 30;
  const py = (n) => n.depth * GAP_Y + 26;

  return (
    <div className="px-4 py-3 overflow-auto">
      <svg width={W} height={H} className="overflow-visible">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={px(nodes[a])} y1={py(nodes[a])}
            x2={px(nodes[b])} y2={py(nodes[b])}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"
          />
        ))}
        {nodes.map((n) => {
          const red = n.color === "red";
          const black = n.color === "black";
          return (
            <g key={n.id}>
              <circle
                cx={px(n)} cy={py(n)} r="17"
                fill={red ? "#e11d48" : black ? "#1e293b" : "rgba(99,102,241,0.18)"}
                stroke={red ? "#fb7185" : "rgba(255,255,255,0.35)"}
                strokeWidth="1.5"
              />
              <text
                x={px(n)} y={py(n) + 4} textAnchor="middle"
                fontSize="12" fill="#fff" fontFamily="monospace"
              >
                {String(n.label).split("\n")[0]}
              </text>
              {n.height != null && (
                <text x={px(n) + 20} y={py(n) - 12} fontSize="9" fill="#a5b4fc">
                  h{n.height}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
