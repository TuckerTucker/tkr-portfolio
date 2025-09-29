import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, ChevronDown, X } from 'lucide-react';
import clsx from 'clsx';
import { ServiceList, ServiceInfo } from './ServiceList';
import { ServiceIcon, ServiceCategory, categoryConfig } from './ServiceIcon';

export interface ServiceFilterProps {
  services: ServiceInfo[];
  selectedServices: string[];
  onServiceToggle: (serviceName: string) => void;
  onClearAll: () => void;
  onSelectAll: () => void;
}

export interface ServiceFilterState {
  searchTerm: string;
  selectedCategories: ServiceCategory[];
  sortBy: 'name' | 'activity' | 'count';
  sortDirection: 'asc' | 'desc';
  groupByCategory: boolean;
  showInactiveServices: boolean;
}

/**
 * ServiceFilter Component
 *
 * Main component that provides comprehensive service filtering with search,
 * category filtering, sorting, and grouping capabilities.
 */
export const ServiceFilter: React.FC<ServiceFilterProps> = ({
  services,
  selectedServices,
  onServiceToggle,
  onClearAll,
  onSelectAll
}) => {
  // Filter state
  const [filterState, setFilterState] = useState<ServiceFilterState>({
    searchTerm: '',
    selectedCategories: [],
    sortBy: 'name',
    sortDirection: 'asc',
    groupByCategory: true,
    showInactiveServices: true
  });

  // UI state
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Get unique categories from services
  const availableCategories = useMemo(() => {
    const categories = Array.from(new Set(services.map(s => s.category)));
    return categories.sort((a, b) => {
      const aPriority = categoryConfig[a]?.priority ?? 999;
      const bPriority = categoryConfig[b]?.priority ?? 999;
      return aPriority - bPriority;
    });
  }, [services]);

  // Filter and sort services
  const filteredServices = useMemo(() => {
    let filtered = services;

    // Apply search filter
    if (filterState.searchTerm) {
      const searchLower = filterState.searchTerm.toLowerCase();
      filtered = filtered.filter(service =>
        service.displayName.toLowerCase().includes(searchLower) ||
        service.serviceName.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (filterState.selectedCategories.length > 0) {
      filtered = filtered.filter(service =>
        filterState.selectedCategories.includes(service.category)
      );
    }

    // Apply active status filter
    if (!filterState.showInactiveServices) {
      filtered = filtered.filter(service => service.isActive);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareValue = 0;

      switch (filterState.sortBy) {
        case 'name':
          compareValue = a.displayName.localeCompare(b.displayName);
          break;
        case 'activity':
          const aTime = a.lastActivity?.getTime() ?? 0;
          const bTime = b.lastActivity?.getTime() ?? 0;
          compareValue = bTime - aTime; // Most recent first
          break;
        case 'count':
          compareValue = b.logCount - a.logCount; // Highest count first
          break;
      }

      return filterState.sortDirection === 'desc' ? -compareValue : compareValue;
    });

    return filtered;
  }, [services, filterState]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalServices = services.length;
    const filteredCount = filteredServices.length;
    const selectedCount = selectedServices.length;
    const activeCount = services.filter(s => s.isActive).length;
    const totalLogCount = services.reduce((sum, s) => sum + s.logCount, 0);

    const categoryStats = availableCategories.map(category => {
      const categoryServices = services.filter(s => s.category === category);
      return {
        category,
        count: categoryServices.length,
        logCount: categoryServices.reduce((sum, s) => sum + s.logCount, 0),
        activeCount: categoryServices.filter(s => s.isActive).length
      };
    });

    return {
      totalServices,
      filteredCount,
      selectedCount,
      activeCount,
      totalLogCount,
      categoryStats
    };
  }, [services, filteredServices, selectedServices, availableCategories]);

  // Event handlers
  const handleSearchChange = useCallback((value: string) => {
    setFilterState(prev => ({ ...prev, searchTerm: value }));
  }, []);

  const handleCategoryToggle = useCallback((category: ServiceCategory) => {
    setFilterState(prev => ({
      ...prev,
      selectedCategories: prev.selectedCategories.includes(category)
        ? prev.selectedCategories.filter(c => c !== category)
        : [...prev.selectedCategories, category]
    }));
  }, []);

  const handleSortChange = useCallback((sortBy: ServiceFilterState['sortBy']) => {
    setFilterState(prev => ({
      ...prev,
      sortBy,
      sortDirection: prev.sortBy === sortBy && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
    setShowSortOptions(false);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterState(prev => ({
      ...prev,
      searchTerm: '',
      selectedCategories: []
    }));
  }, []);

  const hasActiveFilters = filterState.searchTerm || filterState.selectedCategories.length > 0;

  return (
    <div className="service-filter-panel bg-white rounded-lg border border-gray-200 p-4">
      {/* Header with stats */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">Service Filters</h3>
          <p className="text-sm text-gray-600">
            {stats.filteredCount} of {stats.totalServices} services
            {stats.selectedCount > 0 && ` • ${stats.selectedCount} selected`}
          </p>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Clear filters
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="search"
          placeholder="Search services..."
          value={filterState.searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          aria-label="Search services"
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Category Filter */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryFilter(!showCategoryFilter)}
            className={clsx(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors',
              showCategoryFilter || filterState.selectedCategories.length > 0
                ? 'bg-blue-50 border-blue-200 text-blue-700'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            )}
          >
            <Filter className="w-4 h-4" />
            <span>
              Categories
              {filterState.selectedCategories.length > 0 && ` (${filterState.selectedCategories.length})`}
            </span>
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showCategoryFilter && 'rotate-180')} />
          </button>

          {showCategoryFilter && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-3">
                <div className="space-y-2">
                  {availableCategories.map((category) => {
                    const categoryInfo = categoryConfig[category];
                    const categoryStats = stats.categoryStats.find(s => s.category === category);
                    const isSelected = filterState.selectedCategories.includes(category);

                    return (
                      <label
                        key={category}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(category)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <ServiceIcon category={category} size="sm" showBackground={false} />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {categoryInfo.label}
                          </div>
                          <div className="text-xs text-gray-500">
                            {categoryStats?.count || 0} services • {categoryStats?.logCount || 0} logs
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="relative">
          <button
            onClick={() => setShowSortOptions(!showSortOptions)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100"
          >
            <span>Sort by {filterState.sortBy}</span>
            <ChevronDown className={clsx('w-4 h-4 transition-transform', showSortOptions && 'rotate-180')} />
          </button>

          {showSortOptions && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <div className="p-2">
                {[
                  { value: 'name' as const, label: 'Name' },
                  { value: 'activity' as const, label: 'Recent Activity' },
                  { value: 'count' as const, label: 'Log Count' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSortChange(option.value)}
                    className={clsx(
                      'w-full text-left px-3 py-2 rounded text-sm transition-colors',
                      filterState.sortBy === option.value
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    )}
                  >
                    {option.label}
                    {filterState.sortBy === option.value && (
                      <span className="ml-2 text-xs">
                        ({filterState.sortDirection === 'asc' ? '↑' : '↓'})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Group Toggle */}
        <button
          onClick={() => setFilterState(prev => ({ ...prev, groupByCategory: !prev.groupByCategory }))}
          className={clsx(
            'px-3 py-2 rounded-lg text-sm border transition-colors',
            filterState.groupByCategory
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
          )}
        >
          Group by category
        </button>

        {/* Show Inactive Toggle */}
        <button
          onClick={() => setFilterState(prev => ({ ...prev, showInactiveServices: !prev.showInactiveServices }))}
          className={clsx(
            'px-3 py-2 rounded-lg text-sm border transition-colors',
            filterState.showInactiveServices
              ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              : 'bg-amber-50 border-amber-200 text-amber-700'
          )}
        >
          {filterState.showInactiveServices ? 'Hide inactive' : 'Show inactive'}
        </button>
      </div>

      {/* Service List */}
      <ServiceList
        services={filteredServices}
        selectedServices={selectedServices}
        onServiceToggle={onServiceToggle}
        groupByCategory={filterState.groupByCategory}
        showInactiveServices={filterState.showInactiveServices}
        className="mb-4"
      />

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {stats.selectedCount} of {stats.filteredCount} selected
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onClearAll}
            disabled={stats.selectedCount === 0}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear all
          </button>
          <button
            onClick={onSelectAll}
            disabled={stats.selectedCount === stats.filteredCount}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Select all
          </button>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showCategoryFilter || showSortOptions) && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setShowCategoryFilter(false);
            setShowSortOptions(false);
          }}
        />
      )}
    </div>
  );
};

export default ServiceFilter;