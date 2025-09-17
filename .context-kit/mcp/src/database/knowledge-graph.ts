import { nanoid } from 'nanoid';
import { KGDatabase } from './database.js';
import { DomainQueries } from '../queries/domain-queries.js';
import {
  Entity,
  Relation,
  Observation,
  SearchResult,
  StateMutation,
  WorkflowTrace,
  Impact,
  GenerationSpec,
  GeneratedCode,
  QueryOptions,
  KnowledgeGraphConfig
} from './types.js';

export class AppStateKG {
  private db: KGDatabase;
  private config: KnowledgeGraphConfig;
  private domainQueries: DomainQueries;

  constructor(config: Partial<KnowledgeGraphConfig> = {}) {
    this.config = {
      databasePath: config.databasePath || 'appstate.db',
      projectRoot: config.projectRoot || process.cwd(),
      analysisPatterns: config.analysisPatterns || ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
      enableFullTextSearch: config.enableFullTextSearch ?? true,
      enableMCP: config.enableMCP ?? true
    };

    this.db = new KGDatabase(this.config.databasePath);
    this.domainQueries = new DomainQueries(this);
  }

  // Entity Management

  createEntity(type: string, name: string, data: Record<string, any>): Entity {
    const id = `${type.toLowerCase()}_${nanoid(10)}`;
    
    return this.db.transaction(() => {
      // Create entity
      this.db.getStatement('createEntity').run(
        id, type, name, JSON.stringify(data)
      );

      // Extract and store observations
      if (data.observations) {
        this.addObservationsToEntity(id, data.observations);
      }

      return { 
        id, 
        type, 
        name, 
        data,
        created_at: Date.now(),
        updated_at: Date.now(),
        version: 1
      };
    });
  }

  updateEntity(id: string, name: string, data: Record<string, any>): Entity {
    return this.db.transaction(() => {
      this.db.getStatement('updateEntity').run(name, JSON.stringify(data), id);
      
      // Update observations
      if (data.observations) {
        this.db.getStatement('deleteObservations').run(id);
        this.addObservationsToEntity(id, data.observations);
      }

      const entity = this.getEntity(id);
      if (!entity) {
        throw new Error(`Entity ${id} not found after update`);
      }
      return entity;
    });
  }

