/**
 * Core Logging Utilities
 * Pino-based structured logging setup for the core module
 */
import pino from 'pino';
export class CoreLogger {
    logger;
    service;
    constructor(config = {}) {
        this.service = config.service || 'core';
        const options = {
            level: config.level || 'info',
            base: {
                service: this.service,
                ...config.metadata
            },
            timestamp: pino.stdTimeFunctions.isoTime,
            formatters: {
                level: (label) => {
                    return { level: label };
                }
            }
        };
        // Pretty printing for development
        if (config.pretty && process.env.NODE_ENV !== 'production') {
            this.logger = pino(options, pino.destination({
                dest: 1, // stdout
                sync: false
            }));
        }
        else if (config.destination) {
            this.logger = pino(options, pino.destination(config.destination));
        }
        else {
            this.logger = pino(options);
        }
    }
    // Core logging methods
    fatal(message, meta) {
        this.logger.fatal(meta, message);
    }
    error(message, error, meta) {
        const logMeta = { ...meta };
        if (error) {
            logMeta.error = {
                name: error.name,
                message: error.message,
                stack: error.stack
            };
        }
        this.logger.error(logMeta, message);
    }
    warn(message, meta) {
        this.logger.warn(meta, message);
    }
    info(message, meta) {
        this.logger.info(meta, message);
    }
    debug(message, meta) {
        this.logger.debug(meta, message);
    }
    trace(message, meta) {
        this.logger.trace(meta, message);
    }
    // Utility methods for common patterns
    logMethodEntry(methodName, params) {
        this.debug(`Entering ${methodName}`, { method: methodName, params });
    }
    logMethodExit(methodName, result) {
        this.debug(`Exiting ${methodName}`, { method: methodName, result });
    }
    logMethodError(methodName, error) {
        this.error(`Error in ${methodName}`, error, { method: methodName });
    }
    logPerformance(operation, duration, meta) {
        this.info(`Performance: ${operation}`, {
            operation,
            duration,
            unit: 'ms',
            ...meta
        });
    }
    logDatabaseQuery(query, duration, params) {
        this.debug('Database query executed', {
            query,
            duration,
            params: params ? params.length : 0,
            unit: 'ms'
        });
    }
    logSearchQuery(query, resultCount, duration) {
        this.info('Search query executed', {
            query,
            resultCount,
            duration,
            unit: 'ms'
        });
    }
    // Create child logger with additional context
    child(meta) {
        const childLogger = new CoreLogger({
            service: this.service
        });
        childLogger.logger = this.logger.child(meta);
        return childLogger;
    }
    // Get the underlying pino logger
    getPinoLogger() {
        return this.logger;
    }
    // Set log level dynamically
    setLevel(level) {
        this.logger.level = level;
    }
    // Check if level is enabled
    isLevelEnabled(level) {
        return this.logger.isLevelEnabled(level);
    }
}
// Create default loggers for different components
export const createLogger = (service, config = {}) => {
    return new CoreLogger({
        service,
        level: process.env.LOG_LEVEL || 'info',
        pretty: process.env.NODE_ENV === 'development',
        ...config
    });
};
// Default core logger instance
export const coreLogger = createLogger('core');
export const logger = coreLogger;
// Component-specific loggers
export const databaseLogger = createLogger('database');
export const searchLogger = createLogger('search');
export const knowledgeGraphLogger = createLogger('knowledge-graph');
export const loggingLogger = createLogger('logging');
// Performance timing utility
export class PerformanceTimer {
    startTime;
    logger;
    operation;
    constructor(operation, targetLogger = coreLogger) {
        this.operation = operation;
        this.logger = targetLogger;
        this.startTime = Date.now();
    }
    finish(meta) {
        const duration = Date.now() - this.startTime;
        this.logger.logPerformance(this.operation, duration, meta);
        return duration;
    }
}
// Convenience function for timing operations
export const timeOperation = (operation, targetLogger) => {
    return new PerformanceTimer(operation, targetLogger || coreLogger);
};
// Async operation timing
export const timeAsync = async (operation, fn, targetLogger) => {
    const timer = timeOperation(operation, targetLogger);
    try {
        const result = await fn();
        timer.finish({ success: true });
        return result;
    }
    catch (error) {
        timer.finish({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        throw error;
    }
};
//# sourceMappingURL=logger.js.map