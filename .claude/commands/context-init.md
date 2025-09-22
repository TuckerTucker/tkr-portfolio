---
allowed-tools: Task, Read, Write
description: Initialize comprehensive project context using parallel analysis agents for context kit population, YAML synthesis, and port consistency
argument-hint: - No arguments required, automatically discovers and analyzes project structure
---

# Context Initialization

Initialize comprehensive project context using specialized analysis agents for optimal AI agent performance.

## Description

This command orchestrates three specialized agents in parallel to establish complete project context for AI agent sessions. It performs initial context kit population, synthesizes project configuration into AI-optimized YAML, and ensures port configuration consistency across the codebase. The parallel execution strategy significantly reduces setup time while building comprehensive project understanding.

## Usage

`/context-init`

## Variables

- $ARGUMENTS: No arguments required (command auto-discovers project structure)
- KG_ANALYSIS_DEPTH: Context kit analysis depth (default: comprehensive)
- PARALLEL_EXECUTION: Enable parallel agent execution (default: true)
- VALIDATION_MODE: Post-execution validation level (default: standard)

## Steps

### Phase 1: Parallel Analysis Execution

1. **Launch Three Analysis Agents Simultaneously**:
   - Execute `kg-initial-analyzer` agent for comprehensive repository analysis and context kit population
   - Execute `project-yaml-builder` agent for configuration synthesis and Claude Code context updates
   - Execute `port-consistency` agent for port configuration review and compliance enforcement
   - All three agents run concurrently using multiple Task tool calls for optimal performance

### Phase 2: Validation and Integration

2. **Verify Analysis Completion**:
   - Confirm all agents completed successfully
   - Check that context kit database is populated with entities and relationships
   - Verify `.context-kit/_context-kit.yml` was generated with current project analysis
   - Validate port configurations follow 42xxx allocation scheme

### Phase 3: Context Validation

3. **Validate Integrated Context**:
   - Test context kit integrity with sample queries
   - Confirm YAML syntax validity and completeness
   - Run port checking script to verify no conflicts remain
   - Verify persistent Claude Code context updates in `./claude.local.md`

## Examples

### Example 1: Initial project setup

```bash
/context-init
```

Performs comprehensive first-time project analysis with context kit initialization, YAML generation, and port consistency review.

### Example 2: Context refresh after major changes

```bash
/context-init
```

Re-analyzes project structure, updates context kit with new entities/relationships, regenerates project YAML, and validates port configurations.

### Example 3: Pre-AI session context preparation

```bash
/context-init
```

Ensures AI agents have complete project context before starting complex development tasks.

## Agent Execution Strategy

**Parallel Execution** (all three agents are independent and run concurrently):

```bash
# Single message with multiple Task tool calls for optimal performance
Task(kg-initial-analyzer), Task(project-yaml-builder), Task(port-consistency)

# Timing estimates:
# - kg-initial-analyzer: 60-90 seconds (context kit population)
# - project-yaml-builder: 30-45 seconds (YAML synthesis)  
# - port-consistency: 20-30 seconds (port validation)
# Total parallel time: ~90 seconds vs ~180 seconds sequential
```

Each agent produces specialized outputs:
- **Context Kit**: Entities, relationships, and architectural insights in SQLite database
- **Project YAML**: AI-optimized configuration in `.context-kit/_context-kit.yml` and updated `./claude.local.md`
- **Port Analysis**: Compliance report and fixes in `.context-kit/analysis/port-consistency-output.yml`

## Expected Output

### Context Kit Initialization
- Comprehensive entity mapping of project components, modules, and patterns
- Relationship network showing dependencies, containment, and implementation patterns
- Architectural insights and pattern recognition for AI understanding

### Project Configuration
- AI-optimized `.context-kit/_context-kit.yml` with compressed structure and design tokens
- Updated persistent Claude Code context in `./claude.local.md` (project root)
- Backup of previous configuration for rollback capability

### Port Consistency
- Validated 42xxx port allocation scheme compliance
- Resolved port conflicts and duplicate assignments
- Updated configuration files with consistent port references

## Output Structure

```
.context-kit/
├── _context-kit.yml              # AI-optimized project configuration
├── _context-kit.yml.bak         # Backup of previous version
├── analysis/                 # Detailed agent analysis outputs
│   ├── kg-analysis-report.md
│   └── port-consistency-output.yml
└── knowledge-graph/
    └── knowledge-graph.db    # Populated SQLite context kit

./claude.local.md             # Updated with current project context
```

## Integration Points

- **Related Commands**: Foundation for `/project-yaml`, `/kg-init`, and analysis commands
- **Dependencies**: Requires MCP Context Kit server and Context7 server connections
- **Workflow Position**: Run first in new projects or after major structural changes
- **Claude Code Integration**: Updates persistent context for future AI agent sessions

## Best Practices

- Run after cloning new repositories or making significant architectural changes
- Execute before starting complex AI-assisted development sessions
- Review individual agent outputs in `.context-kit/analysis/` for detailed insights
- Use parallel execution for optimal performance on multi-core systems
- Verify MCP server connections before running for complete functionality

## Notes

- Requires active MCP server connections (Context Kit and Context7) for full functionality
- Parallel execution reduces total time from ~3 minutes to ~90 seconds on typical projects
- Context kit initialization may take longer on large codebases (>1000 files)
- Port consistency checks modify configuration files - review changes before committing
- Agent outputs preserved for debugging and manual inspection
- Backup files created automatically for rollback safety
- Updates persistent Claude Code context ensuring future sessions have current project information

After completion, provides consolidated summary of project analysis, context kit statistics, and any configuration changes made for port consistency.