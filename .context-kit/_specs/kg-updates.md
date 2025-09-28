# Knowledge Graph Updates Specification

## Overview

This specification defines the requirements and approach for creating a robust knowledge graph that supports AI agent orchestration, planning, and debugging workflows. Based on analysis of the current system and identified gaps, this document outlines the strategy for building a comprehensive, useful knowledge graph.

## Current State Analysis

### Existing Knowledge Graph Limitations

**Current Statistics:**
- 36 entities, 23 relations
- Heavily skewed toward planned AI Skills components (5 entities) that don't exist yet
- Missing most actual implemented components (~50+ missing entities)
- Insufficient representation of the portfolio's core features

**Key Gaps Identified:**
1. **Missing Core UI Components**: Badge, Button, Card, Carousel, DropdownMenu, Sheet, Skeleton
2. **Missing HTML Slides System**: 18+ slide components that are the portfolio's main feature
3. **Missing Application Architecture**: Hooks (useProjects), utilities, data entities
4. **Incomplete Storybook Coverage**: Most of the 25+ stories are missing from the graph
5. **Poor Component Relationship Mapping**: Dependencies and data flow not captured

### Agent Tool Analysis

**kg-initial-analyzer Issues:**
- Over-reliance on `mcp__context-kit__analyze_project` which hasn't been tested on React codebases
- Generic file patterns that don't understand React-specific concepts
- Minimum thresholds too low (5 entities, 3 relationships)
- No React domain knowledge (component composition, hooks, context patterns)

**kg-update Issues:**
- Reactive only - only updates on git diffs
- No backfill mechanism for missed components
- No comprehensive gap detection

## Knowledge Graph Goals

### Primary Use Cases

1. **Orchestration Planning**
   - Territorial boundary assignment for parallel agents
   - Integration contract definition
   - Dependency analysis for wave-based execution

2. **Impact Analysis**
   - "What breaks if I change component X?"
   - Blast radius calculation for modifications
   - Safe modification identification

3. **Context Initialization**
   - Quick agent understanding without repo traversal
   - Component discovery and relationship mapping
   - Architecture pattern identification

### Critical Questions the Graph Must Answer

**For Orchestration:**
- "What components exist in `/src/components/ui/` and what do they depend on?"
- "If I modify `ProjectCard`, what other components might be affected?"
- "What files are safe for Agent A to modify without conflicting with Agent B's territory?"

**For Planning:**
- "What props does `ImageCarousel` expect and what components provide them?"
- "What hooks are used across multiple components that need stable interfaces?"
- "Which components share the same data dependencies?"

**For Impact Analysis:**
- "Can we modify the theme system in Wave 1 without breaking components being worked on in Wave 2?"
- "What's the dependency chain from data (`projects.json`) to display components?"
- "Which components are 'leaf nodes' (safe to modify) vs 'foundational' (affects many others)?"

## Entity Classification Strategy

### Priority Tiers

**Tier 1: Architectural Relationships (Always Track)**
- Component composition (`Card` → `CardHeader`, `CardContent`)
- Major data dependencies (`useProjects` → `projects.json`)
- Cross-cutting concerns (`ThemeProvider` → all themed components)
- Service dependencies (components → utility functions)

**Tier 2: Development Relationships (Track if Valuable)**
- Storybook documentation relationships
- Component variant patterns
- Shared hook usage
- Configuration dependencies

**Tier 3: Implementation Details (Consider Later)**
- Individual prop mappings
- Internal state management
- Styling dependencies (unless critical to theme system)

### Entity Types Required

**Core Components (25+ entities)**
```yaml
UIComponent:
  - Badge, Button, Card, Carousel, DropdownMenu, Sheet, Skeleton
  - ThemeToggle, ImageCarousel, ProjectCard, CustomProjectPicker

LayoutComponent:
  - Header, Footer, App, Main

SlideComponent:
  - SlideWrapper (base)
  - BeforeAfter, BornToTheWorld, DesignSystem
  - InteractiveCards, InteractiveCode
  - All showcase slides (Nutrien, Portfolio, Worldplay, etc.)
```

