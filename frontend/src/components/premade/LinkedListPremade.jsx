// Premade: Linked List, parameterized by `variant` (singly / doubly / circular).
// Operations: insert front / back / at index, delete by value, search (animated
// traversal), reverse, clear. Nodes animate in/out and reorder via layout.

import { useRef, useState, Fragment } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, Segmented, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat } from "./shared/controls";
import { formatValue } from "./shared/primitives";

const MAX = 12;
const coerce = (raw) => { const t = String(raw).trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : t; };
const randVal = () => Math.floor(Math.random() * 90) + 10;
const TITLES = { singly: "Singly Linked List", doubly: "Doubly Linked List", circular: "Circular Linked List" };

export default function LinkedListPremade({ variant = "singly" }) {
  const doubly = variant === "doubly";
  const circular = variant === "circular";
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value });

  const [nodes, setNodes] = useState(() => [7, 3, 9].map(mk));
  const [valueIn, setValueIn] = useState("");
  const [indexIn, setIndexIn] = useState("");
  const [status, setStatus] = useState({ text: intro(variant), tone: "neutral" });
  const [activeId, setActiveId] = useState(null);
  const [foundId, setFoundId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [speed, setSpeed] = useState(1);
  const reduce = useReducedMotion();

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms / speed));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const clearMarks = () => { setActiveId(null); setFoundId(null); };
  const take = () => coerce(valueIn) ?? randVal();

  function insertFront() { if (guardFull()) return; clearMarks(); const v = take(); setNodes((ns) => [mk(v), ...ns]); say(`Inserted ${formatValue(v)} at the head — O(1).`, "success"); setValueIn(""); }
  function insertBack() { if (guardFull()) return; clearMarks(); const v = take(); setNodes((ns) => [...ns, mk(v)]); say(`Appended ${formatValue(v)} at the tail.`, "success"); setValueIn(""); }
  function insertAt() {
    if (guardFull()) return;
    const idx = Number(indexIn);
    if (!Number.isInteger(idx) || idx < 0 || idx > nodes.length) return say(`Index must be 0..${nodes.length}.`, "danger");
    clearMarks(); const v = take();
    setNodes((ns) => [...ns.slice(0, idx), mk(v), ...ns.slice(idx)]);
    say(`Inserted ${formatValue(v)} at index ${idx}.`, "success"); setValueIn("");
  }
  function deleteValue() {
    const v = coerce(valueIn); if (v === null) return say("Enter a value to delete.", "danger");
    const idx = nodes.findIndex((n) => n.value === v);
    if (idx === -1) return say(`${formatValue(v)} is not in the list.`, "danger");
    clearMarks(); setNodes((ns) => ns.filter((_, i) => i !== idx));
    say(`Deleted ${formatValue(v)} (was at index ${idx}).`, "success"); setValueIn("");
  }
  function reverse() {
    if (nodes.length < 2) return say("Need at least two nodes to reverse.", "neutral");
    clearMarks(); setNodes((ns) => [...ns].reverse());
    say(doubly ? "Reversed — swap each node's prev/next." : "Reversed — every next pointer now points the other way.", "success");
  }
  function clearAll() { clearMarks(); setNodes([]); say("Cleared the list.", "neutral"); }

  async function search() {
    const v = coerce(valueIn); if (v === null) return say("Enter a value to search for.", "danger");
    if (!nodes.length) return say("List is empty.", "neutral");
    setBusy(true); setFoundId(null); say(`Searching for ${formatValue(v)} from the head…`, "brand");
    for (let k = 0; k < nodes.length; k++) {
      setActiveId(nodes[k].id); await sleep(520);
      if (nodes[k].value === v) { setFoundId(nodes[k].id); say(`Found ${formatValue(v)} at index ${k} after ${k + 1} step${k ? "s" : ""}.`, "success"); setBusy(false); return; }
    }
    setActiveId(null); say(`${formatValue(v)} is not in the list (walked all ${nodes.length} nodes).`, "danger"); setBusy(false);
  }

  function guardFull() { if (nodes.length >= MAX) { say(`List is full (max ${MAX}).`, "danger"); return true; } return false; }

  const last = nodes.length - 1;

  return (
    <PremadeShell
      title={TITLES[variant]}
      accent="bg-cat-linked"
      headerRight={
        <div className="flex items-center gap-2">
          <Stat label="length" value={nodes.length} />
          <Segmented size="sm" value={String(speed)} onChange={(v) => setSpeed(Number(v))} options={[{ value: "0.5", label: "0.5x" }, { value: "1", label: "1x" }, { value: "2", label: "2x" }]} />
        </div>
      }
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={insertBack} placeholder="rnd" width="w-16" disabled={busy} />
          <OpButton icon="plus" onClick={insertFront} disabled={busy}>Front</OpButton>
          <OpButton icon="plus" onClick={insertBack} disabled={busy}>Back</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <Field label="idx" value={indexIn} onChange={setIndexIn} onSubmit={insertAt} placeholder="0" width="w-12" type="number" disabled={busy} />
          <OpButton onClick={insertAt} disabled={busy}>Insert@</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton icon="search" onClick={search} busy={busy} tone="brand">Search</OpButton>
          <OpButton icon="trash" onClick={deleteValue} disabled={busy} tone="danger">Delete</OpButton>
          <OpButton icon="shuffle" onClick={reverse} disabled={busy}>Reverse</OpButton>
          <OpButton onClick={clearAll} disabled={busy}>Clear</OpButton>
        </>
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={nodes.length === 0}
      minH="min-h-56"
    >
      <div className="flex items-start gap-0 px-6 py-9 min-w-max">
        <AnimatePresence initial={false}>
          {nodes.map((n, i) => (
            <Fragment key={n.id}>
              <LLNode node={n} index={i} isLast={i === last} doubly={doubly}
                state={foundId === n.id ? "found" : activeId === n.id ? "active" : "idle"} />
              {i < last && <Arrow doubly={doubly} active={activeId === n.id || (activeId != null && nodes[i + 1]?.id === activeId)} />}
            </Fragment>
          ))}
        </AnimatePresence>
        {nodes.length > 0 && (circular ? <WrapTerm /> : <NullTerm />)}
      </div>
    </PremadeShell>
  );
}

