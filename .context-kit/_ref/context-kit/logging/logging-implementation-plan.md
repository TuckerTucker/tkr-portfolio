# Centralized Logging Implementation Plan

## Implementation Status Overview

### ✅ Completed Components
- **Database Schema**: Complete logging schema in `schemas/logging-schema.sql`
- **HTTP API**: Full REST API with all endpoints implemented in `http-server.ts`
- **React UI**: Complete UI components (LogViewer, LogDashboard, LogFilters)
- **Log Service**: Backend service with SQLite queries and mock data fallback
- **Frontend Logger**: Client-side logging with HTTP submission

### 📋 Planned Components (Not Yet Implemented)
- **MCP Tools Integration**: 6 MCP tools for AI agent access
- **Automated Schema Migration**: Auto-application of logging schema
- **Advanced Analytics**: Pre-computed aggregations and trend analysis
- **Real-time WebSocket**: Live log streaming (currently uses polling)

## Original Plan
Implement centralized logging database with MCP server integration for AI agent visibility into frontend and backend service operations.

## Architecture Analysis

### Current Infrastructure
- **MCP Server**: `.context-kit/knowledge-graph/src/mcp/server.ts`
- **Database**: SQLite with FTS5 full-text search (`appstate-schema.sql`)
- **Port Allocation**: 42xxx scheme (UI:42001, API:42003)
- **Security**: Path validation with allowlist directories
- **Transport**: MCP over STDIO with structured tool responses

### Extension Strategy
Extend existing MCP/SQLite architecture rather than introducing new dependencies.

### ✅ Current Implementation Status
**Completed**: HTTP API, React UI, Database Schema, Log Service, Frontend Logger
**Location**: All code exists in `.context-kit/knowledge-graph/src/`
**Working**: Log viewing, searching, filtering, mock data fallback

## Database Schema Design - ✅ Fully Implemented

### Core Logging Tables - ✅ Complete in schemas/logging-schema.sql

```sql
-- Log entries with structured data
CREATE TABLE log_entries (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
  level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
  message TEXT NOT NULL,
  source_id TEXT NOT NULL,
  service TEXT NOT NULL,
  component TEXT,
  data JSONB,
  trace_id TEXT,
  span_id TEXT,
  user_id TEXT,
  session_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES log_sources(id)
);

-- Log sources (services, components)
CREATE TABLE log_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('frontend', 'backend', 'mcp', 'system')),
  version TEXT,
  host TEXT,
  process_id TEXT,
  metadata JSONB,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

-- Pre-computed aggregations for performance
CREATE TABLE log_aggregations (
  id TEXT PRIMARY KEY,
  period TEXT NOT NULL CHECK (period IN ('minute', 'hour', 'day')),
  period_start INTEGER NOT NULL,
  source_id TEXT NOT NULL,
  level TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (source_id) REFERENCES log_sources(id),
  UNIQUE(period, period_start, source_id, level)
);
```

### Indexes and FTS - ✅ Complete in schemas/logging-schema.sql

```sql
-- Performance indexes
CREATE INDEX idx_log_entries_timestamp ON log_entries(timestamp);
CREATE INDEX idx_log_entries_level ON log_entries(level);
CREATE INDEX idx_log_entries_source ON log_entries(source_id);
CREATE INDEX idx_log_entries_service ON log_entries(service);
CREATE INDEX idx_log_entries_trace ON log_entries(trace_id);
CREATE INDEX idx_log_entries_level_timestamp ON log_entries(level, timestamp);
CREATE INDEX idx_log_sources_type ON log_sources(type);
CREATE INDEX idx_log_aggregations_period ON log_aggregations(period, period_start);

-- Full-text search for log messages and data
CREATE VIRTUAL TABLE log_entries_fts USING fts5(
  message, 
  service,
  component,
  data,
  content=log_entries
);

-- FTS sync triggers
CREATE TRIGGER log_entries_fts_insert AFTER INSERT ON log_entries BEGIN
  INSERT INTO log_entries_fts(message, service, component, data) 
  VALUES (new.message, new.service, new.component, new.data);
END;

CREATE TRIGGER log_entries_fts_update AFTER UPDATE ON log_entries BEGIN
  UPDATE log_entries_fts 
  SET message = new.message, service = new.service, 
      component = new.component, data = new.data 
  WHERE rowid = new.rowid;
END;

CREATE TRIGGER log_entries_fts_delete AFTER DELETE ON log_entries BEGIN
  DELETE FROM log_entries_fts WHERE rowid = old.rowid;
END;
```

