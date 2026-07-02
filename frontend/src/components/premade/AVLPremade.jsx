// Premade: AVL tree. A BST that rebalances on insert with single/double
// rotations so its height stays O(log n). Node heights are shown; the status
// line reports which rotation fired.

import { useRef, useState } from "react";
import PremadeShell from "./shared/PremadeShell";
import TreeCanvas from "./shared/TreeCanvas";
import { Field, OpButton, StatusBar, Stat } from "./shared/controls";

const num = (raw) => { const n = Number(String(raw).trim()); return Number.isFinite(n) ? n : null; };
const randVal = () => Math.floor(Math.random() * 98) + 1;

const h = (n) => (n ? n.height : 0);
const upd = (n) => { n.height = 1 + Math.max(h(n.left), h(n.right)); };
const bf = (n) => (n ? h(n.left) - h(n.right) : 0);
const rotR = (y) => { const x = y.left; y.left = x.right; x.right = y; upd(y); upd(x); return x; };
const rotL = (x) => { const y = x.right; x.right = y.left; y.left = x; upd(x); upd(y); return y; };

export default function AVLPremade() {
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value, left: null, right: null, height: 1 });

  function insert(node, v, log) {
    if (!node) return mk(v);
    if (v < node.value) node.left = insert(node.left, v, log);
    else if (v > node.value) node.right = insert(node.right, v, log);
    else { log.dup = true; return node; }
    upd(node);
    const b = bf(node);
    if (b > 1 && v < node.left.value) { log.rot = "LL → single right rotation"; return rotR(node); }
    if (b < -1 && v > node.right.value) { log.rot = "RR → single left rotation"; return rotL(node); }
    if (b > 1 && v > node.left.value) { log.rot = "LR → left-then-right rotation"; node.left = rotL(node.left); return rotR(node); }
    if (b < -1 && v < node.right.value) { log.rot = "RL → right-then-left rotation"; node.right = rotR(node.right); return rotL(node); }
    return node;
  }

  const seed = () => { let r = null; [30, 20, 40, 10, 25, 35, 50, 5].forEach((v) => { r = insert(r, v, {}); }); return r; };
  const [root, setRoot] = useState(seed);
  const [valueIn, setValueIn] = useState("");
  const [status, setStatus] = useState({ text: "An AVL tree rotates after inserts to keep every node's subtrees within height 1.", tone: "neutral" });

  function add() {
    const v = num(valueIn); if (v === null) return setStatus({ text: "Enter a number.", tone: "danger" });
    const log = {};
    const next = insert(root ? structuredClone(root) : null, v, log);
    setRoot(next);
    setStatus({ text: log.dup ? `${v} already present.` : log.rot ? `Inserted ${v}; balance broken → ${log.rot}.` : `Inserted ${v}; tree already balanced.`, tone: log.rot ? "success" : "neutral" });
    setValueIn("");
  }
  function randomize() { let r = null; Array.from({ length: 7 }, randVal).forEach((v) => { r = insert(r, v, {}); }); setRoot(r); setStatus({ text: "Built a balanced AVL tree from random values.", tone: "neutral" }); }
  function clearAll() { setRoot(null); setStatus({ text: "Cleared.", tone: "neutral" }); }

  return (
    <PremadeShell
      title="AVL Tree"
      accent="bg-cat-tree"
      headerRight={<Stat label="height" value={h(root)} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={add} placeholder="42" width="w-16" type="number" />
          <OpButton icon="plus" onClick={add} tone="brand">Insert</OpButton>
          <OpButton icon="shuffle" onClick={randomize}>Random</OpButton>
          <OpButton onClick={clearAll}>Clear</OpButton>
        </>
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={!root}
      minH="min-h-64"
    >
      <div className="px-4 py-4"><TreeCanvas root={root} height={260} /></div>
    </PremadeShell>
  );
}
