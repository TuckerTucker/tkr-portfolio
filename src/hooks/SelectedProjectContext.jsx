import { createContext, useContext, useState } from 'react';

/**
 * Context to hold the currently selected project ID.
 */
const SelectedProjectContext = createContext();

/**
 * Provider component to wrap the app and provide selected project state.
 */
export function SelectedProjectProvider({ children }) {
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  return (
    <SelectedProjectContext.Provider value={{ selectedProjectId, setSelectedProjectId }}>
      {children}
    </SelectedProjectContext.Provider>
  );
}

/**
 * Hook to access the selected project context.
 */
export function useSelectedProject() {
  const context = useContext(SelectedProjectContext);
  if (!context) {
    throw new Error('useSelectedProject must be used within a SelectedProjectProvider');
  }
  return context;
}
