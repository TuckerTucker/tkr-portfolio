import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils"; // Using shadcn utility

/**
 * A simple colored block component, often used as a visual indicator or icon placeholder.
 * Configured via props based on .clinerules definition for project_card's icon.
 */
const ColorBlock = ({
  width = '48px', // Default from .clinerules
  height = '48px', // Default from .clinerules
  backgroundColor = '#cccccc', // Default fallback color
  borderRadius = '4px', // Default from .clinerules
  marginRight = '0px', // Default from .clinerules (applied by parent usually)
  className,
  ...props
}) => {
  const style = {
    width,
    height,
    backgroundColor,
    borderRadius,
    marginRight,
  };

  return (
    <div
      style={style}
      className={cn("flex-shrink-0", className)} // Added flex-shrink-0 to prevent shrinking in flex layouts
      {...props}
    />
  );
};

ColorBlock.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  backgroundColor: PropTypes.string,
  borderRadius: PropTypes.string,
  marginRight: PropTypes.string,
  className: PropTypes.string,
};

export default ColorBlock;
