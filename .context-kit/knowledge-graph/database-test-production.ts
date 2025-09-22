/**
 * Test production-grade database initialization to verify the fixes work
 */

import Database from 'better-sqlite3';

interface Migration {
  version: number;
  name: string;
  sql: string;
}

// Mock migration data (without PRAGMA statements in the SQL)
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    name: 'Initial schema',
    sql: `
      CREATE TABLE IF NOT EXISTS entities (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        data JSON NOT NULL,
        created_at INTEGER DEFAULT (unixepoch()),
        updated_at INTEGER DEFAULT (unixepoch()),
        version INTEGER DEFAULT 1
      );

      CREATE INDEX IF NOT EXISTS idx_entities_type ON entities(type);
      CREATE INDEX IF NOT EXISTS idx_entities_name ON entities(name);
    `
  }
];

async function testProductionDatabaseInit() {
  console.log('🧪 Testing production-grade database initialization...');

  try {
    // Create in-memory database
    const db = new Database(':memory:', { verbose: console.log });

    // CRITICAL: Configure pragmas BEFORE any schema operations
    console.log('📋 Configuring pragmas first...');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 10000');
    db.pragma('temp_store = memory');

    // Create schema_migrations table
    console.log('📊 Creating schema_migrations table...');
    db.exec(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        applied_at INTEGER DEFAULT (unixepoch())
      );
    `);

    // Get current schema version
    console.log('🔍 Checking current schema version...');
    let currentVersion = 0;
    try {
      const result = db.prepare(`
        SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1
      `).get() as { version: number } | undefined;
      currentVersion = result?.version || 0;
    } catch {
      currentVersion = 0;
    }

    console.log(`📈 Current schema version: ${currentVersion}`);

    // Apply migrations WITHOUT transactions
    console.log('🔄 Applying migrations directly without transactions...');
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        console.log(`✨ Applying migration: ${migration.name}`);

        // Execute migration SQL directly without transaction wrapper
        db.exec(migration.sql);

        // Record migration
        db.prepare(`
          INSERT INTO schema_migrations (version, name, applied_at)
          VALUES (?, ?, unixepoch())
        `).run(migration.version, migration.name);

        console.log(`✅ Migration ${migration.name} completed successfully`);
      }
    }

    // Test basic operations
    console.log('🧪 Testing basic database operations...');
    const insertStmt = db.prepare(`
      INSERT INTO entities (id, type, name, data)
      VALUES (?, ?, ?, ?)
    `);

    insertStmt.run('test-1', 'component', 'TestComponent', JSON.stringify({
      description: 'Test component for production database'
    }));

    const entities = db.prepare('SELECT * FROM entities').all();
    console.log(`📊 Found ${entities.length} entities:`, entities);

    // Clean shutdown
    db.close();
    console.log('✅ Production database test completed successfully!');

  } catch (error) {
    console.error('❌ Production database test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

testProductionDatabaseInit();