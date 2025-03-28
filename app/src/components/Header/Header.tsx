import React from 'react';

/**
 * Header component props
 * @interface HeaderProps
 */
interface HeaderProps {
  /** Optional additional class names */
  className?: string;
  /** Optional resume file name */
  resumeFileName?: string;
}

/**
 * Header component that displays portfolio identification and resume access
 * 
 * Uses Tailwind CSS for styling.
 * 
 * @component
 * @example
 * ```tsx
 * <Header resumeFileName="resume.pdf" />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({ 
  className = '',
  resumeFileName = 'tucker-harley-resume.pdf' // Default from .clinerules environment
}) => {
  return (
    <header 
      className={`flex justify-between items-center p-4 ${className}`} // Use Tailwind for padding, flex, etc.
      role="banner"
      aria-label="Portfolio header"
    >
      {/* Name and Title */}
      <div>
        <h1 className="text-lg">Sean 'Tucker' Harley</h1> {/* Adjusted text size */}
        <p className="text-base italic">UX Designer</p> {/* Adjusted text size */}
      </div>
      
      {/* Resume Button */}
      <a
        href={`/${resumeFileName}`}
        className="
          px-4 py-2 border border-tucker rounded 
          text-tucker no-underline 
          transition-colors duration-200 
          hover:bg-tucker hover:text-white
        " // Tailwind classes for button styling and hover effect
        download
      >
        Resume
      </a>
    </header>
  );
};
