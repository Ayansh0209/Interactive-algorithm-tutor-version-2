// Array / list / dp_array / dsu / set -> a row of boxes.
// Highlights cells that were just written (from semantic events), draws
// pointer markers for any integer local that indexes into this array
// (i, j, left, right, lo, hi, slow, fast ...), and — when the current step is
// a SWAP — draws an animated double-headed arc between the two swapped cells
// so the exchange reads as motion, not just a color change.

import { useRef, useState, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";

const POINTER_NAMES = new Set([
  "i", "j", "k", "left", "right", "lo", "hi", "l", "r", "mid",
  "slow", "fast", "start", "end", "p", "q", "low", "high",
]);

function cellsFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value.values || value.parent || [];
  return [];
}

export default function ArrayView({ name, value, step, highlightIndices = [] }) {
  const cells = cellsFrom(value);
  const hi = new Set(highlightIndices);

  // The swap event (if any) on THIS array at THIS step -> animated arc.
  const swap = (step?.semantic || []).find(
    (e) => e.kind === "swap" && e.target === name && e.i != null && e.j != null
  );
  const wrapRef = useRef(null);
  const cellRefs = useRef({});
  const [arc, setArc] = useState(null);

  useLayoutEffect(() => {
    if (!swap || !wrapRef.current) { setArc(null); return; }
    const a = cellRefs.current[swap.i];
    const b = cellRefs.current[swap.j];
    if (!a || !b) { setArc(null); return; }
    const x1 = a.offsetLeft + a.offsetWidth / 2;
    const x2 = b.offsetLeft + b.offsetWidth / 2;
    const y = Math.min(a.offsetTop, b.offsetTop) + 2;
    const lift = Math.min(30, 16 + Math.abs(x2 - x1) * 0.12);
    setArc({ x1, x2, y, lift });
  }, [swap, step?.i, cells.length]);

  // Pointer overlay: integer locals that fall within this array's index range.
  const pointers = {};
  const locals = step?.locals || {};
  for (const [k, v] of Object.entries(locals)) {
    if (k === name) continue;
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < cells.length) {
      if (POINTER_NAMES.has(k) || cells.length <= 64) (pointers[v] = pointers[v] || []).push(k);
    }
  }

  const markerId = `swap-arrow-${name.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  return (
    <div className="px-4 py-3 overflow-x-auto scrollbar-thin">
      <div ref={wrapRef} className="relative flex items-start gap-1.5 flex-wrap pt-7">
        {/* swap arc overlay */}
        {arc && (
          <svg className="absolute inset-0 h-full w-full pointer-events-none overflow-visible" aria-hidden="true">
            <defs>
              <marker id={markerId} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0,0 L8,4 L0,8 z" className="fill-brand" />
              </marker>
            </defs>
            <motion.path
              key={`${step?.i}-${swap?.i}-${swap?.j}`}
              d={`M ${arc.x1} ${arc.y} C ${arc.x1} ${arc.y - arc.lift}, ${arc.x2} ${arc.y - arc.lift}, ${arc.x2} ${arc.y}`}
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              className="stroke-brand"
              markerStart={`url(#${markerId})`}
              markerEnd={`url(#${markerId})`}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          </svg>
        )}

        {cells.map((c, i) => {
          const swapped = swap && (i === swap.i || i === swap.j);
          return (
            <div key={i} ref={(el) => { cellRefs.current[i] = el; }} className="flex flex-col items-center gap-1">
              <motion.div
                layout
                transition={T.spring}
                animate={swapped ? { scale: [1, 1.14, 1] } : { scale: 1 }}
                className={cx(
                  "min-w-10 h-10 px-2 grid place-items-center rounded-lg border text-sm font-mono tabular-nums transition-colors duration-300",
                  swapped
                    ? "border-brand bg-brand-soft text-fg shadow-glow"
                    : hi.has(i)
                      ? "border-warning bg-warning-soft text-fg shadow-soft"
                      : "border-border bg-surface-2 text-fg"
                )}
              >
                <motion.span key={String(c)} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={T.fast}>
                  {formatCell(c)}
                </motion.span>
              </motion.div>
              <span className="text-3xs font-mono text-fg-faint leading-none">{i}</span>
              <div className="h-4 flex items-start justify-center gap-0.5">
                {(pointers[i] || []).map((pname) => (
                  <motion.span
                    key={pname}
                    layoutId={`ptr-${name}-${pname}`}
                    transition={T.spring}
                    className="px-1 rounded bg-brand text-on-brand text-3xs font-semibold leading-4"
                  >
                    {pname}
                  </motion.span>
                ))}
              </div>
            </div>
          );
        })}
        {cells.length === 0 && <span className="text-fg-faint text-sm italic">empty</span>}
      </div>
    </div>
  );
}

function formatCell(c) {
  if (c === null) return "∅";
  if (typeof c === "boolean") return c ? "T" : "F";
  if (typeof c === "object") return JSON.stringify(c);
  return String(c);
}
