import React from 'react';
import { getProjectById } from '@/data/projects';
import { notFound } from 'next/navigation';
import { ProjectDetail } from '@/components/ProjectDetail/ProjectDetail';

/**
 * Project detail page props
 * @interface ProjectDetailPageProps
 */
interface ProjectDetailPageProps {
  /** Project ID from route params */
  params: {
    id: string;
  };
}

/**
 * Project detail page component
 * 
 * @component
 * @example
 * ```tsx
 * // URL: /project/1
 * <ProjectDetailPage params={{ id: '1' }} />
 * ```
 */
export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const project = getProjectById(params.id);

  if (!project) {
    notFound();
  }

  return <ProjectDetail project={project} />;
}
