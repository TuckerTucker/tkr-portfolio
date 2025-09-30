/**
 * Enhanced Auto-Initialization for tkr-context-kit logging (v2.0 - Core Module)
 * Smart process detection, filtering, batching, and metadata enrichment
 * Now uses unified core module LoggingService
 * Usage: NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
 */

const { createAutoTkrLogger } = require('../dist/index.js');
const { getProcessDetector } = require('./process-detector');
const { FilterManager } = require('./filter-manager');
const { BatchManager } = require('./batch-manager');
const { MetadataEnricher } = require('./metadata-enricher');
const { createEnhancedLogger } = require('./enhanced-logger');
const { LogEnricher, EnrichmentStrategy } = require('./log-enrichment');

class EnhancedTkrLogger {
  constructor(baseLogger, options = {}) {
    this.baseLogger = baseLogger;
    this.options = options;

    // Initialize enhanced components
    this.processDetector = getProcessDetector();
    this.filterManager = this.createFilterManager();
    this.batchManager = this.createBatchManager();
    this.metadataEnricher = this.createMetadataEnricher();

    // Initialize service name resolution components
    this.enhancedLogger = createEnhancedLogger(baseLogger, {
      enableServiceResolution: options.enableServiceResolution !== false,
      enableCaching: options.enableCaching !== false,
      performanceTracking: options.performanceTracking !== false
    });
    this.logEnricher = new LogEnricher({
      strategy: options.enrichmentStrategy || EnrichmentStrategy.STANDARD,
      enableCaching: options.enableCaching !== false
    });

    // Performance tracking
    this.stats = {
      logsProcessed: 0,
      logsFiltered: 0,
      logsBatched: 0,
      startTime: Date.now()
    };

    // Setup shutdown handling
    this.setupShutdownHandling();
  }

  /**
   * Create filter manager with environment-based configuration
   */
  createFilterManager() {
    const env = process.env || {};
    const isDevelopment = this.processDetector.isDevelopment();

    // Determine filter preset based on environment
    let preset = 'development';
    if (!isDevelopment) {
      preset = 'production';
    }

    // Override with explicit configuration
    if (env.TKR_LOG_FILTER_PRESET) {
      preset = env.TKR_LOG_FILTER_PRESET;
    }

    const options = {
      enableNodeModulesFilter: env.TKR_LOG_FILTER_NODE_MODULES !== 'false',
      enableBuildToolFilter: env.TKR_LOG_FILTER_BUILD_TOOLS !== 'false',
      enableDevelopmentFilter: env.TKR_LOG_FILTER_DEV_NOISE !== 'false',
      projectOnlyMode: env.TKR_LOG_PROJECT_ONLY === 'true',
      minLogLevel: env.TKR_LOG_LEVEL || null
    };

    return FilterManager.createPreset(preset, options);
  }

  /**
   * Create batch manager with environment-based configuration
   */
  createBatchManager() {
    return BatchManager.createFromEnvironment({
      // Override with any specific options if needed
    });
  }

  /**
   * Create metadata enricher with environment-based configuration
   */
  createMetadataEnricher() {
    const env = process.env || {};
    const isDevelopment = this.processDetector.isDevelopment();

    // Determine enricher preset
    let preset = isDevelopment ? 'development' : 'production';
    if (env.TKR_LOG_METADATA_PRESET) {
      preset = env.TKR_LOG_METADATA_PRESET;
    }

    const options = {
      includeGitInfo: env.TKR_LOG_INCLUDE_GIT !== 'false',
      includePackageInfo: env.TKR_LOG_INCLUDE_PACKAGE !== 'false',
      includePerformanceInfo: env.TKR_LOG_INCLUDE_PERFORMANCE === 'true',
      includeStackTrace: env.TKR_LOG_INCLUDE_STACK !== 'false'
    };

    return MetadataEnricher.createPreset(preset, options);
  }

