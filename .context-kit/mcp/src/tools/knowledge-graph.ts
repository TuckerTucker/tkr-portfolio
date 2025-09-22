import {
  KnowledgeGraph,
  LoggingService,
  Entity,
  Relation,
  SearchOptions,
  SearchResult
} from '@tkr-context-kit/core';
import { MCPServerConfig, ToolDefinition, ToolResponse } from '../types.js';

export function setupKnowledgeGraphTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>,
  knowledgeGraph: KnowledgeGraph,
  loggingService: LoggingService
): ToolDefinition[] {
  // Use the provided core knowledge graph and logging service
  const kg = knowledgeGraph;
  const logger = loggingService;

  const tools: ToolDefinition[] = [
    {
      name: 'create_entity',
      description: 'Create a new entity in the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Entity type (Component, Store, Action, etc.)' },
          name: { type: 'string', description: 'Entity name' },
          data: { type: 'object', description: 'Entity data and properties' }
        },
        required: ['type', 'name', 'data']
      }
    },
    {
      name: 'create_relation',
      description: 'Create a relationship between two entities',
      inputSchema: {
        type: 'object',
        properties: {
          fromId: { type: 'string', description: 'Source entity ID' },
          toId: { type: 'string', description: 'Target entity ID' },
          type: { type: 'string', description: 'Relation type (USES, MUTATES, etc.)' },
          properties: { type: 'object', description: 'Relation properties' }
        },
        required: ['fromId', 'toId', 'type']
      }
    },
    {
      name: 'analyze_state_mutations',
      description: 'Find all state mutations for a store',
      inputSchema: {
        type: 'object',
        properties: {
          storeName: { type: 'string', description: 'Name of the store to analyze' }
        },
        required: ['storeName']
      }
    },
    {
      name: 'trace_workflow',
      description: 'Trace a workflow execution path',
      inputSchema: {
        type: 'object',
        properties: {
          workflowName: { type: 'string', description: 'Name of the workflow to trace' },
          format: { type: 'string', enum: ['tree', 'flat'], description: 'Output format' }
        },
        required: ['workflowName']
      }
    },
    {
      name: 'trace_user_flow',
      description: 'Trace user interaction flow from a starting point',
      inputSchema: {
        type: 'object',
        properties: {
          interaction: { type: 'string', description: 'Starting interaction or component' }
        },
        required: ['interaction']
      }
    },
    {
      name: 'analyze_impact',
      description: 'Analyze the impact of changing an entity',
      inputSchema: {
        type: 'object',
        properties: {
          entityName: { type: 'string', description: 'Name of the entity to analyze' },
          changeType: { type: 'string', enum: ['modify', 'delete', 'add'], description: 'Type of change' },
          maxDepth: { type: 'number', description: 'Maximum depth for impact analysis' }
        },
        required: ['entityName']
      }
    },
    {
      name: 'find_patterns',
      description: 'Find similar patterns across components',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: { type: 'string', description: 'Component name to find patterns for' }
        },
        required: ['componentName']
      }
    },
    {
      name: 'generate_code',
      description: 'Generate code from a pattern template',
      inputSchema: {
        type: 'object',
        properties: {
          spec: {
            type: 'object',
            properties: {
              entityType: { type: 'string', description: 'Type of entity to generate' },
              pattern: { type: 'string', description: 'Pattern name to use' },
              name: { type: 'string', description: 'Name for the generated entity' }
            },
            required: ['entityType', 'pattern', 'name'],
            additionalProperties: true
          }
        },
        required: ['spec']
      }
    },
    {
      name: 'validate_consistency',
      description: 'Validate workflow or system consistency',
      inputSchema: {
        type: 'object',
        properties: {
          workflowName: { type: 'string', description: 'Workflow name to validate' }
        },
        required: ['workflowName']
      }
    },
    {
      name: 'search_entities',
      description: 'Search entities using full-text search',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          limit: { type: 'number', description: 'Maximum results to return' }
        },
        required: ['query']
      }
    },
    {
      name: 'get_component_dependencies',
      description: 'Get dependency graph for a component',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: { type: 'string', description: 'Component name' }
        },
        required: ['componentName']
      }
    },
    {
      name: 'analyze_state_patterns',
      description: 'Analyze state management patterns in the project',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },
    {
      name: 'generate_test_scenarios',
      description: 'Generate test scenarios for a component',
      inputSchema: {
        type: 'object',
        properties: {
          componentName: { type: 'string', description: 'Component name' }
        },
        required: ['componentName']
      }
    },
    {
      name: 'analyze_project',
      description: 'Perform static code analysis on the project',
      inputSchema: {
        type: 'object',
        properties: {
          patterns: { 
            type: 'array', 
            items: { type: 'string' },
            description: 'File patterns to analyze'
          },
          includeTests: { type: 'boolean', description: 'Include test files' }
        }
      }
    },
    {
      name: 'analyze_storybook',
      description: 'Analyze Storybook stories and documentation',
      inputSchema: {
        type: 'object',
        properties: {
          storiesPattern: { type: 'string', description: 'Pattern for story files' }
        }
      }
    },
    {
      name: 'query',
      description: 'Execute a custom SQL query on the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL query to execute' },
          params: { 
            type: 'array', 
            items: {},
            description: 'Query parameters'
          }
        },
        required: ['sql']
      }
    },
    {
      name: 'get_stats',
      description: 'Get knowledge graph statistics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    }
  ];

  // Register tool handlers
  toolHandlers.set('create_entity', async (args) => {
    const { type, name, data } = args;
    logger.debug('Creating entity', { type, name });

    const entity = await kg.createEntity({
      type,
      name,
      data: data || {},
      metadata: {
        description: 'Created via MCP tool',
        last_analyzed: Date.now()
      }
    });

    logger.info('Entity created', { entityId: entity.id, type, name });
    return {
      content: [
        {
          type: 'text',
          text: `Created entity: ${entity.id} (${type}: ${name})`
        }
      ]
    };
  });

  toolHandlers.set('create_relation', async (args) => {
    const { fromId, toId, type, properties = {} } = args;
    logger.debug('Creating relation', { fromId, toId, type });

    const relation = await kg.createRelation({
      from_id: fromId,
      to_id: toId,
      type,
      properties
    });

    logger.info('Relation created', { relationId: relation.id, fromId, toId, type });
    return {
      content: [
        {
          type: 'text',
          text: `Created relation: ${relation.id} (${fromId} -${type}-> ${toId})`
        }
      ]
    };
  });

  toolHandlers.set('analyze_state_mutations', async (args) => {
    const { storeName } = args;
    logger.warn('State mutation analysis not yet implemented with core module', { storeName });
    // TODO: Implement with core module patterns analysis
    return {
      content: [
        {
          type: 'text',
          text: `State mutation analysis for ${storeName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('trace_workflow', async (args) => {
    const { workflowName, format = 'tree' } = args;
    logger.warn('Workflow tracing not yet implemented with core module', { workflowName });
    // TODO: Implement with core module relation traversal
    return {
      content: [
        {
          type: 'text',
          text: `Workflow tracing for ${workflowName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('trace_user_flow', async (args) => {
    const { interaction } = args;
    logger.warn('User flow tracing not yet implemented with core module', { interaction });
    // TODO: Implement with core module relation traversal
    return {
      content: [
        {
          type: 'text',
          text: `User flow tracing from ${interaction} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('analyze_impact', async (args) => {
    const { entityName, changeType = 'modify', maxDepth } = args;
    logger.warn('Impact analysis not yet implemented with core module', { entityName, changeType });
    // TODO: Implement with core module relation analysis
    return {
      content: [
        {
          type: 'text',
          text: `Impact analysis for ${entityName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('find_patterns', async (args) => {
    const { componentName } = args;
    logger.warn('Pattern finding not yet implemented with core module', { componentName });
    // TODO: Implement with core module pattern analysis
    return {
      content: [
        {
          type: 'text',
          text: `Pattern finding for ${componentName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('generate_code', async (args) => {
    const { spec } = args;
    logger.warn('Code generation not yet implemented with core module', { spec });
    // TODO: Implement with core module pattern generation
    return {
      content: [
        {
          type: 'text',
          text: 'Code generation is not yet implemented with the core module.'
        }
      ]
    };
  });

  toolHandlers.set('validate_consistency', async (args) => {
    const { workflowName } = args;
    logger.warn('Workflow validation not yet implemented with core module', { workflowName });
    // TODO: Implement with core module validation capabilities
    return {
      content: [
        {
          type: 'text',
          text: `Workflow validation for ${workflowName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('search_entities', async (args) => {
    const { query, limit = 20 } = args;
    logger.debug('Searching entities', { query, limit });

    try {
      let results: Entity[] = [];

      // Handle wildcard queries by getting all entities
      if (query === '*' || query === '') {
        results = await kg.getEntities({}, limit);
      } else {
        const searchResults = await kg.searchEntities(query, { limit });
        // Convert search results to entities by fetching the full entity data
        const entityPromises = searchResults.map(result => kg.getEntity(result.entity_id));
        const entities = await Promise.all(entityPromises);
        results = entities.filter(entity => entity !== null) as Entity[];
      }

      logger.info('Entity search completed', { query, resultCount: results.length });
      return {
        content: [
          {
            type: 'text',
            text: `Search results for "${query}" (${results.length} entities):\n${JSON.stringify(results, null, 2)}`
          }
        ]
      };
    } catch (error) {
      logger.error('Entity search failed', { query, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('get_component_dependencies', async (args) => {
    const { componentName } = args;
    logger.warn('Component dependency analysis not yet implemented with core module', { componentName });
    // TODO: Implement with core module relation traversal
    return {
      content: [
        {
          type: 'text',
          text: `Component dependency analysis for ${componentName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('analyze_state_patterns', async (args) => {
    logger.warn('State pattern analysis not yet implemented with core module');
    // TODO: Implement with core module pattern analysis
    return {
      content: [
        {
          type: 'text',
          text: 'State pattern analysis is not yet implemented with the core module.'
        }
      ]
    };
  });

  toolHandlers.set('generate_test_scenarios', async (args) => {
    const { componentName } = args;
    logger.warn('Test scenario generation not yet implemented with core module', { componentName });
    // TODO: Implement with core module test generation
    return {
      content: [
        {
          type: 'text',
          text: `Test scenario generation for ${componentName} is not yet implemented with the core module.`
        }
      ]
    };
  });

  toolHandlers.set('analyze_project', async (args) => {
    const { patterns = ['**/*.ts', '**/*.tsx'], includeTests = false } = args;
    logger.warn('Project analysis not yet implemented with core module', { patterns, includeTests });
    // TODO: Implement with core module static analysis capabilities
    return {
      content: [
        {
          type: 'text',
          text: 'Project analysis is not yet implemented with the core module.'
        }
      ]
    };
  });

  toolHandlers.set('analyze_storybook', async (args) => {
    const { storiesPattern } = args;
    logger.warn('Storybook analysis not yet implemented with core module', { storiesPattern });
    // TODO: Implement with core module static analysis capabilities
    return {
      content: [
        {
          type: 'text',
          text: 'Storybook analysis is not yet implemented with the core module.'
        }
      ]
    };
  });

  toolHandlers.set('query', async (args) => {
    const { sql, params = [] } = args;
    logger.debug('Executing custom SQL query', { sql, paramCount: params.length });

    try {
      // Note: Raw SQL queries should be used carefully - accessing via db connection
      const results = (kg as any).db.query(sql, params);
      logger.info('Custom query executed', { sql, resultCount: results.length });

      return {
        content: [
          {
            type: 'text',
            text: `Query results (${results.length} rows):\n${JSON.stringify(results, null, 2)}`
          }
        ]
      };
    } catch (error) {
      logger.error('Custom query failed', { sql, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('get_stats', async (args) => {
    logger.debug('Getting knowledge graph statistics');

    try {
      const stats = await kg.getStats();
      logger.info('Retrieved knowledge graph statistics', stats);

      return {
        content: [
          {
            type: 'text',
            text: `Knowledge Graph Statistics:\n- Entities: ${stats.entityCount}\n- Relations: ${stats.relationCount}\n- Database Size: ${stats.databaseSize || 'N/A'}\n- Last Analysis: ${stats.lastAnalysis || 'N/A'}`
          }
        ]
      };
    } catch (error) {
      logger.error('Failed to get knowledge graph statistics', { error: error.message });
      throw error;
    }
  });

  return tools;
}