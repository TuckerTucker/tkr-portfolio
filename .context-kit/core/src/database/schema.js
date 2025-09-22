/**
 * Unified database schema for tkr-context-kit v2.0
 * Combines entities, relations, logs, and search index into a single optimized schema
 */
// Current schema version
export const CURRENT_SCHEMA_VERSION = 1;
// Main schema SQL
export const SCHEMA_SQL = `
-- ============================================================================
-- CORE ENTITIES TABLE
-- ============================================================================
-- Central storage for all entities in the knowledge graph
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSON NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  version INTEGER DEFAULT 1,

  -- Ensure reasonable constraints
  CHECK (length(id) > 0),
  CHECK (length(type) > 0),
  CHECK (length(name) > 0),
  CHECK (version >= 1)
);

-- ============================================================================
-- RELATIONS TABLE
-- ============================================================================
-- Represents relationships between entities
CREATE TABLE IF NOT EXISTS relations (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  type TEXT NOT NULL,
  properties JSON,
  created_at INTEGER DEFAULT (unixepoch()),

  -- Ensure valid relationships
  CHECK (length(id) > 0),
  CHECK (length(from_id) > 0),
  CHECK (length(to_id) > 0),
  CHECK (length(type) > 0),
  CHECK (from_id != to_id), -- Prevent self-relations

  -- Foreign key constraints
  FOREIGN KEY (from_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- ============================================================================
-- SEARCH INDEX TABLE
-- ============================================================================
-- Optimized search table supporting multiple query patterns
CREATE TABLE IF NOT EXISTS search_index (
  entity_id TEXT PRIMARY KEY,
  original_name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,      -- lowercase, no special chars
  name_tokens TEXT NOT NULL,          -- space-separated tokens for token search
  file_path TEXT,                     -- extracted from entity data
  file_extension TEXT,                -- extracted extension (.tsx, .ts, etc.)
  entity_type TEXT NOT NULL,
  tags TEXT,                          -- space-separated keywords/tags
  full_text TEXT NOT NULL,            -- concatenated searchable content
  trigrams TEXT,                      -- for fuzzy matching
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  -- Ensure valid search data
  CHECK (length(entity_id) > 0),
  CHECK (length(original_name) > 0),
  CHECK (length(normalized_name) > 0),
  CHECK (length(entity_type) > 0),

  -- Foreign key constraint
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- ============================================================================
-- LOG ENTRIES TABLE
-- ============================================================================
-- Unified logging for all services and components
CREATE TABLE IF NOT EXISTS log_entries (
  id TEXT PRIMARY KEY,
  timestamp INTEGER NOT NULL,
  level TEXT NOT NULL CHECK (level IN ('fatal', 'error', 'warn', 'info', 'debug', 'trace')),
  service TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSON,
  process_id TEXT,
  session_id TEXT,
  trace_id TEXT,
  created_at INTEGER DEFAULT (unixepoch()),

  -- Ensure valid log data
  CHECK (length(id) > 0),
  CHECK (timestamp > 0),
  CHECK (length(service) > 0),
  CHECK (length(message) > 0)
);

-- ============================================================================
-- SCHEMA MIGRATIONS TABLE
-- ============================================================================
-- Track applied database migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at INTEGER DEFAULT (unixepoch()),

  CHECK (version >= 0)
);

-- ============================================================================
-- OPTIMIZED INDEXES
-- ============================================================================

-- Entity indexes for common queries
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
CREATE INDEX IF NOT EXISTS idx_entities_type_name ON entities(type, name);
CREATE INDEX IF NOT EXISTS idx_entities_updated_at ON entities(updated_at);
CREATE INDEX IF NOT EXISTS idx_entities_version ON entities(version);

-- Relation indexes for graph traversal
CREATE INDEX IF NOT EXISTS idx_relations_from_id ON relations(from_id);
CREATE INDEX IF NOT EXISTS idx_relations_to_id ON relations(to_id);
CREATE INDEX IF NOT EXISTS idx_relations_type ON relations(type);
CREATE INDEX IF NOT EXISTS idx_relations_from_type ON relations(from_id, type);
CREATE INDEX IF NOT EXISTS idx_relations_to_type ON relations(to_id, type);
CREATE INDEX IF NOT EXISTS idx_relations_from_to ON relations(from_id, to_id);

-- Search indexes for different query patterns
CREATE INDEX IF NOT EXISTS idx_search_normalized_name ON search_index(normalized_name);
CREATE INDEX IF NOT EXISTS idx_search_entity_type ON search_index(entity_type);
CREATE INDEX IF NOT EXISTS idx_search_file_extension ON search_index(file_extension);
CREATE INDEX IF NOT EXISTS idx_search_file_path ON search_index(file_path);
CREATE INDEX IF NOT EXISTS idx_search_name_tokens ON search_index(name_tokens);
CREATE INDEX IF NOT EXISTS idx_search_trigrams ON search_index(trigrams);
CREATE INDEX IF NOT EXISTS idx_search_updated_at ON search_index(updated_at);

-- Log indexes for filtering and aggregation
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON log_entries(level);
CREATE INDEX IF NOT EXISTS idx_logs_service ON log_entries(service);
CREATE INDEX IF NOT EXISTS idx_logs_level_service ON log_entries(level, service);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp_level ON log_entries(timestamp, level);
CREATE INDEX IF NOT EXISTS idx_logs_process_id ON log_entries(process_id);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON log_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_logs_trace_id ON log_entries(trace_id);

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC MAINTENANCE
-- ============================================================================

-- Automatically update entity timestamps
CREATE TRIGGER IF NOT EXISTS trg_entities_updated_at
AFTER UPDATE ON entities
FOR EACH ROW
WHEN NEW.updated_at = OLD.updated_at
BEGIN
  UPDATE entities SET updated_at = unixepoch() WHERE id = NEW.id;
END;

-- Automatically increment entity version on update
CREATE TRIGGER IF NOT EXISTS trg_entities_version_increment
AFTER UPDATE ON entities
FOR EACH ROW
WHEN NEW.version = OLD.version
BEGIN
  UPDATE entities SET version = OLD.version + 1 WHERE id = NEW.id;
END;

-- Automatically maintain search index when entities change
CREATE TRIGGER IF NOT EXISTS trg_search_index_entity_insert
AFTER INSERT ON entities
FOR EACH ROW
BEGIN
  INSERT INTO search_index (
    entity_id,
    original_name,
    normalized_name,
    name_tokens,
    entity_type,
    full_text,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.name,
    lower(NEW.name),
    lower(replace(replace(NEW.name, '_', ' '), '-', ' ')),
    NEW.type,
    NEW.name || ' ' || NEW.type || ' ' || json_extract(NEW.data, '$'),
    unixepoch()
  );
END;

CREATE TRIGGER IF NOT EXISTS trg_search_index_entity_update
AFTER UPDATE ON entities
FOR EACH ROW
BEGIN
  UPDATE search_index SET
    original_name = NEW.name,
    normalized_name = lower(NEW.name),
    name_tokens = lower(replace(replace(NEW.name, '_', ' '), '-', ' ')),
    entity_type = NEW.type,
    full_text = NEW.name || ' ' || NEW.type || ' ' || json_extract(NEW.data, '$'),
    updated_at = unixepoch()
  WHERE entity_id = NEW.id;
END;

-- ============================================================================
-- USEFUL VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Entity details with search information
CREATE VIEW IF NOT EXISTS entity_details AS
SELECT
  e.id,
  e.type,
  e.name,
  e.data,
  e.created_at,
  e.updated_at,
  e.version,
  si.file_path,
  si.file_extension,
  si.tags,
  COUNT(r_out.id) as outgoing_relations,
  COUNT(r_in.id) as incoming_relations
FROM entities e
LEFT JOIN search_index si ON e.id = si.entity_id
LEFT JOIN relations r_out ON e.id = r_out.from_id
LEFT JOIN relations r_in ON e.id = r_in.to_id
GROUP BY e.id;

-- Relation graph view
CREATE VIEW IF NOT EXISTS relation_graph AS
SELECT
  r.id,
  r.type as relation_type,
  r.properties,
  r.created_at,
  e_from.name as from_name,
  e_from.type as from_type,
  e_to.name as to_name,
  e_to.type as to_type
FROM relations r
JOIN entities e_from ON r.from_id = e_from.id
JOIN entities e_to ON r.to_id = e_to.id;

-- Log summary view for quick analytics
CREATE VIEW IF NOT EXISTS log_summary AS
SELECT
  service,
  level,
  COUNT(*) as count,
  MIN(timestamp) as first_occurrence,
  MAX(timestamp) as last_occurrence,
  ROUND(AVG(timestamp)) as avg_timestamp
FROM log_entries
GROUP BY service, level;

-- Recent activity view
CREATE VIEW IF NOT EXISTS recent_activity AS
SELECT
  'entity' as activity_type,
  id,
  name as activity_name,
  type as activity_subtype,
  updated_at as activity_timestamp
FROM entities
WHERE updated_at > unixepoch() - 86400 -- Last 24 hours

UNION ALL

SELECT
  'relation' as activity_type,
  id,
  type as activity_name,
  '' as activity_subtype,
  created_at as activity_timestamp
FROM relations
WHERE created_at > unixepoch() - 86400 -- Last 24 hours

UNION ALL

SELECT
  'log' as activity_type,
  id,
  service as activity_name,
  level as activity_subtype,
  timestamp as activity_timestamp
FROM log_entries
WHERE timestamp > unixepoch() - 86400 -- Last 24 hours

ORDER BY activity_timestamp DESC;
`;
// ============================================================================
// MIGRATION DEFINITIONS
// ============================================================================
export const MIGRATIONS = [
    {
        version: 1,
        name: 'Initial schema',
        sql: SCHEMA_SQL,
        rollback: `
      DROP VIEW IF EXISTS recent_activity;
      DROP VIEW IF EXISTS log_summary;
      DROP VIEW IF EXISTS relation_graph;
      DROP VIEW IF EXISTS entity_details;
      DROP TRIGGER IF EXISTS trg_search_index_entity_update;
      DROP TRIGGER IF EXISTS trg_search_index_entity_insert;
      DROP TRIGGER IF EXISTS trg_entities_version_increment;
      DROP TRIGGER IF EXISTS trg_entities_updated_at;
      DROP TABLE IF EXISTS schema_migrations;
      DROP TABLE IF EXISTS log_entries;
      DROP TABLE IF EXISTS search_index;
      DROP TABLE IF EXISTS relations;
      DROP TABLE IF EXISTS entities;
    `
    }
];
// ============================================================================
// SCHEMA UTILITIES
// ============================================================================
/**
 * Get the SQL for creating a specific table
 */
