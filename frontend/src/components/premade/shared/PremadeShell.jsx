// The consistent frame every premade visualizer renders into:
//   header (accent dot + title + optional right slot)
//   controls bar (operation buttons / inputs)        -- props.controls
//   canvas (the visualization, or an empty state)    -- props.children / empty
//   status / legend                                  -- props.status, props.legend
//   footer (e.g. step transport)                     -- props.footer
//
// Keeping the chrome here means each structure file is just its own canvas +
// operations, and they all look like one product.

import { Card, EmptyState, cx } from "../../ui";

export default function PremadeShell({
  title, accent = "bg-brand", headerRight,
  controls, legend, status, footer,
  empty = false, emptyState,
  canvasClassName = "", minH = "min-h-64",
  children,
}) {
  return (
    <Card className="overflow-hidden shadow-soft">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border">
        <span className={cx("h-2.5 w-2.5 rounded-full shrink-0", accent)} />
        <h3 className="text-sm font-semibold text-fg">{title}</h3>
        <span className="ml-1 text-3xs uppercase tracking-wider text-fg-faint font-medium">Interactive</span>
        <div className="ml-auto flex items-center gap-2">{headerRight}</div>
      </div>

      {/* Controls */}
      {controls && (
        <div className="flex flex-wrap items-center gap-2 px-4 py-2.5 border-b border-border bg-fg/[0.015]">
          {controls}
        </div>
      )}

      {/* Canvas */}
      <div className={cx("relative overflow-auto scrollbar-thin bg-grid", minH, canvasClassName)}>
        {empty ? (emptyState || <EmptyState title="Nothing here yet" hint="Use the controls above to begin." />) : children}
      </div>

      {/* Legend */}
      {legend && <div className="px-4 py-2 border-t border-border">{legend}</div>}

      {/* Status narration */}
      {status}

      {/* Footer (transport) */}
      {footer}
    </Card>
  );
}
