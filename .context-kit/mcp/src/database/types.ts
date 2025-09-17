export interface Entity {
  id: string;
  type: string;
  name: string;
  data: Record<string, any>;
  created_at?: number;
  updated_at?: number;
  version?: number;
}

export interface Relation {
  id: string;
  from_id: string;
  to_id: string;
  type: string;
  properties?: Record<string, any>;
  created_at?: number;
}

export interface Observation {
  id?: number;
  entity_id: string;
  key: string;
  value: string;
  created_at?: number;
}

export interface SearchResult {
  id: string;
  type: string;
  name: string;
  data: Record<string, any>;
  match: string;
  rank?: number;
}

export interface StateMutation {
  action: string;
  trigger: string;
  store: string;
  changes: string;
}

export interface WorkflowTrace {
  workflow: Record<string, any>;
  phases: Array<{
    name: string;
    data: Record<string, any>;
    actions: Array<Record<string, any>>;
  }>;
}

export interface Impact {
  entity: string;
  changeType: string;
  direct: Array<{
    impacted_entity: string;
    entity_type: string;
    relation_type: string;
  }>;
  indirect: Array<{
    name: string;
    type: string;
    level: number;
  }>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface GenerationSpec {
  entityType: string;
  pattern: string;
  name: string;
  framework?: string;
  stateManager?: string;
  [key: string]: any;
}

export interface GeneratedCode {
  code: string;
  examples: Array<any>;
  rules: Array<string>;
}

export interface Pattern {
  name: string;
  template: string;
  rules: Array<string>;
  variables: Record<string, string>;
}

export interface ComponentInfo {
  name: string;
  type: string;
  location: string;
  props?: Array<string>;
  dependencies?: Array<string>;
  exports?: Array<string>;
}

export interface StoryInfo {
  component: string;
  title: string;
  stories: Array<{
    name: string;
    args: Record<string, any>;
    description?: string;
  }>;
  interactions?: Array<{
    name: string;
    trigger: string;
    expectations: Array<string>;
  }>;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

export interface KnowledgeGraphConfig {
  databasePath: string;
  projectRoot: string;
  analysisPatterns: Array<string>;
  enableFullTextSearch: boolean;
  enableMCP: boolean;
}