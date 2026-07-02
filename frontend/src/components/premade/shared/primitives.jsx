// Animated visual atoms shared across premade visualizers: a value box (array
// cell / list node / stack slot), a pointer tag (head / top / front), and a
// connector arrow. All theme-aware and framer-motion driven.

import { motion } from "framer-motion";
import { T } from "../../../lib/motion";
import { cx } from "../../ui";

// Visual states a box can be in. Mapped to token classes so they theme cleanly.
const BOX_STATES = {
  idle: "border-border bg-surface-2 text-fg",
  active: "border-brand bg-brand-soft text-fg ring-2 ring-brand/30",
  compare: "border-warning bg-warning-soft text-fg",
  visited: "border-success/50 bg-success-soft text-fg",
  found: "border-success bg-success-soft text-fg ring-2 ring-success/30",
  muted: "border-border bg-surface text-fg-faint",
  danger: "border-danger bg-danger-soft text-fg",
};

export function ValueBox({
  value, state = "idle", caption, sub, size = "md", className = "", layout = true, ...rest
}) {
  const dims = {
    sm: "min-w-9 h-9 text-2xs",
    md: "min-w-12 h-12 text-sm",
    lg: "min-w-14 h-14 text-base",
  }[size];
  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        layout={layout}
        transition={T.spring}
        className={cx(
          "grid place-items-center px-2 rounded-xl border font-mono font-medium tabular-nums",
          "transition-colors duration-200", dims, BOX_STATES[state] || BOX_STATES.idle, className
        )}
        {...rest}
      >
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={T.fast}
        >
          {formatValue(value)}
        </motion.span>
      </motion.div>
      {caption != null && <span className="text-3xs font-mono text-fg-faint leading-none">{caption}</span>}
      {sub != null && <span className="text-3xs text-fg-faint leading-none">{sub}</span>}
    </div>
  );
}

// A little labelled tag with a nub, used as head / tail / top / front markers.
// `dir` is the side the nub points TO ("down" => tag sits above its target).
const TAG_TONES = {
  brand: "bg-brand text-on-brand",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  danger: "bg-danger text-white",
  neutral: "bg-fg/75 text-bg",
};

export function PointerTag({ label, tone = "brand", dir = "down" }) {
  const cls = TAG_TONES[tone] || TAG_TONES.brand;
  const nub = <span className={cx("h-1.5 w-1.5 rotate-45 -my-0.5", cls)} />;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={T.spring}
      className="flex flex-col items-center"
    >
      {dir === "up" && nub}
      <span className={cx("px-1.5 h-4 grid place-items-center rounded text-3xs font-semibold uppercase tracking-wide", cls)}>
        {label}
      </span>
      {dir === "down" && nub}
    </motion.div>
  );
}

export function formatValue(v) {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "boolean") return v ? "T" : "F";
  return String(v);
}
