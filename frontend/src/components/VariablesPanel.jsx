// Renders ALL live variables for the current step, each with the renderer that
// matches its detected type. Because every local is drawn independently, a
// program that uses (say) a stack as a helper next to the main array shows BOTH
// at once -- that is the "multi-structure" view, no special-casing required.

import { motion, AnimatePresence } from "framer-motion";
import { T } from "../lib/motion";
import { pickRenderer, TYPE_META } from "./visualizers/registry";
import { Badge, EmptyState, Icon, cx } from "./ui";
import ErrorBoundary from "./ErrorBoundary";

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

// Structures that grow horizontally get the FULL panel width (their renderers
// scale-to-fit) instead of being squeezed into one grid column with an inner
// scrollbar the user has to slide.
const WIDE_TYPES = new Set([
  "binary_tree", "avl_tree", "red_black_tree", "segment_tree", "nary_tree",
  "trie", "linked_list", "doubly_linked_list",
  "graph_adjacency_list", "graph_weighted", "matrix", "dp_grid",
]);

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

  // Lay variables out in fixed-width columns (1 when few, up to 3 when many) so
  // they use the panel's WIDTH instead of stacking into a scrollbar. AutoFit
  // (wrapping this) then scales the whole grid to fit the box exactly.
  const cols = entries.length <= 2 ? 1 : entries.length <= 6 ? 2 : 3;

  return (
    <div
      className="p-3"
      style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 17rem)`, gap: "0.7rem", alignItems: "start" }}
    >
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
              style={WIDE_TYPES.has(vtype) ? { gridColumn: "1 / -1" } : undefined}
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
              <ErrorBoundary label={name} resetKey={step?.i}>
                <Renderer
                  name={name}
                  value={value}
                  vtype={vtype}
                  step={step}
                  changed={changed.has(name)}
                  highlightIndices={indicesFromSemantic(step, name)}
                />
              </ErrorBoundary>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
