import { z } from 'zod';
import { AppStateKGSimple } from '../database/knowledge-graph-simple.js';
import { MCPServerConfig, ToolDefinition, ToolResponse } from '../types.js';

// Since we can't import across module boundaries, let's create our own LogService here
interface LogQueryFilters {
  service?: string;
  level?: string;
  component?: string;
  traceId?: string;
  timeWindow?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

interface LogSearchFilters {
  query: string;
  service?: string;
  level?: string;
  limit?: number;
}

class LogService {
  private kg: AppStateKGSimple;

  constructor(kg: AppStateKGSimple) {
    this.kg = kg;
  }

  queryLogs(filters: LogQueryFilters = {}): any[] {
    const {
      level,
      service,
      component,
      traceId,
      timeWindow,
      startTime,
      endTime,
      limit = 1000
    } = filters;

    let sql = `
      SELECT l.timestamp, l.level, l.message, l.service, l.component, 
             l.data, l.trace_id, l.span_id, l.user_id, l.session_id
      FROM log_entries l
      WHERE 1=1
    `;
    const params: any[] = [];

    // Time filtering
    if (timeWindow) {
      const currentTime = Math.floor(Date.now() / 1000);
      sql += ' AND l.timestamp >= ?';
      params.push(currentTime - timeWindow);
    } else {
      if (startTime) {
        sql += ' AND l.timestamp >= ?';
        params.push(startTime);
      }
      if (endTime) {
        sql += ' AND l.timestamp <= ?';
        params.push(endTime);
      }
    }

    // Other filters
    if (level) {
      sql += ' AND l.level = ?';
      params.push(level.toUpperCase());
    }

    if (service) {
      sql += ' AND l.service = ?';
      params.push(service);
    }

    if (component) {
      sql += ' AND l.component = ?';
      params.push(component);
    }

    if (traceId) {
      sql += ' AND l.trace_id = ?';
      params.push(traceId);
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT ?';
    params.push(limit.toString());

    return this.kg.query(sql, params);
  }

  searchLogs(filters: LogSearchFilters): any[] {
    const { query, service, level, limit = 50 } = filters;
    
    let sql = `
      SELECT l.timestamp, l.level, l.message, l.service, l.component, l.data
      FROM log_entries_fts fts
      JOIN log_entries l ON l.rowid = fts.rowid
      WHERE log_entries_fts MATCH ?
    `;
    const params = [query];

    if (service) {
      sql += ' AND l.service = ?';
      params.push(service);
    }

    if (level) {
      sql += ' AND l.level = ?';
      params.push(level.toUpperCase());
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT ?';
    params.push(limit.toString());

    return this.kg.query(sql, params);
  }

  traceRequest(traceId: string): any[] {
    return this.kg.query(`
      SELECT 
        l.timestamp, 
        l.service, 
        l.component, 
        l.message, 
        l.level, 
        l.span_id,
        l.data,
        LAG(l.timestamp) OVER (ORDER BY l.timestamp) as prev_timestamp
      FROM log_entries l
      WHERE l.trace_id = ?
      ORDER BY l.timestamp ASC
    `, [traceId]);
  }

  getServiceHealth(timeWindow: number = 3600): any[] {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime - timeWindow;

    return this.kg.query(`
      SELECT 
        l.service,
        s.type as service_type,
        COUNT(CASE WHEN l.level = 'ERROR' THEN 1 END) as error_count,
        COUNT(CASE WHEN l.level = 'WARN' THEN 1 END) as warning_count,
        COUNT(CASE WHEN l.level = 'INFO' THEN 1 END) as info_count,
        COUNT(CASE WHEN l.level = 'DEBUG' THEN 1 END) as debug_count,
        COUNT(*) as total_logs,
        MAX(l.timestamp) as last_log,
        MIN(l.timestamp) as first_log
      FROM log_entries l
      JOIN log_sources s ON l.source_id = s.id
      WHERE l.timestamp >= ?
      GROUP BY l.service, s.type
      ORDER BY error_count DESC, warning_count DESC
    `, [startTime]);
  }

  getErrorTrends(timeWindow: number = 86400): any[] {
    const currentTime = Math.floor(Date.now() / 1000);
    const startTime = currentTime - timeWindow;

    return this.kg.query(`
      SELECT 
        l.service,
        datetime((l.timestamp / 3600) * 3600, 'unixepoch') as hour_bucket,
        COUNT(CASE WHEN l.level IN ('ERROR', 'FATAL') THEN 1 END) as error_count,
        COUNT(*) as total_count,
        ROUND(
          COUNT(CASE WHEN l.level IN ('ERROR', 'FATAL') THEN 1 END) * 100.0 / COUNT(*), 
          2
        ) as error_rate_percent
      FROM log_entries l
      WHERE l.timestamp >= ?
      GROUP BY l.service, (l.timestamp / 3600)
      HAVING total_count > 0
      ORDER BY l.service, hour_bucket
    `, [startTime]);
  }

  getRecentErrors(limit: number = 20): any[] {
    return this.kg.query(`
      SELECT 
        l.timestamp,
        l.level,
        l.message,
        l.service,
        l.component,
        s.type as source_type,
        s.host,
        l.data
      FROM log_entries l
      JOIN log_sources s ON l.source_id = s.id
      WHERE l.level IN ('ERROR', 'FATAL')
        AND l.timestamp > (unixepoch() - 3600)
      ORDER BY l.timestamp DESC
      LIMIT ?
    `, [limit]);
  }

  getServices(): string[] {
    try {
      const results = this.kg.query(`
        SELECT DISTINCT name FROM log_sources ORDER BY name
      `);
      
      if (!results || results.length === 0) {
        return ['React UI', 'MCP Server', 'API Server'];
      }
      
      return results.map(row => row.name);
    } catch (error) {
      console.error('Error getting services:', error);
      return ['React UI', 'MCP Server', 'API Server'];
    }
  }

  getLogStats(): any {
    const stats = this.kg.query(`
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN level = 'ERROR' THEN 1 END) as error_count,
        COUNT(CASE WHEN level = 'WARN' THEN 1 END) as warning_count,
        COUNT(CASE WHEN level = 'INFO' THEN 1 END) as info_count,
        COUNT(CASE WHEN level = 'DEBUG' THEN 1 END) as debug_count,
        MIN(timestamp) as oldest_log,
        MAX(timestamp) as newest_log
      FROM log_entries
    `)[0] || {};

    const sourceStats = this.kg.query(`
      SELECT COUNT(*) as source_count FROM log_sources
    `)[0] || {};

    return {
      ...stats,
      ...sourceStats
    };
  }

  cleanupOldLogs(retentionDays: number = 7): number {
    const cutoffTime = Math.floor(Date.now() / 1000) - (retentionDays * 24 * 60 * 60);
    
    this.kg.query(`
      DELETE FROM log_entries WHERE timestamp < ?
    `, [cutoffTime]);

    const remaining = this.kg.query(`
      SELECT COUNT(*) as count FROM log_entries
    `, [])[0] || { count: 0 };

    return remaining.count;
  }
}

// Tool schemas
const logQuerySchema = z.object({
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
  service: z.string().optional(),
  component: z.string().optional(),
  traceId: z.string().optional(),
  timeWindow: z.number().optional().describe('Time window in seconds (e.g., 3600 for last hour)'),
  startTime: z.number().optional().describe('Unix timestamp for start time'),
  endTime: z.number().optional().describe('Unix timestamp for end time'),
  limit: z.number().optional().default(100).describe('Maximum number of logs to return')
});

const logSearchSchema = z.object({
  query: z.string().describe('Search query for full-text search'),
  service: z.string().optional(),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL']).optional(),
  limit: z.number().optional().default(50)
});

const logTraceSchema = z.object({
  traceId: z.string().describe('Trace ID to follow across services')
});

const serviceHealthSchema = z.object({
  service: z.string().optional().describe('Specific service to check (optional)'),
  timeWindow: z.number().optional().default(3600).describe('Time window in seconds')
});

const errorTrendsSchema = z.object({
  timeWindow: z.number().optional().default(86400).describe('Time window in seconds (default: 24 hours)')
});

const recentErrorsSchema = z.object({
  limit: z.number().optional().default(20).describe('Number of recent errors to return')
});

const logCleanupSchema = z.object({
  retentionDays: z.number().optional().default(7).describe('Number of days to retain logs')
});

/**
 * Setup logging-related MCP tools
 */
export function setupLoggingTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>
): ToolDefinition[] {
  // Initialize Knowledge Graph
  const kg = new AppStateKGSimple({
    databasePath: config.databasePath || '../knowledge-graph/knowledge-graph.db'
  });
  
  const logService = new LogService(kg);

  const tools: ToolDefinition[] = [
    // Query logs with filters
    {
      name: 'log_query',
      description: 'Query logs with various filters (level, service, time range, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          level: { 
            type: 'string', 
            enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
            description: 'Log level filter' 
          },
          service: { 
            type: 'string', 
            description: 'Service name filter' 
          },
          component: { 
            type: 'string', 
            description: 'Component name filter' 
          },
          traceId: { 
            type: 'string', 
            description: 'Trace ID for request correlation' 
          },
          timeWindow: { 
            type: 'number', 
            description: 'Time window in seconds (e.g., 3600 for last hour)' 
          },
          startTime: { 
            type: 'number', 
            description: 'Unix timestamp for start time' 
          },
          endTime: { 
            type: 'number', 
            description: 'Unix timestamp for end time' 
          },
          limit: { 
            type: 'number', 
            description: 'Maximum number of logs to return',
            default: 100
          }
        }
      }
    },

