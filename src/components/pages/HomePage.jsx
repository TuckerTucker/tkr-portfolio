import { Navigate } from 'react-router-dom';
import { useProjects } from '../../hooks/useProjects.js';

/**
 * HomePage component
 * Landing page that redirects to the first project.
 * This ensures visitors always see content and provides a consistent entry point.
 */
function HomePage() {
  const { projects, loading, error } = useProjects();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">Loading projects...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-destructive">Error loading projects: {error.message}</p>
      </div>
    );
  }

  // No projects available
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">No projects available</p>
      </div>
    );
  }

  // Redirect to first project
  return <Navigate to={`/project/${projects[0].id}`} replace />;
}

export default HomePage;
