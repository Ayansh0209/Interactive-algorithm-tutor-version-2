// src/components/VisualizationArea.jsx
import React from "react";
import { useTheme } from "../App";
import { UniversalDataBox, BlackBoxContainer } from "./Box";
import { useTrace } from "../contexts/TraceContext";
import { motion, AnimatePresence } from "framer-motion";

function VisualizationArea() {
  const { isDarkMode } = useTheme();
  const functionCallTriggered = true;
  const { traceSteps, currentStep } = useTrace()

  const step = traceSteps[currentStep];
  if (!step) return null;

  return (

    <div className="flex flex-col items center">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <BlackBoxContainer title={step.functionName}>
            {Object.entries(step.locals).map(([varName ,value])=>(
              <motion.div
              key={varName}
               initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <UniversalDataBox label={varName} data={value}/>
                </motion.div>
            ))}

          </BlackBoxContainer>
        </motion.div>
      </AnimatePresence>

    </div>





  );
}

export default VisualizationArea;
