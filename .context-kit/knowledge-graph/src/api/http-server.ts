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
import { LoggingEndpoints } from './logging-endpoints.js';

export interface HttpServerConfig {
  port?: number;
  host?: string;
  databasePath?: string;
}

export class KnowledgeGraphHttpServer {
  private kg: KnowledgeGraph;
  private logService: LoggingService;
  private httpLogger: typeof logger;
  private loggingEndpoints: LoggingEndpoints;
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
    this.logService = new LoggingService(this.db, {
      services: ['knowledge-graph-api']
    });

    // Use unified logger
    this.httpLogger = logger;

    // Initialize Enhanced Logging Endpoints
    this.loggingEndpoints = new LoggingEndpoints({
      kg: this.kg,
      logService: this.logService,
      logger: this.httpLogger
    });
  }

  static async create(config: HttpServerConfig = {}): Promise<KnowledgeGraphHttpServer> {
    // Initialize Database Connection
    const db = await createDatabaseConnection({
      path: config.databasePath || 'knowledge-graph.db'
    });

    return new KnowledgeGraphHttpServer(config, db);
  }

  private setCorsHeaders(res: ServerResponse): void {
    // Allow both 42001 and 42002 (in case Vite switches ports)
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow all origins for development
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

    // Don't set CORS headers for endpoints that handle their own headers
    if (!url.pathname.startsWith('/api/logging-client.js')) {
      this.setCorsHeaders(res);
    }

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

        // Logging endpoints
        case '/api/logs/stream':
          await this.handleLogStream(req, res);
          break;
        case '/api/logs/services':
          await this.handleGetServices(res);
          break;
        case '/api/logs/search':
          await this.handleLogSearch(req, res);
          break;
        case '/api/logs/health':
          await this.handleServiceHealth(req, res);
          break;
        case '/api/logs/stats':
          await this.handleLogStats(req, res);
          break;

        // Service-specific health endpoints
        case '/api/health/dashboard':
          await this.handleIndividualServiceHealth(req, res, 'dashboard');
          break;
        case '/api/health/knowledge-graph':
          await this.handleIndividualServiceHealth(req, res, 'knowledge-graph');
          break;
        case '/api/health/logging':
          await this.handleIndividualServiceHealth(req, res, 'logging');
          break;
        case '/api/health/mcp-tools':
          await this.handleIndividualServiceHealth(req, res, 'mcp-tools');
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

        // Enhanced Wave 2 Logging Endpoints
        case '/api/logs/batch':
          if (req.method === 'POST') {
            await this.loggingEndpoints.handleBatchLogs(req, res);
          } else {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed. POST required for batch submissions.' }));
          }
          break;

        case '/api/logging-client.js':
          if (req.method === 'GET') {
            await this.loggingEndpoints.handleClientScript(req, res);
          } else {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed. GET required for client script.' }));
          }
          break;

        case '/api/logs/enhanced-stats':
          if (req.method === 'GET') {
            const enhancedStats = this.loggingEndpoints.getStats();
            res.writeHead(200);
            res.end(JSON.stringify({ data: enhancedStats }));
          } else {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
          }
          break;

        case '/api/logs/enhanced-health':
          if (req.method === 'GET') {
            const healthData = this.loggingEndpoints.getHealth();
            res.writeHead(200);
            res.end(JSON.stringify(healthData));
          } else {
            res.writeHead(405);
            res.end(JSON.stringify({ error: 'Method not allowed' }));
          }
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
    console.log('🔍 Fetching all relations from database...');
    const relations = await this.kg.getRelations();
    console.log(`✅ Retrieved ${relations.length} relations`);

    res.writeHead(200);
    res.end(JSON.stringify({ data: relations }));
  }

  private async handleGetStats(res: ServerResponse): Promise<void> {
    console.log('📊 Fetching database statistics...');
    const entities = await this.kg.getEntities();
    const relations = await this.kg.getRelations();

    const entityTypes = entities.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const relationTypes = relations.reduce((acc, r) => {
      acc[r.type] = (acc[r.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const stats = {
      totalEntities: entities.length,
      totalRelations: relations.length,
      entityTypes,
      relationTypes
    };

    console.log('✅ Generated stats:', stats);

    res.writeHead(200);
    res.end(JSON.stringify({ data: stats }));
  }

  private async handleHealth(res: ServerResponse): Promise<void> {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected'
    }));
  }

  // Logging endpoint handlers
  private async handleLogStream(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const params = url.searchParams;

    const service = params.get('service') || undefined;
    const level = params.get('level') as LogLevel || undefined;
    const timeWindow = params.get('timeWindow') ? parseInt(params.get('timeWindow')!) : 3600;
    const format = params.get('format') || 'json';
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 1000;

    const filters = {
      service,
      level,
      startTime: new Date(Date.now() - timeWindow * 1000),
      endTime: new Date(),
      limit
    };

    if (format === 'text') {
      // Return plain text for LazyLog
      const logs = await this.logService.getLogs(filters, limit);
      const logText = logs.map(log =>
        `${new Date(log.timestamp).toISOString()} [${log.level}] ${log.service} - ${log.message}`
      ).join('\\n');

      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end(logText);
    } else {
      // Return JSON
      const logs = await this.logService.getLogs(filters, limit);

      res.writeHead(200);
      res.end(JSON.stringify({ data: logs }));
    }
  }

  private async handleGetServices(res: ServerResponse): Promise<void> {
    const logs = await this.logService.getLogs({}, 1000);
    const services = [...new Set(logs.map(log => log.service))].filter(Boolean);
    res.writeHead(200);
    res.end(JSON.stringify({ services }));
  }

  private async handleLogSearch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const params = url.searchParams;

    const query = params.get('q') || params.get('query') || '';
    const service = params.get('service') || undefined;
    const level = params.get('level') as LogLevel || undefined;
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 50;
    const format = params.get('format') || 'json';

    if (!query) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Query parameter is required' }));
      return;
    }

    const filters = {
      service,
      level,
      limit,
      search: query
    };

    const results = await this.logService.getLogs(filters);

    if (format === 'text') {
      const logText = results
        .map(log => {
          return `${new Date(log.timestamp).toISOString()} [${log.level}] ${log.service} - ${log.message}`;
        })
        .join('\\n');

      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end(logText);
    } else {
      res.writeHead(200);
      res.end(JSON.stringify({ data: results }));
    }
  }

  private async handleServiceHealth(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const timeWindow = url.searchParams.get('timeWindow')
      ? parseInt(url.searchParams.get('timeWindow')!)
      : 3600;

    // Get recent logs to calculate health metrics
    const startTime = new Date(Date.now() - timeWindow * 1000);
    const logs = await this.logService.getLogs({}, 10000);

    // Group by service and calculate health metrics
    const serviceHealthMap = new Map<string, any>();

    for (const log of logs) {
      if (!log.service) continue;

      const service = serviceHealthMap.get(log.service) || {
        name: log.service,
        status: 'healthy',
        uptime: 99.9,
        responseTime: 50,
        errorRate: 0,
        requestCount: 0,
        lastSeen: new Date(log.timestamp).toISOString()
      };

      service.requestCount++;
      if (log.level === 'ERROR' || log.level === 'FATAL') {
        service.errorRate = (service.errorRate * (service.requestCount - 1) + 1) / service.requestCount;
      }

      if (new Date(log.timestamp) > new Date(service.lastSeen)) {
        service.lastSeen = new Date(log.timestamp).toISOString();
      }

      serviceHealthMap.set(log.service, service);
    }

    const health = Array.from(serviceHealthMap.values());
    res.writeHead(200);
    res.end(JSON.stringify({ data: health }));
  }

  private async handleIndividualServiceHealth(req: IncomingMessage, res: ServerResponse, serviceName: string): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const timeWindow = url.searchParams.get('timeWindow')
      ? parseInt(url.searchParams.get('timeWindow')!)
      : 3600;

    this.httpLogger.info(`Health check requested for service: ${serviceName}`, {
      serviceName,
      timeWindow,
      method: req.method
    });

    try {
      // Get overall service health data
      const startTime = new Date(Date.now() - timeWindow * 1000);
      const logs = await this.logService.getLogs({ service: serviceName }, 1000);

      // Calculate service health metrics
      const errorCount = logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length;
      const errorRate = logs.length > 0 ? errorCount / logs.length : 0;

      let serviceHealth = {
        name: serviceName,
        status: this.getDefaultServiceStatus(serviceName),
        uptime: this.getServiceUptime(serviceName),
        responseTime: this.getServiceResponseTime(serviceName),
        errorRate,
        requestCount: logs.length,
        lastSeen: logs.length > 0 ? new Date(logs[0].timestamp).toISOString() : new Date().toISOString()
      };

      // Update status based on actual metrics
      if (errorRate > 0.1) serviceHealth.status = 'error';
      else if (errorRate > 0.05) serviceHealth.status = 'degraded';
      else if (logs.length === 0) serviceHealth.status = 'offline';

      // Add service-specific metadata
      const response = {
        status: serviceHealth.status,
        service: serviceName,
        timestamp: new Date().toISOString(),
        health: serviceHealth,
        timeWindow: timeWindow
      };

      this.httpLogger.debug(`Service health response for ${serviceName}`, {
        status: serviceHealth.status,
        errorRate: serviceHealth.errorRate,
        uptime: serviceHealth.uptime
      });

      res.writeHead(200);
      res.end(JSON.stringify(response));

    } catch (error) {
      this.httpLogger.error(`Failed to get health for service: ${serviceName}`,
        error instanceof Error ? error : undefined, {
          serviceName,
          timeWindow
        });

      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Failed to get service health',
        service: serviceName,
        timestamp: new Date().toISOString()
      }));
    }
  }

  private getDefaultServiceStatus(serviceName: string): 'healthy' | 'degraded' | 'error' | 'offline' {
    // Determine service status based on service type
    switch (serviceName) {
      case 'knowledge-graph':
        // This service is running since we can respond
        return 'healthy';
      case 'dashboard':
        // Dashboard is likely running if it's making this request
        return 'healthy';
      case 'logging':
        // Logging service is part of this server
        return 'healthy';
      case 'mcp-tools':
        // MCP tools status would need to be checked differently
        return 'offline';
      default:
        return 'offline';
    }
  }

  private getServiceUptime(serviceName: string): number {
    // For now, return a reasonable default uptime
    // In a real implementation, this would track actual service start times
    switch (serviceName) {
      case 'knowledge-graph':
      case 'logging':
        return 99.9; // High uptime for services running on this server
      case 'dashboard':
        return 95.0; // Reasonable uptime for frontend service
      default:
        return 0.0;
    }
  }

  private getServiceResponseTime(serviceName: string): number {
    // Return average response time in ms
    switch (serviceName) {
      case 'knowledge-graph':
        return 50; // Fast database operations
      case 'logging':
        return 25; // Very fast logging operations
      case 'dashboard':
        return 200; // Frontend response time
      default:
        return 1000; // Slow/timeout for offline services
    }
  }

  private async handleLogStats(req: IncomingMessage, res: ServerResponse): Promise<void> {
    console.log('📊 Fetching log statistics...');

    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const timeWindow = url.searchParams.get('timeWindow')
      ? parseInt(url.searchParams.get('timeWindow')!)
      : 3600; // Default 1 hour

    this.httpLogger.debug('Calculating log statistics', {
      timeWindow,
      timeWindowHours: timeWindow / 3600
    });

    try {
      const startTime = new Date(Date.now() - timeWindow * 1000);
      const logs = await this.logService.getLogs({}, 10000);

      const stats = {
        totalLogs: logs.length,
        errorCount: logs.filter(log => log.level === 'ERROR' || log.level === 'FATAL').length,
        warnCount: logs.filter(log => log.level === 'WARN').length,
        infoCount: logs.filter(log => log.level === 'INFO').length,
        debugCount: logs.filter(log => log.level === 'DEBUG').length,
        timeWindow,
        serviceBreakdown: this.calculateServiceBreakdown(logs)
      };

      console.log(`✅ Generated stats: ${stats.totalLogs} total logs, ${stats.errorCount} errors`);

      this.httpLogger.info('Successfully calculated log statistics', {
        totalLogs: stats.totalLogs,
        errorCount: stats.errorCount,
        timeWindow
      });

      res.writeHead(200);
      res.end(JSON.stringify({ data: stats }));
    } catch (error) {
      console.error('❌ Failed to calculate log statistics:', error);

      this.httpLogger.error('Failed to calculate log statistics',
        error instanceof Error ? error : undefined, {
          timeWindow
        });

      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  /**
   * Calculate service breakdown from logs
   */
  private calculateServiceBreakdown(logs: LogEntry[]): Record<string, any> {
    const breakdown: Record<string, any> = {};

    for (const log of logs) {
      if (!log.service) continue;

      if (!breakdown[log.service]) {
        breakdown[log.service] = {
          total: 0,
          errors: 0,
          warnings: 0,
          info: 0,
          debug: 0
        };
      }

      breakdown[log.service].total++;

      switch (log.level) {
        case 'ERROR':
        case 'FATAL':
          breakdown[log.service].errors++;
          break;
        case 'WARN':
          breakdown[log.service].warnings++;
          break;
        case 'INFO':
          breakdown[log.service].info++;
          break;
        case 'DEBUG':
          breakdown[log.service].debug++;
          break;
      }
    }

    return breakdown;
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
              {
                ...metadata,
                timestamp: logData.timestamp ? new Date(logData.timestamp * 1000) : new Date()
              }
            );

            res.writeHead(200);
            res.end(JSON.stringify({ status: 'logged' }));
          } catch (dbError) {
            console.error('Database error:', dbError);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Database error' }));
          }
        } catch (parseError) {
          this.httpLogger.error('Failed to parse log submission',
            parseError instanceof Error ? parseError : undefined, {
              body: body.substring(0, 200) // Log first 200 chars for debugging
            });

          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } catch (error) {
      this.httpLogger.error('Error handling log submission',
        error instanceof Error ? error : undefined);

      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      const server = createServer(this.handleRequest.bind(this));

      server.listen(this.port, this.host, () => {
        console.log(`🚀 Knowledge Graph HTTP Server running at http://${this.host}:${this.port}`);
        console.log('📋 Available endpoints:');
        console.log(`   GET  http://${this.host}:${this.port}/entities`);
        console.log(`   GET  http://${this.host}:${this.port}/relations`);
        console.log(`   GET  http://${this.host}:${this.port}/stats`);
        console.log(`   GET  http://${this.host}:${this.port}/health`);
        console.log('\n📝 Logging endpoints:');
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/stream`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/services`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/search`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/stats`);
        console.log(`   POST http://${this.host}:${this.port}/api/logs`);
        console.log('\n🚀 Enhanced Wave 2 endpoints:');
        console.log(`   POST http://${this.host}:${this.port}/api/logs/batch`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logging-client.js`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/enhanced-stats`);
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/enhanced-health`);

        // Log server startup
        this.httpLogger.info(`Knowledge Graph HTTP Server started successfully`, {
          host: this.host,
          port: this.port,
          endpoints: [
            '/entities', '/relations', '/stats', '/health',
            '/api/logs/stream', '/api/logs/services', '/api/logs/search', '/api/logs/health', '/api/logs',
            '/api/logs/batch', '/api/logging-client.js', '/api/logs/enhanced-stats', '/api/logs/enhanced-health'
          ]
        });
        console.log(`   GET  http://${this.host}:${this.port}/api/logs/health`);
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
      const server = await KnowledgeGraphHttpServer.create({
        port: 42003,
        databasePath: 'knowledge-graph.db'
      });

      await server.start();
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  })();
}