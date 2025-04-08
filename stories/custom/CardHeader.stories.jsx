import React from 'react';
import CardHeader from '@/components/custom/card-header'; // Use alias

// Manually define theme colors for story examples
const themeColors = {
  primary: "#613CB0",
  secondary: "#FF8800", // Kanban/Taskboard color
  nutrien: "#9ad441",
  worldplay: "#00a4e4",
  shaw: "#0488c1",
  accent: "#00A3FF",
  text: "#333333",
};

export const Default = () => <CardHeader />;
Default.storyName = 'Default Props';

export const KanbanProject = () => (
  <CardHeader
    title="Agentic AI Kanban"
    subtitle="Personal Project"
    backgroundColor={themeColors.secondary} // Use taskboard color
  />
);
KanbanProject.storyName = 'Kanban Project Color';

export const NutrienProject = () => (
  <CardHeader
    title="Nutrien Safety Portal"
    subtitle="Enterprise Application"
    backgroundColor={themeColors.nutrien}
  />
);
NutrienProject.storyName = 'Nutrien Project Color';

export const WorldplayProject = () => (
  <CardHeader
    title="Worldplay Analytics"
    subtitle="Data Visualization"
    backgroundColor={themeColors.worldplay}
  />
);
WorldplayProject.storyName = 'Worldplay Project Color';

export const ShawProject = () => (
  <CardHeader
    title="Shaw Phone Portal"
    subtitle="Customer Self-Serve"
    backgroundColor={themeColors.shaw}
  />
);
ShawProject.storyName = 'Shaw Project Color';

export const CustomStyling = () => (
  <CardHeader
    title="Custom Styled Header"
    subtitle="With additional classes"
    backgroundColor={themeColors.primary}
    className="rounded-t-lg border-b-4 border-accent"
    titleClassName="text-2xl font-heading"
    subtitleClassName="italic text-yellow-300"
  />
);
CustomStyling.storyName = 'With Custom Styling';


export default {
  title: 'Custom Components/Card Header',
  component: CardHeader,
  argTypes: {
    title: { control: 'text' },
    subtitle: { control: 'text' },
    backgroundColor: { control: 'color' },
    textColor: { control: 'color' },
    className: { control: 'text' },
    titleClassName: { control: 'text' },
    subtitleClassName: { control: 'text' },
  },
};
