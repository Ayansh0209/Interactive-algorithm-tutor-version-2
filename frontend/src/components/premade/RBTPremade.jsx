// Premade: Red-Black Tree (insert). Maintains the red-black invariants via
// recoloring + rotations on each insert; nodes are drawn red or black.

import { useRef, useState } from "react";
import PremadeShell from "./shared/PremadeShell";
import TreeCanvas from "./shared/TreeCanvas";
import { Field, OpButton, StatusBar, Legend } from "./shared/controls";
import { makeRBT } from "./shared/rbt";

const num = (raw) => { const n = Number(String(raw).trim()); return Number.isFinite(n) ? n : null; };
const randVal = () => Math.floor(Math.random() * 98) + 1;
const SEED = [10, 20, 30, 15, 25, 5, 1, 40];

export default function RBTPremade() {
  const rbtRef = useRef(null);
  if (!rbtRef.current) { rbtRef.current = makeRBT(); SEED.forEach((v) => rbtRef.current.insert(v)); }
  const [root, setRoot] = useState(() => rbtRef.current.render());
  const [valueIn, setValueIn] = useState("");
  const [status, setStatus] = useState({ text: "Red-black rules keep the tree roughly balanced: the root is black and no red node has a red child.", tone: "neutral" });

  function add() {
    const v = num(valueIn); if (v === null) return setStatus({ text: "Enter a number.", tone: "danger" });
    const added = rbtRef.current.insert(v);
    setRoot(rbtRef.current.render());
    setStatus({ text: added ? `Inserted ${v} (red), then recolored / rotated to restore the invariants.` : `${v} already present.`, tone: added ? "success" : "neutral" });
    setValueIn("");
  }
  function randomize() { rbtRef.current = makeRBT(); Array.from({ length: 8 }, randVal).forEach((v) => rbtRef.current.insert(v)); setRoot(rbtRef.current.render()); setStatus({ text: "Built a red-black tree from random values.", tone: "neutral" }); }
  function clearAll() { rbtRef.current = makeRBT(); setRoot(null); setStatus({ text: "Cleared.", tone: "neutral" }); }

  return (
    <PremadeShell
      title="Red-Black Tree"
      accent="bg-cat-tree"
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={add} placeholder="42" width="w-16" type="number" />
          <OpButton icon="plus" onClick={add} tone="brand">Insert</OpButton>
          <OpButton icon="shuffle" onClick={randomize}>Random</OpButton>
          <OpButton onClick={clearAll}>Clear</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "red node", color: "bg-danger" }, { label: "black node", color: "bg-fg/80" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={!root}
      minH="min-h-64"
    >
      <div className="px-4 py-4"><TreeCanvas root={root} height={260} /></div>
    </PremadeShell>
  );
}
