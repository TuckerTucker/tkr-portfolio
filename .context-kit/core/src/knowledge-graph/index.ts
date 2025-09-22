/**
 * Knowledge Graph Module Exports
 * Core knowledge graph operations and analytics
 */

export { KnowledgeGraph } from './core.js';

// Export key types
export type {
  Entity,
  Relation,
  KnowledgeGraphConfig,
  EntityCreationData,
  RelationCreationData,
  KnowledgeGraphStats,
  GraphTraversalOptions,
  EntityFilter,
  RelationFilter
} from '../types/knowledge-graph.js';

// Export additional interfaces
export type {
  TraversalResult,
  GraphAnalytics
} from './core.js';