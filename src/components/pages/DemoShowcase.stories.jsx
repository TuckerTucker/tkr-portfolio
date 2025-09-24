import { BrowserRouter } from 'react-router-dom';
import DemoShowcase from './DemoShowcase';

export default {
  title: 'Pages/Demo Showcase',
  component: DemoShowcase,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Main demo showcase page featuring all three interactive AI skills demonstrations with navigation and descriptions.',
      },
    },
  },
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Story />
      </BrowserRouter>
    ),
  ],
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

export const Overview = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The main showcase page showing all three demo cards with descriptions and launch buttons.',
      },
    },
  },
};