import React, { useState } from 'react';
import CustomProjectPicker from '@/components/feature/custom-project-picker';

const sampleProjects = [
  {
    id: 'agentic_ai_kanban',
    title: 'Agentic AI Kanban',
    subtitle: 'Personal',
    color: '#FF8800',
  },
  {
    id: 'nutrien',
    title: 'Nutrien',
    subtitle: 'Safety Portal',
    color: '#3b5f18',
  },
  {
    id: 'worldplay',
    title: 'Worldplay',
    subtitle: 'Analytics Dashboard',
    color: '#00a4e4',
  },
  {
    id: 'shaw',
    title: 'Shaw',
    subtitle: 'Phone Portal',
    color: '#0488c1',
  },
];

const Template = () => {
  const [selectedProject, setSelectedProject] = useState(null);

  return (
    <div className="max-w-md mx-auto mt-10">
      <CustomProjectPicker
        projects={sampleProjects}
        selectedProject={selectedProject}
        selectedProjectTitle={selectedProject ? selectedProject.title : 'Select a Project'}
        onSelectProject={setSelectedProject}
      />
    </div>
  );
};

export default {
  title: 'Navigation/CustomProjectPicker',
  component: CustomProjectPicker,
};

export const Default = Template.bind({});
