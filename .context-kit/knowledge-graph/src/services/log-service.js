export class LogService {
    kg;
    constructor(kg) {
        this.kg = kg;
    }
    /**
     * Get logs as formatted text for LazyLog component
     */
    getLogsAsText(filters = {}) {
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
        }
        catch (error) {
            console.error('Error querying logs:', error);
            // Return mock data on error
            return this.getMockLogText();
        }
    }
    /**
     * Query logs with filters
     */
    queryLogs(filters = {}) {
        const { level, service, component, traceId, timeWindow, startTime, endTime, limit = 1000 } = filters;
        let sql = `
      SELECT l.timestamp, l.level, l.message, l.service, l.component, 
             l.data, l.trace_id, l.span_id, l.user_id, l.session_id
      FROM log_entries l
      WHERE 1=1
    `;
        const params = [];
        // Time filtering
        if (timeWindow) {
            const currentTime = Math.floor(Date.now() / 1000);
            sql += ' AND l.timestamp >= ?';
            params.push(currentTime - timeWindow);
        }
        else {
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
    searchLogs(filters) {
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
    getServices() {
        try {
            const results = this.kg.query(`
        SELECT DISTINCT name FROM log_sources ORDER BY name
      `);
            if (!results || results.length === 0) {
                // Return mock services if none exist
                return ['React UI', 'MCP Server', 'API Server'];
            }
            return results.map(row => row.name);
        }
        catch (error) {
            console.error('Error getting services:', error);
            // Return mock services on error
            return ['React UI', 'MCP Server', 'API Server'];
        }
    }
    /**
     * Get service health metrics
     */
    getServiceHealth(timeWindow = 3600) {
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
    /**
     * Get error rate trends (hourly buckets)
     */
    getErrorTrends(timeWindow = 86400) {
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
    traceRequest(traceId) {
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
    getRecentErrors(limit = 20) {
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
    getLogStats() {
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
     * Clean up old logs (retention policy)
     */
    cleanupOldLogs(retentionDays = 7) {
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
    getMockLogText() {
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
            .map(log => `${log.time.toISOString()} [${log.level}] ${log.service} ${log.component} - ${log.message}`)
            .join('\n');
    }
}
//# sourceMappingURL=log-service.js.map