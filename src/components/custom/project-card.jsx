import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import ColorBlock from '@/components/custom/color-block';
import ProjectInfo from '@/components/custom/project-info';

/**
 * Represents a single project item within the project selector dropdown.
 * Displays logo, project info, and an image placeholder.
 * Based on .clinerules definition for project_card and user screenshot.
 */
const ProjectCard = ({
  id,
  title,
  subtitle,
  color,
  logoUrl, // Added logoUrl prop
  onClick, // Function to handle selection
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
        "flex items-center justify-between w-full p-4 rounded-none cursor-pointer transition-colors duration-150", // Added justify-between
        className
      )}
      style={{ backgroundColor: color, color: '#fff' }}
      onClick={handleClick}
      {...props}
    >
      {/* Left: Logo or Color Block */}
      <div className="flex items-center mr-4 flex-shrink-0 w-16 h-16"> {/* Added container for logo/block */}
        {logoUrl ? (
          <img src={logoUrl} alt={`${title} logo`} className="max-w-full max-h-full object-contain" />
        ) : (
          <ColorBlock
            backgroundColor="rgba(255,255,255,0.3)"
            className="w-full h-full" // Make block fill container
          />
        )}
      </div>

      {/* Center: Project Info */}
      <ProjectInfo
        title={title}
        subtitle={subtitle}
        className="flex-grow" // Allow info to take up space
      />

      {/* Right: Image Placeholder */}
      <div className="ml-4 w-24 h-16 bg-gray-300 flex items-center justify-center text-gray-600 text-sm flex-shrink-0">
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
  logoUrl: PropTypes.string, // Added prop type
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectCard;
