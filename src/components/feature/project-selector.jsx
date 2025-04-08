import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import ProjectCardList from '@/components/custom/project-card-list';

/**
 * Project selector dropdown component.
 * Based on .clinerules definition for project_selector.
 */
const ProjectSelector = ({
  projects = [],
  selectedProjectTitle = "Selected Project",
  onSelectProject,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            "flex justify-between items-center w-full bg-secondary text-white px-6 py-4 rounded-t-md",
            className
          )}
          aria-label="Select project"
        >
          <span className="text-lg">{selectedProjectTitle}</span>
          <ChevronDown size={20} className="ml-2" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white rounded-b-md shadow-lg w-full p-0">
        <ProjectCardList projects={projects} onProjectSelect={handleSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

ProjectSelector.propTypes = {
  projects: PropTypes.array,
  selectedProjectTitle: PropTypes.string,
  onSelectProject: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectSelector;
