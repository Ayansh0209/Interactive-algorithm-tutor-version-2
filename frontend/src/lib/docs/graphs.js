// Docs topics: graphs. Rich fields render via DocArticle.

export const graphTopics = [
  {
    slug: "graph-representations", category: "graphs", title: "Graph Representations", premade: "graph-representations",
    summary: "A graph is just vertices plus edges. The two common storage forms — adjacency list and adjacency matrix — trade space for edge-lookup speed, and the choice colours everything you build on top.",
    keyIdea: "Store neighbours as a **list per vertex** for sparse graphs (compact), or as a **V×V table** for dense ones (instant edge tests). Density picks the winner.",
    howItWorks: {
      intro: "The two representations of the same graph:",
      steps: [
        "**Adjacency list:** `adj[u]` is a list of `u`'s neighbours. Total size is `O(V + E)`.",
        "Iterating a vertex's neighbours is optimal — you touch exactly its edges.",
        "**Adjacency matrix:** `mat[u][v] = 1` if the edge exists. Size is `O(V²)`, but 'is `u`–`v` an edge?' is `O(1)`.",
        "Weighted graphs store the weight in the list entry (`(v, w)`) or the matrix cell.",
      ],
    },
    sections: [
      { heading: "List vs matrix", body: "An **adjacency list** stores, per vertex, its neighbours — compact `O(V + E)` and ideal for sparse graphs and neighbour iteration. An **adjacency matrix** is a `V×V` table giving `O(1)` edge lookup but costing `O(V²)` space and making neighbour iteration `O(V)`." },
      { heading: "Pick by density", body: "Real graphs (road networks, social graphs, the web) are usually **sparse** (`E ≪ V²`), so lists win on both space and traversal. Reach for a matrix when the graph is **dense**, tiny, or when you do constant-time edge tests constantly (e.g. Floyd-Warshall)." },
    ],
    complexity: [["List space", "O(V + E)"], ["Matrix space", "O(V²)"], ["Edge lookup (matrix)", "O(1)"], ["Edge lookup (list)", "O(degree)"], ["Neighbour iteration (list)", "O(degree)"]],
    pitfalls: [
      "For **undirected** graphs, add each edge in **both** directions.",
      "A matrix on a large sparse graph wastes enormous memory (a million vertices → 10¹² cells).",
      "Parallel edges / self-loops need a plan (multiset lists, or counts in the matrix).",
    ],
    whenToUse: {
      use: ["Sparse graphs → **list**", "Dense graphs or constant-time edge tests → **matrix**", "Weighted edges → store weights alongside"],
      avoid: ["Matrix for large sparse graphs (memory blows up)"],
    },
    realWorld: ["Road & transit networks", "Social / follower graphs", "The web link graph", "Dependency graphs"],
    references: [{ book: "CLRS", where: "§20.1, Representations of Graphs" }, { book: "Sedgewick & Wayne", where: "§4.1, Undirected Graphs" }],
    demo: { language: "python", code: `# adjacency list\nadj = {0: [1, 2], 1: [2], 2: [0]}\n# adjacency matrix for the same graph\nn = 3\nmat = [[0] * n for _ in range(n)]\nfor u in adj:\n    for v in adj[u]:\n        mat[u][v] = 1\nprint(mat)\n` },
  },
  {
    slug: "graph-bfs", category: "graphs", title: "Breadth-First Search", premade: "bfs",
    summary: "Explore a graph level by level using a queue. Because it expands by distance, the first time BFS reaches a node is along a fewest-edges path — free shortest paths on unweighted graphs.",
    keyIdea: "A queue enforces 'oldest discovered, first explored', so BFS fans out in rings of increasing distance — and the first arrival at any node is necessarily the closest.",
    howItWorks: {
      intro: "BFS from a source, using a queue and a visited set:",
      steps: [
        "Enqueue the source and mark it visited.",
        "**Dequeue** a node, process it, and enqueue each **unvisited** neighbour (marking them visited as you enqueue).",
        "Because the queue is FIFO, all distance-1 nodes come out before any distance-2 node, and so on — the frontier expands in rings.",
        "Track a `dist`/`parent` map to recover the shortest (fewest-edge) path.",
        "Every vertex and edge is handled once → `O(V + E)`.",
      ],
    },
    sections: [
      { heading: "Level by level", body: "BFS visits the source, then all its neighbours, then *their* neighbours, and so on. A **queue** holds the frontier and a **visited** set prevents re-processing. Mark nodes visited **when you enqueue** them, not when you dequeue, or you'll enqueue duplicates." },
      { heading: "Shortest paths (unweighted)", body: "Because BFS expands strictly by distance, the first time it reaches a node is via a fewest-**edges** path. This makes it the go-to for unweighted shortest paths, grid distances, and 'minimum moves' puzzles. For **weighted** edges, distance ≠ edge count, so you need Dijkstra (or 0-1 BFS for weights in {0,1})." },
    ],
    complexity: [["Time", "O(V + E)"], ["Space", "O(V)", "queue + visited"]],
    pitfalls: [
      "Marking visited on **dequeue** instead of **enqueue** lets a node enter the queue many times.",
      "Using BFS for weighted shortest paths — it only counts edges, not weights.",
      "`list.pop(0)` as a queue is O(n); use `collections.deque`.",
    ],
    whenToUse: {
      use: ["Unweighted shortest path / fewest moves", "Level-order traversal", "Connected components, bipartite check", "Grid / maze distances"],
      avoid: ["Weighted shortest paths (**Dijkstra**)", "Deep exploration / topological ordering (**DFS**)"],
    },
    variants: [
      { name: "0-1 BFS", note: "Deque-based BFS for edge weights in {0,1} — O(V+E)." },
      { name: "Multi-source BFS", note: "Seed the queue with many sources at once (nearest-of-many)." },
      { name: "Bidirectional BFS", note: "Search from both ends to meet in the middle — big speedup." },
    ],
    realWorld: ["GPS 'fewest hops'", "Web crawlers (breadth-first frontier)", "Social 'degrees of separation'", "Puzzle solvers (Rubik's, sliding tile)"],
    references: [{ book: "CLRS", where: "§20.2, Breadth-First Search" }, { book: "Skiena", where: "§5.6, Breadth-First Search" }],
    demo: { language: "python", code: `from collections import deque\ngraph = {0: [1, 2], 1: [3, 4], 2: [4], 3: [], 4: []}\nvisited = set()\nq = deque([0])\norder = []\nwhile q:\n    node = q.popleft()\n    if node in visited:\n        continue\n    visited.add(node)\n    order.append(node)\n    for nb in graph[node]:\n        if nb not in visited:\n            q.append(nb)\nprint(order)\n` },
  },
  {
    slug: "graph-dfs", category: "graphs", title: "Depth-First Search", premade: "dfs",
    summary: "Dive as deep as possible along each branch before backtracking, using recursion (or an explicit stack). It's the quiet workhorse behind a dozen classic graph algorithms.",
    keyIdea: "Commit to one path until it dead-ends, then rewind to the last unexplored fork. The order in which nodes finish (postorder) is the secret sauce for topological sort and SCCs.",
    howItWorks: {
      intro: "DFS from a node, recursively:",
      steps: [
        "Mark the node **visited** and process it.",
        "For each **unvisited** neighbour, recurse into it immediately — going deep before wide.",
        "When a node has no unvisited neighbours, it's **finished**; the recursion returns (backtracks) to its parent.",
        "The call stack *is* the current path; **discovery** and **finish** times give algorithms their power.",
        "Each vertex and edge is touched once → `O(V + E)`.",
      ],
    },
    sections: [
      { heading: "Go deep, then back up", body: "DFS follows one path until it dead-ends, then backtracks to the most recent branch with unexplored neighbours. Recursion carries the stack for free; an explicit stack avoids Python's recursion limit on deep graphs. A **visited** set prevents infinite loops on cycles." },
      { heading: "What it powers", body: "DFS with a little extra bookkeeping gives you **topological sort** (postorder), **cycle detection** (a back edge to a gray node), **connected components**, **strongly-connected components** (Tarjan/Kosaraju), and **bridges/articulation points** — the connectivity backbone of graph theory." },
    ],
    complexity: [["Time", "O(V + E)"], ["Space", "O(V)", "stack + visited"]],
    pitfalls: [
      "Deep or long graphs overflow the recursion stack — switch to an explicit stack.",
      "Without a visited set, cycles cause infinite recursion.",
      "In directed graphs, an edge to a **visited** node isn't always a cycle — you need the gray/black distinction.",
    ],
    whenToUse: {
      use: ["Topological sort, cycle detection, SCCs", "Connected components / flood fill", "Exhaustive search & backtracking", "Tree/graph structural analysis"],
      avoid: ["Shortest paths in unweighted graphs (**BFS**)", "Extremely deep graphs with recursion (use a stack)"],
    },
    variants: [
      { name: "Iterative DFS", note: "Explicit stack — no recursion-depth limit." },
      { name: "Tarjan / Kosaraju", note: "DFS-based strongly-connected-component algorithms." },
      { name: "Iterative deepening", note: "DFS with a growing depth cap — BFS optimality at DFS memory." },
    ],
    realWorld: ["Dependency resolution", "Maze generation & solving", "Detecting deadlocks (cycle detection)", "Compiler analysis (SCCs)"],
    references: [{ book: "CLRS", where: "§20.3, Depth-First Search" }, { book: "Sedgewick & Wayne", where: "§4.1–4.2" }],
    demo: { language: "python", code: `graph = {0: [1, 2], 1: [3, 4], 2: [4], 3: [], 4: []}\nvisited = set()\norder = []\ndef dfs(node):\n    if node in visited:\n        return\n    visited.add(node)\n    order.append(node)\n    for nb in graph[node]:\n        dfs(nb)\ndfs(0)\nprint(order)\n` },
  },
  {
    slug: "dijkstra", category: "graphs", title: "Dijkstra's Shortest Path", premade: "dijkstra",
    summary: "Find shortest paths from a source in a weighted graph with non-negative edges by greedily settling the closest unsettled node — BFS's weighted big sibling.",
    keyIdea: "If all edges are non-negative, the nearest unsettled node's tentative distance must already be final — so settle it, relax its edges, and repeat. A heap always hands you that nearest node.",
    howItWorks: {
      intro: "Grow a set of 'settled' nodes with known-final distances:",
      steps: [
        "Set `dist[source] = 0`, everything else ∞; push `(0, source)` onto a min-heap.",
        "**Pop** the unsettled node `u` with the smallest tentative distance — its distance is now final.",
        "**Relax** each edge `u → v`: if `dist[u] + w < dist[v]`, update `dist[v]` and push `(dist[v], v)`.",
        "Skip a popped entry if it's **stale** (`d > dist[u]`) — lazy deletion instead of decrease-key.",
        "Repeat until the heap empties. Each edge is relaxed once → `O((V + E) log V)`.",
      ],
    },
    sections: [
      { heading: "Greedy with a heap", body: "Repeatedly pop the unsettled node with the smallest tentative distance and relax its outgoing edges. A **priority queue** makes each pop `O(log V)`. The greedy choice is justified by the non-negativity of edges: nothing you explore later can offer a shorter route to an already-settled node." },
      { heading: "Non-negative only", body: "Dijkstra's correctness rests on the assumption of **no negative edges** — once a node is settled, its distance is final. A single negative edge can break that, silently returning wrong answers. For negative edges use **Bellman-Ford**; for a good heuristic estimate to a single target, **A\\*** is Dijkstra plus a guide." },
    ],
    complexity: [["Time (binary heap)", "O((V + E) log V)"], ["Time (Fibonacci heap)", "O(E + V log V)"], ["Space", "O(V)"]],
    pitfalls: [
      "**Negative edges** break Dijkstra — use Bellman-Ford instead.",
      "Not skipping **stale** heap entries (or not using lazy deletion) inflates the running time.",
      "Forgetting that the heap can hold multiple entries per node (that's fine, if you skip stale ones).",
    ],
    whenToUse: {
      use: ["Single-source shortest path, **non-negative** weights", "Road-network routing", "Network latency / cost minimization"],
      avoid: ["Negative edges (**Bellman-Ford**)", "Unweighted graphs (**BFS** is simpler and faster)", "All-pairs on dense graphs (**Floyd-Warshall**)"],
    },
    variants: [
      { name: "A* search", note: "Dijkstra + an admissible heuristic — targets one destination fast." },
      { name: "0-1 BFS", note: "Deque replaces the heap when weights are only 0 or 1." },
      { name: "Bidirectional Dijkstra", note: "Search from source and target at once." },
    ],
    realWorld: ["GPS & map routing", "Network packet routing (OSPF)", "Game pathfinding", "Flight / fare search"],
    references: [{ book: "CLRS", where: "§22.3, Dijkstra's Algorithm" }, { book: "Sedgewick & Wayne", where: "§4.4, Shortest Paths" }, { book: "Skiena", where: "§8.3.1" }],
    demo: { language: "python", code: `import heapq\ngraph = {0: [(1, 4), (2, 1)], 1: [(3, 1)], 2: [(1, 2), (3, 5)], 3: []}\ndist = {0: 0}\npq = [(0, 0)]\nwhile pq:\n    d, u = heapq.heappop(pq)\n    if d > dist.get(u, 1e9):\n        continue\n    for v, w in graph[u]:\n        if d + w < dist.get(v, 1e9):\n            dist[v] = d + w\n            heapq.heappush(pq, (dist[v], v))\nprint(dist)\n` },
  },
  {
    slug: "bellman-ford", category: "graphs", title: "Bellman-Ford",
    summary: "Shortest paths from a source that tolerate negative edges, by relaxing all edges V−1 times — and it can detect negative cycles, which Dijkstra cannot.",
    keyIdea: "A shortest path has at most `V−1` edges, so `V−1` full sweeps of edge relaxations are enough to settle everything — no assumptions about edge signs required.",
    howItWorks: {
      intro: "Relax every edge, repeatedly:",
      steps: [
        "Set `dist[source] = 0`, all others ∞.",
        "Do `V−1` passes; in each pass, relax **every** edge: `if dist[u] + w < dist[v]: dist[v] = dist[u] + w`.",
        "After pass `k`, every shortest path using ≤ `k` edges is correct — so after `V−1` passes, all are.",
        "Run **one more** pass: if any distance still improves, a **negative cycle** is reachable.",
      ],
    },
    sections: [
      { heading: "Relax everything, repeatedly", body: "Each full pass over all edges lets correct shortest-path information propagate one more edge outward. Since a simple shortest path has at most `V−1` edges, `V−1` passes suffice. It's slower than Dijkstra (`O(V·E)`) but makes **no assumption** about edge weights." },
      { heading: "Negative cycles", body: "If a `V`-th pass *still* improves a distance, some reachable path can be made arbitrarily short — a **negative cycle**. Bellman-Ford reports it (and can identify the affected vertices), which Dijkstra fundamentally cannot. This makes it the backbone of currency-arbitrage detection and the distributed **distance-vector** routing protocols." },
    ],
    complexity: [["Time", "O(V · E)"], ["Space", "O(V)"]],
    pitfalls: [
      "Stopping after fewer than `V−1` passes can miss long shortest paths.",
      "Forgetting the extra pass means you silently return garbage on negative-cycle graphs.",
      "It's much slower than Dijkstra — only pay for it when negatives are actually possible.",
    ],
    whenToUse: {
      use: ["Shortest paths with **negative** edges", "Detecting negative cycles (arbitrage)", "Distributed distance-vector routing"],
      avoid: ["All-non-negative weights (**Dijkstra** is far faster)", "Very large graphs where O(V·E) is too slow"],
    },
    variants: [
      { name: "SPFA", note: "Queue-based Bellman-Ford — faster in practice, same worst case." },
      { name: "Johnson's algorithm", note: "Reweight with Bellman-Ford, then run Dijkstra from each node (all-pairs, sparse)." },
    ],
    realWorld: ["Currency arbitrage detection", "RIP distance-vector routing", "Constraint systems (difference constraints)"],
    references: [{ book: "CLRS", where: "§22.1, The Bellman-Ford Algorithm" }, { book: "Sedgewick & Wayne", where: "§4.4, negative weights" }],
    demo: { language: "python", code: `edges = [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4)]\nV = 4\ndist = [float("inf")] * V\ndist[0] = 0\nfor _ in range(V - 1):\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w\nprint(dist)\n` },
  },
  {
    slug: "floyd-warshall", category: "graphs", title: "Floyd-Warshall",
    summary: "All-pairs shortest paths via dynamic programming: allow one more intermediate vertex at a time. Three nested loops, dead simple, O(V³).",
    keyIdea: "The shortest path from `i` to `j` either avoids vertex `k` or routes through it. Consider each `k` in turn as a permitted waypoint and the table converges to all-pairs distances.",
    howItWorks: {
      intro: "Let `dist[i][j]` start as the direct edge weight (∞ if none, 0 on the diagonal):",
      steps: [
        "For each intermediate vertex `k` (the **outer** loop):",
        "For every pair `(i, j)`, ask: is going `i → k → j` shorter than the best `i → j` so far?",
        "If so, update `dist[i][j] = dist[i][k] + dist[k][j]`.",
        "After all `k`, every entry is the true shortest distance. A negative diagonal entry signals a negative cycle.",
      ],
    },
    sections: [
      { heading: "Intermediate vertices", body: "`dist[i][j]` improves by allowing routes through each vertex `k` in turn: `dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])`. The subtle bit is loop order — `k` **must** be the outermost loop, so that when you use `dist[i][k]` and `dist[k][j]` they already account for waypoints `0…k−1`." },
      { heading: "When to use", body: "It's the simplest **all-pairs** shortest-path algorithm and handles negative edges (no negative cycles). Best for **small, dense** graphs where you want the whole distance matrix. For a single source, Dijkstra/Bellman-Ford is cheaper; for all-pairs on **sparse** graphs, Johnson's beats `V³`." },
    ],
    complexity: [["Time", "O(V³)"], ["Space", "O(V²)"]],
    pitfalls: [
      "The `k` loop **must** be outermost — swapping loop order gives wrong answers.",
      "`O(V³)` and `O(V²)` memory make it impractical past a few thousand vertices.",
      "Watch integer overflow when adding two large / ∞ distances.",
    ],
    whenToUse: {
      use: ["All-pairs shortest paths on small dense graphs", "Transitive closure (reachability)", "Detecting any negative cycle"],
      avoid: ["Large or sparse graphs (**Johnson's** or repeated Dijkstra)", "Single-source only (**Dijkstra/Bellman-Ford**)"],
    },
    variants: [
      { name: "Transitive closure", note: "Same triple loop with OR instead of min — who can reach whom." },
      { name: "Johnson's algorithm", note: "All-pairs for sparse graphs in O(V·E log V)." },
    ],
    realWorld: ["Network routing tables", "Precomputed distance matrices (maps, games)", "Reachability analysis"],
    references: [{ book: "CLRS", where: "§23.2, The Floyd-Warshall Algorithm" }],
    demo: { language: "python", code: `INF = float("inf")\nd = [[0, 3, INF, 7],\n     [8, 0, 2, INF],\n     [5, INF, 0, 1],\n     [2, INF, INF, 0]]\nn = 4\nfor k in range(n):\n    for i in range(n):\n        for j in range(n):\n            if d[i][k] + d[k][j] < d[i][j]:\n                d[i][j] = d[i][k] + d[k][j]\nprint(d[0])\n` },
  },
  {
    slug: "prim-mst", category: "graphs", title: "Prim's MST", premade: "prim-mst",
    summary: "Build a minimum spanning tree by growing it from a start vertex, always adding the cheapest edge that reaches a new vertex.",
    keyIdea: "Grow one connected blob; at every step the cheapest edge leaving the blob is safe to add to the MST (the 'cut property'). A heap serves up that edge.",
    howItWorks: {
      intro: "Grow the tree one vertex at a time:",
      steps: [
        "Start with any vertex in the tree; push its edges onto a min-heap.",
        "**Pop** the cheapest edge; if it reaches a vertex **not yet in the tree**, add that vertex and the edge.",
        "Push the new vertex's outgoing edges (to non-tree vertices) onto the heap.",
        "Skip edges to vertices already in the tree (stale entries).",
        "After `V−1` additions the MST is complete → `O(E log V)`.",
      ],
    },
    sections: [
      { heading: "Grow the tree (cut property)", body: "Maintain the set of in-tree vertices and repeatedly add the lowest-weight edge **crossing the boundary** to a new vertex. This is safe by the **cut property**: for any partition of vertices, the minimum-weight edge crossing it belongs to some MST. A priority queue picks that crossing edge in `O(log V)`." },
      { heading: "MST basics", body: "A **spanning tree** connects all `V` vertices with exactly `V−1` edges and no cycles; the **minimum** spanning tree has the least total weight. Prim grows one tree from a seed (great for dense graphs); **Kruskal** adds globally-cheapest edges (great for sparse, edge-list graphs). Both are greedy and both are optimal." },
    ],
    complexity: [["Time (binary heap)", "O(E log V)"], ["Time (Fibonacci heap)", "O(E + V log V)"], ["Space", "O(V)"]],
    pitfalls: [
      "Not skipping edges to already-in-tree vertices adds cycles / wastes work.",
      "Assumes the graph is **connected** — otherwise you get a spanning forest of one component.",
      "The MST need not be unique when weights tie.",
    ],
    whenToUse: {
      use: ["MST on **dense** graphs", "Adjacency-list graphs where you grow from a seed", "Network design"],
      avoid: ["Sparse edge-list graphs where **Kruskal** is more natural"],
    },
    variants: [
      { name: "Kruskal's algorithm", note: "Edge-sorted MST with union-find — see its own page." },
      { name: "Borůvka's algorithm", note: "Parallel-friendly MST; each round adds every component's cheapest edge." },
    ],
    realWorld: ["Network / circuit layout", "Clustering (cut the k−1 heaviest MST edges)", "Approximate TSP", "Utility grid design"],
    references: [{ book: "CLRS", where: "§21.2, Prim & Kruskal" }, { book: "Sedgewick & Wayne", where: "§4.3, Minimum Spanning Trees" }],
    demo: { language: "python", code: `import heapq\ngraph = {0: [(1, 4), (2, 3)], 1: [(0, 4), (2, 1)], 2: [(0, 3), (1, 1)]}\nin_tree = set()\npq = [(0, 0)]\ntotal = 0\nwhile pq:\n    w, u = heapq.heappop(pq)\n    if u in in_tree:\n        continue\n    in_tree.add(u); total += w\n    for v, wt in graph[u]:\n        if v not in in_tree:\n            heapq.heappush(pq, (wt, v))\nprint(total)\n` },
  },
  {
    slug: "kruskal-mst", category: "graphs", title: "Kruskal's MST", premade: "kruskal-mst",
    summary: "Build a minimum spanning tree by adding edges in increasing weight order, skipping any that would form a cycle — with union-find answering the cycle check in near-constant time.",
    keyIdea: "Consider edges cheapest-first; take an edge unless its endpoints are already connected. Union-find makes 'already connected?' almost free.",
    howItWorks: {
      intro: "Sort, then greedily accept safe edges:",
      steps: [
        "**Sort** all edges by weight.",
        "Initialise a **union-find** structure with every vertex in its own set.",
        "For each edge `(u, v)` in order, check `find(u) == find(v)`.",
        "If they're in **different** sets, the edge connects two components without a cycle — **union** them and take the edge.",
        "Stop after `V−1` edges. The dominant cost is the sort → `O(E log E)`.",
      ],
    },
    sections: [
      { heading: "Sort then add", body: "Sort all edges by weight and scan them cheapest-first. Add each edge unless its endpoints are already connected — **union-find** answers that in `O(α(n))` (effectively constant). Skipping an edge whose endpoints already share a component is exactly the cycle-avoidance rule." },
      { heading: "Edge-list friendly", body: "Kruskal works directly on the **edge list**, never needing adjacency structure, which makes it natural for sparse graphs and a beautiful showcase for the disjoint-set data structure. Prim, by contrast, wants adjacency lists and shines on dense graphs." },
    ],
    complexity: [["Time", "O(E log E)", "dominated by the sort"], ["Union-find ops", "O(α(n))", "near-constant"], ["Space", "O(V)"]],
    pitfalls: [
      "Skipping the cycle check (union-find) admits cycles — it's not a tree anymore.",
      "Using naive union-find without path compression / union by rank makes it slow.",
      "Disconnected graphs yield a spanning **forest**, not a single tree.",
    ],
    whenToUse: {
      use: ["MST on **sparse** graphs", "You already have an edge list", "Teaching / using union-find"],
      avoid: ["Very dense graphs where sorting `E ≈ V²` edges dominates (**Prim** with a heap)"],
    },
    references: [{ book: "CLRS", where: "§21.2, Kruskal's Algorithm" }, { book: "Sedgewick & Wayne", where: "§4.3" }],
    demo: { language: "python", code: `edges = [(1, 0, 1), (3, 0, 2), (1, 1, 2)]  # (weight, u, v)\nedges.sort()\nparent = list(range(3))\ndef find(x):\n    while parent[x] != x:\n        x = parent[x]\n    return x\ntotal = 0\nfor w, u, v in edges:\n    ru, rv = find(u), find(v)\n    if ru != rv:\n        parent[ru] = rv\n        total += w\nprint(total)\n` },
  },
  {
    slug: "topological-sort", category: "graphs", title: "Topological Sort", premade: "topo-sort",
    summary: "Order the vertices of a DAG so every edge points forward — the valid order to run tasks that depend on one another.",
    keyIdea: "A task can run once all its prerequisites have; repeatedly emitting a vertex with no remaining incoming edges produces a legal order (and reveals cycles when it can't).",
    howItWorks: {
      intro: "Kahn's algorithm, driven by in-degrees:",
      steps: [
        "Compute each vertex's **in-degree** (number of incoming edges).",
        "Enqueue all vertices with in-degree `0` — they have no prerequisites.",
        "**Dequeue** a vertex, append it to the order, and decrement each neighbour's in-degree.",
        "Whenever a neighbour's in-degree hits `0`, enqueue it.",
        "If you emit all `V` vertices, that's a valid topological order; if some remain, the graph has a **cycle**.",
      ],
    },
    sections: [
      { heading: "Kahn's algorithm (BFS-style)", body: "Repeatedly output a vertex with no remaining incoming edges, then remove it, decrementing its neighbours' in-degrees. If the graph can't be fully emptied this way, some vertices are stuck in a **cycle** — and a cyclic graph has no topological order at all." },
      { heading: "The DFS alternative", body: "A depth-first search that pushes each vertex onto a stack **as it finishes** (postorder), then reverses the stack, produces a topological order too. Both are `O(V + E)`; Kahn's doubles as cycle detection, while the DFS version composes neatly with other DFS analyses." },
    ],
    complexity: [["Time", "O(V + E)"], ["Space", "O(V)"]],
    pitfalls: [
      "Topological sort only exists for a **DAG** — always check for a cycle (leftover vertices).",
      "The order usually isn't unique; don't rely on a specific one.",
      "Off-by-one on in-degree bookkeeping silently drops or duplicates vertices.",
    ],
    whenToUse: {
      use: ["Task/build scheduling with dependencies", "Course prerequisite ordering", "Spreadsheet recalculation order", "Package / symbol resolution"],
      avoid: ["Graphs with cycles (no valid order — detect and report)"],
    },
    variants: [
      { name: "DFS postorder", note: "Reverse finish-order gives a topo sort and detects back edges." },
      { name: "Lexicographically smallest", note: "Use a min-heap instead of a queue in Kahn's." },
    ],
    realWorld: ["`make` / build systems", "Course scheduling", "Dependency resolvers (npm, pip)", "Spreadsheet formula evaluation"],
    references: [{ book: "CLRS", where: "§20.4, Topological Sort" }, { book: "Sedgewick & Wayne", where: "§4.2, Directed Graphs" }],
    demo: { language: "python", code: `from collections import deque\ngraph = {0: [2, 3], 1: [3], 2: [4], 3: [4], 4: []}\nindeg = {u: 0 for u in graph}\nfor u in graph:\n    for v in graph[u]:\n        indeg[v] += 1\nq = deque([u for u in graph if indeg[u] == 0])\norder = []\nwhile q:\n    u = q.popleft()\n    order.append(u)\n    for v in graph[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            q.append(v)\nprint(order)\n` },
  },
  {
    slug: "union-find", category: "graphs", title: "Union-Find (DSU)", premade: "union-find",
    summary: "Track a partition of elements into disjoint sets with near-constant union and find, using union by rank and path compression — the data structure behind Kruskal and dynamic connectivity.",
    keyIdea: "Represent each set as a tree; `find` returns the root. Two tiny tricks — attach the shorter tree under the taller, and flatten paths as you traverse — make operations effectively O(1).",
    howItWorks: {
      intro: "Each element points at a parent; a set is a tree rooted at its representative:",
      steps: [
        "`find(x)` follows parent pointers up to the **root** — the set's representative.",
        "**Path compression:** on the way up, repoint nodes directly at the root, flattening the tree for next time.",
        "`union(a, b)` links the root of one set under the root of the other.",
        "**Union by rank/size:** always attach the **smaller** tree under the larger, keeping trees shallow.",
        "Together these give `O(α(n))` amortized — α (inverse Ackermann) is ≤ 4 for any practical `n`.",
      ],
    },
    sections: [
      { heading: "Two operations", body: "`find(x)` returns the representative of `x`'s set; `union(a, b)` merges two sets. That's the whole interface, yet it underpins **connectivity** queries, **Kruskal's MST**, cycle detection in undirected graphs, and image segmentation." },
      { heading: "The optimizations", body: "**Union by rank** (or size) keeps the trees shallow by always hanging the smaller under the larger; **path compression** flattens the tree during each `find`. Together they give almost `O(1)` amortized per operation — precisely `O(α(n))`, the inverse-Ackermann function, which is at most 4 for any input you'll ever see. It's one of the most elegant results in algorithms." },
    ],
    complexity: [["Find / union (amortized)", "O(α(n))", "≈ constant"], ["Space", "O(n)"]],
    pitfalls: [
      "Using only **one** of the two optimizations still risks `O(log n)` (or worse) trees — use both.",
      "Union-find handles **merging** only; it can't efficiently **split** sets back apart.",
      "Comparing `x == y` instead of `find(x) == find(y)` is a classic bug.",
    ],
    whenToUse: {
      use: ["Dynamic connectivity ('are these connected?')", "Kruskal's MST", "Cycle detection in undirected graphs", "Grouping / clustering, percolation"],
      avoid: ["You need to **remove** elements or **split** sets", "You need the actual path between two nodes (use BFS/DFS)"],
    },
    variants: [
      { name: "Weighted union-find", note: "Store relative offsets to answer 'difference between x and y'." },
      { name: "Union-find with rollback", note: "Undo unions — used in offline dynamic-connectivity." },
    ],
    realWorld: ["Kruskal's MST", "Network connectivity", "Image segmentation (connected regions)", "Percolation / physics simulations", "Account de-duplication"],
    references: [{ book: "CLRS", where: "Ch. 19, Data Structures for Disjoint Sets" }, { book: "Sedgewick & Wayne", where: "§1.5, Union-Find" }, { book: "Tarjan (1975)", where: "Efficiency of a Good but Not Linear Set Union Algorithm" }],
    demo: { language: "python", code: `parent = list(range(6))\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]  # path compression\n        x = parent[x]\n    return x\ndef union(a, b):\n    parent[find(a)] = find(b)\nunion(0, 1); union(1, 2); union(3, 4)\nprint(find(0) == find(2), find(0) == find(3))\n` },
  },
  {
    slug: "cycle-detection", category: "graphs", title: "Cycle Detection",
    summary: "Decide whether a graph contains a cycle — via DFS colors in directed graphs, or union-find (or DFS with a parent) in undirected ones.",
    keyIdea: "A cycle is a path that revisits a node still 'on the stack'. Directed graphs track that with three colors; undirected graphs can use union-find's 'already connected' test.",
    howItWorks: {
      intro: "Directed graphs, using three DFS colors:",
      steps: [
        "**White** = unvisited, **Gray** = in progress (on the recursion stack), **Black** = fully explored.",
        "Color a node gray when DFS enters it.",
        "If DFS reaches a **gray** neighbour, that's a **back edge** → a cycle exists.",
        "Color the node black when DFS finishes it (all descendants done).",
        "In **undirected** graphs instead, union each edge's endpoints; if they're already in the same set, that edge closes a cycle.",
      ],
    },
    sections: [
      { heading: "Directed: DFS colors", body: "Mark nodes **white/gray/black**. Reaching a **gray** (still-in-progress) node means a back edge into the current path — a cycle. Reaching a **black** node is fine; it's already finished and not on your stack. This gray/black distinction is exactly why you can't just use a plain visited set on directed graphs." },
      { heading: "Undirected: union-find (or parent tracking)", body: "Process each edge; if both endpoints already share a set, that edge closes a cycle — this is precisely Kruskal's cycle check. Alternatively, a DFS that ignores the edge back to its immediate **parent** flags any *other* visited neighbour as a cycle." },
    ],
    complexity: [["Time", "O(V + E)"], ["Space", "O(V)"]],
    pitfalls: [
      "On **directed** graphs a plain visited set is wrong — you need the gray (on-stack) state.",
      "On **undirected** graphs, don't count the edge back to your parent as a cycle.",
      "Disconnected graphs: start DFS from every unvisited vertex.",
    ],
    whenToUse: {
      use: ["Deadlock detection", "Validating a DAG before topo-sort", "Detecting circular dependencies", "Undirected connectivity + cycles"],
      avoid: ["Finding the actual cycle vertices — that needs extra bookkeeping beyond a yes/no"],
    },
    realWorld: ["Deadlock detection in OS/DBs", "Circular import / dependency detection", "Spreadsheet circular references", "Filesystem loop detection"],
    references: [{ book: "CLRS", where: "§20.3, edge classification & back edges" }],
    demo: { language: "python", code: `graph = {0: [1], 1: [2], 2: [0]}  # has a cycle\ncolor = {u: 0 for u in graph}  # 0=white 1=gray 2=black\nhas_cycle = False\ndef dfs(u):\n    global has_cycle\n    color[u] = 1\n    for v in graph[u]:\n        if color[v] == 1:\n            has_cycle = True\n        elif color[v] == 0:\n            dfs(v)\n    color[u] = 2\nfor u in graph:\n    if color[u] == 0:\n        dfs(u)\nprint(has_cycle)\n` },
  },
  {
    slug: "hamiltonian-path", category: "graphs", title: "Hamiltonian Path", premade: "hamiltonian-path",
    summary: "Find a path that visits every vertex exactly once. There's no known efficient algorithm — it's NP-complete — so we search with pruned backtracking.",
    keyIdea: "Unlike visiting every *edge* once (Euler, easy), visiting every *vertex* once is NP-complete — so we build the path incrementally and abandon dead ends fast.",
    howItWorks: {
      intro: "Backtracking search for a path covering all vertices:",
      steps: [
        "Start the path at some vertex, marking it used.",
        "If the path length equals `V`, every vertex is covered — success.",
        "Extend to any **unvisited** neighbour and recurse.",
        "If no extension leads to a full path, **undo** (pop the vertex, mark it unused) and let the caller try another branch.",
        "Prune aggressively — dead branches abandoned early are the difference between feasible and hopeless.",
      ],
    },
    sections: [
      { heading: "NP-complete", body: "Euler paths (every **edge** once) have a simple degree-based characterization and a linear algorithm. Hamiltonian paths (every **vertex** once) are **NP-complete** — no polynomial algorithm is known, and finding one would resolve P vs NP. So in general we **search**: extend the path, and undo when stuck." },
      { heading: "Pruning is survival", body: "Only move to unvisited neighbours, and abandon a branch the instant no extension is possible. Stronger pruning — degree checks, connectivity checks, forced moves — makes moderate graphs tractable even though the worst case is `O(V!)`. This is the same shape as the Travelling Salesman search." },
    ],
    complexity: [["Time", "O(V!)", "worst case, pruned in practice"], ["Space", "O(V)"]],
    pitfalls: [
      "It's exponential — don't expect it to finish on large graphs.",
      "Confusing it with the easy **Euler** path (every edge once).",
      "Weak pruning turns a solvable instance into a timeout.",
    ],
    whenToUse: {
      use: ["Small graphs where you truly need a vertex-covering path", "Puzzle / route problems (knight's tour)", "Teaching NP-completeness & search"],
      avoid: ["Large graphs (use heuristics / approximation / SAT solvers)", "When an Euler path or an approximation actually suffices"],
    },
    variants: [
      { name: "Travelling Salesman", note: "Hamiltonian **cycle** of minimum weight — the classic NP-hard problem." },
      { name: "Held-Karp DP", note: "Bitmask DP solves it in O(2ⁿ·n²) — exponential but far better than n!." },
    ],
    realWorld: ["Route planning (TSP cousins)", "DNA fragment assembly", "Knight's tour puzzles", "PCB drilling order"],
    references: [{ book: "Garey & Johnson", where: "Computers and Intractability (NP-completeness catalog)" }, { book: "Skiena", where: "§16.5, Hamiltonian Cycle" }],
    demo: { language: "python", code: `graph = {0: [1, 2], 1: [0, 2, 3], 2: [0, 1, 3], 3: [1, 2]}\nn = 4\npath = []\nused = set()\ndef backtrack(u):\n    path.append(u); used.add(u)\n    if len(path) == n:\n        return True\n    for v in graph[u]:\n        if v not in used and backtrack(v):\n            return True\n    path.pop(); used.discard(u)\n    return False\nprint(backtrack(0), path)\n` },
  },
  {
    slug: "connected-components", category: "graphs", title: "Connected Components",
    summary: "Count or label the maximal connected pieces of an undirected graph with a traversal from each unvisited vertex — or with union-find.",
    keyIdea: "Every time you have to *start* a fresh traversal, you've found a new island; the number of starts is the number of components.",
    howItWorks: {
      intro: "Flood-fill each unvisited seed:",
      steps: [
        "Keep a global **visited** set and a component counter at 0.",
        "Scan vertices; when you hit an **unvisited** one, increment the counter — it's a new component.",
        "Run a DFS/BFS from it, marking the **entire** reachable region visited (and optionally labelling it with the component id).",
        "Continue scanning. The number of traversals you *started* equals the number of components.",
      ],
    },
    sections: [
      { heading: "Flood from each seed", body: "Start a traversal (DFS or BFS) from any unvisited vertex to mark its whole component, then repeat from the next unvisited vertex. The number of traversals you initiate is the component count; labelling each region lets you answer 'are `u` and `v` connected?' in `O(1)` afterward." },
      { heading: "Or union-find", body: "Alternatively, `union` every edge's endpoints; the number of distinct roots at the end is the component count. Union-find shines when edges **arrive over time** (dynamic/streaming connectivity), where re-running a full traversal after each edge would be wasteful. For **directed** graphs, 'connected' splits into weakly- and strongly-connected (Tarjan/Kosaraju)." },
    ],
    complexity: [["Time (DFS/BFS)", "O(V + E)"], ["Time (union-find)", "O(E · α(n))"], ["Space", "O(V)"]],
    pitfalls: [
      "Isolated vertices (no edges) are still their own component — don't skip them.",
      "For **directed** graphs, use SCC algorithms, not plain flood fill.",
      "Deep components can overflow recursive DFS — use BFS or an explicit stack.",
    ],
    whenToUse: {
      use: ["Counting islands / regions", "Clustering by connectivity", "Preprocessing many connectivity queries", "Image region labelling"],
      avoid: ["Directed strong connectivity (use **Tarjan/Kosaraju**)"],
    },
    variants: [
      { name: "Strongly-connected components", note: "Directed version — Tarjan's or Kosaraju's algorithm." },
      { name: "Number of islands", note: "Connected components on a grid (4- or 8-connectivity)." },
    ],
    realWorld: ["'Number of islands' grid problems", "Social network clusters", "Image segmentation / blob labelling", "Network reliability"],
    references: [{ book: "CLRS", where: "§20.3 (components) & §20.5 (SCCs)" }, { book: "Sedgewick & Wayne", where: "§4.1, connected components" }],
    demo: { language: "python", code: `graph = {0: [1], 1: [0], 2: [3], 3: [2], 4: []}\nvisited = set()\ndef dfs(u):\n    visited.add(u)\n    for v in graph[u]:\n        if v not in visited:\n            dfs(v)\ncomponents = 0\nfor u in graph:\n    if u not in visited:\n        components += 1\n        dfs(u)\nprint(components)\n` },
  },
];
