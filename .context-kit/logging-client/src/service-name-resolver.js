/**
 * Service Name Resolution Engine
 * Implements the ServiceNameResolver interface contract for consistent service identification
 * across the tkr-context-kit ecosystem.
 */

const { getProcessDetector } = require('./process-detector');

/**
 * Service categories for UI grouping and filtering
 */
const ServiceCategory = {
  TERMINAL: 'terminal',
  DEV_SERVER: 'dev-server',
  BUILD_TOOL: 'build-tool',
  TEST_RUNNER: 'test-runner',
  API_SERVICE: 'api-service',
  UNKNOWN: 'unknown'
};

/**
 * Resolution source tracking for audit and debugging
 */
const ResolutionSource = {
  EXPLICIT_CONFIG: 'explicit-config',
  PROCESS_DETECTION: 'process-detection',
  PACKAGE_NAME: 'package-name',
  FALLBACK: 'fallback'
};

/**
 * Main service name resolver implementing the contract interface
 */
class ServiceNameResolver {
  constructor() {
    this.nameMappings = new Map();
    this.processDetector = getProcessDetector();
    this.cache = new Map();
    this.initializeDefaultMappings();
  }

  /**
   * Initialize default service name mappings
   */
  initializeDefaultMappings() {
    // Terminal applications
    this.setNameMapping('terminal', 'Terminal');
    this.setNameMapping('zsh', 'Terminal');
    this.setNameMapping('bash', 'Terminal');
    this.setNameMapping('fish', 'Terminal');

    // Development servers
    this.setNameMapping('vite-dev', 'Development Server');
    this.setNameMapping('react-dev', 'React Dev Server');
    this.setNameMapping('nextjs-dev', 'Next.js Dev Server');

    // Build tools
    this.setNameMapping('vite-build', 'Vite Build');
    this.setNameMapping('webpack-build', 'Webpack Build');
    this.setNameMapping('rollup-build', 'Rollup Build');

    // Test runners
    this.setNameMapping('jest-tests', 'Jest Tests');
    this.setNameMapping('vitest-tests', 'Vitest Tests');
    this.setNameMapping('mocha-tests', 'Mocha Tests');

    // API services
    this.setNameMapping('context-kit-api', 'Context Kit API');
    this.setNameMapping('knowledge-graph', 'Knowledge Graph API');
  }

  /**
   * Primary resolution method implementing the interface contract
   * @param {Object} context - Service context with process info and environment
   * @returns {Object} ServiceNameResult with name, display, category, confidence, source
   */
  resolveServiceName(context = {}) {
    const startTime = performance.now();

    try {
      // Check cache first for performance
      const cacheKey = this.generateCacheKey(context);
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      // Priority 1: Explicit configuration via environment variable
      if (context.explicitName || process.env.TKR_SERVICE_NAME) {
        const explicitName = context.explicitName || process.env.TKR_SERVICE_NAME;
        const result = {
          serviceName: this.sanitizeServiceName(explicitName),
          displayName: this.formatDisplayName(explicitName),
          category: this.inferCategoryFromName(explicitName),
          confidence: 1.0,
          source: ResolutionSource.EXPLICIT_CONFIG
        };
        this.cache.set(cacheKey, result);
        return result;
      }

      // Get process information
      const processInfo = context.processInfo || this.processDetector.getProcessInfo();

      // Priority 2: Process detection analysis
      const processResult = this.resolveFromProcessDetection(processInfo, context);
      if (processResult.confidence > 0.7) {
        this.cache.set(cacheKey, processResult);
        return processResult;
      }

      // Priority 3: Package.json name field
      const packageResult = this.resolveFromPackageInfo(context.packageInfo);
      if (packageResult.confidence > 0.5) {
        this.cache.set(cacheKey, packageResult);
        return packageResult;
      }

      // Priority 4: Friendly fallback
      const fallbackResult = this.getFallbackName(processInfo);
      this.cache.set(cacheKey, fallbackResult);
      return fallbackResult;

    } catch (error) {
      // Error fallback
      const errorResult = {
        serviceName: 'unknown-service',
        displayName: 'Unknown Service',
        category: ServiceCategory.UNKNOWN,
        confidence: 0.1,
        source: ResolutionSource.FALLBACK
      };
      return errorResult;
    } finally {
      const duration = performance.now() - startTime;
      if (duration > 1) {
        console.warn(`ServiceNameResolver.resolveServiceName took ${duration.toFixed(2)}ms`);
      }
    }
  }

