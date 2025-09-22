import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const DarkModeContext = createContext();

// Create a provider component
export function DarkModeProvider({ children }) {
  // Check if dark mode was previously enabled
  const storedDarkMode = localStorage.getItem('darkMode') === 'true';

  // State to track dark mode
  const [darkMode, setDarkMode] = useState(storedDarkMode);

  // Toggle dark mode function
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Update localStorage and body class when dark mode changes
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);

    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Value to be provided to consumers
  const value = {
    darkMode,
    toggleDarkMode
  };

  return (
    <DarkModeContext.Provider value={value}>
      {children}
    </DarkModeContext.Provider>
  );
}

// Custom hook for using the dark mode context
export function useDarkMode() {
  const context = useContext(DarkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
}