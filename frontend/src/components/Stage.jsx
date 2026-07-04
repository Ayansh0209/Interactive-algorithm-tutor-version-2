// The visualization stage: a tab switch between the live structures view and
// the recursion tree, with the active loop box pinned on top.

import { useState } from "react";
import VariablesPanel from "./VariablesPanel";
import RecursionTreeView from "./visualizers/RecursionTreeView";
import LoopBox from "./LoopBox";
import AutoFit from "./AutoFit";
import ZoomPan from "./ZoomPan";
import ErrorBoundary from "./ErrorBoundary";

export default function Stage({ trace, current, stepIndex }) {
  const [tab, setTab] = useState("structures");
  const steps = trace?.steps || [];
  const hasCalls = steps.some((s) => s.event === "call" && s.function !== "<module>");

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-1 px-3 pt-3 shrink-0">
        <TabButton active={tab === "structures"} onClick={() => setTab("structures")}>
          Structures
        </TabButton>
        <TabButton active={tab === "recursion"} onClick={() => setTab("recursion")} disabled={!hasCalls}>
          Recursion tree
        </TabButton>
      </div>

      {current?.scope === "loop" && current?.loop_meta && (
        <div className="px-3 pt-3">
          <LoopBox loop={current.loop_meta} />
        </div>
      )}

      <div className="flex-1 min-h-0">
        {tab === "structures" ? (
          <AutoFit min={0.45} max={1.2} mode="both" align="top">
            <VariablesPanel step={current} />
          </AutoFit>
        ) : (
          <ZoomPan>
            <ErrorBoundary label="recursion tree" resetKey={stepIndex}>
              <RecursionTreeView steps={steps} stepIndex={stepIndex} />
            </ErrorBoundary>
          </ZoomPan>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, disabled, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-2xs font-medium transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 ${
        active ? "bg-brand text-on-brand" : "bg-fg/[0.05] text-fg-muted hover:text-fg hover:bg-fg/[0.09]"
      }`}
    >
      {children}
    </button>
  );
}
