# Integration Contract 4: Component Props & Interfaces

**Owner**: Agent 4 (Routing Architecture)
**Consumers**: Agent 3 (Context), Agent 5 (Project Picker), All page components
**Status**: Draft → Implementation → Validated

---

## Contract Overview

Defines component interfaces, prop contracts, and data flow patterns for all components involved in project routing and display. Ensures consistent API usage across the application.

---

## Page Components

### HomePage Component

**Purpose**: Landing page that redirects to first project

```typescript
interface HomePageProps {
  // No props - reads from useProjects hook
}

interface HomePageBehavior {
  onMount: 'Redirect to /project/{firstProject.id}';
  fallback: 'If no projects, show empty state';
}
```

**Implementation**:

```javascript
import { Navigate } from 'react-router-dom';
import { useProjects } from './hooks/useProjects';

function HomePage() {
  const { projects, loading, error } = useProjects();

  // Loading state
  if (loading) {
    return <div>Loading projects...</div>;
  }

  // Error state
  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  // No projects
  if (projects.length === 0) {
    return <div>No projects available</div>;
  }

  // Redirect to first project
  return <Navigate to={`/project/${projects[0].id}`} replace />;
}

export default HomePage;
```

---

### ProjectPage Component

**Purpose**: Displays a single project based on URL parameter

```typescript
interface ProjectPageProps {
  // No props - reads from useParams + useSelectedProject
}

interface ProjectPageBehavior {
  onMount: 'Read projectId from URL, validate, display or redirect';
  onInvalidProject: 'Redirect to /project/{firstProject.id}';
  onValidProject: 'Display project content (picker + carousel)';
}
```

**Implementation**:

```javascript
import { useParams, Navigate } from 'react-router-dom';
import { useProjects } from './hooks/useProjects';
import { useSelectedProject } from './hooks/SelectedProjectContext';
import CustomProjectPicker from './components/feature/custom-project-picker';
import ImageCarousel from './components/feature/image-carousel';

function ProjectPage() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();
  const { selectedProjectId } = useSelectedProject();

  // Loading state
  if (loading) {
    return <div>Loading project...</div>;
  }

  // Error state
  if (error) {
    return <div>Error loading projects: {error.message}</div>;
  }

  // Find requested project
  const selectedProject = projects.find(p => p.id === projectId);

  // Invalid project: redirect to first
  if (!selectedProject && projects.length > 0) {
    console.warn(`Project "${projectId}" not found, redirecting to first project`);
    return <Navigate to={`/project/${projects[0].id}`} replace />;
  }

  // No projects at all
  if (projects.length === 0) {
    return <div>No projects available</div>;
  }

  const selectedTitle = selectedProject ? selectedProject.title : 'Select a Project';

  return (
    <div className="flex flex-col gap-6 max-w-5xl w-full mx-auto">
      <div className="flex flex-col gap-0">
        <CustomProjectPicker
          projects={projects}
          selectedProjectTitle={selectedTitle}
          selectedProject={selectedProject}
        />
        {selectedProject && (
          <ImageCarousel
            items={selectedProject.slides || []}
            projectId={selectedProject.id}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectPage;
```

---

## Feature Components

### CustomProjectPicker Component

**Purpose**: Dropdown to select projects, navigates on selection

```typescript
interface CustomProjectPickerProps {
  projects: Project[];              // Array of all projects
  selectedProject: Project | null;  // Currently selected project object
  selectedProjectTitle: string;     // Display title for selected project
  onSelectProject?: (project: Project) => void; // DEPRECATED: Use internal navigation
  className?: string;               // Optional styling
}

interface CustomProjectPickerBehavior {
  onSelectProject: 'Call navigateToProject(project.id)';
  onOpen: 'Show dropdown with all projects';
  onClose: 'Hide dropdown';
}
```

**Modified Implementation**:

```javascript
import { useNavigate } from 'react-router-dom';
import { useSelectedProject } from '@/hooks/SelectedProjectContext';

function CustomProjectPicker({
  projects = [],
  selectedProject = null,
  selectedProjectTitle = 'Select a Project',
  onSelectProject, // DEPRECATED but kept for backward compat
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { navigateToProject } = useSelectedProject();

  const handleSelect = (project) => {
    // NEW: Navigate through URL
    navigateToProject(project.id);

    // DEPRECATED: Call legacy callback if provided
    if (onSelectProject) {
      console.warn('onSelectProject prop is deprecated, use navigateToProject instead');
      onSelectProject(project);
    }

    setIsOpen(false);
  };

  // ... rest of component unchanged
}
```

**Migration Notes**:
- `onSelectProject` prop is now **deprecated**
- Component internally uses `navigateToProject()` from context
- Legacy `onSelectProject` still called if provided (backward compat)
- External code should stop passing `onSelectProject`

---

### ImageCarousel Component

**Purpose**: Displays project slides with persistence

```typescript
interface ImageCarouselProps {
  items: Slide[];        // Array of slide objects
  projectId: string;     // Project ID for localStorage key
  className?: string;    // Optional styling
}

interface Slide {
  type: 'image' | 'video' | 'html';
  src?: string;          // For image/video
  component?: string;    // For HTML slides (component name)
  props?: object;        // For HTML slides (component props)
  alt?: string;          // Accessibility text
}
```

**Implementation** (unchanged):

