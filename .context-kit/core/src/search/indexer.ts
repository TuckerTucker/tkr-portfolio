/**
 * Search Index Management
 * Manages the population and maintenance of the search index for optimal query performance
 */

import type { DatabaseConnection } from '../database/connection.js';
import type { Entity, SearchIndexEntry } from '../types/index.js';
import { Utils } from '../utils/index.js';
import { searchLogger as logger, timeOperation } from '../utils/logger.js';

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

export class SearchIndexer {
  constructor(private db: DatabaseConnection) {}

  /**
   * Populate search index from existing entities
   */
  async populateIndex(options: IndexingOptions = {}): Promise<IndexingStats> {
    const timer = timeOperation('populate_search_index', logger);
    const opts = {
      batchSize: options.batchSize || 100,
      skipExisting: options.skipExisting || false,
      updateMode: options.updateMode || 'full'
    };

    logger.info('Starting search index population', { options: opts });

    const stats: IndexingStats = {
      processed: 0,
      updated: 0,
      created: 0,
      skipped: 0,
      errors: 0,
      duration: 0
    };

    try {
      // Get all entities
      const entities = this.getAllEntities();
      logger.info('Found entities to index', { count: entities.length });

      // Process in batches
      for (let i = 0; i < entities.length; i += opts.batchSize) {
        const batch = entities.slice(i, i + opts.batchSize);
        await this.processBatch(batch, opts, stats);

        logger.debug('Processed batch', {
          batch: Math.floor(i / opts.batchSize) + 1,
          totalBatches: Math.ceil(entities.length / opts.batchSize),
          processed: stats.processed
        });
      }

      stats.duration = timer.finish({
        success: true,
        processed: stats.processed,
        created: stats.created,
        updated: stats.updated
      });

      logger.info('Search index population completed', stats);
      return stats;
    } catch (error) {
      stats.duration = timer.finish({ success: false, error: error.message });
      logger.error('Search index population failed', error, { stats });
      throw error;
    }
  }

  /**
   * Update search index for a single entity
   */
  async updateEntityIndex(entity: Entity): Promise<void> {
    try {
      const indexEntry = this.createIndexEntry(entity);

      const stmt = this.db.statements.upsertSearchIndex();
      stmt.run(
        indexEntry.entityId,
        indexEntry.metadata?.original_name || indexEntry.content,
        indexEntry.metadata?.normalized_name || indexEntry.content,
        indexEntry.metadata?.name_tokens || indexEntry.tags?.join(' ') || '',
        indexEntry.metadata?.file_path || '',
        indexEntry.metadata?.file_extension || '',
        indexEntry.type,
        Array.isArray(indexEntry.tags) ? indexEntry.tags.join(',') : '',
        indexEntry.full_text || indexEntry.content,
        indexEntry.trigrams || ''
      );

      logger.debug('Updated search index for entity', {
        entityId: entity.id,
        name: entity.name,
        type: entity.type
      });
    } catch (error) {
      logger.error('Failed to update search index for entity', error, {
        entityId: entity.id,
        name: entity.name
      });
      throw error;
    }
  }

  /**
   * Remove entity from search index
   */
  async removeEntityIndex(entityId: string): Promise<void> {
    try {
      const stmt = this.db.statements.deleteSearchIndex();
      const result = stmt.run(entityId);

      logger.debug('Removed entity from search index', {
        entityId,
        changes: result.changes
      });
    } catch (error) {
      logger.error('Failed to remove entity from search index', error, { entityId });
      throw error;
    }
  }

  /**
   * Rebuild entire search index
   */
  async rebuildIndex(): Promise<IndexingStats> {
    logger.info('Starting complete search index rebuild');

    try {
      // Clear existing index
      await this.clearIndex();

      // Repopulate
      return await this.populateIndex({ updateMode: 'full' });
    } catch (error) {
      logger.error('Search index rebuild failed', error);
      throw error;
    }
  }

