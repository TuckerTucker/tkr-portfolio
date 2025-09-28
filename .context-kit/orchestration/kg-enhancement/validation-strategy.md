# Validation Strategy

## Overview
This document defines the validation approach for the knowledge graph enhancement project. Each wave has specific validation criteria that must pass before proceeding to the next wave.

## Wave 1: Foundation Layer Validation

### Pre-Wave Validation
- [ ] MCP server is running and accessible
- [ ] TypeScript compiler is installed
- [ ] Knowledge graph database is initialized
- [ ] Base analyzers exist (even if not working)

### Post-Wave Validation

#### MCP Tool Validation
```bash
# Test analyze_project returns real results
mcp_test_project() {
  response=$(call_mcp_tool "analyze_project" '{"patterns": ["src/**/*.jsx"]}')
  entity_count=$(echo $response | grep -o "entities" | wc -l)
  [ $entity_count -gt 0 ]
}

# Test analyze_storybook detects stories
mcp_test_storybook() {
  response=$(call_mcp_tool "analyze_storybook" '{"storiesPattern": "**/*.stories.jsx"}')
  echo $response | grep -q "stories found"
}
```

#### Entity Creation Validation
- Minimum 1 entity created by analyze_project
- Entity has required fields (type, name, location)
- Entity ID is generated correctly

#### TypeScript Compilation
- No compilation errors for JSX files
- React types are recognized
- AST traversal completes without errors

### Wave 1 Gate Criteria
- ✅ MCP tools return actionable results (not "not implemented")
- ✅ At least 1 entity created successfully
- ✅ TypeScript compiles React components
- ✅ No critical errors in logs

---

## Wave 2: React Intelligence Layer Validation

### Pre-Wave Validation
- [ ] Wave 1 gate passed
- [ ] Entity creation is working
- [ ] Analyzer base classes are stable

### Post-Wave Validation

#### Component Detection Accuracy
```typescript
// Test component type classification
validateComponentTypes() {
  const uiComponents = entities.filter(e => e.type === 'UIComponent');
  const slideComponents = entities.filter(e => e.type === 'SlideComponent');

  // Should detect known components
  assert(uiComponents.some(c => c.name === 'Button'));
  assert(slideComponents.some(c => c.name === 'ProjectIntro'));
}

// Test hook detection
validateHooks() {
  const hooks = entities.filter(e => e.type === 'Hook');
  assert(hooks.some(h => h.name === 'useProjects'));
}
```

#### Coverage Metrics
- Entity count >= 50
- All component directories represented
- Hook detection rate > 90%

#### Classification Validation
- Components in /ui/ → UIComponent
- Components in /html-slides/ → SlideComponent
- Functions starting with 'use' → Hook
- Files ending in .stories.jsx → Story

### Wave 2 Gate Criteria
- ✅ 50+ React components detected
- ✅ Component types properly classified
- ✅ Props extracted for typed components
- ✅ Import dependencies mapped

---

## Wave 3: Relationship Automation Layer Validation

### Pre-Wave Validation
- [ ] Wave 2 gate passed
- [ ] 50+ entities exist to connect
- [ ] Import maps are complete

### Post-Wave Validation

#### Relationship Density
```typescript
// Minimum relationships per entity
validateRelationshipDensity() {
  const avgRelations = relationships.length / entities.length;
  assert(avgRelations >= 3, 'Each entity should have 3+ relationships');
}

// Import coverage
validateImportCoverage() {
  const imports = getAllImports();
  const coveredImports = imports.filter(i =>
    relationships.some(r => r.type === 'DEPENDS_ON' && matchesImport(r, i))
  );
  const coverage = coveredImports.length / imports.length;
  assert(coverage >= 0.9, '90% of imports should have relationships');
}
```

#### Relationship Types
- DEPENDS_ON for all imports
- USES for hook usage
- CONTAINS for parent-child composition
- DOCUMENTS for story-component links

#### Data Flow Validation
- projects.json → useProjects → ProjectCard chain exists
- Theme provider → themed components relationships

### Wave 3 Gate Criteria
- ✅ 150+ relationships created
- ✅ Average 3+ relationships per entity
- ✅ All stories linked to components
- ✅ Import coverage > 90%

---

## Wave 4: Orchestration & Validation Layer Validation

### Pre-Wave Validation
- [ ] Wave 3 gate passed
- [ ] Full graph exists (entities + relationships)
- [ ] Base coverage > 70%

