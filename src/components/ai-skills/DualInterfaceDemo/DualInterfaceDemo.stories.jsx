import { DualInterfaceDemo } from './';

export default {
  title: 'AI Skills/DualInterfaceDemo',
  component: DualInterfaceDemo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Interactive toggle between human and AI interfaces with smooth transitions, guided demo scenarios, and real-time synchronization.',
      },
    },
  },
  argTypes: {
    initialMode: {
      control: { type: 'select', options: ['human', 'ai'] },
      description: 'Initial interface mode',
    },
    autoDemo: {
      control: 'boolean',
      description: 'Auto-cycle through demo scenarios',
    },
    demoDuration: {
      control: { type: 'number', min: 1000, max: 10000, step: 500 },
      description: 'Duration for each demo scenario in milliseconds',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
};

const Template = (args) => <DualInterfaceDemo {...args} />;

// Sample scenarios for the demo
const sampleScenarios = [
  {
    id: 'project-setup',
    title: 'Project Setup',
    humanInterface: {
      title: 'Manual Project Setup',
      description: 'Traditional workflow requiring multiple steps and tools',
      steps: [
        {
          label: 'Requirements',
          content: 'Gather requirements through meetings and emails',
          timeEstimate: '2-3 hours',
          tools: ['Email', 'Meetings', 'Documents']
        },
        {
          label: 'Planning',
          content: 'Create project structure manually',
          timeEstimate: '4-6 hours',
          tools: ['Spreadsheets', 'Project Manager', 'Whiteboards']
        },
        {
          label: 'Setup',
          content: 'Configure development environment',
          timeEstimate: '3-4 hours',
          tools: ['Terminal', 'Config Files', 'Documentation']
        }
      ],
      totalTime: '9-13 hours',
      complexity: 'High',
      errorRate: '25%'
    },
    aiInterface: {
      title: 'AI-Assisted Project Setup',
      description: 'Automated workflow with intelligent assistance',
      steps: [
        {
          label: 'Analysis',
          content: 'AI analyzes requirements from natural language',
          timeEstimate: '5 minutes',
          tools: ['AI Assistant', 'Context Analysis']
        },
        {
          label: 'Generation',
          content: 'Auto-generate optimal project structure',
          timeEstimate: '10 minutes',
          tools: ['Code Generation', 'Best Practices']
        },
        {
          label: 'Configuration',
          content: 'Intelligent environment setup',
          timeEstimate: '15 minutes',
          tools: ['Auto-Config', 'Dependency Management']
        }
      ],
      totalTime: '30 minutes',
      complexity: 'Low',
      errorRate: '3%'
    },
    metrics: {
      timeReduction: '95%',
      errorReduction: '88%',
      satisfactionIncrease: '340%'
    }
  },
  {
    id: 'code-review',
    title: 'Code Review Process',
    humanInterface: {
      title: 'Manual Code Review',
      description: 'Traditional peer review process',
      steps: [
        {
          label: 'Assignment',
          content: 'Manually assign reviewers based on availability',
          timeEstimate: '30 minutes',
          tools: ['Email', 'Calendar', 'Project Management']
        },
        {
          label: 'Review',
          content: 'Manual code analysis and feedback',
          timeEstimate: '2-4 hours',
          tools: ['Code Editor', 'Git', 'Documentation']
        },
        {
          label: 'Discussion',
          content: 'Back-and-forth communication on changes',
          timeEstimate: '1-2 hours',
          tools: ['Comments', 'Meetings', 'Chat']
        }
      ],
      totalTime: '3.5-6.5 hours',
      complexity: 'Medium',
      consistency: '65%'
    },
    aiInterface: {
      title: 'AI-Enhanced Code Review',
      description: 'Intelligent automated review with human oversight',
      steps: [
        {
          label: 'Smart Assignment',
          content: 'AI matches expertise to code changes',
          timeEstimate: '2 minutes',
          tools: ['AI Matching', 'Expertise Analysis']
        },
        {
          label: 'Automated Analysis',
          content: 'AI pre-screens for common issues and patterns',
          timeEstimate: '15 minutes',
          tools: ['Pattern Recognition', 'Best Practice Checking']
        },
        {
          label: 'Focused Review',
          content: 'Human reviewer focuses on high-level concerns',
          timeEstimate: '45 minutes',
          tools: ['AI Insights', 'Contextual Comments']
        }
      ],
      totalTime: '1 hour',
      complexity: 'Low',
      consistency: '94%'
    },
    metrics: {
      timeReduction: '83%',
      qualityIncrease: '45%',
      consistencyIncrease: '45%'
    }
  },
  {
    id: 'debugging',
    title: 'Bug Investigation',
    humanInterface: {
      title: 'Manual Debugging',
      description: 'Traditional debugging and troubleshooting',
      steps: [
        {
          label: 'Detection',
          content: 'User reports or manual discovery of bugs',
          timeEstimate: '1-3 hours',
          tools: ['User Reports', 'Testing', 'Monitoring']
        },
        {
          label: 'Investigation',
          content: 'Manual code tracing and log analysis',
          timeEstimate: '2-8 hours',
          tools: ['Debugger', 'Log Files', 'Code Analysis']
        },
        {
          label: 'Resolution',
          content: 'Fix implementation and testing',
          timeEstimate: '1-4 hours',
          tools: ['Code Editor', 'Testing', 'Deployment']
        }
      ],
      totalTime: '4-15 hours',
      complexity: 'High',
      successRate: '75%'
    },
    aiInterface: {
      title: 'AI-Powered Debugging',
      description: 'Intelligent issue detection and resolution',
      steps: [
        {
          label: 'Proactive Detection',
          content: 'AI monitors and predicts issues before they occur',
          timeEstimate: '5 minutes',
          tools: ['AI Monitoring', 'Predictive Analysis']
        },
        {
          label: 'Root Cause Analysis',
          content: 'AI traces issue to exact source with context',
          timeEstimate: '20 minutes',
          tools: ['Pattern Matching', 'Context Analysis']
        },
        {
          label: 'Guided Resolution',
          content: 'AI suggests fixes with confidence scores',
          timeEstimate: '30 minutes',
          tools: ['Solution Generation', 'Impact Assessment']
        }
      ],
      totalTime: '55 minutes',
      complexity: 'Low',
      successRate: '92%'
    },
    metrics: {
      timeReduction: '91%',
      detectionSpeed: '480%',
      resolutionAccuracy: '23%'
    }
  }
];

// Default story
export const Default = Template.bind({});
Default.args = {
  scenarios: sampleScenarios,
  initialMode: 'human',
  autoDemo: false,
  demoDuration: 4000,
};

// Auto demo mode
export const AutoDemo = Template.bind({});
AutoDemo.args = {
  ...Default.args,
  autoDemo: true,
  demoDuration: 3000,
};

// Start with AI mode
export const AIFirst = Template.bind({});
AIFirst.args = {
  ...Default.args,
  initialMode: 'ai',
};

// Single scenario focus
export const SingleScenario = Template.bind({});
SingleScenario.args = {
  scenarios: [sampleScenarios[0]], // Just project setup
  initialMode: 'human',
  autoDemo: false,
};

// Fast transition demo
export const FastDemo = Template.bind({});
FastDemo.args = {
  ...Default.args,
  autoDemo: true,
  demoDuration: 2000,
};

// Simplified scenarios
export const SimpleScenarios = Template.bind({});
SimpleScenarios.args = {
  scenarios: [
    {
      id: 'simple-task',
      title: 'Task Management',
      humanInterface: {
        title: 'Manual Task Tracking',
        description: 'Spreadsheet-based task management',
        steps: [
          { label: 'Create', content: 'Manual task entry', timeEstimate: '5 min' },
          { label: 'Track', content: 'Update status manually', timeEstimate: '10 min' },
          { label: 'Report', content: 'Generate reports manually', timeEstimate: '30 min' }
        ],
        totalTime: '45 minutes',
        complexity: 'Medium'
      },
      aiInterface: {
        title: 'AI Task Management',
        description: 'Intelligent automated task handling',
        steps: [
          { label: 'Create', content: 'Voice/text to task conversion', timeEstimate: '30 sec' },
          { label: 'Track', content: 'Auto-status detection', timeEstimate: 'Real-time' },
          { label: 'Report', content: 'Instant intelligent reports', timeEstimate: '5 sec' }
        ],
        totalTime: '35 seconds',
        complexity: 'Low'
      },
      metrics: {
        timeReduction: '98%',
        accuracyIncrease: '56%'
      }
    }
  ],
  initialMode: 'human',
  autoDemo: false,
};

// Mobile preview
export const MobilePreview = Template.bind({});
MobilePreview.args = {
  ...SimpleScenarios.args,
};
MobilePreview.parameters = {
  viewport: {
    defaultViewport: 'mobile1',
  },
};