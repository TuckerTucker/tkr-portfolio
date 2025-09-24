import { AgentConversationFlow } from './';

export default {
  title: 'AI Skills/AgentConversationFlow',
  component: AgentConversationFlow,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '5-stage conversation evolution visualization with quality indicators, context evolution tracking, and orchestration diagrams.',
      },
    },
  },
  argTypes: {
    autoAdvance: {
      control: 'boolean',
      description: 'Auto-advance through stages',
    },
    advanceInterval: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: 'Auto-advance interval in milliseconds',
    },
    showQualityMetrics: {
      control: 'boolean',
      description: 'Show quality indicators for each stage',
    },
    showOrchestration: {
      control: 'boolean',
      description: 'Show orchestration flow diagrams',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const Template = (args) => <AgentConversationFlow {...args} />;

// Sample conversation stages
const sampleStages = [
  {
    id: 'initial',
    title: 'Initial Contact',
    description: 'User initiates conversation with basic request',
    qualityScore: 65,
    contextDepth: 'Surface',
    orchestrationLevel: 'Simple',
    userInput: 'Can you help me build a React component?',
    agentResponse: 'I can help you build a React component. What type of component are you looking for?',
    contextEvolution: {
      before: ['User intent', 'Basic request'],
      after: ['User intent', 'Basic request', 'Component type needed']
    },
    qualityMetrics: {
      clarity: 70,
      completeness: 50,
      actionability: 60,
      contextAwareness: 40
    },
    orchestrationSteps: [
      'Parse user intent',
      'Identify component request',
      'Request clarification'
    ]
  },
  {
    id: 'clarification',
    title: 'Context Gathering',
    description: 'Agent gathers specific requirements and constraints',
    qualityScore: 78,
    contextDepth: 'Detailed',
    orchestrationLevel: 'Coordinated',
    userInput: 'I need a dropdown component for a form with validation',
    agentResponse: 'Perfect! For a dropdown with validation, I\'ll need to know about your validation rules, styling preferences, and data structure.',
    contextEvolution: {
      before: ['User intent', 'Component type needed'],
      after: ['User intent', 'Component type: dropdown', 'Form context', 'Validation requirements', 'Styling needs']
    },
    qualityMetrics: {
      clarity: 85,
      completeness: 70,
      actionability: 75,
      contextAwareness: 80
    },
    orchestrationSteps: [
      'Analyze component requirements',
      'Identify missing context',
      'Request specific details',
      'Prepare implementation plan'
    ]
  },
  {
    id: 'specification',
    title: 'Requirements Analysis',
    description: 'Detailed analysis of needs with technical recommendations',
    qualityScore: 87,
    contextDepth: 'Comprehensive',
    orchestrationLevel: 'Intelligent',
    userInput: 'Use Tailwind CSS, validate email format, support keyboard navigation',
    agentResponse: 'Excellent specifications! I\'ll create an accessible dropdown with email validation, Tailwind styling, and full keyboard support including arrow keys and escape handling.',
    contextEvolution: {
      before: ['User intent', 'Component type: dropdown', 'Form context', 'Validation requirements', 'Styling needs'],
      after: ['Complete specs', 'Tailwind CSS', 'Email validation', 'Accessibility requirements', 'Keyboard navigation', 'Implementation approach']
    },
    qualityMetrics: {
      clarity: 95,
      completeness: 85,
      actionability: 90,
      contextAwareness: 92
    },
    orchestrationSteps: [
      'Parse technical requirements',
      'Validate compatibility',
      'Design component architecture',
      'Plan accessibility features',
      'Prepare code generation'
    ]
  },
  {
    id: 'implementation',
    title: 'Code Generation',
    description: 'Agent generates complete, working implementation with best practices',
    qualityScore: 93,
    contextDepth: 'Expert',
    orchestrationLevel: 'Autonomous',
    userInput: 'That sounds perfect! Please generate the code.',
    agentResponse: 'Here\'s your complete dropdown component with TypeScript, full accessibility, email validation, and comprehensive tests included.',
    contextEvolution: {
      before: ['Complete specs', 'Technical requirements', 'Implementation approach'],
      after: ['Working implementation', 'TypeScript types', 'Test coverage', 'Documentation', 'Usage examples']
    },
    qualityMetrics: {
      clarity: 98,
      completeness: 95,
      actionability: 98,
      contextAwareness: 96
    },
    orchestrationSteps: [
      'Generate component code',
      'Add TypeScript types',
      'Implement validation logic',
      'Add accessibility features',
      'Create test suite',
      'Generate documentation'
    ]
  },
  {
    id: 'optimization',
    title: 'Enhancement & Guidance',
    description: 'Proactive optimization suggestions and usage guidance',
    qualityScore: 96,
    contextDepth: 'Masterful',
    orchestrationLevel: 'Predictive',
    userInput: 'This is great! Any suggestions for improvement?',
    agentResponse: 'I notice you might benefit from adding debounced validation, error boundary handling, and consider these integration patterns for your specific form architecture.',
    contextEvolution: {
      before: ['Working implementation', 'Basic requirements met'],
      after: ['Optimized solution', 'Performance enhancements', 'Error handling', 'Integration guidance', 'Maintenance tips', 'Future scalability']
    },
    qualityMetrics: {
      clarity: 100,
      completeness: 98,
      actionability: 100,
      contextAwareness: 98
    },
    orchestrationSteps: [
      'Analyze current implementation',
      'Identify optimization opportunities',
      'Generate enhancement suggestions',
      'Provide integration guidance',
      'Create maintenance documentation',
      'Suggest future improvements'
    ]
  }
];

// Default story
export const Default = Template.bind({});
Default.args = {
  stages: sampleStages,
  autoAdvance: false,
  advanceInterval: 3000,
  showQualityMetrics: true,
  showOrchestration: true,
};

// Auto-advancing version
export const AutoAdvance = Template.bind({});
AutoAdvance.args = {
  ...Default.args,
  autoAdvance: true,
  advanceInterval: 4000,
};

// Simplified version without metrics
export const Simplified = Template.bind({});
Simplified.args = {
  ...Default.args,
  showQualityMetrics: false,
  showOrchestration: false,
  stages: sampleStages.slice(0, 3), // Only first 3 stages
};

// Fast progression demo
export const FastProgression = Template.bind({});
FastProgression.args = {
  ...Default.args,
  autoAdvance: true,
  advanceInterval: 2000,
};

// Single stage focus
export const SingleStage = Template.bind({});
SingleStage.args = {
  stages: [sampleStages[2]], // Just the specification stage
  showQualityMetrics: true,
  showOrchestration: true,
};

// Mobile preview
export const MobilePreview = Template.bind({});
MobilePreview.args = {
  ...Default.args,
};
MobilePreview.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};