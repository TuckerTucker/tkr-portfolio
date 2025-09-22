/**
 * TKR Logging Configuration Validator
 *
 * Comprehensive configuration validation using JSON schema
 * with detailed error reporting and type checking.
 */

const fs = require('fs');
const path = require('path');

class LoggingConfigValidator {
  constructor() {
    this.schemaPath = path.join(__dirname, 'schema.json');
    this.schema = null;
    this.ajv = null;
    this.validator = null;
    this.errors = [];

    this.initializeValidator();
  }

  /**
   * Initialize the JSON schema validator
   */
  initializeValidator() {
    try {
      // Try to load AJV if available
      try {
        const Ajv = require('ajv');
        const addFormats = require('ajv-formats');

        this.ajv = new Ajv({
          allErrors: true,
          verbose: true,
          strict: false,
          removeAdditional: false
        });

        addFormats(this.ajv);
        this.loadSchema();

        if (this.schema) {
          this.validator = this.ajv.compile(this.schema);
        }
      } catch (error) {
        // AJV not available, fall back to manual validation
        console.warn('AJV not available, using manual validation:', error.message);
        this.loadSchema();
      }
    } catch (error) {
      console.error('Failed to initialize validator:', error.message);
    }
  }

  /**
   * Load JSON schema from file
   */
  loadSchema() {
    try {
      const schemaContent = fs.readFileSync(this.schemaPath, 'utf8');
      this.schema = JSON.parse(schemaContent);
    } catch (error) {
      console.error('Failed to load schema:', error.message);
    }
  }

  /**
   * Validate configuration object
   * @param {object} config - Configuration to validate
   * @returns {boolean} True if valid
   */
  validate(config) {
    this.errors = [];

    if (this.validator) {
      return this.validateWithAjv(config);
    } else {
      return this.validateManually(config);
    }
  }

  /**
   * Validate using AJV JSON schema validator
   * @param {object} config - Configuration to validate
   * @returns {boolean} True if valid
   */
  validateWithAjv(config) {
    const valid = this.validator(config);

    if (!valid) {
      this.errors = this.validator.errors.map(error => ({
        path: error.instancePath || error.dataPath,
        message: error.message,
        value: error.data,
        schema: error.schemaPath
      }));
    }

    return valid;
  }

  /**
   * Manual validation when AJV is not available
   * @param {object} config - Configuration to validate
   * @returns {boolean} True if valid
   */
  validateManually(config) {
    if (!config || typeof config !== 'object') {
      this.addError('root', 'Configuration must be an object', config);
      return false;
    }

    // Validate required fields
    const requiredFields = ['version', 'endpoints', 'logLevels', 'batching', 'behavior'];
    for (const field of requiredFields) {
      if (!(field in config)) {
        this.addError(field, `Required field '${field}' is missing`);
      }
    }

    // Validate version
    if (config.version && !this.validateVersion(config.version)) {
      this.addError('version', 'Version must be in semver format (x.y.z)', config.version);
    }

    // Validate endpoints
    if (config.endpoints) {
      this.validateEndpoints(config.endpoints);
    }

    // Validate log levels
    if (config.logLevels) {
      this.validateLogLevels(config.logLevels);
    }

    // Validate batching
    if (config.batching) {
      this.validateBatching(config.batching);
    }

    // Validate behavior
    if (config.behavior) {
      this.validateBehavior(config.behavior);
    }

    // Validate performance
    if (config.performance) {
      this.validatePerformance(config.performance);
    }

    // Validate services
    if (config.services) {
      this.validateServices(config.services);
    }

    // Validate format
    if (config.format) {
      this.validateFormat(config.format);
    }

    return this.errors.length === 0;
  }

  /**
   * Validate version string
   * @param {string} version - Version string
   * @returns {boolean} True if valid
   */
  validateVersion(version) {
    if (typeof version !== 'string') return false;
    return /^\d+\.\d+\.\d+$/.test(version);
  }

  /**
   * Validate endpoints configuration
   * @param {object} endpoints - Endpoints configuration
   */
  validateEndpoints(endpoints) {
    if (typeof endpoints !== 'object') {
      this.addError('endpoints', 'Endpoints must be an object', endpoints);
      return;
    }

    const requiredEndpoints = ['httpEndpoint', 'batchEndpoint'];
    for (const endpoint of requiredEndpoints) {
      if (!(endpoint in endpoints)) {
        this.addError(`endpoints.${endpoint}`, `Required endpoint '${endpoint}' is missing`);
      } else if (!this.validateUrl(endpoints[endpoint])) {
        this.addError(`endpoints.${endpoint}`, 'Must be a valid HTTP/HTTPS URL', endpoints[endpoint]);
      }
    }

    // Validate optional endpoints
    if (endpoints.clientScriptUrl && !this.validateUrl(endpoints.clientScriptUrl)) {
      this.addError('endpoints.clientScriptUrl', 'Must be a valid HTTP/HTTPS URL', endpoints.clientScriptUrl);
    }

    if (endpoints.healthEndpoint && !this.validateUrl(endpoints.healthEndpoint)) {
      this.addError('endpoints.healthEndpoint', 'Must be a valid HTTP/HTTPS URL', endpoints.healthEndpoint);
    }
  }