    // Search logs with full-text search
    {
      name: 'log_search',
      description: 'Search logs using full-text search across message and data fields',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string', 
            description: 'Search query (supports AND, OR, NOT operators)' 
          },
          service: { 
            type: 'string', 
            description: 'Filter by service name' 
          },
          level: { 
            type: 'string',
            enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
            description: 'Filter by log level' 
          },
          limit: { 
            type: 'number', 
            description: 'Maximum results to return',
            default: 50
          }
        },
        required: ['query']
      }
    },

    // Trace request flow
    {
      name: 'log_trace',
      description: 'Trace a request flow across services using trace ID',
      inputSchema: {
        type: 'object',
        properties: {
          traceId: { 
            type: 'string', 
            description: 'Trace ID to follow across services' 
          }
        },
        required: ['traceId']
      }
    },

    // Get service health metrics
    {
      name: 'service_health',
      description: 'Get health metrics for services (error rates, activity, etc.)',
      inputSchema: {
        type: 'object',
        properties: {
          service: { 
            type: 'string', 
            description: 'Specific service to check (optional)' 
          },
          timeWindow: { 
            type: 'number', 
            description: 'Time window in seconds (default: 3600)',
            default: 3600
          }
        }
      }
    },

    // Get error trends
    {
      name: 'error_trends',
      description: 'Get error rate trends over time (hourly buckets)',
      inputSchema: {
        type: 'object',
        properties: {
          timeWindow: { 
            type: 'number', 
            description: 'Time window in seconds (default: 86400 for 24 hours)',
            default: 86400
          }
        }
      }
    },

    // Get recent errors
    {
      name: 'get_recent_errors',
      description: 'Get recent error logs for quick debugging',
      inputSchema: {
        type: 'object',
        properties: {
          limit: { 
            type: 'number', 
            description: 'Number of recent errors to return (default: 20)',
            default: 20
          }
        }
      }
    },

    // Get available services
    {
      name: 'get_log_services',
      description: 'Get list of services that have sent logs',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },

    // Get log statistics
    {
      name: 'log_stats',
      description: 'Get overall logging statistics',
      inputSchema: {
        type: 'object',
        properties: {}
      }
    },

    // Clean up old logs
    {
      name: 'log_cleanup',
      description: 'Remove old logs based on retention policy',
      inputSchema: {
        type: 'object',
        properties: {
          retentionDays: { 
            type: 'number', 
            description: 'Number of days to retain logs (default: 7)',
            default: 7
          }
        }
      }
    }
  ];

  // Register tool handlers
  toolHandlers.set('log_query', async (args: any) => {
    const params = logQuerySchema.parse(args);
    const logs = logService.queryLogs(params);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            logs,
            count: logs.length,
            filters: params
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('log_search', async (args: any) => {
    const parsedParams = logSearchSchema.parse(args);
    // Ensure query is present since it's required
    if (!parsedParams.query) {
      throw new Error('Query parameter is required for log search');
    }
    const results = logService.searchLogs(parsedParams as LogSearchFilters);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            results,
            count: results.length,
            query: parsedParams.query
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('log_trace', async (args: any) => {
    const { traceId } = logTraceSchema.parse(args);
    const trace = logService.traceRequest(traceId);
    
    // Calculate time deltas between log entries
    const enhancedTrace = trace.map((entry: any, index: number) => ({
      ...entry,
      timeDelta: index > 0 ? entry.timestamp - trace[index - 1].timestamp : 0
    }));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            traceId,
            entries: enhancedTrace,
            count: enhancedTrace.length,
            totalDuration: trace.length > 0 
              ? trace[trace.length - 1].timestamp - trace[0].timestamp 
              : 0
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('service_health', async (args: any) => {
    const params = serviceHealthSchema.parse(args);
    let health = logService.getServiceHealth(params.timeWindow);
    
    // Filter by specific service if provided
    if (params.service) {
      health = health.filter((h: any) => h.service === params.service);
    }
    
    // Calculate health scores
    const enhancedHealth = health.map((service: any) => ({
      ...service,
      errorRate: service.total_logs > 0 
        ? (service.error_count / service.total_logs) * 100 
        : 0,
      warningRate: service.total_logs > 0 
        ? (service.warning_count / service.total_logs) * 100 
        : 0,
      healthScore: calculateHealthScore(service),
      status: getHealthStatus(service)
    }));
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            services: enhancedHealth,
            timeWindow: params.timeWindow,
            timestamp: Math.floor(Date.now() / 1000)
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('error_trends', async (args: any) => {
    const { timeWindow } = errorTrendsSchema.parse(args);
    const trends = logService.getErrorTrends(timeWindow);
    
    // Group by service
    const trendsByService: Record<string, any[]> = {};
    trends.forEach((trend: any) => {
      if (!trendsByService[trend.service]) {
        trendsByService[trend.service] = [];
      }
      trendsByService[trend.service].push(trend);
    });
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            trends: trendsByService,
            timeWindow,
            timestamp: Math.floor(Date.now() / 1000)
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('get_recent_errors', async (args: any) => {
    const { limit } = recentErrorsSchema.parse(args);
    const errors = logService.getRecentErrors(limit);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            errors,
            count: errors.length,
            timestamp: Math.floor(Date.now() / 1000)
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('get_log_services', async () => {
    const services = logService.getServices();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            services,
            count: services.length
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('log_stats', async () => {
    const stats = logService.getLogStats();
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            ...stats,
            oldestLogDate: stats.oldest_log 
              ? new Date(stats.oldest_log * 1000).toISOString() 
              : null,
            newestLogDate: stats.newest_log 
              ? new Date(stats.newest_log * 1000).toISOString() 
              : null
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('log_cleanup', async (args: any) => {
    const { retentionDays } = logCleanupSchema.parse(args);
    const remainingCount = logService.cleanupOldLogs(retentionDays);
    
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            retentionDays,
            remainingLogs: remainingCount,
            message: `Cleaned up logs older than ${retentionDays} days`
          }, null, 2)
        }
      ]
    };
  });

  // Helper functions
  function calculateHealthScore(service: any): number {
    const errorWeight = 10;
    const warningWeight = 3;
    
    if (service.total_logs === 0) return 100;
    
    const errorPenalty = (service.error_count / service.total_logs) * errorWeight * 100;
    const warningPenalty = (service.warning_count / service.total_logs) * warningWeight * 100;
    
    const score = Math.max(0, 100 - errorPenalty - warningPenalty);
    return Math.round(score);
  }

  function getHealthStatus(service: any): string {
    const score = calculateHealthScore(service);
    
    if (score >= 90) return 'healthy';
    if (score >= 70) return 'degraded';
    if (score >= 50) return 'warning';
    return 'critical';
  }

  return tools;
}