import React from 'react';

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
  /** Project preview image URL */
  image?: string;
  /** Background color for the card */
  backgroundColor?: string;
  /** Optional additional class names */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

const styles = {
  card: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    padding: '1.5rem',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  company: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: '#4B5563',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#111827',
  },
  role: {
    fontSize: '1rem',
    fontStyle: 'italic',
    color: '#4B5563',
  },
  imageContainer: {
    position: 'relative' as const,
    width: '100%',
    height: '100%',
    minHeight: '200px',
  },
  image: {
    objectFit: 'cover' as const,
    width: '100%',
    height: '100%',
    borderRadius: '0.375rem',
  },
};

/**
 * ProjectCard component displays a preview of a portfolio project
 * 
 * @component
 * @example
 * ```tsx
 * <ProjectCard
 *   company="Nutrien"
 *   projectTitle="Design System"
 *   role="UX Designer"
 *   image="/projects/nutrien.jpg"
 *   backgroundColor="#9ad441"
 * />
 * ```
 */
export const ProjectCard: React.FC<ProjectCardProps> = ({
  company,
  projectTitle,
  role,
  image,
  backgroundColor,
  className = '',
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <article
      style={{
        ...styles.card,
        backgroundColor,
        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
      }}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="article"
      aria-label={`${projectTitle} at ${company}`}
    >
      <div style={styles.content}>
        <p style={styles.company}>{company}</p>
        <h2 style={styles.title}>{projectTitle}</h2>
        <p style={styles.role}>{role}</p>
      </div>

      {image && (
        <div style={styles.imageContainer}>
          <img
            src={image}
            alt={`${projectTitle} preview`}
            style={styles.image}
          />
        </div>
      )}
    </article>
  );
};