  /**
   * Resolve service name from process detection
   */
  resolveFromProcessDetection(processInfo, context) {
    if (!processInfo) {
      return { confidence: 0 };
    }

    const { type, subtype } = processInfo;
    let serviceName = '';
    let displayName = '';
    let category = ServiceCategory.UNKNOWN;
    let confidence = 0.8;

    // Enhanced terminal detection
    if (this.isTerminalProcess(processInfo, context)) {
      serviceName = 'terminal';
      displayName = 'Terminal';
      category = ServiceCategory.TERMINAL;
      confidence = 0.95;
    }
    // Development servers
    else if (type === 'dev-server') {
      serviceName = `${subtype}-dev`;
      displayName = this.getNameMapping(`${subtype}-dev`) || `${this.capitalize(subtype)} Dev Server`;
      category = ServiceCategory.DEV_SERVER;
      confidence = 0.9;
    }
    // Build tools
    else if (type === 'build-tool') {
      serviceName = `${subtype}-build`;
      displayName = this.getNameMapping(`${subtype}-build`) || `${this.capitalize(subtype)} Build`;
      category = ServiceCategory.BUILD_TOOL;
      confidence = 0.85;
    }
    // Test runners
    else if (type === 'test-runner') {
      serviceName = `${subtype}-tests`;
      displayName = this.getNameMapping(`${subtype}-tests`) || `${this.capitalize(subtype)} Tests`;
      category = ServiceCategory.TEST_RUNNER;
      confidence = 0.85;
    }
    // HTTP/API servers
    else if (type === 'http-server' || type === 'node') {
      serviceName = this.inferApiServiceName(processInfo);
      displayName = this.getNameMapping(serviceName) || this.formatDisplayName(serviceName);
      category = ServiceCategory.API_SERVICE;
      confidence = 0.7;
    }
    // NPM/Yarn processes
    else if (type === 'npm' || type === 'yarn') {
      serviceName = `${type}-${subtype}`;
      displayName = `${type.toUpperCase()} ${this.capitalize(subtype)}`;
      category = this.inferCategoryFromSubtype(subtype);
      confidence = 0.75;
    }
    else {
      return { confidence: 0 };
    }

    return {
      serviceName: this.sanitizeServiceName(serviceName),
      displayName,
      category,
      confidence,
      source: ResolutionSource.PROCESS_DETECTION
    };
  }

  /**
   * Enhanced terminal detection using TERM_PROGRAM and other environment variables
   */
  isTerminalProcess(processInfo, context) {
    const env = context.environmentVars || process.env;

    // Check TERM_PROGRAM for terminal applications
    if (env.TERM_PROGRAM) {
      const termPrograms = ['Apple_Terminal', 'iTerm.app', 'vscode', 'Terminal.app'];
      if (termPrograms.includes(env.TERM_PROGRAM)) {
        return true;
      }
    }

    // Check for terminal-specific environment variables
    if (env.TERM && !env.TERM.includes('dumb')) {
      const shellTypes = ['zsh', 'bash', 'fish', 'sh'];
      if (processInfo.command && shellTypes.some(shell => processInfo.command.includes(shell))) {
        return true;
      }
    }

    // Check process title and command for shell indicators
    if (processInfo.type === 'terminal' ||
        (processInfo.title && ['zsh', 'bash', 'fish'].includes(processInfo.title))) {
      return true;
    }

    return false;
  }

  /**
   * Resolve service name from package.json information
   */
  resolveFromPackageInfo(packageInfo) {
    if (!packageInfo || !packageInfo.name) {
      return { confidence: 0 };
    }

    const packageName = packageInfo.name;
    const sanitizedName = this.sanitizeServiceName(packageName);

    return {
      serviceName: sanitizedName,
      displayName: this.formatDisplayName(packageName),
      category: this.inferCategoryFromPackage(packageInfo),
      confidence: 0.6,
      source: ResolutionSource.PACKAGE_NAME
    };
  }

  /**
   * Infer API service name from process information
   */
  inferApiServiceName(processInfo) {
    const { command, args = [] } = processInfo;

    // Check for known API service patterns
    if (command && command.includes('knowledge-graph')) {
      return 'knowledge-graph-api';
    }

    if (args.some(arg => arg.includes('server') || arg.includes('api'))) {
      return 'api-server';
    }

    // Check for port environment variables
    if (process.env.PORT) {
      return `api-service-${process.env.PORT}`;
    }

    return 'node-service';
  }