  /**
   * Enhanced logging method that applies filtering, enrichment, and batching
   * Now uses ServiceNameResolver for enhanced service identification
   */
  log(level, message, metadata = {}, component = '') {
    this.stats.logsProcessed++;

    // Quick exit if process should be filtered
    if (this.processDetector.shouldFilter()) {
      this.stats.logsFiltered++;
      return;
    }

    // Apply filtering
    if (this.filterManager.shouldFilter(level, message, metadata, component)) {
      this.stats.logsFiltered++;
      return;
    }

    // Create base log entry
    const baseLogEntry = {
      timestamp: Date.now(),
      level: level.toLowerCase(),
      message,
      metadata: metadata
    };

    // Enrich log entry with service name resolution
    const enrichedLogEntry = this.logEnricher.enrichLogEntry(baseLogEntry, {
      component: component
    });

    // Enrich metadata using existing enricher
    const enrichedMetadata = this.metadataEnricher.enrichMetadata(
      enrichedLogEntry.metadata,
      level,
      message,
      component
    );

    // Prepare enhanced log data for batching (core module format with display fields)
    const logData = {
      timestamp: enrichedLogEntry.timestamp,
      level: enrichedLogEntry.level,
      service: enrichedLogEntry.service,               // Technical service name
      display_name: enrichedLogEntry.display_name,     // NEW - User-friendly display name
      category: enrichedLogEntry.category,             // NEW - Service category
      source: component || this.baseLogger.config.defaultSource || 'enhanced',
      message: enrichedLogEntry.message,
      metadata: {
        ...enrichedMetadata,
        serviceType: this.baseLogger.config.serviceType,
        originalComponent: component || this.baseLogger.config.defaultSource,
        serviceResolution: enrichedLogEntry.metadata.serviceResolution
      }
    };

    // Send through batch manager
    this.batchManager.add(logData);
    this.stats.logsBatched++;

    // Also log to console if enabled (for immediate feedback with enhanced display)
    if (this.baseLogger.config.logToConsole) {
      const consoleMethod = level === 'fatal' ? 'error' : level;
      if (console[consoleMethod]) {
        console[consoleMethod](
          `[${level.toUpperCase()}] ${logData.display_name}/${logData.source}: ${message}`,
          metadata
        );
      }
    }
  }

  /**
   * Delegate logging methods to enhanced log function
   */
  debug(message, metadata, component) {
    this.log('debug', message, metadata, component);
  }

  info(message, metadata, component) {
    this.log('info', message, metadata, component);
  }

  warn(message, metadata, component) {
    this.log('warn', message, metadata, component);
  }

  error(message, error, metadata, component) {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.log('error', message, errorMetadata, component);
  }

  fatal(message, error, metadata, component) {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.log('fatal', message, errorMetadata, component);
  }

  /**
   * Create a child logger
   */
  child(component) {
    return new EnhancedComponentLogger(this, component);
  }

  /**
   * Get comprehensive statistics including service resolution metrics
   */
  getStats() {
    const now = Date.now();
    const runtime = now - this.stats.startTime;

    return {
      enhanced: this.stats,
      filter: this.filterManager.getStats(),
      batch: this.batchManager.getStats(),
      process: this.processDetector.getProcessInfo(),
      serviceResolution: this.enhancedLogger ? this.enhancedLogger.getStats() : null,
      logEnrichment: this.logEnricher ? this.logEnricher.getStats() : null,
      runtime: {
        uptime: runtime,
        logsPerSecond: runtime > 0 ? (this.stats.logsProcessed / (runtime / 1000)) : 0,
        filterRate: this.stats.logsProcessed > 0 ? (this.stats.logsFiltered / this.stats.logsProcessed) : 0
      }
    };
  }

  /**
   * Setup graceful shutdown handling
   */
  setupShutdownHandling() {
    if (typeof process !== 'undefined') {
      const shutdownHandler = async () => {
        try {
          await this.batchManager.destroy();
        } catch (error) {
          console.warn('Error during logging shutdown:', error);
        }
      };

      process.on('SIGINT', shutdownHandler);
      process.on('SIGTERM', shutdownHandler);
      process.on('beforeExit', shutdownHandler);
    }
  }

  /**
   * Force flush all pending logs
   */
  async flush() {
    await this.batchManager.flush();
  }

  /**
   * Update configuration including service resolution settings
   */
  updateConfig(newConfig) {
    if (newConfig.filter) {
      this.filterManager.updateConfig(newConfig.filter);
    }
    if (newConfig.batch) {
      this.batchManager.updateConfig(newConfig.batch);
    }
    if (newConfig.metadata) {
      this.metadataEnricher.updateConfig(newConfig.metadata);
    }
    if (newConfig.serviceResolution && this.enhancedLogger) {
      this.enhancedLogger.updateConfig(newConfig.serviceResolution);
    }
    if (newConfig.logEnrichment && this.logEnricher) {
      this.logEnricher.updateConfig(newConfig.logEnrichment);
    }
  }
}

/**
 * Enhanced component logger
 */
class EnhancedComponentLogger {
  constructor(parent, component) {
    this.parent = parent;
    this.component = component;
  }

  debug(message, metadata) {
    this.parent.debug(message, metadata, this.component);
  }

