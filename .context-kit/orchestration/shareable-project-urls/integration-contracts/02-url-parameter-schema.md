# Integration Contract 2: URL Parameter Schema

**Owner**: Agent 4 (Routing Architecture)
**Consumers**: Agent 3 (State Management), Agent 5 (Project Picker)
**Status**: Draft → Implementation → Validated

---

## Contract Overview

Defines the URL structure, parameter format, and routing rules for project-specific pages. Ensures consistent URL generation and parsing across all components.

---

## URL Structure

### Route Definition

```typescript
interface RouteSchema {
  pattern: '/project/:projectId';
  parameter: {
    name: 'projectId';
    type: 'string';
    required: true;
  };
}
```

### Valid URL Examples

```
✅ /project/tucker
✅ /project/agentic_ai_kanban
✅ /project/tkr_context_kit
✅ /project/tkr_portfolio
✅ /project/nutrien
✅ /project/worldplay
```

### Invalid URL Handling

```
❌ /project/invalid_id      → Redirect to /project/{firstProject.id}
❌ /project/                → Redirect to /project/{firstProject.id}
❌ /project                 → Redirect to /project/{firstProject.id}
❌ /projects/tucker         → 404 (plural "projects" not supported)
```

---

## Parameter Format Specification

### projectId Format

```typescript
interface ProjectIdFormat {
  pattern: /^[a-z0-9_]+$/; // Lowercase alphanumeric with underscores
  examples: [
    'tucker',           // ✅ Short, lowercase
    'agentic_ai_kanban', // ✅ Underscores for multi-word
    'tkr_context_kit',  // ✅ Prefix + underscores
  ];

  invalid: [
    'Tucker',           // ❌ Capital letters
    'agentic-ai-kanban', // ❌ Hyphens not underscores
    'tkr context kit',  // ❌ Spaces
    'tkr.context.kit',  // ❌ Dots
  ];
}
```

### Validation Function

```javascript
/**
 * Validates if a projectId matches the expected format
 * @param {string} projectId - The project ID to validate
 * @returns {boolean} - True if valid format
 */
function isValidProjectIdFormat(projectId) {
  if (!projectId || typeof projectId !== 'string') return false;
  return /^[a-z0-9_]+$/.test(projectId);
}

/**
 * Validates if a projectId exists in the projects array
 * @param {string} projectId - The project ID to validate
 * @param {Array} projects - Array of project objects
 * @returns {boolean} - True if project exists
 */
function projectExists(projectId, projects) {
  return projects.some(p => p.id === projectId);
}
```

---

## React Router Integration

### Route Configuration

```javascript
// In App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Routes>
      {/* Home redirects to first project */}
      <Route path="/" element={<Navigate to="/project/tucker" replace />} />

      {/* Project pages */}
      <Route path="/project/:projectId" element={<ProjectPage />} />

      {/* Demos page */}
      <Route path="/demos" element={<DemoShowcase />} />

      {/* Catch-all: redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
```

### Reading URL Parameters

```javascript
// In ProjectPage.jsx or SelectedProjectContext
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useProjects } from './hooks/useProjects';

function ProjectPage() {
  const { projectId } = useParams(); // Extract :projectId from URL
  const { projects, loading } = useProjects();
  const navigate = useNavigate();

  // Validate project exists
  const project = projects.find(p => p.id === projectId);

  if (loading) return <div>Loading...</div>;

  // If invalid project, redirect to first
  if (!project && projects.length > 0) {
    return <Navigate to={`/project/${projects[0].id}`} replace />;
  }

  return (
    <div>
      {/* Render project content */}
    </div>
  );
}
```

### Updating URL Parameters

```javascript
// In CustomProjectPicker or SelectedProjectContext
import { useNavigate } from 'react-router-dom';

function navigateToProject(projectId) {
  const navigate = useNavigate();

  // Update URL (triggers React Router re-render)
  navigate(`/project/${projectId}`);

  // No need to manually update state - context will read from URL
}
```

---

## Project ID Mapping

### Source of Truth

```json
// public/data/projects.json
[
  { "id": "tucker", "title": "Tucker", ... },
  { "id": "agentic_ai_kanban", "title": "Taskboard", ... },
  { "id": "tkr_context_kit", "title": "TKR Context Kit", ... },
  { "id": "tkr_portfolio", "title": "TKR Portfolio", ... },
  { "id": "nutrien", "title": "Nutrien", ... },
  { "id": "worldplay", "title": "Worldplay", ... }
]
```

### ID to Title Mapping

| Project ID | Display Title |
|------------|---------------|
| `tucker` | Tucker |
| `agentic_ai_kanban` | Taskboard |
| `tkr_context_kit` | TKR Context Kit |
| `tkr_portfolio` | TKR Portfolio |
| `nutrien` | Nutrien |
| `worldplay` | Worldplay |

---

## Fallback Logic

### Decision Tree

```
User navigates to /project/:projectId
  ↓
Extract projectId from URL
  ↓
Does projectId exist in projects.json?
  ├─ YES: Load project
  └─ NO: ↓
      Is projects array empty?
      ├─ YES: Show "No projects" message
      └─ NO: Redirect to /project/{projects[0].id}
```

