import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * Displays branding information (name and title).
 * Based on .clinerules definition for the header's branding child.
 */
const Branding = ({
  name = "Sean 'Tucker' Harley", // Default from .clinerules
  title = "UX Designer", // Default from .clinerules
  className,
  nameClassName = "text-xl font-bold", // Example default styling
  titleClassName = "text-sm opacity-90", // Example default styling
  ...props
}) => {
  return (
    <div
      className={cn("flex flex-col", className)} // Base class from .clinerules + passed className
      {...props}
    >
      <p className={cn(nameClassName)}>{name}</p>
      <p className={cn(titleClassName)}>{title}</p>
    </div>
  );
};

Branding.propTypes = {
  name: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
  nameClassName: PropTypes.string,
  titleClassName: PropTypes.string,
};

export default Branding;
