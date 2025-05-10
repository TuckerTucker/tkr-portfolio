# HTML Slides Usage Guidelines

This document provides guidelines for using and creating HTML slides for the portfolio carousel.

## Overview

HTML slides allow for dynamic, interactive content to be displayed alongside traditional images and videos in the portfolio carousel. They can be used to showcase:

- Technology stacks
- Interactive demos
- Data visualizations
- Process flows
- Comparison sliders
- And more...

## Adding an HTML Slide to a Project

To add an HTML slide to a project, update the `slides` array in the project's JSON definition:

```json
{
  "slides": [
    { 
      "type": "html", 
      "component": "TechStack", 
      "props": {
        "title": "Technologies Used",
        "technologies": [
          { "name": "React", "description": "Frontend Framework" },
          { "name": "Node.js", "description": "Backend Server" }
        ]
      },
      "alt": "Technology stack visualization" 
    },
    // Other slides...
  ]
}
```

### Required Properties

- `type`: Must be set to `"html"` to identify this as an HTML slide
- `component`: The name of the component to render (must be registered in the component registry)
- `alt`: Accessible description of the slide (used for screen readers and fallbacks)

### Optional Properties

- `props`: Object containing props to pass to the component

## Available HTML Slide Components

### TechStack

Displays a responsive grid of technologies with their names and descriptions.

**Props:**
- `title` (string): Title displayed at the top of the component
- `technologies` (array): Array of technology objects with the following properties:
  - `name` (string, required): Name of the technology
  - `description` (string): Description or role of the technology
  - `icon` (node): Optional React node for an icon

**Example:**
```json
{
  "type": "html",
  "component": "TechStack",
  "props": {
    "title": "Tech Stack",
    "technologies": [
      { "name": "React", "description": "UI Framework" },
      { "name": "GraphQL", "description": "API Layer" }
    ]
  },
  "alt": "Project technology stack" 
}
```

## Creating New HTML Slide Components

To create a new HTML slide component:

1. Create a new `.jsx` file in the `src/components/html-slides/` directory
2. Design your component to be responsive and adaptive to different screen sizes
3. Include PropTypes validation for all props
4. Register your component in `src/components/html-slides/index.js`
5. Create Storybook stories to showcase your component

### Component Guidelines

1. **Responsiveness**: Use Tailwind's responsive classes to ensure the component works on all screen sizes
2. **Accessibility**: Include proper ARIA attributes and ensure keyboard navigation works
3. **Performance**: Optimize rendering for smooth carousel transitions
4. **Error Handling**: Handle missing or invalid props gracefully
5. **Styling**: Use the existing color theme and typography

### Example Component Structure

```jsx
import React from 'react';
import PropTypes from 'prop-types';
import { cn } from "@/lib/utils";

const MyComponent = ({ 
  title,
  data = [],
  className,
  ...props 
}) => {
  return (
    <div className={cn("w-full h-full flex flex-col p-6", className)} {...props}>
      <h2 className="text-2xl font-heading mb-4">{title}</h2>
      
      {/* Component-specific content */}
      <div className="flex-grow">
        {/* Render your content here */}
      </div>
    </div>
  );
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  data: PropTypes.array,
  className: PropTypes.string
};

export default MyComponent;
```

### Registering the Component

Add your component to the registry in `src/components/html-slides/index.js`:

```jsx
import TechStack from './TechStack';
import MyComponent from './MyComponent';

const htmlSlideComponents = {
  TechStack,
  MyComponent, // Add your component here
};

export default htmlSlideComponents;
```

## Testing HTML Slides

Always test HTML slides in the following scenarios:

1. In isolation via Storybook
2. In the carousel context
3. On different screen sizes (mobile, tablet, desktop)
4. With various props and edge cases