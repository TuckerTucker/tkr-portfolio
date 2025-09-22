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

// Export local implementations
export { ProjectScanner } from './integration/project-scanner.js';
export { StaticAnalyzer } from './analyzers/static-analyzer.js';
export { StorybookAnalyzer } from './analyzers/storybook-analyzer.js';

// HTTP API
export { KnowledgeGraphHttpServerSimple } from './api/http-server-simple.js';

// Re-export KnowledgeGraph as default
export { KnowledgeGraph as default } from '@tkr-context-kit/core';