import React from 'react'
import { useTheme } from '../App'
import CodeDisplay from './CodeDisplay'
import ControlBar from './ControlBar'
import PlayControls from './PlayControls'
// import VisualizationArea from './VisualizationArea'

function MainContent({ code, currentStep }) {
  const { isDarkMode } = useTheme()
  
  const themeClasses = isDarkMode 
    ? 'bg-gray-900 border-gray-700' 
    : 'bg-gray-50 border-gray-300'

  return (
    <div className="flex-1 p-6">
      <div className={`${themeClasses} rounded-lg border h-[500px] flex`}>
       
         <div className="flex-1 overflow-y-auto">
          <CodeDisplay />
        </div>
        <div className="flex-1">

       
        </div>
       
           <PlayControls/>
         

    
       
      </div>
    </div>
  )
}

export default MainContent
