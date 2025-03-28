import React from 'react';
import { ProjectGrid } from '../components/ProjectGrid/ProjectGrid';

const placeholderImage = `data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='200' height='200' fill='%23ccc'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23666' font-size='16'%3EPlaceholder%3C/text%3E%3C/svg%3E`;

const sampleProjects = [
  {
    id: '1',
    company: 'Nutrien',
    title: 'Design System',
    role: 'UX Designer',
    color: '#8DA89C',
  },
  {
    id: '2',
    company: 'Worldplay',
    title: 'Game Analytics',
    role: 'UX Designer',
    image: placeholderImage,
    color: '#E6B655',
  },
  {
    id: '3',
    company: 'Shaw',
    title: 'Mobile App',
    role: 'UX Designer',
    image: placeholderImage,
    color: '#9B8EB8',
  },
  {
    id: '4',
    company: 'Taskboard',
    title: 'Project Management',
    role: 'UX Designer',
    image: placeholderImage,
    color: '#C69B9B',
  },
];

export const ProjectGridBasic = () => (
  <ProjectGrid projects={sampleProjects} />
);

export const ProjectGridWithInteraction = () => (
  <ProjectGrid
    projects={sampleProjects}
    onProjectClick={(id) => console.log(`Project clicked: ${id}`)}
  />
);

export default {
  title: 'Project grid',
};
