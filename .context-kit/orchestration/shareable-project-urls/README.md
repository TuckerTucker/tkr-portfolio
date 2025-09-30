# Shareable Project URLs - Orchestration Plan

**Feature**: Path parameter routing (`/project/:projectId`) for shareable project URLs
**Status**: Ready for execution
**Created**: 2025-09-30
**Strategy**: Wave-based parallel agent execution with territorial ownership

---

## 📋 Overview

Transform the portfolio from localStorage-based project selection to URL-driven navigation, enabling shareable links to specific projects while maintaining all existing functionality.

### Current State
```
Visit any URL → Always loads first project
Selection stored in localStorage only
No shareable URLs
```

### Target State
```
Visit /project/tkr_context_kit → Loads that specific project
URL updates when selecting projects
Browser back/forward work correctly
Shareable URLs work on GitHub Pages
```

---

## 📁 Documentation Structure

```
shareable-project-urls/
├── README.md                           ← You are here
├── orchestration-plan.md               ← Master execution plan
├── agent-assignments.md                ← Agent responsibilities & territories
├── validation-strategy.md              ← Testing & quality assurance
├── coordination-protocol.md            ← Communication & status management
└── integration-contracts/
    ├── 01-sessionstorage-schema.md     ← 404.html ↔ index.html contract
    ├── 02-url-parameter-schema.md      ← URL format & validation
    ├── 03-state-synchronization.md     ← Context ↔ URL synchronization
    └── 04-component-props.md           ← Component interfaces
```

---

## 🚀 Quick Start

### For Orchestrator

1. **Review orchestration-plan.md** - Understand waves, agents, deliverables
2. **Review agent-assignments.md** - Understand territorial boundaries
3. **Open coordination-protocol.md** - Set up status tracking
4. **Launch Wave 1** - Agents 1, 2, 3 (Foundation Layer)
5. **Validate Gate 1** - Foundation complete
6. **Launch Wave 2** - Agents 4, 5 (Application Layer)
7. **Validate Gate 2** - Application complete
8. **Launch Wave 3** - Agent 6 (Validation)
9. **Validate Gate 3** - Deployment ready
10. **Deploy** - Push to production

### For Individual Agents

1. **Find your assignment** - See agent-assignments.md
2. **Read your contracts** - Check integration-contracts/
3. **Execute your work** - Stay in your territory
4. **Broadcast status** - Use coordination-protocol.md templates
5. **Validate your work** - Run tests from validation-strategy.md
6. **Report completion** - Announce contract ready

---

## 👥 Agent Roster

| Agent | Wave | Territory | Deliverable | Dependencies |
|-------|------|-----------|-------------|--------------|
| **Agent 1** | 1 | `public/404.html` | GitHub Pages redirect | None |
| **Agent 2** | 1 | `index.html` | Path restoration script | Agent 1 |
| **Agent 3** | 1 | `SelectedProjectContext.jsx` | URL-first state | None |
| **Agent 4** | 2 | `App.jsx`, `HomePage`, `ProjectPage` | Routing layer | Agent 3 |
| **Agent 5** | 2 | `custom-project-picker.jsx` | Navigation updates | Agent 3 |
| **Agent 6** | 3 | Testing & validation | E2E validation | All |

---

## 🎯 Success Criteria

### Functional
- ✅ Direct URL navigation works (`/project/tucker` loads Tucker project)
- ✅ Invalid project IDs redirect gracefully
- ✅ Project picker updates URL on selection
- ✅ Browser back/forward buttons work correctly
- ✅ Page refresh preserves project state
- ✅ Shareable URLs work on GitHub Pages

### Technical
- ✅ Zero file conflicts during execution
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ All E2E tests pass
- ✅ No console errors/warnings
- ✅ No regressions in existing features

### Performance
- ✅ Navigation < 100ms average
- ✅ Bundle size increase < 5%
- ✅ No degradation in user experience

---

## 📊 Execution Waves

### Wave 1: Foundation Layer (30 minutes)
**Parallel Execution**: Agents 1, 2, 3

- **Agent 1**: Create `public/404.html` with redirect script
- **Agent 2**: Add path restoration to `index.html`
- **Agent 3**: Refactor context for URL-first priority

**Gate 1**: All foundation contracts validated

---

### Wave 2: Application Layer (20 minutes)
**Parallel Execution**: Agents 4, 5

- **Agent 4**: Implement routing (`HomePage`, `ProjectPage`)
- **Agent 5**: Update project picker navigation

**Gate 2**: All routes working, navigation functional

---

### Wave 3: Integration & Validation (20 minutes)
**Sequential**: Agent 6

- **Agent 6**: Run E2E tests, GitHub Pages simulation, validation

**Gate 3**: All tests passed, ready for deployment

---

## 🔗 Key Integration Contracts

### Contract 1: SessionStorage Schema
**Owner**: Agent 1 | **Consumers**: Agent 2

Defines how 404.html passes URL to index.html via sessionStorage:
```javascript
sessionStorage.setItem('redirect', '/project/tkr_context_kit');
location.replace('/');
```

---

### Contract 2: URL Parameter Schema
**Owner**: Agent 4 | **Consumers**: Agent 3, 5

