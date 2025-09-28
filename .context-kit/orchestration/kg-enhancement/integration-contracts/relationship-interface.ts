/**
 * Integration Contract: Relationship Interface
 *
 * This interface defines the structure all relationships must conform to
 * in the knowledge graph. All agents creating relationships must use these
 * structures and types.
 */

/**
 * Core relationship types in the knowledge graph
 */
export type RelationType =
  | 'DEPENDS_ON'      // Import/require dependency
  | 'USES'           // Uses another component/hook/utility
  | 'CONTAINS'       // Parent contains child (composition)
  | 'PROVIDES'       // Provides interface/data/functionality
  | 'CONSUMES'       // Consumes data/API/service
  | 'EXTENDS'        // Extends/inherits from
  | 'IMPLEMENTS'     // Implements interface/pattern
  | 'DOCUMENTS'      // Documentation relationship (story → component)
  | 'TESTS'          // Test file → component
  | 'CONFIGURES'     // Configuration → component
  | 'STYLES'         // Stylesheet → component
  | 'RENDERS'        // Component renders another
  | 'MUTATES'        // Modifies state/data
  | 'OBSERVES'       // Watches/subscribes to
  | 'TRIGGERS'       // Triggers action/event
  | 'VALIDATES'      // Validates data/input
  | 'TRANSFORMS'     // Transforms data
  | 'ROUTES_TO'      // Navigation/routing
  | 'SHARES'         // Shares functionality/state
  | 'AFFECTS';       // General impact relationship

/**
 * Impact weight for orchestration planning
 */
export type ImpactWeight = 'low' | 'medium' | 'high' | 'critical';

/**
 * Integration type classification
 */
export type IntegrationType = 'tight' | 'loose' | 'optional';

/**
 * Relationship properties for orchestration support
 */
export interface RelationshipProperties {
  // Impact assessment
  impactWeight?: ImpactWeight;        // How much impact if changed
  cascadeRisk?: boolean;              // Changes cascade to dependencies
  breakingChange?: boolean;           // Would break if removed

  // Integration characteristics
  integrationType?: IntegrationType;  // How tightly coupled
  isAsync?: boolean;                  // Async relationship
  isOptional?: boolean;              // Optional dependency

  // Territorial boundaries
  crossTerritory?: boolean;          // Crosses territory boundaries
  fromTerritory?: string;            // Source territory
  toTerritory?: string;              // Target territory

  // Usage patterns
  usagePattern?: 'import' | 'render' | 'call' | 'extend' | 'compose' | 'inject';
  frequency?: 'rare' | 'occasional' | 'frequent' | 'constant';

  // Additional context
  importPath?: string;               // Specific import path
  propName?: string;                // Specific prop being used
  hookName?: string;                // Specific hook being used
  methodName?: string;              // Specific method being called

  // Documentation
  description?: string;             // Human-readable description
  inferredFrom?: string;           // How this was detected
  confidence?: number;             // Confidence level (0-1)
}

/**
 * Main relationship structure for knowledge graph
 */
export interface KGRelation {
  id: string;                      // Unique identifier (generated)
  fromId: string;                  // Source entity ID
  toId: string;                    // Target entity ID
  type: RelationType;              // Relationship classification
  properties?: RelationshipProperties; // Additional properties

  // System metadata (auto-generated)
  created_at: number;              // Creation timestamp
  updated_at?: number;             // Last update timestamp
}

/**
 * Relationship creation input
 */
export interface CreateRelationInput {
  fromId: string;                  // Source entity ID
  toId: string;                    // Target entity ID
  type: RelationType;              // Relationship type
  properties?: RelationshipProperties; // Optional properties
}

/**
 * Relationship analysis result
 */
export interface RelationshipAnalysis {
  relationships: CreateRelationInput[];
  metrics?: {
    totalRelationships: number;
    byType: Record<RelationType, number>;
    averageDensity: number;       // Relations per entity
    criticalPaths: number;        // High-impact chains
  };
}

/**
 * Relationship rules for validation
 */
export const RelationshipRules = {
  // Component relationships
  UIComponent: {
    validOutgoing: ['DEPENDS_ON', 'USES', 'RENDERS', 'CONSUMES'],
    validIncoming: ['CONTAINS', 'DOCUMENTS', 'TESTS', 'STYLES', 'USES']
  },

  // Hook relationships
  Hook: {
    validOutgoing: ['DEPENDS_ON', 'USES', 'MUTATES', 'OBSERVES'],
    validIncoming: ['USES', 'TESTS']
  },

  // Story relationships
  Story: {
    validOutgoing: ['DOCUMENTS', 'USES'],
    validIncoming: []
  },

  // Data relationships
  DataSource: {
    validOutgoing: [],
    validIncoming: ['CONSUMES', 'TRANSFORMS', 'MUTATES']
  }
} as const;

/**
 * Impact weight calculation rules
 */
export function calculateImpactWeight(
  fromType: string,
  toType: string,
  relationType: RelationType
): ImpactWeight {
  // Critical impact patterns
  if (
    toType === 'LayoutComponent' ||
    toType === 'Context' ||
    (relationType === 'EXTENDS' && toType === 'UIComponent')
  ) {
    return 'critical';
  }

  // High impact patterns
  if (
    relationType === 'DEPENDS_ON' ||
    relationType === 'MUTATES' ||
    toType === 'Hook' ||
    toType === 'Service'
  ) {
    return 'high';
  }

  // Medium impact patterns
  if (
    relationType === 'USES' ||
    relationType === 'RENDERS' ||
    relationType === 'CONTAINS'
  ) {
    return 'medium';
  }

  // Low impact patterns
  return 'low';
}

/**
 * Contract validation function
 * All agents must call this before creating relationships
 */
export function validateRelationship(relation: Partial<KGRelation>): boolean {
  // Required fields
  if (!relation.fromId || !relation.toId || !relation.type) {
    return false;
  }

  // Prevent self-relationships
  if (relation.fromId === relation.toId) {
    return false;
  }

  // Type validation
  const validTypes: RelationType[] = [
    'DEPENDS_ON', 'USES', 'CONTAINS', 'PROVIDES', 'CONSUMES',
    'EXTENDS', 'IMPLEMENTS', 'DOCUMENTS', 'TESTS', 'CONFIGURES',
    'STYLES', 'RENDERS', 'MUTATES', 'OBSERVES', 'TRIGGERS',
    'VALIDATES', 'TRANSFORMS', 'ROUTES_TO', 'SHARES', 'AFFECTS'
  ];

  if (!validTypes.includes(relation.type)) {
    return false;
  }

  // Validate properties if provided
  if (relation.properties) {
    if (relation.properties.impactWeight) {
      const validWeights: ImpactWeight[] = ['low', 'medium', 'high', 'critical'];
      if (!validWeights.includes(relation.properties.impactWeight)) {
        return false;
      }
    }

    if (relation.properties.confidence !== undefined) {
      if (relation.properties.confidence < 0 || relation.properties.confidence > 1) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Helper to determine if a relationship crosses territories
 */
export function crossesTerritoryBoundary(
  fromTerritory: string,
  toTerritory: string
): boolean {
  return fromTerritory !== toTerritory &&
         fromTerritory !== 'shared' &&
         toTerritory !== 'shared';
}