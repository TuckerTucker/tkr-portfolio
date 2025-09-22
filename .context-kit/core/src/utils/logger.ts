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

export class CoreLogger {
  private logger: pino.Logger;
  private service: string;

  constructor(config: LoggerConfig = {}) {
    this.service = config.service || 'core';

    const options: pino.LoggerOptions = {
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
    } else if (config.destination) {
      this.logger = pino(options, pino.destination(config.destination));
    } else {
      this.logger = pino(options);
    }
  }

  // Core logging methods
  fatal(message: string, meta?: Record<string, any>): void {
    this.logger.fatal(meta, message);
  }

  error(message: string, error?: Error, meta?: Record<string, any>): void {
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

  warn(message: string, meta?: Record<string, any>): void {
    this.logger.warn(meta, message);
  }

  info(message: string, meta?: Record<string, any>): void {
    this.logger.info(meta, message);
  }

  debug(message: string, meta?: Record<string, any>): void {
    this.logger.debug(meta, message);
  }

  trace(message: string, meta?: Record<string, any>): void {
    this.logger.trace(meta, message);
  }

  // Utility methods for common patterns
  logMethodEntry(methodName: string, params?: Record<string, any>): void {
    this.debug(`Entering ${methodName}`, { method: methodName, params });
  }

  logMethodExit(methodName: string, result?: any): void {
    this.debug(`Exiting ${methodName}`, { method: methodName, result });
  }

  logMethodError(methodName: string, error: Error): void {
    this.error(`Error in ${methodName}`, error, { method: methodName });
  }

  logPerformance(operation: string, duration: number, meta?: Record<string, any>): void {
    this.info(`Performance: ${operation}`, {
      operation,
      duration,
      unit: 'ms',
      ...meta
    });
  }

  logDatabaseQuery(query: string, duration: number, params?: any[]): void {
    this.debug('Database query executed', {
      query,
      duration,
      params: params ? params.length : 0,
      unit: 'ms'
    });
  }

  logSearchQuery(query: string, resultCount: number, duration: number): void {
    this.info('Search query executed', {
      query,
      resultCount,
      duration,
      unit: 'ms'
    });
  }

  // Create child logger with additional context
  child(meta: Record<string, any>): CoreLogger {
    const childLogger = new CoreLogger({
      service: this.service
    });
    childLogger.logger = this.logger.child(meta);
    return childLogger;
  }

  // Get the underlying pino logger
  getPinoLogger(): pino.Logger {
    return this.logger;
  }

  // Set log level dynamically
  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  // Check if level is enabled
  isLevelEnabled(level: LogLevel): boolean {
    return this.logger.isLevelEnabled(level);
  }
}

// Create default loggers for different components
export const createLogger = (service: string, config: Partial<LoggerConfig> = {}): CoreLogger => {
  return new CoreLogger({
    service,
    level: (process.env.LOG_LEVEL as LogLevel) || 'info',
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
  private startTime: number;
  private logger: CoreLogger;
  private operation: string;

  constructor(operation: string, targetLogger: CoreLogger = coreLogger) {
    this.operation = operation;
    this.logger = targetLogger;
    this.startTime = Date.now();
  }

  finish(meta?: Record<string, any>): number {
    const duration = Date.now() - this.startTime;
    this.logger.logPerformance(this.operation, duration, meta);
    return duration;
  }
}

// Convenience function for timing operations
export const timeOperation = (operation: string, targetLogger?: CoreLogger): PerformanceTimer => {
  return new PerformanceTimer(operation, targetLogger || coreLogger);
};

// Async operation timing
export const timeAsync = async <T>(
  operation: string,
  fn: () => Promise<T>,
  targetLogger?: CoreLogger
): Promise<T> => {
  const timer = timeOperation(operation, targetLogger);
  try {
    const result = await fn();
    timer.finish({ success: true });
    return result;
  } catch (error) {
    timer.finish({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    throw error;
  }
};