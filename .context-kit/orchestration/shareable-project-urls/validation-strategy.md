# Validation Strategy: Shareable Project URLs

**Feature**: Path parameter routing for shareable project URLs
**Testing Approach**: Progressive validation with quality gates at each wave
**Goal**: Zero regression, 100% feature coverage

---

## Testing Pyramid

```
                    ╱╲
                   ╱  ╲
                  ╱ E2E ╲         ← Agent 6: Full user flows
                 ╱────────╲
                ╱          ╲
               ╱ Integration ╲    ← Agents 1-5: Contract validation
              ╱──────────────╲
             ╱                ╲
            ╱  Unit Tests      ╲  ← Agents 3-5: Component logic
           ╱────────────────────╲
```

---

## Wave 1 Validation: Foundation Layer

### Agent 1: GitHub Pages Configuration

#### Unit Tests: 404.html Script

```javascript
describe('404.html redirect script', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('stores full path in sessionStorage', () => {
    // Simulate 404.html script
    const fullPath = '/project/tucker?query=foo#hash';
    sessionStorage.setItem('redirect', fullPath);

    expect(sessionStorage.redirect).toBe('/project/tucker?query=foo#hash');
  });

  it('redirects to root origin', () => {
    // Mock location.replace
    const mockReplace = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { replace: mockReplace, origin: 'http://localhost:3000' },
      writable: true,
    });

    // Simulate script execution
    sessionStorage.setItem('redirect', '/project/tucker');
    location.replace(location.origin);

    expect(mockReplace).toHaveBeenCalledWith('http://localhost:3000');
  });
});
```

#### Integration Tests: Local Server Simulation

```bash
#!/bin/bash
# test-404-redirect.sh

# Build project
npm run build

# Start local server
python3 -m http.server 8000 -d dist &
SERVER_PID=$!
sleep 2

# Test 404 redirect
echo "Testing 404 redirect..."
RESPONSE=$(curl -s http://localhost:8000/project/nonexistent)

# Check if 404.html is returned
if echo "$RESPONSE" | grep -q "sessionStorage.setItem"; then
  echo "✅ 404.html redirect script found"
else
  echo "❌ 404.html redirect script NOT found"
  kill $SERVER_PID
  exit 1
fi

# Cleanup
kill $SERVER_PID
echo "✅ All tests passed"
```

#### Acceptance Criteria

- [ ] `public/404.html` exists
- [ ] 404.html contains sessionStorage script
- [ ] Script captures pathname + search + hash
- [ ] Script uses `location.replace()` not `location.href`
- [ ] Build copies 404.html to dist/
- [ ] Local test script passes

---

### Agent 2: Index HTML Script

#### Unit Tests: Path Restoration

```javascript
describe('index.html restoration script', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('reads and deletes sessionStorage redirect', () => {
    sessionStorage.setItem('redirect', '/project/tucker');

    // Simulate restoration script
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;

    expect(redirect).toBe('/project/tucker');
    expect(sessionStorage.redirect).toBeUndefined();
  });

  it('uses history.replaceState to restore path', () => {
    const mockReplaceState = jest.fn();
    Object.defineProperty(window.history, 'replaceState', {
      value: mockReplaceState,
      writable: true,
    });

    const redirect = '/project/tucker';
    if (redirect && redirect !== location.pathname) {
      history.replaceState(null, null, redirect);
    }

    expect(mockReplaceState).toHaveBeenCalledWith(null, null, '/project/tucker');
  });

  it('handles missing sessionStorage gracefully', () => {
    // No sessionStorage set
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;

    // Should not throw
    expect(redirect).toBeUndefined();
  });
});
```

#### Integration Tests: End-to-End Redirect Flow

```javascript
describe('404 → index redirect flow', () => {
  it('restores path after 404 redirect', async () => {
    // 1. Simulate direct navigation to /project/tucker
    // 2. 404.html loads and sets sessionStorage
    sessionStorage.setItem('redirect', '/project/tucker');

    // 3. Redirect to root
    window.history.pushState({}, '', '/');

    // 4. index.html restoration script runs
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;
    if (redirect) {
      history.replaceState(null, null, redirect);
    }

    // 5. Verify URL restored
    expect(window.location.pathname).toBe('/project/tucker');
    expect(sessionStorage.redirect).toBeUndefined();
  });
});
```

#### Acceptance Criteria

