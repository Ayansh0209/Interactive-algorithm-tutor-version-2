// App shell: lightweight hash router across Home / Docs / Visualizer.
// Hash routes (#/docs/<slug>) make doc pages shareable, and a hashchange
// listener keeps browser back/forward working.

import { useState, useEffect, useCallback } from "react";
import HomePage from "./pages/HomePage";
import DocsPage from "./pages/DocsPage";
import VisualizerPage from "./pages/VisualizerPage";

function readHash() {
  const h = window.location.hash || "";
  if (h.startsWith("#/docs")) {
    const m = h.match(/#\/docs\/(.+)/);
    return { view: "docs", slug: m ? decodeURIComponent(m[1]) : null };
  }
  if (h.startsWith("#/visualizer")) return { view: "visualizer", slug: null };
  return { view: "home", slug: null };
}

function hashFor(view, slug) {
  if (view === "home") return "";
  if (view === "docs") return slug ? `#/docs/${slug}` : "#/docs";
  return "#/visualizer";
}

export default function App() {
  const [route, setRoute] = useState(readHash);

  // Keep state in sync with browser navigation.
  useEffect(() => {
    const onHash = () => setRoute(readHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const go = useCallback((view, slug = null) => {
    const next = hashFor(view, slug);
    if ((window.location.hash || "") !== next) window.location.hash = next;
    setRoute({ view, slug });
  }, []);

  if (route.view === "docs") {
    return (
      <DocsPage
        initialSlug={route.slug}
        onHome={() => go("home")}
        onOpenVisualizer={() => go("visualizer")}
      />
    );
  }
  if (route.view === "visualizer") {
    return <VisualizerPage onHome={() => go("home")} onDocs={() => go("docs")} />;
  }
  return (
    <HomePage
      onStart={() => go("visualizer")}
      onDocs={(slug) => go("docs", slug)}
    />
  );
}