export function getTableSchema(tableName) {
    const tableSchemas = {
        entities: `
      CREATE TABLE entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        data JSON NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        version INTEGER DEFAULT 1,
        CHECK (length(id) > 0),
        CHECK (length(type) > 0),
        CHECK (length(name) > 0),
        CHECK (version >= 1)
      );
    `,
        relations: `
      CREATE TABLE relations (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        type TEXT NOT NULL,
        properties JSON,
        created_at INTEGER DEFAULT (unixepoch()),
        CHECK (length(id) > 0),
        CHECK (length(from_id) > 0),
        CHECK (length(to_id) > 0),
        CHECK (length(type) > 0),
        CHECK (from_id != to_id),
        FOREIGN KEY (from_id) REFERENCES entities(id) ON DELETE CASCADE,
        FOREIGN KEY (to_id) REFERENCES entities(id) ON DELETE CASCADE
      );
    `,
        search_index: `
      CREATE TABLE search_index (
        entity_id TEXT PRIMARY KEY,
        original_name TEXT NOT NULL,
        normalized_name TEXT NOT NULL,
        name_tokens TEXT NOT NULL,
        file_path TEXT,
        file_extension TEXT,
        entity_type TEXT NOT NULL,
        tags TEXT,
        full_text TEXT NOT NULL,
        trigrams TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        CHECK (length(entity_id) > 0),
        CHECK (length(original_name) > 0),
        CHECK (length(normalized_name) > 0),
        CHECK (length(entity_type) > 0),
        FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
      );
    `,
        log_entries: `
      CREATE TABLE log_entries (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        level TEXT NOT NULL CHECK (level IN ('fatal', 'error', 'warn', 'info', 'debug', 'trace')),
        service TEXT NOT NULL,
        message TEXT NOT NULL,
        metadata JSON,
        process_id TEXT,
        session_id TEXT,
        trace_id TEXT,
        created_at INTEGER DEFAULT (unixepoch()),
        CHECK (length(id) > 0),
        CHECK (timestamp > 0),
        CHECK (length(service) > 0),
        CHECK (length(message) > 0)
      );
    `
    };
    return tableSchemas[tableName] || '';
}
/**
 * Validate schema version compatibility
 */
