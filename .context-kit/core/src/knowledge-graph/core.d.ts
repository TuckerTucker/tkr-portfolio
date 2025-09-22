/**
 * Knowledge Graph Core
 * Main KnowledgeGraph class providing unified entity/relation operations with advanced features
 */
import type { DatabaseConnection } from '../database/connection.js';
import type { Entity, Relation, KnowledgeGraphConfig, EntityCreationData, RelationCreationData, KnowledgeGraphStats, GraphTraversalOptions, EntityFilter } from '../types/knowledge-graph.js';
import type { SearchOptions, SearchResult } from '../types/search.js';
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
    mostConnectedEntities: {
        entity: Entity;
        connectionCount: number;
    }[];
    relationTypes: Record<string, number>;
    entityTypes: Record<string, number>;
    orphanedEntities: Entity[];
    cyclicPaths: string[][];
}
export declare class KnowledgeGraph {
    private db;
    private searchEngine;
    private indexer;
    private config;
    constructor(db: DatabaseConnection, config?: KnowledgeGraphConfig);
    /**
     * Create a new entity
     */
    createEntity(data: EntityCreationData): Promise<Entity>;
    /**
     * Get entity by ID
     */
    getEntity(id: string): Promise<Entity | null>;
    /**
     * Update entity
     */
    updateEntity(id: string, updates: Partial<EntityCreationData>): Promise<Entity>;
    /**
     * Delete entity and its relations
     */
    deleteEntity(id: string): Promise<void>;
    /**
     * Get entities with filtering
     */
    getEntities(filter?: EntityFilter, limit?: number, offset?: number): Promise<Entity[]>;
    /**
     * Create a new relation
     */
    createRelation(data: RelationCreationData): Promise<Relation>;
    /**
     * Get relations for an entity
     */
    getEntityRelations(entityId: string, direction?: 'incoming' | 'outgoing' | 'both'): Promise<Relation[]>;
    /**
     * Delete relation
     */
    deleteRelation(id: string): Promise<void>;
    /**
     * Search entities using the unified search engine
     */
    searchEntities(query: string, options?: SearchOptions): SearchResult[];
    /**
     * Get search suggestions
     */
    getSuggestions(partialQuery: string, limit?: number): string[];
    /**
     * Traverse the graph from a starting entity
     */
    traverseGraph(startEntityId: string, options?: GraphTraversalOptions): Promise<TraversalResult>;
    /**
     * Recursive traversal helper
     */
    private traverseRecursive;
    /**
     * Get comprehensive graph analytics
     */
    getAnalytics(): Promise<GraphAnalytics>;
    /**
     * Get basic statistics
     */
    getStats(): Promise<KnowledgeGraphStats>;
    /**
     * Rebuild search index
     */
    rebuildSearchIndex(): Promise<void>;
    /**
     * Optimize the knowledge graph
     */
    optimize(): Promise<void>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        healthy: boolean;
        entityCount: number;
        relationCount: number;
        searchIndexStatus: string;
        lastError: string | null;
    }>;
}
//# sourceMappingURL=core.d.ts.map