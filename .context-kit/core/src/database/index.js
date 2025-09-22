/**
 * Database Module Exports
 * Central export point for all database functionality
 */
// Core database classes
export { DatabaseConnection, createDatabaseConnection } from './connection.js';
export { StatementManager, CommonStatements, createCommonStatements } from './statements.js';
// Schema and migrations
export { SCHEMA_SQL, MIGRATIONS, CURRENT_SCHEMA_VERSION, getTableSchema, validateSchemaVersion, getTableNames, getTableIndexes } from './schema.js';
// Database errors
export { DatabaseError, TransactionError, ConnectionError, SchemaError } from './types.js';
//# sourceMappingURL=index.js.map