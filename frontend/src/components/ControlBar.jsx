import React, { useState } from 'react'
import { useTheme } from '../App'
import { useTrace } from '../contexts/TraceContext'

function ControlBar({  }) {
  const { isDarkMode } = useTheme()
  const { currentStep, traceSteps } = useTrace()
  const [speed,setspeed] = useState(1.0)
   const getPlayDelay = () => {
    return Math.round(800 / speed)
  } 

   React.useEffect(() => {
    window.getPlayDelay = getPlayDelay
  }, [speed])

  const themeClasses = isDarkMode 
    ? 'bg-gray-900 border-gray-800 text-white' 
    : 'bg-gray-100 border-gray-200 text-gray-900'

  return (
    <div className={`${themeClasses} border-b px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-4">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Speed
            </label>
            <div className="flex items-center space-x-2">
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>0.5x</span>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={speed}
                onChange={(e) => setspeed(parseFloat(e.target.value))}
                className={`w-32 h-2 rounded-lg appearance-none cursor-pointer slider ${
                  isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
                }`}
              />
              <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>3x</span>
              <span className="text-sm font-medium text-green-400 min-w-8">
                {speed}x
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              Step
            </label>
            <span className="text-sm font-medium text-green-400">
              {currentStep +1} / {traceSteps.length}
            </span>
          </div>
        </div>

        <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          Algorithm: N-Queens Problem
        </div>
      </div>
    </div>
  )
}

export default ControlBar
