# Agent Assignments & Territorial Boundaries

## Agent Roster

### Wave 1 Agents (Foundation Layer)

#### Agent 1: MCP Wiring Specialist
**Skills Required**: TypeScript, MCP protocol, async/await patterns
**Exclusive Territory**:
- `.context-kit/mcp/src/tools/knowledge-graph.ts` (WRITE)

**Read-Only Access**:
- `.context-kit/knowledge-graph/src/integration/project-scanner.ts`
- `.context-kit/knowledge-graph/src/analyzers/*.ts`

**Restrictions**:
- Cannot modify core analyzer logic
- Cannot change MCP server configuration
- Must maintain backward compatibility

---

#### Agent 2: TypeScript Analyzer Expert
**Skills Required**: TypeScript compiler API, AST traversal, React patterns
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/analyzers/static-analyzer.ts` (WRITE)

**Read-Only Access**:
- `@tkr-context-kit/core` types
- Project source files for testing

**Restrictions**:
- Cannot modify MCP layer
- Cannot change database schema
- Must preserve existing method signatures

---

#### Agent 3: Storybook Analyzer Expert
**Skills Required**: Storybook patterns, MDX parsing, component matching
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/analyzers/storybook-analyzer.ts` (WRITE)

**Read-Only Access**:
- Story files in project
- Component files for matching

**Restrictions**:
- Cannot modify static analyzer
- Must use existing entity types
- Cannot alter core interfaces

---

### Wave 2 Agents (React Intelligence Layer)

#### Agent 4: Component Detection Specialist
**Skills Required**: React patterns, component architectures, JSX parsing
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/analyzers/react-detector.ts` (CREATE)
- `.context-kit/knowledge-graph/src/analyzers/patterns/` (CREATE)

**Read-Only Access**:
- Static analyzer base class
- All React component files

**Restrictions**:
- Must extend, not modify, static analyzer
- Use only public APIs
- Cannot modify existing entity structures

---

#### Agent 5: Props & Interface Extractor
**Skills Required**: TypeScript types, prop-types, interface parsing
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/analyzers/prop-extractor.ts` (CREATE)
- `.context-kit/knowledge-graph/src/types/props.ts` (CREATE)

**Read-Only Access**:
- Component AST nodes
- TypeScript type checker

**Restrictions**:
- Cannot modify component files
- Must handle missing types gracefully
- Output must conform to entity schema

---

#### Agent 6: Import Dependency Mapper
**Skills Required**: Module resolution, import/export patterns, dependency graphs
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/analyzers/dependency-mapper.ts` (CREATE)
- `.context-kit/knowledge-graph/src/graphs/` (CREATE)

**Read-Only Access**:
- All source files
- Package.json files
- Node_modules for external deps

**Restrictions**:
- Cannot create relationships (Wave 3 task)
- Must handle circular dependencies
- Cannot modify import statements

---

### Wave 3 Agents (Relationship Automation Layer)

#### Agent 1: Dependency Relationship Builder
**Skills Required**: Graph algorithms, relationship modeling, impact analysis
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/builders/dependency-builder.ts` (CREATE)

**Read-Only Access**:
- All entities from database
- Import dependency maps
- Package dependency tree

**Restrictions**:
- Cannot modify entities
- Must use existing relationship types
- Cannot delete existing relationships

---

#### Agent 2: Composition Relationship Builder
**Skills Required**: Component hierarchies, React composition, render trees
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/builders/composition-builder.ts` (CREATE)

**Read-Only Access**:
- Component entities
- JSX usage patterns
- Component render methods

**Restrictions**:
- Cannot modify component logic
- Must detect, not assume, composition
- Cannot create duplicate relationships

---

#### Agent 3: Documentation Relationship Builder
**Skills Required**: Documentation patterns, test frameworks, story formats
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/builders/documentation-builder.ts` (CREATE)

**Read-Only Access**:
- Story files
- Test files
- README/docs files

**Restrictions**:
- Cannot modify documentation
- Must handle missing docs gracefully
- Cannot assume naming conventions

---

### Wave 4 Agents (Orchestration & Validation Layer)

#### Agent 4: Orchestration Metadata Enricher
**Skills Required**: Software metrics, complexity analysis, architectural patterns
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/enrichers/orchestration-enricher.ts` (CREATE)
- `.context-kit/knowledge-graph/src/metrics/` (CREATE)

**Read-Only Access**:
- All entities and relationships
- File system structure
- Git history (if needed)

**Restrictions**:
- Cannot delete entities/relationships
- Must be non-destructive updates
- Cannot change core entity structure

---

#### Agent 5: Coverage Validator
**Skills Required**: Testing, metrics, reporting, gap analysis
**Exclusive Territory**:
- `.context-kit/knowledge-graph/src/validators/coverage-validator.ts` (CREATE)
- `.context-kit/knowledge-graph/reports/` (CREATE)

**Read-Only Access**:
- File system
- All entities and relationships
- Git file list

**Restrictions**:
- Cannot modify the graph
- Read-only validation
- Must produce actionable reports

---

#### Agent 6: Agent Tool Updater
**Skills Required**: Claude agent syntax, command patterns, markdown
**Exclusive Territory**:
- `.claude/agents/kg-initial-analyzer.md` (WRITE)
- `.claude/agents/kg-update.md` (WRITE)
- `.claude/commands/kg_init.md` (WRITE)

**Read-Only Access**:
- New analyzer implementations
- Coverage reports
- Test results

**Restrictions**:
- Must maintain agent compatibility
- Cannot break existing workflows
- Must preserve command interfaces

---

## Boundary Enforcement Rules

### File Access Matrix
```
Agent | Can Write              | Can Read                | Cannot Touch
------|------------------------|-------------------------|------------------
1     | MCP tools              | Analyzers, Scanner      | Core DB, Schema
2     | Static Analyzer        | Core types, Source      | MCP, Other analyzers
3     | Storybook Analyzer     | Stories, Components     | Static analyzer
4     | React Detector (new)   | Pattern files (new)     | Existing analyzers
5     | Prop Extractor (new)   | AST, Types              | Component source
6     | Dep Mapper (new)       | All source, packages    | Any source files
```

### Integration Boundaries
1. **Wave boundaries are hard stops** - No Wave 2 work until Wave 1 gate passes
2. **New files preferred** - Create new modules rather than heavily modifying existing
3. **Public API only** - Use only exported functions/types from other modules
4. **No cross-agent dependencies** - Agents in same wave cannot depend on each other

### Conflict Resolution Protocol
1. **File lock violation**: Agent must stop and report
2. **Integration failure**: Rollback and reassign
3. **Scope creep**: Return to boundaries, reassign excess
4. **Dependency missing**: Wait for prerequisite wave

## Success Handoff Checklist

Each agent must provide:
- [ ] Completed code in assigned territory
- [ ] Unit tests for new functionality
- [ ] Integration test results
- [ ] Documentation of public APIs
- [ ] Known limitations documented
- [ ] Handoff notes for next wave