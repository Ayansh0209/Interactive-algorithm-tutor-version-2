// Premade: dynamic-programming table, parameterized by `algo` (knapsack / lcs /
// coins / paths). Fills the grid cell by cell and draws arrows from each new
// cell to the cells it was computed from -- legitimate here because the
// recurrence is known (unlike the "run my code" engine, which never guesses).

import { useState } from "react";
import { Icon, EmptyState, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";
import { DP_ALGOS, DP_META, dpFrames, fmt } from "./shared/dp";

const CELL = 34, RH = 30, HH = 24;

export default function DPPremade({ algo = "paths" }) {
  const meta = DP_META[algo] || DP_META.paths;
  const [run, setRun] = useState(null);
  const player = useStepPlayer(run?.frames || []);
  const frame = run ? player.frame : null;

  const go = () => setRun(dpFrames(algo));

  const W = run ? RH + run.C * CELL : 0;
  const H = run ? HH + run.R * CELL : 0;
  const center = (i, j) => ({ x: RH + j * CELL + CELL / 2, y: HH + i * CELL + CELL / 2 });
  const isDep = (i, j) => frame?.deps?.some(([r, c]) => r === i && c === j);
  const isFilled = (i, j) => frame?.filled && frame.filled[0] === i && frame.filled[1] === j;

  return (
    <PremadeShell
      title={meta.label}
      accent="bg-cat-dp"
      headerRight={
        <div className="flex items-center gap-2">
          <span className="text-3xs font-mono text-fg-faint">{meta.complexity}</span>
          <OpButton icon="zap" tone="brand" onClick={go}>{run ? "Re-run" : "Run"}</OpButton>
        </div>
      }
      legend={<Legend items={[{ label: "just filled", color: "bg-warning" }, { label: "read from", color: "bg-cat-dp/30 border border-cat-dp" }, { label: "computed", color: "bg-cat-dp/15" }]} />}
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : DP_ALGOS[algo].blurb}</StatusBar>}
      footer={run ? <StepTransport player={player} /> : null}
      empty={!run}
      emptyState={<EmptyState icon={<Icon name="layers" size={22} />} title={meta.label} hint={DP_ALGOS[algo].blurb} action={<OpButton icon="zap" tone="brand" onClick={go}>Run</OpButton>} />}
      minH="min-h-72"
    >
      {run && (
      <div className="overflow-auto scrollbar-thin px-4 py-5">
        <div className="relative mx-auto" style={{ width: W, height: H }}>
          {/* dependency arrows */}
          <svg className="absolute inset-0 pointer-events-none" width={W} height={H}>
            <defs>
              <marker id="dp-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" className="fill-warning" />
              </marker>
            </defs>
            {frame?.filled && frame.deps.map(([r, c], k) => {
              const a = center(frame.filled[0], frame.filled[1]);
              const b = center(r, c);
              return <line key={k} x1={a.x} y1={a.y} x2={b.x} y2={b.y} className="stroke-warning" strokeWidth="1.75" markerEnd="url(#dp-arrow)" />;
            })}
          </svg>

          <div className="grid" style={{ gridTemplateColumns: `${RH}px repeat(${run.C}, ${CELL}px)`, gridAutoRows: `${CELL}px` }}>
            <div style={{ height: HH }} />
            {run.colLabels.map((lbl, j) => (
              <div key={`c${j}`} className="grid place-items-center text-3xs font-mono text-fg-faint" style={{ height: HH }}>{lbl}</div>
            ))}
            {Array.from({ length: run.R }).map((_, i) => (
              <Row key={i} i={i} run={run} frame={frame} isDep={isDep} isFilled={isFilled} />
            ))}
          </div>
        </div>
      </div>
      )}
    </PremadeShell>
  );
}

function Row({ i, run, frame, isDep, isFilled }) {
  return (
    <>
      <div className="grid place-items-center text-3xs font-mono text-fg-faint">{run.rowLabels[i]}</div>
      {Array.from({ length: run.C }).map((_, j) => {
        const v = frame?.grid?.[i]?.[j];
        const filled = isFilled(i, j);
        const dep = isDep(i, j);
        const has = v !== null && v !== undefined;
        return (
          <div key={j} className={cx(
            "grid place-items-center border text-2xs font-mono tabular-nums transition-colors duration-200",
            filled ? "border-warning bg-warning-soft text-fg z-10"
              : dep ? "border-cat-dp bg-cat-dp/25 text-fg"
              : has ? "border-cat-dp/30 bg-cat-dp/10 text-fg"
              : "border-border bg-surface-2 text-fg-faint"
          )}>
            {fmt(v)}
          </div>
        );
      })}
    </>
  );
}