Defines URL structure and validation:
```
/project/:projectId
Valid: /project/tucker, /project/tkr_context_kit
Invalid: /project/invalid → redirect to first
```

---

### Contract 3: State Synchronization
**Owner**: Agent 3 | **Consumers**: Agent 4, 5

Defines state priority and synchronization:
```
Priority: URL > localStorage > first project
API: navigateToProject(id) updates URL → state follows
```

---

### Contract 4: Component Props
**Owner**: Agent 4 | **Consumers**: Agent 3, 5

Defines component interfaces:
```javascript
<ProjectPage /> // Reads from URL params + context
<CustomProjectPicker /> // Uses navigateToProject() internally
```

---

## 🛡️ Conflict Prevention

### Territorial Ownership Matrix

| File | Owner | Others |
|------|-------|--------|
| `public/404.html` | Agent 1 | READ ONLY |
| `index.html` | Agent 2 | READ ONLY |
| `src/hooks/SelectedProjectContext.jsx` | Agent 3 | READ ONLY |
| `src/App.jsx` | Agent 4 | READ ONLY |
| `src/components/pages/*` | Agent 4 | NONE |
| `src/components/feature/custom-project-picker.jsx` | Agent 5 | READ ONLY |

**Result**: **Zero file conflicts** guaranteed

---

## 📝 Status Tracking

### Communication Protocol

All agents broadcast status updates:

```
[TIMESTAMP] [AGENT_ID] [STATUS] [MESSAGE]

Examples:
[10:23:15] Agent-1 STARTED Creating public/404.html
[10:25:42] Agent-1 COMPLETED Contract-1 ready
[10:26:03] Agent-2 STARTED Consuming Contract-1
```

See **coordination-protocol.md** for full templates.

---

## ✅ Validation Checklist

### Wave 1 Validation
- [ ] 404.html exists and has redirect script
- [ ] index.html has restoration script before React
- [ ] Context prioritizes URL over localStorage
- [ ] All unit tests pass

### Wave 2 Validation
- [ ] Routes `/`, `/project/:projectId`, `/demos` work
- [ ] Invalid project IDs redirect correctly
- [ ] Project picker navigates via URL
- [ ] All integration tests pass

### Wave 3 Validation
- [ ] All E2E scenarios pass
- [ ] GitHub Pages simulation successful
- [ ] No regressions found
- [ ] Performance within limits

---

## 🚨 Rollback Procedures

### Wave 1 Rollback
```bash
git checkout HEAD -- public/404.html index.html src/hooks/SelectedProjectContext.jsx
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

## 📈 Timeline

| Wave | Duration | Cumulative |
|------|----------|------------|
| Wave 1 | 30 min | 30 min |
| Wave 2 | 20 min | 50 min |
| Wave 3 | 20 min | 70 min |
| **Total** | **~70 min** | **~70 min** |

---

## 🎓 Learning Resources

### GitHub Pages Client-Side Routing

**Problem**: GitHub Pages serves static files. Direct navigation to `/project/foo` looks for a file, returns 404.

**Solution**:
1. Create `public/404.html` that captures path and redirects to root
2. Root `index.html` restores path before React loads
3. React Router handles routing client-side

**Resources**:
- [React Router + GitHub Pages Guide](https://create-react-app.dev/docs/deployment/#github-pages)
- [SPA GitHub Pages Workaround](https://github.com/rafgraph/spa-github-pages)

---

## 📞 Support & Questions

### Contract Ambiguities
- Check integration-contracts/ for detailed specifications
- If unclear, request clarification via status broadcast
- Producer agent updates contract and re-broadcasts

### Technical Issues
- Use ASSISTANCE_NEEDED status
- Other agents can offer help
- Escalate to orchestrator if critical

### Blockers
- Report BLOCKED status with reason
- Wait for dependency or request coordination
- Don't proceed until unblocked

---

## 🎯 Next Steps

1. **Orchestrator**: Review orchestration-plan.md and launch Wave 1
2. **Agents 1-3**: Read your assignments and begin foundation work
3. **All**: Use coordination-protocol.md for status updates
4. **Wave completion**: Validate at each gate before proceeding

---

## 📄 Additional Documentation

- **orchestration-plan.md** - Master plan with waves, agents, deliverables, gates
- **agent-assignments.md** - Detailed responsibilities, territories, validation
- **validation-strategy.md** - Testing approach, scenarios, quality gates
- **coordination-protocol.md** - Communication templates, status management
- **integration-contracts/** - Interface specifications for each handoff point

---

## ✨ Key Principles

1. **Territorial Ownership** - Each agent owns specific files, no overlaps
2. **Interface Contracts** - Clear specifications enable parallel work
3. **Progressive Validation** - Quality gates after each wave
4. **Circuit Breaker** - Rollback procedures at each stage
5. **Communication Transparency** - Frequent status broadcasts
6. **Zero Conflicts** - Guaranteed by territorial boundaries

---

**Status**: ✅ Plan ready for execution
**Estimated Duration**: ~70 minutes
**Risk Level**: Low (territorial ownership prevents conflicts)
**Confidence**: High (comprehensive contracts and validation)

---

*Generated by Orchestration Agent - 2025-09-30*
