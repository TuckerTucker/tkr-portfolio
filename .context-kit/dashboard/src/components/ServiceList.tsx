import React from 'react';
import clsx from 'clsx';
import { ServiceIcon, ServiceCategory, categoryConfig } from './ServiceIcon';
import { ServiceBadge, ServiceBadge as ServiceBadgeType } from './ServiceBadge';

export interface ServiceInfo {
  serviceName: string;    // Technical identifier
  displayName: string;    // User-friendly name
  category: ServiceCategory;
  logCount: number;      // Number of logs for this service
  isActive: boolean;     // Has recent activity
  lastActivity?: Date;   // Most recent log timestamp
}

export interface ServiceListItem extends ServiceInfo {
  isSelected: boolean;
  badge?: ServiceBadgeType;
}

export interface ServiceListProps {
  services: ServiceInfo[];
  selectedServices: string[];
  onServiceToggle: (serviceName: string) => void;
  groupByCategory?: boolean;
  showInactiveServices?: boolean;
  className?: string;
}

/**
 * ServiceList Component
 *
 * Displays a list of services with enhanced UI including icons, badges, and grouping.
 * Supports category-based grouping and service selection.
 */
export const ServiceList: React.FC<ServiceListProps> = ({
  services,
  selectedServices,
  onServiceToggle,
  groupByCategory = true,
  showInactiveServices = true,
  className
}) => {
  // Filter services based on active status
  const filteredServices = showInactiveServices
    ? services
    : services.filter(service => service.isActive);

  // Convert to list items with selection state
  const serviceItems: ServiceListItem[] = filteredServices.map(service => ({
    ...service,
    isSelected: selectedServices.includes(service.serviceName),
    badge: service.isActive
      ? { type: 'active' as const, text: 'Active' }
      : { type: 'info' as const, text: 'Inactive' }
  }));

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Group services by category
  const groupedServices = React.useMemo(() => {
    if (!groupByCategory) return { all: serviceItems };

    const grouped = serviceItems.reduce((acc, service) => {
      const category = service.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(service);
      return acc;
    }, {} as Record<ServiceCategory, ServiceListItem[]>);

    // Sort categories by priority
    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      const aPriority = categoryConfig[a as ServiceCategory]?.priority ?? 999;
      const bPriority = categoryConfig[b as ServiceCategory]?.priority ?? 999;
      return aPriority - bPriority;
    });

    const result: Record<string, ServiceListItem[]> = {};
    sortedCategories.forEach(category => {
      result[category] = grouped[category as ServiceCategory];
    });

    return result;
  }, [serviceItems, groupByCategory]);

  // Render individual service item
  const renderServiceItem = (service: ServiceListItem) => (
    <div
      key={service.serviceName}
      className="service-item flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={() => onServiceToggle(service.serviceName)}
      role="listitem"
      aria-label={`${service.displayName} service, ${service.logCount} logs`}
    >
      {/* Service Icon */}
      <ServiceIcon
        category={service.category}
        size="md"
        showBackground
        className="service-icon"
      />

      {/* Service Information */}
      <div className="service-info flex-1 min-w-0">
        <div className="service-name font-medium text-gray-900 text-sm">
          {service.displayName}
        </div>
        <div className="service-meta flex items-center gap-2 text-xs text-gray-500">
          <span className="service-count font-semibold">
            {service.logCount.toLocaleString()} logs
          </span>
          {service.lastActivity && (
            <>
              <span>•</span>
              <span className="last-activity">
                {formatRelativeTime(service.lastActivity)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Service Actions */}
      <div className="service-actions flex items-center gap-2 flex-shrink-0">
        {service.badge && (
          <ServiceBadge
            type={service.badge.type}
            text={service.badge.text}
            size="sm"
          />
        )}
        <input
          type="checkbox"
          checked={service.isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onServiceToggle(service.serviceName);
          }}
          aria-label={`Select ${service.displayName}`}
          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
        />
      </div>
    </div>
  );

  // Render category group
  const renderCategoryGroup = (category: string, services: ServiceListItem[]) => {
    const categoryInfo = categoryConfig[category as ServiceCategory] || categoryConfig.unknown;

    return (
      <div key={category} className="category-group mb-6">
        <div className="category-header flex items-center gap-3 mb-3 pb-2 border-b border-gray-200">
          <ServiceIcon
            category={category as ServiceCategory}
            size="sm"
            showBackground={false}
          />
          <h3 className="font-medium text-gray-700 text-sm">
            {categoryInfo.label}
          </h3>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            {services.length}
          </span>
        </div>
        <div className="category-services space-y-1">
          {services.map(renderServiceItem)}
        </div>
      </div>
    );
  };

  if (serviceItems.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <div className="text-gray-400 mb-2">
          <ServiceIcon category="unknown" size="lg" showBackground />
        </div>
        <p className="text-gray-500 text-sm">
          {showInactiveServices ? 'No services found' : 'No active services found'}
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx('service-list', className)}
      role="list"
      aria-label="Available services"
    >
      {groupByCategory
        ? Object.entries(groupedServices).map(([category, services]) =>
            renderCategoryGroup(category, services)
          )
        : serviceItems.map(renderServiceItem)
      }
    </div>
  );
};

export default ServiceList;