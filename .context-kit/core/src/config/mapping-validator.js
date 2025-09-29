/**
 * Mapping Validator for Service Configuration
 * Validates service mappings against schema and business rules
 */

class ValidationResult {
  constructor() {
    this.isValid = true;
    this.errors = [];
    this.warnings = [];
    this.validatedItems = 0;
    this.skippedItems = 0;
  }

  addError(field, message, value = null) {
    this.isValid = false;
    this.errors.push({
      field,
      message,
      value,
      severity: 'error',
      timestamp: new Date().toISOString()
    });
  }

  addWarning(field, message, value = null) {
    this.warnings.push({
      field,
      message,
      value,
      severity: 'warning',
      timestamp: new Date().toISOString()
    });
  }

  getSummary() {
    return {
      isValid: this.isValid,
      errorCount: this.errors.length,
      warningCount: this.warnings.length,
      validatedItems: this.validatedItems,
      skippedItems: this.skippedItems
    };
  }
}

class MappingValidator {
  constructor() {
    // Default validation rules (can be overridden by config)
    this.rules = {
      service_name: {
        min_length: 1,
        max_length: 50,
        pattern: /^[a-zA-Z0-9_-]+$/,
        allowed_chars: "alphanumeric, dash, underscore"
      },
      display_name: {
        min_length: 1,
        max_length: 100,
        no_leading_trailing_whitespace: true
      },
      category: {
        allowed_values: [
          "terminal",
          "dev-server",
          "build-tool",
          "test-runner",
          "api-service",
          "database",
          "dev-tool",
          "mcp-service",
          "unknown"
        ]
      },
      process_patterns: {
        min_patterns: 1,
        max_patterns: 20,
        pattern_validation: "regex"
      }
    };

    this.stats = {
      validationCount: 0,
      totalErrors: 0,
      totalWarnings: 0,
      avgValidationTime: 0,
      validationTimes: []
    };
  }

  /**
   * Update validation rules from configuration
   */
  updateRules(validationRules) {
    if (validationRules && typeof validationRules === 'object') {
      this.rules = { ...this.rules, ...validationRules };
    }
  }

  /**
   * Validate complete service mappings configuration
   */
  validateConfig(config) {
    const startTime = process.hrtime.bigint();
    const result = new ValidationResult();

    try {
      // Validate top-level structure
      if (!config || typeof config !== 'object') {
        result.addError('config', 'Configuration must be a valid object');
        return result;
      }

      if (!config.service_name_mappings) {
        result.addError('service_name_mappings', 'Missing required service_name_mappings section');
        return result;
      }

      if (typeof config.service_name_mappings !== 'object') {
        result.addError('service_name_mappings', 'service_name_mappings must be an object');
        return result;
      }

      // Update rules if provided in config
      if (config.validation_rules) {
        this.updateRules(config.validation_rules);
      }

      // Validate each service mapping
      const mappings = config.service_name_mappings;
      const serviceKeys = Object.keys(mappings);

      if (serviceKeys.length === 0) {
        result.addWarning('service_name_mappings', 'No service mappings defined');
      }

      for (const serviceKey of serviceKeys) {
        this.validateServiceMapping(serviceKey, mappings[serviceKey], result);
        result.validatedItems++;
      }

      // Validate metadata if present
      if (config.metadata) {
        this.validateMetadata(config.metadata, result);
      }

      // Check for duplicate patterns across services
      this.validateUniquePatterns(mappings, result);

      // Track performance
      const validationTime = Number(process.hrtime.bigint() - startTime) / 1_000_000;
      this.updateStats(validationTime, result.errors.length, result.warnings.length);

    } catch (error) {
      result.addError('validation', `Validation failed: ${error.message}`);
    }

    return result;
  }

  /**
   * Validate individual service mapping
   */
  validateServiceMapping(serviceKey, mapping, result) {
    const prefix = `service_name_mappings.${serviceKey}`;

    // Validate service key (name)
    this.validateServiceName(serviceKey, `${prefix}._key`, result);

    if (!mapping || typeof mapping !== 'object') {
      result.addError(prefix, 'Service mapping must be an object');
      return;
    }

    // Validate required fields
    if (!mapping.display_name) {
      result.addError(`${prefix}.display_name`, 'display_name is required');
    } else {
      this.validateDisplayName(mapping.display_name, `${prefix}.display_name`, result);
    }

    if (!mapping.category) {
      result.addError(`${prefix}.category`, 'category is required');
    } else {
      this.validateCategory(mapping.category, `${prefix}.category`, result);
    }

    if (!mapping.process_patterns) {
      result.addError(`${prefix}.process_patterns`, 'process_patterns is required');
    } else {
      this.validateProcessPatterns(mapping.process_patterns, `${prefix}.process_patterns`, result);
    }

    // Check for unknown fields
    const allowedFields = ['display_name', 'category', 'process_patterns'];
    const unknownFields = Object.keys(mapping).filter(field => !allowedFields.includes(field));

    if (unknownFields.length > 0) {
      result.addWarning(`${prefix}`, `Unknown fields: ${unknownFields.join(', ')}`);
    }
  }

