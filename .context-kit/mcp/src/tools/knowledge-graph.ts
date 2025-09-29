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

  // Add defensive check for logger methods
  const safeLogger = {
    debug: (message: string, metadata?: any) => {
      try {
        if (logger && typeof logger.debug === 'function') {
          return logger.debug(message, metadata);
        }
        console.log('[DEBUG]', message, metadata);
      } catch (error) {
        console.log('[DEBUG ERROR]', message, metadata, error);
      }
    },
    info: (message: string, metadata?: any) => {
      try {
        if (logger && typeof logger.info === 'function') {
          return logger.info(message, metadata);
        }
        console.log('[INFO]', message, metadata);
      } catch (error) {
        console.log('[INFO ERROR]', message, metadata, error);
      }
    },
    warn: (message: string, metadata?: any) => {
      try {
        if (logger && typeof logger.warn === 'function') {
          return logger.warn(message, metadata);
        }
        console.warn('[WARN]', message, metadata);
      } catch (error) {
        console.log('[WARN ERROR]', message, metadata, error);
      }
    },
    error: (message: string, metadata?: any) => {
      try {
        if (logger && typeof logger.error === 'function') {
          return logger.error(message, metadata);
        }
        console.error('[ERROR]', message, metadata);
      } catch (error) {
        console.log('[ERROR ERROR]', message, metadata, error);
      }
    }
  };

  // Simplified MCP tools - only essential CRUD operations for agent-based analysis
  const tools: ToolDefinition[] = [
    {
      name: 'create_entity',
      description: 'Create a new entity in the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          type: { type: 'string', description: 'Entity type (Component, Hook, Story, DataSource, etc.)' },
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
          type: { type: 'string', description: 'Relation type (DEPENDS_ON, USES, CONTAINS, DOCUMENTS, etc.)' },
          properties: { type: 'object', description: 'Relation properties (impact_weight, territory, etc.)' }
        },
        required: ['fromId', 'toId', 'type']
      }
    },
    {
      name: 'search_entities',
      description: 'Search entities using full-text search or filters',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search query' },
          type: { type: 'string', description: 'Filter by entity type' },
          limit: { type: 'number', description: 'Maximum results to return' }
        },
        required: ['query']
      }
    },
    {
      name: 'query',
      description: 'Execute a custom SQL query on the knowledge graph',
      inputSchema: {
        type: 'object',
        properties: {
          sql: { type: 'string', description: 'SQL query to execute' },
          params: { type: 'array', description: 'Query parameters' }
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

  // Tool handlers - only essential CRUD operations
  toolHandlers.set('create_entity', async (args) => {
    const { type, name, data } = args;
    safeLogger.debug('Creating entity', { type, name });

    try {
      const entity = await kg.createEntity({ type, name, data });
      safeLogger.info('Entity created successfully', { entityId: entity.id, type, name });
      return {
        content: [{
          type: 'text',
          text: `Entity created: ${entity.id} (${type}: ${name})`
        }]
      };
    } catch (error) {
      safeLogger.error('Failed to create entity', { type, name, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('create_relation', async (args) => {
    const { fromId, toId, type: relationType, properties = {} } = args;
    safeLogger.debug('Creating relation', { fromId, toId, type: relationType });

    try {
      const relation = await kg.createRelation({
        from_id: fromId,
        to_id: toId,
        type: relationType,
        properties
      });
      safeLogger.info('Relation created successfully', { relationId: relation.id, fromId, toId, type: relationType });
      return {
        content: [{
          type: 'text',
          text: `Relation created: ${fromId} --${relationType}--> ${toId}`
        }]
      };
    } catch (error) {
      safeLogger.error('Failed to create relation', { fromId, toId, type: relationType, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('search_entities', async (args) => {
    const { query, type, limit = 50 } = args;
    safeLogger.debug('Searching entities', { query, type, limit });

    try {
      let results: Entity[];

      if (type) {
        // Search by type
        results = await kg.getEntities({ type });
        if (query) {
          // Filter by name if query provided
          results = results.filter(entity =>
            entity.name.toLowerCase().includes(query.toLowerCase())
          );
        }
      } else {
        // Full-text search
        const searchResults = await kg.searchEntities(query, { limit });
        const entityPromises = searchResults.map(result => kg.getEntity(result.entity_id));
        const entities = await Promise.all(entityPromises);
        results = entities.filter(entity => entity !== null) as Entity[];
      }

      results = results.slice(0, limit);

      safeLogger.info('Entity search completed', { query, type, resultCount: results.length });
      return {
        content: [{
          type: 'text',
          text: `Found ${results.length} entities:\n${results.map(e => `- ${e.type}: ${e.name} (${e.id})`).join('\n')}`
        }]
      };
    } catch (error) {
      safeLogger.error('Entity search failed', { query, type, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('query', async (args) => {
    const { sql } = args;
    safeLogger.debug('SQL query requested', { sql });

    // Note: Custom SQL queries disabled for security
    // Agents should use search_entities and get_stats instead
    safeLogger.warn('Custom SQL queries not supported in simplified MCP interface');
    return {
      content: [{
        type: 'text',
        text: 'Custom SQL queries are not supported. Please use search_entities for entity queries or get_stats for statistics.'
      }]
    };
  });

  toolHandlers.set('get_stats', async () => {
    safeLogger.debug('Getting knowledge graph statistics');

    try {
      const stats = await kg.getStats();
      safeLogger.info('Statistics retrieved successfully', stats);
      return {
        content: [{
          type: 'text',
          text: `Knowledge Graph Statistics:
- Entities: ${stats.entityCount}
- Relations: ${stats.relationCount}
- Search Index Size: ${stats.searchIndexSize}
- Average Entity Connections: ${stats.averageEntityConnections}
- Database Size: ${stats.databaseSize} bytes
- Last Analysis: ${new Date(stats.lastAnalysis).toLocaleString()}`
        }]
      };
    } catch (error) {
      safeLogger.error('Failed to get statistics', { error: error.message });
      throw error;
    }
  });

  return tools;
}