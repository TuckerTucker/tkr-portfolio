/**
 * Database connection management for tkr-context-kit v2.0
 * Provides connection pooling, transaction support, and error handling
 */
import Database from 'better-sqlite3';
import { DatabaseConfig, TransactionCallback, TransactionOptions, DatabaseHealthStatus, DatabaseStats, RunResult, QueryResult } from './types.js';
import { CommonStatements } from './statements.js';
/**
 * Main database connection class with advanced features
 */
export declare class DatabaseConnection {
    private db;
    private config;
    private statementManager;
    private commonStatements;
    private isConnected;
    private connectionId;
    constructor(config: DatabaseConfig);
    /**
     * Initialize and connect to the database
     */
    connect(): Promise<void>;
    /**
     * Disconnect from the database
     */
    disconnect(): Promise<void>;
    /**
     * Check if database is connected
     */
    get connected(): boolean;
    /**
     * Get the underlying database instance (for advanced operations)
     */
    get database(): Database.Database;
    /**
     * Get common prepared statements
     */
    get statements(): CommonStatements;
    /**
     * Execute a function within a database transaction
     */
    transaction<T>(callback: TransactionCallback<T>, options?: TransactionOptions): Promise<T>;
    /**
     * Execute multiple operations in a batch transaction
     */
    batch<T>(operations: Array<() => T>): Promise<T[]>;
    /**
     * Initialize database schema with production-grade migration system
     */
    private initializeSchemaProduction;
    /**
     * Get current schema version
     */
    private getCurrentSchemaVersion;
    /**
     * Apply a database migration directly without transactions
     */
    private applyMigrationDirectly;
    /**
     * Perform database health check
     */
    healthCheck(): Promise<DatabaseHealthStatus>;
    /**
     * Get database statistics
     */
    getStats(): Promise<DatabaseStats>;
    /**
     * Execute a query and return all results
     */
    query(sql: string, params?: any[]): QueryResult;
    /**
     * Execute a query and return the first result
     */
    queryOne(sql: string, params?: any[]): any;
    /**
     * Execute a statement and return run result
     */
    execute(sql: string, params?: any[]): RunResult;
    /**
     * Create a backup of the database
     */
    backup(backupPath: string): Promise<void>;
    /**
     * Optimize database (VACUUM and ANALYZE)
     */
    optimize(): Promise<void>;
    /**
     * Checkpoint WAL file
     */
    checkpoint(): Promise<void>;
    /**
     * Configure database pragmas
     */
    private configurePragmas;
}
/**
 * Factory function to create and connect a database
 */
export declare function createDatabaseConnection(config: DatabaseConfig): Promise<DatabaseConnection>;
//# sourceMappingURL=connection.d.ts.map