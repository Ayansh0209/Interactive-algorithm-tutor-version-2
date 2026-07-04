// Docs topics: recursion and backtracking. Rich fields render via DocArticle.

export const recursionTopics = [
  {
    slug: "recursion", category: "recursion", title: "Recursion",
    summary: "A function that calls itself on a smaller input until it hits a base case. The call tree it produces is the whole story — learn to read it and recursion stops being magic.",
    keyIdea: "Solve a problem by assuming you can already solve a **smaller version of the same problem**, then combine. The base case stops the descent; the recursive case shrinks toward it.",
    howItWorks: {
      intro: "Every recursive call pushes a frame onto the call stack; every return pops one:",
      steps: [
        "Check the **base case** first — the smallest input you can answer directly, with no further calls.",
        "Otherwise make one or more **recursive calls** on strictly smaller inputs.",
        "Each call suspends the current frame and runs the child; the machine remembers where to resume.",
        "As base cases return, results **bubble back up** and combine into the parent's answer.",
        "Watch the visualizer's recursion tree expand on the way down and collapse (with return values) on the way up.",
      ],
    },
    sections: [
      { heading: "Base case + recursive case", body: "Every recursion needs a **base case** (which stops it) and a **recursive case** (which shrinks the problem toward that base). Miss or mis-order the base case and you get infinite recursion and a stack overflow. The recursive 'leap of faith': trust that the smaller call is correct, and just handle the combining." },
      { heading: "Read the call tree", body: "Each call branches into sub-calls, and results bubble back up. The shape of that tree *is* the running time: a single self-call per step is a line (`O(n)`), two self-calls is a binary tree (up to `O(2ⁿ)`). Our visualizer draws the tree live so you can see the shape your code produces." },
      { heading: "Recursion vs iteration", body: "Anything recursive can be rewritten with an explicit stack and a loop — that's literally what the machine does under the hood. Recursion is often *clearer*; iteration avoids the call-stack limit. **Tail recursion** (the self-call is the last thing done) can be optimized into a loop by some compilers." },
    ],
    complexity: [["Factorial (linear)", "O(n)"], ["Fibonacci (naive)", "O(2ⁿ)"], ["Fibonacci (memoized)", "O(n)"], ["Call-stack space", "O(depth)"]],
    pitfalls: [
      "**Missing / wrong base case** → infinite recursion → stack overflow.",
      "Recursing on an input that isn't strictly smaller — the descent never reaches the base.",
      "Deep recursion blows the stack (Python caps at ~1000 frames); convert to iteration for large depths.",
      "Re-solving the same sub-problem exponentially — **memoize** to collapse it.",
    ],
    whenToUse: {
      use: ["The problem is **self-similar** (trees, divide-and-conquer, grammars)", "A recursive definition is far clearer than a loop", "Exploring branching choices (backtracking)"],
      avoid: ["Recursion depth could be huge (risk of stack overflow)", "A simple loop is just as clear (and avoids call overhead)"],
    },
    variants: [
      { name: "Tail recursion", note: "The recursive call is the final action — optimizable into a loop." },
      { name: "Mutual recursion", note: "Two functions call each other (e.g. `isEven` / `isOdd`)." },
      { name: "Divide & conquer", note: "Split into independent sub-problems, solve, merge — merge sort, quicksort." },
    ],
    realWorld: ["Tree & filesystem traversal", "Parsers & interpreters", "Divide-and-conquer sorts", "Fractals", "The call stack itself"],
    references: [{ book: "CLRS", where: "Ch. 4, Divide-and-Conquer" }, { book: "Abelson & Sussman, SICP", where: "Ch. 1, recursion vs iteration" }, { book: "Sedgewick & Wayne, Algorithms", where: "§1.1, recursion" }],
    demo: { language: "python", code: `memo = {}\ndef fib(n):\n    if n < 2:\n        return n\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n\nresult = fib(7)\nprint(result)\n` },
  },
  {
    slug: "factorial", category: "recursion", title: "Factorial",
    summary: "n! = n × (n−1)! with 0! = 1 — the simplest recursion, a single self-call per step, and the cleanest way to see the call stack grow and unwind.",
    keyIdea: "`n!` is just `n` times the factorial of `n−1`. One self-call per step means the call tree is a straight line of depth `n`.",
    howItWorks: {
      intro: "`fact(n)` unwinds like this:",
      steps: [
        "`fact(3)` needs `3 × fact(2)`, so it pauses and calls `fact(2)`.",
        "`fact(2)` needs `2 × fact(1)`; `fact(1)` hits the **base case** and returns `1`.",
        "Now the returns multiply back up: `fact(2) = 2×1 = 2`, then `fact(3) = 3×2 = 6`.",
        "The stack reached depth `n`, then unwound — a single, tall, thin recursion tree.",
      ],
    },
    sections: [
      { heading: "Linear recursion", body: "Each call reduces `n` by one until the base case `1! = 1` (or `0! = 1`), then multiplies back up the chain. Because there's exactly one self-call per frame, the call stack reaches depth `n` and the work is `O(n)`." },
      { heading: "Iterative twin", body: "Any single-branch (linear) recursion converts directly to a loop, trading `O(n)` stack space for `O(1)`. Factorial is the textbook example: `for i in 2..n: result *= i`. Prefer the loop when `n` could be large." },
    ],
    complexity: [["Time", "O(n)"], ["Space (recursive)", "O(n)", "call stack"], ["Space (iterative)", "O(1)"]],
    pitfalls: [
      "Base case must be `n <= 1` (or `n == 0`); `fact(0)` should return `1`, not recurse forever.",
      "Factorials overflow fixed-width integers fast — `21!` exceeds 64 bits.",
    ],
    whenToUse: {
      use: ["Teaching the call stack", "Counting permutations / combinations", "Any 'multiply a shrinking range' pattern"],
      avoid: ["Large `n` (use the loop; watch for overflow / use big integers)"],
    },
    references: [{ book: "SICP", where: "§1.2.1, Linear Recursion and Iteration" }],
    demo: { language: "python", code: `def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(5))\n` },
  },
  {
    slug: "fibonacci", category: "recursion", title: "Fibonacci (naive vs memo)",
    summary: "Each number is the sum of the previous two. Naive recursion is exponential; caching repeated sub-problems makes it linear — the doorway to dynamic programming.",
    keyIdea: "Two self-calls per step means the call tree branches — and it re-computes the *same* sub-problems over and over. Remember each answer once and the tree collapses.",
    howItWorks: {
      intro: "Why naive `fib` is slow, and how memoization fixes it:",
      steps: [
        "`fib(5)` calls `fib(4)` and `fib(3)`; `fib(4)` calls `fib(3)` and `fib(2)` — `fib(3)` is now computed **twice**.",
        "Deeper down, `fib(2)` is computed 3 times, `fib(1)` even more — the tree has ~`2ⁿ` nodes.",
        "**Memoize:** keep a `cache`; the first time you compute `fib(k)`, store it.",
        "Every later call to `fib(k)` returns instantly from the cache, so each of the `n` distinct sub-problems runs **once** → `O(n)`.",
      ],
    },
    sections: [
      { heading: "The exponential trap", body: "Naive `fib(n)` recomputes the same sub-calls repeatedly — `fib(5)` computes `fib(2)` three times, `fib(1)` five times. The call tree roughly doubles each level, ballooning to `O(2ⁿ)`. `fib(40)` already means over a billion calls." },
      { heading: "Memoization = top-down DP", body: "Cache each result the first time you compute it. The bushy tree collapses into a line of `n` unique sub-problems — `O(n)` time, `O(n)` space. This is exactly **top-down dynamic programming**; the **bottom-up** version fills an array `f[0..n]` iteratively with `O(1)` space." },
    ],
    complexity: [["Naive", "O(2ⁿ)"], ["Memoized (top-down)", "O(n)"], ["Bottom-up, rolling", "O(n) time, O(1) space"], ["Matrix / fast doubling", "O(log n)"]],
    pitfalls: [
      "Sharing one mutable `memo` across unrelated calls can leak stale results — scope it carefully.",
      "The naive version is a great *demo* of the problem but should never ship — always memoize or iterate.",
    ],
    whenToUse: {
      use: ["Introducing memoization & DP", "Any recurrence with **overlapping** sub-problems"],
      avoid: ["Production Fibonacci (use the O(log n) fast-doubling or a closed form)"],
    },
    variants: [
      { name: "Bottom-up DP", note: "Fill a table iteratively — no recursion, O(1) space with two rolling variables." },
      { name: "Fast doubling", note: "Compute F(2k) and F(2k+1) from F(k) — O(log n)." },
    ],
    references: [{ book: "CLRS", where: "Ch. 14/15, Dynamic Programming (overlapping sub-problems)" }, { book: "Skiena", where: "§10.1, Caching vs Computation" }],
    demo: { language: "python", code: `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\n# watch the call tree explode\nprint(fib(6))\n` },
  },
  {
    slug: "tower-of-hanoi", category: "recursion", title: "Tower of Hanoi", premade: "hanoi",
    summary: "Move a stack of disks between three pegs, never placing a larger disk on a smaller one. The elegant recursive solution needs exactly 2ⁿ − 1 moves — provably the minimum.",
    keyIdea: "To move `n` disks, first get the top `n−1` out of the way, move the biggest, then bring the `n−1` back on top. The sub-problems are identical, just smaller.",
    howItWorks: {
      intro: "Move `n` disks from source `A` to destination `C`, using `B` as spare:",
      steps: [
        "Recursively move the top `n−1` disks from `A` → `B` (using `C` as spare).",
        "Move the single largest disk directly `A` → `C`.",
        "Recursively move the `n−1` disks from `B` → `C` (using `A` as spare).",
        "The base case is `n = 0`: nothing to move. Two half-size sub-problems per call give `2ⁿ − 1` total moves.",
      ],
    },
    sections: [
      { heading: "Three-line recursion", body: "The whole algorithm is three lines because the problem is perfectly self-similar. The hard part isn't the code — it's trusting that the recursive calls handle the sub-towers correctly (the recursive leap of faith)." },
      { heading: "Exponential by necessity", body: "The minimum number of moves is exactly `2ⁿ − 1`, provable by induction — it's not that our algorithm is wasteful, the problem genuinely requires that many moves. With 64 disks at one move per second, the legend's monks would take ~585 billion years." },
    ],
    complexity: [["Moves", "2ⁿ − 1", "optimal"], ["Time", "O(2ⁿ)"], ["Space", "O(n)", "recursion depth"]],
    pitfalls: [
      "Swapping the roles of the spare and destination pegs in the two recursive calls is the classic bug.",
      "It's exponential — don't run it for large `n` expecting it to finish.",
    ],
    whenToUse: {
      use: ["Teaching recursion & induction", "Demonstrating provable lower bounds"],
      avoid: ["It's a teaching problem, not a practical algorithm"],
    },
    realWorld: ["Backup rotation schemes (\"Tower of Hanoi\" tape rotation)", "Teaching recursion and mathematical induction"],
    references: [{ book: "Graham, Knuth & Patashnik, Concrete Mathematics", where: "Ch. 1, The Tower of Hanoi" }],
    demo: { language: "python", code: `def hanoi(n, src, dst, via):\n    if n == 0:\n        return\n    hanoi(n - 1, src, via, dst)\n    print("move", src, "->", dst)\n    hanoi(n - 1, via, dst, src)\n\nhanoi(3, "A", "C", "B")\n` },
  },
  {
    slug: "n-queens", category: "backtracking", title: "N-Queens", premade: "n-queens",
    summary: "Place N queens on an N×N board so none attack each other. The textbook backtracking problem: place a queen, recurse, and undo the moment you hit a conflict.",
    keyIdea: "Build the solution one row at a time, and the instant a partial placement can't possibly work, abandon it and back up — pruning dead branches before exploring them.",
    howItWorks: {
      intro: "Backtracking places one queen per row:",
      steps: [
        "In row `r`, try each column `c`.",
        "**Prune:** skip `c` if a queen already occupies that column or either diagonal (tracked in three sets for O(1) checks).",
        "If `c` is safe, place the queen, mark the column and diagonals, and **recurse** to row `r+1`.",
        "If the recursion returns without a full solution, **undo** (remove the queen and unmark) and try the next column.",
        "Reaching row `N` means all queens are placed — record a solution.",
      ],
    },
    sections: [
      { heading: "Backtracking = DFS + undo", body: "Backtracking is depth-first search over the tree of partial solutions, with an **undo** step so siblings can reuse the state. Place a queen in the first safe column of each row and recurse; if a row has no safe column, back up and try the previous row's next column." },
      { heading: "Pruning is everything", body: "Naively there are `Nᴺ` arrangements. Tracking occupied columns and both diagonals in sets makes each safety check `O(1)` and prunes the vast majority of branches, so the search touches far fewer than `N!` states. Good pruning is what makes backtracking practical." },
    ],
    complexity: [["Time", "O(N!)", "with pruning, far less in practice"], ["Space", "O(N)", "board + diagonals"]],
    pitfalls: [
      "Forgetting to **undo** (remove the queen, unmark diagonals) corrupts sibling branches.",
      "Diagonal indices: one diagonal is `r − c` (can be negative), the other is `r + c` — mixing them lets queens attack.",
      "Returning after the first solution when you were asked to count *all* of them (or vice-versa).",
    ],
    whenToUse: {
      use: ["Constraint-satisfaction puzzles", "Any 'place items subject to no-conflict rules'", "Teaching pruning"],
      avoid: ["Large N where you need speed (use specialized CP / SAT solvers)"],
    },
    variants: [
      { name: "Count vs enumerate", note: "Counting solutions is cheaper than materializing each board." },
      { name: "Bitmask N-Queens", note: "Represent columns/diagonals as bitmasks for a blazing-fast solver." },
    ],
    realWorld: ["Constraint solvers", "Scheduling with conflicts", "Register allocation (graph coloring cousins)"],
    references: [{ book: "Skiena", where: "§7.1, Backtracking" }, { book: "Knuth, TAOCP Vol. 4A", where: "Backtrack programming & dancing links" }],
    demo: { language: "python", code: `n = 4\ncols, d1, d2 = set(), set(), set()\nplace = [-1] * n\nsolutions = 0\ndef solve(r):\n    global solutions\n    if r == n:\n        solutions += 1\n        return\n    for c in range(n):\n        if c in cols or (r - c) in d1 or (r + c) in d2:\n            continue\n        cols.add(c); d1.add(r - c); d2.add(r + c); place[r] = c\n        solve(r + 1)\n        cols.discard(c); d1.discard(r - c); d2.discard(r + c)\nsolve(0)\nprint(solutions)\n` },
  },
  {
    slug: "subsets", category: "backtracking", title: "Subsets (Power Set)",
    summary: "Generate every subset of a set by deciding, for each element, whether to include it — 2ⁿ subsets via a clean binary-choice recursion.",
    keyIdea: "Each element is an independent yes/no decision, so the subsets are the leaves of a binary decision tree of depth `n`.",
    howItWorks: {
      intro: "Two equivalent framings; the include/exclude tree is the clearest:",
      steps: [
        "At index `i`, branch into two: **include** `nums[i]`, or **exclude** it.",
        "Recurse to index `i+1` in both branches, carrying the current partial subset.",
        "When `i` reaches `n`, the partial subset is complete — record a copy.",
        "The `2ⁿ` leaves are exactly the subsets. (The demo uses the equivalent 'start index' form: append, recurse, pop.)",
      ],
    },
    sections: [
      { heading: "Include or exclude", body: "At each index, branch twice — take the element or skip it. The leaves of this binary decision tree are all `2ⁿ` subsets. Copying the path at each node lists them in a tidy order." },
      { heading: "Building incrementally", body: "Carry a current partial subset; append before recursing, pop after. That push/pop *is* the backtracking step — it keeps a single shared list instead of copying at every branch, so extra space stays `O(n)`." },
    ],
    complexity: [["Time", "O(n · 2ⁿ)", "2ⁿ subsets, O(n) to copy each"], ["Space", "O(n)", "excluding the output"]],
    pitfalls: [
      "Appending the path reference instead of a **copy** — every stored subset ends up identical (and empty).",
      "For inputs with duplicates, sort and skip equal siblings to avoid duplicate subsets.",
    ],
    whenToUse: {
      use: ["Enumerate all combinations of choices", "Brute-forcing small `n` (≤ ~20)", "Bitmask enumeration"],
      avoid: ["Large `n` — `2ⁿ` is intractable past ~25"],
    },
    variants: [
      { name: "Bitmask subsets", note: "Iterate `mask` from 0 to 2ⁿ−1; set bits pick elements — no recursion." },
      { name: "Subsets II", note: "Handle duplicates by sorting and skipping equal siblings." },
    ],
    references: [{ book: "Skiena", where: "§7.4, Constructing all Subsets" }],
    demo: { language: "python", code: `nums = [1, 2, 3]\nres = []\ndef backtrack(start, path):\n    res.append(path[:])\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        backtrack(i + 1, path)\n        path.pop()\nbacktrack(0, [])\nprint(res)\n` },
  },
  {
    slug: "permutations", category: "backtracking", title: "Permutations",
    summary: "Generate all n! orderings of a list by choosing an unused element for each position and backtracking when a slot is filled.",
    keyIdea: "Each position picks one of the not-yet-used elements; marking an element used on the way down and unused on the way back is what lets siblings reuse it.",
    howItWorks: {
      intro: "Fill positions left to right:",
      steps: [
        "For the current position, try every element **not yet used**.",
        "Mark it used, append it to the path, and **recurse** to fill the next position.",
        "When the path length equals `n`, you have a complete permutation — record a copy.",
        "**Undo:** pop the element and mark it unused, so the next choice at this position can use it.",
      ],
    },
    sections: [
      { heading: "Choose, recurse, undo", body: "For each position, try every element not yet used, recurse to fill the rest, then mark it unused again. The **undo** is the crux: without it, later branches would see the element as taken and miss valid permutations." },
      { heading: "Factorial growth", body: "There are `n!` permutations, so *any* algorithm that lists them is `Ω(n!)` — you can't beat the output size. Backtracking's virtue is generating them one at a time with only `O(n)` extra space, rather than materializing all `n!` at once." },
    ],
    complexity: [["Time", "O(n · n!)"], ["Space", "O(n)", "excluding output"]],
    pitfalls: [
      "Forgetting the undo (`used[i] = False`) collapses the output to a single permutation.",
      "With duplicate elements, sort and skip equal-unused siblings to avoid repeats.",
    ],
    whenToUse: {
      use: ["Enumerate all orderings for small `n`", "Brute-forcing assignment / TSP on tiny inputs", "Generating test cases"],
      avoid: ["`n` beyond ~10 — `n!` explodes (10! = 3.6M, 13! > 6 billion)"],
    },
    variants: [
      { name: "Heap's algorithm", note: "Generates permutations with a single swap between each — minimal work." },
      { name: "Next-permutation", note: "Iterate lexicographic permutations in O(1) amortized, no recursion." },
    ],
    references: [{ book: "Knuth, TAOCP Vol. 4A", where: "§7.2.1.2, Generating all permutations" }],
    demo: { language: "python", code: `nums = [1, 2, 3]\nres = []\nused = [False] * len(nums)\ndef backtrack(path):\n    if len(path) == len(nums):\n        res.append(path[:])\n        return\n    for i in range(len(nums)):\n        if used[i]:\n            continue\n        used[i] = True; path.append(nums[i])\n        backtrack(path)\n        path.pop(); used[i] = False\nbacktrack([])\nprint(len(res))\n` },
  },
  {
    slug: "combination-sum", category: "backtracking", title: "Combination Sum",
    summary: "Find all combinations of candidate numbers (each reusable) that add up to a target, via backtracking with two kinds of pruning.",
    keyIdea: "At each step you either reuse the current candidate or move past it forever; never going backward is what stops the same combination being generated twice.",
    howItWorks: {
      intro: "Explore from a `start` index with a shrinking `remain`:",
      steps: [
        "If `remain == 0`, the current path sums to the target — record it.",
        "For each candidate from `start` onward, if it's `≤ remain`, choose it.",
        "**Recurse with the same index** `i` (candidates are reusable) and `remain − candidates[i]`.",
        "**Prune:** once a candidate exceeds `remain`, skip it (and, if sorted, break — the rest are larger).",
        "Undo (pop) and try the next candidate. Only ever moving forward from `start` avoids duplicate combinations.",
      ],
    },
    sections: [
      { heading: "Branch and bound", body: "At each step, either use the current candidate again (stay at the same index) or move on to the next. Stop a branch the moment the remaining target goes negative — that **bound** is what keeps the exponential search from exploring hopeless paths." },
      { heading: "Avoiding duplicates", body: "Only move forward through the candidate list (never revisit earlier ones) so `[2,2,3]` and `[3,2,2]` aren't both generated — each combination is produced exactly once, in nondecreasing order." },
    ],
    complexity: [["Time", "exponential", "in target/candidate ratio"], ["Space", "O(target / min candidate)", "recursion depth"]],
    pitfalls: [
      "Passing `start = i + 1` instead of `i` forbids reuse — that's a *different* problem (Combination Sum II).",
      "Not pruning on `remain < 0` explores huge dead sub-trees.",
      "Duplicates in the candidate list need a sort + skip to avoid repeated combinations.",
    ],
    whenToUse: {
      use: ["Coin-change enumeration (which coins, not just count)", "Subset-sum with reuse", "Partition problems"],
      avoid: ["You only need the *count* or *min* (use DP, not enumeration)"],
    },
    references: [{ book: "Skiena", where: "§7.5, Constructing all Paths / branch-and-bound" }],
    demo: { language: "python", code: `candidates = [2, 3, 6, 7]\ntarget = 7\nres = []\ndef backtrack(start, remain, path):\n    if remain == 0:\n        res.append(path[:])\n        return\n    for i in range(start, len(candidates)):\n        if candidates[i] <= remain:\n            path.append(candidates[i])\n            backtrack(i, remain - candidates[i], path)\n            path.pop()\nbacktrack(0, target, [])\nprint(res)\n` },
  },
  {
    slug: "rat-in-maze", category: "backtracking", title: "Rat in a Maze", premade: "rat-maze",
    summary: "Find a path through a grid of open and blocked cells using depth-first backtracking, undoing moves at dead ends.",
    keyIdea: "Walk forward greedily; the moment you hit a wall or a visited cell, rewind to the last junction and try the next direction — DFS with an undo.",
    howItWorks: {
      intro: "From the start cell, explore directions recursively:",
      steps: [
        "If the cell is out of bounds, blocked, or already visited, return **false** (dead end).",
        "Mark the cell **visited** so you don't loop.",
        "If it's the destination, return **true** — a path exists.",
        "Try each direction (down, right, …) in turn; if any recursive call returns true, propagate it up.",
        "If none do, this cell leads nowhere — (optionally) unmark it and return false so the caller tries elsewhere.",
      ],
    },
    sections: [
      { heading: "DFS with undo", body: "From each cell, try each direction; mark the cell visited before recursing. To find *all* paths (not just one), unmark on the way back so other routes can reuse the cell — that unmark is the backtrack. To find just *a* path, you can leave it marked." },
      { heading: "Dead ends", body: "If no direction leads forward, return `false` and let the caller try its next option. That returning-false-and-trying-the-next is exactly backtracking — the search naturally rewinds to the most recent unexplored junction." },
    ],
    complexity: [["Time", "O(4^(r·c))", "worst case, all directions"], ["Space", "O(r·c)", "visited + recursion"]],
    pitfalls: [
      "Not marking cells visited → infinite loops between two open cells.",
      "For counting *all* paths you must unmark on backtrack; for *one* path you needn't.",
      "Deep grids can overflow the recursion stack — an explicit stack avoids it.",
    ],
    whenToUse: {
      use: ["Maze / grid path existence", "Flood fill & connectivity", "Enumerating grid routes"],
      avoid: ["Shortest path in an unweighted grid (use **BFS**, not DFS backtracking)"],
    },
    realWorld: ["Game AI pathfinding (with pruning)", "Flood fill (paint bucket)", "Connectivity / reachability checks"],
    references: [{ book: "Skiena", where: "§5.7, DFS on grids" }, { book: "CLRS", where: "§20.3, Depth-First Search" }],
    demo: { language: "python", code: `maze = [\n    [1, 0, 0],\n    [1, 1, 0],\n    [0, 1, 1],\n]\nR, C = 3, 3\nvis = [[False] * C for _ in range(R)]\ndef solve(r, c):\n    if r < 0 or c < 0 or r >= R or c >= C or maze[r][c] == 0 or vis[r][c]:\n        return False\n    vis[r][c] = True\n    if r == R - 1 and c == C - 1:\n        return True\n    if solve(r + 1, c) or solve(r, c + 1):\n        return True\n    return False\nprint(solve(0, 0))\n` },
  },
  {
    slug: "sudoku-solver", category: "backtracking", title: "Sudoku Solver",
    summary: "Fill a 9×9 grid so every row, column, and 3×3 box holds 1–9, using constraint-checked backtracking that prunes wrong digits immediately.",
    keyIdea: "Try a digit only if it doesn't already clash; the instant a cell has no legal digit, rewind. Tight constraints reject most guesses on the spot, so the giant search space stays tiny in practice.",
    howItWorks: {
      intro: "Fill empty cells one at a time:",
      steps: [
        "Find the next empty cell; if there are none, the grid is solved.",
        "Try each digit `1–9` that doesn't clash with the cell's **row, column, or 3×3 box**.",
        "Place a legal digit and **recurse** to the next empty cell.",
        "If the recursion fails (a later cell has no legal digit), **undo** the digit and try the next one.",
        "If no digit works here, return false to backtrack to the previous cell.",
      ],
    },
    sections: [
      { heading: "Try, check, recurse", body: "Find an empty cell, try each digit that doesn't violate its row, column, or box constraint, and recurse. If no digit works, undo and backtrack to the previous cell. The constraint check is what turns brute force into a guided search." },
      { heading: "Why it's fast enough", body: "The three constraints prune the search hard — most wrong digits are rejected the instant they're tried, so real puzzles solve in milliseconds despite an astronomical worst case. Choosing the **most-constrained** empty cell first (fewest legal digits) prunes even harder — a form of the MRV heuristic." },
    ],
    complexity: [["Time", "worst-case exponential", "tiny in practice with pruning"], ["Space", "O(1) extra", "solve in place"]],
    pitfalls: [
      "Computing box bounds wrong (`3*(r//3)`, `3*(c//3)`) checks the wrong sub-grid.",
      "Not undoing a placement on failure leaves garbage in the grid.",
      "Scanning cells in a fixed order works but is slow; pick the most-constrained cell for big speedups.",
    ],
    whenToUse: {
      use: ["Constraint-satisfaction puzzles", "Any 'fill cells subject to region constraints'", "Teaching pruning heuristics"],
      avoid: ["Very large CSPs (use a real SAT/CP solver)"],
    },
    variants: [
      { name: "MRV heuristic", note: "Always fill the empty cell with the fewest candidates first." },
      { name: "Dancing Links (DLX)", note: "Knuth's exact-cover formulation solves Sudoku extremely fast." },
    ],
    references: [{ book: "Knuth, 'Dancing Links'", where: "Exact cover via DLX (Sudoku as a special case)" }, { book: "Russell & Norvig, AIMA", where: "Ch. 6, Constraint Satisfaction Problems" }],
    demo: { language: "python", code: `# check whether placing d at (r,c) is legal\ndef ok(grid, r, c, d):\n    for i in range(9):\n        if grid[r][i] == d or grid[i][c] == d:\n            return False\n    br, bc = 3 * (r // 3), 3 * (c // 3)\n    for i in range(br, br + 3):\n        for j in range(bc, bc + 3):\n            if grid[i][j] == d:\n                return False\n    return True\n\ngrid = [[0] * 9 for _ in range(9)]\nprint(ok(grid, 0, 0, 5))\n` },
  },
];