  info(message, metadata) {
    this.parent.info(message, metadata, this.component);
  }

  warn(message, metadata) {
    this.parent.warn(message, metadata, this.component);
  }

  error(message, error, metadata) {
    this.parent.error(message, error, metadata, this.component);
  }

  fatal(message, error, metadata) {
    this.parent.fatal(message, error, metadata, this.component);
  }
}

// Initialize enhanced logging
function initializeEnhancedLogging() {
  try {
    const processDetector = getProcessDetector();
    const processInfo = processDetector.getProcessInfo();

    // Skip initialization if process should be filtered
    if (processDetector.shouldFilter()) {
      return null;
    }

    // Auto-detect service information
    const serviceName = processDetector.getServiceName('AutoDetectedService');
    const componentName = processDetector.getComponentName();

    // Determine service type
    let serviceType = 'backend'; // default
    if (typeof window !== 'undefined') {
      serviceType = 'frontend';
    } else if (processInfo?.type === 'test-runner') {
      serviceType = 'test';
    } else if (processInfo?.type === 'build-tool') {
      serviceType = 'build';
    } else if (processInfo?.type === 'dev-server') {
      serviceType = 'dev-server';
    }

    // Create base logger (disable console capture to prevent recursion with enhanced logger)
    const baseLogger = createAutoTkrLogger({
      service: serviceName,
      serviceType: serviceType,
      defaultSource: componentName,
      baseUrl: process.env.TKR_LOG_URL || 'http://localhost:42003',
      failSilently: process.env.TKR_LOG_FAIL_SILENTLY !== 'false',
      logToConsole: process.env.TKR_LOG_TO_CONSOLE !== 'false',
      minLevel: process.env.TKR_LOG_LEVEL || 'debug',
      useHttpTransport: process.env.TKR_LOG_USE_HTTP !== 'false', // Default to HTTP for Node.js
      autoCapture: {
        console: false, // Disabled to prevent recursion - enhanced logger handles this
        unhandledErrors: process.env.TKR_LOG_CAPTURE_ERRORS !== 'false',
        express: serviceType === 'backend' && process.env.TKR_LOG_CAPTURE_EXPRESS !== 'false',
        react: serviceType === 'frontend' && process.env.TKR_LOG_CAPTURE_REACT !== 'false'
      }
    });

    // Create enhanced logger
    const enhancedLogger = new EnhancedTkrLogger(baseLogger);

    // Log initialization
    const shouldLogInit = process.env.TKR_LOG_SILENT_INIT !== 'true';
    if (shouldLogInit) {
      console.log(
        `🚀 Enhanced tkr-context-kit logging initialized for "${serviceName}" (${serviceType})`
      );

      // Log process information in development
      if (processDetector.isDevelopment() && process.env.TKR_LOG_VERBOSE_INIT === 'true') {
        console.log('📊 Process Info:', {
          type: processInfo?.type,
          subtype: processInfo?.subtype,
          command: processInfo?.command,
          isDevelopment: processInfo?.isDevelopment
        });
      }
    }

    return enhancedLogger;
  } catch (error) {
    console.error('Failed to initialize enhanced logging:', error);
    return null;
  }
}

// Initialize and expose the logger
const enhancedLogger = initializeEnhancedLogging();

// Global error handler for unhandled logging errors
if (typeof process !== 'undefined') {
  process.on('uncaughtException', (error) => {
    if (enhancedLogger && error.message?.includes('logging')) {
      console.error('Logging system error:', error);
    } else {
      throw error; // Re-throw non-logging errors
    }
  });
}

// Export for use in other modules
module.exports = enhancedLogger;

// Also make it available globally for convenience
if (typeof global !== 'undefined') {
  global.tkrLogger = enhancedLogger;
}

// Provide statistics endpoint for debugging
if (enhancedLogger && process.env.TKR_LOG_STATS_ENDPOINT === 'true') {
  setInterval(() => {
    if (process.env.TKR_LOG_STATS_INTERVAL) {
      const stats = enhancedLogger.getStats();
      console.log('📈 Logging Stats:', {
        processed: stats.enhanced.logsProcessed,
        filtered: stats.enhanced.logsFiltered,
        batched: stats.enhanced.logsBatched,
        filterRate: `${(stats.runtime.filterRate * 100).toFixed(1)}%`,
        logsPerSecond: stats.runtime.logsPerSecond.toFixed(1)
      });
    }
  }, parseInt(process.env.TKR_LOG_STATS_INTERVAL) || 30000);
}