  /**
   * Clear all search index entries
   */
  async clearIndex(): Promise<void> {
    try {
      this.db.execute('DELETE FROM search_index');
      logger.info('Search index cleared');
    } catch (error) {
      logger.error('Failed to clear search index', error);
      throw error;
    }
  }

  /**
   * Get search index statistics
   */
  getIndexStats(): {
    totalEntries: number;
    entriesByType: Record<string, number>;
    entriesWithPath: number;
    entriesWithTags: number;
    lastUpdated: number | null;
  } {
    try {
      // Total entries
      const totalResult = this.db.queryOne('SELECT COUNT(*) as count FROM search_index');
      const total = totalResult?.count || 0;

      // Entries by type
      const typeResults = this.db.query(`
        SELECT entity_type, COUNT(*) as count
        FROM search_index
        GROUP BY entity_type
        ORDER BY count DESC
      `);
      const entriesByType: Record<string, number> = {};
      for (const row of typeResults) {
        entriesByType[row.entity_type] = row.count;
      }

      // Entries with file paths
      const pathResult = this.db.queryOne(`
        SELECT COUNT(*) as count
        FROM search_index
        WHERE file_path IS NOT NULL AND file_path != ''
      `);
      const entriesWithPath = pathResult?.count || 0;

      // Entries with tags
      const tagsResult = this.db.queryOne(`
        SELECT COUNT(*) as count
        FROM search_index
        WHERE tags IS NOT NULL AND tags != ''
      `);
      const entriesWithTags = tagsResult?.count || 0;

      // Last updated
      const lastUpdatedResult = this.db.queryOne(`
        SELECT MAX(updated_at) as last_updated
        FROM search_index
      `);
      const lastUpdated = lastUpdatedResult?.last_updated || null;

      return {
        totalEntries: total,
        entriesByType,
        entriesWithPath,
        entriesWithTags,
        lastUpdated
      };
    } catch (error) {
      logger.error('Failed to get search index stats', error);
      throw error;
    }
  }

  /**
   * Optimize search index (analyze and potentially rebuild)
   */
  async optimizeIndex(): Promise<{
    analyzed: boolean;
    rebuilt: boolean;
    stats: IndexingStats | null;
  }> {
    logger.info('Starting search index optimization');

    try {
      // Analyze current index
      this.db.execute('ANALYZE search_index');

      const indexStats = this.getIndexStats();
      const entityCount = this.getEntityCount();

      // Check if rebuild is needed
      const needsRebuild = indexStats.totalEntries < entityCount * 0.9; // Missing more than 10%

      if (needsRebuild) {
        logger.info('Search index needs rebuilding', {
          indexEntries: indexStats.totalEntries,
          totalEntities: entityCount
        });

        const rebuildStats = await this.rebuildIndex();
        return {
          analyzed: true,
          rebuilt: true,
          stats: rebuildStats
        };
      }

      logger.info('Search index optimization completed', {
        analyzed: true,
        rebuilt: false
      });

      return {
        analyzed: true,
        rebuilt: false,
        stats: null
      };
    } catch (error) {
      logger.error('Search index optimization failed', error);
      throw error;
    }
  }

  /**
   * Process a batch of entities
   */
  private async processBatch(
    entities: Entity[],
    options: Required<IndexingOptions>,
    stats: IndexingStats
  ): Promise<void> {
    return this.db.transaction(() => {
      for (const entity of entities) {
        try {
          stats.processed++;

          // Check if already exists (if skipExisting is true)
          if (options.skipExisting && this.indexEntryExists(entity.id)) {
            stats.skipped++;
            continue;
          }

          // Create index entry
          const indexEntry = this.createIndexEntry(entity);

          // Upsert to database
          const stmt = this.db.statements.upsertSearchIndex();
          const result = stmt.run(
            indexEntry.entityId,
            indexEntry.metadata?.original_name || indexEntry.content,
            indexEntry.metadata?.normalized_name || indexEntry.content,
            indexEntry.metadata?.name_tokens || indexEntry.tags?.join(' ') || '',
            indexEntry.metadata?.file_path || '',
            indexEntry.metadata?.file_extension || '',
            indexEntry.type,
            Array.isArray(indexEntry.tags) ? indexEntry.tags.join(',') : '',
            indexEntry.full_text || indexEntry.content,
            indexEntry.trigrams || ''
          );

          if (result.changes > 0) {
            stats.created++;
          } else {
            stats.updated++;
          }
        } catch (error) {
          stats.errors++;
          logger.warn('Failed to process entity for search index', {
            entityId: entity.id,
            error: error.message
          });
        }
      }
    });
  }

