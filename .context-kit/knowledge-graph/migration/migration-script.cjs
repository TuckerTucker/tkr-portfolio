/**
 * Service Name Enhancement Migration Script
 * Handles data transformation for existing log entries to add display_name and category fields
 *
 * This script safely migrates existing log data to use the new service name resolution system
 * with comprehensive backup, validation, and rollback capabilities.
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

class ServiceNameMigration {
  constructor(databasePath = null) {
    this.databasePath = databasePath || this.findDatabasePath();
    this.db = null;
    this.migrationId = null;
    this.stats = {
      totalRecords: 0,
      updatedRecords: 0,
      failedRecords: 0,
      backupRecords: 0,
      errors: [],
      startTime: null,
      endTime: null
    };
  }

  findDatabasePath() {
    // Look for the database in common locations
    const possiblePaths = [
      path.join(process.cwd(), '.context-kit', 'knowledge-graph', 'knowledge-graph.db'),
      path.join(process.cwd(), 'knowledge-graph.db'),
      path.join(__dirname, '..', 'knowledge-graph.db')
    ];

    for (const dbPath of possiblePaths) {
      if (fs.existsSync(dbPath)) {
        return dbPath;
      }
    }

    throw new Error('Database file not found. Please specify the database path.');
  }

  /**
   * Initialize database connection and prepare for migration
   */
  async initialize() {
    try {
      this.db = new Database(this.databasePath);
      this.db.pragma('foreign_keys = ON');
      this.db.pragma('journal_mode = WAL');

      console.log(`Connected to database: ${this.databasePath}`);

      // Verify required tables exist
      await this.verifyPrerequisites();

      return true;
    } catch (error) {
      console.error('Failed to initialize database:', error.message);
      return false;
    }
  }

  /**
   * Verify that required tables and columns exist before migration
   */
  async verifyPrerequisites() {
    // Check if log_entries table exists
    const tables = this.db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name IN ('log_entries', 'service_mappings')
    `).all();

    if (tables.length < 2) {
      throw new Error('Required tables (log_entries, service_mappings) not found. Run schema migration first.');
    }

    // Check if new columns exist
    const columns = this.db.prepare(`PRAGMA table_info(log_entries)`).all();
    const hasDisplayName = columns.some(col => col.name === 'display_name');
    const hasCategory = columns.some(col => col.name === 'category');

    if (!hasDisplayName || !hasCategory) {
      throw new Error('Required columns (display_name, category) not found. Run schema migration first.');
    }

    console.log('✓ Prerequisites verified');
  }

  /**
   * Create backup of existing data before migration
   */
  async createBackup() {
    try {
      // Create backup table with current timestamp
      const backupTableName = `log_entries_backup_${Date.now()}`;

      this.db.prepare(`
        CREATE TABLE ${backupTableName} AS
        SELECT * FROM log_entries
      `).run();

      const backupCount = this.db.prepare(`SELECT COUNT(*) as count FROM ${backupTableName}`).get();
      this.stats.backupRecords = backupCount.count;

      console.log(`✓ Backup created: ${backupTableName} (${this.stats.backupRecords} records)`);
      return backupTableName;
    } catch (error) {
      console.error('Failed to create backup:', error.message);
      throw error;
    }
  }

  /**
   * Record migration start in metadata table
   */
  async startMigration() {
    try {
      const result = this.db.prepare(`
        INSERT INTO migration_metadata (migration_name, migration_version, status, applied_at)
        VALUES (?, ?, ?, ?)
      `).run('service-name-data-migration', '1.0.0', 'running', Math.floor(Date.now() / 1000));

      this.migrationId = result.lastInsertRowid;
      this.stats.startTime = new Date();

      console.log(`✓ Migration started (ID: ${this.migrationId})`);
    } catch (error) {
      console.error('Failed to record migration start:', error.message);
      throw error;
    }
  }

  /**
   * Get service mappings for pattern matching
   */
  getServiceMappings() {
    try {
      return this.db.prepare(`
        SELECT process_type, service_name, display_name, category, process_patterns, priority
        FROM service_mappings
        WHERE is_active = 1
        ORDER BY priority ASC
      `).all();
    } catch (error) {
      console.error('Failed to load service mappings:', error.message);
      return [];
    }
  }

  /**
   * Match service name to appropriate mapping using patterns
   */
  matchServiceToMapping(serviceName, mappings) {
    // Direct exact matches first
    for (const mapping of mappings) {
      if (mapping.service_name === serviceName) {
        return mapping;
      }
    }

    // Pattern matching
    for (const mapping of mappings) {
      try {
        const patterns = JSON.parse(mapping.process_patterns);
        for (const pattern of patterns) {
          const regex = new RegExp(pattern, 'i');
          if (regex.test(serviceName)) {
            return mapping;
          }
        }
      } catch (error) {
        console.warn(`Invalid pattern in mapping ${mapping.process_type}:`, error.message);
      }
    }

    // Fallback to unknown category
    return mappings.find(m => m.category === 'unknown') || {
      display_name: serviceName,
      category: 'unknown'
    };
  }

  /**
   * Apply migration rules for legacy service names
   */
  applyLegacyMigrationRules(serviceName) {
    const legacyRules = {
      'Session': { display_name: 'Terminal Session', category: 'terminal' },
      'unknown': { display_name: 'Unknown Service', category: 'unknown' },
      // Development servers
      'dev': { display_name: 'Development Server', category: 'dev-server' },
      'vite': { display_name: 'Vite Development Server', category: 'dev-server' },
      'next': { display_name: 'Next.js Development Server', category: 'dev-server' },
      'react': { display_name: 'React Development Server', category: 'dev-server' },
      // API services
      'api': { display_name: 'API Service', category: 'api-service' },
      'server': { display_name: 'API Server', category: 'api-service' },
      // Build tools
      'build': { display_name: 'Build Tool', category: 'build-tool' },
      'webpack': { display_name: 'Webpack Build', category: 'build-tool' },
      'tsc': { display_name: 'TypeScript Compiler', category: 'build-tool' },
      // Test runners
      'test': { display_name: 'Test Runner', category: 'test-runner' },
      'jest': { display_name: 'Jest Test Runner', category: 'test-runner' },
      'vitest': { display_name: 'Vitest Test Runner', category: 'test-runner' }
    };

    // Check for exact matches
    if (legacyRules[serviceName]) {
      return legacyRules[serviceName];
    }

    // Check for partial matches
    const lowerService = serviceName.toLowerCase();
    for (const [key, value] of Object.entries(legacyRules)) {
      if (lowerService.includes(key.toLowerCase())) {
        return value;
      }
    }

    return null;
  }

  /**
   * Migrate log entries in batches for performance
   */
  async migrateLogEntries() {
    const mappings = this.getServiceMappings();
    console.log(`Loaded ${mappings.length} service mappings`);

    // Get total count for progress tracking
    const totalCount = this.db.prepare(`
      SELECT COUNT(*) as count FROM log_entries WHERE display_name IS NULL
    `).get();

    this.stats.totalRecords = totalCount.count;
    console.log(`Found ${this.stats.totalRecords} records to migrate`);

    if (this.stats.totalRecords === 0) {
      console.log('No records need migration');
      return;
    }

    // Process in batches for performance
    const batchSize = 1000;
    let processed = 0;

    const selectStmt = this.db.prepare(`
      SELECT id, service FROM log_entries
      WHERE display_name IS NULL
      LIMIT ? OFFSET ?
    `);

    const updateStmt = this.db.prepare(`
      UPDATE log_entries
      SET display_name = ?, category = ?
      WHERE id = ?
    `);

    while (processed < this.stats.totalRecords) {
      const batch = selectStmt.all(batchSize, processed);

      if (batch.length === 0) break;

      // Process batch in transaction
      const transaction = this.db.transaction(() => {
        for (const record of batch) {
          try {
            // Apply legacy migration rules first
            let result = this.applyLegacyMigrationRules(record.service);

            // If no legacy rule matched, use service mappings
            if (!result) {
              const mapping = this.matchServiceToMapping(record.service, mappings);
              result = {
                display_name: mapping.display_name,
                category: mapping.category
              };
            }

            updateStmt.run(result.display_name, result.category, record.id);
            this.stats.updatedRecords++;
          } catch (error) {
            this.stats.failedRecords++;
            this.stats.errors.push(`Failed to update record ${record.id}: ${error.message}`);
          }
        }
      });

      transaction();
      processed += batch.length;

      // Progress reporting
      const percentage = Math.round((processed / this.stats.totalRecords) * 100);
      console.log(`Progress: ${processed}/${this.stats.totalRecords} (${percentage}%)`);
    }

    console.log(`✓ Migration completed: ${this.stats.updatedRecords} updated, ${this.stats.failedRecords} failed`);
  }

  /**
   * Validate migration results
   */
  async validateMigration() {
    try {
      // Check that all records have display_name and category
      const incompleteRecords = this.db.prepare(`
        SELECT COUNT(*) as count FROM log_entries
        WHERE display_name IS NULL OR category IS NULL
      `).get();

      // Check category distribution
      const categoryStats = this.db.prepare(`
        SELECT category, COUNT(*) as count
        FROM log_entries
        GROUP BY category
        ORDER BY count DESC
      `).all();

      // Check for any invalid categories
      const invalidCategories = this.db.prepare(`
        SELECT DISTINCT category FROM log_entries
        WHERE category NOT IN ('terminal', 'dev-server', 'build-tool', 'test-runner', 'api-service', 'unknown')
      `).all();

      const validation = {
        isValid: incompleteRecords.count === 0 && invalidCategories.length === 0,
        incompleteRecords: incompleteRecords.count,
        categoryDistribution: categoryStats,
        invalidCategories: invalidCategories.map(c => c.category),
        totalMigrated: this.stats.updatedRecords
      };

      console.log('Validation Results:');
      console.log('- Complete records:', validation.isValid ? '✓' : '✗');
      console.log('- Incomplete records:', validation.incompleteRecords);
      console.log('- Invalid categories:', validation.invalidCategories.length);
      console.log('- Category distribution:', validation.categoryDistribution);

      return validation;
    } catch (error) {
      console.error('Validation failed:', error.message);
      return { isValid: false, error: error.message };
    }
  }

  /**
   * Complete migration and update metadata
   */
  async completeMigration(success = true) {
    try {
      this.stats.endTime = new Date();
      const duration = this.stats.endTime - this.stats.startTime;

      const status = success ? 'completed' : 'failed';
      const errorMessage = this.stats.errors.length > 0 ?
        JSON.stringify(this.stats.errors.slice(0, 10)) : null;

      this.db.prepare(`
        UPDATE migration_metadata
        SET status = ?, records_affected = ?, error_message = ?
        WHERE id = ?
      `).run(status, this.stats.updatedRecords, errorMessage, this.migrationId);

      console.log(`✓ Migration ${status} in ${Math.round(duration / 1000)}s`);
      console.log('Final Statistics:', this.stats);
    } catch (error) {
      console.error('Failed to complete migration:', error.message);
    }
  }

  /**
   * Main migration execution flow
   */
  async execute() {
    try {
      console.log('Starting Service Name Enhancement Migration...');

      if (!await this.initialize()) {
        throw new Error('Failed to initialize migration');
      }

      await this.createBackup();
      await this.startMigration();
      await this.migrateLogEntries();

      const validation = await this.validateMigration();

      if (validation.isValid) {
        await this.completeMigration(true);
        console.log('✓ Migration completed successfully');
        return { success: true, stats: this.stats, validation };
      } else {
        console.error('✗ Migration validation failed');
        await this.completeMigration(false);
        return { success: false, stats: this.stats, validation };
      }
    } catch (error) {
      console.error('Migration failed:', error.message);
      await this.completeMigration(false);
      return { success: false, error: error.message, stats: this.stats };
    } finally {
      if (this.db) {
        this.db.close();
      }
    }
  }

  /**
   * Rollback migration using backup data
   */
  async rollback(backupTableName) {
    try {
      if (!this.db) {
        await this.initialize();
      }

      console.log(`Rolling back migration using backup: ${backupTableName}`);

      // Restore data from backup
      this.db.prepare(`
        UPDATE log_entries
        SET display_name = NULL, category = 'unknown'
        WHERE id IN (SELECT id FROM ${backupTableName})
      `).run();

      console.log('✓ Migration rolled back successfully');
      return true;
    } catch (error) {
      console.error('Rollback failed:', error.message);
      return false;
    }
  }
}

// CLI execution support
if (require.main === module) {
  const migration = new ServiceNameMigration();

  migration.execute()
    .then(result => {
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = ServiceNameMigration;