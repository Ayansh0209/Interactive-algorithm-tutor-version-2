// Premade: binary search on a sorted array. Computes frames, then the step
// player walks lo / mid / hi while the discarded half dims out each step.

import { useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { Field, OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

const DEFAULT = [3, 7, 12, 18, 23, 29, 34, 41, 55, 68];

function binFrames(arr, target) {
  const frames = [];
  let lo = 0, hi = arr.length - 1;
  frames.push({ lo, hi, mid: null, note: `Search for ${target}. Window is the whole array: lo=0, hi=${hi}.` });
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    frames.push({ lo, hi, mid, note: `mid=${mid}, arr[mid]=${arr[mid]}. Compare to ${target}.` });
    if (arr[mid] === target) { frames.push({ lo, hi, mid, found: mid, done: true, note: `Found ${target} at index ${mid}.` }); return frames; }
    if (arr[mid] < target) { lo = mid + 1; frames.push({ lo, hi, mid, note: `${arr[mid]} < ${target} → discard the left half. lo=${lo}.` }); }
    else { hi = mid - 1; frames.push({ lo, hi, mid, note: `${arr[mid]} > ${target} → discard the right half. hi=${hi}.` }); }
  }
  frames.push({ lo, hi, mid: null, done: true, notFound: true, note: `Window is empty — ${target} is not present.` });
  return frames;
}

export default function BinarySearchPremade() {
  const [arr] = useState(DEFAULT);
  const [targetIn, setTargetIn] = useState("23");
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;

  const run = () => { const t = Number(targetIn); if (Number.isFinite(t)) setFrames(binFrames(arr, t)); };

  const cellState = (i) => {
    if (!frame) return "idle";
    if (frame.found === i) return "found";
    if (i < frame.lo || i > frame.hi) return "out";
    if (frame.mid === i) return "mid";
    return "in";
  };

  return (
    <PremadeShell
      title="Binary Search"
      accent="bg-cat-array"
      headerRight={<span className="text-3xs font-mono text-fg-faint">O(log n)</span>}
      controls={
        <>
          <Field label="target" value={targetIn} onChange={setTargetIn} onSubmit={run} placeholder="23" width="w-16" type="number" />
          <OpButton icon="search" tone="brand" onClick={run}>{frames ? "Re-search" : "Search"}</OpButton>
          <span className="text-2xs text-fg-faint ml-1">array is pre-sorted</span>
        </>
      }
      legend={<Legend items={[
        { label: "mid", color: "bg-warning" },
        { label: "in window", color: "bg-cat-array/30 border border-cat-array" },
        { label: "discarded", color: "bg-fg/10" },
        { label: "found", color: "bg-cat-graph" },
      ]} />}
      status={<StatusBar tone={frame?.found != null ? "success" : frame?.notFound ? "danger" : "neutral"}>{frame ? frame.note : "Binary search halves the search window each step — press Search."}</StatusBar>}
      footer={frames ? <StepTransport player={player} /> : null}
      empty={!frames}
      minH="min-h-44"
    >
      <div className="flex items-start justify-center gap-1.5 px-6 py-10 min-w-max">
        {arr.map((v, i) => {
          const st = cellState(i);
          return (
            <div key={i} className="flex flex-col items-center gap-1.5">
              <div className="h-4 flex items-end gap-0.5">
                {frame?.lo === i && <Ptr label="lo" />}
                {frame?.mid === i && <Ptr label="mid" tone="warning" />}
                {frame?.hi === i && <Ptr label="hi" />}
              </div>
              <motion.div animate={st === "mid" ? { scale: [1, 1.1, 1] } : { scale: 1 }} transition={T.base}
                className={cx("min-w-10 h-11 px-2 grid place-items-center rounded-xl border font-mono text-sm tabular-nums transition-colors duration-300",
                  st === "found" ? "border-cat-graph bg-cat-graph/25 text-fg ring-2 ring-cat-graph/30"
                    : st === "mid" ? "border-warning bg-warning-soft text-fg"
                    : st === "in" ? "border-cat-array/50 bg-cat-array/10 text-fg"
                    : st === "out" ? "border-border bg-fg/[0.03] text-fg-faint opacity-50"
                    : "border-border bg-surface-2 text-fg")}>
                {v}
              </motion.div>
              <span className="text-3xs font-mono text-fg-faint leading-none">{i}</span>
            </div>
          );
        })}
      </div>
    </PremadeShell>
  );
}

function Ptr({ label, tone = "neutral" }) {
  return <span className={cx("px-1 rounded text-3xs font-semibold leading-4", tone === "warning" ? "bg-warning text-white" : "bg-fg/70 text-bg")}>{label}</span>;
}
