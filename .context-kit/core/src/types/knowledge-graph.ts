/**
 * Knowledge Graph Type Definitions for tkr-context-kit v2.0
 *
 * Core interfaces for entities, relations, and knowledge graph operations.
 * These types serve as contracts for all knowledge graph modules.
 */

/**
 * Core entity interface representing any tracked object in the knowledge graph
 */
export interface Entity {
  /** Unique identifier for the entity */
  id: string;

  /** Type classification of the entity (e.g., 'file', 'component', 'function') */
  type: string;

  /** Human-readable name of the entity */
  name: string;

  /** Flexible data storage for entity-specific properties */
  data: Record<string, any>;

  /** Unix timestamp of entity creation */
  created_at?: number;

  /** Unix timestamp of last modification */
  updated_at?: number;

  /** Version number for optimistic concurrency control */
  version?: number;

  /** Optional file path for file-based entities */
  file_path?: string;

  /** Optional source location information */
  source_location?: SourceLocation;

  /** Tags for entity categorization */
  tags?: string[];

  /** Entity metadata for indexing and search */
  metadata?: EntityMetadata;
}

/**
 * Source location information for entities
 */
export interface SourceLocation {
  /** File path relative to project root */
  file: string;

  /** Line number (1-based) */
  line?: number;

  /** Column number (1-based) */
  column?: number;

  /** End line number for multi-line entities */
  end_line?: number;

  /** End column number for multi-line entities */
  end_column?: number;
}

/**
 * Metadata for entity indexing and search optimization
 */
export interface EntityMetadata {
  /** Keywords for search indexing */
  keywords?: string[];

  /** Description or documentation */
  description?: string;

  /** Language/framework specific metadata */
  language?: string;

  /** Complexity score or metrics */
  complexity?: number;

  /** Last analysis timestamp */
  last_analyzed?: number;

  /** Hash for change detection */
  content_hash?: string;
}

/**
 * Relationship between two entities in the knowledge graph
 */
export interface Relation {
  /** Unique identifier for the relation */
  id: string;

  /** Source entity ID */
  from_id: string;

  /** Target entity ID */
  to_id: string;

  /** Alternative name for source entity ID (for compatibility) */
  fromEntityId?: string;

  /** Alternative name for target entity ID (for compatibility) */
  toEntityId?: string;

  /** Type of relationship (e.g., 'imports', 'extends', 'calls') */
  type: string;

  /** Additional properties specific to the relation type */
  properties?: Record<string, any>;

  /** Unix timestamp of relation creation */
  created_at?: number;

  /** Unix timestamp of last modification */
  updated_at?: number;

  /** Weight or strength of the relationship */
  weight?: number;

  /** Directionality flag (default: true for directed) */
  directed?: boolean;

  /** Optional context information */
  context?: RelationContext;
}

/**
 * Context information for relations
 */
export interface RelationContext {
  /** Source file where relation is defined */
  source_file?: string;

  /** Line number where relation occurs */
  line_number?: number;

  /** Additional contextual data */
  metadata?: Record<string, any>;
}

/**
 * Observation record for tracking entity state changes
 */
export interface Observation {
  /** Unique identifier (auto-generated if not provided) */
  id?: number;

  /** Entity being observed */
  entity_id: string;

  /** Property or attribute being observed */
  key: string;

  /** Observed value (JSON serialized) */
  value: string;

  /** Unix timestamp of observation */
  created_at?: number;

  /** Type of observation */
  observation_type?: 'create' | 'update' | 'delete' | 'access';

  /** Observer context */
  observer?: string;
}

/**
 * Configuration for knowledge graph instances
 */
export interface KnowledgeGraphConfig {
  /** Path to SQLite database file */
  databasePath?: string;

  /** Project root directory for relative path resolution */
  projectRoot?: string;

  /** Glob patterns for files to analyze */
  analysisPatterns?: string[];

  /** Enable full-text search capabilities */
  enableFullTextSearch?: boolean;

  /** Enable MCP integration */
  enableMCP?: boolean;

  /** Maximum entities to load in memory */
  maxEntitiesInMemory?: number;

  /** Auto-save interval in milliseconds */
  autoSaveInterval?: number;

  /** Enable versioning for entities */
  enableVersioning?: boolean;

  /** Custom entity type definitions */
  entityTypes?: EntityTypeDefinition[];

  /** Custom relation type definitions */
  relationTypes?: RelationTypeDefinition[];

  /** Database connection settings */
  readonly?: boolean;
  timeout?: number;
  maxConnections?: number;

  /** Caching configuration */
  enableCaching?: boolean;
  maxCacheSize?: number;

