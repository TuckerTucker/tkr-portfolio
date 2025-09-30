/**
 * Knowledge Graph Core
 * Main KnowledgeGraph class providing unified entity/relation operations with advanced features
 */

import type { DatabaseConnection } from '../database/connection.js';
import type {
  Entity,
  Relation,
  KnowledgeGraphConfig,
  EntityCreationData,
  RelationCreationData,
  KnowledgeGraphStats,
  GraphTraversalOptions,
  EntityFilter,
  RelationFilter
} from '../types/knowledge-graph.js';
import type { SearchOptions, SearchResult } from '../types/search.js';
import { UnifiedSearchEngine } from '../search/engine.js';
import { SearchIndexer } from '../search/indexer.js';
import { IdGenerator } from '../utils/id-generator.js';
import { knowledgeGraphLogger as logger, timeOperation } from '../utils/logger.js';

// Utility function to handle unknown errors
function ensureError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(String(error));
}

export interface TraversalResult {
  entities: Entity[];
  relations: Relation[];
  depth: number;
  traversalPath: string[];
}

export interface GraphAnalytics {
  entityCount: number;
  relationCount: number;
  averageConnections: number;
  mostConnectedEntities: { entity: Entity; connectionCount: number }[];
  relationTypes: Record<string, number>;
  entityTypes: Record<string, number>;
  orphanedEntities: Entity[];
  cyclicPaths: string[][];
}

export class KnowledgeGraph {
  private db: DatabaseConnection;
  private searchEngine: UnifiedSearchEngine;
  private indexer: SearchIndexer;
  private config: Required<KnowledgeGraphConfig>;

  constructor(
    db: DatabaseConnection,
    config: KnowledgeGraphConfig = {}
  ) {
    this.db = db;
    this.config = {
      databasePath: config.databasePath || '',
      projectRoot: config.projectRoot || process.cwd(),
      analysisPatterns: config.analysisPatterns || ['**/*.{ts,js,tsx,jsx}'],
      enableFullTextSearch: config.enableFullTextSearch ?? true,
      enableMCP: config.enableMCP ?? false,
      maxEntitiesInMemory: config.maxEntitiesInMemory || 10000,
      autoSaveInterval: config.autoSaveInterval || 30000,
      enableVersioning: config.enableVersioning ?? false,
      entityTypes: config.entityTypes || [],
      relationTypes: config.relationTypes || [],
      readonly: config.readonly ?? false,
      timeout: config.timeout || 5000,
      maxConnections: config.maxConnections || 1,
      enableCaching: config.enableCaching ?? true,
      maxCacheSize: config.maxCacheSize || 1000,
      enableIndexing: config.enableIndexing ?? true,
      autoOptimize: config.autoOptimize ?? true,
      traversalMaxDepth: config.traversalMaxDepth || 10,
      analyticsEnabled: config.analyticsEnabled ?? true
    };

    this.searchEngine = new UnifiedSearchEngine(db, {
      maxResults: 1000,
      enableFuzzySearch: true,
      enableRegexSearch: true
    });

    this.indexer = new SearchIndexer(db);

    logger.info('KnowledgeGraph initialized', { config: this.config });
  }

  // ============================================================================
  // ENTITY OPERATIONS
  // ============================================================================

  /**
   * Create a new entity
   */
  async createEntity(data: EntityCreationData): Promise<Entity> {
    const timer = timeOperation('create_entity', logger);

    try {
      const entity: Entity = {
        id: IdGenerator.generateEntityId(),
        type: data.type,
        name: data.name,
        data: data.data || {},
        created_at: Date.now(),
        updated_at: Date.now(),
        version: 1
      };

      // Insert entity
      const stmt = this.db.statements.insertEntity();
      stmt.run(
        entity.id,
        entity.type,
        entity.name,
        JSON.stringify(entity.data),
        entity.created_at,
        entity.updated_at,
        entity.version
      );

      // Update search index if enabled
      if (this.config.enableIndexing) {
        await this.indexer.updateEntityIndex(entity);
      }

      timer.finish({ success: true, entityId: entity.id });
      logger.info('Entity created', { entityId: entity.id, type: entity.type, name: entity.name });

      return entity;
    } catch (error) {
      const err = ensureError(error);
      timer.finish({ success: false, error: err.message });
      logger.error('Failed to create entity', err, { data });
      throw err;
    }
  }