export function validateSchemaVersion(version) {
    return version >= 1 && version <= CURRENT_SCHEMA_VERSION;
}
/**
 * Get all table names in the schema
 */
export function getTableNames() {
    return ['entities', 'relations', 'search_index', 'log_entries', 'schema_migrations'];
}
/**
 * Get all index names for a specific table
 */
export function getTableIndexes(tableName) {
    const indexes = {
        entities: [
            'idx_entities_type',
            'idx_entities_name',
            'idx_entities_type_name',
            'idx_entities_updated_at',
            'idx_entities_version'
        ],
        relations: [
            'idx_relations_from_id',
            'idx_relations_to_id',
            'idx_relations_type',
            'idx_relations_from_type',
            'idx_relations_to_type',
            'idx_relations_from_to'
        ],
        search_index: [
            'idx_search_normalized_name',
            'idx_search_entity_type',
            'idx_search_file_extension',
            'idx_search_file_path',
            'idx_search_name_tokens',
            'idx_search_trigrams',
            'idx_search_updated_at'
        ],
        log_entries: [
            'idx_logs_timestamp',
            'idx_logs_level',
            'idx_logs_service',
            'idx_logs_level_service',
            'idx_logs_timestamp_level',
            'idx_logs_process_id',
            'idx_logs_session_id',
            'idx_logs_trace_id'
        ]
    };
    return indexes[tableName] || [];
}
//# sourceMappingURL=schema.js.map