function intro(v) {
  if (v === "doubly") return "A doubly linked list: each node points to both its next and previous node.";
  if (v === "circular") return "A circular linked list: the last node points back to the head, forming a loop.";
  return "A singly linked list. Each node points to the next; the last points to null.";
}

const NODE_STATE = {
  idle: "border-border bg-surface-2",
  active: "border-cat-linked bg-info-soft ring-2 ring-cat-linked/30",
  found: "border-success bg-success-soft ring-2 ring-success/30",
};

function LLNode({ node, index, isLast, doubly, state }) {
  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.6, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6, y: 10 }} transition={T.spring} className="flex flex-col items-center gap-2">
      <div className="h-4 flex items-end gap-2">
        {index === 0 && <span className="text-3xs font-semibold uppercase tracking-wide text-cat-linked">head</span>}
        {doubly && isLast && index !== 0 && <span className="text-3xs font-semibold uppercase tracking-wide text-fg-faint">tail</span>}
      </div>
      <div className={cx("flex rounded-xl border overflow-hidden transition-colors duration-200", NODE_STATE[state])}>
        {doubly && <div className="w-5 h-12 grid place-items-center bg-fg/[0.03] border-r border-border"><span className="h-1.5 w-1.5 rounded-full bg-fg-faint" /></div>}
        <div className="min-w-11 h-12 grid place-items-center px-2 font-mono text-sm font-medium text-fg tabular-nums">{formatValue(node.value)}</div>
        <div className="w-5 h-12 grid place-items-center bg-fg/[0.03] border-l border-border"><span className="h-1.5 w-1.5 rounded-full bg-cat-linked" /></div>
      </div>
      <span className="text-3xs font-mono text-fg-faint leading-none">{index}</span>
    </motion.div>
  );
}

function Arrow({ active, doubly }) {
  return (
    <div className="flex flex-col items-center self-stretch justify-center pt-2">
      <div className="flex items-center" aria-hidden="true">
        {doubly && <Icon name="chevron-right" size={14} className={cx("-mr-1 rotate-180 transition-colors", active ? "text-cat-linked" : "text-fg-faint")} />}
        <span className={cx("block h-px w-6 transition-colors duration-200", active ? "bg-cat-linked" : "bg-border-strong")} />
        <Icon name="chevron-right" size={14} className={cx("-ml-1 transition-colors duration-200", active ? "text-cat-linked" : "text-fg-faint")} />
      </div>
    </div>
  );
}

function NullTerm() {
  return (
    <div className="flex items-start self-start pt-[1.6rem]">
      <span className="block h-px w-5 bg-border-strong mt-6" />
      <div className="h-12 grid place-items-center px-3 rounded-xl border border-dashed border-border text-2xs font-mono text-fg-faint">null</div>
    </div>
  );
}

function WrapTerm() {
  return (
    <div className="flex items-center self-stretch pt-[1.6rem] text-cat-linked">
      <span className="block h-px w-5 bg-cat-linked/60 mt-6" />
      <span className="mt-2 inline-flex items-center gap-1 px-2 py-1 rounded-lg border border-cat-linked/30 bg-info-soft text-2xs"><Icon name="reset" size={12} /> head</span>
    </div>
  );
}
