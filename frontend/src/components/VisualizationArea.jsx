// src/components/VisualizationArea.jsx
import React, { useState } from "react";
import { useTheme } from "../App";
import { UniversalDataBox, BlackBoxContainer } from "./Box";
import { useTrace } from "../contexts/TraceContext";
import { motion, AnimatePresence } from "framer-motion";
import RecursionTree from "./RecursionTree";

function VisualizationArea() {
  const { isDarkMode } = useTheme();
  const { traceSteps, currentStep } = useTrace();
  const [activeTab, setActiveTab] = useState("variables"); // "variables" or "recursion"

  const step = traceSteps[currentStep];
  if (!step) return null;

  // Check if recursion has occurred in the trace
  const hasRecursion = traceSteps.some(
    (s) =>
      (s.callStack && s.callStack.length > 1) ||
      (s.call_stack && s.call_stack.length > 1)
  );

  return (
    <div className="flex-1 flex flex-col items-center p-4 overflow-y-auto max-h-[calc(100vh-140px)] w-full">
      {/* Visual Tab Switcher for Recursion */}
      {hasRecursion && (
        <div className="flex space-x-2 mb-4 bg-gray-900 border border-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab("variables")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              activeTab === "variables"
                ? "bg-green-600 text-white font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Variable Box View
          </button>
          <button
            onClick={() => setActiveTab("recursion")}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all ${
              activeTab === "recursion"
                ? "bg-green-600 text-white font-bold"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Recursion Tree View
          </button>
        </div>
      )}

      {/* Main Viewport */}
      <div className="w-full flex justify-center">
        <AnimatePresence mode="wait">
          {activeTab === "recursion" && hasRecursion ? (
            <motion.div
              key="recursion-tree-view"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="w-full flex justify-center"
            >
              <RecursionTree />
            </motion.div>
          ) : (
            <motion.div
              key={`var-box-${currentStep}`}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full flex justify-center"
            >
              <BlackBoxContainer title={step.functionName || "Active Frame"}>
                {Object.entries(step.locals || {}).map(([varName, value]) => (
                  <motion.div
                    key={varName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                  >
                    <UniversalDataBox label={varName} data={value} />
                  </motion.div>
                ))}
                {Object.keys(step.locals || {}).length === 0 && (
                  <span className="text-xs text-gray-500 font-mono py-8">
                    No active local variables.
                  </span>
                )}
              </BlackBoxContainer>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default VisualizationArea;
