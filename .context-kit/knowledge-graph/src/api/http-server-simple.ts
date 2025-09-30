import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import {
  KnowledgeGraph,
  LoggingService,
  DatabaseConnection,
  createDatabaseConnection,
  logger,
  type Entity,
  type Relation,
  type LogLevel,
  type LogEntry
} from '@tkr-context-kit/core';

export interface HttpServerConfig {
  port?: number;
  host?: string;
  databasePath?: string;
}

export class KnowledgeGraphHttpServerSimple {
  private kg: KnowledgeGraph;
  private logService: LoggingService;
  private httpLogger: typeof logger;
  private port: number;
  private host: string;
  private db: DatabaseConnection;

  private constructor(config: HttpServerConfig, db: DatabaseConnection) {
    this.port = config.port || 42003; // Using tkr port scheme
    this.host = config.host || 'localhost';
    this.db = db;

    // Initialize Knowledge Graph with unified core
    this.kg = new KnowledgeGraph(this.db);

    // Initialize Logging Service with unified core
    this.logService = new LoggingService(this.db);

    // Use unified logger
    this.httpLogger = logger;
  }

  static async create(config: HttpServerConfig = {}): Promise<KnowledgeGraphHttpServerSimple> {
    // Initialize Database Connection using the fixed factory function
    const db = await createDatabaseConnection({
      path: config.databasePath || 'knowledge-graph.db'
    });

    return new KnowledgeGraphHttpServerSimple(config, db);
  }

  private setCorsHeaders(res: ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
  }

  private async handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const startTime = Date.now();
    const url = new URL(req.url || '', `http://${req.headers.host}`);

    console.log(`🌐 HTTP Request: ${req.method} ${url.pathname}`);

    // Log the incoming request
    this.httpLogger.info(`HTTP Request received`, {
      method: req.method,
      path: url.pathname,
      userAgent: req.headers['user-agent'],
      ip: req.socket.remoteAddress,
      query: Object.fromEntries(url.searchParams)
    });

    this.setCorsHeaders(res);

    // Handle OPTIONS requests (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    try {
      switch (url.pathname) {
        case '/entities':
          await this.handleGetEntities(res);
          break;
        case '/relations':
          await this.handleGetRelations(res);
          break;
        case '/stats':
          await this.handleGetStats(res);
          break;
        case '/health':
          await this.handleHealth(res);
          break;
        case '/api/logs':
          if (req.method === 'POST') {
            await this.handleLogSubmission(req, res);
          } else {
            this.httpLogger.warn(`Method not allowed for /api/logs`, {
              method: req.method,
              path: url.pathname
            });
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
          }
          break;
        case '/api/logs/stream':
          await this.handleLogStream(req, res, url);
          break;
        case '/api/logs/stats':
          await this.handleLogStats(res);
          break;
        default:
          this.httpLogger.warn(`404 Not Found`, {
            method: req.method,
            path: url.pathname,
            ip: req.socket.remoteAddress
          });
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not found' }));
      }

