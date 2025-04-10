import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import ProjectCardList from '@/components/custom/project-card-list';
import { cn } from '@/lib/utils';

const CustomProjectPicker = ({
  projects = [],
  selectedProject = null,
  selectedProjectTitle = 'Select a Project',
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
    <div className={cn('relative w-full', className)} {...props}>
      <button
        className="relative z-[51] flex justify-between items-center w-full text-white px-6 py-4 rounded-t-md shadow-md" // Added relative z-[51]
        style={{
          backgroundColor: selectedProject?.color || '#FF8800',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select project"
      >
        {selectedProject?.logoUrl && (
          <img
            src={`${import.meta.env.BASE_URL}${selectedProject.logoUrl}`}
            alt={`${selectedProjectTitle} logo`}
            className="mr-2 object-contain"
          />
        )}
        <span className="text-lg">{selectedProject?.subtitle || 'Select a Project'}</span>
        <ChevronDown size={20} className={cn("ml-2 transition-transform duration-300", isOpen ? "rotate-180" : "")} />
      </button>

      <div
        className={cn(
          "absolute left-0 top-full mt-0 w-full rounded-b-md shadow-lg bg-white overflow-y-auto max-h-[80vh] z-50", // Removed mt-1, changed rounding
          "transition-all duration-300 ease-in-out origin-top",
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        )}
      >
        <ProjectCardList projects={projects} onProjectSelect={handleSelect} />
      </div>
    </div>
  );
};

CustomProjectPicker.propTypes = {
  projects: PropTypes.array,
  selectedProject: PropTypes.object,
  selectedProjectTitle: PropTypes.string,
  onSelectProject: PropTypes.func,
  className: PropTypes.string,
};

export default CustomProjectPicker;
