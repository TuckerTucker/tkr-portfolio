/**
 * Database Module Exports
 * Central export point for all database functionality
 */

// Core database classes
export { DatabaseConnection, createDatabaseConnection } from './connection.js';
export { StatementManager, CommonStatements, createCommonStatements } from './statements.js';

// Schema and migrations
export {
  SCHEMA_SQL,
  MIGRATIONS,
  CURRENT_SCHEMA_VERSION,
  getTableSchema,
  validateSchemaVersion,
  getTableNames,
  getTableIndexes
} from './schema.js';

// Database types
export type {
  DatabaseConfig,
  Entity,
  Relation,
  LogEntry,
  SearchIndexEntry,
  SearchResult,
  CreateEntityInput,
  UpdateEntityInput,
  CreateRelationInput,
  CreateLogEntryInput,
  DatabaseStats,
  DatabaseHealthStatus,
  TransactionCallback,
  TransactionOptions,
  PreparedStatementInfo,
  Migration,
  MigrationState,
  BatchOperation,
  BatchResult,
  QueryResult,
  RunResult,
  Database,
  LogLevel
} from './types.js';

// Database errors
export {
  DatabaseError,
  TransactionError,
  ConnectionError,
  SchemaError
} from './types.js';