import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import ProjectCard from '@/components/custom/project-card';

/**
 * Renders a list of ProjectCard components within a dropdown context.
 * Takes an array of project data and an optional selection handler.
 * Enhanced with mobile-first responsive design.
 */
const ProjectCardList = ({
  projects = [],
  onProjectSelect,
  isMobile = false, // New prop to handle mobile-specific layouts
  className,
  ...props
}) => {
  if (!projects || projects.length === 0) {
    return (
      <div className={cn("p-4 text-center text-gray-500", className)} {...props}>
        No projects available.
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "divide-y divide-gray-100",
        className
      )} 
      role="listbox"
      aria-label="Project list"
      {...props}
    >
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          subtitle={project.subtitle}
          color={project.color}
          logoUrl={project.logoUrl}
          onClick={onProjectSelect}
          isMobile={isMobile} // Pass the mobile flag down to each card
        />
      ))}
    </div>
  );
};

ProjectCardList.propTypes = {
  projects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      color: PropTypes.string.isRequired,
      logoUrl: PropTypes.string,
    })
  ),
  onProjectSelect: PropTypes.func,
  isMobile: PropTypes.bool,
  className: PropTypes.string,
};

export default ProjectCardList;