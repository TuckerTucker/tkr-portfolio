import React from 'react';
import { cn } from "@/lib/utils";
import { useTheme } from "../../hooks/useTheme.jsx";

/**
 * Higher-order component to wrap HTML slides with theme awareness
 * This provides a consistent theming approach for all HTML slides
 */
const withSlideTheme = (WrappedComponent) => {
  const ThemedSlideComponent = (props) => {
    const { theme } = useTheme();
    
    return (
      <div 
        className={cn(
          "slide-theme-wrapper w-full h-full",
          "transition-colors duration-300",
          theme === 'dark' ? 'slide-theme-dark' : 'slide-theme-light'
        )}
        style={{
          background: 'var(--slide-bg)'
        }}>
        <WrappedComponent {...props} />
      </div>
    );
  };
  
  // Copy displayName for better debugging
  ThemedSlideComponent.displayName = `withSlideTheme(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
  
  return ThemedSlideComponent;
};

export default withSlideTheme;