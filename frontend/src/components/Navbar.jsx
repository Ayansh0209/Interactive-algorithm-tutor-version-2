import React from 'react'
import { useTheme } from '../App'

function Navbar() {
  const { isDarkMode, setIsDarkMode } = useTheme()

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
  }

  const themeClasses = isDarkMode 
    ? 'bg-gray-900 border-gray-800 text-white' 
    : 'bg-gray-100 border-gray-200 text-gray-900'

  return (
    <nav className={`${themeClasses} border-b px-6 py-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Interactive Algorithm Tutor
            </h1>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            {/* Future navigation items will go here */}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 hover:bg-gray-700' 
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Toggle theme"
          >
            {isDarkMode ? '🌙' : '☀️'}
          </button>
          <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
            Login
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