  getEntity(id: string): Entity | null {
    const result = this.db.getStatement('getEntity').get(id) as any;
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

  getEntityByName(type: string, name: string): Entity | null {
    const result = this.db.getStatement('getEntityByName').get(type, name) as any;
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

  deleteEntity(id: string): boolean {
    const result = this.db.getStatement('deleteEntity').run(id);
    return result.changes > 0;
  }

  // Relation Management

  createRelation(fromId: string, toId: string, type: string, properties: Record<string, any> = {}): Relation {
    const id = `rel_${nanoid(10)}`;
    
    this.db.getStatement('createRelation').run(
      id, fromId, toId, type, JSON.stringify(properties)
    );

    return { id, from_id: fromId, to_id: toId, type, properties };
  }

  deleteRelation(id: string): boolean {
    const result = this.db.getStatement('deleteRelation').run(id);
    return result.changes > 0;
  }

  getRelationsByEntity(entityId: string): Relation[] {
    const results = this.db.getStatement('getRelationsByEntity').all(entityId, entityId) as any[];
    return results.map(r => ({
      id: r.id,
      from_id: r.from_id,
      to_id: r.to_id,
      type: r.type,
      properties: r.properties ? JSON.parse(r.properties) : {},
      created_at: r.created_at
    }));
  }

  // Observation Management

  private addObservationsToEntity(entityId: string, observations: any[]): void {
    const stmt = this.db.getStatement('addObservation');
    
    for (const obs of observations) {
      if (typeof obs === 'string') {
        stmt.run(entityId, 'observation', obs);
      } else if (typeof obs === 'object') {
        for (const [key, value] of Object.entries(obs)) {
          stmt.run(entityId, key, String(value));
        }
      }
    }
  }

  addObservation(entityId: string, key: string, value: string): void {
    this.db.getStatement('addObservation').run(entityId, key, value);
  }

  getObservations(entityId: string): Observation[] {
    return this.db.getStatement('getObservations').all(entityId) as Observation[];
  }

  // Domain-Specific Query Methods (delegated to DomainQueries)

  findStateMutations(storeName: string): StateMutation[] {
    // TODO: Implement domain queries properly
    return [];
  }

  traceWorkflow(workflowName: string): WorkflowTrace {
    const results = this.db.getStatement('traceWorkflow').all(workflowName) as any[];
    
    // Transform flat results into hierarchical structure
    const workflow = results.find(r => r.depth === 0);
    if (!workflow) {
      throw new Error(`Workflow '${workflowName}' not found`);
    }

    const phases = results.filter(r => r.depth === 1 && r.type === 'Phase');
    
    return {
      workflow: JSON.parse(workflow.data),
      phases: phases.map(p => ({
        name: p.name,
        data: JSON.parse(p.data),
        actions: results.filter(r => 
          r.path.includes(p.id) && r.type === 'Action'
        ).map(a => JSON.parse(a.data))
      }))
    };
  }

  analyzeImpact(entityName: string, changeType: string = 'modify'): Impact {
    const directImpacts = this.db.getStatement('analyzeImpact').all(entityName) as any[];
    const indirectImpacts = this.db.getStatement('analyzeIndirectImpact').all(entityName) as any[];
    
    return {
      entity: entityName,
      changeType,
      direct: directImpacts,
      indirect: indirectImpacts,
      severity: this.calculateImpactSeverity(directImpacts, indirectImpacts)
    };
  }

  private calculateImpactSeverity(direct: any[], indirect: any[]): 'low' | 'medium' | 'high' | 'critical' {
    const totalImpacts = direct.length + indirect.length;
    const criticalTypes = ['Store', 'Workflow', 'API'];
    const hasCriticalImpact = [...direct, ...indirect].some(impact => 
      criticalTypes.includes(impact.entity_type || impact.type)
    );

    if (hasCriticalImpact || totalImpacts > 10) return 'critical';
    if (totalImpacts > 5) return 'high';
    if (totalImpacts > 2) return 'medium';
    return 'low';
  }

  // Additional domain queries exposed from DomainQueries
  traceUserFlow(interaction: string): any {
    return this.domainQueries.traceUserFlow(interaction);
  }

  analyzeImpactWithPaths(entityName: string, maxDepth: number = 3): any {
    return this.domainQueries.analyzeImpactWithPaths(entityName, maxDepth);
  }

  findUnusedEntities(): Array<{name: string, location?: string}> {
    return this.domainQueries.findUnusedEntities();
  }

  getComponentDependencies(componentName: string): any {
    return this.domainQueries.getComponentDependencies(componentName);
  }

  analyzeStatePatterns(): any {
    return this.domainQueries.analyzeStatePatterns();
  }

  generateTestScenarios(componentName: string): any {
    return this.domainQueries.generateTestScenarios(componentName);
  }

  findGenerationOpportunities(): any[] {
    return this.domainQueries.findGenerationOpportunities();
  }

  // Search and Query

  search(query: string, limit: number = 20): SearchResult[] {
    if (!this.config.enableFullTextSearch) {
      throw new Error('Full-text search is disabled');
    }

    return this.db.getStatement('searchEntities').all(query, limit).map((result: any) => ({
      id: result.id,
      type: result.type,
      name: result.name,
      data: JSON.parse(result.data),
      match: result.match
    }));
  }

  query(sql: string, params: any[] = []): any[] {
    return this.db.query(sql, params);
  }

  // Pattern-based Code Generation

  async generateFromPattern(spec: GenerationSpec): Promise<GeneratedCode> {
    // Find similar implementations
    const similar = this.query(`
      SELECT e.*, 
        GROUP_CONCAT(o.key || ':' || o.value, '; ') as observations
      FROM entities e
      LEFT JOIN observations o ON e.id = o.entity_id
      WHERE e.type = ? 
        AND EXISTS (
          SELECT 1 FROM relations r
          WHERE r.from_id = e.id 
            AND r.type = 'IMPLEMENTS'
            AND r.to_id IN (
              SELECT id FROM entities WHERE name = ?
            )
        )
      GROUP BY e.id
      LIMIT 5
    `, [spec.entityType, spec.pattern]);

    // Get pattern template
    const patternResult = this.db.query(`
      SELECT data->>'$.template' as template,
             data->>'$.rules' as rules
      FROM entities 
      WHERE type = 'Pattern' AND name = ?
    `, [spec.pattern])[0];

    if (!patternResult) {
      throw new Error(`Pattern '${spec.pattern}' not found`);
    }

    return {
      code: this.applyTemplate(patternResult.template, spec),
      examples: similar,
      rules: JSON.parse(patternResult.rules || '[]')
    };
  }

  private applyTemplate(template: string, spec: GenerationSpec): string {
    let code = template;
    
    // Replace template variables
    for (const [key, value] of Object.entries(spec)) {
      code = code.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }

    return code;
  }

  // Utility Methods

  getStats() {
    return this.db.getStats();
  }

  backup(backupPath: string): Promise<void> {
    return this.db.backup(backupPath);
  }

  close(): void {
    this.db.close();
  }

  // Batch Operations

  createEntities(entities: Array<{type: string, name: string, data: Record<string, any>}>): Entity[] {
    return this.db.transaction(() => {
      return entities.map(entity => this.createEntity(entity.type, entity.name, entity.data));
    });
  }

  createRelations(relations: Array<{fromId: string, toId: string, type: string, properties?: Record<string, any>}>): Relation[] {
    return this.db.transaction(() => {
      return relations.map(rel => this.createRelation(rel.fromId, rel.toId, rel.type, rel.properties));
    });
  }

  // Advanced Queries

  findSimilarPatterns(componentName: string): any[] {
    return this.domainQueries.findSimilarPatterns(componentName);
  }

  validateWorkflow(workflowName: string): { isValid: boolean, errors: string[], warnings?: string[] } {
    return this.domainQueries.validateWorkflow(workflowName);
  }
}