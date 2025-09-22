/**
 * Simple test for enhanced logging components without auto-initialization
 */

const { getProcessDetector } = require('./process-detector');
const { FilterManager } = require('./filter-manager');
const { BatchManager } = require('./batch-manager');
const { MetadataEnricher } = require('./metadata-enricher');

function testEnhancedComponents() {
  console.log('=== Testing Enhanced Logging Components ===\n');

  // 1. Test Process Detector
  console.log('1. Process Detection:');
  const processDetector = getProcessDetector();
  const processInfo = processDetector.getProcessInfo();
  console.log('  - Process Type:', processInfo?.type || 'unknown');
  console.log('  - Process Subtype:', processInfo?.subtype || 'unknown');
  console.log('  - Service Name:', processDetector.getServiceName());
  console.log('  - Component Name:', processDetector.getComponentName());
  console.log('  - Is Development:', processDetector.isDevelopment());
  console.log('  - Should Filter:', processDetector.shouldFilter());
  console.log('');

  // 2. Test Filter Manager
  console.log('2. Filter Manager:');
  const filterManager = FilterManager.createPreset('development');
  const testMessages = [
    { level: 'info', message: 'node_modules/package/file.js:123 Error', expected: true },
    { level: 'error', message: 'Application error occurred', expected: false },
    { level: 'debug', message: 'webpack compiled successfully', expected: true },
    { level: 'info', message: 'User logged in successfully', expected: false }
  ];

  testMessages.forEach(test => {
    const shouldFilter = filterManager.shouldFilter(test.level, test.message);
    const status = shouldFilter === test.expected ? '✓' : '✗';
    console.log(`  ${status} "${test.message.substring(0, 40)}..." - Filter: ${shouldFilter}`);
  });

  const filterStats = filterManager.getStats();
  console.log(`  - Filter Stats: ${filterStats.totalLogs} total, ${filterStats.filteredLogs} filtered`);
  console.log('');

  // 3. Test Batch Manager
  console.log('3. Batch Manager:');
  const batchManager = BatchManager.createFromEnvironment({
    batchSize: 3,
    flushInterval: 1000
  });

  console.log('  - Config:', {
    batchSize: batchManager.getConfig().batchSize,
    flushInterval: batchManager.getConfig().flushInterval,
    maxRetries: batchManager.getConfig().maxRetries
  });

  // Add test logs
  for (let i = 0; i < 5; i++) {
    batchManager.add({
      timestamp: Math.floor(Date.now() / 1000),
      level: 'INFO',
      service: 'test-service',
      message: `Test log message ${i + 1}`,
      metadata: { testId: i + 1 },
      component: 'TestComponent'
    });
  }

  const batchStats = batchManager.getStats();
  console.log('  - Batch Stats:', {
    totalLogs: batchStats.totalLogs,
    currentBatchSize: batchStats.currentBatchSize,
    batchesSent: batchStats.batchesSent
  });
  console.log('');

  // 4. Test Metadata Enricher
  console.log('4. Metadata Enricher:');
  const enricher = MetadataEnricher.createPreset('development');
  const originalMetadata = { customField: 'test-value', userId: '12345' };
  const enrichedMetadata = enricher.enrichMetadata(
    originalMetadata,
    'info',
    'Test log message for enrichment',
    'TestComponent'
  );

  console.log('  - Original keys:', Object.keys(originalMetadata));
  console.log('  - Enriched keys:', Object.keys(enrichedMetadata));
  console.log('  - Added context:', {
    hasLogContext: !!enrichedMetadata.logContext,
    hasProcessInfo: !!enrichedMetadata.process,
    hasEnvironment: !!enrichedMetadata.environment,
    hasGitInfo: !!enrichedMetadata.git,
    hasPackageInfo: !!enrichedMetadata.package,
    hasPerformance: !!enrichedMetadata.performance
  });
  console.log('');

  // 5. Environment Variables Help
  console.log('5. Environment Variables for Configuration:');
  console.log(`
  # Basic Configuration
  export TKR_LOG_LEVEL=info                    # Log level filter
  export TKR_LOG_BATCH_SIZE=10                 # Batch size
  export TKR_LOG_FLUSH_INTERVAL=5000           # Flush interval (ms)
  export TKR_LOG_URL=http://localhost:42003    # Backend URL

  # Filter Presets
  export TKR_LOG_FILTER_PRESET=development     # minimal, development, production, strict, debug
  export TKR_LOG_PROJECT_ONLY=true             # Only project files

  # Metadata Presets
  export TKR_LOG_METADATA_PRESET=development   # minimal, development, production, performance

  # Auto-initialization
  export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
  `);

  // Cleanup
  batchManager.destroy();

  console.log('=== Test Complete ===');
}

// Run test if this file is executed directly
if (require.main === module) {
  testEnhancedComponents();
}

module.exports = {
  testEnhancedComponents
};