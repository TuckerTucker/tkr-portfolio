import React from 'react';
import ProjectCard from '@/components/custom/project-card'; // Use alias
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Sample project data based on .clinerules
const sampleProjects = [
  {
    id: "agentic_ai_kanban",
    title: "Agentic AI Kanban",
    color: "#FF8800", // secondary color
    subtitle: "Personal",
  },
  {
    id: "nutrien",
    title: "Nutrien",
    color: "#3b5f18",
    subtitle: "Safety Portal",
  },
  {
    id: "worldplay",
    title: "Worldplay",
    color: "#00a4e4",
    subtitle: "Analytics Dashboard",
  },
  {
    id: "shaw",
    title: "Shaw",
    color: "#0488c1",
    subtitle: "Phone Portal",
  }
];

// Helper to simulate dropdown context
const DropdownWrapper = ({ children }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline">View Projects</Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent className="w-72"> {/* Adjust width as needed */}
      {children}
    </DropdownMenuContent>
  </DropdownMenu>
);

export const SingleCard = () => (
  <DropdownWrapper>
    <ProjectCard {...sampleProjects[0]} />
  </DropdownWrapper>
);
SingleCard.storyName = 'Single Project Card';

export const MultipleCards = () => (
  <DropdownWrapper>
    {sampleProjects.map(project => (
      <ProjectCard key={project.id} {...project} />
    ))}
  </DropdownWrapper>
);
MultipleCards.storyName = 'List of Project Cards';

export const WithClickHandler = () => {
  const handleClick = (project) => {
    alert(`Selected Project: ${project.title} (ID: ${project.id})`);
  };

  return (
    <DropdownWrapper>
      {sampleProjects.map(project => (
        <ProjectCard key={project.id} {...project} onClick={handleClick} />
      ))}
    </DropdownWrapper>
  );
};
WithClickHandler.storyName = 'With Click Handler';


export default {
  title: 'Custom Components/Project Card (Dropdown Item)',
  component: ProjectCard,
  // We don't need argTypes here as the component is best viewed in context
};
