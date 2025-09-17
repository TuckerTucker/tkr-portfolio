import { KGDatabaseSimple } from './database-simple.js';
import { nanoid } from 'nanoid';
import { Entity, Relation, Observation, SearchResult } from './types.js';

export interface AppStateKGConfig {
  databasePath: string;
  enableMCP?: boolean;
  projectRoot?: string;
}

export class AppStateKGSimple {
  private db: KGDatabaseSimple;
  public config: AppStateKGConfig;

  constructor(config: AppStateKGConfig) {
    this.config = {
      databasePath: config.databasePath,
      enableMCP: config.enableMCP ?? true
    };

    this.db = new KGDatabaseSimple(this.config.databasePath);
  }

  // Basic Entity Management
  createEntity(type: string, name: string, data: Record<string, any>): Entity {
    const id = `${type.toLowerCase()}_${nanoid(10)}`;
    
    return this.db.transaction(() => {
      this.db.getStatement('createEntity').run(
        id, type, name, JSON.stringify(data)
      );

      return { 
        id, 
        type, 
        name, 
        data,
        created_at: Date.now(),
        updated_at: Date.now(),
        version: 1
      };
    }) as Entity;
  }

  // Basic Relation Management
  createRelation(fromId: string, toId: string, type: string, properties?: Record<string, any>): Relation {
    const id = `rel_${nanoid(10)}`;
    
    return this.db.transaction(() => {
      this.db.getStatement('createRelation').run(
        id, fromId, toId, type, JSON.stringify(properties || {})
      );

      return {
        id,
        from_id: fromId,
        to_id: toId,
        type,
        properties: properties || {},
        created_at: Date.now()
      };
    }) as Relation;
  }

  // Basic Search
  searchEntities(query: string, limit: number = 50): SearchResult[] {
    const results = this.db.getStatement('searchEntities').all(query, limit) as any[];
    return results.map(row => ({
      id: row.id,
      type: row.type,
      name: row.name,
      data: JSON.parse(row.data || '{}'),
      match: row.match || query,
      rank: row.score || 0
    }));
  }

  // Get Statistics
  getStats() {
    return this.db.getStats();
  }

  // Additional methods needed by analyzers
  getEntityByName(type: string, name: string): Entity | null {
    const stmt = this.db.prepare('SELECT * FROM entities WHERE type = ? AND name = ?');
    const result = stmt.get(type, name) as any;
    if (!result) return null;

    return {
      id: result.id,
      type: result.type,
      name: result.name,
      data: JSON.parse(result.data),
      created_at: result.created_at,
      updated_at: result.updated_at,
      version: result.version
    };
  }

  query(sql: string, params: any[] = []): any[] {
    const stmt = this.db.prepare(sql);
    return stmt.all(...params);
  }

  run(sql: string, params: any[] = []): any {
    const stmt = this.db.prepare(sql);
    return stmt.run(...params);
  }

  // Placeholder methods for analyzer compatibility
  findUnusedEntities(entityType: string): Array<{name: string, location?: string}> {
    // TODO: Implement actual unused entity detection
    return [];
  }

  // Additional MCP server methods (placeholders)
  findStateMutations(storeName: string): any[] {
    return [];
  }

  traceWorkflow(workflowName: string): any {
    return { workflow: null, phases: [] };
  }

  traceUserFlow(interaction: string): any {
    return { flow: [], interactions: [] };
  }

  analyzeImpact(entityName: string, changeType?: string): any {
    return { entity: entityName, direct: [], indirect: [] };
  }

  analyzeImpactWithPaths(entityName: string, maxDepth?: number): any {
    return { entity: entityName, impacts: [], paths: [] };
  }

  findSimilarPatterns(componentName: string): any[] {
    return [];
  }

  generateFromPattern(spec: any): any {
    return { code: '', examples: [], rules: [] };
  }

  validateWorkflow(workflowName: string): any {
    return { valid: true, errors: [] };
  }

  search(query: string): any[] {
    return this.searchEntities(query);
  }

  // HTTP API methods
  getAllEntities(): Entity[] {
    const stmt = this.db.prepare('SELECT * FROM entities ORDER BY created_at DESC');
    const results = stmt.all() as any[];
    
    return results.map(row => ({
      id: row.id,
      type: row.type,
      name: row.name,
      data: JSON.parse(row.data || '{}'),
      created_at: row.created_at,
      updated_at: row.updated_at,
      version: row.version
    }));
  }

  getAllRelations(): Relation[] {
    const stmt = this.db.prepare('SELECT * FROM relations ORDER BY created_at DESC');
    const results = stmt.all() as any[];
    
    return results.map(row => ({
      id: row.id,
      from_id: row.from_id,
      to_id: row.to_id,
      type: row.type,
      properties: JSON.parse(row.properties || '{}'),
      created_at: row.created_at
    }));
  }

  getComponentDependencies(componentName: string): any {
    return { component: componentName, dependencies: [], dependents: [] };
  }

  analyzeStatePatterns(): any[] {
    return [];
  }

  generateTestScenarios(componentName: string): any[] {
    return [];
  }

  // Close database connection
  close() {
    this.db.close();
  }
}