// Premade: array playground. Covers traversal, insert/delete, and linear search.
// Cells animate in/out; traverse and search sweep an animated cursor with a
// speed control. Client-side only.

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T } from "../../lib/motion";
import { Segmented, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat } from "./shared/controls";

const MAX = 12;
const coerce = (raw) => { const t = String(raw).trim(); if (t === "") return null; const n = Number(t); return Number.isFinite(n) ? n : t; };
const randVal = () => Math.floor(Math.random() * 90) + 10;

export default function ArrayPremade() {
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value });
  const [cells, setCells] = useState(() => [4, 8, 15, 16, 23, 42].map(mk));
  const [valueIn, setValueIn] = useState("");
  const [indexIn, setIndexIn] = useState("");
  const [status, setStatus] = useState({ text: "An array stores elements in contiguous, index-addressable slots.", tone: "neutral" });
  const [cursor, setCursor] = useState(-1);
  const [foundId, setFoundId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [speed, setSpeed] = useState(1);
  const reduce = useReducedMotion();

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms / speed));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const clearMarks = () => { setCursor(-1); setFoundId(null); };

  function insertAt(end) {
    if (cells.length >= MAX) return say(`Array is full (max ${MAX}).`, "danger");
    clearMarks();
    const v = coerce(valueIn) ?? randVal();
    const idx = end ? cells.length : Math.max(0, Math.min(cells.length, Number(indexIn) || 0));
    setCells((c) => [...c.slice(0, idx), mk(v), ...c.slice(idx)]);
    say(`Inserted ${v} at index ${idx}. Elements after it shift right — O(n).`, "success");
    setValueIn("");
  }
  function deleteAt() {
    const idx = Number(indexIn);
    if (!Number.isInteger(idx) || idx < 0 || idx >= cells.length) return say(`Index must be 0..${cells.length - 1}.`, "danger");
    clearMarks();
    const removed = cells[idx].value;
    setCells((c) => c.filter((_, i) => i !== idx));
    say(`Deleted ${removed} at index ${idx}. Elements after it shift left — O(n).`, "success");
  }
  function clearAll() { clearMarks(); setCells([]); say("Cleared the array.", "neutral"); }
  function randomize() { clearMarks(); setCells(Array.from({ length: 6 }, () => mk(randVal()))); say("Generated a random array.", "neutral"); }

  async function traverse() {
    if (!cells.length || busy) return;
    setBusy(true); setFoundId(null);
    say("Traversing every index from 0 to n-1 — O(n).", "brand");
    for (let i = 0; i < cells.length; i++) { setCursor(i); await sleep(360); }
    setCursor(-1); setBusy(false); say("Visited all elements once.", "success");
  }
  async function search() {
    const v = coerce(valueIn);
    if (v === null) return say("Enter a value to search for.", "danger");
    if (!cells.length || busy) return;
    setBusy(true); setFoundId(null);
    say(`Linear search for ${v}: check each slot left to right.`, "brand");
    for (let i = 0; i < cells.length; i++) {
      setCursor(i); await sleep(420);
      if (cells[i].value === v) { setFoundId(cells[i].id); setCursor(-1); say(`Found ${v} at index ${i} after ${i + 1} comparison${i ? "s" : ""}.`, "success"); setBusy(false); return; }
    }
    setCursor(-1); say(`${v} is not in the array (checked all ${cells.length}).`, "danger"); setBusy(false);
  }

  return (
    <PremadeShell
      title="Array"
      accent="bg-cat-array"
      headerRight={
        <div className="flex items-center gap-2">
          <Stat label="length" value={cells.length} />
          <Segmented size="sm" value={String(speed)} onChange={(v) => setSpeed(Number(v))} options={[{ value: "0.5", label: "0.5x" }, { value: "1", label: "1x" }, { value: "2", label: "2x" }]} />
        </div>
      }
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={() => insertAt(true)} placeholder="rnd" width="w-16" disabled={busy} />
          <OpButton icon="plus" onClick={() => insertAt(true)} disabled={busy}>Append</OpButton>
          <Field label="idx" value={indexIn} onChange={setIndexIn} placeholder="0" width="w-12" type="number" disabled={busy} />
          <OpButton icon="plus" onClick={() => insertAt(false)} disabled={busy}>Insert@</OpButton>
          <OpButton icon="trash" tone="danger" onClick={deleteAt} disabled={busy}>Delete@</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton icon="target" tone="brand" onClick={traverse} busy={busy}>Traverse</OpButton>
          <OpButton icon="search" tone="brand" onClick={search} busy={busy}>Search</OpButton>
          <OpButton icon="shuffle" onClick={randomize} disabled={busy}>Random</OpButton>
          <OpButton onClick={clearAll} disabled={busy}>Clear</OpButton>
        </>
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={cells.length === 0}
      minH="min-h-48"
    >
      <div className="flex items-start gap-1.5 px-6 py-9 min-w-max">
        <AnimatePresence initial={false}>
          {cells.map((cell, i) => (
            <motion.div key={cell.id} layout initial={{ opacity: 0, scale: 0.6, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.6, y: 10 }} transition={T.spring} className="flex flex-col items-center gap-1.5">
              <div className={cx("min-w-11 h-11 px-2 grid place-items-center rounded-xl border font-mono text-sm tabular-nums transition-colors duration-200",
                foundId === cell.id ? "border-success bg-success-soft text-fg ring-2 ring-success/30"
                  : cursor === i ? "border-cat-array bg-brand-soft text-fg ring-2 ring-cat-array/30"
                  : "border-border bg-surface-2 text-fg")}>
                {String(cell.value)}
              </div>
              <span className="text-3xs font-mono text-fg-faint leading-none">{i}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </PremadeShell>
  );
}
