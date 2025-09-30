# AI Skills Components

This collection contains 5 core components designed to showcase Tucker's v2 AI capabilities and project impact. Each component is built with TypeScript interfaces, accessibility support, theme awareness, and mobile responsiveness.

## Components Overview

### 1. AIInteractionShowcase
**Purpose**: Side-by-side comparison of human vs AI interaction patterns

**Features**:
- Dual interface display (human vs AI)
- Sync indicators showing coordination
- Shared data visualization
- Mobile-responsive layout
- Real-time sync animations

**Usage**:
```jsx
import { AIInteractionShowcase } from '@/components/ai-skills';

<AIInteractionShowcase
  humanInterface={{
    title: "Manual Process",
    description: "Traditional workflow",
    elements: [
      { type: 'input', content: 'Manual data entry', action: 'Enter Data' }
    ],
    capabilities: ['Manual Entry', 'Email Communication']
  }}
  aiInterface={{
    title: "AI-Enhanced Process",
    description: "Automated workflow",
    elements: [
      { type: 'analysis', content: 'AI-powered analysis', action: 'Analyze' }
    ],
    capabilities: ['Auto-Processing', 'AI Analysis']
  }}
  sharedData={[
    { type: 'Metric', label: 'Efficiency', value: '300% improvement' }
  ]}
  showSync={true}
/>
```

### 2. DualInterfaceDemo
**Purpose**: Interactive toggle between human and AI views with smooth transitions

**Features**:
- Toggle between human and AI interfaces
- 200ms smooth transitions with ease-in-out
- Guided demo scenarios
- Real-time synchronization
- Auto-demo functionality

**Usage**:
```jsx
import { DualInterfaceDemo } from '@/components/ai-skills';

<DualInterfaceDemo
  scenarios={[
    {
      title: "Project Planning",
      description: "Compare planning approaches",
      human: {
        title: "Manual Planning",
        sections: [
          { type: 'input', title: 'Requirements', content: 'Gather manually...' }
        ],
        keyDifferences: ['Manual coordination', 'Time-intensive']
      },
      ai: {
        title: "AI-Enhanced Planning",
        sections: [
          { type: 'analysis', title: 'Auto-Analysis', content: 'AI processes...' }
        ],
        keyDifferences: ['Automated coordination', 'Real-time insights']
      }
    }
  ]}
  initialMode="human"
  autoDemo={false}
/>
```

### 3. ContextEvolutionSlide
**Purpose**: YAML optimization visualization showing evolution from 1000→300 lines

**Features**:
- Before/after YAML code comparison
- Syntax highlighting for YAML
- Metrics showing line reduction
- Problem/solution indicators
- Theme-aware code display
- Mobile toggle view

**Usage**:
```jsx
import { ContextEvolutionSlide } from '@/components/ai-skills';

<ContextEvolutionSlide
  beforeCode={`# Original 1000-line YAML
meta:
  name: "original-context"
  lines: 1000
# ... extensive YAML content`}
  afterCode={`# Optimized 300-line YAML
meta:
  name: "optimized-context"
  lines: 300
# ... condensed YAML content`}
  beforeMetrics={{
    lines: 1000,
    sections: 45,
    complexity: 8,
    maintainability: "45%"
  }}
  afterMetrics={{
    lines: 300,
    sections: 12,
    complexity: 3,
    maintainability: "92%"
  }}
  problems={[
    "Excessive redundancy in configuration",
    "Poor organization of related sections",
    "Unclear dependency relationships"
  ]}
  solutions={[
    "Consolidated duplicate configurations",
    "Restructured logical groupings",
    "Clarified dependency chains"
  ]}
  optimizations={[
    "70% reduction in line count",
    "Improved maintainability score",
    "Faster parsing and processing"
  ]}
/>
```

### 4. ProjectImpactMetrics
**Purpose**: Quantified results display with multiple visualization options

**Features**:
- Before/after metrics comparison
- Multiple chart types (bar, line, circular)
- Animated counters and progress bars
- Accessibility (ARIA labels, keyboard navigation)
- Mobile-responsive grid layout

**Usage**:
```jsx
import { ProjectImpactMetrics } from '@/components/ai-skills';

