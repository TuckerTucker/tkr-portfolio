import React from 'react';
import Branding from '@/components/custom/branding'; // Use alias

export const HeaderContext = () => (
  <div className="bg-primary p-4"> {/* Simulate header background */}
    <Branding
      className="text-white" // Class from .clinerules header definition
    />
  </div>
);
HeaderContext.storyName = 'In Header Context (White Text)';


export default {
  title: 'Header/Branding',
  component: Branding,
  argTypes: {
    name: { control: 'text' },
    title: { control: 'text' },
    className: { control: 'text' },
    nameClassName: { control: 'text' },
    titleClassName: { control: 'text' },
  },
};
