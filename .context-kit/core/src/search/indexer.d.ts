/**
 * Search Index Management
 * Manages the population and maintenance of the search index for optimal query performance
 */
import type { DatabaseConnection } from '../database/connection.js';
import type { Entity } from '../types/index.js';
export interface IndexingOptions {
    batchSize?: number;
    skipExisting?: boolean;
    updateMode?: 'full' | 'incremental';
}
export interface IndexingStats {
    processed: number;
    updated: number;
    created: number;
    skipped: number;
    errors: number;
    duration: number;
}
export declare class SearchIndexer {
    private db;
    constructor(db: DatabaseConnection);
    /**
     * Populate search index from existing entities
     */
    populateIndex(options?: IndexingOptions): Promise<IndexingStats>;
    /**
     * Update search index for a single entity
     */
    updateEntityIndex(entity: Entity): Promise<void>;
    /**
     * Remove entity from search index
     */
    removeEntityIndex(entityId: string): Promise<void>;
    /**
     * Rebuild entire search index
     */
    rebuildIndex(): Promise<IndexingStats>;
    /**
     * Clear all search index entries
     */
    clearIndex(): Promise<void>;
    /**
     * Get search index statistics
     */
    getIndexStats(): {
        totalEntries: number;
        entriesByType: Record<string, number>;
        entriesWithPath: number;
        entriesWithTags: number;
        lastUpdated: number | null;
    };
    /**
     * Optimize search index (analyze and potentially rebuild)
     */
    optimizeIndex(): Promise<{
        analyzed: boolean;
        rebuilt: boolean;
        stats: IndexingStats | null;
    }>;
    /**
     * Process a batch of entities
     */
    private processBatch;
    /**
     * Create search index entry from entity
     */
    private createIndexEntry;
    /**
     * Extract file path from entity data
     */
    private extractFilePath;
    /**
     * Create search tokens from entity name
     */
    private createNameTokens;
    /**
     * Extract tags from entity data
     */
    private extractTags;
    /**
     * Create full text content for search
     */
    private createFullText;
    /**
     * Check if search index entry exists for entity
     */
    private indexEntryExists;
    /**
     * Get all entities from database
     */
    private getAllEntities;
    /**
     * Get total entity count
     */
    private getEntityCount;
}
//# sourceMappingURL=indexer.d.ts.map