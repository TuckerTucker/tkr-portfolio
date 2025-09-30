# Agent Assignments & Territorial Boundaries

**Orchestration Plan**: Shareable Project URLs
**Total Agents**: 6
**Conflict Strategy**: Territorial ownership (zero file overlaps)

---

## Agent 1: GitHub Pages Configuration Specialist

### Profile
- **Expertise**: Static hosting, client-side routing, GitHub Pages quirks
- **Primary Goal**: Enable direct URL navigation on GitHub Pages
- **Wave**: 1 (Foundation Layer)

### Territorial Ownership
```
📁 public/
  └── 404.html              [CREATE - EXCLUSIVE OWNER]

📁 vite.config.js           [READ ONLY - Verify config]
📁 .github/workflows/       [OPTIONAL - Check deploy config]
```

### Responsibilities

1. **Create 404.html**
   - Implement redirect script (Contract 1: SessionStorage Schema)
   - Capture full path (pathname + search + hash)
   - Store in sessionStorage with key 'redirect'
   - Redirect to root using `location.replace()`

2. **Verify Build Configuration**
   - Ensure Vite copies `public/404.html` to `dist/404.html`
   - Check `vite.config.js` has correct `publicDir` setting
   - Validate base path configuration for GitHub Pages

3. **Local Testing**
   - Test 404.html redirect with Python HTTP server
   - Simulate GitHub Pages behavior locally
   - Document test procedure for validation

### Deliverables

- [ ] `public/404.html` created with redirect script
- [ ] Build verification completed (404.html appears in dist/)
- [ ] Local test procedure documented
- [ ] Test results validated (404 redirect works)

### Dependencies
- **None** - Independent work, no blockers

### Interface Contracts Produced
- **Contract 1**: SessionStorage Schema (key, value format, lifecycle)

### Validation Checklist
```bash
# Build test
npm run build
ls dist/404.html  # Must exist

# Local test
python3 -m http.server 8000 -d dist &
curl -I http://localhost:8000/nonexistent
# Should return 404.html

# sessionStorage test (browser console)
sessionStorage.redirect  # Should contain path after 404 redirect
```

---

## Agent 2: Index HTML Script Integration

### Profile
- **Expertise**: HTML scripting, React hydration timing, sessionStorage
- **Primary Goal**: Restore URL path before React loads
- **Wave**: 1 (Foundation Layer)

### Territorial Ownership
```
📁 index.html               [MODIFY - EXCLUSIVE OWNER]
📁 vite.config.js           [READ ONLY - Verify plugin config]
```

### Responsibilities

1. **Add Path Restoration Script**
   - Insert script in `<head>` before React bundle
   - Read `sessionStorage.redirect`
   - Delete sessionStorage immediately after reading
   - Use `history.replaceState()` to restore path

2. **Script Positioning**
   - Must execute before React hydration
   - Must not block page rendering
   - Must handle missing sessionStorage gracefully

3. **Edge Case Handling**
   - sessionStorage disabled (privacy mode)
   - Empty redirect value
   - Same path as current location (avoid unnecessary replaceState)

### Deliverables

- [ ] Restoration script added to `index.html`
- [ ] Script positioning validated (before React)
- [ ] Edge cases handled gracefully
- [ ] Integration with 404.html tested

### Dependencies
- **Agent 1**: Requires Contract 1 (SessionStorage Schema)

### Interface Contracts Consumed
- **Contract 1**: SessionStorage Schema

### Validation Checklist
```bash
# Manual test
1. npm run build
2. python3 -m http.server 8000 -d dist
3. Visit http://localhost:8000/project/tucker directly
4. Verify: 404.html loads → Redirects to root → URL restored to /project/tucker
5. Verify: sessionStorage.redirect is deleted
6. Verify: No console errors
```

---

## Agent 3: URL-Driven State Architecture

### Profile
- **Expertise**: React Context, React Router hooks, state management
- **Primary Goal**: Refactor context to use URL as primary state source
- **Wave**: 1 (Foundation Layer)

### Territorial Ownership
```
📁 src/hooks/
  └── SelectedProjectContext.jsx    [MODIFY - EXCLUSIVE OWNER]
```

