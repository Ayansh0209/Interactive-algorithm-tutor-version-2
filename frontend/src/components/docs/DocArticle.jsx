// Renders one docs topic as a textbook-style article: a key-idea callout, an
// interactive premade playground, an animated "how it works" walkthrough, prose
// sections, a complexity table, pitfalls, a when-to-use guide, variants,
// real-world uses, a live engine demo, and further-reading references to the
// standard algorithms books. Every field is optional; each present one renders
// as its own scroll-revealed, framer-motion-animated section. Body text
// supports inline **bold** and `code`.

import { motion } from "framer-motion";
import { slideUp, T } from "../../lib/motion";
import EmbeddedViz from "./EmbeddedViz";
import PremadeEmbed from "./PremadeEmbed";
import { Badge, Button, Icon, cx } from "../ui";

// --- inline formatter: **bold** and `code` --------------------------------
function RichText({ text }) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**"))
      return <strong key={i} className="font-semibold text-fg">{p.slice(2, -2)}</strong>;
    if (p.startsWith("`") && p.endsWith("`"))
      return <code key={i} className="px-1 py-0.5 rounded bg-fg/[0.06] border border-border font-mono text-[0.88em] text-brand">{p.slice(1, -1)}</code>;
    return <span key={i}>{p}</span>;
  });
}

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
};

function Section({ children, className = "" }) {
  return (
    <motion.section {...reveal} transition={T.base} className={cx("mt-10", className)}>
      {children}
    </motion.section>
  );
}

function SectionLabel({ icon, children }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5 text-2xs font-semibold uppercase tracking-wider text-fg-faint">
      <Icon name={icon} size={13} /> {children}
    </div>
  );
}

