import { z } from 'zod';
import {
  LoggingService,
  LogFilters,
  LogFilter,
  LogQuery,
  LogLevel
} from '@tkr-context-kit/core';
import { MCPServerConfig, ToolDefinition, ToolResponse } from '../types.js';

// Import ServiceNameResolver for consistent service naming
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

let ServiceNameResolver: any;
try {
  const path = require('path');
  const resolverPath = path.join(__dirname, '../../../logging-client/src/service-name-resolver.js');
  const resolverModule = require(resolverPath);
  ServiceNameResolver = resolverModule.getServiceNameResolver();
} catch (error) {
  console.warn('Failed to load ServiceNameResolver in logging tools:', error.message);
  // Fallback ServiceNameResolver
  ServiceNameResolver = {
    resolveServiceName: (context = {}) => ({
      serviceName: 'mcp-logging',
      displayName: 'MCP Logging',
      category: 'api-service',
      confidence: 0.1,
      source: 'fallback'
    }),
    validateServiceName: (name: string) => ({ isValid: true, errors: [] }),
    sanitizeServiceName: (name: string) => String(name || 'unknown').toLowerCase()
  };
}

// Legacy interface mapping for backward compatibility
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

// Helper function to convert LogQueryFilters to core LogFilters
function convertToLogFilters(filters: LogQueryFilters): LogFilter {
  const coreFilters: LogFilter = {};

  if (filters.service) coreFilters.service = filters.service;
  if (filters.level) coreFilters.level = filters.level as LogLevel;
  if (filters.component) coreFilters.component = filters.component;
  if (filters.traceId) {
    if (!coreFilters.metadata) coreFilters.metadata = {};
    coreFilters.metadata.traceId = filters.traceId;
  }

  // Handle time filters
  if (filters.timeWindow) {
    const endTime = Date.now();
    const startTime = endTime - (filters.timeWindow * 1000);
    coreFilters.timeRange = { start: startTime, end: endTime };
  } else {
    const timeRange: any = {};
    if (filters.startTime) {
      timeRange.start = filters.startTime * 1000;
    }
    if (filters.endTime) {
      timeRange.end = filters.endTime * 1000;
    }
    if (Object.keys(timeRange).length > 0) {
      coreFilters.timeRange = timeRange;
    }
  }

  return coreFilters;
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
 * Setup logging-related MCP tools using core LoggingService
 */
export function setupLoggingTools(
  config: MCPServerConfig,
  toolHandlers: Map<string, (args: any) => Promise<ToolResponse>>,
  loggingService: LoggingService
): ToolDefinition[] {
  // Use the provided core logging service
  const logger = loggingService;

  // Get consistent service name for MCP logging operations
  const mcpServiceInfo = ServiceNameResolver.resolveServiceName({
    processInfo: {
      type: 'mcp-server',
      subtype: 'context-kit',
      command: 'node'
    },
    packageInfo: {
      name: '@tkr-context-kit/mcp'
    },
    explicitName: process.env.TKR_SERVICE_NAME
  });

  // Add defensive check for logger methods with consistent service naming
  const safeLogger = {
    debug: (message: string, metadata?: any) => {
      try {
        const enhancedMetadata = {
          service: mcpServiceInfo.serviceName,
          serviceName: mcpServiceInfo.serviceName,
          displayName: mcpServiceInfo.displayName,
          component: 'mcp-logging-tools',
          ...metadata
        };
        if (logger && typeof logger.debug === 'function') {
          return logger.debug(message, enhancedMetadata);
        }
        console.log(`[DEBUG:${mcpServiceInfo.displayName}]`, message, enhancedMetadata);
      } catch (error) {
        console.log('[DEBUG ERROR]', message, metadata, error);
      }
    },
    info: (message: string, metadata?: any) => {
      try {
        const enhancedMetadata = {
          service: mcpServiceInfo.serviceName,
          serviceName: mcpServiceInfo.serviceName,
          displayName: mcpServiceInfo.displayName,
          component: 'mcp-logging-tools',
          ...metadata
        };
        if (logger && typeof logger.info === 'function') {
          return logger.info(message, enhancedMetadata);
        }
        console.log(`[INFO:${mcpServiceInfo.displayName}]`, message, enhancedMetadata);
      } catch (error) {
        console.log('[INFO ERROR]', message, metadata, error);
      }
    },
    warn: (message: string, metadata?: any) => {
      try {
        const enhancedMetadata = {
          service: mcpServiceInfo.serviceName,
          serviceName: mcpServiceInfo.serviceName,
          displayName: mcpServiceInfo.displayName,
          component: 'mcp-logging-tools',
          ...metadata
        };
        if (logger && typeof logger.warn === 'function') {
          return logger.warn(message, enhancedMetadata);
        }
        console.warn(`[WARN:${mcpServiceInfo.displayName}]`, message, enhancedMetadata);
      } catch (error) {
        console.log('[WARN ERROR]', message, metadata, error);
      }
    },
    error: (message: string, metadata?: any) => {
      try {
        const enhancedMetadata = {
          service: mcpServiceInfo.serviceName,
          serviceName: mcpServiceInfo.serviceName,
          displayName: mcpServiceInfo.displayName,
          component: 'mcp-logging-tools',
          ...metadata
        };
        if (logger && typeof logger.error === 'function') {
          return logger.error(message, enhancedMetadata);
        }
        console.error(`[ERROR:${mcpServiceInfo.displayName}]`, message, enhancedMetadata);
      } catch (error) {
        console.log('[ERROR ERROR]', message, metadata, error);
      }
    }
  };

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
    safeLogger.debug('Querying logs', { filters: params });

    try {
      const coreFilters = convertToLogFilters(params);
      const logs = await logger.getLogs(coreFilters);

      safeLogger.info('Log query completed', { resultCount: logs.length });
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
    } catch (error) {
      safeLogger.error('Log query failed', { error: error.message });
      throw error;
    }
  });

  toolHandlers.set('log_search', async (args: any) => {
    const parsedParams = logSearchSchema.parse(args);
    safeLogger.debug('Searching logs', { query: parsedParams.query });

    try {
      // Convert to core search query
      const searchQuery: LogQuery = {
        filters: {},
        limit: parsedParams.limit || 50
      };

      if (parsedParams.service) searchQuery.filters!.service = parsedParams.service;
      if (parsedParams.level) searchQuery.filters!.level = parsedParams.level as LogLevel;
      if (parsedParams.query) {
        // Use message filter for text search
        searchQuery.filters!.message = parsedParams.query;
      }

      const results = await logger.searchLogs(searchQuery);

      safeLogger.info('Log search completed', {
        query: parsedParams.query,
        resultCount: results.length
      });

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
    } catch (error) {
      safeLogger.error('Log search failed', {
        query: parsedParams.query,
        error: error.message
      });
      throw error;
    }
  });

  toolHandlers.set('log_trace', async (args: any) => {
    const { traceId } = logTraceSchema.parse(args);
    safeLogger.debug('Tracing request by trace ID', { traceId });

    try {
      const trace = await logger.searchLogs({
        filters: { metadata: { traceId } },
        limit: 1000
      });

      // Calculate time deltas between log entries
      const enhancedTrace = trace.map((entry: any, index: number) => ({
        ...entry,
        timeDelta: index > 0 ?
          new Date(entry.timestamp).getTime() - new Date(trace[index - 1].timestamp).getTime()
          : 0
      }));

      safeLogger.info('Request trace completed', { traceId, entryCount: trace.length });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              traceId,
              entries: enhancedTrace,
              count: enhancedTrace.length,
              totalDuration: trace.length > 0 ?
                new Date(trace[trace.length - 1].timestamp).getTime() - new Date(trace[0].timestamp).getTime()
                : 0
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      safeLogger.error('Request trace failed', { traceId, error: error.message });
      throw error;
    }
  });

  toolHandlers.set('service_health', async (args: any) => {
    const params = serviceHealthSchema.parse(args);
    safeLogger.debug('Getting service health metrics', params);

    // For now, return a simplified health check
    safeLogger.warn('Service health metrics not fully implemented with core module');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Service health metrics are not yet fully implemented with the core module.',
            requestedService: params.service,
            timeWindow: params.timeWindow,
            timestamp: Math.floor(Date.now() / 1000)
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('error_trends', async (args: any) => {
    const { timeWindow } = errorTrendsSchema.parse(args);
    safeLogger.debug('Getting error trends', { timeWindow });

    // For now, return a simplified response
    safeLogger.warn('Error trends analysis not fully implemented with core module');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            message: 'Error trends analysis is not yet fully implemented with the core module.',
            timeWindow,
            timestamp: Math.floor(Date.now() / 1000)
          }, null, 2)
        }
      ]
    };
  });

  toolHandlers.set('get_recent_errors', async (args: any) => {
    const { limit } = recentErrorsSchema.parse(args);
    safeLogger.debug('Getting recent errors', { limit });

    try {
      const errors = await logger.getLogs({
        level: 'ERROR',
        // Get errors from the last hour
        timeRange: { start: Date.now() - 3600000, end: Date.now() }
      }, limit || 20);

      safeLogger.info('Recent errors retrieved', { count: errors.length });
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
    } catch (error) {
      safeLogger.error('Failed to get recent errors', { error: error.message });
      throw error;
    }
  });

  toolHandlers.set('get_log_services', async () => {
    safeLogger.debug('Getting available log services');

    try {
      // Use ServiceNameResolver to get consistent service names and display names
      const knownServices = [
        { type: 'mcp-server', name: '@tkr-context-kit/mcp' },
        { type: 'dev-server', name: '@tkr-context-kit/dashboard' },
        { type: 'http-server', name: '@tkr-context-kit/knowledge-graph' },
        { type: 'logging-client', name: '@tkr-context-kit/logging-client' },
        { type: 'terminal', name: 'terminal' },
        { type: 'build-tool', name: 'build-process' },
        { type: 'test-runner', name: 'test-runner' }
      ];

      const services = knownServices.map(service => {
        const resolved = ServiceNameResolver.resolveServiceName({
          processInfo: { type: service.type },
          packageInfo: { name: service.name }
        });

        return {
          serviceName: resolved.serviceName,
          displayName: resolved.displayName,
          category: resolved.category,
          type: service.type
        };
      });

      // Add current MCP service to the list
      services.unshift({
        serviceName: mcpServiceInfo.serviceName,
        displayName: mcpServiceInfo.displayName,
        category: mcpServiceInfo.category,
        type: 'mcp-server'
      });

      // Remove duplicates by serviceName
      const uniqueServices = services.filter((service, index, self) =>
        index === self.findIndex(s => s.serviceName === service.serviceName)
      );

      safeLogger.info('Log services retrieved with consistent naming', {
        count: uniqueServices.length,
        mcpService: mcpServiceInfo.displayName
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              services: uniqueServices,
              count: uniqueServices.length,
              categorySummary: uniqueServices.reduce((acc, service) => {
                acc[service.category] = (acc[service.category] || 0) + 1;
                return acc;
              }, {} as Record<string, number>),
              note: 'Service names resolved using ServiceNameResolver for consistency with dashboard'
            }, null, 2)
          }
        ]
      };
    } catch (error) {
      safeLogger.error('Failed to get log services', { error: error.message });
      throw error;
    }
  });

  toolHandlers.set('log_stats', async () => {
    safeLogger.debug('Getting log statistics');

    try {
      // Get basic stats from core logging service
      const recentLogs = await logger.getLogs({}, 1);
      const errorLogs = await logger.getLogs({ level: 'ERROR' }, 1);
      const warnLogs = await logger.getLogs({ level: 'WARN' }, 1);

      const stats = {
        hasRecentLogs: recentLogs.length > 0,
        hasErrors: errorLogs.length > 0,
        hasWarnings: warnLogs.length > 0,
        note: 'Detailed statistics not yet implemented with core module'
      };

      safeLogger.info('Log statistics retrieved', stats);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(stats, null, 2)
          }
        ]
      };
    } catch (error) {
      safeLogger.error('Failed to get log statistics', { error: error.message });
      throw error;
    }
  });

  toolHandlers.set('log_cleanup', async (args: any) => {
    const { retentionDays } = logCleanupSchema.parse(args);
    safeLogger.debug('Log cleanup requested', { retentionDays });

    // For now, return a message that cleanup is not implemented
    safeLogger.warn('Log cleanup not yet implemented with core module');

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            retentionDays,
            message: `Log cleanup is not yet implemented with the core module.`
          }, null, 2)
        }
      ]
    };
  });

  return tools;
}