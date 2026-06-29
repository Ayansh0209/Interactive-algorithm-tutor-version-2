// primitive / object / fallback -> a simple value chip.

export default function PrimitiveView({ value, changed }) {
  let display = value;
  if (value && typeof value === "object") {
    display = value.type ? `<${value.type}>` : JSON.stringify(value);
  }
  return (
    <div className="px-4 py-2.5">
      <span
        className={`inline-block px-3 py-1.5 rounded-lg font-mono text-sm border transition ${
          changed
            ? "border-amber-400 bg-amber-400/15 text-amber-100"
            : "border-white/15 bg-white/[0.04] text-white/90"
        }`}
      >
        {String(display)}
      </span>
    </div>
  );
}
