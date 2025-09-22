/**
 * Database types and interfaces for tkr-context-kit v2.0
 * Unified types for entities, relations, logs, and search
 */

import Database from 'better-sqlite3';

// Core database configuration
export interface DatabaseConfig {
  /** Path to the SQLite database file */
  path: string;
  /** Enable WAL mode for better concurrency (default: true) */
  enableWAL?: boolean;
  /** Enable foreign key constraints (default: true) */
  enableForeignKeys?: boolean;
  /** Connection timeout in milliseconds (default: 5000) */
  timeout?: number;
  /** Enable verbose logging for database operations (default: false) */
  verbose?: boolean;
  /** Maximum number of prepared statements to cache (default: 100) */
  maxPreparedStatements?: number;
}

// Entity types
export interface Entity {
  id: string;
  type: string;
  name: string;
  data: Record<string, any>;
  created_at: number;
  updated_at: number;
  version: number;
}

export interface CreateEntityInput {
  id?: string; // Optional, will generate if not provided
  type: string;
  name: string;
  data: Record<string, any>;
}

export interface UpdateEntityInput {
  name?: string;
  data?: Record<string, any>;
}

// Relation types
export interface Relation {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  properties?: Record<string, any>;
  created_at: number;
}

export interface CreateRelationInput {
  id?: string; // Optional, will generate if not provided
  from_id: string;
  to_id: string;
  type: string;
  properties?: Record<string, any>;
}

// Search index types
export interface SearchIndexEntry {
  entity_id: string;
  original_name: string;
  normalized_name: string;
  name_tokens: string;
  file_path?: string;
  file_extension?: string;
  entity_type: string;
  tags?: string;
  full_text: string;
  trigrams?: string;
  created_at: number;
  updated_at: number;
}

export interface SearchResult {
  entity_id: string;
  original_name: string;
  entity_type: string;
  file_path?: string;
  score?: number;
  match_snippet?: string;
}

// Log entry types
export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  process_id?: string;
  session_id?: string;
  trace_id?: string;
  created_at: number;
}

export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';

export interface CreateLogEntryInput {
  id?: string;
  level: LogLevel;
  service: string;
  message: string;
  metadata?: Record<string, any>;
  process_id?: string;
  session_id?: string;
  trace_id?: string;
}

// Database statistics
export interface DatabaseStats {
  entities: number;
  relations: number;
  log_entries: number;
  search_index_entries: number;
  database_size_bytes: number;
  last_updated: number;
}

// Transaction types
export type TransactionCallback<T> = () => T;

export interface TransactionOptions {
  /** Transaction mode: immediate, deferred, or exclusive (default: immediate) */
  mode?: 'immediate' | 'deferred' | 'exclusive';
  /** Timeout for transaction in milliseconds (default: 5000) */
  timeout?: number;
}

// Prepared statement management
export interface PreparedStatementInfo {
  name: string;
  sql: string;
  statement: Database.Statement;
  created_at: number;
  last_used: number;
  usage_count: number;
}

// Migration types
export interface Migration {
  version: number;
  name: string;
  sql: string;
  rollback?: string;
}

export interface MigrationState {
  version: number;
  applied_at: number;
}

// Health check types
export interface DatabaseHealthStatus {
  connected: boolean;
  writable: boolean;
  last_query_duration_ms: number;
  prepared_statements_count: number;
  wal_checkpoint_status?: string;
  error?: string;
}

// Batch operation types
export interface BatchOperation<T> {
  operation: 'insert' | 'update' | 'delete';
  data: T;
}

export interface BatchResult {
  successful: number;
  failed: number;
  errors: Error[];
}

// Error types
export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class TransactionError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'TRANSACTION_ERROR', originalError);
    this.name = 'TransactionError';
  }
}

export class ConnectionError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'CONNECTION_ERROR', originalError);
    this.name = 'ConnectionError';
  }
}

export class SchemaError extends DatabaseError {
  constructor(message: string, originalError?: Error) {
    super(message, 'SCHEMA_ERROR', originalError);
    this.name = 'SchemaError';
  }
}

// Query result types
export type QueryResult = any[];
export type RunResult = Database.RunResult;

// Export Database type from better-sqlite3 for convenience
export type { Database };