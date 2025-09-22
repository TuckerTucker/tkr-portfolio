/**
 * Knowledge Graph Core Types
 * Defines all interfaces for entities, relations, and knowledge graph operations
 */
export interface Entity {
    id: string;
    type: string;
    name: string;
    data: Record<string, any>;
    created_at: number;
    updated_at: number;
    version: number;
}
export interface Relation {
    id: string;
    from_id: string;
    to_id: string;
    fromEntityId?: string;
    toEntityId?: string;
    type: string;
    properties: Record<string, any>;
    created_at: number;
    updated_at: number;
}
export interface KnowledgeGraphConfig {
    databasePath?: string;
    readonly?: boolean;
    timeout?: number;
    maxConnections?: number;
    enableCaching?: boolean;
    maxCacheSize?: number;
    enableIndexing?: boolean;
    autoOptimize?: boolean;
    traversalMaxDepth?: number;
    analyticsEnabled?: boolean;
}
export interface KnowledgeGraphStats {
    entityCount: number;
    relationCount: number;
    searchIndexSize: number;
    averageEntityConnections: number;
    lastUpdated: number;
    entities?: number;
    relations?: number;
    observations?: number;
    entityTypes?: Record<string, number>;
    relationTypes?: Record<string, number>;
}
export interface CreateEntityOptions {
    skipIndexUpdate?: boolean;
    validate?: boolean;
}
export interface CreateRelationOptions {
    validate?: boolean;
    allowDuplicates?: boolean;
}
export interface EntityFilters {
    type?: string;
    types?: string[];
    name?: string;
    namePattern?: string;
    createdAfter?: number;
    createdBefore?: number;
    limit?: number;
    offset?: number;
}
export interface RelationFilters {
    type?: string;
    types?: string[];
    fromId?: string;
    toId?: string;
    entityId?: string;
    createdAfter?: number;
    createdBefore?: number;
    limit?: number;
    offset?: number;
}
export interface EntityCreationData {
    type: string;
    name: string;
    data?: Record<string, any>;
}
export interface RelationCreationData {
    type: string;
    fromEntityId: string;
    toEntityId: string;
    properties?: Record<string, any>;
}
export interface GraphTraversalOptions {
    maxDepth?: number;
    direction?: 'incoming' | 'outgoing' | 'both';
    relationTypes?: string[];
    includeProperties?: boolean;
}
export interface EntityFilter {
    type?: string;
    name?: string;
    createdAfter?: number;
    updatedAfter?: number;
}
export interface RelationFilter {
    type?: string;
    fromEntityId?: string;
    toEntityId?: string;
    createdAfter?: number;
}
//# sourceMappingURL=knowledge-graph.d.ts.map