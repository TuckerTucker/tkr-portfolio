import React from 'react';
import ImageCarousel from '@/components/feature/image-carousel';

const sampleItems = [
  { type: 'image', src: 'slides/tucker/knitten.png', alt: 'Slide 1' },
  { type: 'image', src: 'slides/tucker/ramoon.png', alt: 'Slide 2' },
  { type: 'video', src: 'slides/tucker/designing_stuff.mp4', alt: 'Demo video' },
];

export const Default = () => <ImageCarousel items={sampleItems} />;
Default.storyName = 'Default Carousel';

export default {
  title: 'Content/Image Carousel',
  component: ImageCarousel,
  argTypes: {
    items: { control: 'object' },
    className: { control: 'text' },
  },
};
