-- Complete Service Name Enhancement Migration
-- Comprehensive migration script for database schema and service mappings
-- This script creates the service_mappings table and prepares for data migration

-- Enable foreign keys and performance optimizations
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- Begin transaction for atomic migration
BEGIN TRANSACTION;

-- ==============================================================================
-- STEP 1: Create backup tables for safety
-- ==============================================================================

-- Create backup of log_entries before migration
CREATE TABLE IF NOT EXISTS log_entries_backup AS
SELECT * FROM log_entries WHERE 1=0; -- Structure only initially

-- Insert current data into backup (this will be populated during migration)
-- This provides rollback capability

-- ==============================================================================
-- STEP 2: Create service_mappings table for centralized service configuration
-- ==============================================================================

CREATE TABLE IF NOT EXISTS service_mappings (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(2))) || '-' || lower(hex(randomblob(6)))),

  -- Service identification
  process_type TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  category TEXT NOT NULL,

  -- Pattern matching for process detection
  process_patterns JSON NOT NULL,

  -- Metadata
  description TEXT,
  priority INTEGER DEFAULT 50, -- Lower numbers = higher priority
  is_active BOOLEAN DEFAULT 1,

  -- Timestamps
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch()),

  -- Constraints
  CHECK (length(process_type) > 0),
  CHECK (length(service_name) > 0),
  CHECK (length(display_name) > 0),
  CHECK (category IN ('terminal', 'dev-server', 'build-tool', 'test-runner', 'api-service', 'unknown')),
  CHECK (priority >= 0 AND priority <= 100)
);

-- ==============================================================================
-- STEP 3: Create indexes for service_mappings performance
-- ==============================================================================

-- Primary lookup index for process type matching
CREATE INDEX IF NOT EXISTS idx_service_mappings_type ON service_mappings(process_type);

-- Category-based filtering index
CREATE INDEX IF NOT EXISTS idx_service_mappings_category ON service_mappings(category);

-- Priority-based ordering index
CREATE INDEX IF NOT EXISTS idx_service_mappings_priority ON service_mappings(priority DESC, process_type);

-- Active mappings index for performance
CREATE INDEX IF NOT EXISTS idx_service_mappings_active ON service_mappings(is_active, priority DESC);

-- ==============================================================================
-- STEP 4: Insert default service mappings from Agent 4's configuration
-- ==============================================================================

-- Terminal services
INSERT OR IGNORE INTO service_mappings (
  process_type, service_name, display_name, category, process_patterns, description, priority
) VALUES
(
  'terminal', 'terminal', 'Terminal Session', 'terminal',
  '["Terminal.app", "iTerm.app", "zsh", "bash", "fish", "Session"]',
  'Terminal applications and shell sessions', 10
),

-- Development servers
('vite-dev', 'vite-dev', 'Vite Development Server', 'dev-server',
 '["vite", "dev", "npm.*run.*dev", "yarn.*dev"]',
 'Vite development server processes', 20),

('next-dev', 'next-dev', 'Next.js Development Server', 'dev-server',
 '["next.*dev", "npm.*run.*next", "yarn.*next"]',
 'Next.js development server processes', 20),

('react-dev', 'react-dev', 'React Development Server', 'dev-server',
 '["react-scripts.*start", "npm.*start", "yarn.*start"]',
 'React development server processes', 20),

-- API services
('api-server', 'api-server', 'API Server', 'api-service',
 '["express", "fastify", "koa", "hapi", "api"]',
 'API server processes', 30),

('context-kit-api', 'context-kit-api', 'Context Kit API', 'api-service',
 '["knowledge-graph", "context.*kit.*api"]',
 'Context Kit API server processes', 25),

-- Build tools
('typescript', 'typescript', 'TypeScript Compiler', 'build-tool',
 '["tsc", "typescript", "ts-node"]',
 'TypeScript compilation processes', 40),