  /**
   * Validate log levels configuration
   * @param {object} logLevels - Log levels configuration
   */
  validateLogLevels(logLevels) {
    if (typeof logLevels !== 'object') {
      this.addError('logLevels', 'Log levels must be an object', logLevels);
      return;
    }

    const validLevels = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];

    // Validate default level
    if (!logLevels.default) {
      this.addError('logLevels.default', 'Default log level is required');
    } else if (!validLevels.includes(logLevels.default)) {
      this.addError('logLevels.default', `Must be one of: ${validLevels.join(', ')}`, logLevels.default);
    }

    // Validate available levels
    if (logLevels.available) {
      if (!Array.isArray(logLevels.available)) {
        this.addError('logLevels.available', 'Available levels must be an array', logLevels.available);
      } else {
        for (const level of logLevels.available) {
          if (!validLevels.includes(level)) {
            this.addError('logLevels.available', `Invalid log level: ${level}`, level);
          }
        }
      }
    }

    // Validate priority mapping
    if (logLevels.priority) {
      if (typeof logLevels.priority !== 'object') {
        this.addError('logLevels.priority', 'Priority must be an object', logLevels.priority);
      } else {
        for (const [level, priority] of Object.entries(logLevels.priority)) {
          if (!validLevels.includes(level)) {
            this.addError(`logLevels.priority.${level}`, `Invalid log level: ${level}`, level);
          }
          if (typeof priority !== 'number' || priority < 0) {
            this.addError(`logLevels.priority.${level}`, 'Priority must be a non-negative number', priority);
          }
        }
      }
    }
  }

  /**
   * Validate batching configuration
   * @param {object} batching - Batching configuration
   */
  validateBatching(batching) {
    if (typeof batching !== 'object') {
      this.addError('batching', 'Batching must be an object', batching);
      return;
    }

    // Validate batch size
    if (batching.batchSize !== undefined) {
      if (!Number.isInteger(batching.batchSize) || batching.batchSize < 1 || batching.batchSize > 100) {
        this.addError('batching.batchSize', 'Batch size must be an integer between 1 and 100', batching.batchSize);
      }
    }

    // Validate flush interval
    if (batching.flushInterval !== undefined) {
      if (!Number.isInteger(batching.flushInterval) || batching.flushInterval < 1000 || batching.flushInterval > 60000) {
        this.addError('batching.flushInterval', 'Flush interval must be an integer between 1000 and 60000 ms', batching.flushInterval);
      }
    }

    // Validate timeout
    if (batching.timeout !== undefined) {
      if (!Number.isInteger(batching.timeout) || batching.timeout < 1000) {
        this.addError('batching.timeout', 'Timeout must be an integer >= 1000 ms', batching.timeout);
      }
    }
  }

  /**
   * Validate behavior configuration
   * @param {object} behavior - Behavior configuration
   */
  validateBehavior(behavior) {
    if (typeof behavior !== 'object') {
      this.addError('behavior', 'Behavior must be an object', behavior);
      return;
    }

    const booleanFields = ['enabled', 'projectOnly', 'failSilently', 'logToConsole', 'captureOutput', 'successCommands', 'showIndicator'];

    for (const field of booleanFields) {
      if (behavior[field] !== undefined && typeof behavior[field] !== 'boolean') {
        this.addError(`behavior.${field}`, 'Must be a boolean value', behavior[field]);
      }
    }
  }

  /**
   * Validate performance configuration
   * @param {object} performance - Performance configuration
   */
  validatePerformance(performance) {
    if (typeof performance !== 'object') {
      this.addError('performance', 'Performance must be an object', performance);
      return;
    }

    // Validate threshold
    if (performance.threshold !== undefined) {
      if (typeof performance.threshold !== 'number' || performance.threshold < 0.1 || performance.threshold > 100) {
        this.addError('performance.threshold', 'Threshold must be a number between 0.1 and 100', performance.threshold);
      }
    }

    // Validate max retries
    if (performance.maxRetries !== undefined) {
      if (!Number.isInteger(performance.maxRetries) || performance.maxRetries < 0 || performance.maxRetries > 10) {
        this.addError('performance.maxRetries', 'Max retries must be an integer between 0 and 10', performance.maxRetries);
      }
    }

    // Validate retry delay
    if (performance.retryDelay !== undefined) {
      if (!Number.isInteger(performance.retryDelay) || performance.retryDelay < 100 || performance.retryDelay > 10000) {
        this.addError('performance.retryDelay', 'Retry delay must be an integer between 100 and 10000 ms', performance.retryDelay);
      }
    }

    // Validate HTTP timeout
    if (performance.httpTimeout !== undefined) {
      if (!Number.isInteger(performance.httpTimeout) || performance.httpTimeout < 1000 || performance.httpTimeout > 30000) {
        this.addError('performance.httpTimeout', 'HTTP timeout must be an integer between 1000 and 30000 ms', performance.httpTimeout);
      }
    }
  }

  /**
   * Validate services configuration
   * @param {object} services - Services configuration
   */
  validateServices(services) {
    if (typeof services !== 'object') {
      this.addError('services', 'Services must be an object', services);
      return;
    }

    const validServices = ['browser', 'shell', 'node', 'vite', 'webpack'];

    for (const [serviceName, serviceConfig] of Object.entries(services)) {
      if (!validServices.includes(serviceName)) {
        this.addError(`services.${serviceName}`, `Unknown service: ${serviceName}`, serviceName);
        continue;
      }

      if (typeof serviceConfig !== 'object') {
        this.addError(`services.${serviceName}`, 'Service configuration must be an object', serviceConfig);
        continue;
      }

      // Service-specific validation
      this.validateServiceConfig(serviceName, serviceConfig);
    }
  }

  /**
   * Validate specific service configuration
   * @param {string} serviceName - Name of the service
   * @param {object} config - Service configuration
   */
  validateServiceConfig(serviceName, config) {
    switch (serviceName) {
      case 'browser':
        if (config.autoCapture && typeof config.autoCapture !== 'object') {
          this.addError(`services.${serviceName}.autoCapture`, 'Auto capture must be an object', config.autoCapture);
        }
        break;

      case 'shell':
        if (config.monitoredCommands && !Array.isArray(config.monitoredCommands)) {
          this.addError(`services.${serviceName}.monitoredCommands`, 'Monitored commands must be an array', config.monitoredCommands);
        }
        break;

      case 'node':
        if (config.processFilter && !Array.isArray(config.processFilter)) {
          this.addError(`services.${serviceName}.processFilter`, 'Process filter must be an array', config.processFilter);
        }
        if (config.skipPatterns && !Array.isArray(config.skipPatterns)) {
          this.addError(`services.${serviceName}.skipPatterns`, 'Skip patterns must be an array', config.skipPatterns);
        }
        break;

      case 'vite':
      case 'webpack':
        if (config.enabled !== undefined && typeof config.enabled !== 'boolean') {
          this.addError(`services.${serviceName}.enabled`, 'Enabled must be a boolean', config.enabled);
        }
        break;
    }
  }

  /**
   * Validate format configuration
   * @param {object} format - Format configuration
   */
  validateFormat(format) {
    if (typeof format !== 'object') {
      this.addError('format', 'Format must be an object', format);
      return;
    }

    const integerFields = {
      maxMessageLength: { min: 100, max: 100000 },
      maxServiceLength: { min: 10, max: 1000 },
      maxComponentLength: { min: 10, max: 1000 },
      maxMetadataSize: { min: 1024, max: 1048576 }
    };

    for (const [field, limits] of Object.entries(integerFields)) {
      if (format[field] !== undefined) {
        if (!Number.isInteger(format[field]) || format[field] < limits.min || format[field] > limits.max) {
          this.addError(`format.${field}`, `Must be an integer between ${limits.min} and ${limits.max}`, format[field]);
        }
      }
    }

    if (format.timestampFormat && !['unix', 'iso', 'locale'].includes(format.timestampFormat)) {
      this.addError('format.timestampFormat', 'Must be one of: unix, iso, locale', format.timestampFormat);
    }
  }

  /**
   * Validate URL format
   * @param {string} url - URL to validate
   * @returns {boolean} True if valid
   */
  validateUrl(url) {
    if (typeof url !== 'string') return false;
    return /^https?:\/\/.+/.test(url);
  }

  /**
   * Add validation error
   * @param {string} path - Configuration path
   * @param {string} message - Error message
   * @param {any} value - Invalid value
   */
  addError(path, message, value = undefined) {
    this.errors.push({
      path,
      message,
      value
    });
  }

  /**
   * Get validation errors
   * @returns {Array} Array of error objects
   */
  getErrors() {
    return this.errors;
  }

  /**
   * Get formatted error messages
   * @returns {Array} Array of formatted error strings
   */
  getFormattedErrors() {
    return this.errors.map(error => {
      let msg = `${error.path}: ${error.message}`;
      if (error.value !== undefined) {
        msg += ` (got: ${JSON.stringify(error.value)})`;
      }
      return msg;
    });
  }

  /**
   * Check if configuration has validation errors
   * @returns {boolean} True if there are errors
   */
  hasErrors() {
    return this.errors.length > 0;
  }

  /**
   * Clear validation errors
   */
  clearErrors() {
    this.errors = [];
  }
}

module.exports = LoggingConfigValidator;