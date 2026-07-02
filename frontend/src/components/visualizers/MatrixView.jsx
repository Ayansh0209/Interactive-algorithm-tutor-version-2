// matrix / dp_grid -> a 2D grid of cells.
// For dp_grid we tint filled cells so the table "filling in" reads clearly, and
// animate a cell when its value changes. The most recently written cell pops.
// (No fabricated dependency arrows here -- the engine doesn't report which cells
// a step READ, and we never guess. The premade DP visualizers show those.)

import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value.rows || [];
  return [];
}

export default function MatrixView({ value, lastWrite }) {
  const rows = rowsFrom(value);
  const isDP = value && value.type === "dp_grid";
  const cols = rows.reduce((m, r) => Math.max(m, (r || []).length), 0);

  return (
    <div className="px-4 py-3 overflow-auto scrollbar-thin">
      <div className="inline-grid gap-px" style={{ gridTemplateColumns: `1.5rem repeat(${cols}, 2.5rem)` }}>
        {/* column headers */}
        <span />
        {Array.from({ length: cols }).map((_, j) => (
          <span key={`c${j}`} className="h-5 grid place-items-center text-3xs font-mono text-fg-faint">{j}</span>
        ))}
        {rows.map((row, i) => (
          <Row key={i} row={row || []} i={i} cols={cols} isDP={isDP} lastWrite={lastWrite} />
        ))}
      </div>
    </div>
  );
}

function Row({ row, i, cols, isDP, lastWrite }) {
  return (
    <>
      <span className="w-6 grid place-items-center text-3xs font-mono text-fg-faint">{i}</span>
      {Array.from({ length: cols }).map((_, j) => {
        const cell = row[j];
        const filled = isDP && cell !== 0 && cell !== null && cell !== "" && cell !== undefined;
        const isHot = lastWrite && lastWrite[0] === i && lastWrite[1] === j;
        return (
          <motion.div
            key={j}
            initial={false}
            animate={isHot ? { scale: [1, 1.12, 1] } : { scale: 1 }}
            transition={T.base}
            className={cx(
              "w-10 h-10 grid place-items-center rounded-md border text-2xs font-mono tabular-nums transition-colors duration-300",
              isHot ? "border-warning bg-warning-soft text-fg z-10"
                : filled ? "border-cat-dp/40 bg-cat-dp/15 text-fg"
                : "border-border bg-surface-2 text-fg-muted"
            )}
          >
            {cell === null || cell === undefined ? "" : typeof cell === "boolean" ? (cell ? "1" : "0") : String(cell)}
          </motion.div>
        );
      })}
    </>
  );
}
