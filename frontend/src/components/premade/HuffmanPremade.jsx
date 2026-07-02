// Premade: Huffman coding (greedy). Repeatedly merge the two lowest-frequency
// nodes into a parent until one tree remains; left=0, right=1 give the codes.

import { useState } from "react";
import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

const FREQS = { a: 5, b: 9, c: 12, d: 13, e: 16, f: 45 };

function frames() {
  let nid = 1;
  let pool = Object.entries(FREQS).map(([ch, f]) => ({ id: nid++, label: ch, freq: f, leaf: true }));
  const fr = [{ pool: pool.map((n) => ({ ...n })), merge: null, note: "Each symbol starts as a node weighted by its frequency. Repeatedly merge the two smallest." }];
  while (pool.length > 1) {
    pool = [...pool].sort((a, b) => a.freq - b.freq);
    const [x, y] = pool;
    fr.push({ pool: pool.map((n) => ({ ...n })), merge: [x.id, y.id], note: `Merge the two smallest: ${x.label}(${x.freq}) + ${y.label}(${y.freq}).` });
    const parent = { id: nid++, label: `${x.freq + y.freq}`, freq: x.freq + y.freq, left: x, right: y };
    pool = [parent, ...pool.slice(2)];
  }
  const codes = {};
  (function walk(n, code) { if (!n.left && !n.right) { codes[n.label] = code || "0"; return; } walk(n.left, code + "0"); walk(n.right, code + "1"); })(pool[0], "");
  fr.push({ pool: pool.map((n) => ({ ...n })), merge: null, done: true, codes, note: `Done. Frequent symbols get short codes — that's the compression.` });
  return fr;
}

export default function HuffmanPremade() {
  const [run, setRun] = useState(null);
  const player = useStepPlayer(run || []);
  const frame = run ? player.frame : null;

  return (
    <PremadeShell
      title="Huffman Coding"
      accent="bg-cat-hash"
      headerRight={<OpButton icon="zap" tone="brand" onClick={() => setRun(frames())}>{run ? "Re-run" : "Run"}</OpButton>}
      legend={<Legend items={[{ label: "merging", color: "bg-warning" }, { label: "internal node", color: "bg-cat-hash/30 border border-cat-hash" }, { label: "leaf symbol", color: "bg-surface-2 border border-border" }]} />}
      status={<StatusBar tone={frame?.done ? "success" : "neutral"}>{frame ? frame.note : "Build an optimal prefix code by always merging the two least-frequent nodes."}</StatusBar>}
      footer={run ? <StepTransport player={player} /> : null}
      empty={!run}
      minH="min-h-56"
    >
      <div className="px-5 py-6">
        <div className="flex flex-wrap items-end gap-2 justify-center min-h-24">
          {frame && [...frame.pool].sort((a, b) => a.freq - b.freq).map((n) => {
            const merging = frame.merge?.includes(n.id);
            return (
              <motion.div key={n.id} layout transition={T.spring} className="flex flex-col items-center gap-1">
                <div className={cx("min-w-12 h-12 px-3 grid place-items-center rounded-xl border font-mono text-sm transition-colors duration-200",
                  merging ? "border-warning bg-warning-soft text-fg ring-2 ring-warning/30" : n.leaf ? "border-border bg-surface-2 text-fg" : "border-cat-hash/40 bg-cat-hash/15 text-fg")}>
                  {n.label}
                </div>
                <span className="text-3xs font-mono text-fg-faint">f{n.freq}</span>
              </motion.div>
            );
          })}
        </div>

        {frame?.codes && (
          <div className="mt-5 flex flex-wrap items-center gap-2 justify-center">
            {Object.entries(frame.codes).map(([ch, code]) => (
              <span key={ch} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-2 px-2 h-7 font-mono text-2xs">
                <b className="text-fg">{ch}</b><span className="text-fg-faint">→</span><span className="text-cat-hash">{code}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </PremadeShell>
  );
}
