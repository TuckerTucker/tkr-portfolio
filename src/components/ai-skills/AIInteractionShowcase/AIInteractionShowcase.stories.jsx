import { AIInteractionShowcase } from './';

export default {
  title: 'AI Skills/AIInteractionShowcase',
  component: AIInteractionShowcase,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Side-by-side comparison of human vs AI interaction patterns with sync indicators and shared data visualization.',
      },
    },
  },
  argTypes: {
    showSync: {
      control: 'boolean',
      description: 'Show synchronization indicators between interfaces',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const Template = (args) => <AIInteractionShowcase {...args} />;

// Sample data for stories
const sampleHumanInterface = {
  title: 'Manual Project Planning',
  description: 'Traditional workflow requiring manual coordination and multiple tools',
  elements: [
    {
      type: 'input',
      content: 'Gather requirements from multiple stakeholders via meetings and emails',
      action: 'Schedule Meeting'
    },
    {
      type: 'control',
      content: 'Create project timeline using spreadsheets and project management tools',
      action: 'Open Spreadsheet'
    },
    {
      type: 'output',
      content: 'Generate reports manually and distribute via email',
      action: 'Send Report'
    }
  ],
  capabilities: ['Manual Tracking', 'Email Communication', 'Spreadsheet Analysis', 'Meeting Coordination']
};

const sampleAIInterface = {
  title: 'AI-Enhanced Project Planning',
  description: 'Automated workflow with intelligent coordination and real-time insights',
  elements: [
    {
      type: 'input',
      content: 'Auto-collect requirements from integrated communication channels',
      action: 'Sync Data'
    },
    {
      type: 'analysis',
      content: 'AI analyzes patterns and suggests optimal timeline with risk assessment',
      action: 'View Analysis'
    },
    {
      type: 'output',
      content: 'Generate and distribute intelligent reports with actionable insights',
      action: 'Auto-Send'
    }
  ],
  capabilities: ['Auto-Collection', 'Pattern Analysis', 'Risk Assessment', 'Intelligent Reporting', 'Real-time Sync']
};

const sampleSharedData = [
  { type: 'Metric', label: 'Project Completion Rate', value: '87% (↑23%)' },
  { type: 'Time', label: 'Average Setup Time', value: '2.3 hours (↓65%)' },
  { type: 'Quality', label: 'Accuracy Score', value: '94% (↑18%)' },
  { type: 'Efficiency', label: 'Resource Utilization', value: '91% (↑34%)' }
];

const sampleSyncIndicators = [
  { label: 'Data synchronization between interfaces' },
  { label: 'Real-time coordination signals' },
  { label: 'Shared context updates' }
];

// Default story
export const Default = Template.bind({});
Default.args = {
  humanInterface: sampleHumanInterface,
  aiInterface: sampleAIInterface,
  sharedData: sampleSharedData,
  syncIndicators: sampleSyncIndicators,
  showSync: true,
};

// Without sync indicators
export const WithoutSync = Template.bind({});
WithoutSync.args = {
  ...Default.args,
  showSync: false,
};

// Minimal example
export const Minimal = Template.bind({});
Minimal.args = {
  humanInterface: {
    title: 'Manual Process',
    description: 'Traditional workflow',
    elements: [
      { type: 'input', content: 'Manual data entry', action: 'Enter Data' }
    ],
    capabilities: ['Manual Entry']
  },
  aiInterface: {
    title: 'AI-Enhanced Process',
    description: 'Automated workflow',
    elements: [
      { type: 'input', content: 'Automated data collection', action: 'Auto-Collect' }
    ],
    capabilities: ['Auto-Collection', 'AI Processing']
  },
  sharedData: [
    { type: 'Metric', label: 'Efficiency Gain', value: '300%' }
  ],
  showSync: true,
};

// Complex example with many elements
export const Complex = Template.bind({});
Complex.args = {
  humanInterface: {
    title: 'Enterprise Software Development',
    description: 'Complex multi-team development workflow',
    elements: [
      { type: 'input', content: 'Requirements gathering across 5 departments', action: 'Schedule Meetings' },
      { type: 'control', content: 'Manual code review coordination', action: 'Assign Reviewers' },
      { type: 'control', content: 'Testing phase management', action: 'Create Test Plan' },
      { type: 'output', content: 'Release documentation compilation', action: 'Generate Docs' },
      { type: 'output', content: 'Stakeholder status reporting', action: 'Send Updates' }
    ],
    capabilities: [
      'Cross-Department Coordination',
      'Manual Review Process',
      'Test Management',
      'Documentation',
      'Status Reporting',
      'Risk Assessment'
    ]
  },
  aiInterface: {
    title: 'AI-Orchestrated Development',
    description: 'Intelligent development workflow with automated coordination',
    elements: [
      { type: 'analysis', content: 'AI-powered requirements synthesis from all sources', action: 'View Synthesis' },
      { type: 'control', content: 'Intelligent reviewer assignment and scheduling', action: 'Auto-Assign' },
      { type: 'analysis', content: 'Automated testing strategy optimization', action: 'Optimize Tests' },
      { type: 'output', content: 'AI-generated release notes with impact analysis', action: 'Generate & Publish' },
      { type: 'output', content: 'Predictive status reports with recommendations', action: 'Auto-Distribute' }
    ],
    capabilities: [
      'Requirements Synthesis',
      'Smart Assignment',
      'Test Optimization',
      'Auto-Documentation',
      'Predictive Analytics',
      'Impact Analysis',
      'Intelligent Routing'
    ]
  },
  sharedData: [
    { type: 'Time', label: 'Development Cycle', value: '6 weeks (↓40%)' },
    { type: 'Quality', label: 'Bug Detection Rate', value: '96% (↑28%)' },
    { type: 'Efficiency', label: 'Code Review Speed', value: '3.2 days (↓60%)' },
    { type: 'Metric', label: 'Team Satisfaction', value: '4.7/5 (↑35%)' },
    { type: 'Cost', label: 'Resource Optimization', value: '$125K saved' },
    { type: 'Quality', label: 'Release Reliability', value: '99.2% (↑15%)' }
  ],
  syncIndicators: [
    { label: 'Requirements sync across teams' },
    { label: 'Code review coordination' },
    { label: 'Test execution status' },
    { label: 'Release readiness signals' }
  ],
  showSync: true,
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