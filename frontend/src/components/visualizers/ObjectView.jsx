// object / class instance -> a labelled field table (Node: val, next ...),
// instead of an opaque "<Node object>". Handles the Python engine shape
// ({type:'object', cls, fields}) and a plain field dict (C++ structs / maps).

import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";

function fieldsOf(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    if (value.fields && typeof value.fields === "object") return { cls: value.cls, fields: value.fields };
    if (value.type === "object") return { cls: value.cls, fields: value.fields || {} };
    if (!value.type) return { cls: null, fields: value }; // plain dict (C++ struct / map)
  }
  return null;
}

function fmt(v) {
  if (v === null || v === undefined) return "None";
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === "boolean") return v ? "True" : "False";
  if (v && typeof v === "object") return v.cls ? `<${v.cls}>` : v.type ? `<${v.type}>` : "{…}";
  return String(v);
}

export default function ObjectView({ value, changed }) {
  const parsed = fieldsOf(value);

  // Fallback: a bare string/primitive (e.g. an old-shape scene).
  if (!parsed) {
    return (
      <div className="px-4 py-2.5">
        <span className={cx("inline-block px-3 py-1.5 rounded-lg font-mono text-sm border", changed ? "border-warning bg-warning-soft text-fg" : "border-border bg-surface-2 text-fg")}>
          {value && typeof value === "object" ? JSON.stringify(value) : String(value)}
        </span>
      </div>
    );
  }

  const { cls, fields } = parsed;
  const entries = Object.entries(fields || {});

  return (
    <div className="px-4 py-3">
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        {cls && (
          <div className="px-3 py-1 border-b border-border text-3xs font-mono uppercase tracking-wider text-fg-faint">{cls}</div>
        )}
        {entries.length === 0 ? (
          <div className="px-3 py-2 text-2xs text-fg-faint italic">no fields</div>
        ) : (
          <div className="divide-y divide-border">
            {entries.map(([k, v]) => (
              <motion.div key={k} layout className="flex items-center gap-3 px-3 py-1.5">
                <span className="font-mono text-2xs text-fg-muted shrink-0 min-w-[3.5rem]">{k}</span>
                <motion.span key={String(v)} initial={{ opacity: 0, y: 3 }} animate={{ opacity: 1, y: 0 }} transition={T.fast} className="font-mono text-sm text-fg truncate ml-auto text-right">
                  {fmt(v)}
                </motion.span>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
