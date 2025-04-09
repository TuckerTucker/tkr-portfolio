import React from 'react';
import Header from '@/components/layout/header'; // Use alias

export const Default = () => <Header />;
Default.storyName = 'Default Header';

export const WithClickHandler = () => {
  const handleClick = () => {
    alert('Resume button clicked!');
  };
  return <Header onResumeClick={handleClick} />;
};
WithClickHandler.storyName = 'With Resume Click Handler';

// Example of passing custom class
export const CustomStyled = () => (
    <Header className="border-b-4 border-accent shadow-lg" />
);
CustomStyled.storyName = 'With Custom Styling';


export default {
  title: 'Layout Components/Header',
  component: Header,
  argTypes: {
    onResumeClick: { action: 'resumeClicked' }, // Log clicks in storybook actions tab
    className: { control: 'text' },
  },
};
