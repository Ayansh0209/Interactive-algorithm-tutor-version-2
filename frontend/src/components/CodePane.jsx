// Code with the current execution line highlighted, kept in sync with the
// timeline. Editable when not running so the user can paste any solution.

import { cx } from "./ui";

export default function CodePane({ code, onChange, currentLine, editable }) {
  const lines = code.split("\n");

  if (editable) {
    return (
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="h-full w-full resize-none bg-transparent px-4 py-3 font-mono text-sm leading-6 text-fg outline-none placeholder:text-fg-faint"
        placeholder="Paste any DSA solution here…"
      />
    );
  }

  return (
    <div className="h-full font-mono text-sm leading-6">
      {lines.map((ln, i) => {
        const n = i + 1;
        const active = n === currentLine;
        return (
          <div key={i} className={cx("flex transition-colors", active && "bg-brand/15")}>
            <span className="select-none w-10 shrink-0 text-right pr-3 text-fg-faint/70">{n}</span>
            <span className={cx("pr-4 whitespace-pre", active ? "text-fg border-l-2 border-brand pl-2" : "text-fg-muted pl-2 border-l-2 border-transparent")}>
              {ln || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
