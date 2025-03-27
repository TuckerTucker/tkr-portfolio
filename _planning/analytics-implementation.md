# Custom Analytics Implementation

[Previous sections 1-4 remain unchanged...]

## 5. Implementation Examples

### Page View Tracking
```typescript
// components/ProjectCard.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    // other props...
  };
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent({
      type: 'pageview',
      category: 'project',
      action: 'view',
      label: project.id
    });
  }, []);

  return (
    <Card>
      <CardHeader>
        <h2>{project.title}</h2>
      </CardHeader>
      <CardContent>
        {/* Project card content */}
      </CardContent>
    </Card>
  );
}

// stories/ProjectCard.stories.tsx
import { Story } from "@ladle/react";
import { ProjectCard } from "@/components/ProjectCard";

export const Default: Story = () => (
  <ProjectCard
    project={{
      id: "example",
      title: "Example Project"
    }}
  />
);

export const LongTitle: Story = () => (
  <ProjectCard
    project={{
      id: "long",
      title: "A Very Long Project Title That Might Wrap"
    }}
  />
);
```

### Process Step Tracking
```typescript
// components/ProcessNav.tsx
import { NavigationMenu, NavigationMenuItem } from "@/components/ui/navigation-menu";
import { useAnalytics } from "@/hooks/useAnalytics";

interface ProcessNavProps {
  currentStep: string;
  steps: string[];
}

export function ProcessNav({ currentStep, steps }: ProcessNavProps) {
  const { logEvent } = useAnalytics();

  const handleStepChange = (step: string) => {
    logEvent({
      type: 'process_step',
      category: 'navigation',
      action: 'change_step',
      label: step,
      metadata: {
        previousStep: currentStep,
        timestamp: Date.now()
      }
    });
  };

  return (
    <NavigationMenu>
      {steps.map(step => (
        <NavigationMenuItem
          key={step}
          className={step === currentStep ? 'active' : ''}
          onClick={() => handleStepChange(step)}
        >
          {step}
        </NavigationMenuItem>
      ))}
    </NavigationMenu>
  );
}

// stories/ProcessNav.stories.tsx
import { Story } from "@ladle/react";
import { ProcessNav } from "@/components/ProcessNav";

const steps = ["Understand", "Solve", "Create", "Verify"];

export const Default: Story = () => (
  <ProcessNav 
    currentStep="Understand"
    steps={steps}
  />
);

export const MidProgress: Story = () => (
  <ProcessNav 
    currentStep="Create"
    steps={steps}
  />
);
```

### Analytics Dashboard
```typescript
// pages/analytics/index.tsx
import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { LineChart, BarChart } from './components';

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics(timeframe);
  }, [timeframe]);

  return (
    <div className="grid gap-6 p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <span>{timeframe}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ProjectViews data={metrics?.projects} />
            <StepCompletion data={metrics?.steps} />
            <EngagementMetrics data={metrics?.engagement} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// stories/AnalyticsDashboard.stories.tsx
import { Story } from "@ladle/react";
import AnalyticsDashboard from "@/pages/analytics";

export const Default: Story = () => (
  <AnalyticsDashboard />
);

export const WithData: Story = () => {
  // Mock data setup
  const mockMetrics = {
    projects: { /* ... */ },
    steps: { /* ... */ },
    engagement: { /* ... */ }
  };

  return (
    <AnalyticsDashboard initialData={mockMetrics} />
  );
};
```

### Scroll Depth Tracking
```typescript
// hooks/useScrollTracking.ts
import { useEffect } from 'react';
import { useAnalytics } from './useAnalytics';
import { debounce } from '@/lib/utils';

export function useScrollTracking() {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollDepth = getScrollPercentage();
      if (scrollDepth % 25 === 0) { // Log at 25%, 50%, 75%, 100%
        logEvent({
          type: 'engagement',
          category: 'scroll',
          action: 'depth',
          value: scrollDepth
        });
      }
    }, 500);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}

// components/ScrollTracker.tsx
import { useScrollTracking } from "@/hooks/useScrollTracking";

export function ScrollTracker() {
  useScrollTracking();
  return null; // Invisible component that just tracks scroll
}

// stories/ScrollTracker.stories.tsx
import { Story } from "@ladle/react";
import { ScrollTracker } from "@/components/ScrollTracker";
import { Card, CardContent } from "@/components/ui/card";

export const Default: Story = () => (
  <div style={{ height: '200vh' }}>
    <ScrollTracker />
    <Card>
      <CardContent>
        <h2>Scroll Testing Page</h2>
        <p>Scroll down to test depth tracking</p>
        <div style={{ marginTop: '150vh' }}>
          Bottom content
        </div>
      </CardContent>
    </Card>
  </div>
);
```

### Integration Points
1. Page Components
   - Mount/unmount tracking
   - Visibility tracking
   - Interaction events
   - Component stories for testing

2. Navigation
   - Route changes
   - Step transitions
   - Back/forward navigation
   - Navigation menu stories

3. Interactions
   - Button clicks
   - Scroll events
   - Mouse movement
   - Touch events

4. Performance
   - Load times
   - Render performance
   - Error tracking
   - Resource timing

5. Component Development
   - Ladle stories for each component
   - Interactive testing environment
   - Visual regression testing
   - Accessibility testing
