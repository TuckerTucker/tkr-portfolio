import pino from 'pino';
import { AppStateKGSimple } from '../core/knowledge-graph-simple.js';

export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;
  component?: string;
  data?: Record<string, any>;
  traceId?: string;
  spanId?: string;
  userId?: string;
  sessionId?: string;
}

export class tkrLogger {
  private kg: AppStateKGSimple;
  private sourceId: string;
  private serviceName: string;
  private pinoLogger: pino.Logger;

  constructor(
    kg: AppStateKGSimple, 
    serviceName: string, 
    serviceType: 'frontend' | 'backend' | 'mcp' | 'system' = 'system'
  ) {
    this.kg = kg;
    this.serviceName = serviceName;
    this.sourceId = this.ensureLogSource(serviceName, serviceType);
    
    // Configure pino for dual output (console + database)
    this.pinoLogger = pino({
      level: 'debug',
      transport: {
        targets: [
          { 
            target: 'pino-pretty', 
            options: { 
              colorize: true,
              translateTime: 'UTC:yyyy-mm-dd HH:MM:ss.l',
              ignore: 'pid,hostname'
            } 
          }
        ]
      }
    });

    // Hook into pino to also save to database
    this.setupDatabaseLogging();
  }

  private setupDatabaseLogging() {
    // Use a simpler approach - we'll call saveToDatabaseSync directly from our log methods
    // This avoids trying to hook into pino's internal write method
  }

  private saveToDatabaseSync(logData: any) {
    try {
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      this.kg.run(`
        INSERT INTO log_entries (
          id, timestamp, level, message, source_id, service, 
          component, data, trace_id, span_id, user_id, session_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        logId,
        Math.floor((logData.time || Date.now()) / 1000),
        (logData.level || 'info').toUpperCase(),
        logData.msg || logData.message || '',
        this.sourceId,
        this.serviceName,
        logData.component || null,
        logData.data ? JSON.stringify(logData.data) : null,
        logData.traceId || null,
        logData.spanId || null,
        logData.userId || null,
        logData.sessionId || null
      ]);
    } catch (error) {
      console.error('Database logging error:', error);
    }
  }

  private ensureLogSource(name: string, type: string): string {
    // Check if source exists
    const existing = this.kg.query('SELECT id FROM log_sources WHERE name = ?', [name]);
    
    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new source
    const sourceId = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.kg.run(`
      INSERT INTO log_sources (id, name, type, host, process_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sourceId,
      name,
      type,
      process.env.HOSTNAME || 'localhost',
      process.pid.toString(),
      JSON.stringify({ 
        node_version: process.version,
        created_at: new Date().toISOString()
      })
    ]);

    return sourceId;
  }

  // Structured logging methods
  debug(message: string, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const logData = {
      level: 'debug',
      msg: message,
      message,
      data,
      component: meta?.component,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      userId: meta?.userId,
      sessionId: meta?.sessionId,
      time: Date.now()
    };
    
    this.pinoLogger.debug(logData, message);
    this.saveToDatabaseSync(logData);
  }

  info(message: string, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const logData = {
      level: 'info',
      msg: message,
      message,
      data,
      component: meta?.component,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      userId: meta?.userId,
      sessionId: meta?.sessionId,
      time: Date.now()
    };
    
    this.pinoLogger.info(logData, message);
    this.saveToDatabaseSync(logData);
  }

  warn(message: string, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const logData = {
      level: 'warn',
      msg: message,
      message,
      data,
      component: meta?.component,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      userId: meta?.userId,
      sessionId: meta?.sessionId,
      time: Date.now()
    };
    
    this.pinoLogger.warn(logData, message);
    this.saveToDatabaseSync(logData);
  }

  error(message: string, error?: Error, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const errorData = error ? {
      ...data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : data;

    const logData = {
      level: 'error',
      msg: message,
      message,
      data: errorData,
      component: meta?.component,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      userId: meta?.userId,
      sessionId: meta?.sessionId,
      time: Date.now()
    };
    
    this.pinoLogger.error(logData, message);
    this.saveToDatabaseSync(logData);
  }

  fatal(message: string, error?: Error, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const errorData = error ? {
      ...data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : data;

    const logData = {
      level: 'fatal',
      msg: message,
      message,
      data: errorData,
      component: meta?.component,
      traceId: meta?.traceId,
      spanId: meta?.spanId,
      userId: meta?.userId,
      sessionId: meta?.sessionId,
      time: Date.now()
    };
    
    this.pinoLogger.fatal(logData, message);
    this.saveToDatabaseSync(logData);
  }

  // Convenience methods for common patterns
  logApiRequest(method: string, path: string, statusCode: number, duration: number, meta?: Partial<LogEntry>): void {
    this.info(`${method} ${path} ${statusCode}`, {
      http: {
        method,
        path,
        statusCode,
        duration
      }
    }, meta);
  }

  logUserAction(action: string, userId: string, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    this.info(`User action: ${action}`, {
      userAction: {
        action,
        userId,
        ...data
      }
    }, { ...meta, userId });
  }

  logPerformance(operation: string, duration: number, data?: Record<string, any>, meta?: Partial<LogEntry>): void {
    const level = duration > 1000 ? 'warn' : 'info';
    this[level](`Performance: ${operation} took ${duration}ms`, {
      performance: {
        operation,
        duration,
        ...data
      }
    }, meta);
  }

  // Create child logger with additional context
  child(additionalMeta: Partial<LogEntry>): tkrLogger {
    const child = new tkrLogger(this.kg, this.serviceName);
    
    // Override the child's logging methods to include additional meta
    const originalMethods = ['debug', 'info', 'warn', 'error', 'fatal'];
    
    originalMethods.forEach(method => {
      const originalMethod = child[method].bind(child);
      child[method] = (message: string, ...args: any[]) => {
        const lastArg = args[args.length - 1];
        const meta = typeof lastArg === 'object' && lastArg.component !== undefined 
          ? { ...additionalMeta, ...lastArg }
          : additionalMeta;
        
        if (args.length > 0 && typeof lastArg === 'object' && lastArg.component !== undefined) {
          args[args.length - 1] = meta;
        } else {
          args.push(meta);
        }
        
        return originalMethod(message, ...args);
      };
    });
    
    return child;
  }
}