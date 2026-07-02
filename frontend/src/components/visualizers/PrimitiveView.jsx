// primitive / object / fallback -> a simple value chip with a value-change pop.

import { motion } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";

export default function PrimitiveView({ value, changed }) {
  let display = value;
  if (value && typeof value === "object") display = value.type ? `<${value.type}>` : JSON.stringify(value);

  return (
    <div className="px-4 py-2.5">
      <motion.span
        key={String(display)}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={T.fast}
        className={cx(
          "inline-block px-3 py-1.5 rounded-lg font-mono text-sm border transition-colors",
          changed ? "border-warning bg-warning-soft text-fg" : "border-border bg-surface-2 text-fg"
        )}
      >
        {String(display)}
      </motion.span>
    </div>
  );
}
