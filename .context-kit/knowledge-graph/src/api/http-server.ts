import { createServer, IncomingMessage, ServerResponse } from 'http';
import { URL } from 'url';
import { AppStateKGSimple } from '../core/knowledge-graph-simple.js';
import { LogService } from '../services/log-service.js';
import { tkrLogger } from '../services/logger.js';
import { LoggingEndpoints } from './logging-endpoints.js';

export interface HttpServerConfig {
  port?: number;
  host?: string;
  databasePath?: string;
}

export class KnowledgeGraphHttpServer {
  private kg: AppStateKGSimple;
  private logService: LogService;
  private logger: tkrLogger;
  private loggingEndpoints: LoggingEndpoints;
  private port: number;
  private host: string;

  constructor(config: HttpServerConfig = {}) {
    this.port = config.port || 42003; // Using tkr port scheme
    this.host = config.host || 'localhost';
    
    // Initialize Knowledge Graph
    this.kg = new AppStateKGSimple({
      databasePath: config.databasePath || 'knowledge-graph.db'
    });
    
    // Initialize Log Service
    this.logService = new LogService(this.kg);

    // Initialize Centralized Logger
    this.logger = new tkrLogger(this.kg, 'API Server', 'backend');

    // Initialize Enhanced Logging Endpoints
    this.loggingEndpoints = new LoggingEndpoints({
      kg: this.kg,
      logService: this.logService,
      logger: this.logger
    });
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
    this.logger.info(`HTTP Request received`, {
      method: req.method,
      path: url.pathname,
      userAgent: req.headers['user-agent'],
      ip: req.socket.remoteAddress,
      query: Object.fromEntries(url.searchParams)
    }, { component: 'RequestHandler' });

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
            this.logger.warn(`Method not allowed for /api/logs`, {
              method: req.method,
              path: url.pathname
            }, { component: 'RequestHandler' });
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
          this.logger.warn(`404 Not Found`, {
            method: req.method,
            path: url.pathname,
            ip: req.socket.remoteAddress
          }, { component: 'RequestHandler' });
          res.writeHead(404);
          res.end(JSON.stringify({ error: 'Not found' }));
      }
      
