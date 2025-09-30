/**
 * Default Mappings and Fallback Scenarios
 * Provides built-in service configurations and fallback strategies
 */

/**
 * Built-in service mappings for common development scenarios
 * These serve as fallbacks when configuration files are unavailable
 */
const BUILT_IN_MAPPINGS = {
  // Terminal applications (highest priority for fallbacks)
  terminal: {
    display_name: "Terminal",
    category: "terminal",
    process_patterns: [
      "Terminal.app",
      "iTerm.app",
      "iTerm2.app",
      "zsh",
      "bash",
      "fish",
      "sh",
      "terminal"
    ]
  },

  // Development servers (most common in development)
  'vite-dev': {
    display_name: "Vite Development Server",
    category: "dev-server",
    process_patterns: [
      "vite.*dev",
      "npm.*run.*dev",
      "yarn.*dev"
    ]
  },

  'react-dev': {
    display_name: "React Development Server",
    category: "dev-server",
    process_patterns: [
      "react-scripts.*start",
      "create-react-app"
    ]
  },

  // Build tools (essential for CI/CD)
  'node-build': {
    display_name: "Node.js Build Process",
    category: "build-tool",
    process_patterns: [
      "npm.*run.*build",
      "yarn.*build",
      "node.*build"
    ]
  },

  // Test runners (common in development workflows)
  'test-runner': {
    display_name: "Test Runner",
    category: "test-runner",
    process_patterns: [
      "jest",
      "vitest",
      "npm.*test",
      "yarn.*test"
    ]
  }
};

/**
 * Category-based fallback mappings
 * Used when process detection identifies a category but no specific mapping
 */
const CATEGORY_FALLBACKS = {
  terminal: {
    display_name: "Terminal Application",
    category: "terminal",
    patterns: ["terminal", "shell", "bash", "zsh", "sh"]
  },

  'dev-server': {
    display_name: "Development Server",
    category: "dev-server",
    patterns: ["dev", "serve", "server", "start"]
  },

  'build-tool': {
    display_name: "Build Tool",
    category: "build-tool",
    patterns: ["build", "compile", "bundle", "pack"]
  },

  'test-runner': {
    display_name: "Test Runner",
    category: "test-runner",
    patterns: ["test", "spec", "e2e", "unit"]
  },

  'api-service': {
    display_name: "API Service",
    category: "api-service",
    patterns: ["api", "server", "service", "backend"]
  },

  database: {
    display_name: "Database Service",
    category: "database",
    patterns: ["db", "database", "sql", "mongo", "redis"]
  },

  'dev-tool': {
    display_name: "Development Tool",
    category: "dev-tool",
    patterns: ["tool", "util", "helper", "cli"]
  },

  'mcp-service': {
    display_name: "MCP Service",
    category: "mcp-service",
    patterns: ["mcp", "context", "claude"]
  }
};

/**
 * Process type patterns for auto-detection
 * Maps common process indicators to service categories
 */
const PROCESS_TYPE_PATTERNS = {
  // Terminal patterns
  terminal: [
    /terminal/i,
    /shell/i,
    /bash/i,
    /zsh/i,
    /fish/i,
    /csh/i,
    /tcsh/i,
    /sh$/i,
    /iTerm/i
  ],

  // Development server patterns
  'dev-server': [
    /dev.*server/i,
    /serve/i,
    /webpack.*dev/i,
    /vite.*dev/i,
    /next.*dev/i,
    /react.*start/i,
    /npm.*run.*dev/i,
    /yarn.*dev/i
  ],

  // Build tool patterns
  'build-tool': [
    /build/i,
    /compile/i,
    /bundle/i,
    /webpack(?!.*dev)/i,
    /rollup/i,
    /parcel/i,
    /tsc/i,
    /typescript/i
  ],

  // Test runner patterns
  'test-runner': [
    /jest/i,
    /vitest/i,
    /mocha/i,
    /jasmine/i,
    /karma/i,
    /cypress/i,
    /playwright/i,
    /test/i,
    /spec/i
  ],

  // API service patterns
  'api-service': [
    /server/i,
    /api/i,
    /service/i,
    /backend/i,
    /express/i,
    /fastify/i,
    /koa/i,
    /hapi/i
  ],

  // Database patterns
  database: [
    /mysql/i,
    /postgres/i,
    /mongodb/i,
    /redis/i,
    /sqlite/i,
    /database/i,
    /db/i
  ]
};

/**
 * Environment-specific mappings
 * Different configurations for different environments
 */
