// Collapsible, filterable topic navigation for the docs section. Each category
// is an accordion: click its header to expand/collapse its topics. The active
// topic's category is open by default; a search query auto-expands any category
// with matches. On mobile it slides in as a drawer (controlled by `open`).

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CATEGORIES, TOPICS } from "../../lib/docsContent";
import { T } from "../../lib/motion";
import { Icon, cx } from "../ui";

export default function DocsSidebar({ activeSlug, onSelect, open }) {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const activeCat = useMemo(() => TOPICS.find((t) => t.slug === activeSlug)?.category, [activeSlug]);

  // Which categories are manually expanded. Defaults to the active one.
  const [expanded, setExpanded] = useState(() => ({ [activeCat]: true }));
  const toggle = (id) => setExpanded((e) => ({ ...e, [id]: !e[id] }));

  const match = (t) => !query || t.title.toLowerCase().includes(query) || (t.summary || "").toLowerCase().includes(query);

  return (
    <nav
      className={cx(
        "w-64 shrink-0 border-r border-border bg-surface overflow-auto scrollbar-thin p-3",
        "lg:relative lg:translate-x-0 lg:bg-transparent",
        "absolute inset-y-0 left-0 z-40 transition-transform duration-200 ease-snap",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
      aria-label="Docs topics"
    >
      <div className="relative mb-3">
        <Icon name="search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-fg-faint" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter topics…"
          spellCheck={false}
          className="w-full h-9 pl-8 pr-2 rounded-lg bg-surface-2 border border-border text-sm text-fg outline-none focus-visible:ring-2 focus-visible:ring-brand/70 placeholder:text-fg-faint"
        />
      </div>

      <div className="space-y-0.5">
        {CATEGORIES.map((cat) => {
          const topics = TOPICS.filter((t) => t.category === cat.id && match(t));
          if (!topics.length) return null;
          // Open if manually expanded, if it's the active category, or when searching.
          const isOpen = query ? true : expanded[cat.id] ?? cat.id === activeCat;
          return (
            <div key={cat.id}>
              <button
                onClick={() => toggle(cat.id)}
                aria-expanded={isOpen}
                className={cx(
                  "w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-colors",
                  "text-fg-muted hover:text-fg hover:bg-fg/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/70"
                )}
              >
                <Icon name="chevron-right" size={13} className={cx("shrink-0 transition-transform duration-200 text-fg-faint", isOpen && "rotate-90")} />
                <span className="flex-1 text-2xs font-semibold uppercase tracking-wider">{cat.label}</span>
                <span className="text-3xs font-mono text-fg-faint tabular-nums">{topics.length}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={T.fast}
                    className="overflow-hidden pl-3.5 ml-1 border-l border-border"
                  >
                    {topics.map((t) => {
                      const active = t.slug === activeSlug;
                      return (
                        <li key={t.slug}>
                          <button
                            onClick={() => onSelect(t.slug)}
                            className={cx(
                              "relative w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-lg text-sm transition-colors",
                              active ? "text-fg" : "text-fg-muted hover:text-fg hover:bg-fg/[0.05]"
                            )}
                          >
                            {active && (
                              <motion.span layoutId="docs-active" className="absolute inset-0 rounded-lg bg-brand-soft border border-brand/30" transition={{ type: "spring", stiffness: 500, damping: 38 }} />
                            )}
                            <span className="relative flex-1 truncate">{t.title}</span>
                            {t.premade && <Icon name="zap" size={12} className="relative text-brand shrink-0" />}
                          </button>
                        </li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
