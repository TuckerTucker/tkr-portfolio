import { ThemeToggle } from './theme-toggle';

export default {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Three-way theme toggle component supporting light, system, and dark modes with smooth transitions.',
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

const Template = (args) => <ThemeToggle {...args} />;

// Default theme toggle
export const Default = Template.bind({});
Default.args = {};

// With custom styling
export const CustomStyling = Template.bind({});
CustomStyling.args = {
  className: 'bg-gray-200 dark:bg-gray-800',
};

// In different contexts
export const InNavbar = () => (
  <div className="bg-primary text-primary-foreground p-4 rounded-lg">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold">Application Header</h3>
      <ThemeToggle />
    </div>
  </div>
);

export const InSidebar = () => (
  <div className="bg-card border rounded-lg p-4 w-64">
    <div className="space-y-4">
      <h3 className="font-semibold">Settings</h3>
      <div className="space-y-2">
        <label className="text-sm font-medium">Theme Preference</label>
        <ThemeToggle />
      </div>
    </div>
  </div>
);

export const InFooter = () => (
  <footer className="bg-muted p-4 rounded-lg">
    <div className="flex items-center justify-between">
      <p className="text-sm text-muted-foreground">© 2024 Your Company</p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Theme:</span>
        <ThemeToggle className="bg-background/50" />
      </div>
    </div>
  </footer>
);

// Accessibility showcase
export const AccessibilityDemo = () => (
  <div className="space-y-4">
    <div>
      <h3 className="font-semibold mb-2">Theme Toggle with Label</h3>
      <div className="flex items-center gap-3">
        <label htmlFor="theme-toggle" className="text-sm font-medium">
          Choose theme:
        </label>
        <ThemeToggle />
      </div>
    </div>
    <div className="text-sm text-muted-foreground space-y-1">
      <p>• Use Tab to focus on theme buttons</p>
      <p>• Use Enter or Space to activate</p>
      <p>• Screen readers announce current theme</p>
    </div>
  </div>
);

// Responsive demo
export const ResponsiveDemo = () => (
  <div className="space-y-4">
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <span className="text-sm font-medium">Desktop:</span>
      <ThemeToggle />
    </div>
    <div className="flex flex-col items-start gap-4">
      <span className="text-sm font-medium">Mobile (try resizing):</span>
      <ThemeToggle className="scale-110" />
    </div>
  </div>
);

// Theme showcase
export const ThemeShowcase = () => (
  <div className="space-y-6">
    <div className="text-center">
      <h3 className="font-semibold mb-2">Theme Toggle</h3>
      <ThemeToggle />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-1">☀️ Light Mode</h4>
        <p className="text-muted-foreground">Bright, clean interface</p>
      </div>
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-1">💻 System Mode</h4>
        <p className="text-muted-foreground">Follows device preference</p>
      </div>
      <div className="p-3 border rounded-lg">
        <h4 className="font-medium mb-1">🌙 Dark Mode</h4>
        <p className="text-muted-foreground">Easy on the eyes</p>
      </div>
    </div>
  </div>
);