// Premade: Fractional Knapsack (greedy). Take items by best value/weight ratio
// first, splitting the last item to exactly fill the capacity.

import { useState } from "react";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport, Stat } from "./shared/controls";

const CAP = 15;
const ITEMS = [[10, 2], [5, 3], [15, 5], [7, 7], [6, 1]].map(([v, w], i) => ({ id: i, v, w, r: v / w }));

function frames() {
  const sorted = [...ITEMS].sort((a, b) => b.r - a.r);
  const fr = [{ taken: {}, current: null, remaining: CAP, total: 0, note: "Sort by value/weight ratio (densest first), then fill greedily." }];
  let remaining = CAP, total = 0;
  const taken = {};
  for (const it of sorted) {
    if (remaining <= 0) { taken[it.id] = 0; fr.push({ taken: { ...taken }, current: it.id, remaining, total, note: `Knapsack full — skip item ${it.id}.` }); continue; }
    const take = Math.min(it.w, remaining);
    const frac = take / it.w;
    total += it.v * frac; remaining -= take; taken[it.id] = frac;
    fr.push({ taken: { ...taken }, current: it.id, remaining, total, note: frac === 1 ? `Take all of item ${it.id} (v${it.v}, w${it.w}).` : `Take ${(frac * 100).toFixed(0)}% of item ${it.id} to fill the last ${take} units.` });
  }
  fr.push({ taken: { ...taken }, current: null, remaining, total, done: true, note: `Done — maximum value ${total.toFixed(1)} for capacity ${CAP}.` });
  return fr;
}

export default function FractionalKnapsackPremade() {
  const [run, setRun] = useState(null);
  const player = useStepPlayer(run || []);
  const frame = run ? player.frame : null;
  const sorted = [...ITEMS].sort((a, b) => b.r - a.r);

  return (
    <PremadeShell
      title="Fractional Knapsack"
      accent="bg-cat-queue"
      headerRight={<div className="flex items-center gap-2">{frame && <Stat label="value" value={frame.total.toFixed(1)} />}<OpButton icon="zap" tone="brand" onClick={() => setRun(frames())}>{run ? "Re-run" : "Run"}</OpButton></div>}
      legend={<Legend items={[{ label: "current", color: "bg-warning" }, { label: "taken", color: "bg-cat-queue" }]} />}
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : "Greedy works here because you can split items — always grab the densest value first."}</StatusBar>}
      footer={run ? <StepTransport player={player} /> : null}
      empty={!run}
      minH="min-h-64"
    >
      <div className="px-5 py-4 space-y-2">
        {/* capacity gauge */}
        <div className="flex items-center gap-2 text-2xs text-fg-muted">
          <span className="w-16 shrink-0">capacity</span>
          <div className="flex-1 h-4 rounded-full bg-fg/[0.06] overflow-hidden">
            <div className="h-full bg-cat-queue transition-all duration-300" style={{ width: `${frame ? ((CAP - frame.remaining) / CAP) * 100 : 0}%` }} />
          </div>
          <span className="font-mono w-12 text-right">{frame ? CAP - frame.remaining : 0}/{CAP}</span>
        </div>
        {sorted.map((it) => {
          const frac = frame?.taken?.[it.id] ?? 0;
          const cur = frame?.current === it.id;
          return (
            <div key={it.id} className={cx("flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors", cur ? "border-warning bg-warning-soft" : frac > 0 ? "border-cat-queue/40 bg-cat-queue/10" : "border-border bg-surface-2")}>
              <span className="font-mono text-2xs text-fg-faint w-6">#{it.id}</span>
              <span className="font-mono text-2xs text-fg w-28">v{it.v} · w{it.w} · r{it.r.toFixed(1)}</span>
              <div className="flex-1 h-2.5 rounded-full bg-fg/[0.06] overflow-hidden">
                <div className="h-full bg-cat-queue transition-all duration-300" style={{ width: `${frac * 100}%` }} />
              </div>
              <span className="font-mono text-3xs text-fg-faint w-9 text-right">{(frac * 100).toFixed(0)}%</span>
            </div>
          );
        })}
      </div>
    </PremadeShell>
  );
}
