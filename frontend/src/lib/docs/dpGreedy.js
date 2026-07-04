// Docs topics: dynamic programming, greedy, and bit manipulation.
// Rich fields render via DocArticle.

export const dpGreedyTopics = [
  // ---- Dynamic programming -------------------------------------------------
  {
    slug: "knapsack", category: "dp", title: "0/1 Knapsack", premade: "dp-knapsack",
    summary: "Choose a subset of items (each taken at most once) to maximize value within a weight capacity. The canonical 2-D dynamic program.",
    keyIdea: "For each item you face one binary choice — take it or leave it — and the best answer for the first `i` items at capacity `w` is built from the best answer for the first `i−1`.",
    howItWorks: {
      intro: "Fill a table `dp[i][w]` = best value using items `1…i` within capacity `w`:",
      steps: [
        "Base row: with **zero items**, every capacity holds value 0.",
        "For item `i` at capacity `w`, the **leave-it** option is `dp[i-1][w]` (ignore the item).",
        "The **take-it** option (only if it fits) is `dp[i-1][w - weight_i] + value_i`.",
        "`dp[i][w]` = the max of those two — each cell reads two cells from the row above.",
        "The answer is `dp[n][W]`; backtracking the choices recovers *which* items.",
      ],
    },
    sections: [
      { heading: "Take it or leave it", body: "`dp[i][w]` is the best value using the first `i` items within capacity `w`. Each item is either **skipped** (`dp[i-1][w]`) or **taken** (`dp[i-1][w-weight] + value`). This exhibits the two hallmarks of DP: **optimal substructure** (the best overall uses best sub-solutions) and **overlapping sub-problems** (the same `dp[i][w]` is needed many times)." },
      { heading: "Filling the table", body: "Build the table row by row; each cell depends on two cells from the previous row, so the order matters. You can compress it to a **1-D array** updated **right-to-left** (so each item is used at most once). The visualizer draws arrows to exactly the cells each step reads." },
    ],
    complexity: [["Time", "O(n·W)"], ["Space", "O(n·W)", "→ O(W) rolling"], ["Note", "pseudo-polynomial", "depends on the value of W"]],
    pitfalls: [
      "It's **pseudo-polynomial** — `O(n·W)` blows up when `W` is huge (knapsack is NP-hard in general).",
      "The 1-D optimization must iterate capacity **downward** for 0/1 (upward would reuse an item).",
      "Don't confuse with **fractional** knapsack (which a greedy solves) or **unbounded** (reuse allowed).",
    ],
    whenToUse: {
      use: ["Subset selection under a budget/capacity", "Resource allocation with discrete items", "Any 'pick-or-skip with a constraint total'"],
      avoid: ["Items are divisible → **greedy fractional knapsack**", "`W` is astronomically large (use approximation / meet-in-the-middle)"],
    },
    variants: [
      { name: "Unbounded knapsack", note: "Items reusable — iterate capacity upward (coin change is this)." },
      { name: "Bounded / multiple", note: "Each item has a limited count — binary-split into powers of two." },
      { name: "Meet in the middle", note: "Split items in half → O(2^(n/2)) when W is huge." },
    ],
    realWorld: ["Budget allocation", "Cargo / cutting-stock loading", "Portfolio selection", "Ad / resource packing"],
    references: [{ book: "CLRS", where: "Ch. 14/15, Dynamic Programming" }, { book: "Skiena", where: "§10.5, The Partition Problem & Knapsack" }],
    demo: { language: "python", code: `weights = [2, 3, 4, 5]\nvalues = [3, 4, 5, 6]\nW = 8\nn = len(weights)\ndp = [[0] * (W + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for w in range(W + 1):\n        dp[i][w] = dp[i - 1][w]\n        if weights[i - 1] <= w:\n            take = dp[i - 1][w - weights[i - 1]] + values[i - 1]\n            if take > dp[i][w]:\n                dp[i][w] = take\nprint(dp[n][W])\n` },
  },
  {
    slug: "lcs", category: "dp", title: "Longest Common Subsequence", premade: "dp-lcs",
    summary: "Find the longest subsequence common to two strings (characters in order, not necessarily contiguous). A 2-D DP where a match extends the diagonal.",
    keyIdea: "Compare the two strings' last characters: if they match, that character is in the LCS and you shrink both; if not, the LCS ignores one of them — take the better choice.",
    howItWorks: {
      intro: "Fill `dp[i][j]` = LCS length of the first `i` chars of X and first `j` of Y:",
      steps: [
        "Empty-string base cases: `dp[0][j] = dp[i][0] = 0`.",
        "If `X[i-1] == Y[j-1]`, the characters match: `dp[i][j] = dp[i-1][j-1] + 1` (extend the diagonal).",
        "Otherwise drop the last char of **one** string: `dp[i][j] = max(dp[i-1][j], dp[i][j-1])`.",
        "`dp[n][m]` is the LCS length; walking back through the choices reconstructs the subsequence.",
      ],
    },
    sections: [
      { heading: "Match or skip", body: "If the current characters match, `dp[i][j] = dp[i-1][j-1] + 1` — the match joins the LCS and both strings shrink. Otherwise take the better of dropping a character from either string: `max(dp[i-1][j], dp[i][j-1])`. Every cell reads three neighbours (up, left, up-left)." },
      { heading: "Reading the answer", body: "The bottom-right cell holds the LCS **length**; **backtracking** through the table (following where each value came from) recovers the subsequence itself. LCS is the engine behind `diff` and version-control merges — the 'common' lines are the LCS, and the rest are insertions/deletions." },
    ],
    complexity: [["Time", "O(n·m)"], ["Space", "O(n·m)", "→ O(min(n,m)) for length only"]],
    pitfalls: [
      "**Subsequence** (order preserved, gaps allowed) ≠ **substring** (contiguous) — different DP.",
      "Recovering the actual subsequence needs the full table (or Hirschberg's trick) — the 1-D space trick only gives the length.",
      "Off-by-one between string indices (`X[i-1]`) and table indices (`dp[i][j]`).",
    ],
    whenToUse: {
      use: ["`diff` / merge tools", "DNA / protein sequence alignment", "Plagiarism & similarity detection", "Version control"],
      avoid: ["You need contiguous matches (that's longest common **substring**)"],
    },
    variants: [
      { name: "Edit distance", note: "Same table shape, minimizing operations instead of matches." },
      { name: "Longest common substring", note: "Contiguous — reset to 0 on a mismatch." },
      { name: "Hirschberg's algorithm", note: "Recovers the LCS in O(nm) time but O(min(n,m)) space." },
    ],
    realWorld: ["`git diff` / `diff`", "Bioinformatics alignment (BLAST cousins)", "Spell/grammar suggestions", "Data-sync reconciliation"],
    references: [{ book: "CLRS", where: "§14.4, Longest Common Subsequence" }, { book: "Skiena", where: "§10.7, The Longest Common Subsequence" }],
    demo: { language: "python", code: `X, Y = "AGCAT", "GAC"\nn, m = len(X), len(Y)\ndp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        if X[i - 1] == Y[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1] + 1\n        else:\n            dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])\nprint(dp[n][m])\n` },
  },
  {
    slug: "lis", category: "dp", title: "Longest Increasing Subsequence",
    summary: "Find the length of the longest strictly increasing subsequence. An intuitive O(n²) DP, or a slick O(n log n) with binary search.",
    keyIdea: "The longest increasing run ending at `i` extends the best earlier run that ends on a smaller value — or, cleverly, keep only the smallest possible tail for each length.",
    howItWorks: {
      intro: "The O(n log n) 'patience' method beats the O(n²) DP:",
      steps: [
        "Keep a list `tails`, where `tails[k]` is the **smallest possible tail** of an increasing subsequence of length `k+1`.",
        "For each element `x`, **binary-search** the first tail `≥ x`.",
        "If found, replace it with `x` (a better, smaller tail for that length); if not, append `x` (a new longest length).",
        "`tails` stays sorted throughout; its **length** is the LIS length (its contents aren't the actual subsequence).",
      ],
    },
    sections: [
      { heading: "The O(n²) DP", body: "`dp[i]` is the length of the LIS **ending at** index `i`: one plus the best `dp[j]` over earlier indices `j` with `a[j] < a[i]`. The answer is the max over all `dp[i]`. Simple and clear, but quadratic." },
      { heading: "The O(n log n) speed-up", body: "Maintain the **smallest tail** for each achievable length and binary-search where each new value fits (this is patience sorting). The `tails` array's length is the LIS length. It's a classic interview follow-up and connects to Dilworth's theorem and the Robinson–Schensted correspondence." },
    ],
    complexity: [["Time (DP)", "O(n²)"], ["Time (patience)", "O(n log n)"], ["Space", "O(n)"]],
    pitfalls: [
      "The `tails` array is **not** the LIS itself — only its length is meaningful (reconstruct separately if needed).",
      "**Strictly** vs **non-decreasing** changes the binary search (`bisect_left` vs `bisect_right`).",
      "The O(n²) version is fine for small n but times out on large inputs.",
    ],
    whenToUse: {
      use: ["Longest increasing/decreasing run", "Box/envelope stacking, patience games", "Scheduling by a monotone key"],
      avoid: ["You need the subsequence, not just its length, and skip the reconstruction step"],
    },
    variants: [
      { name: "Longest non-decreasing", note: "Allow equal elements — switch the binary-search side." },
      { name: "Russian doll envelopes", note: "2-D LIS after sorting one dimension." },
    ],
    realWorld: ["Version compatibility chains", "Stacking / nesting problems", "Trend analysis on sequences"],
    references: [{ book: "CLRS", where: "Problem 14-4, Longest simple ... (LIS discussion)" }, { book: "Skiena", where: "§10.7, LIS" }],
    demo: { language: "python", code: `a = [10, 9, 2, 5, 3, 7, 101, 18]\nn = len(a)\ndp = [1] * n\nfor i in range(n):\n    for j in range(i):\n        if a[j] < a[i] and dp[j] + 1 > dp[i]:\n            dp[i] = dp[j] + 1\nprint(max(dp))\n` },
  },
  {
    slug: "edit-distance", category: "dp", title: "Edit Distance",
    summary: "The minimum insertions, deletions, or substitutions to turn one string into another (Levenshtein distance). A 2-D DP that powers spell-check and diff.",
    keyIdea: "To transform the first `i` characters into the first `j`, either the last characters already match (free), or you pay 1 for the cheapest of insert, delete, or substitute.",
    howItWorks: {
      intro: "Fill `dp[i][j]` = min edits to turn `a[0…i-1]` into `b[0…j-1]`:",
      steps: [
        "Base cases: turning a length-`i` string into empty costs `i` deletions (`dp[i][0] = i`), and vice versa (`dp[0][j] = j`).",
        "If `a[i-1] == b[j-1]`, no edit is needed — carry the **diagonal** `dp[i-1][j-1]`.",
        "Otherwise pay 1 plus the **min** of: `dp[i-1][j]` (delete), `dp[i][j-1]` (insert), `dp[i-1][j-1]` (substitute).",
        "`dp[n][m]` is the answer; the path back through the table is the actual edit script.",
      ],
    },
    sections: [
      { heading: "Three operations", body: "If the characters match, carry the diagonal. Otherwise `dp[i][j] = 1 + min(insert, delete, substitute)` — the cell to the left, above, and diagonally up-left. It's the same table shape as LCS, but minimizing operations instead of maximizing matches." },
      { heading: "Uses & tuning", body: "Spell-checkers rank suggestions by edit distance; `diff` and DNA alignment are close cousins. Real systems weight the operations (a substitution might cost 2), cap the distance for speed (**Ukkonen's band**), or add **transposition** (Damerau–Levenshtein) to catch swapped letters like 'teh'." },
    ],
    complexity: [["Time", "O(n·m)"], ["Space", "O(n·m)", "→ O(min(n,m)) for the value"]],
    pitfalls: [
      "Getting the base row/column wrong (they're `i` and `j`, not `0`) breaks everything.",
      "The 1-D space optimization loses the ability to reconstruct the edit script.",
      "Confusing the three neighbours (insert/delete/substitute map to left/up/diagonal).",
    ],
    whenToUse: {
      use: ["Spell-check & autocorrect ranking", "Fuzzy string matching / search", "DNA / sequence alignment", "`diff` on characters"],
      avoid: ["Very long strings without banding (O(nm) is too slow)"],
    },
    variants: [
      { name: "Damerau–Levenshtein", note: "Adds transposition (swap adjacent) — catches typos better." },
      { name: "Weighted edit distance", note: "Different costs per operation / character pair." },
      { name: "Ukkonen's banded DP", note: "Only compute a diagonal band when the distance is small." },
    ],
    realWorld: ["Autocorrect & 'did you mean?'", "Fuzzy search / record linkage", "Bioinformatics alignment", "Plagiarism detection"],
    references: [{ book: "CLRS", where: "Problem 14-5, Edit distance" }, { book: "Levenshtein (1966)", where: "Binary codes capable of correcting deletions/insertions" }],
    demo: { language: "python", code: `a, b = "horse", "ros"\nn, m = len(a), len(b)\ndp = [[0] * (m + 1) for _ in range(n + 1)]\nfor i in range(n + 1):\n    dp[i][0] = i\nfor j in range(m + 1):\n    dp[0][j] = j\nfor i in range(1, n + 1):\n    for j in range(1, m + 1):\n        if a[i - 1] == b[j - 1]:\n            dp[i][j] = dp[i - 1][j - 1]\n        else:\n            dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])\nprint(dp[n][m])\n` },
  },
  {
    slug: "coin-change", category: "dp", title: "Coin Change", premade: "dp-coin-change",
    summary: "Make a target amount with the fewest coins from given denominations. A bottom-up DP over amounts — and a cautionary tale about when greedy fails.",
    keyIdea: "The best way to make amount `a` is one coin plus the best way to make `a − coin`; build answers from `0` up to the target.",
    howItWorks: {
      intro: "Fill `dp[a]` = fewest coins to make amount `a`:",
      steps: [
        "`dp[0] = 0` (zero coins make zero); everything else starts at ∞.",
        "For each amount `a` from 1 to the target, try every coin that fits.",
        "Relax: `dp[a] = min(dp[a], dp[a - coin] + 1)`.",
        "`dp[target]` is the answer (or −1 if it's still ∞ — the amount is unmakeable).",
      ],
    },
    sections: [
      { heading: "Build up amounts", body: "`dp[a]` is the fewest coins to make amount `a`: for each coin, `dp[a] = min(dp[a], dp[a-coin] + 1)`. Start from 0 and work up to the target, so every sub-amount is already solved when you need it." },
      { heading: "Why not greedy?", body: "Grabbing the largest coin first works for 'nice' currency systems (like real coins) but **fails in general**: with coins `{1, 3, 4}` for amount 6, greedy takes `4 + 1 + 1` (3 coins) while the optimum is `3 + 3` (2 coins). That failure is exactly why coin change needs **DP**, not greed. Because coins are reusable, this is an **unbounded knapsack**." },
    ],
    complexity: [["Time", "O(n·A)", "n coins, amount A"], ["Space", "O(A)"]],
    pitfalls: [
      "**Greedy is wrong** for arbitrary denominations — always use DP unless the coin system is provably canonical.",
      "Return −1 (unmakeable) when `dp[target]` stays ∞ — don't report a bogus count.",
      "'Fewest coins' vs 'number of ways to make change' are different DPs (min vs sum, and loop order differs).",
    ],
    whenToUse: {
      use: ["Minimum-items-to-reach-a-total", "Making change / cashier systems", "Unbounded knapsack framing"],
      avoid: ["Provably-canonical coin systems where greedy is proven optimal (faster)"],
    },
    variants: [
      { name: "Count the ways", note: "Sum instead of min; iterate coins outside amounts to avoid double-counting." },
      { name: "Bounded coins", note: "Limited supply of each denomination — 0/1-style." },
    ],
    realWorld: ["Vending machines / cashiers", "Making optimal token combinations", "Resource-unit minimization"],
    references: [{ book: "CLRS", where: "Ch. 14/15, DP; §15.1 greedy vs DP" }, { book: "Kleinberg & Tardos, Algorithm Design", where: "Ch. 6, Dynamic Programming" }],
    demo: { language: "python", code: `coins = [1, 3, 4]\namount = 6\nINF = amount + 1\ndp = [0] + [INF] * amount\nfor a in range(1, amount + 1):\n    for c in coins:\n        if c <= a and dp[a - c] + 1 < dp[a]:\n            dp[a] = dp[a - c] + 1\nprint(dp[amount] if dp[amount] != INF else -1)\n` },
  },
  {
    slug: "unique-paths", category: "dp", title: "Unique Grid Paths", premade: "dp-unique-paths",
    summary: "Count the paths from the top-left to the bottom-right of a grid, moving only right or down — the gentlest possible introduction to grid DP.",
    keyIdea: "You can only enter a cell from above or from the left, so the number of ways to reach it is the sum of the ways to reach those two neighbours.",
    howItWorks: {
      intro: "Fill `dp[i][j]` = number of paths to cell `(i, j)`:",
      steps: [
        "The top row and left column each have exactly **one** path (all right, or all down).",
        "Every other cell is reachable only from **above** `(i-1, j)` or the **left** `(i, j-1)`.",
        "So `dp[i][j] = dp[i-1][j] + dp[i][j-1]`.",
        "`dp[m-1][n-1]` is the total. One row of `dp` can be reused to make it **O(n) space**.",
      ],
    },
    sections: [
      { heading: "Sum the two ways in", body: "You can reach a cell only from above or from the left, so its path count is the sum of those two cells' counts. The edges have exactly one path each, which seeds the recurrence. This 'sum of predecessors' pattern generalizes to counting DPs everywhere." },
      { heading: "Combinatorial shortcut (and why DP still wins)", body: "For a clean `m×n` grid the answer is the binomial coefficient `C(m+n-2, m-1)` — you're choosing which of the `m+n-2` moves go down. But add **obstacles**, weights, or costs and the closed form breaks while the DP adapts by simply zeroing blocked cells — a good lesson in DP's flexibility." },
    ],
    complexity: [["Time", "O(m·n)"], ["Space", "O(m·n)", "→ O(n) rolling row"]],
    pitfalls: [
      "Forgetting to seed the first row/column with 1s leaves the whole grid at 0.",
      "With obstacles, a blocked cell's path count is 0 (not skipped) so it stops propagation.",
      "Large grids overflow fixed integers — the counts grow combinatorially.",
    ],
    whenToUse: {
      use: ["Counting monotone lattice paths", "Grid DP with obstacles / costs", "Teaching 2-D DP"],
      avoid: ["Clean grids with no obstacles (the binomial formula is O(1))"],
    },
    variants: [
      { name: "Minimum path sum", note: "min instead of sum — cheapest route through a weighted grid." },
      { name: "Paths with obstacles", note: "Zero out blocked cells; everything else is identical." },
    ],
    realWorld: ["Robot / grid pathfinding counts", "Lattice-path combinatorics", "Probability on grids"],
    references: [{ book: "CLRS", where: "Ch. 14, DP on grids (rod-cutting style)" }, { book: "Concrete Mathematics", where: "Ch. 5, Binomial Coefficients" }],
    demo: { language: "python", code: `m, n = 3, 4\ndp = [[1] * n for _ in range(m)]\nfor i in range(1, m):\n    for j in range(1, n):\n        dp[i][j] = dp[i - 1][j] + dp[i][j - 1]\nprint(dp[m - 1][n - 1])\n` },
  },
  {
    slug: "subset-sum", category: "dp", title: "Subset Sum",
    summary: "Decide whether some subset of numbers adds up to a target. A boolean DP that's the decision-problem sibling of 0/1 knapsack.",
    keyIdea: "A sum `s` is reachable if it was already reachable, or if `s − x` was reachable before you considered `x`. Track reachable sums as a set of booleans.",
    howItWorks: {
      intro: "Fill `dp[s]` = 'can some subset make exactly `s`?':",
      steps: [
        "`dp[0] = True` — the empty subset makes 0.",
        "For each number `x`, update sums from the target **downward** to `x`.",
        "`dp[s]` becomes True if `dp[s - x]` was already True (i.e. add `x` to that subset).",
        "Iterating downward ensures each number is used **at most once** (the 0/1 rule).",
        "`dp[target]` answers the question.",
      ],
    },
    sections: [
      { heading: "Reachable sums", body: "`dp[s]` is True if some subset sums to `s`. For each number, mark `s` reachable when `s − number` was reachable. Iterate sums **downward** (target → number) so a number isn't counted twice — the same trick as 1-D 0/1 knapsack." },
      { heading: "Pseudo-polynomial", body: "Runtime is `O(n·S)` — it depends on the **value** of the target `S`, not just the count of numbers. That's fine for small targets but 'exponential-feeling' for huge ones, which is why subset-sum is **NP-complete** in general. A bitset makes the inner loop blazingly fast (`dp |= dp << x`)." },
    ],
    complexity: [["Time", "O(n·S)"], ["Space", "O(S)"], ["Note", "pseudo-polynomial", "NP-complete in general"]],
    pitfalls: [
      "Iterating sums **upward** turns it into unbounded (each number reusable) — go downward for 0/1.",
      "Large targets make `O(n·S)` impractical — this is NP-complete, after all.",
      "Doesn't handle **negative** numbers without shifting the range.",
    ],
    whenToUse: {
      use: ["Partition into equal halves", "'Can I hit exactly this total?'", "Feasibility before optimizing (knapsack decision)"],
      avoid: ["Huge targets (approximate or meet-in-the-middle)"],
    },
    variants: [
      { name: "Partition equal subset", note: "Subset sum to total/2 — split into two equal halves." },
      { name: "Bitset subset-sum", note: "`dp |= dp << x` — ~64× faster inner loop." },
      { name: "Meet in the middle", note: "O(2^(n/2)) when the target is large but n is small." },
    ],
    realWorld: ["Fair division / partitioning", "Load balancing across two machines", "Cryptography (subset-sum knapsacks)"],
    references: [{ book: "CLRS", where: "§35.5, The Subset-Sum Problem (approximation)" }, { book: "Garey & Johnson", where: "Computers and Intractability (SUBSET-SUM)" }],
    demo: { language: "python", code: `nums = [3, 34, 4, 12, 5, 2]\ntarget = 9\ndp = [False] * (target + 1)\ndp[0] = True\nfor x in nums:\n    for s in range(target, x - 1, -1):\n        if dp[s - x]:\n            dp[s] = True\nprint(dp[target])\n` },
  },
  {
    slug: "matrix-chain", category: "dp", title: "Matrix Chain Multiplication",
    summary: "Find the cheapest way to parenthesize a chain of matrix multiplications. The archetypal interval DP — solve short ranges first, build longer ones from them.",
    keyIdea: "Matrix multiplication is associative, so the *result* never changes — but where you put the parentheses changes the *cost* enormously. Try every split point and keep the cheapest.",
    howItWorks: {
      intro: "Fill `dp[i][j]` = min scalar multiplications to compute the product of matrices `i…j`:",
      steps: [
        "Base case: a single matrix costs `0` (`dp[i][i] = 0`).",
        "Process intervals by **increasing length**, so all shorter sub-chains are already solved.",
        "For interval `i…j`, try every **split point** `k` between `i` and `j`.",
        "Cost = `dp[i][k] + dp[k+1][j]` + the cost of the final multiply (`p[i]·p[k+1]·p[j+1]`).",
        "`dp[i][j]` = the min over all `k`; `dp[0][n-1]` is the answer.",
      ],
    },
    sections: [
      { heading: "Split points", body: "`dp[i][j]` is the min cost to multiply matrices `i…j`. Try every split `k`: the cost is the (already-computed) cost of the left group, plus the right group, plus the single multiplication that joins the two resulting matrices. Because a `p×q` by `q×r` multiply costs `p·q·r`, parenthesization matters a lot — the difference can be orders of magnitude." },
      { heading: "Interval DP template", body: "Solve **short intervals first**, then longer ones built from them — the defining shape of **interval DP**. The same template solves optimal binary search trees, polygon triangulation, burst balloons, and palindrome partitioning. It's `O(n³)`; Knuth's optimization cuts some cases to `O(n²)`." },
    ],
    complexity: [["Time", "O(n³)"], ["Space", "O(n²)"]],
    pitfalls: [
      "The dimension array `p` has `n+1` entries for `n` matrices — off-by-one on `p[i]`, `p[k+1]`, `p[j+1]` is the classic bug.",
      "You **must** fill by increasing interval length, not row by row.",
      "It optimizes the multiplication *cost*, not the numeric result (which is unchanged).",
    ],
    whenToUse: {
      use: ["Optimizing a chain of expensive operations", "Interval / range DP problems", "Optimal BSTs, triangulation, parsing"],
      avoid: ["Only two or three matrices (just compare by hand)"],
    },
    variants: [
      { name: "Optimal BST", note: "Same interval DP, minimizing weighted search cost." },
      { name: "Burst balloons / polygon triangulation", note: "Same 'try every split' template." },
    ],
    realWorld: ["Query optimizers (join ordering)", "Compiler expression scheduling", "Deep-learning tensor-contraction ordering"],
    references: [{ book: "CLRS", where: "§14.2, Matrix-Chain Multiplication" }, { book: "Skiena", where: "§10.4, Context-Free Grammars / interval DP" }],
    demo: { language: "python", code: `# dims: matrices are p[i-1] x p[i]\np = [10, 30, 5, 60]\nn = len(p) - 1\ndp = [[0] * n for _ in range(n)]\nfor length in range(2, n + 1):\n    for i in range(n - length + 1):\n        j = i + length - 1\n        dp[i][j] = float("inf")\n        for k in range(i, j):\n            cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1]\n            if cost < dp[i][j]:\n                dp[i][j] = cost\nprint(dp[0][n - 1])\n` },
  },

  // ---- Greedy --------------------------------------------------------------
  {
    slug: "activity-selection", category: "greedy", title: "Activity Selection", premade: "activity-selection",
    summary: "Select the maximum number of non-overlapping activities by always taking the one that finishes earliest — the poster child for provably-correct greedy.",
    keyIdea: "Finishing as early as possible leaves the most room for everything that follows, so 'earliest finish first' is never a regret.",
    howItWorks: {
      intro: "Sort by finish time, then sweep:",
      steps: [
        "**Sort** the activities by their finish time.",
        "Always take the first (earliest-finishing) activity.",
        "Scan the rest; keep an activity only if it **starts after** the last kept one finishes.",
        "The count of kept activities is optimal — one pass after the sort.",
      ],
    },
    sections: [
      { heading: "Earliest finish wins", body: "Sort by finish time and greedily keep each activity that starts at or after the last kept one ends. Finishing early leaves the most room for the rest — the **greedy-choice property** that makes a local decision globally optimal here." },
      { heading: "Why greedy is optimal (exchange argument)", body: "Suppose an optimal solution didn't start with the earliest-finishing activity. Swap its first activity for the earliest-finishing one: this can't cause a conflict (the new one finishes no later) and doesn't reduce the count. Repeating the swap turns any optimum into the greedy one — so greedy is optimal. This **exchange argument** is the standard way to prove a greedy correct." },
    ],
    complexity: [["Time", "O(n log n)", "the sort dominates"], ["Space", "O(1)"]],
    pitfalls: [
      "Sorting by **start** time (or by duration) is **wrong** — it's finish time that works.",
      "Decide whether touching endpoints (`start == last_end`) count as overlapping for your problem.",
      "Greedy solves *this* problem; weighted interval scheduling needs **DP** instead.",
    ],
    whenToUse: {
      use: ["Maximize count of compatible intervals", "Room / resource scheduling", "Interval partitioning problems"],
      avoid: ["Intervals have **weights/values** (use DP — greedy fails)"],
    },
    variants: [
      { name: "Interval partitioning", note: "Minimum rooms to host all activities — greedy on start times + a heap." },
      { name: "Weighted interval scheduling", note: "Values attached → DP, not greedy." },
    ],
    realWorld: ["Meeting-room booking", "CPU / job scheduling", "Bandwidth allocation", "Event planning"],
    references: [{ book: "CLRS", where: "§15.1, An Activity-Selection Problem" }, { book: "Kleinberg & Tardos", where: "Ch. 4, Greedy Algorithms" }],
    demo: { language: "python", code: `acts = [(1, 3), (2, 5), (4, 6), (6, 7), (5, 8), (7, 9)]\nacts.sort(key=lambda x: x[1])\ncount = 0\nlast_end = -1\nfor s, e in acts:\n    if s >= last_end:\n        count += 1\n        last_end = e\nprint(count)\n` },
  },
  {
    slug: "fractional-knapsack", category: "greedy", title: "Fractional Knapsack", premade: "fractional-knapsack",
    summary: "Maximize value in a capacity-limited knapsack when items can be split, by taking the highest value-to-weight ratio first — where greedy is optimal (unlike 0/1).",
    keyIdea: "If you can take fractions, every unit of capacity should go to the densest value available — so sort by value/weight and pour greedily.",
    howItWorks: {
      intro: "Sort by density, then fill:",
      steps: [
        "Compute each item's **value-to-weight ratio** and sort **descending**.",
        "Take whole items in that order while they fit entirely.",
        "When the next item doesn't fully fit, take the **fraction** that tops off the remaining capacity.",
        "Stop when the knapsack is full — the value is provably maximal.",
      ],
    },
    sections: [
      { heading: "Densest first", body: "Sort by value/weight and fill greedily; split the last item to use the capacity exactly. The ability to take **fractions** is precisely what makes greedy optimal — every bit of capacity is spent on the best remaining value-per-unit, and a fractional top-off means capacity is never wasted." },
      { heading: "Contrast with 0/1", body: "If items **can't** be split, this greedy fails — you might be forced to leave a chunk of capacity empty, and a lower-density item could fill it better. That indivisibility is exactly why **0/1 knapsack needs DP**. Same problem statement, one word ('fractional') different, completely different algorithm — a great lesson in reading problems carefully." },
    ],
    complexity: [["Time", "O(n log n)", "sort by ratio"], ["Space", "O(1)"]],
    pitfalls: [
      "Applying this greedy to **0/1** knapsack gives wrong answers — indivisible items need DP.",
      "Watch integer division when computing ratios (use floats or compare `v1·w2` vs `v2·w1`).",
      "Only the **last** taken item is ever fractional.",
    ],
    whenToUse: {
      use: ["Divisible resources (liquids, bandwidth, time, money)", "Continuous allocation under a budget", "Ratio-based prioritization"],
      avoid: ["Indivisible items (**0/1 knapsack DP**)"],
    },
    references: [{ book: "CLRS", where: "§15.2, greedy vs DP (fractional vs 0/1 knapsack)" }, { book: "Skiena", where: "§1.3, greedy heuristics" }],
    demo: { language: "python", code: `items = [(10, 2), (5, 3), (15, 5), (7, 7), (6, 1)]  # (value, weight)\nitems.sort(key=lambda it: it[0] / it[1], reverse=True)\ncap = 15\ntotal = 0.0\nfor v, w in items:\n    if cap <= 0:\n        break\n    take = min(w, cap)\n    total += v * (take / w)\n    cap -= take\nprint(round(total, 1))\n` },
  },
  {
    slug: "huffman", category: "greedy", title: "Huffman Coding", premade: "huffman",
    summary: "Build an optimal prefix code by repeatedly merging the two lowest-frequency symbols. Frequent symbols get short codes — the classic greedy behind lossless compression.",
    keyIdea: "The two least-frequent symbols deserve the longest codes, so merge them first and let common symbols float toward the root with short codes.",
    howItWorks: {
      intro: "Grow a binary tree bottom-up with a min-heap:",
      steps: [
        "Put every symbol in a **min-heap** keyed by frequency.",
        "**Pop the two smallest**, merge them under a new parent whose frequency is their sum.",
        "**Push** the merged node back into the heap.",
        "Repeat until one tree remains — that's the Huffman tree.",
        "Label left edges `0` and right edges `1`; each symbol's root-to-leaf path is its code.",
      ],
    },
    sections: [
      { heading: "Merge the smallest", body: "Put each symbol in a min-heap by frequency. Pop the two smallest, merge them into a node whose frequency is their sum, and push it back. Repeat until one tree remains. The greedy choice — always merge the two rarest — provably yields a **minimum-weighted-path-length** tree, i.e. the fewest total bits." },
      { heading: "Prefix-free codes", body: "Reading `0` for left and `1` for right along the tree gives codes where **no code is a prefix of another**, so the bitstream decodes unambiguously without separators. Rare symbols sit deep (long codes), common symbols sit shallow (short codes) — that's the compression. Huffman underpins DEFLATE (ZIP, gzip, PNG) and JPEG." },
    ],
    complexity: [["Time", "O(n log n)"], ["Space", "O(n)"]],
    pitfalls: [
      "Ties can produce different (equally optimal) trees — don't assume a unique code.",
      "You must ship the code table (or canonical Huffman) so the decoder can rebuild the tree.",
      "It's optimal only among **per-symbol** codes; arithmetic coding can do better.",
    ],
    whenToUse: {
      use: ["Lossless compression with skewed symbol frequencies", "Entropy coding stages of codecs", "Optimal prefix codes"],
      avoid: ["Near-uniform frequencies (little to gain)", "You need better ratios (arithmetic / range coding)"],
    },
    variants: [
      { name: "Canonical Huffman", note: "Deterministic code assignment — only bit-lengths need shipping." },
      { name: "Adaptive Huffman", note: "Updates the tree as symbols stream — one pass, no table." },
    ],
    realWorld: ["ZIP / gzip (DEFLATE)", "JPEG & MP3 entropy stages", "PNG image compression", "Fax encoding"],
    references: [{ book: "CLRS", where: "§15.3, Huffman Codes" }, { book: "Sedgewick & Wayne", where: "§5.5, Data Compression" }],
    demo: { language: "python", code: `import heapq\nfreq = {"a": 5, "b": 9, "c": 12, "d": 13, "e": 16, "f": 45}\nheap = [[f, sym] for sym, f in freq.items()]\nheapq.heapify(heap)\nwhile len(heap) > 1:\n    lo = heapq.heappop(heap)\n    hi = heapq.heappop(heap)\n    heapq.heappush(heap, [lo[0] + hi[0], lo, hi])\nprint(heap[0][0])  # total frequency at the root\n` },
  },
  {
    slug: "job-sequencing", category: "greedy", title: "Job Sequencing",
    summary: "Schedule jobs with deadlines and profits to maximize profit, one job per time slot, by taking the most profitable jobs first and slotting them as late as possible.",
    keyIdea: "Take the biggest profits first, and place each as late as its deadline allows — leaving the early slots free for future jobs with tighter deadlines.",
    howItWorks: {
      intro: "Greedy by profit, latest-slot placement:",
      steps: [
        "**Sort** jobs by profit, descending.",
        "For each job, look for a **free time slot** at or before its deadline, scanning from the deadline backward.",
        "If a free slot exists, place the job there and add its profit.",
        "Filling the **latest** available slot preserves earlier slots for jobs that can only run early.",
      ],
    },
    sections: [
      { heading: "Profit first, latest slot", body: "Sort jobs by profit descending; place each in the **latest free slot** at or before its deadline. Taking high profits first is the greedy choice; filling later slots first is the crucial refinement — it keeps earlier slots open for jobs with **tighter deadlines** that would otherwise be squeezed out." },
      { heading: "Speeding up slot-finding", body: "The naive backward scan for a free slot is `O(n²)` overall. A **union-find** over time slots — where each slot points to the next free slot at or before it — makes 'find the latest free slot ≤ deadline' near-constant, dropping the whole thing to `O(n log n)` (dominated by the sort). It's a lovely, unexpected application of DSU." },
    ],
    complexity: [["Time (naive)", "O(n²)"], ["Time (union-find)", "O(n log n)"], ["Space", "O(n)"]],
    pitfalls: [
      "Scanning forward for a free slot (instead of backward from the deadline) starves tight-deadline jobs.",
      "1-indexed time slots trip people up (a deadline of `d` means slots `1…d`).",
      "The greedy is optimal for **unit-length** jobs; variable lengths need different methods.",
    ],
    whenToUse: {
      use: ["Deadline-bound tasks with profits, unit duration", "Maximizing reward under a schedule", "Single-machine scheduling"],
      avoid: ["Variable job durations or dependencies (use DP / flow)"],
    },
    variants: [
      { name: "Union-find slots", note: "Near-constant latest-free-slot lookup — the fast version." },
      { name: "Weighted interval scheduling", note: "General durations with values → DP." },
    ],
    realWorld: ["Ad-slot / time-slot auctions", "Single-machine job scheduling", "Deadline-driven task planning"],
    references: [{ book: "Kleinberg & Tardos", where: "Ch. 4, Scheduling to minimize lateness" }, { book: "Skiena", where: "§14.9, Job Scheduling" }],
    demo: { language: "python", code: `# (deadline, profit)\njobs = [(2, 100), (1, 19), (2, 27), (1, 25), (3, 15)]\njobs.sort(key=lambda j: j[1], reverse=True)\nmax_d = max(d for d, _ in jobs)\nslots = [False] * (max_d + 1)\nprofit = 0\nfor d, p in jobs:\n    t = d\n    while t > 0 and slots[t]:\n        t -= 1\n    if t > 0:\n        slots[t] = True\n        profit += p\nprint(profit)\n` },
  },

  // ---- Bit manipulation ----------------------------------------------------
  {
    slug: "bit-manipulation", category: "bits", title: "Bit Manipulation",
    summary: "Work directly on the binary representation of integers with AND, OR, XOR, NOT, and shifts — often the fastest, most compact way to do set-like operations.",
    keyIdea: "An integer is a tiny array of bits you can process 64 at a time in a single instruction; whole-set operations become single AND/OR/XOR ops.",
    howItWorks: {
      intro: "A toolbox of one-instruction tricks:",
      steps: [
        "`x & 1` tests the lowest bit (odd/even); `x >> 1` divides by two, `x << 1` doubles.",
        "`x & (x - 1)` **clears the lowest set bit** — loop it to count set bits (Kernighan's trick).",
        "`x & -x` **isolates** the lowest set bit; `x | (1 << i)` sets bit `i`, `x & ~(1 << i)` clears it.",
        "`a ^ b ^ a == b` — XOR cancels pairs, so XOR-ing a list leaves the one unpaired element.",
        "A bitmask `mask` represents a subset: bit `i` set ⇒ element `i` chosen.",
      ],
    },
    sections: [
      { heading: "Core tricks", body: "`x & 1` tests the lowest bit; `x >> 1` divides by two; `x & (x-1)` clears the lowest set bit; `x ^ y` combines without carry. XOR is the star: XOR-ing a list where every value appears twice except one **cancels the pairs**, leaving the unique element in `O(n)` time and `O(1)` space." },
      { heading: "Bitmasks & bitmask DP", body: "An integer can represent a **subset**: bit `i` set means element `i` is included. Iterating `0 … 2ⁿ-1` enumerates all subsets, and storing DP state indexed by a bitmask (`dp[mask]`) is the technique behind **Travelling Salesman in O(2ⁿ·n²)**, assignment problems, and many 'small-n exponential' DPs. Bitsets also give ~64× constant-factor speedups on set operations." },
    ],
    complexity: [["Per bitwise op", "O(1)"], ["Count set bits (Kernighan)", "O(#set bits)"], ["Enumerate subsets", "O(2ⁿ)"]],
    pitfalls: [
      "**Signedness & width:** right-shifting negatives and fixed-width overflow differ by language.",
      "Operator precedence: `&`/`|`/`^` bind **looser** than `==` — parenthesize (`(x & 1) == 0`).",
      "`1 << n` overflows if `n` ≥ the integer width (use the right type / mask).",
      "Clever bit tricks hurt readability — comment them.",
    ],
    whenToUse: {
      use: ["Compact **sets** over a small universe", "Bitmask DP (TSP, assignment, small-n)", "Flags & permissions, low-level protocols", "Hot loops needing constant-factor speed"],
      avoid: ["Large or sparse universes (use a real hash set)", "When clarity matters more than a micro-optimization"],
    },
    variants: [
      { name: "Population count", note: "Hardware `popcount` / `Integer.bitCount` counts set bits in O(1)." },
      { name: "Bitset", note: "Word-parallel boolean arrays — 64 bits per operation." },
      { name: "Gray code", note: "Successive integers differ by one bit — used in encoders & DP." },
    ],
    realWorld: ["Permission / feature flags", "Chess & board-game bitboards", "Bloom filters & hashing", "Compression, crypto, and codecs", "Bitmask DP in competitive programming"],
    references: [{ book: "Warren, Hacker's Delight", where: "the definitive bit-twiddling reference" }, { book: "Knuth, TAOCP Vol. 4A", where: "§7.1, Bitwise Tricks and Techniques" }],
    demo: { language: "python", code: `x = 13          # 1101\nprint(x & 1)     # lowest bit -> 1\nprint(x >> 1)    # 6\nprint(bin(x))\n# count set bits with x & (x-1)\ncount = 0\nn = x\nwhile n:\n    n &= n - 1\n    count += 1\nprint(count)\n` },
  },
];
