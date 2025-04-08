import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import CardHeader from '@/components/custom/card-header';

/**
 * Mobile-specific project card component.
 * Based on .clinerules definition for mobile_project_card.
 */
const MobileProjectCard = ({
  id,
  title,
  subtitle,
  color,
  imageUrl = "/placeholder/default/thumbnail.jpg",
  onClick,
  className,
  ...props
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick({ id, title });
    }
  };

  return (
    <div
      className={cn(
        "w-full bg-white rounded-md shadow-md mb-6 overflow-hidden",
        className
      )}
      role="article"
      aria-label={`Project: ${title}`}
      onClick={handleClick}
      {...props}
    >
      <CardHeader
        title={title}
        subtitle={subtitle}
        backgroundColor={color}
        textColor="#FFFFFF"
        className="p-4 flex justify-between items-center"
      />
      <img
        src={imageUrl.replace("{id}", id)} // Replace placeholder if needed
        alt={`Preview of ${title} project`}
        className="w-full h-48 object-cover"
      />
    </div>
  );
};

MobileProjectCard.propTypes = {
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default MobileProjectCard;
