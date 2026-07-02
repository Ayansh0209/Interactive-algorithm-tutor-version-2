// The main visualizer screen. Wires language + code editor (+ stdin) -> run ->
// trace -> playback, with the Visualization stage as the hero and collapsible
// Code / AI side panels so the stage gets maximum room.

import { useState } from "react";
import { runCode } from "../lib/api";
import { usePlayback } from "../hooks/usePlayback";
import { examplesFor } from "../lib/examples";
import CodePane from "../components/CodePane";
import Stage from "../components/Stage";
import Timeline from "../components/Timeline";
import AIPanel from "../components/AIPanel";
import Wordmark from "../components/Wordmark";
import ThemeToggle from "../components/ThemeToggle";
import { Panel, Button, Badge, Segmented, Select, IconButton, Icon, EmptyState, cx } from "../components/ui";

export default function VisualizerPage({ onHome, onDocs }) {
  const [language, setLanguage] = useState("python");
  const examples = examplesFor(language);
  const [exampleId, setExampleId] = useState(examples[0].id);
  const [code, setCode] = useState(examples[0].code);
  const [stdin, setStdin] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [trace, setTrace] = useState(null);
  const [running, setRunning] = useState(false);
  const [showCode, setShowCode] = useState(true);
  const [showAI, setShowAI] = useState(true);

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
    <div className="h-screen flex flex-col bg-bg text-fg">
      {/* Top bar */}
      <header className="flex items-center gap-2.5 px-4 h-14 border-b border-border shrink-0">
        <Wordmark className="text-lg" onClick={onHome} />
        <span className="hidden sm:block h-5 w-px bg-border mx-0.5" />
        <Segmented size="sm" value={language} onChange={switchLanguage} options={[{ value: "python", label: "Python" }, { value: "java", label: "Java" }, { value: "cpp", label: "C++" }]} />
        <Select
          className="hidden sm:block"
          value={exampleId}
          onChange={pickExample}
          options={examples.map((ex) => ({ value: ex.id, label: ex.title }))}
        />

        <div className="ml-auto flex items-center gap-2">
          {meta && (
            <div className="hidden md:flex items-center gap-1.5">
              <Badge color="slate">{meta.num_steps} steps</Badge>
              {meta.truncated && <Badge color="amber">truncated</Badge>}
              {meta.error && <Badge color="rose">error</Badge>}
            </div>
          )}
          {/* Panel toggles */}
          <div className="hidden lg:flex items-center gap-1">
            <IconButton size="sm" title="Toggle code panel" active={showCode} onClick={() => setShowCode((s) => !s)}>
              <Icon name="code" size={16} />
            </IconButton>
            <IconButton size="sm" title="Toggle AI tutor" active={showAI} onClick={() => setShowAI((s) => !s)}>
              <Icon name="sparkles" size={16} />
            </IconButton>
          </div>
          <IconButton size="sm" title="Docs" onClick={onDocs}><Icon name="book" size={16} /></IconButton>
          <ThemeToggle size="sm" />
          {trace && <Button size="sm" variant="ghost" onClick={() => setTrace(null)}>Edit code</Button>}
          <Button size="sm" onClick={handleRun} disabled={running}>
            {running ? <><Icon name="reset" size={15} className="animate-spin" /> Running…</> : <><Icon name="zap" size={15} /> Run</>}
          </Button>
        </div>
      </header>

      {/* Body: code | stage | ai */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3 p-3">
        {showCode && (
          <Panel
            title={`Code · ${language}`}
            icon={<Icon name="code" size={14} />}
            right={trace ? <span className="text-3xs text-fg-faint">read-only while stepping</span> : null}
            className="lg:w-[28%] lg:min-w-[18rem] lg:max-w-md min-h-48 lg:min-h-0"
            bodyClassName="flex flex-col"
          >
            <div className="flex-1 min-h-0 overflow-auto scrollbar-thin">
              <CodePane code={code} onChange={setCode} currentLine={pb.current ? pb.current.line : null} editable={!trace} />
            </div>
            <div className="shrink-0 border-t border-border">
              <button
                onClick={() => setShowStdin((s) => !s)}
                className="w-full flex items-center gap-1.5 text-left px-3 py-2 text-3xs text-fg-muted hover:text-fg transition-colors"
              >
                <Icon name="chevron-down" size={12} className={cx("transition-transform", !showStdin && "-rotate-90")} />
                Input (stdin){stdin ? " · set" : ""}
              </button>
              {showStdin && (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  disabled={!!trace}
                  spellCheck={false}
                  placeholder={"Fed to input()/Scanner. Example:\n5\n3 1 4 1 5"}
                  className="w-full h-24 resize-none bg-fg/[0.03] px-3 py-2 font-mono text-2xs text-fg outline-none disabled:opacity-60 border-t border-border"
                />
              )}
            </div>
          </Panel>
        )}

        {/* Visualization — the hero */}
        <Panel
          title="Visualization"
          icon={<Icon name="target" size={14} />}
          right={meta?.output ? <Badge color="slate">stdout</Badge> : null}
          className="flex-1 min-w-0 shadow-soft"
          bodyClassName="flex flex-col"
        >
          {meta && meta.error ? (
            <EmptyState
              icon={<Icon name="x" size={22} />}
              title="Your program raised an error"
              hint={meta.error + (meta.error_line ? ` (line ${meta.error_line})` : "")}
            />
          ) : !trace ? (
            <EmptyState
              icon={<Icon name="zap" size={22} />}
              title="Run your code to visualize it"
              hint="Pick an example or paste your own, then press Run. The engine executes it for real and draws the right view automatically."
              action={<Button onClick={handleRun} disabled={running}>{running ? "Running…" : "Run & Visualize"}</Button>}
            />
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              <Stage trace={trace} current={pb.current} stepIndex={pb.stepIndex} />
              {meta && meta.output && (
                <pre className="mx-3 mb-3 mt-1 rounded-lg bg-fg/[0.04] border border-border px-3 py-2 text-2xs font-mono text-success whitespace-pre-wrap max-h-24 overflow-auto scrollbar-thin shrink-0">
                  {meta.output}
                </pre>
              )}
            </div>
          )}
        </Panel>

        {showAI && (
          <Panel
            title="AI Tutor"
            icon={<Icon name="sparkles" size={14} />}
            className="lg:w-[24%] lg:min-w-[16rem] lg:max-w-sm min-h-48 lg:min-h-0"
          >
            <AIPanel code={code} trace={trace} stepIndex={pb.stepIndex} />
          </Panel>
        )}
      </div>

      {trace && pb.visibleCount > 0 && <Timeline pb={pb} />}
    </div>
  );
}
