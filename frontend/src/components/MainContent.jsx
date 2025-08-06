import React from 'react'
import { useTheme } from '../App'
// import CodeDisplay from './CodeDisplay'
// import VisualizationArea from './VisualizationArea'

function MainContent({ code, currentStep }) {
  const { isDarkMode } = useTheme()
  
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 border-gray-700' 
    : 'bg-gray-50 border-gray-300'

  return (
    <div className="flex-1 p-6">
      <div className={`${themeClasses} rounded-lg border h-[500px] flex`}>
        {/* Code Display - Left Side */}
        <div className="flex-1">
       
        </div>

    
       
      </div>
    </div>
  )
}

export default MainContent
