// Preset graphs + frame generators for graph-algorithm premades. Each generator
// returns { graph, frames }. A frame is a snapshot:
//   { visited:[ids], current:id|null, dist:{id:n}, treeEdges:[[u,v]],
//     activeEdge:[u,v]|null, side:{label, items:[...], head?}, note, done }
// GraphCanvas renders any of these the same way.

// 360 x 220 layouts.
const W_NODES = [
  { id: 0, x: 46, y: 110 }, { id: 1, x: 122, y: 46 }, { id: 2, x: 122, y: 174 },
  { id: 3, x: 214, y: 40 }, { id: 4, x: 208, y: 112 }, { id: 5, x: 214, y: 182 },
  { id: 6, x: 308, y: 110 },
];
// undirected weighted graph
export const WGRAPH = {
  nodes: W_NODES,
  weighted: true,
  edges: [[0, 1, 4], [0, 2, 3], [1, 3, 5], [1, 4, 2], [2, 4, 6], [2, 5, 7], [3, 6, 3], [4, 6, 4], [5, 6, 5]],
};
// directed acyclic graph for topological sort
export const DAG = {
  nodes: [
    { id: 0, x: 50, y: 50 }, { id: 1, x: 50, y: 160 }, { id: 2, x: 160, y: 50 },
    { id: 3, x: 160, y: 160 }, { id: 4, x: 270, y: 95 }, { id: 5, x: 310, y: 175 },
  ],
  directed: true,
  edges: [[0, 2], [0, 3], [1, 3], [2, 4], [3, 4], [3, 5], [4, 5]],
};

function adjOf(graph) {
  const adj = {};
  graph.nodes.forEach((n) => (adj[n.id] = []));
  graph.edges.forEach(([u, v, w]) => {
    adj[u].push({ to: v, w: w ?? 1 });
    if (!graph.directed) adj[v].push({ to: u, w: w ?? 1 });
  });
  Object.values(adj).forEach((l) => l.sort((a, b) => a.to - b.to));
  return adj;
}

// ---- DFS -------------------------------------------------------------------
function dfs(start = 0) {
  const graph = WGRAPH;
  const adj = adjOf(graph);
  const visited = [];
  const stack = [start];
  const seen = new Set([start]);
  const treeEdges = [];
  const frames = [{ visited: [], current: null, stack: [start], treeEdges: [], side: { label: "stack", items: [start], head: true }, note: `Start DFS at ${start}. Push it on the stack.` }];
  while (stack.length) {
    const u = stack.pop();
    visited.push(u);
    const pushed = [];
    for (const { to } of adj[u]) {
      if (!seen.has(to)) { seen.add(to); stack.push(to); treeEdges.push([u, to]); pushed.push(to); }
    }
    frames.push({
      visited: [...visited], current: u, stack: [...stack], treeEdges: treeEdges.map((e) => [...e]),
      side: { label: "stack", items: [...stack], head: true },
      note: pushed.length ? `Visit ${u}. Push unvisited neighbours ${pushed.join(", ")}.` : `Visit ${u}. Nothing new to push.`,
    });
  }
  frames.push({ visited: [...visited], current: null, stack: [], treeEdges, side: { label: "stack", items: [] }, done: true, note: `DFS order: ${visited.join(" → ")}.` });
  return { graph, frames };
}

