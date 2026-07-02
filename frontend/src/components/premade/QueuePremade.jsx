// Premade: Queue (FIFO) and Deque (double-ended). One component, `variant`
// selects the control set. Items animate in/out horizontally with front/back
// markers.

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat } from "./shared/controls";

const MAX = 9;
const coerce = (raw) => { const t = String(raw).trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : t; };
const randVal = () => Math.floor(Math.random() * 90) + 10;

export default function QueuePremade({ variant = "queue" }) {
  const deque = variant === "deque";
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value });
  const [items, setItems] = useState(() => [5, 8, 2].map(mk));
  const [valueIn, setValueIn] = useState("");
  const [status, setStatus] = useState({ text: deque ? "A deque lets you add and remove at both ends." : "A queue is first-in, first-out: enqueue at the back, dequeue at the front.", tone: "neutral" });
  const [flashId, setFlashId] = useState(null);

  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const take = () => coerce(valueIn) ?? randVal();
  const flash = (id) => { setFlashId(id); setTimeout(() => setFlashId(null), 700); };

  const full = () => items.length >= MAX;
  function addBack() { if (full()) return say("Full.", "danger"); const n = mk(take()); setItems((s) => [...s, n]); flash(n.id); say(`${deque ? "pushBack" : "enqueue"}(${n.value}) at the back.`, "success"); setValueIn(""); }
  function addFront() { if (full()) return say("Full.", "danger"); const n = mk(take()); setItems((s) => [n, ...s]); flash(n.id); say(`pushFront(${n.value}) at the front.`, "success"); setValueIn(""); }
  function removeFront() { if (!items.length) return say("Empty.", "danger"); const f = items[0]; setItems((s) => s.slice(1)); say(`${deque ? "popFront" : "dequeue"}() → ${f.value}.`, "brand"); }
  function removeBack() { if (!items.length) return say("Empty.", "danger"); const b = items[items.length - 1]; setItems((s) => s.slice(0, -1)); say(`popBack() → ${b.value}.`, "brand"); }
  function clearAll() { setItems([]); say("Cleared.", "neutral"); }

  return (
    <PremadeShell
      title={deque ? "Deque" : "Queue"}
      accent="bg-cat-queue"
      headerRight={<Stat label="size" value={items.length} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={addBack} placeholder="rnd" width="w-16" />
          {deque ? (
            <>
              <OpButton icon="plus" onClick={addFront} tone="brand">Push front</OpButton>
              <OpButton icon="plus" onClick={addBack} tone="brand">Push back</OpButton>
              <OpButton icon="arrow-right" onClick={removeFront} tone="danger">Pop front</OpButton>
              <OpButton icon="arrow-right" onClick={removeBack} tone="danger">Pop back</OpButton>
            </>
          ) : (
            <>
              <OpButton icon="plus" onClick={addBack} tone="brand">Enqueue</OpButton>
              <OpButton icon="arrow-right" onClick={removeFront} tone="danger">Dequeue</OpButton>
            </>
          )}
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton icon="trash" onClick={clearAll}>Clear</OpButton>
        </>
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={items.length === 0}
      minH="min-h-44"
    >
      <div className="flex items-start gap-1.5 px-6 py-10 min-w-max">
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((it, i) => (
            <motion.div key={it.id} layout initial={{ opacity: 0, scale: 0.7, x: deque ? 0 : 18 }} animate={{ opacity: 1, scale: 1, x: 0 }} exit={{ opacity: 0, scale: 0.7 }} transition={T.spring} className="flex flex-col items-center gap-1.5">
              <div className="h-4 text-3xs font-semibold uppercase text-cat-queue">
                {i === 0 ? "front" : i === items.length - 1 ? "back" : ""}
              </div>
              <div className={cx("min-w-12 h-11 px-3 grid place-items-center rounded-xl border font-mono text-sm tabular-nums transition-colors duration-200",
                flashId === it.id ? "border-cat-queue bg-warning-soft text-fg ring-2 ring-cat-queue/30" : "border-border bg-surface-2 text-fg")}>
                {String(it.value)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PremadeShell>
  );
}
