/**
 * Database connection management for tkr-context-kit v2.0
 * Provides connection pooling, transaction support, and error handling
 */

import Database from 'better-sqlite3';
import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { nanoid } from 'nanoid';
import {
  DatabaseConfig,
  DatabaseError,
  ConnectionError,
  TransactionError,
  SchemaError,
  TransactionCallback,
  TransactionOptions,
  DatabaseHealthStatus,
  DatabaseStats,
  Migration,
  RunResult,
  QueryResult
} from './types.js';
import { MIGRATIONS } from './schema.js';
import { StatementManager, CommonStatements } from './statements.js';

/**
 * Main database connection class with advanced features
 */
export class DatabaseConnection {
  private db: Database.Database | null = null;
  private config: Required<DatabaseConfig>;
  private statementManager: StatementManager | null = null;
  private commonStatements: CommonStatements | null = null;
  private isConnected = false;
  private connectionId: string;

  constructor(config: DatabaseConfig) {
    this.connectionId = nanoid(8);
    this.config = {
      path: config.path,
      enableWAL: config.enableWAL ?? true,
      enableForeignKeys: config.enableForeignKeys ?? true,
      timeout: config.timeout ?? 5000,
      verbose: config.verbose ?? false,
      maxPreparedStatements: config.maxPreparedStatements ?? 100
    };
  }

  /**
   * Initialize and connect to the database
   */
  async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      // Ensure database directory exists
      const dbDir = resolve(this.config.path, '..');
      if (!existsSync(dbDir)) {
        mkdirSync(dbDir, { recursive: true });
      }

      // Create database connection
      this.db = new Database(this.config.path, {
        verbose: this.config.verbose ? console.log : undefined,
        timeout: this.config.timeout
      });

      // CRITICAL: Configure pragmas BEFORE any schema operations
      // This avoids transaction conflicts with PRAGMA statements
      this.configurePragmas();

      // Initialize schema with production-grade migration system FIRST
      await this.initializeSchemaProduction();

      // Initialize statement management AFTER schema is ready
      this.statementManager = new StatementManager(this.db, this.config.maxPreparedStatements);
      this.commonStatements = new CommonStatements(this.statementManager);

