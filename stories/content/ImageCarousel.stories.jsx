import React from 'react';
import ImageCarousel from '@/components/feature/image-carousel';

// Mixed content example with image, video, and HTML slides
const mixedContentItems = [
  { type: 'image', src: 'slides/tucker/knitten.png', alt: 'Knitten design' },
  { type: 'video', src: 'slides/tucker/designing_stuff.mp4', alt: 'Design process video' },
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
  { 
    type: 'html', 
    component: 'ProcessTimeline', 
    props: {
      phases: [
        { name: 'Research', duration: '2 weeks', description: 'User interviews and analysis' },
        { name: 'Design', duration: '3 weeks', description: 'Wireframes and prototypes' },
        { name: 'Development', duration: '8 weeks', description: 'Implementation and testing' },
        { name: 'Launch', duration: '1 week', description: 'Deployment and monitoring' }
      ]
    },
    alt: 'Project timeline' 
  },
];

export const MixedContent = () => <ImageCarousel items={mixedContentItems} />;
MixedContent.storyName = 'Image, Video, and HTML Slides';

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
        component: 'A versatile carousel component that seamlessly displays images, videos, and interactive HTML components.',
      },
    },
  },
};