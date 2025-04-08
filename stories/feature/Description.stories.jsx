import React from 'react';
import Description from '@/components/feature/description'; // Use alias

export const Default = () => <Description />;
Default.storyName = 'Default Description';

export const LongDescription = () => (
  <Description
    title="Worldplay Analytics Dashboard"
    description="This dashboard provides real-time insights into user engagement, revenue streams, and system health. It integrates data from multiple sources, supports custom filtering, and offers export options for detailed analysis. Designed with accessibility and responsiveness in mind, it empowers stakeholders to make data-driven decisions efficiently."
  />
);
LongDescription.storyName = 'Longer Description Text';

export const CustomStyling = () => (
  <Description
    title="Custom Styled Description"
    description="This description block has custom styles applied to demonstrate flexibility."
    className="border border-dashed border-accent rounded-lg shadow-md"
    titleClassName="text-3xl font-heading text-primary mb-2"
    descriptionClassName="text-lg italic text-secondary"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Feature Components/Description',
  component: Description,
  argTypes: {
    title: { control: 'text' },
    description: { control: 'text' },
    className: { control: 'text' },
    titleClassName: { control: 'text' },
    descriptionClassName: { control: 'text' },
  },
};
