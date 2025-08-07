import React, { createContext, useContext, useState } from 'react'
const TraceContext = createContext();

export function TraceProvider({ children }) {
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [traceSteps, setTraceSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  return (
    <TraceContext.Provider
      value={{
        code, setCode,
        traceSteps, setTraceSteps,
        selectedLanguage,
        setSelectedLanguage,
        currentStep, setCurrentStep,
        isProcessing, setIsProcessing,
        error, setError,
      }}

    >
      {children}
    </TraceContext.Provider>
  );
}
export const useTrace = () => useContext(TraceContext);