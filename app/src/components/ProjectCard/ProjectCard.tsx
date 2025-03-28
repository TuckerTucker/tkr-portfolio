import React from 'react';
import Image from 'next/image'; // Import next/image

/**
 * ProjectCard component props
 * @interface ProjectCardProps
 */
interface ProjectCardProps {
  /** Company name */
  company: string;
  /** Project title */
  projectTitle: string;
  /** Role in the project */
  role: string;
  /** Project preview image URL (relative to /public) */
  image?: string;
  /** Background color for the card */
  backgroundColor?: string;
  /** Optional additional class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

/**
 * ProjectCard component displays a preview of a portfolio project
 * 
 * Uses Tailwind CSS for styling and responsiveness, and next/image for optimization.
 * 
 * @component
 * @example
 * ```tsx
 * <ProjectCard
 *   company="Nutrien"
 *   projectTitle="Design System"
 *   role="UX Designer"
 *   image="/images/nutrien-card.png"
 *   backgroundColor="#8DA89C"
 * />
 * ```
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  company,
  projectTitle,
  role,
  image,
  backgroundColor = '#f3f4f6', // Default background color (gray-100)
  className = '',
  onClick,
}) => {
  return (
    <article
      style={{ backgroundColor }} // Keep dynamic background color inline
      className={`
        grid grid-cols-1 md:grid-cols-3 gap-6 p-6 cursor-pointer 
        transition-transform duration-200 ease-in-out transform 
        hover:scale-102 group ${className}
      `}
      onClick={onClick}
      role="article"
      aria-label={`${projectTitle} at ${company}`}
    >
      {/* Content Section */}
      <div className="flex flex-col gap-2 md:col-span-2">
        <p className="text-base italic text-gray-600">{company}</p>
        <h2 className="text-xl font-bold text-gray-900">{projectTitle}</h2>
        <p className="text-base italic text-gray-600">{role}</p>
      </div>

      {/* Image Section */}
      <div className="relative w-full h-full min-h-[150px] md:min-h-[100px] md:col-span-1 overflow-hidden rounded">
        {image ? (
          <Image
            src={image}
            alt={`${projectTitle} preview`}
            layout="fill" // Use fill layout for responsive container
            objectFit="cover" // Cover the container
            className="transition-transform duration-300 group-hover:scale-105" // Optional: subtle zoom on hover
          />
        ) : (
          // Placeholder if no image
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">No Image</span>
          </div>
        )}
      </div>
    </article>
  );
};
