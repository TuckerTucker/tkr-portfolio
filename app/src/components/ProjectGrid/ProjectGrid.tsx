import React from 'react';
import { ProjectCard } from '../ProjectCard/ProjectCard';

/**
 * Project data interface
 * @interface Project
 */
interface Project {
  /** Project ID */
  id: string;
  /** Company name */
  company: string;
  /** Project title */
  title: string;
  /** Role in the project */
  role: string;
  /** Project preview image URL */
  image?: string;
  /** Background color for the card */
  color?: string;
}

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

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 600px), 1fr))',
    gap: '2rem',
    width: '100%',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem',
  },
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
};

/**
 * ProjectGrid component displays a grid of project cards
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
    <div style={styles.container}>
      <section
        style={styles.grid}
        className={className}
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
          />
        ))}
      </section>
    </div>
  );
};
