/**
 * Minimal test to reproduce the exact schema issue
 */

import Database from 'better-sqlite3';

// Simplified version of the schema that might be causing issues
const testSchemaSQL = `
-- Core entities table
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  data JSON NOT NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),
  version INTEGER DEFAULT 1
);

-- Relations table
CREATE TABLE IF NOT EXISTS relations (
  id TEXT PRIMARY KEY,
  from_id TEXT NOT NULL,
  to_id TEXT NOT NULL,
  type TEXT NOT NULL,
  properties JSON,
  created_at INTEGER DEFAULT (unixepoch()),
  FOREIGN KEY (from_id) REFERENCES entities(id) ON DELETE CASCADE,
  FOREIGN KEY (to_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Log entries table (this is where process_id is defined)
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
  CHECK (length(id) > 0),
  CHECK (timestamp > 0),
  CHECK (length(service) > 0),
  CHECK (length(message) > 0)
);

-- Search index table
CREATE TABLE IF NOT EXISTS search_index (
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
  FOREIGN KEY (entity_id) REFERENCES entities(id) ON DELETE CASCADE
);

-- Schema migrations table
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at INTEGER DEFAULT (unixepoch())
);

-- Indexes (this is where the process_id index is created)
CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
CREATE INDEX IF NOT EXISTS idx_relations_from_id ON relations(from_id);
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON log_entries(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON log_entries(level);
CREATE INDEX IF NOT EXISTS idx_logs_service ON log_entries(service);
CREATE INDEX IF NOT EXISTS idx_logs_process_id ON log_entries(process_id);
CREATE INDEX IF NOT EXISTS idx_logs_session_id ON log_entries(session_id);
CREATE INDEX IF NOT EXISTS idx_search_normalized_name ON search_index(normalized_name);
`;

async function testMinimalSchema() {
  console.log('🧪 Testing minimal schema reproduction...');

  try {
    // Create clean in-memory database
    const db = new Database(':memory:', { verbose: console.log });

    // Configure pragmas first
    console.log('📋 Setting pragmas...');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');

    console.log('\n🔄 Executing schema...');
    db.exec(testSchemaSQL);
    console.log('✅ Schema executed successfully!');

    // Test inserting data with process_id
    console.log('\n🧪 Testing process_id functionality...');
    const insertStmt = db.prepare(`
      INSERT INTO log_entries (id, timestamp, level, service, message, process_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    insertStmt.run('test-1', Date.now(), 'info', 'test-service', 'test message', 'test-process-id');

    const result = db.prepare('SELECT process_id FROM log_entries WHERE id = ?').get('test-1');
    console.log('✅ process_id test successful:', result);

    db.close();
    console.log('✅ Minimal schema test completed successfully!');

  } catch (error) {
    console.error('❌ Minimal schema test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

testMinimalSchema();