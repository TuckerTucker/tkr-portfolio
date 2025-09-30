# Coordination Protocol & Communication Strategy

## Agent Communication Architecture

### Status Broadcasting System

Each agent maintains a real-time status file that other agents can monitor:

```json
// .context-kit/_specs/orchestration/v2-ai-skills/status/agent-{id}.json
{
  "agentId": "2-A",
  "agentName": "AIInteractionShowcase Builder",
  "wave": 2,
  "status": "in-progress", // pending | in-progress | complete | failed | blocked
  "progress": 65,
  "currentTask": "Implementing sync indicators",
  "startTime": "2025-01-23T10:30:00Z",
  "lastUpdate": "2025-01-23T10:45:00Z",
  "estimatedCompletion": "2025-01-23T11:00:00Z",
  "deliverables": {
    "completed": [
      "src/components/ai-skills/AIInteractionShowcase/index.tsx",
      "src/components/ai-skills/AIInteractionShowcase/types.ts"
    ],
    "pending": [
      "src/components/ai-skills/AIInteractionShowcase/styles.module.css",
      "src/components/ai-skills/AIInteractionShowcase/AIInteractionShowcase.test.tsx"
    ]
  },
  "integrationTests": {
    "status": "pending",
    "results": null
  },
  "blockers": [],
  "dependencies": {
    "waiting_for": [],
    "providing_to": ["agent-2-B", "agent-3-A"]
  },
  "messages": []
}
```

### Inter-Agent Messaging Protocol

Agents communicate through a message queue system:

```typescript
// .context-kit/_specs/orchestration/v2-ai-skills/messages/queue.ts

interface AgentMessage {
  id: string;
  from: string;
  to: string | string[]; // Can be specific agent or broadcast
  timestamp: string;
  type: 'info' | 'request' | 'response' | 'warning' | 'error';
  subject: string;
  body: string;
  data?: any;
  requiresResponse?: boolean;
  responseDeadline?: string;
}

// Example message
const message: AgentMessage = {
  id: "msg-001",
  from: "agent-1-B",
  to: ["agent-2-A", "agent-2-B", "agent-2-C", "agent-2-D", "agent-2-E"],
  timestamp: "2025-01-23T10:00:00Z",
  type: "info",
  subject: "Data Models Complete",
  body: "All TypeScript interfaces and data models are ready for use",
  data: {
    interfaces: ["ProjectData", "MetricValue", "TimelineEvent"],
    location: "src/types/ai-skills.ts"
  }
};
```

---

## Wave Synchronization Protocol

### Wave Start Conditions

Each wave starts only when ALL of these conditions are met:

```javascript
// Wave start checker
function canStartWave(waveNumber: number): boolean {
  const previousWave = waveNumber - 1;

  // Check all agents in previous wave
  const previousWaveAgents = getAgentsForWave(previousWave);
  const allComplete = previousWaveAgents.every(agent =>
    agent.status === 'complete' &&
    agent.integrationTests.status === 'pass'
  );

  // Check gate validation
  const gateValidation = runWaveGateValidation(previousWave);

  // Check no critical blockers
  const noCriticalBlockers = !hasCriticalBlockers(waveNumber);

  return allComplete && gateValidation.passed && noCriticalBlockers;
}
```

### Wave Completion Protocol

```bash
# Wave completion sequence
1. All agents signal completion
2. Run wave validation suite
3. Check integration points
4. Update wave status
5. Trigger next wave start

# Automated script
.context-kit/_specs/orchestration/scripts/complete-wave.sh {wave-number}
```

---

## Dependency Management

### Dependency Declaration

Each agent declares dependencies at start:

```yaml
# .context-kit/_specs/orchestration/v2-ai-skills/dependencies/agent-3-A.yml
agent: "3-A"
name: "Context-Kit Content Creator"
wave: 3
dependencies:
  required:
    - agent: "2-A"
      deliverables: ["AIInteractionShowcase component"]
    - agent: "2-C"
      deliverables: ["ContextEvolutionSlide component"]
    - agent: "2-D"
      deliverables: ["ProjectImpactMetrics component"]
  optional:
    - agent: "1-A"
      deliverables: ["existing-patterns.md"]
  provides:
    - to: "agent-4-A"
      deliverables: ["context-kit-v2 project page"]
```

