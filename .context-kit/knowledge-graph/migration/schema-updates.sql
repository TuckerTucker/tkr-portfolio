-- Schema Updates for Service Name Enhancement Migration
-- Phase 1: Add display_name and category columns to log_entries table
-- Adds new columns with proper defaults and constraints for enhanced service identification

-- Enable foreign keys for data integrity
PRAGMA foreign_keys = ON;

-- Begin transaction for atomic schema changes
BEGIN TRANSACTION;

-- Add display_name column for user-friendly service names
-- Default to NULL to identify records that need migration
ALTER TABLE log_entries ADD COLUMN display_name TEXT DEFAULT NULL;

-- Add category column for service categorization
-- Default to 'unknown' for backward compatibility
ALTER TABLE log_entries ADD COLUMN category TEXT DEFAULT 'unknown';

-- Add constraints to ensure category values are valid
-- We'll add this as a check constraint in a future update once data is migrated
-- For now, we'll rely on application-level validation

-- Create performance indexes for new columns
-- Index for category-based filtering (used in dashboard filters)
CREATE INDEX IF NOT EXISTS idx_logs_category ON log_entries(category);

-- Composite index for service and category queries (used in service stats)
CREATE INDEX IF NOT EXISTS idx_logs_service_category ON log_entries(service, category);

-- Index for display_name queries (used in service listings)
CREATE INDEX IF NOT EXISTS idx_logs_display_name ON log_entries(display_name);

-- Composite index for category and timestamp for performance optimization
CREATE INDEX IF NOT EXISTS idx_logs_category_timestamp ON log_entries(category, timestamp);

-- Commit schema changes
COMMIT;

-- Verify indexes were created successfully (comment for reference)
-- Use: SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='log_entries';