  /**
   * Validate service name (key)
   */
  validateServiceName(name, field, result) {
    if (typeof name !== 'string') {
      result.addError(field, 'Service name must be a string');
      return;
    }

    if (name.length < this.rules.service_name.min_length) {
      result.addError(field, `Service name too short (minimum ${this.rules.service_name.min_length} characters)`, name);
    }

    if (name.length > this.rules.service_name.max_length) {
      result.addError(field, `Service name too long (maximum ${this.rules.service_name.max_length} characters)`, name);
    }

    if (!this.rules.service_name.pattern.test(name)) {
      result.addError(field, `Service name contains invalid characters (allowed: ${this.rules.service_name.allowed_chars})`, name);
    }

    // Check for reserved names
    const reservedNames = ['unknown', 'default', 'config', 'system'];
    if (reservedNames.includes(name.toLowerCase())) {
      result.addWarning(field, `Service name '${name}' is reserved and may cause conflicts`, name);
    }
  }

  /**
   * Validate display name
   */
  validateDisplayName(displayName, field, result) {
    if (typeof displayName !== 'string') {
      result.addError(field, 'Display name must be a string');
      return;
    }

    if (displayName.length < this.rules.display_name.min_length) {
      result.addError(field, `Display name too short (minimum ${this.rules.display_name.min_length} characters)`, displayName);
    }

    if (displayName.length > this.rules.display_name.max_length) {
      result.addError(field, `Display name too long (maximum ${this.rules.display_name.max_length} characters)`, displayName);
    }

    if (this.rules.display_name.no_leading_trailing_whitespace) {
      if (displayName !== displayName.trim()) {
        result.addError(field, 'Display name cannot have leading or trailing whitespace', displayName);
      }
    }

    // Check for potentially confusing names
    if (displayName.toLowerCase().includes('unknown')) {
      result.addWarning(field, 'Display name contains "unknown" which may be confusing', displayName);
    }
  }

  /**
   * Validate category
   */
  validateCategory(category, field, result) {
    if (typeof category !== 'string') {
      result.addError(field, 'Category must be a string');
      return;
    }

    if (!this.rules.category.allowed_values.includes(category)) {
      result.addError(field, `Invalid category. Allowed values: ${this.rules.category.allowed_values.join(', ')}`, category);
    }
  }

  /**
   * Validate process patterns array
   */
  validateProcessPatterns(patterns, field, result) {
    if (!Array.isArray(patterns)) {
      result.addError(field, 'Process patterns must be an array');
      return;
    }

    if (patterns.length < this.rules.process_patterns.min_patterns) {
      result.addError(field, `Too few process patterns (minimum ${this.rules.process_patterns.min_patterns})`, patterns.length);
    }

    if (patterns.length > this.rules.process_patterns.max_patterns) {
      result.addError(field, `Too many process patterns (maximum ${this.rules.process_patterns.max_patterns})`, patterns.length);
    }

    patterns.forEach((pattern, index) => {
      this.validateProcessPattern(pattern, `${field}[${index}]`, result);
    });

    // Check for duplicate patterns
    const duplicates = patterns.filter((pattern, index) => patterns.indexOf(pattern) !== index);
    if (duplicates.length > 0) {
      result.addWarning(field, `Duplicate patterns found: ${duplicates.join(', ')}`);
    }
  }

  /**
   * Validate individual process pattern
   */
  validateProcessPattern(pattern, field, result) {
    if (typeof pattern !== 'string') {
      result.addError(field, 'Process pattern must be a string');
      return;
    }

    if (pattern.trim() === '') {
      result.addError(field, 'Process pattern cannot be empty');
      return;
    }

    // Validate regex if pattern_validation is enabled
    if (this.rules.process_patterns.pattern_validation === 'regex') {
      try {
        new RegExp(pattern, 'i');
      } catch (error) {
        result.addError(field, `Invalid regex pattern: ${error.message}`, pattern);
      }
    }

    // Check for overly broad patterns
    const broadPatterns = ['^.*$', '.*', '.+', '^.+$'];
    if (broadPatterns.includes(pattern)) {
      result.addWarning(field, 'Pattern is very broad and may match unintended processes', pattern);
    }

    // Check for potentially problematic patterns
    if (pattern.length > 100) {
      result.addWarning(field, 'Pattern is very long and may impact performance', pattern);
    }
  }