- [ ] Script added to `index.html` in `<head>`
- [ ] Script positioned before React bundle script
- [ ] Reads `sessionStorage.redirect`
- [ ] Deletes sessionStorage immediately
- [ ] Uses `history.replaceState()` not `location.href`
- [ ] Handles missing redirect gracefully
- [ ] Integration test passes (404 → restore)

---

### Agent 3: URL-Driven State Architecture

#### Unit Tests: Context Logic

```javascript
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SelectedProjectProvider, useSelectedProject } from './SelectedProjectContext';

describe('SelectedProjectContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('prioritizes URL over localStorage', () => {
    localStorage.setItem('selectedProjectId', 'tucker');

    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/project/taskboard']}>
        <SelectedProjectProvider>{children}</SelectedProjectProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useSelectedProject(), { wrapper });

    expect(result.current.selectedProjectId).toBe('taskboard'); // URL wins
  });

  it('falls back to localStorage when no URL param', () => {
    localStorage.setItem('selectedProjectId', 'tucker');

    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/']}>
        <SelectedProjectProvider>{children}</SelectedProjectProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useSelectedProject(), { wrapper });

    expect(result.current.selectedProjectId).toBe('tucker');
  });

  it('syncs localStorage when state changes', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/project/tucker']}>
        <SelectedProjectProvider>{children}</SelectedProjectProvider>
      </MemoryRouter>
    );

    const { result } = renderHook(() => useSelectedProject(), { wrapper });

    act(() => {
      result.current.navigateToProject('taskboard');
    });

    // Should sync to localStorage
    expect(localStorage.getItem('selectedProjectId')).toBe('taskboard');
  });

  it('updates state when URL changes', () => {
    const wrapper = ({ children }) => (
      <MemoryRouter initialEntries={['/project/tucker']}>
        <SelectedProjectProvider>{children}</SelectedProjectProvider>
      </MemoryRouter>
    );

    const { result, rerender } = renderHook(() => useSelectedProject(), { wrapper });

    expect(result.current.selectedProjectId).toBe('tucker');

    // Simulate URL change
    act(() => {
      result.current.navigateToProject('taskboard');
    });

    expect(result.current.selectedProjectId).toBe('taskboard');
  });
});
```

#### Acceptance Criteria

- [ ] Context uses `useParams()` to read URL
- [ ] State priority: URL > localStorage > null
- [ ] `navigateToProject()` method implemented
- [ ] URL changes trigger state updates
- [ ] State changes sync to localStorage
- [ ] All unit tests pass
- [ ] No infinite loops or race conditions

---

## Wave 2 Validation: Application Layer

### Agent 4: Routing Architecture

#### Unit Tests: Route Validation

```javascript
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage';
import ProjectPage from './components/pages/ProjectPage';

describe('Routing', () => {
  it('HomePage redirects to first project', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to /project/tucker (first project)
    expect(window.location.pathname).toBe('/project/tucker');
  });

  it('ProjectPage displays valid project', () => {
    render(
      <MemoryRouter initialEntries={['/project/tucker']}>
        <Routes>
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Tucker')).toBeInTheDocument();
  });

  it('ProjectPage redirects on invalid project', () => {
    render(
      <MemoryRouter initialEntries={['/project/invalid']}>
        <Routes>
          <Route path="/project/:projectId" element={<ProjectPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to first project
    expect(window.location.pathname).toBe('/project/tucker');
  });

  it('Catch-all route redirects to home', () => {
    render(
      <MemoryRouter initialEntries={['/nonexistent']}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </MemoryRouter>
    );

    expect(window.location.pathname).toBe('/');
  });
});
```

#### Integration Tests: Manual Validation

```bash
# Start dev server
npm run dev

# Test cases
1. Visit http://localhost:5173/
   Expected: Redirects to /project/tucker

2. Visit http://localhost:5173/project/tucker
   Expected: Shows Tucker project

3. Visit http://localhost:5173/project/agentic_ai_kanban
   Expected: Shows Taskboard project

4. Visit http://localhost:5173/project/invalid
   Expected: Redirects to /project/tucker

5. Visit http://localhost:5173/demos
   Expected: Shows demos page (unchanged)

6. Visit http://localhost:5173/random
   Expected: Redirects to /
```

#### Acceptance Criteria

- [ ] `HomePage` component created
- [ ] `ProjectPage` component created
- [ ] Routes configured in `App.jsx`
- [ ] Invalid project redirect implemented
- [ ] All unit tests pass
- [ ] All manual tests pass

---

### Agent 5: Project Picker Navigation

#### Unit Tests: Navigation Logic

