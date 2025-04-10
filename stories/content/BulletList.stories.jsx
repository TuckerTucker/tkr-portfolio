import React from 'react';
import BulletList from '@/components/custom/bullet-list'; // Use alias

const sampleBullets = [
  "Designed user flows and wireframes",
  "Conducted usability testing sessions",
  "Developed high-fidelity prototypes",
  "Collaborated with developers on implementation",
];

const shortBullets = [
    "Feature One",
    "Feature Two",
];

export const Default = () => <BulletList items={sampleBullets} />;
Default.storyName = 'Default List';

export const ShortList = () => <BulletList items={shortBullets} />;
ShortList.storyName = 'Short List';



export default {
  title: 'Content/Bullet List',
  component: BulletList,
  argTypes: {
    items: { control: 'object' }, // Allow editing array in controls
    className: { control: 'text' },
    listItemClassName: { control: 'text' },
  },
};
