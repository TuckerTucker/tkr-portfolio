import ContextKitYamlEditor from './ContextKitYamlEditor';

export default {
  title: 'AI Skills/ContextKit YAML Editor',
  component: ContextKitYamlEditor,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive YAML optimization demo showing 1000→300 line compression with real-time syntax highlighting and metrics display.',
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

export const WithCustomStyling = {
  args: {
    className: 'bg-gray-50 dark:bg-gray-900 p-8 rounded-lg',
  },
};

export const Playground = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Try the optimization demo by clicking the "Run Optimization" button to see the YAML compression in action.',
      },
    },
  },
};