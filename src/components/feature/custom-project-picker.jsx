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
        className="flex justify-between items-center w-full text-white px-6 py-4 rounded-md"
        style={{
          backgroundColor: selectedProject?.color || '#FF8800',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select project"
      >
        <span className="text-lg">{selectedProjectTitle}</span>
        <ChevronDown size={20} className="ml-2" />
      </button>

      {isOpen && (
        <div
          className="block w-full mt-2 rounded-md shadow-lg bg-white overflow-y-auto max-h-[80vh]"
        >
          <ProjectCardList projects={projects} onProjectSelect={handleSelect} />
        </div>
      )}
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
