import { Button } from '../../src/components/ui/button';
import { Mail, Loader2, ChevronRight, Download } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon']
    },
    asChild: {
      control: { type: 'boolean' }
    },
    disabled: {
      control: { type: 'boolean' }
    }
  },
  tags: ['autodocs']
};

// Default story
export const Default = {
  args: {
    children: 'Button',
  },
};

// Playground story with all controls
export const Playground = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
    disabled: false,
    asChild: false,
  },
};

// All variants story
export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// All sizes story
export const Sizes = {
  render: () => (
    <div className="flex items-end gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">
        <ChevronRight />
      </Button>
    </div>
  ),
};

// With icon examples
export const WithIcon = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Mail />
        Login with Email
      </Button>
      <Button variant="outline">
        <Download />
        Download
      </Button>
      <Button variant="secondary" size="sm">
        <ChevronRight />
        Next
      </Button>
      <Button variant="ghost" size="lg">
        Settings
        <ChevronRight />
      </Button>
    </div>
  ),
};

// AsChild composition example
export const AsChild = {
  render: () => (
    <div className="flex gap-4">
      <Button asChild>
        <a href="https://example.com" target="_blank" rel="noopener noreferrer">
          External Link
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href="/internal-link">
          Internal Link
        </a>
      </Button>
    </div>
  ),
};

// Disabled state example
export const Disabled = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Default Disabled</Button>
      <Button variant="destructive" disabled>Destructive Disabled</Button>
      <Button variant="outline" disabled>Outline Disabled</Button>
      <Button variant="secondary" disabled>Secondary Disabled</Button>
      <Button variant="ghost" disabled>Ghost Disabled</Button>
      <Button variant="link" disabled>Link Disabled</Button>
    </div>
  ),
};

// Loading state with spinner
export const Loading = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>
        <Loader2 className="animate-spin" />
        Please wait
      </Button>
      <Button variant="outline" disabled>
        <Loader2 className="animate-spin" />
        Loading...
      </Button>
      <Button variant="secondary" size="sm" disabled>
        <Loader2 className="animate-spin" />
        Save
      </Button>
      <Button size="icon" disabled>
        <Loader2 className="animate-spin" />
      </Button>
    </div>
  ),
};