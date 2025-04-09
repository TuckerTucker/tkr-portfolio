import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import ProjectCard from '@/components/custom/project-card';

/**
 * Renders a list of ProjectCard components within a dropdown context.
 * Takes an array of project data and an optional selection handler.
 * Based on .clinerules definition for project_selector's project_card_list child.
 */
const ProjectCardList = ({
  projects = [], // Default to empty array
  onProjectSelect, // Function to call when a project is selected
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
    <div className={cn("", className)} {...props}> {/* Removed py-1 */}
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          id={project.id}
          title={project.title}
          subtitle={project.subtitle}
          color={project.color}
          logoUrl={project.logoUrl} // Pass logoUrl
          onClick={onProjectSelect} // Pass the handler down
          // Add any specific className for list items if needed
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
      logoUrl: PropTypes.string, // Add logoUrl prop type
      // Add other project properties if needed by ProjectCard later
    })
  ),
  onProjectSelect: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectCardList;
