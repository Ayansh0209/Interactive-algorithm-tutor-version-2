# Paste-into-Claude-Code Prompt: Redesign UI + Complete DSA Docs/Visualizers

You are working in an existing repo at `C:\All code\tutor`. Read `HANDOFF.md` and
`DSA_Visualizer_Architecture_Spec.md` FIRST -- they define the system. Then do the
two jobs below. **Use my installed `ui-ux-pro` skill** to design the visual system
before writing components.

---

## What the project is (one paragraph)
DSAviz executes a user's REAL code (Python via sys.settrace, Java via JDI) and
renders the live execution: arrays, linked lists, trees, recursion trees, DP
grids, graphs. A Node gateway (`backend/Api`, :5000) proxies to warm workers
(Python :8000, Java :8001); both emit ONE normalized "Trace envelope" so the
frontend is language-agnostic. Frontend is React + Vite + Tailwind v4 +
framer-motion in `frontend/src`. Do NOT break the Trace envelope contract (see
HANDOFF.md section 2) or the worker code. The engine is the source of truth.

Run: `start-all.bat` (Python+Java workers, gateway, Vite). Verify the build with
`npm run build` in `frontend` before claiming done.

---

## JOB 1 -- Make the UI genuinely beautiful (use the ui-ux-pro skill)

The current UI is cramped and plain. Design a cohesive system, then apply it.

Requirements:
- **Design tokens first**: a real color system (dark + light), type scale,
  spacing, radius, shadows, motion timings. Centralize in Tailwind config /
  CSS variables. No ad-hoc hex values scattered in components.
- **Redesign these screens**: Home (hero, topic grid), Docs (sidebar + article +
  embedded visualizer), and the main Visualizer (`pages/VisualizerPage.jsx`).
  The Visualizer's middle "Visualization" panel is the hero -- give it room,
  clear structure, and polish; the current 3-column layout feels cramped.
- **Polish the renderers** in `frontend/src/components/visualizers/*`: arrays
  with smooth cell highlight + pointer chips, linked-list nodes with crisp
  arrows, recursion tree with clean nodes, DP grid with cell-fill animation and
  dependency arrows, graph with a good force/layered layout.
- **Motion** with framer-motion: page transitions, list reordering, value
  changes, step transitions. Tasteful, fast (150-250ms), not gimmicky.
- **Responsive + accessible**: keyboard nav for the timeline, focus states,
  ARIA, prefers-reduced-motion, good contrast.
- Keep components **small, reusable, and organized**. Reusable primitives stay
  in `components/ui/`. One renderer per file. No mega-components.

Deliverable: a clearly better, consistent, animated UI across all three screens.

---

## JOB 2 -- Complete DSA coverage (docs + premade visualizers)

There are TWO complementary things. Build BOTH.

### 2A. Docs articles (data-driven, runnable demos)
The docs system already exists and is data-driven: add topics in
`frontend/src/lib/docsContent.js` (each topic has sections + a `demo` that runs
through the real engine; set `demo.language: "java"` for Java demos). The
sidebar, routes, and article page update automatically. Write real, beginner-
friendly content + a runnable demo for EVERY topic in the catalog below.

### 2B. Premade interactive visualizers (VisuAlgo-style, client-side)
For the classic structures/algorithms, also build **dedicated interactive
visualizers with operation controls** (buttons like Insert front / Insert back /
Delete / Search / Push / Pop / Enqueue / Dequeue / Run Dijkstra). These are
SELF-CONTAINED React components with their own state and animations (framer-
motion) -- they do NOT need the backend, because they are "premade." Put them in
`frontend/src/components/premade/` (one folder/file per structure, reusable
sub-parts shared). Each premade visualizer gets embedded into its docs article
(add an optional `premade: "<componentId>"` field to the topic and render it).
Build a small registry `premade/registry.jsx` mapping id -> component so adding
one is a single entry.

Each premade visualizer must have: clear controls, input field where relevant,
animated state changes, a step/speed control where it helps, and an empty state.

### The full catalog (build docs for all; premade for the starred *)
**Arrays & strings:** traversal*, insert/delete*, linear search*, binary search*,
two pointers, sliding window, prefix sum, Kadane's.
**Linked lists:** singly* (insert front/back/at index, delete, search, reverse),
doubly* (same ops), circular*; fast/slow pointers (cycle detection).
**Stack:** push/pop/peek* (array + linked impl); valid parentheses; min-stack.
**Queue:** enqueue/dequeue* ; circular queue* ; deque* ; priority queue / heap*.
**Hashing:** hash map / set with collisions (chaining)*.
**Recursion:** factorial, fibonacci (naive + memo), Tower of Hanoi*.
**Backtracking:** N-Queens*, subsets, permutations, combination sum, rat-in-maze*,
sudoku solver.
**Trees:** binary tree + traversals (in/pre/post/level)*, BST insert/delete/search*,
AVL with rotations*, Red-Black (insert)*, heap / heapify*, trie (insert/search)*,
segment tree.
**Graphs:** representations (adjacency list/matrix)*, BFS*, DFS*, Dijkstra*,
Bellman-Ford, Floyd-Warshall, Prim's MST*, Kruskal's MST*, topological sort*,
Union-Find (DSU)*, cycle detection, Hamiltonian path*, connected components.
**Sorting:** bubble*, selection*, insertion*, merge*, quick*, heap*, counting, radix.
**Searching:** linear*, binary*.
**Dynamic programming:** 0/1 knapsack*, LCS*, LIS, edit distance, coin change*,
unique paths (grid)*, subset sum, matrix-chain.
**Greedy:** activity selection*, fractional knapsack*, Huffman coding*, job
sequencing.
**Bit manipulation:** basics + tricks.

Organize the sidebar by these categories (extend `CATEGORIES` in docsContent.js).

---

## Constraints & acceptance
- Do not change the Trace envelope, the workers, or the detector logic. The
  "run any code" visualizer must keep working exactly as now.
- Premade visualizers are client-side only; the engine-powered "run my code"
  path stays separate (it already exists and is the product's moat).
- Everything must build (`npm run build`) and bundle clean.
- Components reusable and well-organized; no duplicated UI primitives.
- Every catalog topic has a docs article; every starred (*) item has a premade
  interactive visualizer wired into its article and reachable from the sidebar.
- Keep it fast: lazy-load heavy premade components; virtualize long step lists.

Work in vertical slices: ship a beautiful design system + 3 fully-polished
premade visualizers (singly linked list, stack, BFS) end-to-end FIRST as the
template, then fan out to the rest using that pattern. Show me the design-system
file and the 3 templates before mass-producing.
