import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * A custom header component typically used within cards, displaying title and subtitle.
 * Styling is controlled via props and className, based on .clinerules mobile_project_card definition.
 */
const CardHeader = ({
  title = "Card Title",
  subtitle = "Card Subtitle",
  backgroundColor = '#666666', // Default fallback background
  textColor = '#FFFFFF', // Default from .clinerules
  className,
  titleClassName = "text-lg font-bold", // Default title style (adjust as needed)
  subtitleClassName = "text-sm opacity-80", // Default subtitle style from .clinerules
  ...props
}) => {
  const style = {
    backgroundColor: backgroundColor,
    color: textColor,
  };

  return (
    <div
      style={style}
      // Base classes from .clinerules + passed className
      className={cn("p-4 flex justify-between items-center", className)}
      {...props}
    >
      {/* Using simple p tags, assuming Typography component isn't strictly needed here */}
      {/* Or could import ProjectInfo component if preferred */}
      <div className="flex flex-col">
         <p className={cn(titleClassName)}>{title}</p>
         <p className={cn(subtitleClassName)}>{subtitle}</p>
      </div>
      {/* Placeholder for potential right-aligned content if needed later */}
      <div></div>
    </div>
  );
};

CardHeader.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  subtitleClassName: PropTypes.string,
};

export default CardHeader;
