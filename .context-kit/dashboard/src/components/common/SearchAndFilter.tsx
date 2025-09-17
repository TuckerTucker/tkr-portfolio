import React, { useState } from 'react';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filterType: string) => void;
  onClearFilters: () => void;
  filterTypes: string[];
  totalItems: number;
  filteredItems: number;
  searchPlaceholder?: string;
  filterLabel?: string;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  onSearch,
  onFilter,
  onClearFilters,
  filterTypes,
  totalItems,
  filteredItems,
  searchPlaceholder = "Search...",
  filterLabel = "Type"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const filterType = e.target.value;
    setSelectedFilter(filterType);
    onFilter(filterType);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedFilter('');
    onClearFilters();
  };

  return (
    <div className="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex-1 relative">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
      </div>

      <div className="min-w-[150px]">
        <select
          value={selectedFilter}
          onChange={handleFilterChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">All {filterLabel}s</option>
          {filterTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      <div className="text-sm text-gray-500 whitespace-nowrap">
        Showing {filteredItems} of {totalItems} items
      </div>

      {(searchQuery || selectedFilter) && (
        <button 
          onClick={handleClearFilters} 
          className="px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};