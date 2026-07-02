// Premade: Rat in a Maze. DFS backtracking from the top-left to the bottom-right
// of a grid (1 = open, 0 = wall). Each move / dead-end / backtrack is a frame.

import { useState } from "react";
import { EmptyState, Icon, cx } from "../ui";
import PremadeShell from "./shared/PremadeShell";
import { useStepPlayer } from "./shared/useStepPlayer";
import { OpButton, StatusBar, Legend, StepTransport } from "./shared/controls";

const MAZE = [
  [1, 1, 1, 0, 1, 1],
  [0, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 1],
];

function solveMaze(maze) {
  const R = maze.length, C = maze[0].length;
  const frames = [];
  const path = [];
  const vis = Array.from({ length: R }, () => Array(C).fill(false));
  const snap = (cur, status, note) => frames.push({ path: path.map((p) => [...p]), cur, status, note });
  snap(null, "start", "Find a path from the top-left to the bottom-right; backtrack at dead ends.");
  let done = false;
  const dirs = [[1, 0], [0, 1], [-1, 0], [0, -1]];
  function dfs(r, c) {
    if (r < 0 || c < 0 || r >= R || c >= C || maze[r][c] === 0 || vis[r][c]) return false;
    vis[r][c] = true; path.push([r, c]);
    snap([r, c], "move", `Step onto (${r}, ${c}).`);
    if (r === R - 1 && c === C - 1) { done = true; snap([r, c], "done", "Reached the exit!"); return true; }
    for (const [dr, dc] of dirs) if (dfs(r + dr, c + dc)) return true;
    path.pop();
    snap([r, c], "back", `Dead end → backtrack from (${r}, ${c}).`);
    return false;
  }
  dfs(0, 0);
  if (!done) snap(null, "done", "No path to the exit.");
  return frames;
}

export default function RatMazePremade() {
  const [frames, setFrames] = useState(null);
  const player = useStepPlayer(frames || []);
  const frame = frames ? player.frame : null;
  const R = MAZE.length, C = MAZE[0].length, cell = 40;

  const onPath = (r, c) => frame?.path?.some(([a, b]) => a === r && b === c);

  return (
    <PremadeShell
      title="Rat in a Maze"
      accent="bg-cat-hash"
      headerRight={<OpButton icon="zap" tone="brand" onClick={() => setFrames(solveMaze(MAZE))}>{frames ? "Re-solve" : "Solve"}</OpButton>}
      legend={<Legend items={[{ label: "current", color: "bg-warning" }, { label: "on path", color: "bg-cat-graph" }, { label: "wall", color: "bg-fg/40" }, { label: "exit", color: "bg-brand" }]} />}
      status={<StatusBar tone={frame?.status === "done" && frame?.path?.length ? "success" : frame?.status === "back" ? "danger" : "neutral"}>{frame ? frame.note : "Depth-first backtracking through an open-cell maze."}</StatusBar>}
      footer={frames ? <StepTransport player={player} /> : null}
      empty={!frames}
      emptyState={<EmptyState icon={<Icon name="target" size={22} />} title="Rat in a Maze" hint="Move through open cells (down / right / up / left). When a path dead-ends, backtrack and try another direction." action={<OpButton icon="zap" tone="brand" onClick={() => setFrames(solveMaze(MAZE))}>Solve</OpButton>} />}
      minH="min-h-72"
    >
      <div className="grid place-items-center py-6">
        <div className="rounded-lg overflow-hidden border border-border-strong">
          {MAZE.map((row, r) => (
            <div key={r} className="flex">
              {row.map((v, c) => {
                const wall = v === 0;
                const cur = frame?.cur && frame.cur[0] === r && frame.cur[1] === c;
                const path = onPath(r, c);
                const start = r === 0 && c === 0;
                const exit = r === R - 1 && c === C - 1;
                return (
                  <div key={c} className={cx("grid place-items-center border border-border/50",
                    wall ? "bg-fg/40" : cur ? "bg-warning/40" : path ? "bg-cat-graph/30" : exit ? "bg-brand/25" : start ? "bg-brand/10" : "bg-surface-2")}
                    style={{ width: cell, height: cell }}>
                    {start && <span className="text-2xs font-bold text-brand">S</span>}
                    {exit && !path && <span className="text-2xs font-bold text-brand">E</span>}
                    {cur && <span className="h-2.5 w-2.5 rounded-full bg-warning" />}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </PremadeShell>
  );
}
