// The site wordmark, shared across page headers. Full name ("Interactive
// Algorithm Tutor") shows where there's room; a compact "IAT" mark takes over
// on narrow screens automatically, or always when `forceShort` is set (the
// Visualizer header is cramped with its language/example controls at any
// viewport width, so it always uses the short mark).

import { cx } from "./ui";

export default function Wordmark({ onClick, className = "", forceShort = false }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={cx(
        "font-bold tracking-tight text-fg select-none whitespace-nowrap",
        onClick && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 rounded",
        className
      )}
    >
      {forceShort ? (
        <>IA<span className="text-brand">T</span></>
      ) : (
        <>
          <span className="sm:hidden">IA<span className="text-brand">T</span></span>
          <span className="hidden sm:inline">Interactive Algorithm <span className="text-brand">Tutor</span></span>
        </>
      )}
    </Tag>
  );
}
