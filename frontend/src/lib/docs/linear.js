// Docs topics: arrays & strings, searching, linked lists, stacks, queues,
// hashing. Each topic is data only; the docs framework renders it. `premade`
// wires a client-side interactive visualizer; `demo` runs through the real
// engine.

export const linearTopics = [
  // ---- Arrays & strings ----------------------------------------------------
  {
    slug: "array-traversal", category: "arrays", title: "Array Traversal", premade: "array-ops",
    summary: "An array stores elements in contiguous memory with O(1) index access. Traversal visits each element once, the basis of almost every algorithm.",
    sections: [
      { heading: "Contiguous and indexed", body: "Because elements sit next to each other in memory, `a[i]` is a single address computation — constant time. The trade-off is that growing or inserting in the middle means shifting elements." },
      { heading: "Traversing", body: "A single loop from 0 to n-1 touches every element in O(n). Most array techniques (search, sum, max) are a traversal with a little state carried along." },
    ],
    complexity: [["Access", "O(1)"], ["Search", "O(n)"], ["Insert/Delete (end)", "O(1)"], ["Insert/Delete (middle)", "O(n)"]],
    demo: { language: "python", code: `a = [4, 8, 15, 16, 23, 42]\ntotal = 0\nfor i in range(len(a)):\n    total += a[i]\nprint(total)\n` },
  },
  {
    slug: "array-insert-delete", category: "arrays", title: "Array Insert & Delete", premade: "array-ops",
    summary: "Inserting or deleting in the middle of an array shifts every later element, so it costs O(n). At the end it is O(1) (amortized).",
    sections: [
      { heading: "Why the shift?", body: "Arrays are contiguous, so to open a gap at index i you move elements i..n-1 one step right; to close a gap you move them left. That movement is the O(n) cost." },
      { heading: "When it's cheap", body: "Appending at the end is O(1) amortized because dynamic arrays over-allocate. Prefer end operations, or pick a linked list when you insert/delete in the middle a lot." },
    ],
    complexity: [["Insert/Delete end", "O(1)"], ["Insert/Delete middle", "O(n)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `a = [1, 2, 4, 5]\n# insert 3 at index 2\na.insert(2, 3)\n# delete the first element\ndel a[0]\nprint(a)\n` },
  },
  {
    slug: "two-pointers", category: "arrays", title: "Two Pointers",
    summary: "Walk an array with two indices that move toward each other or in the same direction, turning many O(n^2) brute forces into O(n).",
    sections: [
      { heading: "The idea", body: "Keep two indices and advance whichever one makes progress toward the goal. Classic for sorted-array problems: pair sums, reversing, removing duplicates, partitioning." },
      { heading: "Why it's fast", body: "Each pointer only moves forward, so together they take at most 2n steps — linear time, constant extra space." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `# does a sorted array have a pair summing to target?\na = [1, 3, 4, 6, 8, 11]\ntarget = 10\nlo, hi = 0, len(a) - 1\nfound = False\nwhile lo < hi:\n    s = a[lo] + a[hi]\n    if s == target:\n        found = True\n        break\n    elif s < target:\n        lo += 1\n    else:\n        hi -= 1\nprint(found)\n` },
  },
  {
    slug: "sliding-window", category: "arrays", title: "Sliding Window",
    summary: "Maintain a contiguous window over an array and slide it, updating an aggregate incrementally instead of recomputing — O(n) for subarray problems.",
    sections: [
      { heading: "Fixed vs variable", body: "A fixed window of size k slides one step at a time. A variable window grows and shrinks to satisfy a constraint (e.g. longest substring without repeats)." },
      { heading: "Incremental updates", body: "Adding the entering element and removing the leaving one keeps each step O(1), so the whole scan is O(n) rather than O(nk)." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1) or O(k)"]],
    demo: { language: "python", code: `# max sum of any window of size 3\na = [2, 1, 5, 1, 3, 2]\nk = 3\nwindow = sum(a[:k])\nbest = window\nfor i in range(k, len(a)):\n    window += a[i] - a[i - k]\n    if window > best:\n        best = window\nprint(best)\n` },
  },
  {
    slug: "prefix-sum", category: "arrays", title: "Prefix Sum",
    summary: "Precompute cumulative sums so any range sum becomes a single subtraction — O(1) per query after O(n) setup.",
    sections: [
      { heading: "Build once, query fast", body: "prefix[i] holds the sum of the first i elements. Then the sum of a[l..r] is prefix[r+1] - prefix[l] in constant time." },
      { heading: "Where it helps", body: "Range-sum queries, counting, and many DP transitions. The same trick extends to 2D grids and to XOR / product prefixes." },
    ],
    complexity: [["Build", "O(n)"], ["Range query", "O(1)"]],
    demo: { language: "python", code: `a = [3, 1, 4, 1, 5, 9]\nprefix = [0]\nfor x in a:\n    prefix.append(prefix[-1] + x)\n# sum of a[1..4]\nl, r = 1, 4\nprint(prefix[r + 1] - prefix[l])\n` },
  },
  {
    slug: "kadane", category: "arrays", title: "Kadane's Algorithm",
    summary: "Find the maximum-sum contiguous subarray in O(n) by deciding at each element whether to extend the current run or start fresh.",
    sections: [
      { heading: "The recurrence", body: "best ending here = max(element, element + best ending at previous). Track the running best ending here and the global best — one pass." },
      { heading: "Intuition", body: "If the running sum ever goes negative it can only hurt, so you drop it and start a new subarray at the next element." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `a = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nbest = a[0]\ncur = a[0]\nfor x in a[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)\n` },
  },

  // ---- Searching -----------------------------------------------------------
  {
    slug: "linear-search", category: "searching", title: "Linear Search", premade: "array-ops",
    summary: "Check elements one by one until you find the target. Works on any list, sorted or not, in O(n).",
    sections: [
      { heading: "When to use it", body: "Linear search is the right tool for unsorted data or small inputs. No preprocessing, no assumptions — just scan." },
      { heading: "Cost", body: "Worst and average case are O(n); best case O(1) if the target is first. If you search the same data often, sort it once and switch to binary search." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `a = [7, 3, 9, 2, 8, 5]\ntarget = 8\nfound = -1\nfor i in range(len(a)):\n    if a[i] == target:\n        found = i\n        break\nprint(found)\n` },
  },
  {
    slug: "binary-search", category: "searching", title: "Binary Search", premade: "binary-search",
    summary: "On a sorted array, repeatedly halve the search window by comparing with the middle element — O(log n).",
    sections: [
      { heading: "Halving the problem", body: "Compare the target with the middle. If equal, done. If smaller, discard the right half; if larger, discard the left. Each step throws away half the remaining elements." },
      { heading: "Careful with bounds", body: "Use lo <= hi and mid = (lo + hi) // 2. Off-by-one errors in the bounds are the classic binary-search bug — the live demo lets you watch lo, mid, hi move." },
    ],
    complexity: [["Time", "O(log n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `a = [3, 7, 12, 18, 23, 29, 34, 41]\ntarget = 23\nlo, hi = 0, len(a) - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == target:\n        ans = mid\n        break\n    elif a[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(ans)\n` },
  },

  // ---- Linked lists --------------------------------------------------------
  {
    slug: "linked-list", category: "linked", title: "Singly Linked List", premade: "linked-list-singly",
    summary: "A chain of nodes where each holds a value and a reference to the next. Insertion/deletion at a known node is O(1), but there's no random access.",
    sections: [
      { heading: "What is a linked list?", body: "Each node stores a value and a `next` pointer. The first node is the head; the last points to null. To reach the k-th element you walk k steps — there is no indexing." },
      { heading: "Why use one?", body: "Arrays need shifting to insert/delete in the middle (O(n)); a linked list splices a node in O(1) once you hold it, at the cost of O(n) search and extra pointer memory." },
      { heading: "Reversal", body: "Flipping every `next` pointer reverses the list in place — the classic interview warm-up. Step through it in the live demo." },
    ],
    complexity: [["Access", "O(n)"], ["Search", "O(n)"], ["Insert (at node)", "O(1)"], ["Delete (at node)", "O(1)"]],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)\nhead.next.next = Node(3)\n\n# reverse it\nprev = None\ncurr = head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\n` },
  },
  {
    slug: "doubly-linked-list", category: "linked", title: "Doubly Linked List", premade: "linked-list-doubly",
    summary: "Each node points both forward (`next`) and backward (`prev`), so you can traverse in either direction and delete a node in O(1) given only that node.",
    sections: [
      { heading: "Two pointers per node", body: "The extra `prev` pointer lets you walk backward and removes the need to track the predecessor when deleting — handy for LRU caches and editor undo." },
      { heading: "Cost", body: "Twice the pointer memory and more bookkeeping on every insert/delete, but O(1) removal of a known node and bidirectional traversal." },
    ],
    complexity: [["Access", "O(n)"], ["Insert/Delete (at node)", "O(1)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n        self.prev = None\n\na = Node(1)\nb = Node(2)\nc = Node(3)\na.next = b; b.prev = a\nb.next = c; c.prev = b\n\n# walk backward from the tail\nnode = c\nwhile node:\n    print(node.val)\n    node = node.prev\n` },
  },
  {
    slug: "circular-linked-list", category: "linked", title: "Circular Linked List", premade: "linked-list-circular",
    summary: "The last node points back to the head instead of null, forming a loop — useful for round-robin scheduling and ring buffers.",
    sections: [
      { heading: "No end", body: "Traversal never hits null; you stop when you return to the starting node. Great for cyclic structures like turn order or a music playlist on repeat." },
      { heading: "Watch the loop", body: "Every algorithm must guard against looping forever — track the start node or a count. The live demo shows the wrap-back link." },
    ],
    complexity: [["Access", "O(n)"], ["Insert/Delete", "O(1)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\na = Node(1); b = Node(2); c = Node(3)\na.next = b; b.next = c; c.next = a  # loop back\n\n# walk one full lap\nnode = a\nfor _ in range(3):\n    print(node.val)\n    node = node.next\n` },
  },
  {
    slug: "fast-slow-pointers", category: "linked", title: "Fast & Slow Pointers",
    summary: "Move one pointer one step and another two steps. They meet inside a cycle (Floyd's algorithm) and locate the middle of a list.",
    sections: [
      { heading: "Cycle detection", body: "If there's a loop, the fast pointer laps the slow one and they collide; if fast reaches null, the list is acyclic. O(n) time, O(1) space." },
      { heading: "Finding the middle", body: "When fast reaches the end, slow sits at the midpoint — one pass, no length precomputation." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\na = Node(1); b = Node(2); c = Node(3); d = Node(4)\na.next = b; b.next = c; c.next = d; d.next = b  # cycle\n\nslow = a\nfast = a\nhas_cycle = False\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        has_cycle = True\n        break\nprint(has_cycle)\n` },
  },

  // ---- Stacks --------------------------------------------------------------
  {
    slug: "stack", category: "stacks", title: "Stack", premade: "stack",
    summary: "A LIFO (last-in, first-out) structure: push onto the top, pop from the top. Powers undo, expression parsing, DFS, and backtracking.",
    sections: [
      { heading: "LIFO in one line", body: "The last item you push is the first you pop — like a stack of plates. Only the top is accessible." },
      { heading: "Where it shows up", body: "Matching brackets, evaluating expressions, the call stack itself, iterative DFS, and backtracking (push a choice, recurse, pop to undo)." },
      { heading: "Detected by usage", body: "Our engine labels a plain list a `stack` when it sees only push/pop-at-the-end usage — you don't have to name it `stack`." },
    ],
    complexity: [["Push", "O(1)"], ["Pop", "O(1)"], ["Peek", "O(1)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `s = "(()())"\nstack = []\nok = True\nfor ch in s:\n    if ch == "(":\n        stack.append(ch)\n    else:\n        if not stack:\n            ok = False\n        else:\n            stack.pop()\nvalid = ok and not stack\nprint(valid)\n` },
  },
  {
    slug: "valid-parentheses", category: "stacks", title: "Valid Parentheses",
    summary: "Use a stack to check that every opening bracket has a matching, correctly-nested closing bracket.",
    sections: [
      { heading: "Push opens, match closes", body: "Push each opening bracket. On a closing bracket, the top of the stack must be its partner — otherwise it's invalid. At the end the stack must be empty." },
      { heading: "Why a stack", body: "Brackets nest like a stack: the most recently opened must close first. That LIFO order is exactly what a stack enforces." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `s = "{[()]}"\npairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nvalid = True\nfor ch in s:\n    if ch in "([{":\n        stack.append(ch)\n    else:\n        if not stack or stack.pop() != pairs[ch]:\n            valid = False\n            break\nprint(valid and not stack)\n` },
  },
  {
    slug: "min-stack", category: "stacks", title: "Min Stack",
    summary: "A stack that also returns its minimum in O(1) by keeping a parallel stack of running minimums.",
    sections: [
      { heading: "Track the min alongside", body: "Each time you push, also push the smaller of the new value and the current min. Pop both together. The min is always the top of the helper stack." },
      { heading: "Constant time", body: "All operations — push, pop, top, getMin — stay O(1) at the cost of one extra value per element." },
    ],
    complexity: [["Push/Pop/Top", "O(1)"], ["getMin", "O(1)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `stack = []\nmins = []\nfor x in [5, 2, 7, 1, 3]:\n    stack.append(x)\n    mins.append(x if not mins else min(x, mins[-1]))\n# current minimum\nprint(mins[-1])\nstack.pop(); mins.pop()\nprint(mins[-1])\n` },
  },

  // ---- Queues --------------------------------------------------------------
  {
    slug: "queue", category: "queues", title: "Queue", premade: "queue",
    summary: "A FIFO (first-in, first-out) structure: enqueue at the back, dequeue from the front. The backbone of BFS and scheduling.",
    sections: [
      { heading: "FIFO", body: "First item in is the first out — like a line at a counter. Enqueue at the rear, dequeue at the front." },
      { heading: "Where it shows up", body: "Breadth-first search, level-order traversal, task scheduling, and producer/consumer buffers. In Python use collections.deque for O(1) pops from the front." },
    ],
    complexity: [["Enqueue", "O(1)"], ["Dequeue", "O(1)"], ["Peek", "O(1)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `from collections import deque\nq = deque()\nfor x in [1, 2, 3]:\n    q.append(x)        # enqueue\norder = []\nwhile q:\n    order.append(q.popleft())  # dequeue\nprint(order)\n` },
  },
  {
    slug: "circular-queue", category: "queues", title: "Circular Queue", premade: "circular-queue",
    summary: "A fixed-capacity queue whose head and tail wrap around modulo the capacity, reusing freed slots instead of growing.",
    sections: [
      { heading: "Reuse the slots", body: "When the tail reaches the end of the buffer it wraps to index 0. As long as the queue isn't full, freed front slots get reused — no shifting, no reallocation." },
      { heading: "Full vs empty", body: "Both look like head == tail, so you track a count (or leave one slot empty) to tell them apart. Common in ring buffers and streaming." },
    ],
    complexity: [["Enqueue", "O(1)"], ["Dequeue", "O(1)"], ["Space", "O(capacity)"]],
    demo: { language: "python", code: `cap = 4\nbuf = [None] * cap\nhead = tail = count = 0\nfor x in [10, 20, 30]:\n    buf[tail] = x\n    tail = (tail + 1) % cap\n    count += 1\n# dequeue one\nval = buf[head]\nhead = (head + 1) % cap\ncount -= 1\nprint(val, count)\n` },
  },
  {
    slug: "deque", category: "queues", title: "Deque", premade: "deque",
    summary: "A double-ended queue: add and remove from both the front and the back in O(1). A queue and a stack rolled into one.",
    sections: [
      { heading: "Both ends", body: "pushFront, pushBack, popFront, popBack are all O(1). Use it as a stack, a queue, or a sliding-window helper (monotonic deque)." },
      { heading: "Sliding-window max", body: "A deque holding candidate indices gives the maximum of every window in O(n) — a staple optimization." },
    ],
    complexity: [["Push/Pop (either end)", "O(1)"], ["Search", "O(n)"]],
    demo: { language: "python", code: `from collections import deque\nd = deque([2, 3])\nd.appendleft(1)   # 1 2 3\nd.append(4)       # 1 2 3 4\nd.popleft()       # 2 3 4\nd.pop()           # 2 3\nprint(list(d))\n` },
  },
  {
    slug: "priority-queue", category: "queues", title: "Priority Queue / Heap", premade: "priority-queue",
    summary: "A queue that always dequeues the highest-priority element, implemented as a binary heap with O(log n) insert and extract.",
    sections: [
      { heading: "Heap-ordered", body: "A binary heap is a complete tree where every parent is ≤ (min-heap) its children. The smallest sits at the root, ready to pop in O(1)." },
      { heading: "Bubble up, sift down", body: "Insert at the end and bubble up; extract the root, move the last element up, and sift down. Both restore the heap property in O(log n)." },
    ],
    complexity: [["Insert", "O(log n)"], ["Extract-min", "O(log n)"], ["Peek", "O(1)"], ["Build heap", "O(n)"]],
    demo: { language: "python", code: `import heapq\nh = []\nfor x in [5, 1, 8, 3, 2]:\n    heapq.heappush(h, x)\nout = []\nwhile h:\n    out.append(heapq.heappop(h))\nprint(out)\n` },
  },

  // ---- Hashing -------------------------------------------------------------
  {
    slug: "hash-map", category: "hashing", title: "Hash Map & Set", premade: "hash-map",
    summary: "Map keys to array buckets via a hash function for average O(1) insert, lookup, and delete. Collisions are resolved by chaining.",
    sections: [
      { heading: "Hash to a bucket", body: "A hash function turns a key into a bucket index. Different keys can land in the same bucket — a collision — which separate chaining stores as a small list per bucket." },
      { heading: "Average vs worst", body: "With a good hash and a low load factor, operations are O(1) on average. Worst case (everything in one bucket) degrades to O(n); resizing keeps the load factor low." },
    ],
    complexity: [["Insert (avg)", "O(1)"], ["Lookup (avg)", "O(1)"], ["Delete (avg)", "O(1)"], ["Worst case", "O(n)"]],
    demo: { language: "python", code: `# count word frequencies with a dict (hash map)\nwords = ["a", "b", "a", "c", "b", "a"]\ncount = {}\nfor w in words:\n    count[w] = count.get(w, 0) + 1\nprint(count)\n` },
  },
];
