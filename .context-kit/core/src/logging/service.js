/**
 * Unified Logging Service
 * Centralized log management with structured storage, filtering, and analytics
 */
import { IdGenerator } from '../utils/id-generator.js';
import { loggingLogger as logger, timeOperation } from '../utils/logger.js';
export class LoggingService {
    db;
    config;
    batchedLogs = [];
    batchTimer = null;
    constructor(db, config = {}) {
        this.db = db;
        this.config = {
            databasePath: config.databasePath || '',
            retentionDays: config.retentionDays || 30,
            batchSize: config.batchSize || 100,
            batchInterval: config.batchInterval || 5000,
            flushInterval: config.flushInterval || 5000,
            maxLogAge: config.maxLogAge || 30 * 24 * 60 * 60 * 1000, // 30 days
            enableAnalytics: config.enableAnalytics ?? true,
            retentionPolicy: config.retentionPolicy || 'time_based',
            maxLogEntries: config.maxLogEntries || 1000000,
            enableHttpTransport: config.enableHttpTransport ?? false,
            httpEndpoint: config.httpEndpoint || '',
            enableConsoleTransport: config.enableConsoleTransport ?? false,
            logLevel: config.logLevel || 'info',
            services: config.services || []
        };
        this.startBatchProcessor();
        logger.info('LoggingService initialized', { config: this.config });
    }
    // ============================================================================
    // LOG INGESTION
    // ============================================================================
    /**
     * Log a single entry
     */
    async log(level, message, metadata, service, source) {
        try {
            const entry = {
                id: IdGenerator.generateLogId(),
                timestamp: Date.now(),
                level,
                message,
                service: service || 'unknown',
                source: source || 'unknown',
                metadata: metadata || {},
                indexed_content: this.createIndexedContent(message, metadata || {})
            };
            // Add to batch
            this.batchedLogs.push(entry);
            // Trigger immediate flush for errors and fatal logs
            if (level === 'error' || level === 'fatal') {
                await this.flushBatch();
            }
            else if (this.batchedLogs.length >= this.config.batchSize) {
                await this.flushBatch();
            }
            return entry.id;
        }
        catch (error) {
            logger.error('Failed to log entry', error, { level, message, service, source });
            throw error;
        }
    }
    /**
     * Log multiple entries as a batch
     */
    async logBatch(batch) {
        const timer = timeOperation('log_batch', logger);
        try {
            const ids = [];
            for (const entry of batch.entries) {
                const fullEntry = {
                    ...entry,
                    id: entry.id || IdGenerator.generateLogId(),
                    indexed_content: this.createIndexedContent(entry.message, entry.metadata || {})
                };
                this.batchedLogs.push(fullEntry);
                ids.push(fullEntry.id);
            }
            // Flush if batch is large enough
            if (this.batchedLogs.length >= this.config.batchSize) {
                await this.flushBatch();
            }
            timer.finish({ success: true, entryCount: batch.entries.length });
            return ids;
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Failed to log batch', error, { batchSize: batch.entries.length });
            throw error;
        }
    }
    /**
     * Convenience methods for different log levels
     */
    async fatal(message, metadata, service) {
        return this.log('fatal', message, metadata, service);
    }
    async error(message, metadata, service) {
        return this.log('error', message, metadata, service);
    }
    async warn(message, metadata, service) {
        return this.log('warn', message, metadata, service);
    }
    async info(message, metadata, service) {
        return this.log('info', message, metadata, service);
    }
    async debug(message, metadata, service) {
        return this.log('debug', message, metadata, service);
    }
    // ============================================================================
    // LOG RETRIEVAL AND QUERYING
    // ============================================================================
    /**
     * Get logs with filtering and pagination
     */
    async getLogs(filter = {}, limit = 100, offset = 0) {
        try {
            let sql = 'SELECT * FROM log_entries WHERE 1=1';
            const params = [];
            // Apply filters
            if (filter.level) {
                sql += ' AND level = ?';
                params.push(filter.level);
            }
            if (filter.levels && filter.levels.length > 0) {
                const placeholders = filter.levels.map(() => '?').join(',');
                sql += ` AND level IN (${placeholders})`;
                params.push(...filter.levels);
            }
            if (filter.service) {
                sql += ' AND service = ?';
                params.push(filter.service);
            }
            if (filter.services && filter.services.length > 0) {
                const placeholders = filter.services.map(() => '?').join(',');
                sql += ` AND service IN (${placeholders})`;
                params.push(...filter.services);
            }
            if (filter.source) {
                sql += ' AND source LIKE ?';
                params.push(`%${filter.source}%`);
            }
            if (filter.message) {
                sql += ' AND (message LIKE ? OR indexed_content LIKE ?)';
                params.push(`%${filter.message}%`, `%${filter.message}%`);
            }
            if (filter.startTime) {
                sql += ' AND timestamp >= ?';
                params.push(filter.startTime);
            }
            if (filter.endTime) {
                sql += ' AND timestamp <= ?';
                params.push(filter.endTime);
            }
            if (filter.metadata) {
                for (const [key, value] of Object.entries(filter.metadata)) {
                    sql += ' AND JSON_EXTRACT(metadata, ?) = ?';
                    params.push(`$.${key}`, value);
                }
            }
            // Ordering and pagination
            sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            const results = this.db.query(sql, params);
            return results.map((row) => ({
                id: row.id,
                timestamp: row.timestamp,
                level: row.level,
                message: row.message,
                service: row.service,
                source: row.source,
                metadata: JSON.parse(row.metadata || '{}'),
                indexed_content: row.indexed_content
            }));
        }
        catch (error) {
            logger.error('Failed to get logs', error, { filter, limit, offset });
            throw error;
        }
    }
    /**
     * Search logs using full-text search
     */
    async searchLogs(query) {
        const timer = timeOperation('search_logs', logger);
        try {
            const { searchText, filters = {}, limit = 100, offset = 0, sortBy = 'timestamp', sortOrder = 'desc' } = query;
            let sql = `
        SELECT *
        FROM log_entries
        WHERE indexed_content LIKE ?
      `;
            const params = [`%${searchText}%`];
            // Apply additional filters
            if (filters.level) {
                sql += ' AND level = ?';
                params.push(filters.level);
            }
            if (filters.service) {
                sql += ' AND service = ?';
                params.push(filters.service);
            }
            if (filters.startTime) {
                sql += ' AND timestamp >= ?';
                params.push(filters.startTime);
            }
            if (filters.endTime) {
                sql += ' AND timestamp <= ?';
                params.push(filters.endTime);
            }
            sql += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()} LIMIT ? OFFSET ?`;
            params.push(limit, offset);
            const results = this.db.query(sql, params);
            const logs = results.map((row) => ({
                id: row.id,
                timestamp: row.timestamp,
                level: row.level,
                message: row.message,
                service: row.service,
                source: row.source,
                metadata: JSON.parse(row.metadata || '{}'),
                indexed_content: row.indexed_content
            }));
            timer.finish({ success: true, resultCount: logs.length });
            return logs;
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Failed to search logs', error, { query });
            throw error;
        }
    }
    /**
     * Get recent logs (last N entries)
     */
    async getRecentLogs(limit = 50) {
        return this.getLogs({}, limit, 0);
    }
    /**
     * Get logs for a specific service
     */
    async getServiceLogs(service, limit = 100) {
        return this.getLogs({ service }, limit, 0);
    }
    /**
     * Get error logs
     */
    async getErrorLogs(limit = 100) {
        return this.getLogs({ levels: ['error', 'fatal'] }, limit, 0);
    }
    // ============================================================================
    // ANALYTICS AND STATISTICS
    // ============================================================================
    /**
     * Get comprehensive log analytics
     */
    async getAnalytics(timeWindow) {
        const timer = timeOperation('log_analytics', logger);
        try {
            let timeFilter = '';
            const params = [];
            if (timeWindow) {
                timeFilter = ' WHERE timestamp >= ? AND timestamp <= ?';
                params.push(timeWindow.start, timeWindow.end);
            }
            // Total logs
            const totalResult = this.db.queryOne(`SELECT COUNT(*) as count FROM log_entries${timeFilter}`, params);
            const totalLogs = totalResult?.count || 0;
            // Logs by level
            const levelResults = this.db.query(`
        SELECT level, COUNT(*) as count
        FROM log_entries${timeFilter}
        GROUP BY level
      `, params);
            const logsByLevel = {
                fatal: 0,
                error: 0,
                warn: 0,
                info: 0,
                debug: 0,
                trace: 0
            };
            for (const row of levelResults) {
                logsByLevel[row.level] = row.count;
            }
            // Logs by service
            const serviceResults = this.db.query(`
        SELECT service, COUNT(*) as count
        FROM log_entries${timeFilter}
        GROUP BY service
        ORDER BY count DESC
      `, params);
            const logsByService = {};
            for (const row of serviceResults) {
                logsByService[row.service] = row.count;
            }
            // Recent errors
            const recentErrors = await this.getLogs({ levels: ['error', 'fatal'], ...(timeWindow && { startTime: timeWindow.start, endTime: timeWindow.end }) }, 10);
            // Performance metrics
            const perfResults = this.db.query(`
        SELECT
          JSON_EXTRACT(metadata, '$.operation') as operation,
          AVG(CAST(JSON_EXTRACT(metadata, '$.duration') AS REAL)) as avg_duration,
          MAX(CAST(JSON_EXTRACT(metadata, '$.duration') AS REAL)) as max_duration,
          timestamp
        FROM log_entries
        ${timeFilter}
        AND JSON_EXTRACT(metadata, '$.duration') IS NOT NULL
        GROUP BY operation
        ORDER BY max_duration DESC
        LIMIT 10
      `, params);
            const averageResponseTime = perfResults.length > 0
                ? perfResults.reduce((sum, row) => sum + (row.avg_duration || 0), 0) / perfResults.length
                : 0;
            const slowestOperations = perfResults.map((row) => ({
                operation: row.operation || 'unknown',
                duration: row.max_duration || 0,
                timestamp: row.timestamp
            }));
            // Trends calculation
            const now = Date.now();
            const oneHourAgo = now - (60 * 60 * 1000);
            const recentErrors1h = await this.getLogs({
                levels: ['error', 'fatal'],
                startTime: oneHourAgo,
                endTime: now
            }, 1000);
            const allRecent1h = await this.getLogs({
                startTime: oneHourAgo,
                endTime: now
            }, 10000);
            const errorRate = allRecent1h.length > 0 ? (recentErrors1h.length / allRecent1h.length) * 100 : 0;
            const logVelocity = allRecent1h.length / 60; // logs per minute
            // Service health based on recent error rates
            const serviceHealth = {};
            for (const [service, count] of Object.entries(logsByService)) {
                const serviceErrors = recentErrors1h.filter(log => log.service === service).length;
                const serviceTotal = allRecent1h.filter(log => log.service === service).length;
                const serviceErrorRate = serviceTotal > 0 ? (serviceErrors / serviceTotal) * 100 : 0;
                if (serviceErrorRate > 10) {
                    serviceHealth[service] = 'error';
                }
                else if (serviceErrorRate > 5) {
                    serviceHealth[service] = 'degraded';
                }
                else {
                    serviceHealth[service] = 'healthy';
                }
            }
            const analytics = {
                totalLogs,
                logsByLevel,
                logsByService,
                recentErrors,
                performance: {
                    averageResponseTime,
                    slowestOperations
                },
                trends: {
                    errorRate,
                    logVelocity,
                    serviceHealth
                }
            };
            timer.finish({ success: true, totalLogs });
            return analytics;
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Failed to generate log analytics', error);
            throw error;
        }
    }
    /**
     * Get basic log statistics
     */
    async getStats() {
        try {
            const result = this.db.queryOne(`
        SELECT
          COUNT(*) as total_entries,
          COUNT(CASE WHEN level = 'error' THEN 1 END) as error_count,
          COUNT(CASE WHEN level = 'warn' THEN 1 END) as warn_count,
          COUNT(CASE WHEN level = 'info' THEN 1 END) as info_count,
          COUNT(CASE WHEN level = 'debug' THEN 1 END) as debug_count,
          COUNT(CASE WHEN level = 'fatal' THEN 1 END) as fatal_count,
          MIN(timestamp) as oldest_entry,
          MAX(timestamp) as newest_entry
        FROM log_entries
      `);
            return {
                totalEntries: result?.total_entries || 0,
                errorCount: result?.error_count || 0,
                warnCount: result?.warn_count || 0,
                infoCount: result?.info_count || 0,
                debugCount: result?.debug_count || 0,
                fatalCount: result?.fatal_count || 0,
                oldestEntry: result?.oldest_entry || null,
                newestEntry: result?.newest_entry || null,
                lastUpdated: Date.now()
            };
        }
        catch (error) {
            logger.error('Failed to get log stats', error);
            throw error;
        }
    }
    // ============================================================================
    // MAINTENANCE OPERATIONS
    // ============================================================================
    /**
     * Clean old logs based on retention policy
     */
    async cleanOldLogs() {
        const timer = timeOperation('clean_old_logs', logger);
        try {
            let deletedCount = 0;
            if (this.config.retentionPolicy === 'time_based') {
                // Delete logs older than maxLogAge
                const cutoffTime = Date.now() - this.config.maxLogAge;
                const result = this.db.execute('DELETE FROM log_entries WHERE timestamp < ?', [cutoffTime]);
                deletedCount = result.changes;
            }
            else if (this.config.retentionPolicy === 'count_based') {
                // Keep only the most recent maxLogEntries
                const result = this.db.execute(`
          DELETE FROM log_entries
          WHERE id NOT IN (
            SELECT id FROM log_entries
            ORDER BY timestamp DESC
            LIMIT ?
          )
        `, [this.config.maxLogEntries]);
                deletedCount = result.changes;
            }
            timer.finish({ success: true, deletedCount });
            logger.info('Old logs cleaned', { deletedCount, retentionPolicy: this.config.retentionPolicy });
            return { deletedCount };
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Failed to clean old logs', error);
            throw error;
        }
    }
    /**
     * Optimize log storage
     */
    async optimize() {
        const timer = timeOperation('optimize_logs', logger);
        try {
            // Clean old logs first
            await this.cleanOldLogs();
            // Optimize database
            await this.db.optimize();
            timer.finish({ success: true });
            logger.info('Log storage optimized');
        }
        catch (error) {
            timer.finish({ success: false, error: error.message });
            logger.error('Failed to optimize log storage', error);
            throw error;
        }
    }
    /**
     * Health check
     */
    async healthCheck() {
        try {
            const stats = await this.getStats();
            return {
                healthy: true,
                logCount: stats.totalEntries,
                batchSize: this.batchedLogs.length,
                lastError: null
            };
        }
        catch (error) {
            return {
                healthy: false,
                logCount: 0,
                batchSize: this.batchedLogs.length,
                lastError: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    /**
     * Shutdown the logging service
     */
    async shutdown() {
        try {
            // Stop batch processor
            if (this.batchTimer) {
                clearInterval(this.batchTimer);
                this.batchTimer = null;
            }
            // Flush remaining logs
            await this.flushBatch();
            logger.info('LoggingService shutdown completed');
        }
        catch (error) {
            logger.error('Error during LoggingService shutdown', error);
            throw error;
        }
    }
    // ============================================================================
    // PRIVATE METHODS
    // ============================================================================
    /**
     * Start the batch processor
     */
    startBatchProcessor() {
        this.batchTimer = setInterval(async () => {
            if (this.batchedLogs.length > 0) {
                await this.flushBatch();
            }
        }, this.config.batchInterval);
    }
    /**
     * Flush batched logs to database
     */
    async flushBatch() {
        if (this.batchedLogs.length === 0) {
            return;
        }
        try {
            const logsToFlush = [...this.batchedLogs];
            this.batchedLogs = [];
            await this.db.transaction(() => {
                const stmt = this.db.statements.insertLogEntry();
                for (const entry of logsToFlush) {
                    stmt.run(entry.id, entry.timestamp, entry.level, entry.message, entry.service, entry.source, JSON.stringify(entry.metadata), entry.indexed_content);
                }
            });
            logger.debug('Flushed log batch', { count: logsToFlush.length });
        }
        catch (error) {
            // Put logs back at the beginning of the batch for retry
            this.batchedLogs.unshift(...this.batchedLogs);
            logger.error('Failed to flush log batch', error);
            throw error;
        }
    }
    /**
     * Create indexed content for full-text search
     */
    createIndexedContent(message, metadata) {
        const parts = [message];
        // Add searchable metadata fields
        if (metadata) {
            const searchableKeys = ['error', 'operation', 'module', 'function', 'category', 'tag'];
            for (const key of searchableKeys) {
                if (metadata[key]) {
                    parts.push(String(metadata[key]));
                }
            }
            // Add flattened metadata for deep search
            const flattenedMetadata = this.flattenObject(metadata);
            for (const value of Object.values(flattenedMetadata)) {
                if (typeof value === 'string' || typeof value === 'number') {
                    parts.push(String(value));
                }
            }
        }
        return parts.join(' ').toLowerCase();
    }
    /**
     * Flatten nested object for indexing
     */
    flattenObject(obj, prefix = '') {
        const flattened = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const newKey = prefix ? `${prefix}.${key}` : key;
                if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
                    Object.assign(flattened, this.flattenObject(obj[key], newKey));
                }
                else {
                    flattened[newKey] = obj[key];
                }
            }
        }
        return flattened;
    }
}
//# sourceMappingURL=service.js.map