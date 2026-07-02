// DP table configs for DPPremade. Each algo exposes setup() -> table shape +
// labels, and step(dp,i,j) -> { value, deps:[[r,c]], note } filling one cell.
// DPPremade iterates row-major and snapshots a frame per cell, so the grid fills
// in with arrows pointing at the cells each value was computed from.

const INF = Infinity;

export const DP_META = {
  knapsack: { label: "0/1 Knapsack", complexity: "O(nW)" },
  lcs: { label: "Longest Common Subsequence", complexity: "O(nm)" },
  coins: { label: "Coin Change (min coins)", complexity: "O(nA)" },
  paths: { label: "Unique Grid Paths", complexity: "O(nm)" },
};

const KNAP_ITEMS = [{ w: 2, v: 3 }, { w: 3, v: 4 }, { w: 4, v: 5 }, { w: 5, v: 6 }];
const KNAP_CAP = 8;
const COINS = [1, 3, 4];
const COIN_AMT = 7;
const LCS_X = "AGCAT";
const LCS_Y = "GAC";

export const DP_ALGOS = {
  paths: {
    blurb: "Count paths from the top-left to each cell of a grid, moving only right or down. dp[i][j] = dp[i−1][j] + dp[i][j−1].",
    setup() {
      const R = 4, C = 5;
      return { R, C, rowLabels: range(R), colLabels: range(C), result: (dp) => `Paths to bottom-right: ${dp[R - 1][C - 1]}.` };
    },
    step(dp, i, j) {
      if (i === 0 || j === 0) return { value: 1, deps: [], note: `Edge cell — exactly one path here. dp=1.` };
      const value = dp[i - 1][j] + dp[i][j - 1];
      return { value, deps: [[i - 1, j], [i, j - 1]], note: `dp[${i}][${j}] = from above (${dp[i - 1][j]}) + from left (${dp[i][j - 1]}) = ${value}.` };
    },
  },

  knapsack: {
    blurb: `Items (weight, value): ${KNAP_ITEMS.map((it) => `(${it.w},${it.v})`).join(" ")}; capacity ${KNAP_CAP}. dp[i][w] = best value using the first i items within weight w.`,
    setup() {
      const R = KNAP_ITEMS.length + 1, C = KNAP_CAP + 1;
      return { R, C, rowLabels: ["∅", ...KNAP_ITEMS.map((it, i) => `i${i + 1}`)], colLabels: range(C), result: (dp) => `Max value: ${dp[R - 1][C - 1]}.` };
    },
    step(dp, i, w) {
      if (i === 0 || w === 0) return { value: 0, deps: [], note: `No items or no capacity → value 0.` };
      const it = KNAP_ITEMS[i - 1];
      const skip = dp[i - 1][w];
      if (it.w > w) return { value: skip, deps: [[i - 1, w]], note: `Item ${i} (w${it.w}) too heavy for ${w} → skip: dp=${skip}.` };
      const take = dp[i - 1][w - it.w] + it.v;
      const value = Math.max(skip, take);
      return { value, deps: [[i - 1, w], [i - 1, w - it.w]], note: `Item ${i}: max(skip ${skip}, take ${take}) = ${value}.` };
    },
  },

  coins: {
    blurb: `Coins ${COINS.join(", ")}; make every amount 0..${COIN_AMT} with the fewest coins. dp[i][a] = min(skip coin, use coin i).`,
    setup() {
      const R = COINS.length + 1, C = COIN_AMT + 1;
      return { R, C, rowLabels: ["∅", ...COINS.map((c) => `${c}¢`)], colLabels: range(C), result: (dp) => `Min coins for ${COIN_AMT}: ${fmt(dp[R - 1][C - 1])}.` };
    },
    step(dp, i, a) {
      if (a === 0) return { value: 0, deps: [], note: `Amount 0 needs 0 coins.` };
      if (i === 0) return { value: INF, deps: [], note: `No coins → amount ${a} impossible (∞).` };
      const skip = dp[i - 1][a];
      const coin = COINS[i - 1];
      if (coin > a) return { value: skip, deps: [[i - 1, a]], note: `Coin ${coin} > ${a} → skip: ${fmt(skip)}.` };
      const use = dp[i][a - coin] === INF ? INF : dp[i][a - coin] + 1;
      const value = Math.min(skip, use);
      return { value, deps: [[i - 1, a], [i, a - coin]], note: `dp[${i}][${a}] = min(skip ${fmt(skip)}, use coin ${coin} → ${fmt(use)}) = ${fmt(value)}.` };
    },
  },

  lcs: {
    blurb: `Longest common subsequence of "${LCS_X}" and "${LCS_Y}". If chars match, extend the diagonal; else take the better of up/left.`,
    setup() {
      const R = LCS_X.length + 1, C = LCS_Y.length + 1;
      return { R, C, rowLabels: ["∅", ...LCS_X.split("")], colLabels: ["∅", ...LCS_Y.split("")], result: (dp) => `LCS length: ${dp[R - 1][C - 1]}.` };
    },
    step(dp, i, j) {
      if (i === 0 || j === 0) return { value: 0, deps: [], note: `Empty prefix → LCS 0.` };
      if (LCS_X[i - 1] === LCS_Y[j - 1]) {
        const value = dp[i - 1][j - 1] + 1;
        return { value, deps: [[i - 1, j - 1]], note: `'${LCS_X[i - 1]}' matches → diagonal ${dp[i - 1][j - 1]} + 1 = ${value}.` };
      }
      const up = dp[i - 1][j], left = dp[i][j - 1];
      return { value: Math.max(up, left), deps: [[i - 1, j], [i, j - 1]], note: `'${LCS_X[i - 1]}' ≠ '${LCS_Y[j - 1]}' → max(up ${up}, left ${left}).` };
    },
  },
};

export function dpFrames(algo) {
  const cfg = DP_ALGOS[algo];
  const s = cfg.setup();
  const dp = Array.from({ length: s.R }, () => Array(s.C).fill(null));
  const frames = [{ grid: snap(dp), filled: null, deps: [], note: cfg.blurb }];
  for (let i = 0; i < s.R; i++) {
    for (let j = 0; j < s.C; j++) {
      const { value, deps, note } = cfg.step(dp, i, j);
      dp[i][j] = value;
      frames.push({ grid: snap(dp), filled: [i, j], deps, note });
    }
  }
  frames.push({ grid: snap(dp), filled: null, deps: [], note: s.result(dp), done: true });
  return { ...s, frames };
}

export const fmt = (v) => (v === INF ? "∞" : v === null ? "" : String(v));
const range = (n) => Array.from({ length: n }, (_, i) => i);
const snap = (dp) => dp.map((r) => [...r]);
