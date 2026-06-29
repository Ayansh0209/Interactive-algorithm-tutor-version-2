// Landing page. Short pitch + jump into the visualizer with an example.

import { EXAMPLES } from "../lib/examples";
import { Button, Card, Badge } from "../components/ui";

export default function HomePage({ onStart }) {
  return (
    <div className="min-h-screen bg-[#0b0d12] text-white">
      <header className="flex items-center px-6 h-16 border-b border-white/10">
        <span className="font-bold text-xl tracking-tight">
          DSA<span className="text-indigo-400">viz</span>
        </span>
        <div className="ml-auto">
          <Button onClick={() => onStart()}>Open Visualizer</Button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <Badge color="green">Phase 0 - Python</Badge>
        <h1 className="text-4xl md:text-5xl font-bold mt-4 leading-tight">
          Paste any DSA solution.<br />
          <span className="text-indigo-400">Watch it actually run.</span>
        </h1>
        <p className="mt-4 text-white/60 max-w-2xl">
          Not pre-baked animations. Your real code is executed and traced step by step --
          arrays, linked lists, trees, recursion, DP grids and graphs are detected
          automatically and drawn the right way. An AI tutor explains the run and shows
          better approaches, grounded in what actually happened.
        </p>

        <div className="mt-8 flex gap-3">
          <Button onClick={() => onStart()}>Try it now</Button>
        </div>

        <h2 className="mt-16 mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
          Start from an example
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXAMPLES.map((ex) => (
            <Card key={ex.id} className="p-4 hover:border-indigo-400/40 transition cursor-pointer"
              onClick={() => onStart(ex.id)}>
              <button onClick={() => onStart(ex.id)} className="text-left w-full">
                <h3 className="font-medium">{ex.title}</h3>
                <pre className="mt-2 text-[11px] text-white/40 font-mono line-clamp-4 overflow-hidden">
                  {ex.code.split("\n").slice(0, 4).join("\n")}
                </pre>
              </button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
