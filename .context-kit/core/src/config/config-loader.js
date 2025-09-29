/**
 * Configuration Loader with Hot-Reload Capability
 * Loads and manages service name mappings with real-time updates
 */

const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const { EventEmitter } = require('events');

class ConfigLoader extends EventEmitter {
  constructor(configPath = null) {
    super();

    this.configPath = configPath || path.join(__dirname, 'service-mappings.yaml');
    this.config = null;
    this.watcher = null;
    this.isLoaded = false;
    this.loadStartTime = null;

    // Cache for resolved configurations
    this.cache = new Map();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      hitRatio: 0
    };

    // Performance tracking
    this.metrics = {
      loadTimes: [],
      avgLoadTime: 0,
      lastLoadTime: 0,
      reloadCount: 0
    };
  }

  /**
   * Load configuration from YAML file
   * Meets performance requirement: < 10ms on startup
   */
  async load() {
    this.loadStartTime = process.hrtime.bigint();

    try {
      if (!fs.existsSync(this.configPath)) {
        throw new Error(`Configuration file not found: ${this.configPath}`);
      }

      const configContent = fs.readFileSync(this.configPath, 'utf8');
      this.config = yaml.parse(configContent);

      // Validate basic structure
      if (!this.config || !this.config.service_name_mappings) {
        throw new Error('Invalid configuration structure: missing service_name_mappings');
      }

      this.isLoaded = true;
      this.cache.clear(); // Clear cache on reload

      // Track performance
      const loadTime = Number(process.hrtime.bigint() - this.loadStartTime) / 1_000_000; // Convert to ms
      this.metrics.lastLoadTime = loadTime;
      this.metrics.loadTimes.push(loadTime);
      this.metrics.avgLoadTime = this.metrics.loadTimes.reduce((a, b) => a + b, 0) / this.metrics.loadTimes.length;

      // Keep only last 100 load times for average calculation
      if (this.metrics.loadTimes.length > 100) {
        this.metrics.loadTimes = this.metrics.loadTimes.slice(-100);
      }

      this.emit('loaded', {
        path: this.configPath,
        loadTime,
        mappingCount: Object.keys(this.config.service_name_mappings).length
      });

      console.log(`Configuration loaded in ${loadTime.toFixed(2)}ms from ${this.configPath}`);
      return this.config;

    } catch (error) {
      this.emit('error', {
        error,
        path: this.configPath,
        loadTime: this.loadStartTime ? Number(process.hrtime.bigint() - this.loadStartTime) / 1_000_000 : 0
      });

      throw new Error(`Failed to load configuration: ${error.message}`);
    }
  }

  /**
   * Enable hot-reload capability
   * Watches configuration file for changes
   */
  enableHotReload() {
    if (this.watcher) {
      console.log('Hot-reload already enabled');
      return;
    }

    try {
      this.watcher = fs.watch(this.configPath, { persistent: false }, (eventType, filename) => {
        if (eventType === 'change') {
          console.log(`Configuration file changed: ${filename}`);
          this.reload();
        }
      });

      this.emit('hot-reload-enabled', { path: this.configPath });
      console.log(`Hot-reload enabled for ${this.configPath}`);

    } catch (error) {
      this.emit('error', {
        error,
        context: 'hot-reload-setup',
        path: this.configPath
      });

      console.error(`Failed to enable hot-reload: ${error.message}`);
    }
  }

  /**
   * Disable hot-reload capability
   */
  disableHotReload() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
      this.emit('hot-reload-disabled', { path: this.configPath });
      console.log('Hot-reload disabled');
    }
  }

  /**
   * Reload configuration (used by hot-reload)
   */
  async reload() {
    try {
      this.metrics.reloadCount++;
      const oldMappingCount = this.config ? Object.keys(this.config.service_name_mappings).length : 0;

      await this.load();

      const newMappingCount = Object.keys(this.config.service_name_mappings).length;

      this.emit('reloaded', {
        path: this.configPath,
        oldMappingCount,
        newMappingCount,
        reloadCount: this.metrics.reloadCount
      });

      console.log(`Configuration reloaded: ${oldMappingCount} → ${newMappingCount} mappings`);

    } catch (error) {
      this.emit('reload-error', {
        error,
        path: this.configPath,
        reloadCount: this.metrics.reloadCount
      });

      console.error(`Failed to reload configuration: ${error.message}`);
    }
  }

  /**
   * Get service mapping by key with caching
   * Meets performance requirement: < 1ms per resolution
   */
  getServiceMapping(key) {
    const cacheKey = `mapping:${key}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.cacheStats.hits++;
      this.updateCacheStats();
      return this.cache.get(cacheKey);
    }

    // Cache miss
    this.cacheStats.misses++;

    if (!this.isLoaded || !this.config) {
      this.updateCacheStats();
      return null;
    }

    const mapping = this.config.service_name_mappings[key] || null;

    // Cache the result
    this.cache.set(cacheKey, mapping);
    this.updateCacheStats();

    return mapping;
  }

  /**
   * Get all service mappings
   */
  getAllMappings() {
    if (!this.isLoaded || !this.config) {
      return {};
    }

    return this.config.service_name_mappings;
  }

  /**
   * Get validation rules
   */
  getValidationRules() {
    if (!this.isLoaded || !this.config) {
      return null;
    }

    return this.config.validation_rules;
  }

  /**
   * Get configuration metadata
   */
  getMetadata() {
    if (!this.isLoaded || !this.config) {
      return null;
    }

    return this.config.metadata;
  }

  /**
   * Search mappings by process pattern
   * Used by service name resolution
   */
  findMappingByPattern(processPattern) {
    const cacheKey = `pattern:${processPattern}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      this.cacheStats.hits++;
      this.updateCacheStats();
      return this.cache.get(cacheKey);
    }

    // Cache miss
    this.cacheStats.misses++;

    if (!this.isLoaded || !this.config) {
      this.updateCacheStats();
      return null;
    }

    const mappings = this.config.service_name_mappings;

    for (const [serviceKey, mapping] of Object.entries(mappings)) {
      if (mapping.process_patterns) {
        for (const pattern of mapping.process_patterns) {
          try {
            const regex = new RegExp(pattern, 'i'); // Case insensitive
            if (regex.test(processPattern)) {
              const result = {
                serviceKey,
                mapping,
                matchedPattern: pattern
              };

              // Cache the result
              this.cache.set(cacheKey, result);
              this.updateCacheStats();

              return result;
            }
          } catch (error) {
            console.warn(`Invalid regex pattern: ${pattern} in ${serviceKey}`);
          }
        }
      }
    }

    // Cache negative result
    this.cache.set(cacheKey, null);
    this.updateCacheStats();

    return null;
  }

  /**
   * Update cache statistics
   */
  updateCacheStats() {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    this.cacheStats.hitRatio = total > 0 ? this.cacheStats.hits / total : 0;
  }

  /**
   * Get performance and cache statistics
   */
  getStats() {
    return {
      isLoaded: this.isLoaded,
      loadMetrics: {
        lastLoadTime: this.metrics.lastLoadTime,
        avgLoadTime: this.metrics.avgLoadTime,
        reloadCount: this.metrics.reloadCount,
        totalLoads: this.metrics.loadTimes.length
      },
      cache: {
        size: this.cache.size,
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        hitRatio: this.cacheStats.hitRatio
      },
      hotReload: {
        enabled: !!this.watcher
      },
      memory: {
        estimatedUsageMB: this.estimateMemoryUsage()
      }
    };
  }

  /**
   * Estimate memory usage (rough calculation)
   */
  estimateMemoryUsage() {
    if (!this.config) return 0;

    const configStr = JSON.stringify(this.config);
    const cacheStr = JSON.stringify([...this.cache.entries()]);

    // Rough estimate: 2 bytes per character + overhead
    const configSize = configStr.length * 2;
    const cacheSize = cacheStr.length * 2;
    const overhead = 0.1; // 10% overhead estimate

    return ((configSize + cacheSize) * (1 + overhead)) / (1024 * 1024); // Convert to MB
  }

  /**
   * Clear cache and reset statistics
   */
  clearCache() {
    this.cache.clear();
    this.cacheStats = {
      hits: 0,
      misses: 0,
      hitRatio: 0
    };

    this.emit('cache-cleared');
    console.log('Configuration cache cleared');
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.disableHotReload();
    this.clearCache();
    this.removeAllListeners();
    this.config = null;
    this.isLoaded = false;
  }
}

// Export singleton instance and class
const defaultLoader = new ConfigLoader();

module.exports = {
  ConfigLoader,
  defaultLoader,

  // Convenience methods using default loader
  async load(configPath) {
    if (configPath) {
      defaultLoader.configPath = configPath;
    }
    return defaultLoader.load();
  },

  enableHotReload() {
    return defaultLoader.enableHotReload();
  },

  getServiceMapping(key) {
    return defaultLoader.getServiceMapping(key);
  },

  findMappingByPattern(pattern) {
    return defaultLoader.findMappingByPattern(pattern);
  },

  getStats() {
    return defaultLoader.getStats();
  }
};