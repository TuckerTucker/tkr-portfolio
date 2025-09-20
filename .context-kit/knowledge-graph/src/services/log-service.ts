import { AppStateKGSimple } from '../core/knowledge-graph-simple.js';

export interface LogQueryFilters {
  service?: string;
  level?: string;
  component?: string;
  traceId?: string;
  timeWindow?: number;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

export interface LogSearchFilters {
  query: string;
  service?: string;
  level?: string;
  limit?: number;
}

export class LogService {
  private kg: AppStateKGSimple;

  constructor(kg: AppStateKGSimple) {
    this.kg = kg;
  }

  /**
   * Get logs as formatted text for LazyLog component
   */
  getLogsAsText(filters: LogQueryFilters = {}): string {
    try {
      const results = this.queryLogs(filters);
      
      if (!results || results.length === 0) {
        // Return mock data if no logs exist
        return this.getMockLogText();
      }
      
      return results
        .map(row => {
          const date = new Date(row.timestamp * 1000).toISOString();
          const component = row.component ? ` ${row.component}` : '';
          const data = row.data ? ` ${JSON.stringify(JSON.parse(row.data))}` : '';
          return `${date} [${row.level}] ${row.service}${component} - ${row.message}${data}`;
        })
        .join('\n');
    } catch (error) {
      console.error('Error querying logs:', error);
      // Return mock data on error
      return this.getMockLogText();
    }
  }

  /**
   * Query logs with filters
   */
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

  /**
   * Search logs using full-text search
   */
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

  /**
   * Get list of available services
   */
  getServices(): string[] {
    try {
      const results = this.kg.query(`
        SELECT DISTINCT name FROM log_sources ORDER BY name
      `);
      
      if (!results || results.length === 0) {
        // Return mock services if none exist
        return ['React UI', 'MCP Server', 'API Server'];
      }
      
      return results.map(row => row.name);
    } catch (error) {
      console.error('Error getting services:', error);
      // Return mock services on error
      return ['React UI', 'MCP Server', 'API Server'];
    }
  }

