// Array / list / dp_array / dsu / set -> a row of boxes.
// Highlights cells that were just written (from semantic events) and draws
// pointer markers for any integer local that indexes into this array
// (i, j, left, right, lo, hi, slow, fast ...). That pointer overlay is what
// makes two-pointer / sliding-window / binary-search click visually.

const POINTER_NAMES = new Set([
  "i", "j", "k", "left", "right", "lo", "hi", "l", "r", "mid",
  "slow", "fast", "start", "end", "p", "q", "low", "high",
]);

function cellsFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value.values || value.parent || [];
  return [];
}

export default function ArrayView({ name, value, step, highlightIndices = [] }) {
  const cells = cellsFrom(value);
  const hi = new Set(highlightIndices);

  // Pointer overlay: integer locals that fall within this array's index range.
  const pointers = {};
  const locals = step?.locals || {};
  for (const [k, v] of Object.entries(locals)) {
    if (k === name) continue;
    if (typeof v === "number" && Number.isInteger(v) && v >= 0 && v < cells.length) {
      if (POINTER_NAMES.has(k) || cells.length <= 64) {
        (pointers[v] = pointers[v] || []).push(k);
      }
    }
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-end gap-1 flex-wrap">
        {cells.map((c, i) => (
          <div key={i} className="flex flex-col items-center">
            <div
              className={`min-w-[2.5rem] h-10 px-2 grid place-items-center rounded-lg border text-sm font-mono transition-all duration-300 ${
                hi.has(i)
                  ? "border-amber-400 bg-amber-400/20 text-amber-200 scale-110"
                  : "border-white/15 bg-white/[0.04] text-white/90"
              }`}
            >
              {formatCell(c)}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5">{i}</div>
            <div className="h-4 flex flex-col items-center">
              {pointers[i] && (
                <span className="text-[10px] text-indigo-300 font-semibold leading-tight">
                  {pointers[i].join(",")}
                </span>
              )}
            </div>
          </div>
        ))}
        {cells.length === 0 && <span className="text-white/30 text-sm italic">empty</span>}
      </div>
    </div>
  );
}

function formatCell(c) {
  if (c === null) return "/";
  if (typeof c === "boolean") return c ? "T" : "F";
  if (typeof c === "object") return JSON.stringify(c);
  return String(c);
}
