/**
 * Enhanced Logger with Service Name Resolution Integration
 * Integrates ServiceNameResolver into the logging pipeline to produce enhanced log entries
 * with display_name and category fields while maintaining backwards compatibility.
 */

const { getServiceNameResolver } = require('./service-name-resolver');
const { getProcessDetector } = require('./process-detector');

/**
 * Performance cache for service resolution to meet < 1ms requirement
 */
class ServiceResolutionCache {
  constructor(maxSize = 1000, ttlMs = 60000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttlMs = ttlMs;
    this.hitCount = 0;
    this.missCount = 0;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.missCount++;
      return null;
    }

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }

    this.hitCount++;
    return entry.value;
  }

  set(key, value) {
    // Implement LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }

  getStats() {
    const total = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      hitRate: total > 0 ? (this.hitCount / total) : 0,
      hitCount: this.hitCount,
      missCount: this.missCount
    };
  }
}

/**
 * Enhanced Logger class that integrates ServiceNameResolver into logging flow
 */
class EnhancedLogger {
  constructor(baseLogger, options = {}) {
    this.baseLogger = baseLogger;
    this.options = {
      enableServiceResolution: true,
      enableCaching: true,
      cacheSize: 1000,
      cacheTtlMs: 60000,
      fallbackToBasic: true,
      performanceTracking: true,
      ...options
    };

    // Initialize components
    this.serviceResolver = getServiceNameResolver();
    this.processDetector = getProcessDetector();
    this.cache = new ServiceResolutionCache(
      this.options.cacheSize,
      this.options.cacheTtlMs
    );

    // Performance tracking
    this.stats = {
      logsProcessed: 0,
      resolutionTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      startTime: Date.now()
    };

    // Initialize default service context
    this.defaultServiceContext = this.buildServiceContext();
  }

  /**
   * Build service context for resolution
   */
  buildServiceContext() {
    try {
      const processInfo = this.processDetector.getProcessInfo();
      const packageInfo = this.getPackageInfo();

      return {
        processInfo,
        packageInfo,
        environmentVars: process.env,
        explicitName: process.env.TKR_SERVICE_NAME || null
      };
    } catch (error) {
      console.warn('Error building service context:', error);
      return {};
    }
  }

