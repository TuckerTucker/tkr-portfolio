export interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filterType: string) => void;
  onClearFilters: () => void;
  filterTypes: string[];
  totalItems: number;
  filteredItems: number;
  searchPlaceholder?: string;
  filterLabel?: string;
}

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterControlsProps {
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

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}