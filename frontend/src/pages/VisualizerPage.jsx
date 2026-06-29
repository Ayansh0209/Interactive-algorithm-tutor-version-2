// The main visualizer screen. Wires: language + code editor (+ stdin) -> run ->
// trace -> playback, with the stage, AI tutor, and timeline.

import { useState } from "react";
import { runCode } from "../lib/api";
import { usePlayback } from "../hooks/usePlayback";
import { examplesFor } from "../lib/examples";
import CodePane from "../components/CodePane";
import Stage from "../components/Stage";
import Timeline from "../components/Timeline";
import AIPanel from "../components/AIPanel";
import { Panel, Button, Badge } from "../components/ui";

export default function VisualizerPage({ onHome }) {
  const [language, setLanguage] = useState("python");
  const examples = examplesFor(language);
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [code, setCode] = useState(examples[0].code);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [trace, setTrace] = useState(null);
  const [running, setRunning] = useState(false);

  const pb = usePlayback(trace);
  const meta = trace ? trace.meta : null;

  function switchLanguage(lang) {
    if (lang === language) return;
    const exs = examplesFor(lang);
    setLanguage(lang);
    setExampleId(exs[0].id);
    setCode(exs[0].code);
    setStdin("");
    setTrace(null);
  }

  function pickExample(id) {
    const ex = examplesFor(language).find((x) => x.id === id);
    if (ex) { setExampleId(id); setCode(ex.code); setStdin(""); setTrace(null); }
  }

  async function handleRun() {
    setRunning(true);
    try {
      const t = await runCode(code, stdin, language);
      setTrace(t);
      pb.reset();
    } catch (e) {
      const msg = (e && e.response && e.response.data && e.response.data.error) || e.message;
      setTrace({ meta: { error: msg, num_steps: 0, analysis: {} }, steps: [] });
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-[#0b0d12] text-white">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 h-14 border-b border-white/10 shrink-0">
        <button onClick={onHome} className="font-bold text-lg tracking-tight">
          DSA<span className="text-indigo-400">viz</span>
        </button>

        {/* language toggle */}
        <div className="flex items-center rounded-lg border border-white/15 overflow-hidden ml-2 text-sm">
          {["python", "java"].map((lang) => (
            <button
              key={lang}
              onClick={() => switchLanguage(lang)}
              className={`px-3 py-1.5 capitalize transition ${
                language === lang ? "bg-indigo-600 text-white" : "text-white/60 hover:bg-white/10"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>

        <select
          value={exampleId}
          onChange={(e) => pickExample(e.target.value)}
          className="bg-white/5 border border-white/15 rounded-lg px-2 py-1.5 text-sm outline-none"
        >
          {examples.map((ex) => (
            <option key={ex.id} value={ex.id} className="bg-slate-800">
              {ex.title}
            </option>
          ))}
        </select>

        <div className="ml-auto flex items-center gap-3">
          {meta && (
            <div className="flex items-center gap-2 text-xs text-white/50">
              <Badge color="slate">{meta.num_steps} steps</Badge>
              {meta.truncated && <Badge color="amber">truncated</Badge>}
              {meta.error && <Badge color="rose">error</Badge>}
            </div>
          )}
          {trace && (
            <Button variant="ghost" onClick={() => setTrace(null)}>Edit code</Button>
          )}
          <Button onClick={handleRun} disabled={running}>
            {running ? "Running..." : "Run & Visualize"}
          </Button>
        </div>
      </header>

      {/* Body: code | stage | ai */}
      <div className="flex-1 min-h-0 grid grid-cols-[minmax(280px,26%)_1fr_minmax(260px,24%)] gap-3 p-3">
        <Panel
          title={"Code (" + language + ")"}
          right={trace ? <span className="text-[11px] text-white/40">read-only while stepping</span> : null}
          className="min-h-0"
        >
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0 overflow-auto">
              <CodePane
                code={code}
                onChange={setCode}
                currentLine={pb.current ? pb.current.line : null}
                editable={!trace}
              />
            </div>
            <div className="shrink-0 border-t border-white/10">
              <button
                onClick={() => setShowStdin((s) => !s)}
                className="w-full text-left px-3 py-1.5 text-[11px] text-white/50 hover:text-white/80"
              >
                {showStdin ? "v" : ">"} Input (stdin){stdin ? " - set" : ""}
              </button>
              {showStdin && (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  disabled={!!trace}
                  spellCheck={false}
                  placeholder={"Fed to input()/Scanner. Example:\n5\n3 1 4 1 5"}
                  className="w-full h-24 resize-none bg-black/30 px-3 py-2 font-mono text-xs text-white/80 outline-none disabled:opacity-60"
                />
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Visualization" className="min-h-0">
          {meta && meta.error && (
            <div className="m-3 rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 whitespace-pre-wrap">
              {meta.error}
              {meta.error_line ? " (line " + meta.error_line + ")" : ""}
            </div>
          )}
          <Stage trace={trace} current={pb.current} stepIndex={pb.stepIndex} />
          {meta && meta.output && (
            <pre className="mx-3 mb-3 mt-1 rounded-lg bg-black/40 px-3 py-2 text-xs text-emerald-300 whitespace-pre-wrap">
              {meta.output}
            </pre>
          )}
        </Panel>

        <Panel title="AI Tutor" className="min-h-0">
          <AIPanel code={code} trace={trace} stepIndex={pb.stepIndex} />
        </Panel>
      </div>

      {trace && pb.visibleCount > 0 && <Timeline pb={pb} />}
    </div>
  );
}