<ProjectImpactMetrics
  title="AI Implementation Impact"
  subtitle="Measurable improvements across key metrics"
  metrics={[
    {
      label: "Development Speed",
      description: "Time from concept to deployment",
      before: 160,
      after: 48,
      suffix: " hours"
    },
    {
      label: "Bug Detection Rate",
      description: "Percentage of bugs caught pre-production",
      before: 68,
      after: 94,
      suffix: "%"
    },
    {
      label: "Cost Savings",
      description: "Monthly operational cost reduction",
      before: 25000,
      after: 8500,
      prefix: "$"
    }
  ]}
  visualizationType="bar"
  showAnimation={true}
  animationDuration={2000}
/>
```

### 5. AgentConversationFlow
**Purpose**: 5-stage conversation evolution with quality indicators and orchestration

**Features**:
- 5-stage conversation progression
- Quality indicators for each stage
- Context evolution tracking
- Interactive stage navigation
- Expandable details
- Orchestration flow diagrams

**Usage**:
```jsx
import { AgentConversationFlow } from '@/components/ai-skills';

<AgentConversationFlow
  stages={[
    {
      title: "Initial Request",
      subtitle: "Basic user input without context",
      quality: 45,
      messages: [
        {
          type: 'human',
          sender: 'User',
          content: 'I need help with my project',
          metadata: { confidence: 60, tokens: 8 }
        },
        {
          type: 'agent',
          sender: 'Assistant',
          content: 'I can help you with your project. What specific area would you like assistance with?',
          metadata: { confidence: 70, context: 'basic', tokens: 24 }
        }
      ],
      contextEvolution: {
        tokens: 32,
        accuracy: 45,
        relevance: 60,
        efficiency: 40
      },
      orchestration: {
        agents: ['General Assistant'],
        coordination: 'Single agent response',
        handoffs: 'None'
      },
      improvements: [
        'Established basic communication',
        'Identified need for more context'
      ]
    }
    // ... 4 more stages showing progression
  ]}
  autoAdvance={false}
  advanceInterval={3000}
  showQualityMetrics={true}
  showOrchestration={true}
/>
```

## Design System Integration

All components follow the established design patterns:

- **Theme Support**: Uses design tokens from `.context-kit/analysis/design-system-output.yml`
- **Typography**: Follows existing font hierarchy (ellograph-cf, graphite-std)
- **Colors**: Integrates with light/dark theme system
- **Spacing**: Uses consistent spacing tokens (8px, 16px, 24px, 32px)
- **Animations**: 200ms transitions with ease-in-out timing
- **Breakpoints**: Mobile-first responsive design (768px breakpoint)

## Accessibility Features

- **ARIA Labels**: All interactive elements have proper labels
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Semantic HTML and descriptive text
- **Color Contrast**: Meets WCAG 2.1 AA standards
- **Focus Management**: Visible focus indicators

## Testing

Each component includes:
- **Unit Tests**: Vitest test files (`.test.jsx`)
- **Storybook Stories**: Interactive documentation (`.stories.jsx`)
- **Accessibility Tests**: Built-in ARIA support
- **Mobile Testing**: Responsive behavior validation

## File Structure

```
src/components/ai-skills/
├── index.jsx                     # Main export file
├── README.md                     # This documentation
├── AIInteractionShowcase/
│   ├── index.jsx
│   ├── AIInteractionShowcase.jsx
│   ├── AIInteractionShowcase.test.jsx
│   └── AIInteractionShowcase.stories.jsx
├── DualInterfaceDemo/
│   ├── index.jsx
│   └── DualInterfaceDemo.jsx
├── ContextEvolutionSlide/
│   ├── index.jsx
│   └── ContextEvolutionSlide.jsx
├── ProjectImpactMetrics/
│   ├── index.jsx
│   └── ProjectImpactMetrics.jsx
└── AgentConversationFlow/
    ├── index.jsx
    └── AgentConversationFlow.jsx
```

## Integration

To integrate these components into your project showcase:

```jsx
// Import individual components
import {
  AIInteractionShowcase,
  DualInterfaceDemo,
  ContextEvolutionSlide,
  ProjectImpactMetrics,
  AgentConversationFlow
} from '@/components/ai-skills';

// Or import the entire collection
import AISkillsComponents from '@/components/ai-skills';
```

## Development Notes

- All components are built with React 18+ and use modern hooks
- PropTypes validation ensures correct usage
- Mobile-responsive design with `useEffect` for window resize handling
- Consistent error handling for missing or malformed props
- Theme integration through CSS variables and className utilities

These components are ready for integration into Tucker's v2 portfolio showcases and provide a comprehensive demonstration of AI skills implementation and impact.