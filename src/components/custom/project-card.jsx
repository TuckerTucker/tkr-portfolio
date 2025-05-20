import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import ColorBlock from '@/components/custom/color-block';
import ProjectInfo from '@/components/custom/project-info';

/**
 * Represents a single project item within the project selector dropdown.
 * Displays logo, project info, and an image placeholder.
 * Enhanced with mobile-first responsive design.
 */
const ProjectCard = ({
  id,
  title,
  subtitle,
  color,
  logoUrl,
  onClick,
  isMobile = false, // New prop to handle mobile-specific layouts
  className,
  ...props
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick({ id, title }); // Pass back id and title on click
    }
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full rounded-none cursor-pointer transition-colors duration-150",
        // More compact on mobile
        isMobile ? "p-3" : "p-4",
        className
      )}
      style={{ backgroundColor: color, color: '#fff' }}
      onClick={handleClick}
      role="option"
      aria-selected="false"
      {...props}
    >
      {/* Left: Logo or Color Block - Smaller on mobile */}
      <div className={cn(
        "flex items-center mr-3 flex-shrink-0",
        isMobile ? "w-12 h-12" : "w-16 h-16",
      )}>
        {logoUrl ? (
          <img 
            src={`${import.meta.env.BASE_URL}${logoUrl}`} 
            alt={`${title} logo`} 
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <ColorBlock
            backgroundColor="rgba(255,255,255,0.3)"
            className="w-full h-full" // Make block fill container
          />
        )}
      </div>

      {/* Center: Project Info - Adjust text size on mobile */}
      <ProjectInfo
        title={title}
        subtitle={subtitle}
        className="flex-grow"
        isMobile={isMobile}
      />

      {/* Right: Image Placeholder - Hide on very small screens, smaller on mobile */}
      <div className={cn(
        "bg-gray-300 flex items-center justify-center text-gray-600 flex-shrink-0 ml-3",
        isMobile ? "w-16 h-12 hidden sm:flex" : "w-24 h-16",
        isMobile ? "text-xs" : "text-sm",
      )}>
        Image
      </div>
    </div>
  );
};

ProjectCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  logoUrl: PropTypes.string,
  onClick: PropTypes.func,
  isMobile: PropTypes.bool,
  className: PropTypes.string,
};

export default ProjectCard;