### Responsibilities

1. **Refactor State Priority**
   - Change from localStorage-first to URL-first
   - Integrate `useParams()` to read URL projectId
   - Add `useNavigate()` for navigation helper
   - Maintain localStorage as fallback

2. **Add navigateToProject Method**
   - Expose `navigateToProject(id)` in context value
   - Implement as wrapper around `navigate('/project/${id}')`
   - Keep `setSelectedProjectId` for backward compat (deprecated)

3. **Synchronization Logic**
   - Sync state when URL changes (useEffect on projectId)
   - Sync localStorage when state changes
   - Prevent infinite loops and race conditions

### Deliverables

- [ ] Context refactored to URL-first priority
- [ ] `navigateToProject()` method added
- [ ] URL change detection implemented (useEffect)
- [ ] localStorage synchronization maintained
- [ ] Backward compatibility preserved

### Dependencies
- **Agent 4**: Requires Contract 2 (URL Parameter Schema) for URL format

### Interface Contracts Consumed
- **Contract 2**: URL Parameter Schema

### Interface Contracts Produced
- **Contract 3**: State Synchronization (priority, flow, API)

### Validation Checklist
```javascript
// Unit tests
describe('SelectedProjectContext', () => {
  it('prioritizes URL over localStorage', () => {
    localStorage.setItem('selectedProjectId', 'tucker');
    const { result } = renderHook(() => useSelectedProject(), {
      wrapper: ({ children }) => (
        <MemoryRouter initialEntries={['/project/taskboard']}>
          <SelectedProjectProvider>{children}</SelectedProjectProvider>
        </MemoryRouter>
      ),
    });
    expect(result.current.selectedProjectId).toBe('taskboard');
  });

  it('updates state when URL changes', () => {
    // Test browser back/forward simulation
  });

  it('syncs localStorage when state changes', () => {
    // Test localStorage writes
  });
});
```

---

## Agent 4: Routing Architecture

### Profile
- **Expertise**: React Router v6, route validation, component composition
- **Primary Goal**: Implement `/project/:projectId` routing structure
- **Wave**: 2 (Application Layer)

### Territorial Ownership
```
📁 src/
  ├── App.jsx                       [MODIFY - Routes section only]
  └── components/pages/
      ├── HomePage.jsx              [CREATE - EXCLUSIVE OWNER]
      └── ProjectPage.jsx           [CREATE - EXCLUSIVE OWNER]
```

### Responsibilities

1. **Create HomePage Component**
   - Redirects to `/project/{firstProject.id}`
   - Handles empty projects array
   - Shows loading/error states

2. **Create ProjectPage Component**
   - Reads `projectId` from useParams()
   - Validates project exists
   - Redirects to first project if invalid
   - Renders project content (picker + carousel)

3. **Update App.jsx Routes**
   - Add `/` route → HomePage
   - Add `/project/:projectId` route → ProjectPage
   - Keep `/demos` route (unchanged)
   - Add catch-all `*` route → Navigate to `/`

### Deliverables

- [ ] HomePage component created
- [ ] ProjectPage component created
- [ ] App.jsx routes updated
- [ ] Invalid project ID redirect logic implemented
- [ ] All routes tested

### Dependencies
- **Agent 3**: Requires Contract 3 (State Synchronization) for context API

### Interface Contracts Consumed
- **Contract 2**: URL Parameter Schema (route pattern)
- **Contract 3**: State Synchronization (context API)

### Interface Contracts Produced
- **Contract 4**: Component Props (page component interfaces)

### Validation Checklist
```bash
# Manual tests
1. npm run dev
2. Visit / → Should redirect to /project/tucker
3. Visit /project/tucker → Should show Tucker project
4. Visit /project/invalid → Should redirect to /project/tucker
5. Visit /demos → Should show demos page (unchanged)
6. Visit /random → Should redirect to /
```

---

## Agent 5: Project Picker Navigation

### Profile
- **Expertise**: Component refactoring, React Router hooks, event handling
- **Primary Goal**: Update CustomProjectPicker to navigate via URL
- **Wave**: 2 (Application Layer)

