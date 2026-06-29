// Renders ALL live variables for the current step, each with the renderer that
// matches its detected type. Because every local is drawn independently, a
// program that uses (say) a stack as a helper next to the main array shows BOTH
// at once -- that is the "multi-structure" view, no special-casing required.

import { pickRenderer, TYPE_META } from "./visualizers/registry";
import { Badge } from "./ui";

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
    return <div className="p-6 text-white/30 text-sm italic">Run code to see variables.</div>;
  }
  const locals = step.locals || {};
  const types = step.var_types || {};
  const changed = new Set(step.highlight_vars || []);
  const entries = sortVars(Object.entries(locals), types);

  if (!entries.length) {
    return <div className="p-6 text-white/30 text-sm italic">No variables in scope yet.</div>;
  }

  return (
    <div className="p-3 space-y-3">
      {entries.map(([name, value]) => {
        const vtype = types[name] || "primitive";
        const Renderer = pickRenderer(vtype);
        const [label, color] = TYPE_META[vtype] || [vtype, "slate"];
        return (
          <div
            key={name}
            className={`rounded-xl border bg-white/[0.02] overflow-hidden transition ${
              changed.has(name) ? "border-amber-400/40" : "border-white/10"
            }`}
          >
            <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5">
              <span className="font-mono text-sm text-white/90">{name}</span>
              <Badge color={color}>{label}</Badge>
              {changed.has(name) && <span className="text-[10px] text-amber-300">updated</span>}
            </div>
            <Renderer
              name={name}
              value={value}
              vtype={vtype}
              step={step}
              changed={changed.has(name)}
              highlightIndices={indicesFromSemantic(step, name)}
            />
          </div>
        );
      })}
    </div>
  );
}
