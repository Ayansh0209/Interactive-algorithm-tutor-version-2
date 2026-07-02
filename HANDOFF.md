# DSAviz - Engineering Handoff / Master Prompt

> Hand this whole file to your build agents. It states the **goal**, what is
> **done**, what is **left**, the **architecture**, the **conventions**, and
> the **exact next tasks** with acceptance criteria. Read top to bottom.

---

## 1. The goal (north star)

A DSA visualizer that takes **any** real student code (Python and Java now, C++
later) and produces a correct, step-by-step visualization: arrays, linked lists,
trees, recursion trees, DP grids, stacks/queues, graphs. The visualization is
derived from **real execution** (instrumentation/tracing), never from an LLM
guessing. An **AI tutor** sits on top to explain the run and suggest better
approaches, grounded in the real trace.

Three hard principles (do not violate):
1. **Execute, never guess.** Visual state always comes from a real run.
2. **One general engine, many renderers.** Detect *patterns* (a `next` pointer
   chain = linked list; self-call = recursion tree; 2D array filled cell by cell
   = DP grid), not specific algorithms. New renderer = a whole class of problems.
3. **A step is a meaningful event, not a raw line.** Scale via semantic events +
   focus-a-function + caps, so N-Queens never means 1000 raw frames.

The wedge: *paste any hard DSA solution -> auto-detect the right view -> handle
big inputs -> AI shows where you went wrong.* No competitor does all four.

---

## 2. Architecture (current, working)

```
React (Vite, :5173)
   |  HTTP
Node gateway (:5000)  -- routes/python, routes/java, routes/ai, future routes/cpp
   |  localhost
   +-- Python worker (FastAPI/uvicorn :8000)  -> engine/ (sys.settrace)
   +-- Java worker   (JavaWorker.java  :8001)  -> JDI (compile via ToolProvider)
```

- **Node = public gateway** (AI, payments later, multi-language routing).
- **Workers are warm + internal.** Each language emits the SAME normalized
  **Trace envelope**, so the entire frontend works unchanged per language.
- Adding a language = a new worker that emits the envelope + one gateway route +
  one entry in the frontend language toggle.

### The Trace envelope (the contract - every language must emit this)
```jsonc
{
  "meta": {
    "language": "python|java",
    "analysis": { "primary": "two_pointer|dynamic_programming|...", "hints": [...] },
    "output": "stdout text",
    "error": null,            // or "TypeError: ..." with optional "error_line"
    "truncated": false,       // true if a step/time cap was hit
    "num_steps": 0
  },
  "steps": [{
    "i": 0, "event": "call|line|return", "line": 5, "function": "main",
    "code": "source text of this line",
    "locals": { "name": <scene> },          // see scene types below
    "var_types": { "name": "array|linked_list|binary_tree|stack|..." },
    "highlight_vars": ["name"],             // changed since prev step in this call
    "scope": "loop|conditional|function|null",
    "loop_meta": {...}, "branch_taken": true,
    "depth": 1, "call_id": 2, "parent_id": 1, // recursion tree
    "semantic": [{ "kind": "swap|write|compare|push|pop|recursion_enter|..." }],
    "call_stack": [{ "function": "...", "args": {...} }]
  }]
}
```
Scene types the renderers understand (the `var_types` tag drives the renderer):
`array`, `matrix`, `dp_grid`, `dp_array`, `linked_list`, `doubly_linked_list`,
`binary_tree`, `avl_tree`, `red_black_tree`, `segment_tree`, `nary_tree`,
`trie`, `stack`, `queue`, `deque`, `heap`, `set`, `dsu`,
`graph_adjacency_list`, `graph_weighted`, `primitive`, `object`.

---

## 3. What is DONE (and tested)

- **Python engine** (`backend/engine/`): refactored from the old 878-line
  `tracer.py` into modules: `runner.py` (sys.settrace core + caps),
  `serialize.py`, `detectors/{linear,structural,trees,graph}.py`, `scope.py`,
  `semantic.py`, `analyze.py`, `safety.py`. Emits the envelope.
- **Caps**: `max_steps` (5000) and `max_seconds` (8) ABORT execution (raise),
  so infinite loops / deep recursion can't hang. Verified.
- **stdin**: `input()` allowed (reads a controlled buffer); fed end to end.
- **Python warm worker** (`backend/worker/app.py`, FastAPI :8000).
- **Java engine + worker** (`backend/java-worker/JavaWorker.java`): compiles user
  code in memory via `ToolProvider` (no javac binary needed; Java 11 single-file
  mode runs the worker), traces via **JDI**, emits the SAME envelope. Handles
  arrays, ArrayList/LinkedList (read via internal fields), boxed Integer unbox,
  user linked lists (`next`), trees (`left`/`right`), recursion, Scanner+stdin.
- **Node gateway** (`backend/Api/`): `routes/python.js`, `routes/java.js`,
  `routes/ai.js` (+ `lib/explainFallback.js`). Proxies to warm workers.