### Views for Common Queries - ✅ Complete in schemas/logging-schema.sql

```sql
-- Recent errors across all services
CREATE VIEW recent_errors AS
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
ORDER BY l.timestamp DESC;

-- Service health summary
CREATE VIEW service_health AS
SELECT 
  s.name as service,
  s.type,
  COUNT(CASE WHEN l.level = 'ERROR' THEN 1 END) as error_count,
  COUNT(CASE WHEN l.level = 'WARN' THEN 1 END) as warning_count,
  COUNT(*) as total_logs,
  MAX(l.timestamp) as last_log
FROM log_sources s
LEFT JOIN log_entries l ON s.id = l.source_id
  AND l.timestamp > (unixepoch() - 3600)
GROUP BY s.id;

-- Trace flow analysis
CREATE VIEW trace_flows AS
SELECT 
  l.trace_id,
  l.span_id,
  l.timestamp,
  l.service,
  l.component,
  l.message,
  l.level,
  LAG(l.timestamp) OVER (PARTITION BY l.trace_id ORDER BY l.timestamp) as prev_timestamp
FROM log_entries l
WHERE l.trace_id IS NOT NULL
ORDER BY l.trace_id, l.timestamp;
```

## MCP Tool Extensions - 📋 Planned (Not Yet Implemented)

### New Logging Tools - 📋 Implementation Required

**Status**: Tool definitions exist but are not integrated into main MCP server.
**Location**: Would need to be added to `.context-kit/mcp/src/tools/knowledge-graph.ts`

```typescript
// Add to server.ts tools array
{
  name: 'log_create',
  description: 'Create a log entry',
  inputSchema: {
    type: 'object',
    properties: {
      level: { type: 'string', enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] },
      message: { type: 'string', description: 'Log message' },
      service: { type: 'string', description: 'Service name' },
      component: { type: 'string', description: 'Component name' },
      data: { type: 'object', description: 'Additional structured data' },
      traceId: { type: 'string', description: 'Trace ID for correlation' },
      spanId: { type: 'string', description: 'Span ID for tracing' },
      userId: { type: 'string', description: 'User ID if applicable' },
      sessionId: { type: 'string', description: 'Session ID if applicable' }
    },
    required: ['level', 'message', 'service']
  }
},
{
  name: 'log_query',
  description: 'Query log entries with filters',
  inputSchema: {
    type: 'object',
    properties: {
      level: { type: 'string', enum: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'] },
      service: { type: 'string', description: 'Filter by service' },
      component: { type: 'string', description: 'Filter by component' },
      traceId: { type: 'string', description: 'Filter by trace ID' },
      startTime: { type: 'number', description: 'Start timestamp (unix)' },
      endTime: { type: 'number', description: 'End timestamp (unix)' },
      limit: { type: 'number', description: 'Max results', default: 100 }
    }
  }
},
{
  name: 'log_search',
  description: 'Full-text search across log entries',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'Search query' },
      service: { type: 'string', description: 'Filter by service' },
      level: { type: 'string', description: 'Filter by log level' },
      limit: { type: 'number', description: 'Max results', default: 50 }
    },
    required: ['query']
  }
},
{
  name: 'log_aggregate',
  description: 'Get log aggregations and metrics',
  inputSchema: {
    type: 'object',
    properties: {
      period: { type: 'string', enum: ['minute', 'hour', 'day'], default: 'hour' },
      service: { type: 'string', description: 'Filter by service' },
      level: { type: 'string', description: 'Filter by level' },
      startTime: { type: 'number', description: 'Start timestamp' },
      endTime: { type: 'number', description: 'End timestamp' }
    }
  }
},
{
  name: 'log_trace',
  description: 'Trace request flow across services',
  inputSchema: {
    type: 'object',
    properties: {
      traceId: { type: 'string', description: 'Trace ID to follow' }
    },
    required: ['traceId']
  }
},
{
  name: 'service_health',
  description: 'Get service health metrics',
  inputSchema: {
    type: 'object',
    properties: {
      service: { type: 'string', description: 'Filter by service name' },
      timeWindow: { type: 'number', description: 'Time window in seconds', default: 3600 }
    }
  }
}
```

