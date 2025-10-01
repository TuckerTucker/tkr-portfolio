import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ZoomableImage } from '../common/ImageLightbox';
import DynamicIcon from '../ui/DynamicIcon';

const InteractiveCards = ({
  title = "",
  subtitle = "",
  items = [],
  cards = [], // Support both 'items' and 'cards' prop names
  className = ""
}) => {
  // Use items or cards, whichever is provided
  const cardItems = items.length > 0 ? items : cards;

  // Ensure each item has an ID
  const normalizedItems = cardItems.map((item, index) => ({
    ...item,
    id: item.id || `card-${index}`
  }));

  const [selectedId, setSelectedId] = useState(normalizedItems[0]?.id || null);
  const selectedItem = normalizedItems.find(item => item.id === selectedId);

  useEffect(() => {
    // console.log('InteractiveCards mounted, ZoomableImage imported:', ZoomableImage);
  }, []);

  // Show message if no items
  if (normalizedItems.length === 0) {
    return (
      <div className={`flex items-center justify-center h-full p-6 md:p-8 ${className}`}>
        <div className="text-center" style={{ color: 'var(--slide-text)', opacity: 0.6 }}>
          <p>No cards available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full p-6 md:p-8 ${className}`}>
      {/* Header with title and subtitle */}
      <div className="mb-6">
        {title && (
          <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--slide-title)' }}>
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-base md:text-lg" style={{ color: 'var(--slide-text)', opacity: 0.8 }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Icon Cards - Horizontal Layout */}
      <div className="flex flex-wrap gap-3 mb-6">
        {normalizedItems.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`
                flex flex-row items-center justify-start px-4 py-3 rounded-lg
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
              {/* Icon on Left */}
              {item.icon && (
                <div className="mr-3">
                  {typeof item.icon === 'string' && item.icon.startsWith('/') ? (
                    <img
                      src={item.icon}
                      alt={`${item.label} icon`}
                      className="w-6 h-6 object-contain"
                    />
                  ) : (
                    <DynamicIcon
                      name={item.icon}
                      size={24}
                      style={{ color: 'var(--slide-text)' }}
                      ariaLabel={`${item.label} icon`}
                    />
                  )}
                </div>
              )}

              {/* Label on Right */}
              <div
                className="font-medium text-sm md:text-base"
                style={{ color: 'var(--slide-text)' }}
              >
                {item.label}
              </div>
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
          <div className={`${selectedItem.image ? 'flex flex-col md:flex-row gap-4 md:gap-6 items-start' : 'space-y-4'}`}>
            {/* Image - Left Side */}
            {selectedItem.image && selectedItem.imagePosition !== 'right' && (
              <div className="flex-shrink-0 w-full md:w-auto self-center md:self-start">
                <ZoomableImage
                  src={`${import.meta.env.BASE_URL}${selectedItem.image}`}
                  alt={selectedItem.imageAlt || `${selectedItem.label} illustration`}
                  className="w-auto h-auto max-h-64 md:max-h-96 lg:max-h-96 object-contain rounded-lg mx-auto md:mx-0"
                  style={{
                    border: '1px solid var(--slide-card-border)',
                    maxWidth: '100%'
                  }}
                />
              </div>
            )}

            {/* Content Area */}
            <div className={`${selectedItem.image ? 'flex-1' : ''} space-y-4`}>
              {/* Optional card title */}
              {(selectedItem.title || selectedItem.subtitle) && (
                <h3
                  className="font-semibold text-lg md:text-xl"
                  style={{ color: 'var(--slide-title)' }}
                >
                  {selectedItem.title || selectedItem.subtitle}
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

            {/* Image - Right Side */}
            {selectedItem.image && selectedItem.imagePosition === 'right' && (
              <div className="flex-shrink-0 w-full md:w-auto self-center md:self-start">
                <ZoomableImage
                  src={`${import.meta.env.BASE_URL}${selectedItem.image}`}
                  alt={selectedItem.imageAlt || `${selectedItem.label} illustration`}
                  className="w-auto h-auto max-h-64 md:max-h-96 lg:max-h-96 object-contain rounded-lg mx-auto md:mx-0"
                  style={{
                    border: '1px solid var(--slide-card-border)',
                    maxWidth: '100%'
                  }}
                />
              </div>
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
  subtitle: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    icon: PropTypes.string,
    label: PropTypes.string.isRequired,
    subtitle: PropTypes.string,
    title: PropTypes.string, // Support both 'subtitle' and 'title' for card title
    content: PropTypes.string.isRequired,
    bullets: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string, // Path to image (any aspect ratio)
    imagePosition: PropTypes.oneOf(['left', 'right']), // Image position (default: left)
    imageAlt: PropTypes.string, // Alt text for image
    position: PropTypes.string // Alternative to imagePosition
  })),
  cards: PropTypes.array, // Support both 'items' and 'cards' prop names
  className: PropTypes.string
};

export default InteractiveCards;