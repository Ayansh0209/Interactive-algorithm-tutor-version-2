// ---------------------------------------------------------------------------
// Reusable UI primitives -- the ONLY place generic, presentation-only building
// blocks live. Everything here is theme-aware via design tokens (bg-surface,
// text-fg-muted, border-border, text-brand ...) defined in index.css. No raw
// hex. Anything that knows about traces or data structures belongs elsewhere.
//
//   import { Button, Card, Panel, Badge, Icon, Segmented } from "../ui";
// ---------------------------------------------------------------------------

export function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

// --- Button -----------------------------------------------------------------
const BTN_VARIANTS = {
  primary: "bg-brand text-on-brand hover:bg-brand-strong shadow-soft",
  secondary: "bg-surface-2 text-fg border border-border hover:border-border-strong",
  ghost: "bg-transparent text-fg-muted hover:text-fg hover:bg-fg/[0.06] border border-transparent",
  subtle: "bg-fg/[0.05] text-fg hover:bg-fg/[0.09]",
  danger: "bg-danger text-white hover:brightness-110",
};
const BTN_SIZES = {
  sm: "h-7 px-2.5 text-2xs gap-1",
  md: "h-9 px-3.5 text-sm gap-1.5",
  lg: "h-11 px-5 text-base gap-2",
};

export function Button({
  children, onClick, variant = "primary", size = "md",
  disabled, className = "", type = "button", title, ...rest
}) {
  return (
    <button
      type={type}
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "inline-flex items-center justify-center rounded-lg font-medium select-none",
        "transition-[background-color,color,box-shadow,transform,border-color] duration-150 ease-snap",
        "active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
        BTN_SIZES[size], BTN_VARIANTS[variant], className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// --- IconButton -------------------------------------------------------------
export function IconButton({ children, onClick, title, active, disabled, size = "md", ...rest }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <button
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      disabled={disabled}
      className={cx(
        "grid place-items-center rounded-lg transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        dim,
        active ? "bg-brand text-on-brand" : "bg-fg/[0.05] text-fg-muted hover:text-fg hover:bg-fg/[0.09]"
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

// --- Card -------------------------------------------------------------------
export function Card({ children, className = "", onClick, as: Tag = "div", ...rest }) {
  return (
    <Tag
      onClick={onClick}
      className={cx("rounded-2xl border border-border bg-surface", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

// --- Panel ------------------------------------------------------------------
export function Panel({ title, icon, right, children, className = "", bodyClassName = "" }) {
  return (
    <Card className={cx("flex flex-col overflow-hidden", className)}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            {icon && <span className="text-fg-faint shrink-0">{icon}</span>}
            <h3 className="text-2xs font-semibold uppercase tracking-wider text-fg-muted truncate">{title}</h3>
          </div>
          {right}
        </div>
      )}
      <div className={cx("flex-1 min-h-0 overflow-auto scrollbar-thin", bodyClassName)}>{children}</div>
    </Card>
  );
}

// --- Badge ------------------------------------------------------------------
const BADGE_TONES = {
  brand: "bg-brand-soft text-brand border-brand/30",
  indigo: "bg-brand-soft text-brand border-brand/30",
  green: "bg-success-soft text-success border-success/30",
  success: "bg-success-soft text-success border-success/30",
  amber: "bg-warning-soft text-warning border-warning/30",
  warning: "bg-warning-soft text-warning border-warning/30",
  rose: "bg-danger-soft text-danger border-danger/30",
  danger: "bg-danger-soft text-danger border-danger/30",
  info: "bg-info-soft text-info border-info/30",
  slate: "bg-fg/[0.05] text-fg-muted border-border",
  neutral: "bg-fg/[0.05] text-fg-muted border-border",
};

export function Badge({ children, color = "brand", className = "" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-2xs font-medium border",
        BADGE_TONES[color] || BADGE_TONES.brand, className
      )}
    >
      {children}
    </span>
  );
}

// --- Toggle (switch) --------------------------------------------------------
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-2xs text-fg-muted">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cx(
          "h-5 w-9 rounded-full p-0.5 transition-colors duration-200 shrink-0",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
          checked ? "bg-brand" : "bg-fg/15"
        )}
      >
        <span className={cx("block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200", checked && "translate-x-4")} />
      </button>
      {label}
    </label>
  );
}

// --- Select -----------------------------------------------------------------
export function Select({ value, onChange, options, placeholder, className = "" }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={cx(
        "bg-surface-2 border border-border rounded-lg px-2 py-1.5 text-2xs text-fg outline-none cursor-pointer",
        "focus-visible:ring-2 focus-visible:ring-brand/70 hover:border-border-strong transition-colors",
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const val = typeof o === "object" ? o.value : o;
        const lbl = typeof o === "object" ? o.label : o;
        return (
          <option key={val} value={val} className="bg-surface-2 text-fg">
            {lbl}
          </option>
        );
      })}
    </select>
  );
}

