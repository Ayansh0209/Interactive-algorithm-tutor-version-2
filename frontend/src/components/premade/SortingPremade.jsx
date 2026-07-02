// Premade: sorting visualizer, parameterized by `algo`. One component covers
// bubble / selection / insertion / merge / quick / heap. Each algorithm runs on
// item objects (stable ids) and records frame snapshots, so bars slide into
// place via framer-motion layout while the step player scrubs.

import { useState } from "react";
import { Icon, EmptyState, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { Field, OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";
import { SORTERS, SORT_META } from "./shared/sorting";

const parseList = (raw) =>
  raw.split(/[,\s]+/).map((s) => s.trim()).filter(Boolean).map(Number).filter((n) => Number.isFinite(n)).slice(0, 14);
const randList = () => Array.from({ length: 8 }, () => Math.floor(Math.random() * 95) + 5);

export default function SortingPremade({ algo = "bubble" }) {
  const meta = SORT_META[algo] || SORT_META.bubble;
  const [input, setInput] = useState("5, 2, 9, 1, 6, 3, 8");
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;

  function sort() {
    const vals = parseList(input);
    if (vals.length < 2) return;
    const items = vals.map((v, i) => ({ id: i + 1, value: v }));
    setFrames(SORTERS[algo](items));
  }
  function randomize() {
    const vals = randList();
    setInput(vals.join(", "));
    const items = vals.map((v, i) => ({ id: i + 1, value: v }));
    setFrames(SORTERS[algo](items));
  }

  const maxVal = frame ? Math.max(...frame.arr.map((x) => x.value), 1) : 1;

  return (
    <PremadeShell
      title={`${meta.label} Sort`}
      accent="bg-cat-array"
      headerRight={<span className="text-3xs font-mono text-fg-faint">{meta.complexity}</span>}
      controls={
        <>
          <Field label="array" value={input} onChange={setInput} onSubmit={sort} placeholder="5, 2, 9, 1" width="w-44" />
          <OpButton icon="zap" tone="brand" onClick={sort}>Sort</OpButton>
          <OpButton icon="shuffle" onClick={randomize}>Random</OpButton>
        </>
      }
      legend={
        <Legend items={[
          { label: "comparing", color: "bg-warning" },
          { label: "pivot / key", color: "bg-cat-tree" },
          { label: "sorted", color: "bg-cat-graph" },
          { label: "unsorted", color: "bg-fg/25" },
        ]} />
      }
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : `${meta.label} sort — press Sort to watch it run.`}</StatusBar>}
      footer={frames ? <StepTransport player={player} /> : null}
      empty={!frames}
      emptyState={
        <EmptyState
          icon={<Icon name="layers" size={22} />}
          title={`${meta.label} sort`}
          hint={meta.blurb}
          action={<OpButton icon="zap" tone="brand" onClick={sort}>Sort the array</OpButton>}
        />
      }
      minH="min-h-72"
    >
      <div className="flex items-end justify-center gap-1.5 h-60 px-6 pb-3 pt-8">
        {frame && frame.arr.map((item, pos) => {
          const state = cellState(frame, pos);
          return (
            <div key={pos} className="flex flex-col items-center gap-1.5 flex-1 max-w-12 justify-end h-full">
              <span className={cx("text-3xs font-mono tabular-nums", state === "compare" ? "text-warning" : "text-fg-faint")}>{item.value}</span>
              <div
                className={cx("w-full rounded-t-md transition-all duration-300 ease-snap", BAR[state])}
                style={{ height: `${Math.max(6, (item.value / maxVal) * 100)}%` }}
              />
            </div>
          );
        })}
      </div>
    </PremadeShell>
  );
}

const BAR = {
  idle: "bg-fg/25",
  compare: "bg-warning",
  pivot: "bg-cat-tree",
  sorted: "bg-cat-graph",
};

function cellState(frame, pos) {
  if (frame.sorted?.includes(pos)) return "sorted";
  if (frame.compare?.includes(pos)) return "compare";
  if (frame.pivot === pos) return "pivot";
  return "idle";
}
