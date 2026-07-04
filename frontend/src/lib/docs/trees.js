// Docs topics: trees. Rich fields render via DocArticle.

export const treeTopics = [
  {
    slug: "binary-tree", category: "trees", title: "Binary Tree & Traversals", premade: "binary-tree-traversal",
    summary: "A tree where each node has up to two children. Its four traversals — inorder, preorder, postorder, level-order — are the vocabulary of almost every tree algorithm you'll ever write.",
    keyIdea: "A tree is recursion made visible: every node is itself the root of a smaller tree, so nearly every tree algorithm is 'do something with the node, then recurse on the children.'",
    howItWorks: {
      intro: "The three depth-first traversals differ only in **when** you visit the node relative to its children:",
      steps: [
        "**Preorder** (node, left, right): visit the node *before* descending — used to copy or serialize a tree.",
        "**Inorder** (left, node, right): visit the node *between* subtrees — on a BST this yields values in **sorted** order.",
        "**Postorder** (left, right, node): visit the node *after* its children — used to delete a tree or evaluate an expression tree.",
        "**Level-order** (BFS): visit depth by depth using a queue — used for shortest-path-by-edges and 'print by rows'.",
      ],
    },
    sections: [
      { heading: "Structure & vocabulary", body: "Each node has a value plus `left` and `right` child pointers. The top is the **root**; childless nodes are **leaves**; a node's **height** is the longest downward path to a leaf, and its **depth** is the distance from the root. A tree with `n` nodes has exactly `n − 1` edges." },
      { heading: "The four traversals", body: "Inorder, preorder, and postorder are the same recursion with the 'visit' placed before, between, or after the two child calls. Level-order is different — it uses a **queue** to sweep breadth-first. Inorder on a **BST** yields sorted values, which is a common sanity check." },
      { heading: "Iterative and Morris", body: "Recursion uses `O(h)` stack. You can traverse iteratively with an explicit stack, or with **Morris traversal** — temporarily rewiring leaf pointers — to get inorder in `O(1)` extra space." },
    ],
    complexity: [["Any traversal", "O(n)", "visits each node once"], ["Search (balanced)", "O(log n)"], ["Search (skewed)", "O(n)"], ["Space", "O(h)", "recursion / stack"]],
    pitfalls: [
      "Base case: a `None` node must return immediately, or you'll dereference null.",
      "Confusing **height** (down to a leaf) with **depth** (down from the root).",
      "Level-order needs a **queue**, not recursion — a common mix-up.",
    ],
    whenToUse: {
      use: ["Hierarchical data (DOM, filesystem, org charts)", "Expression / syntax trees", "As the basis for BSTs, heaps, tries"],
      avoid: ["Flat data with no hierarchy (an array or hash map is simpler)"],
    },
    variants: [
      { name: "N-ary tree", note: "Each node has a list of children (filesystems, DOM)." },
      { name: "Threaded tree", note: "Null pointers reused to point at inorder successors — O(1) traversal." },
    ],
    realWorld: ["Parse / syntax trees in compilers", "The DOM", "Filesystems", "Decision trees in ML", "Huffman coding trees"],
    references: [{ book: "CLRS", where: "§10.4 & Ch. 12, Binary Search Trees" }, { book: "Sedgewick & Wayne, Algorithms", where: "§3.2, Binary Search Trees" }],
    demo: { language: "python", code: `class T:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n\nroot = T(5)\nroot.left = T(3); root.right = T(8)\nroot.left.left = T(1); root.left.right = T(4)\n\nout = []\ndef inorder(node):\n    if not node:\n        return\n    inorder(node.left)\n    out.append(node.val)\n    inorder(node.right)\ninorder(root)\nprint(out)\n` },
  },
  {
    slug: "bst", category: "trees", title: "Binary Search Tree", premade: "bst",
    summary: "A binary tree that keeps smaller values left and larger values right, so search, insert, and delete each follow one root-to-leaf path in O(h).",
    keyIdea: "The ordering invariant turns 'search' into 'go left or right?' at every node — binary search, but on a tree you can also cheaply insert into.",
    howItWorks: {
      intro: "Searching for a key mirrors binary search:",
      steps: [
        "Start at the root. If it equals the key, you're done.",
        "If the key is **smaller**, the invariant guarantees it can only be in the **left** subtree — go left.",
        "If it's **larger**, go **right**.",
        "Repeat until you find it or fall off the tree (`None`). You've walked one root-to-leaf path — `O(h)`.",
        "Insert is the same walk, then attach the new node where the search fell off.",
      ],
    },
    sections: [
      { heading: "Ordering invariant", body: "For **every** node, all left-subtree values are smaller and all right-subtree values are larger. That invariant, held recursively, is what lets a search discard an entire subtree at each step. Deletion has three cases (leaf, one child, two children — replace with the inorder successor)." },
      { heading: "Balance is everything", body: "On a balanced tree `h = O(log n)`; but inserting **already-sorted** data builds a degenerate tree that's really a linked list, so `h = O(n)`. This fragility is exactly why self-balancing variants (AVL, red-black) exist — they guarantee `O(log n)` regardless of insertion order." },
    ],
    complexity: [["Search / insert / delete (balanced)", "O(log n)"], ["Same, worst case (skewed)", "O(n)"], ["Inorder traversal", "O(n)", "yields sorted order"]],
    pitfalls: [
      "**Sorted insertion** degrades a plain BST to a linked list (`O(n)`) — randomize or use a balanced tree.",
      "Deleting a two-child node: replace it with its inorder successor (smallest in the right subtree), not just any child.",
      "Duplicate keys need a consistent rule (always-right, or a count) or the invariant blurs.",
    ],
    whenToUse: {
      use: ["Ordered data with search + insert/delete", "Range queries and 'nearest smaller/larger'", "In-order iteration"],
      avoid: ["Pure key–value lookup with no ordering needs (a **hash map** is O(1) average)", "You can't guarantee balance and can't use a balanced variant"],
    },
    variants: [
      { name: "AVL / Red-Black", note: "Self-balancing — guarantee O(log n) height." },
      { name: "Treap / Skip list", note: "Randomized balance without rotations bookkeeping." },
      { name: "B-tree", note: "High-fanout BST for disk/DB — shallow, cache-friendly." },
    ],
    realWorld: ["`std::map` / `TreeMap` (red-black under the hood)", "Database & filesystem indexes (B-trees)", "In-memory ordered sets", "Interval scheduling"],
    references: [{ book: "CLRS", where: "Ch. 12, Binary Search Trees" }, { book: "Sedgewick & Wayne", where: "§3.2–3.3" }, { book: "Skiena", where: "§3.4, Binary Search Trees" }],
    demo: { language: "python", code: `class Node:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n\ndef insert(root, v):\n    if not root:\n        return Node(v)\n    if v < root.val:\n        root.left = insert(root.left, v)\n    else:\n        root.right = insert(root.right, v)\n    return root\n\nroot = None\nfor v in [5, 3, 8, 1, 4, 7]:\n    root = insert(root, v)\n` },
  },
  {
    slug: "avl-tree", category: "trees", title: "AVL Tree", premade: "avl",
    summary: "A self-balancing BST that rotates after inserts and deletes to keep every node's two subtree heights within 1 — guaranteeing O(log n), always.",
    keyIdea: "Store each node's balance and, the moment it tips past ±1, perform a local **rotation** that restores order without violating the BST property.",
    howItWorks: {
      intro: "After inserting into a BST, walk back up fixing balance:",
      steps: [
        "Update the **height** of each node on the path back to the root.",
        "Compute its **balance factor** = height(left) − height(right).",
        "If the factor is within ±1, it's fine — keep going up.",
        "If it hits +2 or −2, apply the matching **rotation** — LL, RR, LR, or RL — to rebalance that subtree in O(1).",
        "One rotation (or double rotation) after an insert is enough to restore the whole tree.",
      ],
    },
    sections: [
      { heading: "Balance factor & rotations", body: "Each node tracks the height difference of its subtrees. When it exceeds ±1, a **rotation** restores balance. There are four cases named by where the imbalance is: **LL** and **RR** need a single rotation; **LR** and **RL** need a double. A rotation is a constant-time pointer rewire that preserves inorder (sorted) order." },
      { heading: "Strictly balanced", body: "AVL trees keep height ≤ ~1.44·log₂n — more rigidly balanced than red-black trees. That means **faster lookups** but **more rotations** on update. Choose AVL for read-heavy workloads, red-black for write-heavy ones." },
    ],
    complexity: [["Search / insert / delete", "O(log n)", "guaranteed"], ["Rotations per insert", "O(1)"], ["Rotations per delete", "O(log n)", "may cascade up"]],
    pitfalls: [
      "Forgetting to update heights before checking balance gives wrong rotations.",
      "Mixing up LR vs LL (the double-rotation cases) is the classic bug — draw it out.",
      "Deletion can require rotations all the way to the root, unlike insertion.",
    ],
    whenToUse: {
      use: ["Read-heavy ordered maps/sets", "You need the tightest possible height", "Guaranteed O(log n) worst case"],
      avoid: ["Write-heavy workloads (red-black rebalances with fewer rotations)"],
    },
    references: [{ book: "CLRS", where: "Problem 13-3, AVL trees" }, { book: "Knuth, TAOCP Vol. 3", where: "§6.2.3, Balanced Trees" }, { book: "Sedgewick & Wayne", where: "§3.3" }],
    demo: { language: "python", code: `# balance factor drives the rotations\nclass Node:\n    def __init__(self, v):\n        self.val = v\n        self.left = None\n        self.right = None\n        self.height = 1\n\ndef height(n):\n    return n.height if n else 0\n\nroot = Node(2)\nroot.left = Node(1)\nroot.right = Node(3)\nbf = height(root.left) - height(root.right)\nprint(bf)\n` },
  },
  {
    slug: "red-black-tree", category: "trees", title: "Red-Black Tree", premade: "red-black-tree",
    summary: "A self-balancing BST that colors nodes red or black and enforces coloring rules keeping the longest path at most twice the shortest — O(log n) with few rotations.",
    keyIdea: "Instead of tracking exact heights, tag nodes with a color and enforce five simple rules; the rules alone bound the height, and restoring them needs at most a couple of rotations.",
    howItWorks: {
      intro: "The invariants that keep it balanced:",
      steps: [
        "Every node is **red** or **black**; the root and all null leaves are **black**.",
        "A **red** node's children are both **black** (no two reds in a row).",
        "Every root-to-leaf path passes through the **same number of black nodes** (the 'black height').",
        "On insert, color the new node red and fix violations by **recoloring** (cheap) and, only if needed, **rotating** (≤ 2 rotations).",
        "Together these force the longest path ≤ 2× the shortest → height is `O(log n)`.",
      ],
    },
    sections: [
      { heading: "The color rules", body: "The root is black, red nodes have black children, and every root-to-leaf path has the same number of black nodes. Inserts recolor and rotate to restore these invariants. The magic: those local rules *globally* bound the height without ever measuring it." },
      { heading: "Why it's the default", body: "Red-black trees rebalance with **fewer rotations** than AVL (≤ 2 per insert, ≤ 3 per delete), making them excellent for write-heavy workloads. That's why they back many standard library maps and sets — `std::map`, Java's `TreeMap`, and the Linux kernel's scheduler and virtual-memory areas." },
    ],
    complexity: [["Search / insert / delete", "O(log n)", "guaranteed"], ["Rotations per insert", "≤ 2"], ["Rotations per delete", "≤ 3"]],
    pitfalls: [
      "The insert/delete fix-up cases are famously fiddly — most people use a library, not a hand-rolled one.",
      "Null leaves are treated as **black** sentinels; forgetting that breaks the black-height rule.",
    ],
    whenToUse: {
      use: ["General-purpose ordered map/set (the common default)", "Write-heavy ordered data", "When a library provides it"],
      avoid: ["Read-heavy workloads where AVL's tighter balance wins", "You need it disk-resident (use a B-tree)"],
    },
    variants: [
      { name: "Left-leaning red-black", note: "Sedgewick's simplified variant — far less fix-up code." },
      { name: "2-3 / 2-3-4 tree", note: "Red-black trees are a binary encoding of these B-tree cousins." },
    ],
    realWorld: ["`std::map` / `std::set`, Java `TreeMap`", "Linux CFS scheduler & VMA tree", "Ordered in-memory indexes"],
    references: [{ book: "CLRS", where: "Ch. 13, Red-Black Trees" }, { book: "Sedgewick & Wayne", where: "§3.3, Balanced Search Trees (LLRB)" }],
    demo: { language: "python", code: `# red-black nodes carry a color; the live visualizer applies the fixups\nclass Node:\n    def __init__(self, v, color="red"):\n        self.val = v\n        self.color = color\n        self.left = None\n        self.right = None\n\nroot = Node(10, "black")\nroot.left = Node(5)\nroot.right = Node(15)\nprint(root.color, root.left.color)\n` },
  },
  {
    slug: "heap", category: "trees", title: "Heap & Heapify", premade: "heapify",
    summary: "A complete binary tree where every parent beats its children (min or max), stored compactly in an array with no pointers. Building one from scratch is a surprising O(n).",
    keyIdea: "You only ever need the single best element, so keep just enough order — parent beats children — and store the complete tree in a flat array using index arithmetic.",
    howItWorks: {
      intro: "The array layout and the O(n) build:",
      steps: [
        "Store the complete tree level by level in an array; node `i`'s children are at `2i+1` and `2i+2`, its parent at `(i−1)/2`.",
        "The min (or max) is always at index `0` — peek in O(1).",
        "**Insert:** append, then **bubble up** while smaller than the parent — O(log n).",
        "**Extract:** swap root with the last element, pop, then **sift down** — O(log n).",
        "**Heapify:** sift down starting from the last parent back to the root — the leaves cost nothing, so the total is a tight **O(n)**, not O(n log n).",
      ],
    },
    sections: [
      { heading: "Array-backed tree", body: "Because the tree is **complete** (filled left to right), it needs no pointers — node `i`'s children are at `2i+1` and `2i+2`. This compactness gives great cache behaviour and makes heaps the standard priority-queue implementation." },
      { heading: "Why build-heap is O(n)", body: "Inserting `n` items one at a time is O(n log n). But building bottom-up — sifting down from the last parent up — costs less at each level because most nodes are near the leaves and sift down only a little. Summing the geometric series gives **O(n)**, a classic amortized-analysis result." },
    ],
    complexity: [["Insert / extract", "O(log n)"], ["Peek min/max", "O(1)"], ["Build-heap", "O(n)", "not O(n log n)"], ["Heapsort", "O(n log n)", "in place"]],
    pitfalls: [
      "A heap is only **partially** ordered — you can't read it out sorted without repeated extraction.",
      "Python's `heapq` is a **min**-heap; negate keys for a max-heap.",
      "Finding an arbitrary element is O(n) unless you keep a side index (needed for decrease-key in Dijkstra).",
    ],
    whenToUse: {
      use: ["Repeatedly extract min/max from a changing set", "Priority queues (Dijkstra, Prim, A*)", "Heapsort", "Top-k / running median"],
      avoid: ["You need full sorted order (just sort)", "You need fast search/update of arbitrary elements (balanced BST)"],
    },
    variants: [
      { name: "d-ary heap", note: "More children per node — shallower, faster decrease-key." },
      { name: "Binomial / Fibonacci heap", note: "Support fast merge and O(1) amortized decrease-key." },
    ],
    realWorld: ["Priority scheduling", "Dijkstra & Prim", "Huffman coding", "Event-driven simulation", "Top-k queries"],
    references: [{ book: "CLRS", where: "Ch. 6, Heapsort (build-heap analysis in §6.3)" }, { book: "Sedgewick & Wayne", where: "§2.4, Priority Queues" }],
    demo: { language: "python", code: `import heapq\na = [5, 1, 8, 3, 2, 7]\nheapq.heapify(a)   # O(n) build\nprint(a[0])         # min at the root\nsmallest = heapq.heappop(a)\nprint(smallest)\n` },
  },
  {
    slug: "trie", category: "trees", title: "Trie (Prefix Tree)", premade: "trie",
    summary: "A tree that stores strings by shared prefixes — one edge per character — giving prefix lookups that don't slow down as the dictionary grows.",
    keyIdea: "Words that start the same share the same path from the root, so a lookup costs only the length of the word, no matter how many millions of words are stored.",
    howItWorks: {
      intro: "Insert and search walk the tree one character at a time:",
      steps: [
        "Start at the root. For each character of the word, follow (or create) the child edge labelled with that character.",
        "After the last character, mark that node as the **end of a word**.",
        "**Search** follows the same path; the word exists only if the path exists *and* ends on a word-end node.",
        "**Prefix query:** walk to the prefix node, then everything in the subtree below shares that prefix.",
      ],
    },
    sections: [
      { heading: "One character per edge", body: "Words sharing a prefix share a path from the root, so the structure factors out common prefixes. A node flag marks where a complete word ends. Insert and search cost `O(L)` for a length-`L` word — **independent of how many words are stored**, unlike a BST whose cost grows with the dictionary." },
      { heading: "Prefix power (and the space cost)", body: "Finding all words with a given prefix is just walking to that prefix node and enumerating the subtree — the engine behind autocomplete and spell-check. The trade-off is **memory**: a node per character can be wasteful, which **radix/Patricia tries** (merging single-child chains) and **ternary search tries** address." },
    ],
    complexity: [["Insert", "O(L)"], ["Search", "O(L)"], ["Prefix query", "O(L + matches)"], ["Space", "O(total chars × alphabet)"]],
    pitfalls: [
      "Forgetting the end-of-word marker makes `\"car\"` look present just because `\"card\"` is.",
      "A dense per-node array over a large alphabet wastes memory — use a hash map of children or a radix trie.",
      "Deletion must prune now-empty branches, not just clear the flag.",
    ],
    whenToUse: {
      use: ["Autocomplete & typeahead", "Prefix / dictionary lookups", "IP routing (longest-prefix match)", "Word games, spell-check"],
      avoid: ["You only need exact key lookup (a **hash map** is smaller and O(1))", "Memory is very tight and prefixes don't overlap much"],
    },
    variants: [
      { name: "Radix / Patricia trie", note: "Merge single-child chains — compact, used in IP routing." },
      { name: "Ternary search trie", note: "BST-of-characters per node — space-efficient middle ground." },
      { name: "Suffix trie/tree", note: "All suffixes of a string — powerful substring search." },
    ],
    realWorld: ["Search autocomplete", "IP routing tables", "Spell-checkers & T9", "Genome substring search"],
    references: [{ book: "Sedgewick & Wayne", where: "§5.2, Tries" }, { book: "Skiena", where: "§12.3, Suffix Trees and Arrays" }],
    demo: { language: "python", code: `trie = {}\nfor word in ["cat", "car", "dog"]:\n    node = trie\n    for ch in word:\n        node = node.setdefault(ch, {})\n    node["$"] = True\n\n# search "car"\nnode = trie\nfound = True\nfor ch in "car":\n    if ch not in node:\n        found = False\n        break\n    node = node[ch]\nprint(found and "$" in node)\n` },
  },
  {
    slug: "segment-tree", category: "trees", title: "Segment Tree",
    summary: "A tree over array ranges that answers range queries (sum, min, max, gcd…) and point updates both in O(log n) — the tool when prefix sums aren't enough because the data changes.",
    keyIdea: "Precompute the answer for `O(n)` canonical ranges arranged as a tree; any query range decomposes into `O(log n)` of them, and any update touches one root-to-leaf path.",
    howItWorks: {
      intro: "Each node owns a contiguous range; children split it in half:",
      steps: [
        "The root covers `[0, n−1]`; each internal node splits its range into two halves for its children; leaves are single elements.",
        "**Build:** fill leaves with the array, then each parent combines its children (sum, min, …) — `O(n)`.",
        "**Query [l, r]:** descend, taking whole nodes that lie inside `[l, r]` and recursing into the ones that straddle a boundary — `O(log n)` nodes touched.",
        "**Update:** change a leaf, then re-combine its ancestors up to the root — one path, `O(log n)`.",
        "**Lazy propagation** extends this to *range* updates in `O(log n)`.",
      ],
    },
    sections: [
      { heading: "Divide the range", body: "Each node covers a segment of the array; its children split it in half. A query combines `O(log n)` precomputed node values instead of scanning the range; an update fixes one root-to-leaf path. Any associative operation works — sum, min, max, gcd, or even matrix products." },
      { heading: "When to reach for it", body: "Use it when you interleave **many range queries with updates**. A prefix-sum array answers range sums faster (`O(1)`) but can't handle updates without an `O(n)` rebuild. For point-update + range-sum specifically, a **Fenwick (BIT) tree** is simpler and faster; a segment tree is the more general (and more powerful, via lazy propagation) tool." },
    ],
    complexity: [["Build", "O(n)"], ["Range query", "O(log n)"], ["Point update", "O(log n)"], ["Range update (lazy)", "O(log n)"], ["Space", "O(n)"]],
    pitfalls: [
      "Off-by-one in the `[l, r]` boundary logic is the perennial segment-tree bug.",
      "Range updates require **lazy propagation** — updating every leaf is O(n) and defeats the point.",
      "Overkill for static data (use prefix sums) or for point-update+range-sum only (use a Fenwick tree).",
    ],
    whenToUse: {
      use: ["Range sum/min/max **with** updates", "Range assignment / range add (lazy)", "Competitive programming range problems"],
      avoid: ["Static array, queries only → **prefix sums**", "Point update + range sum only → **Fenwick tree** (simpler)"],
    },
    variants: [
      { name: "Fenwick (BIT) tree", note: "Leaner structure for prefix sums with point updates." },
      { name: "Lazy propagation", note: "Defers range updates so they're O(log n) instead of O(n)." },
      { name: "Persistent segment tree", note: "Keeps every historical version — query the array 'as of' any update." },
    ],
    realWorld: ["Range analytics on streams", "Competitive programming", "Interval scheduling / stabbing queries", "Genomics range statistics"],
    references: [{ book: "Competitive Programmer's Handbook (Laaksonen)", where: "Ch. 9, Range queries" }, { book: "CLRS", where: "§14.3, Interval Trees (related)" }],
    demo: { language: "python", code: `a = [2, 1, 5, 3]\nn = len(a)\ntree = [0] * (2 * n)\nfor i in range(n):\n    tree[n + i] = a[i]\nfor i in range(n - 1, 0, -1):\n    tree[i] = tree[2 * i] + tree[2 * i + 1]\n# tree[1] is the total sum\nprint(tree[1])\n` },
  },
];
