# Knowledge Graph Implementation Plan

## Goal
Fix and enhance the knowledge graph system to create comprehensive, orchestration-ready graphs with entities and relationships that accurately represent the React portfolio codebase.

## Ordered Implementation Tasks

### Foundation Fixes (Enable Basic Functionality)

1. **Wire analyze_project MCP tool to ProjectScanner**
   - Connect toolHandlers.set('analyze_project') to ProjectScanner.scanProject()
   - Pass through patterns and options correctly
   - Return actual statistics instead of "not implemented"

2. **Wire analyze_storybook MCP tool to StorybookAnalyzer**
   - Connect toolHandlers.set('analyze_storybook') to StorybookAnalyzer
   - Implement story-to-component linking
   - Return analysis results

3. **Fix TypeScript compilation for JSX files**
   - Update StaticAnalyzer compiler options for React
   - Set jsx: ts.JsxEmit.React
   - Add React type definitions

4. **Add basic entity creation in StaticAnalyzer**
   - Create entities for detected components
   - Use proper entity types (UIComponent, SlideComponent)
   - Include file location and basic metadata

### React Intelligence (Accurate Detection)

5. **Implement component category detection**
   - Detect UIComponent from /components/ui/
   - Detect SlideComponent from /components/html-slides/
   - Detect LayoutComponent from /components/layout/
   - Map other directories to appropriate types

6. **Add React hook detection**
   - Identify functions starting with "use"
   - Create Hook entities with dependencies
   - Track which components use which hooks

7. **Extract component props and interfaces**
   - Parse function parameters for prop types
   - Extract TypeScript interfaces
   - Store prop definitions in entity data

8. **Detect component composition patterns**
   - Identify parent-child relationships in JSX
   - Track component usage within other components
   - Find wrapper/container patterns

### Relationship Automation (Build Connections)

9. **Parse and create import dependencies**
   - Extract all import statements
   - Create DEPENDS_ON relationships
   - Calculate relative impact weights

10. **Map component usage relationships**
    - Create USES relationships for component imports
    - Track hook usage with USES relationships
    - Map data dependencies with CONSUMES

11. **Link Storybook stories to components**
    - Match story files to component files
    - Create DOCUMENTS relationships
    - Include story variants as metadata

12. **Establish component hierarchy relationships**
    - Create CONTAINS for parent-child components
    - Map layout to content relationships
    - Track composition boundaries

### Orchestration Metadata (Enable Agent Planning)

13. **Add territory classification to entities**
    - Classify by directory structure (ui, layout, content, data)
    - Mark shared vs isolated components
    - Identify cross-cutting concerns

14. **Calculate impact weights for relationships**
    - High impact: Core dependencies, data sources
    - Medium impact: Shared utilities, common components
    - Low impact: Leaf components, isolated features

15. **Identify integration points**
    - Mark components that connect different systems
    - Flag API boundaries
    - Identify data transformation points

16. **Assess component complexity**
    - Simple: < 100 lines, few dependencies
    - Medium: 100-300 lines, moderate dependencies
    - Complex: > 300 lines or many dependencies

### Validation and Coverage (Ensure Quality)

17. **Implement coverage metrics**
    - Count files vs entities ratio
    - Calculate relationship density
    - Track entity type distribution

18. **Add gap detection to kg-updater**
    - Compare file system to entities
    - Identify orphaned entities
    - Flag missing relationships

19. **Create validation reports**
    - List components without entities
    - Find entities without relationships
    - Report coverage percentages

20. **Build orchestration readiness check**
    - Verify all entities have territories
    - Check relationship completeness
    - Validate impact weight assignments

### Agent Enhancement (Fix the Tools)

21. **Update kg-initial-analyzer minimum requirements**
    - Raise from 5 to 50+ entity minimum
    - Require 3+ relationships per entity
    - Add React-specific validation

22. **Enhance kg-updater for incremental changes**
    - Detect new React components in diffs
    - Update relationships on import changes
    - Track component moves and renames

23. **Add fallback strategies to kg_init**
    - Manual component detection if analysis fails
    - File system based entity creation
    - Basic import parsing backup

24. **Implement progress monitoring in kg_init**
    - Real-time entity creation tracking
    - Relationship density monitoring
    - Coverage percentage updates

### Testing and Verification (Confirm Success)

25. **Test analyze_project on portfolio codebase**
    - Verify 80+ entities created
    - Confirm all UI components detected
    - Check slide system coverage

26. **Validate relationship creation**
    - Verify import relationships exist
    - Check story documentation links
    - Confirm composition relationships

27. **Test orchestration queries**
    - "What components are in /ui/ territory?"
    - "What breaks if ProjectCard changes?"
    - "Which components are safe for parallel work?"

28. **Verify kg-updater incremental updates**
    - Add new component, verify entity creation
    - Change imports, verify relationship updates
    - Move component, verify all updates

## Success Criteria

- ✅ analyze_project creates 80+ entities
- ✅ All React components have proper entity types
- ✅ 150+ relationships automatically created
- ✅ 90%+ file-to-entity coverage
- ✅ All entities have orchestration metadata
- ✅ Agent queries work without file traversal
- ✅ Incremental updates maintain accuracy

## Dependencies Between Tasks

```
1-4: Foundation (must complete first)
  ↓
5-8: React Detection (requires working analyzer)
  ↓
9-12: Relationships (requires entities to connect)
  ↓
13-16: Orchestration (requires relationships)
  ↓
17-20: Validation (requires complete graph)
  ↓
21-24: Agent updates (requires working MCP)
  ↓
25-28: Testing (requires all fixes)
```

## Risk Mitigation

- **Early Testing**: Test each MCP fix immediately after implementation
- **Incremental Validation**: Check entity creation after each analyzer enhancement
- **Fallback Ready**: Implement manual detection before complex automation
- **Coverage Tracking**: Monitor progress with metrics at each step