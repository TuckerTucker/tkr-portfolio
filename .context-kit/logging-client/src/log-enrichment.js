/**
 * Log Enrichment Module
 * Handles adding service metadata to log entries using ServiceNameResolver
 * Provides utilities for enriching log entries with display names, categories,
 * and other service-related metadata while maintaining performance.
 */

const { getServiceNameResolver } = require('./service-name-resolver');
const { getProcessDetector } = require('./process-detector');

/**
 * Log enrichment strategies
 */
const EnrichmentStrategy = {
  MINIMAL: 'minimal',      // Only basic service info
  STANDARD: 'standard',    // Service info + basic metadata
  COMPREHENSIVE: 'comprehensive' // Full metadata enrichment
};

/**
 * Service metadata enricher class
 */
class LogEnricher {
  constructor(options = {}) {
    this.options = {
      strategy: EnrichmentStrategy.STANDARD,
      enableCaching: true,
      cacheSize: 500,
      cacheTtlMs: 30000,
      includeProcessInfo: true,
      includeEnvironmentInfo: false,
      includeTimestamps: true,
      performanceTracking: true,
      ...options
    };

    this.serviceResolver = getServiceNameResolver();
    this.processDetector = getProcessDetector();
    this.cache = new Map();
    this.stats = {
      enrichmentsPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalEnrichmentTime: 0,
      errors: 0,
      startTime: Date.now()
    };

    // Clean cache periodically
    if (this.options.enableCaching) {
      this.setupCacheCleanup();
    }
  }

  /**
   * Main enrichment method - adds service metadata to log entries
   */
  enrichLogEntry(logEntry, context = {}) {
    const startTime = performance.now();
    this.stats.enrichmentsPerformed++;

    try {
      // Start with the base log entry
      const enrichedEntry = { ...logEntry };

      // Resolve service information
      const serviceInfo = this.resolveServiceInfo(context);

      // Add enhanced service fields
      enrichedEntry.service = serviceInfo.service;
      enrichedEntry.display_name = serviceInfo.display_name;
      enrichedEntry.category = serviceInfo.category;

      // Enrich based on strategy
      switch (this.options.strategy) {
        case EnrichmentStrategy.MINIMAL:
          enrichedEntry.metadata = {
            ...logEntry.metadata,
            serviceResolution: {
              confidence: serviceInfo.confidence,
              source: serviceInfo.source
            }
          };
          break;

        case EnrichmentStrategy.STANDARD:
          enrichedEntry.metadata = {
            ...logEntry.metadata,
            ...this.getStandardMetadata(serviceInfo, context)
          };
          break;

        case EnrichmentStrategy.COMPREHENSIVE:
          enrichedEntry.metadata = {
            ...logEntry.metadata,
            ...this.getComprehensiveMetadata(serviceInfo, context)
          };
          break;
      }

      // Add enrichment tracking metadata
      if (this.options.performanceTracking) {
        enrichedEntry.metadata.enrichment = {
          strategy: this.options.strategy,
          processingTime: performance.now() - startTime,
          timestamp: Date.now()
        };
      }

      return enrichedEntry;

    } catch (error) {
      this.stats.errors++;
      console.warn('Log enrichment error:', error);

      // Return original entry with error metadata
      return {
        ...logEntry,
        metadata: {
          ...logEntry.metadata,
          enrichmentError: {
            message: error.message,
            timestamp: Date.now()
          }
        }
      };
    } finally {
      this.stats.totalEnrichmentTime += (performance.now() - startTime);
    }
  }

  /**
   * Resolve service information with caching
   */
  resolveServiceInfo(context = {}) {
    const cacheKey = this.generateCacheKey(context);

    // Check cache first
    if (this.options.enableCaching) {
      const cached = this.getCachedServiceInfo(cacheKey);
      if (cached) {
        this.stats.cacheHits++;
        return cached;
      }
      this.stats.cacheMisses++;
    }

    // Build service context
    const serviceContext = this.buildServiceContext(context);

    // Resolve using ServiceNameResolver
    const resolution = this.serviceResolver.resolveServiceName(serviceContext);

    // Transform to enrichment format
    const serviceInfo = {
      service: resolution.serviceName,
      display_name: resolution.displayName,
      category: resolution.category,
      confidence: resolution.confidence,
      source: resolution.source
    };

    // Cache the result
    if (this.options.enableCaching) {
      this.cacheServiceInfo(cacheKey, serviceInfo);
    }

    return serviceInfo;
  }

  /**
   * Build service context for resolution
   */
  buildServiceContext(context = {}) {
    const processInfo = context.processInfo || this.processDetector.getProcessInfo();
    const packageInfo = context.packageInfo || this.getPackageInfo();

    return {
      processInfo,
      packageInfo,
      environmentVars: context.environmentVars || process.env,
      explicitName: context.explicitName || process.env.TKR_SERVICE_NAME
    };
  }

  /**
   * Get standard metadata for log enrichment
   */
  getStandardMetadata(serviceInfo, context) {
    const metadata = {
      serviceResolution: {
        confidence: serviceInfo.confidence,
        source: serviceInfo.source
      }
    };

    if (this.options.includeProcessInfo) {
      const processInfo = context.processInfo || this.processDetector.getProcessInfo();
      if (processInfo) {
        metadata.process = {
          type: processInfo.type,
          subtype: processInfo.subtype,
          isDevelopment: processInfo.isDevelopment
        };
      }
    }

    if (this.options.includeTimestamps) {
      metadata.timestamps = {
        enriched: Date.now(),
        uptime: process.uptime ? Math.floor(process.uptime() * 1000) : null
      };
    }

    return metadata;
  }

