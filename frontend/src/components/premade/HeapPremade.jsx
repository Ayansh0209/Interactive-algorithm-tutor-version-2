// Premade: binary min-heap / priority queue. Shows the heap as BOTH a tree and
// its array (level order), with animated bubble-up on insert and sift-down on
// extract-min and build-heap (heapify).

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat, Legend } from "./shared/controls";

const MAX = 15;
const coerce = (raw) => { const t = String(raw).trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : t; };
const randVal = () => Math.floor(Math.random() * 90) + 5;

function nodePos(i) {
  const L = Math.floor(Math.log2(i + 1));
  const start = 2 ** L - 1;
  const countInLevel = 2 ** L;
  const xFrac = (i - start + 0.5) / countInLevel;
  return { x: xFrac * 360, y: L * 56 + 24, L };
}

export default function HeapPremade() {
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value });
  const [heap, setHeap] = useState(() => [3, 5, 9, 12, 7].map(mk));
  const [valueIn, setValueIn] = useState("");
  const [active, setActive] = useState([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: "A min-heap keeps the smallest value at the root. Parent ≤ both children.", tone: "neutral" });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const isActive = (id) => active.includes(id);

  async function insert() {
    if (busy || heap.length >= MAX) return heap.length >= MAX && say(`Full (max ${MAX}).`, "danger");
    const v = coerce(valueIn) ?? randVal();
    let a = [...heap, mk(v)]; setHeap(a); setValueIn(""); setBusy(true);
    say(`Insert ${v} at the end, then bubble up while smaller than its parent.`, "brand");
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1; setActive([a[i].id, a[p].id]); await sleep(460);
      if (a[p].value > a[i].value) { [a[i], a[p]] = [a[p], a[i]]; a = [...a]; setHeap(a); i = p; } else break;
    }
    setActive([]); setBusy(false); say(`Inserted ${v}.`, "success");
  }

  async function extractMin() {
    if (busy || !heap.length) return;
    setBusy(true);
    const min = heap[0].value;
    let a = [...heap]; const last = a.pop();
    say(`Remove min ${min}; move the last node to the root and sift down.`, "brand");
    if (a.length) {
      a[0] = last; a = [...a]; setHeap(a);
      let i = 0; const n = a.length;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let s = i; const l = 2 * i + 1, r = 2 * i + 2;
        if (l < n && a[l].value < a[s].value) s = l;
        if (r < n && a[r].value < a[s].value) s = r;
        if (s === i) break;
        setActive([a[i].id, a[s].id]); await sleep(460);
        [a[i], a[s]] = [a[s], a[i]]; a = [...a]; setHeap(a); i = s;
      }
    } else setHeap([]);
    setActive([]); setBusy(false); say(`Extracted ${min}.`, "success");
  }

  async function heapify() {
    if (busy) return;
    let a = Array.from({ length: 7 }, () => mk(randVal())); setHeap([...a]); setBusy(true);
    say("Build-heap: sift down from the last parent up to the root — O(n).", "brand");
    const n = a.length;
    for (let i = (n >> 1) - 1; i >= 0; i--) {
      let j = i;
      // eslint-disable-next-line no-constant-condition
      while (true) {
        let s = j; const l = 2 * j + 1, r = 2 * j + 2;
        if (l < n && a[l].value < a[s].value) s = l;
        if (r < n && a[r].value < a[s].value) s = r;
        if (s === j) break;
        setActive([a[j].id, a[s].id]); await sleep(360);
        [a[j], a[s]] = [a[s], a[j]]; a = [...a]; setHeap(a); j = s;
      }
    }
    setActive([]); setBusy(false); say("Heapified into a valid min-heap.", "success");
  }

  const levels = heap.length ? Math.floor(Math.log2(heap.length)) + 1 : 1;

  return (
    <PremadeShell
      title="Min-Heap / Priority Queue"
      accent="bg-cat-tree"
      headerRight={<Stat label="size" value={heap.length} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={insert} placeholder="rnd" width="w-16" disabled={busy} />
          <OpButton icon="plus" onClick={insert} tone="brand" busy={busy}>Insert</OpButton>
          <OpButton icon="arrow-right" onClick={extractMin} tone="danger" disabled={busy}>Extract-min</OpButton>
          <OpButton icon="shuffle" onClick={heapify} busy={busy}>Heapify</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "root (min)", color: "bg-cat-tree" }, { label: "sifting", color: "bg-warning" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={heap.length === 0}
      minH="min-h-56"
    >
      <div className="px-4 py-3">
        <svg viewBox={`0 0 360 ${levels * 56 + 20}`} className="w-full" style={{ height: `${levels * 56 + 20}px` }}>
          {heap.map((node, i) => {
            const p = nodePos(i);
            return [2 * i + 1, 2 * i + 2].map((c) => c < heap.length ? (
              <line key={`${i}-${c}`} x1={p.x} y1={p.y} x2={nodePos(c).x} y2={nodePos(c).y} className="stroke-border-strong" strokeWidth="1.5" />
            ) : null);
          })}
          {heap.map((node, i) => {
            const p = nodePos(i);
            const act = isActive(node.id);
            return (
              <motion.g key={node.id} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={T.spring}>
                <circle cx={p.x} cy={p.y} r="15" strokeWidth="2"
                  className={cx("transition-[fill,stroke] duration-200", act ? "fill-warning-soft stroke-warning" : i === 0 ? "fill-cat-tree/25 stroke-cat-tree" : "fill-surface-2 stroke-border-strong")} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" className="font-mono fill-fg">{node.value}</text>
              </motion.g>
            );
          })}
        </svg>
        {/* array view */}
        <div className="mt-3 flex items-center gap-2">
          <span className="text-3xs uppercase tracking-wider text-fg-faint w-12 shrink-0">array</span>
          <div className="flex items-center gap-1 flex-wrap">
            {heap.map((node) => (
              <div key={node.id} className={cx("h-7 min-w-7 px-1.5 grid place-items-center rounded-md border font-mono text-2xs", isActive(node.id) ? "border-warning bg-warning-soft text-fg" : "border-border bg-surface-2 text-fg-muted")}>{node.value}</div>
            ))}
            {!heap.length && <span className="text-2xs text-fg-faint italic">empty</span>}
          </div>
        </div>
      </div>
    </PremadeShell>
  );
}
