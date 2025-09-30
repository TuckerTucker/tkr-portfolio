import React from "react";
import PropTypes from "prop-types";

const ProjectIntro = ({
  title,
  description,
  bulletPoints = [],
  image,
  colorScheme = "default",
  className = ""
}) => {
  // Choose image based on colorScheme if no specific image provided
  const getDefaultImage = () => {
    switch (colorScheme) {
      case "kanban":
        return `${import.meta.env.BASE_URL}images/taskboard/screenshot.png`;
      case "contextkit":
        return `${import.meta.env.BASE_URL}images/context-kit/screenshot.png`;
      default:
        return `${import.meta.env.BASE_URL}images/example-310x310.png`;
    }
  };

  const imageSource = image || getDefaultImage();

  return (
    <div className={`flex flex-col md:flex-row gap-6 md:gap-8 p-6 md:p-8 h-full ${className}`}>
      <div className="flex-1 md:flex-[1.2] min-h-[300px] md:min-h-[400px]">
        <img
          src={imageSource}
          alt={`${title} project screenshot`}
          className="w-full h-full object-contain rounded-lg"
        />
      </div>

      <div className="flex-1 flex flex-col justify-between p-6 rounded-lg" style={{ backgroundColor: 'var(--slide-card-bg)', border: '1px solid var(--slide-card-border)' }}>
        <div>
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 md:mb-6" style={{ color: 'var(--slide-title)' }}>
            {title}
          </h2>

          <div className="space-y-4 text-base md:text-lg leading-relaxed" style={{ color: 'var(--slide-text)' }}>
            {description.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {bulletPoints && bulletPoints.length > 0 && (
            <div className="mt-6">
              <ul className="space-y-2 text-sm md:text-base" style={{ color: 'var(--slide-text)' }}>
                {bulletPoints.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-lg mt-0.5" style={{ color: 'var(--slide-accent)' }}>•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

ProjectIntro.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  bulletPoints: PropTypes.arrayOf(PropTypes.string),
  image: PropTypes.string,
  colorScheme: PropTypes.oneOf(["default", "kanban", "contextkit"]),
  className: PropTypes.string,
};

export default ProjectIntro;