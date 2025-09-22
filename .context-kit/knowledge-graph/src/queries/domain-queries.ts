import { KnowledgeGraph, type Entity, type Relation } from '@tkr-context-kit/core';

export interface ComponentInfo {
  name: string;
  type: string;
  location: string;
  dependencies?: string[];
  props?: string[];
}

export interface StateMutation {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  source: string;
}

export interface WorkflowTrace {
  id: string;
  steps: Array<{
    action: string;
    timestamp: Date;
    data?: any;
  }>;
}

export interface Impact {
  id: string;
  source: string;
  targets: string[];
  type: 'dependency' | 'state' | 'event';
  severity: 'low' | 'medium' | 'high';
}

export interface SearchResult {
  entity: Entity;
  score: number;
  context?: string;
}

export class DomainQueries {
  constructor(private kg: KnowledgeGraph) {}

  /**
   * Find all components that consume a specific store
   */
  async findComponentsByStore(storeName: string): Promise<ComponentInfo[]> {
    // Get store entity
    const stores = await this.kg.getEntities({ type: 'Store', name: storeName });
    if (stores.length === 0) return [];

    const store = stores[0];

    // Get relations pointing to this store
    const relations = await this.kg.getRelations();
    const storeRelations = relations.filter(r =>
      r.toEntityId === store.id && ['USES', 'CONSUMES'].includes(r.type)
    );

    // Get components that use this store
    const components = await this.kg.getEntities({ type: 'Component' });
    const componentResults: ComponentInfo[] = [];

    for (const relation of storeRelations) {
      const component = components.find(c => c.id === relation.fromEntityId);
      if (component) {
        componentResults.push({
          name: component.name,
          type: 'Component',
          location: component.data.location || '',
          dependencies: relation.properties?.methods || []
        });
      }
    }

    return componentResults.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find all stores mutated by a specific action
   */
  async findStoresByAction(actionName: string): Promise<Array<{store: string, changes: string[]}>> {
    // Get action entity
    const actions = await this.kg.getEntities({ type: 'Action', name: actionName });
    if (actions.length === 0) return [];

    const action = actions[0];

    // Get relations from this action
    const relations = await this.kg.getRelations();
    const mutationRelations = relations.filter(r =>
      r.fromEntityId === action.id && r.type === 'MUTATES'
    );

    // Get stores that are mutated
    const stores = await this.kg.getEntities({ type: 'Store' });
    const results: Array<{store: string, changes: string[]}> = [];

    for (const relation of mutationRelations) {
      const store = stores.find(s => s.id === relation.toEntityId);
      if (store) {
        results.push({
          store: store.name,
          changes: relation.properties?.changes ?
            relation.properties.changes.split(',').map((s: string) => s.trim()) : []
        });
      }
    }

    return results;
  }

  /**
   * Trace user interaction flow
   */
  async traceUserFlow(interactionName: string): Promise<Array<{
    step: number;
    entity: string;
    type: string;
    description: string;
  }>> {
    // Get starting interaction
    const interactions = await this.kg.getEntities({ type: 'UserInteraction', name: interactionName });
    if (interactions.length === 0) return [];

    const startInteraction = interactions[0];
    const flow: Array<{
      step: number;
      entity: string;
      type: string;
      description: string;
    }> = [];

    // Add starting interaction
    flow.push({
      step: 1,
      entity: startInteraction.name,
      type: startInteraction.type,
      description: startInteraction.data.description || ''
    });

    // Simple flow tracing (not recursive for now)
    const relations = await this.kg.getRelations();
    const entities = await this.kg.getEntities();
    const flowRelations = ['TRIGGERS', 'MUTATES', 'CALLS', 'UPDATES'];

    let currentEntityId = startInteraction.id;
    let step = 2;

    // Follow relations up to 20 steps
    while (step <= 20) {
      const nextRelation = relations.find(r =>
        r.fromEntityId === currentEntityId && flowRelations.includes(r.type)
      );

      if (!nextRelation) break;

      const nextEntity = entities.find(e => e.id === nextRelation.toEntityId);
      if (!nextEntity) break;

      flow.push({
        step,
        entity: nextEntity.name,
        type: nextEntity.type,
        description: nextEntity.data.description || ''
      });

      currentEntityId = nextEntity.id;
      step++;
    }

    return flow;
  }

  /**
   * Find circular dependencies
   */
  async findCircularDependencies(): Promise<Array<{
    entity1: string;
    entity2: string;
    path: string;
  }>> {
    // Simplified circular dependency detection
    const entities = await this.kg.getEntities();
    const relations = await this.kg.getRelations();
    const dependencyTypes = ['DEPENDS_ON', 'IMPORTS', 'USES'];
    const dependencyRelations = relations.filter(r => dependencyTypes.includes(r.type));

    const circularDeps: Array<{
      entity1: string;
      entity2: string;
      path: string;
    }> = [];

    // Build adjacency list
    const adjacencyList = new Map<string, string[]>();
    for (const relation of dependencyRelations) {
      const fromEntity = entities.find(e => e.id === relation.fromEntityId);
      const toEntity = entities.find(e => e.id === relation.toEntityId);

      if (fromEntity && toEntity) {
        if (!adjacencyList.has(fromEntity.id)) {
          adjacencyList.set(fromEntity.id, []);
        }
        adjacencyList.get(fromEntity.id)!.push(toEntity.id);
      }
    }

    // Simple cycle detection using DFS
    const visited = new Set<string>();
    const inPath = new Set<string>();

    const dfs = (nodeId: string, path: string[]): void => {
      if (inPath.has(nodeId)) {
        // Found a cycle
        const cycleStart = path.indexOf(nodeId);
        if (cycleStart >= 0) {
          const cyclePath = path.slice(cycleStart);
          const entity1 = entities.find(e => e.id === cyclePath[0])?.name || 'Unknown';
          const entity2 = entities.find(e => e.id === nodeId)?.name || 'Unknown';
          const pathNames = cyclePath.map(id => entities.find(e => e.id === id)?.name || 'Unknown');

          circularDeps.push({
            entity1,
            entity2,
            path: pathNames.join(' -> ') + ' -> ' + entity2
          });
        }
        return;
      }

      if (visited.has(nodeId)) return;

      visited.add(nodeId);
      inPath.add(nodeId);

      const neighbors = adjacencyList.get(nodeId) || [];
      for (const neighbor of neighbors) {
        dfs(neighbor, [...path, nodeId]);
      }

      inPath.delete(nodeId);
    };

    // Check each entity for cycles
    for (const entity of entities) {
      if (!visited.has(entity.id)) {
        dfs(entity.id, []);
      }
    }

    return circularDeps;
  }

  /**
   * Analyze component complexity
   */
  async analyzeComponentComplexity(componentName: string): Promise<{
    dependencies: number;
    consumers: number;
    stateConnections: number;
    complexity: 'low' | 'medium' | 'high' | 'very-high';
  }> {
    const components = await this.kg.getEntities({ type: 'Component', name: componentName });
    if (components.length === 0) {
      throw new Error(`Component '${componentName}' not found`);
    }

    const component = components[0];
    const relations = await this.kg.getRelations();
    const entities = await this.kg.getEntities();

    // Count dependencies (outgoing relations)
    const dependencies = relations.filter(r =>
      r.fromEntityId === component.id && ['DEPENDS_ON', 'IMPORTS', 'USES'].includes(r.type)
    ).length;

    // Count consumers (incoming relations)
    const consumers = relations.filter(r =>
      r.toEntityId === component.id && ['DEPENDS_ON', 'IMPORTS', 'USES'].includes(r.type)
    ).length;

    // Count state connections (relations to stores)
    const storeIds = entities.filter(e => e.type === 'Store').map(e => e.id);
    const stateConnections = relations.filter(r =>
      r.fromEntityId === component.id && storeIds.includes(r.toEntityId)
    ).length;

    const total = dependencies + consumers + stateConnections;
    let complexity: 'low' | 'medium' | 'high' | 'very-high';

    if (total <= 3) complexity = 'low';
    else if (total <= 6) complexity = 'medium';
    else if (total <= 10) complexity = 'high';
    else complexity = 'very-high';

    return {
      dependencies,
      consumers,
      stateConnections,
      complexity
    };
  }

  /**
   * Find unused entities
   */
  async findUnusedEntities(entityType?: string): Promise<Array<{name: string, location?: string}>> {
    const entities = await this.kg.getEntities(entityType ? { type: entityType } : {});
    const relations = await this.kg.getRelations();

    const referencedEntityIds = new Set<string>();
    const referencingEntityIds = new Set<string>();

    // Collect all referenced and referencing entity IDs
    for (const relation of relations) {
      referencedEntityIds.add(relation.toEntityId);
      if (!['IMPLEMENTS', 'HAS_PHASE'].includes(relation.type)) {
        referencingEntityIds.add(relation.fromEntityId);
      }
    }

    // Find entities that are neither referenced nor referencing others
    const unusedEntities = entities.filter(entity =>
      !referencedEntityIds.has(entity.id) && !referencingEntityIds.has(entity.id)
    );

    return unusedEntities
      .map(entity => ({
        name: entity.name,
        location: entity.data.location
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Find components by pattern
   */
  async findComponentsByPattern(patternName: string): Promise<ComponentInfo[]> {
    // Get pattern entity
    const patterns = await this.kg.getEntities({ type: 'Pattern', name: patternName });
    if (patterns.length === 0) return [];

    const pattern = patterns[0];

    // Get relations from components to this pattern
    const relations = await this.kg.getRelations();
    const implementsRelations = relations.filter(r =>
      r.toEntityId === pattern.id && r.type === 'IMPLEMENTS'
    );

    // Get components that implement this pattern
    const components = await this.kg.getEntities({ type: 'Component' });
    const results: ComponentInfo[] = [];

    for (const relation of implementsRelations) {
      const component = components.find(c => c.id === relation.fromEntityId);
      if (component) {
        results.push({
          name: component.name,
          type: 'Component',
          location: component.data.location || '',
          props: component.data.props || []
        });
      }
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
  }

  /**
   * Analyze state access patterns
   */
  async analyzeStateAccess(storeName: string): Promise<{
    readers: string[];
    writers: string[];
    readWriteRatio: number;
    hotPaths: Array<{action: string, frequency: number}>;
  }> {
    // Get store entity
    const stores = await this.kg.getEntities({ type: 'Store', name: storeName });
    if (stores.length === 0) {
      return { readers: [], writers: [], readWriteRatio: 0, hotPaths: [] };
    }

    const store = stores[0];
    const relations = await this.kg.getRelations();
    const entities = await this.kg.getEntities();

    // Find readers (entities that consume/read the store)
    const readRelations = relations.filter(r =>
      r.toEntityId === store.id && ['CONSUMES', 'READS'].includes(r.type)
    );
    const readers = readRelations
      .map(r => entities.find(e => e.id === r.fromEntityId)?.name)
      .filter(Boolean) as string[];

    // Find writers (actions that mutate the store)
    const writeRelations = relations.filter(r =>
      r.toEntityId === store.id && r.type === 'MUTATES'
    );
    const writers = writeRelations
      .map(r => entities.find(e => e.id === r.fromEntityId && e.type === 'Action')?.name)
      .filter(Boolean) as string[];

    // Calculate hot paths (actions that both mutate and are consumed)
    const actionFrequency = new Map<string, number>();
    const actionEntities = entities.filter(e => e.type === 'Action');

    for (const action of actionEntities) {
      const actionMutatesStore = writeRelations.some(r => r.fromEntityId === action.id);
      if (actionMutatesStore) {
        const componentsUsingStore = readRelations.length;
        actionFrequency.set(action.name, componentsUsingStore);
      }
    }

    const hotPaths = Array.from(actionFrequency.entries())
      .map(([action, frequency]) => ({ action, frequency }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    return {
      readers: [...new Set(readers)],
      writers: [...new Set(writers)],
      readWriteRatio: readers.length / Math.max(writers.length, 1),
      hotPaths
    };
  }

  /**
   * Find potential performance bottlenecks
   */
  async findPerformanceBottlenecks(): Promise<Array<{
    entity: string;
    type: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }>> {
    const results: Array<{
      entity: string;
      type: string;
      issue: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];

    const entities = await this.kg.getEntities();
    const relations = await this.kg.getRelations();

    // Components with too many state dependencies
    const components = entities.filter(e => e.type === 'Component');
    const stores = entities.filter(e => e.type === 'Store');
    const storeIds = new Set(stores.map(s => s.id));

    for (const component of components) {
      const storeConnections = relations.filter(r =>
        r.fromEntityId === component.id && storeIds.has(r.toEntityId)
      ).length;

      if (storeConnections > 3) {
        results.push({
          entity: component.name,
          type: 'Component',
          issue: `Connected to ${storeConnections} stores`,
          severity: storeConnections > 5 ? 'high' : 'medium'
        });
      }
    }

    // Actions that mutate multiple stores
    const actions = entities.filter(e => e.type === 'Action');

    for (const action of actions) {
      const mutatedStores = relations.filter(r =>
        r.fromEntityId === action.id && r.type === 'MUTATES' && storeIds.has(r.toEntityId)
      ).length;

      if (mutatedStores > 2) {
        results.push({
          entity: action.name,
          type: 'Action',
          issue: `Mutates ${mutatedStores} stores`,
          severity: mutatedStores > 3 ? 'high' : 'medium'
        });
      }
    }

    return results;
  }

  /**
   * Generate dependency graph data
   */
  async generateDependencyGraph(rootEntity: string, depth: number = 3): Promise<{
    nodes: Array<{id: string, name: string, type: string}>;
    edges: Array<{from: string, to: string, type: string}>;
  }> {
    const entities = await this.kg.getEntities();
    const relations = await this.kg.getRelations();

    // Find root entity
    const rootEntityObj = entities.find(e => e.name === rootEntity);
    if (!rootEntityObj) {
      return { nodes: [], edges: [] };
    }

    const nodes = new Map<string, {id: string, name: string, type: string}>();
    const edges: Array<{from: string, to: string, type: string}> = [];
    const visited = new Set<string>();

    // Add root node
    nodes.set(rootEntityObj.id, {
      id: rootEntityObj.id,
      name: rootEntityObj.name,
      type: rootEntityObj.type
    });

    // BFS to find connected entities up to specified depth
    const queue: Array<{entityId: string, level: number}> = [{ entityId: rootEntityObj.id, level: 0 }];

    while (queue.length > 0) {
      const { entityId, level } = queue.shift()!;

      if (level >= depth || visited.has(entityId)) continue;
      visited.add(entityId);

      // Find all relations involving this entity
      const entityRelations = relations.filter(r =>
        r.fromEntityId === entityId || r.toEntityId === entityId
      );

      for (const relation of entityRelations) {
        const connectedEntityId = relation.fromEntityId === entityId
          ? relation.toEntityId
          : relation.fromEntityId;

        const connectedEntity = entities.find(e => e.id === connectedEntityId);
        if (connectedEntity && !nodes.has(connectedEntity.id)) {
          nodes.set(connectedEntity.id, {
            id: connectedEntity.id,
            name: connectedEntity.name,
            type: connectedEntity.type
          });

          if (level + 1 < depth) {
            queue.push({ entityId: connectedEntity.id, level: level + 1 });
          }
        }

        // Add edge
        edges.push({
          from: relation.fromEntityId,
          to: relation.toEntityId,
          type: relation.type
        });
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges
    };
  }

  /**
   * Analyze impact with paths - placeholder implementation
   */
  analyzeImpactWithPaths(entityName: string, maxDepth: number = 3): any {
    // TODO: Implement proper impact analysis with paths
    return {
      entity: entityName,
      maxDepth,
      paths: [],
      analysis: 'Not implemented - placeholder'
    };
  }

  /**
   * Get component dependencies - placeholder implementation
   */
  getComponentDependencies(componentName: string): any {
    // TODO: Implement proper component dependency analysis
    return {
      component: componentName,
      dependencies: [],
      dependents: [],
      analysis: 'Not implemented - placeholder'
    };
  }

  /**
   * Analyze state patterns - placeholder implementation
   */
  analyzeStatePatterns(): any {
    // TODO: Implement proper state pattern analysis
    return {
      patterns: [],
      stores: [],
      analysis: 'Not implemented - placeholder'
    };
  }

  /**
   * Generate test scenarios - placeholder implementation
   */
  generateTestScenarios(componentName: string): any {
    // TODO: Implement proper test scenario generation
    return {
      component: componentName,
      scenarios: [],
      analysis: 'Not implemented - placeholder'
    };
  }

  /**
   * Find generation opportunities - placeholder implementation
   */
  findGenerationOpportunities(): any[] {
    // TODO: Implement proper generation opportunity analysis
    return [];
  }

  /**
   * Find similar patterns - placeholder implementation
   */
  findSimilarPatterns(componentName: string): any[] {
    // TODO: Implement proper pattern similarity analysis
    return [];
  }

  /**
   * Validate workflow - placeholder implementation
   */
  validateWorkflow(workflowName: string): { isValid: boolean, errors: string[], warnings?: string[] } {
    // TODO: Implement proper workflow validation
    return {
      isValid: true,
      errors: [],
      warnings: [`Workflow validation not implemented for ${workflowName}`]
    };
  }
}