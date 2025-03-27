# Portfolio Technical Implementation

## Tech Stack

### Core Technologies
- Next.js (Pages Router)
- React with JavaScript
- Ladle (Component Development Environment)
- shadcnui (Component Library)
- Tailwind CSS
- Vercel Deployment

### Project Structure
```
portfolio/
├── pages/
│   ├── index.js         # Project grid
│   └── project/
│       └── [id].js      # Project detail
├── components/
│   ├── ui/             # shadcnui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── navigation.tsx
│   ├── Header/
│   ├── ProjectCard/
│   ├── ProjectGrid/
│   └── ProcessNav/
├── stories/            # Ladle component stories
│   ├── Header.stories.tsx
│   ├── ProjectCard.stories.tsx
│   └── ProcessNav.stories.tsx
├── styles/
│   ├── global.css
│   └── components/
├── hooks/
│   └── useProjectData.js
├── data/
│   └── projects.js      # Project content
└── public/
    └── images/
```

## Component Implementation

### ProjectGrid (pages/index.js)
```javascript
import { ProjectCard } from '../components/ProjectCard'
import { Header } from '../components/Header'
import projects from '../data/projects'
import styles from '../styles/components/ProjectGrid.module.css'

export default function ProjectGrid() {
  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.grid}>
        {projects.map(project => (
          <ProjectCard key={project.id} {...project} />
        ))}
      </div>
    </div>
  )
}
```

### ProjectCard Component
```typescript
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardHeader, CardContent } from '@/components/ui/card'

interface ProjectCardProps {
  id: string
  company: string
  title: string
  role: string
  image: string
  color: string
}

export function ProjectCard({ id, company, title, role, image, color }: ProjectCardProps) {
  return (
    <Link href={`/project/${id}`}>
      <Card className="hover:scale-102 transition-transform" style={{ backgroundColor: color }}>
        <CardHeader>
          <span className="italic">{company}</span>
          <h2 className="font-bold text-xl">{title}</h2>
          <span className="italic">{role}</span>
        </CardHeader>
        <CardContent>
          <div className="relative h-full">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
```

## Component Development

### Ladle Stories
```typescript
// stories/ProjectCard.stories.tsx
import { Story } from "@ladle/react";
import { ProjectCard } from "@/components/ProjectCard";

export const Default: Story = () => (
  <ProjectCard
    id="example"
    company="Example Co"
    title="Example Project"
    role="UX Designer"
    image="/placeholder.jpg"
    color="#8DA89C"
  />
);

export const LongTitle: Story = () => (
  <ProjectCard
    id="long-title"
    company="Example Co"
    title="A Very Long Project Title That Might Wrap to Multiple Lines"
    role="UX Designer"
    image="/placeholder.jpg"
    color="#E6B655"
  />
);
```

### shadcnui Components
Components are built using shadcnui's component library, providing consistent styling and behavior while maintaining full customization control through Tailwind CSS.

Example customization:
```typescript
// components/ui/card.tsx
import { Card as ShadCard } from "shadcnui/card"

export const Card = ({ className, ...props }) => (
  <ShadCard 
    className={cn(
      "transition-all hover:shadow-lg",
      className
    )}
    {...props}
  />
)
```

## Data Management

### Project Data Structure (data/projects.js)
```javascript
export const projects = [
  {
    id: 'nutrien',
    company: 'Nutrien',
    title: 'Safety Portal',
    role: 'UX Lead',
    image: '/images/nutrien.jpg',
    color: '#8DA89C'
  },
  {
    id: 'worldplay',
    company: 'Worldplay',
    title: 'Analytics Dashboard',
    role: 'Manager, UX & Design',
    image: '/images/worldplay.jpg',
    color: '#E6B655'
  },
  // Additional projects...
]

export default projects
```

## Deployment & Performance

### Vercel Configuration (vercel.json)
```json
{
  "images": {
    "domains": ["localhost"],
    "formats": ["image/webp"]
  },
  "github": {
    "silent": true
  }
}
```

### Performance Optimizations
- Next.js Image component for automatic optimization
- CSS Modules for scoped, minimal CSS
- Automatic code splitting per page
- Edge caching through Vercel CDN
- Route prefetching for instant page transitions

### Development Setup
1. Project initialization:
   ```bash
   npx create-next-app portfolio --ts
   cd portfolio
   ```

2. Required dependencies:
   ```bash
   # Install Ladle and documentation tools
   npm install -D @ladle/react jsdoc better-docs

   # Install shadcnui and dependencies
   npm install shadcnui
   npm install tailwindcss postcss autoprefixer
   npm install class-variance-authority clsx tailwind-merge
   
   # Initialize Tailwind CSS
   npx tailwindcss init -p
   ```

3. Configure Documentation:
   ```bash
   # Copy JSDoc configuration
   cp documentation-requirements/jsdoc.config.json .
   
   # Add documentation scripts to package.json
   npm pkg set scripts.docs="jsdoc -c jsdoc.config.json"
   npm pkg set scripts.docs:watch="nodemon --watch 'components/**/*' --watch 'pages/**/*' --ext ts,tsx --exec 'npm run docs'"
   ```

4. Configure Ladle:
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

5. Development workflow:
   ```bash
   npm run dev          # Start Next.js development server
   npm run ladle        # Start Ladle component development environment
   npm run docs:watch   # Watch for documentation changes
   npm run build        # Production build
   npm run start        # Start production server
   npm run test:e2e     # Run end-to-end tests
   ```

6. VSCode extensions:
   - ESLint
   - Prettier
   - Document This (JSDoc automation)
   - React Developer Tools

## Documentation & Testing

### Component Documentation
- JSDoc comments for all components
- TypeScript interfaces with prop descriptions
- Usage examples in documentation
- Live component previews
- Integration with Ladle stories

### Story Development
- Stories for all components
- Multiple variants per component
- Interactive controls
- Accessibility testing
- Visual regression testing

### Documentation Site
- Generated from JSDoc comments
- Interactive component examples
- Searchable documentation
- Style guide integration
- Story previews

## Accessibility Considerations
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Accessibility testing in Ladle
