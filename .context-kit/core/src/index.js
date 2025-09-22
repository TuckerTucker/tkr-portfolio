/**
 * tkr-context-kit Core Module
 * Unified core library for knowledge graph, search, logging, and database operations
 *
 * @version 1.0.0
 * @author Tucker
 */
// Database exports (explicit to avoid conflicts)
export { DatabaseConnection, createDatabaseConnection, StatementManager, CommonStatements, createCommonStatements, SCHEMA_SQL, MIGRATIONS, CURRENT_SCHEMA_VERSION } from './database/index.js';
// Types exports
export * from './types/index.js';
// Utilities exports
export * from './utils/index.js';
// Search exports
export { QueryParser, UnifiedSearchEngine, SearchIndexer } from './search/index.js';
// Knowledge Graph exports
export { KnowledgeGraph } from './knowledge-graph/index.js';
// Logging exports
export { LoggingService } from './logging/index.js';
// Module version and metadata
export const CORE_VERSION = '1.0.0';
export const CORE_NAME = '@tkr-context-kit/core';
export const getCoreModuleInfo = () => ({
    version: CORE_VERSION,
    name: CORE_NAME,
    components: ['database', 'search', 'knowledge-graph', 'logging', 'types', 'utils'],
    buildTime: new Date().toISOString()
});
// Re-export key utilities
export { 
// Configuration
config, ConfigManager, 
// ID generation
IdGenerator, generateEntityId, generateRelationId, generateLogId, 
// Validation
ValidationUtils, validateEntity, validateRelation, 
// Logging
createLogger, logger, timeOperation } from './utils/index.js';
//# sourceMappingURL=index.js.map