const ENVIRONMENT_MAPPINGS = {
  development: {
    priority_categories: ['terminal', 'dev-server', 'test-runner'],
    naming_style: 'friendly', // vs 'technical'
    include_version: false
  },

  production: {
    priority_categories: ['api-service', 'database', 'build-tool'],
    naming_style: 'technical',
    include_version: true
  },

  testing: {
    priority_categories: ['test-runner', 'build-tool'],
    naming_style: 'descriptive',
    include_version: false
  }
};

/**
 * Default Mappings Manager
 * Provides fallback strategies and built-in configurations
 */
class DefaultMappings {
  constructor() {
    this.environment = process.env.NODE_ENV || 'development';
    this.cache = new Map();
    this.stats = {
      fallbackUsage: 0,
      categoryDetections: 0,
      builtInMappingHits: 0
    };
  }

  /**
   * Get built-in mappings
   */
  getBuiltInMappings() {
    return { ...BUILT_IN_MAPPINGS };
  }

  /**
   * Get category fallbacks
   */
  getCategoryFallbacks() {
    return { ...CATEGORY_FALLBACKS };
  }

  /**
   * Detect service category from process information
   */
  detectServiceCategory(processInfo) {
    const cacheKey = `category:${JSON.stringify(processInfo)}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    let detectedCategory = 'unknown';
    let confidence = 0;

    // Check process name/command against patterns
    const processName = processInfo.name || processInfo.command || '';
    const processArgs = processInfo.args ? processInfo.args.join(' ') : '';
    const fullCommand = `${processName} ${processArgs}`.toLowerCase();

    for (const [category, patterns] of Object.entries(PROCESS_TYPE_PATTERNS)) {
      for (const pattern of patterns) {
        if (pattern.test(fullCommand)) {
          detectedCategory = category;
          confidence = 0.8; // High confidence for pattern match
          break;
        }
      }

      if (confidence > 0) break;
    }

    // Lower confidence detection based on keywords
    if (confidence === 0) {
      for (const [category, fallback] of Object.entries(CATEGORY_FALLBACKS)) {
        for (const keyword of fallback.patterns) {
          if (fullCommand.includes(keyword)) {
            detectedCategory = category;
            confidence = 0.5; // Medium confidence for keyword match
            break;
          }
        }

        if (confidence > 0) break;
      }
    }

    const result = {
      category: detectedCategory,
      confidence,
      source: 'process-detection'
    };

    this.cache.set(cacheKey, result);
    this.stats.categoryDetections++;

    return result;
  }

  /**
   * Get fallback service name based on category
   */
  getFallbackForCategory(category, processInfo = null) {
    const fallback = CATEGORY_FALLBACKS[category];

    if (!fallback) {
      return this.getUnknownServiceFallback(processInfo);
    }

    this.stats.fallbackUsage++;

    let serviceName = category;
    let displayName = fallback.display_name;

    // Enhance with process information if available
    if (processInfo) {
      const processName = processInfo.name || processInfo.command || '';

      // Try to make it more specific
      if (processName) {
        const cleanName = this.cleanProcessName(processName);
        if (cleanName && cleanName !== category) {
          serviceName = `${category}-${cleanName}`;
          displayName = `${fallback.display_name} (${cleanName})`;
        }
      }
    }

    return {
      serviceName: this.sanitizeServiceName(serviceName),
      displayName,
      category,
      confidence: 0.6,
      source: 'category-fallback'
    };
  }

  /**
   * Get fallback based on package.json information
   */
  getFallbackFromPackage(packageInfo) {
    if (!packageInfo || !packageInfo.name) {
      return null;
    }

    const packageName = packageInfo.name;
    let category = 'unknown';
    let displayName = packageName;

    // Detect category from package name or scripts
    if (packageInfo.scripts) {
      const scripts = Object.keys(packageInfo.scripts);

      if (scripts.includes('dev') || scripts.includes('start')) {
        category = 'dev-server';
        displayName = `${packageName} Development Server`;
      } else if (scripts.includes('build')) {
        category = 'build-tool';
        displayName = `${packageName} Build`;
      } else if (scripts.includes('test')) {
        category = 'test-runner';
        displayName = `${packageName} Tests`;
      }
    }

    // Clean up package name for service name
    const serviceName = this.sanitizeServiceName(packageName);

    return {
      serviceName,
      displayName,
      category,
      confidence: 0.7,
      source: 'package-name'
    };
  }

  /**
   * Ultimate fallback when all else fails
   */
  getUnknownServiceFallback(processInfo = null) {
    let serviceName = 'unknown-service';
    let displayName = 'Unknown Service';

    // Try to use process information
    if (processInfo) {
      const processName = processInfo.name || processInfo.command || '';

      if (processName) {
        const cleanName = this.cleanProcessName(processName);
        if (cleanName) {
          serviceName = `unknown-${cleanName}`;
          displayName = `Unknown Service (${cleanName})`;
        }
      }
    }

    // Add timestamp for uniqueness in extreme cases
    const timestamp = Date.now().toString(36);
    serviceName = `${serviceName}-${timestamp}`;

    this.stats.fallbackUsage++;

    return {
      serviceName: this.sanitizeServiceName(serviceName),
      displayName,
      category: 'unknown',
      confidence: 0.1,
      source: 'ultimate-fallback'
    };
  }

  /**
   * Get built-in mapping by key
   */
  getBuiltInMapping(key) {
    const mapping = BUILT_IN_MAPPINGS[key];

    if (mapping) {
      this.stats.builtInMappingHits++;
      return { ...mapping };
    }

    return null;
  }

  /**
   * Find built-in mapping by process pattern
   */
  findBuiltInMappingByPattern(processPattern) {
    for (const [serviceKey, mapping] of Object.entries(BUILT_IN_MAPPINGS)) {
      if (mapping.process_patterns) {
        for (const pattern of mapping.process_patterns) {
          try {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(processPattern)) {
              this.stats.builtInMappingHits++;

              return {
                serviceKey,
                mapping: { ...mapping },
                matchedPattern: pattern
              };
            }
          } catch (error) {
            console.warn(`Invalid built-in pattern: ${pattern} in ${serviceKey}`);
          }
        }
      }
    }

    return null;
  }

  /**
   * Clean process name for use in service names
   */
  cleanProcessName(processName) {
    if (!processName || typeof processName !== 'string') {
      return '';
    }

    return processName
      .toLowerCase()
      .replace(/\.(app|exe|bin)$/i, '') // Remove common extensions
      .replace(/[^a-z0-9]/g, '-')       // Replace non-alphanumeric with dash
      .replace(/^-+|-+$/g, '')          // Remove leading/trailing dashes
      .replace(/-+/g, '-')              // Collapse multiple dashes
      .substring(0, 20);                // Limit length
  }

  /**
   * Sanitize service name to ensure it's valid
   */
  sanitizeServiceName(name) {
    if (!name || typeof name !== 'string') {
      return 'unknown-service';
    }

    let sanitized = name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    // Ensure minimum length
    if (sanitized.length < 1) {
      sanitized = 'service';
    }

    // Ensure maximum length
    if (sanitized.length > 50) {
      sanitized = sanitized.substring(0, 50);
    }

    // Ensure it doesn't end with dash
    sanitized = sanitized.replace(/-$/, '');

    return sanitized || 'unknown-service';
  }

  /**
   * Get environment-specific configuration
   */
  getEnvironmentConfig() {
    return ENVIRONMENT_MAPPINGS[this.environment] || ENVIRONMENT_MAPPINGS.development;
  }

  /**
   * Check if a service mapping is available in built-ins
   */
  hasBuiltInMapping(serviceKey) {
    return serviceKey in BUILT_IN_MAPPINGS;
  }

  /**
   * Get all available service categories
   */
  getAvailableCategories() {
    return Object.keys(CATEGORY_FALLBACKS);
  }

  /**
   * Get statistics about fallback usage
   */
  getStats() {
    return {
      ...this.stats,
      environment: this.environment,
      cacheSize: this.cache.size,
      builtInMappingCount: Object.keys(BUILT_IN_MAPPINGS).length,
      categoryCount: Object.keys(CATEGORY_FALLBACKS).length
    };
  }

  /**
   * Clear cache and reset statistics
   */
  reset() {
    this.cache.clear();
    this.stats = {
      fallbackUsage: 0,
      categoryDetections: 0,
      builtInMappingHits: 0
    };
  }
}

// Export singleton instance and static data
const defaultMappings = new DefaultMappings();

module.exports = {
  DefaultMappings,
  defaultMappings,
  BUILT_IN_MAPPINGS,
  CATEGORY_FALLBACKS,
  PROCESS_TYPE_PATTERNS,
  ENVIRONMENT_MAPPINGS,

  // Convenience methods using default instance
  detectServiceCategory(processInfo) {
    return defaultMappings.detectServiceCategory(processInfo);
  },

  getFallbackForCategory(category, processInfo) {
    return defaultMappings.getFallbackForCategory(category, processInfo);
  },

  getFallbackFromPackage(packageInfo) {
    return defaultMappings.getFallbackFromPackage(packageInfo);
  },

  getUnknownServiceFallback(processInfo) {
    return defaultMappings.getUnknownServiceFallback(processInfo);
  },

  findBuiltInMappingByPattern(pattern) {
    return defaultMappings.findBuiltInMappingByPattern(pattern);
  },

  getStats() {
    return defaultMappings.getStats();
  }
};