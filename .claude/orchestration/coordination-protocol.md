# Agent Coordination & Communication Protocol

## Status Broadcasting System

### Status States
Each agent must broadcast one of these states:
- `INITIALIZING` - Agent starting up, reading contracts
- `IN_PROGRESS` - Actively working on assigned task
- `TESTING` - Running validation checks
- `COMPLETED` - Task successfully finished
- `FAILED` - Task failed, rollback initiated
- `BLOCKED` - Waiting for dependency or resolution

### Status File Format
Each agent creates: `.claude/orchestration/status/agent-{N}-{component}.json`

```json
{
  "agentId": "agent-1-button",
  "wave": 1,
  "component": "Button",
  "status": "IN_PROGRESS",
  "progress": 65,
  "territory": "stories/ui/Button.stories.jsx",
  "startTime": "2024-01-20T10:00:00Z",
  "lastUpdate": "2024-01-20T10:05:00Z",
  "messages": [
    "Created story file",
    "Added default export",
    "Implementing variants"
  ],
  "errors": [],
  "deliverables": {
    "storyFile": "created",
    "variants": "in-progress",
    "documentation": "pending"
  }
}
```

## Wave Synchronization

### Wave Start Protocol
1. **Wave Controller** creates `.claude/orchestration/waves/wave-{N}-start.lock`
2. All agents in wave check for lock file
3. Agents begin work simultaneously
4. Each agent creates their status file

### Wave Completion Protocol
1. Each agent updates status to `COMPLETED` or `FAILED`
2. Wave controller monitors all status files
3. When all agents report completion:
   - Run validation gate tests
   - Create `.claude/orchestration/waves/wave-{N}-complete.lock`
4. Next wave agents check for completion lock before starting

## Inter-Agent Communication

### Direct Messaging
Agents cannot directly communicate but can leave messages via:
`.claude/orchestration/messages/{from}-to-{to}.md`

Example:
```markdown
# Message from agent-1-button to agent-6-projectcard
Date: 2024-01-20T10:15:00Z

The Button component exports these variants that you can use:
- variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
- size: 'default' | 'sm' | 'lg' | 'icon'

Import from: ../../src/components/ui/button
```

### Shared Resources
Common resources stored in: `.claude/orchestration/shared/`
- `colors.json` - Design system colors used
- `patterns.md` - Discovered patterns to follow
- `imports.json` - Common import paths
- `examples.json` - Reusable example data

## Contract Compliance Verification

Each agent must verify contracts before marking complete:

### Pre-Completion Checklist
```javascript
const contractCompliance = {
  fileLocation: checkFileExists(territory),
  namingConvention: matchesPattern(/stories\/(ui|custom)\/\w+\.stories\.jsx/),
  defaultExport: hasDefaultExport(),
  storyExports: hasNamedExports(['Default', 'Playground']),
  imports: validImportPaths(),
  argTypes: hasInteractiveControls(),
  documentation: hasComponentDescription()
};

if (Object.values(contractCompliance).every(Boolean)) {
  updateStatus('COMPLETED');
} else {
  updateStatus('FAILED');
  logErrors(contractCompliance);
}
```

## Failure Recovery Protocol

### Individual Agent Failure
1. Agent detects error/failure
2. Updates status to `FAILED` with error details
3. Attempts rollback:
   ```bash
   git checkout HEAD -- {territory}
   rm -f {territory}
   ```
4. Creates failure report: `.claude/orchestration/failures/agent-{N}-failure.md`
5. Wave controller can:
   - Reassign task to recovery agent
   - Skip component if non-critical
   - Halt wave if critical

### Wave Failure
1. If > 50% agents fail, wave is marked failed
2. Rollback entire wave:
   ```bash
   git checkout HEAD -- stories/
   ```
3. Analyze failure patterns
4. Adjust contracts/assignments
5. Retry with modified approach

### Cascade Failure Prevention
- Waves are independent - Wave 2 doesn't depend on Wave 1 success
- Each story is self-contained
- No shared state between agents
- Read-only access to source components

## Performance Monitoring

### Agent Metrics
Each agent reports:
```json
{
  "performance": {
    "startTime": "2024-01-20T10:00:00Z",
    "endTime": "2024-01-20T10:08:00Z",
    "duration": "8m",
    "linesWritten": 245,
    "filesCreated": 1,
    "testsRun": 5,
    "testsPassed": 5
  }
}
```

### Wave Metrics
Wave controller aggregates:
```json
{
  "waveMetrics": {
    "wave": 1,
    "agentsDeployed": 3,
    "successRate": 100,
    "averageDuration": "7m",
    "totalFilesCreated": 3,
    "validationGatePassed": true
  }
}
```

## Coordination Commands

### Start Orchestration
```bash
# Initialize orchestration
mkdir -p .claude/orchestration/{status,waves,messages,shared,failures}
echo '{"started": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > .claude/orchestration/orchestration.lock
```

### Monitor Progress
```bash
# Check all agent statuses
for status in .claude/orchestration/status/*.json; do
  echo "=== $(basename $status) ==="
  jq -r '.status + ": " + (.progress|tostring) + "%"' $status
done
```

### Emergency Stop
```bash
# Halt all agents
echo '{"emergency_stop": true}' > .claude/orchestration/STOP
# All agents check for STOP file before continuing
```

## Final Handoff

### Orchestration Completion
1. All waves complete successfully
2. Final validation passes
3. Generate summary report
4. Archive orchestration artifacts:
   ```bash
   tar -czf .claude/orchestration-archive-$(date +%Y%m%d-%H%M%S).tar.gz .claude/orchestration/
   ```
5. Clean up working files:
   ```bash
   rm -rf .claude/orchestration/{status,waves,messages}
   ```

### Deliverables Handoff
Final structure:
```
stories/
├── ui/
│   ├── Button.stories.jsx ✅
│   ├── Card.stories.jsx ✅
│   ├── ThemeToggle.stories.jsx ✅
│   ├── Carousel.stories.jsx ✅
│   └── DropdownMenu.stories.jsx ✅
└── custom/
    ├── ProjectCard.stories.jsx ✅
    └── BulletList.stories.jsx ✅

.claude/orchestration/
└── final-report.md
```