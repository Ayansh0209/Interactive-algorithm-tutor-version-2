// Playback controller over a Trace's steps.
//
// Handles: current index, play/pause, speed, prev/next, scrub, and the
// "semantic steps only" filter that solves the step-explosion problem -- the
// user can collapse 1000 raw line-steps down to the ~40 moments that matter.

import { useState, useEffect, useMemo, useRef, useCallback } from "react";

export function usePlayback(trace) {
  const steps = trace?.steps || [];

  const [semanticOnly, setSemanticOnly] = useState(false);
  const [focusFn, setFocusFn] = useState(null); // null = all functions
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // steps per ~600ms
  const timer = useRef(null);

  // The visible step indices after applying filters.
  const visible = useMemo(() => {
    let idx = steps.map((_, i) => i);
    if (focusFn) idx = idx.filter((i) => steps[i].function === focusFn);
    if (semanticOnly) idx = idx.filter((i) => (steps[i].semantic || []).length > 0);
    return idx.length ? idx : steps.map((_, i) => i);
  }, [steps, semanticOnly, focusFn]);

  // Keep cursor in range when filters change.
  useEffect(() => {
    setCursor((c) => Math.min(c, Math.max(0, visible.length - 1)));
  }, [visible.length]);

  // On a fresh trace, jump to the first step that actually has variables in
  // scope (step 1 is usually the line BEFORE the first assignment -> blank).
  useEffect(() => {
    if (!steps.length) return;
    const pos = visible.findIndex(
      (i) => Object.keys(steps[i].locals || {}).length > 0
    );
    setCursor(pos > 0 ? pos : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps]);

  const stepIndex = visible[cursor] ?? 0;
  const current = steps[stepIndex] || null;
  // The step that will run next (in the filtered view) -- powers the "line about
  // to run" highlight in the code pane.
  const nextIndex = visible[cursor + 1];
  const nextStep = nextIndex != null ? steps[nextIndex] || null : null;

  const next = useCallback(() => {
    setCursor((c) => (c < visible.length - 1 ? c + 1 : c));
  }, [visible.length]);
  const prev = useCallback(() => setCursor((c) => (c > 0 ? c - 1 : 0)), []);
  const reset = useCallback(() => {
    setCursor(0);
    setPlaying(false);
  }, []);
  const toEnd = useCallback(() => {
    setPlaying(false);
    setCursor(Math.max(0, visible.length - 1));
  }, [visible.length]);

  // Auto-advance loop.
  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setCursor((c) => {
        if (c >= visible.length - 1) {
          setPlaying(false);
          return c;
        }
        return c + 1;
      });
    }, 600 / speed);
    return () => clearInterval(timer.current);
  }, [playing, speed, visible.length]);

  const functions = useMemo(
    () => [...new Set(steps.map((s) => s.function))].filter((f) => f && f !== "<module>"),
    [steps]
  );

  return {
    steps,
    current,
    nextStep,
    stepIndex,
    cursor,
    setCursor,
    visibleCount: visible.length,
    playing,
    setPlaying,
    speed,
    setSpeed,
    next,
    prev,
    reset,
    toEnd,
    semanticOnly,
    setSemanticOnly,
    focusFn,
    setFocusFn,
    functions,
  };
}
