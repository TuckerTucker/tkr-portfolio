# Portfolio Technical Implementation

## Tech Stack

### Core Technologies
- Next.js (Pages Router)
- React with JavaScript
- CSS Modules + PostCSS
- Vercel Deployment

### Project Structure
```
portfolio/
├── pages/
│   ├── index.js         # Project grid
│   └── project/
│       └── [id].js      # Project detail
├── components/
│   ├── Header/
│   ├── ProjectCard/
│   ├── ProjectGrid/
│   └── ProcessNav/
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
```javascript
import Link from 'next/link'
import Image from 'next/image'
import styles from '../styles/components/ProjectCard.module.css'

export function ProjectCard({ id, company, title, role, image, color }) {
  return (
    <Link href={`/project/${id}`}>
      <article 
        className={styles.card}
        style={{ backgroundColor: color }}
      >
        <div className={styles.content}>
          <span className={styles.company}>{company}</span>
          <h2 className={styles.title}>{title}</h2>
          <span className={styles.role}>{role}</span>
        </div>
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={title}
            fill
            objectFit="cover"
          />
        </div>
      </article>
    </Link>
  )
}
```

## Styling Approach

### CSS Modules Example (ProjectCard.module.css)
```css
.card {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.card:hover {
  transform: scale(1.02);
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.company {
  font-style: italic;
}

.title {
  font-weight: bold;
}

.role {
  font-style: italic;
}

.imageContainer {
  position: relative;
  height: 100%;
}

/* Responsive Adaptations */
@media (max-width: 768px) {
  .card {
    grid-template-columns: 1fr;
    padding: 16px;
  }
}
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
   npx create-next-app portfolio --js
   cd portfolio
   ```

2. Required dependencies:
   ```bash
   npm install @next/font
   ```

3. Development workflow:
   ```bash
   npm run dev     # Start development server
   npm run build   # Production build
   npm run start   # Start production server
   ```

4. VSCode extensions:
   - ESLint
   - Prettier
   - CSS Modules
   - React Developer Tools

## Accessibility Considerations
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support
- Focus management
- Color contrast compliance
