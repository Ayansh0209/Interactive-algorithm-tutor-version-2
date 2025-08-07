// src/controllers/runner.js
import { runCode as callPythonAPI } from '../api/python';
import { useTrace } from '../contexts/TraceContext';

export async function executeAndPrepareTrace(code, setTraceSteps, setIsProcessing, setError, setCode) {
  try {
    setIsProcessing(true);
    setError(null);

    const rawTrace = await callPythonAPI(code);
    console.log("Raw trace from backend:", rawTrace);


    // Handle backend error message (if backend returns { error: "..." })
    if (!Array.isArray(rawTrace)) {
      throw new Error(rawTrace?.error || 'Unexpected backend error');
    }

     const lastStep = rawTrace[rawTrace.length - 1];
    if (lastStep?.event === "exception") {
      throw new Error(lastStep.error || "Python error occurred");
    }
    
    setCode(code);

    const filtered = rawTrace.filter(step => step.code?.trim());
    const processed = filtered.map((step, idx) => ({
      ...step,
      highlightLine: step.line,
      nextLine: filtered[idx + 1]?.line || null,
      frameId: idx,
      updatedVars: step.changed_values || {},
    }));

    
    setTraceSteps(processed);
  } catch (err) {
    setError(err.message || 'Unknown error');
  } finally {
    setIsProcessing(false);
  }
}