  /**
   * Infer category from package.json dependencies and scripts
   */
  inferCategoryFromPackage(packageInfo) {
    const { dependencies = {}, devDependencies = {}, scripts = {} } = packageInfo;
    const allDeps = { ...dependencies, ...devDependencies };

    // Check for development server indicators
    if (allDeps.vite || allDeps['@vitejs/plugin-react'] || scripts.dev) {
      return ServiceCategory.DEV_SERVER;
    }

    // Check for test runner indicators
    if (allDeps.jest || allDeps.vitest || scripts.test) {
      return ServiceCategory.TEST_RUNNER;
    }

    // Check for build tool indicators
    if (allDeps.webpack || allDeps.rollup || scripts.build) {
      return ServiceCategory.BUILD_TOOL;
    }

    // Check for API service indicators
    if (allDeps.express || allDeps.fastify || allDeps.koa) {
      return ServiceCategory.API_SERVICE;
    }

    return ServiceCategory.UNKNOWN;
  }

  /**
   * Get fallback name based on process type
   */
  getFallbackName(processInfo) {
    if (!processInfo) {
      return {
        serviceName: 'unknown-service',
        displayName: 'Unknown Service',
        category: ServiceCategory.UNKNOWN,
        confidence: 0.1,
        source: ResolutionSource.FALLBACK
      };
    }

    const { type, command } = processInfo;
    let serviceName = 'unknown-service';
    let displayName = 'Unknown Service';
    let category = ServiceCategory.UNKNOWN;

    if (command && command !== 'node' && command !== 'unknown') {
      serviceName = this.sanitizeServiceName(command);
      displayName = this.formatDisplayName(command);
    } else if (type) {
      serviceName = this.sanitizeServiceName(type);
      displayName = this.capitalize(type);
    }

    return {
      serviceName,
      displayName,
      category,
      confidence: 0.3,
      source: ResolutionSource.FALLBACK
    };
  }

  /**
   * Set name mapping configuration
   */
  setNameMapping(processType, displayName) {
    this.nameMappings.set(processType, displayName);
    this.clearCache(); // Clear cache when mappings change
  }

  /**
   * Get name mapping for process type
   */
  getNameMapping(processType) {
    return this.nameMappings.get(processType) || null;
  }

  /**
   * Validate service name according to interface contract
   */
  validateServiceName(name) {
    if (!name || typeof name !== 'string') {
      return {
        isValid: false,
        errors: ['Service name must be a non-empty string']
      };
    }

    const errors = [];

    if (name.length < 1 || name.length > 50) {
      errors.push('Service name must be 1-50 characters');
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
      errors.push('Service name must contain only alphanumeric characters, dashes, and underscores');
    }

    if (name.startsWith('-') || name.endsWith('-') || name.startsWith('_') || name.endsWith('_')) {
      errors.push('Service name cannot start or end with dash or underscore');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Sanitize service name to meet validation requirements
   */
  sanitizeServiceName(name) {
    if (!name || typeof name !== 'string') {
      return 'unknown-service';
    }

    return name
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '-')
      .replace(/^[-_]+|[-_]+$/g, '')
      .replace(/[-_]{2,}/g, '-')
      .slice(0, 50) || 'unknown-service';
  }

  /**
   * Helper methods
   */
  generateCacheKey(context) {
    const parts = [
      context.explicitName || process.env.TKR_SERVICE_NAME || '',
      JSON.stringify(context.processInfo || {}),
      JSON.stringify(context.packageInfo || {})
    ];
    return parts.join('|');
  }

  clearCache() {
    this.cache.clear();
  }

  formatDisplayName(name) {
    return name
      .split(/[-_]/)
      .map(part => this.capitalize(part))
      .join(' ');
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  inferCategoryFromName(name) {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('terminal') || lowerName.includes('shell')) {
      return ServiceCategory.TERMINAL;
    }
    if (lowerName.includes('dev') || lowerName.includes('server')) {
      return ServiceCategory.DEV_SERVER;
    }
    if (lowerName.includes('build')) {
      return ServiceCategory.BUILD_TOOL;
    }
    if (lowerName.includes('test')) {
      return ServiceCategory.TEST_RUNNER;
    }
    if (lowerName.includes('api') || lowerName.includes('service')) {
      return ServiceCategory.API_SERVICE;
    }

    return ServiceCategory.UNKNOWN;
  }

  inferCategoryFromSubtype(subtype) {
    if (['dev', 'start'].includes(subtype)) {
      return ServiceCategory.DEV_SERVER;
    }
    if (subtype === 'build') {
      return ServiceCategory.BUILD_TOOL;
    }
    if (subtype === 'test') {
      return ServiceCategory.TEST_RUNNER;
    }
    return ServiceCategory.UNKNOWN;
  }
}

// Singleton instance for performance
let resolverInstance = null;

/**
 * Get the service name resolver singleton
 */
function getServiceNameResolver() {
  if (!resolverInstance) {
    resolverInstance = new ServiceNameResolver();
  }
  return resolverInstance;
}

module.exports = {
  ServiceNameResolver,
  getServiceNameResolver,
  ServiceCategory,
  ResolutionSource
};