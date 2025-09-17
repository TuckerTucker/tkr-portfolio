import { BaseService } from './BaseService';
import { ServiceConfig, ServiceResponse } from '../types/services';

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
  category: string;
  examples?: string[];
  lastUsed?: string;
  usageCount?: number;
}

export interface MCPToolCategory {
  name: string;
  description: string;
  tools: string[];
  icon?: string;
}

export interface MCPToolExecution {
  id: string;
  toolName: string;
  input: Record<string, any>;
  output?: any;
  error?: string;
  timestamp: string;
  duration?: number;
  status: 'pending' | 'success' | 'error';
}

export interface MCPStats {
  totalTools: number;
  categories: Record<string, number>;
  recentExecutions: MCPToolExecution[];
  mostUsedTools: Array<{
    name: string;
    count: number;
  }>;
}

export class MCPToolsService extends BaseService {
  private useLiveData: boolean = true;

  constructor(config: ServiceConfig) {
    super(config);
  }

  async initialize(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      this.isConnected = health.status === 'healthy';
      return this.isConnected;
    } catch (error) {
      console.warn('MCP Tools service not available, using mock data');
      this.useLiveData = false;
      return true;
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
  }

  async getTools(): Promise<ServiceResponse<MCPTool[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockTools(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPTool[]>('/api/mcp/tools');
  }

  async getToolCategories(): Promise<ServiceResponse<MCPToolCategory[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockCategories(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPToolCategory[]>('/api/mcp/categories');
  }

  async getTool(name: string): Promise<ServiceResponse<MCPTool>> {
    if (!this.useLiveData) {
      const mockTools = this.getMockTools();
      const tool = mockTools.find(t => t.name === name);
      if (!tool) {
        return {
          success: false,
          error: 'Tool not found',
          timestamp: Date.now(),
        };
      }
      return {
        success: true,
        data: tool,
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPTool>(`/api/mcp/tools/${encodeURIComponent(name)}`);
  }

  async executeTool(name: string, input: Record<string, any>): Promise<ServiceResponse<MCPToolExecution>> {
    if (!this.useLiveData) {
      // Simulate tool execution
      return {
        success: true,
        data: {
          id: `exec-${Date.now()}`,
          toolName: name,
          input,
          output: { result: 'Mock execution result', processed: true },
          timestamp: new Date().toISOString(),
          duration: Math.random() * 1000 + 500,
          status: 'success',
        },
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPToolExecution>('/api/mcp/execute', {
      method: 'POST',
      body: JSON.stringify({ toolName: name, input }),
    });
  }

  async getExecutionHistory(limit: number = 10): Promise<ServiceResponse<MCPToolExecution[]>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockExecutions(limit),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPToolExecution[]>(`/api/mcp/executions?limit=${limit}`);
  }

  async getStats(): Promise<ServiceResponse<MCPStats>> {
    if (!this.useLiveData) {
      return {
        success: true,
        data: this.getMockStats(),
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPStats>('/api/mcp/stats');
  }

  async searchTools(query: string): Promise<ServiceResponse<MCPTool[]>> {
    if (!this.useLiveData) {
      const mockTools = this.getMockTools();
      const filtered = mockTools.filter(tool =>
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.description.toLowerCase().includes(query.toLowerCase()) ||
        tool.category.toLowerCase().includes(query.toLowerCase())
      );
      return {
        success: true,
        data: filtered,
        timestamp: Date.now(),
      };
    }

    return this.makeRequest<MCPTool[]>(`/api/mcp/tools/search?q=${encodeURIComponent(query)}`);
  }

  private getMockTools(): MCPTool[] {
    return [
      {
        name: 'create_entity',
        description: 'Create a new entity in the knowledge graph',
        category: 'Knowledge Graph',
        inputSchema: {
          type: 'object',
          properties: {
            type: { type: 'string', description: 'Entity type' },
            name: { type: 'string', description: 'Entity name' },
            data: { type: 'object', description: 'Entity data' },
          },
          required: ['type', 'name', 'data'],
        },
        examples: [
          '{"type": "component", "name": "Header", "data": {"description": "Navigation component"}}'
        ],
        lastUsed: new Date(Date.now() - 3600000).toISOString(),
        usageCount: 45,
      },
      {
        name: 'create_relation',
        description: 'Create a relationship between two entities',
        category: 'Knowledge Graph',
        inputSchema: {
          type: 'object',
          properties: {
            fromId: { type: 'string', description: 'Source entity ID' },
            toId: { type: 'string', description: 'Target entity ID' },
            type: { type: 'string', description: 'Relation type' },
            properties: { type: 'object', description: 'Relation properties' },
          },
          required: ['fromId', 'toId', 'type'],
        },
        examples: [
          '{"fromId": "1", "toId": "2", "type": "uses", "properties": {}}'
        ],
        lastUsed: new Date(Date.now() - 7200000).toISOString(),
        usageCount: 32,
      },
      {
        name: 'log_query',
        description: 'Query logs with filters and search criteria',
        category: 'Logging',
        inputSchema: {
          type: 'object',
          properties: {
            service: { type: 'string', description: 'Service name filter' },
            level: { type: 'string', description: 'Log level filter' },
            limit: { type: 'number', description: 'Maximum results' },
            search: { type: 'string', description: 'Search query' },
          },
        },
        examples: [
          '{"service": "Dashboard", "level": "ERROR", "limit": 10}'
        ],
        lastUsed: new Date(Date.now() - 1800000).toISOString(),
        usageCount: 78,
      },
      {
        name: 'analyze_project',
        description: 'Perform static code analysis on the project',
        category: 'Analysis',
        inputSchema: {
          type: 'object',
          properties: {
            patterns: {
              type: 'array',
              items: { type: 'string' },
              description: 'File patterns to analyze',
            },
            includeTests: { type: 'boolean', description: 'Include test files' },
          },
        },
        examples: [
          '{"patterns": ["**/*.ts", "**/*.tsx"], "includeTests": false}'
        ],
        lastUsed: new Date(Date.now() - 14400000).toISOString(),
        usageCount: 23,
      },
      {
        name: 'get_stats',
        description: 'Get knowledge graph statistics',
        category: 'Knowledge Graph',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        examples: ['{}'],
        lastUsed: new Date(Date.now() - 900000).toISOString(),
        usageCount: 156,
      },
    ];
  }

  private getMockCategories(): MCPToolCategory[] {
    return [
      {
        name: 'Knowledge Graph',
        description: 'Tools for managing entities and relationships',
        tools: ['create_entity', 'create_relation', 'get_stats', 'search_entities'],
        icon: '🕸️',
      },
      {
        name: 'Logging',
        description: 'Tools for querying and analyzing logs',
        tools: ['log_query', 'log_search', 'service_health'],
        icon: '📝',
      },
      {
        name: 'Analysis',
        description: 'Code and project analysis tools',
        tools: ['analyze_project', 'find_patterns', 'analyze_impact'],
        icon: '🔍',
      },
    ];
  }

  private getMockExecutions(limit: number): MCPToolExecution[] {
    const tools = this.getMockTools();
    const executions: MCPToolExecution[] = [];

    for (let i = 0; i < limit; i++) {
      const tool = tools[Math.floor(Math.random() * tools.length)];
      const timestamp = new Date(Date.now() - Math.random() * 86400000).toISOString();
      const status: MCPToolExecution['status'] = Math.random() > 0.1 ? 'success' : 'error';

      executions.push({
        id: `exec-${i}`,
        toolName: tool.name,
        input: { example: 'input' },
        output: status === 'success' ? { result: 'Mock result' } : undefined,
        error: status === 'error' ? 'Mock error message' : undefined,
        timestamp,
        duration: Math.random() * 2000 + 100,
        status,
      });
    }

    return executions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private getMockStats(): MCPStats {
    return {
      totalTools: 5,
      categories: {
        'Knowledge Graph': 3,
        'Logging': 1,
        'Analysis': 1,
      },
      recentExecutions: this.getMockExecutions(5),
      mostUsedTools: [
        { name: 'get_stats', count: 156 },
        { name: 'log_query', count: 78 },
        { name: 'create_entity', count: 45 },
        { name: 'create_relation', count: 32 },
        { name: 'analyze_project', count: 23 },
      ],
    };
  }
}