/**
 * Rule-based explanation fallback.
 *
 * Used when no LLM API key is configured, so the product is fully functional
 * offline. It is grounded entirely in the real trace (meta.analysis + steps),
 * never invented. When an API key is present, the LLM replaces this with richer
 * prose, but is fed the same grounded facts.
 */

const COMPLEXITY = {
  two_pointer: "O(n) time, O(1) extra space -- a single linear sweep with two indices.",
  fast_slow_pointers: "O(n) time, O(1) space -- Floyd-style two-speed pointers.",
  sliding_window: "O(n) time, O(1)-O(k) space -- a moving window over the array.",
  dynamic_programming: "Typically O(states x work-per-state). A 2D table is often O(n*m).",
  backtracking: "Exponential worst case (the search tree branches); pruning trims it.",
  recursion: "Depends on the recurrence; count calls x work per call.",
  bfs: "O(V + E) time, O(V) space for the queue and visited set.",
  dfs: "O(V + E) time, O(V) space for the stack and visited set.",
  greedy_or_dijkstra: "Dijkstra with a heap is O((V + E) log V).",
  greedy_or_sorting: "Usually O(n log n), dominated by the sort.",
};

const APPROACHES = {
  backtracking: [
    "You are exploring with backtracking. If subproblems repeat, memoize them.",
    "Add pruning (constraint checks before recursing) to cut the search tree early.",
    "For counting-only problems, a bitmask DP can replace the explicit board.",
  ],
  dynamic_programming: [
    "If you wrote top-down memoization, a bottom-up table avoids recursion-depth limits.",
    "Check whether the table reduces to O(1) or O(n) rows (rolling array).",
  ],
  two_pointer: [
    "Confirm the array invariant (sorted?) that makes two pointers valid.",
    "A hash-map approach trades space for working on unsorted input.",
  ],
  bfs: [
    "BFS gives shortest paths in unweighted graphs; for weighted edges use Dijkstra.",
    "Track the level/distance alongside the queue if you need path lengths.",
  ],
  dfs: ["Recursive DFS is cleaner but risks deep stacks; your explicit stack avoids that."],
};

function uniqueStructures(trace) {
  const seen = new Set();
  for (const s of trace.steps || []) {
    for (const t of Object.values(s.var_types || {})) {
      if (!["primitive", "object", "function", "constructing"].includes(t)) seen.add(t);
    }
  }
  return [...seen];
}

function explain({ trace, mode = "explain", step = null }) {
  const meta = (trace && trace.meta) || {};
  const analysis = meta.analysis || {};
  const primary = analysis.primary;
  const structures = uniqueStructures(trace || {});

  if (mode === "step" && step != null && trace.steps && trace.steps[step]) {
    const s = trace.steps[step];
    const changed = (s.highlight_vars || []).join(", ") || "nothing new";
    const ev = (s.semantic || []).map((e) => e.kind).join(", ") || "-";
    return {
      source: "rule-based",
      text:
        "Line " + s.line + " (" + s.function + "): " + s.code + ". " +
        "Changed: " + changed + ". Events: " + ev + ". Call depth " + s.depth + ".",
    };
  }

  if (mode === "approaches") {
    const tips = APPROACHES[primary] || [
      "No single dominant pattern detected -- describe the goal to compare approaches.",
    ];
    return { source: "rule-based", text: tips.join(" "), bullets: tips };
  }

  const parts = [];
  parts.push(
    primary
      ? "This looks like a " + primary.replace(/_/g, " ") + " approach."
      : "No single dominant algorithmic pattern was detected."
  );
  if (COMPLEXITY[primary]) parts.push("Complexity: " + COMPLEXITY[primary]);
  if (structures.length) parts.push("Data structures seen: " + structures.join(", ") + ".");
  parts.push(
    "The run produced " + (meta.num_steps || 0) + " steps" +
      (meta.truncated ? " (truncated -- try focusing one function/loop)." : ".")
  );
  if (meta.error) parts.push("It ended with an error: " + meta.error + ".");

  return { source: "rule-based", text: parts.join(" "), primary, structures };
}

module.exports = { explain };
