/**
 * Test script to verify the database fixes work
 */

import { DatabaseConnection } from '../core/src/database/connection.js';

async function testDatabaseConnection() {
  console.log('Testing database connection with production initialization...');

  try {
    const db = new DatabaseConnection({
      path: 'test-fixed.db',
      enableWAL: true,
      enableForeignKeys: true,
      verbose: true
    });

    console.log('Connecting to database...');
    await db.connect();

    console.log('✅ Database connection and initialization successful!');

    // Test basic operations
    const stats = await db.getStats();
    console.log('Database stats:', stats);

    // Clean disconnect
    await db.disconnect();
    console.log('✅ Database test completed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
  }
}

testDatabaseConnection();