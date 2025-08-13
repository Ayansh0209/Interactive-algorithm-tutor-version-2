import React, { useState, useEffect, useRef } from 'react';
import { useTrace } from '../contexts/TraceContext';



const PrevIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6z"/>
  </svg>
);

const NextIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6z"/>
  </svg>
);

const ResetIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
);

const PlayIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

function PlayControls() {
  const { traceSteps, currentStep, setCurrentStep } = useTrace();
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef(null);
  
  // Effect to handle the play/pause timer
  useEffect(() => {
    // If playing and not at the end, set an interval
    if (isPlaying && currentStep < traceSteps.length - 1) {
      intervalRef.current = setInterval(() => {
        setCurrentStep(prev => prev + 1);
      }, window.getPlayDelay ? window.getPlayDelay() : 800);
    } else {
      // If we reach the end or are paused, stop playing
      setIsPlaying(false);
    }

    // Cleanup function to clear the interval
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentStep, traceSteps.length, setCurrentStep,]);


  // --- Control Handlers ---

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    setIsPlaying(false); // Stop playing on manual step
    if (currentStep < traceSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setIsPlaying(false); // Stop playing on manual step
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setIsPlaying(false); // Stop playing on reset
    setCurrentStep(0);
  };

  // --- Render Logic ---

  const isAtStart = currentStep === 0;
  const isAtEnd = currentStep >= traceSteps.length - 1;

  return (
    <div className="flex justify-center items-center gap-3 p-3  ">
     
      
    
       <button 
        onClick={handlePrev} 
        title="Previous Step" 
        disabled={isAtStart} 
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 transition-colors duration-200"
      >
        <PrevIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>

      <button 
        onClick={handlePlayPause} 
        title={isPlaying ? "Pause" : "Play"} 
        disabled={isAtEnd} 
        className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-500 dark:disabled:hover:bg-blue-600 transition-colors duration-200"
      >
        {isPlaying ? 
          <PauseIcon className="w-6 h-6 text-white" /> : 
          <PlayIcon className="w-6 h-6 text-white" />
        }
      </button>

      <button 
        onClick={handleNext} 
        title="Next Step" 
        disabled={isAtEnd} 
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 transition-colors duration-200"
      >
        <NextIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
        <button 
        onClick={handleReset} 
        title="Reset" 
        disabled={isAtStart} 
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-gray-100 dark:disabled:hover:bg-gray-700 transition-colors duration-200"
      >
        <ResetIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
      </button>
    </div>
  );
}

export default PlayControls;