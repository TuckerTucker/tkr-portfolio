import { AppStateKGSimple } from '../database/knowledge-graph-simple.js';
import { StaticAnalyzer } from '../analyzers/static-analyzer.js';
import { StorybookAnalyzer } from '../analyzers/storybook-analyzer.js';
import { MCPServerConfig, ToolDefinition, ToolResponse } from '../types.js';

export function setupKnowledgeGraphTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>
): ToolDefinition[] {
  // Initialize Knowledge Graph
  const kg = new AppStateKGSimple({
    databasePath: config.databasePath || '../knowledge-graph/knowledge-graph.db'
  });

  // Initialize analyzers
  const staticAnalyzer = new StaticAnalyzer(kg);
  const storybookAnalyzer = new StorybookAnalyzer(kg);

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
    const entity = kg.createEntity(type, name, data);
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
    const relation = kg.createRelation(fromId, toId, type, properties);
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
    const mutations = kg.findStateMutations(storeName);
    return {
      content: [
        {
          type: 'text',
          text: `State mutations for ${storeName}:\n${JSON.stringify(mutations, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('trace_workflow', async (args) => {
    const { workflowName, format = 'tree' } = args;
    const trace = kg.traceWorkflow(workflowName);
    
    let output: string;
    if (format === 'flat') {
      output = JSON.stringify(trace, null, 2);
    } else {
      output = formatWorkflowTrace(trace);
    }

    return {
      content: [
        {
          type: 'text',
          text: `Workflow trace for ${workflowName}:\n${output}`
        }
      ]
    };
  });

  toolHandlers.set('trace_user_flow', async (args) => {
    const { interaction } = args;
    const flow = kg.traceUserFlow(interaction);
    return {
      content: [
        {
          type: 'text',
          text: `User flow from ${interaction}:\n${JSON.stringify(flow, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('analyze_impact', async (args) => {
    const { entityName, changeType = 'modify', maxDepth } = args;
    
    let impact;
    if (maxDepth) {
      impact = kg.analyzeImpactWithPaths(entityName, maxDepth);
    } else {
      impact = kg.analyzeImpact(entityName, changeType);
    }
    
    return {
      content: [
        {
          type: 'text',
          text: `Impact analysis for ${entityName}:\n${JSON.stringify(impact, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('find_patterns', async (args) => {
    const { componentName } = args;
    const patterns = kg.findSimilarPatterns(componentName);
    return {
      content: [
        {
          type: 'text',
          text: `Similar patterns to ${componentName}:\n${JSON.stringify(patterns, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('generate_code', async (args) => {
    const { spec } = args;
    const generated = await kg.generateFromPattern(spec);
    return {
      content: [
        {
          type: 'text',
          text: `Generated code:\n\`\`\`typescript\n${generated.code}\n\`\`\`\n\nRules:\n${generated.rules.map(r => `- ${r}`).join('\n')}`
        }
      ]
    };
  });

  toolHandlers.set('validate_consistency', async (args) => {
    const { workflowName } = args;
    const validation = kg.validateWorkflow(workflowName);
    
    let result = `Validation for ${workflowName}:\n`;
    result += `Status: ${validation.isValid ? '✅ Valid' : '❌ Invalid'}\n`;
    
    if (validation.errors.length > 0) {
      result += `\nErrors:\n${validation.errors.map(e => `- ${e}`).join('\n')}`;
    }
    
    if (validation.warnings && validation.warnings.length > 0) {
      result += `\nWarnings:\n${validation.warnings.map(w => `- ${w}`).join('\n')}`;
    }

    return {
      content: [
        {
          type: 'text',
          text: result
        }
      ]
    };
  });

  toolHandlers.set('search_entities', async (args) => {
    const { query, limit = 20 } = args;
    const results = kg.search(query);
    return {
      content: [
        {
          type: 'text',
          text: `Search results for "${query}":\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('get_component_dependencies', async (args) => {
    const { componentName } = args;
    const deps = kg.getComponentDependencies(componentName);
    return {
      content: [
        {
          type: 'text',
          text: `Dependencies for ${componentName}:\n${JSON.stringify(deps, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('analyze_state_patterns', async (args) => {
    const patterns = kg.analyzeStatePatterns();
    return {
      content: [
        {
          type: 'text',
          text: `State management patterns:\n${JSON.stringify(patterns, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('generate_test_scenarios', async (args) => {
    const { componentName } = args;
    const scenarios = kg.generateTestScenarios(componentName);
    return {
      content: [
        {
          type: 'text',
          text: `Test scenarios for ${componentName}:\n${JSON.stringify(scenarios, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('analyze_project', async (args) => {
    const { patterns = ['**/*.ts', '**/*.tsx'], includeTests = false } = args;
    
    await staticAnalyzer.analyzeProject({
      projectRoot: config.projectRoot || process.cwd(),
      patterns,
      includeTests
    });

    return {
      content: [
        {
          type: 'text',
          text: 'Project analysis completed. Entities and relationships have been extracted into the knowledge graph.'
        }
      ]
    };
  });

  toolHandlers.set('analyze_storybook', async (args) => {
    const { storiesPattern } = args;
    
    await storybookAnalyzer.analyzeStorybook({
      projectRoot: config.projectRoot || process.cwd(),
      storiesPattern
    });

    return {
      content: [
        {
          type: 'text',
          text: 'Storybook analysis completed. Stories, visual states, and interaction patterns have been extracted.'
        }
      ]
    };
  });

  toolHandlers.set('query', async (args) => {
    const { sql, params = [] } = args;
    const results = kg.query(sql, params);
    return {
      content: [
        {
          type: 'text',
          text: `Query results:\n${JSON.stringify(results, null, 2)}`
        }
      ]
    };
  });

  toolHandlers.set('get_stats', async (args) => {
    const stats = kg.getStats();
    return {
      content: [
        {
          type: 'text',
          text: `Knowledge Graph Statistics:\n- Entities: ${stats.entities}\n- Relations: ${stats.relations}\n- Observations: ${stats.observations}`
        }
      ]
    };
  });

  return tools;
}

function formatWorkflowTrace(trace: any): string {
  let output = `Workflow: ${trace.workflow.description || 'Unknown'}\n`;
  
  trace.phases.forEach((phase: any, i: number) => {
    output += `\n${i + 1}. Phase: ${phase.name}\n`;
    if (phase.actions && phase.actions.length > 0) {
      phase.actions.forEach((action: any, j: number) => {
        output += `   ${j + 1}.${i + 1}. Action: ${action.name || 'Unknown'}\n`;
      });
    }
  });
  
  return output;
}