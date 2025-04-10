import React from 'react';
import Description from '@/components/feature/description'; // Use alias

export const LongDescription = () => (
  <Description
    title="Worldplay Analytics Dashboard"
    description="This dashboard provides real-time insights into user engagement, revenue streams, and system health. It integrates data from multiple sources, supports custom filtering, and offers export options for detailed analysis. Designed with accessibility and responsiveness in mind, it empowers stakeholders to make data-driven decisions efficiently."
  />
);
LongDescription.storyName = 'Longer Description Text';

export default {
  title: 'Content/Description',
  component: Description,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    className: { control: 'text' },
    titleClassName: { control: 'text' },
    descriptionClassName: { control: 'text' },
  },
};
