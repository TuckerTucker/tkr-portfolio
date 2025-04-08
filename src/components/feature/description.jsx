import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * Displays a project's title and description inside a styled card.
 * Based on .clinerules definition for description.
 */
const Description = ({
  title = "Project Title",
  description = "This is a short project description. Lorem Ipsum Dolor Sit Amet.",
  className,
  titleClassName = "text-2xl font-bold mb-4",
  descriptionClassName = "text-base leading-relaxed mb-6",
  ...props
}) => {
  return (
    <div
      className={cn("bg-white p-6", className)} // Base classes from .clinerules
      role="article" // Accessibility from .clinerules
      aria-label="Project description" // Accessibility from .clinerules
      {...props}
    >
      <h2 className={cn(titleClassName)}>{title}</h2>
      <p className={cn(descriptionClassName)}>{description}</p>
    </div>
  );
};

Description.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  descriptionClassName: PropTypes.string,
};

export default Description;
