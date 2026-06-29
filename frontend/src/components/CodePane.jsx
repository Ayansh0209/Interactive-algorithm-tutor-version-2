// Code with the current execution line highlighted, kept in sync with the
// timeline. Editable when not running so the user can paste any solution.

export default function CodePane({ code, onChange, currentLine, editable }) {
  const lines = code.split("\n");

  if (editable) {
    return (
      <div className="h-full flex flex-col">
        <textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="flex-1 w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-white/90 outline-none"
          placeholder="Paste any Python DSA solution here..."
        />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto font-mono text-sm leading-6">
      {lines.map((ln, i) => {
        const n = i + 1;
        const active = n === currentLine;
        return (
          <div
            key={i}
            className={`flex transition-colors ${active ? "bg-indigo-500/20" : ""}`}
          >
            <span className="select-none w-10 shrink-0 text-right pr-3 text-white/25">{n}</span>
            <span
              className={`pr-4 whitespace-pre ${
                active ? "text-white border-l-2 border-indigo-400 pl-2" : "text-white/75 pl-2"
              }`}
            >
              {ln || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