## Service Integration Layer

### Structured Logging Library
**Library Choice**: `pino` (lightweight, structured, fast)

```typescript
// .context-kit/knowledge-graph/src/services/logger.ts
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
  private pinoLogger: pino.Logger;

  constructor(
    kg: AppStateKGSimple, 
    serviceName: string, 
    serviceType: 'frontend' | 'backend' | 'mcp' | 'system'
  ) {
    this.kg = kg;
    this.sourceId = this.ensureLogSource(serviceName, serviceType);
    
    // Configure pino for dual output (console + database)
    this.pinoLogger = pino({
      level: 'debug',
      transport: {
        targets: [
          { target: 'pino-pretty', options: { colorize: true } },
          { target: './sqlite-transport.js', options: { kg: this.kg, sourceId: this.sourceId } }
        ]
      }
    });
  }

  private ensureLogSource(name: string, type: string): string {
    // Check if source exists, create if not
    const existing = this.kg.query(
      'SELECT id FROM log_sources WHERE name = ?', 
      [name]
    );
    
    if (existing.length > 0) {
      return existing[0].id;
    }

    // Create new source
    const sourceId = `source_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.kg.query(`
      INSERT INTO log_sources (id, name, type, host, process_id, metadata)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [
      sourceId,
      name,
      type,
      process.env.HOSTNAME || 'localhost',
      process.pid.toString(),
      JSON.stringify({ node_version: process.version })
    ]);

    return sourceId;
  }

  log(entry: LogEntry): void {
    const logData = {
      ...entry,
      timestamp: Date.now(),
      source_id: this.sourceId
    };

    this.pinoLogger[entry.level](logData, entry.message);
  }

  debug(message: string, data?: Record<string, any>): void {
    this.log({ level: 'debug', message, service: this.sourceId, data });
  }

  info(message: string, data?: Record<string, any>): void {
    this.log({ level: 'info', message, service: this.sourceId, data });
  }

  warn(message: string, data?: Record<string, any>): void {
    this.log({ level: 'warn', message, service: this.sourceId, data });
  }

  error(message: string, error?: Error, data?: Record<string, any>): void {
    const errorData = error ? {
      ...data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : data;

    this.log({ level: 'error', message, service: this.sourceId, data: errorData });
  }

  fatal(message: string, error?: Error, data?: Record<string, any>): void {
    const errorData = error ? {
      ...data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name
      }
    } : data;

    this.log({ level: 'fatal', message, service: this.sourceId, data: errorData });
  }
}
```

### SQLite Transport for Pino

```typescript
// .context-kit/knowledge-graph/src/services/sqlite-transport.ts
import { Transform } from 'stream';
import { AppStateKGSimple } from '../core/knowledge-graph-simple.js';

export class SqliteTransport extends Transform {
  private kg: AppStateKGSimple;
  private sourceId: string;

  constructor(options: { kg: AppStateKGSimple; sourceId: string }) {
    super({ objectMode: true });
    this.kg = options.kg;
    this.sourceId = options.sourceId;
  }

  _transform(chunk: any, encoding: string, callback: Function): void {
    try {
      const log = JSON.parse(chunk);
      const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      this.kg.query(`
        INSERT INTO log_entries (
          id, timestamp, level, message, source_id, service, 
          component, data, trace_id, span_id, user_id, session_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        logId,
        log.timestamp || Date.now(),
        log.level.toUpperCase(),
        log.message || log.msg,
        this.sourceId,
        log.service,
        log.component,
        JSON.stringify(log.data || {}),
        log.traceId,
        log.spanId,
        log.userId,
        log.sessionId
      ]);

      this.updateAggregations(log);
      callback();
    } catch (error) {
      callback(error);
    }
  }

  private updateAggregations(log: any): void {
    const period = 'hour';
    const periodStart = Math.floor(log.timestamp / (60 * 60 * 1000)) * (60 * 60 * 1000);

    this.kg.query(`
      INSERT OR REPLACE INTO log_aggregations (
        id, period, period_start, source_id, level, count
      ) VALUES (
        ?, ?, ?, ?, ?, 
        COALESCE((SELECT count FROM log_aggregations 
                  WHERE period = ? AND period_start = ? AND source_id = ? AND level = ?), 0) + 1
      )
    `, [
      `agg_${period}_${periodStart}_${this.sourceId}_${log.level}`,
      period,
      periodStart,
      this.sourceId,
      log.level.toUpperCase(),
      period,
      periodStart,
      this.sourceId,
      log.level.toUpperCase()
    ]);
  }
}
```

## React UI Integration - ✅ Fully Implemented

### React LogViewer Integration - ✅ Complete in src/ui/components/

```typescript
// .context-kit/knowledge-graph/src/ui/components/LogViewer.tsx
import React, { useState, useEffect } from 'react';
import { LazyLog } from 'react-lazylog';

