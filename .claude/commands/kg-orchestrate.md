---
name: kg-orchestrate
description: Orchestrate comprehensive knowledge graph analysis using all available agents
---

# Knowledge Graph Orchestration Command

Executes a coordinated analysis workflow using all knowledge graph agents to build a comprehensive understanding of the tkr-project-kit codebase.

## Execution Instructions

When this command is invoked, execute the following steps:

1. **Initialize Orchestration**: Create a todo list to track agent execution phases
2. **Execute Agents by Phase**: Use the Task tool to launch agents in sequence:
   - Phase 1: Launch `react-component-analyzer`, then `import-relationship-mapper`
   - Phase 2: Launch `react-hooks-analyzer` and `data-flow-analyzer`
   - Phase 3: Launch `storybook-component-analyzer`
   - Phase 4: Launch `validation-agent` (if --validate flag is set)
   - Phase 5: Launch `storybook-maintainer` (if maintenance mode)
3. **Wait for Completion**: Each agent must complete before dependent agents start
4. **Generate Report**: Summarize results from all agents

## Usage
```bash
/kg-orchestrate [mode] [--validate] [--incremental]
```

### Parameters
- **mode**: Analysis mode
  - `full` - Complete analysis from scratch (default)
  - `incremental` - Update existing knowledge graph
  - `components` - Focus on React components only
  - `hooks` - Focus on React hooks only
  - `stories` - Focus on Storybook analysis only
  - `maintenance` - Run analysis + Storybook cleanup/maintenance
  - `validation` - Run validation only
- **--validate** - Run validation after analysis
- **--incremental** - Perform incremental updates only

## Orchestration Workflow

The command will execute agents in the following phases using the Task tool:

### Phase 1: Foundation Analysis
Execute core component and relationship analysis:

1. **React Component Analysis**
   - Agent: `react-component-analyzer`
   - Purpose: Create UIComponent entities for all React components
   - Output: Component entities with metadata
   - Execution: Launched via Task tool

2. **Import Relationship Mapping**
   - Agent: `import-relationship-mapper`
   - Purpose: Create DEPENDS_ON relationships based on import statements
   - Dependencies: Waits for react-component-analyzer to complete
   - Output: Component dependency graph
   - Execution: Launched via Task tool after #1 completes

### Phase 2: Behavioral Analysis
Analyze component behavior and usage patterns:

3. **React Hooks Analysis**
   ```bash
   Task: react-hooks-analyzer
   Purpose: Create HOOK entities and USES_HOOK relationships
   Dependencies: react-component-analyzer results
   Output: Hook usage patterns and dependencies
   ```

4. **Data Flow Analysis**
   ```bash
   Task: data-flow-analyzer
   Purpose: Create DATA_FLOW relationships for props and state
   Dependencies: react-component-analyzer, react-hooks-analyzer results
   Output: Data flow architecture map
   ```

### Phase 3: Documentation Analysis
Analyze documentation and design system integration:

5. **Storybook Analysis**
   ```bash
   Task: storybook-component-analyzer
   Purpose: Create STORY entities and DOCUMENTS relationships
   Dependencies: react-component-analyzer results
   Output: Component documentation coverage
   ```

### Phase 4: Validation and Quality Assurance
Ensure knowledge graph integrity and completeness:

6. **Knowledge Graph Validation**
   ```bash
   Task: validation-agent
   Purpose: Validate entity completeness and relationship integrity
   Dependencies: All previous analysis results
   Output: Comprehensive validation report
   ```

### Phase 5: Maintenance (Optional)
Execute Storybook cleanup and maintenance based on analysis results:

7. **Storybook Maintenance**
   ```bash
   Task: storybook-maintainer
   Purpose: Clean up outdated stories, add missing ones, ensure design system compliance
   Dependencies: storybook-component-analyzer results
   Output: Updated story files and maintenance report
   ```

## Execution Strategy

### Sequential Execution (Default)
Agents execute in dependency order to ensure data consistency:
1. Foundation agents first (components, imports)
2. Behavioral agents second (hooks, data flow)
3. Documentation agents third (stories)
4. Validation agent fourth
5. Maintenance agent last (optional, maintenance mode only)

