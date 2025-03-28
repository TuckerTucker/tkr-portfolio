# Documentation Requirements

## JSDoc Implementation

### Setup
```bash
# Install dependencies
npm install -D jsdoc better-docs
```

### Configuration
```json
// jsdoc.config.json
{
  "source": {
    "include": ["components/", "pages/", "hooks/", "utils/"],
    "exclude": ["node_modules/", ".next/"]
  },
  "plugins": ["plugins/markdown"],
  "opts": {
    "template": "better-docs/template",
    "destination": "./docs",
    "recurse": true
  },
  "templates": {
    "better-docs": {
      "name": "Tucker's Portfolio",
      "navigation": true,
      "search": true,
      "create_style_guide": true
    }
  },
  "tags": {
    "allowUnknownTags": true,
    "dictionaries": ["jsdoc", "closure"]
  },
  "source_type": "module"
}
```

### Component Documentation Example
```typescript
/**
 * ProjectCard component displays a preview of a portfolio project
 * 
 * @component
 * @example
 * ```tsx
 * <ProjectCard
 *   id="example"
 *   company="Example Co"
 *   title="Project Title"
 *   role="UX Designer"
 *   image="/image.jpg"
 *   color="#9ad441"
 * />
 * ```
 */
interface ProjectCardProps {
  /** Unique identifier for the project */
  id: string;
  /** Company name */
  company: string;
  /** Project title */
  title: string;
  /** Role in the project */
  role: string;
  /** Path to project image */
  image: string;
  /** Background color in hex format */
  color: string;
}

export function ProjectCard({ id, company, title, role, image, color }: ProjectCardProps) {
  // Implementation...
}
```

### Hook Documentation Example
```typescript
/**
 * Hook for tracking scroll depth and firing analytics events
 * 
 * @hook
 * @example
 * ```tsx
 * function MyComponent() {
 *   useScrollTracking();
 *   return <div>Content...</div>;
 * }
 * ```
 * 
 * @returns {void}
 */
export function useScrollTracking(): void {
  // Implementation...
}
```

### Utility Function Documentation
```typescript
/**
 * Formats a color string to ensure it's a valid hex color
 * 
 * @function
 * @param {string} color - Color string to validate
 * @returns {string} Valid hex color or fallback color
 * 
 * @example
 * ```ts
 * const color = validateColor('#123456'); // Returns '#123456'
 * const invalid = validateColor('invalid'); // Returns default color
 * ```
 */
export function validateColor(color: string): string {
  // Implementation...
}
```

## Ladle Implementation

### Setup
```bash
# Install Ladle
npm install -D @ladle/react
```

### Configuration
```javascript
// .ladle/config.mjs
export default {
  stories: "stories/**/*.stories.{js,jsx,ts,tsx}",
  defaultStory: "ProjectCard",
  port: 61000,
  addons: {
    a11y: true,
    action: true,
    control: true,
    source: true,
    theme: true
  }
};
```

### Story Structure
```
stories/
├── components/
│   ├── ProjectCard.stories.tsx
│   ├── ProcessNav.stories.tsx
│   └── Header.stories.tsx
├── layout/
│   └── Grid.stories.tsx
└── hooks/
    └── ScrollTracker.stories.tsx
```

### Story Examples

#### Component Story
```typescript
// stories/components/ProjectCard.stories.tsx
import { Story } from "@ladle/react";
import { ProjectCard } from "@/components/ProjectCard";

/**
 * Default ProjectCard story showing basic usage
 */
export const Default: Story = () => (
  <ProjectCard
    id="example"
    company="Example Co"
    title="Example Project"
    role="UX Designer"
    image="/placeholder.jpg"
    color="#9ad441"
  />
);

/**
 * Story demonstrating long text handling
 */
export const LongTitle: Story = () => (
  <ProjectCard
    id="long"
    company="Example Co"
    title="A Very Long Project Title That Might Wrap"
    role="UX Designer"
    image="/placeholder.jpg"
    color="#00a4e4"
  />
);
```

#### Hook Story
```typescript
// stories/hooks/ScrollTracker.stories.tsx
import { Story } from "@ladle/react";
import { ScrollTracker } from "@/components/ScrollTracker";
import { Card } from "@/components/ui/card";

/**
 * Story demonstrating scroll tracking functionality
 */
export const Default: Story = () => (
  <div style={{ height: '200vh' }}>
    <ScrollTracker />
    <Card>
      <h2>Scroll Testing Page</h2>
      <p>Scroll down to test tracking</p>
    </Card>
  </div>
);
```

## Integration with Better Docs

### Component Preview Integration
```typescript
// components/ui/button.tsx
/**
 * @component
 * @example
 * ```tsx
 * <Button variant="primary">Click Me</Button>
 * ```
 * 
 * @example
 * ```tsx live
 * // Live example will be rendered in documentation
 * function Example() {
 *   return (
 *     <Button 
 *       variant="primary"
 *       onClick={() => alert('Clicked!')}
 *     >
 *       Interactive Example
 *     </Button>
 *   );
 * }
 * ```
 */
```

### Story Integration
```typescript
/**
 * @component
 * @example
 * ```tsx story
 * // This will embed the Ladle story in the documentation
 * import { Default as ProjectCardStory } from '../stories/ProjectCard.stories';
 * ```
 */
```

## Documentation Scripts
```json
// package.json
{
  "scripts": {
    "docs": "jsdoc -c jsdoc.config.json",
    "docs:watch": "nodemon --watch 'components/**/*' --watch 'pages/**/*' --ext ts,tsx --exec 'npm run docs'",
    "ladle": "ladle serve",
    "ladle:build": "ladle build"
  }
}
```

## Development Workflow

1. Component Development:
   - Create component with JSDoc documentation
   - Create Ladle story
   - Add live examples
   - Document props and examples

2. Documentation Generation:
   - Run docs:watch during development
   - Review generated documentation
   - Test live examples
   - Verify story integration

3. Quality Checks:
   - TypeScript validation
   - Documentation coverage
   - Story completeness
   - Interactive examples
