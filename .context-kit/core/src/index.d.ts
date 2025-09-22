/**
 * tkr-context-kit Core Module
 * Unified core library for knowledge graph, search, logging, and database operations
 *
 * @version 1.0.0
 * @author Tucker
 */
export { DatabaseConnection, createDatabaseConnection, StatementManager, CommonStatements, createCommonStatements, SCHEMA_SQL, MIGRATIONS, CURRENT_SCHEMA_VERSION } from './database/index.js';
export * from './types/index.js';
export * from './utils/index.js';
export { QueryParser, UnifiedSearchEngine, SearchIndexer } from './search/index.js';
export { KnowledgeGraph } from './knowledge-graph/index.js';
export { LoggingService } from './logging/index.js';
export declare const CORE_VERSION = "1.0.0";
export declare const CORE_NAME = "@tkr-context-kit/core";
export interface CoreModuleInfo {
    version: string;
    name: string;
    components: string[];
    buildTime: string;
}
export declare const getCoreModuleInfo: () => CoreModuleInfo;
export type { Entity, Relation, DatabaseConfig, SearchOptions, SearchResult, SearchPatternType, LogLevel, LogEntry, LogFilters, LogServiceConfig, CoreModuleConfig } from './types/index.js';
export { config, ConfigManager, IdGenerator, generateEntityId, generateRelationId, generateLogId, ValidationUtils, validateEntity, validateRelation, createLogger, logger, timeOperation } from './utils/index.js';
//# sourceMappingURL=index.d.ts.map