// Drives frame-by-frame playback for "compute then replay" premade visualizers
// (BFS, Dijkstra, sorts ...). The visualizer precomputes an array of immutable
// `frames`; this hook owns the cursor, play/pause, speed, and prev/next/seek.
//
// Structural visualizers that mutate live (linked list, stack) do NOT need this
// -- they animate via framer-motion layout on direct state changes.

import { useState, useEffect, useRef, useCallback } from "react";

export function useStepPlayer(frames, { initialSpeed = 1 } = {}) {
  const count = frames?.length || 0;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(initialSpeed);
  const timer = useRef(null);

  // Reset whenever a fresh batch of frames arrives.
  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [frames]);

  const atStart = index <= 0;
  const atEnd = index >= count - 1;

  const seek = useCallback((i) => {
    setIndex((cur) => {
      const n = Math.max(0, Math.min(count - 1, i));
      return Number.isFinite(n) ? n : cur;
    });
  }, [count]);

  const next = useCallback(() => setIndex((i) => Math.min(count - 1, i + 1)), [count]);
  const prev = useCallback(() => setIndex((i) => Math.max(0, i - 1)), []);
  const reset = useCallback(() => { setIndex(0); setPlaying(false); }, []);
  const toggle = useCallback(() => setPlaying((p) => (count > 1 ? !p : false)), [count]);

  // Auto-advance.
  useEffect(() => {
    if (!playing || count <= 1) return;
    timer.current = setInterval(() => {
      setIndex((i) => {
        if (i >= count - 1) { setPlaying(false); return i; }
        return i + 1;
      });
    }, 760 / speed);
    return () => clearInterval(timer.current);
  }, [playing, speed, count]);

  return {
    index, count, frame: frames?.[index] ?? null,
    atStart, atEnd, playing, speed,
    setSpeed, seek, next, prev, reset, toggle, setPlaying,
  };
}
