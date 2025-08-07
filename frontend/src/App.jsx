import React, { useState, createContext, useContext } from 'react'
import Navbar from './components/Navbar'
import ControlBar from './components/ControlBar'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'
import ProcessingBar from './components/ProcessingBar'
import { TraceProvider, useTrace } from './contexts/TraceContext'
import './App.css'

// Theme Context
const ThemeContext = createContext()
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const value = { isDarkMode, setIsDarkMode }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// 🧠 Main Layout – no AppContent
function AppLayout() {
  const { isDarkMode } = useTheme()
  const { code, currentStep } = useTrace()
  const [speed, setSpeed] = useState(1)

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Navbar />
      <ControlBar speed={speed} setSpeed={setSpeed} currentStep={currentStep} totalSteps={code.split('\n').length} />
      <div className="flex">
        <MainContent currentStep={currentStep} />
        <Sidebar />
      </div>
    </div>
  )
}

// Root App
function App() {
  return (
    <ThemeProvider>
      <TraceProvider>
        <ProcessingBar />
        <AppLayout />
      </TraceProvider>
    </ThemeProvider>
  )
}

export default App
