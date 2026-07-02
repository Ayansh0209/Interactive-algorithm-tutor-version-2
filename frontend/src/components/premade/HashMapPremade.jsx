// Premade: hash map / set with separate chaining. hash(key) = key mod B picks a
// bucket; collisions chain in a list. put / get (animated scan) / remove.

import { useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Stat, Legend } from "./shared/controls";

const B = 7;
const hashOf = (key) => {
  const s = String(key);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % B;
};

export default function HashMapPremade() {
  const idRef = useRef(1);
  const [buckets, setBuckets] = useState(() => {
    const b = Array.from({ length: B }, () => []);
    [12, 5, 19, 33].forEach((k) => b[hashOf(k)].push({ id: idRef.current++, key: k }));
    return b;
  });
  const [keyIn, setKeyIn] = useState("");
  const [status, setStatus] = useState({ text: `${B} buckets. Collisions (same key mod ${B}) chain together.`, tone: "neutral" });
  const [activeBucket, setActiveBucket] = useState(-1);
  const [scanId, setScanId] = useState(null);
  const [busy, setBusy] = useState(false);
  const reduce = useReducedMotion();

  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const say = (text, tone = "neutral") => setStatus({ text, tone });
  const size = buckets.reduce((a, b) => a + b.length, 0);

  function put() {
    const key = keyIn.trim(); if (!key) return say("Enter a key.", "danger");
    const h = hashOf(key); setActiveBucket(h);
    if (buckets[h].some((e) => String(e.key) === key)) { say(`${key} already present in bucket ${h}.`, "neutral"); return; }
    setBuckets((bs) => bs.map((b, i) => (i === h ? [...b, { id: idRef.current++, key }] : b)));
    say(`put(${key}) → hash ${h}. ${buckets[h].length ? "Collision → chained." : "Empty bucket."}`, "success"); setKeyIn("");
  }
  async function get() {
    const key = keyIn.trim(); if (!key) return say("Enter a key.", "danger");
    const h = hashOf(key); setActiveBucket(h); setBusy(true);
    say(`get(${key}) → bucket ${h}. Scan the chain…`, "brand");
    for (const e of buckets[h]) {
      setScanId(e.id); await sleep(500);
      if (String(e.key) === key) { say(`Found ${key} in bucket ${h}.`, "success"); setScanId(null); setBusy(false); return; }
    }
    setScanId(null); setBusy(false); say(`${key} not found in bucket ${h}.`, "danger");
  }
  function remove() {
    const key = keyIn.trim(); if (!key) return say("Enter a key.", "danger");
    const h = hashOf(key); setActiveBucket(h);
    if (!buckets[h].some((e) => String(e.key) === key)) return say(`${key} not in bucket ${h}.`, "danger");
    setBuckets((bs) => bs.map((b, i) => (i === h ? b.filter((e) => String(e.key) !== key) : b)));
    say(`remove(${key}) from bucket ${h}.`, "brand"); setKeyIn("");
  }

  return (
    <PremadeShell
      title="Hash Map (chaining)"
      accent="bg-cat-hash"
      headerRight={<Stat label="entries" value={size} />}
      controls={
        <>
          <Field label="key" value={keyIn} onChange={setKeyIn} onSubmit={put} placeholder="42" width="w-16" disabled={busy} />
          <OpButton icon="plus" onClick={put} tone="brand" disabled={busy}>Put</OpButton>
          <OpButton icon="search" onClick={get} busy={busy}>Get</OpButton>
          <OpButton icon="trash" onClick={remove} tone="danger" disabled={busy}>Remove</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "active bucket", color: "bg-cat-hash/30 border border-cat-hash" }, { label: "scanning", color: "bg-warning" }, { label: "entry", color: "bg-surface-2 border border-border" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      minH="min-h-56"
    >
      <div className="px-4 py-3 space-y-1">
        {buckets.map((chain, i) => (
          <div key={i} className={cx("flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors", activeBucket === i ? "bg-cat-hash/10" : "")}>
            <span className={cx("w-7 h-7 grid place-items-center rounded-md font-mono text-2xs shrink-0", activeBucket === i ? "bg-cat-hash/20 text-fg border border-cat-hash/40" : "bg-fg/[0.04] text-fg-faint")}>{i}</span>
            <Icon name="chevron-right" size={12} className="text-fg-faint shrink-0" />
            <div className="flex items-center gap-1 flex-wrap">
              <AnimatePresence initial={false}>
                {chain.map((e) => (
                  <motion.span key={e.id} layout initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={T.spring}
                    className={cx("px-2 h-7 grid place-items-center rounded-md border font-mono text-2xs",
                      scanId === e.id ? "border-warning bg-warning-soft text-fg" : "border-border bg-surface-2 text-fg")}>
                    {String(e.key)}
                  </motion.span>
                ))}
              </AnimatePresence>
              {!chain.length && <span className="text-3xs text-fg-faint italic">empty</span>}
            </div>
          </div>
        ))}
      </div>
    </PremadeShell>
  );
}
