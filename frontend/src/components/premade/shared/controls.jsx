// Small control-bar building blocks shared by every premade visualizer:
// operation buttons, labelled inputs, a legend, a narration status bar, the
// transport (step/play/speed) row, and stat chips. Keep these generic.

import { Icon, Spinner, cx } from "../../ui";

// A labelled text/number input that submits on Enter.
export function Field({ label, value, onChange, onSubmit, placeholder, width = "w-20", type = "text", disabled }) {
  return (
    <label className="flex items-center gap-1.5 text-2xs text-fg-muted">
      {label && <span className="select-none">{label}</span>}
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && onSubmit) onSubmit(); }}
        placeholder={placeholder}
        spellCheck={false}
        className={cx(
          "h-8 px-2 rounded-lg bg-surface-2 border border-border text-fg text-sm font-mono",
          "outline-none focus-visible:ring-2 focus-visible:ring-brand/70 hover:border-border-strong",
          "placeholder:text-fg-faint disabled:opacity-40 transition-colors", width
        )}
      />
    </label>
  );
}

// One operation button (Insert front, Push, Pop ...). Icon optional.
export function OpButton({ children, onClick, icon, disabled, busy, tone = "default", title }) {
  const tones = {
    default: "bg-fg/[0.05] text-fg hover:bg-fg/[0.09] border border-border",
    brand: "bg-brand text-on-brand hover:bg-brand-strong border border-transparent shadow-soft",
    danger: "bg-danger-soft text-danger hover:bg-danger/20 border border-danger/25",
  };
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled || busy}
      className={cx(
        "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-2xs font-medium",
        "transition-[background-color,transform] duration-150 ease-snap active:scale-[0.97]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        tones[tone]
      )}
    >
      {busy ? <Spinner className="h-3.5 w-3.5" /> : icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </button>
  );
}

// Colored-dot legend. items: [{ label, color }] where color is a token class
// like "bg-brand" or an inline style color.
export function Legend({ items, className = "" }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-x-3 gap-y-1.5", className)}>
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1.5 text-3xs text-fg-faint">
          <span className={cx("h-2.5 w-2.5 rounded-full", it.color)} style={it.style} />
          {it.label}
        </span>
      ))}
    </div>
  );
}

// Narration line under the canvas ("Inserted 7 at head", "Visit node 0 ...").
export function StatusBar({ children, tone = "neutral" }) {
  const tones = {
    neutral: "text-fg-muted",
    brand: "text-brand",
    success: "text-success",
    danger: "text-danger",
  };
  return (
    <div className="flex items-center gap-2 px-4 py-2 border-t border-border min-h-9">
      <Icon name="sparkles" size={13} className="text-fg-faint shrink-0" />
      <p className={cx("text-2xs leading-snug", tones[tone])}>{children}</p>
    </div>
  );
}

// A compact label:value chip (size = 5, top = 0 ...).
export function Stat({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-fg/[0.04] px-2 h-6 text-3xs text-fg-faint">
      {label}
      <b className="font-mono text-2xs text-fg-muted">{value}</b>
    </span>
  );
}

// Transport row for useStepPlayer-driven visualizers.
export function StepTransport({ player, label }) {
  const { index, count, playing, atStart, atEnd, speed, setSpeed, next, prev, reset, toggle, seek } = player;
  const tbtn = "grid place-items-center h-8 w-8 rounded-lg bg-fg/[0.05] text-fg-muted hover:text-fg hover:bg-fg/[0.09] disabled:opacity-30 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70";
  return (
    <div className="flex items-center gap-2 px-4 py-2.5 border-t border-border">
      <button className={tbtn} title="Reset" aria-label="Reset" onClick={reset} disabled={atStart && !playing}><Icon name="skip-back" size={15} /></button>
      <button className={tbtn} title="Previous step" aria-label="Previous step" onClick={prev} disabled={atStart}><Icon name="step-back" size={15} /></button>
      <button
        className={cx(tbtn, "bg-brand text-on-brand hover:bg-brand-strong w-9")}
        title={playing ? "Pause" : "Play"} aria-label={playing ? "Pause" : "Play"}
        onClick={toggle} disabled={count <= 1}
      >
        <Icon name={playing ? "pause" : "play"} size={15} />
      </button>
      <button className={tbtn} title="Next step" aria-label="Next step" onClick={next} disabled={atEnd}><Icon name="step-forward" size={15} /></button>

      <input
        type="range" min={0} max={Math.max(0, count - 1)} value={index}
        onChange={(e) => seek(Number(e.target.value))}
        aria-label="Step"
        className="flex-1 min-w-16 accent-[var(--brand)]"
      />
      <span className="text-3xs font-mono text-fg-faint tabular-nums w-14 text-right">
        {count ? index + 1 : 0}/{count}
      </span>
      <div className="hidden sm:flex items-center gap-0.5 text-3xs text-fg-faint pl-1">
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
      {label && <span className="sr-only">{label}</span>}
    </div>
  );
}