  /**
   * Get entity by ID
   */
  async getEntity(id: string): Promise<Entity | null> {
    try {
      const stmt = this.db.statements.getEntityById();
      const result = stmt.get(id) as any;

      if (!result) {
        return null;
      }

      return {
        id: result.id,
        type: result.type,
        name: result.name,
        data: JSON.parse(result.data || '{}'),
        created_at: result.created_at,
        updated_at: result.updated_at,
        version: result.version
      };
    } catch (error) {
      const err = ensureError(error);
      logger.error('Failed to get entity', err, { entityId: id });
      throw err;
    }
  }

  /**
   * Update entity
   */
  async updateEntity(id: string, updates: Partial<EntityCreationData>): Promise<Entity> {
    const timer = timeOperation('update_entity', logger);

    try {
      const existingEntity = await this.getEntity(id);
      if (!existingEntity) {
        throw new Error(`Entity not found: ${id}`);
      }

      const updatedEntity: Entity = {
        ...existingEntity,
        type: updates.type || existingEntity.type,
        name: updates.name || existingEntity.name,
        data: { ...existingEntity.data, ...(updates.data || {}) },
        updated_at: Date.now(),
        version: existingEntity.version + 1
      };

      // Update entity
      const stmt = this.db.statements.updateEntity();
      stmt.run(
        updatedEntity.type,
        updatedEntity.name,
        JSON.stringify(updatedEntity.data),
        updatedEntity.updated_at,
        updatedEntity.version,
        id
      );

      // Update search index if enabled
      if (this.config.enableIndexing) {
        await this.indexer.updateEntityIndex(updatedEntity);
      }

      timer.finish({ success: true, entityId: id });
      logger.info('Entity updated', { entityId: id, version: updatedEntity.version });

      return updatedEntity;
    } catch (error) {
      const err = ensureError(error);
      timer.finish({ success: false, error: err.message });
      logger.error('Failed to update entity', err, { entityId: id, updates });
      throw err;
    }
  }

  /**
   * Delete entity and its relations
   */
  async deleteEntity(id: string): Promise<void> {
    const timer = timeOperation('delete_entity', logger);

    try {
      await this.db.transaction(() => {
        // Delete entity relations
        this.db.statements.deleteEntityRelations().run(id, id);

        // Delete entity
        const result = this.db.statements.deleteEntity().run(id);

        if (result.changes === 0) {
          throw new Error(`Entity not found: ${id}`);
        }

        // Remove from search index
        if (this.config.enableIndexing) {
          this.indexer.removeEntityIndex(id);
        }
      });

      timer.finish({ success: true, entityId: id });
      logger.info('Entity deleted', { entityId: id });
    } catch (error) {
      const err = ensureError(error);
      timer.finish({ success: false, error: err.message });
      logger.error('Failed to delete entity', err, { entityId: id });
      throw err;
    }
  }

