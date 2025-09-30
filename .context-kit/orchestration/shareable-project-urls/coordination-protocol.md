# Coordination Protocol: Agent Communication & Status Management

**Orchestration Plan**: Shareable Project URLs
**Purpose**: Define how agents communicate, report status, and coordinate work
**Approach**: Asynchronous message-passing with synchronous quality gates

---

## Communication Channels

### Primary: Status Broadcast System

All agents broadcast status updates to shared log:

```
.context-kit/orchestration/shareable-project-urls/status-log.md
```

**Format**:
```
[TIMESTAMP] [AGENT_ID] [STATUS_TYPE] [MESSAGE]

Example:
[2025-09-30 10:23:15] Agent-1 STARTED Working on public/404.html creation
[2025-09-30 10:25:42] Agent-1 COMPLETED Contract-1 (SessionStorage Schema) ready
[2025-09-30 10:26:03] Agent-2 STARTED Consuming Contract-1 for index.html script
```

### Status Types

| Status | Meaning | When to Use |
|--------|---------|-------------|
| `STARTED` | Agent begins work on deliverable | Start of each task |
| `IN_PROGRESS` | Ongoing work update | Every ~5-10 minutes or at milestones |
| `BLOCKED` | Waiting for dependency | When cannot proceed |
| `COMPLETED` | Deliverable finished | Task done, contract ready |
| `FAILED` | Error encountered | Critical issue preventing completion |
| `VALIDATING` | Testing/validating work | During quality checks |
| `VALIDATED` | Tests passed | After successful validation |

---

## Message Templates

### Starting Work

```
[TIMESTAMP] [AGENT_ID] STARTED [TASK_DESCRIPTION]

Example:
[2025-09-30 10:23:15] Agent-1 STARTED Creating public/404.html with redirect script
```

### Progress Update

```
[TIMESTAMP] [AGENT_ID] IN_PROGRESS [MILESTONE_REACHED]

Example:
[2025-09-30 10:24:30] Agent-1 IN_PROGRESS 404.html script written, testing locally
```

### Contract Ready

```
[TIMESTAMP] [AGENT_ID] COMPLETED [CONTRACT_NAME] ready for consumption

Example:
[2025-09-30 10:25:42] Agent-1 COMPLETED Contract-1 (SessionStorage Schema) ready
```

### Blocked Waiting

```
[TIMESTAMP] [AGENT_ID] BLOCKED Waiting for [DEPENDENCY] from [SOURCE_AGENT]

Example:
[2025-09-30 10:26:00] Agent-2 BLOCKED Waiting for Contract-1 from Agent-1
```

### Unblocked

```
[TIMESTAMP] [AGENT_ID] STARTED [TASK_DESCRIPTION] - dependency resolved

Example:
[2025-09-30 10:26:03] Agent-2 STARTED index.html script - Contract-1 consumed
```

### Task Complete

```
[TIMESTAMP] [AGENT_ID] COMPLETED [DELIVERABLE_NAME] - [VALIDATION_STATUS]

Example:
[2025-09-30 10:28:15] Agent-2 COMPLETED index.html script - local tests passed
```

### Failure

```
[TIMESTAMP] [AGENT_ID] FAILED [TASK_DESCRIPTION] - Error: [ERROR_DESCRIPTION]

Example:
[2025-09-30 10:30:00] Agent-3 FAILED Context refactoring - Error: useParams not available in test environment
```

---

## Contract Handoff Protocol

### Producer Agent Responsibilities

1. **Implement Contract**: Build feature according to contract spec
2. **Validate Contract**: Test against acceptance criteria
3. **Broadcast Completion**: Announce contract ready
4. **Document Issues**: Note any deviations or edge cases

**Example**:
```
[2025-09-30 10:25:42] Agent-1 COMPLETED Contract-1 (SessionStorage Schema) ready
[2025-09-30 10:25:43] Agent-1 VALIDATED Contract-1 - All acceptance criteria met
[2025-09-30 10:25:44] Agent-1 COMPLETED public/404.html - Build verified, dist/404.html exists
```

### Consumer Agent Responsibilities

1. **Wait for Contract**: Don't start until producer broadcasts COMPLETED
2. **Validate Contract**: Check if contract meets expectations
3. **Report Issues**: If contract incomplete or incorrect, report to producer
4. **Acknowledge**: Broadcast that you're consuming the contract

