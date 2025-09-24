import React, { useState } from 'react';
import PropTypes from 'prop-types';

const InteractiveCards = ({
  title = "",
  items = [],
  className = ""
}) => {
  const [selectedId, setSelectedId] = useState(items[0]?.id || null);
  const selectedItem = items.find(item => item.id === selectedId);

  return (
    <div className={`flex flex-col h-full p-6 md:p-8 ${className}`}>
      {title && (
        <h2 className="font-heading text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--slide-title)' }}>
          {title}
        </h2>
      )}

      {/* Icon Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`
                flex flex-col items-center justify-center p-4 rounded-lg
                transition-all duration-200 cursor-pointer
                hover:scale-[1.02] active:scale-[0.98]
                ${isSelected
                  ? 'ring-2'
                  : 'ring-1 ring-opacity-30'
                }
              `}
              style={{
                backgroundColor: 'var(--slide-card-bg)',
                borderColor: 'var(--slide-card-border)',
                ringColor: isSelected ? 'var(--slide-card-border)' : 'var(--slide-text)',
                ...(isSelected && {
                  backgroundColor: 'var(--slide-card-bg)',
                  filter: 'brightness(1.05)'
                })
              }}
              aria-pressed={isSelected}
              aria-label={`Select ${item.label}`}
            >
              {/* Icon */}
              {item.icon && (
                <div className="text-4xl mb-2">
                  {typeof item.icon === 'string' && item.icon.startsWith('/') ? (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
              )}

              {/* Label */}
              <div
                className="font-medium text-sm md:text-base text-center"
                style={{ color: 'var(--slide-text)' }}
              >
                {item.label}
              </div>

              {/* Selected indicator */}
              {isSelected && (
                <div
                  className="h-1 w-full mt-2 rounded-full"
                  style={{ backgroundColor: 'var(--slide-card-border)' }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div
        className="flex-1 p-6 rounded-lg overflow-y-auto"
        style={{
          backgroundColor: 'var(--slide-card-bg)',
          border: '1px solid var(--slide-card-border)'
        }}
      >
        {selectedItem ? (
          <div className="space-y-4">
            {/* Optional subtitle */}
            {selectedItem.subtitle && (
              <h3
                className="font-semibold text-lg md:text-xl"
                style={{ color: 'var(--slide-title)' }}
              >
                {selectedItem.subtitle}
              </h3>
            )}

            {/* Main content */}
            <div
              className="text-base md:text-lg leading-relaxed whitespace-pre-wrap"
              style={{ color: 'var(--slide-text)' }}
            >
              {selectedItem.content}
            </div>

            {/* Optional bullet points */}
            {selectedItem.bullets && selectedItem.bullets.length > 0 && (
              <ul className="space-y-2 mt-4">
                {selectedItem.bullets.map((bullet, index) => (
                  <li
                    key={index}
                    className="flex items-start"
                    style={{ color: 'var(--slide-text)' }}
                  >
                    <span className="mr-2 mt-1">•</span>
                    <span className="text-sm md:text-base">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div
            className="text-center opacity-60"
            style={{ color: 'var(--slide-text)' }}
          >
            Select an item above to view details
          </div>
        )}
      </div>
    </div>
  );
};

InteractiveCards.propTypes = {
  title: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    content: PropTypes.string.isRequired,
    bullets: PropTypes.arrayOf(PropTypes.string)
  })),
  className: PropTypes.string
};

export default InteractiveCards;