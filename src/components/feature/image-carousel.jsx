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
 * Displays a carousel of images.
 * Based on .clinerules definition for image_carousel.
 */
const ImageCarousel = ({
  images = [], // Array of { src, alt }
  className,
  ...props
}) => {
  if (!images || images.length === 0) {
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
          {images.map((img, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full h-[300px] md:h-[300px] sm:h-[200px]">
                <img
                  src={img.src}
                  alt={img.alt || `Slide ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <span
              key={index}
              className="w-2 h-2 rounded-full bg-white opacity-50"
            />
          ))}
        </div>
      </Carousel>
    </div>
  );
};

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string.isRequired,
      alt: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};

export default ImageCarousel;
