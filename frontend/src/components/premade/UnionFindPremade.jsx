// Premade: Union-Find / Disjoint Set Union. Union by rank + animated find with
// path compression. Nodes sit in a row; an arrow points from each node to its
// parent, flattening toward the root as paths compress.

import { useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Legend } from "./shared/controls";

const N = 8;
const num = (raw) => { const n = Number(String(raw).trim()); return Number.isInteger(n) && n >= 0 && n < N ? n : null; };

export default function UnionFindPremade() {
  const [parent, setParent] = useState(() => Array.from({ length: N }, (_, i) => i));
  const rank = useRef(Array(N).fill(0));
  const [aIn, setAIn] = useState("0");
  const [bIn, setBIn] = useState("1");
  const [active, setActive] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: `${N} singleton sets. Union merges two; Find returns a set's root.`, tone: "neutral" });
  const reduce = useReducedMotion();

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const findPure = (p, x) => { let c = x; while (p[c] !== c) c = p[c]; return c; };

  function union() {
    const a = num(aIn), b = num(bIn);
    if (a === null || b === null) return say(`Enter two values 0..${N - 1}.`, "danger");
    const ra = findPure(parent, a), rb = findPure(parent, b);
    if (ra === rb) return say(`${a} and ${b} are already in the same set (root ${ra}).`, "neutral");
    const np = [...parent];
    if (rank.current[ra] < rank.current[rb]) np[ra] = rb;
    else if (rank.current[ra] > rank.current[rb]) np[rb] = ra;
    else { np[rb] = ra; rank.current[ra]++; }
    setParent(np);
    say(`union(${a}, ${b}) → linked root ${rb === np[rb] ? rb : ra} under the taller tree.`, "success");
  }

  async function find() {
    const x = num(aIn); if (x === null) return say(`Enter a value 0..${N - 1} in the first box.`, "danger");
    if (busy) return; setBusy(true);
    const path = []; let cur = x;
    while (parent[cur] !== cur) { path.push(cur); cur = parent[cur]; }
    path.push(cur);
    say(`find(${x}): follow parents up to the root…`, "brand");
    const seen = [];
    for (const id of path) { seen.push(id); setActive([...seen]); await sleep(420); }
    if (path.length > 2) { const np = [...parent]; for (const id of path) np[id] = cur; setParent(np); say(`Root is ${cur}. Path compressed — every node now points straight at it.`, "success"); }
    else say(`Root of ${x} is ${cur}.`, "success");
    await sleep(300); setActive([]); setBusy(false);
  }

  function reset() { setParent(Array.from({ length: N }, (_, i) => i)); rank.current = Array(N).fill(0); setActive([]); say("Reset to singletons.", "neutral"); }

  const GAP = 46, X = (i) => i * GAP + 24;
  const Y = 116;

  return (
    <PremadeShell
      title="Union-Find (DSU)"
      accent="bg-cat-graph"
      controls={
        <>
          <Field label="a" value={aIn} onChange={setAIn} width="w-12" type="number" disabled={busy} />
          <Field label="b" value={bIn} onChange={setBIn} width="w-12" type="number" disabled={busy} />
          <OpButton icon="link" onClick={union} tone="brand" disabled={busy}>Union(a,b)</OpButton>
          <OpButton icon="search" onClick={find} busy={busy}>Find(a)</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton onClick={reset} disabled={busy}>Reset</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "root", color: "bg-cat-graph" }, { label: "on find path", color: "bg-warning" }, { label: "→ parent", color: "bg-border-strong" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      minH="min-h-44"
    >
      <div className="overflow-auto scrollbar-thin">
        <svg width={N * GAP + 8} height={150} className="mx-auto">
          <defs>
            <marker id="uf-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" className="fill-fg-faint" />
            </marker>
          </defs>
          {parent.map((p, i) => p !== i ? (
            <path key={i} d={`M ${X(i)} ${Y - 16} Q ${(X(i) + X(p)) / 2} ${Y - 58} ${X(p)} ${Y - 16}`} fill="none" className="stroke-border-strong" strokeWidth="1.5" markerEnd="url(#uf-arrow)" />
          ) : null)}
          {parent.map((p, i) => {
            const isRoot = p === i;
            const onPath = active.includes(i);
            return (
              <g key={i}>
                <circle cx={X(i)} cy={Y} r="15" strokeWidth="2"
                  className={cx("transition-[fill,stroke] duration-200", onPath ? "fill-warning-soft stroke-warning" : isRoot ? "fill-cat-graph/30 stroke-cat-graph" : "fill-surface-2 stroke-border-strong")} />
                <text x={X(i)} y={Y + 4} textAnchor="middle" fontSize="12" className="font-mono fill-fg">{i}</text>
              </g>
            );
          })}
        </svg>
      </div>
    </PremadeShell>
  );
}
