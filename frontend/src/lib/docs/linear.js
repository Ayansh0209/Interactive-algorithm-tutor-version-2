// Docs topics: arrays & strings, searching, linked lists, stacks, queues,
// hashing. Each topic is data only; the docs framework (DocArticle) renders it.
// `premade` wires a client-side interactive visualizer; `demo` runs through the
// real engine. Rich fields (keyIdea, howItWorks, pitfalls, whenToUse, variants,
// realWorld, references) are all optional and each renders as its own section.
// Prose supports inline **bold** and `code`.

export const linearTopics = [
  // ---- Arrays & strings ----------------------------------------------------
  {
    slug: "array-traversal", category: "arrays", title: "Array Traversal", premade: "array-ops",
    summary: "An array stores elements in contiguous memory, so `a[i]` is a single address computation — constant time. Traversal visits each element once and is the skeleton of almost every algorithm you'll write.",
    keyIdea: "Because the cells sit end to end and are all the same size, the machine reaches `a[i]` by computing `base + i × size` — one multiply-add, no searching. That single fact makes the array the default container and the yardstick every other structure is measured against.",
    howItWorks: {
      intro: "A traversal is just a loop that carries a little state as it walks the cells left to right.",
      steps: [
        "Start an index `i` at 0 and initialise whatever you're accumulating (a sum, a max, a count).",
        "Read `a[i]` in **O(1)** and fold it into your running state.",
        "Advance `i` by one. Because each cell is visited exactly once, the whole pass is **O(n)**.",
        "Stop when `i` reaches `n`. The state now reflects every element.",
      ],
    },
    sections: [
      { heading: "Contiguous and indexed", body: "Elements sit next to each other in one block of memory, so indexing is arithmetic, not a search: `a[i]` lives at `base + i × elementSize`. The price of that speed is rigidity — opening or closing a gap in the middle means physically moving the elements after it." },
      { heading: "Cache locality is the hidden win", body: "Modern CPUs fetch memory in **cache lines** (~64 bytes), so walking an array pulls neighbours in for free. This locality often makes an `O(n)` array scan beat an `O(n)` linked-list walk in wall-clock time, even though they share the same big-O." },
      { heading: "Traversing", body: "A single loop from `0` to `n-1` touches every element. Most array techniques — sum, max, search, reverse — are a traversal with a little carried state, which is why mastering the loop shape pays off everywhere." },
    ],
    complexity: [["Access", "O(1)", "arithmetic, not search"], ["Search (unsorted)", "O(n)"], ["Insert / delete at end", "O(1)", "amortized, dynamic array"], ["Insert / delete in middle", "O(n)", "shifts elements"]],
    pitfalls: [
      "**Off-by-one:** the last valid index is `n-1`, not `n`. Looping `i <= n` reads one past the end.",
      "**Mutating while iterating:** deleting elements during a forward loop shifts later items under your cursor and skips some. Iterate backward, or build a new array.",
      "Assuming access is free forever — it's `O(1)` per element, but a nested traversal is `O(n²)`.",
    ],
    whenToUse: {
      use: ["You need **random access** by index", "The size is known or grows mostly at the end", "You want maximum **cache locality** and the tightest constant factors"],
      avoid: ["You insert or delete in the **middle** frequently (a linked list splices in O(1))", "You need the structure to grow and shrink at both ends cheaply (use a deque)"],
    },
    realWorld: ["Pixel buffers & images", "Matrices / tensors", "Lookup tables", "Ring buffers", "The backing store of almost every other structure"],
    references: [
      { book: "CLRS, Introduction to Algorithms", where: "Ch. 10, Elementary Data Structures" },
      { book: "Sedgewick & Wayne, Algorithms (4th ed.)", where: "§1.3, Bags, Queues, and Stacks" },
    ],
    demo: { language: "python", code: `a = [4, 8, 15, 16, 23, 42]\ntotal = 0\nfor i in range(len(a)):\n    total += a[i]\nprint(total)\n` },
  },
  {
    slug: "array-insert-delete", category: "arrays", title: "Array Insert & Delete", premade: "array-ops",
    summary: "Inserting or deleting in the middle of an array shifts every later element, so it costs O(n). At the end it's O(1) amortized — which is why dynamic arrays feel free until they don't.",
    keyIdea: "An array has no spare gaps: to make room at index `i` you must slide elements `i…n-1` one step right, and to close a gap you slide them left. The shifting *is* the cost.",
    howItWorks: {
      intro: "Inserting `x` at index `i` in a contiguous array:",
      steps: [
        "Ensure there's capacity; if the backing store is full, a dynamic array allocates a bigger block (usually **2×**) and copies everything over.",
        "Shift elements `i…n-1` one slot to the **right**, starting from the end so you don't overwrite.",
        "Write `x` into the now-empty slot `i` and increment the length.",
        "Deletion is the mirror image: overwrite slot `i` by shifting `i+1…n-1` one slot **left**.",
      ],
    },
    sections: [
      { heading: "Why the shift?", body: "Because storage is contiguous, there's no room to splice. Opening a gap at index `i` moves elements `i…n-1` right; closing one moves them left. That movement is the **O(n)** cost, and it's unavoidable for a plain array." },
      { heading: "Amortized O(1) at the end", body: "Appending is `O(1)` *amortized*: a dynamic array (Python `list`, C++ `vector`, Java `ArrayList`) over-allocates, so most appends just write a slot. Occasionally it doubles and copies — an `O(n)` step — but spread over all the cheap appends, the average stays constant." },
    ],
    complexity: [["Insert / delete at end", "O(1)", "amortized"], ["Insert / delete in middle", "O(n)"], ["Access", "O(1)"], ["Search", "O(n)"]],
    pitfalls: [
      "Shifting in the **wrong direction** on insert overwrites data — copy from the far end inward.",
      "Deleting inside a forward loop invalidates indices; collect deletions and apply them, or iterate backward.",
      "Treating amortized O(1) as worst-case O(1) — a single append can trigger an O(n) resize (matters for real-time code).",
    ],
    whenToUse: {
      use: ["Growth happens mostly at the **end**", "You need index access and rarely touch the middle"],
      avoid: ["Frequent middle insert/delete → **linked list**", "Front insert/delete → **deque**"],
    },
    variants: [
      { name: "Gap buffer", note: "Keeps a movable gap near the cursor — the trick behind fast text editors." },
      { name: "Swap-and-pop", note: "When order doesn't matter, delete by swapping with the last element and popping — **O(1)**." },
    ],
    references: [{ book: "CLRS", where: "Ch. 17, Amortized Analysis (the doubling argument)" }],
    demo: { language: "python", code: `a = [1, 2, 4, 5]\n# insert 3 at index 2\na.insert(2, 3)\n# delete the first element\ndel a[0]\nprint(a)\n` },
  },
  {
    slug: "two-pointers", category: "arrays", title: "Two Pointers",
    summary: "Walk an array with two indices that move toward each other or in the same direction, collapsing many O(n²) brute forces into a single O(n) pass.",
    keyIdea: "When the data is sorted (or has a monotonic property), you rarely need to compare every pair. Two indices that only ever move forward can cover all the *useful* pairs in one sweep.",
    howItWorks: {
      intro: "The converging pattern, e.g. \"does this sorted array have a pair summing to `target`?\":",
      steps: [
        "Put `lo` at the start and `hi` at the end.",
        "Look at `a[lo] + a[hi]`. If it equals the target, you're done.",
        "If the sum is **too small**, the only way to grow it is `lo += 1` (the left value was the bottleneck).",
        "If the sum is **too large**, shrink it with `hi -= 1`.",
        "Repeat until the pointers cross. Each index moves at most `n` steps, so the whole thing is **O(n)**.",
      ],
    },
    sections: [
      { heading: "The idea", body: "Keep two indices and advance whichever one makes progress toward the goal. It's the workhorse of sorted-array problems: pair sums, three-sum, reversing in place, removing duplicates, partitioning (as in quicksort), and merging two sorted runs." },
      { heading: "Why it's fast", body: "Each pointer only ever moves in one direction, so together they take at most `2n` steps — **linear time, constant extra space**. The correctness argument is that whenever you move a pointer, you've provably ruled out every pair you skip." },
    ],
    complexity: [["Time", "O(n)", "after sorting, if needed"], ["Space", "O(1)"]],
    pitfalls: [
      "The converging variant needs **sorted** input — forgetting to sort breaks the invariant.",
      "Loop condition is usually `lo < hi`; using `lo <= hi` can double-count the middle element.",
      "Moving the wrong pointer (or both) can skip the answer — tie each move to *why* the sum was too big or small.",
    ],
    whenToUse: {
      use: ["Sorted arrays / strings", "Pair or triplet problems", "In-place reversal or partitioning", "Merging two sorted sequences"],
      avoid: ["Unsorted data where order carries meaning and you can't sort", "Problems needing all pairs regardless (genuinely O(n²))"],
    },
    variants: [
      { name: "Fast & slow", note: "Both pointers move the same direction at different speeds — cycle detection, list midpoint." },
      { name: "Sliding window", note: "A same-direction pair bounding a contiguous window." },
    ],
    realWorld: ["Merge step of merge sort", "3Sum / pair-sum interview staples", "In-place `reverse`", "Two-sequence merges"],
    references: [{ book: "Skiena, The Algorithm Design Manual", where: "Ch. 4, Sorting and Searching" }, { book: "Cracking the Coding Interview", where: "Ch. 1, Arrays and Strings" }],
    demo: { language: "python", code: `# does a sorted array have a pair summing to target?\na = [1, 3, 4, 6, 8, 11]\ntarget = 10\nlo, hi = 0, len(a) - 1\nfound = False\nwhile lo < hi:\n    s = a[lo] + a[hi]\n    if s == target:\n        found = True\n        break\n    elif s < target:\n        lo += 1\n    else:\n        hi -= 1\nprint(found)\n` },
  },
  {
    slug: "sliding-window", category: "arrays", title: "Sliding Window",
    summary: "Maintain a contiguous window over an array and slide it, updating an aggregate incrementally instead of recomputing from scratch — O(n) for subarray and substring problems.",
    keyIdea: "The window at position `i+1` shares almost everything with the window at `i`. Add the one element that entered and remove the one that left, and each step is O(1) instead of O(k).",
    howItWorks: {
      intro: "For a fixed window of size `k` (e.g. max sum of any `k` consecutive elements):",
      steps: [
        "Compute the aggregate of the first window `a[0…k-1]` once.",
        "To slide right, **add** the entering element `a[i]` and **subtract** the leaving element `a[i-k]`.",
        "Compare against your best-so-far after each slide.",
        "A **variable** window instead grows its right edge until a constraint breaks, then shrinks the left edge until it holds again.",
      ],
    },
    sections: [
      { heading: "Fixed vs variable", body: "A **fixed** window of size `k` slides one step at a time. A **variable** window grows and shrinks to satisfy a constraint — e.g. the longest substring without repeating characters, or the smallest subarray with sum ≥ target." },
      { heading: "The amortization argument", body: "Even though the variable window's inner shrink loop looks nested, each element enters the window once and leaves once. Total pointer movement is `2n`, so the scan is **O(n)**, not O(nk) or O(n²)." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)", "or O(k) with a hash map / deque"]],
    pitfalls: [
      "Recomputing the whole window each step silently turns it back into **O(nk)** — the point is the incremental update.",
      "For variable windows, forgetting to shrink from the left leaves a stale, invalid window.",
      "Off-by-one on which element enters vs leaves (`a[i]` in, `a[i-k]` out).",
    ],
    whenToUse: {
      use: ["Contiguous subarray / substring problems", "\"Best window of size k\"", "\"Longest / shortest window satisfying …\""],
      avoid: ["Non-contiguous subsequence problems (use DP)", "When elements can't be removed cheaply from the aggregate (e.g. max needs a monotonic deque)"],
    },
    variants: [
      { name: "Monotonic-deque window", note: "Keeps window max/min in O(1) amortized — sliding-window maximum." },
      { name: "Two-pointer window", note: "The variable window is just two same-direction pointers." },
    ],
    realWorld: ["Rate limiting (requests per minute)", "Moving averages in signal processing", "Longest-substring interview problems", "Streaming statistics"],
    references: [{ book: "Competitive Programmer's Handbook (Laaksonen)", where: "Ch. 8, Amortized analysis" }],
    demo: { language: "python", code: `# max sum of any window of size 3\na = [2, 1, 5, 1, 3, 2]\nk = 3\nwindow = sum(a[:k])\nbest = window\nfor i in range(k, len(a)):\n    window += a[i] - a[i - k]\n    if window > best:\n        best = window\nprint(best)\n` },
  },
  {
    slug: "prefix-sum", category: "arrays", title: "Prefix Sum",
    summary: "Precompute cumulative sums so any range sum becomes a single subtraction — O(1) per query after O(n) setup.",
    keyIdea: "If you know the sum of *everything up to* each index, the sum of a slice `a[l…r]` is just the difference of two of those totals. Trade one linear preprocessing pass for constant-time queries forever.",
    howItWorks: {
      intro: "Build a `prefix` array where `prefix[i]` is the sum of the first `i` elements:",
      steps: [
        "Set `prefix[0] = 0` (empty prefix).",
        "Fill `prefix[i+1] = prefix[i] + a[i]` in one **O(n)** pass.",
        "Now the sum of `a[l…r]` is `prefix[r+1] - prefix[l]` — a single subtraction, **O(1)**.",
        "The `+1` offset (prefix has length `n+1`) is what makes the endpoints line up cleanly.",
      ],
    },
    sections: [
      { heading: "Build once, query fast", body: "`prefix[i]` holds the sum of the first `i` elements. Any range sum collapses to `prefix[r+1] - prefix[l]`. You've moved all the work into a single preprocessing pass so that thousands of later queries are each constant time." },
      { heading: "Beyond addition", body: "The trick generalises to any **invertible** operation: XOR-prefix answers range-XOR, product-prefix answers range-product (mind the zeros), and a 2D prefix (integral image) answers rectangle sums in O(1) — the idea behind Viola-Jones face detection." },
    ],
    complexity: [["Build", "O(n)"], ["Range query", "O(1)"], ["Space", "O(n)"]],
    pitfalls: [
      "Index confusion: with a length-`n+1` prefix, the range `a[l…r]` uses `prefix[r+1] - prefix[l]` — the `+1`s are easy to drop.",
      "Prefix sums assume the array **doesn't change**; a single update invalidates them (use a Fenwick/segment tree for updates).",
      "Product prefixes break on zeros; XOR prefixes are fine because XOR is its own inverse.",
    ],
    whenToUse: {
      use: ["Many range-sum queries on a **static** array", "2D rectangle sums (integral image)", "Counting with a running total"],
      avoid: ["The array is frequently **updated** → Fenwick tree / segment tree", "You only need one query (just sum it)"],
    },
    variants: [
      { name: "Fenwick (BIT) tree", note: "Prefix sums that also support point updates in O(log n)." },
      { name: "2D prefix / integral image", note: "Rectangle sums in O(1); classic in computer vision." },
      { name: "Difference array", note: "The inverse — apply many range updates in O(1) each, reconstruct once." },
    ],
    references: [{ book: "CLRS", where: "Problem 14 / Fenwick trees" }, { book: "Competitive Programmer's Handbook", where: "Ch. 9, Range queries" }],
    demo: { language: "python", code: `a = [3, 1, 4, 1, 5, 9]\nprefix = [0]\nfor x in a:\n    prefix.append(prefix[-1] + x)\n# sum of a[1..4]\nl, r = 1, 4\nprint(prefix[r + 1] - prefix[l])\n` },
  },
  {
    slug: "kadane", category: "arrays", title: "Kadane's Algorithm",
    summary: "Find the maximum-sum contiguous subarray in O(n) by deciding, at each element, whether to extend the current run or start fresh.",
    keyIdea: "A prefix that has gone negative can only drag down whatever comes after it, so the moment your running sum would be beaten by starting over, you start over.",
    howItWorks: {
      intro: "Sweep left to right, keeping the best sum that **ends at the current element**:",
      steps: [
        "Initialise `cur` and `best` to the first element.",
        "For each next element `x`, set `cur = max(x, cur + x)` — either extend the previous run, or drop it and start a fresh run at `x`.",
        "Update `best = max(best, cur)` so the global answer survives even if the run later dips.",
        "One pass, **O(n)** time, **O(1)** space.",
      ],
    },
    sections: [
      { heading: "The recurrence", body: "Let `best_ending_here(i) = max(a[i], a[i] + best_ending_here(i-1))`. Track that running value and the global maximum over all `i`. It's a one-line dynamic program — the textbook first example of DP on a sequence." },
      { heading: "Intuition", body: "If the running sum ever goes negative, keeping it can only hurt a future subarray, so you discard it and begin anew at the next element. The global `best` remembers the high-water mark in case the array trends downward afterward." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)"]],
    pitfalls: [
      "Initialising `best` to `0` breaks on **all-negative** arrays (the answer should be the largest single element). Initialise to `a[0]`.",
      "Confusing max-subarray (contiguous) with max-**subsequence** (any elements) — different problems.",
      "To recover the actual subarray, remember the start index whenever you restart.",
    ],
    whenToUse: {
      use: ["Maximum-sum contiguous subarray", "As a gentle first taste of dynamic programming", "1D signal 'best streak' problems"],
      avoid: ["Non-contiguous selection", "When you need the subarray with a bounded length (different DP)"],
    },
    realWorld: ["Best buy/sell window on a price series", "Genomics: highest-scoring segment", "Image processing: brightest 1D strip"],
    references: [{ book: "Bentley, Programming Pearls", where: "Column 8, 'Algorithm Design Techniques' (the origin story)" }, { book: "CLRS", where: "§4.1, Maximum-subarray problem" }],
    demo: { language: "python", code: `a = [-2, 1, -3, 4, -1, 2, 1, -5, 4]\nbest = a[0]\ncur = a[0]\nfor x in a[1:]:\n    cur = max(x, cur + x)\n    best = max(best, cur)\nprint(best)\n` },
  },

  // ---- Searching -----------------------------------------------------------
  {
    slug: "linear-search", category: "searching", title: "Linear Search", premade: "array-ops",
    summary: "Check elements one by one until you find the target. Works on any list — sorted or not — in O(n), with zero preprocessing.",
    keyIdea: "When you know nothing about the data's order, you have no choice but to look at each element; the only question is when you get to stop early.",
    sections: [
      { heading: "When to use it", body: "Linear search is the right tool for **unsorted** data, small inputs, or a one-off lookup. No preprocessing, no assumptions — just scan and stop at the first match. It's also the fallback inside a hash bucket after a collision." },
      { heading: "Cost", body: "Worst and average case are **O(n)**; best case is O(1) when the target is first. If you'll search the same data many times, it's worth sorting once (`O(n log n)`) and switching to binary search (`O(log n)` per query)." },
    ],
    complexity: [["Time (worst / avg)", "O(n)"], ["Time (best)", "O(1)", "target is first"], ["Space", "O(1)"]],
    pitfalls: [
      "Forgetting to `break` on the first match turns a lucky O(1) into a guaranteed O(n).",
      "Returning `0` instead of `-1` for 'not found' — `0` is a valid index.",
    ],
    whenToUse: {
      use: ["Unsorted data", "Small `n`, or a single lookup", "You can't afford preprocessing"],
      avoid: ["Repeated lookups on the same data → sort + **binary search**, or a **hash set**"],
    },
    references: [{ book: "Knuth, TAOCP Vol. 3", where: "§6.1, Sequential Searching" }],
    demo: { language: "python", code: `a = [7, 3, 9, 2, 8, 5]\ntarget = 8\nfound = -1\nfor i in range(len(a)):\n    if a[i] == target:\n        found = i\n        break\nprint(found)\n` },
  },
  {
    slug: "binary-search", category: "searching", title: "Binary Search", premade: "binary-search",
    summary: "On a sorted array, repeatedly halve the search window by comparing with the middle element — O(log n). Simple to state, famously easy to get subtly wrong.",
    keyIdea: "One comparison against the middle element rules out **half** of everything still in play. Halving repeatedly reaches a single element in about `log₂ n` steps — 20 steps for a million items.",
    howItWorks: {
      intro: "Search a sorted array for `target`:",
      steps: [
        "Set `lo = 0`, `hi = n-1` — the whole array is in play.",
        "Look at the middle `mid = lo + (hi - lo) // 2`.",
        "If `a[mid] == target`, you're done.",
        "If `a[mid] < target`, the answer must be to the **right** → `lo = mid + 1`.",
        "If `a[mid] > target`, it must be to the **left** → `hi = mid - 1`.",
        "Repeat while `lo <= hi`. Each step throws away half the window, so it terminates in **O(log n)**.",
      ],
    },
    sections: [
      { heading: "Halving the problem", body: "Compare the target with the middle. If equal, done; if smaller, discard the right half; if larger, discard the left. Each step throws away half the remaining elements, so a million-element array is searched in ~20 comparisons." },
      { heading: "The bug that shipped for years", body: "The 'obvious' `mid = (lo + hi) / 2` can **overflow** when `lo + hi` exceeds the integer limit — a bug that lived in the JDK's binary search for nine years. Write `mid = lo + (hi - lo) / 2`. Boundary handling (`lo <= hi`, `mid ± 1`) is the other classic source of off-by-one errors; the live demo lets you watch `lo`, `mid`, `hi` move." },
    ],
    complexity: [["Time", "O(log n)"], ["Space", "O(1)", "iterative"], ["Preprocessing", "O(n log n)", "the sort"]],
    pitfalls: [
      "`(lo + hi) / 2` can **overflow**; prefer `lo + (hi - lo) / 2`.",
      "Getting the loop bound (`<` vs `<=`) or the update (`mid` vs `mid ± 1`) wrong causes infinite loops or missed elements.",
      "Binary search **requires sorted input** — on unsorted data it silently returns garbage.",
    ],
    whenToUse: {
      use: ["Sorted arrays with many lookups", "Finding a **boundary** (first/last true) — 'binary search on the answer'", "Monotonic predicates, not just literal arrays"],
      avoid: ["Unsorted data you can't sort", "A single lookup on unsorted data (linear scan is simpler)", "Linked lists — no O(1) middle access"],
    },
    variants: [
      { name: "Lower / upper bound", note: "Find the first element ≥ (or >) a key — the basis of `bisect` / `std::lower_bound`." },
      { name: "Binary search on the answer", note: "Search a monotonic yes/no predicate, not an array — e.g. minimum feasible capacity." },
      { name: "Exponential search", note: "Doubling to bracket the range first, for unbounded or streaming input." },
    ],
    realWorld: ["`bisect`, `std::lower_bound`, `Arrays.binarySearch`", "Database B-tree index descent", "Git bisect for finding a bad commit", "Version / capacity feasibility search"],
    references: [
      { book: "CLRS", where: "§2.3 & Exercise 2.3-5" },
      { book: "Bentley, Programming Pearls", where: "Column 4, 'Writing Correct Programs'" },
      { book: "Sedgewick & Wayne, Algorithms", where: "§3.1, Symbol Tables" },
    ],
    demo: { language: "python", code: `a = [3, 7, 12, 18, 23, 29, 34, 41]\ntarget = 23\nlo, hi = 0, len(a) - 1\nans = -1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    if a[mid] == target:\n        ans = mid\n        break\n    elif a[mid] < target:\n        lo = mid + 1\n    else:\n        hi = mid - 1\nprint(ans)\n` },
  },

  // ---- Linked lists --------------------------------------------------------
  {
    slug: "linked-list", category: "linked", title: "Singly Linked List", premade: "linked-list-singly",
    summary: "A chain of nodes where each holds a value and a reference to the next. Splicing a node in or out is O(1) once you hold it — but there's no random access, so reaching the k-th element costs O(k).",
    keyIdea: "Give up contiguous memory and index arithmetic, and in exchange you can rewire the structure by changing a single pointer — no shifting, no reallocation.",
    howItWorks: {
      intro: "Reversing a list in place — the classic warm-up — flips every `next` pointer as it walks:",
      steps: [
        "Keep three pointers: `prev` (starts `None`), `curr` (starts at `head`), and a temporary `nxt`.",
        "Save `nxt = curr.next` so you don't lose the rest of the list.",
        "Rewire: `curr.next = prev` — this node now points backward.",
        "Advance both: `prev = curr`, then `curr = nxt`.",
        "When `curr` falls off the end, `prev` is the new head. One pass, **O(n)**, **O(1)** space.",
      ],
    },
    sections: [
      { heading: "What is a linked list?", body: "Each node stores a value and a `next` pointer. The first node is the **head**; the last points to `null`. There's no indexing — to reach the k-th element you walk k steps from the head, following pointers." },
      { heading: "Why use one?", body: "Arrays shift elements to insert or delete in the middle (`O(n)`); a linked list **splices** a node in `O(1)` once you hold its predecessor. The costs are `O(n)` search, no random access, an extra pointer per node, and poor cache locality (nodes scatter across memory)." },
      { heading: "The dummy-head trick", body: "Insertions and deletions at the front are special cases that clutter code with `if head is None` checks. A **sentinel** (dummy) node before the real head removes those edge cases — every real node now has a predecessor." },
    ],
    complexity: [["Access / search", "O(n)"], ["Insert / delete at a held node", "O(1)"], ["Insert at head", "O(1)"], ["Space overhead", "O(n)", "one pointer per node"]],
    pitfalls: [
      "**Losing the rest of the list:** rewire pointers only after saving `next` in a temporary.",
      "Null-pointer errors at the head/tail — a **dummy head** sentinel removes most of them.",
      "Creating an accidental **cycle** by pointing a node back into the list; traversal then never ends.",
    ],
    whenToUse: {
      use: ["Frequent insert/delete at **known** positions", "Implementing stacks, queues, adjacency lists", "When you can't or won't pay for contiguous reallocation"],
      avoid: ["You need **random access** by index (use an array)", "Tight cache-sensitive loops — pointer chasing thrashes the cache"],
    },
    variants: [
      { name: "Doubly linked", note: "Adds a `prev` pointer for backward traversal and O(1) deletion of a known node." },
      { name: "Circular", note: "Tail points back to head — round-robin, ring buffers." },
      { name: "XOR / skip list", note: "Memory-saving and search-accelerating twists on the basic chain." },
    ],
    realWorld: ["LRU cache (doubly linked + hash map)", "Adjacency lists for graphs", "Undo/redo histories", "The free list in a memory allocator"],
    references: [{ book: "CLRS", where: "§10.2, Linked Lists" }, { book: "Sedgewick & Wayne, Algorithms", where: "§1.3" }],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\nhead = Node(1)\nhead.next = Node(2)\nhead.next.next = Node(3)\n\n# reverse it\nprev = None\ncurr = head\nwhile curr:\n    nxt = curr.next\n    curr.next = prev\n    prev = curr\n    curr = nxt\n` },
  },
  {
    slug: "doubly-linked-list", category: "linked", title: "Doubly Linked List", premade: "linked-list-doubly",
    summary: "Each node points both forward (`next`) and backward (`prev`), so you can traverse in either direction and delete a node in O(1) given only that node.",
    keyIdea: "The extra back-pointer means a node knows its own predecessor, so you can unlink it without walking the list to find who points at it.",
    sections: [
      { heading: "Two pointers per node", body: "The extra `prev` pointer lets you walk **backward** and removes the need to track a predecessor when deleting. That single-node O(1) removal is exactly what an **LRU cache** and an editor's undo stack rely on." },
      { heading: "The cost", body: "Twice the pointer memory and more bookkeeping on every insert and delete — each operation must fix up to four pointers. In exchange you get O(1) removal of any node you already hold and bidirectional traversal." },
    ],
    complexity: [["Access / search", "O(n)"], ["Insert / delete at a held node", "O(1)"], ["Space overhead", "O(n)", "two pointers per node"]],
    pitfalls: [
      "Insert/delete must fix **all four** neighbouring pointers; missing one corrupts the list.",
      "Head and tail updates are easy to forget — sentinel nodes at both ends make every operation uniform.",
    ],
    whenToUse: {
      use: ["You delete known nodes and need it to be O(1)", "Bidirectional traversal", "LRU caches, browser history, editor buffers"],
      avoid: ["Memory is tight (two pointers per node)", "You only ever traverse forward (a singly linked list is leaner)"],
    },
    references: [{ book: "CLRS", where: "§10.2, Linked Lists (with sentinels)" }],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n        self.prev = None\n\na = Node(1)\nb = Node(2)\nc = Node(3)\na.next = b; b.prev = a\nb.next = c; c.prev = b\n\n# walk backward from the tail\nnode = c\nwhile node:\n    print(node.val)\n    node = node.prev\n` },
  },
  {
    slug: "circular-linked-list", category: "linked", title: "Circular Linked List", premade: "linked-list-circular",
    summary: "The last node points back to the head instead of null, forming a loop — useful for round-robin scheduling and ring buffers.",
    keyIdea: "Remove the `null` at the end and the list becomes an endless ring: 'next' always returns something, so cyclic processes map onto it naturally.",
    sections: [
      { heading: "No end", body: "Traversal never hits `null`; you stop when you return to the node you started from. That's perfect for genuinely cyclic things — turn order in a game, a playlist on repeat, time-sliced CPU scheduling." },
      { heading: "Watch the loop", body: "Because there's no terminator, **every** algorithm must guard against looping forever — remember the start node, or carry a count. The live demo highlights the wrap-back link so the cycle is visible." },
    ],
    complexity: [["Access / search", "O(n)"], ["Insert / delete", "O(1)", "at a held node"], ["Space", "O(n)"]],
    pitfalls: [
      "Traversal with a `while node` loop **never terminates** — stop when you reach the start node again.",
      "A single-node ring points to itself; make sure your stop condition handles it.",
    ],
    whenToUse: {
      use: ["Round-robin scheduling", "Ring / circular buffers", "Repeating playlists, turn order"],
      avoid: ["Linear data with a real end (a plain list is simpler and safer)"],
    },
    realWorld: ["OS round-robin scheduler", "Streaming ring buffers", "Multiplayer turn order", "Josephus problem"],
    references: [{ book: "Knuth, TAOCP Vol. 1", where: "§2.2.3, Circular Lists" }],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\na = Node(1); b = Node(2); c = Node(3)\na.next = b; b.next = c; c.next = a  # loop back\n\n# walk one full lap\nnode = a\nfor _ in range(3):\n    print(node.val)\n    node = node.next\n` },
  },
  {
    slug: "fast-slow-pointers", category: "linked", title: "Fast & Slow Pointers",
    summary: "Move one pointer one step and another two steps at a time. They meet inside a cycle (Floyd's 'tortoise and hare') and locate the middle of a list in one pass.",
    keyIdea: "If a track has a loop, a runner going twice as fast will eventually lap a slower one and they'll collide; if there's no loop, the fast runner simply reaches the end.",
    howItWorks: {
      intro: "Floyd's cycle detection:",
      steps: [
        "Start `slow` and `fast` at the head.",
        "Each iteration, move `slow` **one** step and `fast` **two** steps.",
        "If `fast` (or `fast.next`) hits `null`, the list is acyclic — no loop.",
        "If `slow is fast`, they've collided inside a cycle — a loop exists.",
        "Bonus: reset one pointer to the head and advance both by one; they meet at the **cycle's entry** (a lovely number-theory fact).",
      ],
    },
    sections: [
      { heading: "Cycle detection", body: "If there's a loop, the fast pointer gains one step on the slow pointer every iteration, so it eventually laps and lands on it; if fast reaches `null`, the list is acyclic. **O(n)** time, **O(1)** space — no extra hash set of visited nodes needed." },
      { heading: "Finding the middle", body: "When the fast pointer reaches the end, the slow pointer sits exactly at the midpoint — one pass, no length precomputation. Handy for splitting a list before a merge sort." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(1)", "vs O(n) for a visited set"]],
    pitfalls: [
      "Advance `fast` **before** dereferencing — check `fast and fast.next` to avoid a null crash.",
      "Even/odd length changes where 'middle' lands; decide whether you want the lower or upper middle.",
    ],
    whenToUse: {
      use: ["Detect a cycle in O(1) space", "Find a list's midpoint in one pass", "Find where a cycle begins", "Happy-number / functional-graph problems"],
      avoid: ["When you also need the cycle length quickly and a hash set's O(n) space is acceptable (simpler to reason about)"],
    },
    realWorld: ["Detecting infinite loops in linked structures", "Finding duplicate number (array as functional graph)", "Palindrome-list check (find middle, reverse half)"],
    references: [{ book: "CLRS", where: "Problem 22-2 (adapted); Floyd's algorithm" }, { book: "Cracking the Coding Interview", where: "Ch. 2, Linked Lists" }],
    demo: { language: "python", code: `class Node:\n    def __init__(self, val):\n        self.val = val\n        self.next = None\n\na = Node(1); b = Node(2); c = Node(3); d = Node(4)\na.next = b; b.next = c; c.next = d; d.next = b  # cycle\n\nslow = a\nfast = a\nhas_cycle = False\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next\n    if slow is fast:\n        has_cycle = True\n        break\nprint(has_cycle)\n` },
  },

  // ---- Stacks --------------------------------------------------------------
  {
    slug: "stack", category: "stacks", title: "Stack", premade: "stack",
    summary: "A LIFO (last-in, first-out) structure: push onto the top, pop from the top. It powers undo, expression parsing, DFS, and backtracking — and it's the shape of the call stack itself.",
    keyIdea: "Only the most recent thing is accessible. That restriction is exactly what you want whenever the *last* thing you started is the *first* thing you must finish.",
    howItWorks: {
      intro: "Checking balanced brackets — the canonical stack problem:",
      steps: [
        "Scan the string left to right with an empty stack.",
        "On an **opening** bracket, `push` it.",
        "On a **closing** bracket, the top of the stack must be its partner — `pop` and check.",
        "If the stack is empty when you need to pop, or the partners don't match, it's invalid.",
        "At the end, a **balanced** string leaves the stack empty.",
      ],
    },
    sections: [
      { heading: "LIFO in one line", body: "The last item you push is the first you pop — like a stack of plates. Only the top is accessible, and both `push` and `pop` are **O(1)**." },
      { heading: "Where it shows up", body: "Matching brackets, evaluating expressions (shunting-yard), the **call stack** that makes recursion work, iterative DFS, and backtracking — push a choice, recurse, pop to undo. Any time you need to remember 'what to come back to', reach for a stack." },
      { heading: "Detected by usage", body: "Our engine labels a plain list a `stack` when it sees only push/pop-at-the-end usage — so your natural `append`/`pop` code visualizes as a stack without you naming it one." },
    ],
    complexity: [["Push", "O(1)"], ["Pop", "O(1)"], ["Peek", "O(1)"], ["Search", "O(n)"]],
    pitfalls: [
      "**Popping an empty stack** — always check before you pop.",
      "Forgetting the final 'stack must be empty' check in matching problems (an unclosed opener slips through).",
      "Deep recursion overflows the *system* call stack; an explicit stack + iteration sidesteps it.",
    ],
    whenToUse: {
      use: ["Nested / LIFO structure (brackets, tags, scopes)", "Undo, expression evaluation", "Iterative DFS and backtracking", "Reversing a sequence"],
      avoid: ["You need FIFO order (use a **queue**)", "You need access to the middle or minimum (use a deque / augmented stack)"],
    },
    variants: [
      { name: "Min / max stack", note: "Tracks the running min/max in O(1) with a parallel stack." },
      { name: "Monotonic stack", note: "Keeps elements sorted to answer 'next greater element' in O(n)." },
    ],
    realWorld: ["Compiler/interpreter call stacks", "Browser back button", "Ctrl-Z undo", "Expression evaluation & syntax checking", "DFS in graphs"],
    references: [{ book: "CLRS", where: "§10.1, Stacks and Queues" }, { book: "Sedgewick & Wayne, Algorithms", where: "§1.3, Bags, Queues, and Stacks" }],
    demo: { language: "python", code: `s = "(()())"\nstack = []\nok = True\nfor ch in s:\n    if ch == "(":\n        stack.append(ch)\n    else:\n        if not stack:\n            ok = False\n        else:\n            stack.pop()\nvalid = ok and not stack\nprint(valid)\n` },
  },
  {
    slug: "valid-parentheses", category: "stacks", title: "Valid Parentheses",
    summary: "Use a stack to check that every opening bracket has a matching, correctly-nested closing bracket of the same type.",
    keyIdea: "Brackets nest, and nesting *is* LIFO: the most recently opened bracket must be the first one closed — exactly the discipline a stack enforces.",
    howItWorks: {
      intro: "For a string of `()[]{}`:",
      steps: [
        "Keep a map from each closer to its opener, and an empty stack.",
        "Push every opening bracket.",
        "On a closing bracket, `pop` and check it matches the expected opener; if the stack was empty or the pair is wrong, reject.",
        "Accept only if, at the end, the stack is empty (nothing left unclosed).",
      ],
    },
    sections: [
      { heading: "Push opens, match closes", body: "Push each opening bracket. On a closing bracket, the top of the stack must be its partner — otherwise the string is invalid. When the scan finishes, the stack must be empty, or something was left open." },
      { heading: "Why a stack (and not a counter)", body: "A single counter works for one bracket type, but with mixed `()[]{}` you must remember the *type* and *order* of what's open — that's a stack. A counter would call `([)]` valid; a stack correctly rejects it." },
    ],
    complexity: [["Time", "O(n)"], ["Space", "O(n)", "worst case all openers"]],
    pitfalls: [
      "Only counting brackets accepts `([)]`; you must check the **type** on the top of the stack.",
      "Forgetting the final emptiness check accepts `(((`.",
      "Popping when the stack is empty (a closer with no opener) must be handled.",
    ],
    whenToUse: {
      use: ["Validating nested structures", "HTML/XML tag matching", "Compiler bracket checks"],
      avoid: ["A single bracket type where a counter is enough"],
    },
    references: [{ book: "Cracking the Coding Interview", where: "Ch. 3, Stacks and Queues" }],
    demo: { language: "python", code: `s = "{[()]}"\npairs = {")": "(", "]": "[", "}": "{"}\nstack = []\nvalid = True\nfor ch in s:\n    if ch in "([{":\n        stack.append(ch)\n    else:\n        if not stack or stack.pop() != pairs[ch]:\n            valid = False\n            break\nprint(valid and not stack)\n` },
  },
  {
    slug: "min-stack", category: "stacks", title: "Min Stack",
    summary: "A stack that also returns its current minimum in O(1) by keeping a parallel stack of running minimums.",
    keyIdea: "You can't scan for the min each time (that's O(n)), but you *can* remember, for every push, what the minimum was at that moment — and pop that memory in lock-step.",
    howItWorks: {
      intro: "Maintain a second stack, `mins`, alongside the main one:",
      steps: [
        "On **push** of `x`, also push `min(x, mins.top())` onto `mins` (or just `x` if `mins` is empty).",
        "On **pop**, pop *both* stacks together, keeping them the same height.",
        "`getMin()` is simply `mins.top()` — the minimum of everything currently in the stack.",
        "Every operation stays **O(1)**, at the cost of one extra value per element.",
      ],
    },
    sections: [
      { heading: "Track the min alongside", body: "Each time you push, also push the smaller of the new value and the current min onto a helper stack. Pop both together. The current minimum is always the top of the helper stack — no scanning." },
      { heading: "Squeezing the space", body: "You can avoid the second stack by storing **encoded deltas** relative to the current min, or by only pushing to `mins` when a new value ties or beats it. The idea is the same: never recompute the min from scratch." },
    ],
    complexity: [["Push / pop / top", "O(1)"], ["getMin", "O(1)"], ["Space", "O(n)", "one extra value per element"]],
    pitfalls: [
      "Only pushing to `mins` on strict improvement mishandles **duplicate** minimums on pop — push on `<=`, or store counts.",
      "Forgetting to pop the helper stack in lock-step desynchronises the two.",
    ],
    whenToUse: {
      use: ["You need the running min/max of a stack in O(1)", "Sliding-window minimums (with a deque variant)"],
      avoid: ["You need the min of an arbitrary range, not the whole stack (use a segment tree)"],
    },
    references: [{ book: "Cracking the Coding Interview", where: "Ch. 3, 'Stack Min'" }],
    demo: { language: "python", code: `stack = []\nmins = []\nfor x in [5, 2, 7, 1, 3]:\n    stack.append(x)\n    mins.append(x if not mins else min(x, mins[-1]))\n# current minimum\nprint(mins[-1])\nstack.pop(); mins.pop()\nprint(mins[-1])\n` },
  },

  // ---- Queues --------------------------------------------------------------
  {
    slug: "queue", category: "queues", title: "Queue", premade: "queue",
    summary: "A FIFO (first-in, first-out) structure: enqueue at the back, dequeue from the front. It's the backbone of breadth-first search and of fair scheduling.",
    keyIdea: "The opposite discipline to a stack: the oldest waiting item is served first — exactly what 'fairness' and 'process things in the order they arrived' require.",
    howItWorks: {
      intro: "A queue drives breadth-first search — process things in the order they were discovered:",
      steps: [
        "Enqueue the start item at the **back**.",
        "Repeatedly **dequeue** from the front and process it.",
        "As you process, enqueue any newly discovered items at the back.",
        "Because items leave in arrival order, BFS explores level by level — nearest first.",
      ],
    },
    sections: [
      { heading: "FIFO", body: "First item in is the first out — like a line at a counter. Enqueue at the rear, dequeue at the front, both **O(1)**." },
      { heading: "Mind the implementation", body: "A naive queue on a plain array makes `dequeue` O(n) (everything shifts). Use a **linked list**, a **circular buffer**, or Python's `collections.deque` for true O(1) pops from the front. Two stacks also simulate a queue with O(1) amortized operations." },
    ],
    complexity: [["Enqueue", "O(1)"], ["Dequeue", "O(1)"], ["Peek", "O(1)"], ["Search", "O(n)"]],
    pitfalls: [
      "`list.pop(0)` in Python is **O(n)** — it shifts the whole list. Use `collections.deque`.",
      "Confusing the front and back ends when enqueuing/dequeuing.",
    ],
    whenToUse: {
      use: ["Breadth-first search / level-order traversal", "Task & job scheduling (fairness)", "Producer/consumer buffers", "Rate limiting"],
      avoid: ["You need LIFO order (**stack**)", "You need priority ordering (**heap** / priority queue)"],
    },
    variants: [
      { name: "Circular queue", note: "Fixed-capacity ring that reuses freed slots." },
      { name: "Deque", note: "Add/remove at both ends." },
      { name: "Priority queue", note: "Serves the highest-priority item, not the oldest." },
    ],
    realWorld: ["OS process/IO scheduling", "Print & message queues", "BFS in graphs and grids", "Buffering between producer and consumer"],
    references: [{ book: "CLRS", where: "§10.1, Stacks and Queues" }, { book: "Sedgewick & Wayne, Algorithms", where: "§1.3" }],
    demo: { language: "python", code: `from collections import deque\nq = deque()\nfor x in [1, 2, 3]:\n    q.append(x)        # enqueue\norder = []\nwhile q:\n    order.append(q.popleft())  # dequeue\nprint(order)\n` },
  },
  {
    slug: "circular-queue", category: "queues", title: "Circular Queue", premade: "circular-queue",
    summary: "A fixed-capacity queue whose head and tail wrap around modulo the capacity, reusing freed slots instead of shifting or growing.",
    keyIdea: "Bend the array into a ring with modular arithmetic, and the space a dequeue frees at the front becomes room for the next enqueue at the back — no shifting, no reallocation.",
    howItWorks: {
      intro: "Back a queue with a fixed array of size `cap`, plus `head`, `tail`, and `count`:",
      steps: [
        "**Enqueue:** write to `buf[tail]`, then `tail = (tail + 1) % cap`, and increment `count`.",
        "**Dequeue:** read `buf[head]`, then `head = (head + 1) % cap`, and decrement `count`.",
        "The `% cap` is what wraps the indices around the end of the array back to `0`.",
        "It's **full** when `count == cap` and **empty** when `count == 0`.",
      ],
    },
    sections: [
      { heading: "Reuse the slots", body: "When the tail reaches the end of the buffer it wraps to index 0 via `% cap`. As long as the queue isn't full, slots freed at the front get reused — no shifting, no reallocation, everything O(1)." },
      { heading: "Full vs empty", body: "Both conditions can look like `head == tail`, so you disambiguate with an explicit **count** (used here) or by deliberately leaving one slot empty. Getting this wrong is the classic ring-buffer bug." },
    ],
    complexity: [["Enqueue", "O(1)"], ["Dequeue", "O(1)"], ["Space", "O(capacity)", "fixed, no growth"]],
    pitfalls: [
      "`head == tail` is ambiguous (full or empty?) — track a **count** or leave one slot empty.",
      "Forgetting the `% cap` wrap turns the ring back into a plain, overflowing array.",
      "Enqueuing into a full buffer silently overwrites unread data.",
    ],
    whenToUse: {
      use: ["Fixed-size buffering (audio, video, sensors)", "Bounded producer/consumer queues", "Embedded systems with no dynamic allocation"],
      avoid: ["The maximum size is unknown and unbounded (use a growable queue)"],
    },
    realWorld: ["Audio/video streaming buffers", "Keyboard & network input buffers", "Log ring buffers", "Real-time / embedded systems"],
    references: [{ book: "Sedgewick & Wayne, Algorithms", where: "§1.3, resizing arrays" }],
    demo: { language: "python", code: `cap = 4\nbuf = [None] * cap\nhead = tail = count = 0\nfor x in [10, 20, 30]:\n    buf[tail] = x\n    tail = (tail + 1) % cap\n    count += 1\n# dequeue one\nval = buf[head]\nhead = (head + 1) % cap\ncount -= 1\nprint(val, count)\n` },
  },
  {
    slug: "deque", category: "queues", title: "Deque",
    summary: "A double-ended queue: add and remove from both the front and the back in O(1). A queue and a stack rolled into one.",
    keyIdea: "Allow O(1) operations at *both* ends and a single structure can act as a stack, a queue, or the sliding-window helper that answers range extremes in linear time.",
    sections: [
      { heading: "Both ends", body: "`pushFront`, `pushBack`, `popFront`, `popBack` are all **O(1)**. Use it as a stack (one end), a queue (both ends), or a sliding-window helper. Implemented as a doubly linked list or a growable circular buffer." },
      { heading: "Sliding-window maximum", body: "A **monotonic deque** holding candidate indices — kept in decreasing value order — yields the maximum of every window in **O(n)** total. Each index is pushed and popped at most once, so despite the inner loop it's linear, not O(nk)." },
    ],
    complexity: [["Push / pop (either end)", "O(1)"], ["Random access", "O(n)", "not its strength"], ["Search", "O(n)"]],
    pitfalls: [
      "It supports both ends, but **not** fast indexing into the middle — don't use it as an array.",
      "For sliding-window max, store **indices** (so you can expire out-of-window candidates), not values.",
    ],
    whenToUse: {
      use: ["Sliding-window min/max in O(n)", "Work-stealing schedulers (push/pop one end, steal the other)", "Palindrome checks", "Anything that's 'sometimes a stack, sometimes a queue'"],
      avoid: ["You need random access by index (array)", "You need priority order (heap)"],
    },
    realWorld: ["Sliding-window maximum", "Work-stealing thread pools", "Undo + redo in one structure", "Browser history (both directions)"],
    references: [{ book: "CLRS", where: "§10.1, Exercise 10.1-5 (deques)" }],
    demo: { language: "python", code: `from collections import deque\nd = deque([2, 3])\nd.appendleft(1)   # 1 2 3\nd.append(4)       # 1 2 3 4\nd.popleft()       # 2 3 4\nd.pop()           # 2 3\nprint(list(d))\n` },
  },
  {
    slug: "priority-queue", category: "queues", title: "Priority Queue / Heap", premade: "priority-queue",
    summary: "A queue that always dequeues the highest-priority element, implemented as a binary heap with O(log n) insert and extract.",
    keyIdea: "You don't need the whole set sorted — you only ever need the single best element next. A heap keeps *just enough* order (parent beats children) to hand it over in O(log n).",
    howItWorks: {
      intro: "A binary **min-heap** is a complete tree stored in an array; `children(i) = 2i+1, 2i+2`:",
      steps: [
        "**Insert:** append the new value at the end, then **bubble it up** — swap with its parent while it's smaller — restoring order in O(log n).",
        "**Peek:** the minimum is always at the root, index 0 — O(1).",
        "**Extract-min:** move the last element to the root, then **sift it down** — swap with its smaller child — until the heap property holds again, O(log n).",
        "**Build-heap:** sifting down from the middle to the front heapifies an arbitrary array in surprising **O(n)**, not O(n log n).",
      ],
    },
    sections: [
      { heading: "Heap-ordered, array-stored", body: "A binary heap is a **complete** tree where every parent is ≤ its children (min-heap). Completeness lets it live in a flat array — no pointers — with `parent(i) = (i-1)/2`. The smallest sits at the root, ready to peek in O(1)." },
      { heading: "Bubble up, sift down", body: "Insert at the end and **bubble up**; extract the root, move the last element to the top, and **sift down**. Both walk one root-to-leaf path, so both are O(log n). This is exactly the machinery inside `heapq`, `PriorityQueue`, and heapsort." },
    ],
    complexity: [["Insert", "O(log n)"], ["Extract-min / max", "O(log n)"], ["Peek", "O(1)"], ["Build heap", "O(n)", "not O(n log n)"], ["Search", "O(n)"]],
    pitfalls: [
      "A heap is **partially** ordered — you can peek the min in O(1) but you cannot list everything in sorted order without repeatedly extracting.",
      "Finding or deleting an arbitrary (non-root) element is O(n) unless you keep a side index.",
      "Python's `heapq` is a **min**-heap; for a max-heap, push negated keys.",
    ],
    whenToUse: {
      use: ["Repeatedly need the min/max of a changing set", "Dijkstra / Prim (shortest paths, MST)", "Top-k, median maintenance (two heaps)", "Event-driven simulation, task scheduling by priority"],
      avoid: ["You need full sorted order (just sort)", "You need to search or update arbitrary elements often (a balanced BST fits better)"],
    },
    variants: [
      { name: "d-ary heap", note: "More children per node — shallower tree, faster decrease-key." },
      { name: "Fibonacci heap", note: "O(1) amortized decrease-key; speeds up Dijkstra in theory." },
      { name: "Two-heap median", note: "A max-heap + min-heap track a running median in O(log n)." },
    ],
    realWorld: ["Dijkstra & Prim", "OS priority scheduling", "Huffman coding", "Top-k queries", "A* pathfinding open set"],
    references: [{ book: "CLRS", where: "Ch. 6, Heapsort & §6.5 Priority Queues" }, { book: "Sedgewick & Wayne, Algorithms", where: "§2.4, Priority Queues" }],
    demo: { language: "python", code: `import heapq\nh = []\nfor x in [5, 1, 8, 3, 2]:\n    heapq.heappush(h, x)\nout = []\nwhile h:\n    out.append(heapq.heappop(h))\nprint(out)\n` },
  },

  // ---- Hashing -------------------------------------------------------------
  {
    slug: "hash-map", category: "hashing", title: "Hash Map & Set", premade: "hash-map",
    summary: "Map keys to array buckets via a hash function for average O(1) insert, lookup, and delete. Collisions — different keys landing in the same bucket — are resolved by chaining or probing.",
    keyIdea: "A hash function turns any key into an array index, so you jump straight to where a value lives instead of searching for it. The whole game is spreading keys evenly and handling the inevitable collisions.",
    howItWorks: {
      intro: "Looking up a key in a chained hash table:",
      steps: [
        "Compute `h = hash(key) % numBuckets` — the bucket index, in O(1).",
        "Go directly to `buckets[h]`; no scanning of other buckets.",
        "Walk that bucket's short list, comparing keys, until you find a match (or don't).",
        "With a good hash and a low **load factor** (entries ÷ buckets), each bucket holds ~1 item, so this is O(1) on average.",
        "When the load factor gets high, **resize** (rehash into a bigger table) to keep buckets short.",
      ],
    },
    sections: [
      { heading: "Hash to a bucket", body: "A hash function turns a key into a bucket index. Different keys can land in the same bucket — a **collision** — which **separate chaining** stores as a small list per bucket, and **open addressing** resolves by probing to the next free slot." },
      { heading: "Average vs worst", body: "With a good hash and a low load factor, operations are **O(1) on average**. The worst case — every key in one bucket — degrades to O(n), which is also the basis of algorithmic-complexity (hash-flooding) attacks; that's why real hash tables randomize their seed and resize to keep the load factor low." },
      { heading: "A set is a map without values", body: "A **hash set** is the same machinery storing only keys — membership testing in O(1). Reach for it whenever you're asking 'have I seen this before?' (dedup, visited-marking, two-sum)." },
    ],
    complexity: [["Insert (avg)", "O(1)"], ["Lookup (avg)", "O(1)"], ["Delete (avg)", "O(1)"], ["Worst case", "O(n)", "adversarial / bad hash"], ["Space", "O(n)"]],
    pitfalls: [
      "Hash maps have **no order** — don't rely on iteration order (use a tree map or an ordered dict if you need it).",
      "Mutating a key after insertion (or using an unhashable/mutable key) corrupts lookups.",
      "Worst-case O(n) is real under adversarial input — randomize the hash seed for untrusted keys.",
      "A poor hash function that clusters keys quietly destroys the O(1) promise.",
    ],
    whenToUse: {
      use: ["Fast membership / dedup ('have I seen this?')", "Counting frequencies", "Caching / memoization", "Joining data on a key", "Two-sum-style complement lookups"],
      avoid: ["You need **sorted** order or range queries (use a balanced BST / tree map)", "Keys aren't hashable, or worst-case guarantees are required (real-time systems)"],
    },
    variants: [
      { name: "Open addressing", note: "Store collisions in the table itself via linear/quadratic probing or double hashing — cache-friendly." },
      { name: "Ordered / linked hash map", note: "Preserves insertion order (Python 3.7+ dicts, `LinkedHashMap`)." },
      { name: "Consistent hashing", note: "Distributes keys across servers so adding one moves few keys — the backbone of distributed caches." },
    ],
    realWorld: ["Language dictionaries/objects (`dict`, `Map`, `HashMap`)", "Database indexes & joins", "Caches (LRU = hash map + linked list)", "De-duplication, `git` object store", "Symbol tables in compilers"],
    references: [{ book: "CLRS", where: "Ch. 11, Hash Tables" }, { book: "Sedgewick & Wayne, Algorithms", where: "§3.4, Hash Tables" }, { book: "Skiena, The Algorithm Design Manual", where: "§3.7, Hashing" }],
    demo: { language: "python", code: `# count word frequencies with a dict (hash map)\nwords = ["a", "b", "a", "c", "b", "a"]\ncount = {}\nfor w in words:\n    count[w] = count.get(w, 0) + 1\nprint(count)\n` },
  },
];
