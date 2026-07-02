// Self-contained, auto-playing product previews for the landing page. These
// are pure UI theatre (no backend, no trace engine): they demonstrate what the
// real app does — a language toggle, a code pane with a live line-highlight, a
// visualizer that animates a bubble sort, and an AI tutor that types a grounded
// answer. Everything is token-based + framer-motion and respects reduced motion.

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Icon, Segmented, cx } from "../ui";
import { T } from "../../lib/motion";

// --- shared demo data -------------------------------------------------------
const START = [5, 2, 9, 1, 6];

const CODE = {
  python: {
    ext: "py",
    lines: [
      "arr = [5, 2, 9, 1, 6]",
      "n = len(arr)",
      "for i in range(n):",
      "    for j in range(n - i - 1):",
      "        if arr[j] > arr[j + 1]:",
      "            arr[j], arr[j+1] = arr[j+1], arr[j]",
    ],
    compareLine: 4,
    swapLine: 5,
  },
  java: {
    ext: "java",
    lines: [
      "int[] arr = {5, 2, 9, 1, 6};",
      "for (int i = 0; i < n; i++)",
      "  for (int j = 0; j < n - 1 - i; j++)",
      "    if (arr[j] > arr[j + 1]) {",
      "      int t = arr[j];",
      "      arr[j] = arr[j + 1];",
      "      arr[j + 1] = t;",
      "    }",
    ],
    compareLine: 3,
    swapLine: 5,
  },
};

// Bubble-sort trace over START. Each frame carries the board (stable ids so the
// visualizer can animate swaps), which pair is active, and a plain-words caption.
function buildFrames(input) {
  const a = input.map((val, id) => ({ id, val }));
  const frames = [{ board: a.map((o) => ({ ...o })), i: -1, j: -1, action: "start", caption: "Compare each pair of neighbours, left to right" }];
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      const v1 = a[j].val, v2 = a[j + 1].val;
      const swap = v1 > v2;
      if (swap) { const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
      frames.push({
        board: a.map((o) => ({ ...o })),
        i: j, j: j + 1,
        action: swap ? "swap" : "compare",
        caption: swap ? `${v1} > ${v2} — swap them` : `${v1} ≤ ${v2} — leave them`,
      });
    }
  }
  frames.push({ board: a.map((o) => ({ ...o })), i: -1, j: -1, action: "done", caption: "Sorted ✓  the largest value bubbles to the end each pass" });
  return frames;
}

const LINE_H = 22;