**Example**:
```
[2025-09-30 10:26:00] Agent-2 STARTED Validating Contract-1 from Agent-1
[2025-09-30 10:26:02] Agent-2 VALIDATED Contract-1 - sessionStorage schema confirmed
[2025-09-30 10:26:03] Agent-2 STARTED index.html script - consuming Contract-1
```

### Contract Violation Handling

If consumer finds contract issues:

```
[TIMESTAMP] [AGENT_ID] BLOCKED Contract-X violation: [ISSUE_DESCRIPTION]

Example:
[2025-09-30 10:26:05] Agent-2 BLOCKED Contract-1 violation: sessionStorage key is 'redirectPath' not 'redirect'
```

Producer must fix and re-broadcast:

```
[TIMESTAMP] [AGENT_ID] IN_PROGRESS Fixing Contract-X violation: [FIX_DESCRIPTION]
[TIMESTAMP] [AGENT_ID] COMPLETED Contract-X updated - [CHANGE_DESCRIPTION]

Example:
[2025-09-30 10:27:00] Agent-1 IN_PROGRESS Fixing Contract-1 - changing sessionStorage key to 'redirect'
[2025-09-30 10:27:30] Agent-1 COMPLETED Contract-1 updated - sessionStorage key now 'redirect'
```

---

## Wave Synchronization

### Gate Protocol

Each wave ends with a **synchronization gate** - a checkpoint where all agents must report completion before next wave begins.

#### Gate Checklist

```markdown
## Gate [N]: [GATE_NAME]

### Prerequisites
- [ ] Agent-X completed deliverables
- [ ] Agent-Y completed deliverables
- [ ] Agent-Z completed deliverables

### Validation
- [ ] All contracts validated
- [ ] Integration tests passed
- [ ] No blocking issues

### Status: [OPEN | CLOSED]

### Opened: [TIMESTAMP]
### Closed: [TIMESTAMP]
```

#### Gate Example: Wave 1

```markdown
## Gate 1: Foundation Layer Complete

### Prerequisites
- [x] Agent-1 completed public/404.html
- [x] Agent-2 completed index.html script
- [x] Agent-3 completed context refactoring

### Validation
- [x] Contract-1 (SessionStorage) validated
- [x] Contract-2 (URL Parameter Schema) validated
- [x] Contract-3 (State Synchronization) validated
- [x] 404→index redirect flow tested
- [x] Context unit tests passed

### Status: CLOSED

### Opened: 2025-09-30 10:23:00
### Closed: 2025-09-30 10:35:00
```

### Gate Announcements

**Opening Gate**:
```
[TIMESTAMP] ORCHESTRATOR GATE_OPENED Gate-[N]: [GATE_NAME] - All agents may proceed
```

**Closing Gate**:
```
[TIMESTAMP] ORCHESTRATOR GATE_CLOSED Gate-[N]: [GATE_NAME] - Wave-[N] complete, Wave-[N+1] may begin
```

**Gate Blocked**:
```
[TIMESTAMP] ORCHESTRATOR GATE_BLOCKED Gate-[N]: [REASON] - Waiting for [AGENT] to complete [TASK]
```

---

## Conflict Resolution

### File Conflict Detection

Agents must check file ownership before modifying:

```
# Before modifying a file
1. Check agent-assignments.md for file owner
2. If you are NOT the owner: BLOCKED - Request permission
3. If you ARE the owner: Proceed with modification
```

**Conflict Report**:
```
[TIMESTAMP] [AGENT_ID] BLOCKED File conflict: [FILE_PATH] owned by [OTHER_AGENT]
```

**Resolution**:
- Owner agent completes their work first
- Conflicting agent waits or requests coordination

### Contract Ambiguity Resolution

If contract spec is unclear:

```
[TIMESTAMP] [AGENT_ID] BLOCKED Contract-X ambiguity: [QUESTION]

Example:
[2025-09-30 10:28:00] Agent-5 BLOCKED Contract-3 ambiguity: Should navigateToProject() validate projectId before navigating?
```

**Resolution Process**:
1. Producer agent clarifies specification
2. Updates contract document
3. Broadcasts clarification
4. Consumer proceeds

---

## Error Handling & Rollback

### Error Reporting

```
[TIMESTAMP] [AGENT_ID] FAILED [TASK] - Error: [DESCRIPTION]
[TIMESTAMP] [AGENT_ID] ERROR_DETAILS [STACK_TRACE or REPRODUCTION_STEPS]

Example:
[2025-09-30 10:30:00] Agent-3 FAILED Context unit tests - Error: useParams() returns undefined in test
[2025-09-30 10:30:01] Agent-3 ERROR_DETAILS Need to wrap test in <MemoryRouter>
```

