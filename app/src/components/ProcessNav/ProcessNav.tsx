'use client';

import React from 'react';

/**
 * ProcessNav component props
 * @interface ProcessNavProps
 */
interface ProcessNavProps {
  /** Array of process step names */
  steps: string[];
  /** Currently active step */
  activeStep: string;
  /** Handler for changing the active step */
  onStepChange: (step: string) => void;
  /** Optional additional class names */
  className?: string;
}

/**
 * ProcessNav component provides navigation between project process steps
 * 
 * Uses Tailwind CSS for styling and responsiveness.
 * 
 * @component
 * @example
 * ```tsx
 * const steps = ["understand", "solve", "create", "verify"];
 * const [activeStep, setActiveStep] = useState("understand");
 * 
 * <ProcessNav 
 *   steps={steps} 
 *   activeStep={activeStep} 
 *   onStepChange={setActiveStep} 
 * />
 * ```
 */
export const ProcessNav: React.FC<ProcessNavProps> = ({
  steps,
  activeStep,
  onStepChange,
  className = '',
}) => {
  return (
    <nav
      className={`flex justify-center gap-4 md:gap-8 p-4 border-b border-gray-200 ${className}`}
      role="navigation"
      aria-label="Process steps"
    >
      {steps.map((step) => (
        <button
          key={step}
          className={`
            px-2 py-1 md:px-4 md:py-2 border-none bg-none cursor-pointer 
            text-sm md:text-base text-gray-500 
            transition-colors duration-200 ease-in-out
            ${activeStep === step 
              ? 'text-gray-900 underline underline-offset-4 decoration-2' 
              : 'hover:text-gray-700'
            }
          `}
          onClick={() => onStepChange(step)}
          aria-current={activeStep === step ? 'step' : undefined}
        >
          {step.charAt(0).toUpperCase() + step.slice(1)} {/* Capitalize step name */}
        </button>
      ))}
    </nav>
  );
};
