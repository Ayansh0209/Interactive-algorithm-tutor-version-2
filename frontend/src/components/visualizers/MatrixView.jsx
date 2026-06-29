// matrix / dp_grid -> a 2D grid of cells.
// For dp_grid we tint non-zero/filled cells so the table "filling in" reads
// clearly. Highlights the most recently written cell.

function rowsFrom(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") return value.rows || [];
  return [];
}

export default function MatrixView({ value, lastWrite }) {
  const rows = rowsFrom(value);
  const isDP = value && value.type === "dp_grid";

  return (
    <div className="px-4 py-3 overflow-auto">
      <div className="inline-block">
        {rows.map((row, i) => (
          <div key={i} className="flex">
            {(row || []).map((cell, j) => {
              const filled = isDP && cell !== 0 && cell !== null && cell !== "";
              const isHot = lastWrite && lastWrite[0] === i && lastWrite[1] === j;
              return (
                <div
                  key={j}
                  className={`w-10 h-10 grid place-items-center border text-xs font-mono transition-all duration-300 ${
                    isHot
                      ? "border-amber-400 bg-amber-400/25 text-amber-100"
                      : filled
                      ? "border-indigo-400/30 bg-indigo-500/15 text-indigo-100"
                      : "border-white/10 bg-white/[0.02] text-white/70"
                  }`}
                >
                  {cell === null ? "" : typeof cell === "boolean" ? (cell ? "1" : "0") : String(cell)}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
