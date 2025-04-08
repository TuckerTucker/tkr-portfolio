import React from 'react';
import Branding from '@/components/custom/branding'; // Use alias

export const Default = () => <Branding />;
Default.storyName = 'Default Props';

export const HeaderContext = () => (
  <div className="bg-primary p-4"> {/* Simulate header background */}
    <Branding
      className="text-white" // Class from .clinerules header definition
    />
  </div>
);
HeaderContext.storyName = 'In Header Context (White Text)';

export const CustomStyling = () => (
  <Branding
    name="Another Name"
    title="Different Role"
    className="border border-dashed border-secondary p-4"
    nameClassName="text-secondary font-heading text-2xl"
    titleClassName="text-accent italic"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Custom Components/Branding',
  component: Branding,
  argTypes: {
    name: { control: 'text' },
    title: { control: 'text' },
    className: { control: 'text' },
    nameClassName: { control: 'text' },
    titleClassName: { control: 'text' },
  },
};
