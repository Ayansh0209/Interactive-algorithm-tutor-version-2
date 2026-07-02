// linked_list / doubly_linked_list -> nodes with crisp arrows.
// Renders a value cell + next-pointer cell per node, a head marker, a null
// terminator, and a circular badge when the chain loops. Nodes animate in/out.

import { motion, AnimatePresence } from "framer-motion";
import { T } from "../../lib/motion";
import { Icon, cx } from "../ui";

export default function LinkedListView({ value }) {
  const nodes = value?.nodes || [];
  const doubly = value?.type === "doubly_linked_list";
  const headIdx = value?.head ?? 0;

  if (!nodes.length) return <div className="px-4 py-4 text-fg-faint italic text-sm">empty / null</div>;

  return (
    <div className="px-4 py-4 overflow-auto scrollbar-thin">
      <div className="flex items-start gap-0 min-w-max">
        <AnimatePresence initial={false}>
          {nodes.map((node, i) => (
            <motion.div
              key={node.id ?? i}
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={T.spring}
              className="flex items-start"
            >
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-4">{i === headIdx && <span className="text-3xs font-semibold uppercase tracking-wide text-cat-linked">head</span>}</div>
                <div className="flex rounded-xl border border-border bg-surface-2 overflow-hidden">
                  <div className="min-w-10 h-10 grid place-items-center px-2 font-mono text-sm text-fg tabular-nums">
                    {String(node.value)}
                  </div>
                  <div className="w-5 h-10 grid place-items-center bg-fg/[0.03] border-l border-border">
                    {node.next === null ? <span className="text-3xs text-fg-faint">∅</span> : <span className="h-1.5 w-1.5 rounded-full bg-cat-linked" />}
                  </div>
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div className="flex items-center self-stretch pt-[1.35rem] text-fg-faint">
                  {doubly ? <Icon name="shuffle" size={12} className="rotate-90 text-cat-linked" /> : (
                    <span className="flex items-center"><span className="block h-px w-5 bg-border-strong" /><Icon name="chevron-right" size={14} className="-ml-1 text-fg-faint" /></span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {!value?.circular && (
          <div className="flex flex-col items-center gap-1.5 self-start">
            <div className="h-4" />
            <div className="flex items-center self-stretch">
              <span className="block h-px w-5 bg-border-strong mt-[1.1rem]" />
              <span className="h-10 grid place-items-center px-2.5 rounded-xl border border-dashed border-border text-2xs font-mono text-fg-faint">null</span>
            </div>
          </div>
        )}
        {value?.circular && (
          <span className={cx("ml-2 mt-[1.35rem] px-2 py-0.5 rounded-md text-2xs border border-warning/30 bg-warning-soft text-warning")}>circular</span>
        )}
      </div>
    </div>
  );
}
