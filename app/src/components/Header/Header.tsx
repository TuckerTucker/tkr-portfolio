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

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
  },
  title: {
    fontSize: '1.125rem',
    lineHeight: '1.75rem',
  },
  subtitle: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontStyle: 'italic',
  },
  resume: {
    padding: '0.5rem 1rem',
    border: '1px solid #2C2C2C',
    borderRadius: '0.375rem',
    color: '#2C2C2C',
    textDecoration: 'none',
    transition: 'background-color 0.2s, color 0.2s',
  },
  resumeHover: {
    backgroundColor: '#2C2C2C',
    color: 'white',
  }
};

/**
 * Header component that displays portfolio identification and resume access
 * 
 * @component
 * @example
 * ```tsx
 * <Header resumeFileName="resume.pdf" />
 * ```
 */
export const Header: React.FC<HeaderProps> = ({ 
  className = '',
  resumeFileName = 'tucker-harley-resume.pdf'
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <header 
      style={styles.header}
      role="banner"
      aria-label="Portfolio header"
    >
      <div>
        <h1 style={styles.title}>Sean &apos;Tucker&apos; Harley</h1>
        <p style={styles.subtitle}>UX Designer</p>
      </div>
      
      <a
        href={`/${resumeFileName}`}
        style={{
          ...styles.resume,
          ...(isHovered ? styles.resumeHover : {})
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        download
      >
        Resume
      </a>
    </header>
  );
};
