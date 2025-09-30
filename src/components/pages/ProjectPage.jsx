import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import CustomProjectPicker from '../feature/custom-project-picker';
import ImageCarousel from '../feature/image-carousel.jsx';
import { useProjects } from '../../hooks/useProjects.js';
import { useSelectedProject } from '../../hooks/SelectedProjectContext.jsx';

/**
 * ProjectPage component
 * Displays a single project based on URL parameter.
 * Validates project ID and redirects to first project if invalid.
 */
function ProjectPage() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();
  const { selectedProjectId } = useSelectedProject();

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">Loading project...</p>
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

  // No projects at all
  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-lg text-muted-foreground">No projects available</p>
      </div>
    );
  }

  // Find requested project
  const selectedProject = projects.find(p => p.id === projectId);

  // Invalid project: redirect to first
  if (!selectedProject) {
    console.warn(`Project "${projectId}" not found, redirecting to first project`);
    return <Navigate to={`/project/${projects[0].id}`} replace />;
  }

  const selectedTitle = selectedProject ? selectedProject.title : 'Select a Project';

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
      <div className="flex flex-col gap-0">
        <CustomProjectPicker
          projects={projects}
          selectedProjectTitle={selectedTitle}
          selectedProject={selectedProject}
        />
        {selectedProject && (
          <ImageCarousel
            items={selectedProject.slides || []}
            projectId={selectedProject.id}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectPage;