### Rollback Request

If critical error requires rollback:

```
[TIMESTAMP] [AGENT_ID] ROLLBACK_REQUEST Wave-[N] - Reason: [CRITICAL_ERROR]

Example:
[2025-09-30 10:35:00] Agent-3 ROLLBACK_REQUEST Wave-1 - Context breaks existing components
```

**Orchestrator Response**:
```
[TIMESTAMP] ORCHESTRATOR ROLLBACK_INITIATED Wave-[N] - All agents revert changes
```

All agents execute rollback procedure and report:

```
[TIMESTAMP] [AGENT_ID] ROLLBACK_COMPLETE Wave-[N] changes reverted
```

---

## Assistance Protocol

### Requesting Help

If agent encounters issue but not critical enough for full rollback:

```
[TIMESTAMP] [AGENT_ID] ASSISTANCE_NEEDED [ISSUE_DESCRIPTION]

Example:
[2025-09-30 10:32:00] Agent-3 ASSISTANCE_NEEDED localStorage tests failing, need test utility advice
```

### Offering Help

Other agents or orchestrator can respond:

```
[TIMESTAMP] [HELPER_AGENT_ID] ASSISTING [TARGET_AGENT] - [SUGGESTION]

Example:
[2025-09-30 10:32:30] Agent-2 ASSISTING Agent-3 - Try using jest.mock for localStorage
```

### Help Resolved

```
[TIMESTAMP] [AGENT_ID] ASSISTANCE_RESOLVED [SOLUTION_SUMMARY]

Example:
[2025-09-30 10:33:15] Agent-3 ASSISTANCE_RESOLVED Used jest.mock for localStorage, tests passing
```

---

## Progress Tracking

### Deliverable Checklist

Each agent maintains checklist in their assignment section:

```markdown
## Agent [N] Deliverables

- [x] Task 1: [DESCRIPTION] - COMPLETED [TIMESTAMP]
- [ ] Task 2: [DESCRIPTION] - IN_PROGRESS
- [ ] Task 3: [DESCRIPTION] - PENDING
```

### Wave Progress Dashboard

```markdown
## Wave [N] Progress

| Agent | Status | Deliverables Complete | Blocked? | ETA |
|-------|--------|----------------------|----------|-----|
| 1 | ✅ COMPLETE | 3/3 | No | Done |
| 2 | 🔄 IN_PROGRESS | 1/2 | No | 5 min |
| 3 | ⏸️ BLOCKED | 0/3 | Yes (waiting Contract-2) | TBD |
```

**Status Indicators**:
- ✅ COMPLETE: All deliverables done
- 🔄 IN_PROGRESS: Actively working
- ⏸️ BLOCKED: Waiting for dependency
- ❌ FAILED: Critical error
- 🔍 VALIDATING: Testing phase

---

## Quality Assurance Checkpoints

### Self-Validation

Before declaring COMPLETED, agent must check:

```markdown
## Self-Validation Checklist

- [ ] Code follows contracts exactly
- [ ] Unit tests written and passing
- [ ] Integration tests passing (if applicable)
- [ ] No console errors/warnings
- [ ] Documentation updated
- [ ] Acceptance criteria met
```

Broadcast:
```
[TIMESTAMP] [AGENT_ID] VALIDATING [DELIVERABLE] - Running self-validation checklist
[TIMESTAMP] [AGENT_ID] VALIDATED [DELIVERABLE] - All checks passed
[TIMESTAMP] [AGENT_ID] COMPLETED [DELIVERABLE]
```

### Cross-Agent Validation

Consumer agents validate producer's work:

```markdown
## Cross-Validation: Agent-2 validates Agent-1

- [ ] Contract-1 specification met
- [ ] sessionStorage key correct
- [ ] Redirect script works as expected
- [ ] Build configuration verified
```

Broadcast:
```
[TIMESTAMP] Agent-2 VALIDATING Contract-1 from Agent-1
[TIMESTAMP] Agent-2 VALIDATED Contract-1 - Cross-validation passed
```

---

## Communication Best Practices

### DO:
- ✅ Broadcast every major status change
- ✅ Be specific in error descriptions
- ✅ Update progress frequently (every 5-10 min)
- ✅ Validate before declaring COMPLETED
- ✅ Ask for help when stuck
- ✅ Document deviations from contracts

