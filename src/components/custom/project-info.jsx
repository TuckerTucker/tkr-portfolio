import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * Displays a title and subtitle, typically used within project cards or list items.
 * Enhanced with mobile-first responsive design.
 */
const ProjectInfo = ({
  title = "Default Title",
  subtitle = "Default Subtitle",
  isMobile = false, // New prop to handle mobile-specific layouts
  className,
  titleClassName,
  subtitleClassName,
  ...props
}) => {
  // Apply different default text sizes based on mobile or desktop view
  const defaultTitleClass = isMobile 
    ? "text-sm font-semibold text-white" 
    : "text-base font-semibold text-white";
    
  const defaultSubtitleClass = isMobile
    ? "text-xs text-white/80"
    : "text-sm text-white/80";

  return (
    <div
      className={cn("flex flex-col", className)}
      {...props}
    >
      <p className={cn(defaultTitleClass, titleClassName)}>{title}</p>
      <p className={cn(defaultSubtitleClass, subtitleClassName)}>{subtitle}</p>
    </div>
  );
};

ProjectInfo.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  isMobile: PropTypes.bool,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
};

export default ProjectInfo;