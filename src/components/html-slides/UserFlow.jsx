import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * UserFlow HTML Slide Component
 * Displays a simplified user flow diagram with nodes and connections.
 * Highlights the selected flow step with additional details.
 */
const UserFlow = ({ 
  title = "User Flow",
  description = "A simplified diagram of the user journey",
  flowSteps = [],
  className,
  ...props 
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  
  // Get the active step details
  const activeStep = flowSteps[activeStepIndex] || {};
  
  // Function to render connection lines between steps
  const renderConnections = () => {
    return flowSteps.map((step, index) => {
      if (index === flowSteps.length - 1) return null; // Skip the last item
      
      const isActive = index === activeStepIndex || index + 1 === activeStepIndex;
      
      return (
        <div 
          key={`connection-${index}`}
          className={cn(
            "absolute h-1 bg-gray-600 transform rotate-0",
            isActive && "bg-blue-500"
          )}
          style={{
            left: `calc(${(index * (100 / (flowSteps.length - 1)))}% + 25px)`,
            width: `calc(${100 / (flowSteps.length - 1)}% - 50px)`,
            top: '25px',
          }}
        />
      );
    });
  };

  return (
    <div className={cn("w-full h-full flex flex-col p-6 bg-gradient-to-r from-gray-900 to-gray-800", className)} {...props}>
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-white mb-1">{title}</h2>
        <p className="text-sm text-gray-400">{description}</p>
      </div>
      
      {/* Flow diagram */}
      <div className="relative mt-4 mb-8 px-6">
        {/* Connection lines */}
        {renderConnections()}
        
        {/* Step nodes */}
        <div className="relative flex justify-between items-center">
          {flowSteps.map((step, index) => (
            <button
              key={index}
              className={cn(
                "relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2",
                index === activeStepIndex
                  ? "bg-blue-600 border-blue-400 scale-110 shadow-lg shadow-blue-500/30"
                  : index < activeStepIndex
                    ? "bg-green-600 border-green-400"
                    : "bg-gray-700 border-gray-600 hover:bg-gray-600"
              )}
              onClick={() => setActiveStepIndex(index)}
            >
              {index === activeStepIndex ? (
                // Active step icon
                <span className="text-white text-lg font-bold">{index + 1}</span>
              ) : index < activeStepIndex ? (
                // Completed step icon (checkmark)
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                // Future step number
                <span className="text-white text-sm">{index + 1}</span>
              )}
              
              {/* Step label */}
              <span 
                className={cn(
                  "absolute -bottom-6 text-xs whitespace-nowrap transition-all duration-300",
                  index === activeStepIndex ? "text-blue-400 font-medium" : "text-gray-400"
                )}
              >
                {step.label}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      {/* Active step details */}
      <div className="flex-grow mt-6 bg-gray-800 rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 p-4 border-b border-gray-600">
          <h3 className="text-lg font-medium text-white">
            {activeStep.title}
          </h3>
          <p className="text-sm text-gray-400">
            Step {activeStepIndex + 1} of {flowSteps.length}
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column */}
            <div className="flex-1">
              <h4 className="text-sm uppercase tracking-wider text-blue-400 mb-3">Description</h4>
              <p className="text-gray-300 text-sm">{activeStep.description}</p>
              
              {/* User actions */}
              {activeStep.userActions && activeStep.userActions.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm uppercase tracking-wider text-blue-400 mb-3">User Actions</h4>
                  <ul className="space-y-2">
                    {activeStep.userActions.map((action, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Right column */}
            <div className="flex-1">
              {/* System response */}
              {activeStep.systemResponse && (
                <div className="mb-6">
                  <h4 className="text-sm uppercase tracking-wider text-green-400 mb-3">System Response</h4>
                  <p className="text-gray-300 text-sm">{activeStep.systemResponse}</p>
                </div>
              )}
              
              {/* Decision points */}
              {activeStep.decisionPoints && activeStep.decisionPoints.length > 0 && (
                <div>
                  <h4 className="text-sm uppercase tracking-wider text-yellow-400 mb-3">Decision Points</h4>
                  <ul className="space-y-2">
                    {activeStep.decisionPoints.map((point, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-start">
                        <span className="inline-block w-1.5 h-1.5 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          
          {/* Step image or visual */}
          {activeStep.image && (
            <div className="mt-6 p-3 bg-gray-700 rounded-lg">
              <img 
                src={activeStep.image} 
                alt={`${activeStep.title} visualization`}
                className="max-w-full max-h-[120px] object-contain mx-auto"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UserFlow.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  flowSteps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      userActions: PropTypes.arrayOf(PropTypes.string),
      systemResponse: PropTypes.string,
      decisionPoints: PropTypes.arrayOf(PropTypes.string),
      image: PropTypes.string
    })
  ),
  className: PropTypes.string
};

export default UserFlow;