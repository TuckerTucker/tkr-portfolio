/**
 * TKR Logging Configuration Loader
 *
 * Centralized configuration loading with environment variable override support
 * and validation. This is the single source of truth for all logging components.
 */

const fs = require('fs');
const path = require('path');

class LoggingConfigLoader {
  constructor() {
    this.configDir = __dirname;
    this.defaultsFile = path.join(this.configDir, 'defaults.json');
    this.schemaFile = path.join(this.configDir, 'schema.json');
    this.cachedConfig = null;
    this.environmentPrefix = 'TKR_LOG_';
  }

  /**
   * Load and merge configuration from defaults and environment variables
   * @param {object} overrides - Optional configuration overrides
   * @returns {object} Complete configuration object
   */
  load(overrides = {}) {
    if (this.cachedConfig && Object.keys(overrides).length === 0) {
      return this.cachedConfig;
    }

    try {
      // Load defaults
      const defaults = this.loadDefaults();

      // Apply environment overrides
      const envConfig = this.loadEnvironmentOverrides();

      // Merge configurations: defaults < environment < overrides
      const config = this.deepMerge(defaults, envConfig, overrides);

      // Validate configuration
      if (!this.validate(config)) {
        throw new Error('Configuration validation failed');
      }

      // Cache for future use
      if (Object.keys(overrides).length === 0) {
        this.cachedConfig = config;
      }

      return config;
    } catch (error) {
      console.error('Failed to load logging configuration:', error.message);
      // Return minimal safe configuration
      return this.getSafeDefaults();
    }
  }

  /**
   * Load default configuration from JSON file
   * @returns {object} Default configuration
   */
  loadDefaults() {
    try {
      const content = fs.readFileSync(this.defaultsFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Failed to load defaults.json:', error.message);
      return this.getSafeDefaults();
    }
  }

  /**
   * Load environment variable overrides
   * @returns {object} Configuration overrides from environment
   */
  loadEnvironmentOverrides() {
    const config = {};

    // Map environment variables to configuration paths
    const envMappings = {
      // Endpoints
      'TKR_LOG_ENDPOINT': 'endpoints.httpEndpoint',
      'TKR_LOG_BATCH_ENDPOINT': 'endpoints.batchEndpoint',
      'TKR_LOG_CLIENT_URL': 'endpoints.clientScriptUrl',
      'TKR_LOG_HEALTH_ENDPOINT': 'endpoints.healthEndpoint',

      // Log levels
      'TKR_LOG_LEVEL': 'logLevels.default',

      // Batching
      'TKR_LOG_BATCH_SIZE': 'batching.batchSize',
      'TKR_LOG_FLUSH_INTERVAL': 'batching.flushInterval',
      'TKR_LOG_BATCH_TIMEOUT': 'batching.timeout',

      // Behavior
      'TKR_LOG_ENABLED': 'behavior.enabled',
      'TKR_LOG_PROJECT_ONLY': 'behavior.projectOnly',
      'TKR_LOG_FAIL_SILENTLY': 'behavior.failSilently',
      'TKR_LOG_TO_CONSOLE': 'behavior.logToConsole',
      'TKR_LOG_CAPTURE_OUTPUT': 'behavior.captureOutput',
      'TKR_LOG_SUCCESS_COMMANDS': 'behavior.successCommands',
      'TKR_LOG_SHOW_INDICATOR': 'behavior.showIndicator',

      // Performance
      'TKR_LOG_PERFORMANCE_THRESHOLD': 'performance.threshold',
      'TKR_LOG_MAX_RETRIES': 'performance.maxRetries',
      'TKR_LOG_RETRY_DELAY': 'performance.retryDelay',
      'TKR_LOG_HTTP_TIMEOUT': 'performance.httpTimeout',

      // Session
      'TKR_LOG_SESSION_TRACKING': 'session.tracking',
      'TKR_LOG_SESSION_ID': 'session.id', // Special case - runtime value

      // Debug
      'TKR_LOG_DEBUG': 'debugging.enabled',
      'TKR_LOG_DEBUG_FILE': 'debugging.logFile',
      'TKR_LOG_VERBOSE': 'debugging.verbose',

      // Service-specific
      'TKR_LOG_SERVICE': 'runtime.service',
      'TKR_LOG_COMPONENT': 'runtime.component',

      // Indicators
      'TKR_LOG_INDICATOR': 'indicators.prompt'
    };

    // Process environment variables
    for (const [envVar, configPath] of Object.entries(envMappings)) {
      const value = process.env[envVar];
      if (value !== undefined) {
        this.setNestedValue(config, configPath, this.parseEnvironmentValue(value));
      }
    }

    // Handle special cases
    this.processSpecialEnvironmentVariables(config);

    return config;
  }

  /**
   * Process special environment variable cases
   * @param {object} config - Configuration object to modify
   */
  processSpecialEnvironmentVariables(config) {
    // Handle service-specific configuration
    const serviceName = process.env.TKR_LOG_SERVICE;
    if (serviceName && config.services) {
      // Apply service-specific overrides
      const serviceConfig = config.services[serviceName];
      if (serviceConfig) {
        // Service-specific environment variables
        const serviceEnvPrefix = `TKR_LOG_${serviceName.toUpperCase()}_`;

        for (const [key, value] of Object.entries(process.env)) {
          if (key.startsWith(serviceEnvPrefix)) {
            const configKey = key.slice(serviceEnvPrefix.length).toLowerCase();
            this.setNestedValue(config, `services.${serviceName}.${configKey}`, this.parseEnvironmentValue(value));
          }
        }
      }
    }

    // Handle monitored commands for shell service
    if (process.env.TKR_LOG_MONITORED_COMMANDS) {
      this.setNestedValue(config, 'services.shell.monitoredCommands',
        process.env.TKR_LOG_MONITORED_COMMANDS.split(/\s+/).filter(Boolean));
    }

    // Handle process filter for node service
    if (process.env.TKR_LOG_PROCESS_FILTER) {
      this.setNestedValue(config, 'services.node.processFilter',
        process.env.TKR_LOG_PROCESS_FILTER.split(/\s+/).filter(Boolean));
    }

    // Handle skip patterns
    if (process.env.TKR_LOG_SKIP_PATTERNS) {
      this.setNestedValue(config, 'services.node.skipPatterns',
        process.env.TKR_LOG_SKIP_PATTERNS.split(/[,;]/).map(s => s.trim()).filter(Boolean));
    }
  }

  /**
   * Parse environment variable value to appropriate type
   * @param {string} value - Environment variable value
   * @returns {any} Parsed value
   */
  parseEnvironmentValue(value) {
    // Boolean values
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Numeric values
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d*\.\d+$/.test(value)) return parseFloat(value);

    // String values
    return value;
  }