  /**
   * Get comprehensive metadata for log enrichment
   */
  getComprehensiveMetadata(serviceInfo, context) {
    const metadata = this.getStandardMetadata(serviceInfo, context);

    // Add comprehensive process information
    if (this.options.includeProcessInfo) {
      const processInfo = context.processInfo || this.processDetector.getProcessInfo();
      if (processInfo) {
        metadata.process = {
          ...metadata.process,
          command: processInfo.command,
          args: processInfo.args,
          title: processInfo.title,
          pid: process.pid
        };
      }
    }

    // Add environment information if enabled
    if (this.options.includeEnvironmentInfo) {
      metadata.environment = {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        workingDirectory: process.cwd(),
        memoryUsage: process.memoryUsage ? process.memoryUsage() : null
      };
    }

    // Add package information
    const packageInfo = context.packageInfo || this.getPackageInfo();
    if (packageInfo) {
      metadata.package = {
        name: packageInfo.name,
        version: packageInfo.version,
        hasDevDependencies: Boolean(packageInfo.devDependencies),
        hasScripts: Boolean(packageInfo.scripts)
      };
    }

    return metadata;
  }

  /**
   * Generate cache key for service context
   */
  generateCacheKey(context) {
    const keyParts = [
      context.explicitName || process.env.TKR_SERVICE_NAME || '',
      context.processInfo?.type || '',
      context.processInfo?.subtype || '',
      context.packageInfo?.name || ''
    ];
    return keyParts.join('|');
  }

  /**
   * Get cached service info with TTL check
   */
  getCachedServiceInfo(cacheKey) {
    const entry = this.cache.get(cacheKey);
    if (!entry) {
      return null;
    }

    if (Date.now() - entry.timestamp > this.options.cacheTtlMs) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry.value;
  }

  /**
   * Cache service info with TTL
   */
  cacheServiceInfo(cacheKey, serviceInfo) {
    // Implement simple LRU eviction
    if (this.cache.size >= this.options.cacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(cacheKey, {
      value: serviceInfo,
      timestamp: Date.now()
    });
  }

  /**
   * Get package.json information
   */
  getPackageInfo() {
    try {
      const pkg = require(process.cwd() + '/package.json');
      return {
        name: pkg.name,
        version: pkg.version,
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
        scripts: pkg.scripts
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Batch enrich multiple log entries
   */
  enrichLogEntries(logEntries, context = {}) {
    if (!Array.isArray(logEntries)) {
      throw new Error('logEntries must be an array');
    }

    return logEntries.map(entry => this.enrichLogEntry(entry, context));
  }

  /**
   * Setup cache cleanup interval
   */
  setupCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.options.cacheTtlMs) {
          this.cache.delete(key);
        }
      }
    }, this.options.cacheTtlMs);
  }

  /**
   * Get enrichment statistics
   */
  getStats() {
    const runtime = Date.now() - this.stats.startTime;

    return {
      enrichments: this.stats.enrichmentsPerformed,
      cacheHitRate: this.stats.enrichmentsPerformed > 0 ?
        (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) : 0,
      averageEnrichmentTime: this.stats.enrichmentsPerformed > 0 ?
        (this.stats.totalEnrichmentTime / this.stats.enrichmentsPerformed) : 0,
      errorRate: this.stats.enrichmentsPerformed > 0 ?
        (this.stats.errors / this.stats.enrichmentsPerformed) : 0,
      cacheSize: this.cache.size,
      uptime: runtime
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };

    // Clear cache if strategy changed
    if (newConfig.strategy && newConfig.strategy !== this.options.strategy) {
      this.clearCache();
    }
  }

  /**
   * Clear cache and reset stats
   */
  clearCache() {
    this.cache.clear();
    this.stats.cacheHits = 0;
    this.stats.cacheMisses = 0;
  }

  /**
   * Reset all statistics
   */
  resetStats() {
    this.stats = {
      enrichmentsPerformed: 0,
      cacheHits: 0,
      cacheMisses: 0,
      totalEnrichmentTime: 0,
      errors: 0,
      startTime: Date.now()
    };
  }
}

/**
 * Utility functions for common enrichment patterns
 */
const EnrichmentUtils = {
  /**
   * Create enricher with minimal strategy
   */
  createMinimalEnricher(options = {}) {
    return new LogEnricher({
      strategy: EnrichmentStrategy.MINIMAL,
      ...options
    });
  },

  /**
   * Create enricher with standard strategy
   */
  createStandardEnricher(options = {}) {
    return new LogEnricher({
      strategy: EnrichmentStrategy.STANDARD,
      ...options
    });
  },

  /**
   * Create enricher with comprehensive strategy
   */
  createComprehensiveEnricher(options = {}) {
    return new LogEnricher({
      strategy: EnrichmentStrategy.COMPREHENSIVE,
      ...options
    });
  },

  /**
   * Enrich a single log entry (convenience function)
   */
  enrichLog(logEntry, strategy = EnrichmentStrategy.STANDARD, context = {}) {
    const enricher = new LogEnricher({ strategy });
    return enricher.enrichLogEntry(logEntry, context);
  },

  /**
   * Check if log entry has enhanced fields
   */
  isEnhanced(logEntry) {
    return logEntry.display_name && logEntry.category;
  },

  /**
   * Extract service display information from enhanced log
   */
  getServiceDisplayInfo(logEntry) {
    if (!this.isEnhanced(logEntry)) {
      return null;
    }

    return {
      service: logEntry.service,
      displayName: logEntry.display_name,
      category: logEntry.category
    };
  }
};

module.exports = {
  LogEnricher,
  EnrichmentStrategy,
  EnrichmentUtils
};