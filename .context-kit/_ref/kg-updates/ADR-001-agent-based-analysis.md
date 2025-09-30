# ADR-001: Agent-Based Knowledge Graph Analysis

## Status
**DECIDED** - 2025-01-28

## Context

The knowledge graph system currently uses a complex TypeScript-based analysis infrastructure (StaticAnalyzer, ProjectScanner, StorybookAnalyzer) that is proving difficult to maintain and debug. Key issues identified:

### Problems with Current Approach
1. **Complex Infrastructure**: TypeScript compilation, AST parsing, and module resolution complexity
2. **Debugging Difficulty**: Hard to trace why entities/relationships are missing
3. **Database Connection Issues**: Persistent connection and path resolution problems
4. **Monolithic Analysis**: Single large analysis process that's hard to parallelize
5. **Maintenance Overhead**: Requires TypeScript expertise for React analysis patterns
6. **Limited Flexibility**: Hard to add new analysis types or modify existing patterns

### Current Architecture Issues
- Multiple database files due to path inconsistencies
- MCP tools that claim "not implemented" despite infrastructure existing
- Complex wiring between MCP handlers and analysis classes
- Difficult to incrementally improve or test specific analysis features

## Decision

**We will replace the TypeScript-based analysis infrastructure with specialized Claude Code agents that use native tools for analysis.**

### New Architecture: Agent-Based Analysis

#### Core Principles
1. **Agents Do Analysis** - Use Read, Glob, Grep tools to understand code structure
2. **MCP Handles Storage** - Simplified to basic CRUD operations only
3. **Specialized Agents** - Each agent focuses on specific entity types or relationships
4. **Incremental Population** - Agents run independently and can be parallelized

#### MCP Simplification
**KEEP (Essential CRUD):**
- `create_entity` - Add entities to knowledge graph
- `create_relation` - Add relationships between entities
- `search_entities` - Find existing entities
- `get_stats` - Basic statistics
- `query` - Custom SQL queries for complex searches

**REMOVE (Complex Analysis):**
- `analyze_project` - Replace with react-component-analyzer agent
- `analyze_storybook` - Replace with storybook-analyzer agent
- `analyze_impact` - Replace with relationship traversal queries
- `find_patterns` - Replace with specialized pattern-finding agents
- `get_component_dependencies` - Replace with import-relationship-mapper

#### Specialized Analysis Agents

**1. `react-component-analyzer`**
- **Purpose**: Discover and analyze React components
- **Tools**: Read, Glob, Grep, mcp__context-kit__create_entity
- **Output**: UIComponent, LayoutComponent, SlideComponent entities
- **Strategy**:
  - Glob for `**/*.tsx`, `**/*.jsx` files
  - Read files to extract component names, props, exports
  - Create entities with proper categorization based on file path

**2. `react-hook-analyzer`**
- **Purpose**: Identify custom hooks and their usage patterns
- **Tools**: Read, Grep, mcp__context-kit__create_entity, mcp__context-kit__create_relation
- **Output**: Hook entities with USES relationships
- **Strategy**:
  - Grep for `use[A-Z]` patterns in files
  - Read hook files to understand dependencies
  - Create Hook entities and map usage relationships

**3. `import-relationship-mapper`**
- **Purpose**: Map import/export dependencies between files
- **Tools**: Read, Grep, mcp__context-kit__search_entities, mcp__context-kit__create_relation
- **Output**: DEPENDS_ON, USES relationships
- **Strategy**:
  - Read files to extract import statements
  - Map imports to existing entities
  - Create dependency relationships with impact weights

**4. `storybook-analyzer`**
- **Purpose**: Link Storybook stories to components
- **Tools**: Glob, Read, mcp__context-kit__create_entity, mcp__context-kit__create_relation
- **Output**: Story entities with DOCUMENTS relationships
- **Strategy**:
  - Glob for `**/*.stories.*` files
  - Extract story metadata and component references
  - Create DOCUMENTS relationships

