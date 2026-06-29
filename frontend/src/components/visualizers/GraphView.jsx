// graph_adjacency_list / graph_weighted -> nodes on a circle with edges.
// Highlights nodes present in a "visited" set local if one exists in the step,
// so BFS/DFS frontier expansion is visible.

export default function GraphView({ value, step }) {
  const adj = value?.adjacency || {};
  const nodes = Object.keys(adj);
  if (!nodes.length) return <div className="px-4 py-3 text-white/30 italic text-sm">empty graph</div>;

  const R = 90;
  const cx = 140, cy = 120;
  const pos = {};
  nodes.forEach((n, i) => {
    const a = (2 * Math.PI * i) / nodes.length - Math.PI / 2;
    pos[n] = { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) };
  });

  // visited set overlay
  const visited = new Set();
  for (const v of Object.values(step?.locals || {})) {
    if (v && typeof v === "object" && v.type === "set") (v.values || []).forEach((x) => visited.add(String(x)));
  }

  const edges = [];
  for (const [u, nbrs] of Object.entries(adj)) {
    const list = Array.isArray(nbrs) ? nbrs : Object.keys(nbrs || {});
    for (const w of list) if (pos[String(w)]) edges.push([u, String(w)]);
  }

  return (
    <div className="px-4 py-3 overflow-auto">
      <svg width={cx * 2} height={cy * 2}>
        {edges.map(([u, w], i) => (
          <line key={i} x1={pos[u].x} y1={pos[u].y} x2={pos[w].x} y2={pos[w].y}
            stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        ))}
        {nodes.map((n) => {
          const seen = visited.has(String(n));
          return (
            <g key={n}>
              <circle cx={pos[n].x} cy={pos[n].y} r="18"
                fill={seen ? "rgba(16,185,129,0.3)" : "rgba(99,102,241,0.2)"}
                stroke={seen ? "#34d399" : "rgba(255,255,255,0.4)"} strokeWidth="1.5" />
              <text x={pos[n].x} y={pos[n].y + 4} textAnchor="middle" fontSize="12"
                fontFamily="monospace" fill="#fff">{n}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
