import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

// Core module imports
import * as core from '@tkr-context-kit/core';

const { KnowledgeGraph, LoggingService, logger, createDatabaseConnection } = core;

// Fallback for getCoreModuleInfo if not available
const getCoreModuleInfo = core.getCoreModuleInfo || (() => ({
  version: '1.0.0',
  name: '@tkr-context-kit/core',
  components: ['database', 'search', 'knowledge-graph', 'logging', 'types', 'utils'],
  buildTime: new Date().toISOString()
}));

import { setupKnowledgeGraphTools } from './tools/knowledge-graph.js';
import { setupScriptExecutionTools } from './tools/script-execution.js';
import { setupDevelopmentTools } from './tools/development.js';
import { setupLoggingTools } from './tools/logging.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { setupServiceNameTools } = require('./tools/service-name-tool.js');

export interface MCPServerConfig {
  databasePath?: string;
  projectRoot?: string;
  serverName?: string;
  version?: string;
}

export class ProjectKitMCPServer {
  private server: Server;
  private config: MCPServerConfig;
  private toolHandlers: Map<string, (args: any) => Promise<any>>;
  private knowledgeGraph?: InstanceType<typeof KnowledgeGraph>;
  private loggingService?: InstanceType<typeof LoggingService>;
  private dbConnection?: any;

  constructor(config: MCPServerConfig = {}) {
    const coreInfo = getCoreModuleInfo();
    const serverName = config.serverName || 'project-kit-mcp-server';
    const version = config.version || coreInfo.version;

    this.config = {
      databasePath: config.databasePath || process.env.CANONICAL_DATABASE_PATH || '../knowledge-graph/knowledge-graph.db',
      projectRoot: config.projectRoot || process.cwd(),
      ...config
    };

    // Services will be initialized asynchronously in initialize()
    console.log('ProjectKitMCPServer constructor called with config:', this.config);

    this.server = new Server(
      {
        name: serverName,
        version: version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.toolHandlers = new Map();

    console.log('MCP Server constructor completed - services will be initialized async');
  }

  async initialize(): Promise<void> {
    try {
      console.log('Initializing database connection...');
      // Initialize database connection
      this.dbConnection = await createDatabaseConnection({
        path: this.config.databasePath || process.env.CANONICAL_DATABASE_PATH || 'knowledge-graph.db'
      });

      console.log('Initializing core services...');
      // Initialize core services with database connection
      this.knowledgeGraph = new KnowledgeGraph(this.dbConnection);

      // Initialize LoggingService with MCP-optimized configuration
      this.loggingService = new LoggingService(this.dbConnection, {
        serviceName: 'mcp-server',
        batchInterval: 1000, // Moderate batching for performance
        flushInterval: 5000, // Regular flushing
        enableAnalytics: true, // Enable analytics for monitoring
        maxLogEntries: 10000 // Reasonable limit for MCP context
      });

      // Setup handlers after services are initialized
      this.setupHandlers();

      console.log('MCP Server initialization completed');
    } catch (error) {
      console.error('Failed to initialize MCP Server:', error);
      throw error;
    }
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];

      // Add knowledge graph tools - pass core services
      if (this.knowledgeGraph && this.loggingService) {
        const kgTools = setupKnowledgeGraphTools(
          this.config,
          this.toolHandlers,
          this.knowledgeGraph,
          this.loggingService // Now guaranteed to be defined
        );
        tools.push(...kgTools);
      }

      // Add script execution tools
      const scriptTools = setupScriptExecutionTools(this.config, this.toolHandlers);
      tools.push(...scriptTools);

      // Add development workflow tools
      const devTools = setupDevelopmentTools(this.config, this.toolHandlers);
      tools.push(...devTools);

      // Add logging tools - pass core services
      if (this.loggingService) {
        const loggingTools = setupLoggingTools(
          this.config,
          this.toolHandlers,
          this.loggingService
        );
        tools.push(...loggingTools);
      }

      // Add service name tools for debugging and management
      const serviceNameTools = setupServiceNameTools(this.config, this.toolHandlers);
      tools.push(...serviceNameTools);

      if (this.loggingService) {
        this.loggingService?.debug('Listed available tools', {
          toolCount: tools.length,
          includesServiceNameTools: true
        });
      }
      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const startTime = Date.now();

      try {
        const handler = this.toolHandlers.get(name);
        if (!handler) {
          this.loggingService?.warn('Unknown tool requested', { toolName: name });
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }

        this.loggingService?.debug('Executing tool', { toolName: name, args });
        const result = await handler(args);
        const duration = Date.now() - startTime;

        this.loggingService?.info('Tool executed successfully', {
          toolName: name,
          duration,
          success: true
        });

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        const message = error instanceof Error ? error.message : String(error);

        this.loggingService?.error('Tool execution failed', {
          toolName: name,
          duration,
          error: message,
          success: false
        });

        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
      }
    });
  }

  async start(): Promise<void> {
    await this.initialize();
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.loggingService?.info('Project Kit MCP Server started', {
      transport: 'stdio',
      pid: process.pid
    });
    console.error('Project Kit MCP Server started');
  }

  async stop(): Promise<void> {
    this.loggingService?.info('Stopping MCP Server');
    await this.server.close();
    this.loggingService?.info('MCP Server stopped');
  }

  close(): void {
    this.server.close().catch((error) => {
      this.loggingService?.error('Error closing MCP Server', { error: error.message });
    });
  }
}

// CLI entry point
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new ProjectKitMCPServer();
  
  process.on('SIGINT', async () => {
    await server.stop();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    await server.stop();
    process.exit(0);
  });
  
  server.start().catch(console.error);
}