# Knowledge Graph Agent and Command Improvements

## Executive Summary

This specification outlines the required changes to the knowledge graph creation and maintenance tools (`kg-initial-analyzer`, `kg-update`, and `kg_init`) to ensure they create comprehensive, useful knowledge graphs that support agent orchestration, planning, and debugging workflows.

## Current Tool Limitations

### kg-initial-analyzer
- Over-reliance on generic `analyze_project` function
- Minimum thresholds too low (5 entities, 3 relationships)
- No React-specific component detection
- Missing domain knowledge

### kg-update
- Only reactive to git diffs
- No backfill capability for missed entities
- Limited React change pattern detection

### kg_init
- Simple runner with no validation
- No pre/post analysis checks
- No fallback strategies

## Required Changes by Tool

## 1. kg-initial-analyzer.md Modifications

### A. React-Specific Analysis Requirements

**Replace generic patterns with React-aware detection:**

```yaml
# REMOVE:
patterns: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js"]

# ADD React-specific detection:
Component Detection:
  - Files containing JSX syntax and React imports
  - Files exporting React.FC or function components
  - Class components extending React.Component

Hook Detection:
  - Functions starting with "use"
  - Custom hooks in /hooks directory

Context Detection:
  - Files with createContext/Provider patterns
  - Context consumer components

Slide Components:
  - Special handling for /components/html-slides/
  - Track slide composition and data props
```

### B. Raised Entity Requirements

```yaml
# REMOVE:
MINIMUM: Create at least 5 architectural entities
MINIMUM: Create at least 3 relationships

# ADD:
MANDATORY Entity Creation:
  - ALL detected React components must have entities
  - ALL hooks must have Hook entities
  - ALL .stories.jsx files must have Story entities
  - ALL data sources (JSON files) must have DataSource entities

EXPECTED Counts:
  - 50+ entities for typical React projects
  - 100+ relationships for component dependencies
  - 95% file-to-entity coverage ratio
```

### C. Domain-Specific Entity Types

```yaml
Required Entity Type Classification:
  UIComponent:
    - Location: /components/ui/*
    - Properties: props, dependencies, theme usage

  SlideComponent:
    - Location: /components/html-slides/*
    - Properties: slide type, data requirements, animations

  Hook:
    - Pattern: use* functions
    - Properties: dependencies, return values, side effects

  Story:
    - Pattern: *.stories.jsx
    - Properties: component tested, variants, args

  DataSource:
    - Pattern: *.json in /public/data or /src/data
    - Properties: schema, consumers, update frequency

  LayoutComponent:
    - Specific: Header, Footer, App, Main
    - Properties: children, layout structure
```

### D. Enhanced Relationship Mapping

```yaml
Required Relationship Types:
  USES:
    - Component → Component (imports)
    - Component → Hook (custom hook usage)
    - Component → Utility (helper functions)

  CONTAINS:
    - Parent → Child components
    - Layout → Content components

  DEPENDS_ON:
    - Component → External library
    - Component → Data source

  DOCUMENTS:
    - Story → Component
    - README → Module

  PROVIDES:
    - Component → Interface/Props
    - Hook → Return values

  CONSUMES:
    - Component → DataSource
    - Component → Context

Relationship Properties Required:
  impact_weight: [low, medium, high, critical]
  territory: [ui, layout, content, data, story]
  stability: [stable, evolving, experimental]
  integration_point: boolean
```

### E. Validation Steps

```yaml
Post-Analysis Validation:
  Component Coverage:
    - Count .jsx/.tsx files vs UIComponent entities
    - Ensure > 90% coverage

  Relationship Density:
    - Average 3+ relationships per component
    - All imports create DEPENDS_ON relationships

  Story Coverage:
    - All .stories.jsx have DOCUMENTS relationships
    - Verify story-to-component mapping

  Slide System:
    - All html-slides have SlideComponent type
    - Slide wrapper relationships mapped

  Data Flow:
    - JSON sources have CONSUMES relationships
    - useProjects hook properly connected
```

## 2. kg-update.md Modifications

### A. React-Aware Diff Analysis

```yaml
React-Specific Change Detection:
  New Component:
    - Pattern: "export const ComponentName" or "export function"
    - Action: Create UIComponent entity with props

  Modified Props:
    - Pattern: Changes to component function parameters
    - Action: Update PROVIDES relationships

  Hook Changes:
    - Pattern: Modifications to use* functions
    - Action: Update Hook entity and USES relationships

  Story Updates:
    - Pattern: Changes to .stories.jsx files
    - Action: Update Story entity and DOCUMENTS relationship

  Data Changes:
    - Pattern: Modifications to JSON data files
    - Action: Update DataSource entity, notify consumers
```

### B. Comprehensive Relationship Updates

```yaml
Relationship Update Rules:
  Import Added:
    - Create DEPENDS_ON relationship
    - Set impact_weight based on import type

  Import Removed:
    - Remove DEPENDS_ON relationship
    - Check for orphaned entities

  Component Moved:
    - Update all relationships
    - Reassign territory property
    - Update file paths in entity data

  Props Changed:
    - Update PROVIDES relationships
    - Mark as "evolving" stability
    - Flag integration contract changes

  Hook Added to Component:
    - Create USES relationship
    - Update component dependencies
```

