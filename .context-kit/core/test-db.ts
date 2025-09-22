/**
 * Simple database connection test
 */

import Database from 'better-sqlite3';

async function testDatabaseConnection() {
  console.log('Testing database connection...');

  try {
    // Create a simple in-memory database
    const db = new Database(':memory:');

    // Configure pragmas (the problematic part)
    console.log('Setting WAL mode...');
    db.pragma('journal_mode = WAL');

    console.log('Setting synchronous mode...');
    db.pragma('synchronous = NORMAL');

    console.log('Setting other pragmas...');
    db.pragma('foreign_keys = ON');
    db.pragma('cache_size = 10000');
    db.pragma('temp_store = memory');

    // Test creating a simple table
    console.log('Creating test table...');
    db.exec(`
      CREATE TABLE test (
        id INTEGER PRIMARY KEY,
        name TEXT
      )
    `);

    // Test inserting data
    console.log('Inserting test data...');
    const stmt = db.prepare('INSERT INTO test (name) VALUES (?)');
    stmt.run('test');

    // Test querying data
    console.log('Querying test data...');
    const result = db.prepare('SELECT * FROM test').all();
    console.log('Query result:', result);

    db.close();
    console.log('✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error.message);
  }
}

testDatabaseConnection();