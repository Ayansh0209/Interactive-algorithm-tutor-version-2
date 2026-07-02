// Docs topics: recursion and backtracking.

export const recursionTopics = [
  {
    slug: "recursion", category: "recursion", title: "Recursion",
    summary: "A function that calls itself on a smaller input until it hits a base case. The call tree it produces is the key to understanding it.",
    sections: [
      { heading: "Base case + recursive case", body: "Every recursion needs a base case (stops it) and a recursive case (shrinks the problem). Miss the base case and you get infinite recursion / stack overflow." },
      { heading: "Read the call tree", body: "Each call branches into sub-calls and results bubble back up. The visualizer draws this tree live — watch calls expand on the way down and collapse on the way up." },
    ],
    complexity: [["Factorial", "O(n)"], ["Fibonacci (naive)", "O(2^n)"], ["Fibonacci (memo)", "O(n)"]],
    demo: { language: "python", code: `memo = {}\ndef fib(n):\n    if n < 2:\n        return n\n    if n in memo:\n        return memo[n]\n    memo[n] = fib(n - 1) + fib(n - 2)\n    return memo[n]\n\nresult = fib(7)\nprint(result)\n` },
  },
  {
    slug: "factorial", category: "recursion", title: "Factorial",
    summary: "n! = n × (n-1)! with 0! = 1 — the simplest recursion, a single self-call per step.",
    sections: [
      { heading: "Linear recursion", body: "Each call reduces n by one until the base case 0! = 1, then multiplies back up the chain. The call stack reaches depth n." },
      { heading: "Iterative twin", body: "Any single-branch recursion like this converts directly to a loop, trading O(n) stack space for O(1)." },
    ],
    complexity: [["Time", "O(n)"], ["Space (recursive)", "O(n)"]],
    demo: { language: "python", code: `def fact(n):\n    if n <= 1:\n        return 1\n    return n * fact(n - 1)\n\nprint(fact(5))\n` },
  },
  {
    slug: "fibonacci", category: "recursion", title: "Fibonacci (naive vs memo)",
    summary: "Each number is the sum of the previous two. Naive recursion is exponential; memoizing repeated sub-problems makes it linear.",
    sections: [
      { heading: "The exponential trap", body: "Naive fib(n) recomputes the same sub-calls over and over — fib(5) computes fib(2) three times. The call tree balloons to O(2^n)." },
      { heading: "Memoization", body: "Cache each result the first time you compute it. The tree collapses into a line of n unique sub-problems — O(n). This is the doorway to dynamic programming." },
    ],
    complexity: [["Naive", "O(2^n)"], ["Memoized", "O(n)"]],
    demo: { language: "python", code: `def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\n\n# watch the call tree explode\nprint(fib(6))\n` },
  },
  {
    slug: "tower-of-hanoi", category: "recursion", title: "Tower of Hanoi", premade: "hanoi",
    summary: "Move a stack of disks between three pegs, never placing a larger disk on a smaller one. The elegant recursive solution needs 2^n − 1 moves.",
    sections: [
      { heading: "Three-line recursion", body: "To move n disks from A to C: move n−1 from A to B, move the biggest disk A→C, then move n−1 from B to C. The subproblems are identical, just smaller." },
      { heading: "Exponential by necessity", body: "The minimum number of moves is exactly 2^n − 1 — provably optimal. The visualizer replays every move." },
    ],
    complexity: [["Moves", "2^n − 1"], ["Time", "O(2^n)"]],
    demo: { language: "python", code: `def hanoi(n, src, dst, via):\n    if n == 0:\n        return\n    hanoi(n - 1, src, via, dst)\n    print("move", src, "->", dst)\n    hanoi(n - 1, via, dst, src)\n\nhanoi(3, "A", "C", "B")\n` },
  },
  {
    slug: "n-queens", category: "backtracking", title: "N-Queens", premade: "n-queens",
    summary: "Place N queens on an N×N board so none attack each other. A textbook backtracking problem: place, recurse, undo on conflict.",
    sections: [
      { heading: "Backtracking", body: "Place a queen in the first safe column of each row and recurse. If a row has no safe column, back up and try the next column in the previous row." },
      { heading: "Pruning", body: "Track occupied columns and both diagonals in sets so each placement check is O(1). The search explores far fewer than all N^N arrangements." },
    ],
    complexity: [["Time", "O(N!)"], ["Space", "O(N)"]],
    demo: { language: "python", code: `n = 4\ncols, d1, d2 = set(), set(), set()\nplace = [-1] * n\nsolutions = 0\ndef solve(r):\n    global solutions\n    if r == n:\n        solutions += 1\n        return\n    for c in range(n):\n        if c in cols or (r - c) in d1 or (r + c) in d2:\n            continue\n        cols.add(c); d1.add(r - c); d2.add(r + c); place[r] = c\n        solve(r + 1)\n        cols.discard(c); d1.discard(r - c); d2.discard(r + c)\nsolve(0)\nprint(solutions)\n` },
  },
  {
    slug: "subsets", category: "backtracking", title: "Subsets (Power Set)",
    summary: "Generate every subset of a set by deciding, for each element, to include it or not — 2^n subsets via backtracking.",
    sections: [
      { heading: "Include or exclude", body: "At each index, branch twice: take the element or skip it. The leaves of this binary decision tree are all 2^n subsets." },
      { heading: "Building incrementally", body: "Carry a current partial subset, append before recursing, pop after — the push/pop is the backtracking step." },
    ],
    complexity: [["Time", "O(n · 2^n)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `nums = [1, 2, 3]\nres = []\ndef backtrack(start, path):\n    res.append(path[:])\n    for i in range(start, len(nums)):\n        path.append(nums[i])\n        backtrack(i + 1, path)\n        path.pop()\nbacktrack(0, [])\nprint(res)\n` },
  },
  {
    slug: "permutations", category: "backtracking", title: "Permutations",
    summary: "Generate all n! orderings of a list by choosing an unused element for each position and backtracking.",
    sections: [
      { heading: "Choose, recurse, undo", body: "For each position, try every element not yet used, recurse to fill the rest, then mark it unused again. The undo is what lets the next choice reuse it." },
      { heading: "Factorial growth", body: "There are n! permutations, so any algorithm that lists them is Ω(n!). Backtracking generates them without storing all at once." },
    ],
    complexity: [["Time", "O(n · n!)"], ["Space", "O(n)"]],
    demo: { language: "python", code: `nums = [1, 2, 3]\nres = []\nused = [False] * len(nums)\ndef backtrack(path):\n    if len(path) == len(nums):\n        res.append(path[:])\n        return\n    for i in range(len(nums)):\n        if used[i]:\n            continue\n        used[i] = True; path.append(nums[i])\n        backtrack(path)\n        path.pop(); used[i] = False\nbacktrack([])\nprint(len(res))\n` },
  },
  {
    slug: "combination-sum", category: "backtracking", title: "Combination Sum",
    summary: "Find all combinations of candidate numbers (reusable) that add up to a target, via backtracking with pruning.",
    sections: [
      { heading: "Branch and bound", body: "At each step, either use the current candidate again (staying at the same index) or move on. Stop a branch as soon as the remaining target goes negative." },
      { heading: "Avoiding duplicates", body: "Only move forward through the candidate list (never back) so each combination is generated once." },
    ],
    complexity: [["Time", "exponential"], ["Space", "O(target)"]],
    demo: { language: "python", code: `candidates = [2, 3, 6, 7]\ntarget = 7\nres = []\ndef backtrack(start, remain, path):\n    if remain == 0:\n        res.append(path[:])\n        return\n    for i in range(start, len(candidates)):\n        if candidates[i] <= remain:\n            path.append(candidates[i])\n            backtrack(i, remain - candidates[i], path)\n            path.pop()\nbacktrack(0, target, [])\nprint(res)\n` },
  },
  {
    slug: "rat-in-maze", category: "backtracking", title: "Rat in a Maze", premade: "rat-maze",
    summary: "Find a path through a grid of open and blocked cells using depth-first backtracking, undoing moves at dead ends.",
    sections: [
      { heading: "DFS with undo", body: "From each cell, try each direction; mark the cell visited before recursing and (optionally) unmark on the way back so other paths can reuse it." },
      { heading: "Dead ends", body: "If no direction leads forward, return false and let the caller try its next option — that return is the backtrack." },
    ],
    complexity: [["Time", "O(4^(rc))"], ["Space", "O(r·c)"]],
    demo: { language: "python", code: `maze = [\n    [1, 0, 0],\n    [1, 1, 0],\n    [0, 1, 1],\n]\nR, C = 3, 3\nvis = [[False] * C for _ in range(R)]\ndef solve(r, c):\n    if r < 0 or c < 0 or r >= R or c >= C or maze[r][c] == 0 or vis[r][c]:\n        return False\n    vis[r][c] = True\n    if r == R - 1 and c == C - 1:\n        return True\n    if solve(r + 1, c) or solve(r, c + 1):\n        return True\n    return False\nprint(solve(0, 0))\n` },
  },
  {
    slug: "sudoku-solver", category: "backtracking", title: "Sudoku Solver",
    summary: "Fill a 9×9 grid so every row, column, and 3×3 box holds 1–9, using constraint-checked backtracking.",
    sections: [
      { heading: "Try, check, recurse", body: "Find an empty cell, try each digit that doesn't clash with its row, column, or box, and recurse. If no digit works, undo and backtrack." },
      { heading: "Why it's fast enough", body: "The constraints prune the search hard — most wrong digits are rejected immediately, so real puzzles solve in milliseconds despite the huge worst case." },
    ],
    complexity: [["Time", "worst-case exponential"], ["Space", "O(1) extra"]],
    demo: { language: "python", code: `# check whether placing d at (r,c) is legal\ndef ok(grid, r, c, d):\n    for i in range(9):\n        if grid[r][i] == d or grid[i][c] == d:\n            return False\n    br, bc = 3 * (r // 3), 3 * (c // 3)\n    for i in range(br, br + 3):\n        for j in range(bc, bc + 3):\n            if grid[i][j] == d:\n                return False\n    return True\n\ngrid = [[0] * 9 for _ in range(9)]\nprint(ok(grid, 0, 0, 5))\n` },
  },
];
