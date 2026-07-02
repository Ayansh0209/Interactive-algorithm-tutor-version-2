// Landing page. Product story first: an auto-playing preview of the app (code +
// language toggle + live visualizer), how it works, why it's different, the
// structures it can draw, and the AI tutor. The full topic catalog lives in the
// Docs page — Home links into it instead of dumping every card here.

import { motion } from "framer-motion";
import { EXAMPLES } from "../lib/examples";
import { TOPICS } from "../lib/docsContent";
import { Button, Card, Badge, Icon, cx } from "../components/ui";
import { T, slideUp, stagger } from "../lib/motion";
import { AppPreview, AITutorDemo } from "../components/home/previews";
import Wordmark from "../components/Wordmark";
import ThemeToggle from "../components/ThemeToggle";

const STEPS = [
  { icon: "code", title: "Paste code, pick a language", body: "Drop in any Python or Java solution — or start from a ready-made example. Flip the language toggle any time." },
  { icon: "cpu", title: "It runs for real", body: "The engine executes your code and traces every step with sys.settrace / JDI. No LLM guessing, no pre-baked animation." },
  { icon: "play", title: "Watch it & ask why", body: "The right visualization is detected automatically and animated. Scrub the timeline and ask the AI tutor about any step." },
];

const PRINCIPLES = [
  { icon: "zap", title: "Execute, never guess", body: "Every frame comes from a real run of your code — not an LLM's imagination. What you see is what actually happened in memory." },
  { icon: "layers", title: "One engine, many views", body: "It detects patterns, not algorithms: a next-pointer chain is a linked list, a self-call is a recursion tree, a grid filled cell-by-cell is DP." },
  { icon: "target", title: "Meaningful steps", body: "Steps are semantic events, not raw lines, so even N-Queens stays watchable. Collapse to key steps or focus a single function." },
];

// The structures the engine can draw. Counts come from the docs catalog; the
// class names are written out in full so Tailwind's scanner keeps them.
const STRUCTURES = [
  { id: "arrays", icon: "grid", label: "Arrays & Strings", fg: "text-cat-array", soft: "bg-cat-array/10", blurb: "Two-pointer, sliding window, prefix sums" },
  { id: "linked", icon: "link", label: "Linked Lists", fg: "text-cat-linked", soft: "bg-cat-linked/10", blurb: "Reversal, cycle detection, merging" },
  { id: "stacks", icon: "stack", label: "Stacks", fg: "text-cat-stack", soft: "bg-cat-stack/10", blurb: "Parsing, monotonic stack, backtracking" },
  { id: "queues", icon: "queue", label: "Queues & Deques", fg: "text-cat-queue", soft: "bg-cat-queue/10", blurb: "BFS, sliding-window max, scheduling" },
  { id: "trees", icon: "tree", label: "Trees & Heaps", fg: "text-cat-tree", soft: "bg-cat-tree/10", blurb: "BSTs, traversals, tries, priority queues" },
  { id: "graphs", icon: "graph", label: "Graphs", fg: "text-cat-graph", soft: "bg-cat-graph/10", blurb: "DFS/BFS, shortest paths, union-find" },
  { id: "hashing", icon: "hash", label: "Hashing", fg: "text-cat-hash", soft: "bg-cat-hash/10", blurb: "Maps, sets, frequency counting" },
  { id: "dp", icon: "table", label: "Dynamic Programming", fg: "text-cat-dp", soft: "bg-cat-dp/10", blurb: "Memoization & tabulation grids" },
];

const TRUST = ["Runs your real code", "Python & Java", "No sign-up", "Free to use"];

