# Implementation Plan: Agent-Based Knowledge Graph Analysis

**Goal:** Replace complex TypeScript analysis infrastructure with specialized Claude Code agents that use native tools for knowledge graph population.

**Context:** Following ADR-001 decision to transition from monolithic TypeScript analyzers to flexible agent-based architecture that leverages Claude Code's native Read/Glob/Grep capabilities.

## Ordered Task List

### Foundation and Cleanup

1. **Remove complex MCP analysis handlers**
   - Delete analyze_project, analyze_storybook, analyze_impact handlers from `mcp/src/tools/knowledge-graph.ts`
   - Delete analyze_state_mutations, trace_workflow, trace_user_flow, find_patterns handlers
   - Delete get_component_dependencies, analyze_state_patterns, generate_test_scenarios handlers
   - Keep only CRUD operations: create_entity, create_relation, search_entities, get_stats, query

2. **Remove unused TypeScript analysis infrastructure**
   - Delete `StaticAnalyzer` class from `knowledge-graph/src/analyzers/static-analyzer.ts`
   - Delete `StorybookAnalyzer` from `knowledge-graph/src/analyzers/storybook-analyzer.ts`
   - Delete `ProjectScanner` from `knowledge-graph/src/integration/project-scanner.ts`
   - Remove imports and references to these classes throughout codebase

3. **Remove unused HTTP API endpoints**
   - Remove any analyze-project endpoints from `http-server.ts` and `http-server-simple.ts`
   - Clean up unused route handlers and API documentation
   - Remove analysis-related middleware or validation

4. **Remove obsolete scripts and configuration**
   - Delete analysis-related scripts from `knowledge-graph/package.json`
   - Remove scripts that invoke old TypeScript analyzers
   - Clean up TypeScript build configurations for removed analyzers
   - Remove unused dependencies from package.json files

5. **Update agent specifications**
   - Archive current `kg-initial-analyzer.md` as legacy reference
   - Archive `kg-update.md` as legacy reference
   - Remove references to old MCP analysis tools from agent documentation

6. **Verify MCP CRUD operations work with canonical database**
   - Test create_entity with simple test data
   - Test create_relation between test entities
   - Verify search_entities returns expected results
   - Confirm get_stats reflects changes correctly

### Core Agent Development

7. **Create react-component-analyzer agent**
   - Use Glob to find .tsx/.jsx files in dashboard module
   - Use Read to extract component names and basic metadata
   - Use mcp__context-kit__create_entity to store UIComponent entities
   - Test on 3 dashboard components (App.tsx, AppWithServices.tsx, main.tsx)

8. **Add component categorization to react-component-analyzer**
   - Classify components by file path (UIComponent, LayoutComponent, SlideComponent)
   - Extract basic props information from function parameters
   - Store file location and component type in entity data
   - Handle TypeScript interface extraction for props

9. **Validate react-component-analyzer end-to-end**
   - Run agent on dashboard module
   - Use mcp__context-kit__search_entities to verify entities created
   - Check entity data contains expected component information
   - Confirm entity count matches file count (3 components = 3 entities)

10. **Create import-relationship-mapper agent**
    - Use Read to extract import statements from component files
    - Use mcp__context-kit__search_entities to find existing component entities
    - Use mcp__context-kit__create_relation to create DEPENDS_ON relationships
    - Start with dashboard module imports only

11. **Test relationship creation and traversal**
    - Verify DEPENDS_ON relationships created between dashboard components
    - Use mcp__context-kit__query to traverse dependency chains
    - Test impact analysis by following relationships backward
    - Validate relationship properties (impact_weight, territory)

### Scale to Full Codebase

12. **Extend react-component-analyzer to full codebase**
    - Run on all .tsx/.jsx files in project
    - Handle core module, knowledge-graph module, and other directories
    - Verify entity categorization works across different directory structures
    - Expected: 50+ component entities for full codebase

13. **Extend import-relationship-mapper to full codebase**
    - Map all import relationships across entire project
    - Handle relative imports, npm package imports, and internal module imports
    - Add relationship properties (impact_weight, territory)
    - Expected: 150+ relationships for well-connected graph

### Specialized Analysis Agents

14. **Create storybook-analyzer agent**
    - Use Glob to find .stories.* files
    - Use Read to extract story metadata and component references
    - Create Story entities with DOCUMENTS relationships to components
    - Handle story variants and args metadata

15. **Create react-hook-analyzer agent**
    - Use Grep to find functions starting with "use" pattern
    - Create Hook entities for custom hooks
    - Map USES relationships from components to hooks
    - Extract hook dependencies and return types

