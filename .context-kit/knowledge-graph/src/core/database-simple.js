import Database from 'better-sqlite3';
export class KGDatabaseSimple {
    db;
    statements;
    constructor(dbPath = 'appstate.db') {
        this.db = new Database(dbPath);
        this.statements = new Map();
        this.initialize();
    }
    initialize() {
        // Enable WAL mode for better concurrent access
        this.db.pragma('journal_mode = WAL');
        this.db.pragma('foreign_keys = ON');
        // Create tables inline
        this.db.exec(`
      -- Core entities table
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        data JSONB NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        version INTEGER DEFAULT 1
      );

      -- Relations between entities
      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY,
        from_id TEXT NOT NULL,
        to_id TEXT NOT NULL,
        type TEXT NOT NULL,
        properties JSONB DEFAULT '{}',
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (from_id) REFERENCES entities(id) ON DELETE CASCADE,
        FOREIGN KEY (to_id) REFERENCES entities(id) ON DELETE CASCADE
      );

      -- Observations about entities
      CREATE TABLE IF NOT EXISTS observations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT NOT NULL,
        content TEXT NOT NULL,
        metadata JSONB DEFAULT '{}',
        created_at INTEGER DEFAULT (unixepoch()),
        FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
      CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
      CREATE INDEX IF NOT EXISTS idx_relations_from ON relations(from_id);
      CREATE INDEX IF NOT EXISTS idx_relations_to ON relations(to_id);
      CREATE INDEX IF NOT EXISTS idx_relations_type ON relations(type);
      CREATE INDEX IF NOT EXISTS idx_observations_entity ON observations(entity_id);

      -- FTS5 virtual table for full-text search
      CREATE VIRTUAL TABLE IF NOT EXISTS entities_fts USING fts5(
        id UNINDEXED,
        type,
        name,
        data,
        content='entities',
        content_rowid='rowid'
      );

      -- Triggers to keep FTS5 in sync
      CREATE TRIGGER IF NOT EXISTS entities_fts_insert AFTER INSERT ON entities BEGIN
        INSERT INTO entities_fts(rowid, id, type, name, data) 
        VALUES (new.rowid, new.id, new.type, new.name, new.data);
      END;

      CREATE TRIGGER IF NOT EXISTS entities_fts_delete AFTER DELETE ON entities BEGIN
        DELETE FROM entities_fts WHERE rowid = old.rowid;
      END;

      CREATE TRIGGER IF NOT EXISTS entities_fts_update AFTER UPDATE ON entities BEGIN
        DELETE FROM entities_fts WHERE rowid = old.rowid;
        INSERT INTO entities_fts(rowid, id, type, name, data) 
        VALUES (new.rowid, new.id, new.type, new.name, new.data);
      END;
    `);
        // Initialize logging tables
        this.initializeLoggingTables();
        // Prepare common statements
        this.prepareStatements();
    }
    initializeLoggingTables() {
        this.db.exec(`
      -- Log sources (services, components)
      CREATE TABLE IF NOT EXISTS log_sources (
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

      -- Log entries with structured data
      CREATE TABLE IF NOT EXISTS log_entries (
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

      -- Pre-computed aggregations for performance
      CREATE TABLE IF NOT EXISTS log_aggregations (
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
      CREATE INDEX IF NOT EXISTS idx_log_entries_timestamp ON log_entries(timestamp);
      CREATE INDEX IF NOT EXISTS idx_log_entries_level ON log_entries(level);
      CREATE INDEX IF NOT EXISTS idx_log_entries_source ON log_entries(source_id);
      CREATE INDEX IF NOT EXISTS idx_log_entries_service ON log_entries(service);
      CREATE INDEX IF NOT EXISTS idx_log_entries_trace ON log_entries(trace_id);
      CREATE INDEX IF NOT EXISTS idx_log_entries_level_timestamp ON log_entries(level, timestamp);
      CREATE INDEX IF NOT EXISTS idx_log_sources_type ON log_sources(type);
      CREATE INDEX IF NOT EXISTS idx_log_aggregations_period ON log_aggregations(period, period_start);

      -- Full-text search for log messages and data
      CREATE VIRTUAL TABLE IF NOT EXISTS log_entries_fts USING fts5(
        message, 
        service,
        component,
        data,
        content=log_entries
      );

      -- FTS sync triggers
      CREATE TRIGGER IF NOT EXISTS log_entries_fts_insert AFTER INSERT ON log_entries BEGIN
        INSERT INTO log_entries_fts(message, service, component, data) 
        VALUES (new.message, new.service, new.component, new.data);
      END;

      CREATE TRIGGER IF NOT EXISTS log_entries_fts_update AFTER UPDATE ON log_entries BEGIN
        UPDATE log_entries_fts 
        SET message = new.message, service = new.service, 
            component = new.component, data = new.data 
        WHERE rowid = new.rowid;
      END;

      CREATE TRIGGER IF NOT EXISTS log_entries_fts_delete AFTER DELETE ON log_entries BEGIN
        DELETE FROM log_entries_fts WHERE rowid = old.rowid;
      END;

      -- Automatic 24-hour log retention for development tool
      CREATE TRIGGER IF NOT EXISTS log_cleanup_24h AFTER INSERT ON log_entries BEGIN
        DELETE FROM log_entries WHERE timestamp < (unixepoch() - 86400);
      END;
    `);
    }
    prepareStatements() {
        this.statements.set('createEntity', this.db.prepare(`
      INSERT INTO entities (id, type, name, data)
      VALUES (?, ?, ?, ?)
    `));
        this.statements.set('createRelation', this.db.prepare(`
      INSERT INTO relations (id, from_id, to_id, type, properties)
      VALUES (?, ?, ?, ?, ?)
    `));
        this.statements.set('searchEntities', this.db.prepare(`
      SELECT e.id, e.type, e.name, e.data, fts.rank as score
      FROM entities_fts fts
      JOIN entities e ON e.rowid = fts.rowid
      WHERE entities_fts MATCH ?
      ORDER BY fts.rank
      LIMIT ?
    `));
        this.statements.set('getEntity', this.db.prepare(`
      SELECT * FROM entities WHERE id = ?
    `));
        this.statements.set('getAllEntities', this.db.prepare(`
      SELECT * FROM entities ORDER BY created_at DESC LIMIT ?
    `));
    }
    getStatement(name) {
        const stmt = this.statements.get(name);
        if (!stmt) {
            throw new Error(`Statement '${name}' not found`);
        }
        return stmt;
    }
    transaction(fn) {
        return this.db.transaction(fn)();
    }
    getStats() {
        const entityCount = this.db.prepare('SELECT COUNT(*) as count FROM entities').get();
        const relationCount = this.db.prepare('SELECT COUNT(*) as count FROM relations').get();
        const observationCount = this.db.prepare('SELECT COUNT(*) as count FROM observations').get();
        // Add logging stats
        const logEntryCount = this.db.prepare('SELECT COUNT(*) as count FROM log_entries').get();
        const logSourceCount = this.db.prepare('SELECT COUNT(*) as count FROM log_sources').get();
        return {
            entities: entityCount.count,
            relations: relationCount.count,
            observations: observationCount.count,
            logEntries: logEntryCount.count,
            logSources: logSourceCount.count
        };
    }
    // Add prepare method for direct SQL access
    prepare(sql) {
        return this.db.prepare(sql);
    }
    close() {
        this.db.close();
    }
}
//# sourceMappingURL=database-simple.js.map