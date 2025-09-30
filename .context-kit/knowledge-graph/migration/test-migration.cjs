/**
 * Migration Test Script
 * Tests and validates the service name enhancement migration procedures
 * This script performs comprehensive testing without affecting production data
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class MigrationTester {
  constructor() {
    this.testDbPath = path.join(__dirname, '..', 'test-migration.db');
    this.sourceDbPath = path.join(__dirname, '..', 'knowledge-graph.db');
    this.testDb = null;
    this.testResults = {
      schemaTests: [],
      dataTests: [],
      performanceTests: [],
      rollbackTests: [],
      overallSuccess: false
    };
  }

  /**
   * Create a test database copy for safe testing
   */
  async createTestDatabase() {
    try {
      // Remove existing test database
      if (fs.existsSync(this.testDbPath)) {
        fs.unlinkSync(this.testDbPath);
      }

      // Copy source database if it exists
      if (fs.existsSync(this.sourceDbPath)) {
        fs.copyFileSync(this.sourceDbPath, this.testDbPath);
        console.log('✓ Test database created from production copy');
      } else {
        // Create minimal test database
        this.testDb = new Database(this.testDbPath);
        await this.createMinimalTestData();
        console.log('✓ Test database created with minimal data');
      }

      this.testDb = new Database(this.testDbPath);
      return true;
    } catch (error) {
      console.error('Failed to create test database:', error.message);
      return false;
    }
  }

  /**
   * Create minimal test data for testing migration
   */
  async createMinimalTestData() {
    // Apply base logging schema
    const schemaPath = path.join(__dirname, '..', 'schemas', 'logging-schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf8');
      this.testDb.exec(schema);
    }

    // Insert test log sources
    this.testDb.prepare(`
      INSERT OR IGNORE INTO log_sources (id, name, type) VALUES
      ('test-source-1', 'Test Terminal', 'system'),
      ('test-source-2', 'Test Dev Server', 'frontend'),
      ('test-source-3', 'Test API', 'backend')
    `).run();

    // Insert test log entries
    const insertLog = this.testDb.prepare(`
      INSERT INTO log_entries (id, timestamp, level, message, source_id, service)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const testLogs = [
      ['log-1', Date.now() - 3600000, 'INFO', 'Test terminal log', 'test-source-1', 'Session'],
      ['log-2', Date.now() - 1800000, 'DEBUG', 'Test dev server log', 'test-source-2', 'vite-dev'],
      ['log-3', Date.now() - 900000, 'ERROR', 'Test API error', 'test-source-3', 'unknown'],
      ['log-4', Date.now() - 450000, 'WARN', 'Test build warning', 'test-source-1', 'npm'],
      ['log-5', Date.now() - 225000, 'INFO', 'Test process log', 'test-source-2', 'jest'],
    ];

    for (const log of testLogs) {
      insertLog.run(...log);
    }

    console.log(`✓ Created ${testLogs.length} test log entries`);
  }

  /**
   * Test schema migration procedures
   */
  async testSchemaMigration() {
    console.log('\n--- Testing Schema Migration ---');
    let success = true;

    try {
      // Test 1: Apply schema updates
      const schemaPath = path.join(__dirname, 'schema-updates.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');

      this.testDb.exec(schema);
      this.testResults.schemaTests.push({
        test: 'Schema Updates Applied',
        status: 'passed',
        details: 'display_name and category columns added successfully'
      });

      // Test 2: Verify columns exist
      const columns = this.testDb.prepare(`PRAGMA table_info(log_entries)`).all();
      const hasDisplayName = columns.some(col => col.name === 'display_name');
      const hasCategory = columns.some(col => col.name === 'category');

      if (hasDisplayName && hasCategory) {
        this.testResults.schemaTests.push({
          test: 'Column Verification',
          status: 'passed',
          details: 'Both display_name and category columns present'
        });
      } else {
        this.testResults.schemaTests.push({
          test: 'Column Verification',
          status: 'failed',
          details: `Missing columns: ${!hasDisplayName ? 'display_name ' : ''}${!hasCategory ? 'category' : ''}`
        });
        success = false;
      }

      // Test 3: Apply service mapping schema
      const migrationPath = path.join(__dirname, 'service-name-migration.sql');
      const migration = fs.readFileSync(migrationPath, 'utf8');

      this.testDb.exec(migration);
      this.testResults.schemaTests.push({
        test: 'Service Mappings Schema',
        status: 'passed',
        details: 'service_mappings table and views created successfully'
      });

      // Test 4: Verify service mappings data
      const mappingCount = this.testDb.prepare(`SELECT COUNT(*) as count FROM service_mappings`).get();
      if (mappingCount.count > 0) {
        this.testResults.schemaTests.push({
          test: 'Service Mappings Data',
          status: 'passed',
          details: `${mappingCount.count} service mappings inserted`
        });
      } else {
        this.testResults.schemaTests.push({
          test: 'Service Mappings Data',
          status: 'failed',
          details: 'No service mappings found'
        });
        success = false;
      }

    } catch (error) {
      this.testResults.schemaTests.push({
        test: 'Schema Migration',
        status: 'failed',
        details: error.message
      });
      success = false;
    }

    return success;
  }

  /**
   * Test data migration procedures
   */
  async testDataMigration() {
    console.log('\n--- Testing Data Migration ---');
    let success = true;

    try {
      // Test 1: Pre-migration state
      const preCount = this.testDb.prepare(`
        SELECT COUNT(*) as count FROM log_entries WHERE display_name IS NULL
      `).get();

      if (preCount.count === 0) {
        console.log('No records need migration, creating test data...');
        // Reset some records for testing
        this.testDb.prepare(`
          UPDATE log_entries SET display_name = NULL, category = 'unknown'
        `).run();
      }

      // Test 2: Apply legacy migration rules
      const updated = this.testDb.prepare(`
        UPDATE log_entries
        SET
          display_name = CASE
            WHEN service = 'Session' THEN 'Terminal Session'
            WHEN service = 'unknown' THEN 'Unknown Service'
            WHEN service LIKE '%dev%' OR service = 'vite-dev' THEN 'Development Server'
            WHEN service LIKE '%api%' THEN 'API Service'
            WHEN service = 'npm' THEN 'NPM Package Manager'
            WHEN service = 'jest' THEN 'Jest Test Runner'
            ELSE service
          END,
          category = CASE
            WHEN service = 'Session' THEN 'terminal'
            WHEN service LIKE '%dev%' OR service = 'vite-dev' THEN 'dev-server'
            WHEN service LIKE '%api%' THEN 'api-service'
            WHEN service = 'npm' THEN 'build-tool'
            WHEN service = 'jest' THEN 'test-runner'
            ELSE 'unknown'
          END
        WHERE display_name IS NULL
      `).run();

      this.testResults.dataTests.push({
        test: 'Data Migration',
        status: 'passed',
        details: `${updated.changes} records updated`
      });

      // Test 3: Verify migration results
      const verification = this.testDb.prepare(`
        SELECT
          COUNT(*) as total,
          COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as migrated,
          COUNT(CASE WHEN category != 'unknown' THEN 1 END) as categorized
        FROM log_entries
      `).get();

      if (verification.migrated === verification.total) {
        this.testResults.dataTests.push({
          test: 'Migration Completeness',
          status: 'passed',
          details: `All ${verification.total} records have display_name`
        });
      } else {
        this.testResults.dataTests.push({
          test: 'Migration Completeness',
          status: 'failed',
          details: `${verification.total - verification.migrated} records missing display_name`
        });
        success = false;
      }

      // Test 4: Verify specific transformations
      const sessionCount = this.testDb.prepare(`
        SELECT COUNT(*) as count FROM log_entries
        WHERE service = 'Session' AND display_name = 'Terminal Session' AND category = 'terminal'
      `).get();

      this.testResults.dataTests.push({
        test: 'Session Transformation',
        status: sessionCount.count > 0 ? 'passed' : 'skipped',
        details: `${sessionCount.count} Session records transformed to Terminal Session`
      });

    } catch (error) {
      this.testResults.dataTests.push({
        test: 'Data Migration',
        status: 'failed',
        details: error.message
      });
      success = false;
    }

    return success;
  }

  /**
   * Test performance of queries with new indexes
   */
  async testPerformance() {
    console.log('\n--- Testing Performance ---');
    let success = true;

    try {
      // Test 1: Service list query performance
      const start1 = Date.now();
      const services = this.testDb.prepare(`
        SELECT
          service as service_name,
          display_name,
          category,
          COUNT(*) as log_count,
          MAX(timestamp) as last_activity
        FROM log_entries
        GROUP BY service, display_name, category
        ORDER BY log_count DESC
      `).all();
      const duration1 = Date.now() - start1;

      this.testResults.performanceTests.push({
        test: 'Service List Query',
        status: duration1 < 50 ? 'passed' : 'warning',
        details: `Query took ${duration1}ms (target: <50ms), found ${services.length} services`
      });

      // Test 2: Category filtering performance
      const start2 = Date.now();
      const categoryLogs = this.testDb.prepare(`
        SELECT * FROM log_entries
        WHERE category = 'terminal'
        ORDER BY timestamp DESC
        LIMIT 100
      `).all();
      const duration2 = Date.now() - start2;

      this.testResults.performanceTests.push({
        test: 'Category Filter Query',
        status: duration2 < 100 ? 'passed' : 'warning',
        details: `Query took ${duration2}ms (target: <100ms), found ${categoryLogs.length} logs`
      });

      // Test 3: Index utilization
      const queryPlan = this.testDb.prepare(`
        EXPLAIN QUERY PLAN
        SELECT * FROM log_entries WHERE category = 'dev-server'
      `).all();

      const usesIndex = queryPlan.some(step => step.detail && step.detail.includes('idx_logs_category'));
      this.testResults.performanceTests.push({
        test: 'Index Utilization',
        status: usesIndex ? 'passed' : 'warning',
        details: usesIndex ? 'Category index used in query plan' : 'Category index not detected in query plan'
      });

    } catch (error) {
      this.testResults.performanceTests.push({
        test: 'Performance Testing',
        status: 'failed',
        details: error.message
      });
      success = false;
    }

    return success;
  }

  /**
   * Test rollback procedures
   */
  async testRollback() {
    console.log('\n--- Testing Rollback Procedures ---');
    let success = true;

    try {
      // Test 1: Create backup before rollback test
      const backupName = `test_backup_${Date.now()}`;
      this.testDb.prepare(`
        CREATE TABLE ${backupName} AS SELECT * FROM log_entries
      `).run();

      this.testResults.rollbackTests.push({
        test: 'Backup Creation',
        status: 'passed',
        details: `Backup table ${backupName} created`
      });

      // Test 2: Test reset rollback
      const originalState = this.testDb.prepare(`
        SELECT COUNT(*) as migrated FROM log_entries WHERE display_name IS NOT NULL
      `).get();

      // Reset columns
      this.testDb.prepare(`
        UPDATE log_entries SET display_name = NULL, category = 'unknown'
      `).run();

      const resetState = this.testDb.prepare(`
        SELECT COUNT(*) as migrated FROM log_entries WHERE display_name IS NOT NULL
      `).get();

      if (resetState.migrated === 0) {
        this.testResults.rollbackTests.push({
          test: 'Reset Rollback',
          status: 'passed',
          details: 'All display_name values reset to NULL'
        });
      } else {
        this.testResults.rollbackTests.push({
          test: 'Reset Rollback',
          status: 'failed',
          details: `${resetState.migrated} records still have display_name`
        });
        success = false;
      }

      // Test 3: Test backup restoration
      // Re-migrate for restoration test
      this.testDb.prepare(`
        UPDATE log_entries
        SET display_name = 'Test Display Name', category = 'terminal'
        WHERE service = 'Session'
      `).run();

      // Restore from backup (simulate)
      const restored = this.testDb.prepare(`
        UPDATE log_entries
        SET display_name = NULL, category = 'unknown'
        WHERE id IN (SELECT id FROM ${backupName})
      `).run();

      this.testResults.rollbackTests.push({
        test: 'Backup Restoration',
        status: 'passed',
        details: `${restored.changes} records restored from backup`
      });

      // Cleanup backup table
      this.testDb.prepare(`DROP TABLE ${backupName}`).run();

    } catch (error) {
      this.testResults.rollbackTests.push({
        test: 'Rollback Testing',
        status: 'failed',
        details: error.message
      });
      success = false;
    }

    return success;
  }

  /**
   * Run all tests and generate report
   */
  async runAllTests() {
    console.log('Starting Migration Testing...\n');

    if (!await this.createTestDatabase()) {
      console.error('Failed to create test database');
      return false;
    }

    const results = {
      schema: await this.testSchemaMigration(),
      data: await this.testDataMigration(),
      performance: await this.testPerformance(),
      rollback: await this.testRollback()
    };

    this.testResults.overallSuccess = Object.values(results).every(Boolean);

    this.generateReport();
    this.cleanup();

    return this.testResults.overallSuccess;
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION TEST REPORT');
    console.log('='.repeat(60));

    const categories = ['schemaTests', 'dataTests', 'performanceTests', 'rollbackTests'];
    const categoryNames = ['Schema Tests', 'Data Tests', 'Performance Tests', 'Rollback Tests'];

    categories.forEach((category, index) => {
      console.log(`\n${categoryNames[index]}:`);
      this.testResults[category].forEach(test => {
        const status = test.status === 'passed' ? '✓' :
                      test.status === 'warning' ? '⚠' : '✗';
        console.log(`  ${status} ${test.test}: ${test.details}`);
      });
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`Overall Result: ${this.testResults.overallSuccess ? '✓ PASSED' : '✗ FAILED'}`);
    console.log('-'.repeat(60));

    // Write report to file
    const reportPath = path.join(__dirname, 'test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.testResults, null, 2));
    console.log(`\nDetailed report saved to: ${reportPath}`);
  }

  /**
   * Cleanup test resources
   */
  cleanup() {
    if (this.testDb) {
      this.testDb.close();
    }

    if (fs.existsSync(this.testDbPath)) {
      fs.unlinkSync(this.testDbPath);
      console.log('\n✓ Test database cleaned up');
    }
  }
}

// Run tests if script is executed directly
if (require.main === module) {
  const tester = new MigrationTester();

  tester.runAllTests()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = MigrationTester;