**5. `data-flow-analyzer`**
- **Purpose**: Track data sources and consumption patterns
- **Tools**: Read, Grep, mcp__context-kit__create_entity, mcp__context-kit__create_relation
- **Output**: DataSource entities with CONSUMES relationships
- **Strategy**:
  - Find JSON data files
  - Track API endpoints and data fetching patterns
  - Map data consumption relationships

**6. `knowledge-graph-validator`**
- **Purpose**: Validate completeness and consistency
- **Tools**: mcp__context-kit__get_stats, mcp__context-kit__query, mcp__context-kit__search_entities
- **Output**: Coverage reports and gap analysis
- **Strategy**:
  - Compare file counts to entity counts
  - Identify orphaned entities or missing relationships
  - Generate quality metrics

## Consequences

### Benefits
- ✅ **Simplified Debugging**: Each agent can be tested independently
- ✅ **Incremental Development**: Add new analysis types without breaking existing
- ✅ **Native Tool Usage**: Leverages Claude Code's Read/Glob/Grep efficiently
- ✅ **Parallelization**: Run multiple agents simultaneously
- ✅ **Maintainability**: No complex TypeScript infrastructure to maintain
- ✅ **Flexibility**: Easy to modify analysis strategies per agent
- ✅ **Database Simplification**: Single canonical database with simple CRUD
- ✅ **Transparent Process**: Each analysis step is visible and traceable

### Trade-offs
- ⚠️ **Multiple Tool Calls**: More MCP calls vs single analysis run
- ⚠️ **Agent Coordination**: Need orchestration for full analysis
- ⚠️ **Performance**: May be slower than optimized TypeScript analysis
- ⚠️ **Agent Management**: More agents to maintain and coordinate

### Migration Strategy

**Phase 1: MCP Simplification**
1. Remove complex analysis handlers from `knowledge-graph.ts`
2. Keep only CRUD operations (create_entity, create_relation, etc.)
3. Test basic storage functionality with canonical database

**Phase 2: Core Analysis Agents**
1. Create `react-component-analyzer` agent
2. Test with dashboard module (3 components)
3. Validate entity creation and categorization

**Phase 3: Relationship Mapping**
1. Create `import-relationship-mapper` agent
2. Test DEPENDS_ON relationship creation
3. Validate relationship traversal and impact analysis

**Phase 4: Specialized Analysis**
1. Add `storybook-analyzer`, `react-hook-analyzer`, `data-flow-analyzer`
2. Test full repository analysis workflow
3. Create `knowledge-graph-validator` for quality assurance

**Phase 5: Orchestration**
1. Create orchestration script or agent
2. Optimize for performance and parallelization
3. Add incremental update capabilities

### Success Metrics

**Quantitative:**
- Entity coverage: >90% of React components discovered
- Relationship density: >3 relationships per component average
- Analysis time: <5 minutes for full repository scan
- Agent reliability: >95% success rate per agent

**Qualitative:**
- Debuggability: Can identify why specific entities/relationships are missing
- Maintainability: Non-TypeScript developers can modify analysis logic
- Flexibility: Can add new entity types without infrastructure changes
- Transparency: Analysis process is clearly visible in agent logs

## Implementation Notes

### Agent Development Guidelines
- Each agent should have clear success criteria and error handling
- Use consistent entity naming and categorization patterns
- Include progress reporting and detailed logging
- Design for idempotency (safe to re-run agents)

### MCP Interface Stability
- CRUD operations should remain stable for agent compatibility
- Entity and relationship schemas should be versioned
- Database migrations should be handled gracefully

### Testing Strategy
- Unit tests: Each agent tested independently on known file sets
- Integration tests: Full workflow on sample repositories
- Regression tests: Validate consistency across analysis runs
- Performance tests: Monitor analysis time and resource usage

---

**Decision made by:** Tucker
**Date:** 2025-01-28
**Next Review:** After Phase 2 completion (react-component-analyzer agent)