import React from 'react';
import PropTypes from 'prop-types';
import * as LucideIcons from 'lucide-react';
import { getIconName } from '@/config/iconMapping';

/**
 * DynamicIcon - Renders Lucide icons dynamically by name or emoji mapping
 * Provides consistent sizing, styling, and accessibility across the app
 *
 * @param {string} name - Lucide icon name (e.g., 'Search') or emoji (e.g., '🔍')
 * @param {number|string} size - Icon size in pixels or CSS value
 * @param {string} className - Additional CSS classes
 * @param {string} color - Icon color (uses CSS currentColor by default)
 * @param {number} strokeWidth - Icon stroke width
 * @param {string} ariaLabel - Accessibility label
 */
const DynamicIcon = ({
  name,
  size = 20,
  className = '',
  color,
  strokeWidth = 2,
  ariaLabel,
  ...props
}) => {
  // Convert emoji to icon name if needed
  const iconName = name.length === 1 || name.length === 2 ? getIconName(name) : name;

  // Get the icon component from Lucide
  const IconComponent = LucideIcons[iconName];

  // Fallback to Circle if icon not found
  if (!IconComponent) {
    console.warn(`Icon "${iconName}" not found in Lucide icons, using Circle as fallback`);
    const FallbackIcon = LucideIcons.Circle;
    return (
      <FallbackIcon
        size={size}
        className={className}
        color={color}
        strokeWidth={strokeWidth}
        aria-label={ariaLabel || `${iconName} icon`}
        {...props}
      />
    );
  }

  return (
    <IconComponent
      size={size}
      className={className}
      color={color}
      strokeWidth={strokeWidth}
      aria-label={ariaLabel || `${iconName} icon`}
      {...props}
    />
  );
};

DynamicIcon.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  className: PropTypes.string,
  color: PropTypes.string,
  strokeWidth: PropTypes.number,
  ariaLabel: PropTypes.string,
};

export default DynamicIcon;