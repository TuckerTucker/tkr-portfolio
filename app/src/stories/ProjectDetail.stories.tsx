import React from 'react';
import { ProjectDetail } from '../components/ProjectDetail/ProjectDetail';
import { projects } from '../data/projects';

export const ProjectDetailNutrien = () => (
  <ProjectDetail project={projects[0]} />
);

export const ProjectDetailWorldplay = () => (
  <ProjectDetail project={projects[1]} />
);

export const ProjectDetailShaw = () => (
  <ProjectDetail project={projects[2]} />
);

export const ProjectDetailTaskboard = () => (
  <ProjectDetail project={projects[3]} />
);

export default {
  title: 'Project detail',
  parameters: {
    layout: 'fullscreen',
  },
};
