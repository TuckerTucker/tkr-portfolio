import TaskBoardAIDemo from './TaskBoardAIDemo';

export default {
  title: 'AI Skills/TaskBoard AI Demo',
  component: TaskBoardAIDemo,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive kanban board with drag-and-drop functionality, markdown-to-JSON conversion, and dual interface switching.',
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

export const HumanView = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'The default human visual interface showing the kanban board with drag-and-drop capabilities.',
      },
    },
  },
};

export const AIView = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Switch to AI structured view to see the JSON data representation of the task board.',
      },
    },
  },
};

export const Interactive = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: 'Drag tasks between columns, switch views, and try the markdown conversion demo.',
      },
    },
  },
};