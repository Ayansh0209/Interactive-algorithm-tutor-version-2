import React from 'react'
import { useTheme } from '../App'

function VisualizationArea({ currentStep }) {
  const { isDarkMode } = useTheme()

  return (
    <div className={`h-full ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} flex items-center justify-center p-6`}>
     
       
    </div>
  )
}

export default VisualizationArea
