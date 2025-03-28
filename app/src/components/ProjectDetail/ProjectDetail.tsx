'use client';

import React, { useState, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image'; // Import next/image
import { Project } from '@/data/projects';
import { ProcessNav } from '../ProcessNav/ProcessNav';
import { ArrowNav } from '../ArrowNav/ArrowNav';

/**
 * ProjectDetail component props
 * @interface ProjectDetailProps
 */
interface ProjectDetailProps {
  /** Project data */
  project: Project;
}

type ProcessStepKey = keyof Project['process'];

/**
 * ProjectDetail component displays a project's detailed information
 * 
 * Uses Tailwind CSS, react-markdown, and next/image.
 * 
 * @component
 * @example
 * ```tsx
 * <ProjectDetail project={projectData} />
 * ```
 */
export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const processSteps = Object.keys(project.process) as ProcessStepKey[];
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const activeStep = processSteps[activeStepIndex];
  const activeStepContent = project.process[activeStep];

  const transitionDuration = 150; // ms

  const triggerTransition = (newIndexCallback: (prevIndex: number) => number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveStepIndex(newIndexCallback);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // Fade back in slightly after content update
      setTimeout(() => setIsTransitioning(false), 50); 
    }, transitionDuration);
  };

  const handleStepChange = useCallback((step: string) => {
    const index = processSteps.indexOf(step as ProcessStepKey);
    if (index !== -1 && index !== activeStepIndex) {
      triggerTransition(() => index);
    }
  }, [processSteps, activeStepIndex]);

  const handlePrevious = useCallback(() => {
    triggerTransition((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : processSteps.length - 1));
  }, [processSteps.length]);

  const handleNext = useCallback(() => {
    triggerTransition((prevIndex) => (prevIndex < processSteps.length - 1 ? prevIndex + 1 : 0));
  }, [processSteps.length]);

  // Reset transition state if project changes (prop update)
  useEffect(() => {
    setActiveStepIndex(0);
    setIsTransitioning(false);
  }, [project]);

  return (
    <main className="min-h-screen bg-white relative">
      {/* Project header */}
      <header 
        className="w-full py-8"
        style={{ backgroundColor: project.color }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2">
            <p className="text-lg italic">{project.company}</p>
            <h1 className="text-3xl font-bold">{project.title}</h1>
            <p className="text-lg italic">{project.role}</p>
          </div>
        </div>
      </header>

      {/* Project content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Process navigation */}
        <ProcessNav
          steps={processSteps}
          activeStep={activeStep}
          onStepChange={handleStepChange}
          className="mb-8"
        />

        {/* Content container */}
        <section 
          className="prose max-w-none"
          style={{ 
            opacity: isTransitioning ? 0 : 1, 
            transition: `opacity ${transitionDuration}ms ease-in-out` 
          }}
          aria-live="polite" // Announce content changes to screen readers
        >
          <div className="bg-gray-50 p-8 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">
              {activeStep.charAt(0).toUpperCase() + activeStep.slice(1)} Phase
            </h2>
            <div className="prose">
              <ReactMarkdown>{activeStepContent.content}</ReactMarkdown>
            </div>
            {/* Process Images */}
            {activeStepContent.images.length > 0 && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 not-prose"> {/* Use not-prose to reset prose styles */}
                {activeStepContent.images.map((image, index) => (
                  <figure key={index} className="m-0"> {/* Remove default figure margins */}
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg"> {/* Use aspect ratio for consistent sizing */}
                      <Image
                        src={image.url}
                        alt={image.caption || `${project.title} - ${activeStep} phase image ${index + 1}`}
                        layout="fill"
                        objectFit="contain" // Use contain to show the whole image
                      />
                    </div>
                    {image.caption && (
                      <figcaption className="mt-2 text-sm text-center text-gray-600 italic">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Arrow navigation */}
      <ArrowNav onPrevious={handlePrevious} onNext={handleNext} />
    </main>
  );
};