export default function DocArticle({ topic, onOpenFull }) {
  return (
    <motion.article key={topic.slug} {...slideUp} transition={T.base} className="max-w-3xl mx-auto px-6 py-9">
      {/* Header */}
      <Badge color="brand">{topic.category}</Badge>
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-3 mb-3 text-fg">{topic.title}</h1>
      <p className="text-fg-muted leading-relaxed text-[15px]"><RichText text={topic.summary} /></p>

      {/* Key idea callout */}
      {topic.keyIdea && (
        <motion.div {...reveal} transition={T.base} className="mt-6 rounded-xl border border-brand/25 bg-brand-soft px-4 py-3.5 flex gap-3">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-brand/15 text-brand shrink-0">
            <Icon name="bulb" size={17} />
          </span>
          <div>
            <div className="text-2xs font-semibold uppercase tracking-wider text-brand/90 mb-0.5">Key idea</div>
            <p className="text-sm text-fg leading-relaxed"><RichText text={topic.keyIdea} /></p>
          </div>
        </motion.div>
      )}

      {/* Interactive playground */}
      {topic.premade && (
        <Section>
          <SectionLabel icon="zap">Interactive playground</SectionLabel>
          <PremadeEmbed id={topic.premade} />
        </Section>
      )}

      {/* How it works: animated numbered steps */}
      {topic.howItWorks && (
        <Section>
          <SectionLabel icon="layers">How it works</SectionLabel>
          {topic.howItWorks.intro && (
            <p className="text-fg-muted leading-relaxed mb-4"><RichText text={topic.howItWorks.intro} /></p>
          )}
          <ol className="space-y-2.5">
            {topic.howItWorks.steps.map((step, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -14 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ ...T.base, delay: i * 0.06 }}
                className="flex gap-3 items-start"
              >
                <span className="grid place-items-center h-6 w-6 rounded-full bg-brand text-on-brand text-2xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-fg-muted leading-relaxed pt-0.5"><RichText text={step} /></span>
              </motion.li>
            ))}
          </ol>
        </Section>
      )}

      {/* Prose sections */}
      {topic.sections && topic.sections.map((sec) => (
        <Section key={sec.heading}>
          <h2 className="text-lg font-semibold mb-1.5 text-fg">{sec.heading}</h2>
          <p className="text-fg-muted leading-relaxed"><RichText text={sec.body} /></p>
        </Section>
      ))}

      {/* Complexity table */}
      {topic.complexity && (
        <Section>
          <SectionLabel icon="cpu">Complexity</SectionLabel>
          <div className="rounded-xl border border-border overflow-hidden">
            {topic.complexity.map(([op, c, note], i) => (
              <motion.div
                key={op}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ ...T.fast, delay: i * 0.04 }}
                className={cx("flex items-center justify-between gap-3 px-4 py-2.5 text-sm", i % 2 && "bg-fg/[0.02]")}
              >
                <span className="text-fg-muted">{op}{note && <span className="text-fg-faint text-2xs ml-2">{note}</span>}</span>
                <span className="font-mono text-brand shrink-0">{c}</span>
              </motion.div>
            ))}
          </div>
        </Section>
      )}

      {/* Pitfalls */}
      {topic.pitfalls && (
        <Section>
          <SectionLabel icon="alert">Common pitfalls</SectionLabel>
          <ul className="space-y-2">
            {topic.pitfalls.map((p, i) => (
              <li key={i} className="flex gap-2.5 items-start rounded-lg border border-warning/25 bg-warning-soft/60 px-3 py-2">
                <Icon name="alert" size={15} className="text-warning shrink-0 mt-0.5" />
                <span className="text-sm text-fg-muted leading-relaxed"><RichText text={p} /></span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* When to use / avoid */}
      {topic.whenToUse && (
        <Section>
          <SectionLabel icon="compass">When to use it</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-3">
            {topic.whenToUse.use && (
              <div className="rounded-xl border border-success/25 bg-success-soft/50 p-3.5">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-success mb-2"><Icon name="check" size={13} /> Reach for it</div>
                <ul className="space-y-1.5">
                  {topic.whenToUse.use.map((u, i) => (
                    <li key={i} className="text-sm text-fg-muted leading-relaxed flex gap-2"><span className="text-success mt-1">•</span><span><RichText text={u} /></span></li>
                  ))}
                </ul>
              </div>
            )}
            {topic.whenToUse.avoid && (
              <div className="rounded-xl border border-danger/25 bg-danger-soft/40 p-3.5">
                <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-danger mb-2"><Icon name="x" size={13} /> Look elsewhere</div>
                <ul className="space-y-1.5">
                  {topic.whenToUse.avoid.map((u, i) => (
                    <li key={i} className="text-sm text-fg-muted leading-relaxed flex gap-2"><span className="text-danger mt-1">•</span><span><RichText text={u} /></span></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Variants */}
      {topic.variants && (
        <Section>
          <SectionLabel icon="layers">Variants &amp; related</SectionLabel>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {topic.variants.map((v) => (
              <div key={v.name} className="rounded-xl border border-border bg-surface-2 px-3.5 py-2.5">
                <div className="font-medium text-sm text-fg">{v.name}</div>
                <p className="text-2xs text-fg-muted leading-relaxed mt-0.5"><RichText text={v.note} /></p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Real-world uses */}
      {topic.realWorld && (
        <Section>
          <SectionLabel icon="target">Where you'll meet it</SectionLabel>
          <ul className="flex flex-wrap gap-2">
            {topic.realWorld.map((r, i) => (
              <li key={i} className="text-2xs text-fg-muted rounded-full border border-border bg-surface-2 px-3 py-1">{r}</li>
            ))}
          </ul>
        </Section>
      )}

      {/* Live engine demo */}
      {topic.demo && (
        <Section>
          <SectionLabel icon="code">Run the real engine</SectionLabel>
          <EmbeddedViz demo={topic.demo} />
        </Section>
      )}

      {/* Further reading */}
      {topic.references && (
        <Section>
          <SectionLabel icon="book">Further reading</SectionLabel>
          <ul className="space-y-2">
            {topic.references.map((r, i) => (
              <li key={i} className="flex gap-2.5 items-start text-sm">
                <Icon name="quote" size={14} className="text-fg-faint shrink-0 mt-1" />
                <span className="text-fg-muted leading-relaxed"><span className="text-fg font-medium">{r.book}</span>{r.where ? ` — ${r.where}` : ""}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* CTA */}
      <motion.div {...reveal} transition={T.base} className="mt-10 rounded-xl border border-brand/30 bg-brand-soft px-4 py-3 flex items-center justify-between gap-3">
        <span className="text-sm text-fg">Want to run your own {topic.title} code?</span>
        <Button onClick={onOpenFull}>Open the visualizer</Button>
      </motion.div>
    </motion.article>
  );
}
