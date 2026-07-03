// Recursion tree built directly from the step stream (call_id / parent_id).
// Each function call is a node; the tree grows as calls happen, exactly like
// sketching recursion by hand. As you scrub: the active call glows, its
// ancestor path is tinted, resolved calls turn green and show their RETURN
// VALUE, and the most-recently-returned value animates up its edge to the
// parent -- so "fib(3) returned 2, which flows up into fib(4)" is visible.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { cx } from "../ui";

function fmtArg(v) {
  if (Array.isArray(v)) return `[${v.length}]`;
  if (v && typeof v === "object") return v.type ? `<${v.type}>` : "{…}";
  if (typeof v === "string") return v.length > 8 ? `"${v.slice(0, 7)}…"` : `"${v}"`;
  return String(v);
}

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
        ret: undefined,
      });
    } else if (s.event === "return" && byId.has(s.call_id)) {
      const n = byId.get(s.call_id);
      n.exit = i;
      if (Object.prototype.hasOwnProperty.call(s, "return_value")) n.ret = s.return_value;
    }
  }
  return byId;
}

const sigOf = (n) => `${n.fn}(${Object.entries(n.args).map(([k, v]) => `${k}=${fmtArg(v)}`).join(", ")})`;
const retOf = (n) => (n.ret === undefined ? "" : `→ ${fmtArg(n.ret)}`);

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
    let order = 0;
    const pos = new Map();
    function place(n, depth) {
      const kids = (childrenOf.get(n.id) || []).sort((a, b) => a.enter - b.enter);
      if (!kids.length) pos.set(n.id, { x: order++, depth });
      else {
        kids.forEach((k) => place(k, depth + 1));
        const xs = kids.map((k) => pos.get(k.id).x);
        pos.set(n.id, { x: (Math.min(...xs) + Math.max(...xs)) / 2, depth });
      }
    }
    const roots = nodes.filter((n) => !calls.has(n.parent)).sort((a, b) => a.enter - b.enter);
    roots.forEach((r) => place(r, 0));
    const labelLen = Math.max(...nodes.map((n) => Math.max(sigOf(n).length, retOf(n).length + 2)));
    return { nodes, pos, childrenOf, labelLen };
  }, [calls]);

  if (!layout) {
    return <div className="px-4 py-6 text-fg-faint italic text-sm">No function calls in this run (the recursion tree appears for recursive / nested calls).</div>;
  }

  const activeId = steps[stepIndex]?.call_id;
  // Ancestor path of the active call (for tinting the "current spine").
  const pathSet = new Set();
  let cur = activeId;
  while (cur != null && calls.has(cur)) { pathSet.add(cur); cur = calls.get(cur).parent; }

  // The most-recently-resolved node <= the cursor -> its value animates up.
  let recent = null;
  for (const n of layout.nodes) {
    if (n.exit != null && n.exit <= stepIndex && (!recent || n.exit > recent.exit)) recent = n;
  }

  const NODE_W = Math.max(88, Math.min(210, layout.labelLen * 6.6 + 22));
  const NODE_H = 40;
  const GAP_X = NODE_W + 22;
  const GAP_Y = 82;
  const PAD = 26;
  const maxX = Math.max(...layout.nodes.map((n) => layout.pos.get(n.id).x));
  const maxD = Math.max(...layout.nodes.map((n) => layout.pos.get(n.id).depth));
  const W = maxX * GAP_X + NODE_W + PAD * 2;
  const H = maxD * GAP_Y + NODE_H + PAD * 2;
  const CX = (n) => PAD + layout.pos.get(n.id).x * GAP_X + NODE_W / 2;
  const CY = (n) => PAD + layout.pos.get(n.id).depth * GAP_Y + NODE_H / 2;

  return (
    <div className="p-4">
      <svg width={W} height={H} className="overflow-visible">
        {/* edges */}
        {layout.nodes.map((n) =>
          (layout.childrenOf.get(n.id) || []).map((c) => {
            if (c.enter > stepIndex) return null;
            const x1 = CX(n), y1 = CY(n) + NODE_H / 2;
            const x2 = CX(c), y2 = CY(c) - NODE_H / 2;
            const my = (y1 + y2) / 2;
            const onPath = pathSet.has(n.id) && pathSet.has(c.id);
            const resolved = c.exit != null && c.exit <= stepIndex;
            return (
              <path
                key={`${n.id}-${c.id}`}
                d={`M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`}
                fill="none"
                strokeWidth={onPath ? 2 : 1.4}
                className={cx(onPath ? "stroke-brand" : resolved ? "stroke-success/40" : "stroke-border-strong")}
              />
            );
          })
        )}

        {/* return-value bubble on the most-recently-resolved node's edge */}
        {recent && recent.ret !== undefined && calls.has(recent.parent) && (() => {
          const p = calls.get(recent.parent);
          const x1 = CX(recent), y1 = CY(recent) - NODE_H / 2;
          const x2 = CX(p), y2 = CY(p) + NODE_H / 2;
          const label = fmtArg(recent.ret);
          return (
            <motion.g key={`ret-${recent.id}-${recent.exit}`} initial={{ opacity: 0, x: x1 - x2, y: y1 - y2 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 26 }}>
              <g transform={`translate(${(x1 + x2) / 2}, ${(y1 + y2) / 2})`}>
                <rect x={-label.length * 4 - 12} y={-11} width={label.length * 8 + 24} height={22} rx={11} className="fill-brand stroke-brand" />
                <text x={-label.length * 4} y={4} fontSize="11" className="font-mono fill-on-brand font-semibold">↑ {label}</text>
              </g>
            </motion.g>
          );
        })()}

        {/* nodes */}
        {layout.nodes.map((n) => {
          if (n.enter > stepIndex) return null;
          const active = n.id === activeId;
          const onPath = pathSet.has(n.id) && !active;
          const resolved = n.exit != null && n.exit <= stepIndex;
          const sig = sigOf(n);
          const ret = retOf(n);
          const x = CX(n), y = CY(n);
          return (
            <motion.g key={n.id} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 420, damping: 28 }} style={{ transformOrigin: `${x}px ${y}px` }}>
              <rect
                x={x - NODE_W / 2} y={y - NODE_H / 2} width={NODE_W} height={NODE_H} rx={9}
                strokeWidth={active ? 2.5 : 1.5}
                className={cx(
                  active ? "fill-brand/25 stroke-brand"
                    : onPath ? "fill-brand-soft stroke-brand/50"
                    : resolved ? "fill-success-soft stroke-success/45"
                    : "fill-surface-2 stroke-border-strong"
                )}
              />
              <text x={x} y={resolved && ret ? y - 3 : y + 4} textAnchor="middle" fontSize="11.5" className={cx("font-mono", active ? "fill-fg font-semibold" : "fill-fg")}>
                {sig.length > 30 ? sig.slice(0, 29) + "…" : sig}
              </text>
              {resolved && ret && (
                <text x={x} y={y + 12} textAnchor="middle" fontSize="10.5" className="font-mono fill-success font-semibold">{ret}</text>
              )}
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
