# Orchestration Plan: Shareable Project URLs

**Feature Goal**: Implement path parameter routing (`/project/:projectId`) to enable shareable URLs to specific projects

**Max Agents**: 6
**Strategy**: Wave-based execution with territorial ownership and interface contracts
**Estimated Duration**: 3 waves with validation gates

---

## Executive Summary

Transform portfolio from localStorage-based project selection to URL-driven navigation:
- **Current State**: `/?any-url` always loads first project, selection stored in localStorage
- **Target State**: `/project/tkr_context_kit` directly loads specific project, shareable URLs work
- **Key Challenge**: GitHub Pages static hosting requires client-side routing configuration

### Success Criteria
1. Direct navigation to `/project/{projectId}` loads correct project
2. Project selection updates URL (browser back/forward work)
3. Invalid project IDs gracefully fallback to first project
4. GitHub Pages 404 redirects work correctly
5. localStorage syncs with URL (optional persistence)
6. All existing functionality preserved (carousel position, theme, etc.)

---

## Phase 1: Requirements Analysis

### Integration Points Identified

1. **URL ↔ State Synchronization**
   - React Router URL params → SelectedProjectContext state
   - State changes → URL updates via `useNavigate()`
   - Browser back/forward → State updates

2. **GitHub Pages Routing**
   - 404.html redirect script → sessionStorage
   - index.html restoration script → React Router

3. **Project Loading**
   - URL project ID → Projects data validation
   - Invalid/missing ID → Fallback to first project

4. **Component Communication**
   - CustomProjectPicker selection → URL navigation
   - App routing → SelectedProjectContext
   - Context → All consuming components

### Files Requiring Modification

| File | Type | Purpose |
|------|------|---------|
| `src/App.jsx` | MODIFY | Add `/project/:projectId` route |
| `src/hooks/SelectedProjectContext.jsx` | MODIFY | URL-driven state management |
| `src/components/feature/custom-project-picker.jsx` | MODIFY | Navigate on selection |
| `public/404.html` | NEW | GitHub Pages redirect |
| `dist/index.html` | MODIFY | Restore path script |
| `vite.config.js` | CHECK | Build config validation |

---

## Phase 2: Agent Assignments & Territorial Ownership

### Agent 1: GitHub Pages Configuration Specialist
**Territory**: `public/404.html`, build configuration
**Deliverables**:
- Create `public/404.html` with redirect script
- Verify Vite build copies 404.html to dist/
- Test 404 redirect locally (Python server simulation)

**No Conflicts**: Works in public/ directory only

---

### Agent 2: Index HTML Script Integration
**Territory**: `dist/index.html`, Vite HTML plugin config
**Deliverables**:
- Add path restoration script to `index.html`
- Ensure script runs before React hydration
- Validate sessionStorage handling

**Dependencies**:
- Interface Contract 1: sessionStorage schema from Agent 1

---

### Agent 3: URL-Driven State Architecture
**Territory**: `src/hooks/SelectedProjectContext.jsx`
**Deliverables**:
- Refactor context to prioritize URL params over localStorage
- Add `useParams()` integration for reading URL
- Maintain backward compatibility with localStorage fallback
- Expose navigation handler for URL updates

**Dependencies**:
- Interface Contract 2: URL parameter schema
- Interface Contract 3: State synchronization contract

**Key Changes**:
```javascript
// Current: localStorage-first
const [selectedProjectId, setSelectedProjectId] = useState(() => {
  return localStorage.getItem('selectedProjectId') || null;
});

// New: URL-first
const { projectId } = useParams();
const [selectedProjectId, setSelectedProjectId] = useState(() => {
  return projectId || localStorage.getItem('selectedProjectId') || null;
});
```

---

### Agent 4: Routing Architecture
**Territory**: `src/App.jsx` Routes configuration
**Deliverables**:
- Add `/project/:projectId` route
- Create ProjectPage component (or refactor HomePage)
- Handle invalid project IDs with redirect
- Preserve `/demos` route

**Dependencies**:
- Interface Contract 2: URL parameter schema
- Interface Contract 4: Component props contract

**Routing Structure**:
```javascript
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/project/:projectId" element={<ProjectPage />} />
  <Route path="/demos" element={<DemoShowcase />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
```

---

### Agent 5: Project Picker Navigation
**Territory**: `src/components/feature/custom-project-picker.jsx`
**Deliverables**:
- Replace `onSelectProject` callback with `useNavigate()`
- Navigate to `/project/{projectId}` on selection
- Maintain all existing UI/UX behavior

**Dependencies**:
- Interface Contract 3: State synchronization contract

**Key Change**:
```javascript
// Current
const handleSelect = (project) => {
  if (onSelectProject) {
    onSelectProject(project);
  }
  setIsOpen(false);
};

// New
const handleSelect = (project) => {
  navigate(`/project/${project.id}`);
  setIsOpen(false);
};
```

---

### Agent 6: Integration Testing & Validation
**Territory**: Test scripts, validation procedures
**Deliverables**:
- E2E test scenarios for all routes
- Browser back/forward testing
- GitHub Pages deployment validation
- Shareable URL testing

