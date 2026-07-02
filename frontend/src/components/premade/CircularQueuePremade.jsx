// Premade: circular (ring-buffer) queue. Fixed-capacity slots reused as head and
// tail wrap around modulo capacity -- the whole point that a plain queue misses.

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat, Legend } from "./shared/controls";

const CAP = 8;
const coerce = (raw) => { const t = String(raw).trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : t; };
const randVal = () => Math.floor(Math.random() * 90) + 10;

export default function CircularQueuePremade() {
  const idRef = useRef(1);
  const [slots, setSlots] = useState(() => Array(CAP).fill(null));
  const [head, setHead] = useState(0);
  const [tail, setTail] = useState(0);
  const [count, setCount] = useState(0);
  const [valueIn, setValueIn] = useState("");
  const [status, setStatus] = useState({ text: `Capacity ${CAP}. head and tail advance modulo ${CAP}, reusing freed slots.`, tone: "neutral" });

  const say = (text, tone = "neutral") => setStatus({ text, tone });

  function enqueue() {
    if (count >= CAP) return say("Queue is full — head caught up to tail.", "danger");
    const v = coerce(valueIn) ?? randVal();
    const next = [...slots]; next[tail] = { id: idRef.current++, value: v };
    setSlots(next); const nt = (tail + 1) % CAP; setTail(nt); setCount(count + 1);
    say(`enqueue(${v}) at slot ${tail}; tail → ${nt}.`, "success"); setValueIn("");
  }
  function dequeue() {
    if (count === 0) return say("Queue is empty.", "danger");
    const v = slots[head]?.value;
    const next = [...slots]; next[head] = null;
    setSlots(next); const nh = (head + 1) % CAP; setHead(nh); setCount(count - 1);
    say(`dequeue() → ${v} from slot ${head}; head → ${nh}.`, "brand");
  }
  function clearAll() { setSlots(Array(CAP).fill(null)); setHead(0); setTail(0); setCount(0); say("Reset.", "neutral"); }

  return (
    <PremadeShell
      title="Circular Queue"
      accent="bg-cat-queue"
      headerRight={<Stat label="count" value={`${count}/${CAP}`} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={enqueue} placeholder="rnd" width="w-16" />
          <OpButton icon="plus" onClick={enqueue} tone="brand">Enqueue</OpButton>
          <OpButton icon="arrow-right" onClick={dequeue} tone="danger">Dequeue</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton icon="trash" onClick={clearAll}>Clear</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "head (next out)", color: "bg-cat-graph" }, { label: "tail (next in)", color: "bg-cat-queue" }, { label: "filled", color: "bg-cat-queue/20 border border-cat-queue/40" }, { label: "empty", color: "bg-surface-2 border border-dashed border-border" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      minH="min-h-44"
    >
      <div className="flex items-start justify-center gap-1.5 px-6 py-9 min-w-max">
        {slots.map((slot, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className="h-4 flex items-end gap-0.5">
              {head === i && count > 0 && <Tag label="H" tone="bg-cat-graph" />}
              {tail === i && <Tag label="T" tone="bg-cat-queue" />}
            </div>
            <motion.div animate={{ scale: slot ? 1 : 0.96 }} transition={T.spring}
              className={cx("w-12 h-11 grid place-items-center rounded-xl border font-mono text-sm tabular-nums",
                slot ? "border-cat-queue/40 bg-cat-queue/15 text-fg" : "border-dashed border-border bg-surface-2 text-fg-faint")}>
              {slot ? String(slot.value) : <Icon name="minus" size={12} />}
            </motion.div>
            <span className="text-3xs font-mono text-fg-faint leading-none">{i}</span>
          </div>
        ))}
      </div>
    </PremadeShell>
  );
}

function Tag({ label, tone }) {
  return <span className={cx("px-1 rounded text-3xs font-bold text-white leading-4", tone)}>{label}</span>;
}
