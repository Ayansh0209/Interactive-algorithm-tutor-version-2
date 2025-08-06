import React, { createContext, useContext, useState } from 'react'

const ThemeContext = createContext()

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true)

  const value = {
    isDarkMode,
    setIsDarkMode
  }

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen ${isDarkMode ? 'bg-black text-white' : 'bg-white text-gray-900'}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}
