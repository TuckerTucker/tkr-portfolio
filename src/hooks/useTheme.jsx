import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext(undefined);

const themes = {
  light: 'light',
  dark: 'dark',
  system: 'system'
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    
    // Return saved theme or system as default
    return savedTheme || themes.system;
  });

  useEffect(() => {
    const handleSystemThemeChange = (e) => {
      if (theme === themes.system) {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    // Apply the correct theme
    const applyTheme = () => {
      if (theme === themes.system) {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      } else {
        document.documentElement.classList.toggle('dark', theme === themes.dark);
      }
    };

    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme
    applyTheme();
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const value = {
    theme,
    setTheme,
    themes
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}