### DON'T:
- ❌ Work on files you don't own
- ❌ Declare COMPLETED without validation
- ❌ Ignore contract violations
- ❌ Proceed when BLOCKED
- ❌ Hide errors or issues
- ❌ Skip status broadcasts

---

## Example: Full Agent Communication Flow

```
[10:23:00] ORCHESTRATOR GATE_OPENED Gate-0: Orchestration started
[10:23:15] Agent-1 STARTED Creating public/404.html with redirect script
[10:23:20] Agent-2 BLOCKED Waiting for Contract-1 from Agent-1
[10:23:22] Agent-3 STARTED Refactoring SelectedProjectContext.jsx for URL-first priority
[10:24:30] Agent-1 IN_PROGRESS 404.html script written, testing locally
[10:25:15] Agent-1 VALIDATING public/404.html - running build test
[10:25:40] Agent-1 VALIDATED public/404.html - dist/404.html exists after build
[10:25:42] Agent-1 COMPLETED Contract-1 (SessionStorage Schema) ready
[10:26:00] Agent-2 STARTED Validating Contract-1 from Agent-1
[10:26:02] Agent-2 VALIDATED Contract-1 - sessionStorage schema confirmed
[10:26:03] Agent-2 STARTED Writing index.html restoration script
[10:27:30] Agent-3 IN_PROGRESS Context refactoring 60% complete, writing tests
[10:28:00] Agent-2 VALIDATING index.html script - testing redirect flow
[10:28:15] Agent-2 VALIDATED index.html script - 404→restore flow works
[10:28:17] Agent-2 COMPLETED index.html restoration script
[10:29:45] Agent-3 VALIDATING Context tests - running Jest
[10:30:10] Agent-3 VALIDATED Context tests - All 8 tests passed
[10:30:12] Agent-3 COMPLETED Contract-3 (State Synchronization) ready
[10:30:15] ORCHESTRATOR VALIDATING Gate-1 prerequisites
[10:30:45] ORCHESTRATOR VALIDATED Gate-1 - All Wave 1 deliverables complete
[10:30:47] ORCHESTRATOR GATE_CLOSED Gate-1: Foundation Layer Complete
[10:30:48] ORCHESTRATOR GATE_OPENED Gate-2: Application Layer may proceed
[10:31:00] Agent-4 STARTED Creating HomePage and ProjectPage components
[10:31:05] Agent-5 STARTED Refactoring CustomProjectPicker navigation
```

---

## Metrics & Reporting

### Wave Completion Metrics

```markdown
## Wave [N] Completion Report

**Duration**: [START_TIME] - [END_TIME] = [DURATION]
**Agents Involved**: [COUNT]
**Deliverables**: [COMPLETED / TOTAL]
**Blockers Encountered**: [COUNT]
**Average Blocker Resolution Time**: [TIME]
**Tests Written**: [COUNT]
**Tests Passed**: [PASSED / TOTAL]
**Contracts Produced**: [COUNT]
**Contracts Validated**: [COUNT]

**Issues**:
- [ISSUE_1]: [RESOLUTION]
- [ISSUE_2]: [RESOLUTION]

**Next Wave Prerequisites**: [LIST]
```

---

## Final Deployment Coordination

### Pre-Deployment Checklist Broadcast

```
[TIMESTAMP] Agent-6 VALIDATING Final deployment readiness
[TIMESTAMP] Agent-6 VALIDATED All E2E tests passed
[TIMESTAMP] Agent-6 VALIDATED GitHub Pages simulation successful
[TIMESTAMP] Agent-6 VALIDATED No regressions found
[TIMESTAMP] Agent-6 COMPLETED Validation complete - READY FOR DEPLOYMENT
```

### Deployment Approval

```
[TIMESTAMP] ORCHESTRATOR DEPLOYMENT_APPROVED All quality gates passed
[TIMESTAMP] ORCHESTRATOR DEPLOYMENT_INITIATED Running deployment sequence
[TIMESTAMP] ORCHESTRATOR DEPLOYMENT_COMPLETE Feature live at [URL]
```

---

## Notes

- All timestamps in ISO 8601 format for consistency
- Status log serves as audit trail for entire orchestration
- Gate system ensures quality and prevents premature work
- Contract handoff protocol prevents integration failures
- Communication transparency enables rapid issue resolution
- Assistance protocol prevents agents getting stuck
- Self-validation and cross-validation ensure quality
