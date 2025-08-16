import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrace } from '../contexts/TraceContext';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

function CodeDisplay() {
  const { code, traceSteps, currentStep } = useTrace();
  const containerRef = useRef(null);
  const currentLineRef = useRef(null);

  const lines = useMemo(() => code?.split('\n') ?? [], [code]);

  const currentLine = traceSteps[currentStep]?.line ?? null;
  const nextLine = traceSteps[currentStep + 1]?.line ?? null;

  // Smooth scroll keeping current line near top
  useEffect(() => {
    if (!currentLineRef.current || !containerRef.current) return;
    const container = containerRef.current;
    const el = currentLineRef.current;
    const targetTop = el.offsetTop - container.clientHeight * 0.25;
    container.scrollTo({ top: Math.max(targetTop, 0), behavior: 'smooth' });
  }, [currentStep, currentLine]);

  return (
    <div className="h-full w-full overflow-hidden bg-[#1e1e1e]">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto overflow-x-hidden px-4 py-3"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="font-mono text-[13px] text-white relative flex flex-col items-start">
          <AnimatePresence initial={false} mode="popLayout">
            {lines.map((line, idx) => {
              const lineNo = idx + 1;
              const isCurrent = lineNo === currentLine;
              const isNext = lineNo === nextLine;

              return (
                <motion.div
                  key={`${lineNo}-${line}`}
                  ref={isCurrent ? currentLineRef : null}
                  layout="position"
                  initial={false}
                  animate={{ scale: isCurrent ? 1.01 : 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                  className={`relative w-full text-left min-h-[1.2rem]
                    ${isCurrent ? 'bg-green-600/15' : ''}
                    ${isNext ? 'bg-yellow-400/10' : ''}`}
                >
                  <SyntaxHighlighter
                    language="python"
                    style={vscDarkPlus}
                    customStyle={{
                      background: 'transparent',
                      padding: 0,
                      margin: 0,
                    }}
                    PreTag="div"
                  >
                    {line || ' '}
                  </SyntaxHighlighter>

                  {isCurrent && (
                    <motion.div
                      layoutId="execGlow"
                      className="pointer-events-none absolute inset-0 bg-green-500/10"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.25, 0] }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default CodeDisplay;
