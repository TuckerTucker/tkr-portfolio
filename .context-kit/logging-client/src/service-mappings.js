/**
 * Service Mappings Module
 * Provides mapping logic between process types and user-friendly service names
 * Supporting both configuration-based and dynamic mapping strategies
 */

/**
 * Default service name mappings for common process types
 */
const DEFAULT_MAPPINGS = {
  // Terminal applications
  'terminal': 'Terminal',
  'zsh': 'Terminal',
  'bash': 'Terminal',
  'fish': 'Terminal',
  'sh': 'Terminal',

  // Development servers
  'vite-dev': 'Development Server',
  'vite-preview': 'Preview Server',
  'react-dev': 'React Dev Server',
  'nextjs-dev': 'Next.js Dev Server',
  'webpack-dev': 'Webpack Dev Server',
  'create-react-app': 'React Dev Server',

  // Build tools
  'vite-build': 'Vite Build',
  'webpack-build': 'Webpack Build',
  'rollup-build': 'Rollup Build',
  'esbuild-build': 'ESBuild',
  'parcel-build': 'Parcel Build',

  // Test runners
  'jest-tests': 'Jest Tests',
  'vitest-tests': 'Vitest Tests',
  'mocha-tests': 'Mocha Tests',
  'cypress-tests': 'Cypress Tests',
  'playwright-tests': 'Playwright Tests',

  // API services
  'context-kit-api': 'Context Kit API',
  'knowledge-graph': 'Knowledge Graph API',
  'express-server': 'Express Server',
  'fastify-server': 'Fastify Server',
  'http-server': 'HTTP Server',

  // Package managers
  'npm-start': 'NPM Start',
  'npm-dev': 'NPM Dev',
  'npm-build': 'NPM Build',
  'npm-test': 'NPM Test',
  'yarn-start': 'Yarn Start',
  'yarn-dev': 'Yarn Dev',
  'yarn-build': 'Yarn Build',

  // IDE and tools
  'vscode-terminal': 'VS Code Terminal',
  'node-inspector': 'Node Inspector',
  'nodemon': 'Nodemon'
};

/**
 * Category-based mappings for process types
 */
const CATEGORY_MAPPINGS = {
  'terminal': {
    default: 'Terminal',
    patterns: {
      'Apple_Terminal': 'Terminal.app',
      'iTerm.app': 'iTerm2',
      'vscode': 'VS Code Terminal',
      'tmux': 'Terminal (tmux)',
      'screen': 'Terminal (screen)'
    }
  },
  'dev-server': {
    default: 'Development Server',
    patterns: {
      'vite': 'Vite Dev Server',
      'react': 'React Dev Server',
      'nextjs': 'Next.js Dev Server',
      'webpack': 'Webpack Dev Server',
      'parcel': 'Parcel Dev Server'
    }
  },
  'build-tool': {
    default: 'Build Tool',
    patterns: {
      'vite': 'Vite Build',
      'webpack': 'Webpack Build',
      'rollup': 'Rollup Build',
      'esbuild': 'ESBuild',
      'parcel': 'Parcel Build'
    }
  },
  'test-runner': {
    default: 'Test Runner',
    patterns: {
      'jest': 'Jest Tests',
      'vitest': 'Vitest Tests',
      'mocha': 'Mocha Tests',
      'cypress': 'Cypress Tests',
      'playwright': 'Playwright Tests'
    }
  },
  'api-service': {
    default: 'API Service',
    patterns: {
      'express': 'Express Server',
      'fastify': 'Fastify Server',
      'koa': 'Koa Server',
      'nest': 'NestJS Server'
    }
  }
};

/**
 * Service mapping manager
 */
class ServiceMappings {
  constructor() {
    this.customMappings = new Map();
    this.initializeDefaults();
  }

  /**
   * Initialize with default mappings
   */
  initializeDefaults() {
    Object.entries(DEFAULT_MAPPINGS).forEach(([key, value]) => {
      this.customMappings.set(key, value);
    });
  }

  /**
   * Get display name for a process type
   */
  getDisplayName(processType, subtype = null, category = null) {
    // Direct mapping lookup
    const directKey = subtype ? `${processType}-${subtype}` : processType;
    if (this.customMappings.has(directKey)) {
      return this.customMappings.get(directKey);
    }

    // Category-based lookup
    if (category && CATEGORY_MAPPINGS[category]) {
      const categoryMapping = CATEGORY_MAPPINGS[category];

      if (subtype && categoryMapping.patterns[subtype]) {
        return categoryMapping.patterns[subtype];
      }

      return categoryMapping.default;
    }

    // Fallback to formatted process type
    return this.formatProcessType(processType, subtype);
  }

