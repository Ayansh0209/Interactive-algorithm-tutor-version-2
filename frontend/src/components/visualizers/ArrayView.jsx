// Array / list / dp_array / dsu / set -> a row of boxes.
// Highlights cells that were just written (from semantic events) and draws
// pointer markers for any integer local that indexes into this array
// (i, j, left, right, lo, hi, slow, fast ...). The pointer chips slide between
// cells via shared-layout animation, which is what makes two-pointer /
// sliding-window / binary-search click visually.

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

  // Pointer overlay: integer locals that fall within this array's index range.
  const pointers = {};
  const locals = step?.locals || {};
  for (const [k, v] of Object.entries(locals)) {
    if (k === name) continue;
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < cells.length) {
      if (POINTER_NAMES.has(k) || cells.length <= 64) (pointers[v] = pointers[v] || []).push(k);
    }
  }

  return (
    <div className="px-4 py-3 overflow-x-auto scrollbar-thin">
      <div className="flex items-start gap-1.5 flex-wrap">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <motion.div
              layout
              transition={T.spring}
              className={cx(
                "min-w-10 h-10 px-2 grid place-items-center rounded-lg border text-sm font-mono tabular-nums transition-colors duration-300",
                hi.has(i)
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
        ))}
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
