/**
 * Name Validation Module
 * Provides sanitization and validation functions for service names
 * according to the ServiceNameResolver interface contract
 */

/**
 * Validation rules for service names
 */
const VALIDATION_RULES = {
  serviceName: {
    minLength: 1,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9_-]+$/,
    description: 'Service names must be 1-50 characters containing only alphanumeric, dash, and underscore'
  },
  displayName: {
    minLength: 1,
    maxLength: 100,
    pattern: /^[^\r\n\t]+$/,
    description: 'Display names must be 1-100 characters with no control characters'
  }
};

/**
 * Reserved service names that should not be used
 */
const RESERVED_NAMES = new Set([
  'unknown',
  'error',
  'system',
  'root',
  'admin',
  'null',
  'undefined',
  'default',
  'anonymous',
  'guest',
  'temp',
  'temporary',
  'test',
  'debug'
]);

/**
 * Common service name patterns for suggestion
 */
const COMMON_PATTERNS = {
  terminals: ['terminal', 'shell', 'bash', 'zsh', 'fish'],
  devServers: ['dev-server', 'development', 'local-server'],
  buildTools: ['build', 'compiler', 'bundler'],
  testRunners: ['tests', 'testing', 'test-runner'],
  apiServices: ['api', 'service', 'server', 'backend']
};

/**
 * Service name validator
 */
class NameValidator {
  constructor() {
    this.validationCache = new Map();
  }

