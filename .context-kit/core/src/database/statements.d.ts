/**
 * Prepared statement management system for tkr-context-kit v2.0
 * Provides caching, optimization, and centralized statement definitions
 */
import Database from 'better-sqlite3';
/**
 * Manages prepared statements with caching and optimization
 */
export declare class StatementManager {
    private statements;
    private readonly maxStatements;
    private readonly db;
    constructor(db: Database.Database, maxStatements?: number);
    /**
     * Get or create a prepared statement
     */
    get(name: string, sql: string): Database.Statement;
    /**
     * Remove a prepared statement from cache
     */
    remove(name: string): boolean;
    /**
     * Clear all prepared statements
     */
    clear(): void;
    /**
     * Get statistics about prepared statements
     */
    getStats(): {
        total: number;
        maxCapacity: number;
        mostUsed: string | null;
        oldestStatement: string | null;
    };
    /**
     * Evict the least recently used statement
     */
    private evictOldestStatement;
}
/**
 * Pre-defined statements for common operations
 */
export declare class CommonStatements {
    private readonly stmtManager;
    constructor(stmtManager: StatementManager);
    createEntity(): Database.Statement;
    insertEntity(): Database.Statement;
    getEntityById(): Database.Statement;
    getEntity(): Database.Statement;
    getEntityByName(): Database.Statement;
    updateEntity(): Database.Statement;
    deleteEntity(): Database.Statement;
    listEntitiesByType(): Database.Statement;
    countEntitiesByType(): Database.Statement;
    createRelation(): Database.Statement;
    insertRelation(): Database.Statement;
    deleteEntityRelations(): Database.Statement;
    getRelation(): Database.Statement;
    deleteRelation(): Database.Statement;
    getRelationsByEntity(): Database.Statement;
    getOutgoingRelations(): Database.Statement;
    getIncomingRelations(): Database.Statement;
    getRelationsByType(): Database.Statement;
    upsertSearchIndex(): Database.Statement;
    searchByPrefix(): Database.Statement;
    searchBySuffix(): Database.Statement;
    searchByExtension(): Database.Statement;
    searchByType(): Database.Statement;
    searchFullText(): Database.Statement;
    getAllEntities(): Database.Statement;
    searchAll(): Database.Statement;
    deleteSearchIndex(): Database.Statement;
    createLogEntry(): Database.Statement;
    insertLogEntry(): Database.Statement;
    getLogEntries(): Database.Statement;
    getLogEntriesByLevel(): Database.Statement;
    getLogEntriesByService(): Database.Statement;
    deleteOldLogEntries(): Database.Statement;
    getLogStats(): Database.Statement;
    getCurrentSchemaVersion(): Database.Statement;
    recordMigration(): Database.Statement;
    healthCheck(): Database.Statement;
    getKnowledgeGraphStats(): Database.Statement;
    findConnectedEntities(): Database.Statement;
    getEntityNeighbors(): Database.Statement;
}
/**
 * Factory function to create commonly used statements
 */
export declare function createCommonStatements(db: Database.Database, maxStatements?: number): CommonStatements;
//# sourceMappingURL=statements.d.ts.map