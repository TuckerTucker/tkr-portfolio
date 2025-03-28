import React, { useState } from 'react';
import { ProcessNav } from '../components/ProcessNav/ProcessNav';

const steps = ["understand", "solve", "create", "verify"];

export const ProcessNavBasic = () => {
  const [activeStep, setActiveStep] = useState(steps[0]);

  return (
    <ProcessNav 
      steps={steps} 
      activeStep={activeStep} 
      onStepChange={setActiveStep} 
    />
  );
};

export const ProcessNavWithInitialStep = () => {
  const [activeStep, setActiveStep] = useState(steps[2]); // Start at 'create'

  return (
    <ProcessNav 
      steps={steps} 
      activeStep={activeStep} 
      onStepChange={setActiveStep} 
    />
  );
};

export default {
  title: 'Process nav',
  component: ProcessNav,
};