```javascript
function ImageCarousel({ items = [], projectId, className, ...props }) {
  // Load saved position from localStorage
  const savedIndex = parseInt(localStorage.getItem(`carousel-position-${projectId}`)) || 0;
  const [currentIndex, setCurrentIndex] = useState(savedIndex);

  // Save position when it changes
  useEffect(() => {
    localStorage.setItem(`carousel-position-${projectId}`, currentIndex.toString());
  }, [currentIndex, projectId]);

  // ... rest of carousel logic
}
```

**Notes**:
- Carousel persistence uses `projectId` as localStorage key
- Each project has independent carousel position
- Position syncs when project changes (via `projectId` prop)

---

## Hook Interfaces

### useProjects Hook

**Purpose**: Fetch and manage projects data

```typescript
interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: Error | null;
}

interface Project {
  id: string;           // Unique project identifier
  title: string;        // Display title
  color: string;        // Hex color code
  subtitle: string;     // Short description
  logoUrl: string;      // Logo image path
  description: string;  // Full description
  bullets: string[];    // Key points
  slides: Slide[];      // Carousel slides
}
```

**Usage**:

```javascript
const { projects, loading, error } = useProjects();

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error.message}</div>;
if (projects.length === 0) return <div>No projects</div>;

// Use projects array
```

---

### useSelectedProject Hook

**Purpose**: Access and update selected project state

```typescript
interface UseSelectedProjectReturn {
  selectedProjectId: string | null;                   // Current project ID
  setSelectedProjectId: (id: string | null) => void;  // DEPRECATED
  navigateToProject: (id: string) => void;            // PREFERRED
}
```

**Usage**:

```javascript
// ✅ READING: Always use selectedProjectId
const { selectedProjectId } = useSelectedProject();
const project = projects.find(p => p.id === selectedProjectId);

// ✅ UPDATING: Use navigateToProject
const { navigateToProject } = useSelectedProject();
navigateToProject('tucker'); // Updates URL and state

// ⚠️ DEPRECATED: setSelectedProjectId
const { setSelectedProjectId } = useSelectedProject();
setSelectedProjectId('tucker'); // State only, no URL update
```

---

## App Component Routing

**Purpose**: Top-level routing configuration

```typescript
interface AppRouting {
  routes: {
    '/': 'HomePage → Redirects to /project/{first}';
    '/project/:projectId': 'ProjectPage → Displays project';
    '/demos': 'DemoShowcase → Existing page (unchanged)';
    '*': 'Catch-all → Redirect to /';
  };
}
```

**Implementation**:

```javascript
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  const { theme } = useTheme();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navigation />
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-0 pt-0 flex flex-col gap-8">
        <Routes>
          {/* Home redirects to first project */}
          <Route path="/" element={<HomePage />} />

          {/* Project pages */}
          <Route path="/project/:projectId" element={<ProjectPage />} />

          {/* Demos page (unchanged) */}
          <Route path="/demos" element={<DemoShowcase />} />

          {/* Catch-all: redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
```

---

## Data Flow Diagram

```
User clicks project in CustomProjectPicker
  ↓
handleSelect(project) called
  ↓
navigateToProject(project.id) from context
  ↓
navigate(`/project/${project.id}`) from useNavigate
  ↓
React Router updates URL
  ↓
SelectedProjectContext detects URL change (useEffect on projectId)
  ↓
setSelectedProjectId(project.id)
  ↓
localStorage.setItem('selectedProjectId', project.id)
  ↓
Context providers re-render children
  ↓
ProjectPage re-renders with new project
  ↓
CustomProjectPicker updates selected project display
  ↓
ImageCarousel loads slides for new project + restores carousel position
```

---

## Validation Criteria

### Unit Tests

```javascript
describe('Component Props', () => {
  it('ProjectPage validates project ID from URL', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/project/tucker']}>
        <Routes>
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(getByText('Tucker')).toBeInTheDocument();
  });

  it('ProjectPage redirects on invalid project ID', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/project/invalid']}>
        <Routes>
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to first project
    expect(getByText('Tucker')).toBeInTheDocument(); // Assuming 'tucker' is first
  });

  it('CustomProjectPicker navigates on selection', () => {
    const { getByText } = render(
      <MemoryRouter initialEntries={['/project/tucker']}>
        <SelectedProjectProvider>
          <CustomProjectPicker
            projects={mockProjects}
            selectedProject={mockProjects[0]}
            selectedProjectTitle="Tucker"
          />
        </SelectedProjectProvider>
      </MemoryRouter>
    );

    fireEvent.click(getByText('Projects')); // Open dropdown
    fireEvent.click(getByText('Taskboard')); // Select project

    // Verify navigation occurred
    expect(window.location.pathname).toBe('/project/agentic_ai_kanban');
  });
});
```

---

## Acceptance Criteria

- [ ] HomePage redirects to first project
- [ ] ProjectPage validates and displays project
- [ ] ProjectPage redirects on invalid project ID
- [ ] CustomProjectPicker navigates on selection
- [ ] ImageCarousel receives correct projectId prop
- [ ] useProjects hook provides projects data
- [ ] useSelectedProject hook provides navigation method
- [ ] All components follow prop contracts
- [ ] Backward compatibility maintained
- [ ] All unit tests pass

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-09-30 | 1.0.0 | Initial contract definition | Orchestrator |

---

## Notes

- **HomePage**: New component that redirects to first project
- **ProjectPage**: Refactored from old HomePage, adds validation
- **CustomProjectPicker**: Internally uses `navigateToProject()`, no external prop needed
- **ImageCarousel**: Unchanged, already receives `projectId` prop
- **Backward compatibility**: `onSelectProject` prop still works but deprecated
- **Testing**: Requires MemoryRouter for URL-based tests
