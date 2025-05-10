# HTML Slides Implementation Plan

## Overview
This document outlines the plan to extend the portfolio's image carousel to support HTML slides with responsive, interactive content alongside existing image and video slides.

## Implementation Steps

1. **Create HTML Slide Component Registry**
   - Create `src/components/html-slides/index.js`
   - Define component mapping system for dynamic loading

2. **Implement Example HTML Slide Component**
   - Create `src/components/html-slides/TechStack.jsx`
   - Build responsive, interactive tech stack visualization

3. **Extend ImageCarousel Component**
   - Update to support "html" type slides
   - Implement dynamic component loading with Suspense

4. **Update PropTypes and Documentation**
   - Add new types for HTML slides
   - Update component documentation

5. **Add Example HTML Slide to Projects**
   - Update projects.json with example HTML slide for TechStack
   - Include required props for the tech stack component

6. **Create Storybook Story**
   - Add story to test HTML slide in isolation
   - Create story for carousel with mixed slide types

7. **Test Accessibility and Performance**
   - Verify keyboard navigation
   - Test load times and rendering performance

8. **Add Fallback for Missing Components**
   - Ensure graceful handling of invalid component references

9. **Implement Lazy Loading**
   - Add React.lazy for HTML slide components
   - Add suspense handling in the carousel

10. **Document Usage Guidelines**
    - Create documentation for adding new HTML slides

## Example Component: TechStack

```jsx
// src/components/html-slides/TechStack.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

const TechStack = ({ 
  technologies = [], 
  title = "Technology Stack",
  className,
  ...props 
}) => {
  return (
    <div className={cn("w-full h-full flex flex-col p-6", className)} {...props}>
      <h2 className="text-2xl font-heading mb-4">{title}</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 flex-grow">
        {technologies.map((tech, index) => (
          <div 
            key={index}
            className="flex flex-col items-center justify-center p-3 bg-white/10 backdrop-blur-sm rounded-lg hover:scale-105 transition-transform"
          >
            {tech.icon && (
              <div className="text-4xl mb-2">
                {tech.icon}
              </div>
            )}
            <div className="font-medium text-center">{tech.name}</div>
            {tech.description && (
              <div className="text-xs text-center mt-1 opacity-80">{tech.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

TechStack.propTypes = {
  technologies: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      icon: PropTypes.node,
      description: PropTypes.string
    })
  ),
  title: PropTypes.string,
  className: PropTypes.string
};

export default TechStack;
```

## Example in Projects JSON

```json
{
  "id": "agentic_ai_kanban",
  "title": "Agentic AI Kanban",
  "color": "#FF8800",
  "subtitle": "Personal",
  "logoUrl": "taskboard.svg",
  "description": "This is a short project description...",
  "bullets": ["Bullet Point One", "Bullet Point Two", "Bullet Point Three"],
  "slides": [
    { 
      "type": "html", 
      "component": "TechStack", 
      "props": {
        "title": "Technologies Used",
        "technologies": [
          { "name": "React", "description": "Frontend Framework" },
          { "name": "Node.js", "description": "Backend Server" },
          { "name": "MongoDB", "description": "Database" },
          { "name": "Express", "description": "Web Framework" },
          { "name": "Socket.IO", "description": "Real-time Updates" },
          { "name": "Tailwind CSS", "description": "Styling" }
        ]
      },
      "alt": "Technology stack visualization for Agentic AI Kanban" 
    },
    { "type": "image", "src": "slides/taskboard/beached_balls.png", "alt": "Kanban Slide 1" },
    { "type": "image", "src": "slides/taskboard/ramoon.png", "alt": "Kanban Demo Video" }
  ]
}
```

## ImageCarousel Component Updates

```jsx
// In src/components/feature/image-carousel.jsx
import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";
import htmlSlideComponents from '@/components/html-slides';

// Dynamic component loader for HTML slides
const DynamicHtmlSlide = ({ component, props, alt }) => {
  const Component = htmlSlideComponents[component];
  
  if (!Component) {
    return (
      <div className="w-full h-full flex items-center justify-center text-red-500">
        Component "{component}" not found
      </div>
    );
  }
  
  return <Component {...props} aria-label={alt} />;
};

// Update the carousel to render HTML slides
const ImageCarousel = ({ items = [], className, ...props }) => {
  // Existing implementation...
  
  return (
    <div className={cn("relative w-full bg-gray-200 overflow-hidden", className)} {...props}>
      <Carousel>
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={index}>
              <div className="relative w-full aspect-video bg-black">
                {item.type === 'video' ? (
                  <video src={item.src} controls muted loop playsInline className="w-full h-full object-contain" aria-label={item.alt || `Video slide ${index + 1}`} />
                ) : item.type === 'html' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white">
                    <Suspense fallback={<div className="text-white">Loading component...</div>}>
                      <DynamicHtmlSlide 
                        component={item.component} 
                        props={item.props} 
                        alt={item.alt || `HTML slide ${index + 1}`} 
                      />
                    </Suspense>
                  </div>
                ) : (
                  <img src={`${import.meta.env.BASE_URL}${item.src}`} alt={item.alt || `Image slide ${index + 1}`} className="w-full h-full object-cover" />
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Existing navigation controls... */}
      </Carousel>
    </div>
  );
};

// Update PropTypes
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
```

## Benefits

1. **Enhanced Interactivity**: Present complex interactive elements like timelines, graphs, and demos
2. **Responsive Design**: Components adapt to screen sizes while maintaining carousel aspect ratio
3. **Consistent Styling**: Components integrate with existing design system
4. **Developer Experience**: Easy to add new HTML slide types to the registry
5. **Performance**: Lazy loading prevents large HTML slides from impacting initial load time

## Usage Guidelines

When creating new HTML slide components:

1. Register the component in `src/components/html-slides/index.js`
2. Ensure the component supports responsive layouts
3. Implement appropriate keyboard navigation for accessibility
4. Add PropTypes validation for all props
5. Create a Storybook story to demonstrate and test the component
6. Use the flex-grow pattern to fill available space appropriately