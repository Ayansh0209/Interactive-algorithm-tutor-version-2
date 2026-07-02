// Docs section: sidebar of DSA topics + article with live + premade visualizers.
// Topics are URL-addressable via hash (#/docs/<slug>) so pages are shareable.

import { useState, useEffect } from "react";
import DocsSidebar from "../components/docs/DocsSidebar";
import DocArticle from "../components/docs/DocArticle";
import Wordmark from "../components/Wordmark";
import ThemeToggle from "../components/ThemeToggle";
import { Button, Badge, IconButton, Icon } from "../components/ui";
import { TOPICS, topicBySlug } from "../lib/docsContent";

export default function DocsPage({ onHome, onOpenVisualizer, initialSlug }) {
  const [slug, setSlug] = useState(initialSlug || TOPICS[0].slug);
  const [navOpen, setNavOpen] = useState(false);
  const topic = topicBySlug(slug);

  // Sync with browser back/forward (App passes a new initialSlug).
  useEffect(() => {
    if (initialSlug && initialSlug !== slug) setSlug(initialSlug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSlug]);

  function select(s) {
    setSlug(s);
    window.location.hash = "#/docs/" + s;
    document.title = topicBySlug(s).title + " · DSAviz Docs";
    setNavOpen(false);
  }

  return (
    <div className="h-screen flex flex-col bg-bg text-fg">
      <header className="flex items-center gap-3 px-4 h-14 border-b border-border shrink-0">
        <IconButton size="sm" title="Menu" className="lg:hidden" onClick={() => setNavOpen((o) => !o)}>
          <Icon name="layers" size={16} />
        </IconButton>
        <Wordmark className="text-lg" onClick={onHome} />
        <Badge color="slate">Docs</Badge>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={onHome} className="hidden sm:block px-3 h-9 rounded-lg text-sm text-fg-muted hover:text-fg hover:bg-fg/[0.06] transition-colors">
            Home
          </button>
          <ThemeToggle size="sm" />
          <Button size="sm" onClick={onOpenVisualizer}><Icon name="zap" size={15} /> Visualizer</Button>
        </div>
      </header>

      <div className="flex-1 min-h-0 flex relative">
        {/* Mobile backdrop */}
        {navOpen && <div className="lg:hidden absolute inset-0 z-30 bg-black/40 backdrop-blur-sm" onClick={() => setNavOpen(false)} />}
        <DocsSidebar activeSlug={slug} onSelect={select} open={navOpen} />
        <main className="flex-1 overflow-auto scrollbar-thin">
          <DocArticle topic={topic} onOpenFull={() => onOpenVisualizer(topic.demo)} />
        </main>
      </div>
    </div>
  );
}
