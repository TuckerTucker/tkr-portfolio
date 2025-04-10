import React from 'react';
import ContentSection from '@/components/feature/content-section'; // Use alias

const sampleBullets = [
  "Designed user flows and wireframes",
  "Conducted usability testing sessions",
  "Developed high-fidelity prototypes",
  "Collaborated with developers on implementation",
];

export const Default = () => (
  <ContentSection
    title="Worldplay Analytics Dashboard"
    description="This dashboard provides real-time insights into user engagement, revenue streams, and system health. It integrates data from multiple sources, supports custom filtering, and offers export options for detailed analysis."
    bullets={sampleBullets}
  />
);
Default.storyName = 'Default Content Section';


export default {
  title: 'Content/Content Section',
  component: ContentSection,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    bullets: { control: 'object' },
    className: { control: 'text' },
    descriptionClassName: { control: 'text' },
    bulletListClassName: { control: 'text' },
  },
};
