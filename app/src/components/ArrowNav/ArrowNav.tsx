'use client';

import React from 'react';

/**
 * ArrowNav component props
 * @interface ArrowNavProps
 */
interface ArrowNavProps {
  /** Handler for navigating to the previous step */
  onPrevious: () => void;
  /** Handler for navigating to the next step */
  onNext: () => void;
  /** Optional additional class names */
  className?: string;
}

/**
 * ArrowNav component provides previous/next step navigation arrows
 * 
 * Uses Tailwind CSS for styling and responsiveness.
 * 
 * @component
 * @example
 * ```tsx
 * <ArrowNav onPrevious={handlePrev} onNext={handleNext} />
 * ```
 */
export const ArrowNav: React.FC<ArrowNavProps> = ({
  onPrevious,
  onNext,
  className = '',
}) => {
  return (
    // Container is fixed, centered vertically, spans width, and allows clicks to pass through
    <div className={`fixed top-1/2 left-0 right-0 w-full -translate-y-1/2 flex justify-between px-4 pointer-events-none ${className}`}>
      {/* Previous Button */}
      <button
        className="
          bg-white/70 border border-gray-200 rounded-full 
          w-10 h-10 flex items-center justify-center 
          cursor-pointer pointer-events-auto 
          transition-colors hover:bg-gray-100/90
        "
        onClick={onPrevious}
        aria-label="Previous step"
      >
        {/* Left Arrow SVG */}
        <svg className="w-6 h-6 stroke-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* Next Button */}
      <button
        className="
          bg-white/70 border border-gray-200 rounded-full 
          w-10 h-10 flex items-center justify-center 
          cursor-pointer pointer-events-auto 
          transition-colors hover:bg-gray-100/90
        "
        onClick={onNext}
        aria-label="Next step"
      >
        {/* Right Arrow SVG */}
        <svg className="w-6 h-6 stroke-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
};