### Dependency Resolution

```typescript
// Dependency resolver
class DependencyResolver {
  async checkDependencies(agentId: string): Promise<DependencyStatus> {
    const deps = await loadDependencies(agentId);
    const status: DependencyStatus = {
      ready: true,
      missing: [],
      available: []
    };

    for (const dep of deps.required) {
      const depStatus = await getAgentStatus(dep.agent);
      if (depStatus.status !== 'complete') {
        status.ready = false;
        status.missing.push(dep);
      } else {
        status.available.push(dep);
      }
    }

    return status;
  }
}
```

---

## Conflict Resolution Protocol

### File Ownership Conflicts

If two agents attempt to modify the same file:

1. **Detection**: Git hooks detect conflict
2. **Alert**: Both agents notified immediately
3. **Resolution**:
   ```
   Priority Order:
   1. Earlier wave agent has priority
   2. If same wave, alphabetically first agent ID
   3. Second agent must create new file or wait
   ```

### Integration Contract Conflicts

If component doesn't match contract:

```typescript
// Contract validation
async function validateContract(
  component: string,
  props: any
): Promise<ValidationResult> {
  const contract = await loadContract(component);
  const validator = new ContractValidator(contract);

  const result = validator.validate(props);

  if (!result.valid) {
    // Notify both component builder and consumer
    await notifyAgent(component.owner, {
      type: 'error',
      subject: 'Contract Violation',
      body: `Component props do not match contract`,
      data: result.errors
    });
  }

  return result;
}
```

---

## Status Monitoring Dashboard

### Real-time Status View

```typescript
// .context-kit/_specs/orchestration/dashboard.tsx
interface DashboardState {
  waves: {
    [waveNumber: number]: {
      status: 'pending' | 'in-progress' | 'complete' | 'failed';
      agents: AgentStatus[];
      startTime?: string;
      completionTime?: string;
      validationStatus?: 'pass' | 'fail';
    };
  };
  currentWave: number;
  overallProgress: number;
  blockers: Blocker[];
  messages: AgentMessage[];
}

// Status aggregator
function aggregateStatus(): DashboardState {
  const state: DashboardState = {
    waves: {},
    currentWave: 0,
    overallProgress: 0,
    blockers: [],
    messages: []
  };

  // Scan all agent status files
  const statusFiles = glob.sync('status/agent-*.json');

  statusFiles.forEach(file => {
    const status = JSON.parse(fs.readFileSync(file));
    // Aggregate by wave
    if (!state.waves[status.wave]) {
      state.waves[status.wave] = {
        status: 'pending',
        agents: []
      };
    }
    state.waves[status.wave].agents.push(status);
  });

  // Calculate overall progress
  const totalAgents = Object.values(state.waves)
    .reduce((sum, wave) => sum + wave.agents.length, 0);
  const completeAgents = Object.values(state.waves)
    .reduce((sum, wave) =>
      sum + wave.agents.filter(a => a.status === 'complete').length, 0
    );
  state.overallProgress = (completeAgents / totalAgents) * 100;

  return state;
}
```

---

## Communication Patterns

### 1. Broadcast Pattern
Used for wave-wide announcements:
```javascript
broadcast({
  from: "orchestrator",
  to: "wave-2",
  subject: "Wave 2 Start",
  body: "All Wave 1 validations passed. Wave 2 agents may begin."
});
```

### 2. Request-Response Pattern
Used for specific information needs:
```javascript
// Agent 3-A requests component status
request({
  from: "agent-3-A",
  to: "agent-2-A",
  subject: "Component Ready?",
  body: "Is AIInteractionShowcase ready for integration?",
  requiresResponse: true,
  responseDeadline: "5 minutes"
});

// Agent 2-A responds
response({
  from: "agent-2-A",
  to: "agent-3-A",
  subject: "RE: Component Ready?",
  body: "Yes, component complete and tested",
  data: {
    location: "src/components/ai-skills/AIInteractionShowcase/",
    exports: ["AIInteractionShowcase", "AIInteractionShowcaseProps"]
  }
});
```

