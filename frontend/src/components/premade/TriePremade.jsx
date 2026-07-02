// Premade: Trie (prefix tree). Insert / search words; the path of characters is
// highlighted as it's walked, and word-ending nodes are marked.

import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { Field, OpButton, StatusBar, Legend } from "./shared/controls";

function layoutTrie(root) {
  const nodes = [], edges = [];
  let leaf = 0;
  function walk(n, depth, parentId) {
    const kids = Object.values(n.children);
    let x;
    if (!kids.length) x = leaf++;
    else { const xs = kids.map((k) => walk(k, depth + 1, n.id)); x = (xs[0] + xs[xs.length - 1]) / 2; }
    nodes.push({ id: n.id, ch: n.ch, end: n.end, depth, x });
    if (parentId != null) edges.push([parentId, n.id]);
    return x;
  }
  walk(root, 0, null);
  return { nodes, edges };
}

export default function TriePremade() {
  const idRef = useRef(1);
  const mkRoot = () => ({ id: idRef.current++, ch: "•", children: {}, end: false });
  const [trie, setTrie] = useState(() => {
    const r = mkRoot();
    ["cat", "car", "cab", "dog", "do"].forEach((w) => { let c = r; for (const ch of w) { if (!c.children[ch]) c.children[ch] = { id: idRef.current++, ch, children: {}, end: false }; c = c.children[ch]; } c.end = true; });
    return r;
  });
  const [wordIn, setWordIn] = useState("");
  const [active, setActive] = useState([]);
  const [foundId, setFoundId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ text: "A trie stores words by shared prefixes — each edge is one character.", tone: "neutral" });
  const reduce = useReducedMotion();
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const say = (text, tone = "neutral") => setStatus({ text, tone });

  async function insert() {
    const w = wordIn.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!w || busy) return say("Enter a word (letters only).", "danger");
    setBusy(true); setFoundId(null); say(`Insert "${w}" — walk/create one node per character.`, "brand");
    const root = structuredClone(trie); let cur = root; const path = [root.id];
    for (const ch of w) {
      if (!cur.children[ch]) cur.children[ch] = { id: idRef.current++, ch, children: {}, end: false };
      cur = cur.children[ch]; path.push(cur.id);
      setTrie(structuredClone(root)); setActive([...path]); await sleep(320);
    }
    cur.end = true; setTrie(structuredClone(root)); setActive([...path]); await sleep(350);
    setActive([]); setBusy(false); setWordIn(""); say(`Inserted "${w}".`, "success");
  }

  async function search() {
    const w = wordIn.trim().toLowerCase().replace(/[^a-z]/g, "");
    if (!w || busy) return say("Enter a word to search.", "danger");
    setBusy(true); setFoundId(null); say(`Search "${w}"…`, "brand");
    let cur = trie; const path = [cur.id];
    for (const ch of w) {
      if (!cur.children[ch]) { setActive([...path]); await sleep(300); setActive([]); setBusy(false); return say(`"${w}" is not in the trie (no '${ch}' edge).`, "danger"); }
      cur = cur.children[ch]; path.push(cur.id); setActive([...path]); await sleep(360);
    }
    if (cur.end) { setFoundId(cur.id); say(`Found "${w}".`, "success"); } else say(`"${w}" is a prefix but not a stored word.`, "neutral");
    await sleep(300); setActive([]); setBusy(false);
  }

  function reset() {
    const r = mkRoot(); ["cat", "car", "cab", "dog", "do"].forEach((w) => { let c = r; for (const ch of w) { if (!c.children[ch]) c.children[ch] = { id: idRef.current++, ch, children: {}, end: false }; c = c.children[ch]; } c.end = true; });
    setTrie(r); setActive([]); setFoundId(null); say("Reset.", "neutral");
  }

  const { nodes, edges } = layoutTrie(trie);
  const pos = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const GAP_X = 44, GAP_Y = 56;
  const maxX = Math.max(...nodes.map((n) => n.x), 0);
  const maxD = Math.max(...nodes.map((n) => n.depth), 0);
  const X = (n) => n.x * GAP_X + 24, Y = (n) => n.depth * GAP_Y + 22;

  return (
    <PremadeShell
      title="Trie (Prefix Tree)"
      accent="bg-cat-hash"
      controls={
        <>
          <Field label="word" value={wordIn} onChange={setWordIn} onSubmit={insert} placeholder="cup" width="w-24" disabled={busy} />
          <OpButton icon="plus" onClick={insert} tone="brand" busy={busy}>Insert</OpButton>
          <OpButton icon="search" onClick={search} busy={busy}>Search</OpButton>
          <OpButton onClick={reset} disabled={busy}>Reset</OpButton>
        </>
      }
      legend={<Legend items={[{ label: "on path", color: "bg-warning" }, { label: "word end", color: "bg-cat-hash" }, { label: "found", color: "bg-cat-graph" }]} />}
      status={<StatusBar tone={status.tone}>{status.text}</StatusBar>}
      minH="min-h-56"
    >
      <div className="overflow-auto scrollbar-thin px-4 py-4">
        <svg width={Math.max((maxX + 1) * GAP_X + 40, 240)} height={(maxD + 1) * GAP_Y + 30} className="mx-auto">
          {edges.map(([a, b], i) => (
            <line key={i} x1={X(pos[a])} y1={Y(pos[a])} x2={X(pos[b])} y2={Y(pos[b])} className="stroke-border-strong" strokeWidth="1.5" />
          ))}
          {nodes.map((n) => {
            const act = active.includes(n.id);
            const found = n.id === foundId;
            return (
              <motion.g key={n.id} layout initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 380, damping: 26 }}>
                <circle cx={X(n)} cy={Y(n)} r="14" strokeWidth="2"
                  className={cx("transition-[fill,stroke] duration-200", found ? "fill-cat-graph/30 stroke-cat-graph" : act ? "fill-warning-soft stroke-warning" : n.end ? "fill-cat-hash/25 stroke-cat-hash" : "fill-surface-2 stroke-border-strong")} />
                <text x={X(n)} y={Y(n) + 4} textAnchor="middle" fontSize="12" className="font-mono fill-fg">{n.ch}</text>
              </motion.g>
            );
          })}
        </svg>
      </div>
    </PremadeShell>
  );
}
