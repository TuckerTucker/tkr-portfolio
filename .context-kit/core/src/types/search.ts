/**
 * Search System Type Definitions for tkr-context-kit v2.0
 *
 * Comprehensive interfaces for search functionality across the knowledge graph,
 * including full-text search, pattern matching, and advanced filtering.
 */

/**
 * Base search options for all search operations
 */
export interface SearchOptions {
  /** Maximum number of results to return */
  limit?: number;

  /** Number of results to skip (for pagination) */
  offset?: number;

  /** Case-sensitive search flag */
  caseSensitive?: boolean;

  /** Include related entities in results */
  includeRelations?: boolean;

  /** Minimum score threshold for results */
  scoreThreshold?: number;

  /** Search scope configuration */
  scope?: SearchScope;

  /** Result sorting options */
  sorting?: SearchSorting;

  /** Search query timeout in milliseconds */
  timeout?: number;

  /** Enable query highlighting in results */
  highlight?: boolean;

  /** Maximum number of highlighted snippets */
  maxSnippets?: number;

  /** Search performance preferences */
  performance?: SearchPerformance;

  /** Sort field (alternative to sorting) */
  sortBy?: string;

  /** Sort order (alternative to sorting) */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Search scope configuration
 */
export interface SearchScope {
  /** Entity types to search within */
  entityTypes?: string[];

  /** File paths to include (glob patterns) */
  includePaths?: string[];

  /** File paths to exclude (glob patterns) */
  excludePaths?: string[];

  /** Languages/frameworks to focus on */
  languages?: string[];

  /** Date range for entity creation/modification */
  dateRange?: DateRange;

  /** Custom filter conditions */
  customFilters?: Record<string, any>;
}

/**
 * Date range specification
 */
export interface DateRange {
  /** Start date (Unix timestamp) */
  start?: number;

  /** End date (Unix timestamp) */
  end?: number;

  /** Relative time window (e.g., "7d", "1h") */
  window?: string;
}

/**
 * Search result sorting configuration
 */
export interface SearchSorting {
  /** Field to sort by */
  field: 'score' | 'name' | 'created_at' | 'updated_at' | 'type' | 'relevance';

  /** Sort direction */
  direction: 'asc' | 'desc';

  /** Secondary sorting criteria */
  secondary?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

/**
 * Search performance preferences
 */
export interface SearchPerformance {
  /** Use approximate search for better performance */
  approximate?: boolean;

  /** Enable result caching */
  useCache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTtl?: number;

  /** Use parallel search execution */
  parallel?: boolean;

  /** Maximum search execution time */
  maxExecutionTime?: number;
}

/**
 * Comprehensive search result with metadata
 */
export interface SearchResult {
  /** Matching entity ID */
  entity_id: string;

  /** Original entity name */
  original_name: string;

  /** Entity type */
  entity_type: string;

  /** File path (if applicable) */
  file_path?: string;

  /** Search relevance score (0-1) */
  score: number;

  /** Highlighted content snippets */
  highlights?: SearchHighlight[];

  /** Matching context */
  context?: SearchContext;

  /** Related entities (if requested) */
  relations?: RelatedEntity[];

  /** Result metadata */
  metadata?: SearchResultMetadata;
}

/**
 * Search result highlighting information
 */
export interface SearchHighlight {
  /** Field that contains the match */
  field: string;

  /** Text snippet with highlighting markers */
  snippet: string;

  /** Start position of match in original text */
  startPos: number;

  /** End position of match in original text */
  endPos: number;

  /** Match confidence score */
  confidence?: number;
}

/**
 * Context information for search matches
 */
export interface SearchContext {
  /** Surrounding text context */
  textContext?: string;

  /** Line number in source file */
  lineNumber?: number;

  /** Function or class containing the match */
  containingScope?: string;

  /** Additional contextual metadata */
  metadata?: Record<string, any>;
}

/**
 * Related entity in search results
 */
export interface RelatedEntity {
  /** Entity ID */
  id: string;

  /** Entity name */
  name: string;

  /** Entity type */
  type: string;

  /** Relation type to main result */
  relationType: string;

  /** Relationship strength/weight */
  relationWeight?: number;
}

/**
 * Search result metadata
 */
export interface SearchResultMetadata {
  /** Search execution time for this result */
  executionTime?: number;

