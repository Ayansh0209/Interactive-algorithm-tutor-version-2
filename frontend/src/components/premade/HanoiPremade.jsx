// Premade: Tower of Hanoi. The recursive solution is unrolled into a move list,
// then the step player replays it; disks slide between pegs via layout animation.

import { useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { Segmented, EmptyState, Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, StepTransport } from "./shared/controls";

const PEG = ["A", "B", "C"];
const DISK_TONE = ["bg-cat-array", "bg-cat-linked", "bg-cat-graph", "bg-cat-queue", "bg-cat-tree", "bg-cat-hash"];

function hanoiFrames(n) {
  const pegs = [[], [], []];
  for (let s = n; s >= 1; s--) pegs[0].push(s);
  const clone = () => pegs.map((p) => [...p]);
  const frames = [{ pegs: clone(), note: `Goal: move all ${n} disks from A to C, never putting a larger disk on a smaller one.`, moved: null }];
  function move(k, from, to, via) {
    if (k === 0) return;
    move(k - 1, from, via, to);
    const d = pegs[from].pop(); pegs[to].push(d);
    frames.push({ pegs: clone(), note: `Move disk ${d} from ${PEG[from]} → ${PEG[to]}.`, moved: d });
    move(k - 1, via, to, from);
  }
  move(n, 0, 2, 1);
  frames.push({ pegs: clone(), done: true, note: `Solved in ${2 ** n - 1} moves — the minimum possible.`, moved: null });
  return frames;
}

export default function HanoiPremade() {
  const [n, setN] = useState(3);
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;

  const solve = (disks = n) => setFrames(hanoiFrames(disks));

  return (
    <PremadeShell
      title="Tower of Hanoi"
      accent="bg-cat-tree"
      headerRight={
        <div className="flex items-center gap-2">
          <Segmented size="sm" value={String(n)} onChange={(v) => { setN(Number(v)); setFrames(null); }} options={[{ value: "3", label: "3" }, { value: "4", label: "4" }, { value: "5", label: "5" }]} />
          <OpButton icon="zap" tone="brand" onClick={() => solve()}>{frames ? "Re-solve" : "Solve"}</OpButton>
        </div>
      }
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : "Move the whole tower from A to C, one disk at a time."}</StatusBar>}
      footer={frames ? <StepTransport player={player} /> : null}
      empty={!frames}
      emptyState={<EmptyState icon={<Icon name="layers" size={22} />} title="Tower of Hanoi" hint="A classic recursion: move n−1 disks aside, move the biggest, then move the n−1 back. Needs 2ⁿ−1 moves." action={<OpButton icon="zap" tone="brand" onClick={() => solve()}>Solve it</OpButton>} />}
      minH="min-h-64"
    >
      <div className="grid grid-cols-3 gap-2 px-4 py-5 h-64">
        {[0, 1, 2].map((p) => (
          <div key={p} className="relative flex flex-col items-center justify-end">
            {/* peg */}
            <div className="absolute bottom-7 top-3 w-1.5 rounded-full bg-border-strong" />
            <div className="relative flex flex-col-reverse items-center gap-1 z-10 w-full">
              {frame && frame.pegs[p].map((size) => (
                <motion.div key={size} layout transition={T.spring}
                  className={cx("h-5 rounded-md shadow-soft", DISK_TONE[(size - 1) % DISK_TONE.length], frame.moved === size ? "ring-2 ring-warning" : "")}
                  style={{ width: `${28 + size * 16}px` }} />
              ))}
            </div>
            <div className="w-full h-1.5 rounded bg-border-strong mt-1" />
            <span className="text-2xs font-semibold text-fg-faint mt-1">{PEG[p]}</span>
          </div>
        ))}
      </div>
    </PremadeShell>
  );
}