      // Log successful response
      const duration = Date.now() - startTime;
      this.httpLogger.info(`HTTP Request completed`, {
        method: req.method,
        path: url.pathname,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });

    } catch (error) {
      console.error('❌ HTTP Server Error:', error);

      // Log the error
      this.httpLogger.error(`HTTP Request failed`,
        error instanceof Error ? error : undefined, {
          method: req.method,
          path: url.pathname,
          ip: req.socket.remoteAddress,
          duration: `${Date.now() - startTime}ms`
        });

      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  private async handleGetEntities(res: ServerResponse): Promise<void> {
    console.log('🔍 Fetching all entities from database...');
    this.httpLogger.debug('Starting entity retrieval from knowledge graph database');

    const entities = await this.kg.getEntities();
    console.log(`✅ Retrieved ${entities.length} entities`);

    this.httpLogger.info(`Successfully retrieved entities from knowledge graph`, {
      entityCount: entities.length,
      entityTypes: [...new Set(entities.map(e => e.type))]
    });

    res.writeHead(200);
    res.end(JSON.stringify({ data: entities }));
  }

  private async handleGetRelations(res: ServerResponse): Promise<void> {
    console.log('🔗 Fetching all relations from database...');
    this.httpLogger.debug('Starting relation retrieval from knowledge graph database');

    try {
      // Use direct database query since getRelations() method doesn't exist yet
      const results = this.db.query('SELECT * FROM relations ORDER BY created_at DESC LIMIT 100');
      const relations = results.map((row: any) => ({
        id: row.id,
        type: row.type,
        from_id: row.from_id,
        to_id: row.to_id,
        fromEntityId: row.from_id,
        toEntityId: row.to_id,
        properties: JSON.parse(row.properties || '{}'),
        created_at: row.created_at,
        updated_at: row.created_at // Relations table doesn't have updated_at, use created_at
      }));

      console.log(`✅ Retrieved ${relations.length} relations`);

      this.httpLogger.info(`Successfully retrieved relations from knowledge graph`, {
        relationCount: relations.length,
        relationTypes: [...new Set(relations.map(r => r.type))]
      });

      res.writeHead(200);
      res.end(JSON.stringify({ data: relations }));
    } catch (error) {
      this.httpLogger.error(`Failed to retrieve relations`,
        error instanceof Error ? error : undefined);

      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to retrieve relations' }));
    }
  }

  private async handleGetStats(res: ServerResponse): Promise<void> {
    console.log('📊 Fetching database statistics...');
    const stats = await this.kg.getStats();

    console.log('✅ Generated stats:', stats);

    res.writeHead(200);
    res.end(JSON.stringify({ data: stats }));
  }

  private async handleHealth(res: ServerResponse): Promise<void> {
    const healthStatus = await this.kg.healthCheck();

    res.writeHead(200);
    res.end(JSON.stringify({
      status: healthStatus.healthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      details: healthStatus
    }));
  }

  private async handleLogSubmission(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const logData = JSON.parse(body);

          // Validate required fields
          if (!logData.level || !logData.message || !logData.service) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing required fields: level, message, service' }));
            return;
          }

          // Save the log entry using the LoggingService
          const metadata = {
            ...logData.metadata,
            service_type: logData.service_type || 'frontend',
            ip: req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          };

          try {
            // Use the LoggingService to properly log the entry
            await this.logService.log(
              logData.level.toUpperCase() as LogLevel,
              logData.message,
              logData.service,
              logData.component || 'Frontend',
              metadata
            );

            res.writeHead(200);
            res.end(JSON.stringify({ status: 'logged' }));
          } catch (dbError) {
            console.error('Database error:', dbError);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Database error' }));
          }
        } catch (parseError) {
          this.httpLogger.error(`Failed to parse log submission`,
            parseError instanceof Error ? parseError : undefined, {
              body: body.substring(0, 200) // Log first 200 chars for debugging
            });

          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } catch (error) {
      this.httpLogger.error(`Error handling log submission`,
        error instanceof Error ? error : undefined);

      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private async handleLogStream(req: IncomingMessage, res: ServerResponse, url: URL): Promise<void> {
    console.log('📝 Fetching log stream...');
    const limit = parseInt(url.searchParams.get('limit') || '100');

    try {
      const logs = await this.logService.getLogs({}, limit);
      console.log(`✅ Retrieved ${logs.length} log entries`);

      this.httpLogger.info(`Successfully retrieved log stream`, {
        logCount: logs.length,
        limit
      });

      res.writeHead(200);
      res.end(JSON.stringify({ data: logs }));
    } catch (error) {
      this.httpLogger.error(`Failed to retrieve log stream`,
        error instanceof Error ? error : undefined);

      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to retrieve logs' }));
    }
  }

  private async handleLogStats(res: ServerResponse): Promise<void> {
    console.log('📊 Fetching log statistics...');

    try {
      const stats = await this.logService.getStats();
      console.log('✅ Generated log stats:', stats);

      this.httpLogger.info(`Successfully retrieved log statistics`, {
        totalLogs: stats.totalEntries || 0,
        services: Object.keys(stats.byService || {})
      });

      res.writeHead(200);
      res.end(JSON.stringify({ data: stats }));
    } catch (error) {
      this.httpLogger.error(`Failed to retrieve log statistics`,
        error instanceof Error ? error : undefined);

      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Failed to retrieve log statistics' }));
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer(this.handleRequest.bind(this));

      server.listen(this.port, this.host, () => {
        console.log(`🚀 Knowledge Graph HTTP Server (Simple) running at http://${this.host}:${this.port}`);
        console.log('📋 Available endpoints:');
        console.log(`   GET  http://${this.host}:${this.port}/entities`);
        console.log(`   GET  http://${this.host}:${this.port}/relations`);
        console.log(`   GET  http://${this.host}:${this.port}/stats`);
        console.log(`   GET  http://${this.host}:${this.port}/health`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/stream`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/stats`);
        console.log(`   POST http://${this.host}:${this.port}/api/logs`);

        // Log server startup
        this.httpLogger.info(`Knowledge Graph HTTP Server started successfully`, {
          host: this.host,
          port: this.port,
          endpoints: ['/entities', '/relations', '/stats', '/health', '/api/logs', '/api/logs/stream', '/api/logs/stats']
        });
        resolve();
      });

      server.on('error', (error) => {
        console.error('❌ HTTP Server failed to start:', error);
        reject(error);
      });
    });
  }
}

// CLI runner
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    try {
      const server = await KnowledgeGraphHttpServerSimple.create({
        port: 42003,
        databasePath: process.env.CANONICAL_DATABASE_PATH || './knowledge-graph.db'
      });

      await server.start();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  })();
}