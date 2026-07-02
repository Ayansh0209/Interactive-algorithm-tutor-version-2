// Renders ALL live variables for the current step, each with the renderer that
// matches its detected type. Because every local is drawn independently, a
// program that uses (say) a stack as a helper next to the main array shows BOTH
// at once -- that is the "multi-structure" view, no special-casing required.

import { motion, AnimatePresence } from "framer-motion";
import { T } from "../lib/motion";
import { pickRenderer, TYPE_META } from "./visualizers/registry";
import { Badge, EmptyState, Icon, cx } from "./ui";

function indicesFromSemantic(step, name) {
  const out = [];
  for (const e of step?.semantic || []) {
    if (e.target !== name) continue;
    if (e.kind === "write") out.push(e.index);
    if (e.kind === "swap") out.push(e.i, e.j);
  }
  return out;
}

// Order: structures first (more interesting), primitives last.
function sortVars(entries, types) {
  const weight = (t) => (["primitive", "object", "constructing"].includes(t) ? 1 : 0);
  return [...entries].sort((a, b) => weight(types[a[0]]) - weight(types[b[0]]));
}

export default function VariablesPanel({ step }) {
  if (!step) {
    return <EmptyState icon={<Icon name="target" size={22} />} title="No step selected" hint="Run code to see variables." />;
  }
  const locals = step.locals || {};
  const types = step.var_types || {};
  const changed = new Set(step.highlight_vars || []);
  const entries = sortVars(Object.entries(locals), types);

  if (!entries.length) {
    return <EmptyState icon={<Icon name="layers" size={22} />} title="No variables in scope yet" hint="Step forward — they appear as your code assigns them." />;
  }

  return (
    <div className="p-3 space-y-3">
      <AnimatePresence initial={false}>
        {entries.map(([name, value]) => {
          const vtype = types[name] || "primitive";
          const Renderer = pickRenderer(vtype);
          const [label, color] = TYPE_META[vtype] || [vtype, "slate"];
          return (
            <motion.div
              key={name}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={T.base}
              className={cx(
                "rounded-xl border bg-surface-2 overflow-hidden transition-colors duration-300",
                changed.has(name) ? "border-warning/50 shadow-soft" : "border-border"
              )}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border">
                <span className="font-mono text-sm text-fg">{name}</span>
                <Badge color={color}>{label}</Badge>
                {changed.has(name) && <span className="text-3xs text-warning ml-auto">updated</span>}
              </div>
              <Renderer
                name={name}
                value={value}
                vtype={vtype}
                step={step}
                changed={changed.has(name)}
                highlightIndices={indicesFromSemantic(step, name)}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
