# Integration Contract 3: State Synchronization

**Owner**: Agent 3 (URL-Driven State Architecture)
**Consumers**: Agent 4 (Routing), Agent 5 (Project Picker), All components using SelectedProjectContext
**Status**: Draft → Implementation → Validated

---

## Contract Overview

Defines how project selection state synchronizes between URL parameters, React Context, and localStorage. Establishes clear priority order and ensures all state sources remain consistent.

---

## State Priority Hierarchy

```
1. URL Parameters (useParams)     ← PRIMARY SOURCE
   ↓
2. localStorage                   ← FALLBACK (if no URL param)
   ↓
3. First project from array       ← DEFAULT (if no URL or localStorage)
```

### Priority Logic

```javascript
function determineSelectedProject(urlProjectId, localStorageId, projects) {
  // Priority 1: URL parameter
  if (urlProjectId && projects.some(p => p.id === urlProjectId)) {
    return urlProjectId;
  }

  // Priority 2: localStorage
  if (localStorageId && projects.some(p => p.id === localStorageId)) {
    return localStorageId;
  }

  // Priority 3: First project
  return projects.length > 0 ? projects[0].id : null;
}
```

---

## State Flow Diagrams

### On Initial Mount

```
App renders
  ↓
React Router reads URL: /project/tkr_context_kit
  ↓
SelectedProjectProvider mounts
  ↓
useParams() returns { projectId: 'tkr_context_kit' }
  ↓
useState initializer:
  - Check URL param: 'tkr_context_kit' ✅
  - Skip localStorage (URL takes priority)
  - Skip first project (URL takes priority)
  ↓
selectedProjectId = 'tkr_context_kit'
  ↓
useEffect syncs to localStorage
  ↓
Children components receive context value
```

### On Project Selection (User Clicks Picker)

```
User clicks "Taskboard" in project picker
  ↓
CustomProjectPicker calls navigateToProject('agentic_ai_kanban')
  ↓
navigateToProject calls navigate('/project/agentic_ai_kanban')
  ↓
React Router updates URL
  ↓
SelectedProjectProvider detects URL change (useEffect)
  ↓
setSelectedProjectId('agentic_ai_kanban')
  ↓
useEffect syncs to localStorage
  ↓
Children components re-render with new project
```

### On Browser Back Button

```
User clicks browser back
  ↓
React Router changes URL: /project/tkr_context_kit
  ↓
SelectedProjectProvider detects URL change
  ↓
useParams() returns { projectId: 'tkr_context_kit' }
  ↓
useEffect updates state to match URL
  ↓
useEffect syncs to localStorage
  ↓
Children components re-render with previous project
```

---

## Context API Specification

### TypeScript Interface

```typescript
interface SelectedProjectContextValue {
  // Current selected project ID
  selectedProjectId: string | null;

  // DEPRECATED: Direct state setter (use navigateToProject instead)
  setSelectedProjectId: (id: string | null) => void;

  // PREFERRED: Navigate to project (updates URL + state)
  navigateToProject: (id: string) => void;
}
```

### Usage Examples

```javascript
// ✅ PREFERRED: Use navigateToProject
function ProjectPicker() {
  const { navigateToProject } = useSelectedProject();

  const handleSelect = (projectId) => {
    navigateToProject(projectId); // Updates URL, state follows
  };
}

// ⚠️ DEPRECATED: Direct state setter (bypasses URL)
function OldWay() {
  const { setSelectedProjectId } = useSelectedProject();

  const handleSelect = (projectId) => {
    setSelectedProjectId(projectId); // State updates but URL doesn't
  };
}

// ✅ READING: Always use selectedProjectId
function ProjectDisplay() {
  const { selectedProjectId } = useSelectedProject();
  const { projects } = useProjects();

  const project = projects.find(p => p.id === selectedProjectId);

  return <div>{project?.title}</div>;
}
```

---

## Implementation Specification

### Provider Implementation

