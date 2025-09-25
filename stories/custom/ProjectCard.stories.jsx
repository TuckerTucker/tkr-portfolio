import React from 'react';
import ProjectCard from '../../src/components/custom/project-card.jsx';

export default {
  title: 'Custom/ProjectCard',
  component: ProjectCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A project selector card component for displaying project information with logos, colors, and metadata. Designed for dropdown/selection interfaces with mobile-first responsive design.'
      }
    }
  },
  argTypes: {
    id: { control: 'text', description: 'Unique identifier for the project' },
    title: { control: 'text', description: 'Project title' },
    subtitle: { control: 'text', description: 'Project subtitle or description' },
    color: { control: 'color', description: 'Background color for the card' },
    logoUrl: { control: 'text', description: 'URL path to project logo (relative to BASE_URL)' },
    isMobile: { control: 'boolean', description: 'Enable mobile-optimized layout' },
    onClick: { action: 'clicked', description: 'Click handler function' },
    className: { control: 'text', description: 'Additional CSS classes' }
  },
  tags: ['autodocs']
};

// Template for creating stories
const Template = (args) => <ProjectCard {...args} />;

// Sample project data for realistic examples
const sampleProjects = [
  {
    id: 'ecommerce-platform',
    title: 'E-commerce Platform',
    subtitle: 'Full-stack React & Node.js solution',
    color: '#3B82F6',
    logoUrl: 'logos/ecommerce.png'
  },
  {
    id: 'portfolio-website',
    title: 'Portfolio Website',
    subtitle: 'Modern React portfolio with animations',
    color: '#8B5CF6',
    logoUrl: 'logos/portfolio.png'
  },
  {
    id: 'mobile-app',
    title: 'Mobile Banking App',
    subtitle: 'React Native fintech application',
    color: '#10B981',
    logoUrl: 'logos/banking.png'
  },
  {
    id: 'ai-dashboard',
    title: 'AI Analytics Dashboard',
    subtitle: 'Machine learning data visualization',
    color: '#F59E0B',
    logoUrl: 'logos/ai.png'
  },
  {
    id: 'social-platform',
    title: 'Social Media Platform',
    subtitle: 'Real-time messaging and content sharing',
    color: '#EF4444',
    logoUrl: 'logos/social.png'
  }
];

// Story 1: Default - Basic project card with standard props
export const Default = Template.bind({});
Default.args = {
  id: sampleProjects[0].id,
  title: sampleProjects[0].title,
  subtitle: sampleProjects[0].subtitle,
  color: sampleProjects[0].color,
  logoUrl: sampleProjects[0].logoUrl,
  isMobile: false
};

// Story 2: Featured - Project card with vibrant styling
export const Featured = Template.bind({});
Featured.args = {
  id: sampleProjects[3].id,
  title: sampleProjects[3].title,
  subtitle: sampleProjects[3].subtitle,
  color: '#6366F1',
  logoUrl: sampleProjects[3].logoUrl,
  isMobile: false,
  className: 'shadow-lg border-2 border-white/20'
};

// Story 3: WithoutLogo - Project card without logo image
export const WithoutLogo = Template.bind({});
WithoutLogo.args = {
  id: 'no-logo-project',
  title: 'Startup MVP',
  subtitle: 'Rapid prototype development',
  color: '#14B8A6',
  logoUrl: null, // No logo provided
  isMobile: false
};

// Story 4: MobileLayout - Mobile-optimized version
export const MobileLayout = Template.bind({});
MobileLayout.args = {
  id: sampleProjects[1].id,
  title: sampleProjects[1].title,
  subtitle: sampleProjects[1].subtitle,
  color: sampleProjects[1].color,
  logoUrl: sampleProjects[1].logoUrl,
  isMobile: true
};
MobileLayout.parameters = {
  viewport: {
    defaultViewport: 'mobile1'
  }
};

// Story 5: InteractiveStates - Demonstrates click interaction
export const Interactive = Template.bind({});
Interactive.args = {
  id: sampleProjects[2].id,
  title: sampleProjects[2].title,
  subtitle: sampleProjects[2].subtitle,
  color: sampleProjects[2].color,
  logoUrl: sampleProjects[2].logoUrl,
  isMobile: false,
  className: 'hover:scale-105 hover:shadow-xl transition-all duration-300'
};

