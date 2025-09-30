import React from 'react';
import BulletList from '../../src/components/custom/bullet-list';

export default {
  title: 'Custom/BulletList',
  component: BulletList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A customizable bullet list component that renders an array of strings as a bulleted list with flexible styling options and accessibility support.'
      }
    }
  },
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of strings to display as bullet points'
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the list container'
    },
    listItemClassName: {
      control: 'text',
      description: 'CSS classes for individual list items'
    }
  },
  tags: ['autodocs']
};

// Default story with basic bullet list
export const Default = {
  args: {
    items: [
      "First bullet point with standard styling",
      "Second item demonstrating consistent formatting",
      "Third item showing list structure",
      "Fourth item with longer content to demonstrate text wrapping and line height behavior"
    ]
  }
};

// Story showing empty state behavior
export const EmptyList = {
  args: {
    items: []
  },
  parameters: {
    docs: {
      description: {
        story: 'When no items are provided, the component renders nothing (null).'
      }
    }
  }
};

// Story with custom styling
export const WithCustomStyling = {
  args: {
    items: [
      "Custom styled bullet point",
      "Another styled item",
      "Third styled entry"
    ],
    className: "list-none pl-4 space-y-3 text-blue-600",
    listItemClassName: "relative pl-6 text-lg font-medium before:content-['→'] before:absolute before:left-0 before:text-blue-800 before:font-bold"
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates custom styling with arrow bullets and blue color scheme.'
      }
    }
  }
};

// Story demonstrating different spacing options
export const DifferentSpacing = () => (
  <div className="space-y-8">
    <div>
      <h3 className="text-lg font-semibold mb-2">Tight Spacing</h3>
      <BulletList
        items={["Tight spacing item 1", "Tight spacing item 2", "Tight spacing item 3"]}
        className="space-y-1"
        listItemClassName="text-sm"
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-2">Normal Spacing (Default)</h3>
      <BulletList
        items={["Normal spacing item 1", "Normal spacing item 2", "Normal spacing item 3"]}
      />
    </div>

    <div>
      <h3 className="text-lg font-semibold mb-2">Loose Spacing</h3>
      <BulletList
        items={["Loose spacing item 1", "Loose spacing item 2", "Loose spacing item 3"]}
        className="space-y-4"
        listItemClassName="text-base leading-loose"
      />
    </div>
  </div>
);

DifferentSpacing.parameters = {
  docs: {
    description: {
      story: 'Shows different spacing configurations: tight, normal (default), and loose.'
    }
  }
};

// Story with technical features list
export const TechnicalFeatures = {
  args: {
    items: [
      "React component with PropTypes validation",
      "Responsive design with Tailwind CSS classes",
      "Accessible markup with semantic HTML",
      "Conditional rendering for empty states",
      "Flexible styling through className props",
      "TypeScript-ready with proper prop definitions"
    ],
    className: "list-disc pl-6 space-y-2 text-gray-700",
    listItemClassName: "text-sm leading-relaxed hover:text-gray-900 transition-colors"
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing technical features with interactive hover effects.'
      }
    }
  }
};

// Story with project skills/tasks
export const ProjectTasks = {
  args: {
    items: [
      "Design user interface mockups and wireframes",
      "Implement responsive React components",
      "Set up state management with Redux or Context",
      "Create comprehensive test suites with Jest",
      "Optimize performance with code splitting",
      "Deploy to production with CI/CD pipeline"
    ],
    className: "list-disc pl-6 space-y-2 bg-gray-50 p-4 rounded-lg",
    listItemClassName: "text-sm text-gray-800 leading-relaxed"
  },
  parameters: {
    docs: {
      description: {
        story: 'Project task list with background styling and contained layout.'
      }
    }
  }
};

// Story with long content items
export const LongContentItems = {
  args: {
    items: [
      "This is a longer bullet point that demonstrates how the component handles text wrapping and maintains proper line spacing when content extends beyond a single line",
      "Another extended item that shows consistent formatting and readability across multiple lines of text with proper indentation",
      "A third lengthy bullet point that validates the component's ability to maintain visual hierarchy and readability even with substantial content in each list item",
      "Short item",
      "Final extended bullet point demonstrating that mixed content lengths work well together in the same list structure"
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests the component with longer text content to show text wrapping and line spacing behavior.'
      }
    }
  }
};

// Story showing single item list
export const SingleItem = {
  args: {
    items: ["Single bullet point item"]
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows how the component renders with just one item.'
      }
    }
  }
};

// Story with various content types
export const VariousContentTypes = {
  args: {
    items: [
      "Text-only bullet point",
      "Item with numbers: 123, 456, 789",
      "Special characters: @#$%^&*()",
      "Mixed content: Visit https://example.com for more info",
      "Item with quotes: 'This is quoted text'",
      "Unicode content: ★ ♥ ✓ → ← ↑ ↓"
    ]
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the component handles various types of content including special characters and mixed formatting.'
      }
    }
  }
};

// Responsive behavior story
export const ResponsiveBehavior = () => (
  <div className="space-y-8">
    <div className="w-full max-w-xs mx-auto">
      <h3 className="text-lg font-semibold mb-2">Mobile Width (xs)</h3>
      <BulletList
        items={[
          "Mobile-optimized bullet point",
          "Responsive text that adapts to narrow screens",
          "Proper spacing on small devices"
        ]}
        className="text-sm"
      />
    </div>

    <div className="w-full max-w-md mx-auto">
      <h3 className="text-lg font-semibold mb-2">Tablet Width (md)</h3>
      <BulletList
        items={[
          "Tablet-friendly bullet point with medium width",
          "Content that looks good on medium-sized screens",
          "Balanced spacing for tablet viewing"
        ]}
        className="text-base"
      />
    </div>

    <div className="w-full max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold mb-2">Desktop Width (xl)</h3>
      <BulletList
        items={[
          "Desktop-optimized bullet point with full width utilization",
          "Content that takes advantage of larger screen real estate",
          "Comfortable spacing and typography for desktop viewing experience"
        ]}
        className="text-lg"
      />
    </div>
  </div>
);

ResponsiveBehavior.parameters = {
  docs: {
    description: {
      story: 'Shows how the component behaves at different screen widths and with different text sizes.'
    }
  }
};