```javascript
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const SelectedProjectContext = createContext();

export function SelectedProjectProvider({ children }) {
  const { projectId } = useParams(); // Read from URL
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize state with priority: URL > localStorage > null
  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    // Priority 1: URL parameter
    if (projectId) return projectId;

    // Priority 2: localStorage
    const stored = localStorage.getItem('selectedProjectId');
    if (stored) return stored;

    // Priority 3: null (will be set to first project later)
    return null;
  });

  // Sync state when URL changes (browser back/forward, direct navigation)
  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      console.log('[Context] URL changed to:', projectId);
      setSelectedProjectIdState(projectId);
    }
  }, [projectId]); // Only depend on projectId, not selectedProjectId (avoid loops)

  // Sync localStorage when state changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
      console.log('[Context] localStorage synced:', selectedProjectId);
    } else {
      localStorage.removeItem('selectedProjectId');
      console.log('[Context] localStorage cleared');
    }
  }, [selectedProjectId]);

  // PREFERRED: Navigate to project (updates URL, which updates state)
  const navigateToProject = useCallback((id) => {
    console.log('[Context] Navigating to project:', id);
    navigate(`/project/${id}`);
    // State update happens via useEffect when URL changes
  }, [navigate]);

  const value = {
    selectedProjectId,
    setSelectedProjectId: setSelectedProjectIdState, // Kept for backward compat
    navigateToProject, // Preferred method
  };

  return (
    <SelectedProjectContext.Provider value={value}>
      {children}
    </SelectedProjectContext.Provider>
  );
}

export function useSelectedProject() {
  const context = useContext(SelectedProjectContext);
  if (!context) {
    throw new Error('useSelectedProject must be used within a SelectedProjectProvider');
  }
  return context;
}
```

---

## Race Condition Prevention

### Problem: URL and State Out of Sync

```javascript
// ❌ PROBLEM: Multiple sources of truth can diverge
const { projectId } = useParams();           // URL says: 'tucker'
const { selectedProjectId } = useSelectedProject(); // State says: 'taskboard'
// Which is correct?
```

### Solution: URL is Single Source of Truth

```javascript
// ✅ SOLUTION: URL is always correct, state follows URL
useEffect(() => {
  if (projectId && projectId !== selectedProjectId) {
    setSelectedProjectIdState(projectId); // Force state to match URL
  }
}, [projectId]);

// State updates ONLY through URL changes
navigateToProject(id) → navigate(`/project/${id}`) → URL changes → State updates
```

---

## localStorage Synchronization

### When to Write

```javascript
// Write to localStorage whenever state changes
useEffect(() => {
  if (selectedProjectId) {
    localStorage.setItem('selectedProjectId', selectedProjectId);
  } else {
    localStorage.removeItem('selectedProjectId');
  }
}, [selectedProjectId]);
```

### When to Read

```javascript
// Read from localStorage ONLY on initial mount
const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
  return projectId || localStorage.getItem('selectedProjectId') || null;
});

// NOT here (would cause loops):
// useEffect(() => {
//   const stored = localStorage.getItem('selectedProjectId');
//   setSelectedProjectId(stored); // ❌ NO
// }, []);
```

### localStorage Schema

```typescript
interface LocalStorageSchema {
  key: 'selectedProjectId';
  value: string; // Project ID (e.g., 'tucker', 'agentic_ai_kanban')
  format: string; // Lowercase with underscores
  purpose: 'Fallback when no URL parameter, persistence across sessions';
}
```

---

## Edge Cases & Handling

### 1. Invalid Project ID in URL

```javascript
// URL: /project/nonexistent
// Context receives: projectId = 'nonexistent'

// Option A: Context ignores invalid IDs
useEffect(() => {
  if (projectId && projectExists(projectId, projects)) {
    setSelectedProjectIdState(projectId);
  }
  // If invalid, state doesn't update (keeps previous or falls back to first)
}, [projectId, projects]);

// Option B: Routing layer handles (PREFERRED)
// ProjectPage component validates and redirects
// Context never receives invalid IDs
```

**Decision**: Option B (routing layer validates and redirects)

### 2. No URL Parameter (Root `/` Route)

```javascript
// URL: /
// projectId = undefined

// HomePage component redirects to first project
function HomePage() {
  const { projects } = useProjects();

  if (projects.length > 0) {
    return <Navigate to={`/project/${projects[0].id}`} replace />;
  }

  return <div>No projects available</div>;
}
```

### 3. localStorage from Old System

