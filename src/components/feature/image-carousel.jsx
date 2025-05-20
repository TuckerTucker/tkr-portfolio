import React, { Suspense, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import htmlSlideComponents from '@/components/html-slides';

/**
 * Dynamic HTML Slide Component Loader
 * Loads the appropriate component from the registry and handles missing components
 */
const DynamicHtmlSlide = ({ component, props, alt, isMobile }) => {
  const Component = htmlSlideComponents[component];
  
  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Component "{component}" not found
      </div>
    );
  }
  
  return <Component {...props} isMobile={isMobile} aria-label={alt} />;
};

DynamicHtmlSlide.propTypes = {
  component: PropTypes.string.isRequired,
  props: PropTypes.object,
  alt: PropTypes.string,
  isMobile: PropTypes.bool
};

/**
 * Displays a carousel of images, videos, and HTML components.
 * Based on .clinerules definition for image_carousel with HTML extension.
 * Enhanced with mobile support for vertical scrolling with HTML slides.
 */
const ImageCarousel = ({
  items = [], // Array of { type: 'image' | 'video' | 'html', src/component, alt/props }
  className,
  ...props
}) => {
  const [isMobile, setIsMobile] = useState(false);

  // Check if the screen is mobile-sized
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is the standard md breakpoint
    };
    
    checkMobile(); // Check on initial render
    window.addEventListener('resize', checkMobile); // Check on resize
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("relative w-full bg-gray-200 dark:bg-gray-800 overflow-hidden", className)}
      role="region"
      aria-label="Project content showcase"
      {...props}
    >
      <Carousel>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full bg-black">
                {/* Use aspect-video for images/videos but allow HTML slides to have variable height on mobile */}
                <div className={cn(
                  "w-full",
                  item.type !== 'html' || !isMobile ? "aspect-video" : "min-h-[400px]" // Min height for HTML slides on mobile
                )}>
                  {item.type === 'video' ? (
                    <video
                      src={item.src}
                      controls
                      muted
                      loop
                      playsInline
                      className="w-full h-full object-contain"
                      aria-label={item.alt || `Video slide ${index + 1}`}
                    />
                  ) : item.type === 'html' ? (
                    <div className={cn(
                      "w-full",
                      // On mobile, allow HTML slides to expand vertically with scrolling
                      isMobile ? "overflow-y-auto max-h-[80vh]" : "h-full flex items-center justify-center"
                    )}>
                      <Suspense fallback={<div className="text-white p-4">Loading component...</div>}>
                        <DynamicHtmlSlide 
                          component={item.component} 
                          props={item.props} 
                          alt={item.alt || `HTML slide ${index + 1}`}
                          isMobile={isMobile}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    <img
                      src={`${import.meta.env.BASE_URL}${item.src}`}
                      alt={item.alt || `Image slide ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Show navigation controls with enhanced mobile positioning */}
        <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-10 sm:block" />
        <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors duration-150 z-10 sm:block" />
        
        {/* Carousel indicators/dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {items.map((_, index) => (
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
  items: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['image', 'video', 'html']).isRequired,
      src: PropTypes.string,
      component: PropTypes.string,
      props: PropTypes.object,
      alt: PropTypes.string,
    })
  ),
  className: PropTypes.string,
};

export default ImageCarousel;