/**
 * Logging System Types
 * Unified logging interfaces for all modules
 */
export type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
export interface LogEntry {
    id: string;
    timestamp: number;
    level: LogLevel;
    service: string;
    source: string;
    message: string;
    metadata?: Record<string, any>;
    indexed_content: string;
    error?: {
        name: string;
        message: string;
        stack?: string;
    };
    requestId?: string;
    userId?: string;
    sessionId?: string;
}
export interface LogFilters {
    level?: LogLevel;
    levels?: LogLevel[];
    service?: string;
    services?: string[];
    message?: string;
    messagePattern?: string;
    timeRange?: {
        start: number;
        end: number;
    };
    metadata?: Record<string, any>;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'level' | 'service';
    sortOrder?: 'asc' | 'desc';
}
export interface LogStats {
    totalEntries: number;
    errorCount: number;
    warnCount: number;
    infoCount: number;
    debugCount: number;
    fatalCount: number;
    oldestEntry: number | null;
    newestEntry: number | null;
    lastUpdated: number;
    total?: number;
    byLevel?: Record<LogLevel, number>;
    byService?: Record<string, number>;
    timeRange?: {
        start: number;
        end: number;
    };
    errorRate?: number;
    averageLogsPerMinute?: number;
}
export interface LogAggregation {
    timestamp: number;
    period: 'hour' | 'day' | 'week';
    total: number;
    byLevel: Record<LogLevel, number>;
    byService: Record<string, number>;
}
export interface LogServiceConfig {
    databasePath?: string;
    retentionDays?: number;
    batchSize?: number;
    batchInterval?: number;
    flushInterval?: number;
    maxLogAge?: number;
    enableAnalytics?: boolean;
    retentionPolicy?: 'time_based' | 'count_based';
    maxLogEntries?: number;
    enableHttpTransport?: boolean;
    httpEndpoint?: string;
    enableConsoleTransport?: boolean;
    logLevel?: LogLevel;
    services?: string[];
}
export interface TransportConfig {
    type: 'http' | 'database' | 'console' | 'file';
    endpoint?: string;
    batchSize?: number;
    timeout?: number;
    retries?: number;
    headers?: Record<string, string>;
    auth?: {
        type: 'bearer' | 'basic' | 'api-key';
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
    };
}
export interface HealthStatus {
    service: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: number;
    uptime: number;
    checks: HealthCheck[];
    metadata?: Record<string, any>;
}
export interface HealthCheck {
    name: string;
    status: 'pass' | 'fail' | 'warn';
    duration: number;
    message?: string;
    metadata?: Record<string, any>;
}
export interface ServiceStatus {
    name: string;
    version: string;
    status: 'running' | 'stopped' | 'error' | 'starting' | 'stopping';
    pid?: number;
    port?: number;
    startTime?: number;
    lastHealthCheck?: number;
    errorCount: number;
    restartCount: number;
}
export interface LogQueryResult {
    entries: LogEntry[];
    total: number;
    hasMore: boolean;
    nextOffset?: number;
    executionTime: number;
}
export interface LogFilter {
    level?: LogLevel;
    levels?: LogLevel[];
    service?: string;
    services?: string[];
    source?: string;
    message?: string;
    startTime?: number;
    endTime?: number;
    metadata?: Record<string, any>;
}
export interface LogQuery {
    searchText: string;
    filters?: LogFilter;
    limit?: number;
    offset?: number;
    sortBy?: 'timestamp' | 'level' | 'service';
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=logging.d.ts.map