import React from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterControlsProps {
  filters: {
    [key: string]: {
      value: string;
      onChange: (value: string) => void;
      options: FilterOption[];
      label: string;
    };
  };
  className?: string;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  filters,
  className = ''
}) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {Object.entries(filters).map(([key, filter]) => (
        <div key={key} className="min-w-[120px]">
          <label htmlFor={`filter-${key}`} className="block text-sm font-medium text-gray-700 mb-1">
            {filter.label}:
          </label>
          <select 
            id={`filter-${key}`}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            {filter.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};