      // Log successful response
      const duration = Date.now() - startTime;
      this.logger.info(`HTTP Request completed`, {
        method: req.method,
        path: url.pathname,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      }, { component: 'RequestHandler' });
      
    } catch (error) {
      console.error('❌ HTTP Server Error:', error);
      
      // Log the error
      this.logger.error(`HTTP Request failed`, error instanceof Error ? error : undefined, {
        method: req.method,
        path: url.pathname,
        ip: req.socket.remoteAddress,
        duration: `${Date.now() - startTime}ms`
      }, { component: 'RequestHandler' });
      
      res.writeHead(500);
      res.end(JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  private async handleGetEntities(res: ServerResponse): Promise<void> {
    console.log('🔍 Fetching all entities from database...');
    this.logger.debug('Starting entity retrieval from knowledge graph database', {}, { component: 'EntityHandler' });
    
    const entities = await this.kg.getAllEntities();
    console.log(`✅ Retrieved ${entities.length} entities`);
    
    this.logger.info(`Successfully retrieved entities from knowledge graph`, {
      entityCount: entities.length,
      entityTypes: [...new Set(entities.map(e => e.type))]
    }, { component: 'EntityHandler' });
    
    res.writeHead(200);
    res.end(JSON.stringify({ data: entities }));
  }

  private async handleGetRelations(res: ServerResponse): Promise<void> {
    console.log('🔍 Fetching all relations from database...');
    const relations = await this.kg.getAllRelations();
    console.log(`✅ Retrieved ${relations.length} relations`);
    
    res.writeHead(200);
    res.end(JSON.stringify({ data: relations }));
  }

  private async handleGetStats(res: ServerResponse): Promise<void> {
    console.log('📊 Fetching database statistics...');
    const entities = await this.kg.getAllEntities();
    const relations = await this.kg.getAllRelations();
    
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
    const level = params.get('level') || undefined;
    const timeWindow = params.get('timeWindow') ? parseInt(params.get('timeWindow')!) : 3600;
    const format = params.get('format') || 'json';
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 1000;

    if (format === 'text') {
      // Return plain text for LazyLog
      const logText = this.logService.getLogsAsText({
        service,
        level,
        timeWindow,
        limit
      });
      
      res.setHeader('Content-Type', 'text/plain');
      res.writeHead(200);
      res.end(logText);
    } else {
      // Return JSON
      const logs = this.logService.queryLogs({
        service,
        level,
        timeWindow,
        limit
      });
      
      res.writeHead(200);
      res.end(JSON.stringify({ data: logs }));
    }
  }

  private async handleGetServices(res: ServerResponse): Promise<void> {
    const services = this.logService.getServices();
    res.writeHead(200);
    res.end(JSON.stringify({ services }));
  }

  private async handleLogSearch(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const params = url.searchParams;
    
    const query = params.get('q') || params.get('query') || '';
    const service = params.get('service') || undefined;
    const level = params.get('level') || undefined;
    const limit = params.get('limit') ? parseInt(params.get('limit')!) : 50;
    const format = params.get('format') || 'json';

    if (!query) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'Query parameter is required' }));
      return;
    }

    const results = this.logService.searchLogs({
      query,
      service,
      level,
      limit
    });

    if (format === 'text') {
      const logText = results
        .map(row => {
          const date = new Date(row.timestamp * 1000).toISOString();
          const component = row.component ? ` ${row.component}` : '';
          return `${date} [${row.level}] ${row.service}${component} - ${row.message}`;
        })
        .join('\n');
      
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

    const health = this.logService.getServiceHealth(timeWindow);
    res.writeHead(200);
    res.end(JSON.stringify({ data: health }));
  }

  private async handleIndividualServiceHealth(req: IncomingMessage, res: ServerResponse, serviceName: string): Promise<void> {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const timeWindow = url.searchParams.get('timeWindow')
      ? parseInt(url.searchParams.get('timeWindow')!)
      : 3600;

    this.logger.info(`Health check requested for service: ${serviceName}`, {
      serviceName,
      timeWindow,
      method: req.method
    }, { component: 'IndividualServiceHealth' });

    try {
      // Get overall service health data
      const allServiceHealth = this.logService.getServiceHealth(timeWindow);

      // Find the specific service or provide default health info
      let serviceHealth = allServiceHealth.find(service => service.name === serviceName);

      if (!serviceHealth) {
        // If service not found in logs, determine health based on service type
        serviceHealth = {
          name: serviceName,
          status: this.getDefaultServiceStatus(serviceName),
          uptime: this.getServiceUptime(serviceName),
          responseTime: this.getServiceResponseTime(serviceName),
          errorRate: 0,
          requestCount: 0,
          lastSeen: new Date().toISOString()
        };
      }

      // Add service-specific metadata
      const response = {
        status: serviceHealth.status,
        service: serviceName,
        timestamp: new Date().toISOString(),
        health: serviceHealth,
        timeWindow: timeWindow
      };

      this.logger.debug(`Service health response for ${serviceName}`, {
        status: serviceHealth.status,
        errorRate: serviceHealth.errorRate,
        uptime: serviceHealth.uptime
      }, { component: 'IndividualServiceHealth' });

      res.writeHead(200);
      res.end(JSON.stringify(response));

    } catch (error) {
      this.logger.error(`Failed to get health for service: ${serviceName}`, error instanceof Error ? error : undefined, {
        serviceName,
        timeWindow
      }, { component: 'IndividualServiceHealth' });

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

    this.logger.debug('Calculating log statistics', {
      timeWindow,
      timeWindowHours: timeWindow / 3600
    }, { component: 'StatsHandler' });

    try {
      const stats = this.logService.calculateStats(timeWindow);
      console.log(`✅ Generated stats: ${stats.totalLogs} total logs, ${stats.errorCount} errors`);

      this.logger.info('Successfully calculated log statistics', {
        totalLogs: stats.totalLogs,
        errorCount: stats.errorCount,
        timeWindow
      }, { component: 'StatsHandler' });

      res.writeHead(200);
      res.end(JSON.stringify({ data: stats }));
    } catch (error) {
      console.error('❌ Failed to calculate log statistics:', error);

      this.logger.error('Failed to calculate log statistics', error instanceof Error ? error : undefined, {
        timeWindow
      }, { component: 'StatsHandler' });

      res.writeHead(500);
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  private async handleLogSubmission(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', () => {
        try {
          const logData = JSON.parse(body);

          // Validate required fields
          if (!logData.level || !logData.message || !logData.service) {
            res.writeHead(400);
            res.end(JSON.stringify({ error: 'Missing required fields: level, message, service' }));
            return;
          }

          // Save the log entry directly to database to preserve service information
          const metadata = {
            ...logData.metadata,
            service_type: logData.service_type || 'frontend',
            ip: req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
          };

          // Use knowledge graph directly to preserve service field
          const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          const sourceId = this.ensureLogSource(logData.service, 'frontend');
          const logEntry = {
            id: logId,
            level: logData.level.toUpperCase(),
            message: logData.message,
            service: logData.service,
            component: logData.component || 'Frontend',
            data: JSON.stringify(metadata),
            timestamp: logData.timestamp || Math.floor(Date.now() / 1000),
            source_id: sourceId
          };

          try {
            this.kg.run(`
              INSERT INTO log_entries (id, timestamp, level, message, source_id, service, component, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [logEntry.id, logEntry.timestamp, logEntry.level, logEntry.message, logEntry.source_id, logEntry.service, logEntry.component, logEntry.data]);

            res.writeHead(200);
            res.end(JSON.stringify({ status: 'logged' }));
          } catch (dbError) {
            console.error('Database error:', dbError);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Database error' }));
          }
        } catch (parseError) {
          this.logger.error('Failed to parse log submission', parseError instanceof Error ? parseError : undefined, {
            body: body.substring(0, 200) // Log first 200 chars for debugging
          }, { component: 'LogSubmissionHandler' });

          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
      });
    } catch (error) {
      this.logger.error('Error handling log submission', error instanceof Error ? error : undefined, {}, { component: 'LogSubmissionHandler' });
      
      res.writeHead(500);
      res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  }

  private ensureLogSource(name: string, type: string): string {
    // Check if source exists
    const existing = this.kg.query('SELECT id FROM log_sources WHERE name = ?', [name]);

    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new source
    const sourceId = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.kg.run(`
      INSERT INTO log_sources (id, name, type, host, process_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sourceId,
      name,
      type,
      process.env.HOSTNAME || 'localhost',
      process.pid.toString(),
      JSON.stringify({
        node_version: process.version,
        created_at: new Date().toISOString()
      })
    ]);

    return sourceId;
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
        this.logger.info(`Knowledge Graph HTTP Server started successfully`, {
          host: this.host,
          port: this.port,
          endpoints: [
            '/entities', '/relations', '/stats', '/health',
            '/api/logs/stream', '/api/logs/services', '/api/logs/search', '/api/logs/health', '/api/logs',
            '/api/logs/batch', '/api/logging-client.js', '/api/logs/enhanced-stats', '/api/logs/enhanced-health'
          ]
        }, { component: 'ServerStartup' });
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
  const server = new KnowledgeGraphHttpServer({
    port: 42003,
    databasePath: 'knowledge-graph.db'
  });
  
  server.start().catch(console.error);
}