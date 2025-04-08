import React from 'react';
import ImageCarousel from '@/components/feature/image-carousel'; // Use alias

const sampleImages = [
  { src: "/placeholder/project1/slide1.jpg", alt: "Project screenshot 1" },
  { src: "/placeholder/project1/slide2.jpg", alt: "Project screenshot 2" },
  { src: "/placeholder/project1/slide3.jpg", alt: "Project screenshot 3" },
];

export const Default = () => <ImageCarousel images={sampleImages} />;
Default.storyName = 'Default Carousel';

export const Empty = () => <ImageCarousel images={[]} />;
Empty.storyName = 'Empty Carousel (Renders Nothing)';

export const CustomStyling = () => (
  <ImageCarousel
    images={sampleImages}
    className="rounded-lg border-4 border-accent shadow-lg"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Feature Components/Image Carousel',
  component: ImageCarousel,
  argTypes: {
    images: { control: 'object' },
    className: { control: 'text' },
  },
};
