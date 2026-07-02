// stack / queue / deque / heap -> oriented box stacks.
// Stack grows vertically with a "top" marker; queue/deque are horizontal with
// front/back markers. Heap is shown as its array form (level order). Items
// animate in and out.

import { motion, AnimatePresence } from "framer-motion";
import { T } from "../../lib/motion";
import { cx } from "../ui";

function itemsFrom(value) {
  return value?.values || (Array.isArray(value) ? value : []);
}

export default function StackQueueView({ value, vtype }) {
  const items = itemsFrom(value);

  if (vtype === "stack") {
    return (
      <div className="px-4 py-3">
        <div className="inline-flex flex-col-reverse gap-1">
          <AnimatePresence initial={false}>
            {items.map((it, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: -14, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -14, scale: 0.9 }}
                transition={T.spring}
                className="flex items-center gap-2"
              >
                <div className={cx(
                  "min-w-12 h-9 px-3 grid place-items-center rounded-lg border font-mono text-sm tabular-nums",
                  i === items.length - 1 ? "border-cat-stack/60 bg-warning-soft/60 text-fg" : "border-border bg-surface-2 text-fg"
                )}>
                  {String(it)}
                </div>
                {i === items.length - 1 && <span className="text-3xs font-semibold uppercase text-cat-stack">top</span>}
              </motion.div>
            ))}
          </AnimatePresence>
          {!items.length && <span className="text-fg-faint italic text-sm">empty</span>}
        </div>
      </div>
    );
  }

  // queue / deque / heap -> horizontal
  const frontLabel = vtype === "heap" ? "root" : "front";
  return (
    <div className="px-4 py-3 overflow-auto scrollbar-thin">
      <div className="flex items-start gap-1.5 flex-wrap">
        <AnimatePresence initial={false}>
          {items.map((it, i) => (
            <motion.div
              key={i}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={T.spring}
              className="flex flex-col items-center gap-1"
            >
              <div className="min-w-11 h-9 px-2 grid place-items-center rounded-lg border border-border bg-surface-2 font-mono text-sm tabular-nums text-fg">
                {String(it)}
              </div>
              <span className="text-3xs text-fg-faint leading-none">
                {i === 0 ? frontLabel : i === items.length - 1 ? "back" : i}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
        {!items.length && <span className="text-fg-faint italic text-sm">empty</span>}
      </div>
    </div>
  );
}
