import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

/**
 * BeforeAfter HTML Slide Component
 * Creates an interactive slider to compare before and after designs.
 * Users can drag a divider to reveal more or less of each image.
 */
const BeforeAfter = ({
  title = "Design Comparison",
  beforeImage = "",
  afterImage = "",
  beforeLabel = "Before",
  afterLabel = "After",
  defaultPosition = 50, // Default slider position (percentage)
  className,
  isMobile, // Extract isMobile prop to prevent DOM warnings
  ...props
}) => {
  const [sliderPosition, setSliderPosition] = useState(defaultPosition);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  // Handle mouse/touch events for slider interaction
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (e) => {
      if (!isDragging.current) return;
      
      // Get mouse/touch position
      const clientX = e.type.includes('mouse') 
        ? e.clientX 
        : e.touches[0].clientX;
      
      // Get container dimensions and position
      const rect = container.getBoundingClientRect();
      const containerWidth = rect.width;
      const containerLeft = rect.left;
      
      // Calculate new position as percentage
      let newPosition = ((clientX - containerLeft) / containerWidth) * 100;
      
      // Clamp position between 0 and 100
      newPosition = Math.max(0, Math.min(100, newPosition));
      setSliderPosition(newPosition);
    };

    const handleStart = () => {
      isDragging.current = true;
    };

    const handleEnd = () => {
      isDragging.current = false;
    };

    // Add event listeners
    container.addEventListener('mousedown', handleStart);
    container.addEventListener('touchstart', handleStart);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);

    // Clean up event listeners
    return () => {
      container.removeEventListener('mousedown', handleStart);
      container.removeEventListener('touchstart', handleStart);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  return (
    <div className={cn("w-full h-full flex flex-col p-6 bg-gradient-to-r from-gray-900 to-gray-800", className)} {...props}>
      <div className="mb-4">
        <h2 className="text-2xl font-heading text-white">{title}</h2>
      </div>
      
      {/* Comparison container */}
      <div 
        ref={containerRef}
        className="relative flex-grow w-full h-full rounded-lg overflow-hidden cursor-ew-resize select-none touch-none"
      >
        {/* Before image (full width) */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url(${beforeImage})` }}
        >
          {/* Before label */}
          <div className="absolute top-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {beforeLabel}
          </div>
        </div>
        
        {/* After image (variable width based on slider) */}
        <div 
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{ 
            backgroundImage: `url(${afterImage})`,
            width: `${sliderPosition}%`,
            clipPath: `inset(0 0 0 0)`
          }}
        >
          {/* After label */}
          <div className="absolute top-4 right-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
            {afterLabel}
          </div>
        </div>
        
        {/* Slider handle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
          style={{ 
            left: `calc(${sliderPosition}% - 2px)`,
          }}
        >
          {/* Slider knob */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h8M8 12h8M8 17h8" />
            </svg>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-xs text-gray-400">
        Drag the slider to compare designs
      </div>
    </div>
  );
};

BeforeAfter.propTypes = {
  title: PropTypes.string,
  beforeImage: PropTypes.string.isRequired,
  afterImage: PropTypes.string.isRequired,
  beforeLabel: PropTypes.string,
  afterLabel: PropTypes.string,
  defaultPosition: PropTypes.number,
  className: PropTypes.string
};

export default BeforeAfter;