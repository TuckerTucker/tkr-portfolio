import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * DesignSystem HTML Slide Component
 * Showcases color palettes, typography, and component patterns in an interactive display.
 * Allows users to toggle between different aspects of the design system.
 * Enhanced with mobile-first responsive design.
 */
const DesignSystem = ({ 
  title = "Design System",
  colors = [],
  typography = [],
  components = [],
  isMobile = false, // New prop to handle mobile-specific layouts
  className,
  ...props 
}) => {
  const [activeTab, setActiveTab] = useState('colors');
  
  // Function to display color in accessible format
  const getContrastColor = (hexColor) => {
    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    
    // Calculate perceived brightness (YIQ formula)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    
    // Return black or white based on brightness
    return (yiq >= 128) ? '#000000' : '#FFFFFF';
  };

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
      <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl md:text-2xl font-heading text-white">{title}</h2>
        
        {/* Tab navigation - Stacked on mobile, side by side on tablet+ */}
        <div className="flex space-x-1 bg-gray-700 rounded-lg p-1 self-start sm:self-auto">
          <button 
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              activeTab === 'colors' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('colors')}
          >
            Colors
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              activeTab === 'typography' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('typography')}
          >
            Typography
          </button>
          <button 
            className={cn(
              "px-3 py-1 text-xs rounded-md transition-colors",
              activeTab === 'components' 
                ? "bg-blue-500 text-white" 
                : "text-gray-300 hover:text-white"
            )}
            onClick={() => setActiveTab('components')}
          >
            Components
          </button>
        </div>
      </div>
      
      {/* Content area - Allow scrolling on mobile */}
      <div className={cn(
        "flex-grow",
        isMobile ? "overflow-y-auto" : "overflow-auto"
      )}>
        {/* Colors tab */}
        {activeTab === 'colors' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {colors.map((colorGroup, groupIndex) => (
              <div key={groupIndex} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-2 md:p-3 border-b border-gray-700">
                  <h3 className="text-xs md:text-sm text-white font-medium">{colorGroup.name}</h3>
                </div>
                <div className="divide-y divide-gray-700">
                  {colorGroup.variants.map((variant, variantIndex) => {
                    const contrastColor = getContrastColor(variant.hex);
                    return (
                      <div 
                        key={variantIndex} 
                        className="flex justify-between items-center p-2 md:p-3"
                        style={{ backgroundColor: variant.hex, color: contrastColor }}
                      >
                        <span className="text-xs md:text-sm font-medium">{variant.name}</span>
                        <span className="text-xs opacity-80">{variant.hex}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Typography tab */}
        {activeTab === 'typography' && (
          <div className="space-y-6 md:space-y-8 bg-gray-800 rounded-lg p-4 md:p-6">
            {typography.map((typeGroup, groupIndex) => (
              <div key={groupIndex} className="space-y-3 md:space-y-4">
                <h3 className="text-xs md:text-sm uppercase tracking-wider text-blue-400 border-b border-gray-700 pb-2">
                  {typeGroup.name}
                </h3>
                <div className="space-y-4 md:space-y-6">
                  {typeGroup.variants.map((variant, variantIndex) => (
                    <div key={variantIndex} className="flex flex-col md:flex-row md:items-center">
                      <div className="md:w-1/4 mb-2 md:mb-0">
                        <span className="text-xs text-gray-400 block">{variant.name}</span>
                        <span className="text-xs text-gray-500">{variant.specs}</span>
                      </div>
                      <div 
                        className="md:w-3/4 text-white"
                        style={{ 
                          fontFamily: variant.fontFamily || 'inherit',
                          fontSize: variant.fontSize || 'inherit',
                          fontWeight: variant.fontWeight || 'inherit',
                          lineHeight: variant.lineHeight || 'inherit'
                        }}
                      >
                        {variant.sample}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Components tab */}
        {activeTab === 'components' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
            {components.map((component, index) => (
              <div key={index} className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-3 md:p-4 border-b border-gray-700">
                  <h3 className="text-xs md:text-sm text-white font-medium">{component.name}</h3>
                </div>
                <div className="p-3 md:p-4 bg-gray-700 min-h-[100px] md:min-h-[120px] flex items-center justify-center">
                  {component.image ? (
                    <img 
                      src={component.image} 
                      alt={`${component.name} component example`}
                      className="max-w-full max-h-[80px] md:max-h-[100px] object-contain"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs md:text-sm">No preview available</div>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <p className="text-xs text-gray-400">{component.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

DesignSystem.propTypes = {
  title: PropTypes.string,
  colors: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      variants: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          hex: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ),
  typography: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      variants: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          specs: PropTypes.string,
          fontFamily: PropTypes.string,
          fontSize: PropTypes.string,
          fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
          lineHeight: PropTypes.string,
          sample: PropTypes.string.isRequired
        })
      ).isRequired
    })
  ),
  components: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      image: PropTypes.string
    })
  ),
  isMobile: PropTypes.bool,
  className: PropTypes.string
};

export default DesignSystem;