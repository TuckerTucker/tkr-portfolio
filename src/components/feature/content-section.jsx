import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import Description from '@/components/feature/description';
import BulletListContainer from '@/components/feature/bullet-list-container';

/**
 * Content section component combining description and bullet list.
 * Based on .clinerules definition for content_section.
 */
const ContentSection = ({
  title,
  description,
  bullets = [],
  className,
  descriptionClassName,
  bulletListClassName,
  ...props
}) => {
  return (
    <div
      className={cn("bg-white p-6 grid gap-6 md:grid-cols-2", className)} // Responsive grid from .clinerules
      role="region"
      aria-label="Project details"
      {...props}
    >
      <Description
        title={title}
        description={description}
        className={descriptionClassName}
      />
      <BulletListContainer
        items={bullets}
        className={bulletListClassName}
      />
    </div>
  );
};

ContentSection.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  bullets: PropTypes.arrayOf(PropTypes.string),
  className: PropTypes.string,
  descriptionClassName: PropTypes.string,
  bulletListClassName: PropTypes.string,
};

export default ContentSection;
