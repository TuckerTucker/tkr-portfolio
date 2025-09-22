/**
 * Prepared statement management system for tkr-context-kit v2.0
 * Provides caching, optimization, and centralized statement definitions
 */

import Database from 'better-sqlite3';
import { PreparedStatementInfo, DatabaseError } from './types.js';

/**
 * Manages prepared statements with caching and optimization
 */
export class StatementManager {
  private statements: Map<string, PreparedStatementInfo> = new Map();
  private readonly maxStatements: number;
  private readonly db: Database.Database;

  constructor(db: Database.Database, maxStatements: number = 100) {
    this.db = db;
    this.maxStatements = maxStatements;
  }

  /**
   * Get or create a prepared statement
   */
  get(name: string, sql: string): Database.Statement {
    const existing = this.statements.get(name);

    if (existing) {
      existing.last_used = Date.now();
      existing.usage_count++;
      return existing.statement;
    }

    // Check if we need to evict old statements
    if (this.statements.size >= this.maxStatements) {
      this.evictOldestStatement();
    }

    try {
      const statement = this.db.prepare(sql);
      const info: PreparedStatementInfo = {
        name,
        sql,
        statement,
        created_at: Date.now(),
        last_used: Date.now(),
        usage_count: 1
      };

      this.statements.set(name, info);
      return statement;
    } catch (error) {
      throw new DatabaseError(
        `Failed to prepare statement '${name}': ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PREPARE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Remove a prepared statement from cache
   */
  remove(name: string): boolean {
    return this.statements.delete(name);
  }

  /**
   * Clear all prepared statements
   */
  clear(): void {
    this.statements.clear();
  }

  /**
   * Get statistics about prepared statements
   */
  getStats(): {
    total: number;
    maxCapacity: number;
    mostUsed: string | null;
    oldestStatement: string | null;
  } {
    let mostUsed: string | null = null;
    let oldestStatement: string | null = null;
    let maxUsage = 0;
    let oldestTime = Date.now();

    for (const [name, info] of this.statements) {
      if (info.usage_count > maxUsage) {
        maxUsage = info.usage_count;
        mostUsed = name;
      }
      if (info.created_at < oldestTime) {
        oldestTime = info.created_at;
        oldestStatement = name;
      }
    }

    return {
      total: this.statements.size,
      maxCapacity: this.maxStatements,
      mostUsed,
      oldestStatement
    };
  }

  /**
   * Evict the least recently used statement
   */
  private evictOldestStatement(): void {
    let oldestName: string | null = null;
    let oldestTime = Date.now();

    for (const [name, info] of this.statements) {
      if (info.last_used < oldestTime) {
        oldestTime = info.last_used;
        oldestName = name;
      }
    }

    if (oldestName) {
      this.statements.delete(oldestName);
    }
  }
}

/**
 * Pre-defined statements for common operations
 */
export class CommonStatements {
  private readonly stmtManager: StatementManager;

  constructor(stmtManager: StatementManager) {
    this.stmtManager = stmtManager;
  }

  // ============================================================================
  // ENTITY OPERATIONS
  // ============================================================================

  createEntity(): Database.Statement {
    return this.stmtManager.get('createEntity', `
      INSERT INTO entities (id, type, name, data, created_at, updated_at, version)
      VALUES (?, ?, ?, json(?), unixepoch(), unixepoch(), 1)
    `);
  }

  insertEntity(): Database.Statement {
    return this.stmtManager.get('insertEntity', `
      INSERT INTO entities (id, type, name, data, created_at, updated_at, version)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
  }

  getEntityById(): Database.Statement {
    return this.stmtManager.get('getEntityById', `
      SELECT id, type, name, data, created_at, updated_at, version
      FROM entities
      WHERE id = ?
    `);
  }

  getEntity(): Database.Statement {
    return this.stmtManager.get('getEntity', `
      SELECT id, type, name, data, created_at, updated_at, version
      FROM entities
      WHERE id = ?
    `);
  }

  getEntityByName(): Database.Statement {
    return this.stmtManager.get('getEntityByName', `
      SELECT id, type, name, data, created_at, updated_at, version
      FROM entities
      WHERE type = ? AND name = ?
    `);
  }

  updateEntity(): Database.Statement {
    return this.stmtManager.get('updateEntity', `
      UPDATE entities
      SET type = ?, name = ?, data = ?, updated_at = ?, version = ?
      WHERE id = ?
    `);
  }

  deleteEntity(): Database.Statement {
    return this.stmtManager.get('deleteEntity', `
      DELETE FROM entities WHERE id = ?
    `);
  }

  listEntitiesByType(): Database.Statement {
    return this.stmtManager.get('listEntitiesByType', `
      SELECT id, type, name, data, created_at, updated_at, version
      FROM entities
      WHERE type = ?
      ORDER BY name
      LIMIT ?
    `);
  }

  countEntitiesByType(): Database.Statement {
    return this.stmtManager.get('countEntitiesByType', `
      SELECT COUNT(*) as count FROM entities WHERE type = ?
    `);
  }

  // ============================================================================
  // RELATION OPERATIONS
  // ============================================================================

  createRelation(): Database.Statement {
    return this.stmtManager.get('createRelation', `
      INSERT INTO relations (id, from_id, to_id, type, properties, created_at)
      VALUES (?, ?, ?, ?, json(?), unixepoch())
    `);
  }

  insertRelation(): Database.Statement {
    return this.stmtManager.get('insertRelation', `
      INSERT INTO relations (id, from_id, to_id, type, properties, created_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
    `);
  }

  deleteEntityRelations(): Database.Statement {
    return this.stmtManager.get('deleteEntityRelations', `
      DELETE FROM relations WHERE from_id = ? OR to_id = ?
    `);
  }

  getRelation(): Database.Statement {
    return this.stmtManager.get('getRelation', `
      SELECT id, from_id, to_id, type, properties, created_at
      FROM relations
      WHERE id = ?
    `);
  }

  deleteRelation(): Database.Statement {
    return this.stmtManager.get('deleteRelation', `
      DELETE FROM relations WHERE id = ?
    `);
  }

  getRelationsByEntity(): Database.Statement {
    return this.stmtManager.get('getRelationsByEntity', `
      SELECT id, from_id, to_id, type, properties, created_at
      FROM relations
      WHERE from_id = ? OR to_id = ?
    `);
  }

  getOutgoingRelations(): Database.Statement {
    return this.stmtManager.get('getOutgoingRelations', `
      SELECT id, from_id, to_id, type, properties, created_at
      FROM relations
      WHERE from_id = ?
    `);
  }

  getIncomingRelations(): Database.Statement {
    return this.stmtManager.get('getIncomingRelations', `
      SELECT id, from_id, to_id, type, properties, created_at
      FROM relations
      WHERE to_id = ?
    `);
  }

  getRelationsByType(): Database.Statement {
    return this.stmtManager.get('getRelationsByType', `
      SELECT id, from_id, to_id, type, properties, created_at
      FROM relations
      WHERE type = ?
      LIMIT ?
    `);
  }

  // ============================================================================
  // SEARCH INDEX OPERATIONS
  // ============================================================================

  upsertSearchIndex(): Database.Statement {
    return this.stmtManager.get('upsertSearchIndex', `
      INSERT INTO search_index (
        entity_id, original_name, normalized_name, name_tokens,
        file_path, file_extension, entity_type, tags, full_text,
        trigrams, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, unixepoch(), unixepoch())
      ON CONFLICT(entity_id) DO UPDATE SET
        original_name = excluded.original_name,
        normalized_name = excluded.normalized_name,
        name_tokens = excluded.name_tokens,
        file_path = excluded.file_path,
        file_extension = excluded.file_extension,
        entity_type = excluded.entity_type,
        tags = excluded.tags,
        full_text = excluded.full_text,
        trigrams = excluded.trigrams,
        updated_at = unixepoch()
    `);
  }

  searchByPrefix(): Database.Statement {
    return this.stmtManager.get('searchByPrefix', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE normalized_name LIKE ?
      ORDER BY length(normalized_name), original_name
      LIMIT ?
    `);
  }

  searchBySuffix(): Database.Statement {
    return this.stmtManager.get('searchBySuffix', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE normalized_name LIKE ?
      ORDER BY length(normalized_name), original_name
      LIMIT ?
    `);
  }

  searchByExtension(): Database.Statement {
    return this.stmtManager.get('searchByExtension', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE file_extension = ?
      ORDER BY original_name
      LIMIT ?
    `);
  }

  searchByType(): Database.Statement {
    return this.stmtManager.get('searchByType', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE entity_type = ?
      ORDER BY original_name
      LIMIT ?
    `);
  }

  searchFullText(): Database.Statement {
    return this.stmtManager.get('searchFullText', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      WHERE full_text LIKE ?
      ORDER BY original_name
      LIMIT ?
    `);
  }

  getAllEntities(): Database.Statement {
    return this.stmtManager.get('getAllEntities', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      ORDER BY entity_type, original_name
      LIMIT ?
    `);
  }

  searchAll(): Database.Statement {
    return this.stmtManager.get('searchAll', `
      SELECT entity_id, original_name, entity_type, file_path
      FROM search_index
      ORDER BY entity_type, original_name
      LIMIT ?
    `);
  }

  deleteSearchIndex(): Database.Statement {
    return this.stmtManager.get('deleteSearchIndex', `
      DELETE FROM search_index WHERE entity_id = ?
    `);
  }

  // ============================================================================
  // LOG OPERATIONS
  // ============================================================================

  createLogEntry(): Database.Statement {
    return this.stmtManager.get('createLogEntry', `
      INSERT INTO log_entries (
        id, timestamp, level, service, message, metadata,
        process_id, session_id, trace_id, created_at
      ) VALUES (?, ?, ?, ?, ?, json(?), ?, ?, ?, unixepoch())
    `);
  }

  insertLogEntry(): Database.Statement {
    return this.stmtManager.get('insertLogEntry', `
      INSERT INTO log_entries (
        id, timestamp, level, service, message, metadata, process_id, session_id, trace_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
  }

  getLogEntries(): Database.Statement {
    return this.stmtManager.get('getLogEntries', `
      SELECT id, timestamp, level, service, message, metadata,
             process_id, session_id, trace_id, created_at
      FROM log_entries
      WHERE timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
  }

  getLogEntriesByLevel(): Database.Statement {
    return this.stmtManager.get('getLogEntriesByLevel', `
      SELECT id, timestamp, level, service, message, metadata,
             process_id, session_id, trace_id, created_at
      FROM log_entries
      WHERE level = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
  }

  getLogEntriesByService(): Database.Statement {
    return this.stmtManager.get('getLogEntriesByService', `
      SELECT id, timestamp, level, service, message, metadata,
             process_id, session_id, trace_id, created_at
      FROM log_entries
      WHERE service = ? AND timestamp >= ? AND timestamp <= ?
      ORDER BY timestamp DESC
      LIMIT ?
    `);
  }

  deleteOldLogEntries(): Database.Statement {
    return this.stmtManager.get('deleteOldLogEntries', `
      DELETE FROM log_entries WHERE timestamp < ?
    `);
  }

  getLogStats(): Database.Statement {
    return this.stmtManager.get('getLogStats', `
      SELECT
        service,
        level,
        COUNT(*) as count,
        MIN(timestamp) as first_occurrence,
        MAX(timestamp) as last_occurrence
      FROM log_entries
      WHERE timestamp >= ?
      GROUP BY service, level
      ORDER BY count DESC
    `);
  }

  // ============================================================================
  // MIGRATION OPERATIONS
  // ============================================================================

  getCurrentSchemaVersion(): Database.Statement {
    return this.stmtManager.get('getCurrentSchemaVersion', `
      SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
    `);
  }

  recordMigration(): Database.Statement {
    return this.stmtManager.get('recordMigration', `
      INSERT INTO schema_migrations (version, name, applied_at)
      VALUES (?, ?, unixepoch())
    `);
  }

  // ============================================================================
  // HEALTH CHECK OPERATIONS
  // ============================================================================

  healthCheck(): Database.Statement {
    return this.stmtManager.get('healthCheck', `
      SELECT
        (SELECT COUNT(*) FROM entities) as entity_count,
        (SELECT COUNT(*) FROM relations) as relation_count,
        (SELECT COUNT(*) FROM log_entries) as log_count,
        (SELECT COUNT(*) FROM search_index) as search_index_count
    `);
  }

  getKnowledgeGraphStats(): Database.Statement {
    return this.stmtManager.get('getKnowledgeGraphStats', `
      SELECT
        (SELECT COUNT(*) FROM entities) as entity_count,
        (SELECT COUNT(*) FROM relations) as relation_count,
        (SELECT COUNT(*) FROM search_index) as index_size,
        COALESCE((SELECT
          CAST(COUNT(*) AS REAL) / COUNT(DISTINCT from_id)
          FROM relations), 0) as avg_entity_connections
    `);
  }

  // ============================================================================
  // ADVANCED QUERIES
  // ============================================================================

  findConnectedEntities(): Database.Statement {
    return this.stmtManager.get('findConnectedEntities', `
      WITH RECURSIVE connected AS (
        SELECT id, name, type, 0 as depth
        FROM entities WHERE id = ?

        UNION ALL

        SELECT e.id, e.name, e.type, c.depth + 1
        FROM connected c
        JOIN relations r ON c.id = r.from_id OR c.id = r.to_id
        JOIN entities e ON (r.from_id = e.id OR r.to_id = e.id) AND e.id != c.id
        WHERE c.depth < ?
      )
      SELECT DISTINCT id, name, type, depth
      FROM connected
      ORDER BY depth, name
    `);
  }

  getEntityNeighbors(): Database.Statement {
    return this.stmtManager.get('getEntityNeighbors', `
      SELECT DISTINCT
        e.id,
        e.name,
        e.type,
        r.type as relation_type,
        CASE
          WHEN r.from_id = ? THEN 'outgoing'
          ELSE 'incoming'
        END as direction
      FROM relations r
      JOIN entities e ON (
        (r.from_id = ? AND r.to_id = e.id) OR
        (r.to_id = ? AND r.from_id = e.id)
      )
      ORDER BY e.name
    `);
  }
}

/**
 * Factory function to create commonly used statements
 */
export function createCommonStatements(db: Database.Database, maxStatements?: number): CommonStatements {
  const manager = new StatementManager(db, maxStatements);
  return new CommonStatements(manager);
}