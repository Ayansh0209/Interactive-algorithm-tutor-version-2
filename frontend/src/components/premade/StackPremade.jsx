// Premade: Stack (LIFO). Client-side. Operations: push, pop, peek, clear.
// Items stack vertically; the top is marked and animates in/out from the top.

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat, Legend } from "./shared/controls";
import { PointerTag, formatValue } from "./shared/primitives";

const MAX = 8;
const coerce = (raw) => {
  const t = String(raw).trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : t;
};
const randVal = () => Math.floor(Math.random() * 90) + 10;

export default function StackPremade() {
  const idRef = useRef(1);
  const mk = (value) => ({ id: idRef.current++, value });

  const [items, setItems] = useState(() => [mk(5), mk(8), mk(2)]); // index 0 = bottom
  const [valueIn, setValueIn] = useState("");
  const [status, setStatus] = useState({ text: "A stack is last-in, first-out. You can only touch the top.", tone: "neutral" });
  const [flashId, setFlashId] = useState(null);
  const reduce = useReducedMotion();
  const flashTimer = useRef(null);

  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const flash = (id) => {
    setFlashId(id);
    clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlashId(null), reduce ? 0 : 950);
  };

  function push() {
    if (items.length >= MAX) return say(`Stack overflow — capacity is ${MAX}.`, "danger");
    const v = coerce(valueIn) ?? randVal();
    const node = mk(v);
    setItems((s) => [...s, node]);
    flash(node.id);
    say(`push(${formatValue(v)}) — new top of the stack. O(1).`, "success");
    setValueIn("");
  }
  function pop() {
    if (!items.length) return say("Stack underflow — nothing to pop.", "danger");
    const top = items[items.length - 1];
    setItems((s) => s.slice(0, -1));
    say(`pop() → ${formatValue(top.value)}. The item below is the new top.`, "brand");
  }
  function peek() {
    if (!items.length) return say("Stack is empty — nothing to peek.", "danger");
    const top = items[items.length - 1];
    flash(top.id);
    say(`peek() → ${formatValue(top.value)} (top is left untouched).`, "brand");
  }
  function clearAll() {
    setItems([]);
    say("Cleared the stack.", "neutral");
  }

  const topId = items.length ? items[items.length - 1].id : null;
  const rendered = items.slice().reverse(); // top first

  return (
    <PremadeShell
      title="Stack"
      accent="bg-cat-stack"
      headerRight={<Stat label="size" value={items.length} />}
      controls={
        <>
          <Field label="value" value={valueIn} onChange={setValueIn} onSubmit={push} placeholder="rnd" width="w-16" />
          <OpButton icon="plus" onClick={push} tone="brand">Push</OpButton>
          <OpButton icon="arrow-right" onClick={pop} tone="danger">Pop</OpButton>
          <OpButton icon="target" onClick={peek}>Peek</OpButton>
          <span className="mx-0.5 h-5 w-px bg-border" />
          <OpButton icon="trash" onClick={clearAll}>Clear</OpButton>
        </>
      }
      legend={
        <Legend items={[
          { label: "top", color: "bg-cat-stack" },
          { label: "item", color: "bg-surface-2 border border-border" },
        ]} />
      }
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      empty={items.length === 0}
      minH="min-h-72"
    >
      <div className="flex flex-col items-center justify-end h-full min-h-72 py-6 gap-1.5">
        <AnimatePresence initial={false} mode="popLayout">
          {rendered.map((it) => {
            const isTop = it.id === topId;
            return (
              <motion.div
                key={it.id}
                layout
                initial={{ opacity: 0, y: -28, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -28, scale: 0.9 }}
                transition={T.spring}
                className="flex items-center gap-2"
              >
                <div
                  className={cx(
                    "w-44 h-11 rounded-xl border grid place-items-center font-mono text-sm font-medium tabular-nums transition-colors duration-200",
                    flashId === it.id
                      ? "border-cat-stack bg-warning-soft text-fg ring-2 ring-cat-stack/30"
                      : isTop
                        ? "border-cat-stack/70 bg-warning-soft/60 text-fg"
                        : "border-border bg-surface-2 text-fg"
                  )}
                >
                  {formatValue(it.value)}
                </div>
                <div className="w-12">{isTop && <PointerTag label="top" tone="warning" dir="up" />}</div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* base plate */}
        <div className="flex items-center gap-2 mt-1">
          <div className="w-44 h-2 rounded-b-lg border-x border-b border-border-strong bg-fg/[0.03]" />
          <div className="w-12" />
        </div>
        <span className="text-3xs text-fg-faint flex items-center gap-1">
          <Icon name="chevron-down" size={11} className="rotate-180" /> push / pop happen on top
        </span>
      </div>
    </PremadeShell>
  );
}