16. **Create data-flow-analyzer agent**
    - Find JSON data files and configuration files
    - Create DataSource entities
    - Map CONSUMES relationships from components to data sources
    - Track API endpoints and data fetching patterns

17. **Create knowledge-graph-validator agent**
    - Compare file counts to entity counts for coverage analysis
    - Identify orphaned entities or missing relationships
    - Generate quality metrics and gap analysis reports
    - Validate relationship density (target: 3:1 ratio)

### Orchestration and Optimization

18. **Create orchestration workflow**
    - Build script or agent that runs all analysis agents in optimal order
    - Handle agent dependencies (components before relationships)
    - Add parallel execution where possible (specialized agents can run concurrently)

19. **Add incremental update capability**
    - Design agents to be idempotent (safe to re-run)
    - Add logic to detect existing entities and update vs create
    - Optimize agents to skip unchanged files
    - Support for incremental updates based on git diffs

20. **Performance optimization**
    - Batch MCP operations where possible
    - Add progress reporting to long-running agents
    - Optimize Glob patterns to reduce unnecessary file reads
    - Target: <5 minute full repository analysis time

21. **Error handling and robustness**
    - Add comprehensive error handling to all agents
    - Design graceful degradation when files can't be parsed
    - Add retry logic for MCP operation failures
    - Provide clear debugging information when agents fail

### Final Cleanup and Documentation

22. **Remove development artifacts**
    - Delete test database files (`test-both.db`, `test-conflict.db`)
    - Remove any temporary analysis files or logs
    - Clean up unused MCP database files
    - Archive old kg-updates documentation as reference

23. **Documentation and testing**
    - Document each agent's purpose, inputs, and outputs
    - Create test cases for agent validation
    - Add agent specifications to .claude/agents/ directory
    - Update README files to reflect new architecture

24. **Final validation and handoff**
    - Run full orchestration workflow on clean repository
    - Validate all success criteria are met
    - Document known limitations and future improvements
    - Create runbook for knowledge graph maintenance

## Success Criteria

### Quantitative Metrics
- ✅ >90% React component coverage (entities created for components)
- ✅ >3:1 relationship-to-entity ratio (well-connected graph)
- ✅ <5 minute full repository analysis time
- ✅ >95% agent reliability (successful runs)
- ✅ Zero unused TypeScript analysis code remaining

### Qualitative Metrics
- ✅ Agents can be run independently without breaking system
- ✅ Clear debugging path when entities/relationships are missing
- ✅ Non-TypeScript developers can modify analysis logic
- ✅ Analysis process is transparent and traceable
- ✅ Knowledge graph supports orchestration use cases

### Architecture Quality
- ✅ MCP interface simplified to essential CRUD operations
- ✅ Each agent has single responsibility and clear boundaries
- ✅ System is modular and extensible for new analysis types
- ✅ Database consolidation complete (single canonical database)
- ✅ No legacy code or configuration remaining

## Key Dependencies

### Hard Dependencies
- Tasks 1-6: Foundation cleanup must complete before building agents
- Task 7: Core agent pattern must validate before scaling
- Task 10: Relationships require entities to exist first
- Task 12: Full codebase requires local validation success
- Task 18: Orchestration requires all individual agents working

### Optimization Dependencies
- Tasks 14-17: Specialized agents can run in parallel after task 13
- Task 19: Incremental updates require full workflow validation
- Tasks 20-21: Performance optimization after core functionality proven

### Risk Mitigation
- Test each agent thoroughly before moving to next
- Validate MCP CRUD operations early to avoid late integration issues
- Keep agent scope focused to enable independent debugging
- Maintain rollback capability until new system fully validated

## Notes

### Agent Development Guidelines
- Each agent should be independently testable and debuggable
- Use consistent entity naming and categorization patterns
- Include progress reporting and detailed logging
- Design for idempotency (safe to re-run multiple times)
- Focus on single responsibility per agent

### MCP Interface Stability
- CRUD operations should remain stable for agent compatibility
- Entity and relationship schemas should be versioned
- Database migrations should be handled gracefully
- Avoid complex analysis logic in MCP layer

### Monitoring and Maintenance
- Track agent success rates and performance metrics
- Monitor knowledge graph quality over time
- Plan for regular validation and cleanup cycles
- Design system for easy addition of new analysis capabilities

---

**Document Version:** 1.0
**Created:** 2025-01-28
**Based on:** ADR-001 Agent-Based Analysis Architecture
**Next Review:** After Task 11 (relationship validation)