// ---- Dijkstra --------------------------------------------------------------
function dijkstra(start = 0) {
  const graph = WGRAPH;
  const adj = adjOf(graph);
  const dist = {}; graph.nodes.forEach((n) => (dist[n.id] = Infinity));
  dist[start] = 0;
  const done = new Set();
  const treeEdges = [];
  const visited = [];
  const frames = [{ visited: [], current: null, dist: { ...dist }, treeEdges: [], side: pq(dist, done), note: `Start at ${start} (dist 0). Greedily settle the closest unsettled node.` }];
  for (let it = 0; it < graph.nodes.length; it++) {
    let u = -1, best = Infinity;
    for (const n of graph.nodes) if (!done.has(n.id) && dist[n.id] < best) { best = dist[n.id]; u = n.id; }
    if (u === -1) break;
    done.add(u); visited.push(u);
    const relaxed = [];
    for (const { to, w } of adj[u]) {
      if (dist[u] + w < dist[to]) { dist[to] = dist[u] + w; relaxed.push(`${to}=${dist[to]}`); treeEdges.push([u, to]); }
    }
    frames.push({
      visited: [...visited], current: u, dist: { ...dist }, treeEdges: treeEdges.map((e) => [...e]),
      side: pq(dist, done),
      note: relaxed.length ? `Settle ${u} (dist ${dist[u]}). Relax → ${relaxed.join(", ")}.` : `Settle ${u} (dist ${dist[u]}). No shorter paths found.`,
    });
  }
  frames.push({ visited, current: null, dist: { ...dist }, treeEdges, done: true, note: `Shortest distances from ${start} computed.` });
  return { graph, frames };
}
function pq(dist, done) {
  const items = Object.entries(dist).filter(([k]) => !done.has(Number(k)) && dist[k] < Infinity)
    .sort((a, b) => a[1] - b[1]).map(([k, v]) => `${k}:${v}`);
  return { label: "frontier", items };
}

// ---- Prim's MST ------------------------------------------------------------
function prim(start = 0) {
  const graph = WGRAPH;
  const adj = adjOf(graph);
  const inTree = new Set([start]);
  const treeEdges = [];
  const visited = [start];
  let total = 0;
  const frames = [{ visited: [start], current: start, treeEdges: [], note: `Grow a tree from ${start}, always adding the cheapest edge to a new node.` }];
  while (inTree.size < graph.nodes.length) {
    let best = null;
    for (const u of inTree) for (const { to, w } of adj[u]) if (!inTree.has(to) && (!best || w < best.w)) best = { u, to, w };
    if (!best) break;
    inTree.add(best.to); treeEdges.push([best.u, best.to]); total += best.w; visited.push(best.to);
    frames.push({ visited: [...visited], current: best.to, treeEdges: treeEdges.map((e) => [...e]), activeEdge: [best.u, best.to], note: `Add cheapest crossing edge ${best.u}–${best.to} (w ${best.w}). MST weight ${total}.` });
  }
  frames.push({ visited, current: null, treeEdges, done: true, note: `Minimum spanning tree complete, total weight ${total}.` });
  return { graph, frames };
}

// ---- Kruskal's MST ---------------------------------------------------------
function kruskal() {
  const graph = WGRAPH;
  const parent = {}; graph.nodes.forEach((n) => (parent[n.id] = n.id));
  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  const edges = [...graph.edges].sort((a, b) => a[2] - b[2]);
  const treeEdges = [];
  let total = 0;
  const frames = [{ visited: [], current: null, treeEdges: [], note: `Sort edges by weight, add each one unless it forms a cycle (union-find).` }];
  for (const [u, v, w] of edges) {
    const ru = find(u), rv = find(v);
    const cycle = ru === rv;
    if (!cycle) { parent[ru] = rv; treeEdges.push([u, v]); total += w; }
    frames.push({
      visited: graph.nodes.filter((n) => treeEdges.some((e) => e.includes(n.id))).map((n) => n.id),
      current: null, treeEdges: treeEdges.map((e) => [...e]), activeEdge: [u, v],
      note: cycle ? `Edge ${u}–${v} (w ${w}) would form a cycle → skip.` : `Add edge ${u}–${v} (w ${w}). MST weight ${total}.`,
    });
  }
  frames.push({ visited: graph.nodes.map((n) => n.id), current: null, treeEdges, done: true, note: `Minimum spanning tree complete, total weight ${total}.` });
  return { graph, frames };
}

