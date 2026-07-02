// Premade visualizer registry: id -> lazily-loaded component. Adding a premade
// visualizer to a docs article is a single entry here plus `premade: "<id>"`
// on the topic in docsContent.js. Lazy imports keep these out of the main
// bundle until an article that uses them is opened.
//
// `bind` lets one parameterized component (e.g. SortingPremade) back many ids by
// pre-applying props, still lazily and code-split.

import { lazy, createElement } from "react";

// One parameterized component can back many ids: bind pre-applies props. Using
// createElement (not JSX) keeps the lint clean and avoids a wrapper component.
const bind = (importer, props) =>
  lazy(() => importer().then((mod) => ({ default: () => createElement(mod.default, props) })));

export const PREMADE = {
  // Arrays & search
  "array-ops": lazy(() => import("./ArrayPremade")),
  "binary-search": lazy(() => import("./BinarySearchPremade")),

  // Linear
  "linked-list-singly": lazy(() => import("./LinkedListPremade")),
  "linked-list-doubly": bind(() => import("./LinkedListPremade"), { variant: "doubly" }),
  "linked-list-circular": bind(() => import("./LinkedListPremade"), { variant: "circular" }),
  stack: lazy(() => import("./StackPremade")),
  queue: bind(() => import("./QueuePremade"), { variant: "queue" }),
  deque: bind(() => import("./QueuePremade"), { variant: "deque" }),
  "circular-queue": lazy(() => import("./CircularQueuePremade")),
  "priority-queue": lazy(() => import("./HeapPremade")),
  heapify: lazy(() => import("./HeapPremade")),
  "hash-map": lazy(() => import("./HashMapPremade")),

  // Sorting (one engine, many algorithms)
  "sort-bubble": bind(() => import("./SortingPremade"), { algo: "bubble" }),
  "sort-selection": bind(() => import("./SortingPremade"), { algo: "selection" }),
  "sort-insertion": bind(() => import("./SortingPremade"), { algo: "insertion" }),
  "sort-merge": bind(() => import("./SortingPremade"), { algo: "merge" }),
  "sort-quick": bind(() => import("./SortingPremade"), { algo: "quick" }),
  "sort-heap": bind(() => import("./SortingPremade"), { algo: "heap" }),

  // Trees
  bst: lazy(() => import("./BSTPremade")),
  "binary-tree-traversal": lazy(() => import("./BSTPremade")),
  avl: lazy(() => import("./AVLPremade")),
  "red-black-tree": lazy(() => import("./RBTPremade")),
  trie: lazy(() => import("./TriePremade")),

  // Recursion & backtracking
  hanoi: lazy(() => import("./HanoiPremade")),
  "n-queens": lazy(() => import("./NQueensPremade")),
  "rat-maze": lazy(() => import("./RatMazePremade")),

  // Greedy
  "activity-selection": lazy(() => import("./ActivitySelectionPremade")),
  "fractional-knapsack": lazy(() => import("./FractionalKnapsackPremade")),
  huffman: lazy(() => import("./HuffmanPremade")),

  // Dynamic programming
  "dp-knapsack": bind(() => import("./DPPremade"), { algo: "knapsack" }),
  "dp-lcs": bind(() => import("./DPPremade"), { algo: "lcs" }),
  "dp-coin-change": bind(() => import("./DPPremade"), { algo: "coins" }),
  "dp-unique-paths": bind(() => import("./DPPremade"), { algo: "paths" }),

  // Graphs
  "graph-representations": lazy(() => import("./GraphRepresentationPremade")),
  bfs: lazy(() => import("./BFSPremade")),
  "union-find": lazy(() => import("./UnionFindPremade")),
  dfs: bind(() => import("./GraphAlgoPremade"), { algo: "dfs" }),
  dijkstra: bind(() => import("./GraphAlgoPremade"), { algo: "dijkstra" }),
  "prim-mst": bind(() => import("./GraphAlgoPremade"), { algo: "prim" }),
  "kruskal-mst": bind(() => import("./GraphAlgoPremade"), { algo: "kruskal" }),
  "topo-sort": bind(() => import("./GraphAlgoPremade"), { algo: "topo" }),
  "hamiltonian-path": bind(() => import("./GraphAlgoPremade"), { algo: "hamiltonian" }),
};

export function getPremade(id) {
  return (id && PREMADE[id]) || null;
}
