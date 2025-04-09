import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

/**
 * Displays a carousel of images and videos.
 * Based on .clinerules definition for image_carousel.
 */
const ImageCarousel = ({
  items = [], // Array of { type: 'image' | 'video', src, alt }
  className,
  ...props
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative w-full bg-gray-200 overflow-hidden", className)} // Base container styles
      role="region" // Accessibility from .clinerules
      aria-label="Project screenshots" // Accessibility from .clinerules
      {...props}
    >
      <Carousel>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full aspect-video bg-black"> {/* Responsive 16:9 aspect ratio */}
                {item.type === 'video' ? (
                  <video
                    src={item.src}
                    controls
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain" // Use contain for video
                    aria-label={item.alt || `Video slide ${index + 1}`}
                  />
                ) : (
                  <img
                    src={`${import.meta.env.BASE_URL}${item.src}`}
                    alt={item.alt || `Image slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-10" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-10" />
        {/* Optional: Update dots if needed */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
            <span
              key={index}
              className="w-2 h-2 rounded-full bg-white opacity-50" // Consider active state styling
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

ImageCarousel.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['image', 'video']).isRequired,
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};

export default ImageCarousel;
