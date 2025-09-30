import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * UserPersona HTML Slide Component
 * Displays a user persona card with demographics, goals, pain points, and behaviors.
 * Used to showcase user research insights in a visually engaging format.
 * Enhanced with mobile-first responsive design.
 */
const UserPersona = ({ 
  name = "User Persona",
  role = "Primary User",
  avatar = "",
  demographics = {},
  goals = [],
  painPoints = [],
  behaviors = [],
  quote = "",
  isMobile = false, // New prop to handle mobile-specific layouts
  className,
  ...props 
}) => {
  return (
    <div 
      className={cn(
        "w-full flex flex-col p-4 md:p-6 bg-gradient-to-r from-gray-900 to-gray-800", 
        // For mobile, we don't need h-full as we want to allow scrolling
        !isMobile && "h-full",
        className
      )} 
      {...props}
    >
      <div 
        className={cn(
          "w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden flex flex-col",
          !isMobile && "h-full", // Only constrain height on desktop
          "md:flex-row"
        )}
      >
        {/* Left section - Avatar and demographics */}
        <div className="w-full md:w-1/3 bg-gray-700 p-4 md:p-6 flex flex-col items-center">
          {/* Avatar */}
          <div className="w-20 h-20 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-blue-500 mb-3 md:mb-4">
            {avatar ? (
              <img 
                src={avatar} 
                alt={`${name} avatar`} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-blue-900 flex items-center justify-center text-white text-xl md:text-2xl font-bold">
                {name.split(' ').map(word => word[0]).join('')}
              </div>
            )}
          </div>
          
          {/* Name and role */}
          <h2 className="text-lg md:text-xl font-bold text-white mb-1 text-center">{name}</h2>
          <p className="text-blue-400 mb-4 md:mb-6 text-center text-sm md:text-base">{role}</p>
          
          {/* Demographics */}
          <div className="w-full">
            <h3 className="text-xs md:text-sm uppercase text-gray-400 tracking-wider mb-2">Demographics</h3>
            <div className="space-y-1 md:space-y-2">
              {Object.entries(demographics).map(([key, value], index) => (
                <div key={index} className="flex justify-between text-xs md:text-sm">
                  <span className="text-gray-400">{key}</span>
                  <span className="text-white">{value}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Quote - only shown on larger screens or if mobile and no quote is available */}
          {quote && (!isMobile || (isMobile && Object.keys(demographics).length < 3)) && (
            <div className="mt-4 md:mt-6 w-full">
              <blockquote className="italic text-gray-300 border-l-4 border-blue-500 pl-3 md:pl-4 text-xs md:text-sm">
                "{quote}"
              </blockquote>
            </div>
          )}
        </div>
        
        {/* Right section - Goals, Pain Points, Behaviors */}
        <div className="w-full md:w-2/3 p-4 md:p-6 flex flex-col">
          {/* Goals */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm uppercase text-blue-400 tracking-wider mb-2 md:mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Goals
            </h3>
            <ul className="space-y-1 md:space-y-2">
              {goals.map((goal, index) => (
                <li key={index} className="text-white text-xs md:text-sm flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {typeof goal === 'string' ? goal : goal.description || goal.name || goal.title || ''}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Pain Points */}
          <div className="mb-4 md:mb-6">
            <h3 className="text-xs md:text-sm uppercase text-red-400 tracking-wider mb-2 md:mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Pain Points
            </h3>
            <ul className="space-y-1 md:space-y-2">
              {painPoints.map((point, index) => (
                <li key={index} className="text-white text-xs md:text-sm flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {typeof point === 'string' ? point : point.description || point.name || point.title || ''}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Behaviors */}
          <div>
            <h3 className="text-xs md:text-sm uppercase text-green-400 tracking-wider mb-2 md:mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
              Behaviors
            </h3>
            <ul className="space-y-1 md:space-y-2">
              {behaviors.map((behavior, index) => (
                <li key={index} className="text-white text-xs md:text-sm flex items-start">
                  <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                  {typeof behavior === 'string' ? behavior : behavior.description || behavior.name || behavior.title || ''}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Quote for mobile if demographics are too many */}
          {quote && isMobile && Object.keys(demographics).length >= 3 && (
            <div className="mt-4 w-full">
              <blockquote className="italic text-gray-300 border-l-4 border-blue-500 pl-3 text-xs">
                "{quote}"
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UserPersona.propTypes = {
  name: PropTypes.string,
  role: PropTypes.string,
  avatar: PropTypes.string,
  demographics: PropTypes.object,
  goals: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      description: PropTypes.string,
      name: PropTypes.string,
      title: PropTypes.string
    })
  ])),
  painPoints: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      description: PropTypes.string,
      name: PropTypes.string,
      title: PropTypes.string,
      category: PropTypes.string,
      frequency: PropTypes.string,
      impact: PropTypes.string
    })
  ])),
  behaviors: PropTypes.arrayOf(PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
      description: PropTypes.string,
      name: PropTypes.string,
      title: PropTypes.string,
      category: PropTypes.string,
      frequency: PropTypes.string,
      impact: PropTypes.string
    })
  ])),
  quote: PropTypes.string,
  isMobile: PropTypes.bool,
  className: PropTypes.string
};

export default UserPersona;