interface LogViewerProps {
  service?: string;
  level?: string;
  timeWindow?: number;
  follow?: boolean;
}

export const LogViewer: React.FC<LogViewerProps> = ({
  service,
  level,
  timeWindow = 3600,
  follow = true
}) => {
  const [logText, setLogText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
    
    if (follow) {
      const interval = setInterval(fetchLogs, 2000); // Poll every 2 seconds
      return () => clearInterval(interval);
    }
  }, [service, level, timeWindow, follow]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (service) params.set('service', service);
      if (level) params.set('level', level);
      params.set('timeWindow', timeWindow.toString());
      params.set('format', 'text');

      const response = await fetch(`http://localhost:42003/api/logs/stream?${params}`);
      const text = await response.text();
      
      setLogText(text);
      setLoading(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch logs');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="log-viewer-loading">
        <div className="loading-spinner"></div>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="log-viewer-error">
        <h3>Error loading logs</h3>
        <p>{error}</p>
        <button onClick={fetchLogs}>Retry</button>
      </div>
    );
  }

  return (
    <div className="log-viewer-container">
      <div className="log-viewer-header">
        <h3>System Logs</h3>
        <div className="log-viewer-controls">
          {service && <span className="log-filter">Service: {service}</span>}
          {level && <span className="log-filter">Level: {level}</span>}
          <span className="log-filter">Window: {timeWindow}s</span>
          <button 
            className={`follow-toggle ${follow ? 'active' : ''}`}
            onClick={() => setFollow(!follow)}
          >
            {follow ? 'Following' : 'Paused'}
          </button>
        </div>
      </div>
      
      <LazyLog
        text={logText}
        caseInsensitive
        enableSearch
        selectableLines
        follow={follow}
        height={600}
        style={{
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '13px'
        }}
        formatPart={(text) => {
          // Add color coding for log levels
          if (text.includes('[ERROR]')) return { style: { color: '#ff6b6b' } };
          if (text.includes('[WARN]')) return { style: { color: '#feca57' } };
          if (text.includes('[INFO]')) return { style: { color: '#48dbfb' } };
          if (text.includes('[DEBUG]')) return { style: { color: '#a4b0be' } };
          return {};
        }}
      />
    </div>
  );
};
```

### Log Filter Component

```typescript
// .context-kit/knowledge-graph/src/ui/components/LogFilters.tsx
import React from 'react';

interface LogFiltersProps {
  service?: string;
  level?: string;
  timeWindow: number;
  onServiceChange: (service: string) => void;
  onLevelChange: (level: string) => void;
  onTimeWindowChange: (window: number) => void;
  services: string[];
}