**Dependencies**: All interface contracts

---

## Phase 3: Wave-Based Execution Plan

### Wave 1: Foundation Layer (Parallel Execution)

**Duration**: ~30 minutes
**Agents**: 1, 2, 3

#### Agent 1: GitHub Pages Config
```bash
# Deliverables
- public/404.html created
- Vite config verified
- Local test with Python server
```

#### Agent 2: Index HTML Script
```bash
# Deliverables
- Path restoration script added
- Script positioning validated
- sessionStorage handling tested
```

#### Agent 3: Context Refactoring
```bash
# Deliverables
- URL-first state logic
- useParams() integration
- localStorage fallback maintained
- Navigation handler exposed
```

**Synchronization Gate**:
- [ ] 404.html exists and has correct script
- [ ] index.html has restoration script
- [ ] SelectedProjectContext reads from URL params
- [ ] Unit tests pass for context logic

---

### Wave 2: Application Layer (Parallel Execution)

**Duration**: ~20 minutes
**Agents**: 4, 5

**Prerequisites**: Wave 1 complete, all contracts validated

#### Agent 4: Routing Layer
```bash
# Deliverables
- /project/:projectId route added
- ProjectPage component created/refactored
- Invalid ID redirect logic
- Route testing complete
```

#### Agent 5: Navigation Integration
```bash
# Deliverables
- CustomProjectPicker uses useNavigate()
- Selection triggers URL change
- UI behavior unchanged
- Component testing complete
```

**Synchronization Gate**:
- [ ] All routes defined and working
- [ ] Project picker navigates correctly
- [ ] URL updates on selection
- [ ] Manual navigation test passes

---

### Wave 3: Integration & Validation (Sequential)

**Duration**: ~20 minutes
**Agent**: 6

**Prerequisites**: Wave 2 complete, all features integrated

#### Validation Scenarios
1. **Direct URL Navigation**
   - Visit `/project/tkr_context_kit` → Loads correct project
   - Visit `/project/invalid` → Redirects to first project
   - Visit `/` → Loads first project

2. **Interactive Navigation**
   - Select project → URL updates → Page updates
   - Browser back → Previous project loads
   - Browser forward → Next project loads

3. **GitHub Pages Simulation**
   - Serve dist/ with Python HTTP server
   - Direct navigation to /project/foo → Works via 404 redirect
   - Refresh on project page → Works

4. **Edge Cases**
   - Empty project list handling
   - Rapid navigation (race conditions)
   - localStorage migration (old → new system)

**Final Gate**:
- [ ] All E2E scenarios pass
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Ready for deployment

---

## Integration Contracts

### Contract 1: SessionStorage Schema
**Owner**: Agent 1
**Consumers**: Agent 2

```typescript
interface SessionStorageSchema {
  key: 'redirect';
  value: string; // Full path: "/project/foo" or "/project/foo?query=bar#hash"
  lifecycle: 'Set by 404.html, consumed once by index.html, then deleted';
}
```

**Example**:
```javascript
// 404.html sets
sessionStorage.setItem('redirect', '/project/tkr_context_kit');

// index.html reads and deletes
const redirect = sessionStorage.redirect;
delete sessionStorage.redirect;
if (redirect && redirect !== location.pathname) {
  history.replaceState(null, null, redirect);
}
```

---

### Contract 2: URL Parameter Schema
**Owner**: Agent 4
**Consumers**: Agent 3, Agent 5

```typescript
interface URLParameterSchema {
  route: '/project/:projectId';
  parameter: {
    name: 'projectId';
    type: 'string';
    format: 'lowercase with underscores (e.g., "tkr_context_kit")';
    validation: 'Must match a project.id from projects.json';
    fallback: 'If invalid, use first project from projects array';
  };
  examples: [
    '/project/tucker',
    '/project/tkr_context_kit',
    '/project/agentic_ai_kanban',
    '/project/invalid' // → redirects to first project
  ];
}
```

---

### Contract 3: State Synchronization Contract
**Owner**: Agent 3
**Consumers**: Agent 4, Agent 5

```typescript
interface StateSynchronization {
  priority: 'URL params > localStorage > first project';

  stateFlow: {
    onMount: 'Read URL → Set state → Sync localStorage';
    onSelection: 'Component calls navigate() → URL updates → State updates → localStorage syncs';
    onURLChange: 'React Router triggers → Context updates → localStorage syncs';
  };

  contextAPI: {
    selectedProjectId: 'string | null';
    setSelectedProjectId: '(id: string) => void'; // Still exposed but not primary method
    navigateToProject: '(id: string) => void'; // NEW: Preferred method, updates URL
  };
}
```

