import { AppStateKG } from '../core/knowledge-graph.js';
import {
  StateMutation,
  WorkflowTrace,
  Impact,
  ComponentInfo,
  SearchResult
} from '../core/types.js';

export class DomainQueries {
  constructor(private kg: AppStateKG) {}

  /**
   * Find all components that consume a specific store
   */
  findComponentsByStore(storeName: string): ComponentInfo[] {
    return this.kg.query(`
      SELECT 
        c.id,
        c.name,
        c.data,
        r.properties->>'$.methods' as methods_used
      FROM entities s
      JOIN relations r ON s.id = r.to_id AND r.type IN ('USES', 'CONSUMES')
      JOIN entities c ON r.from_id = c.id AND c.type = 'Component'
      WHERE s.type = 'Store' AND s.name = ?
      ORDER BY c.name
    `, [storeName]).map(row => ({
      name: row.name,
      type: 'Component',
      location: JSON.parse(row.data).location || '',
      dependencies: row.methods_used ? JSON.parse(row.methods_used) : []
    }));
  }

  /**
   * Find all stores mutated by a specific action
   */
  findStoresByAction(actionName: string): Array<{store: string, changes: string[]}> {
    return this.kg.query(`
      SELECT 
        s.name as store,
        r.properties->>'$.changes' as changes
      FROM entities a
      JOIN relations r ON a.id = r.from_id AND r.type = 'MUTATES'
      JOIN entities s ON r.to_id = s.id AND s.type = 'Store'
      WHERE a.type = 'Action' AND a.name = ?
    `, [actionName]).map(row => ({
      store: row.store,
      changes: row.changes ? row.changes.split(',').map((s: string) => s.trim()) : []
    }));
  }

  /**
   * Trace user interaction flow
   */
  traceUserFlow(interactionName: string): Array<{
    step: number;
    entity: string;
    type: string;
    description: string;
  }> {
    return this.kg.query(`
      WITH RECURSIVE flow AS (
        -- Start with user interaction
        SELECT 
          e.id,
          e.name,
          e.type,
          e.data,
          1 as step,
          e.id as path
        FROM entities e
        WHERE e.type = 'UserInteraction' AND e.name = ?
        
        UNION ALL
        
        -- Follow TRIGGERS and MUTATES relations
        SELECT 
          e2.id,
          e2.name,
          e2.type,
          e2.data,
          f.step + 1,
          f.path || ' -> ' || e2.id
        FROM flow f
        JOIN relations r ON f.id = r.from_id
        JOIN entities e2 ON r.to_id = e2.id
        WHERE f.step < 20
          AND r.type IN ('TRIGGERS', 'MUTATES', 'CALLS', 'UPDATES')
      )
      SELECT 
        step,
        name as entity,
        type,
        data->>'$.description' as description
      FROM flow
      ORDER BY step
    `, [interactionName]);
  }

  /**
   * Find circular dependencies
   */
  findCircularDependencies(): Array<{
    entity1: string;
    entity2: string;
    path: string;
  }> {
    return this.kg.query(`
      WITH RECURSIVE dependency_path AS (
        SELECT 
          e1.id as start_id,
          e1.name as start_name,
          e2.id as current_id,
          e2.name as current_name,
          e1.id || ' -> ' || e2.id as path,
          1 as depth
        FROM entities e1
        JOIN relations r ON e1.id = r.from_id
        JOIN entities e2 ON r.to_id = e2.id
        WHERE r.type IN ('DEPENDS_ON', 'IMPORTS', 'USES')
        
        UNION ALL
        
        SELECT
          dp.start_id,
          dp.start_name,
          e2.id,
          e2.name,
          dp.path || ' -> ' || e2.id,
          dp.depth + 1
        FROM dependency_path dp
        JOIN relations r ON dp.current_id = r.from_id
        JOIN entities e2 ON r.to_id = e2.id
        WHERE dp.depth < 10
          AND r.type IN ('DEPENDS_ON', 'IMPORTS', 'USES')
      )
      SELECT DISTINCT
        start_name as entity1,
        current_name as entity2,
        path
      FROM dependency_path
      WHERE start_id = current_id AND depth > 1
      ORDER BY depth
    `);
  }

