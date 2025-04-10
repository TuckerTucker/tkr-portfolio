import React from 'react';
import BulletListContainer from '@/components/feature/bullet-list-container'; // Use alias

const sampleBullets = [
  "Designed user flows and wireframes",
  "Conducted usability testing sessions",
  "Developed high-fidelity prototypes",
  "Collaborated with developers on implementation",
];

export const Default = () => <BulletListContainer items={sampleBullets} />;
Default.storyName = 'Default Container';


export default {
  title: 'Content/Bullet List Container',
  component: BulletListContainer,
  argTypes: {
    items: { control: 'object' },
    className: { control: 'text' },
    listClassName: { control: 'text' },
    listItemClassName: { control: 'text' },
  },
};
