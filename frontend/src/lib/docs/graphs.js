// Docs topics: graphs.

export const graphTopics = [
  {
    slug: "graph-representations", category: "graphs", title: "Graph Representations", premade: "graph-representations",
    summary: "A graph is vertices plus edges. The two common storage forms — adjacency list and adjacency matrix — trade space for query speed.",
    sections: [
      { heading: "List vs matrix", body: "An adjacency list stores, per vertex, its neighbours — compact (O(V+E)) and great for sparse graphs. An adjacency matrix is a V×V table — O(1) edge lookup but O(V²) space." },
      { heading: "Pick by density", body: "Sparse graphs (few edges) favour lists; dense graphs or constant-time edge checks favour the matrix. The interactive shows both for the same graph." },
    ],
    complexity: [["List space", "O(V+E)"], ["Matrix space", "O(V²)"], ["Edge lookup (matrix)", "O(1)"]],
    demo: { language: "python", code: `# adjacency list\nadj = {0: [1, 2], 1: [2], 2: [0]}\n# adjacency matrix for the same graph\nn = 3\nmat = [[0] * n for _ in range(n)]\nfor u in adj:\n    for v in adj[u]:\n        mat[u][v] = 1\nprint(mat)\n` },
  },
  {
    slug: "graph-bfs", category: "graphs", title: "Breadth-First Search", premade: "bfs",
    summary: "Explore a graph level by level using a queue, finding shortest paths (in edges) on unweighted graphs.",
    sections: [
      { heading: "Level by level", body: "BFS starts at a source, visits all neighbours, then their neighbours, and so on. A queue holds the frontier; a visited set prevents revisiting." },
      { heading: "Shortest paths", body: "Because BFS expands by distance, the first time it reaches a node is via a fewest-edges path. For weighted edges, use Dijkstra instead." },
    ],
    complexity: [["Time", "O(V+E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `from collections import deque\ngraph = {0: [1, 2], 1: [3, 4], 2: [4], 3: [], 4: []}\nvisited = set()\nq = deque([0])\norder = []\nwhile q:\n    node = q.popleft()\n    if node in visited:\n        continue\n    visited.add(node)\n    order.append(node)\n    for nb in graph[node]:\n        if nb not in visited:\n            q.append(nb)\nprint(order)\n` },
  },
  {
    slug: "graph-dfs", category: "graphs", title: "Depth-First Search", premade: "dfs",
    summary: "Dive as deep as possible along each branch before backtracking, using a stack (or recursion). The basis for many graph algorithms.",
    sections: [
      { heading: "Go deep, then back up", body: "DFS follows one path until it dead-ends, then backtracks to the last branch with unexplored neighbours. A visited set avoids cycles." },
      { heading: "What it powers", body: "Topological sort, cycle detection, connected components, and finding bridges/articulation points are all DFS with a little extra bookkeeping." },
    ],
    complexity: [["Time", "O(V+E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `graph = {0: [1, 2], 1: [3, 4], 2: [4], 3: [], 4: []}\nvisited = set()\norder = []\ndef dfs(node):\n    if node in visited:\n        return\n    visited.add(node)\n    order.append(node)\n    for nb in graph[node]:\n        dfs(nb)\ndfs(0)\nprint(order)\n` },
  },
  {
    slug: "dijkstra", category: "graphs", title: "Dijkstra's Shortest Path", premade: "dijkstra",
    summary: "Find shortest paths from a source in a weighted graph with non-negative edges by greedily settling the closest unsettled node.",
    sections: [
      { heading: "Greedy with a heap", body: "Repeatedly pop the unsettled node with the smallest tentative distance and relax its edges. A priority queue makes each pop O(log V)." },
      { heading: "Non-negative only", body: "Dijkstra assumes no negative edges — once a node is settled, its distance is final. With negative edges, use Bellman-Ford." },
    ],
    complexity: [["Time", "O((V+E) log V)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `import heapq\ngraph = {0: [(1, 4), (2, 1)], 1: [(3, 1)], 2: [(1, 2), (3, 5)], 3: []}\ndist = {0: 0}\npq = [(0, 0)]\nwhile pq:\n    d, u = heapq.heappop(pq)\n    if d > dist.get(u, 1e9):\n        continue\n    for v, w in graph[u]:\n        if d + w < dist.get(v, 1e9):\n            dist[v] = d + w\n            heapq.heappush(pq, (dist[v], v))\nprint(dist)\n` },
  },
  {
    slug: "bellman-ford", category: "graphs", title: "Bellman-Ford",
    summary: "Shortest paths from a source that tolerates negative edges, by relaxing all edges V−1 times. Detects negative cycles.",
    sections: [
      { heading: "Relax everything, repeatedly", body: "Each pass over all edges lets shortest paths grow by one more edge. After V−1 passes every shortest path (at most V−1 edges) is found." },
      { heading: "Negative cycles", body: "If a V-th pass still improves a distance, a negative cycle is reachable — Bellman-Ford reports it, which Dijkstra cannot." },
    ],
    complexity: [["Time", "O(V·E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `edges = [(0, 1, 4), (0, 2, 5), (1, 2, -3), (2, 3, 4)]\nV = 4\ndist = [float("inf")] * V\ndist[0] = 0\nfor _ in range(V - 1):\n    for u, v, w in edges:\n        if dist[u] + w < dist[v]:\n            dist[v] = dist[u] + w\nprint(dist)\n` },
  },
  {
    slug: "floyd-warshall", category: "graphs", title: "Floyd-Warshall",
    summary: "All-pairs shortest paths via dynamic programming: try every vertex as an intermediate stop. Simple O(V³).",
    sections: [
      { heading: "Intermediate vertices", body: "dist[i][j] improves by routing through each vertex k in turn: dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j]). Three nested loops." },
      { heading: "When to use", body: "Best for small, dense graphs where you need every pair's distance. For a single source, Dijkstra/Bellman-Ford is cheaper." },
    ],
    complexity: [["Time", "O(V³)"], ["Space", "O(V²)"]],
    demo: { language: "python", code: `INF = float("inf")\nd = [[0, 3, INF, 7],\n     [8, 0, 2, INF],\n     [5, INF, 0, 1],\n     [2, INF, INF, 0]]\nn = 4\nfor k in range(n):\n    for i in range(n):\n        for j in range(n):\n            if d[i][k] + d[k][j] < d[i][j]:\n                d[i][j] = d[i][k] + d[k][j]\nprint(d[0])\n` },
  },
  {
    slug: "prim-mst", category: "graphs", title: "Prim's MST", premade: "prim-mst",
    summary: "Build a minimum spanning tree by growing it from a start node, always adding the cheapest edge to a vertex not yet in the tree.",
    sections: [
      { heading: "Grow the tree", body: "Maintain the set of in-tree vertices and repeatedly add the lowest-weight edge crossing the boundary. A priority queue picks that edge in O(log V)." },
      { heading: "MST basics", body: "A spanning tree connects all vertices with V−1 edges; the minimum one has the least total weight. Prim and Kruskal both find it." },
    ],
    complexity: [["Time", "O(E log V)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `import heapq\ngraph = {0: [(1, 4), (2, 3)], 1: [(0, 4), (2, 1)], 2: [(0, 3), (1, 1)]}\nin_tree = set()\npq = [(0, 0)]\ntotal = 0\nwhile pq:\n    w, u = heapq.heappop(pq)\n    if u in in_tree:\n        continue\n    in_tree.add(u); total += w\n    for v, wt in graph[u]:\n        if v not in in_tree:\n            heapq.heappush(pq, (wt, v))\nprint(total)\n` },
  },
  {
    slug: "kruskal-mst", category: "graphs", title: "Kruskal's MST", premade: "kruskal-mst",
    summary: "Build a minimum spanning tree by adding edges in increasing weight order, skipping any that would form a cycle (checked with union-find).",
    sections: [
      { heading: "Sort then add", body: "Sort all edges by weight. Add each edge unless its endpoints are already connected — union-find answers that in near-constant time." },
      { heading: "List of edges", body: "Kruskal works directly on the edge list, making it natural for sparse graphs and a great showcase for the disjoint-set structure." },
    ],
    complexity: [["Time", "O(E log E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `edges = [(1, 0, 1), (3, 0, 2), (1, 1, 2)]  # (weight, u, v)\nedges.sort()\nparent = list(range(3))\ndef find(x):\n    while parent[x] != x:\n        x = parent[x]\n    return x\ntotal = 0\nfor w, u, v in edges:\n    ru, rv = find(u), find(v)\n    if ru != rv:\n        parent[ru] = rv\n        total += w\nprint(total)\n` },
  },
  {
    slug: "topological-sort", category: "graphs", title: "Topological Sort", premade: "topo-sort",
    summary: "Order the vertices of a DAG so every edge points forward — the valid order to run tasks with dependencies.",
    sections: [
      { heading: "Kahn's algorithm", body: "Repeatedly output a vertex with no remaining incoming edges, then remove it (decrementing its neighbours' in-degrees). If you can't empty the graph, it has a cycle." },
      { heading: "Uses", body: "Build systems, course prerequisites, and any scheduling where some items must come before others." },
    ],
    complexity: [["Time", "O(V+E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `from collections import deque\ngraph = {0: [2, 3], 1: [3], 2: [4], 3: [4], 4: []}\nindeg = {u: 0 for u in graph}\nfor u in graph:\n    for v in graph[u]:\n        indeg[v] += 1\nq = deque([u for u in graph if indeg[u] == 0])\norder = []\nwhile q:\n    u = q.popleft()\n    order.append(u)\n    for v in graph[u]:\n        indeg[v] -= 1\n        if indeg[v] == 0:\n            q.append(v)\nprint(order)\n` },
  },
  {
    slug: "union-find", category: "graphs", title: "Union-Find (DSU)", premade: "union-find",
    summary: "Track a partition of elements into disjoint sets with near-constant union and find, using union by rank and path compression.",
    sections: [
      { heading: "Two operations", body: "find(x) returns the representative of x's set; union(a, b) merges two sets. Used for connectivity, Kruskal's MST, and cycle detection." },
      { heading: "The optimizations", body: "Union by rank keeps trees shallow; path compression flattens them on each find. Together they give almost O(1) amortized — the inverse-Ackermann function." },
    ],
    complexity: [["Find/Union (amortized)", "O(α(n))"], ["Space", "O(n)"]],
    demo: { language: "python", code: `parent = list(range(6))\ndef find(x):\n    while parent[x] != x:\n        parent[x] = parent[parent[x]]  # path compression\n        x = parent[x]\n    return x\ndef union(a, b):\n    parent[find(a)] = find(b)\nunion(0, 1); union(1, 2); union(3, 4)\nprint(find(0) == find(2), find(0) == find(3))\n` },
  },
  {
    slug: "cycle-detection", category: "graphs", title: "Cycle Detection",
    summary: "Detect whether a graph contains a cycle — via DFS colors in directed graphs or union-find in undirected ones.",
    sections: [
      { heading: "Directed: DFS colors", body: "Mark nodes white/gray/black. Reaching a gray (in-progress) node means a back edge — a cycle." },
      { heading: "Undirected: union-find", body: "Process each edge; if both endpoints already share a set, that edge closes a cycle. This is exactly Kruskal's cycle check." },
    ],
    complexity: [["Time", "O(V+E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `graph = {0: [1], 1: [2], 2: [0]}  # has a cycle\ncolor = {u: 0 for u in graph}  # 0=white 1=gray 2=black\nhas_cycle = False\ndef dfs(u):\n    global has_cycle\n    color[u] = 1\n    for v in graph[u]:\n        if color[v] == 1:\n            has_cycle = True\n        elif color[v] == 0:\n            dfs(v)\n    color[u] = 2\nfor u in graph:\n    if color[u] == 0:\n        dfs(u)\nprint(has_cycle)\n` },
  },
  {
    slug: "hamiltonian-path", category: "graphs", title: "Hamiltonian Path", premade: "hamiltonian-path",
    summary: "Find a path that visits every vertex exactly once. There's no known efficient algorithm — backtracking explores the possibilities.",
    sections: [
      { heading: "NP-hard", body: "Unlike Euler paths (every edge once), Hamiltonian paths have no polynomial algorithm. We search with backtracking: extend the path, and undo when stuck." },
      { heading: "Pruning", body: "Only move to unvisited neighbours; abandon a branch the moment no extension is possible. Good pruning makes small graphs tractable." },
    ],
    complexity: [["Time", "O(n!)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `graph = {0: [1, 2], 1: [0, 2, 3], 2: [0, 1, 3], 3: [1, 2]}\nn = 4\npath = []\nused = set()\ndef backtrack(u):\n    path.append(u); used.add(u)\n    if len(path) == n:\n        return True\n    for v in graph[u]:\n        if v not in used and backtrack(v):\n            return True\n    path.pop(); used.discard(u)\n    return False\nprint(backtrack(0), path)\n` },
  },
  {
    slug: "connected-components", category: "graphs", title: "Connected Components",
    summary: "Count or label the maximal connected pieces of an undirected graph with a DFS/BFS from each unvisited vertex.",
    sections: [
      { heading: "Flood from each seed", body: "Start a traversal from any unvisited vertex to mark its whole component, then repeat. The number of traversals you start equals the number of components." },
      { heading: "Or union-find", body: "Union every edge's endpoints; the number of distinct roots at the end is the component count." },
    ],
    complexity: [["Time", "O(V+E)"], ["Space", "O(V)"]],
    demo: { language: "python", code: `graph = {0: [1], 1: [0], 2: [3], 3: [2], 4: []}\nvisited = set()\ndef dfs(u):\n    visited.add(u)\n    for v in graph[u]:\n        if v not in visited:\n            dfs(v)\ncomponents = 0\nfor u in graph:\n    if u not in visited:\n        components += 1\n        dfs(u)\nprint(components)\n` },
  },
];
