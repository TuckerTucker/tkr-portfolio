/**
 * Search Module Exports
 * Pattern-aware search system components
 */

export { QueryParser } from './parser.js';
export { UnifiedSearchEngine } from './engine.js';
export { SearchIndexer } from './indexer.js';

// Export key types
export type {
  SearchOptions,
  SearchResult,
  ParsedQuery,
  SearchPatternType,
  SearchEngineConfig,
  SearchStats
} from '../types/search.js';