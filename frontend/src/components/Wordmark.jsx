// The DSAviz wordmark, shared across page headers.

import { cx } from "./ui";

export default function Wordmark({ onClick, className = "" }) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      className={cx("font-bold tracking-tight text-fg select-none", onClick && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 rounded", className)}
    >
      DSA<span className="text-brand">viz</span>
    </Tag>
  );
}
