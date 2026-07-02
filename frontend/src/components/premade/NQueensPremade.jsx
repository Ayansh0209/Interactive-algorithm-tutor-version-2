// Premade: N-Queens via backtracking. Records every try / place / reject /
// backtrack as a frame; the step player replays the search on a chessboard.

import { useState } from "react";
import { Segmented, EmptyState, Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

function solveNQueens(N) {
  const frames = [];
  const place = Array(N).fill(-1);
  const cols = new Set(), d1 = new Set(), d2 = new Set();
  const snap = (note, cur, status) => frames.push({ place: [...place], cur, status, note });
  snap(`Place one queen per row so none attack each other. ${N}×${N}.`, null, "start");
  let solved = false;
  function go(r) {
    if (r === N) { solved = true; snap("Solved — a safe queen in every row.", null, "done"); return true; }
    for (let c = 0; c < N; c++) {
      const safe = !cols.has(c) && !d1.has(r - c) && !d2.has(r + c);
      snap(`Row ${r}: try column ${c}.`, [r, c], safe ? "try" : "reject");
      if (safe) {
        place[r] = c; cols.add(c); d1.add(r - c); d2.add(r + c);
        snap(`Place queen at (${r}, ${c}).`, [r, c], "place");
        if (go(r + 1)) return true;
        place[r] = -1; cols.delete(c); d1.delete(r - c); d2.delete(r + c);
        snap(`Dead end → remove queen from (${r}, ${c}).`, [r, c], "backtrack");
      }
    }
    return false;
  }
  go(0);
  if (!solved) snap("No solution exists for this board.", null, "done");
  return frames;
}

export default function NQueensPremade() {
  const [n, setN] = useState(6);
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;

  const solve = (N = n) => setFrames(solveNQueens(N));
  const cell = Math.min(40, Math.floor(300 / n));

  const cellTone = (r, c) => {
    if (!frame) return "";
    if (frame.cur && frame.cur[0] === r && frame.cur[1] === c) {
      return frame.status === "reject" || frame.status === "backtrack" ? "bg-danger/25" : "bg-warning/30";
    }
    return "";
  };

  return (
    <PremadeShell
      title="N-Queens"
      accent="bg-cat-hash"
      headerRight={
        <div className="flex items-center gap-2">
          <Segmented size="sm" value={String(n)} onChange={(v) => { setN(Number(v)); setFrames(null); }} options={[{ value: "4", label: "4" }, { value: "6", label: "6" }, { value: "8", label: "8" }]} />
          <OpButton icon="zap" tone="brand" onClick={() => solve()}>{frames ? "Re-solve" : "Solve"}</OpButton>
        </div>
      }
      legend={<Legend items={[{ label: "trying", color: "bg-warning" }, { label: "rejected / backtrack", color: "bg-danger" }, { label: "queen", color: "bg-cat-hash" }]} />}
      status={<StatusBar tone={frame?.status === "done" ? "success" : frame?.status === "reject" || frame?.status === "backtrack" ? "danger" : "neutral"}>{frame ? frame.note : "Backtracking search: place a queen, recurse, undo on conflict."}</StatusBar>}
      footer={frames ? <StepTransport player={player} /> : null}
      empty={!frames}
      emptyState={<EmptyState icon={<Icon name="target" size={22} />} title="N-Queens" hint="Place N queens on an N×N board so none share a row, column, or diagonal — a classic backtracking problem." action={<OpButton icon="zap" tone="brand" onClick={() => solve()}>Solve</OpButton>} />}
      minH="min-h-72"
    >
      <div className="grid place-items-center py-6">
        <div className="rounded-lg overflow-hidden border border-border-strong" style={{ width: cell * n }}>
          {Array.from({ length: n }).map((_, r) => (
            <div key={r} className="flex">
              {Array.from({ length: n }).map((_, c) => {
                const dark = (r + c) % 2 === 1;
                const queen = frame && frame.place[r] === c;
                return (
                  <div key={c} className={cx("grid place-items-center", dark ? "bg-fg/[0.06]" : "bg-fg/[0.02]", cellTone(r, c))} style={{ width: cell, height: cell }}>
                    {queen && <span className="text-cat-hash" style={{ fontSize: cell * 0.6 }}>♛</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </PremadeShell>
  );
}
