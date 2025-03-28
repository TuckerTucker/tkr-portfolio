import React from 'react';
import { ProjectCard } from '../components/ProjectCard/ProjectCard';

const placeholderImage = `data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='200' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='16'%3EPlaceholder%3C/text%3E%3C/svg%3E`;

export const ProjectCardBasic = () => (
  <ProjectCard
    company="Nutrien"
    projectTitle="Design System"
    role="UX Designer"
    backgroundColor="#9ad441"
  />
);

export const ProjectCardWithImage = () => (
  <ProjectCard
    company="Worldplay"
    projectTitle="Game Analytics"
    role="UX Designer"
    image={placeholderImage}
    backgroundColor="#00a4e4"
  />
);

export const ProjectCardWithHover = () => (
  <div style={{ padding: '2rem' }}>
    <ProjectCard
      company="Shaw"
      projectTitle="Mobile App"
      role="UX Designer"
      image={placeholderImage}
      backgroundColor="#0488c1"
    />
  </div>
);

export default {
  title: 'Project card',
};
