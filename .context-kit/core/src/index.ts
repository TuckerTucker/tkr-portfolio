/**
 * tkr-context-kit Core Module
 * Unified core library for knowledge graph, search, logging, and database operations
 *
 * @version 1.0.0
 * @author Tucker
 */

// Database exports (explicit to avoid conflicts)
export {
  DatabaseConnection,
  createDatabaseConnection,
  StatementManager,
  CommonStatements,
  createCommonStatements,
  SCHEMA_SQL,
  MIGRATIONS,
  CURRENT_SCHEMA_VERSION
} from './database/index.js';

// Types exports
export * from './types/index.js';

// Utilities exports
export * from './utils/index.js';

// Search exports
export {
  QueryParser,
  UnifiedSearchEngine,
  SearchIndexer
} from './search/index.js';

// Knowledge Graph exports
export {
  KnowledgeGraph
} from './knowledge-graph/index.js';

// Logging exports
export {
  LoggingService
} from './logging/index.js';

// Configuration exports (JavaScript modules)
// Note: These are JavaScript modules and will be available after build
export * as Config from './config/index.js';

// Module version and metadata
export const CORE_VERSION = '1.0.0';
export const CORE_NAME = '@tkr-context-kit/core';

export interface CoreModuleInfo {
  version: string;
  name: string;
  components: string[];
  buildTime: string;
}

export const getCoreModuleInfo = (): CoreModuleInfo => ({
  version: CORE_VERSION,
  name: CORE_NAME,
  components: ['database', 'search', 'knowledge-graph', 'logging', 'config', 'types', 'utils'],
  buildTime: new Date().toISOString()
});

// Re-export key types for convenience
export type {
  // Database types
  Entity,
  Relation,
  DatabaseConfig,

  // Search types
  SearchOptions,
  SearchResult,
  SearchPatternType,

  // Logging types
  LogLevel,
  LogEntry,
  LogFilters,
  LogFilter,
  LogQuery,
  LogServiceConfig,

  // Configuration types
  CoreModuleConfig
} from './types/index.js';

// Re-export key utilities
export {
  // Configuration
  config,
  ConfigManager,

  // ID generation
  IdGenerator,
  generateEntityId,
  generateRelationId,
  generateLogId,

  // Validation
  ValidationUtils,
  validateEntity,
  validateRelation,

  // Logging
  createLogger,
  logger,
  timeOperation
} from './utils/index.js';