  /**
   * Get entities with filtering
   */
  async getEntities(filter: EntityFilter = {}, limit = 100, offset = 0): Promise<Entity[]> {
    try {
      let sql = 'SELECT * FROM entities WHERE 1=1';
      const params: any[] = [];

      if (filter.type) {
        sql += ' AND type = ?';
        params.push(filter.type);
      }

      if (filter.name) {
        sql += ' AND name LIKE ?';
        params.push(`%${filter.name}%`);
      }

      if (filter.createdAfter) {
        sql += ' AND created_at > ?';
        params.push(filter.createdAfter);
      }

      if (filter.updatedAfter) {
        sql += ' AND updated_at > ?';
        params.push(filter.updatedAfter);
      }

      sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = this.db.query(sql, params);

      return results.map((row: any) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        data: JSON.parse(row.data || '{}'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        version: row.version
      }));
    } catch (error) {
      const err = ensureError(error);
      logger.error('Failed to get entities', err, { filter });
      throw err;
    }
  }

  // ============================================================================
  // RELATION OPERATIONS
  // ============================================================================

  /**
   * Create a new relation
   */
  async createRelation(data: RelationCreationData): Promise<Relation> {
    const timer = timeOperation('create_relation', logger);

    try {
      // Verify entities exist
      const fromEntityId = data.from_id || data.fromEntityId;
      const toEntityId = data.to_id || data.toEntityId;

      const fromEntity = await this.getEntity(fromEntityId);
      const toEntity = await this.getEntity(toEntityId);

      if (!fromEntity) {
        throw new Error(`From entity not found: ${fromEntityId}`);
      }
      if (!toEntity) {
        throw new Error(`To entity not found: ${toEntityId}`);
      }

      const relation: Relation = {
        id: IdGenerator.generateRelationId(),
        type: data.type,
        from_id: fromEntityId,
        to_id: toEntityId,
        fromEntityId: fromEntityId,
        toEntityId: toEntityId,
        properties: data.properties || {},
        created_at: Date.now()
      };

      // Insert relation
      const stmt = this.db.statements.insertRelation();
      stmt.run(
        relation.id,
        relation.from_id,
        relation.to_id,
        relation.type,
        JSON.stringify(relation.properties)
      );

      timer.finish({ success: true, relationId: relation.id });
      logger.info('Relation created', {
        relationId: relation.id,
        type: relation.type,
        from: fromEntityId,
        to: toEntityId
      });

      return relation;
    } catch (error) {
      const err = ensureError(error);
      timer.finish({ success: false, error: err.message });
      logger.error('Failed to create relation', err, { data });
      throw err;
    }
  }

  /**
   * Get all relations with filtering
   */
  async getRelations(filter: RelationFilter = {}, limit = 100, offset = 0): Promise<Relation[]> {
    try {
      let sql = 'SELECT * FROM relations WHERE 1=1';
      const params: any[] = [];

      if (filter.type) {
        sql += ' AND type = ?';
        params.push(filter.type);
      }

      if (filter.fromEntityId) {
        sql += ' AND from_id = ?';
        params.push(filter.fromEntityId);
      }

      if (filter.toEntityId) {
        sql += ' AND to_id = ?';
        params.push(filter.toEntityId);
      }

      if (filter.createdAfter) {
        sql += ' AND created_at > ?';
        params.push(filter.createdAfter);
      }

      sql += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const results = this.db.query(sql, params);

      return results.map((row: any) => ({
        id: row.id,
        type: row.type,
        from_id: row.from_id,
        to_id: row.to_id,
        fromEntityId: row.from_id,
        toEntityId: row.to_id,
        properties: JSON.parse(row.properties || '{}'),
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      const err = ensureError(error);
      logger.error('Failed to get relations', err, { filter });
      throw err;
    }
  }

  /**
   * Get relations for an entity
   */
  async getEntityRelations(
    entityId: string,
    direction: 'incoming' | 'outgoing' | 'both' = 'both'
  ): Promise<Relation[]> {
    try {
      let sql: string;
      let params: string[];

      switch (direction) {
        case 'incoming':
          sql = 'SELECT * FROM relations WHERE to_id = ? ORDER BY created_at DESC';
          params = [entityId];
          break;
        case 'outgoing':
          sql = 'SELECT * FROM relations WHERE from_id = ? ORDER BY created_at DESC';
          params = [entityId];
          break;
        case 'both':
          sql = 'SELECT * FROM relations WHERE from_id = ? OR to_id = ? ORDER BY created_at DESC';
          params = [entityId, entityId];
          break;
      }

      const results = this.db.query(sql, params);

      return results.map((row: any) => ({
        id: row.id,
        type: row.type,
        from_id: row.from_id,
        to_id: row.to_id,
        fromEntityId: row.from_id,
        toEntityId: row.to_id,
        properties: JSON.parse(row.properties || '{}'),
        created_at: row.created_at,
        updated_at: row.updated_at
      }));
    } catch (error) {
      const err = ensureError(error);
      logger.error('Failed to get entity relations', err, { entityId, direction });
      throw err;
    }
  }

  /**
   * Delete relation
   */
  async deleteRelation(id: string): Promise<void> {
    try {
      const result = this.db.statements.deleteRelation().run(id);

      if (result.changes === 0) {
        throw new Error(`Relation not found: ${id}`);
      }

      logger.info('Relation deleted', { relationId: id });
    } catch (error) {
      logger.error('Failed to delete relation', error, { relationId: id });
      throw error;
    }
  }

  // ============================================================================
  // SEARCH OPERATIONS
  // ============================================================================

  /**
   * Search entities using the unified search engine
   */
  searchEntities(query: string, options: SearchOptions = {}): SearchResult[] {
    try {
      return this.searchEngine.search(query, options);
    } catch (error) {
      logger.error('Entity search failed', error, { query, options });
      throw error;
    }
  }

  /**
   * Get search suggestions
   */
  getSuggestions(partialQuery: string, limit = 10): string[] {
    try {
      // Use prefix search for suggestions
      const results = this.searchEngine.search(`${partialQuery}*`, { limit });
      return results.map(r => r.original_name).slice(0, limit);
    } catch (error) {
      logger.error('Failed to get search suggestions', error, { partialQuery });
      return [];
    }
  }

  // ============================================================================
  // GRAPH TRAVERSAL
  // ============================================================================

  /**
   * Traverse the graph from a starting entity
   */
  async traverseGraph(
    startEntityId: string,
    options: GraphTraversalOptions = {}
  ): Promise<TraversalResult> {
    const timer = timeOperation('graph_traversal', logger);

    try {
      const maxDepth = options.maxDepth || this.config.traversalMaxDepth;
      const relationTypes = options.relationTypes;
      const direction = options.direction || 'both';

      const visited = new Set<string>();
      const entities: Entity[] = [];
      const relations: Relation[] = [];
      const traversalPath: string[] = [];

      await this.traverseRecursive(
        startEntityId,
        0,
        maxDepth,
        direction,
        relationTypes,
        visited,
        entities,
        relations,
        traversalPath
      );

      const result: TraversalResult = {
        entities,
        relations,
        depth: Math.max(...traversalPath.map(p => p.split('->').length - 1), 0),
        traversalPath
      };

      timer.finish({
        success: true,
        entityCount: entities.length,
        relationCount: relations.length,
        maxDepth: result.depth
      });

      return result;
    } catch (error) {
      timer.finish({ success: false, error: error.message });
      logger.error('Graph traversal failed', error, { startEntityId, options });
      throw error;
    }
  }

  /**
   * Recursive traversal helper
   */
  private async traverseRecursive(
    entityId: string,
    currentDepth: number,
    maxDepth: number,
    direction: 'incoming' | 'outgoing' | 'both',
    relationTypes: string[] | undefined,
    visited: Set<string>,
    entities: Entity[],
    relations: Relation[],
    traversalPath: string[]
  ): Promise<void> {
    if (currentDepth >= maxDepth || visited.has(entityId)) {
      return;
    }

    visited.add(entityId);

    // Get the entity
    const entity = await this.getEntity(entityId);
    if (entity) {
      entities.push(entity);
      traversalPath.push(entityId);
    }

    // Get relations
    const entityRelations = await this.getEntityRelations(entityId, direction);

    for (const relation of entityRelations) {
      // Filter by relation types if specified
      if (relationTypes && !relationTypes.includes(relation.type)) {
        continue;
      }

      relations.push(relation);

      // Continue traversal to connected entities
      const nextEntityId = relation.from_id === entityId
        ? relation.to_id
        : relation.from_id;

      await this.traverseRecursive(
        nextEntityId,
        currentDepth + 1,
        maxDepth,
        direction,
        relationTypes,
        visited,
        entities,
        relations,
        traversalPath
      );
    }
  }

  // ============================================================================
  // ANALYTICS AND STATISTICS
  // ============================================================================

  /**
   * Get comprehensive graph analytics
   */
  async getAnalytics(): Promise<GraphAnalytics> {
    const timer = timeOperation('graph_analytics', logger);

    try {
      // Basic counts
      const entityCount = this.db.queryOne('SELECT COUNT(*) as count FROM entities')?.count || 0;
      const relationCount = this.db.queryOne('SELECT COUNT(*) as count FROM relations')?.count || 0;

      // Entity types distribution
      const entityTypeResults = this.db.query(`
        SELECT type, COUNT(*) as count
        FROM entities
        GROUP BY type
        ORDER BY count DESC
      `);
      const entityTypes: Record<string, number> = {};
      for (const row of entityTypeResults) {
        entityTypes[row.type] = row.count;
      }

      // Relation types distribution
      const relationTypeResults = this.db.query(`
        SELECT type, COUNT(*) as count
        FROM relations
        GROUP BY type
        ORDER BY count DESC
      `);
      const relationTypes: Record<string, number> = {};
      for (const row of relationTypeResults) {
        relationTypes[row.type] = row.count;
      }

      // Most connected entities
      const connectionResults = this.db.query(`
        SELECT
          e.id,
          e.type,
          e.name,
          COUNT(r.id) as connection_count
        FROM entities e
        LEFT JOIN relations r ON (e.id = r.from_id OR e.id = r.to_id)
        GROUP BY e.id, e.type, e.name
        ORDER BY connection_count DESC
        LIMIT 10
      `);

      const mostConnectedEntities = [];
      for (const row of connectionResults) {
        const entity = await this.getEntity(row.id);
        if (entity) {
          mostConnectedEntities.push({
            entity,
            connectionCount: row.connection_count
          });
        }
      }

      // Orphaned entities (no relations)
      const orphanedResults = this.db.query(`
        SELECT e.*
        FROM entities e
        LEFT JOIN relations r ON (e.id = r.from_id OR e.id = r.to_id)
        WHERE r.id IS NULL
        ORDER BY e.created_at DESC
        LIMIT 100
      `);

      const orphanedEntities = orphanedResults.map((row: any) => ({
        id: row.id,
        type: row.type,
        name: row.name,
        data: JSON.parse(row.data || '{}'),
        created_at: row.created_at,
        updated_at: row.updated_at,
        version: row.version
      }));

      // Calculate average connections
      const averageConnections = entityCount > 0 ? (relationCount * 2) / entityCount : 0;

      // Detect cycles (simplified - just check for bidirectional relations)
      const cyclicResults = this.db.query(`
        SELECT
          r1.from_id as entity1,
          r1.to_id as entity2
        FROM relations r1
        JOIN relations r2 ON (
          r1.from_id = r2.to_id AND
          r1.to_id = r2.from_id AND
          r1.id < r2.id
        )
        LIMIT 50
      `);

      const cyclicPaths = cyclicResults.map((row: any) => [row.entity1, row.entity2]);

      const analytics: GraphAnalytics = {
        entityCount,
        relationCount,
        averageConnections,
        mostConnectedEntities,
        relationTypes,
        entityTypes,
        orphanedEntities,
        cyclicPaths
      };

      timer.finish({ success: true, entityCount, relationCount });

      return analytics;
    } catch (error) {
      timer.finish({ success: false, error: error.message });
      logger.error('Failed to generate graph analytics', error);
      throw error;
    }
  }

  /**
   * Get basic statistics
   */
  async getStats(): Promise<KnowledgeGraphStats> {
    try {
      const stats = this.db.statements.getKnowledgeGraphStats().get() as {
        entity_count: number;
        relation_count: number;
        index_size: number;
        avg_entity_connections: number;
      };

      return {
        entityCount: stats.entity_count,
        relationCount: stats.relation_count,
        searchIndexSize: stats.index_size,
        averageEntityConnections: stats.avg_entity_connections,
        entitiesByType: {},
        relationsByType: {},
        databaseSize: 0,
        lastAnalysis: Date.now()
      };
    } catch (error) {
      logger.error('Failed to get knowledge graph stats', error);
      throw error;
    }
  }

  // ============================================================================
  // MAINTENANCE OPERATIONS
  // ============================================================================

  /**
   * Rebuild search index
   */
  async rebuildSearchIndex(): Promise<void> {
    if (!this.config.enableIndexing) {
      logger.warn('Search indexing is disabled');
      return;
    }

    try {
      await this.indexer.rebuildIndex();
      logger.info('Search index rebuilt successfully');
    } catch (error) {
      logger.error('Failed to rebuild search index', error);
      throw error;
    }
  }

  /**
   * Optimize the knowledge graph
   */
  async optimize(): Promise<void> {
    const timer = timeOperation('knowledge_graph_optimize', logger);

    try {
      // Optimize database
      await this.db.optimize();

      // Optimize search index if enabled
      if (this.config.enableIndexing) {
        await this.indexer.optimizeIndex();
      }

      timer.finish({ success: true });
      logger.info('Knowledge graph optimized successfully');
    } catch (error) {
      timer.finish({ success: false, error: error.message });
      logger.error('Failed to optimize knowledge graph', error);
      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    entityCount: number;
    relationCount: number;
    searchIndexStatus: string;
    lastError: string | null;
  }> {
    try {
      const stats = await this.getStats();
      const searchIndexStats = this.indexer.getIndexStats();

      return {
        healthy: true,
        entityCount: stats.entityCount,
        relationCount: stats.relationCount,
        searchIndexStatus: `${searchIndexStats.totalEntries} entries`,
        lastError: null
      };
    } catch (error) {
      return {
        healthy: false,
        entityCount: 0,
        relationCount: 0,
        searchIndexStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}