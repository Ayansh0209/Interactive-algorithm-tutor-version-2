// Playback timeline: transport + scrubber, plus the two features that tame
// step-explosion: "key steps only" (semantic events) and "focus" a function.
// Keyboard: ←/→ step, Space play/pause, Home/End jump (when not typing).

import { useEffect } from "react";
import { Toggle, Select, Icon, Kbd, cx } from "./ui";

export default function Timeline({ pb }) {
  const {
    cursor, setCursor, visibleCount, playing, setPlaying, speed, setSpeed,
    next, prev, reset, toEnd, semanticOnly, setSemanticOnly, focusFn, setFocusFn, functions, current,
  } = pb;

  // Keyboard controls (ignored while typing in a field).
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); next(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
      else if (e.key === " ") { e.preventDefault(); setPlaying((p) => !p); }
      else if (e.key === "Home") { e.preventDefault(); reset(); }
      else if (e.key === "End") { e.preventDefault(); toEnd(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, setPlaying, reset, toEnd]);

  const Tbtn = ({ icon, title, onClick, disabled, primary }) => (
    <button
      title={title} aria-label={title} onClick={onClick} disabled={disabled}
      className={cx(
        "grid place-items-center h-9 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 disabled:opacity-30 disabled:cursor-not-allowed",
        primary ? "w-10 bg-brand text-on-brand hover:bg-brand-strong" : "w-9 bg-fg/[0.05] text-fg-muted hover:text-fg hover:bg-fg/[0.09]"
      )}
    >
      <Icon name={icon} size={16} />
    </button>
  );

  return (
    <div className="border-t border-border bg-surface px-4 py-2.5 space-y-2 shrink-0">
      <div className="flex items-center gap-2">
        <Tbtn icon="skip-back" title="Reset (Home)" onClick={reset} disabled={cursor === 0} />
        <Tbtn icon="step-back" title="Previous (←)" onClick={prev} disabled={cursor === 0} />
        <Tbtn icon={playing ? "pause" : "play"} title={playing ? "Pause (Space)" : "Play (Space)"} onClick={() => setPlaying(!playing)} primary />
        <Tbtn icon="step-forward" title="Next (→)" onClick={next} disabled={cursor >= visibleCount - 1} />
        <Tbtn icon="skip-forward" title="End (End)" onClick={toEnd} disabled={cursor >= visibleCount - 1} />

        <input
          type="range" min={0} max={Math.max(0, visibleCount - 1)} value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          aria-label="Timeline position"
          className="flex-1 accent-[var(--brand)]"
        />
        <span className="text-2xs text-fg-muted tabular-nums w-16 text-right">
          {visibleCount ? cursor + 1 : 0} / {visibleCount}
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Toggle checked={semanticOnly} onChange={setSemanticOnly} label="Key steps only" />
        <div className="flex items-center gap-1.5 text-2xs text-fg-muted">
          Focus:
          <Select value={focusFn} onChange={setFocusFn} options={functions} placeholder="all code" />
        </div>
        <div className="flex items-center gap-1 text-2xs text-fg-muted">
          Speed:
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={cx("px-1.5 h-6 rounded hover:text-fg transition-colors", speed === s ? "text-brand font-semibold" : "")}
            >
              {s}x
            </button>
          ))}
        </div>
        <div className="hidden xl:flex items-center gap-1 text-3xs text-fg-faint">
          <Kbd>←</Kbd><Kbd>→</Kbd> step <Kbd>Space</Kbd> play
        </div>
        {current && (
          <span className="text-2xs text-fg-faint ml-auto font-mono">
            line {current.line} · {current.function} · depth {current.depth}
          </span>
        )}
      </div>
    </div>
  );
}
