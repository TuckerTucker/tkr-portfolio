import React from 'react';
import ProjectInfo from '@/components/custom/project-info'; // Use alias

export const Default = () => <ProjectInfo />;
Default.storyName = 'Default Props';

export const SpecificProject = () => (
  <ProjectInfo
    title="Agentic AI Kanban"
    subtitle="Personal Project"
  />
);
SpecificProject.storyName = 'Specific Project';

export const CustomLayout = () => (
  <ProjectInfo
    title="Nutrien Safety Portal"
    subtitle="Enterprise Application"
    className="bg-nutrien/10 p-4 rounded-md border border-nutrien" // Example custom styling
  />
);
CustomLayout.storyName = 'With Custom Styling';

export const CustomTextStyling = () => (
  <ProjectInfo
    title="Worldplay Analytics"
    subtitle="Data Visualization Dashboard"
    titleClassName="text-xl font-bold text-worldplay"
    subtitleClassName="text-md italic text-gray-500"
  />
);
CustomTextStyling.storyName = 'With Custom Text Styling';


export default {
  title: 'Custom Components/Project Info',
  component: ProjectInfo,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    className: { control: 'text' },
    titleClassName: { control: 'text' },
    subtitleClassName: { control: 'text' },
  },
};
