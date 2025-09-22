/**
 * Test with the exact same database path and process as HTTP server
 */

import { createDatabaseConnection } from '../core/src/database/connection.js';

async function testExactDatabasePath() {
  console.log('🧪 Testing with exact database path and process...');

  try {
    // Use the exact same path as the HTTP server
    const db = await createDatabaseConnection({
      path: 'knowledge-graph.db',
      enableWAL: true,
      enableForeignKeys: true,
      verbose: true
    });

    console.log('✅ Database connection successful!');

    // Test basic operations
    const stats = await db.getStats();
    console.log('📊 Database stats:', stats);

    // Test health check
    const health = await db.healthCheck();
    console.log('🏥 Health check:', health);

    await db.disconnect();
    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);

    // Print the full error stack to understand exactly where it's failing
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

testExactDatabasePath();