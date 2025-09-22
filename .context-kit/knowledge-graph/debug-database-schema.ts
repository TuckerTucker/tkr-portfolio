/**
 * Debug schema execution to find process_id issue
 */

import Database from 'better-sqlite3';

async function debugSchemaExecution() {
  console.log('🔍 Debugging schema execution step by step...');

  try {
    // Create in-memory database
    const db = new Database(':memory:', { verbose: console.log });

    // Configure pragmas first
    console.log('📋 Configuring pragmas...');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.pragma('synchronous = NORMAL');

    // Import the full schema and execute it piece by piece
    const { SCHEMA_SQL } = await import('../core/src/database/schema.js');

    console.log('📄 Full schema SQL length:', SCHEMA_SQL.length);

    // Try to execute the schema and catch the exact point of failure
    try {
      console.log('🔄 Executing full schema...');
      db.exec(SCHEMA_SQL);
      console.log('✅ Full schema executed successfully!');
    } catch (error) {
      console.error('❌ Schema execution failed:', error);
      console.log('🧩 Let\'s try breaking it down...');

      // Split the schema into sections and execute each
      const sections = SCHEMA_SQL.split('-- ============================================================================');

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i].trim();
        if (section.length === 0) continue;

        console.log(`\n📦 Executing section ${i + 1}:`, section.substring(0, 100) + '...');

        try {
          db.exec(section);
          console.log(`✅ Section ${i + 1} executed successfully`);
        } catch (sectionError) {
          console.error(`❌ Section ${i + 1} failed:`, sectionError);
          console.log('🔍 Problematic SQL:', section);
          break;
        }
      }
    }

    db.close();

  } catch (error) {
    console.error('❌ Debug test failed:', error);
  }
}

debugSchemaExecution();