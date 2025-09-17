import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { setupKnowledgeGraphTools } from './tools/knowledge-graph.js';
import { setupScriptExecutionTools } from './tools/script-execution.js';
import { setupDevelopmentTools } from './tools/development.js';
import { setupLoggingTools } from './tools/logging.js';

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

  constructor(config: MCPServerConfig = {}) {
    const serverName = config.serverName || 'project-kit-server';
    const version = config.version || '1.0.0';

    this.config = {
      databasePath: config.databasePath || '../knowledge-graph/knowledge-graph.db',
      projectRoot: config.projectRoot || process.cwd(),
      ...config
    };

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
    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = [];
      
      // Add knowledge graph tools
      const kgTools = setupKnowledgeGraphTools(this.config, this.toolHandlers);
      tools.push(...kgTools);
      
      // Add script execution tools
      const scriptTools = setupScriptExecutionTools(this.config, this.toolHandlers);
      tools.push(...scriptTools);
      
      // Add development workflow tools
      const devTools = setupDevelopmentTools(this.config, this.toolHandlers);
      tools.push(...devTools);
      
      // Add logging tools
      const loggingTools = setupLoggingTools(this.config, this.toolHandlers);
      tools.push(...loggingTools);

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        const handler = this.toolHandlers.get(name);
        if (!handler) {
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          );
        }

        return await handler(args);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${message}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Project Kit MCP Server started');
  }

  async stop(): Promise<void> {
    await this.server.close();
  }

  close(): void {
    this.server.close().catch(console.error);
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