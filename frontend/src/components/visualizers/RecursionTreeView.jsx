// Recursion tree built directly from the step stream (call_id / parent_id).
// Each function call is a node; the tree grows as calls happen, exactly like
// sketching recursion by hand. The active call path is highlighted as you
// scrub, and resolved (returned) calls are dimmed.

import { useMemo } from "react";

function buildCalls(steps) {
  const byId = new Map();
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    if (s.event === "call" && s.function !== "<module>") {
      const top = (s.call_stack || [])[s.call_stack.length - 1] || {};
      byId.set(s.call_id, {
        id: s.call_id,
        parent: s.parent_id == null ? 0 : s.parent_id,
        fn: s.function,
        args: top.args || {},
        enter: i,
        exit: null,
      });
    } else if (s.event === "return" && byId.has(s.call_id)) {
      byId.get(s.call_id).exit = i;
    }
  }
  return byId;
}

export default function RecursionTreeView({ steps, stepIndex }) {
  const calls = useMemo(() => buildCalls(steps), [steps]);

  const layout = useMemo(() => {
    const nodes = [...calls.values()];
    if (!nodes.length) return null;
    const childrenOf = new Map();
    nodes.forEach((n) => {
      if (!childrenOf.has(n.parent)) childrenOf.set(n.parent, []);
      childrenOf.get(n.parent).push(n);
    });
    const roots = nodes.filter((n) => !calls.has(n.parent));
    let order = 0;
    const pos = new Map();
    function place(n, depth) {
      const kids = (childrenOf.get(n.id) || []).sort((a, b) => a.enter - b.enter);
      if (!kids.length) {
        pos.set(n.id, { x: order++, depth });
      } else {
        kids.forEach((k) => place(k, depth + 1));
        const xs = kids.map((k) => pos.get(k.id).x);
        pos.set(n.id, { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth });
      }
    }
    roots.sort((a, b) => a.enter - b.enter).forEach((r) => place(r, 0));
    return { nodes, pos, childrenOf, roots };
  }, [calls]);

  if (!layout) {
    return (
      <div className="px-4 py-6 text-white/30 italic text-sm">
        No function calls in this run (recursion tree appears for recursive / nested calls).
      </div>
    );
  }

  const activeCallId = steps[stepIndex]?.call_id;
  const GAP_X = 92, GAP_Y = 64;
  const maxX = Math.max(...layout.nodes.map((n) => layout.pos.get(n.id).x));
  const maxD = Math.max(...layout.nodes.map((n) => layout.pos.get(n.id).depth));
  const W = (maxX + 1) * GAP_X + 60;
  const H = (maxD + 1) * GAP_Y + 30;
  const X = (n) => layout.pos.get(n.id).x * GAP_X + 40;
  const Y = (n) => layout.pos.get(n.id).depth * GAP_Y + 24;

  return (
    <div className="px-4 py-3 overflow-auto">
      <svg width={W} height={H} className="overflow-visible">
        {layout.nodes.map((n) =>
          (layout.childrenOf.get(n.id) || []).map((c) => (
            <line key={`${n.id}-${c.id}`} x1={X(n)} y1={Y(n)} x2={X(c)} y2={Y(c)}
              stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />
          ))
        )}
        {layout.nodes.map((n) => {
          const visible = n.enter <= stepIndex;
          if (!visible) return null;
          const active = n.id === activeCallId;
          const resolved = n.exit != null && n.exit <= stepIndex;
          const argStr = Object.entries(n.args).map(([k, v]) => `${k}=${fmt(v)}`).join(", ");
          return (
            <g key={n.id} opacity={resolved && !active ? 0.45 : 1}>
              <rect x={X(n) - 38} y={Y(n) - 14} width="76" height="28" rx="7"
                fill={active ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.05)"}
                stroke={active ? "#818cf8" : "rgba(255,255,255,0.2)"} strokeWidth="1.5" />
              <text x={X(n)} y={Y(n) + 4} textAnchor="middle" fontSize="11"
                fontFamily="monospace" fill="#fff">
                {`${n.fn}(${argStr})`.slice(0, 14)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function fmt(v) {
  if (Array.isArray(v)) return `[${v.length}]`;
  if (v && typeof v === "object") return "{}";
  return String(v);
}
