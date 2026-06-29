import React, { createContext, useContext, useState, useMemo } from 'react'
const TraceContext = createContext();

export function TraceProvider({ children }) {
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [rawTraceSteps, setRawTraceSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [showFoldedSteps, setShowFoldedSteps] = useState(false);

  // Expose filtered trace steps as "traceSteps" to consumers
  const traceSteps = useMemo(() => {
    if (showFoldedSteps) return rawTraceSteps;
    return rawTraceSteps.filter(step => !step.isFolded);
  }, [rawTraceSteps, showFoldedSteps]);

  const setTraceSteps = (steps) => {
    setRawTraceSteps(steps);
    setCurrentStep(0);
  };

  return (
    <TraceContext.Provider
      value={{
        code, setCode,
        traceSteps, setTraceSteps,
        rawTraceSteps,
        selectedLanguage, setSelectedLanguage,
        currentStep, setCurrentStep,
        isProcessing, setIsProcessing,
        error, setError,
        showFoldedSteps, setShowFoldedSteps
      }}
    >
      {children}
    </TraceContext.Provider>
  );
}
export const useTrace = () => useContext(TraceContext);