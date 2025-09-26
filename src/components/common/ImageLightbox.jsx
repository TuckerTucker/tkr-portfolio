import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { X, ZoomIn } from 'lucide-react';

const ImageLightbox = ({ src, alt, isOpen, onClose }) => {
  console.log('ImageLightbox component, isOpen:', isOpen, 'src:', src);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when lightbox is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    console.log('ImageLightbox not rendering because isOpen is false');
    return null;
  }

  console.log('ImageLightbox rendering the modal!');

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm animate-fadeIn"
      style={{ zIndex: 9999 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-10 hover:bg-opacity-20 transition-all"
        style={{ zIndex: 10000 }}
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <X size={24} className="text-white" />
      </button>

      {/* Image container */}
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>,
    document.body
  );
};

ImageLightbox.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

// Image with zoom capability
export const ZoomableImage = ({
  src,
  alt,
  className = "",
  style = {},
  containerClassName = ""
}) => {
  const [showLightbox, setShowLightbox] = useState(false);

  console.log('ZoomableImage rendered, showLightbox:', showLightbox);

  return (
    <>
      <div className={`relative inline-block ${containerClassName}`}>
        {/* Zoom icon overlay */}
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <div className="p-1.5 rounded bg-black bg-opacity-50 backdrop-blur-sm">
            <ZoomIn size={16} className="text-white" />
          </div>
        </div>

        {/* Image with click handler */}
        <img
          src={src}
          alt={alt}
          className={`cursor-pointer transition-transform hover:scale-[1.02] ${className}`}
          style={style}
          onClick={(e) => {
            console.log('Image clicked!', src);
            e.stopPropagation();
            setShowLightbox(true);
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowLightbox(true);
            }
          }}
          aria-label={`Click to zoom ${alt || 'image'}`}
        />
      </div>

      {/* Lightbox */}
      <ImageLightbox
        src={src}
        alt={alt}
        isOpen={showLightbox}
        onClose={() => setShowLightbox(false)}
      />
    </>
  );
};

ZoomableImage.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  containerClassName: PropTypes.string
};

export default ImageLightbox;