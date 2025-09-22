/**
 * Example Usage of Enhanced Logging Client
 * Demonstrates various ways to use the enhanced logging features
 */

// Method 1: Auto-initialization via NODE_OPTIONS (recommended)
// export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
// node your-app.js

// Method 2: Manual initialization
const enhancedLogger = require('./auto-init-enhanced.js');

// Method 3: Direct component usage
const { getProcessDetector } = require('./process-detector');
const { FilterManager } = require('./filter-manager');
const { BatchManager } = require('./batch-manager');
const { MetadataEnricher } = require('./metadata-enricher');

// Examples of enhanced logging usage
function demonstrateEnhancedLogging() {
  console.log('=== Enhanced Logging Examples ===');

  // 1. Basic enhanced logging (if auto-init was successful)
  if (enhancedLogger) {
    enhancedLogger.info('Application started with enhanced logging');
    enhancedLogger.debug('Debug message with automatic enrichment');
    enhancedLogger.warn('Warning with process detection');
    enhancedLogger.error('Error with stack trace', new Error('Sample error'));

    // Child logger for specific component
    const authLogger = enhancedLogger.child('Authentication');
    authLogger.info('User login attempt', { userId: '12345', ip: '192.168.1.100' });

    // Get statistics
    const stats = enhancedLogger.getStats();
    console.log('Logging Statistics:', stats);
  }

  // 2. Process detection examples
  const processDetector = getProcessDetector();
  const processInfo = processDetector.getProcessInfo();
  console.log('Process Detection:', {
    type: processInfo?.type,
    subtype: processInfo?.subtype,
    serviceName: processDetector.getServiceName(),
    isDevelopment: processDetector.isDevelopment(),
    shouldFilter: processDetector.shouldFilter()
  });

  // 3. Filter manager examples
  const filterManager = FilterManager.createPreset('development');
  console.log('Filter Examples:', {
    shouldFilterNodeModules: filterManager.shouldFilter('info', 'node_modules/package/file.js'),
    shouldFilterError: filterManager.shouldFilter('error', 'Application error occurred'),
    shouldFilterDebug: filterManager.shouldFilter('debug', 'Debug information')
  });

  // 4. Batch manager examples
  const batchManager = BatchManager.createFromEnvironment();
  console.log('Batch Manager Config:', batchManager.getConfig());

  // 5. Metadata enricher examples
  const enricher = MetadataEnricher.createPreset('development');
  const enrichedData = enricher.enrichMetadata(
    { customField: 'value' },
    'info',
    'Sample message',
    'ExampleComponent'
  );
  console.log('Enriched Metadata Keys:', Object.keys(enrichedData));

  console.log('=== Environment Variables for Configuration ===');
  console.log(`
  # Logging Level and Filtering
  export TKR_LOG_LEVEL=info                    # debug, info, warn, error, fatal
  export TKR_LOG_PROJECT_ONLY=true             # Only log project files
  export TKR_LOG_FILTER_PRESET=development     # minimal, development, production, strict, debug

  # Batching Configuration
  export TKR_LOG_BATCH_SIZE=10                 # Number of logs per batch
  export TKR_LOG_FLUSH_INTERVAL=5000           # Flush interval in ms
  export TKR_LOG_COMPRESSION=true              # Enable compression for large batches

  # Metadata Enrichment
  export TKR_LOG_METADATA_PRESET=development   # minimal, development, production, performance
  export TKR_LOG_INCLUDE_GIT=true              # Include git information
  export TKR_LOG_INCLUDE_PERFORMANCE=true      # Include performance metrics

  # Output Configuration
  export TKR_LOG_URL=http://localhost:42003    # Logging endpoint URL
  export TKR_LOG_TO_CONSOLE=true               # Also log to console
  export TKR_LOG_SILENT_INIT=false             # Show initialization message

  # Auto-capture Features
  export TKR_LOG_CAPTURE_CONSOLE=true          # Capture console.log/warn/error
  export TKR_LOG_CAPTURE_ERRORS=true           # Capture unhandled errors

  # Debug and Monitoring
  export TKR_LOG_STATS_ENDPOINT=true           # Enable stats logging
  export TKR_LOG_STATS_INTERVAL=30000          # Stats logging interval
  export TKR_LOG_VERBOSE_INIT=true             # Verbose initialization
  `);
}

// Run examples if this file is executed directly
if (require.main === module) {
  demonstrateEnhancedLogging();
}

module.exports = {
  demonstrateEnhancedLogging
};