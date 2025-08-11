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

    

    const data = rawTrace.filter(step =>step.locals && Object.keys(step.locals).length > 0).map((step,idx)=>({
      id:idx,
      functionName :step.function || "Global",
      line :step.line,
      locals:step.locals,
      varTypes: step.var_types ||{},
      event:step.event,
      depth:step.depth,
    }))
    setTraceSteps(data);





  } catch (err) {
    setError(err.message || 'Unknown error');
  } finally {
    setIsProcessing(false);
  }
}