export default function HomePage({ onStart, onDocs }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  const openCategory = (id) => {
    const first = TOPICS.find((t) => t.category === id);
    onDocs(first ? first.slug : undefined);
  };

  return (
    <div className="min-h-screen bg-bg text-fg">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-bg/70 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center px-5 h-16">
          <Wordmark className="text-xl" />
          <nav className="ml-auto flex items-center gap-1">
            <button onClick={() => scrollTo("how")} className="hidden sm:inline-flex px-3 h-9 items-center rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-fg/[0.06] transition-colors">
              How it works
            </button>
            <button onClick={() => onDocs()} className="px-3 h-9 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-fg/[0.06] transition-colors">
              Docs
            </button>
            <ThemeToggle />
            <Button onClick={onStart} className="ml-1">Open Visualizer</Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" aria-hidden="true" />
        <div className="absolute -top-44 left-1/4 h-80 w-[40rem] rounded-full bg-brand/20 blur-[130px]" aria-hidden="true" />
        <div className="absolute -top-32 right-0 h-72 w-[32rem] rounded-full bg-cat-tree/15 blur-[130px]" aria-hidden="true" />

        <div className="relative max-w-6xl mx-auto px-5 pt-16 pb-16 lg:pt-24 lg:pb-24 grid lg:grid-cols-2 gap-12 lg:gap-10 items-center">
          {/* Left: copy */}
          <div className="text-center lg:text-left">
            <motion.div {...slideUp} transition={T.base} className="inline-flex">
              <Badge color="success"><span className="h-1.5 w-1.5 rounded-full bg-success" /> Live execution · Python &amp; Java</Badge>
            </motion.div>
            <motion.h1 {...slideUp} transition={{ ...T.base, delay: 0.05 }} className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mt-5 leading-[1.05]">
              Paste your code.<br />
              <span className="bg-gradient-to-r from-brand via-cat-tree to-cat-hash bg-clip-text text-transparent">Watch it actually run.</span>
            </motion.h1>
            <motion.p {...slideUp} transition={{ ...T.base, delay: 0.1 }} className="mt-5 text-fg-muted max-w-xl mx-auto lg:mx-0 text-lg leading-relaxed">
              DSAviz executes your real solution and traces it step by step. Arrays, linked lists, trees,
              recursion, DP grids and graphs are detected automatically and drawn the right way — with an
              AI tutor that watched the whole run.
            </motion.p>
            <motion.div {...slideUp} transition={{ ...T.base, delay: 0.15 }} className="mt-8 flex flex-wrap gap-3 justify-center lg:justify-start">
              <Button size="lg" onClick={onStart}><Icon name="zap" size={18} /> Try it now</Button>
              <Button size="lg" variant="secondary" onClick={() => onDocs()}><Icon name="book" size={18} /> Read the docs</Button>
            </motion.div>
            <motion.ul {...slideUp} transition={{ ...T.base, delay: 0.2 }} className="mt-7 flex flex-wrap gap-x-5 gap-y-2 justify-center lg:justify-start text-2xs text-fg-faint">
              {TRUST.map((t) => (
                <li key={t} className="inline-flex items-center gap-1.5">
                  <Icon name="check" size={13} className="text-success" /> {t}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* Right: the app plays itself */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...T.slow, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-6 bg-brand/10 blur-3xl rounded-full" aria-hidden="true" />
            <AppPreview className="relative" />
            <div className="mt-3 text-center text-3xs text-fg-faint">↑ a real bubble sort, traced &amp; animated live — no video, no gif</div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-5 pb-24">
        {/* How it works */}
        <section id="how" className="scroll-mt-20">
          <SectionHeading icon="target" eyebrow="How it works" title="From code to intuition in three steps" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ ...T.base, delay: i * 0.06 }}>
                <Card className="relative p-5 h-full overflow-hidden">
                  <span className="absolute -right-2 -top-3 text-7xl font-bold text-fg/[0.04] select-none">{i + 1}</span>
                  <div className="h-10 w-10 grid place-items-center rounded-xl bg-brand-soft text-brand mb-3">
                    <Icon name={s.icon} size={20} />
                  </div>
                  <h3 className="font-semibold text-fg">{s.title}</h3>
                  <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{s.body}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why it's different */}
        <SectionHeading icon="zap" eyebrow="Why it's different" title="Not another animation library" />
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PRINCIPLES.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ ...T.base, delay: i * 0.05 }}>
              <Card className="p-5 h-full">
                <div className="h-10 w-10 grid place-items-center rounded-xl bg-brand-soft text-brand mb-3">
                  <Icon name={p.icon} size={20} />
                </div>
                <h3 className="font-semibold text-fg">{p.title}</h3>
                <p className="mt-1.5 text-sm text-fg-muted leading-relaxed">{p.body}</p>
              </Card>
            </motion.div>
          ))}
        </section>

        {/* What you can visualize */}
        <SectionHeading icon="layers" eyebrow="One engine, many views" title="Everything it can draw" />
        <motion.div variants={stagger(0.04)} initial="initial" whileInView="animate" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STRUCTURES.map((s) => {
            const count = TOPICS.filter((t) => t.category === s.id).length;
            return (
              <motion.button
                key={s.id}
                variants={slideUp}
                transition={T.base}
                onClick={() => openCategory(s.id)}
                className="text-left rounded-2xl border border-border bg-surface p-4 hover:border-border-strong hover:shadow-soft hover:-translate-y-0.5 transition-all group"
              >
                <div className={cx("h-11 w-11 grid place-items-center rounded-xl mb-3", s.soft, s.fg)}>
                  <Icon name={s.icon} size={22} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-fg">{s.label}</h3>
                  {count > 0 && <span className="text-3xs font-medium text-fg-faint shrink-0">{count}</span>}
                </div>
                <p className="mt-1 text-2xs text-fg-muted leading-relaxed">{s.blurb}</p>
              </motion.button>
            );
          })}
        </motion.div>
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 justify-between rounded-2xl border border-border bg-surface-2 px-5 py-4">
          <p className="text-sm text-fg-muted text-center sm:text-left">
            Plus searching, sorting, recursion, backtracking, greedy &amp; bit tricks —
            <span className="text-fg font-medium"> {TOPICS.length}+ topics</span> with runnable walkthroughs.
          </p>
          <Button variant="secondary" onClick={() => onDocs()} className="shrink-0">
            <Icon name="book" size={16} /> Explore the docs <Icon name="arrow-right" size={15} />
          </Button>
        </div>

        {/* AI tutor */}
        <SectionHeading icon="sparkles" eyebrow="AI tutor" title="Ask why — grounded in the actual run" />
        <section className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-fg-muted leading-relaxed">
              Because DSAviz has the real execution trace, the tutor answers from what your code actually did —
              which line ran, how a variable changed, why a branch was taken — not a generic explanation of the
              algorithm. Ask it to compare approaches, explain a step, or suggest what to visualize next.
            </p>
            <ul className="mt-5 space-y-2.5">
              {["Explains any step using the real values in memory", "Points to the exact line that caused a change", "Suggests faster approaches and can visualize them next"].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-sm text-fg">
                  <span className="grid place-items-center h-5 w-5 rounded-full bg-success-soft text-success shrink-0 mt-0.5"><Icon name="check" size={13} /></span>
                  {t}
                </li>
              ))}
            </ul>
            <Button onClick={onStart} className="mt-6"><Icon name="sparkles" size={16} /> Try the tutor</Button>
          </div>
          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={T.slow}>
            <AITutorDemo />
          </motion.div>
        </section>

        {/* Ready-made examples */}
        <SectionHeading icon="code" eyebrow="Start instantly" title="Load a ready-made example" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLES.slice(0, 6).map((ex) => (
            <Card key={ex.id} onClick={onStart} className="p-4 hover:border-border-strong hover:shadow-soft transition-all cursor-pointer group">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium text-fg truncate">{ex.title}</h3>
                <Badge color={ex.language === "python" ? "info" : "warning"}>{ex.language}</Badge>
              </div>
              <pre className="mt-2.5 text-2xs text-fg-faint font-mono leading-5 overflow-hidden line-clamp-4 whitespace-pre-wrap">
                {ex.code.split("\n").slice(0, 4).join("\n")}
              </pre>
              <span className="mt-2 inline-flex items-center gap-1 text-2xs font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity">
                Open in visualizer <Icon name="arrow-right" size={13} />
              </span>
            </Card>
          ))}
        </div>

        {/* Final CTA */}
        <section className="relative mt-20 overflow-hidden rounded-3xl border border-border bg-surface px-6 py-14 sm:py-16 text-center">
          <div className="absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(ellipse_60%_80%_at_50%_50%,#000,transparent)]" aria-hidden="true" />
          <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-[36rem] rounded-full bg-brand/25 blur-[120px]" aria-hidden="true" />
          <div className="relative">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Stop reading pseudocode.</h2>
            <p className="mt-3 text-fg-muted max-w-lg mx-auto text-lg">Paste a solution and watch every step light up. It takes about ten seconds.</p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              <Button size="lg" onClick={onStart}><Icon name="zap" size={18} /> Open the visualizer</Button>
              <Button size="lg" variant="secondary" onClick={() => onDocs()}><Icon name="book" size={18} /> Browse topics</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center gap-3 justify-between text-2xs text-fg-faint">
          <Wordmark className="text-sm" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} />
          <span>Execute, don&apos;t guess.</span>
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ icon, eyebrow, title }) {
  return (
    <div className={cx("mt-20 mb-6")}>
      <div className="flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-fg-faint">
        <Icon name={icon} size={13} /> {eyebrow}
      </div>
      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-fg mt-1">{title}</h2>
    </div>
  );
}
