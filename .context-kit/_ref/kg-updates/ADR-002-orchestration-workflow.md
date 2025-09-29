# ADR-002: Knowledge Graph Orchestration Workflow

**Status**: Implemented
**Date**: 2025-01-21
**Authors**: Claude Code Agent System

## Context

Following the implementation of agent-based analysis (ADR-001), we needed a coordinated workflow to execute all knowledge graph analysis agents in the correct order, handle dependencies, and provide comprehensive reporting.

## Decision

Implement a comprehensive orchestration system with:

1. **Claude Code Command**: `/kg-orchestrate` for user-friendly execution
2. **Shell Script**: Automated orchestration logic with dependency management
3. **Agent Coordination**: Sequential and parallel execution strategies
4. **Progress Tracking**: Real-time status updates and logging
5. **Validation Integration**: Built-in quality assurance workflow

## Implementation Details

### Agent Execution Order

**Phase 1: Foundation Analysis**
1. `react-component-analyzer` - Create UIComponent entities
2. `import-relationship-mapper` - Map DEPENDS_ON relationships

**Phase 2: Behavioral Analysis**
3. `react-hooks-analyzer` - Create HOOK entities and USES_HOOK relationships
4. `data-flow-analyzer` - Map DATA_FLOW relationships

**Phase 3: Documentation Analysis**
5. `storybook-component-analyzer` - Create STORY entities and DOCUMENTS relationships

**Phase 4: Validation**
6. `validation-agent` - Verify integrity and generate reports

**Phase 5: Maintenance (Optional)**
7. `storybook-maintainer` - Clean up outdated stories and ensure design system compliance

### Execution Modes

- **full**: Complete analysis from scratch
- **incremental**: Update existing knowledge graph
- **components**: Focus on React components only
- **hooks**: Focus on React hooks only
- **stories**: Focus on Storybook analysis only
- **maintenance**: Complete analysis + Storybook cleanup/maintenance
- **validation**: Run validation only

### Key Features

- **Dependency Management**: Agents execute in correct order based on dependencies
- **Error Handling**: Continue execution if non-critical agents fail
- **Progress Tracking**: Real-time status updates and comprehensive logging
- **Parallel Execution**: Independent agents can run concurrently for performance
- **Incremental Updates**: Support for ongoing development workflows

## Architecture

```mermaid
graph TD
    A[/kg-orchestrate command] --> B[orchestrate-kg-analysis script]
    B --> C[Phase 1: Foundation]
    B --> D[Phase 2: Behavioral]
    B --> E[Phase 3: Documentation]
    B --> F[Phase 4: Validation]

    C --> G[react-component-analyzer]
    C --> H[import-relationship-mapper]

    D --> I[react-hooks-analyzer]
    D --> J[data-flow-analyzer]

    E --> K[storybook-component-analyzer]

    F --> L[validation-agent]

    G --> M[Knowledge Graph DB]
    H --> M
    I --> M
    J --> M
    K --> M
    L --> N[Validation Report]
```

## Files Created

1. **`.claude/commands/kg-orchestrate.md`** - Claude Code command specification
2. **`.context-kit/scripts/orchestrate-kg-analysis`** - Shell orchestration script
3. **`.context-kit/_ref/kg-updates/ADR-002-orchestration-workflow.md`** - This ADR

## Benefits

1. **Automated Workflow**: Single command executes complete analysis
2. **Dependency Safety**: Ensures agents execute in correct order
3. **Quality Assurance**: Built-in validation and error handling
4. **Development Integration**: Supports both full and incremental workflows
5. **Comprehensive Reporting**: Detailed progress tracking and summaries

## Usage Examples

```bash
# Complete analysis with validation
/kg-orchestrate full --validate

# Incremental update for ongoing development
/kg-orchestrate incremental

# Component-focused analysis
/kg-orchestrate components --validate

# Maintenance mode with Storybook cleanup
/kg-orchestrate maintenance --validate

# Validation only
/kg-orchestrate validation
```

## Current State

✅ **Implemented Components**:
- Claude Code command specification with maintenance mode
- Shell orchestration script with 5-phase execution
- All 7 agents integrated (react-component, import-relationship, hooks, data-flow, storybook-component-analyzer, validation, storybook-maintainer)
- Progress tracking and logging system
- Error handling and recovery mechanisms
- Maintenance mode for Storybook cleanup and compliance

✅ **Tested Functionality**:
- Complete agent execution workflow (Tasks 7-17)
- Knowledge graph populated with 9 entities and 9 relationships
- Import dependency analysis for all 7 React components
- Comprehensive validation framework

## Future Enhancements

1. **CI/CD Integration**: Automated orchestration in build pipelines
2. **Real-time Monitoring**: Dashboard for orchestration status
3. **Performance Optimization**: Parallel agent execution
4. **Change Detection**: Smart incremental updates based on git diffs
5. **Metrics Collection**: Historical analysis of knowledge graph evolution

## Impact

This orchestration system completes the transition to agent-based knowledge graph analysis, providing:
- **Maintainable Architecture**: Clear separation of concerns across specialized agents
- **Scalable Analysis**: Easy addition of new analysis agents
- **Developer Experience**: Simple command-line interface for complex analysis
- **Quality Assurance**: Built-in validation and comprehensive reporting

The orchestration workflow establishes tkr-project-kit as a robust, agent-based development toolkit with comprehensive knowledge graph capabilities.