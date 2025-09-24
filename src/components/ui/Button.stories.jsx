import { Button } from './button';
import { Plus, Download, Mail, ArrowRight, Heart, Star, Settings } from 'lucide-react';

export default {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Versatile button component with multiple variants, sizes, and accessibility features.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'Button style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
    },
    asChild: {
      control: 'boolean',
      description: 'Render as child element (Radix Slot)',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
  },
};

const Template = (args) => <Button {...args} />;

// Default button
export const Default = Template.bind({});
Default.args = {
  children: 'Button',
};

// All variants
export const Variants = () => (
  <div className="flex flex-wrap gap-4">
    <Button variant="default">Default</Button>
    <Button variant="destructive">Destructive</Button>
    <Button variant="outline">Outline</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="link">Link</Button>
  </div>
);

// All sizes
export const Sizes = () => (
  <div className="flex items-center gap-4">
    <Button size="sm">Small</Button>
    <Button size="default">Default</Button>
    <Button size="lg">Large</Button>
    <Button size="icon">
      <Plus />
    </Button>
  </div>
);

// With icons
export const WithIcons = () => (
  <div className="flex flex-wrap gap-4">
    <Button>
      <Plus />
      Add Item
    </Button>
    <Button variant="outline">
      <Download />
      Download
    </Button>
    <Button variant="secondary">
      <Mail />
      Email
    </Button>
    <Button variant="ghost">
      Continue
      <ArrowRight />
    </Button>
  </div>
);

// Icon buttons
export const IconButtons = () => (
  <div className="flex gap-4">
    <Button size="icon" variant="default">
      <Heart />
    </Button>
    <Button size="icon" variant="outline">
      <Star />
    </Button>
    <Button size="icon" variant="secondary">
      <Settings />
    </Button>
    <Button size="icon" variant="ghost">
      <Plus />
    </Button>
  </div>
);

// States
export const States = () => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-4">
      <Button>Normal</Button>
      <Button disabled>Disabled</Button>
    </div>
    <div className="flex gap-4">
      <Button variant="outline">Outline Normal</Button>
      <Button variant="outline" disabled>Outline Disabled</Button>
    </div>
    <div className="flex gap-4">
      <Button variant="destructive">Destructive</Button>
      <Button variant="destructive" disabled>Destructive Disabled</Button>
    </div>
  </div>
);

// Interactive examples
export const Loading = () => (
  <div className="flex gap-4">
    <Button disabled>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      Loading...
    </Button>
    <Button variant="outline" disabled>
      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
      Processing...
    </Button>
  </div>
);

// As links using asChild
export const AsLinks = () => (
  <div className="flex gap-4">
    <Button asChild>
      <a href="#" role="button">
        Link Button
      </a>
    </Button>
    <Button asChild variant="outline">
      <a href="#" role="button">
        <ArrowRight />
        External Link
      </a>
    </Button>
  </div>
);

// Accessibility showcase
export const Accessibility = () => (
  <div className="flex flex-col gap-4">
    <div className="flex gap-4">
      <Button aria-label="Close dialog">
        ×
      </Button>
      <Button aria-describedby="help-text">
        Need Help?
      </Button>
    </div>
    <p id="help-text" className="text-sm text-muted-foreground">
      This button provides additional help information
    </p>
  </div>
);

// Form integration
export const FormIntegration = () => (
  <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-4 p-4 border rounded-md max-w-sm">
    <input
      type="text"
      placeholder="Enter your name"
      className="px-3 py-2 border rounded-md"
    />
    <input
      type="email"
      placeholder="Enter your email"
      className="px-3 py-2 border rounded-md"
    />
    <div className="flex gap-2">
      <Button type="submit">Submit</Button>
      <Button type="button" variant="outline">Cancel</Button>
      <Button type="reset" variant="ghost">Reset</Button>
    </div>
  </form>
);