  /** Indexing configuration */
  enableIndexing?: boolean;
  autoOptimize?: boolean;

  /** Traversal settings */
  traversalMaxDepth?: number;

  /** Analytics settings */
  analyticsEnabled?: boolean;
}

/**
 * Entity type definition for schema validation
 */
export interface EntityTypeDefinition {
  /** Type name */
  name: string;

  /** Human-readable description */
  description: string;

  /** Required properties in entity.data */
  requiredProperties: string[];

  /** Optional properties in entity.data */
  optionalProperties?: string[];

  /** JSON schema for validation */
  schema?: Record<string, any>;
}

/**
 * Relation type definition for schema validation
 */
export interface RelationTypeDefinition {
  /** Relation type name */
  name: string;

  /** Human-readable description */
  description: string;

  /** Valid source entity types */
  validSourceTypes: string[];

  /** Valid target entity types */
  validTargetTypes: string[];

  /** Whether relation is bidirectional */
  bidirectional?: boolean;

  /** JSON schema for properties validation */
  propertiesSchema?: Record<string, any>;
}

/**
 * Statistics about the knowledge graph
 */
export interface KnowledgeGraphStats {
  /** Total number of entities */
  entityCount: number;

  /** Total number of relations */
  relationCount: number;

  /** Entities grouped by type */
  entitiesByType: Record<string, number>;

  /** Relations grouped by type */
  relationsByType: Record<string, number>;

  /** Database size in bytes */
  databaseSize: number;

  /** Last analysis timestamp */
  lastAnalysis: number;

  /** Analysis duration in milliseconds */
  analysisDuration?: number;

  /** Search index size in bytes */
  searchIndexSize?: number;

  /** Memory usage statistics */
  memoryUsage?: MemoryUsage;

  /** Average entity connections */
  averageEntityConnections?: number;
}

/**
 * Memory usage statistics
 */
export interface MemoryUsage {
  /** Entities in memory */
  entitiesInMemory: number;

  /** Relations in memory */
  relationsInMemory: number;

  /** Estimated memory usage in bytes */
  estimatedBytes: number;

  /** Cache hit ratio */
  cacheHitRatio?: number;
}

/**
 * Query options for knowledge graph operations
 */
export interface QueryOptions {
  /** Maximum number of results */
  limit?: number;

  /** Number of results to skip */
  offset?: number;

  /** Field to order by */
  orderBy?: string;

  /** Sort direction */
  orderDirection?: 'ASC' | 'DESC';

  /** Include related entities */
  includeRelations?: boolean;

  /** Maximum depth for relation traversal */
  maxDepth?: number;

  /** Filter by entity types */
  entityTypes?: string[];

  /** Filter by relation types */
  relationTypes?: string[];

  /** Include soft-deleted entities */
  includeSoftDeleted?: boolean;
}

/**
 * Result of entity queries with optional relations
 */
export interface EntityQueryResult {
  /** Matching entities */
  entities: Entity[];

  /** Related entities (if includeRelations=true) */
  relations?: Relation[];

  /** Total count (for pagination) */
  totalCount: number;

  /** Query execution time in milliseconds */
  executionTime?: number;
}

/**
 * Impact analysis result for entity changes
 */
export interface Impact {
  /** Entity being analyzed */
  entity: string;

  /** Type of change */
  changeType: string;

  /** Directly impacted entities */
  direct: DirectImpact[];

  /** Indirectly impacted entities */
  indirect: IndirectImpact[];

  /** Overall severity assessment */
  severity: 'low' | 'medium' | 'high' | 'critical';

  /** Analysis metadata */
  metadata?: ImpactAnalysisMetadata;
}

/**
 * Direct impact on related entities
 */
export interface DirectImpact {
  /** Impacted entity ID */
  impacted_entity: string;

  /** Entity type */
  entity_type: string;

  /** Relation type causing the impact */
  relation_type: string;

  /** Impact confidence score (0-1) */
  confidence?: number;

  /** Suggested actions */
  suggestedActions?: string[];
}

/**
 * Indirect impact through relation chains
 */
export interface IndirectImpact {
  /** Entity name */
  name: string;

  /** Entity type */
  type: string;

  /** Depth level from source entity */
  level: number;

  /** Path of relations leading to impact */
  path?: string[];

  /** Impact probability (0-1) */
  probability?: number;
}

/**
 * Metadata for impact analysis
 */
export interface ImpactAnalysisMetadata {
  /** Analysis timestamp */
  analyzed_at: number;

  /** Analysis duration in milliseconds */
  duration: number;

  /** Maximum depth analyzed */
  max_depth: number;

  /** Number of entities analyzed */
  entities_analyzed: number;

