import React from 'react'
import { useTheme } from '../App'
import { executeAndPrepareTrace } from '../controllers/runner';

function Sidebar({ selectedLanguage, setSelectedLanguage, code, setCode }) {
    const { isDarkMode } = useTheme()

    const languages = [
        { id: 'python', name: 'Python', active: true },
        { id: 'javascript', name: 'JavaScript', active: false },
        { id: 'cpp', name: 'C/C++', active: false }
    ]

    const themeClasses = isDarkMode
        ? 'bg-gray-900 border-gray-800 text-white'
        : 'bg-gray-100 border-gray-200 text-gray-900'

    const inputThemeClasses = isDarkMode
        ? 'bg-black border-gray-700 text-gray-300'
        : 'bg-white border-gray-300 text-gray-700'

   const handleRun = async () => {
  const trace = await executeAndPrepareTrace(code);
  console.log(trace); // for now
  // TODO: setTrace(trace), setStep(0), send to VisualizationArea
};


    return (
        <div className={`w-80 ${themeClasses} border-l p-4`}>
            <div className="space-y-6">
                <div>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Configuration
                    </h3>

                    <div className="mb-4">
                        <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Code Language
                        </label>
                        <div className="flex space-x-2">
                            {languages.map((lang) => (
                                <button
                                    key={lang.id}
                                    onClick={() => lang.active && setSelectedLanguage(lang.id)}
                                    disabled={!lang.active}
                                    className={`px-3 py-2 rounded text-sm transition-all ${selectedLanguage === lang.id && lang.active
                                            ? 'bg-green-600 text-white'
                                            : lang.active
                                                ? `${isDarkMode ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                                                : `${isDarkMode ? 'bg-gray-800 text-gray-500' : 'bg-gray-200 text-gray-400'} cursor-not-allowed blur-sm`
                                        }`}
                                >
                                    {lang.name}
                                    {!lang.active && (
                                        <span className="ml-1 text-xs">🔒</span>
                                    )}
                                </button>
                            ))}
                        </div>
                        {!languages.find(l => l.id === selectedLanguage)?.active && (
                            <p className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                More languages coming soon!
                            </p>
                        )}
                    </div>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Code
                        </label>
                        <button className={`${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'}`}>
                            <span className="text-sm">⚙️</span>
                        </button>
                    </div>
                    <div className={`${inputThemeClasses} rounded-lg border`}>
                        <textarea
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className={`w-full h-64 p-3 bg-transparent font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 rounded-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                            placeholder="Write your algorithm code here..."
                            spellCheck={false}
                        />
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                            Lines: {code.split('\n').length}
                        </span>
                        <button onClick={handleRun} className="text-xs text-green-400 hover:text-green-300">
                            Run Code
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Sidebar