  /**
   * Set nested object value using dot notation
   * @param {object} obj - Target object
   * @param {string} path - Dot notation path
   * @param {any} value - Value to set
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();

    let current = obj;
    for (const key of keys) {
      if (!(key in current) || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
  }

  /**
   * Deep merge multiple configuration objects
   * @param {...object} configs - Configuration objects to merge
   * @returns {object} Merged configuration
   */
  deepMerge(...configs) {
    const result = {};

    for (const config of configs) {
      this.mergeInto(result, config);
    }

    return result;
  }

  /**
   * Merge source object into target object
   * @param {object} target - Target object
   * @param {object} source - Source object
   */
  mergeInto(target, source) {
    for (const [key, value] of Object.entries(source)) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (!(key in target) || typeof target[key] !== 'object') {
          target[key] = {};
        }
        this.mergeInto(target[key], value);
      } else {
        target[key] = value;
      }
    }
  }

  /**
   * Validate configuration against schema
   * @param {object} config - Configuration to validate
   * @returns {boolean} True if valid
   */
  validate(config) {
    try {
      // Import validator if available
      const validator = this.getValidator();
      if (validator) {
        return validator.validate(config);
      }

      // Basic validation if no validator available
      return this.basicValidation(config);
    } catch (error) {
      console.error('Configuration validation error:', error.message);
      return false;
    }
  }

  /**
   * Get JSON schema validator
   * @returns {object|null} Validator instance or null
   */
  getValidator() {
    try {
      // Try to load the separate validator module
      const ValidatorClass = require('./validator');
      return new ValidatorClass();
    } catch (error) {
      // Validator not available, use basic validation
      return null;
    }
  }

  /**
   * Basic configuration validation
   * @param {object} config - Configuration to validate
   * @returns {boolean} True if valid
   */
  basicValidation(config) {
    // Check required fields
    if (!config.version) return false;
    if (!config.endpoints || !config.endpoints.httpEndpoint) return false;
    if (!config.logLevels || !config.logLevels.default) return false;
    if (!config.batching || typeof config.batching.batchSize !== 'number') return false;
    if (!config.behavior || typeof config.behavior.enabled !== 'boolean') return false;

    // Validate log level
    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    if (!validLevels.includes(config.logLevels.default)) return false;

    // Validate batch size
    if (config.batching.batchSize < 1 || config.batching.batchSize > 100) return false;

    // Validate endpoints
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(config.endpoints.httpEndpoint)) return false;

    return true;
  }

  /**
   * Get safe default configuration for fallback
   * @returns {object} Safe configuration
   */
  getSafeDefaults() {
    return {
      version: '1.0.0',
      endpoints: {
        httpEndpoint: 'http://localhost:42003/api/logs',
        batchEndpoint: 'http://localhost:42003/api/logs/batch',
        healthEndpoint: 'http://localhost:42003/health'
      },
      logLevels: {
        default: 'INFO',
        available: ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'],
        priority: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 }
      },
      batching: {
        batchSize: 10,
        flushInterval: 5000,
        timeout: 30000
      },
      behavior: {
        enabled: true,
        projectOnly: true,
        failSilently: true,
        logToConsole: false
      },
      performance: {
        threshold: 1,
        maxRetries: 3,
        retryDelay: 1000,
        httpTimeout: 5000
      }
    };
  }

  /**
   * Get configuration for specific service
   * @param {string} serviceName - Name of the service
   * @param {object} overrides - Service-specific overrides
   * @returns {object} Service configuration
   */
  getServiceConfig(serviceName, overrides = {}) {
    const config = this.load(overrides);

    // Get base configuration
    const serviceConfig = {
      ...config,
      service: serviceName,
      component: config.services[serviceName]?.component || serviceName
    };

    // Apply service-specific configuration
    if (config.services[serviceName]) {
      Object.assign(serviceConfig, config.services[serviceName]);
    }

    return serviceConfig;
  }

  /**
   * Clear cached configuration (useful for testing)
   */
  clearCache() {
    this.cachedConfig = null;
  }

  /**
   * Get configuration for environment variable export (shell integration)
   * @returns {object} Environment variable mappings
   */
  getEnvironmentExport() {
    const config = this.load();

    return {
      TKR_LOG_ENDPOINT: config.endpoints.httpEndpoint,
      TKR_LOG_BATCH_ENDPOINT: config.endpoints.batchEndpoint,
      TKR_LOG_HEALTH_ENDPOINT: config.endpoints.healthEndpoint,
      TKR_LOG_LEVEL: config.logLevels.default,
      TKR_LOG_BATCH_SIZE: config.batching.batchSize.toString(),
      TKR_LOG_FLUSH_INTERVAL: config.batching.flushInterval.toString(),
      TKR_LOG_ENABLED: config.behavior.enabled.toString(),
      TKR_LOG_PROJECT_ONLY: config.behavior.projectOnly.toString(),
      TKR_LOG_FAIL_SILENTLY: config.behavior.failSilently.toString(),
      TKR_LOG_TO_CONSOLE: config.behavior.logToConsole.toString(),
      TKR_LOG_CAPTURE_OUTPUT: config.behavior.captureOutput.toString(),
      TKR_LOG_SUCCESS_COMMANDS: config.behavior.successCommands.toString(),
      TKR_LOG_SHOW_INDICATOR: config.behavior.showIndicator.toString(),
      TKR_LOG_PERFORMANCE_THRESHOLD: config.performance.threshold.toString(),
      TKR_LOG_MAX_RETRIES: config.performance.maxRetries.toString(),
      TKR_LOG_RETRY_DELAY: config.performance.retryDelay.toString(),
      TKR_LOG_HTTP_TIMEOUT: config.performance.httpTimeout.toString(),
      TKR_LOG_DEBUG: config.debugging.enabled.toString(),
      TKR_LOG_INDICATOR: config.indicators.prompt
    };
  }
}

// Create singleton instance
const configLoader = new LoggingConfigLoader();

// Export both the class and singleton instance
module.exports = {
  LoggingConfigLoader,
  configLoader,

  // Convenience functions
  load: (overrides) => configLoader.load(overrides),
  getServiceConfig: (serviceName, overrides) => configLoader.getServiceConfig(serviceName, overrides),
  getEnvironmentExport: () => configLoader.getEnvironmentExport(),
  clearCache: () => configLoader.clearCache()
};