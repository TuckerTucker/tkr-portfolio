import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

/**
 * TechStack HTML Slide Component
 * Displays a responsive grid of technologies with optional icons and descriptions.
 * Used for showcasing the technology stack of a project.
 */
const TechStack = ({ 
  technologies = [], 
  title = "Technology Stack",
  className,
  isMobile,
  ...props 
}) => {
  // Filter out non-DOM props
  const { isMobile: _, ...domProps } = props;
  
  // Get theme to handle theme-aware icons
  const { theme } = useTheme();
  const getActualTheme = () => {
    if (theme === 'system') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return theme;
  };
  const actualTheme = getActualTheme();
  
  return (
    <div className={cn("w-full h-full flex flex-col p-6 text-[var(--slide-text)]", className)} {...domProps}>
      <h2 className="text-2xl font-heading mb-4 text-[var(--slide-title)]">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
        {technologies.map((tech, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-3 bg-[var(--slide-card-bg)] backdrop-blur-sm rounded-lg border border-[var(--slide-card-border)] hover:scale-105 transition-transform"
          >
            {tech.icon && (
              <div className="w-12 h-12 mb-2 flex items-center justify-center">
                {typeof tech.icon === 'string' && tech.icon.startsWith('/') ? (
                  <img 
                    src={tech.icon} 
                    alt={`${tech.name} logo`}
                    className="w-full h-full object-contain"
                  />
                ) : typeof tech.icon === 'object' && tech.icon.light && tech.icon.dark ? (
                  <img 
                    src={actualTheme === 'dark' ? tech.icon.dark : tech.icon.light} 
                    alt={`${tech.name} logo`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-4xl">{tech.icon}</div>
                )}
              </div>
            )}
            <div className="font-medium text-center">{tech.name}</div>
            {tech.description && (
              <div className="text-xs text-center mt-1 opacity-80">{tech.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

TechStack.propTypes = {
  technologies: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.oneOfType([
        PropTypes.node,
        PropTypes.string,
        PropTypes.shape({
          light: PropTypes.string,
          dark: PropTypes.string
        })
      ]),
      description: PropTypes.string
    })
  ),
  title: PropTypes.string,
  className: PropTypes.string,
  isMobile: PropTypes.bool
};

export default TechStack;