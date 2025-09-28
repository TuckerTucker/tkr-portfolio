# MCP Knowledge Graph Implementation Review

## Current Implementation Analysis

### Architecture Overview

The MCP server provides knowledge graph tools through a layered architecture:

```
MCP Server (src/tools/knowledge-graph.ts)
    ↓ (exposes tools)
Knowledge Graph Service (knowledge-graph/src/)
    ├── Static Analyzer (analyzers/static-analyzer.ts)
    ├── Storybook Analyzer (analyzers/storybook-analyzer.ts)
    └── Project Scanner (integration/project-scanner.ts)
```

### Critical Finding: analyze_project Not Implemented

**The most critical issue:** The `analyze_project` MCP tool returns:
```typescript
toolHandlers.set('analyze_project', async (args) => {
    safeLogger.warn('Project analysis not yet implemented with core module');
    return { text: 'Project analysis is not yet implemented with the core module.' };
});
```

This explains why kg-initial-analyzer fails - the core automated analysis tool doesn't work!

## Key Issues Identified

### 1. Broken Tool Chain
- **analyze_project**: Returns "not implemented" despite Static Analyzer existing
- **analyze_storybook**: Also returns "not implemented" despite StorybookAnalyzer existing
- **Disconnect**: MCP tools not wired to actual analyzer implementations

### 2. Static Analyzer Limitations

The existing Static Analyzer has basic React detection but lacks:

```typescript
// Current implementation only checks:
- JSX presence (containsJSX)
- Component/PureComponent inheritance
- Basic prop extraction

// Missing:
- Hook detection and dependencies
- Context provider/consumer relationships
- Component composition (children)
- Import/export relationships
- Data flow analysis
```

### 3. Entity Creation Issues

The analyzer creates generic entities without proper typing:
```typescript
// Current: No entity type differentiation
await this.analyzeComponent(node, filePath);

// Should be:
await this.kg.createEntity({
    type: 'UIComponent',  // Specific types
    name: componentName,
    data: {
        location: filePath,
        category: this.getComponentCategory(filePath), // ui, layout, slide
        props: extractedProps,
        hooks: detectedHooks,
        dependencies: importedComponents
    }
});
```

### 4. Relationship Mapping Gaps

No automatic relationship creation in the analyzers:
```typescript
// Missing relationship detection:
- Import statements → DEPENDS_ON relationships
- Component usage → USES relationships
- Parent-child composition → CONTAINS relationships
- Story files → DOCUMENTS relationships
```

## Required MCP Improvements

### 1. Wire Up analyze_project Tool

```typescript
// Fix in mcp/src/tools/knowledge-graph.ts
toolHandlers.set('analyze_project', async (args) => {
    const { patterns = DEFAULT_PATTERNS, includeTests = false } = args;

    // Create Project Scanner instance
    const scanner = new ProjectScanner(kg);

    // Run comprehensive analysis
    await scanner.scanProject({
        projectRoot: process.cwd(),
        patterns: enhanceReactPatterns(patterns),
        includeTests,
        includeStorybook: true
    });

    // Return statistics
    const stats = await kg.getStats();
    return {
        content: [{
            type: 'text',
            text: `Analysis complete: ${stats.entities} entities, ${stats.relations} relations created`
        }]
    };
});
```

### 2. Enhance React Detection

```typescript
// Add to static-analyzer.ts
private detectReactPatterns(node: ts.Node): ComponentPattern {
    return {
        isComponent: this.isReactComponent(node),
        isHook: this.isReactHook(node),
        isContext: this.isReactContext(node),
        isSlide: this.isSlideComponent(node),
        category: this.getComponentCategory(node)
    };
}

private isReactHook(node: ts.Node): boolean {
    const name = this.getNodeName(node);
    return name?.startsWith('use') && ts.isFunctionDeclaration(node);
}

private isSlideComponent(filePath: string): boolean {
    return filePath.includes('/html-slides/');
}

private getComponentCategory(filePath: string): string {
    if (filePath.includes('/ui/')) return 'UIComponent';
    if (filePath.includes('/layout/')) return 'LayoutComponent';
    if (filePath.includes('/html-slides/')) return 'SlideComponent';
    if (filePath.includes('/feature/')) return 'FeatureComponent';
    if (filePath.includes('/custom/')) return 'CustomComponent';
    return 'Component';
}
```