  /** Index or rank in result set */
  rank: number;

  /** Whether result was cached */
  fromCache?: boolean;

  /** Additional scoring details */
  scoreBreakdown?: ScoreBreakdown;

  /** Result freshness indicator */
  freshness?: number;
}

/**
 * Detailed score breakdown
 */
export interface ScoreBreakdown {
  /** Text relevance score */
  textRelevance: number;

  /** Structural importance score */
  structuralImportance: number;

  /** Recency bonus */
  recencyBonus: number;

  /** Type priority modifier */
  typePriority: number;

  /** Custom scoring factors */
  customFactors?: Record<string, number>;
}

/**
 * Parsed search query with structured components
 */
export interface ParsedQuery {
  /** Query type */
  type: SearchQueryType;

  /** Main search value */
  value: string;

  /** Query modifiers */
  modifiers: QueryModifier[];

  /** Original raw query string */
  raw: string;

  /** Parsed query metadata */
  metadata?: ParsedQueryMetadata;

  /** Composite query filters */
  filters?: ParsedQueryFilter[];
}

/**
 * Search query type enumeration
 */
export type SearchQueryType =
  | 'wildcard'
  | 'prefix'
  | 'suffix'
  | 'extension'
  | 'type'
  | 'fuzzy'
  | 'regex'
  | 'exact'
  | 'text'
  | 'contains'
  | 'path'
  | 'composite'
  | 'semantic'
  | 'structural';

/**
 * Query modifier for advanced search features
 */
export interface QueryModifier {
  /** Modifier type */
  type: 'filter' | 'boost' | 'exclude' | 'scope' | 'transform';

  /** Modifier field or target */
  field: string;

  /** Modifier value */
  value: any;

  /** Modifier weight or importance */
  weight?: number;

  /** Regex flags for regex modifiers */
  regexFlags?: string;
}

/**
 * Parsed query metadata
 */
export interface ParsedQueryMetadata {
  /** Complexity score of the query */
  complexity: number;

  /** Estimated execution cost */
  estimatedCost: number;

  /** Whether query can use indexes */
  canUseIndex: boolean;

  /** Suggested optimizations */
  optimizations?: string[];

  /** Parse warnings */
  warnings?: string[];
}

/**
 * Wildcard search pattern
 */
export interface WildcardPattern {
  /** Pattern string with wildcards (*,?) */
  pattern: string;

  /** Case sensitivity flag */
  caseSensitive?: boolean;

  /** Field to match against */
  field?: string;

  /** Pattern compilation flags */
  flags?: WildcardFlags;
}

/**
 * Wildcard pattern flags
 */
export interface WildcardFlags {
  /** Enable glob-style patterns */
  glob?: boolean;

  /** Allow escaping special characters */
  escape?: boolean;

  /** Treat . as literal character */
  dotAll?: boolean;
}

/**
 * Prefix search configuration
 */
export interface PrefixSearch {
  /** Prefix string to match */
  prefix: string;

  /** Minimum prefix length */
  minLength?: number;

  /** Maximum suggestions to return */
  maxSuggestions?: number;

  /** Include fuzzy prefix matches */
  fuzzy?: boolean;

  /** Field-specific prefix search */
  fields?: string[];
}

/**
 * Suffix search configuration
 */
export interface SuffixSearch {
  /** Suffix string to match */
  suffix: string;

  /** Minimum suffix length */
  minLength?: number;

  /** Case sensitivity */
  caseSensitive?: boolean;

  /** Target fields */
  fields?: string[];
}

/**
 * Extension-based search
 */
export interface ExtensionSearch {
  /** File extensions to match */
  extensions: string[];

  /** Include/exclude flag */
  include: boolean;

  /** Additional file filters */
  additionalFilters?: FileFilter[];
}

/**
 * File filter for extension search
 */
export interface FileFilter {
  /** Filter type */
  type: 'size' | 'modified' | 'created' | 'permission' | 'content';

  /** Filter operator */
  operator: 'eq' | 'gt' | 'lt' | 'gte' | 'lte' | 'contains' | 'matches';

  /** Filter value */
  value: any;
}

/**
 * Entity type search configuration
 */
export interface TypeSearch {
  /** Entity types to search for */
  types: string[];

