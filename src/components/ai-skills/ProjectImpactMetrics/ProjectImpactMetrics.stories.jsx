import { ProjectImpactMetrics } from './';

export default {
  title: 'AI Skills/ProjectImpactMetrics',
  component: ProjectImpactMetrics,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Quantified results display with multiple visualization options, featuring before/after KPIs, animated charts, and accessibility support.',
      },
    },
  },
  argTypes: {
    visualizationType: {
      control: { type: 'select', options: ['bar', 'line', 'circular', 'card'] },
      description: 'Type of chart visualization',
    },
    title: {
      control: 'text',
      description: 'Main title for the metrics display',
    },
    subtitle: {
      control: 'text',
      description: 'Subtitle or description',
    },
    showAnimation: {
      control: 'boolean',
      description: 'Enable animated counters and transitions',
    },
    animationDuration: {
      control: { type: 'number', min: 500, max: 5000, step: 250 },
      description: 'Animation duration in milliseconds',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const Template = (args) => <ProjectImpactMetrics {...args} />;

// Sample metrics data
const sampleMetrics = [
  {
    id: 'development-time',
    name: 'Development Time',
    category: 'Efficiency',
    beforeValue: 240,
    afterValue: 45,
    unit: 'hours',
    improvement: 81.25,
    description: 'Time from concept to deployment',
    icon: '⚡',
    color: '#10B981',
    trend: 'decrease-good'
  },
  {
    id: 'code-quality',
    name: 'Code Quality Score',
    category: 'Quality',
    beforeValue: 72,
    afterValue: 94,
    unit: '%',
    improvement: 30.56,
    description: 'Automated code quality metrics',
    icon: '🎯',
    color: '#3B82F6',
    trend: 'increase-good'
  },
  {
    id: 'user-satisfaction',
    name: 'User Satisfaction',
    category: 'Experience',
    beforeValue: 3.2,
    afterValue: 4.7,
    unit: '/5',
    improvement: 46.88,
    description: 'Average user rating from feedback',
    icon: '⭐',
    color: '#F59E0B',
    trend: 'increase-good'
  },
  {
    id: 'bug-reduction',
    name: 'Bug Reports',
    category: 'Quality',
    beforeValue: 34,
    afterValue: 6,
    unit: 'per month',
    improvement: 82.35,
    description: 'Monthly bug reports from users',
    icon: '🐛',
    color: '#EF4444',
    trend: 'decrease-good'
  },
  {
    id: 'team-velocity',
    name: 'Team Velocity',
    category: 'Productivity',
    beforeValue: 23,
    afterValue: 47,
    unit: 'story points',
    improvement: 104.35,
    description: 'Sprint velocity in story points',
    icon: '🚀',
    color: '#8B5CF6',
    trend: 'increase-good'
  },
  {
    id: 'deployment-frequency',
    name: 'Deployment Frequency',
    category: 'DevOps',
    beforeValue: 4,
    afterValue: 28,
    unit: 'per month',
    improvement: 600,
    description: 'Successful production deployments',
    icon: '🔄',
    color: '#06B6D4',
    trend: 'increase-good'
  }
];

const aiTransformationMetrics = [
  {
    id: 'context-efficiency',
    name: 'Context Processing',
    category: 'AI Performance',
    beforeValue: 1247,
    afterValue: 342,
    unit: 'tokens',
    improvement: 72.57,
    description: 'YAML configuration token efficiency',
    icon: '🧠',
    color: '#613CB0',
    trend: 'decrease-good'
  },
  {
    id: 'ai-accuracy',
    name: 'AI Response Accuracy',
    category: 'AI Performance',
    beforeValue: 76,
    afterValue: 94,
    unit: '%',
    improvement: 23.68,
    description: 'Percentage of accurate AI responses',
    icon: '🎯',
    color: '#10B981',
    trend: 'increase-good'
  },
  {
    id: 'automation-coverage',
    name: 'Task Automation',
    category: 'Automation',
    beforeValue: 15,
    afterValue: 87,
    unit: '%',
    improvement: 480,
    description: 'Percentage of tasks automated',
    icon: '🤖',
    color: '#F59E0B',
    trend: 'increase-good'
  },
  {
    id: 'human-ai-collaboration',
    name: 'Human-AI Collaboration Score',
    category: 'Collaboration',
    beforeValue: 2.1,
    afterValue: 4.8,
    unit: '/5',
    improvement: 128.57,
    description: 'Effectiveness of human-AI teamwork',
    icon: '🤝',
    color: '#3B82F6',
    trend: 'increase-good'
  }
];

// Default story
export const Default = Template.bind({});
Default.args = {
  metrics: sampleMetrics,
  visualizationType: 'bar',
  title: 'Project Impact Metrics',
  subtitle: 'Quantified improvements from AI integration',
  showAnimation: true,
  animationDuration: 2000,
};

// Card visualization
export const CardVisualization = Template.bind({});
CardVisualization.args = {
  ...Default.args,
  visualizationType: 'card',
  title: 'Performance Dashboard',
};

// Circular progress visualization
export const CircularVisualization = Template.bind({});
CircularVisualization.args = {
  ...Default.args,
  visualizationType: 'circular',
  title: 'Progress Overview',
  metrics: sampleMetrics.slice(0, 4), // Show fewer for circular layout
};

// Line chart visualization
export const LineVisualization = Template.bind({});
LineVisualization.args = {
  ...Default.args,
  visualizationType: 'line',
  title: 'Trend Analysis',
};

// AI-specific metrics
export const AITransformation = Template.bind({});
AITransformation.args = {
  metrics: aiTransformationMetrics,
  visualizationType: 'bar',
  title: 'AI Transformation Impact',
  subtitle: 'Measuring the effect of AI integration on development workflows',
  showAnimation: true,
};

// Without animation
export const StaticDisplay = Template.bind({});
StaticDisplay.args = {
  ...Default.args,
  showAnimation: false,
  title: 'Static Metrics Display',
};

// Minimal metrics set
export const MinimalMetrics = Template.bind({});
MinimalMetrics.args = {
  metrics: [
    {
      id: 'time-saved',
      name: 'Time Saved',
      category: 'Efficiency',
      beforeValue: 100,
      afterValue: 15,
      unit: 'hours/week',
      improvement: 85,
      description: 'Weekly time savings from automation',
      icon: '⏰',
      color: '#10B981',
      trend: 'decrease-good'
    },
    {
      id: 'quality-increase',
      name: 'Quality Score',
      category: 'Quality',
      beforeValue: 65,
      afterValue: 92,
      unit: '%',
      improvement: 41.54,
      description: 'Overall project quality improvement',
      icon: '✨',
      color: '#3B82F6',
      trend: 'increase-good'
    }
  ],
  visualizationType: 'card',
  title: 'Key Improvements',
  showAnimation: true,
};

// Fast animation
export const FastAnimation = Template.bind({});
FastAnimation.args = {
  ...MinimalMetrics.args,
  animationDuration: 1000,
  title: 'Quick Metrics',
};

// Mobile preview
export const MobilePreview = Template.bind({});
MobilePreview.args = {
  ...MinimalMetrics.args,
};
MobilePreview.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};