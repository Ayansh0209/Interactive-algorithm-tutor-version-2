// Playback timeline: scrubber + transport controls, plus the two features that
// tame step-explosion: "semantic only" (collapse to meaningful events) and
// "focus" a single function so big runs become watchable.

import { IconButton, Toggle, Select } from "./ui";

export default function Timeline({ pb }) {
  const {
    cursor, setCursor, visibleCount, playing, setPlaying, speed, setSpeed,
    next, prev, reset, semanticOnly, setSemanticOnly, focusFn, setFocusFn, functions, current,
  } = pb;

  return (
    <div className="border-t border-white/10 bg-white/[0.02] px-4 py-2.5 space-y-2">
      <div className="flex items-center gap-2">
        <IconButton title="Reset" onClick={reset}>|&lt;</IconButton>
        <IconButton title="Previous" onClick={prev} disabled={cursor === 0}>&lt;</IconButton>
        <IconButton title={playing ? "Pause" : "Play"} onClick={() => setPlaying(!playing)} active={playing}>
          {playing ? "||" : ">"}
        </IconButton>
        <IconButton title="Next" onClick={next} disabled={cursor >= visibleCount - 1}>&gt;</IconButton>

        <input
          type="range"
          min={0}
          max={Math.max(0, visibleCount - 1)}
          value={cursor}
          onChange={(e) => setCursor(Number(e.target.value))}
          className="flex-1 accent-indigo-500"
        />
        <span className="text-xs text-white/50 tabular-nums w-20 text-right">
          {visibleCount ? cursor + 1 : 0} / {visibleCount}
        </span>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <Toggle checked={semanticOnly} onChange={setSemanticOnly} label="Key steps only" />
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          Focus:
          <Select value={focusFn} onChange={setFocusFn} options={functions} placeholder="all code" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/50">
          Speed:
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`px-1.5 rounded ${speed === s ? "text-indigo-300 font-semibold" : "hover:text-white/80"}`}
            >
              {s}x
            </button>
          ))}
        </div>
        {current && (
          <span className="text-xs text-white/40 ml-auto font-mono">
            line {current.line} - {current.function} - depth {current.depth}
          </span>
        )}
      </div>
    </div>
  );
}