  /** Include derived types */
  includeDerived?: boolean;

  /** Type hierarchy depth */
  hierarchyDepth?: number;

  /** Custom type filters */
  customFilters?: Record<string, any>;
}

/**
 * Fuzzy search configuration
 */
export interface FuzzySearch {
  /** Search term */
  term: string;

  /** Maximum edit distance */
  maxDistance?: number;

  /** Fuzzy algorithm */
  algorithm?: 'levenshtein' | 'damerau' | 'jaro' | 'soundex';

  /** Minimum similarity threshold */
  minSimilarity?: number;

  /** Character transposition cost */
  transpositionCost?: number;

  /** Phonetic matching options */
  phonetic?: PhoneticOptions;
}

/**
 * Phonetic matching options
 */
export interface PhoneticOptions {
  /** Enable phonetic matching */
  enabled: boolean;

  /** Phonetic algorithm */
  algorithm: 'soundex' | 'metaphone' | 'nysiis';

  /** Language-specific options */
  language?: string;
}

/**
 * Regular expression search
 */
export interface RegexSearch {
  /** Regular expression pattern */
  pattern: string;

  /** Regex flags */
  flags?: string;

  /** Maximum matches per entity */
  maxMatches?: number;

  /** Target fields for regex search */
  fields?: string[];

  /** Performance limits */
  limits?: RegexLimits;
}

/**
 * Regular expression performance limits
 */
export interface RegexLimits {
  /** Maximum pattern complexity */
  maxComplexity?: number;

  /** Maximum execution time */
  maxExecutionTime?: number;

  /** Maximum backtracking steps */
  maxBacktracks?: number;
}

/**
 * Exact match search configuration
 */
export interface ExactSearch {
  /** Exact term to match */
  term: string;

  /** Field-specific matching */
  fields?: string[];

  /** Case sensitivity */
  caseSensitive?: boolean;

  /** Word boundary matching */
  wholeWord?: boolean;

  /** Normalization options */
  normalization?: TextNormalization;
}

/**
 * Text normalization options
 */
export interface TextNormalization {
  /** Remove diacritics/accents */
  removeDiacritics?: boolean;

  /** Normalize whitespace */
  normalizeWhitespace?: boolean;

  /** Convert to lowercase */
  lowercase?: boolean;

  /** Remove punctuation */
  removePunctuation?: boolean;

  /** Custom normalization rules */
  customRules?: NormalizationRule[];
}

/**
 * Custom text normalization rule
 */
export interface NormalizationRule {
  /** Rule name */
  name: string;

  /** Pattern to match */
  pattern: string;

  /** Replacement value */
  replacement: string;

  /** Rule priority */
  priority?: number;
}

/**
 * Full-text search configuration
 */
export interface TextSearch {
  /** Search query string */
  query: string;

  /** Search mode */
  mode?: 'any' | 'all' | 'phrase' | 'boolean';

  /** Field weights for relevance scoring */
  fieldWeights?: Record<string, number>;

  /** Stop words to ignore */
  stopWords?: string[];

  /** Stemming configuration */
  stemming?: StemmingConfig;

  /** Synonym expansion */
  synonyms?: SynonymConfig;
}

/**
 * Stemming configuration
 */
export interface StemmingConfig {
  /** Enable stemming */
  enabled: boolean;

  /** Stemming algorithm */
  algorithm?: 'porter' | 'snowball' | 'lancaster';

  /** Language for stemming */
  language?: string;

  /** Custom stemming rules */
  customRules?: StemmingRule[];
}

/**
 * Custom stemming rule
 */
export interface StemmingRule {
  /** Word pattern */
  pattern: string;

  /** Stem result */
  stem: string;

  /** Rule confidence */
  confidence?: number;
}

/**
 * Synonym expansion configuration
 */
export interface SynonymConfig {
  /** Enable synonym expansion */
  enabled: boolean;

  /** Synonym dictionary */
  dictionary?: Record<string, string[]>;

  /** Synonym expansion weight */
  expansionWeight?: number;

  /** Maximum synonyms per term */
  maxSynonyms?: number;
}

/**
 * Semantic search configuration
 */
export interface SemanticSearch {
  /** Natural language query */
  query: string;

  /** Semantic model to use */
  model?: string;

