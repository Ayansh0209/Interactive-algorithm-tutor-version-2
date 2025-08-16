import React from 'react'
import { useTheme } from '../App'
import CodeDisplay from './CodeDisplay'
import ControlBar from './ControlBar'
import PlayControls from './PlayControls'
import VisualizationArea from './VisualizationArea'
// import VisualizationArea from './VisualizationArea'

function MainContent({}) {
  const { isDarkMode } = useTheme()

  const themeClasses = isDarkMode
    ? 'bg-gray-900 border-gray-700'
    : 'bg-gray-50 border-gray-300'

  return (
    <div className="flex-1 p-6  h-[calc(100vh-48px)] ">
      <div className={`${themeClasses} rounded-lg border h-full flex flex-col relative`}>
        <div className="flex flex-1">
          <CodeDisplay />
          <VisualizationArea />
        </div>
        <div className="flex justify-center pb-4">
          <PlayControls />
        </div>



        
      </div>
    </div>
  )
}

export default MainContent