### Territorial Ownership
```
📁 src/components/feature/
  └── custom-project-picker.jsx     [MODIFY - EXCLUSIVE OWNER]
```

### Responsibilities

1. **Refactor handleSelect Method**
   - Replace `onSelectProject` callback with `navigateToProject()`
   - Import and use `useSelectedProject()` hook
   - Maintain backward compatibility with `onSelectProject` prop (deprecated)

2. **Import React Router Hooks**
   - Add `import { useNavigate } from 'react-router-dom'`
   - Use `navigateToProject` from context (preferred)
   - Or use `useNavigate()` directly

3. **Maintain All Existing Behavior**
   - Dropdown open/close logic unchanged
   - Mobile responsive behavior unchanged
   - Styling and UI unchanged
   - Only navigation mechanism changes

### Deliverables

- [ ] `handleSelect` refactored to use navigation
- [ ] `navigateToProject()` integrated from context
- [ ] Backward compatibility maintained
- [ ] All existing UI/UX preserved
- [ ] Component tested with new navigation

### Dependencies
- **Agent 3**: Requires Contract 3 (State Synchronization) for `navigateToProject`

### Interface Contracts Consumed
- **Contract 3**: State Synchronization (`navigateToProject` API)
- **Contract 4**: Component Props (CustomProjectPicker interface)

### Validation Checklist
```bash
# Manual tests
1. npm run dev
2. Visit /project/tucker
3. Click project picker → Open dropdown
4. Click "Taskboard"
5. Verify: URL changes to /project/agentic_ai_kanban
6. Verify: Page content updates to Taskboard project
7. Verify: Dropdown closes
8. Verify: No console errors
```

---

## Agent 6: Integration Testing & Validation

### Profile
- **Expertise**: E2E testing, validation procedures, GitHub Pages deployment
- **Primary Goal**: Comprehensive validation of all features
- **Wave**: 3 (Integration & Validation)

### Territorial Ownership
```
📁 .context-kit/orchestration/shareable-project-urls/
  ├── test-results.md               [CREATE - EXCLUSIVE OWNER]
  └── validation-report.md          [CREATE - EXCLUSIVE OWNER]
```

### Responsibilities

1. **E2E Test Scenarios**
   - Direct URL navigation (/project/{id})
   - Invalid project ID handling
   - Project picker navigation
   - Browser back/forward buttons
   - Refresh on project page
   - localStorage persistence

2. **GitHub Pages Simulation**
   - Build production assets
   - Serve with Python HTTP server
   - Test 404.html redirect locally
   - Validate sessionStorage flow
   - Test all routes

3. **Performance & Quality**
   - Check console for errors/warnings
   - Validate build size
   - Test mobile responsive behavior
   - Verify carousel position persistence

4. **Documentation**
   - Document all test cases
   - Record test results
   - Create validation report
   - List any issues found

### Deliverables

- [ ] All E2E scenarios tested and passed
- [ ] GitHub Pages simulation completed
- [ ] Performance validation completed
- [ ] Test results documented
- [ ] Validation report generated
- [ ] Any issues reported with reproduction steps

### Dependencies
- **All Agents**: Requires all features complete from Waves 1 & 2

### Interface Contracts Consumed
- All contracts (validation of integration)

### Validation Checklist
```bash
# E2E Test Suite
✅ Direct navigation: /project/tucker loads correctly
✅ Direct navigation: /project/invalid redirects to first project
✅ Project picker: Selection updates URL and content
✅ Browser back: Returns to previous project
✅ Browser forward: Goes to next project
✅ Page refresh: Project state persists
✅ localStorage: Syncs with URL correctly
✅ 404.html: Redirect works locally
✅ sessionStorage: Deleted after use
✅ Mobile: All features work on mobile viewport
✅ Performance: No degradation from baseline
✅ Console: No errors or warnings
```

---

## Conflict Prevention Matrix