// Story 6: LongContent - Card with lengthy text content
export const LongContent = Template.bind({});
LongContent.args = {
  id: 'complex-project',
  title: 'Enterprise Resource Planning System',
  subtitle: 'Comprehensive business management solution with advanced analytics and reporting capabilities',
  color: '#7C3AED',
  logoUrl: 'logos/enterprise.png',
  isMobile: false
};

// Story 7: GridLayout - Multiple cards in responsive grid
export const GridLayout = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 max-w-6xl">
    {sampleProjects.map((project) => (
      <ProjectCard
        key={project.id}
        id={project.id}
        title={project.title}
        subtitle={project.subtitle}
        color={project.color}
        logoUrl={project.logoUrl}
        onClick={(data) => console.log('Selected project:', data)}
      />
    ))}
  </div>
);
GridLayout.parameters = {
  layout: 'fullscreen',
  docs: {
    description: {
      story: 'Multiple ProjectCard components arranged in a responsive grid layout'
    }
  }
};

// Story 8: ColorVariations - Different color schemes
export const ColorVariations = () => {
  const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD'  // Purple
  ];

  return (
    <div className="space-y-2 p-4">
      {colors.map((color, index) => (
        <ProjectCard
          key={index}
          id={`color-demo-${index}`}
          title={`Project ${index + 1}`}
          subtitle="Color variation demonstration"
          color={color}
          logoUrl={null}
          onClick={(data) => console.log('Selected:', data)}
        />
      ))}
    </div>
  );
};
ColorVariations.parameters = {
  layout: 'fullscreen',
  docs: {
    description: {
      story: 'ProjectCard components showcasing different color schemes'
    }
  }
};

// Story 9: ResponsiveComparison - Mobile vs Desktop side by side
export const ResponsiveComparison = () => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-4">
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Desktop Layout</h3>
      <ProjectCard
        id="desktop-demo"
        title="Desktop Project Card"
        subtitle="Full-sized layout with all elements visible"
        color="#8B5CF6"
        logoUrl="logos/desktop.png"
        isMobile={false}
      />
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-700">Mobile Layout</h3>
      <ProjectCard
        id="mobile-demo"
        title="Mobile Project Card"
        subtitle="Compact layout optimized for touch"
        color="#8B5CF6"
        logoUrl="logos/mobile.png"
        isMobile={true}
      />
    </div>
  </div>
);
ResponsiveComparison.parameters = {
  layout: 'fullscreen',
  docs: {
    description: {
      story: 'Side-by-side comparison of desktop and mobile layouts'
    }
  }
};

// Story 10: LoadingState - Simulated loading appearance
export const LoadingState = Template.bind({});
LoadingState.args = {
  id: 'loading-project',
  title: 'Loading...',
  subtitle: 'Please wait',
  color: '#6B7280',
  logoUrl: null,
  isMobile: false,
  className: 'animate-pulse opacity-60'
};

// Story 11: WithCustomStyling - Heavily customized appearance
export const WithCustomStyling = Template.bind({});
WithCustomStyling.args = {
  id: 'custom-styled',
  title: 'Custom Styled Project',
  subtitle: 'Demonstrating style customization',
  color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  logoUrl: 'logos/custom.png',
  isMobile: false,
  className: 'border-4 border-white rounded-lg shadow-2xl transform hover:rotate-1 transition-all duration-300'
};

// Story 12: AccessibilityFocused - Demonstrates accessibility features
export const AccessibilityFocused = Template.bind({});
AccessibilityFocused.args = {
  id: 'accessible-project',
  title: 'Accessible Web App',
  subtitle: 'WCAG 2.1 AA compliant application',
  color: '#059669',
  logoUrl: 'logos/accessibility.png',
  isMobile: false,
  className: 'focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50'
};
AccessibilityFocused.parameters = {
  docs: {
    description: {
      story: 'ProjectCard with enhanced accessibility features including focus states and ARIA attributes'
    }
  }
};