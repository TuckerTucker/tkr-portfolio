import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

/**
 * Context to hold the currently selected project ID.
 * State priority: URL parameters > localStorage > null
 */
const SelectedProjectContext = createContext();

/**
 * Provider component to wrap the app and provide selected project state.
 * Uses URL-first approach: URL is the single source of truth, state follows URL changes.
 */
export function SelectedProjectProvider({ children }) {
  const { projectId } = useParams(); // Read project ID from URL
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state with priority: URL > localStorage > null
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    // Priority 1: URL parameter (if we're on a project route)
    if (projectId) return projectId;

    // Priority 2: localStorage (fallback when no URL param)
    const stored = localStorage.getItem('selectedProjectId');
    if (stored) return stored;

    // Priority 3: null (will be set to first project by consuming component)
    return null;
  });

  // Sync state when URL changes (browser back/forward, direct navigation)
  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectIdState(projectId);
    }
  }, [projectId]); // Only depend on projectId to avoid loops

  // Sync localStorage when state changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProjectId]);

  // PREFERRED: Navigate to project (updates URL, which updates state)
  const navigateToProject = useCallback((id) => {
    navigate(`/project/${id}`);
    // State update happens automatically via useEffect when URL changes
  }, [navigate]);

  const value = {
    selectedProjectId,
    setSelectedProjectId: setSelectedProjectIdState, // Kept for backward compatibility
    navigateToProject, // Preferred method for changing projects
  };

  return (
    <SelectedProjectContext.Provider value={value}>
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
