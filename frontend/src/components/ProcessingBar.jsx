// src/components/ProcessingBar.jsx
import React from 'react';
import { useTrace } from '../contexts/TraceContext';

function ProcessingBar() {
  const { isProcessing, error, setError } = useTrace();

  // Don’t render anything if no processing and no error
  if (!isProcessing && !error) return null;

  return (
    <>
      {/* Top sticky bar */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-mono shadow-md transition-all duration-300 ${
          error ? 'bg-red-700 text-white' : 'bg-black text-white animate-pulse'
        }`}
      >
        {error ? (
          <span>❌ Code Parse Error &nbsp;&nbsp;
            <a
              href="https://docs.python.org/3/tutorial/errors.html"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-300"
            >
              View common errors
            </a>
          </span>
        ) : (
          <span>⏳ Processing your code...</span>
        )}
      </div>

      {/* Bottom floating error box (if error exists) */}
    {error && (
  <div className="fixed bottom-4 left-4 right-4 md:left-1/4 md:right-1/4 z-50 bg-red-700 text-white p-4 rounded shadow-lg font-mono text-sm animate-fade-in-up">
    <div className="flex justify-between items-center">
      <strong>Python Code Parse Error</strong>
      <button
        onClick={() => setError(null)}
        className="text-white text-lg font-bold hover:text-red-300"
      >
        ×
      </button>
    </div>
    <p className="mt-1">{error}</p>
  </div>
)}

    </>
  );
}

export default ProcessingBar;