### Parallel Execution (Advanced)
Independent agents can run in parallel for faster analysis:
- Group 1: `react-component-analyzer` (foundation)
- Group 2: `storybook-component-analyzer` (parallel to Group 1)
- Group 3: `import-relationship-mapper`, `react-hooks-analyzer` (depends on Group 1)
- Group 4: `data-flow-analyzer` (depends on Groups 1 & 3)
- Group 5: `validation-agent` (depends on all previous)
- Group 6: `storybook-maintainer` (depends on Group 2, maintenance mode only)

### Incremental Updates
For ongoing development, support incremental updates:
- Detect changed files since last analysis
- Re-analyze only affected components and dependencies
- Update relationships and entities as needed
- Maintain referential integrity

## Configuration

### Agent Configuration
```yaml
agents:
  react-component-analyzer:
    priority: 1
    timeout: 300s
    retry: 3

  import-relationship-mapper:
    priority: 2
    dependencies: [react-component-analyzer]
    timeout: 180s
    retry: 2

  react-hooks-analyzer:
    priority: 2
    dependencies: [react-component-analyzer]
    timeout: 240s
    retry: 2

  data-flow-analyzer:
    priority: 3
    dependencies: [react-component-analyzer, react-hooks-analyzer]
    timeout: 300s
    retry: 2

  storybook-component-analyzer:
    priority: 2
    dependencies: [react-component-analyzer]
    timeout: 180s
    retry: 2

  validation-agent:
    priority: 4
    dependencies: [all]
    timeout: 120s
    retry: 1

  storybook-maintainer:
    priority: 5
    dependencies: [storybook-component-analyzer]
    timeout: 240s
    retry: 2
    mode: maintenance_only
```

### Progress Tracking
Track orchestration progress and provide status updates:
- Real-time progress indicators
- Agent execution status
- Error handling and retry logic
- Intermediate result summaries
- Final consolidated report

## Output Format

### Orchestration Summary
```
Knowledge Graph Orchestration Report
=====================================

Execution Mode: [full|incremental|targeted]
Total Agents: 6
Execution Time: [duration]
Success Rate: [percentage]

Phase Results:
✅ Foundation Analysis: 2/2 agents completed
✅ Behavioral Analysis: 2/2 agents completed
✅ Documentation Analysis: 1/1 agents completed
✅ Validation: 1/1 agents completed

Knowledge Graph Statistics:
- Total Entities: [count]
- Total Relationships: [count]
- Coverage: [percentage]%
- Health Score: [0-100]
```

### Agent Results Summary
```
Agent: react-component-analyzer
Status: ✅ Completed
Entities Created: 7 UIComponents
Execution Time: 45s

Agent: import-relationship-mapper
Status: ✅ Completed
Relationships Created: 6 DEPENDS_ON
Execution Time: 32s

[... similar for all agents]
```

### Recommendations
```
Orchestration Recommendations:
1. Consider adding more comprehensive Storybook coverage
2. Review data flow patterns for optimization opportunities
3. Schedule regular validation runs for ongoing quality assurance
```

## Error Handling

### Agent Failure Recovery
- Continue with remaining agents if one fails
- Log detailed error information
- Provide partial results and recommendations
- Suggest manual intervention steps

### Dependency Management
- Skip dependent agents if prerequisite fails
- Provide clear dependency chain information
- Support partial execution with warnings

### Retry Logic
- Automatic retry for transient failures
- Exponential backoff for rate limiting
- Manual retry options for persistent issues

## Usage Examples

### Full Analysis
```bash
/kg-orchestrate full --validate
```
Executes complete analysis workflow with final validation.

### Incremental Update
```bash
/kg-orchestrate incremental
```
Updates knowledge graph based on changed files only.

### Component-Focused Analysis
```bash
/kg-orchestrate components --validate
```
Analyzes only React components and their relationships.

### Validation Only
```bash
/kg-orchestrate validation
```
Runs validation against existing knowledge graph.

### Maintenance Mode
```bash
/kg-orchestrate maintenance --validate
```
Executes complete analysis followed by Storybook cleanup and maintenance.

This orchestration command provides a comprehensive, coordinated approach to knowledge graph analysis, ensuring all aspects of the React codebase are properly analyzed and documented.