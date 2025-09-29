-- Service Name Enhancement Migration Rollback Procedures
-- Comprehensive rollback scripts for safe recovery from migration issues
-- This file provides multiple rollback strategies depending on the situation

-- Enable foreign keys and set optimal settings
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ==============================================================================
-- ROLLBACK STRATEGY 1: Reset display_name and category columns
-- ==============================================================================

-- This strategy resets the new columns to their default values
-- Use when migration data is incorrect but schema is fine

BEGIN TRANSACTION;

-- Record rollback attempt
INSERT INTO migration_metadata (migration_name, migration_version, status, applied_at)
VALUES ('service-name-rollback-reset', '1.0.0', 'running', unixepoch());

-- Reset display_name to NULL
UPDATE log_entries SET display_name = NULL;

-- Reset category to default 'unknown'
UPDATE log_entries SET category = 'unknown';

-- Verify reset
SELECT
  COUNT(*) as total_records,
  COUNT(CASE WHEN display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN category = 'unknown' THEN 1 END) as unknown_categories
FROM log_entries;

-- Update rollback status
UPDATE migration_metadata
SET status = 'completed', records_affected = (SELECT COUNT(*) FROM log_entries)
WHERE migration_name = 'service-name-rollback-reset'
  AND status = 'running';

COMMIT;

-- ==============================================================================
-- ROLLBACK STRATEGY 2: Restore from specific backup table
-- ==============================================================================

-- This strategy restores data from a specific backup table
-- Replace 'BACKUP_TABLE_NAME' with the actual backup table name

/*
BEGIN TRANSACTION;

-- Record rollback attempt
INSERT INTO migration_metadata (migration_name, migration_version, status, applied_at)
VALUES ('service-name-rollback-restore', '1.0.0', 'running', unixepoch());

-- First, create a current state backup before rollback
CREATE TABLE log_entries_pre_rollback_backup AS
SELECT * FROM log_entries;

-- Restore original data from backup
-- Note: This assumes the backup table has the same structure
UPDATE log_entries
SET
  display_name = (SELECT display_name FROM BACKUP_TABLE_NAME WHERE BACKUP_TABLE_NAME.id = log_entries.id),
  category = (SELECT category FROM BACKUP_TABLE_NAME WHERE BACKUP_TABLE_NAME.id = log_entries.id)
WHERE id IN (SELECT id FROM BACKUP_TABLE_NAME);

-- For records that might not have been in the backup, reset to defaults
UPDATE log_entries
SET display_name = NULL, category = 'unknown'
WHERE id NOT IN (SELECT id FROM BACKUP_TABLE_NAME);

-- Verify restoration
SELECT
  COUNT(*) as total_records,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as restored_display_names,
  COUNT(CASE WHEN category != 'unknown' THEN 1 END) as restored_categories
FROM log_entries;

-- Update rollback status
UPDATE migration_metadata
SET status = 'completed', records_affected = (SELECT COUNT(*) FROM log_entries)
WHERE migration_name = 'service-name-rollback-restore'
  AND status = 'running';

COMMIT;
*/

-- ==============================================================================
-- ROLLBACK STRATEGY 3: Complete schema rollback (DESTRUCTIVE)
-- ==============================================================================

-- WARNING: This strategy removes the new columns entirely
-- Only use if you need to completely undo the schema changes
-- This is destructive and will lose all migration data

