import React from 'react';
import ProjectCardList from '@/components/custom/project-card-list'; // Use alias
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

// Sample project data based on .clinerules (same as ProjectCard story)
const sampleProjects = [
  {
    id: "agentic_ai_kanban",
    title: "Agentic AI Kanban",
    color: "#FF8800",
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

export const DefaultList = () => (
  <DropdownWrapper>
    <ProjectCardList projects={sampleProjects} />
  </DropdownWrapper>
);
DefaultList.storyName = 'Default List';

export const EmptyList = () => (
  <DropdownWrapper>
    <ProjectCardList projects={[]} />
  </DropdownWrapper>
);
EmptyList.storyName = 'Empty List';

export const WithSelectionHandler = () => {
  const handleSelect = (project) => {
    alert(`Selected Project from List: ${project.title} (ID: ${project.id})`);
  };

  return (
    <DropdownWrapper>
      <ProjectCardList projects={sampleProjects} onProjectSelect={handleSelect} />
    </DropdownWrapper>
  );
};
WithSelectionHandler.storyName = 'With Selection Handler';


export default {
  title: 'Custom Components/Project Card List',
  component: ProjectCardList,
  // Again, argTypes might not be super useful here as it's best viewed in context
};
