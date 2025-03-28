import React from 'react';
import { ProjectCard } from '../ProjectCard/ProjectCard';
import { Project } from '@/data/projects'; // Assuming Project type is exported from data

/**
 * ProjectGrid component props
 * @interface ProjectGridProps
 */
interface ProjectGridProps {
  /** Array of projects to display */
  projects: Project[];
  /** Optional additional class names */
  className?: string;
  /** Click handler for project selection */
  onProjectClick?: (projectId: string) => void;
}

/**
 * ProjectGrid component displays a grid of project cards
 * 
 * Uses Tailwind CSS for styling and responsiveness.
 * 
 * @component
 * @example
 * ```tsx
 * const projects = [
 *   {
 *     id: '1',
 *     company: 'Nutrien',
 *     title: 'Design System',
 *     role: 'UX Designer',
 *     color: '#8DA89C',
 *     process: { ... } // Add process data
 *   },
 * ];
 * 
 * <ProjectGrid projects={projects} />
 * ```
 */
export const ProjectGrid: React.FC<ProjectGridProps> = ({
  projects,
  className = '',
  onProjectClick,
}) => {
  return (
    // Outer container for background color and centering
    <div className={`w-full min-h-screen bg-gray-50 flex justify-center items-start py-8 ${className}`}>
      {/* Grid section */}
      <section
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl px-4" 
        role="list"
        aria-label="Portfolio projects"
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            company={project.company}
            projectTitle={project.title}
            role={project.role}
            image={project.image}
            backgroundColor={project.color}
            onClick={() => onProjectClick?.(project.id)}
            // Add rounded corners and shadow for better card appearance
            className="rounded-lg shadow-md overflow-hidden" 
          />
        ))}
      </section>
    </div>
  );
};