  /** Embedding similarity threshold */
  similarityThreshold?: number;

  /** Context window size */
  contextWindow?: number;

  /** Semantic search options */
  options?: SemanticSearchOptions;
}

/**
 * Semantic search options
 */
export interface SemanticSearchOptions {
  /** Use pre-computed embeddings */
  usePrecomputedEmbeddings?: boolean;

  /** Embedding cache TTL */
  embeddingCacheTtl?: number;

  /** Similarity metric */
  similarityMetric?: 'cosine' | 'euclidean' | 'manhattan' | 'dot_product';

  /** Dimensionality reduction */
  dimensionalityReduction?: DimensionalityReduction;
}

/**
 * Dimensionality reduction configuration
 */
export interface DimensionalityReduction {
  /** Reduction algorithm */
  algorithm: 'pca' | 'tsne' | 'umap';

  /** Target dimensions */
  targetDimensions: number;

  /** Algorithm-specific parameters */
  parameters?: Record<string, any>;
}

/**
 * Structural search configuration
 */
export interface StructuralSearch {
  /** Structure pattern to match */
  pattern: StructuralPattern;

  /** Maximum search depth */
  maxDepth?: number;

  /** Include partial matches */
  includePartial?: boolean;

  /** Structure matching options */
  options?: StructuralSearchOptions;
}

/**
 * Structural pattern definition
 */
export interface StructuralPattern {
  /** Pattern type */
  type: 'tree' | 'graph' | 'sequence' | 'hierarchy';

  /** Pattern specification */
  specification: any;

  /** Pattern variables */
  variables?: Record<string, any>;

  /** Pattern constraints */
  constraints?: PatternConstraint[];
}

/**
 * Pattern constraint for structural search
 */
export interface PatternConstraint {
  /** Constraint type */
  type: 'cardinality' | 'ordering' | 'distance' | 'property';

  /** Constraint specification */
  specification: any;

  /** Constraint weight */
  weight?: number;
}

/**
 * Structural search options
 */
export interface StructuralSearchOptions {
  /** Allow approximate structural matches */
  allowApproximate?: boolean;

  /** Structural similarity threshold */
  similarityThreshold?: number;

  /** Maximum structural differences */
  maxDifferences?: number;

  /** Isomorphism checking */
  checkIsomorphism?: boolean;
}

/**
 * Search aggregation and analytics
 */
export interface SearchAggregation {
  /** Aggregation type */
  type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'histogram' | 'terms';

  /** Field to aggregate on */
  field: string;

  /** Aggregation parameters */
  parameters?: Record<string, any>;

  /** Nested aggregations */
  subAggregations?: SearchAggregation[];
}

/**
 * Search analytics and metrics
 */
export interface SearchAnalytics {
  /** Total search execution time */
  totalExecutionTime: number;

  /** Number of results found */
  resultCount: number;

  /** Number of entities scanned */
  entitiesScanned: number;

  /** Index usage statistics */
  indexUsage: IndexUsageStats;

  /** Query optimization suggestions */
  optimizationSuggestions?: OptimizationSuggestion[];

  /** Performance breakdown */
  performanceBreakdown?: PerformanceBreakdown;
}

/**
 * Index usage statistics
 */
export interface IndexUsageStats {
  /** Indexes used in the query */
  indexesUsed: string[];

  /** Index hit ratio */
  hitRatio: number;

  /** Index scan efficiency */
  scanEfficiency: number;

  /** Missing index suggestions */
  missingIndexes?: string[];
}

/**
 * Query optimization suggestion
 */
export interface OptimizationSuggestion {
  /** Suggestion type */
  type: 'index' | 'query_rewrite' | 'filter_order' | 'cache' | 'batch';

  /** Suggestion description */
  description: string;

  /** Estimated performance improvement */
  estimatedImprovement?: string;

  /** Implementation complexity */
  complexity: 'low' | 'medium' | 'high';
}

/**
 * Performance breakdown for search operations
 */
export interface PerformanceBreakdown {
  /** Query parsing time */
  queryParsing: number;

  /** Index lookup time */
  indexLookup: number;

  /** Result scoring time */
  resultScoring: number;

  /** Result formatting time */
  resultFormatting: number;

