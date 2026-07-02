// Shows the active loop as a box that "counts up" -- the for-loop visual the
// way it's drawn on paper: index variable, range, and a progress bar across
// iterations. Driven entirely by loop_meta from the engine.

import { Badge } from "./ui";

export default function LoopBox({ loop }) {
  if (!loop) return null;

  if (loop.kind === "for_range") {
    const { index_var, start, stop, step, current_value, current_iteration, total_iterations } = loop;
    const pct = total_iterations && current_iteration != null
      ? Math.min(100, Math.round(((current_iteration + 1) / total_iterations) * 100)) : 0;
    return (
      <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge color="amber">for loop</Badge>
            <span className="font-mono text-sm text-fg truncate">
              {index_var} = {current_value ?? start} in range({start}, {stop}{step !== 1 ? `, ${step}` : ""})
            </span>
          </div>
          <span className="text-2xs text-fg-muted shrink-0">
            {current_iteration != null ? current_iteration + 1 : "-"}{total_iterations != null ? ` / ${total_iterations}` : ""}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-fg/10 overflow-hidden">
          <div className="h-full bg-warning transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>
    );
  }

  const desc = loop.kind === "while" ? `while ${loop.condition}`
    : loop.kind === "for_enumerate" ? `for ${(loop.vars || []).join(", ")} in enumerate(...)`
    : `for ${(loop.vars || []).join(", ")} in ${loop.iterable || "..."}`;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-2.5 flex items-center gap-2">
      <Badge color="amber">{loop.kind.replace("_", " ")}</Badge>
      <span className="font-mono text-sm text-fg truncate">{desc}</span>
    </div>
  );
}
