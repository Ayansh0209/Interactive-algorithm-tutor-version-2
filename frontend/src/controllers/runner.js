// src/controllers/runner.js
import { runCode as callPythonAPI } from '../api/python';

// Heuristic list of loop index/counter variable names to fold
const LOOP_INDEX_NAMES = new Set(['i', 'j', 'k', 'idx', 'index', 'iter', 'iteration', 'step', 'count', 'counter']);

export async function executeAndPrepareTrace(code, setTraceSteps, setIsProcessing, setError, setCode) {
  try {
    setIsProcessing(true);
    setError(null);

    const rawTrace = await callPythonAPI(code);
    console.log("Raw trace from backend:", rawTrace);

    if (!Array.isArray(rawTrace)) {
      throw new Error(rawTrace?.error || 'Unexpected backend error');
    }

    const lastStep = rawTrace[rawTrace.length - 1];
    if (lastStep?.event === "exception") {
      throw new Error(lastStep.error || "Python error occurred");
    }
    
    setCode(code);

    // Map and enrich raw trace steps
    const traceData = rawTrace
      .filter(step => step.locals && Object.keys(step.locals).length > 0)
      .map((step, idx) => ({
        id: idx,
        functionName: step.function || "Global",
        line: step.line,
        locals: step.locals,
        varTypes: step.var_types || {},
        event: step.event,
        depth: step.depth || 0,
        callStack: step.call_stack || [],
        isFolded: false // Will be set by folding logic below
      }));

    // Apply loop folding/compression logic
    for (let i = 1; i < traceData.length; i++) {
      const prev = traceData[i - 1];
      const curr = traceData[i];

      // Identify modified variables since the last step
      const modifiedVars = [];
      const allVars = new Set([...Object.keys(prev.locals), ...Object.keys(curr.locals)]);

      for (const v of allVars) {
        const prevVal = JSON.stringify(prev.locals[v]);
        const currVal = JSON.stringify(curr.locals[v]);
        if (prevVal !== currVal) {
          modifiedVars.push(v);
        }
      }

      // Check if modifications are ONLY loop indexes
      const onlyLoopIndexesChanged = modifiedVars.length > 0 && modifiedVars.every(v => LOOP_INDEX_NAMES.has(v.toLowerCase()));

      // Fold step if only loop counters changed, and it is a standard line event
      if (onlyLoopIndexesChanged && curr.event === 'line') {
        curr.isFolded = true;
      }
    }

    setTraceSteps(traceData);

  } catch (err) {
    setError(err.message || 'Unknown error');
  } finally {
    setIsProcessing(false);
  }
}