- **AI layer**: explain / approaches / step modes. Works offline (rule-based
  fallback grounded in the trace). **Being migrated to Gemini** (see task 0).
- **Frontend** (`frontend/src/`): clean structure -- `components/ui/index.jsx`
  (reusable primitives), `components/visualizers/*` (one renderer per structure +
  `registry.jsx`), `pages/{HomePage,VisualizerPage}.jsx`, `hooks/usePlayback.js`,
  `lib/{api,examples}.js`. Language toggle (Python/Java), example dropdown,
  stdin box, timeline (play/scrub + "key steps only" + focus a function),
  AI panel, "Edit code" button.
- **Launchers**: `start-all.bat`, `start-all.ps1`; `README.md` updated.

### Detection: what is structure-based vs name-based (measured)
- **Structure-based, name-independent (works):** linked lists (any `.next`),
  binary trees (any `left`/`right`), arrays, 2D grids/matrices, graphs
  (adjacency dict), recursion (any depth), deque/set by type. Same for Java.
- **Still name-dependent (the gap, = Task 1):** telling a plain `list`/`int[]`
  used as a **stack / queue / dp-array / union-find** apart from a generic array.
  A list IS a list at any single instant; only the **access pattern over time**
  or the **variable name** distinguishes it. Today we use the name as a shortcut.

---

## 4. What is LEFT (prioritized)

### TASK 0 - Migrate AI layer to Gemini  [DONE]
Replace Anthropic with Gemini in `backend/Api/routes/ai.js`. Support both
**AI Studio** (`@google/generative-ai`, `GEMINI_API_KEY`) and **Vertex AI**
(`@google-cloud/vertexai`, `GCP_PROJECT`+`GCP_LOCATION` via ADC) so the GCP
credit can be used. Keep the rule-based fallback. Default model `gemini-1.5-flash`.
Acceptance: with a key set, `/api/ai/explain` returns `source:"gemini"`; with no
key, returns `source:"rule-based"`. The AI is fed `meta` + a 60-step semantic
window; it must never be asked to execute.

### TASK 1 - Access-pattern + topology detection (THE robustness upgrade)
> STATUS: Python DONE (access-pattern stack/queue/heap/dsu via usage, in
> `engine/promote.py`; noise vars filtered). REMAINING: (a) mirror the same
> promotion in JavaWorker.java; (b) topology fallback for objects whose link
> fields are NOT named next/left/right (classify by reference shape).
Goal: make stack/queue/dp/union-find/tree detection depend on **structure and
usage**, not variable names. Implement in BOTH Python (`engine/`) and Java
(`JavaWorker.java`) so they share behavior.

Approach (do it in the tracer, post-process the whole step stream):
1. **Per-list usage tracking.** For each list/array variable, record across the
   trace how it was mutated (from the `semantic` events + line text): only
   `append`/`pop` at the end -> **stack**; `append` + `popleft`/`pop(0)` ->
   **queue**; index writes only -> stays **array**; self-referential index
   (`parent[x] = parent[parent[x]]` / `f[i] = f[f[i]]`) -> **dsu**; a 2D array
   whose cells fill progressively referencing neighbor cells -> **dp_grid**
   regardless of name.
2. **Topology fallback for objects** (when field names are unconventional):
   classify a custom object by its reference shape -- exactly one self-type
   pointer field -> linked list; two -> binary tree; N (a list/array of
   self-type) -> n-ary tree / graph; a back-pointer too -> doubly linked.
   This removes the dependence on the literal names `next`/`left`/`right`.
3. **Promotion pass.** After the run, relabel each variable's `var_types`
   across all steps based on the inferred role (a variable keeps one role for
   the whole trace; pick the highest-confidence signal). Keep name + type as
   weaker tie-breakers, not the primary signal.
4. **Noise filter.** Drop internal junk locals from `locals`/`var_types`:
   names starting with `.` (comprehension temporaries like `.0`), and the
   `fromlist` artifact from `from x import y`. (Bug seen in testing.)
5. Cosmetic: a 2D grid not named `dp` currently shows as `matrix` -- once (1)
   detects DP by fill-pattern, label it `dp_grid`.

Acceptance (add these as tests): a stack built from a `list` named `helper`
detects `stack`; union-find named `f` detects `dsu`; a linked list whose node
field is `nxt`/`forward` (not `next`) still detects `linked_list`; a tree whose
fields are `l`/`r` detects `binary_tree`; comprehension/junk vars do not appear.
Never crash on unknown shapes -> fall back to `array`/`object`.