('webpack', 'webpack', 'Webpack Build', 'build-tool',
 '["webpack", "wp-", "webpack-dev-server"]',
 'Webpack build processes', 40),

('rollup', 'rollup', 'Rollup Build', 'build-tool',
 '["rollup", "rollup-plugin"]',
 'Rollup build processes', 40),

-- Test runners
('jest', 'jest', 'Jest Test Runner', 'test-runner',
 '["jest", "npm.*test", "yarn.*test"]',
 'Jest testing framework processes', 50),

('vitest', 'vitest', 'Vitest Test Runner', 'test-runner',
 '["vitest", "vite.*test"]',
 'Vitest testing framework processes', 50),

('cypress', 'cypress', 'Cypress E2E Tests', 'test-runner',
 '["cypress", "cy:.*"]',
 'Cypress end-to-end testing processes', 50),

-- Package managers
('npm', 'npm', 'NPM Package Manager', 'build-tool',
 '["npm", "npx"]',
 'NPM package manager processes', 60),

('yarn', 'yarn', 'Yarn Package Manager', 'build-tool',
 '["yarn", "yarnpkg"]',
 'Yarn package manager processes', 60),

-- Unknown fallback
('unknown', 'unknown', 'Unknown Service', 'unknown',
 '[".*"]',
 'Fallback for unidentified processes', 100);

-- ==============================================================================
-- STEP 5: Create migration metadata table for tracking
-- ==============================================================================

CREATE TABLE IF NOT EXISTS migration_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL,
  migration_version TEXT NOT NULL,
  applied_at INTEGER DEFAULT (unixepoch()),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'rolled_back')),
  records_affected INTEGER DEFAULT 0,
  error_message TEXT,
  rollback_data JSON
);

-- Record this migration
INSERT INTO migration_metadata (migration_name, migration_version, status)
VALUES ('service-name-enhancement', '1.0.0', 'pending');

-- ==============================================================================
-- STEP 6: Create views for migration monitoring
-- ==============================================================================

-- View to check migration progress
CREATE VIEW IF NOT EXISTS migration_progress AS
SELECT
  COUNT(*) as total_log_entries,
  COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) as entries_with_display_name,
  COUNT(CASE WHEN category != 'unknown' THEN 1 END) as entries_with_category,
  ROUND(
    COUNT(CASE WHEN display_name IS NOT NULL THEN 1 END) * 100.0 / COUNT(*),
    2
  ) as migration_percentage
FROM log_entries;

-- View to analyze service distribution before/after migration
CREATE VIEW IF NOT EXISTS service_analysis AS
SELECT
  service as original_service,
  display_name,
  category,
  COUNT(*) as log_count,
  MIN(timestamp) as first_log,
  MAX(timestamp) as last_log
FROM log_entries
GROUP BY service, display_name, category
ORDER BY log_count DESC;

-- View to check service mapping utilization
CREATE VIEW IF NOT EXISTS mapping_utilization AS
SELECT
  sm.process_type,
  sm.display_name,
  sm.category,
  COUNT(le.id) as logs_matched,
  sm.is_active
FROM service_mappings sm
LEFT JOIN log_entries le ON (
  le.service LIKE '%' || sm.service_name || '%' OR
  le.display_name = sm.display_name
)
GROUP BY sm.id
ORDER BY logs_matched DESC;

-- Commit the schema changes and initial setup
COMMIT;

-- ==============================================================================
-- VERIFICATION QUERIES
-- ==============================================================================

-- Check that tables were created successfully
SELECT name FROM sqlite_master WHERE type='table' AND name IN ('service_mappings', 'migration_metadata');

-- Check service_mappings data
SELECT COUNT(*) as mapping_count FROM service_mappings WHERE is_active = 1;

-- Check migration readiness
SELECT * FROM migration_progress;

-- Display mapping categories for verification
SELECT category, COUNT(*) as mapping_count
FROM service_mappings
WHERE is_active = 1
GROUP BY category
ORDER BY mapping_count DESC;