      this.isConnected = true;

      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Connected to ${this.config.path}`);
      }
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Disconnect from the database
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected || !this.db) {
      return;
    }

    try {
      // Clear prepared statements
      this.statementManager?.clear();

      // Close database connection
      this.db.close();
      this.db = null;
      this.statementManager = null;
      this.commonStatements = null;
      this.isConnected = false;

      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Disconnected`);
      }
    } catch (error) {
      throw new ConnectionError(
        `Failed to disconnect from database: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Check if database is connected
   */
  get connected(): boolean {
    return this.isConnected && this.db !== null;
  }

  /**
   * Get the underlying database instance (for advanced operations)
   */
  get database(): Database.Database {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }
    return this.db;
  }

  /**
   * Get common prepared statements
   */
  get statements(): CommonStatements {
    if (!this.commonStatements) {
      throw new ConnectionError('Database not connected or statements not initialized');
    }
    return this.commonStatements;
  }

  // ============================================================================
  // TRANSACTION SUPPORT
  // ============================================================================

  /**
   * Execute a function within a database transaction
   */
  async transaction<T>(
    callback: TransactionCallback<T>,
    options: TransactionOptions = {}
  ): Promise<T> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    const timeout = options.timeout || this.config.timeout;

    try {
      // Create transaction function with specified mode
      const txn = this.db.transaction(callback);

      // Execute with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Transaction timeout')), timeout);
      });

      const result = await Promise.race([
        Promise.resolve(txn()),
        timeoutPromise
      ]);

      return result;
    } catch (error) {
      throw new TransactionError(
        `Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute multiple operations in a batch transaction
   */
  async batch<T>(operations: Array<() => T>): Promise<T[]> {
    return this.transaction(() => {
      return operations.map(op => op());
    });
  }

  // ============================================================================
  // SCHEMA MANAGEMENT
  // ============================================================================

  /**
   * Initialize database schema with production-grade migration system
   */
  private async initializeSchemaProduction(): Promise<void> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      // Create schema_migrations table if it doesn't exist
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          applied_at INTEGER DEFAULT (unixepoch())
        );
      `);

      // Get current schema version
      const currentVersion = this.getCurrentSchemaVersion();

      // Apply necessary migrations WITHOUT transactions to avoid PRAGMA issues
      for (const migration of MIGRATIONS) {
        if (migration.version > currentVersion) {
          await this.applyMigrationDirectly(migration);
        }
      }
    } catch (error) {
      throw new SchemaError(
        `Production schema initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }


  /**
   * Get current schema version
   */
  private getCurrentSchemaVersion(): number {
    if (!this.db) {
      return 0;
    }

    try {
      const result = this.db.prepare(`
        SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
      `).get() as { version: number } | undefined;

      return result?.version || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Apply a database migration directly without transactions
   */
  private async applyMigrationDirectly(migration: Migration): Promise<void> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      // Execute migration SQL directly without transaction wrapper
      this.db.exec(migration.sql);

      // Record migration
      this.db.prepare(`
        INSERT INTO schema_migrations (version, name, applied_at)
        VALUES (?, ?, unixepoch())
      `).run(migration.version, migration.name);

      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Applied migration: ${migration.name}`);
      }
    } catch (error) {
      throw new SchemaError(
        `Migration ${migration.name} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error : undefined
      );
    }
  }


  // ============================================================================
  // HEALTH CHECKS AND MONITORING
  // ============================================================================

  /**
   * Perform database health check
   */
  async healthCheck(): Promise<DatabaseHealthStatus> {
    const startTime = Date.now();

    try {
      if (!this.db || !this.isConnected) {
        return {
          connected: false,
          writable: false,
          last_query_duration_ms: 0,
          prepared_statements_count: 0,
          error: 'Database not connected'
        };
      }

      // Test basic query
      this.db.prepare('SELECT 1 as test').get();
      const queryDuration = Date.now() - startTime;

      // Test write capability
      let writable = false;
      try {
        this.db.prepare('SELECT COUNT(*) FROM entities').get();
        writable = true;
      } catch {
        writable = false;
      }

      // Get WAL checkpoint status
      let walStatus: string | undefined;
      try {
        const walResult = this.db.pragma('wal_checkpoint(PASSIVE)');
        walStatus = Array.isArray(walResult) ? walResult.join(',') : String(walResult);
      } catch {
        walStatus = undefined;
      }

      return {
        connected: true,
        writable,
        last_query_duration_ms: queryDuration,
        prepared_statements_count: this.statementManager?.getStats().total || 0,
        wal_checkpoint_status: walStatus
      };
    } catch (error) {
      return {
        connected: false,
        writable: false,
        last_query_duration_ms: Date.now() - startTime,
        prepared_statements_count: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get database statistics
   */
  async getStats(): Promise<DatabaseStats> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      const stats = this.statements.healthCheck().get() as {
        entity_count: number;
        relation_count: number;
        log_count: number;
        search_index_count: number;
      };

      // Get database file size
      const pragma = this.db.pragma('page_count') as number;
      const pageSize = this.db.pragma('page_size') as number;
      const databaseSize = pragma * pageSize;

      return {
        entities: stats.entity_count,
        relations: stats.relation_count,
        log_entries: stats.log_count,
        search_index_entries: stats.search_index_count,
        database_size_bytes: databaseSize,
        last_updated: Math.floor(Date.now() / 1000)
      };
    } catch (error) {
      throw new DatabaseError(
        `Failed to get database stats: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'STATS_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  // ============================================================================
  // QUERY METHODS
  // ============================================================================

  /**
   * Execute a query and return all results
   */
  query(sql: string, params: any[] = []): QueryResult {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      return this.db.prepare(sql).all(...params);
    } catch (error) {
      throw new DatabaseError(
        `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'QUERY_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute a query and return the first result
   */
  queryOne(sql: string, params: any[] = []): any {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      return this.db.prepare(sql).get(...params);
    } catch (error) {
      throw new DatabaseError(
        `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'QUERY_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Execute a statement and return run result
   */
  execute(sql: string, params: any[] = []): RunResult {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      return this.db.prepare(sql).run(...params);
    } catch (error) {
      throw new DatabaseError(
        `Execute failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'EXECUTE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  // ============================================================================
  // BACKUP AND MAINTENANCE
  // ============================================================================

  /**
   * Create a backup of the database
   */
  async backup(backupPath: string): Promise<void> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      await this.db.backup(backupPath);
      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Backup created: ${backupPath}`);
      }
    } catch (error) {
      throw new DatabaseError(
        `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BACKUP_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Optimize database (VACUUM and ANALYZE)
   */
  async optimize(): Promise<void> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      this.db.exec('VACUUM');
      this.db.exec('ANALYZE');
      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Database optimized`);
      }
    } catch (error) {
      throw new DatabaseError(
        `Optimization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OPTIMIZE_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Checkpoint WAL file
   */
  async checkpoint(): Promise<void> {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      this.db.pragma('wal_checkpoint(TRUNCATE)');
      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] WAL checkpoint completed`);
      }
    } catch (error) {
      throw new DatabaseError(
        `Checkpoint failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'CHECKPOINT_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Configure database pragmas
   */
  private configurePragmas(): void {
    if (!this.db) {
      throw new ConnectionError('Database not connected');
    }

    try {
      // Set journal mode to WAL for better concurrency
      if (this.config.enableWAL) {
        this.db.pragma('journal_mode = WAL');
      }

      // Enable foreign key constraints
      if (this.config.enableForeignKeys) {
        this.db.pragma('foreign_keys = ON');
      }

      // Performance optimizations
      this.db.pragma('synchronous = NORMAL');
      this.db.pragma('cache_size = 10000');
      this.db.pragma('temp_store = memory');
      this.db.pragma('mmap_size = 268435456'); // 256MB

      if (this.config.verbose) {
        console.log(`[DatabaseConnection:${this.connectionId}] Pragmas configured`);
      }
    } catch (error) {
      throw new DatabaseError(
        `Failed to configure pragmas: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'PRAGMA_ERROR',
        error instanceof Error ? error : undefined
      );
    }
  }
}

/**
 * Factory function to create and connect a database
 */
export async function createDatabaseConnection(config: DatabaseConfig): Promise<DatabaseConnection> {
  const connection = new DatabaseConnection(config);
  await connection.connect();
  return connection;
}