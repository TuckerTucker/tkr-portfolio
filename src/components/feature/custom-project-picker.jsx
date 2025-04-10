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
        className={cn(
          "relative z-[51] flex  items-center w-full text-white px-6 rounded-t-md py-4 min-h-[90px] shadow-lg transition-all duration-200",
        )}
        style={{
          backgroundColor: selectedProject?.color || '#613CB0',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select project"
      >
        <div className="flex items-center gap-2 flex-grow">
          {selectedProject?.logoUrl && (
            <img
              src={`${import.meta.env.BASE_URL}${selectedProject.logoUrl}`}
              alt={`${selectedProjectTitle} logo`}
            />
          )}
          <span className="text-lg">{selectedProject?.subtitle || 'Select a Project'}</span>
        </div>
        <div className="flex items-center justify-center bg-black/40 rounded-md px-5 py-2.5">
          <ChevronDown
            size={25}
            className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}
          />
        </div>
      </button>

      <div
        className={cn(
          "absolute left-0 top-full mt-0 w-full rounded-b-md shadow-md bg-white overflow-y-auto max-h-[80vh] z-50", // Removed mt-1, changed rounding
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
