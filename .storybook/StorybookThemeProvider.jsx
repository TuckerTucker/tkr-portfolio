import React, { createContext, useContext, useMemo } from 'react';

const ThemeContext = createContext();

export function StorybookThemeProvider({ children, theme = 'light' }) {
  const value = useMemo(() => ({
    theme,
    setTheme: () => {
      // No-op in Storybook - theme is controlled by toolbar
      console.log('Theme changes are controlled by Storybook toolbar');
    },
    themes: {
      light: 'light',
      dark: 'dark',
      system: 'system'
    }
  }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}