// ---------------------------------------------------------------------------
// AppPreview — the hero centrepiece: a mock app window that plays itself.
// ---------------------------------------------------------------------------
export function AppPreview({ className = "" }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useState("python");
  const frames = useMemo(() => buildFrames(START), []);
  const [step, setStep] = useState(0);

  // Auto-advance the trace; hold longer on the final "sorted" frame.
  useEffect(() => {
    if (reduce) { setStep(frames.length - 1); return; }
    const last = frames.length - 1;
    const cur = frames[step];
    const delay = step === last ? 1800 : cur.action === "swap" ? 940 : cur.action === "start" ? 700 : 760;
    const t = setTimeout(() => setStep((s) => (s + 1) % frames.length), delay);
    return () => clearTimeout(t);
  }, [step, frames, reduce]);

  const f = frames[step];
  const code = CODE[lang];
  const activeLine = f.action === "swap" ? code.swapLine : f.action === "compare" ? code.compareLine : -1;
  const maxVal = Math.max(...START);
  const progress = step / (frames.length - 1);

  return (
    <div className={cx("rounded-2xl border border-border bg-surface shadow-pop overflow-hidden", className)}>
      {/* Title bar with traffic lights + live language toggle */}
      <div className="flex items-center gap-2 px-3.5 h-11 border-b border-border bg-surface-2">
        <span className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        </span>
        <span className="ml-1 font-mono text-3xs sm:text-2xs text-fg-faint truncate">bubble_sort.{code.ext}</span>
        <div className="ml-auto">
          <Segmented
            size="sm"
            value={lang}
            onChange={setLang}
            options={[{ value: "python", label: "Python" }, { value: "java", label: "Java" }]}
          />
        </div>
      </div>

      {/* Body: code pane | visualizer */}
      <div className="grid grid-cols-1 sm:grid-cols-[1.02fr_1fr] divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Code pane */}
        <div className="h-[210px] bg-surface p-3 overflow-hidden">
          <div className="relative">
            {activeLine >= 0 && (
              <motion.div
                className="absolute inset-x-0 rounded-md bg-brand-soft border-l-2 border-brand"
                style={{ height: LINE_H, top: 0 }}
                animate={{ y: activeLine * LINE_H }}
                transition={reduce ? { duration: 0 } : T.spring}
                aria-hidden="true"
              />
            )}
            {code.lines.map((ln, idx) => (
              <div key={idx} className="relative flex items-center font-mono text-3xs sm:text-2xs" style={{ height: LINE_H }}>
                <span className="w-5 shrink-0 text-right pr-2 text-fg-faint select-none">{idx + 1}</span>
                <code className={cx("whitespace-pre", idx === activeLine ? "text-fg" : "text-fg-muted")}>{ln}</code>
              </div>
            ))}
          </div>
        </div>

        {/* Visualizer pane */}
        <div className="h-[210px] relative bg-surface">
          <div className="absolute inset-0 bg-grid opacity-40" aria-hidden="true" />
          <div className="relative h-full flex items-end justify-center gap-2.5 px-4 pt-5 pb-8">
            {f.board.map((cell) => {
              const active = cell.id === f.board[f.i]?.id || cell.id === f.board[f.j]?.id;
              const state = f.action === "done" ? "done" : active ? f.action : "idle";
              return (
                <motion.div key={cell.id} layout transition={reduce ? { duration: 0 } : T.spring} className="flex flex-col items-center gap-1.5">
                  <motion.div
                    layout
                    className={cx(
                      "w-7 sm:w-8 rounded-t-md rounded-b-sm shadow-soft",
                      state === "swap" ? "bg-brand" : state === "compare" ? "bg-warning" : state === "done" ? "bg-success" : "bg-cat-array/70"
                    )}
                    style={{ height: 24 + cell.val * 12 }}
                  />
                  <span className={cx("font-mono text-2xs", state === "idle" ? "text-fg-faint" : "text-fg font-semibold")}>{cell.val}</span>
                </motion.div>
              );
            })}
          </div>
          <span className="absolute top-2.5 left-3 text-3xs font-medium uppercase tracking-wider text-fg-faint">array · auto-detected</span>
        </div>
      </div>

      {/* Footer: live caption + progress + step counter */}
      <div className="border-t border-border px-4 py-2.5 bg-surface-2">
        <div className="flex items-center gap-2 min-h-[18px]">
          <span className={cx("grid place-items-center h-4 w-4 rounded", f.action === "done" ? "text-success" : "text-brand")}>
            <Icon name={f.action === "done" ? "check" : "zap"} size={13} />
          </span>
          <motion.span key={step} initial={reduce ? false : { opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={T.fast} className="text-2xs text-fg-muted truncate">
            {f.caption}
          </motion.span>
          <span className="ml-auto font-mono text-3xs text-fg-faint shrink-0">{String(step).padStart(2, "0")}/{String(frames.length - 1).padStart(2, "0")}</span>
        </div>
        <div className="mt-2 h-1 rounded-full bg-fg/10 overflow-hidden">
          <motion.div className="h-full rounded-full bg-brand" animate={{ width: `${progress * 100}%` }} transition={reduce ? { duration: 0 } : T.base} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AITutorDemo — a mock chat that types out answers grounded in the run above.
// ---------------------------------------------------------------------------
const QA = [
  {
    q: "Why did 9 end up at the end first?",
    a: "Bubble sort compares neighbours left-to-right, so the largest value keeps getting swapped rightward. In this run 9 was bigger than each right neighbour, so it “bubbled” to index 4 on the very first pass.",
  },
  {
    q: "Is this an efficient way to sort?",
    a: "Not really — it's O(n²). I counted 10 comparisons for just 5 items. Merge sort or quicksort would do it in O(n log n). Want me to visualise merge sort next?",
  },
  {
    q: "What was the array after pass one?",
    a: "After the first outer pass it was [2, 5, 1, 6, 9] — every adjacent out-of-order pair got swapped once, and 9 reached its final spot.",
  },
];

export function AITutorDemo({ className = "" }) {
  const reduce = useReducedMotion();
  const [qi, setQi] = useState(0);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const timers = useRef([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const full = QA[qi].a;
    if (reduce) { setTyped(full); setDone(true); return; }
    setTyped("");
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(full.slice(0, i));
      if (i >= full.length) {
        clearInterval(id);
        setDone(true);
        timers.current.push(setTimeout(() => setQi((x) => (x + 1) % QA.length), 3000));
      }
    }, 18);
    timers.current.push(id);
    return () => { clearInterval(id); timers.current.forEach(clearTimeout); };
  }, [qi, reduce]);

  return (
    <div className={cx("rounded-2xl border border-border bg-surface shadow-pop overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-4 h-11 border-b border-border bg-surface-2">
        <span className="grid place-items-center h-6 w-6 rounded-lg bg-brand-soft text-brand">
          <Icon name="sparkles" size={15} />
        </span>
        <span className="text-sm font-medium text-fg">AI tutor</span>
        <span className="ml-auto inline-flex items-center gap-1 text-3xs text-fg-faint">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> grounded in your run
        </span>
      </div>

      <div className="p-4 space-y-3 min-h-[196px]">
        {/* user question */}
        <motion.div key={`q${qi}`} initial={reduce ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={T.base} className="flex justify-end">
          <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-brand text-on-brand px-3.5 py-2 text-sm shadow-soft">
            {QA[qi].q}
          </div>
        </motion.div>

        {/* assistant answer, typed out */}
        <div className="flex items-start gap-2">
          <span className="grid place-items-center h-6 w-6 rounded-lg bg-brand-soft text-brand shrink-0 mt-0.5">
            <Icon name="sparkles" size={13} />
          </span>
          <div className="max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-surface-2 px-3.5 py-2 text-sm text-fg-muted leading-relaxed">
            {typed}
            {!done && <span className="inline-block w-1.5 h-4 -mb-0.5 ml-0.5 bg-brand rounded-sm animate-pulse" aria-hidden="true" />}
          </div>
        </div>
      </div>

      {/* prompt-bar affordance */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 h-10 text-fg-faint">
          <Icon name="message" size={15} />
          <span className="text-2xs">Ask about any step…</span>
          <span className="ml-auto grid place-items-center h-7 w-7 rounded-lg bg-brand text-on-brand">
            <Icon name="arrow-right" size={14} />
          </span>
        </div>
      </div>
    </div>
  );
}
