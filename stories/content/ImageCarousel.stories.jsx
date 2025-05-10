import React from 'react';
import ImageCarousel from '@/components/feature/image-carousel';

// Sample items for different carousel configurations
const sampleItems = [
  { type: 'image', src: 'slides/tucker/knitten.png', alt: 'Slide 1' },
  { type: 'image', src: 'slides/tucker/ramoon.png', alt: 'Slide 2' },
  { type: 'video', src: 'slides/tucker/designing_stuff.mp4', alt: 'Demo video' },
];

// Sample items including HTML slide
const mixedItems = [
  { type: 'image', src: 'slides/tucker/knitten.png', alt: 'Slide 1' },
  { 
    type: 'html', 
    component: 'TechStack', 
    props: {
      title: "Portfolio Technologies",
      technologies: [
        { name: "React", description: "UI Framework" },
        { name: "Tailwind", description: "CSS Framework" },
        { name: "Vite", description: "Build Tool" },
        { name: "Storybook", description: "Component Development" }
      ]
    },
    alt: 'Interactive tech stack' 
  },
  { type: 'video', src: 'slides/tucker/designing_stuff.mp4', alt: 'Demo video' },
];

export const Default = () => <ImageCarousel items={sampleItems} />;
Default.storyName = 'Default Carousel';

export const WithHtmlSlide = () => <ImageCarousel items={mixedItems} />;
WithHtmlSlide.storyName = 'Carousel with HTML Slide';

export default {
  title: 'Content/Image Carousel',
  component: ImageCarousel,
  argTypes: {
    items: { control: 'object' },
    className: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component: 'A carousel component that supports images, videos, and interactive HTML components.',
      },
    },
  },
};