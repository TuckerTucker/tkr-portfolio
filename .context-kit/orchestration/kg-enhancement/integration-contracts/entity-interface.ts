/**
 * Integration Contract: Entity Interface
 *
 * This interface defines the structure all entities must conform to
 * for the knowledge graph system. All agents must use this structure
 * when creating or updating entities.
 */

/**
 * Core entity types recognized by the knowledge graph
 */
export type EntityType =
  | 'UIComponent'      // Components in /ui directory
  | 'SlideComponent'   // Components in /html-slides directory
  | 'LayoutComponent'  // Header, Footer, layout components
  | 'FeatureComponent' // Feature-specific components
  | 'CustomComponent'  // Custom/specialized components
  | 'Hook'            // React hooks (use*)
  | 'Context'         // React contexts
  | 'Story'           // Storybook stories
  | 'Test'            // Test files
  | 'DataSource'      // JSON data files
  | 'Configuration'   // Config files
  | 'Utility'         // Helper functions
  | 'Service'         // Service layer components
  | 'API'             // API endpoints
  | 'Type'            // TypeScript types/interfaces
  | 'Style'           // CSS/style files
  | 'Documentation';  // Documentation files

/**
 * Component prop definition
 */
export interface PropDefinition {
  name: string;
  type: string;
  optional: boolean;
  defaultValue?: any;
  description?: string;
}

/**
 * Orchestration support - Territory classification
 */
export type Territory = 'ui' | 'layout' | 'content' | 'data' | 'story' | 'test' | 'config' | 'shared';

/**
 * Orchestration support - Complexity levels
 */
export type ComplexityLevel = 'simple' | 'medium' | 'complex';

/**
 * Orchestration support - Stability classification
 */
export type Stability = 'stable' | 'evolving' | 'experimental' | 'deprecated';

/**
 * Orchestration support - Impact radius
 */
export type ImpactLevel = 'leaf' | 'local' | 'regional' | 'global';

/**
 * Main entity structure for knowledge graph
 */
export interface KGEntity {
  id: string;                    // Unique identifier (generated)
  type: EntityType;              // Entity classification
  name: string;                  // Entity name
  data: {
    // Core properties (required)
    location: string;            // File path relative to project root

    // Component properties (optional)
    category?: string;           // Sub-categorization within type
    props?: PropDefinition[];    // Component prop definitions
    hooks?: string[];           // Hooks used by this component
    dependencies?: string[];     // Direct dependencies (imports)
    exports?: string[];         // What this module exports

    // Code metrics (optional)
    lineCount?: number;         // Lines of code
    complexity?: number;        // Cyclomatic complexity

    // Documentation (optional)
    description?: string;       // Brief description
    purpose?: string;          // Purpose/responsibility

    // Orchestration metadata (required for Wave 4)
    territory?: Territory;      // Territorial assignment
    complexityLevel?: ComplexityLevel;  // Complexity assessment
    stability?: Stability;      // API stability
    impactRadius?: ImpactLevel; // Change impact radius
    integrationPoints?: string[]; // Other entities this connects to
    modificationRisk?: 'low' | 'medium' | 'high';

    // Additional metadata
    lastModified?: number;      // Timestamp of last modification
    author?: string;           // Primary author/owner
    tags?: string[];          // Additional tags for categorization
  };

  // System metadata (auto-generated)
  created_at: number;           // Creation timestamp
  updated_at: number;           // Last update timestamp
  version: number;              // Entity version number
}

/**
 * Entity creation input (subset used when creating new entities)
 */
export interface CreateEntityInput {
  type: EntityType;
  name: string;
  data: Partial<KGEntity['data']>;  // All data fields optional on creation
}

/**
 * Entity update input
 */
export interface UpdateEntityInput {
  id: string;
  data: Partial<KGEntity['data']>;  // Update only specified fields
}

/**
 * Analysis result from analyzers
 */
export interface AnalysisResult {
  entities: CreateEntityInput[];
  suggestedRelationships?: Array<{
    fromName: string;
    toName: string;
    type: string;
  }>;
  metrics?: {
    filesAnalyzed: number;
    entitiesCreated: number;
    errors?: string[];
  };
}

/**
 * Contract validation function
 * All agents must call this before creating entities
 */
export function validateEntity(entity: Partial<KGEntity>): boolean {
  // Required fields
  if (!entity.type || !entity.name || !entity.data?.location) {
    return false;
  }

  // Type validation
  const validTypes: EntityType[] = [
    'UIComponent', 'SlideComponent', 'LayoutComponent', 'FeatureComponent',
    'CustomComponent', 'Hook', 'Context', 'Story', 'Test', 'DataSource',
    'Configuration', 'Utility', 'Service', 'API', 'Type', 'Style', 'Documentation'
  ];

  if (!validTypes.includes(entity.type)) {
    return false;
  }

  // Territory validation (if provided)
  if (entity.data.territory) {
    const validTerritories: Territory[] = [
      'ui', 'layout', 'content', 'data', 'story', 'test', 'config', 'shared'
    ];
    if (!validTerritories.includes(entity.data.territory)) {
      return false;
    }
  }

  return true;
}