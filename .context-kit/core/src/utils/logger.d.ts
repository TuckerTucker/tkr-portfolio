/**
 * Core Logging Utilities
 * Pino-based structured logging setup for the core module
 */
import pino from 'pino';
import type { LogLevel } from '../types/logging.js';
export interface LoggerConfig {
    level?: LogLevel;
    service?: string;
    pretty?: boolean;
    destination?: string;
    metadata?: Record<string, any>;
}
export declare class CoreLogger {
    private logger;
    private service;
    constructor(config?: LoggerConfig);
    fatal(message: string, meta?: Record<string, any>): void;
    error(message: string, error?: Error, meta?: Record<string, any>): void;
    warn(message: string, meta?: Record<string, any>): void;
    info(message: string, meta?: Record<string, any>): void;
    debug(message: string, meta?: Record<string, any>): void;
    trace(message: string, meta?: Record<string, any>): void;
    logMethodEntry(methodName: string, params?: Record<string, any>): void;
    logMethodExit(methodName: string, result?: any): void;
    logMethodError(methodName: string, error: Error): void;
    logPerformance(operation: string, duration: number, meta?: Record<string, any>): void;
    logDatabaseQuery(query: string, duration: number, params?: any[]): void;
    logSearchQuery(query: string, resultCount: number, duration: number): void;
    child(meta: Record<string, any>): CoreLogger;
    getPinoLogger(): pino.Logger;
    setLevel(level: LogLevel): void;
    isLevelEnabled(level: LogLevel): boolean;
}
export declare const createLogger: (service: string, config?: Partial<LoggerConfig>) => CoreLogger;
export declare const coreLogger: CoreLogger;
export declare const logger: CoreLogger;
export declare const databaseLogger: CoreLogger;
export declare const searchLogger: CoreLogger;
export declare const knowledgeGraphLogger: CoreLogger;
export declare const loggingLogger: CoreLogger;
export declare class PerformanceTimer {
    private startTime;
    private logger;
    private operation;
    constructor(operation: string, targetLogger?: CoreLogger);
    finish(meta?: Record<string, any>): number;
}
export declare const timeOperation: (operation: string, targetLogger?: CoreLogger) => PerformanceTimer;
export declare const timeAsync: <T>(operation: string, fn: () => Promise<T>, targetLogger?: CoreLogger) => Promise<T>;
//# sourceMappingURL=logger.d.ts.map