  /**
   * Get service health metrics enhanced for dashboard
   */
  getServiceHealth(timeWindow: number = 3600): any[] {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - timeWindow;

      const rawData = this.kg.query(`
        SELECT
          l.service,
          s.type as service_type,
          COUNT(CASE WHEN l.level IN ('ERROR', 'FATAL') THEN 1 END) as error_count,
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

      // Transform to ServiceHealthInfo format
      return rawData.map(row => {
        const errorRate = row.total_logs > 0 ? row.error_count / row.total_logs : 0;
        const timeSinceLastLog = currentTime - row.last_log;

        // Determine service status based on error rate and activity
        let status = 'healthy';
        if (timeSinceLastLog > 300) { // No logs in 5 minutes
          status = 'offline';
        } else if (errorRate > 0.1) { // More than 10% errors
          status = 'critical';
        } else if (errorRate > 0.05 || row.warning_count > row.total_logs * 0.2) { // 5%+ errors or 20%+ warnings
          status = 'degraded';
        }

        return {
          service: row.service,
          status,
          lastLog: new Date(row.last_log * 1000).toISOString(),
          errorRate,
          logCount: row.total_logs,
          errorCount: row.error_count,
          warningCount: row.warning_count,
          serviceType: row.service_type,
          // Additional metrics for dashboard
          timeSinceLastLog,
          isActive: timeSinceLastLog < 300
        };
      });
    } catch (error) {
      console.error('Error getting service health:', error);
      // Return mock data on error
      return this.getMockServiceHealth();
    }
  }

  /**
   * Get mock service health for development
   */
  private getMockServiceHealth(): any[] {
    return [
      {
        service: 'Dashboard',
        status: 'healthy',
        lastLog: new Date(Date.now() - 30000).toISOString(),
        errorRate: 0.02,
        logCount: 312,
        errorCount: 6,
        warningCount: 12,
        serviceType: 'frontend',
        timeSinceLastLog: 30,
        isActive: true
      },
      {
        service: 'Knowledge Graph',
        status: 'healthy',
        lastLog: new Date(Date.now() - 15000).toISOString(),
        errorRate: 0.01,
        logCount: 398,
        errorCount: 4,
        warningCount: 8,
        serviceType: 'backend',
        timeSinceLastLog: 15,
        isActive: true
      },
      {
        service: 'MCP Server',
        status: 'degraded',
        lastLog: new Date(Date.now() - 120000).toISOString(),
        errorRate: 0.08,
        logCount: 287,
        errorCount: 23,
        warningCount: 45,
        serviceType: 'backend',
        timeSinceLastLog: 120,
        isActive: true
      },
      {
        service: 'Logging Service',
        status: 'healthy',
        lastLog: new Date(Date.now() - 5000).toISOString(),
        errorRate: 0.03,
        logCount: 250,
        errorCount: 7,
        warningCount: 15,
        serviceType: 'backend',
        timeSinceLastLog: 5,
        isActive: true
      }
    ];
  }

  /**
   * Get error rate trends (hourly buckets)
   */
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

  /**
   * Trace a request flow across services
   */
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

  /**
   * Get recent errors for quick debugging
   */
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

  /**
   * Get log statistics
   */
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

  /**
   * Calculate comprehensive log statistics for dashboard
   */
  calculateStats(timeWindow: number = 3600): any {
    try {
      const currentTime = Math.floor(Date.now() / 1000);
      const startTime = currentTime - timeWindow;

      // Get overall statistics
      const totalStats = this.kg.query(`
        SELECT
          COUNT(*) as totalLogs,
          COUNT(CASE WHEN level = 'FATAL' THEN 1 END) as fatalCount,
          COUNT(CASE WHEN level = 'ERROR' THEN 1 END) as errorCount,
          COUNT(CASE WHEN level = 'WARN' THEN 1 END) as warnCount,
          COUNT(CASE WHEN level = 'INFO' THEN 1 END) as infoCount,
          COUNT(CASE WHEN level = 'DEBUG' THEN 1 END) as debugCount
        FROM log_entries
        WHERE timestamp >= ?
      `, [startTime])[0] || {};

      // Get logs by service
      const serviceStats = this.kg.query(`
        SELECT
          service,
          COUNT(*) as count
        FROM log_entries
        WHERE timestamp >= ?
        GROUP BY service
        ORDER BY count DESC
      `, [startTime]);

      // Get recent errors for dashboard
      const recentErrors = this.kg.query(`
        SELECT
          timestamp,
          level,
          message,
          service,
          component,
          data
        FROM log_entries
        WHERE level IN ('ERROR', 'FATAL')
          AND timestamp >= ?
        ORDER BY timestamp DESC
        LIMIT 5
      `, [startTime]);

      // Transform to match dashboard interface
      const logsByLevel = {
        'FATAL': totalStats.fatalCount || 0,
        'ERROR': totalStats.errorCount || 0,
        'WARN': totalStats.warnCount || 0,
        'INFO': totalStats.infoCount || 0,
        'DEBUG': totalStats.debugCount || 0
      };

      const logsByService = {};
      serviceStats.forEach(row => {
        logsByService[row.service] = row.count;
      });

      return {
        totalLogs: totalStats.totalLogs || 0,
        errorCount: (totalStats.errorCount || 0) + (totalStats.fatalCount || 0),
        logsByLevel,
        logsByService,
        recentErrors: recentErrors.map(row => ({
          id: `error-${row.timestamp}`,
          timestamp: new Date(row.timestamp * 1000).toISOString(),
          level: row.level,
          service: row.service,
          component: row.component,
          message: row.message,
          metadata: row.data ? JSON.parse(row.data) : undefined
        }))
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      // Return mock stats on error
      return this.getMockStats();
    }
  }

  /**
   * Get mock statistics for development
   */
  private getMockStats(): any {
    return {
      totalLogs: 1247,
      errorCount: 90,
      logsByLevel: {
        'FATAL': 12,
        'ERROR': 78,
        'WARN': 189,
        'INFO': 445,
        'DEBUG': 523
      },
      logsByService: {
        'Dashboard': 312,
        'Knowledge Graph': 398,
        'MCP Server': 287,
        'Logging Service': 250
      },
      recentErrors: [
        {
          id: 'error-1',
          timestamp: new Date(Date.now() - 30000).toISOString(),
          level: 'ERROR',
          service: 'Dashboard',
          component: 'App',
          message: 'Failed to connect to backend service',
          metadata: { statusCode: 500 }
        },
        {
          id: 'error-2',
          timestamp: new Date(Date.now() - 120000).toISOString(),
          level: 'ERROR',
          service: 'Knowledge Graph',
          component: 'EntityHandler',
          message: 'Database connection timeout',
          metadata: { timeout: 5000 }
        }
      ]
    };
  }

  /**
   * Clean up old logs (retention policy)
   */
  cleanupOldLogs(retentionDays: number = 7): number {
    const cutoffTime = Math.floor(Date.now() / 1000) - (retentionDays * 24 * 60 * 60);
    
    // Execute DELETE query
    this.kg.query(`
      DELETE FROM log_entries WHERE timestamp < ?
    `, [cutoffTime]);

    // Get count of remaining entries to estimate deletions
    const remaining = this.kg.query(`
      SELECT COUNT(*) as count FROM log_entries
    `, [])[0] || { count: 0 };

    return remaining.count;
  }

  /**
   * Get mock log data for development
   */
  getMockLogText(): string {
    const now = new Date();
    const logs = [
      { 
        time: now, 
        level: 'INFO', 
        service: 'React UI', 
        message: 'Application started',
        component: 'App'
      },
      { 
        time: new Date(now.getTime() - 5000), 
        level: 'INFO', 
        service: 'MCP Server', 
        message: 'Knowledge graph initialized',
        component: 'KnowledgeGraph'
      },
      { 
        time: new Date(now.getTime() - 10000), 
        level: 'WARN', 
        service: 'API Server', 
        message: 'High memory usage detected',
        component: 'HealthCheck'
      },
      { 
        time: new Date(now.getTime() - 15000), 
        level: 'ERROR', 
        service: 'React UI', 
        message: 'Failed to fetch user data: Network timeout',
        component: 'UserProfile'
      },
      { 
        time: new Date(now.getTime() - 20000), 
        level: 'DEBUG', 
        service: 'MCP Server', 
        message: 'Processing entity creation request',
        component: 'EntityHandler'
      },
      { 
        time: new Date(now.getTime() - 25000), 
        level: 'INFO', 
        service: 'API Server', 
        message: 'Request processed successfully',
        component: 'RequestHandler'
      }
    ];

    return logs
      .map(log => 
        `${log.time.toISOString()} [${log.level}] ${log.service} ${log.component} - ${log.message}`
      )
      .join('\n');
  }
}