### Implementation

```javascript
function ProjectPage() {
  const { projectId } = useParams();
  const { projects, loading, error } = useProjects();

  // Loading state
  if (loading) return <LoadingSpinner />;

  // Error state
  if (error) return <ErrorMessage />;

  // No projects at all
  if (projects.length === 0) {
    return <div>No projects available</div>;
  }

  // Find requested project
  const project = projects.find(p => p.id === projectId);

  // Invalid project: redirect to first
  if (!project) {
    console.warn(`Project "${projectId}" not found, redirecting to first project`);
    return <Navigate to={`/project/${projects[0].id}`} replace />;
  }

  // Valid project: render
  return <ProjectContent project={project} />;
}
```

---

## Browser History Integration

### Navigation Behavior

| User Action | URL Change | History Entry | Back Button |
|-------------|------------|---------------|-------------|
| Click project in picker | `/project/foo` → `/project/bar` | New entry | Goes to `/project/foo` |
| Direct URL navigation | Any → `/project/foo` | New entry | Previous page |
| Invalid project redirect | `/project/invalid` → `/project/tucker` | Replace (no entry) | Previous valid page |
| Refresh page | No change | No change | Works correctly |

### Implementation Details

```javascript
// Normal navigation: Creates history entry
navigate(`/project/${projectId}`);

// Redirect (invalid project): Replaces history entry
<Navigate to={`/project/${firstProject.id}`} replace />
// Or: navigate(`/project/${firstProject.id}`, { replace: true });
```

---

## Query Parameters & Hash Support (Future)

### Reserved for Future Use

```typescript
// Currently not used, but URL structure allows for:
interface FutureURLSchema {
  queryParams: {
    slide?: number;      // /project/foo?slide=3
    view?: 'grid' | 'list'; // /project/foo?view=grid
  };
  hash: string;          // /project/foo#section-name
}
```

### Current Behavior

- Query parameters and hash are **ignored** in current implementation
- URL format allows them without breaking routing
- Can be added later without breaking changes

---

## SEO Considerations (Future)

### Meta Tags per Project

```html
<!-- Future: Dynamic meta tags per project -->
<title>{project.title} | Tucker Harley UX Designer</title>
<meta name="description" content="{project.description}" />
<meta property="og:title" content="{project.title}" />
<meta property="og:image" content="{project.coverImage}" />
```

**Note**: GitHub Pages serves static HTML, so SSR is not possible. Client-side meta tag updates won't help with social media previews. Consider future migration to Vercel/Netlify for SSR.

---

## Validation Criteria

### Unit Tests

```javascript
describe('URL Parameter Schema', () => {
  it('validates correct project ID format', () => {
    expect(isValidProjectIdFormat('tucker')).toBe(true);
    expect(isValidProjectIdFormat('agentic_ai_kanban')).toBe(true);
    expect(isValidProjectIdFormat('Tucker')).toBe(false); // Capital
    expect(isValidProjectIdFormat('foo-bar')).toBe(false); // Hyphen
  });

  it('finds project by ID', () => {
    const projects = [{ id: 'tucker' }, { id: 'taskboard' }];
    expect(projectExists('tucker', projects)).toBe(true);
    expect(projectExists('invalid', projects)).toBe(false);
  });

  it('generates correct project URLs', () => {
    expect(generateProjectURL('tucker')).toBe('/project/tucker');
    expect(generateProjectURL('tkr_context_kit')).toBe('/project/tkr_context_kit');
  });
});
```

### Integration Tests

```bash
# Test valid project URL
1. Visit /project/tucker
2. Verify: Tucker project loads
3. Verify: URL stays /project/tucker

# Test invalid project URL
1. Visit /project/nonexistent
2. Verify: Redirects to /project/tucker (first project)
3. Verify: No history entry for /project/nonexistent (replace)

# Test browser history
1. Visit /project/tucker
2. Click project picker → Select "Taskboard"
3. Verify: URL changes to /project/agentic_ai_kanban
4. Click browser back
5. Verify: Returns to /project/tucker
6. Click browser forward
7. Verify: Returns to /project/agentic_ai_kanban
```

---

## Acceptance Criteria

- [ ] Route `/project/:projectId` defined in App.jsx
- [ ] Valid project IDs load correct projects
- [ ] Invalid project IDs redirect to first project
- [ ] Browser back/forward work correctly
- [ ] URL updates when project selection changes
- [ ] Direct URL navigation works (after 404.html redirect)
- [ ] No infinite redirect loops
- [ ] Query params and hash don't break routing
- [ ] Integration tests pass

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-09-30 | 1.0.0 | Initial contract definition | Orchestrator |

---

## Notes

- Project IDs use underscores (not hyphens) to match projects.json
- React Router v6 syntax used (`useParams`, `useNavigate`, `<Navigate>`)
- Invalid projects redirect with `replace` to avoid polluting history
- Future: Query params for slide navigation, hash for section anchors