/*
BEGIN TRANSACTION;

-- Record rollback attempt
INSERT INTO migration_metadata (migration_name, migration_version, status, applied_at)
VALUES ('service-name-rollback-schema', '1.0.0', 'running', unixepoch());

-- SQLite doesn't support DROP COLUMN, so we need to recreate the table
-- Create new table without the new columns
CREATE TABLE log_entries_new (
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

-- Copy data from original table (excluding new columns)
INSERT INTO log_entries_new (
  id, timestamp, level, message, source_id, service, component,
  data, trace_id, span_id, user_id, session_id, created_at
)
SELECT
  id, timestamp, level, message, source_id, service, component,
  data, trace_id, span_id, user_id, session_id, created_at
FROM log_entries;

-- Drop original table and rename new one
DROP TABLE log_entries;
ALTER TABLE log_entries_new RENAME TO log_entries;

-- Recreate original indexes
CREATE INDEX idx_log_entries_timestamp ON log_entries(timestamp);
CREATE INDEX idx_log_entries_level ON log_entries(level);
CREATE INDEX idx_log_entries_source ON log_entries(source_id);
CREATE INDEX idx_log_entries_service ON log_entries(service);
CREATE INDEX idx_log_entries_trace ON log_entries(trace_id);
CREATE INDEX idx_log_entries_level_timestamp ON log_entries(level, timestamp);

-- Drop service_mappings table if it exists
DROP TABLE IF EXISTS service_mappings;

-- Drop migration-related views
DROP VIEW IF EXISTS migration_progress;
DROP VIEW IF EXISTS service_analysis;
DROP VIEW IF EXISTS mapping_utilization;

-- Update rollback status
UPDATE migration_metadata
SET status = 'completed', records_affected = (SELECT COUNT(*) FROM log_entries)
WHERE migration_name = 'service-name-rollback-schema'
  AND status = 'running';

COMMIT;
*/

-- ==============================================================================
-- ROLLBACK VERIFICATION QUERIES
-- ==============================================================================

-- Query to check current migration state
CREATE VIEW IF NOT EXISTS rollback_verification AS
SELECT
  'log_entries' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN category = 'unknown' THEN 1 END) as unknown_categories,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as migrated_records
FROM log_entries

UNION ALL

SELECT
  'service_mappings' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_mappings,
  COUNT(CASE WHEN is_active = 0 THEN 1 END) as inactive_mappings,
  0 as migrated_records
FROM service_mappings
WHERE EXISTS (SELECT 1 FROM sqlite_master WHERE type='table' AND name='service_mappings');

-- Query to check rollback history
SELECT
  migration_name,
  migration_version,
  status,
  records_affected,
  datetime(applied_at, 'unixepoch') as applied_time,
  error_message
FROM migration_metadata
WHERE migration_name LIKE '%rollback%'
ORDER BY applied_at DESC;

-- ==============================================================================
-- CLEANUP PROCEDURES
-- ==============================================================================

-- Remove old backup tables (run after successful rollback verification)
-- Uncomment and modify the table names as needed

/*
-- List all backup tables first
SELECT name FROM sqlite_master
WHERE type='table' AND name LIKE '%backup%';

-- Drop specific backup tables (replace with actual names)
-- DROP TABLE IF EXISTS log_entries_backup_1642723200000;
-- DROP TABLE IF EXISTS log_entries_pre_rollback_backup;
*/

-- ==============================================================================
-- EMERGENCY PROCEDURES
-- ==============================================================================

-- If migration_metadata table is corrupted, recreate it
/*
DROP TABLE IF EXISTS migration_metadata;

CREATE TABLE migration_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL,
  migration_version TEXT NOT NULL,
  applied_at INTEGER DEFAULT (unixepoch()),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back')),
  records_affected INTEGER DEFAULT 0,
  error_message TEXT,
  rollback_data JSON
);
*/

-- ==============================================================================
-- INSTRUCTIONS FOR USING ROLLBACK PROCEDURES
-- ==============================================================================

/*
ROLLBACK INSTRUCTIONS:

1. STRATEGY 1 - Simple Reset:
   - Use when migration data is wrong but schema is OK
   - Resets display_name to NULL and category to 'unknown'
   - Safe and non-destructive

2. STRATEGY 2 - Backup Restoration:
   - Use when you have a good backup table
   - Replace 'BACKUP_TABLE_NAME' with actual backup table name
   - Restores original data state

3. STRATEGY 3 - Complete Schema Rollback:
   - Use only as last resort
   - Removes new columns entirely
   - DESTRUCTIVE - will lose all migration work

BEFORE ROLLING BACK:
1. Identify the issue and choose appropriate strategy
2. Create a backup of current state if not already done
3. Verify backup table integrity
4. Test rollback on a copy first if possible

AFTER ROLLING BACK:
1. Run verification queries to confirm rollback success
2. Check that applications still work correctly
3. Plan fixes for original migration issues
4. Clean up backup tables once rollback is verified

TO EXECUTE A ROLLBACK:
1. Choose the appropriate strategy above
2. Uncomment the relevant section
3. Replace placeholder values (like BACKUP_TABLE_NAME)
4. Execute the SQL commands
5. Run verification queries
*/