**Implementation**:
```javascript
export function SelectedProjectProvider({ children }) {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedProjectId, setSelectedProjectIdState] = useState(() => {
    // Priority: URL > localStorage > null
    return projectId || localStorage.getItem('selectedProjectId') || null;
  });

  // Sync state when URL changes
  useEffect(() => {
    if (projectId && projectId !== selectedProjectId) {
      setSelectedProjectIdState(projectId);
    }
  }, [projectId]);

  // Sync localStorage when state changes
  useEffect(() => {
    if (selectedProjectId) {
      localStorage.setItem('selectedProjectId', selectedProjectId);
    } else {
      localStorage.removeItem('selectedProjectId');
    }
  }, [selectedProjectId]);

  // Navigation helper
  const navigateToProject = useCallback((id) => {
    navigate(`/project/${id}`);
  }, [navigate]);

  return (
    <SelectedProjectContext.Provider value={{
      selectedProjectId,
      setSelectedProjectId: setSelectedProjectIdState, // Keep for backward compat
      navigateToProject // Preferred method
    }}>
      {children}
    </SelectedProjectContext.Provider>
  );
}
```

---

### Contract 4: Component Props Contract
**Owner**: Agent 4
**Consumers**: Agent 3, Agent 5

```typescript
interface ProjectPageProps {
  // No props needed - reads from URL params + context
}

interface HomePageProps {
  // No props needed - shows first project or redirects
}

// CustomProjectPicker remains unchanged
interface CustomProjectPickerProps {
  projects: Project[];
  selectedProject: Project | null;
  selectedProjectTitle: string;
  onSelectProject?: (project: Project) => void; // DEPRECATED, will use navigateToProject internally
  className?: string;
}
```

---

## Conflict Prevention Strategy

### File Ownership Matrix

| Agent | Files Owned | Conflicts? |
|-------|-------------|------------|
| 1 | `public/404.html` (NEW) | ❌ No |
| 2 | `dist/index.html` via Vite plugin | ❌ No |
| 3 | `src/hooks/SelectedProjectContext.jsx` | ❌ No |
| 4 | `src/App.jsx` Routes section | ❌ No |
| 5 | `src/components/feature/custom-project-picker.jsx` | ❌ No |
| 6 | Test files only | ❌ No |

**Zero conflicts** - Each agent has exclusive ownership

---

## Quality Assurance Strategy

### Progressive Validation

#### After Wave 1
```bash
# Validate 404.html
python3 -m http.server 8000 -d dist &
curl http://localhost:8000/nonexistent
# Should return 404.html with redirect script

# Validate context
npm test -- SelectedProjectContext.test.jsx
# URL-first logic should pass
```

#### After Wave 2
```bash
# Validate routing
npm run dev
# Visit http://localhost:5173/project/tkr_context_kit
# Should load correct project

# Validate navigation
# Click project picker → URL should change
```

#### After Wave 3
```bash
# Full E2E validation
npm run build
python3 -m http.server 8000 -d dist &
# Test all scenarios in validation plan
```

---

## Rollback Procedures

### Circuit Breakers

**If Wave 1 fails**:
- Delete `public/404.html`
- Revert context changes
- System returns to localStorage-only mode

**If Wave 2 fails**:
- Remove `/project/:projectId` route
- Revert CustomProjectPicker navigation
- Wave 1 changes remain (no harm in 404.html existing)

**If Wave 3 validation fails**:
- Git rollback all changes
- Investigate failures
- Re-run waves with fixes

---

## Deployment Checklist

### Pre-Deployment
- [ ] All waves complete
- [ ] All validation scenarios pass
- [ ] No console errors/warnings
- [ ] Build succeeds for both portfolio and storybook
- [ ] 404.html exists in dist/ after build

### Deployment
```bash
npm run clean
npm run build:storybook
npm run build:portfolio
# Verify dist/404.html exists
npm run deploy:portfolio
```

### Post-Deployment Validation
- [ ] Visit https://[domain]/project/tkr_context_kit directly
- [ ] Project loads correctly (not 404)
- [ ] Browser back/forward work
- [ ] Share URL with colleague → Works

---

## Success Metrics

### Functional
- ✅ Direct URL navigation works
- ✅ Shareable URLs work
- ✅ Browser navigation works
- ✅ Existing features preserved

### Technical
- ✅ Zero conflicts during execution
- ✅ All tests pass
- ✅ Build succeeds
- ✅ GitHub Pages compatible

### User Experience
- ✅ No behavior changes (except URLs)
- ✅ Faster project sharing
- ✅ Bookmarkable projects

---

## Timeline Summary

| Wave | Duration | Agents | Deliverables |
|------|----------|--------|--------------|
| 1 | 30 min | 1, 2, 3 | Foundation (404, index, context) |
| 2 | 20 min | 4, 5 | Application (routing, navigation) |
| 3 | 20 min | 6 | Validation & testing |
| **Total** | **~70 min** | **6 agents** | **Full feature** |

---

## Notes

- **No backward compatibility needed**: User confirmed we can freely modify `/` and `/demos`
- **GitHub Pages requirement**: 404.html redirect is essential for direct navigation
- **localStorage preserved**: Still used as fallback and for persistence
- **Zero conflicts**: Territorial ownership prevents merge conflicts
- **Progressive validation**: Quality gates after each wave ensure stability
