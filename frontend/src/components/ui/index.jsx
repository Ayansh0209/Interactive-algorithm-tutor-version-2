// ---------------------------------------------------------------------------
// Reusable UI primitives.
//
// Every small, presentation-only building block lives here in ONE file so the
// rest of the app imports from a single place:  import { Button, Card } from "../ui"
// Keep anything stateless and generic here; anything that knows about traces or
// data structures belongs in components/visualizers or the page.
// ---------------------------------------------------------------------------

export function Button({ children, onClick, variant = "primary", disabled, className = "" }) {
  const styles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white",
    ghost: "bg-transparent hover:bg-white/10 text-current border border-white/15",
    subtle: "bg-white/5 hover:bg-white/10 text-current",
    danger: "bg-rose-600 hover:bg-rose-500 text-white",
  }[variant];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, title, active, disabled }) {
  return (
    <button
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={`h-9 w-9 grid place-items-center rounded-lg transition disabled:opacity-30 ${
        active ? "bg-indigo-600 text-white" : "bg-white/5 hover:bg-white/10 text-current"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({ children, className = "", onClick }) {
  return (
    <div onClick={onClick} className={`rounded-2xl border border-white/10 bg-white/[0.03] ${className}`}>
      {children}
    </div>
  );
}

export function Panel({ title, right, children, className = "" }) {
  return (
    <Card className={`flex flex-col overflow-hidden ${className}`}>
      {(title || right) && (
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50">{title}</h3>
          {right}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-auto">{children}</div>
    </Card>
  );
}

export function Badge({ children, color = "indigo" }) {
  const map = {
    indigo: "bg-indigo-500/15 text-indigo-300 border-indigo-400/30",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    rose: "bg-rose-500/15 text-rose-300 border-rose-400/30",
    slate: "bg-white/5 text-white/60 border-white/15",
  }[color];
  return (
    <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-medium border ${map}`}>
      {children}
    </span>
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-white/60">
      <span
        onClick={() => onChange(!checked)}
        className={`h-5 w-9 rounded-full p-0.5 transition ${checked ? "bg-indigo-600" : "bg-white/15"}`}
      >
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${checked ? "translate-x-4" : ""}`}
        />
      </span>
      {label}
    </label>
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value || null)}
      className="bg-white/5 border border-white/15 rounded-lg px-2 py-1 text-xs text-current outline-none"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o} value={o} className="bg-slate-800">
          {o}
        </option>
      ))}
    </select>
  );
}
