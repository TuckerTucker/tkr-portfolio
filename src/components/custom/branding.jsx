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
  nameClassName = "text-lg font-semibold font-heading", // Slightly smaller, clean font with heading font
  titleClassName = "text-xs opacity-80", // Subtle subtitle
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center gap-2", className)} // Changed to flex-row (default), added items-center and gap
      {...props}
    >
      <div className={cn(nameClassName)}>{name}</div>
      <span className="opacity-50">|</span> {/* Separator */}
      <div className={cn(titleClassName)}>{title}</div>
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
