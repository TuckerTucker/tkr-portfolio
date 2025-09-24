import AIProgressAssessment from './AIProgressAssessment';

export default {
  title: 'AI Skills/AI Progress Assessment',
  component: AIProgressAssessment,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive AI skills assessment tool with multi-stage evaluation, personalized recommendations, and progress visualization.',
      },
    },
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

export const Default = {
  args: {},
};

export const AssessmentForm = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Complete the multi-stage assessment to evaluate AI collaboration skills across 5 key areas.',
      },
    },
  },
};

export const Interactive = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Take the full assessment to see personalized recommendations and skill level analysis.',
      },
    },
  },
};