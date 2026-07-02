// Docs topics: dynamic programming, greedy, and bit manipulation.

export const dpGreedyTopics = [
  // ---- Dynamic programming -------------------------------------------------
  {
    slug: "knapsack", category: "dp", title: "0/1 Knapsack", premade: "dp-knapsack",
    summary: "Choose a subset of items (each taken once) to maximize value within a weight capacity. Classic 2-D dynamic programming.",
    sections: [
      { heading: "Take it or leave it", body: "dp[i][w] is the best value using the first i items within capacity w. Each item is either skipped (dp[i-1][w]) or taken (dp[i-1][w-weight] + value)." },
      { heading: "Filling the table", body: "Build the table row by row; each cell reads two cells from the row above. The visualizer draws arrows to exactly those dependencies." },
    ],
    complexity: [["Time", "O(n·W)"], ["Space", "O(n·W)"]],
    demo: { language: "python", code: `weights = [2, 3, 4, 5]\nvalues = [3, 4, 5, 6]\nW = 8\nn = len(weights)\ndp = [[0] * (W + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for w in range(W + 1):\n        dp[i][w] = dp[i - 1][w]\n        if weights[i - 1] <= w:\n            take = dp[i - 1][w - weights[i - 1]] + values[i - 1]\n            if take > dp[i][w]:\n                dp[i][w] = take\nprint(dp[n][W])\n` },
  },
  {
    slug: "lcs", category: "dp", title: "Longest Common Subsequence", premade: "dp-lcs",
    summary: "Find the longest subsequence common to two strings. A 2-D DP where matches extend the diagonal.",
    sections: [
      { heading: "Match or skip", body: "If the current characters match, dp[i][j] = dp[i-1][j-1] + 1. Otherwise take the better of dropping a character from either string: max(dp[i-1][j], dp[i][j-1])." },
      { heading: "Reading the answer", body: "The bottom-right cell holds the LCS length; backtracking through the table recovers the subsequence itself." },
    ],
    complexity: [["Time", "O(n·m)"], ["Space", "O(n·m)"]],
    demo: { language: "python", code: `X, Y = "AGCAT", "GAC"\nn, m = len(X), len(Y)\ndp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        if X[i - 1] == Y[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1] + 1\n        else:\n            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\nprint(dp[n][m])\n` },
  },
  {
    slug: "lis", category: "dp", title: "Longest Increasing Subsequence",
    summary: "Find the length of the longest strictly increasing subsequence. O(n²) DP, or O(n log n) with patience sorting.",
    sections: [
      { heading: "DP definition", body: "dp[i] is the length of the LIS ending at index i: 1 plus the best dp[j] for any earlier j with a smaller value. The answer is the max over all dp[i]." },
      { heading: "Faster variant", body: "Maintaining the smallest tail for each length with binary search drops it to O(n log n) — a classic interview follow-up." },
    ],
    complexity: [["Time (DP)", "O(n²)"], ["Time (binary search)", "O(n log n)"]],
    demo: { language: "python", code: `a = [10, 9, 2, 5, 3, 7, 101, 18]\nn = len(a)\ndp = [1] * n\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i] and dp[j] + 1 > dp[i]:\n            dp[i] = dp[j] + 1\nprint(max(dp))\n` },
  },
  {
    slug: "edit-distance", category: "dp", title: "Edit Distance",
    summary: "The minimum insertions, deletions, or substitutions to turn one string into another (Levenshtein distance). 2-D DP.",
    sections: [
      { heading: "Three operations", body: "If the characters match, carry the diagonal. Otherwise dp[i][j] = 1 + min(insert, delete, substitute) — the three neighbouring cells." },
      { heading: "Uses", body: "Spell-checkers, diff tools, DNA alignment. The table's bottom-right cell is the answer." },
    ],
    complexity: [["Time", "O(n·m)"], ["Space", "O(n·m)"]],
    demo: { language: "python", code: `a, b = "horse", "ros"\nn, m = len(a), len(b)\ndp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(n + 1):\n    dp[i][0] = i\nfor j in range(m + 1):\n    dp[0][j] = j\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        if a[i - 1] == b[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1]\n        else:\n            dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\nprint(dp[n][m])\n` },
  },
  {
    slug: "coin-change", category: "dp", title: "Coin Change", premade: "dp-coin-change",
    summary: "Make a target amount with the fewest coins from given denominations. Bottom-up DP over amounts.",
    sections: [
      { heading: "Build up amounts", body: "dp[a] is the fewest coins to make amount a: for each coin, dp[a] = min(dp[a], dp[a - coin] + 1). Start from 0 and work up to the target." },
      { heading: "Unbounded", body: "Coins can be reused, so each coin's loop runs left-to-right over amounts — different from the 0/1 knapsack's order." },
    ],
    complexity: [["Time", "O(n·A)"], ["Space", "O(A)"]],
    demo: { language: "python", code: `coins = [1, 3, 4]\namount = 6\nINF = amount + 1\ndp = [0] + [INF] * amount\nfor a in range(1, amount + 1):\n    for c in coins:\n        if c <= a and dp[a - c] + 1 < dp[a]:\n            dp[a] = dp[a - c] + 1\nprint(dp[amount] if dp[amount] != INF else -1)\n` },
  },
  {
    slug: "unique-paths", category: "dp", title: "Unique Grid Paths", premade: "dp-unique-paths",
    summary: "Count the paths from the top-left to the bottom-right of a grid, moving only right or down. dp[i][j] = dp[i-1][j] + dp[i][j-1].",
    sections: [
      { heading: "Sum the two ways in", body: "You can reach a cell only from above or from the left, so its path count is the sum of those two cells. The edges have exactly one path." },
      { heading: "Combinatorial shortcut", body: "For an m×n grid the answer is C(m+n-2, m-1), but the DP generalizes cleanly when obstacles are added." },
    ],
    complexity: [["Time", "O(m·n)"], ["Space", "O(m·n)"]],
    demo: { language: "python", code: `m, n = 3, 4\ndp = [[1] * n for _ in range(m)]\nfor i in range(1, m):\n    for j in range(1, n):\n        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]\nprint(dp[m - 1][n - 1])\n` },
  },
  {
    slug: "subset-sum", category: "dp", title: "Subset Sum",
    summary: "Decide whether some subset of numbers adds up to a target. A boolean DP closely related to 0/1 knapsack.",
    sections: [
      { heading: "Reachable sums", body: "dp[s] is true if some subset sums to s. For each number, mark s reachable if s - number was reachable. Iterate sums downward to keep it 0/1." },
      { heading: "Pseudo-polynomial", body: "Runtime depends on the target value, not just the count of numbers — fine for small targets, exponential-feeling for huge ones." },
    ],
    complexity: [["Time", "O(n·S)"], ["Space", "O(S)"]],
    demo: { language: "python", code: `nums = [3, 34, 4, 12, 5, 2]\ntarget = 9\ndp = [False] * (target + 1)\ndp[0] = True\nfor x in nums:\n    for s in range(target, x - 1, -1):\n        if dp[s - x]:\n            dp[s] = True\nprint(dp[target])\n` },
  },
  {
    slug: "matrix-chain", category: "dp", title: "Matrix Chain Multiplication",
    summary: "Find the cheapest way to parenthesize a chain of matrix multiplications. Interval DP over subchains.",
    sections: [
      { heading: "Split points", body: "dp[i][j] is the min cost to multiply matrices i..j. Try every split k between them: cost of left + cost of right + the cost of the final multiply." },
      { heading: "Interval DP", body: "Solve short intervals first, then longer ones built from them — the template for many range-based DP problems." },
    ],
    complexity: [["Time", "O(n³)"], ["Space", "O(n²)"]],
    demo: { language: "python", code: `# dims: matrices are p[i-1] x p[i]\np = [10, 30, 5, 60]\nn = len(p) - 1\ndp = [[0] * n for _ in range(n)]\nfor length in range(2, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        dp[i][j] = float("inf")\n        for k in range(i, j):\n            cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1]\n            if cost < dp[i][j]:\n                dp[i][j] = cost\nprint(dp[0][n - 1])\n` },
  },

  // ---- Greedy --------------------------------------------------------------
  {
    slug: "activity-selection", category: "greedy", title: "Activity Selection", premade: "activity-selection",
    summary: "Select the maximum number of non-overlapping activities by always taking the one that finishes earliest.",
    sections: [
      { heading: "Earliest finish wins", body: "Sort by finish time and greedily keep each activity that starts after the last kept one ends. Finishing early leaves the most room for the rest." },
      { heading: "Why greedy is optimal", body: "An exchange argument shows the earliest-finishing choice is never worse than any other — a textbook example of a provably correct greedy." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `acts = [(1, 3), (2, 5), (4, 6), (6, 7), (5, 8), (7, 9)]\nacts.sort(key=lambda x: x[1])\ncount = 0\nlast_end = -1\nfor s, e in acts:\n    if s >= last_end:\n        count += 1\n        last_end = e\nprint(count)\n` },
  },
  {
    slug: "fractional-knapsack", category: "greedy", title: "Fractional Knapsack", premade: "fractional-knapsack",
    summary: "Maximize value in a capacity-limited knapsack when items can be split, by taking the highest value-to-weight ratio first.",
    sections: [
      { heading: "Densest first", body: "Sort by value/weight and fill greedily; split the last item to top off the capacity exactly. Splitting is what makes greedy optimal here." },
      { heading: "Contrast with 0/1", body: "If items can't be split, greedy fails and you need DP. The ability to take fractions is the crucial difference." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(1)"]],
    demo: { language: "python", code: `items = [(10, 2), (5, 3), (15, 5), (7, 7), (6, 1)]  # (value, weight)\nitems.sort(key=lambda it: it[0] / it[1], reverse=True)\ncap = 15\ntotal = 0.0\nfor v, w in items:\n    if cap <= 0:\n        break\n    take = min(w, cap)\n    total += v * (take / w)\n    cap -= take\nprint(round(total, 1))\n` },
  },
  {
    slug: "huffman", category: "greedy", title: "Huffman Coding", premade: "huffman",
    summary: "Build an optimal prefix code by repeatedly merging the two lowest-frequency symbols. Frequent symbols get shorter codes.",
    sections: [
      { heading: "Merge the smallest", body: "Put each symbol in a min-heap by frequency. Pop the two smallest, merge them into a node whose frequency is their sum, and push it back. Repeat until one tree remains." },
      { heading: "Prefix-free codes", body: "Left = 0, right = 1 along the tree gives codes where no code is a prefix of another, so the stream decodes unambiguously — the heart of compression." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `import heapq\nfreq = {"a": 5, "b": 9, "c": 12, "d": 13, "e": 16, "f": 45}\nheap = [[f, sym] for sym, f in freq.items()]\nheapq.heapify(heap)\nwhile len(heap) > 1:\n    lo = heapq.heappop(heap)\n    hi = heapq.heappop(heap)\n    heapq.heappush(heap, [lo[0] + hi[0], lo, hi])\nprint(heap[0][0])  # total frequency at the root\n` },
  },
  {
    slug: "job-sequencing", category: "greedy", title: "Job Sequencing",
    summary: "Schedule jobs with deadlines and profits to maximize profit, one job per time slot, by taking the most profitable jobs first.",
    sections: [
      { heading: "Profit first, latest slot", body: "Sort jobs by profit descending; place each in the latest free slot before its deadline. Filling later slots first keeps earlier slots open for tighter deadlines." },
      { heading: "Disjoint slots", body: "A union-find over time slots makes 'find the latest free slot' near-constant, speeding the scheduling." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `# (deadline, profit)\njobs = [(2, 100), (1, 19), (2, 27), (1, 25), (3, 15)]\njobs.sort(key=lambda j: j[1], reverse=True)\nmax_d = max(d for d, _ in jobs)\nslots = [False] * (max_d + 1)\nprofit = 0\nfor d, p in jobs:\n    t = d\n    while t > 0 and slots[t]:\n        t -= 1\n    if t > 0:\n        slots[t] = True\n        profit += p\nprint(profit)\n` },
  },

  // ---- Bit manipulation ----------------------------------------------------
  {
    slug: "bit-manipulation", category: "bits", title: "Bit Manipulation",
    summary: "Work directly on the binary representation of integers with AND, OR, XOR, NOT, and shifts — often the fastest way to do set-like operations.",
    sections: [
      { heading: "Core tricks", body: "x & 1 tests the lowest bit; x >> 1 divides by two; x & (x-1) clears the lowest set bit; x ^ y swaps without a temp. XOR of a list cancels duplicates, leaving the unique element." },
      { heading: "Bitmasks", body: "An integer can represent a subset: bit i set means element i is included. Iterating 0..2^n-1 enumerates all subsets — the basis of bitmask DP." },
    ],
    complexity: [["Per operation", "O(1)"], ["Count set bits", "O(#bits)"]],
    demo: { language: "python", code: `x = 13          # 1101\nprint(x & 1)     # lowest bit -> 1\nprint(x >> 1)    # 6\nprint(bin(x))\n# count set bits with x & (x-1)\ncount = 0\nn = x\nwhile n:\n    n &= n - 1\n    count += 1\nprint(count)\n` },
  },
];