  /** Other processing time */
  other: number;
}

/**
 * Search session for tracking user search behavior
 */
export interface SearchSession {
  /** Session identifier */
  sessionId: string;

  /** User identifier (if available) */
  userId?: string;

  /** Session start time */
  startTime: number;

  /** Session end time */
  endTime?: number;

  /** Queries in this session */
  queries: SearchQuery[];

  /** Session metadata */
  metadata?: SearchSessionMetadata;
}

/**
 * Individual search query in a session
 */
export interface SearchQuery {
  /** Query identifier */
  queryId: string;

  /** Raw query string */
  query: string;

  /** Parsed query structure */
  parsedQuery: ParsedQuery;

  /** Query timestamp */
  timestamp: number;

  /** Query results */
  results: SearchResult[];

  /** Query analytics */
  analytics: SearchAnalytics;

  /** User interactions with results */
  interactions?: QueryInteraction[];
}

/**
 * User interaction with search results
 */
export interface QueryInteraction {
  /** Interaction type */
  type: 'click' | 'hover' | 'bookmark' | 'share' | 'copy';

  /** Target result ID */
  resultId: string;

  /** Interaction timestamp */
  timestamp: number;

  /** Additional interaction data */
  data?: Record<string, any>;
}

/**
 * Search session metadata
 */
export interface SearchSessionMetadata {
  /** User agent or client information */
  userAgent?: string;

  /** Search context or source */
  context?: string;

  /** Session quality score */
  qualityScore?: number;

  /** Session success indicators */
  successMetrics?: SessionSuccessMetrics;
}

/**
 * Success metrics for search sessions
 */
export interface SessionSuccessMetrics {
  /** Queries that led to result clicks */
  clickthroughRate: number;

  /** Average time to first click */
  timeToFirstClick?: number;

  /** Query reformulation rate */
  reformulationRate: number;

  /** Session abandonment indicator */
  abandoned: boolean;

  /** User satisfaction score (if available) */
  satisfactionScore?: number;
}

/**
 * Search match result
 */
export interface SearchMatch {
  /** Matched text */
  text: string;
  /** Match score */
  score: number;
  /** Match position */
  position: {
    start: number;
    end: number;
  };
  /** Match context */
  context?: string;
}

/**
 * Search pattern type enum
 */
export type SearchPatternType = 'glob' | 'regex' | 'literal' | 'fuzzy' | 'semantic';

/**
 * Parsed query filter for composite queries
 */
export interface ParsedQueryFilter {
  /** Filter type */
  type: SearchQueryType;
  /** Filter value */
  value: string;
  /** Filter modifiers */
  modifiers?: QueryModifier[];
}

/**
 * Search index entry
 */
export interface SearchIndexEntry {
  /** Entity ID */
  entityId: string;
  /** Indexed content */
  content: string;
  /** Content type */
  type: string;
  /** Index score */
  score?: number;
  /** Metadata */
  metadata?: Record<string, any>;
  /** Entity tags */
  tags?: string[];
  /** Full text content */
  full_text?: string;
  /** Trigram index data */
  trigrams?: string;
  /** Alternative entity ID field */
  entity_id?: string;
}

/**
 * Search engine configuration
 */
export interface SearchEngineConfig {
  /** Maximum results per query */
  maxResults?: number;
  /** Default result limit */
  defaultLimit?: number;
  /** Enable fuzzy search */
  enableFuzzySearch?: boolean;
  /** Fuzzy search threshold */
  fuzzyThreshold?: number;
  /** Enable regex search */
  enableRegexSearch?: boolean;
  /** Regex timeout in milliseconds */
  regexTimeout?: number;
  /** Index settings */
  indexSettings?: SearchIndexSettings;
}

/**
 * Search index settings
 */
export interface SearchIndexSettings {
  /** Enable full-text indexing */
  enableFullText: boolean;
  /** Index update interval */
  updateInterval: number;
  /** Maximum index size */
  maxIndexSize?: number;
}

/**
 * Search statistics
 */
export interface SearchStats {
  /** Total queries executed */
  totalQueries: number;
  /** Average query time */
  averageQueryTime: number;
  /** Cache hit rate */
  cacheHitRate: number;
  /** Index size */
  indexSize: number;
  /** Most common query types */
  popularQueryTypes: Record<SearchQueryType, number>;
}