  /**
   * Validate metadata section
   */
  validateMetadata(metadata, result) {
    if (typeof metadata !== 'object') {
      result.addError('metadata', 'Metadata must be an object');
      return;
    }

    // Validate version if present
    if (metadata.version && typeof metadata.version !== 'string') {
      result.addError('metadata.version', 'Version must be a string');
    }

    // Validate performance targets if present
    if (metadata.performance_targets) {
      const targets = metadata.performance_targets;

      if (typeof targets.resolution_time_ms === 'number' && targets.resolution_time_ms > 5) {
        result.addWarning('metadata.performance_targets.resolution_time_ms', 'Resolution time target is higher than recommended (> 5ms)');
      }

      if (typeof targets.memory_usage_mb === 'number' && targets.memory_usage_mb > 5) {
        result.addWarning('metadata.performance_targets.memory_usage_mb', 'Memory usage target is higher than recommended (> 5MB)');
      }
    }
  }

  /**
   * Validate that patterns are unique across services
   */
  validateUniquePatterns(mappings, result) {
    const patternMap = new Map();

    for (const [serviceKey, mapping] of Object.entries(mappings)) {
      if (mapping.process_patterns && Array.isArray(mapping.process_patterns)) {
        for (const pattern of mapping.process_patterns) {
          if (patternMap.has(pattern)) {
            const conflictingService = patternMap.get(pattern);
            result.addWarning(
              `service_name_mappings.${serviceKey}.process_patterns`,
              `Pattern '${pattern}' is also used by service '${conflictingService}'`
            );
          } else {
            patternMap.set(pattern, serviceKey);
          }
        }
      }
    }
  }

  /**
   * Sanitize service name to make it valid
   */
  sanitizeServiceName(name) {
    if (typeof name !== 'string') {
      return 'unknown-service';
    }

    // Convert to lowercase and replace invalid characters
    let sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      .replace(/-+/g, '-'); // Collapse multiple dashes

    // Ensure minimum length
    if (sanitized.length < this.rules.service_name.min_length) {
      sanitized = 'service-' + sanitized;
    }

    // Ensure maximum length
    if (sanitized.length > this.rules.service_name.max_length) {
      sanitized = sanitized.substring(0, this.rules.service_name.max_length);
    }

    // Ensure it doesn't end with dash
    sanitized = sanitized.replace(/-$/, '');

    return sanitized || 'unknown-service';
  }

  /**
   * Validate single service name for quick checks
   */
  validateServiceNameQuick(name) {
    const result = new ValidationResult();
    this.validateServiceName(name, 'serviceName', result);
    return result;
  }

  /**
   * Update performance statistics
   */
  updateStats(validationTime, errorCount, warningCount) {
    this.stats.validationCount++;
    this.stats.totalErrors += errorCount;
    this.stats.totalWarnings += warningCount;
    this.stats.validationTimes.push(validationTime);

    // Keep only last 100 validation times
    if (this.stats.validationTimes.length > 100) {
      this.stats.validationTimes = this.stats.validationTimes.slice(-100);
    }

    this.stats.avgValidationTime = this.stats.validationTimes.reduce((a, b) => a + b, 0) / this.stats.validationTimes.length;
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      validationCount: this.stats.validationCount,
      totalErrors: this.stats.totalErrors,
      totalWarnings: this.stats.totalWarnings,
      avgValidationTime: this.stats.avgValidationTime,
      rules: this.rules
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      validationCount: 0,
      totalErrors: 0,
      totalWarnings: 0,
      avgValidationTime: 0,
      validationTimes: []
    };
  }
}

// Export singleton instance and class
const defaultValidator = new MappingValidator();

module.exports = {
  MappingValidator,
  ValidationResult,
  defaultValidator,

  // Convenience methods using default validator
  validateConfig(config) {
    return defaultValidator.validateConfig(config);
  },

  validateServiceName(name) {
    return defaultValidator.validateServiceNameQuick(name);
  },

  sanitizeServiceName(name) {
    return defaultValidator.sanitizeServiceName(name);
  },

  getStats() {
    return defaultValidator.getStats();
  }
};