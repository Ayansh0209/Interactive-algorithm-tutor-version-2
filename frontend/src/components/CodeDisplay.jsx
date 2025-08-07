import React from 'react';
import { useTrace } from '../contexts/TraceContext';

function CodeDisplay() {
  const { code, traceSteps, currentStep } = useTrace();
  const lines = code?.split('\n') || [];

  const currentLine = traceSteps[currentStep]?.highlightLine;
  const nextLine = traceSteps[currentStep]?.nextLine;

  return (
    <div className="font-mono text-sm space-y-1 px-4 py-3 bg-gray-900 text-white">
      {lines.map((line, idx) => {
        const lineNum = idx + 1;
        let bg = '';
        if (lineNum === currentLine) bg = 'bg-green-600 text-white';
        else if (lineNum === nextLine) bg = 'bg-yellow-400 text-black';

        return (
          <div key={idx} className={`px-2 py-1 rounded ${bg}`}>
            <span className="text-gray-500 mr-3">{lineNum.toString().padStart(2, '0')}|</span>
            <span>{line}</span>
          </div>
        );
      })}
    </div>
  );
}

export default CodeDisplay;
