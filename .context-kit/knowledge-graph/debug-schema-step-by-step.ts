/**
 * Debug schema execution step by step to find process_id issue
 */

import Database from 'better-sqlite3';

async function debugSchemaStepByStep() {
  console.log('🔍 Debugging schema step by step...');

  try {
    // Create clean in-memory database
    const db = new Database(':memory:', { verbose: console.log });

    // Configure pragmas first
    console.log('📋 Setting pragmas...');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');

    // First, let's try to create just the log_entries table to see if the issue is there
    console.log('\n🧪 Testing log_entries table creation...');

    const logTableSQL = `
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
    `;

    try {
      db.exec(logTableSQL);
      console.log('✅ log_entries table created successfully');

      // Test if process_id column exists
      const testInsert = db.prepare(`
        INSERT INTO log_entries (id, timestamp, level, service, message, process_id)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      testInsert.run('test-1', Date.now(), 'info', 'test', 'test message', 'test-process');
      console.log('✅ Insert with process_id successful');

      // Query back the data
      const result = db.prepare('SELECT process_id FROM log_entries WHERE id = ?').get('test-1');
      console.log('✅ Query process_id successful:', result);

    } catch (error) {
      console.error('❌ log_entries table creation failed:', error);
    }

    // Now let's test the full schema in sections
    console.log('\n🧪 Testing full schema from core module...');

    // Import the schema from the core module
    const coreSchemaPath = '../core/src/database/schema.js';
    const { SCHEMA_SQL } = await import(coreSchemaPath);

    // Split into major sections and test each
    const sections = SCHEMA_SQL.split('-- ============================================================================');

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      if (section.length === 0) continue;

      console.log(`\n📦 Testing section ${i + 1}: ${section.substring(0, 60)}...`);

      try {
        // Skip empty sections or comment-only sections
        if (section.startsWith('--') || section.replace(/--.*$/gm, '').trim().length === 0) {
          console.log(`⏭️  Skipping comment section ${i + 1}`);
          continue;
        }

        db.exec(section);
        console.log(`✅ Section ${i + 1} executed successfully`);
      } catch (sectionError) {
        console.error(`❌ Section ${i + 1} failed:`, sectionError);
        console.log('🔍 Problematic SQL section:');
        console.log(section);

        // If this section mentions process_id, let's examine it more closely
        if (section.includes('process_id')) {
          console.log('🎯 This section contains process_id reference!');
        }
        break;
      }
    }

    db.close();

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

debugSchemaStepByStep();