// Re-export from unified core module
export {
  KnowledgeGraph,
  LoggingService,
  DatabaseConnection,
  createDatabaseConnection,
  logger,
  type Entity,
  type Relation,
  type LogLevel,
  type LogEntry
} from '@tkr-context-kit/core';

// Local implementations removed - transitioning to agent-based analysis
// Analysis functionality moved to Claude Code agents using MCP CRUD operations

// HTTP API
export { KnowledgeGraphHttpServerSimple } from './api/http-server-simple.js';

// Re-export KnowledgeGraph as default
export { KnowledgeGraph as default } from '@tkr-context-kit/core';