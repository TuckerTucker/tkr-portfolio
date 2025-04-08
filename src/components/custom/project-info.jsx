import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * Displays a title and subtitle, typically used within project cards or list items.
 * Styling is primarily controlled via className prop based on .clinerules definition.
 */
const ProjectInfo = ({
  title = "Default Title",
  subtitle = "Default Subtitle",
  className,
  titleClassName = "text-base font-semibold text-text", // Default title style
  subtitleClassName = "text-sm text-gray-600", // Default subtitle style
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col", className)} // Base class from .clinerules + passed className
      {...props}
    >
      <p className={cn(titleClassName)}>{title}</p>
      <p className={cn(subtitleClassName)}>{subtitle}</p>
    </div>
  );
};

ProjectInfo.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
};

export default ProjectInfo;
