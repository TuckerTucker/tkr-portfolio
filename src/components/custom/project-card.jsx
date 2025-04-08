import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"; // shadcn component
import ColorBlock from '@/components/custom/color-block';
import ProjectInfo from '@/components/custom/project-info';

/**
 * Represents a single project item within the project selector dropdown.
 * Combines ColorBlock and ProjectInfo within a DropdownMenuItem.
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
    <DropdownMenuItem
      className={cn(
        "flex items-center w-full p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors duration-150",
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <ColorBlock
        backgroundColor={color}
        marginRight="16px"
      />
      <ProjectInfo
        title={title}
        subtitle={subtitle}
      />
    </DropdownMenuItem>
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
