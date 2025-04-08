import React from 'react';
import MobileProjectCard from '@/components/feature/mobile-project-card'; // Use alias

const sampleProjects = [
  {
    id: "agentic_ai_kanban",
    title: "Agentic AI Kanban",
    subtitle: "Personal",
    color: "#FF8800",
    imageUrl: "/placeholder/agentic_ai_kanban/thumbnail.jpg",
  },
  {
    id: "nutrien",
    title: "Nutrien",
    subtitle: "Safety Portal",
    color: "#9ad441",
    imageUrl: "/placeholder/nutrien/thumbnail.jpg",
  },
  {
    id: "worldplay",
    title: "Worldplay",
    subtitle: "Analytics Dashboard",
    color: "#00a4e4",
    imageUrl: "/placeholder/worldplay/thumbnail.jpg",
  },
  {
    id: "shaw",
    title: "Shaw",
    subtitle: "Phone Portal",
    color: "#0488c1",
    imageUrl: "/placeholder/shaw/thumbnail.jpg",
  }
];

export const SingleCard = () => (
  <MobileProjectCard {...sampleProjects[0]} />
);
SingleCard.storyName = 'Single Mobile Project Card';

export const MultipleCards = () => (
  <div className="p-4 space-y-4">
    {sampleProjects.map((project) => (
      <MobileProjectCard key={project.id} {...project} />
    ))}
  </div>
);
MultipleCards.storyName = 'Multiple Mobile Project Cards';

export const WithClickHandler = () => {
  const handleClick = (project) => {
    alert(`Clicked project: ${project.title}`);
  };

  return (
    <div className="p-4 space-y-4">
      {sampleProjects.map((project) => (
        <MobileProjectCard key={project.id} {...project} onClick={handleClick} />
      ))}
    </div>
  );
};
WithClickHandler.storyName = 'With Click Handler';


export default {
  title: 'Feature Components/Mobile Project Card',
  component: MobileProjectCard,
  argTypes: {
    id: { control: 'text' },
    title: { control: 'text' },
    subtitle: { control: 'text' },
    color: { control: 'color' },
    imageUrl: { control: 'text' },
    onClick: { action: 'clicked' },
    className: { control: 'text' },
  },
};
