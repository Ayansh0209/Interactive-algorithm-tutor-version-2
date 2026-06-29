// The visualization stage: a tab switch between the live structures view and
// the recursion tree, with the active loop box pinned on top.

import { useState } from "react";
import VariablesPanel from "./VariablesPanel";
import RecursionTreeView from "./visualizers/RecursionTreeView";
import LoopBox from "./LoopBox";

export default function Stage({ trace, current, stepIndex }) {
  const [tab, setTab] = useState("structures");
  const steps = trace?.steps || [];
  const hasCalls = steps.some((s) => s.event === "call" && s.function !== "<module>");

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1 px-3 pt-3">
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

      <div className="flex-1 min-h-0 overflow-auto">
        {tab === "structures" ? (
          <VariablesPanel step={current} />
        ) : (
          <RecursionTreeView steps={steps} stepIndex={stepIndex} />
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
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition disabled:opacity-30 ${
        active ? "bg-indigo-600 text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
      }`}
    >
      {children}
    </button>
  );
}
