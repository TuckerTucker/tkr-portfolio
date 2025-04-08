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
      // Base classes from .clinerules + passed className
      // Note: .clinerules specifies display:flex, padding, border, cursor.
      // DropdownMenuItem handles some styling, we add others.
      className={cn(
        "flex items-center p-4 border-b border-gray-200 cursor-pointer focus:bg-accent/10 data-[highlighted]:bg-accent/10", // Added focus/highlight style
        className
      )}
      onClick={handleClick}
      {...props}
    >
      <ColorBlock
        backgroundColor={color}
        marginRight="16px" // From .clinerules definition
        // Other props like width, height, borderRadius use defaults from ColorBlock
      />
      <ProjectInfo
        title={title}
        subtitle={subtitle}
        // className="flex flex-col" // Base class is already in ProjectInfo
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
