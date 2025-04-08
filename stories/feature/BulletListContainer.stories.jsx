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

export const Empty = () => <BulletListContainer items={[]} />;
Empty.storyName = 'Empty List (Renders Nothing)';

export const CustomStyling = () => (
  <BulletListContainer
    items={sampleBullets}
    className="border border-dashed border-accent rounded-lg shadow-md"
    listClassName="list-decimal pl-8 mt-8"
    listItemClassName="mb-4 italic font-semibold"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Feature Components/Bullet List Container',
  component: BulletListContainer,
  argTypes: {
    items: { control: 'object' },
    className: { control: 'text' },
    listClassName: { control: 'text' },
    listItemClassName: { control: 'text' },
  },
};
