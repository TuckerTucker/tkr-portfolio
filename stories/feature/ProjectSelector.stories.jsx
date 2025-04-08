import React, { useState } from 'react';
import ProjectSelector from '@/components/feature/project-selector'; // Use alias

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
    color: "#9ad441",
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

export const Default = () => {
  const [selectedTitle, setSelectedTitle] = useState("Select a Project");

  const handleSelect = (project) => {
    setSelectedTitle(project.title);
    alert(`Selected project: ${project.title}`);
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <ProjectSelector
        projects={sampleProjects}
        selectedProjectTitle={selectedTitle}
        onSelectProject={handleSelect}
      />
    </div>
  );
};
Default.storyName = 'Default Project Selector';

export const Empty = () => (
  <div className="max-w-md mx-auto mt-10">
    <ProjectSelector projects={[]} selectedProjectTitle="No Projects" />
  </div>
);
Empty.storyName = 'Empty Project List';


export default {
  title: 'Feature Components/Project Selector',
  component: ProjectSelector,
  argTypes: {
    projects: { control: 'object' },
    selectedProjectTitle: { control: 'text' },
    onSelectProject: { action: 'projectSelected' },
    className: { control: 'text' },
  },
};