### Post-Wave Validation

#### Orchestration Metadata
```typescript
// Territory assignment validation
validateTerritories() {
  const unassigned = entities.filter(e => !e.data.territory);
  assert(unassigned.length === 0, 'All entities must have territories');

  const territories = new Set(entities.map(e => e.data.territory));
  assert(territories.has('ui'), 'UI territory must exist');
  assert(territories.has('content'), 'Content territory must exist');
}

// Impact weights validation
validateImpactWeights() {
  const criticalRelations = relationships.filter(r =>
    r.properties?.impactWeight === 'critical'
  );
  assert(criticalRelations.length > 0, 'Some critical relationships must exist');
}
```

#### Coverage Report
```markdown
## Coverage Report
- Files in project: 89
- Entities created: 85
- Coverage: 95.5%

### Missing Entities
- src/assets/react.svg (not a component)
- src/index.css (style file)

### Relationship Density
- Total relationships: 178
- Average per entity: 4.2
- Orphaned entities: 0
```

#### Agent Tool Updates
- kg-initial-analyzer.md has new requirements
- kg-update.md handles React patterns
- kg_init.md includes validation

### Wave 4 Gate Criteria
- ✅ 90%+ file-to-entity coverage
- ✅ All entities have orchestration metadata
- ✅ Coverage report generated
- ✅ Agent tools updated and tested

---

## Integration Testing

### End-to-End Validation
```bash
# Full pipeline test
e2e_test() {
  # 1. Initialize fresh KG
  kg_init

  # 2. Check entity count
  entity_count=$(kg_stats | grep "Entities:" | awk '{print $2}')
  [ $entity_count -ge 80 ]

  # 3. Check relationship count
  relation_count=$(kg_stats | grep "Relations:" | awk '{print $2}')
  [ $relation_count -ge 150 ]

  # 4. Test orchestration query
  result=$(kg_query "SELECT * FROM entities WHERE territory='ui'")
  [ $(echo $result | wc -l) -gt 10 ]

  # 5. Test impact analysis
  impact=$(kg_analyze_impact "ProjectCard")
  [ $(echo $impact | grep "affects" | wc -l) -gt 5 ]
}
```

### Performance Validation
- analyze_project completes in < 30 seconds
- Relationship building < 10 seconds
- Query response time < 100ms

---

## Rollback Procedures

### Wave Failure Protocol
1. **Detect failure** at synchronization gate
2. **Stop all agents** in current wave
3. **Assess damage** - what was partially completed
4. **Rollback changes**:
   ```bash
   git checkout -- .context-kit/
   kg_restore_backup wave_{n}_checkpoint
   ```
5. **Analyze failure** - determine root cause
6. **Fix and retry** - update agent instructions

### Partial Success Handling
If some agents succeed but others fail:
1. Keep successful agent work
2. Reassign failed agent tasks
3. Add additional validation
4. Proceed with caution

---

## Success Metrics Summary

### Quantitative Metrics
| Metric | Target | Critical |
|--------|--------|----------|
| Entity Count | 80+ | 60+ |
| Relationship Count | 150+ | 100+ |
| Coverage | 90% | 80% |
| Relationship Density | 3+ | 2+ |
| Component Detection | 95% | 85% |

### Qualitative Metrics
- Orchestration queries return accurate results
- Impact analysis identifies affected components
- Territory assignments enable parallel work
- Agent tools work without manual intervention

---

## Monitoring & Alerting

### Real-time Monitoring
```typescript
// Monitor entity creation rate
monitor.trackEntityCreation((count) => {
  if (count < expectedRate * 0.5) {
    alert('Entity creation slower than expected');
  }
});

// Monitor relationship density
monitor.trackRelationshipDensity((density) => {
  if (density < 2.0) {
    alert('Relationship density below minimum');
  }
});
```

### Alert Conditions
- Entity creation stalls (no new entities in 5 minutes)
- Relationship density drops below 2.0
- Coverage drops below 70%
- Critical errors in logs
- Memory usage exceeds limits

---

## Post-Implementation Validation

### Regression Testing
After all waves complete:
1. Run full test suite
2. Compare with baseline metrics
3. Verify no functionality lost
4. Test all agent tools
5. Validate orchestration workflows

### User Acceptance Criteria
- Agents can plan parallel work without conflicts
- Knowledge graph answers orchestration queries
- Coverage reports are accurate and actionable
- System performs within acceptable limits