// --- Segmented control ------------------------------------------------------
// options: [{ value, label }] | string[]. Used for language/tab/mode switches.
export function Segmented({ value, onChange, options, size = "md", className = "" }) {
  const items = options.map((o) => (typeof o === "object" ? o : { value: o, label: o }));
  const pad = size === "sm" ? "px-2.5 py-1 text-2xs" : "px-3 py-1.5 text-sm";
  return (
    <div className={cx("inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface-2 p-0.5", className)} role="tablist">
      {items.map((it) => {
        const active = it.value === value;
        return (
          <button
            key={it.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(it.value)}
            className={cx(
              "rounded-md font-medium capitalize transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70",
              pad,
              active ? "bg-brand text-on-brand shadow-soft" : "text-fg-muted hover:text-fg"
            )}
          >
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

// --- Kbd --------------------------------------------------------------------
export function Kbd({ children }) {
  return (
    <kbd className="inline-grid place-items-center min-w-[1.4rem] h-5 px-1 rounded border border-border bg-surface-2 text-3xs font-mono text-fg-muted">
      {children}
    </kbd>
  );
}

// --- Spinner ----------------------------------------------------------------
export function Spinner({ className = "" }) {
  return (
    <span
      className={cx("inline-block h-4 w-4 rounded-full border-2 border-current border-r-transparent animate-spin", className)}
      aria-hidden="true"
    />
  );
}

// --- EmptyState -------------------------------------------------------------
export function EmptyState({ icon, title, hint, action, className = "" }) {
  return (
    <div className={cx("h-full w-full grid place-items-center p-8 text-center", className)}>
      <div className="max-w-xs">
        {icon && <div className="mx-auto mb-3 h-12 w-12 grid place-items-center rounded-2xl bg-fg/[0.04] text-fg-faint">{icon}</div>}
        {title && <p className="text-sm font-medium text-fg">{title}</p>}
        {hint && <p className="mt-1 text-2xs text-fg-faint leading-relaxed">{hint}</p>}
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

// --- Icon -------------------------------------------------------------------
// Small inline-SVG set (no icon dependency, keeps the bundle clean). Stroke uses
// currentColor; add new glyphs to ICONS as needed.
const ICONS = {
  play: <path d="M6 4.5v15l13-7.5z" fill="currentColor" stroke="none" />,
  pause: <><rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /><rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" /></>,
  "skip-back": <><rect x="5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none" /><path d="M20 5.5v13l-11-6.5z" fill="currentColor" stroke="none" /></>,
  "skip-forward": <><rect x="16.5" y="5" width="2.5" height="14" rx="1" fill="currentColor" stroke="none" /><path d="M4 5.5v13l11-6.5z" fill="currentColor" stroke="none" /></>,
  "step-back": <path d="M15 6l-6 6 6 6" />,
  "step-forward": <path d="M9 6l6 6-6 6" />,
  reset: <path d="M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  x: <path d="M6 6l12 12M18 6 6 18" />,
  check: <path d="M20 6 9 17l-5-5" />,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7" />,
  shuffle: <path d="M16 3h5v5M21 3l-7 7M4 20 9 15M4 4l5 5m7 11h5v-5m0 5-5-5" />,
  "arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  zap: <path d="M13 2 4 14h7l-1 8 9-12h-7z" />,
  book: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V4H6.5A2.5 2.5 0 0 0 4 6.5z" />,
  code: <path d="m9 18-6-6 6-6m6 0 6 6-6 6" />,
  home: <path d="M3 11.5 12 4l9 7.5M5 10v10h14V10" />,
  sparkles: <path d="M12 3l1.8 4.5L18 9l-4.2 1.5L12 15l-1.8-4.5L6 9l4.2-1.5zM18 14l.9 2.2L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.8z" />,
  layers: <path d="m12 3 9 5-9 5-9-5 9-5zm9 9-9 5-9-5m18 4-9 5-9-5" />,
  link: <path d="M9 15l6-6m-4-3 1-1a4 4 0 0 1 6 6l-1 1m-9 5-1 1a4 4 0 0 1-6-6l1-1" />,
  target: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  // Structure glyphs (used by the landing showcase + feature strips).
  grid: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  stack: <><rect x="3.5" y="4.5" width="17" height="4" rx="1.5" /><rect x="3.5" y="10" width="17" height="4" rx="1.5" /><rect x="3.5" y="15.5" width="17" height="4" rx="1.5" /></>,
  queue: <><rect x="3" y="8" width="4.5" height="8" rx="1.5" /><rect x="9.75" y="8" width="4.5" height="8" rx="1.5" /><rect x="16.5" y="8" width="4.5" height="8" rx="1.5" /></>,
  tree: <><circle cx="12" cy="5" r="2.4" /><circle cx="6" cy="18.5" r="2.4" /><circle cx="18" cy="18.5" r="2.4" /><path d="M10.6 6.7 7.4 16.4M13.4 6.7l3.2 9.7" /></>,
  graph: <><circle cx="6" cy="7" r="2.4" /><circle cx="18" cy="8" r="2.4" /><circle cx="12" cy="18" r="2.4" /><path d="M8.3 7.5 15.7 8.5M7.3 9 10.8 15.9M16.5 9.8 13.2 16.1" /></>,
  hash: <path d="M9.6 3.5 7.6 20.5M16.4 3.5l-2 17M4.5 8.8h15.4M3.9 15.2h15.4" />,
  table: <><rect x="3.5" y="4.5" width="17" height="15" rx="2" /><path d="M3.5 9.6h17M3.5 14.4h17M9.6 4.5v15M15 4.5v15" /></>,
  cpu: <><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m14-6h2m-2 6h2" /></>,
  terminal: <path d="M4 5.5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1zM7 9.5l3 2.5-3 2.5M12.5 15h4.5" />,
  message: <path d="M4 5.5h16a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1v-8a1 1 0 0 1 1-1z" />,
  bulb: <><path d="M9 18h6M10 21h4" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.5.5.8 1 .8 1.9h6c0-.9.3-1.4.8-1.9A6 6 0 0 0 12 3z" /></>,
  alert: <><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /><path d="M12 9v4M12 17h.01" /></>,
  compass: <><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  quote: <path d="M7 7H4v6h5V7l-2 4M20 7h-3v6h5V7l-2 4" />,
};

export function Icon({ name, size = 18, className = "", strokeWidth = 1.75 }) {
  const glyph = ICONS[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {glyph || null}
    </svg>
  );
}