| Agent | Files Modified | Files Created | Conflicts? |
|-------|----------------|---------------|------------|
| 1 | None | `public/404.html` | ❌ None |
| 2 | `index.html` | None | ❌ None |
| 3 | `src/hooks/SelectedProjectContext.jsx` | None | ❌ None |
| 4 | `src/App.jsx` (Routes only) | `HomePage.jsx`, `ProjectPage.jsx` | ❌ None |
| 5 | `src/components/feature/custom-project-picker.jsx` | None | ❌ None |
| 6 | None | Test docs | ❌ None |

**Result**: **Zero conflicts** - Each agent has exclusive file ownership

---

## Communication Protocol

### Status Broadcasting

Each agent must report:
1. **Started**: "Agent [N] starting work on [deliverable]"
2. **Blocked**: "Agent [N] blocked waiting for [contract/dependency]"
3. **Completed**: "Agent [N] completed [deliverable], contract [X] ready"
4. **Failed**: "Agent [N] failed [deliverable], error: [description]"

### Contract Handoff

```
Agent 1 completes Contract 1 (SessionStorage Schema)
  ↓
Agent 1 broadcasts: "Contract 1 ready for consumption"
  ↓
Agent 2 validates Contract 1 specification
  ↓
Agent 2 begins implementation using Contract 1
  ↓
Agent 2 reports any contract violations or ambiguities
```

---

## Wave Synchronization Gates

### Gate 1: After Wave 1 (Foundation)
**Criteria**: All contracts 1-3 validated and ready
- [ ] Agent 1: 404.html exists and tested
- [ ] Agent 2: index.html script added and tested
- [ ] Agent 3: Context refactored and unit tests pass
- [ ] All 3 agents report completion
- [ ] Contracts 1-3 validated by consumers

**Blocker Resolution**: If any agent blocked, other agents pause and assist

---

### Gate 2: After Wave 2 (Application)
**Criteria**: Routing and navigation complete
- [ ] Agent 4: All routes implemented and tested
- [ ] Agent 5: Navigation working correctly
- [ ] Manual smoke test passes (visit /project/tucker works)
- [ ] Both agents report completion
- [ ] No console errors

**Blocker Resolution**: If navigation broken, Agent 6 assists with debugging

---

### Gate 3: After Wave 3 (Validation)
**Criteria**: Full system validated
- [ ] Agent 6: All E2E scenarios pass
- [ ] GitHub Pages simulation successful
- [ ] Validation report complete
- [ ] No critical issues found

**Blocker Resolution**: If critical issues found, appropriate agent fixes before deployment

---

## Rollback Procedures

### Wave 1 Rollback
```bash
git checkout HEAD -- public/404.html index.html src/hooks/SelectedProjectContext.jsx
npm install  # Reset dependencies
```

### Wave 2 Rollback
```bash
git checkout HEAD -- src/App.jsx src/components/pages/ src/components/feature/custom-project-picker.jsx
```

### Full Rollback
```bash
git reset --hard HEAD
npm install
```

---

## Success Criteria

### Agent 1
- ✅ 404.html redirect works locally
- ✅ sessionStorage set correctly

### Agent 2
- ✅ Path restoration works before React loads
- ✅ No timing issues or race conditions

### Agent 3
- ✅ URL-first priority implemented
- ✅ State syncs with URL changes
- ✅ localStorage still works

### Agent 4
- ✅ All routes working
- ✅ Invalid project IDs handled

### Agent 5
- ✅ Project picker navigates via URL
- ✅ All UI/UX preserved

### Agent 6
- ✅ All test scenarios pass
- ✅ Ready for deployment

---

## Timeline Estimate

| Agent | Wave | Est. Time | Dependencies |
|-------|------|-----------|--------------|
| 1 | 1 | 20 min | None |
| 2 | 1 | 15 min | Agent 1 |
| 3 | 1 | 30 min | None (parallel) |
| 4 | 2 | 25 min | Agent 3 |
| 5 | 2 | 15 min | Agent 3 |
| 6 | 3 | 30 min | All |

**Total**: ~70 minutes with proper wave execution

---

## Notes

- All agents work in parallel within their wave (maximum parallelism)
- Synchronization gates ensure quality before proceeding
- Zero file conflicts guarantee smooth integration
- Rollback procedures at each stage for safety
- Communication protocol ensures visibility and coordination
