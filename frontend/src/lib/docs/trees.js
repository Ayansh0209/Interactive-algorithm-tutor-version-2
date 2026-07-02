// Docs topics: trees.

export const treeTopics = [
  {
    slug: "binary-tree", category: "trees", title: "Binary Tree & Traversals", premade: "binary-tree-traversal",
    summary: "A tree where each node has up to two children. Its four traversals — inorder, preorder, postorder, level-order — underpin most tree algorithms.",
    sections: [
      { heading: "Structure", body: "Each node has a value plus left and right child pointers. The top is the root; childless nodes are leaves; height is the longest root-to-leaf path." },
      { heading: "Traversals", body: "Inorder (left, node, right), preorder (node, left, right), postorder (left, right, node), and level-order (BFS by depth). Inorder on a BST yields sorted values." },
    ],
    complexity: [["Traversal", "O(n)"], ["Search (balanced)", "O(log n)"], ["Space", "O(h)"]],
    demo: { language: "python", code: `class T:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n\nroot = T(5)\nroot.left = T(3); root.right = T(8)\nroot.left.left = T(1); root.left.right = T(4)\n\nout = []\ndef inorder(node):\n    if not node:\n        return\n    inorder(node.left)\n    out.append(node.val)\n    inorder(node.right)\ninorder(root)\nprint(out)\n` },
  },
  {
    slug: "bst", category: "trees", title: "Binary Search Tree", premade: "bst",
    summary: "A binary tree that keeps smaller values left and larger values right, giving O(h) search, insert, and delete.",
    sections: [
      { heading: "Ordering invariant", body: "For every node, all left-subtree values are smaller and all right-subtree values are larger. Searching follows one root-to-leaf path, comparing as it goes." },
      { heading: "Balance matters", body: "On a balanced tree h = O(log n); on a degenerate (sorted-insert) tree h = O(n). Self-balancing variants (AVL, red-black) guarantee the good case." },
    ],
    complexity: [["Search/Insert/Delete (balanced)", "O(log n)"], ["Worst case", "O(n)"]],
    demo: { language: "python", code: `class Node:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n\ndef insert(root, v):\n    if not root:\n        return Node(v)\n    if v < root.val:\n        root.left = insert(root.left, v)\n    else:\n        root.right = insert(root.right, v)\n    return root\n\nroot = None\nfor v in [5, 3, 8, 1, 4, 7]:\n    root = insert(root, v)\n` },
  },
  {
    slug: "avl-tree", category: "trees", title: "AVL Tree", premade: "avl",
    summary: "A self-balancing BST that rotates after inserts/deletes to keep every node's subtree heights within 1, guaranteeing O(log n).",
    sections: [
      { heading: "Balance factor", body: "Each node tracks the height difference of its subtrees. If it exceeds ±1, a rotation (single or double) restores balance — four cases: LL, RR, LR, RL." },
      { heading: "Strictly balanced", body: "AVL trees are more rigidly balanced than red-black trees, giving faster lookups but doing more rotations on update. The visualizer reports each rotation." },
    ],
    complexity: [["Search/Insert/Delete", "O(log n)"], ["Rotations per op", "O(1)"]],
    demo: { language: "python", code: `# balance factor drives the rotations\nclass Node:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n        self.height = 1\n\ndef height(n):\n    return n.height if n else 0\n\nroot = Node(2)\nroot.left = Node(1)\nroot.right = Node(3)\nbf = height(root.left) - height(root.right)\nprint(bf)\n` },
  },
  {
    slug: "red-black-tree", category: "trees", title: "Red-Black Tree", premade: "red-black-tree",
    summary: "A self-balancing BST that colors nodes red or black and enforces rules keeping the longest path at most twice the shortest — O(log n).",
    sections: [
      { heading: "The color rules", body: "The root is black, red nodes have black children, and every root-to-leaf path has the same number of black nodes. Inserts recolor and rotate to restore these." },
      { heading: "Why it's popular", body: "Red-black trees rebalance with fewer rotations than AVL, making them great for write-heavy workloads — they back many standard library maps and sets." },
    ],
    complexity: [["Search/Insert/Delete", "O(log n)"], ["Rotations per insert", "≤ 2"]],
    demo: { language: "python", code: `# red-black nodes carry a color; the live visualizer applies the fixups\nclass Node:\n    def __init__(self, v, color="red"):\n        self.val = v\n        self.color = color\n        self.left = None\n        self.right = None\n\nroot = Node(10, "black")\nroot.left = Node(5)\nroot.right = Node(15)\nprint(root.color, root.left.color)\n` },
  },
  {
    slug: "heap", category: "trees", title: "Heap & Heapify", premade: "heapify",
    summary: "A complete binary tree where every parent beats its children (min or max), stored compactly in an array. Build-heap is O(n).",
    sections: [
      { heading: "Array-backed tree", body: "Node i's children are at 2i+1 and 2i+2, so no pointers are needed. The root is the min (or max), available in O(1)." },
      { heading: "Heapify", body: "Building a heap by sifting down from the last parent up to the root is O(n) — better than inserting n times (O(n log n)). Heap sort and priority queues rely on it." },
    ],
    complexity: [["Insert/Extract", "O(log n)"], ["Peek", "O(1)"], ["Build-heap", "O(n)"]],
    demo: { language: "python", code: `import heapq\na = [5, 1, 8, 3, 2, 7]\nheapq.heapify(a)   # O(n) build\nprint(a[0])         # min at the root\nsmallest = heapq.heappop(a)\nprint(smallest)\n` },
  },
  {
    slug: "trie", category: "trees", title: "Trie (Prefix Tree)", premade: "trie",
    summary: "A tree that stores strings by shared prefixes, with one edge per character — fast prefix lookups for autocomplete and dictionaries.",
    sections: [
      { heading: "One character per edge", body: "Words sharing a prefix share a path from the root. A node flag marks where a complete word ends. Lookup and insert cost O(L) for a length-L word, independent of how many words are stored." },
      { heading: "Prefix power", body: "Finding all words with a given prefix is just walking to that prefix node and enumerating below it — the core of autocomplete." },
    ],
    complexity: [["Insert", "O(L)"], ["Search", "O(L)"], ["Prefix query", "O(L)"]],
    demo: { language: "python", code: `trie = {}\nfor word in ["cat", "car", "dog"]:\n    node = trie\n    for ch in word:\n        node = node.setdefault(ch, {})\n    node["$"] = True\n\n# search "car"\nnode = trie\nfound = True\nfor ch in "car":\n    if ch not in node:\n        found = False\n        break\n    node = node[ch]\nprint(found and "$" in node)\n` },
  },
  {
    slug: "segment-tree", category: "trees", title: "Segment Tree",
    summary: "A tree over array ranges that answers range queries (sum, min, max) and point updates in O(log n).",
    sections: [
      { heading: "Divide the range", body: "Each node covers a segment of the array; its children split it in half. A query combines O(log n) node values; an update touches one root-to-leaf path." },
      { heading: "When to reach for it", body: "Use it when you need many range queries interleaved with updates — a prefix-sum array is faster for queries alone but can't handle updates cheaply." },
    ],
    complexity: [["Build", "O(n)"], ["Range query", "O(log n)"], ["Update", "O(log n)"]],
    demo: { language: "python", code: `a = [2, 1, 5, 3]\nn = len(a)\ntree = [0] * (2 * n)\nfor i in range(n):\n    tree[n + i] = a[i]\nfor i in range(n - 1, 0, -1):\n    tree[i] = tree[2 * i] + tree[2 * i + 1]\n# tree[1] is the total sum\nprint(tree[1])\n` },
  },
];
