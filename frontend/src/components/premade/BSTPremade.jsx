// Premade: Binary Search Tree. Insert / delete / search (animated path) plus all
// four traversals (in / pre / post / level) animated in order. Also serves the
// "binary tree traversals" topic.

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import TreeCanvas from "./shared/TreeCanvas";
import { Field, OpButton, StatusBar, Stat } from "./shared/controls";

const MAX = 15;
const num = (raw) => { const n = Number(String(raw).trim()); return Number.isFinite(n) ? n : null; };
const randVal = () => Math.floor(Math.random() * 98) + 1;

export default function BSTPremade() {
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value, left: null, right: null });
  const [root, setRoot] = useState(() => buildBST([50, 30, 70, 20, 40, 60, 80], mk));
  const [valueIn, setValueIn] = useState("");
  const [active, setActive] = useState([]);
  const [foundId, setFoundId] = useState(null);
  const [visited, setVisited] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: "A BST keeps smaller values left, larger right — so search is O(height).", tone: "neutral" });
  const reduce = useReducedMotion();

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const count = (n) => (n ? 1 + count(n.left) + count(n.right) : 0);

  function insert() {
    const v = num(valueIn); if (v === null) return say("Enter a number.", "danger");
    if (count(root) >= MAX) return say(`Tree is full (max ${MAX}).`, "danger");
    setFoundId(null); setVisited([]);
    const next = root ? structuredClone(root) : null;
    setRoot(bstInsert(next, v, mk)); say(`Inserted ${v}.`, "success"); setValueIn("");
  }
  function remove() {
    const v = num(valueIn); if (v === null) return say("Enter a number.", "danger");
    setFoundId(null); setVisited([]);
    const next = root ? structuredClone(root) : null;
    setRoot(bstDelete(next, v)); say(`Deleted ${v} (if present).`, "brand"); setValueIn("");
  }
  function clearAll() { setRoot(null); setVisited([]); setActive([]); setFoundId(null); say("Cleared.", "neutral"); }
  function randomize() {
    const vals = Array.from({ length: 7 }, () => randVal());
    setRoot(buildBST(vals, mk)); setVisited([]); setActive([]); setFoundId(null); say("Random BST built.", "neutral");
  }

  async function search() {
    const v = num(valueIn); if (v === null) return say("Enter a number.", "danger");
    if (busy) return; setBusy(true); setFoundId(null); setVisited([]);
    say(`Search ${v}: go left if smaller, right if larger.`, "brand");
    let cur = root;
    while (cur) {
      setActive([cur.id]); await sleep(450);
      if (v === cur.value) { setFoundId(cur.id); setActive([]); say(`Found ${v}.`, "success"); setBusy(false); return; }
      cur = v < cur.value ? cur.left : cur.right;
    }
    setActive([]); say(`${v} is not in the tree.`, "danger"); setBusy(false);
  }

  async function traverse(kind) {
    if (busy || !root) return; setBusy(true); setFoundId(null); setVisited([]);
    const order = TRAVERSALS[kind](root);
    say(`${LABEL[kind]} traversal…`, "brand");
    const acc = [];
    for (const node of order) { setActive([node.id]); acc.push(node.value); setVisited([...acc]); await sleep(440); }
    setActive([]); setBusy(false); say(`${LABEL[kind]}: ${acc.join(", ")}`, "success");
  }

  return (
    <PremadeShell
      title="Binary Search Tree"
      accent="bg-cat-tree"
      headerRight={<Stat label="nodes" value={count(root)} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={insert} placeholder="42" width="w-16" type="number" disabled={busy} />
          <OpButton icon="plus" onClick={insert} tone="brand" disabled={busy}>Insert</OpButton>
          <OpButton icon="search" onClick={search} busy={busy}>Search</OpButton>
          <OpButton icon="trash" onClick={remove} tone="danger" disabled={busy}>Delete</OpButton>
          <OpButton icon="shuffle" onClick={randomize} disabled={busy}>Random</OpButton>
          <OpButton onClick={clearAll} disabled={busy}>Clear</OpButton>
        </>
      }
      legend={
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-3xs uppercase tracking-wider text-fg-faint mr-1">traverse</span>
          {Object.keys(TRAVERSALS).map((k) => (
            <button key={k} onClick={() => traverse(k)} disabled={busy}
              className="px-2 h-6 rounded-md text-3xs font-medium bg-fg/[0.05] text-fg-muted hover:text-fg hover:bg-fg/[0.09] disabled:opacity-40 transition-colors">
              {LABEL[k]}
            </button>
          ))}
        </div>
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={!root}
      minH="min-h-64"
    >
      <div className="px-4 py-4">
        <TreeCanvas root={root} activeIds={active} foundId={foundId} height={240} />
        {visited.length > 0 && (
          <div className="mt-2 flex items-center gap-2 justify-center flex-wrap">
            {visited.map((v, i) => (
              <span key={i} className={cx("h-6 min-w-6 px-1.5 grid place-items-center rounded-md border font-mono text-3xs", i === visited.length - 1 ? "border-warning bg-warning-soft text-fg" : "border-border bg-surface-2 text-fg-muted")}>{v}</span>
            ))}
          </div>
        )}
      </div>
    </PremadeShell>
  );
}

// --- BST ops (operate on plain {id,value,left,right} nodes) ------------------
function bstInsert(root, v, mk) {
  if (!root) return mk(v);
  if (v < root.value) root.left = bstInsert(root.left, v, mk);
  else if (v > root.value) root.right = bstInsert(root.right, v, mk);
  return root;
}
function bstDelete(root, v) {
  if (!root) return null;
  if (v < root.value) root.left = bstDelete(root.left, v);
  else if (v > root.value) root.right = bstDelete(root.right, v);
  else {
    if (!root.left) return root.right;
    if (!root.right) return root.left;
    let succ = root.right; while (succ.left) succ = succ.left;
    root.value = succ.value; root.id = succ.id;
    root.right = bstDelete(root.right, succ.value);
  }
  return root;
}
function buildBST(vals, mk) {
  let root = null;
  for (const v of vals) root = bstInsert(root, v, mk);
  return root;
}

const TRAVERSALS = {
  in: (r) => { const o = []; (function go(n) { if (!n) return; go(n.left); o.push(n); go(n.right); })(r); return o; },
  pre: (r) => { const o = []; (function go(n) { if (!n) return; o.push(n); go(n.left); go(n.right); })(r); return o; },
  post: (r) => { const o = []; (function go(n) { if (!n) return; go(n.left); go(n.right); o.push(n); })(r); return o; },
  level: (r) => { const o = []; const q = r ? [r] : []; while (q.length) { const n = q.shift(); o.push(n); if (n.left) q.push(n.left); if (n.right) q.push(n.right); } return o; },
};
const LABEL = { in: "Inorder", pre: "Preorder", post: "Postorder", level: "Level" };
