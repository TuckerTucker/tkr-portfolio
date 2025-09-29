import React from 'react';
import {
  Terminal,
  Server,
  Database,
  Hammer,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';
import clsx from 'clsx';

// Service category type matching the contract
export type ServiceCategory = 'terminal' | 'dev-server' | 'api-service' | 'build-tool' | 'test-runner' | 'unknown';

// Category configuration as specified in the UI contract
export const categoryConfig = {
  terminal: {
    label: 'Terminal',
    icon: Terminal,
    color: '#10b981', // emerald-500
    priority: 1
  },
  'dev-server': {
    label: 'Development',
    icon: Server,
    color: '#3b82f6', // blue-500
    priority: 2
  },
  'api-service': {
    label: 'API Services',
    icon: Database,
    color: '#8b5cf6', // violet-500
    priority: 3
  },
  'build-tool': {
    label: 'Build Tools',
    icon: Hammer,
    color: '#f59e0b', // amber-500
    priority: 4
  },
  'test-runner': {
    label: 'Testing',
    icon: CheckCircle,
    color: '#06b6d4', // cyan-500
    priority: 5
  },
  unknown: {
    label: 'Other',
    icon: HelpCircle,
    color: '#6b7280', // gray-500
    priority: 6
  }
} as const;

export interface ServiceIconProps {
  category: ServiceCategory;
  size?: 'sm' | 'md' | 'lg';
  showBackground?: boolean;
  className?: string;
}

/**
 * ServiceIcon Component
 *
 * Displays category-appropriate icons for services with consistent styling.
 * Supports multiple sizes and optional background styling.
 */
export const ServiceIcon: React.FC<ServiceIconProps> = ({
  category,
  size = 'md',
  showBackground = true,
  className
}) => {
  const config = categoryConfig[category] || categoryConfig.unknown;
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const containerSizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconClass = sizeClasses[size];
  const containerClass = containerSizeClasses[size];

  if (showBackground) {
    return (
      <div
        className={clsx(
          'rounded-lg flex items-center justify-center flex-shrink-0',
          containerClass,
          className
        )}
        style={{
          backgroundColor: `${config.color}20`, // 20% opacity
          color: config.color
        }}
        title={`${config.label} service`}
      >
        <IconComponent className={iconClass} />
      </div>
    );
  }

  return (
    <div title={`${config.label} service`}>
      <IconComponent
        className={clsx(iconClass, className)}
        style={{ color: config.color }}
      />
    </div>
  );
};

export default ServiceIcon;