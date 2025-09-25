import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction
} from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';

export default {
  title: 'UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A flexible card component with header, content, and footer sections. Built with a compound component pattern for maximum flexibility.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    className: {
      control: 'text',
      description: 'Additional CSS classes to apply to the card'
    }
  }
};

// Default story with all sections
export const Default = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>
          This is a description that provides more context about the card content.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>This is the main content area of the card. You can put any content here including text, images, forms, or other components.</p>
      </CardContent>
      <CardFooter>
        <Button>Primary Action</Button>
        <Button variant="outline">Secondary</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A complete card with header, content, and footer sections.'
      }
    }
  }
};

// Simple card with just content
export const Simple = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardContent>
        <p>This is a simple card with just content. Perfect for basic information display.</p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A minimal card with just content, no header or footer.'
      }
    }
  }
};

// Card with header and title
export const WithHeader = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Project Analytics</CardTitle>
        <CardDescription>
          Overview of your project performance metrics for this month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Views</span>
            <span className="font-semibold">12,345</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Conversions</span>
            <span className="font-semibold">1,234</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Success Rate</span>
            <span className="font-semibold">10.0%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A card with header containing title and description, plus structured content.'
      }
    }
  }
};

// Card with footer actions
export const WithFooter = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardContent>
        <h3 className="font-semibold mb-2">Confirm Action</h3>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to proceed with this action? This cannot be undone.
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="destructive">Delete</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A card with footer containing action buttons, useful for confirmations and forms.'
      }
    }
  }
};

// Interactive card with hover effects
export const Interactive = {
  render: (args) => (
    <Card {...args} className="w-80 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]">
      <CardHeader>
        <CardTitle>Interactive Card</CardTitle>
        <CardDescription>
          This card responds to hover interactions with subtle animations.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          Hover over this card to see the interactive effects in action. Great for clickable content.
        </p>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A card with hover effects and interactive styling, perfect for clickable content.'
      }
    }
  }
};

// Multiple cards in a grid
export const Nested = {
  render: (args) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feature A</CardTitle>
          <CardDescription>Description for feature A</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Content for the first feature card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Learn More</Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feature B</CardTitle>
          <CardDescription>Description for feature B</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Content for the second feature card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Learn More</Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feature C</CardTitle>
          <CardDescription>Description for feature C</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Content for the third feature card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Learn More</Button>
        </CardFooter>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Feature D</CardTitle>
          <CardDescription>Description for feature D</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm">Content for the fourth feature card.</p>
        </CardContent>
        <CardFooter>
          <Button size="sm">Learn More</Button>
        </CardFooter>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Multiple cards arranged in a responsive grid layout.'
      }
    }
  }
};

// Card with custom styling
export const CustomStyling = {
  render: (args) => (
    <div className="space-y-4">
      <Card className="w-80 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">Info Card</CardTitle>
          <CardDescription className="text-blue-700">
            A card with custom blue styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-blue-800 text-sm">
            This card demonstrates custom color theming using Tailwind classes.
          </p>
        </CardContent>
      </Card>

      <Card className="w-80 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">Success Card</CardTitle>
          <CardDescription className="text-green-700">
            A card with custom green styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-green-800 text-sm">
            Custom styling can be applied to create themed variants.
          </p>
        </CardContent>
      </Card>

      <Card className="w-80 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-900">Warning Card</CardTitle>
          <CardDescription className="text-red-700">
            A card with custom red styling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-800 text-sm">
            Perfect for alerts, warnings, or error states.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Cards with custom color theming to show styling flexibility.'
      }
    }
  }
};

// Card with complex content
export const ComplexContent = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
        <CardDescription>
          Complete user information and preferences
        </CardDescription>
        <CardAction>
          <Button variant="ghost" size="icon">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold">John Doe</h4>
              <p className="text-sm text-muted-foreground">john.doe@example.com</p>
            </div>
          </div>

          <div>
            <h5 className="font-medium mb-2">Recent Activity</h5>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Updated profile settings</li>
              <li>• Completed project milestone</li>
              <li>• Joined team collaboration</li>
            </ul>
          </div>

          <div>
            <h5 className="font-medium mb-2">Skills</h5>
            <div className="flex flex-wrap gap-1">
              {['JavaScript', 'React', 'TypeScript', 'Node.js'].map((skill) => (
                <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">View Full Profile</Button>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A card with rich, complex content including images, lists, tags, and actions.'
      }
    }
  }
};

// Card with action in header
export const WithHeaderAction = {
  render: (args) => (
    <Card {...args} className="w-96">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and settings
        </CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Email notifications</span>
            <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Dark mode</span>
            <div className="w-10 h-6 bg-gray-300 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Two-factor auth</span>
            <div className="w-10 h-6 bg-primary rounded-full flex items-center justify-end px-1">
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: 'A card with an action button in the header using CardAction component.'
      }
    }
  }
};