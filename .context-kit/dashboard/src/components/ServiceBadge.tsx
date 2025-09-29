import React from 'react';
import clsx from 'clsx';

export interface ServiceBadge {
  type: 'active' | 'error' | 'warning' | 'info';
  text: string;
  color?: string;
}

export interface ServiceBadgeProps extends ServiceBadge {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * ServiceBadge Component
 *
 * Displays status badges for services with consistent styling.
 * Supports different badge types, sizes, and custom colors.
 */
export const ServiceBadge: React.FC<ServiceBadgeProps> = ({
  type,
  text,
  color,
  size = 'sm',
  className
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const typeClasses = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  const badgeClasses = clsx(
    'inline-flex items-center gap-1.5 rounded-full font-medium border',
    sizeClasses[size],
    typeClasses[type],
    className
  );

  // Custom style object for custom colors
  const customStyle = color ? {
    backgroundColor: `${color}20`, // 20% opacity background
    color: color,
    borderColor: `${color}40`, // 40% opacity border
  } : undefined;

  // Indicator dot for visual status
  const indicatorClasses = clsx(
    'w-1.5 h-1.5 rounded-full',
    {
      'bg-emerald-600': type === 'active' && !color,
      'bg-red-600': type === 'error' && !color,
      'bg-amber-600': type === 'warning' && !color,
      'bg-blue-600': type === 'info' && !color,
    }
  );

  const indicatorStyle = color ? { backgroundColor: color } : undefined;

  return (
    <span
      className={badgeClasses}
      style={customStyle}
      title={`${type.charAt(0).toUpperCase() + type.slice(1)}: ${text}`}
    >
      <span
        className={indicatorClasses}
        style={indicatorStyle}
      />
      {text}
    </span>
  );
};

export default ServiceBadge;