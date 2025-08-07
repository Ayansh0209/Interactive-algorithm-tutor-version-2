import React from 'react';
import { useTrace } from '../contexts/TraceContext';

// Import SVG file paths
import PrevStepIcon from '../assets/PrevStep.svg';
import NextStepIcon from '../assets/next-step.svg';
import ResetIcon from '../assets/reset.svg';

function PlayControls() {
  const { traceSteps, currentStep, setCurrentStep } = useTrace();

  const goNext = () => {
    if (currentStep < traceSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const reset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="flex justify-center gap-4 mt-4">
      <button onClick={goPrev} title="Previous Step">
        <img src={PrevStepIcon} alt="Previous Step" className="w-6 h-6" />
      </button>
      <button onClick={reset} title="Reset">
        <img src={ResetIcon} alt="Reset" className="w-6 h-6" />
      </button>
      <button onClick={goNext} title="Next Step">
        <img src={NextStepIcon} alt="Next Step" className="w-6 h-6" />
      </button>
    </div>
  );
}

export default PlayControls;
