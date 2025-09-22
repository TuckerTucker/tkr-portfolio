/**
 * Core Types Exports
 * Central export point for all type definitions
 */

// Knowledge Graph Types
export type {
  Entity,
  Relation,
  KnowledgeGraphConfig,
  KnowledgeGraphStats,
  EntityCreationData,
  RelationCreationData,
  EntityFilter,
  RelationFilter,
  SourceLocation,
  EntityMetadata,
  RelationContext,
  Observation,
  EntityTypeDefinition,
  RelationTypeDefinition,
  MemoryUsage,
  QueryOptions,
  EntityQueryResult,
  Impact,
  DirectImpact,
  IndirectImpact,
  ImpactAnalysisMetadata,
  StateMutation,
  WorkflowTrace,
  WorkflowPhase,
  ComponentInfo,
  ComponentMetadata,
  StoryInfo,
  Story,
  Interaction,
  StoryMetadata,
  StoryCoverage,
  GenerationSpec,
  GenerationOutput,
  GeneratedCode,
  GenerationMetadata,
  Pattern,
  PatternMetadata,
  GraphTraversalOptions,
  TraversalStopCondition
} from './knowledge-graph.js';

// Search System Types
export type {
  SearchOptions,
  SearchResult,
  SearchMatch,
  SearchPatternType,
  ParsedQuery,
  ParsedQueryFilter,
  SearchIndexEntry,
  SearchEngineConfig,
  SearchStats
} from './search.js';

// Logging System Types
export type {
  LogLevel,
  LogEntry,
  LogFilters,
  LogFilter,
  LogQuery,
  LogStats,
  LogAggregation,
  LogServiceConfig,
  TransportConfig,
  HealthStatus,
  HealthCheck,
  ServiceStatus,
  LogQueryResult
} from './logging.js';

// Configuration Types
export type {
  DatabaseConfig,
  ServerConfig,
  MCPServerConfig,
  CoreModuleConfig,
  EnvironmentConfig,
  ValidationRule,
  ConfigSchema
} from './config.js';

// Common Error Types
export interface CoreError extends Error {
  code: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

export interface ValidationError extends CoreError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
  expected: string;
}

export interface DatabaseError extends CoreError {
  code: 'DATABASE_ERROR';
  query?: string;
  params?: any[];
}

export interface SearchError extends CoreError {
  code: 'SEARCH_ERROR';
  query: string;
  pattern?: string;
}

export interface ConfigurationError extends CoreError {
  code: 'CONFIGURATION_ERROR';
  configPath?: string;
  invalidKeys?: string[];
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> & {
  [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
}[Keys];

export type Awaitable<T> = T | Promise<T>;

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextOffset?: number;
}

export interface TimestampFields {
  created_at: number;
  updated_at?: number;
}