  /**
   * Get package.json information if available
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
   * Resolve service information with caching for performance
   */
  resolveServiceInfo(context = null) {
    const startTime = performance.now();

    try {
      // Use provided context or default
      const serviceContext = context || this.defaultServiceContext;

      // Generate cache key
      const cacheKey = this.generateCacheKey(serviceContext);

      // Check cache first
      if (this.options.enableCaching) {
        const cached = this.cache.get(cacheKey);
        if (cached) {
          this.stats.cacheHits++;
          return cached;
        }
        this.stats.cacheMisses++;
      }

      // Resolve service name
      const resolution = this.serviceResolver.resolveServiceName(serviceContext);

      // Transform to enhanced log format
      const serviceInfo = {
        service: resolution.serviceName,
        display_name: resolution.displayName,
        category: resolution.category,
        confidence: resolution.confidence,
        source: resolution.source
      };

      // Cache the result
      if (this.options.enableCaching) {
        this.cache.set(cacheKey, serviceInfo);
      }

      return serviceInfo;

    } catch (error) {
      this.stats.errors++;
      console.warn('Service resolution error:', error);

      // Fallback to basic service info
      return this.getFallbackServiceInfo();
    } finally {
      const duration = performance.now() - startTime;
      this.stats.resolutionTime += duration;

      // Warn if resolution takes too long
      if (duration > 1) {
        console.warn(`Service resolution took ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Generate cache key for service context
   */
  generateCacheKey(context) {
    const keyParts = [
      context.explicitName || '',
      context.processInfo?.type || '',
      context.processInfo?.subtype || '',
      context.packageInfo?.name || ''
    ];
    return keyParts.join('|');
  }

  /**
   * Get fallback service info when resolution fails
   */
  getFallbackServiceInfo() {
    const baseServiceName = this.baseLogger?.config?.service || 'unknown-service';

    return {
      service: baseServiceName,
      display_name: this.formatDisplayName(baseServiceName),
      category: 'unknown',
      confidence: 0.1,
      source: 'fallback'
    };
  }

  /**
   * Format display name from service name
   */
  formatDisplayName(serviceName) {
    return serviceName
      .split(/[-_]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  /**
   * Create enhanced log entry with service resolution
   */
  createEnhancedLogEntry(level, message, metadata = {}, component = '') {
    this.stats.logsProcessed++;

    const startTime = performance.now();

    try {
      // Resolve service information
      const serviceInfo = this.resolveServiceInfo();

      // Create enhanced log entry with all required fields
      const enhancedEntry = {
        id: this.generateLogId(),
        timestamp: Date.now(),
        level: level.toLowerCase(),
        service: serviceInfo.service,
        display_name: serviceInfo.display_name,  // NEW - User-friendly name
        category: serviceInfo.category,          // NEW - Service category
        message,
        metadata: {
          ...metadata,
          serviceResolution: {
            confidence: serviceInfo.confidence,
            source: serviceInfo.source
          },
          component: component || this.baseLogger?.config?.defaultSource || 'enhanced-logger',
          processingTime: performance.now() - startTime
        }
      };

      return enhancedEntry;

    } catch (error) {
      this.stats.errors++;
      console.warn('Error creating enhanced log entry:', error);

      // Fallback to basic log entry
      return {
        id: this.generateLogId(),
        timestamp: Date.now(),
        level: level.toLowerCase(),
        service: this.baseLogger?.config?.service || 'unknown-service',
        display_name: 'Unknown Service',
        category: 'unknown',
        message,
        metadata: {
          ...metadata,
          error: 'Failed to enhance log entry',
          component: component || 'enhanced-logger'
        }
      };
    }
  }

  /**
   * Generate unique log ID
   */
  generateLogId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Enhanced logging methods that delegate to base logger with enhanced entries
   */
  debug(message, metadata = {}, component = '') {
    const enhancedEntry = this.createEnhancedLogEntry('debug', message, metadata, component);
    this.delegateToBaseLogger('debug', enhancedEntry);
  }

  info(message, metadata = {}, component = '') {
    const enhancedEntry = this.createEnhancedLogEntry('info', message, metadata, component);
    this.delegateToBaseLogger('info', enhancedEntry);
  }

  warn(message, metadata = {}, component = '') {
    const enhancedEntry = this.createEnhancedLogEntry('warn', message, metadata, component);
    this.delegateToBaseLogger('warn', enhancedEntry);
  }

  error(message, error, metadata = {}, component = '') {
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
    const enhancedEntry = this.createEnhancedLogEntry('error', message, errorMetadata, component);
    this.delegateToBaseLogger('error', enhancedEntry);
  }

  fatal(message, error, metadata = {}, component = '') {
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
    const enhancedEntry = this.createEnhancedLogEntry('fatal', message, errorMetadata, component);
    this.delegateToBaseLogger('fatal', enhancedEntry);
  }

  /**
   * Delegate to base logger while maintaining compatibility
   */
  delegateToBaseLogger(level, enhancedEntry) {
    try {
      if (this.baseLogger && typeof this.baseLogger[level] === 'function') {
        // Pass enhanced entry metadata to base logger
        this.baseLogger[level](
          enhancedEntry.message,
          enhancedEntry.metadata,
          enhancedEntry.metadata.component
        );
      } else {
        // Fallback to console if base logger unavailable
        const consoleMethod = level === 'fatal' ? 'error' : level;
        if (console[consoleMethod]) {
          console[consoleMethod](
            `[${level.toUpperCase()}] ${enhancedEntry.display_name}/${enhancedEntry.metadata.component}: ${enhancedEntry.message}`,
            enhancedEntry.metadata
          );
        }
      }
    } catch (error) {
      console.error('Error delegating to base logger:', error);
    }
  }

  /**
   * Create child logger with component context
   */
  child(component) {
    return new EnhancedComponentLogger(this, component);
  }

  /**
   * Get comprehensive statistics
   */
  getStats() {
    const runtime = Date.now() - this.stats.startTime;
    const cacheStats = this.cache.getStats();

    return {
      enhanced: {
        ...this.stats,
        averageResolutionTime: this.stats.logsProcessed > 0 ?
          (this.stats.resolutionTime / this.stats.logsProcessed) : 0
      },
      cache: cacheStats,
      runtime: {
        uptime: runtime,
        logsPerSecond: runtime > 0 ? (this.stats.logsProcessed / (runtime / 1000)) : 0,
        errorRate: this.stats.logsProcessed > 0 ?
          (this.stats.errors / this.stats.logsProcessed) : 0
      }
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig) {
    this.options = { ...this.options, ...newConfig };

    if (newConfig.clearCache) {
      this.cache.clear();
    }

    if (newConfig.rebuildContext) {
      this.defaultServiceContext = this.buildServiceContext();
    }
  }

  /**
   * Clear cache and reset stats
   */
  reset() {
    this.cache.clear();
    this.stats = {
      logsProcessed: 0,
      resolutionTime: 0,
      cacheHits: 0,
      cacheMisses: 0,
      errors: 0,
      startTime: Date.now()
    };
  }
}

/**
 * Enhanced component logger for scoped logging
 */
class EnhancedComponentLogger {
  constructor(parent, component) {
    this.parent = parent;
    this.component = component;
  }

  debug(message, metadata = {}) {
    this.parent.debug(message, metadata, this.component);
  }

  info(message, metadata = {}) {
    this.parent.info(message, metadata, this.component);
  }

  warn(message, metadata = {}) {
    this.parent.warn(message, metadata, this.component);
  }

  error(message, error, metadata = {}) {
    this.parent.error(message, error, metadata, this.component);
  }

  fatal(message, error, metadata = {}) {
    this.parent.fatal(message, error, metadata, this.component);
  }

  child(subComponent) {
    const combinedComponent = `${this.component}/${subComponent}`;
    return new EnhancedComponentLogger(this.parent, combinedComponent);
  }
}

/**
 * Factory function to create enhanced logger
 */
function createEnhancedLogger(baseLogger, options = {}) {
  return new EnhancedLogger(baseLogger, options);
}

module.exports = {
  EnhancedLogger,
  EnhancedComponentLogger,
  ServiceResolutionCache,
  createEnhancedLogger
};