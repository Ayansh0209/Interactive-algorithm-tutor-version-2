// matrix / dp_grid -> a 2D grid of cells.
// For dp_grid we tint filled cells so the table "filling in" reads clearly, and
// animate a cell when its value changes. The most recently written cell pops.
// Cells size themselves to the widest value and DP "infinity" sentinels
// (>= 1e9, e.g. INT_MAX / 1e9) render as ∞ so they never overflow the cell.
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

function fmtCell(c) {
  if (c === null || c === undefined || c === "") return "";
  if (typeof c === "boolean") return c ? "1" : "0";
  if (typeof c === "number" && Math.abs(c) >= 1e9) return c > 0 ? "∞" : "-∞";
  return String(c);
}

export default function MatrixView({ value, lastWrite }) {
  const rows = rowsFrom(value);
  const isDP = value && (value.type === "dp_grid" || value.type === "matrix");
  const cols = rows.reduce((m, r) => Math.max(m, (r || []).length), 0);

  // Size cells to the widest rendered value so nothing clips.
  let maxLen = 1;
  for (const r of rows) for (const c of r || []) maxLen = Math.max(maxLen, fmtCell(c).length);
  const cellPx = Math.max(28, Math.min(64, maxLen * 8.5 + 14));
  const fontClass = maxLen <= 2 ? "text-2xs" : maxLen <= 4 ? "text-[10px]" : "text-[9px]";

  return (
    <div className="px-4 py-3 overflow-x-auto scrollbar-thin">
      <div className="inline-grid gap-px" style={{ gridTemplateColumns: `1.4rem repeat(${cols}, ${cellPx}px)` }}>
        <span />
        {Array.from({ length: cols }).map((_, j) => (
          <span key={`c${j}`} className="h-5 grid place-items-center text-3xs font-mono text-fg-faint">{j}</span>
        ))}
        {rows.map((row, i) => (
          <Row key={i} row={row || []} i={i} cols={cols} isDP={isDP} lastWrite={lastWrite} cellPx={cellPx} fontClass={fontClass} />
        ))}
      </div>
    </div>
  );
}

function Row({ row, i, cols, isDP, lastWrite, cellPx, fontClass }) {
  return (
    <>
      <span className="grid place-items-center text-3xs font-mono text-fg-faint" style={{ width: "1.4rem" }}>{i}</span>
      {Array.from({ length: cols }).map((_, j) => {
        const cell = row[j];
        const text = fmtCell(cell);
        const filled = isDP && text !== "" && cell !== 0 && !(typeof cell === "number" && Math.abs(cell) >= 1e9);
        const isHot = lastWrite && lastWrite[0] === i && lastWrite[1] === j;
        return (
          <motion.div
            key={j}
            initial={false}
            animate={isHot ? { scale: [1, 1.14, 1] } : { scale: 1 }}
            transition={T.base}
            style={{ width: cellPx, height: cellPx }}
            className={cx(
              "grid place-items-center rounded-md border font-mono tabular-nums transition-colors duration-300",
              fontClass,
              isHot ? "border-warning bg-warning-soft text-fg z-10"
                : filled ? "border-cat-dp/40 bg-cat-dp/15 text-fg"
                : "border-border bg-surface-2 text-fg-muted"
            )}
          >
            {text === "∞" || text === "-∞" ? <span className="text-fg-faint">{text}</span> : text}
          </motion.div>
        );
      })}
    </>
  );
}
