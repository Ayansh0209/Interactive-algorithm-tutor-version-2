// Renderer registry: data-structure type -> React component.
//
// THIS is the extension point. To support a new structure end-to-end you add a
// detector in the Python engine (emit a new type tag) and one entry here. The
// rest of the app -- variables panel, timeline, AI -- needs no changes.

import ArrayView from "./ArrayView";
import MatrixView from "./MatrixView";
import LinkedListView from "./LinkedListView";
import TreeView from "./TreeView";
import StackQueueView from "./StackQueueView";
import GraphView from "./GraphView";
import PrimitiveView from "./PrimitiveView";
import ObjectView from "./ObjectView";
import TrieView from "./TrieView";

export const RENDERERS = {
  array: ArrayView,
  dp_array: ArrayView,
  dsu: ArrayView,
  set: ArrayView,
  matrix: MatrixView,
  dp_grid: MatrixView,
  linked_list: LinkedListView,
  doubly_linked_list: LinkedListView,
  binary_tree: TreeView,
  avl_tree: TreeView,
  red_black_tree: TreeView,
  segment_tree: TreeView,
  nary_tree: TreeView,
  trie: TrieView,
  stack: StackQueueView,
  queue: StackQueueView,
  deque: StackQueueView,
  heap: StackQueueView,
  graph_adjacency_list: GraphView,
  graph_weighted: GraphView,
  primitive: PrimitiveView,
  object: ObjectView,
  constructing: ObjectView,
  unknown: PrimitiveView,
};

export function pickRenderer(vtype) {
  return RENDERERS[vtype] || PrimitiveView;
}

// A friendly label + color per type for the variable header chip.
export const TYPE_META = {
  array: ["array", "indigo"],
  matrix: ["matrix", "indigo"],
  dp_grid: ["dp grid", "green"],
  dp_array: ["dp", "green"],
  linked_list: ["linked list", "indigo"],
  doubly_linked_list: ["doubly linked", "indigo"],
  binary_tree: ["binary tree", "indigo"],
  avl_tree: ["AVL tree", "green"],
  red_black_tree: ["red-black tree", "rose"],
  segment_tree: ["segment tree", "amber"],
  nary_tree: ["n-ary tree", "indigo"],
  trie: ["trie", "green"],
  stack: ["stack", "amber"],
  queue: ["queue", "amber"],
  deque: ["deque", "amber"],
  heap: ["heap", "amber"],
  graph_adjacency_list: ["graph", "green"],
  graph_weighted: ["weighted graph", "green"],
  dsu: ["union-find", "amber"],
  set: ["set", "slate"],
  primitive: ["value", "slate"],
  object: ["object", "slate"],
};
