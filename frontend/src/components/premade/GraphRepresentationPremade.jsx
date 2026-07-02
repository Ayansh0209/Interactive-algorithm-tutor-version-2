// Premade: graph representations. One undirected graph shown three ways at once
// -- drawing, adjacency list, adjacency matrix -- kept in sync. Click a matrix
// cell to toggle an edge; click/hover a node to highlight it everywhere.

import { useState } from "react";
import { cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { StatusBar, Legend, OpButton } from "./shared/controls";

const N = 5;
const POS = [
  { x: 100, y: 24 }, { x: 176, y: 80 }, { x: 146, y: 168 }, { x: 54, y: 168 }, { x: 24, y: 80 },
];
const initialMatrix = () => {
  const m = Array.from({ length: N }, () => Array(N).fill(0));
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2]].forEach(([a, b]) => { m[a][b] = 1; m[b][a] = 1; });
  return m;
};

export default function GraphRepresentationPremade() {
  const [m, setM] = useState(initialMatrix);
  const [sel, setSel] = useState(null);

  const toggle = (i, j) => { if (i === j) return; setM((mm) => mm.map((row, r) => row.map((v, c) => ((r === i && c === j) || (r === j && c === i) ? (v ? 0 : 1) : v)))); };
  const neighbors = (i) => m[i].map((v, j) => (v ? j : -1)).filter((j) => j >= 0);
  const hl = (i) => sel != null && (sel === i || m[sel][i]);

  return (
    <PremadeShell
      title="Graph Representations"
      accent="bg-cat-graph"
      headerRight={<OpButton onClick={() => { setM(initialMatrix()); setSel(null); }}>Reset</OpButton>}
      legend={<Legend items={[{ label: "selected + neighbours", color: "bg-cat-graph" }, { label: "edge", color: "bg-cat-graph/40 border border-cat-graph" }]} />}
      status={<StatusBar tone="neutral">{sel != null ? `Node ${sel} → neighbours [${neighbors(sel).join(", ") || "none"}]. Click a matrix cell to toggle an edge.` : "Click a node to highlight it, or a matrix cell to add/remove an edge."}</StatusBar>}
      minH="min-h-72"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 px-4 py-4">
        {/* drawing */}
        <div>
          <Caption>drawing</Caption>
          <svg viewBox="0 0 200 200" className="w-full h-44">
            {m.map((row, i) => row.map((v, j) => (v && j > i ? (
              <line key={`${i}-${j}`} x1={POS[i].x} y1={POS[i].y} x2={POS[j].x} y2={POS[j].y}
                className={cx(sel != null && (sel === i || sel === j) ? "stroke-cat-graph" : "stroke-border-strong")} strokeWidth="1.75" />
            ) : null)))}
            {POS.map((p, i) => (
              <g key={i} onClick={() => setSel(sel === i ? null : i)} className="cursor-pointer">
                <circle cx={p.x} cy={p.y} r="15" strokeWidth="2" className={cx("transition-[fill,stroke]", hl(i) ? "fill-cat-graph/35 stroke-cat-graph" : "fill-surface-2 stroke-border-strong")} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize="12" className="font-mono fill-fg select-none">{i}</text>
              </g>
            ))}
          </svg>
        </div>

        {/* adjacency list */}
        <div>
          <Caption>adjacency list</Caption>
          <div className="space-y-1 font-mono text-2xs">
            {m.map((_, i) => (
              <div key={i} onClick={() => setSel(sel === i ? null : i)} className={cx("flex items-center gap-2 rounded-md px-2 py-1 cursor-pointer", sel === i ? "bg-cat-graph/10" : "hover:bg-fg/[0.04]")}>
                <span className={cx("w-5 h-5 grid place-items-center rounded", sel === i ? "bg-cat-graph/25 text-fg" : "bg-fg/[0.05] text-fg-muted")}>{i}</span>
                <span className="text-fg-faint">→</span>
                <span className="text-fg">[{neighbors(i).join(", ")}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* adjacency matrix */}
        <div>
          <Caption>adjacency matrix</Caption>
          <div className="inline-grid font-mono text-3xs" style={{ gridTemplateColumns: `1.25rem repeat(${N}, 1.6rem)` }}>
            <span />
            {Array.from({ length: N }).map((_, j) => <span key={j} className="grid place-items-center h-5 text-fg-faint">{j}</span>)}
            {m.map((row, i) => (
              <Fragmentish key={i} i={i} row={row} sel={sel} toggle={toggle} />
            ))}
          </div>
        </div>
      </div>
    </PremadeShell>
  );
}

function Fragmentish({ i, row, sel, toggle }) {
  return (
    <>
      <span className="grid place-items-center w-5 text-fg-faint">{i}</span>
      {row.map((v, j) => (
        <button key={j} onClick={() => toggle(i, j)} disabled={i === j}
          className={cx("h-6 w-6 grid place-items-center border border-border/60 transition-colors",
            i === j ? "bg-fg/[0.04] text-fg-faint cursor-default"
              : v ? "bg-cat-graph/25 text-fg hover:bg-cat-graph/40"
              : "bg-surface-2 text-fg-faint hover:bg-fg/[0.06]",
            sel != null && (sel === i || sel === j) && v ? "ring-1 ring-cat-graph" : "")}>
          {i === j ? "·" : v}
        </button>
      ))}
    </>
  );
}

function Caption({ children }) {
  return <div className="text-3xs uppercase tracking-wider text-fg-faint mb-2">{children}</div>;
}