### 3. Automatic Relationship Creation

```typescript
// Add to static-analyzer.ts
private async createComponentRelationships(
    componentEntity: Entity,
    sourceFile: ts.SourceFile
): Promise<void> {
    // Parse imports
    const imports = this.extractImports(sourceFile);

    for (const imp of imports) {
        // Find or create imported entity
        const importedEntity = await this.findOrCreateEntity(imp);

        // Create DEPENDS_ON relationship
        await this.kg.createRelation({
            fromId: componentEntity.id,
            toId: importedEntity.id,
            type: 'DEPENDS_ON',
            properties: {
                importType: imp.type,
                impact_weight: this.calculateImpactWeight(imp),
                territory: this.getTerritory(imp.path)
            }
        });
    }

    // Create composition relationships
    const childComponents = this.extractChildComponents(sourceFile);
    for (const child of childComponents) {
        await this.kg.createRelation({
            fromId: componentEntity.id,
            toId: child.id,
            type: 'CONTAINS',
            properties: { composition: 'direct' }
        });
    }
}
```

### 4. Storybook Integration

```typescript
// Fix analyze_storybook handler
toolHandlers.set('analyze_storybook', async (args) => {
    const { storiesPattern = '**/*.stories.@(js|jsx|ts|tsx)' } = args;

    const analyzer = new StorybookAnalyzer(kg);
    await analyzer.analyzeStorybook({
        projectRoot: process.cwd(),
        storiesPattern
    });

    // Create DOCUMENTS relationships
    await analyzer.linkStoriesToComponents();

    return { text: 'Storybook analysis complete' };
});
```

### 5. Enhanced Entity Properties for Orchestration

```typescript
interface OrchestrationEntity extends Entity {
    data: {
        // Existing properties
        location: string;
        props?: PropDefinition[];

        // Orchestration-specific properties
        territory: Territory;           // ui, layout, content, data
        complexity: ComplexityLevel;    // simple, medium, complex
        stability: Stability;           // stable, evolving, experimental
        impactRadius: ImpactLevel;      // leaf, local, regional, global
        integrationPoints: string[];    // Other entities this connects to
        modificationRisk: RiskLevel;    // low, medium, high
    };
}
```

## Implementation Priority

### Phase 1: Fix Core Functionality (Immediate)
1. Wire up `analyze_project` to ProjectScanner
2. Wire up `analyze_storybook` to StorybookAnalyzer
3. Add basic relationship creation in analyzers

### Phase 2: React-Specific Enhancements (Week 1)
1. Enhance component detection with categories
2. Add hook detection and dependency tracking
3. Implement import → relationship mapping
4. Add composition relationship detection

### Phase 3: Orchestration Support (Week 2)
1. Add territory classification to entities
2. Calculate impact weights for relationships
3. Identify integration points
4. Add complexity and stability metrics

### Phase 4: Validation and Coverage (Week 3)
1. Add coverage reporting to analyze_project
2. Implement gap detection
3. Add validation for relationship consistency
4. Create orchestration readiness report

## Testing Strategy

### Unit Tests Needed
```typescript
describe('StaticAnalyzer', () => {
    it('should detect all React component types', async () => {
        // Test function, class, arrow components
    });

    it('should create proper entity types', async () => {
        // Verify UIComponent, SlideComponent, etc.
    });

    it('should map import relationships', async () => {
        // Verify DEPENDS_ON creation
    });
});
```

### Integration Tests
```typescript
describe('MCP analyze_project', () => {
    it('should create 50+ entities for portfolio', async () => {
        const result = await mcp.analyze_project({
            patterns: ['src/**/*.jsx']
        });
        expect(result.entities).toBeGreaterThan(50);
    });

    it('should create relationships for all imports', async () => {
        // Verify relationship density
    });
});
```

## Success Metrics

### Functionality Metrics
- analyze_project creates entities (currently: 0)
- Relationship creation automated (currently: manual only)
- Component coverage > 90% (currently: unknown)

### Orchestration Readiness
- All entities have territory classification
- Integration points identified
- Impact weights calculated
- Complexity assessments complete

## Conclusion

The MCP implementation has the architecture but lacks critical wiring and React-specific intelligence. The disconnection between MCP tools and analyzer implementations explains why the knowledge graph remains sparse. Fixing these issues will enable the comprehensive, orchestration-ready knowledge graph we've specified.