  /**
   * Analyze component complexity
   */
  analyzeComponentComplexity(componentName: string): {
    dependencies: number;
    consumers: number;
    stateConnections: number;
    complexity: 'low' | 'medium' | 'high' | 'very-high';
  } {
    const component = this.kg.getEntityByName('Component', componentName);
    if (!component) {
      throw new Error(`Component '${componentName}' not found`);
    }

    const dependencies = this.kg.query(`
      SELECT COUNT(*) as count
      FROM relations r
      WHERE r.from_id = ? AND r.type IN ('DEPENDS_ON', 'IMPORTS', 'USES')
    `, [component.id])[0].count;

    const consumers = this.kg.query(`
      SELECT COUNT(*) as count
      FROM relations r
      WHERE r.to_id = ? AND r.type IN ('DEPENDS_ON', 'IMPORTS', 'USES')
    `, [component.id])[0].count;

    const stateConnections = this.kg.query(`
      SELECT COUNT(DISTINCT r.to_id) as count
      FROM relations r
      JOIN entities e ON r.to_id = e.id
      WHERE r.from_id = ? AND e.type = 'Store'
    `, [component.id])[0].count;

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
  findUnusedEntities(entityType?: string): Array<{name: string, location?: string}> {
    return this.kg.query(`
      SELECT 
        e.name,
        e.data->>'$.location' as location
      FROM entities e
      WHERE (? IS NULL OR e.type = ?)
        AND NOT EXISTS (
          SELECT 1 FROM relations r
          WHERE r.to_id = e.id
        )
        AND NOT EXISTS (
          SELECT 1 FROM relations r2
          WHERE r2.from_id = e.id AND r2.type NOT IN ('IMPLEMENTS', 'HAS_PHASE')
        )
      ORDER BY e.name
    `, [entityType, entityType]);
  }

  /**
   * Find components by pattern
   */
  findComponentsByPattern(patternName: string): ComponentInfo[] {
    return this.kg.query(`
      SELECT 
        c.name,
        c.data,
        p.name as pattern
      FROM entities p
      JOIN relations r ON p.id = r.to_id AND r.type = 'IMPLEMENTS'
      JOIN entities c ON r.from_id = c.id AND c.type = 'Component'
      WHERE p.type = 'Pattern' AND p.name = ?
      ORDER BY c.name
    `, [patternName]).map(row => ({
      name: row.name,
      type: 'Component',
      location: JSON.parse(row.data).location || '',
      props: JSON.parse(row.data).props || []
    }));
  }

  /**
   * Analyze state access patterns
   */
  analyzeStateAccess(storeName: string): {
    readers: string[];
    writers: string[];
    readWriteRatio: number;
    hotPaths: Array<{action: string, frequency: number}>;
  } {
    const readers = this.kg.query(`
      SELECT DISTINCT e.name
      FROM entities s
      JOIN relations r ON s.id = r.to_id AND r.type IN ('CONSUMES', 'READS')
      JOIN entities e ON r.from_id = e.id
      WHERE s.type = 'Store' AND s.name = ?
    `, [storeName]).map(r => r.name);

    const writers = this.kg.query(`
      SELECT DISTINCT e.name
      FROM entities s
      JOIN relations r ON s.id = r.to_id AND r.type = 'MUTATES'
      JOIN entities e ON r.from_id = e.id AND e.type = 'Action'
      WHERE s.type = 'Store' AND s.name = ?
    `, [storeName]).map(r => r.name);

    const hotPaths = this.kg.query(`
      SELECT 
        a.name as action,
        COUNT(DISTINCT c.id) as frequency
      FROM entities s
      JOIN relations r1 ON s.id = r1.to_id AND r1.type = 'MUTATES'
      JOIN entities a ON r1.from_id = a.id AND a.type = 'Action'
      JOIN relations r2 ON s.id = r2.to_id AND r2.type IN ('CONSUMES', 'READS')
      JOIN entities c ON r2.from_id = c.id AND c.type = 'Component'
      WHERE s.type = 'Store' AND s.name = ?
      GROUP BY a.id, a.name
      ORDER BY frequency DESC
      LIMIT 5
    `, [storeName]);

    return {
      readers,
      writers,
      readWriteRatio: readers.length / Math.max(writers.length, 1),
      hotPaths
    };
  }

  /**
   * Find potential performance bottlenecks
   */
  findPerformanceBottlenecks(): Array<{
    entity: string;
    type: string;
    issue: string;
    severity: 'low' | 'medium' | 'high';
  }> {
    const results: any[] = [];

    // Components with too many state dependencies
    const heavyComponents = this.kg.query(`
      SELECT 
        c.name,
        COUNT(DISTINCT s.id) as store_count
      FROM entities c
      JOIN relations r ON c.id = r.from_id
      JOIN entities s ON r.to_id = s.id AND s.type = 'Store'
      WHERE c.type = 'Component'
      GROUP BY c.id, c.name
      HAVING store_count > 3
    `);

    heavyComponents.forEach(comp => {
      results.push({
        entity: comp.name,
        type: 'Component',
        issue: `Connected to ${comp.store_count} stores`,
        severity: comp.store_count > 5 ? 'high' : 'medium'
      });
    });

    // Actions that mutate multiple stores
    const heavyActions = this.kg.query(`
      SELECT 
        a.name,
        COUNT(DISTINCT s.id) as store_count
      FROM entities a
      JOIN relations r ON a.id = r.from_id AND r.type = 'MUTATES'
      JOIN entities s ON r.to_id = s.id AND s.type = 'Store'
      WHERE a.type = 'Action'
      GROUP BY a.id, a.name
      HAVING store_count > 2
    `);

    heavyActions.forEach(action => {
      results.push({
        entity: action.name,
        type: 'Action',
        issue: `Mutates ${action.store_count} stores`,
        severity: action.store_count > 3 ? 'high' : 'medium'
      });
    });

    return results;
  }

  /**
   * Generate dependency graph data
   */
  generateDependencyGraph(rootEntity: string, depth: number = 3): {
    nodes: Array<{id: string, name: string, type: string}>;
    edges: Array<{from: string, to: string, type: string}>;
  } {
    const nodes = new Map<string, any>();
    const edges: any[] = [];

    const dependencies = this.kg.query(`
      WITH RECURSIVE dep_graph AS (
        SELECT 
          e.id,
          e.name,
          e.type,
          0 as level
        FROM entities e
        WHERE e.name = ?
        
        UNION ALL
        
        SELECT 
          e2.id,
          e2.name,
          e2.type,
          dg.level + 1
        FROM dep_graph dg
        JOIN relations r ON dg.id = r.from_id OR dg.id = r.to_id
        JOIN entities e2 ON 
          CASE 
            WHEN r.from_id = dg.id THEN r.to_id = e2.id
            ELSE r.from_id = e2.id
          END
        WHERE dg.level < ?
      )
      SELECT DISTINCT * FROM dep_graph
    `, [rootEntity, depth]);

    // Add nodes
    dependencies.forEach(dep => {
      nodes.set(dep.id, {
        id: dep.id,
        name: dep.name,
        type: dep.type
      });
    });

    // Add edges
    const nodeIds = Array.from(nodes.keys());
    const relations = this.kg.query(`
      SELECT 
        r.from_id,
        r.to_id,
        r.type
      FROM relations r
      WHERE r.from_id IN (${nodeIds.map(() => '?').join(',')})
        AND r.to_id IN (${nodeIds.map(() => '?').join(',')})
    `, [...nodeIds, ...nodeIds]);

    relations.forEach(rel => {
      edges.push({
        from: rel.from_id,
        to: rel.to_id,
        type: rel.type
      });
    });

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