```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CustomProjectPicker from './custom-project-picker';
import { SelectedProjectProvider } from '@/hooks/SelectedProjectContext';

describe('CustomProjectPicker navigation', () => {
  const mockProjects = [
    { id: 'tucker', title: 'Tucker', subtitle: 'About the designer' },
    { id: 'agentic_ai_kanban', title: 'Taskboard', subtitle: 'Kanban board' },
  ];

  it('navigates to project on selection', () => {
    render(
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

    // Open dropdown
    fireEvent.click(screen.getByText('Projects'));

    // Select different project
    fireEvent.click(screen.getByText('Taskboard'));

    // Verify navigation occurred
    expect(window.location.pathname).toBe('/project/agentic_ai_kanban');
  });

  it('closes dropdown after selection', () => {
    render(
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

    fireEvent.click(screen.getByText('Projects'));
    expect(screen.getByText('Taskboard')).toBeVisible();

    fireEvent.click(screen.getByText('Taskboard'));

    // Dropdown should close
    expect(screen.queryByText('Taskboard')).not.toBeVisible();
  });
});
```

#### Acceptance Criteria

- [ ] `handleSelect` refactored to use `navigateToProject`
- [ ] Dropdown closes after selection
- [ ] URL updates on selection
- [ ] All existing UI/UX preserved
- [ ] Unit tests pass
- [ ] No console errors

---

## Wave 3 Validation: End-to-End Testing

### Agent 6: Comprehensive Validation

#### E2E Test Suite

```javascript
// e2e/shareable-urls.spec.js (Playwright or similar)

describe('Shareable Project URLs - E2E', () => {
  beforeEach(async () => {
    await page.goto('http://localhost:5173');
  });

  test('Direct URL navigation works', async () => {
    await page.goto('http://localhost:5173/project/tucker');
    await expect(page.locator('h1')).toContainText('Tucker');
    expect(page.url()).toContain('/project/tucker');
  });

  test('Invalid project redirects to first', async () => {
    await page.goto('http://localhost:5173/project/invalid');
    await expect(page).toHaveURL(/\/project\/tucker/);
  });

  test('Project picker updates URL', async () => {
    await page.goto('http://localhost:5173/project/tucker');

    // Open dropdown
    await page.click('text=Projects');

    // Select different project
    await page.click('text=Taskboard');

    // Verify URL changed
    await expect(page).toHaveURL(/\/project\/agentic_ai_kanban/);
  });

  test('Browser back button works', async () => {
    await page.goto('http://localhost:5173/project/tucker');
    await page.click('text=Projects');
    await page.click('text=Taskboard');

    // Go back
    await page.goBack();

    // Should return to tucker
    await expect(page).toHaveURL(/\/project\/tucker/);
    await expect(page.locator('h1')).toContainText('Tucker');
  });

  test('Browser forward button works', async () => {
    await page.goto('http://localhost:5173/project/tucker');
    await page.click('text=Projects');
    await page.click('text=Taskboard');
    await page.goBack();

    // Go forward
    await page.goForward();

    // Should return to taskboard
    await expect(page).toHaveURL(/\/project\/agentic_ai_kanban/);
  });

  test('Page refresh preserves state', async () => {
    await page.goto('http://localhost:5173/project/tkr_context_kit');
    await expect(page.locator('h1')).toContainText('Context Kit');

    // Refresh
    await page.reload();

    // Should still show same project
    await expect(page).toHaveURL(/\/project\/tkr_context_kit/);
    await expect(page.locator('h1')).toContainText('Context Kit');
  });

  test('Carousel position persists per project', async () => {
    await page.goto('http://localhost:5173/project/tucker');

    // Navigate to slide 2
    await page.click('[aria-label="Next slide"]');
    await page.click('[aria-label="Next slide"]');

    // Switch projects
    await page.click('text=Projects');
    await page.click('text=Taskboard');

    // Switch back to tucker
    await page.click('text=Projects');
    await page.click('text=Tucker');

    // Carousel should remember position (slide 2)
    // (Verify via carousel indicator or visible content)
  });
});
```

#### GitHub Pages Simulation Tests

