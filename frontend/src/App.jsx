import React, { useState, createContext, useContext } from 'react'
import Navbar from './components/Navbar'
import ControlBar from './components/ControlBar'
import MainContent from './components/MainContent'
import Sidebar from './components/Sidebar'
import './App.css'

// Create the context
const ThemeContext = createContext()

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Theme Provider Component
function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const value = {
    isDarkMode,
    setIsDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Main App Component
function AppContent() {
  const [speed, setSpeed] = useState(1)
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps] = useState(237)
  const [selectedLanguage, setSelectedLanguage] = useState('python')
  const [code, setCode] = useState(`def solve(row, n, board):
    if row == n:
        return True
    
    for col in range(n):
        if is_safe(row, col, board):
            board[row] = col
            if solve(row + 1, n, board):
                return True
            board[row] = -1
    return False

def is_safe(row, col, board):
    for i in range(row):
        if board[i] == col or abs(board[i] - col) == abs(i - row):
            return False
    return True

N = 4
board = [-1] * N
solve(0, N, board)`)

  const { isDarkMode } = useTheme()

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
      <Navbar />
      <ControlBar 
        speed={speed}
        setSpeed={setSpeed}
        currentStep={currentStep}
        totalSteps={totalSteps}
      />
      <div className="flex">
        <MainContent code={code} currentStep={currentStep} />
        <Sidebar 
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          code={code}
          setCode={setCode}
        />
      </div>
    </div>
  )
}

// Root App Component
function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}

export default App
