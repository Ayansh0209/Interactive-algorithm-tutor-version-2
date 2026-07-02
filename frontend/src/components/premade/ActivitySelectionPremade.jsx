// Premade: Activity Selection (greedy). Sort by finish time, then keep every
// activity that starts after the last kept one finishes. Step player over a
// timeline of intervals.

import { useState } from "react";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

const ACTS = [[1, 3], [2, 5], [4, 6], [6, 7], [5, 8], [7, 9]].map(([s, e], i) => ({ id: i, s, e }));
const TMAX = 10;

function frames() {
  const sorted = [...ACTS].sort((a, b) => a.e - b.e);
  const fr = [{ state: {}, current: null, note: "Sort activities by finish time, then greedily keep the earliest-finishing non-overlapping ones." }];
  let lastEnd = -1;
  const state = {};
  for (const a of sorted) {
    fr.push({ state: { ...state }, current: a.id, consider: true, note: `Consider activity [${a.s}, ${a.e}].` });
    if (a.s >= lastEnd) { state[a.id] = "pick"; lastEnd = a.e; fr.push({ state: { ...state }, current: a.id, note: `Starts at ${a.s} ≥ last finish ${lastEnd === a.e ? a.e : lastEnd} → keep it.` }); }
    else { state[a.id] = "skip"; fr.push({ state: { ...state }, current: a.id, note: `Starts at ${a.s} before last finish → overlaps, skip.` }); }
  }
  const picked = Object.values(state).filter((v) => v === "pick").length;
  fr.push({ state: { ...state }, current: null, done: true, note: `Done — ${picked} activities selected, the maximum possible.` });
  return fr;
}

export default function ActivitySelectionPremade() {
  const [run, setRun] = useState(null);
  const player = useStepPlayer(run || []);
  const frame = run ? player.frame : null;
  const sorted = [...ACTS].sort((a, b) => a.e - b.e);

  return (
    <PremadeShell
      title="Activity Selection"
      accent="bg-cat-graph"
      headerRight={<OpButton icon="zap" tone="brand" onClick={() => setRun(frames())}>{run ? "Re-run" : "Run"}</OpButton>}
      legend={<Legend items={[{ label: "considering", color: "bg-warning" }, { label: "selected", color: "bg-cat-graph" }, { label: "skipped (overlap)", color: "bg-fg/20" }]} />}
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : "Greedy: always pick the next activity that finishes earliest and fits."}</StatusBar>}
      footer={run ? <StepTransport player={player} /> : null}
      empty={!run}
      minH="min-h-64"
    >
      <div className="px-6 py-5">
        <svg viewBox={`0 0 ${TMAX * 34 + 20} ${sorted.length * 30 + 24}`} className="w-full">
          {Array.from({ length: TMAX + 1 }).map((_, t) => (
            <g key={t}>
              <line x1={t * 34 + 10} y1={14} x2={t * 34 + 10} y2={sorted.length * 30 + 18} className="stroke-border/60" strokeWidth="1" />
              <text x={t * 34 + 10} y={10} textAnchor="middle" fontSize="8" className="font-mono fill-fg-faint">{t}</text>
            </g>
          ))}
          {sorted.map((a, row) => {
            const st = frame?.state?.[a.id];
            const cur = frame?.current === a.id;
            const tone = st === "pick" ? "fill-cat-graph/70" : st === "skip" ? "fill-fg/15" : cur ? "fill-warning/70" : "fill-surface-2";
            const stroke = st === "pick" ? "stroke-cat-graph" : cur ? "stroke-warning" : "stroke-border-strong";
            return (
              <g key={a.id}>
                <rect x={a.s * 34 + 10} y={row * 30 + 20} width={(a.e - a.s) * 34} height={20} rx="5" className={cx("transition-colors duration-200", tone, stroke)} strokeWidth="1.5" />
                <text x={a.s * 34 + 16} y={row * 30 + 34} fontSize="10" className="font-mono fill-fg">{a.s}–{a.e}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </PremadeShell>
  );
}