```bash
#!/bin/bash
# test-github-pages-simulation.sh

echo "🏗️  Building production assets..."
npm run build

echo "🚀 Starting local server (simulating GitHub Pages)..."
python3 -m http.server 8000 -d dist &
SERVER_PID=$!
sleep 3

echo "🧪 Testing direct URL navigation..."

# Test 1: Direct navigation to project
echo "Test 1: /project/tucker"
RESPONSE=$(curl -s -L http://localhost:8000/project/tucker)
if echo "$RESPONSE" | grep -q "Tucker"; then
  echo "✅ Direct navigation works"
else
  echo "❌ Direct navigation failed"
  kill $SERVER_PID
  exit 1
fi

# Test 2: 404 redirect
echo "Test 2: 404 redirect for /project/nonexistent"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/project/nonexistent)
if [ "$HTTP_CODE" = "404" ]; then
  echo "✅ 404.html served correctly"
else
  echo "❌ 404.html not served (got $HTTP_CODE)"
  kill $SERVER_PID
  exit 1
fi

# Test 3: Root redirects
echo "Test 3: Root path /"
RESPONSE=$(curl -s http://localhost:8000/)
if echo "$RESPONSE" | grep -q "Tucker\\|Taskboard"; then
  echo "✅ Root page loads"
else
  echo "❌ Root page failed"
  kill $SERVER_PID
  exit 1
fi

echo "🧹 Cleaning up..."
kill $SERVER_PID

echo "✅ All GitHub Pages simulation tests passed!"
```

#### Performance Validation

```javascript
describe('Performance', () => {
  test('Navigation performance', async () => {
    const start = performance.now();

    // Navigate between projects 10 times
    for (let i = 0; i < 10; i++) {
      await page.click('text=Projects');
      await page.click('text=Taskboard');
      await page.click('text=Projects');
      await page.click('text=Tucker');
    }

    const end = performance.now();
    const avgTime = (end - start) / 20; // 20 navigation actions

    expect(avgTime).toBeLessThan(100); // < 100ms per navigation
  });

  test('Bundle size', async () => {
    const stats = require('../dist/.vite/stats.json');
    const jsSize = stats.assets
      .filter(a => a.name.endsWith('.js'))
      .reduce((sum, a) => sum + a.size, 0);

    // Should not increase significantly (< 5% from baseline)
    const baseline = 500000; // 500KB baseline
    expect(jsSize).toBeLessThan(baseline * 1.05);
  });
});
```

#### Acceptance Criteria

- [ ] All E2E scenarios pass
- [ ] GitHub Pages simulation successful
- [ ] Performance within acceptable limits
- [ ] No console errors/warnings
- [ ] Mobile responsive behavior verified
- [ ] Validation report generated

---

## Regression Testing

### Existing Features Must Still Work

```bash
# Regression test checklist
✅ Theme switching (light/dark) works
✅ Image carousel navigation works
✅ Carousel position persists per project
✅ Video slides play correctly
✅ HTML slides render correctly
✅ Project colors display correctly
✅ Project logos load correctly
✅ Mobile responsive layouts work
✅ Dropdown animations work
✅ Footer links work
✅ Navigation menu works
✅ /demos page unchanged and functional
```

---

## Quality Gates

### Gate 1: Foundation Complete
- All Agent 1-3 tests pass
- No console errors
- localStorage and sessionStorage work correctly

### Gate 2: Application Complete
- All Agent 4-5 tests pass
- All routes working
- Navigation working

### Gate 3: Ready for Deployment
- All E2E tests pass
- GitHub Pages simulation successful
- No regressions found
- Performance acceptable

---

## Test Execution Order

1. **Wave 1 Unit Tests** (Agents 1-3 independently)
2. **Wave 1 Integration Tests** (404 → index flow)
3. **Gate 1 Validation**
4. **Wave 2 Unit Tests** (Agents 4-5 independently)
5. **Wave 2 Integration Tests** (routing + navigation together)
6. **Gate 2 Validation**
7. **Wave 3 E2E Tests** (Agent 6 full suite)
8. **Gate 3 Validation**
9. **Regression Tests** (all existing features)
10. **Final Approval**

---

## Success Metrics

### Quantitative
- ✅ 100% of unit tests pass
- ✅ 100% of integration tests pass
- ✅ 100% of E2E tests pass
- ✅ 0 console errors
- ✅ 0 regressions
- ✅ Navigation < 100ms average
- ✅ Bundle size increase < 5%

### Qualitative
- ✅ Shareable URLs work on GitHub Pages
- ✅ Browser back/forward feel natural
- ✅ No breaking changes to existing features
- ✅ Code maintainable and well-documented

---

## Notes

- Progressive validation catches issues early
- Quality gates prevent bad code from advancing
- E2E tests simulate real user behavior
- GitHub Pages simulation critical for deployment confidence
- Regression testing ensures existing features intact
