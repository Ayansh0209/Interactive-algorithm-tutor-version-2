// App shell: a tiny router between the landing page and the visualizer.
// (No react-router dependency needed for two views.)

import { useState } from "react";
import HomePage from "./pages/HomePage";
import VisualizerPage from "./pages/VisualizerPage";

export default function App() {
  const [view, setView] = useState("home"); // "home" | "visualizer"

  return view === "home" ? (
    <HomePage onStart={() => setView("visualizer")} />
  ) : (
    <VisualizerPage onHome={() => setView("home")} />
  );
}
