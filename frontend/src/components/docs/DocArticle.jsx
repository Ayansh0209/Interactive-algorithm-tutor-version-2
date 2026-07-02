// Renders one topic: title, summary, an interactive premade playground (if the
// topic declares one), prose sections, complexity table, the live engine demo,
// and a CTA. Animated entrance via framer-motion. Theme-token styled.

import { motion } from "framer-motion";
import { slideUp, T } from "../../lib/motion";
import EmbeddedViz from "./EmbeddedViz";
import PremadeEmbed from "./PremadeEmbed";
import { Badge, Button, Icon } from "../ui";

export default function DocArticle({ topic, onOpenFull }) {
  return (
    <motion.article
      key={topic.slug}
      {...slideUp}
      transition={T.base}
      className="max-w-3xl mx-auto px-6 py-9"
    >
      <Badge color="brand">{topic.category}</Badge>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-3 text-fg">{topic.title}</h1>
      <p className="text-fg-muted leading-relaxed text-[15px]">{topic.summary}</p>

      {topic.premade && (
        <section className="mt-7">
          <SectionLabel icon="zap">Interactive playground</SectionLabel>
          <PremadeEmbed id={topic.premade} />
        </section>
      )}

      {topic.sections.map((sec) => (
        <section key={sec.heading} className="mt-7">
          <h2 className="text-lg font-semibold mb-1.5 text-fg">{sec.heading}</h2>
          <p className="text-fg-muted leading-relaxed">{sec.body}</p>
        </section>
      ))}

      {topic.complexity && (
        <section className="mt-9">
          <h2 className="text-lg font-semibold mb-2 text-fg">Complexity</h2>
          <div className="rounded-xl border border-border overflow-hidden">
            {topic.complexity.map(([op, c], i) => (
              <div key={op} className={`flex justify-between px-4 py-2 text-sm ${i % 2 ? "bg-fg/[0.02]" : ""}`}>
                <span className="text-fg-muted">{op}</span>
                <span className="font-mono text-brand">{c}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {topic.demo && (
        <section className="mt-9">
          <SectionLabel icon="code">Run the real engine</SectionLabel>
          <EmbeddedViz demo={topic.demo} />
        </section>
      )}

      <div className="mt-8 rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm text-fg">Want to run your own {topic.title} code?</span>
        <Button onClick={onOpenFull}>Open the visualizer</Button>
      </div>
    </motion.article>
  );
}

function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2 text-2xs font-semibold uppercase tracking-wider text-fg-faint">
      <Icon name={icon} size={13} />
      {children}
    </div>
  );
}