**Application Architecture**
```yaml
Hook:
  - useProjects (data fetching)

Utility:
  - utils.js (shared utilities)

DataSource:
  - projects.json (content)
  - Individual project definitions
```

**Documentation**
```yaml
Story:
  - All Storybook stories with DOCUMENTS relationships
  - Theme, UI, Layout, Content, Custom, Navigation categories
```

### Relationship Types for Orchestration

**Primary Relationships:**
- **DEPENDS_ON** (with impact weight) - Critical dependencies
- **USES** - Component usage patterns
- **PROVIDES** - Interface/data provision
- **CONTAINS** - Composition relationships
- **DOCUMENTS** - Story-to-component relationships
- **AFFECTS** - Impact relationships for blast radius

**Relationship Properties:**
```yaml
impact_weight: [low, medium, high, critical]
territory: [ui, layout, content, data, story]
stability: [stable, evolving, experimental]
```

## Implementation Strategy

### Phase 1: Foundation Rebuild
1. **Audit Current Entities**: Identify which existing entities represent actual code vs. planned features
2. **Add Missing Core Components**: All actual UI, layout, and slide components
3. **Establish Data Flow**: Map from projects.json through hooks to display components
4. **Basic Relationship Mapping**: Component dependencies and composition

### Phase 2: Orchestration Support
1. **Territory Classification**: Mark components by ownership boundaries
2. **Impact Analysis**: Add relationship weights and blast radius calculations
3. **Interface Contracts**: Map component props and shared dependencies
4. **Integration Points**: Identify shared utilities and cross-cutting concerns

### Phase 3: Documentation Coverage
1. **Complete Storybook Mapping**: All stories with DOCUMENTS relationships
2. **Test Coverage**: Map test files to components
3. **Configuration Tracking**: Build and deployment dependencies

### Success Metrics

**Quantitative Targets:**
- Entity count: 36 → 80+ entities
- Relation count: 23 → 150+ relations
- Component coverage: ~40% → 95%
- Actual vs. planned entity ratio: Prioritize actual implemented code

**Qualitative Validation:**
- Agents can answer orchestration questions without file reads
- Impact analysis provides accurate blast radius calculations
- Territory assignment prevents agent conflicts
- Component discovery works for new features

## Technical Requirements

### Automated Analysis Enhancement

**React-Specific Patterns:**
- JSX component detection and prop extraction
- Hook dependency analysis
- Context provider/consumer relationships
- Component composition patterns

**Data Flow Analysis:**
- Import/export relationship mapping
- Prop drilling vs. context usage
- Data source to display component chains

### Incremental Updates (kg-update)

**Detection Patterns:**
- New/modified/deleted React components
- Component interface changes (props, exports)
- Hook dependency modifications
- Data structure changes in JSON files

**Change Impact:**
- Relationship updates for new imports
- Territory reassignment for file moves
- Integration contract updates for interface changes

### Validation Framework

**Consistency Checks:**
- All components have corresponding entities
- All Storybook stories are mapped to components
- All major dependencies are captured
- No orphaned relationships

**Coverage Validation:**
- File count vs. entity count reconciliation
- Missing component detection
- Relationship completeness verification

## Maintenance Strategy

### Automated Maintenance
- File system scanning for new components
- Import analysis for relationship updates
- Storybook story auto-detection
- Configuration change monitoring

### Manual Curation
- Relationship weight assignment
- Territory boundary definition
- Integration contract validation
- Architecture pattern documentation

### Quality Assurance
- Regular graph consistency audits
- Agent usage pattern analysis
- Orchestration workflow validation
- Coverage gap identification

## Next Steps

1. **Immediate**: Fix automated analysis to detect actual React components
2. **Priority**: Add all missing core UI and slide components
3. **Critical**: Establish data flow relationships from JSON to components
4. **Essential**: Complete Storybook documentation mapping
5. **Strategic**: Implement orchestration-specific relationship types and properties

This specification prioritizes building a knowledge graph that serves real agent workflows rather than just documenting code structure. The focus is on enabling efficient orchestration, accurate impact analysis, and quick context initialization without sacrificing maintainability.