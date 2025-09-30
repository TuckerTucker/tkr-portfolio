import React from 'react';
import { ThemeToggle } from '../../src/components/ui/theme-toggle';
import { ThemeProvider } from '../../src/hooks/useTheme';

// Wrapper component to provide theme context
const ThemeWrapper = ({ children, initialTheme = 'system' }) => {
  return (
    <div className="p-4">
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </div>
  );
};

// Background wrapper for different contexts
const BackgroundWrapper = ({ children, background = 'light' }) => {
  const bgClasses = {
    light: 'bg-gradient-to-r from-blue-500 to-purple-600 p-8 rounded-lg',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900 p-8 rounded-lg',
    transparent: 'bg-transparent p-8',
    header: 'bg-gradient-to-r from-indigo-600 to-purple-700 p-4 flex items-center justify-between rounded-lg'
  };

  return (
    <div className={bgClasses[background]}>
      {children}
    </div>
  );
};

export default {
  title: 'UI/ThemeToggle',
  component: ThemeToggle,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
A theme toggle component for switching between light, dark, and system themes.

**Features:**
- Three theme modes: Light, Dark, and System (follows OS preference)
- Persists selection to localStorage
- Accessible with proper ARIA labels and screen reader support
- Keyboard navigation support (Tab to focus, Space/Enter to activate)
- Visual feedback with active states and hover effects
- Icons change based on selected theme

**Accessibility:**
- Each button has aria-label for screen readers
- Hidden text with sr-only class provides additional context
- Focus states are clearly visible
- Keyboard navigation follows standard patterns

**Theme Management:**
- System theme automatically follows OS dark/light mode preference
- Theme changes are applied to document root for CSS variable support
- State is synchronized across all instances via context
        `
      }
    },
    backgrounds: {
      default: 'gradient',
      values: [
        { name: 'gradient', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ]
    }
  },
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the component'
    }
  },
  decorators: [
    (Story, context) => (
      <ThemeWrapper initialTheme={context.args.defaultTheme}>
        <Story />
      </ThemeWrapper>
    )
  ],
  tags: ['autodocs']
};

// Default story - basic theme toggle
export const Default = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <ThemeToggle {...args} />
    </BackgroundWrapper>
  )
};

// Light mode context - showing how it looks in light environments
export const LightMode = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Light Context</h3>
          <p className="text-white/80 text-sm">Theme toggle in a light colored background</p>
        </div>
        <ThemeToggle {...args} />
      </div>
    </BackgroundWrapper>
  )
};

// Dark mode context - showing how it looks in dark environments
export const DarkMode = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="dark">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Dark Context</h3>
          <p className="text-white/80 text-sm">Theme toggle in a dark colored background</p>
        </div>
        <ThemeToggle {...args} />
      </div>
    </BackgroundWrapper>
  )
};

// System mode demonstration
export const SystemMode = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">System Preference</h3>
          <p className="text-white/80 text-sm">
            Automatically follows your operating system's theme preference
          </p>
          <p className="text-white/60 text-xs mt-1">
            Try changing your system theme to see the toggle update automatically
          </p>
        </div>
        <ThemeToggle {...args} />
      </div>
    </BackgroundWrapper>
  )
};

// With custom styling
export const CustomStyling = {
  args: {
    className: 'bg-black/30 backdrop-blur-sm border border-white/20'
  },
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Custom Styling</h3>
          <p className="text-white/80 text-sm">
            Theme toggle with custom background and border
          </p>
        </div>
        <ThemeToggle {...args} />
      </div>
    </BackgroundWrapper>
  )
};

// In header context - practical usage example
export const InHeader = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="header">
      <div className="flex items-center justify-between w-full max-w-4xl">
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-white/20 rounded-full"></div>
          <h1 className="text-white text-xl font-bold">My Portfolio</h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-white/90 hover:text-white transition-colors">Home</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">About</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">Projects</a>
          <a href="#" className="text-white/90 hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center space-x-4">
          <ThemeToggle {...args} />
          <button className="text-white/90 hover:text-white">
            <span className="sr-only">Menu</span>
            ☰
          </button>
        </div>
      </div>
    </BackgroundWrapper>
  )
};

// Multiple toggles showing sync
export const MultipleToggles = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Synchronized Toggles</h3>
          <p className="text-white/80 text-sm">
            Multiple theme toggles stay synchronized via context
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white text-sm mb-3">Header Toggle</p>
            <ThemeToggle {...args} />
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white text-sm mb-3">Sidebar Toggle</p>
            <ThemeToggle {...args} />
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white text-sm mb-3">Settings Toggle</p>
            <ThemeToggle {...args} className="bg-black/20" />
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <p className="text-white text-sm mb-3">Mobile Toggle</p>
            <ThemeToggle {...args} />
          </div>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-xs">
            Click any toggle - they all update together!
          </p>
        </div>
      </div>
    </BackgroundWrapper>
  )
};

// Responsive demonstration
export const Responsive = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Responsive Behavior</h3>
          <p className="text-white/80 text-sm">
            Theme toggle adapts to different screen sizes
          </p>
        </div>

        {/* Desktop view */}
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-white text-sm mb-3">Desktop View (Normal)</p>
          <ThemeToggle {...args} />
        </div>

        {/* Tablet view */}
        <div className="bg-white/10 rounded-lg p-4 max-w-md">
          <p className="text-white text-sm mb-3">Tablet View</p>
          <ThemeToggle {...args} />
        </div>

        {/* Mobile view */}
        <div className="bg-white/10 rounded-lg p-4 max-w-xs">
          <p className="text-white text-sm mb-3">Mobile View</p>
          <ThemeToggle {...args} />
        </div>
      </div>
    </BackgroundWrapper>
  )
};

// Accessibility demonstration
export const AccessibilityDemo = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-6 max-w-2xl">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Accessibility Features</h3>
          <p className="text-white/80 text-sm">
            Full keyboard and screen reader support
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-white font-medium mb-3">Keyboard Navigation:</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Tab: Focus the toggle group</li>
                <li>• Space/Enter: Activate focused button</li>
                <li>• Arrow keys: Navigate between options</li>
                <li>• Shift+Tab: Move to previous element</li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-3">Screen Reader:</h4>
              <ul className="text-white/80 text-sm space-y-1">
                <li>• Clear aria-labels for each button</li>
                <li>• Hidden descriptive text</li>
                <li>• Focus announcements</li>
                <li>• State change notifications</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <ThemeToggle {...args} />
          </div>

          <div className="mt-4 text-center">
            <p className="text-white/60 text-xs">
              Try navigating with Tab and activating with Space/Enter
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  )
};

// Focus states demonstration
export const FocusStates = {
  args: {},
  render: (args) => (
    <BackgroundWrapper background="light">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-white text-lg font-semibold mb-2">Focus States</h3>
          <p className="text-white/80 text-sm">
            Visual feedback for keyboard navigation
          </p>
        </div>

        <div className="flex justify-center">
          <div className="bg-white/10 rounded-lg p-6">
            <ThemeToggle {...args} />
            <p className="text-white/60 text-xs mt-4 text-center">
              Use Tab to focus and see the focus ring
            </p>
          </div>
        </div>
      </div>
    </BackgroundWrapper>
  )
};