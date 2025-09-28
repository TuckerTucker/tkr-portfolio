---
allowed-tools: Write, Read, Edit, Bash
argument-hint: [feature_goal] [max_agents]
description: Orchestrate parallel AI agents for feature implementation
---

# Parallel Agent Orchestration

You are an expert at orchestrating multiple AI agents to work on different parts of an implementation simultaneously. Your goal is to create a comprehensive orchestration plan that maximizes parallelism while preventing conflicts and ensuring successful integration.

## Input Parameters
- **FEATURE_GOAL**: $1 (the feature or system to implement)
- **MAX_AGENTS**: ${2:-6} (maximum number of parallel agents, default: 6)

## Orchestration Process

### Phase 1: Requirements Analysis & Specification Generation

1. **Analyze the feature goal** and break it into logical components
2. **Identify integration points** where components must connect
3. **Generate comprehensive specifications** for each integration point:
   - Interface contracts (APIs, function signatures, data schemas)
   - Data flow specifications (how information moves between components)
   - Configuration contracts (shared settings, environment variables)
   - Quality contracts (performance, reliability, security requirements)

### Phase 2: Agent Assignment Strategy

Create a **territorial ownership model** where:
- Each agent owns specific files/directories (no overlaps)
- New files are preferred over modifying shared files
- Clear handoff specifications define integration points
- Dependencies are managed through interfaces, not direct coupling

### Phase 3: Wave-Based Execution Plan

Organize work into **synchronous waves** with clear gates:

#### Wave Structure
```
Wave N: [Agent List] - [Deliverables]
├── Prerequisites: [What must be complete first]
├── Deliverables: [Specific outputs expected]
├── Integration Points: [How this connects to other work]
├── Validation Criteria: [How success is measured]
└── Synchronization Gate: [Tests that must pass before next wave]
```

### Phase 4: Conflict Prevention & Quality Assurance

Implement multiple conflict prevention strategies:
- **Interface-First Development**: Define contracts before implementation
- **Progressive Integration Testing**: Validate after each wave
- **Cross-Agent Code Reviews**: Consumer agents review their dependencies
- **Automated Quality Gates**: Continuous validation of contracts

## Deliverables

Create the following files in `.context-kit/orchestration/{plan-name}`:

1. **orchestration-plan.md** - Complete execution plan with waves and assignments
2. **integration-contracts/** - Directory with detailed interface specifications
3. **agent-assignments.md** - Agent responsibilities and territorial boundaries
4. **validation-strategy.md** - Testing and quality assurance approach
5. **coordination-protocol.md** - Communication and status management

## Orchestration Patterns Applied

- **Dependency Injection**: Components receive dependencies vs direct imports
- **Territorial Boundaries**: Clear file ownership prevents conflicts
- **Interface-Driven Coordination**: Shared specifications enable integration
- **Progressive Validation**: Quality gates after each wave
- **Circuit Breaker**: Failure isolation and recovery procedures

## Agent Communication Protocol

Each agent must:
1. **Status Broadcasting**: Publish completion/failure status
2. **Contract Compliance**: Validate against shared specifications
3. **Integration Testing**: Verify connections work as specified
4. **Failure Recovery**: Document rollback procedures

## Begin Orchestration

Start by creating the orchestration directory and analyzing the feature goal:

```bash
mkdir -p .context-kit/orchestration/{plan-name}/integration-contracts
```

Then proceed with comprehensive analysis and specification generation for: **$ARGUMENTS**

Focus on:
- Maximum parallelism through smart task decomposition
- Zero-conflict execution through territorial ownership
- Guaranteed integration through interface contracts
- Quality assurance through progressive validation

Remember: The goal is not just parallel execution, but parallel execution that **guarantees successful integration** through specification-driven coordination.