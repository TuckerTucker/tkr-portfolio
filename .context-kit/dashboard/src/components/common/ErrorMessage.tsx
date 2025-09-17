import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Error',
  message,
  details,
  onRetry,
  retryLabel = 'Retry',
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <span className="text-red-500 text-xl" role="img" aria-label="Error">
            ⚠️
          </span>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-lg font-medium text-red-800">
            {title}
          </h3>
          <p className="mt-2 text-red-700">
            {message}
          </p>
          {details && (
            <details className="mt-2">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Show details
              </summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                {details}
              </pre>
            </details>
          )}
          {onRetry && (
            <div className="mt-4">
              <button
                onClick={onRetry}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                {retryLabel}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};