### TASK 2 - Reference-diff bug finder ("where did it go wrong")
Add `/api/ai` mode `"bug"` and a worker endpoint that runs a known-correct
reference solution on the same input, diffs the two traces, and returns the
FIRST divergence step ("matched through step 14; at step 15 `low` should be 4,
not 5"). `worker/app.py` already has a `/run-reference` stub. Deterministic;
the AI only narrates the diff.

### TASK 3 - UX polish
> STATUS: auto-jump past blank first step DONE (usePlayback). REMAINING:
> animate pointer markers + array swaps, DP-grid arrows from a cell to the
> cells it read, richer empty states.
Auto-jump to first step that has variables (avoid the blank step 1); animate
pointer markers and array swaps; DP grid: draw arrows from a filled cell to the
cells it read; better empty states.

### TASK 6 - Docs / blog section + SEO
> STATUS: framework DONE -- `frontend/src/lib/docsContent.js` (data-driven
> topics), `components/docs/{DocsSidebar,DocArticle,EmbeddedViz}.jsx` (the
> embedded live visualizer reuses the real engine + Stage + Timeline),
> `pages/DocsPage.jsx`, hash routing (#/docs/<slug>) in App.jsx, SEO meta in
> index.html, framer-motion animation. 6 topics written (linked list, stack,
> queue, recursion, binary tree, graph BFS).
> REMAINING: (a) add the rest of the DSA topics (just more entries in
> docsContent.js, incl. Java demos via demo.language="java"); (b) REAL SEO ->
> prerender each /docs page to static HTML at build (vite-plugin-ssg or
> @prerenderer) so crawlers see content, not an empty root div; generate a
> sitemap.xml; add per-page <title>/<meta> (react-helmet or the SSG plugin).
> The interactive visualizer is the moat vs AI-search summaries -- keep text
> for crawlers, the live demo for humans.

### TASK 4 - C++ (LAST, needs Ubuntu + Clang)
Build a C++ worker emitting the SAME envelope. Recommended: **Clang LibTooling**
source instrumentation (Clang has the types Tree-sitter lacks) compiled to a
sandbox, OR Valgrind heap traversal (Python Tutor's approach). gdb works but is
fiddly (stepping into headers). Run on Ubuntu. New gateway route `/api/cpp` +
frontend toggle entry. Everything downstream is already language-agnostic.

### TASK 5 - Productionization
Sandbox the workers (Docker, no network, cpu/mem limits) since they run
untrusted code. Add auth + Stripe in the Node gateway. Permalinks/embeds for the
blog/SEO play (store traces, shareable URLs).

---

## 5. Conventions & gotchas (read before editing)

- **Trace envelope is the contract.** Don't change a field without updating both
  workers AND the frontend (`registry.jsx`, `usePlayback`, renderers).
- **Add a structure end to end** = detector (emit new `var_types` tag) +
  serializer (scene shape) + one entry in
  `frontend/src/components/visualizers/registry.jsx` + `TYPE_META`.
- **JDI gotchas (Java):** (a) NEVER call `invokeMethod` while stepping -- it
  kills the step request; read object state from fields instead. (b) Set the
  step request `setSuspendPolicy(SUSPEND_EVENT_THREAD)` or stepping becomes a
  race that only shows up under load. (c) Create the StepRequest ONCE (guard
  against multiple ClassPrepareEvents). (d) Exclude `java.*,javax.*,sun.*,jdk.*,
  com.sun.*` so you don't step into the JDK.
- **`STEP_LINE` fires on line CHANGES** -- one-liner code yields few steps; this
  is expected, not a bug.
- **Files**: Python ASCII only in source; the workers must keep emitting the
  exact envelope.
- **Editing caution (was an issue in the dev sandbox; may not affect you):**
  some edits truncated files / added NUL bytes. Always re-verify a file parses
  after editing (`python -c "import ast,sys;ast.parse(open(f).read())"`,
  `node -c file.js`, or esbuild for JSX) and check the last line is intact.

---

## 6. How to run (Windows)

`start-all.bat` (double-click) or `start-all.ps1`. Needs Python 3.10+, Node 18+,
and for Java a JDK 11+ (`winget install EclipseAdoptium.Temurin.17.JDK`).
Manual: Python worker `uvicorn worker.app:app --port 8000` (in `backend/`),
Java worker `java JavaWorker.java --serve 8001` (in `backend/java-worker/`),
gateway `npm start` (in `backend/Api/`), frontend `npm run dev` (in `frontend/`).

---

## 7. File map (key files)

```
backend/engine/runner.py          sys.settrace core, envelope, caps, stdin
backend/engine/detectors/*.py     linear/structural/trees/graph detection  <-- Task 1
backend/engine/semantic.py        semantic events (swap/write/push/pop/...) <-- Task 1 signals
backend/engine/serialize.py       live objects -> scenes
backend/worker/app.py             Python FastAPI worker (:8000)
backend/java-worker/JavaWorker.java  Java JDI worker (:8001)               <-- Task 1 (mirror)
backend/Api/server.js             gateway, route mounts
backend/Api/routes/{python,java,ai}.js
backend/Api/lib/explainFallback.js   offline AI
frontend/src/lib/{api,examples}.js
frontend/src/components/visualizers/registry.jsx  type -> renderer (extension point)
frontend/src/pages/VisualizerPage.jsx
```
