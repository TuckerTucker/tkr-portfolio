import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ChevronDown } from 'lucide-react';
import ProjectCardList from '@/components/custom/project-card-list';
import { cn } from '@/lib/utils';

/**
 * CustomProjectPicker component
 * Enhanced with mobile-first responsive design and improved interaction patterns.
 */
const CustomProjectPicker = ({
  projects = [],
  selectedProject = null,
  selectedProjectTitle = 'Select a Project',
  onSelectProject,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the standard md breakpoint
    };
    
    checkMobile(); // Check on initial render
    window.addEventListener('resize', checkMobile); // Check on resize
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Add click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener only when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (project) => {
    if (onSelectProject) {
      onSelectProject(project);
    }
    setIsOpen(false);
  };

  return (
    <div 
      ref={dropdownRef}
      className={cn(
        'relative w-full', 
        className
      )} 
      {...props}
    >
      {/* Trigger button */}
      <button
        className={cn(
          "relative z-[51] flex items-center w-full text-white rounded-t-md shadow-lg transition-all duration-200",
          // More compact on mobile, standard size on desktop
          isMobile ? "px-4 py-3 min-h-[70px]" : "px-6 py-4 min-h-[90px]",
        )}
        style={{
          backgroundColor: selectedProject?.color || '#613CB0',
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select project"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 flex-grow">
          {selectedProject?.logoUrl && (
            <img
              src={`${import.meta.env.BASE_URL}${selectedProject.logoUrl}`}
              alt={`${selectedProjectTitle} logo`}
              className={cn(
                "object-contain",
                isMobile ? "max-h-[32px] max-w-[32px]" : "max-h-[48px] max-w-[48px]"
              )}
            />
          )}
          <span className={cn(
            isMobile ? "text-base" : "text-lg"
          )}>
            {selectedProject?.subtitle || 'Select a Project'}
          </span>
        </div>
        
        {/* Projects button with chevron */}
        <div className={cn(
          "flex items-center justify-center bg-black/40 rounded-md transition-colors",
          isMobile ? "px-3 py-1.5" : "px-5 py-2.5",
        )}>
          <span className={cn(
            "font-medium",
            isMobile ? "text-xs mr-1" : "text-sm mr-2"
          )}>
            Projects
          </span>
          <ChevronDown
            size={isMobile ? 18 : 25}
            className={cn("transition-transform duration-300", isOpen ? "rotate-180" : "")}
          />
        </div>
      </button>

      {/* Dropdown menu */}
      <div
        className={cn(
          "absolute left-0 top-full mt-0 w-full rounded-b-md shadow-md bg-white dark:bg-card-dark z-50", 
          // Different max height for mobile vs desktop
          isMobile ? "max-h-[70vh]" : "max-h-[80vh]",
          "overflow-y-auto",
          "transition-all duration-300 ease-in-out origin-top",
          isOpen 
            ? "opacity-100 translate-y-0" 
            : "opacity-0 -translate-y-2 pointer-events-none"
        )}
        aria-hidden={!isOpen}
      >
        <ProjectCardList 
          projects={projects} 
          onProjectSelect={handleSelect} 
          isMobile={isMobile}
        />
      </div>
      
      {/* Backdrop for mobile view */}
      {isOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/20 z-40" 
          aria-hidden="true"
          onClick={() => setIsOpen(false)}
        />
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