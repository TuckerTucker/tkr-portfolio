import React from 'react';
import TechStack from '@/components/html-slides/TechStack';
import ImageCarousel from '@/components/feature/image-carousel';

export default {
  title: 'Content/HTML Slides',
  component: TechStack,
  parameters: {
    layout: 'centered',
  },
};

// Example tech stack data
const exampleTechStack = [
  { name: "React", description: "UI Framework" },
  { name: "Node.js", description: "Backend" },
  { name: "MongoDB", description: "Database" },
  { name: "Express", description: "Web Framework" },
  { name: "GraphQL", description: "API Layer" },
  { name: "Tailwind", description: "CSS Framework" }
];

// TechStack component in isolation
export const TechStackComponent = () => (
  <div className="max-w-xl mx-auto bg-gray-800 text-white aspect-video p-4">
    <TechStack 
      title="Example Tech Stack" 
      technologies={exampleTechStack} 
    />
  </div>
);

// TechStack in the carousel
export const HtmlSlideInCarousel = () => (
  <div className="max-w-3xl mx-auto">
    <ImageCarousel 
      items={[
        { 
          type: "html", 
          component: "TechStack", 
          props: {
            title: "Example Tech Stack",
            technologies: exampleTechStack
          },
          alt: "Tech stack example" 
        },
        { type: "image", src: "slides/tucker/beached_balls.png", alt: "Example image" }
      ]} 
    />
  </div>
);

// Mixed content carousel (image, video, HTML)
export const MixedContentCarousel = () => (
  <div className="max-w-3xl mx-auto">
    <ImageCarousel 
      items={[
        { type: "image", src: "slides/tucker/beached_balls.png", alt: "Image example" },
        { 
          type: "html", 
          component: "TechStack", 
          props: {
            title: "Interactive Component",
            technologies: exampleTechStack
          },
          alt: "Tech stack example" 
        },
        { type: "video", src: "slides/tucker/designing_stuff.mp4", alt: "Video example" }
      ]} 
    />
  </div>
);

// Responsive testing story
export const ResponsiveTechStack = () => (
  <div className="flex flex-col gap-4">
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Desktop (large):</h3>
      <div className="max-w-4xl mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Desktop View" technologies={exampleTechStack} />
      </div>
    </div>
    
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Tablet (medium):</h3>
      <div className="max-w-md mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Tablet View" technologies={exampleTechStack} />
      </div>
    </div>
    
    <div className="w-full">
      <h3 className="text-sm font-medium mb-2">Mobile (small):</h3>
      <div className="max-w-xs mx-auto bg-gray-800 text-white aspect-video">
        <TechStack title="Mobile View" technologies={exampleTechStack} />
      </div>
    </div>
  </div>
);