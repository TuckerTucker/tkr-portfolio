-- Centralized Logging Database Schema Extension
-- Adds logging tables to existing knowledge graph database

-- Enable foreign keys
PRAGMA foreign_keys = ON;

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

-- Views for common queries

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

-- Log level distribution by service
CREATE VIEW log_level_distribution AS
SELECT 
  s.name as service,
  l.level,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (PARTITION BY s.name), 2) as percentage
FROM log_sources s
JOIN log_entries l ON s.id = l.source_id
WHERE l.timestamp > (unixepoch() - 86400) -- Last 24 hours
GROUP BY s.name, l.level
ORDER BY s.name, l.level;

-- Error rate trends (hourly)
CREATE VIEW error_rate_trends AS
SELECT 
  s.name as service,
  datetime(
    (l.timestamp / 3600) * 3600, 'unixepoch'
  ) as hour_bucket,
  COUNT(CASE WHEN l.level IN ('ERROR', 'FATAL') THEN 1 END) as error_count,
  COUNT(*) as total_count,
  ROUND(
    COUNT(CASE WHEN l.level IN ('ERROR', 'FATAL') THEN 1 END) * 100.0 / COUNT(*), 
    2
  ) as error_rate_percent
FROM log_sources s
JOIN log_entries l ON s.id = l.source_id
WHERE l.timestamp > (unixepoch() - 86400) -- Last 24 hours
GROUP BY s.name, (l.timestamp / 3600)
ORDER BY s.name, hour_bucket;