// ---- Topological sort (Kahn) ----------------------------------------------
function topo() {
  const graph = DAG;
  const adj = adjOf(graph);
  const indeg = {}; graph.nodes.forEach((n) => (indeg[n.id] = 0));
  graph.edges.forEach(([, v]) => (indeg[v]++));
  let queue = graph.nodes.filter((n) => indeg[n.id] === 0).map((n) => n.id);
  const order = [];
  const frames = [{ visited: [], current: null, side: { label: "ready", items: [...queue] }, note: `Start with nodes that have no incoming edges: ${queue.join(", ")}.` }];
  while (queue.length) {
    const u = queue.shift();
    order.push(u);
    const freed = [];
    for (const { to } of adj[u]) { indeg[to]--; if (indeg[to] === 0) { queue.push(to); freed.push(to); } }
    frames.push({ visited: [...order], current: u, side: { label: "ready", items: [...queue] }, note: freed.length ? `Output ${u}. Now ready: ${freed.join(", ")}.` : `Output ${u}.` });
  }
  frames.push({ visited: order, current: null, done: true, note: `Topological order: ${order.join(" → ")}.` });
  return { graph, frames };
}

// ---- Hamiltonian path (backtracking) ---------------------------------------
function hamiltonian() {
  const graph = { nodes: WGRAPH.nodes, edges: WGRAPH.edges.map(([u, v]) => [u, v]) };
  const adj = adjOf(graph);
  const n = graph.nodes.length;
  const frames = [{ visited: [], current: null, treeEdges: [], note: `Try to visit every node exactly once. Backtrack on dead ends.` }];
  const path = [];
  const used = new Set();
  let found = false;
  function bt(u) {
    path.push(u); used.add(u);
    const edges = path.slice(1).map((_, i) => [path[i], path[i + 1]]);
    frames.push({ visited: [...path], current: u, treeEdges: edges, note: `Path so far: ${path.join(" → ")}.` });
    if (path.length === n) { found = true; return true; }
    for (const { to } of adj[u]) {
      if (!used.has(to)) { if (bt(to)) return true; }
    }
    used.delete(u); path.pop();
    frames.push({ visited: [...path], current: path[path.length - 1] ?? null, treeEdges: path.slice(1).map((_, i) => [path[i], path[i + 1]]), note: `Dead end at ${u} → backtrack.` });
    return false;
  }
  for (const node of graph.nodes) { if (bt(node.id)) break; }
  const last = frames[frames.length - 1];
  frames.push({ visited: last.visited, current: null, treeEdges: last.treeEdges, done: true, note: found ? `Hamiltonian path found: ${last.visited.join(" → ")}.` : `No Hamiltonian path from the tried starts.` });
  return { graph, frames };
}

export const GRAPH_ALGOS = { dfs, dijkstra, prim, kruskal, topo, hamiltonian };

export const GRAPH_ALGO_META = {
  dfs: { label: "Depth-First Search", accent: "bg-cat-graph", needsStart: true, blurb: "DFS dives as deep as possible along each branch before backtracking, using a stack." },
  dijkstra: { label: "Dijkstra's Shortest Path", accent: "bg-cat-dp", needsStart: true, blurb: "Greedily settles the closest unsettled node, relaxing edges to find shortest paths in a weighted graph." },
  prim: { label: "Prim's MST", accent: "bg-cat-tree", needsStart: true, blurb: "Grows a minimum spanning tree from a start node, always adding the cheapest edge to a new node." },
  kruskal: { label: "Kruskal's MST", accent: "bg-cat-tree", needsStart: false, blurb: "Adds edges in increasing weight order, skipping any that would form a cycle (detected with union-find)." },
  topo: { label: "Topological Sort", accent: "bg-cat-queue", needsStart: false, blurb: "Orders a DAG so every edge points forward, repeatedly removing nodes with no remaining prerequisites." },
  hamiltonian: { label: "Hamiltonian Path", accent: "bg-cat-hash", needsStart: false, blurb: "Searches (with backtracking) for a path that visits every vertex exactly once." },
};