  /**
   * Create search index entry from entity
   */
  private createIndexEntry(entity: Entity): SearchIndexEntry {
    // Extract file information from entity data
    const filePath = this.extractFilePath(entity.data);
    const fileExtension = filePath ? Utils.getFileExtension(filePath) : '';

    // Create normalized name for search
    const normalizedName = Utils.normalizeForSearch(entity.name);

    // Create search tokens
    const nameTokens = this.createNameTokens(entity.name);

    // Extract tags
    const tags = this.extractTags(entity.data);

    // Create full text content
    const fullText = this.createFullText(entity);

    // Generate trigrams for fuzzy search
    const trigrams = Utils.generateTrigrams(normalizedName).join(' ');

    return {
      entityId: entity.id,
      content: fullText,
      type: entity.type,
      score: 1.0,
      metadata: {
        original_name: entity.name,
        normalized_name: normalizedName,
        name_tokens: nameTokens,
        file_path: filePath || '',
        file_extension: fileExtension,
        created_at: Date.now(),
        updated_at: Date.now()
      },
      tags: Array.isArray(tags) ? tags : [tags].filter(Boolean),
      full_text: fullText,
      trigrams: trigrams,
      entity_id: entity.id
    };
  }

  /**
   * Extract file path from entity data
   */
  private extractFilePath(data: any): string | null {
    if (!data || typeof data !== 'object') {
      return null;
    }

    // Common field names for file paths
    const pathFields = ['path', 'filePath', 'file_path', 'location', 'url', 'src'];

    for (const field of pathFields) {
      if (data[field] && typeof data[field] === 'string') {
        return data[field];
      }
    }

    return null;
  }

  /**
   * Create search tokens from entity name
   */
  private createNameTokens(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')  // Split camelCase
      .replace(/[_-]/g, ' ')       // Replace underscores and dashes
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');       // Normalize whitespace
  }

  /**
   * Extract tags from entity data
   */
  private extractTags(data: any): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    const tags: string[] = [];

    // Common tag fields
    const tagFields = ['tags', 'keywords', 'categories', 'labels'];

    for (const field of tagFields) {
      if (data[field]) {
        if (Array.isArray(data[field])) {
          tags.push(...data[field].filter(tag => typeof tag === 'string'));
        } else if (typeof data[field] === 'string') {
          tags.push(data[field]);
        }
      }
    }

    return tags.join(' ').toLowerCase();
  }

  /**
   * Create full text content for search
   */
  private createFullText(entity: Entity): string {
    const parts = [
      entity.name,
      entity.type
    ];

    // Add searchable data fields
    if (entity.data && typeof entity.data === 'object') {
      const searchableFields = ['description', 'summary', 'content', 'text', 'comment'];

      for (const field of searchableFields) {
        if (entity.data[field] && typeof entity.data[field] === 'string') {
          parts.push(entity.data[field]);
        }
      }
    }

    return parts.join(' ').toLowerCase();
  }

  /**
   * Check if search index entry exists for entity
   */
  private indexEntryExists(entityId: string): boolean {
    const result = this.db.queryOne(
      'SELECT 1 FROM search_index WHERE entity_id = ?',
      [entityId]
    );
    return !!result;
  }

  /**
   * Get all entities from database
   */
  private getAllEntities(): Entity[] {
    return this.db.query('SELECT * FROM entities ORDER BY created_at') as Entity[];
  }

  /**
   * Get total entity count
   */
  private getEntityCount(): number {
    const result = this.db.queryOne('SELECT COUNT(*) as count FROM entities');
    return result?.count || 0;
  }
}