  /** Analysis algorithm version */
  algorithm_version?: string;
}

/**
 * State mutation tracking for workflow analysis
 */
export interface StateMutation {
  /** Action that caused the mutation */
  action: string;

  /** Event or condition that triggered the action */
  trigger: string;

  /** Data store or component affected */
  store: string;

  /** Description of changes made */
  changes: string;

  /** Timestamp of mutation */
  timestamp?: number;

  /** Entity that performed the mutation */
  actor?: string;

  /** Context information */
  context?: Record<string, any>;
}

/**
 * Workflow trace for complex operations
 */
export interface WorkflowTrace {
  /** Workflow definition or metadata */
  workflow: Record<string, any>;

  /** Execution phases */
  phases: WorkflowPhase[];

  /** Overall workflow status */
  status?: 'pending' | 'running' | 'completed' | 'failed';

  /** Start timestamp */
  started_at?: number;

  /** End timestamp */
  completed_at?: number;

  /** Error information if failed */
  error?: string;
}

/**
 * Individual phase in a workflow trace
 */
export interface WorkflowPhase {
  /** Phase name or identifier */
  name: string;

  /** Phase-specific data */
  data: Record<string, any>;

  /** Actions performed in this phase */
  actions: Record<string, any>[];

  /** Phase status */
  status?: 'pending' | 'running' | 'completed' | 'failed';

  /** Phase start timestamp */
  started_at?: number;

  /** Phase completion timestamp */
  completed_at?: number;

  /** Phase duration in milliseconds */
  duration?: number;
}

/**
 * Component information for code analysis
 */
export interface ComponentInfo {
  /** Component name */
  name: string;

  /** Component type (e.g., 'react', 'vue', 'function') */
  type: string;

  /** File location */
  location: string;

  /** Component properties or parameters */
  props?: string[];

  /** Dependencies on other components */
  dependencies?: string[];

  /** Exported symbols */
  exports?: string[];

  /** Component metadata */
  metadata?: ComponentMetadata;
}

/**
 * Metadata for component analysis
 */
export interface ComponentMetadata {
  /** Lines of code */
  linesOfCode?: number;

  /** Cyclomatic complexity */
  complexity?: number;

  /** Test coverage percentage */
  testCoverage?: number;

  /** Documentation coverage */
  documentationCoverage?: number;

  /** Last modified timestamp */
  lastModified?: number;

  /** Framework version */
  frameworkVersion?: string;
}

/**
 * Story information for Storybook integration
 */
export interface StoryInfo {
  /** Associated component */
  component: string;

  /** Story title */
  title: string;

  /** Individual stories */
  stories: Story[];

  /** Interactive tests */
  interactions?: Interaction[];

  /** Story metadata */
  metadata?: StoryMetadata;
}

/**
 * Individual story definition
 */
export interface Story {
  /** Story name */
  name: string;

  /** Story arguments/props */
  args: Record<string, any>;

  /** Story description */
  description?: string;

  /** Story parameters */
  parameters?: Record<string, any>;

  /** Play function for interactions */
  play?: string;
}

/**
 * Interactive test definition
 */
export interface Interaction {
  /** Interaction name */
  name: string;

  /** Event or trigger */
  trigger: string;

  /** Expected outcomes */
  expectations: string[];

  /** Test timeout in milliseconds */
  timeout?: number;

  /** Retry configuration */
  retries?: number;
}

/**
 * Metadata for story analysis
 */
export interface StoryMetadata {
  /** Number of stories */
  storyCount: number;

  /** Number of interactions */
  interactionCount: number;

  /** Coverage metrics */
  coverage?: StoryCoverage;

  /** Last updated timestamp */
  lastUpdated?: number;
}

/**
 * Coverage metrics for stories
 */
export interface StoryCoverage {
  /** Percentage of component props covered */
  propsCoverage: number;

  /** Percentage of component states covered */
  statesCoverage: number;

  /** Percentage of user interactions covered */
  interactionsCoverage: number;
}

/**
 * Code generation specification
 */
export interface GenerationSpec {
  /** Target entity type */
  entityType: string;

  /** Generation pattern */
  pattern: string;

  /** Generated artifact name */
  name: string;

  /** Framework or library context */
  framework?: string;

  /** State management approach */
  stateManager?: string;

  /** Template variables */
  variables?: Record<string, any>;

  /** Output configuration */
  output?: GenerationOutput;

  /** Additional generator options */
  [key: string]: any;
}

/**
 * Output configuration for code generation
 */
export interface GenerationOutput {
  /** Output directory */
  directory: string;

  /** File name template */
  filename: string;