### C. Gap Detection and Backfill

```yaml
Continuous Gap Detection:
  File System Scan:
    - Run periodic comparison of files to entities
    - Flag components without entities
    - Report missing relationships

  Coverage Metrics:
    - Calculate entity coverage percentage
    - Track relationship density
    - Monitor orphaned entities

  Backfill Triggers:
    - Coverage drops below 80%
    - New directory added
    - Major refactoring detected

  Backfill Process:
    - Identify missing entities
    - Parse files for component detection
    - Create entities with "backfilled" flag
    - Establish basic relationships
```

## 3. kg_init.md Enhancements

### A. Pre-Analysis Phase

```yaml
Project Structure Analysis:
  1. Detect Project Type:
     - Check package.json for "react" dependency
     - Identify React version (18/19)
     - Check for TypeScript usage

  2. Map Directory Structure:
     - Locate component directories
     - Find story directories
     - Identify data sources

  3. Set Expectations:
     - Count .jsx/.tsx files
     - Count .stories.jsx files
     - Estimate entity count (files * 2.5)
     - Set relationship target (entities * 4)
```

### B. Analysis Orchestration

```yaml
Enhanced Execution Flow:
  1. Pre-Validation:
     - Verify React project
     - Check MCP server availability
     - Clear existing incomplete data

  2. Configured Analysis:
     - Pass React-specific patterns to analyzer
     - Set appropriate minimums based on project size
     - Enable component-specific detection

  3. Real-time Monitoring:
     - Track entity creation rate
     - Monitor relationship establishment
     - Flag anomalies during creation

  4. Post-Analysis Verification:
     - Compare actual vs expected counts
     - Run coverage calculations
     - Identify gaps
```

### C. Fallback Strategies

```yaml
Fallback Mechanisms:
  If Automated Analysis < 50% Coverage:
    1. Manual Component Scan:
       - Use filesystem to find all .jsx/.tsx
       - Create basic UIComponent entities

    2. Import Parsing:
       - Parse all import statements
       - Create DEPENDS_ON relationships

    3. Story Mapping:
       - Match *.stories.jsx to components
       - Create DOCUMENTS relationships

    4. Data Source Connection:
       - Find JSON files
       - Link to consuming components

  Recovery Actions:
    - Log gaps for manual review
    - Create placeholder entities
    - Mark uncertain relationships
    - Generate fix-up script
```

### D. Reporting and Validation

```yaml
Comprehensive Report Generation:
  Coverage Report:
    - Entity coverage by type
    - Relationship density metrics
    - Gap analysis with specific files

  Quality Metrics:
    - Components with < 2 relationships (isolated)
    - Entities without relationships (orphaned)
    - Missing critical relationships (no theme usage)

  Actionable Recommendations:
    - Specific files needing entities
    - Missing relationship types
    - Manual verification needs

  Orchestration Summary:
    - Territories identified for agent assignment
    - Integration points mapped
    - Dependency chains validated
```

## Implementation Priority

### Phase 1: Foundation (Immediate)
1. Update kg-initial-analyzer with React detection
2. Raise minimum entity requirements
3. Add validation checks

### Phase 2: Relationships (Week 1)
1. Implement comprehensive relationship mapping
2. Add relationship properties (impact_weight, territory)
3. Validate relationship density

### Phase 3: Maintenance (Week 2)
1. Enhance kg-update with React patterns
2. Add gap detection mechanisms
3. Implement backfill capabilities

### Phase 4: Orchestration (Week 3)
1. Transform kg_init into orchestrator
2. Add pre/post validation
3. Implement fallback strategies

## Success Metrics

### Quantitative
- Entity coverage: > 90% of actual files
- Relationship density: > 3 per entity
- Component coverage: 100% of UI components
- Story mapping: 100% of stories linked

### Qualitative
- Agents can determine territorial boundaries
- Impact analysis accurately predicts affected components
- Orchestration planning uses graph effectively
- No manual file traversal needed for basic questions

## Testing Strategy

### Validation Tests
1. Verify entity counts match file counts
2. Test relationship traversal for known paths
3. Validate orchestration use cases

### Regression Tests
1. Track graph quality over time
2. Monitor coverage during updates
3. Ensure no relationship loss
4. Validate incremental updates

## Maintenance Requirements

### Ongoing Monitoring
- Weekly coverage reports
- Relationship density tracking
- Gap analysis automation
- Agent usage pattern analysis

### Evolution Strategy
- Add new entity types as needed
- Refine relationship properties based on usage
- Optimize for common agent queries
- Adjust detection patterns for new React features

## Conclusion

These improvements will transform the knowledge graph tools from generic analyzers into React-aware, orchestration-ready systems that provide comprehensive, accurate project understanding for AI agents. The focus shifts from minimal documentation to complete architectural comprehension suitable for parallel agent execution and impact analysis.