```javascript
// User has old localStorage: 'tucker'
// New system URL: /project/taskboard

// Priority: URL wins
const [selectedProjectId] = useState(() => {
  return projectId || localStorage.getItem('selectedProjectId') || null;
  // Result: projectId = 'taskboard' (URL wins)
});

// Next useEffect syncs to localStorage
useEffect(() => {
  localStorage.setItem('selectedProjectId', 'taskboard');
  // Old value overwritten
}, [selectedProjectId]);
```

### 4. Rapid Navigation (Race Conditions)

```javascript
// User rapidly clicks: Tucker → Taskboard → Context Kit

// Event 1: navigate('/project/tucker')
// Event 2: navigate('/project/agentic_ai_kanban')
// Event 3: navigate('/project/tkr_context_kit')

// React Router handles queueing
// Only final URL wins: /project/tkr_context_kit
// Context state updates to match final URL
// No race condition (URL is single source of truth)
```

---

## Testing Strategy

### Unit Tests

```javascript
describe('State Synchronization', () => {
  it('prioritizes URL over localStorage', () => {
    localStorage.setItem('selectedProjectId', 'tucker');
    const { result } = renderHook(() => useSelectedProject(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/project/taskboard']}>
          <SelectedProjectProvider>{children}</SelectedProjectProvider>
        </MemoryRouter>
      ),
    });

    expect(result.current.selectedProjectId).toBe('taskboard'); // URL wins
  });

  it('falls back to localStorage when no URL', () => {
    localStorage.setItem('selectedProjectId', 'tucker');
    const { result } = renderHook(() => useSelectedProject(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/']}>
          <SelectedProjectProvider>{children}</SelectedProjectProvider>
        </MemoryRouter>
      ),
    });

    expect(result.current.selectedProjectId).toBe('tucker');
  });

  it('updates state when URL changes', () => {
    const { result, rerender } = renderHook(() => useSelectedProject(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/project/tucker']}>
          <SelectedProjectProvider>{children}</SelectedProjectProvider>
        </MemoryRouter>
      ),
    });

    expect(result.current.selectedProjectId).toBe('tucker');

    // Simulate URL change
    act(() => {
      result.current.navigateToProject('taskboard');
    });

    expect(result.current.selectedProjectId).toBe('taskboard');
  });
});
```

### Integration Tests

```bash
# Test priority hierarchy
1. Set localStorage: 'tucker'
2. Visit /project/taskboard
3. Verify: State = 'taskboard' (URL wins)
4. Verify: localStorage updated to 'taskboard'

# Test URL-driven updates
1. Visit /project/tucker
2. Click project picker → Select "Taskboard"
3. Verify: URL changes to /project/agentic_ai_kanban
4. Verify: State updates to 'agentic_ai_kanban'
5. Verify: localStorage synced

# Test browser navigation
1. Visit /project/tucker
2. Navigate to /project/taskboard
3. Click browser back
4. Verify: State reverts to 'tucker'
5. Verify: localStorage synced to 'tucker'
```

---

## Acceptance Criteria

- [ ] URL parameters take priority over localStorage
- [ ] State updates when URL changes (browser back/forward)
- [ ] localStorage syncs when state changes
- [ ] `navigateToProject()` updates URL and state
- [ ] No infinite loops or race conditions
- [ ] Invalid project IDs handled gracefully
- [ ] Backward compatibility with old localStorage values
- [ ] All unit tests pass
- [ ] All integration tests pass

---

## Migration Notes

### For Existing Code

```javascript
// OLD: Direct state manipulation
const { setSelectedProjectId } = useSelectedProject();
setSelectedProjectId('tucker'); // ❌ Bypasses URL

// NEW: Navigate through URL
const { navigateToProject } = useSelectedProject();
navigateToProject('tucker'); // ✅ Updates URL + state
```

### Backward Compatibility

- `setSelectedProjectId` still works but is deprecated
- Old code will function but won't update URLs
- Gradual migration recommended

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-09-30 | 1.0.0 | Initial contract definition | Orchestrator |

---

## Notes

- URL is the single source of truth for project selection
- localStorage serves as fallback and persistence mechanism
- `navigateToProject()` is the preferred way to change projects
- Race conditions prevented by React Router's internal queue
- Testing requires React Router test utilities (MemoryRouter)
