// Code with the current execution line highlighted, kept in sync with the
// timeline. The line RUNNING now is emphasized (brand bar + "run" tag) and the
// line ABOUT TO run next is shown with a fainter marker, so the flow of control
// reads at a glance. Editable when not running so the user can paste any code.

import { useEffect, useRef } from "react";
import { cx } from "./ui";

export default function CodePane({ code, onChange, currentLine, nextLine, editable }) {
  const lines = code.split("\n");
  const activeRef = useRef(null);

  // Keep the running line in view as the timeline advances.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [currentLine]);

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
        const upcoming = !active && n === nextLine;
        return (
          <div
            key={i}
            ref={active ? activeRef : null}
            className={cx(
              "flex transition-colors duration-200",
              active && "bg-brand/15",
              upcoming && "bg-brand/[0.06]"
            )}
          >
            <span className="select-none w-10 shrink-0 text-right pr-3 text-fg-faint/70 tabular-nums">{n}</span>
            <span
              className={cx(
                "pr-4 whitespace-pre border-l-2 pl-2 flex-1",
                active
                  ? "text-fg border-brand"
                  : upcoming
                    ? "text-fg-muted border-brand/40"
                    : "text-fg-muted border-transparent"
              )}
            >
              {ln || " "}
            </span>
            {active && (
              <span className="shrink-0 self-center mr-2 px-1.5 rounded bg-brand text-on-brand text-3xs font-semibold leading-4 tracking-wide">
                run
              </span>
            )}
            {upcoming && (
              <span className="shrink-0 self-center mr-2 px-1.5 rounded border border-brand/40 text-brand text-3xs font-medium leading-4 tracking-wide">
                next
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