export const LogFilters: React.FC<LogFiltersProps> = ({
  service,
  level,
  timeWindow,
  onServiceChange,
  onLevelChange,
  onTimeWindowChange,
  services
}) => {
  return (
    <div className="log-filters">
      <div className="filter-group">
        <label htmlFor="service-filter">Service:</label>
        <select 
          id="service-filter"
          value={service || ''}
          onChange={(e) => onServiceChange(e.target.value)}
        >
          <option value="">All Services</option>
          {services.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="level-filter">Level:</label>
        <select 
          id="level-filter"
          value={level || ''}
          onChange={(e) => onLevelChange(e.target.value)}
        >
          <option value="">All Levels</option>
          <option value="ERROR">Error</option>
          <option value="WARN">Warning</option>
          <option value="INFO">Info</option>
          <option value="DEBUG">Debug</option>
        </select>
      </div>

      <div className="filter-group">
        <label htmlFor="time-filter">Time Window:</label>
        <select 
          id="time-filter"
          value={timeWindow}
          onChange={(e) => onTimeWindowChange(Number(e.target.value))}
        >
          <option value={300}>5 minutes</option>
          <option value={900}>15 minutes</option>
          <option value={3600}>1 hour</option>
          <option value={21600}>6 hours</option>
          <option value={86400}>24 hours</option>
        </select>
      </div>
    </div>
  );
};
```

### Log Service

```typescript
// .context-kit/knowledge-graph/src/ui/services/LogService.ts
export class LogService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:42003') {
    this.baseUrl = baseUrl;
  }

  async getLogsAsText(filters: {
    service?: string;
    level?: string;
    timeWindow?: number;
    limit?: number;
  } = {}): Promise<string> {
    try {
      const params = new URLSearchParams();
      if (filters.service) params.set('service', filters.service);
      if (filters.level) params.set('level', filters.level);
      if (filters.timeWindow) params.set('timeWindow', filters.timeWindow.toString());
      if (filters.limit) params.set('limit', filters.limit.toString());
      params.set('format', 'text');

      const response = await fetch(`${this.baseUrl}/api/logs/stream?${params}`);
      return await response.text();
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      return this.getMockLogText();
    }
  }

  async getServices(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/logs/services`);
      const data = await response.json();
      return data.services || [];
    } catch (error) {
      console.error('Failed to fetch services:', error);
      return ['React UI', 'MCP Server', 'API Server'];
    }
  }

  async searchLogs(query: string, filters: {
    service?: string;
    level?: string;
    limit?: number;
  } = {}): Promise<string> {
    try {
      const params = new URLSearchParams();
      params.set('q', query);
      if (filters.service) params.set('service', filters.service);
      if (filters.level) params.set('level', filters.level);
      if (filters.limit) params.set('limit', filters.limit.toString());
      params.set('format', 'text');

      const response = await fetch(`${this.baseUrl}/api/logs/search?${params}`);
      return await response.text();
    } catch (error) {
      console.error('Failed to search logs:', error);
      return `Error searching logs: ${error}`;
    }
  }

  private getMockLogText(): string {
    const now = new Date();
    return [
      `${now.toISOString()} [INFO] React UI - Application started`,
      `${new Date(now.getTime() - 5000).toISOString()} [INFO] MCP Server - Knowledge graph initialized`,
      `${new Date(now.getTime() - 10000).toISOString()} [WARN] API Server - High memory usage detected`,
      `${new Date(now.getTime() - 15000).toISOString()} [ERROR] React UI - Failed to fetch user data: Network timeout`,
      `${new Date(now.getTime() - 20000).toISOString()} [DEBUG] MCP Server - Processing entity creation request`,
      `${new Date(now.getTime() - 25000).toISOString()} [INFO] API Server - Request processed successfully`
    ].join('\n');
  }
}
```

## Package Dependencies

### Add to package.json

```json
{
  "dependencies": {
    "pino": "^8.16.0",
    "pino-pretty": "^10.2.0",
    "react-lazylog": "^4.5.3"
  },
  "devDependencies": {
    "@types/pino": "^6.3.12"
  }
}
```

## Testing Strategy

### MCP Tool Testing

```typescript
// .context-kit/knowledge-graph/tests/logging.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { KnowledgeGraphMCPServer } from '../src/mcp/server.js';
import { tkrLogger } from '../src/services/logger.js';

describe('Centralized Logging', () => {
  let server: KnowledgeGraphMCPServer;
  let logger: tkrLogger;

  beforeEach(async () => {
    server = new KnowledgeGraphMCPServer({
      databasePath: ':memory:'
    });
    
    // Initialize with logging schema
    // ... schema setup
  });

  it('should create log entries via MCP tool', async () => {
    const result = await server.handleToolCall('log_create', {
      level: 'INFO',
      message: 'Test log message',
      service: 'test-service',
      component: 'test-component'
    });

    expect(result.content[0].text).toContain('Log entry created');
  });

  it('should search logs with full-text search', async () => {
    // Create test logs
    await server.handleToolCall('log_create', {
      level: 'ERROR',
      message: 'Database connection failed',
      service: 'backend'
    });

    const results = await server.handleToolCall('log_search', {
      query: 'database'
    });

    expect(results.content[0].text).toContain('Database connection failed');
  });

  it('should aggregate logs by service and level', async () => {
    // Create multiple logs
    const logs = [
      { level: 'ERROR', service: 'api' },
      { level: 'ERROR', service: 'api' },
      { level: 'WARN', service: 'api' }
    ];

    for (const log of logs) {
      await server.handleToolCall('log_create', {
        ...log,
        message: 'Test message'
      });
    }

    const aggregations = await server.handleToolCall('log_aggregate', {
      service: 'api',
      period: 'hour'
    });

    expect(aggregations.content[0].text).toContain('ERROR: 2');
    expect(aggregations.content[0].text).toContain('WARN: 1');
  });
});
```

## Deployment Considerations

### Database Migration

```sql
-- .context-kit/knowledge-graph/migrations/001_add_logging_tables.sql
-- Run this against existing knowledge-graph.db

-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Create logging tables
-- (Include full schema from above)

-- Migrate existing observations to logs if needed
INSERT INTO log_entries (
  id, timestamp, level, message, source_id, service, data
)
SELECT 
  'migrated_' || o.id,
  o.created_at,
  'INFO',
  o.key || ': ' || o.value,
  'legacy_' || o.entity_id,
  'legacy',
  json_object('entity_id', o.entity_id, 'key', o.key, 'value', o.value)
FROM observations o
WHERE o.key IN ('error', 'warning', 'info', 'debug');
```

### Port Allocation
- **Logging API**: 42004 (next in 42xxx sequence)
- **Log Streaming**: WebSocket on 42005 for real-time updates

### Security Considerations
- **Path Validation**: Extend existing allowlist for log file access
- **Rate Limiting**: Prevent log flooding attacks
- **Sanitization**: Strip sensitive data from logs automatically
- **Access Control**: Restrict log viewing by user role

## Performance Optimizations

### Batch Inserts
```typescript
// Batch log inserts for high-volume scenarios
class BatchLogger {
  private batch: LogEntry[] = [];
  private batchSize = 100;
  private flushInterval = 5000; // 5 seconds

  constructor(private kg: AppStateKGSimple) {
    setInterval(() => this.flush(), this.flushInterval);
  }

  add(entry: LogEntry): void {
    this.batch.push(entry);
    if (this.batch.length >= this.batchSize) {
      this.flush();
    }
  }

  private flush(): void {
    if (this.batch.length === 0) return;

    const entries = this.batch.splice(0);
    const placeholders = entries.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(',');
    
    const values = entries.flatMap(entry => [
      entry.id, entry.timestamp, entry.level, entry.message,
      entry.source_id, entry.service, entry.component, 
      JSON.stringify(entry.data), entry.traceId, entry.spanId,
      entry.userId, entry.sessionId
    ]);

    this.kg.query(`
      INSERT INTO log_entries (
        id, timestamp, level, message, source_id, service, 
        component, data, trace_id, span_id, user_id, session_id
      ) VALUES ${placeholders}
    `, values);
  }
}
```

### Log Retention Policy
```sql
-- Automated cleanup for old logs
DELETE FROM log_entries 
WHERE timestamp < (unixepoch() - 7 * 24 * 60 * 60); -- 7 days

-- Keep aggregations longer
DELETE FROM log_aggregations 
WHERE period_start < (unixepoch() - 30 * 24 * 60 * 60); -- 30 days
```

## Implementation Status Summary

### ✅ Completed Items
1. **Schema Extension**: ✅ Complete logging schema in `schemas/logging-schema.sql`
2. **Frontend Integration**: ✅ React components with LazyLog and filters implemented
3. **React LogViewer Integration**: ✅ Complete UI with LogViewer, LogDashboard, LogFilters
4. **API Endpoints**: ✅ All HTTP endpoints implemented with text/json formats
5. **Real-time Updates**: ✅ Polling-based log streaming working
6. **Logger Service**: ✅ LogService with SQLite queries and mock data fallback
7. **Frontend Logger**: ✅ FrontendLogger service for React component logging

### 📋 Remaining Tasks for Full Implementation
1. **MCP Tool Integration**: Add 6 logging tools to main MCP server
2. **Automated Schema Setup**: Auto-apply logging schema on first run
3. **Advanced Analytics**: Implement pre-computed aggregations and trends
4. **Performance Optimization**: Add batch processing for high-volume logging
5. **WebSocket Streaming**: Replace polling with real-time WebSocket updates
6. **Enhanced Testing**: Add comprehensive test coverage

### 🚧 Current Limitations
- MCP tools are planned but not accessible in Claude Code
- Database schema requires manual setup
- Log data is mock data unless manually populated
- No automated log retention cleanup

## Integration Points

### Existing Systems
- **Knowledge Graph**: Logs become entities with relationships
- **React UI**: LazyLog component for human-readable log viewing
- **MCP Server**: Extended with logging capabilities
- **Port Management**: Follows 42xxx allocation scheme (Log API: 42004)
- **Security**: Uses existing path validation patterns

### AI Agent Benefits
- **Visibility**: Full system observability through MCP tools
- **Debugging**: Trace request flows across services
- **Performance**: Identify bottlenecks and error patterns
- **Context**: Rich contextual data for troubleshooting
- **Automation**: Automated alerts and incident response

## HTTP API Endpoint for Text Format

### Log Streaming Endpoint

```typescript
// .context-kit/knowledge-graph/src/api/log-endpoints.ts
export const logEndpoints = {
  // GET /api/logs/stream?service=X&level=Y&timeWindow=Z&format=text
  '/api/logs/stream': async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const service = url.searchParams.get('service');
    const level = url.searchParams.get('level');
    const timeWindow = parseInt(url.searchParams.get('timeWindow') || '3600');
    const format = url.searchParams.get('format') || 'json';
    const limit = parseInt(url.searchParams.get('limit') || '1000');

    let sql = `
      SELECT l.timestamp, l.level, l.message, l.service, l.component, l.data
      FROM log_entries l
      JOIN log_sources s ON l.source_id = s.id
      WHERE l.timestamp > (unixepoch() - ?)
    `;
    const params = [timeWindow];

    if (service) {
      sql += ' AND l.service = ?';
      params.push(service);
    }

    if (level) {
      sql += ' AND l.level = ?';
      params.push(level);
    }

    sql += ' ORDER BY l.timestamp DESC LIMIT ?';
    params.push(limit);

    const results = kg.query(sql, params);

    if (format === 'text') {
      const logText = results
        .reverse() // Show oldest first for log viewer
        .map(row => {
          const date = new Date(row.timestamp * 1000).toISOString();
          const component = row.component ? ` ${row.component}` : '';
          return `${date} [${row.level}] ${row.service}${component} - ${row.message}`;
        })
        .join('\n');

      return new Response(logText, {
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return new Response(JSON.stringify(results), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

This implementation provides a comprehensive, scalable logging solution that integrates seamlessly with the existing tkr-context-kit architecture while providing powerful AI agent capabilities for system observability and human-friendly log viewing through react-lazylog.