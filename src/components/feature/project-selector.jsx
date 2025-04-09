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
  selectedProject = null,
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
            "flex justify-between items-center w-full text-white px-6 py-4 rounded-t-md",
            className
          )}
          style={{
            backgroundColor: selectedProject?.color || '#FF8800',
            '--radix-dropdown-menu-trigger-width': '100%',
          }}
          aria-label="Select project"
        >
          <span className="text-lg">{selectedProjectTitle}</span>
          <ChevronDown size={20} className="ml-2" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="shadow-lg max-w-none p-0 overflow-y-auto md:rounded-b-md md:absolute md:top-full md:left-0
        fixed top-0 left-0 right-0 z-50 h-[80vh] rounded-none bg-white block md:w-auto"
        style={{ width: 'var(--radix-dropdown-menu-trigger-width)' }}
      >
        <ProjectCardList projects={projects} onProjectSelect={handleSelect} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

ProjectSelector.propTypes = {
  projects: PropTypes.array,
  selectedProjectTitle: PropTypes.string,
  selectedProject: PropTypes.object,
  onSelectProject: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectSelector;
