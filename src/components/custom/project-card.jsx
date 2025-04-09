import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import ColorBlock from '@/components/custom/color-block';
import ProjectInfo from '@/components/custom/project-info';

/**
 * Represents a single project item within the project selector dropdown.
 * Combines ColorBlock and ProjectInfo.
 * Based on .clinerules definition for project_card.
 */
const ProjectCard = ({
  id,
  title,
  subtitle,
  color,
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
        "flex items-center w-full p-4 rounded-none cursor-pointer transition-colors duration-150",
        className
      )}
      style={{ backgroundColor: color, color: '#fff' }}
      onClick={handleClick}
      {...props}
    >
      <ColorBlock
        backgroundColor="rgba(255,255,255,0.3)"
        marginRight="16px"
      />
      <ProjectInfo
        title={title}
        subtitle={subtitle}
      />
    </div>
  );
};

ProjectCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default ProjectCard;