  /**
   * Set custom mapping
   */
  setMapping(processType, displayName) {
    this.customMappings.set(processType, displayName);
  }

  /**
   * Get custom mapping
   */
  getMapping(processType) {
    return this.customMappings.get(processType) || null;
  }

  /**
   * Remove custom mapping
   */
  removeMapping(processType) {
    return this.customMappings.delete(processType);
  }

  /**
   * Get all custom mappings
   */
  getAllMappings() {
    return Object.fromEntries(this.customMappings);
  }

  /**
   * Clear all custom mappings
   */
  clearMappings() {
    this.customMappings.clear();
    this.initializeDefaults();
  }

  /**
   * Format process type into readable display name
   */
  formatProcessType(processType, subtype = null) {
    if (!processType) return 'Unknown Process';

    let formatted = processType
      .split(/[-_]/)
      .map(word => this.capitalize(word))
      .join(' ');

    if (subtype) {
      const formattedSubtype = subtype
        .split(/[-_]/)
        .map(word => this.capitalize(word))
        .join(' ');

      formatted += ` (${formattedSubtype})`;
    }

    return formatted;
  }

  /**
   * Generate service name suggestions based on process info
   */
  suggestServiceName(processInfo) {
    const { type, subtype, command } = processInfo;
    const suggestions = [];

    // Primary suggestion from mappings
    const primaryName = this.getDisplayName(type, subtype);
    if (primaryName) {
      suggestions.push(primaryName);
    }

    // Alternative based on command
    if (command && command !== 'node' && command !== 'unknown') {
      const commandName = this.formatProcessType(command);
      if (!suggestions.includes(commandName)) {
        suggestions.push(commandName);
      }
    }

    // Generic type-based suggestion
    const genericName = this.formatProcessType(type);
    if (!suggestions.includes(genericName)) {
      suggestions.push(genericName);
    }

    return suggestions.length > 0 ? suggestions : ['Unknown Service'];
  }

  /**
   * Check if a process type has a custom mapping
   */
  hasMapping(processType) {
    return this.customMappings.has(processType);
  }

  /**
   * Get mapping statistics
   */
  getStats() {
    return {
      totalMappings: this.customMappings.size,
      defaultMappings: Object.keys(DEFAULT_MAPPINGS).length,
      customMappings: this.customMappings.size - Object.keys(DEFAULT_MAPPINGS).length,
      categories: Object.keys(CATEGORY_MAPPINGS)
    };
  }

  /**
   * Export mappings to configuration format
   */
  exportMappings() {
    const mappings = {};

    for (const [key, value] of this.customMappings) {
      // Skip default mappings in export
      if (DEFAULT_MAPPINGS[key] !== value) {
        mappings[key] = value;
      }
    }

    return mappings;
  }

  /**
   * Import mappings from configuration
   */
  importMappings(mappings) {
    if (!mappings || typeof mappings !== 'object') {
      throw new Error('Invalid mappings object');
    }

    Object.entries(mappings).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) {
        this.customMappings.set(key, value.trim());
      }
    });
  }

  /**
   * Validate mapping configuration
   */
  validateMappings(mappings) {
    const errors = [];

    if (!mappings || typeof mappings !== 'object') {
      errors.push('Mappings must be an object');
      return { isValid: false, errors };
    }

    Object.entries(mappings).forEach(([key, value]) => {
      if (!key || typeof key !== 'string') {
        errors.push(`Invalid mapping key: ${key}`);
      }

      if (!value || typeof value !== 'string') {
        errors.push(`Invalid mapping value for key '${key}': ${value}`);
      }

      if (key.length > 50) {
        errors.push(`Mapping key too long (max 50 chars): ${key}`);
      }

      if (value.length > 100) {
        errors.push(`Mapping value too long (max 100 chars): ${value}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Helper method to capitalize words
   */
  capitalize(word) {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}

// Singleton instance
let mappingsInstance = null;

/**
 * Get the service mappings singleton
 */
function getServiceMappings() {
  if (!mappingsInstance) {
    mappingsInstance = new ServiceMappings();
  }
  return mappingsInstance;
}

/**
 * Utility functions for external use
 */
function getDisplayName(processType, subtype, category) {
  return getServiceMappings().getDisplayName(processType, subtype, category);
}

function setMapping(processType, displayName) {
  return getServiceMappings().setMapping(processType, displayName);
}

function suggestServiceName(processInfo) {
  return getServiceMappings().suggestServiceName(processInfo);
}

module.exports = {
  ServiceMappings,
  getServiceMappings,
  getDisplayName,
  setMapping,
  suggestServiceName,
  DEFAULT_MAPPINGS,
  CATEGORY_MAPPINGS
};