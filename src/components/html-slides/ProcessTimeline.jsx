import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * ProcessTimeline HTML Slide Component
 * Displays a UX design process timeline with customizable stages and descriptions.
 * Shows the progression of a project from start to finish with visual indicators.
 */
const ProcessTimeline = ({ 
  title = "Design Process",
  description = "A timeline showing the UX design process for this project",
  stages = [], 
  activeStage = 0,
  className,
  ...props 
}) => {
  return (
    <div className={cn("w-full h-full flex flex-col p-6 bg-gradient-to-r from-gray-900 to-gray-800", className)} {...props}>
      <div className="mb-6">
        <h2 className="text-2xl font-heading mb-1 text-white">{title}</h2>
        <p className="text-sm text-gray-300">{description}</p>
      </div>
      
      <div className="relative flex-grow">
        {/* The timeline line */}
        <div className="absolute top-7 left-4 w-[calc(100%-2rem)] h-1 bg-gray-600 rounded-full"></div>
        
        {/* Timeline stages */}
        <div className="relative flex justify-between items-start px-4">
          {stages.map((stage, index) => (
            <div 
              key={index}
              className={cn(
                "flex flex-col items-center w-full max-w-[120px]",
                "transition-all duration-300 transform",
                index === activeStage && "scale-110"
              )}
            >
              {/* Circle node */}
              <div 
                className={cn(
                  "w-5 h-5 rounded-full border-2 flex items-center justify-center mb-3",
                  index < activeStage ? "bg-green-500 border-green-400" : // Completed
                  index === activeStage ? "bg-blue-500 border-blue-400" : // Active
                  "bg-gray-700 border-gray-600" // Future
                )}
              >
                {index < activeStage && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              
              {/* Stage info */}
              <div className={cn(
                "text-center transition-opacity",
                index === activeStage ? "opacity-100" : "opacity-70"
              )}>
                <h3 className={cn(
                  "text-sm font-medium mb-1",
                  index < activeStage ? "text-green-400" :
                  index === activeStage ? "text-blue-400" :
                  "text-gray-400"
                )}>
                  {stage.name}
                </h3>
                <p className="text-xs text-gray-400 line-clamp-3">{stage.description}</p>
                
                {/* Deliverable tag if present */}
                {stage.deliverable && (
                  <span className="inline-block mt-2 px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                    {stage.deliverable}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

ProcessTimeline.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  stages: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      deliverable: PropTypes.string
    })
  ),
  activeStage: PropTypes.number,
  className: PropTypes.string
};

export default ProcessTimeline;