/**
 * Unified Logging Service
 * Centralized log management with structured storage, filtering, and analytics
 */
import type { DatabaseConnection } from '../database/connection.js';
import type { LogEntry, LogLevel, LogFilter, LogQuery, LogStats, LogServiceConfig } from '../types/logging.js';
export interface LogBatch {
    entries: LogEntry[];
    timestamp: number;
    source: string;
}
export interface LogAnalytics {
    totalLogs: number;
    logsByLevel: Record<LogLevel, number>;
    logsByService: Record<string, number>;
    recentErrors: LogEntry[];
    performance: {
        averageResponseTime: number;
        slowestOperations: Array<{
            operation: string;
            duration: number;
            timestamp: number;
        }>;
    };
    trends: {
        errorRate: number;
        logVelocity: number;
        serviceHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
    };
}
export declare class LoggingService {
    private db;
    private config;
    private batchedLogs;
    private batchTimer;
    constructor(db: DatabaseConnection, config?: LogServiceConfig);
    /**
     * Log a single entry
     */
    log(level: LogLevel, message: string, metadata?: Record<string, any>, service?: string, source?: string): Promise<string>;
    /**
     * Log multiple entries as a batch
     */
    logBatch(batch: LogBatch): Promise<string[]>;
    /**
     * Convenience methods for different log levels
     */
    fatal(message: string, metadata?: Record<string, any>, service?: string): Promise<string>;
    error(message: string, metadata?: Record<string, any>, service?: string): Promise<string>;
    warn(message: string, metadata?: Record<string, any>, service?: string): Promise<string>;
    info(message: string, metadata?: Record<string, any>, service?: string): Promise<string>;
    debug(message: string, metadata?: Record<string, any>, service?: string): Promise<string>;
    /**
     * Get logs with filtering and pagination
     */
    getLogs(filter?: LogFilter, limit?: number, offset?: number): Promise<LogEntry[]>;
    /**
     * Search logs using full-text search
     */
    searchLogs(query: LogQuery): Promise<LogEntry[]>;
    /**
     * Get recent logs (last N entries)
     */
    getRecentLogs(limit?: number): Promise<LogEntry[]>;
    /**
     * Get logs for a specific service
     */
    getServiceLogs(service: string, limit?: number): Promise<LogEntry[]>;
    /**
     * Get error logs
     */
    getErrorLogs(limit?: number): Promise<LogEntry[]>;
    /**
     * Get comprehensive log analytics
     */
    getAnalytics(timeWindow?: {
        start: number;
        end: number;
    }): Promise<LogAnalytics>;
    /**
     * Get basic log statistics
     */
    getStats(): Promise<LogStats>;
    /**
     * Clean old logs based on retention policy
     */
    cleanOldLogs(): Promise<{
        deletedCount: number;
    }>;
    /**
     * Optimize log storage
     */
    optimize(): Promise<void>;
    /**
     * Health check
     */
    healthCheck(): Promise<{
        healthy: boolean;
        logCount: number;
        batchSize: number;
        lastError: string | null;
    }>;
    /**
     * Shutdown the logging service
     */
    shutdown(): Promise<void>;
    /**
     * Start the batch processor
     */
    private startBatchProcessor;
    /**
     * Flush batched logs to database
     */
    private flushBatch;
    /**
     * Create indexed content for full-text search
     */
    private createIndexedContent;
    /**
     * Flatten nested object for indexing
     */
    private flattenObject;
}
//# sourceMappingURL=service.d.ts.map