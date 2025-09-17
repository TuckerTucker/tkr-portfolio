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
export declare class LogService {
    private kg;
    constructor(kg: AppStateKGSimple);
    /**
     * Get logs as formatted text for LazyLog component
     */
    getLogsAsText(filters?: LogQueryFilters): string;
    /**
     * Query logs with filters
     */
    queryLogs(filters?: LogQueryFilters): any[];
    /**
     * Search logs using full-text search
     */
    searchLogs(filters: LogSearchFilters): any[];
    /**
     * Get list of available services
     */
    getServices(): string[];
    /**
     * Get service health metrics
     */
    getServiceHealth(timeWindow?: number): any[];
    /**
     * Get error rate trends (hourly buckets)
     */
    getErrorTrends(timeWindow?: number): any[];
    /**
     * Trace a request flow across services
     */
    traceRequest(traceId: string): any[];
    /**
     * Get recent errors for quick debugging
     */
    getRecentErrors(limit?: number): any[];
    /**
     * Get log statistics
     */
    getLogStats(): any;
    /**
     * Clean up old logs (retention policy)
     */
    cleanupOldLogs(retentionDays?: number): number;
    /**
     * Get mock log data for development
     */
    getMockLogText(): string;
}
//# sourceMappingURL=log-service.d.ts.map