### 3. Event Notification Pattern
Used for state changes:
```javascript
notify({
  from: "agent-2-C",
  to: "subscribers",
  type: "event",
  subject: "Component Complete",
  body: "ContextEvolutionSlide component is complete",
  data: {
    component: "ContextEvolutionSlide",
    tests: "passing",
    storybook: "ready"
  }
});
```

---

## Failure Communication

### Blocker Notification

When an agent encounters a blocker:

```javascript
// Agent reports blocker
reportBlocker({
  agentId: "agent-3-B",
  severity: "critical", // critical | high | medium | low
  blocker: {
    type: "missing_dependency",
    description: "DualInterfaceDemo component not found",
    expectedLocation: "src/components/ai-skills/DualInterfaceDemo/",
    impact: "Cannot complete TaskBoardAI showcase",
    suggestedAction: "Check agent-2-B status and deliverables"
  }
});

// Orchestrator responds
handleBlocker({
  escalate: true,
  notify: ["agent-2-B", "recovery-agent"],
  action: "deploy-recovery"
});
```

### Recovery Communication

```javascript
// Recovery agent deployed
deployRecovery({
  targetAgent: "agent-2-B",
  issue: "Component build failure",
  strategy: "assist", // assist | replace | rollback
  recoveryAgent: "agent-R1",
  expectedTime: "15 minutes"
});
```

---

## Monitoring Scripts

### Create monitoring utilities

```bash
#!/bin/bash
# .context-kit/_specs/orchestration/scripts/monitor.sh

# Real-time status monitoring
watch_status() {
  while true; do
    clear
    echo "=== V2 AI Skills Orchestration Status ==="
    echo "Time: $(date)"
    echo ""

    # Check each wave
    for wave in 1 2 3 4 5; do
      echo "Wave $wave:"
      agents=$(ls status/agent-$wave-*.json 2>/dev/null)
      if [ -z "$agents" ]; then
        echo "  Status: Pending"
      else
        for agent in $agents; do
          status=$(jq -r '.status' "$agent")
          progress=$(jq -r '.progress' "$agent")
          name=$(jq -r '.agentName' "$agent")
          echo "  $name: $status ($progress%)"
        done
      fi
      echo ""
    done

    # Check blockers
    echo "=== Blockers ==="
    jq -s '[.[] | select(.blockers | length > 0)] |
           .[] | "\(.agentId): \(.blockers)"' status/*.json

    sleep 5
  done
}

# Check specific agent
check_agent() {
  agent_id=$1
  status_file="status/agent-$agent_id.json"

  if [ -f "$status_file" ]; then
    jq '.' "$status_file"
  else
    echo "Agent $agent_id status not found"
  fi
}

# Main monitoring menu
case "$1" in
  watch)
    watch_status
    ;;
  agent)
    check_agent "$2"
    ;;
  blockers)
    jq -s '[.[] | select(.blockers | length > 0)]' status/*.json
    ;;
  messages)
    tail -f messages/queue.jsonl | jq '.'
    ;;
  *)
    echo "Usage: $0 {watch|agent <id>|blockers|messages}"
    exit 1
    ;;
esac
```

---

## Success Metrics

### Communication Effectiveness
- Message latency < 1 second
- Response rate > 95%
- Blocker resolution < 5 minutes
- Zero missed dependencies

### Coordination Efficiency
- Wave transitions < 2 minutes
- Parallel execution utilization > 80%
- No file ownership conflicts
- All contracts validated

### Overall Orchestration
- Total execution time < 100 minutes
- All 12 agents complete successfully
- Zero critical failures
- Full integration achieved

This coordination protocol ensures smooth communication and synchronization across all agents while maintaining clear boundaries and preventing conflicts.