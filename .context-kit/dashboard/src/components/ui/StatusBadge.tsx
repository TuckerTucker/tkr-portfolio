import { ServiceStatus } from '../../types/common';

export interface StatusBadgeProps {
  status: ServiceStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  
  const statusConfig = {
    healthy: {
      classes: 'bg-green-100 text-green-800',
      label: 'Healthy',
      icon: '✓'
    },
    degraded: {
      classes: 'bg-yellow-100 text-yellow-800',
      label: 'Degraded',
      icon: '⚠'
    },
    warning: {
      classes: 'bg-orange-100 text-orange-800',
      label: 'Warning',
      icon: '!'
    },
    critical: {
      classes: 'bg-red-100 text-red-800',
      label: 'Critical',
      icon: '✕'
    },
    offline: {
      classes: 'bg-gray-100 text-gray-800',
      label: 'Offline',
      icon: '●'
    }
  };

  const config = statusConfig[status];

  return (
    <span className={`${baseClasses} ${config.classes} ${className || ''}`}>
      <span className="mr-1" aria-hidden="true">
        {config.icon}
      </span>
      {config.label}
    </span>
  );
}