  /** File extension */
  extension: string;

  /** Whether to overwrite existing files */
  overwrite?: boolean;

  /** Post-processing commands */
  postProcess?: string[];
}

/**
 * Generated code result
 */
export interface GeneratedCode {
  /** Generated source code */
  code: string;

  /** Usage examples */
  examples: any[];

  /** Generation rules applied */
  rules: string[];

  /** Generation metadata */
  metadata?: GenerationMetadata;
}

/**
 * Metadata for code generation
 */
export interface GenerationMetadata {
  /** Template used */
  template: string;

  /** Generator version */
  generatorVersion: string;

  /** Generation timestamp */
  generatedAt: number;

  /** Input specifications */
  inputSpecs: GenerationSpec;

  /** Warnings or notes */
  warnings?: string[];
}

/**
 * Code pattern definition
 */
export interface Pattern {
  /** Pattern name */
  name: string;

  /** Template string */
  template: string;

  /** Application rules */
  rules: string[];

  /** Template variables */
  variables: Record<string, string>;

  /** Pattern metadata */
  metadata?: PatternMetadata;
}

/**
 * Metadata for code patterns
 */
export interface PatternMetadata {
  /** Pattern category */
  category: string;

  /** Framework compatibility */
  frameworks: string[];

  /** Pattern complexity score */
  complexity: number;

  /** Usage frequency */
  usageCount?: number;

  /** Last used timestamp */
  lastUsed?: number;
}

/**
 * Filter criteria for entity queries
 */
export interface EntityFilter {
  /** Filter by entity type */
  type?: string | string[];
  /** Filter by entity name (supports wildcards) */
  name?: string;
  /** Filter by tags */
  tags?: string | string[];
  /** Filter by file path pattern */
  file_path?: string;
  /** Filter by creation date range */
  createdAfter?: number;
  createdBefore?: number;
  /** Filter by update date range */
  updatedAfter?: number;
  updatedBefore?: number;
  /** Custom property filters */
  properties?: Record<string, any>;
}

/**
 * Filter criteria for relation queries
 */
export interface RelationFilter {
  /** Filter by relation type */
  type?: string | string[];
  /** Filter by source entity ID */
  from_id?: string | string[];
  /** Filter by target entity ID */
  to_id?: string | string[];
  /** Alternative source entity ID filter (for compatibility) */
  fromEntityId?: string | string[];
  /** Alternative target entity ID filter (for compatibility) */
  toEntityId?: string | string[];
  /** Filter by source entity type */
  from_type?: string | string[];
  /** Filter by target entity type */
  to_type?: string | string[];
  /** Filter by creation date range */
  createdAfter?: number;
  createdBefore?: number;
  /** Filter by update date range */
  updatedAfter?: number;
  updatedBefore?: number;
  /** Custom property filters */
  properties?: Record<string, any>;
}

/**
 * Data for creating new entities
 */
export interface EntityCreationData {
  /** Entity type */
  type: string;
  /** Entity name */
  name: string;
  /** Entity data properties */
  data?: Record<string, any>;
  /** File path for file-based entities */
  file_path?: string;
  /** Source location */
  source_location?: SourceLocation;
  /** Entity tags */
  tags?: string[];
  /** Entity metadata */
  metadata?: EntityMetadata;
}

/**
 * Data for creating new relations
 */
export interface RelationCreationData {
  /** Source entity ID */
  from_id: string;
  /** Target entity ID */
  to_id: string;
  /** Alternative source entity ID (for compatibility) */
  fromEntityId?: string;
  /** Alternative target entity ID (for compatibility) */
  toEntityId?: string;
  /** Relation type */
  type: string;
  /** Relation properties */
  properties?: Record<string, any>;
  /** Relation weight */
  weight?: number;
  /** Directionality */
  directed?: boolean;
  /** Context information */
  context?: RelationContext;
}

/**
 * Options for graph traversal operations
 */
export interface GraphTraversalOptions {
  /** Maximum traversal depth */
  maxDepth?: number;
  /** Direction of traversal */
  direction?: 'outgoing' | 'incoming' | 'both';
  /** Relation types to follow */
  relationTypes?: string[];
  /** Stop conditions */
  stopConditions?: TraversalStopCondition[];
  /** Include entity data in results */
  includeEntityData?: boolean;
  /** Include relation data in results */
  includeRelationData?: boolean;
}

/**
 * Stop condition for graph traversal
 */
export interface TraversalStopCondition {
  /** Type of stop condition */
  type: 'entity_type' | 'relation_type' | 'property' | 'depth';
  /** Condition value */
  value: any;
  /** Whether to include the matching node */
  inclusive?: boolean;
}