  /**
   * Validate service name according to contract rules
   */
  validateServiceName(name) {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        errors: ['Service name must be a non-empty string'],
        warnings: []
      };
    }

    // Check cache first
    if (this.validationCache.has(name)) {
      return this.validationCache.get(name);
    }

    const errors = [];
    const warnings = [];
    const rules = VALIDATION_RULES.serviceName;

    // Length validation
    if (name.length < rules.minLength) {
      errors.push(`Service name must be at least ${rules.minLength} character`);
    } else if (name.length > rules.maxLength) {
      errors.push(`Service name must be no more than ${rules.maxLength} characters`);
    }

    // Pattern validation
    if (!rules.pattern.test(name)) {
      errors.push('Service name must contain only alphanumeric characters, dashes, and underscores');
    }

    // Leading/trailing character validation
    if (name.startsWith('-') || name.endsWith('-') || name.startsWith('_') || name.endsWith('_')) {
      errors.push('Service name cannot start or end with dash or underscore');
    }

    // Consecutive special characters
    if (/[-_]{2,}/.test(name)) {
      errors.push('Service name cannot contain consecutive dashes or underscores');
    }

    // Reserved name check
    if (RESERVED_NAMES.has(name.toLowerCase())) {
      warnings.push(`'${name}' is a reserved name and may cause conflicts`);
    }

    // Common typos and suggestions
    const suggestions = this.getSuggestions(name);
    if (suggestions.length > 0 && !errors.length) {
      warnings.push(`Consider these alternatives: ${suggestions.join(', ')}`);
    }

    const result = {
      isValid: errors.length === 0,
      errors,
      warnings
    };

    // Cache the result
    this.validationCache.set(name, result);
    return result;
  }

  /**
   * Validate display name according to contract rules
   */
  validateDisplayName(name) {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        errors: ['Display name must be a non-empty string'],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];
    const rules = VALIDATION_RULES.displayName;

    // Length validation
    if (name.length < rules.minLength) {
      errors.push(`Display name must be at least ${rules.minLength} character`);
    } else if (name.length > rules.maxLength) {
      errors.push(`Display name must be no more than ${rules.maxLength} characters`);
    }

    // Pattern validation (no control characters)
    if (!rules.pattern.test(name)) {
      errors.push('Display name cannot contain control characters');
    }

    // Leading/trailing whitespace
    if (name !== name.trim()) {
      warnings.push('Display name has leading or trailing whitespace');
    }

    // Multiple consecutive spaces
    if (/\s{2,}/.test(name)) {
      warnings.push('Display name contains multiple consecutive spaces');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Sanitize service name to meet validation requirements
   */
  sanitizeServiceName(name) {
    if (!name || typeof name !== 'string') {
      return 'unknown-service';
    }

    let sanitized = name
      .toLowerCase()
      .trim()
      // Replace invalid characters with dashes
      .replace(/[^a-z0-9_-]/g, '-')
      // Remove leading/trailing special characters
      .replace(/^[-_]+|[-_]+$/g, '')
      // Replace consecutive special characters with single dash
      .replace(/[-_]{2,}/g, '-')
      // Limit length
      .slice(0, VALIDATION_RULES.serviceName.maxLength);

    // Ensure we have a valid result
    if (!sanitized || RESERVED_NAMES.has(sanitized)) {
      sanitized = 'unknown-service';
    }

    // Final validation check
    const validation = this.validateServiceName(sanitized);
    if (!validation.isValid) {
      return 'unknown-service';
    }

    return sanitized;
  }

  /**
   * Sanitize display name to meet validation requirements
   */
  sanitizeDisplayName(name) {
    if (!name || typeof name !== 'string') {
      return 'Unknown Service';
    }

    let sanitized = name
      .trim()
      // Remove control characters
      .replace(/[\r\n\t]/g, ' ')
      // Replace multiple spaces with single space
      .replace(/\s{2,}/g, ' ')
      // Limit length
      .slice(0, VALIDATION_RULES.displayName.maxLength);

    // Ensure we have a valid result
    if (!sanitized) {
      sanitized = 'Unknown Service';
    }

    return sanitized;
  }

  /**
   * Generate name suggestions based on input
   */
  getSuggestions(name) {
    const suggestions = [];
    const lowerName = name.toLowerCase();

    // Check for common patterns
    Object.entries(COMMON_PATTERNS).forEach(([category, patterns]) => {
      patterns.forEach(pattern => {
        if (lowerName.includes(pattern.replace('-', '')) ||
            pattern.includes(lowerName.replace('-', ''))) {
          suggestions.push(pattern);
        }
      });
    });

    // Remove duplicates and limit suggestions
    return [...new Set(suggestions)].slice(0, 3);
  }

  /**
   * Check if a name is reserved
   */
  isReservedName(name) {
    return RESERVED_NAMES.has(name.toLowerCase());
  }

  /**
   * Generate unique service name with suffix if needed
   */
  generateUniqueServiceName(baseName, existingNames = []) {
    let candidate = this.sanitizeServiceName(baseName);
    const existing = new Set(existingNames.map(name => name.toLowerCase()));

    if (!existing.has(candidate)) {
      return candidate;
    }

    // Try numbered suffixes
    for (let i = 2; i <= 999; i++) {
      const numbered = `${candidate}-${i}`;
      if (!existing.has(numbered) && numbered.length <= VALIDATION_RULES.serviceName.maxLength) {
        return numbered;
      }
    }

    // Fallback with timestamp
    const timestamp = Date.now().toString().slice(-6);
    return `${candidate.slice(0, 40)}-${timestamp}`;
  }

  /**
   * Validate configuration object containing multiple names
   */
  validateConfiguration(config) {
    const results = {
      isValid: true,
      serviceNameResults: {},
      displayNameResults: {},
      globalErrors: []
    };

    if (!config || typeof config !== 'object') {
      results.isValid = false;
      results.globalErrors.push('Configuration must be an object');
      return results;
    }

    // Validate each service name mapping
    Object.entries(config).forEach(([serviceName, displayName]) => {
      const serviceValidation = this.validateServiceName(serviceName);
      const displayValidation = this.validateDisplayName(displayName);

      results.serviceNameResults[serviceName] = serviceValidation;
      results.displayNameResults[serviceName] = displayValidation;

      if (!serviceValidation.isValid || !displayValidation.isValid) {
        results.isValid = false;
      }
    });

    return results;
  }

  /**
   * Clear validation cache
   */
  clearCache() {
    this.validationCache.clear();
  }

  /**
   * Get validation statistics
   */
  getStats() {
    return {
      cacheSize: this.validationCache.size,
      reservedNames: RESERVED_NAMES.size,
      validationRules: Object.keys(VALIDATION_RULES)
    };
  }
}

// Singleton instance
let validatorInstance = null;

/**
 * Get the name validator singleton
 */
function getNameValidator() {
  if (!validatorInstance) {
    validatorInstance = new NameValidator();
  }
  return validatorInstance;
}

/**
 * Utility functions for external use
 */
function validateServiceName(name) {
  return getNameValidator().validateServiceName(name);
}

function validateDisplayName(name) {
  return getNameValidator().validateDisplayName(name);
}

function sanitizeServiceName(name) {
  return getNameValidator().sanitizeServiceName(name);
}

function sanitizeDisplayName(name) {
  return getNameValidator().sanitizeDisplayName(name);
}

function isReservedName(name) {
  return getNameValidator().isReservedName(name);
}

function generateUniqueServiceName(baseName, existingNames) {
  return getNameValidator().generateUniqueServiceName(baseName, existingNames);
}

module.exports = {
  NameValidator,
  getNameValidator,
  validateServiceName,
  validateDisplayName,
  sanitizeServiceName,
  sanitizeDisplayName,
  isReservedName,
  generateUniqueServiceName,
  VALIDATION_RULES,
  RESERVED_NAMES,
  COMMON_PATTERNS
};