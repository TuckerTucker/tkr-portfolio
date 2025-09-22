/**
 * Process Filter for NODE_OPTIONS Integration
 * Smart process detection and filtering for tkr-context-kit logging
 *
 * Features:
 * - Process name detection and filtering
 * - Path-based skip patterns
 * - Performance-conscious filtering
 * - Environment variable configuration
 * - Integration with Wave 1 enhanced logging client
 */

const path = require('path');
const fs = require('fs');

class ProcessFilter {
  constructor(options = {}) {
    this.options = {
      processFilter: options.processFilter || this.getDefaultProcessFilter(),
      skipPatterns: options.skipPatterns || this.getDefaultSkipPatterns(),
      enableChildProcesses: options.enableChildProcesses !== false,
      projectOnlyMode: options.projectOnlyMode !== false,
      verboseLogging: options.verboseLogging === true,
      ...options
    };

    this.processInfo = this.detectProcessInfo();
    this.projectRoot = this.findProjectRoot();
    this.shouldFilterCache = null; // Cache filter decision for performance
  }

  /**
   * Get default process filter from interface specification
   */
  getDefaultProcessFilter() {
    const envFilter = process.env.TKR_NODE_PROCESS_FILTER;
    if (envFilter) {
      return envFilter.split(',').map(p => p.trim());
    }
    return ['npm', 'yarn', 'node', 'tsx', 'ts-node'];
  }

  /**
   * Get default skip patterns from interface specification
   */
  getDefaultSkipPatterns() {
    const envPatterns = process.env.TKR_NODE_SKIP_PATTERNS;
    if (envPatterns) {
      return envPatterns.split(',').map(p => p.trim());
    }
    return ['node_modules', '.git', 'dist', 'build'];
  }

  /**
   * Detect comprehensive process information
   */
  detectProcessInfo() {
    const argv = process.argv || [];
    const execPath = process.execPath || '';
    const cwd = process.cwd();
    const ppid = process.ppid;
    const pid = process.pid;

    // Extract process command and arguments
    const command = argv.join(' ');
    const execName = path.basename(execPath);
    const firstArg = argv.length > 1 ? path.basename(argv[1]) : '';

    // Determine process type and subtype
    const processType = this.determineProcessType(execName, firstArg, argv, cwd);

    return {
      pid,
      ppid,
      execPath,
      execName,
      argv,
      command,
      cwd,
      type: processType.type,
      subtype: processType.subtype,
      matchedFilter: processType.matchedFilter,
      isDevelopment: this.isDevelopmentEnvironment(cwd, argv),
      startTime: Date.now()
    };
  }

  /**
   * Determine process type and subtype based on execution context
   */
  determineProcessType(execName, firstArg, argv, cwd) {
    const command = argv.join(' ').toLowerCase();

    // Ensure processFilter is an array
    const processFilterArray = Array.isArray(this.options.processFilter)
      ? this.options.processFilter
      : [];

    // Check against process filter
    const matchedFilter = processFilterArray.find(filter => {
      return execName.includes(filter) ||
             firstArg.includes(filter) ||
             command.includes(filter);
    });

    if (!matchedFilter) {
      return { type: 'other', subtype: 'unfiltered', matchedFilter: null };
    }

    // Determine specific process types
    if (execName.includes('npm') || command.includes('npm')) {
      return this.categorizeNpmProcess(argv, { type: 'npm', matchedFilter });
    }

    if (execName.includes('yarn') || command.includes('yarn')) {
      return this.categorizeYarnProcess(argv, { type: 'yarn', matchedFilter });
    }

    if (execName.includes('node') || firstArg.includes('node')) {
      return this.categorizeNodeProcess(argv, { type: 'node', matchedFilter });
    }

    if (execName.includes('tsx') || firstArg.includes('tsx') || command.includes('tsx')) {
      return { type: 'typescript', subtype: 'tsx-runner', matchedFilter };
    }

    if (execName.includes('ts-node') || firstArg.includes('ts-node') || command.includes('ts-node')) {
      return { type: 'typescript', subtype: 'ts-node', matchedFilter };
    }

    return { type: 'filtered', subtype: 'unknown', matchedFilter };
  }

  /**
   * Categorize npm process types
   */
  categorizeNpmProcess(argv, base) {
    const command = argv.join(' ').toLowerCase();

    if (command.includes('run dev') || command.includes('run start')) {
      return { ...base, subtype: 'dev-server' };
    }
    if (command.includes('run build')) {
      return { ...base, subtype: 'build' };
    }
    if (command.includes('run test')) {
      return { ...base, subtype: 'test' };
    }
    if (command.includes('install')) {
      return { ...base, subtype: 'install' };
    }

    return { ...base, subtype: 'script' };
  }

  /**
   * Categorize yarn process types
   */
  categorizeYarnProcess(argv, base) {
    const command = argv.join(' ').toLowerCase();

    if (command.includes('dev') || command.includes('start')) {
      return { ...base, subtype: 'dev-server' };
    }
    if (command.includes('build')) {
      return { ...base, subtype: 'build' };
    }
    if (command.includes('test')) {
      return { ...base, subtype: 'test' };
    }
    if (command.includes('install') || command.includes('add')) {
      return { ...base, subtype: 'install' };
    }

    return { ...base, subtype: 'script' };
  }

  /**
   * Categorize node process types
   */
  categorizeNodeProcess(argv, base) {
    const command = argv.join(' ').toLowerCase();

    if (command.includes('vite') || command.includes('webpack') || command.includes('rollup')) {
      return { ...base, subtype: 'build-tool' };
    }
    if (command.includes('jest') || command.includes('mocha') || command.includes('vitest')) {
      return { ...base, subtype: 'test-runner' };
    }
    if (command.includes('express') || command.includes('fastify') || command.includes('server')) {
      return { ...base, subtype: 'server' };
    }
    if (argv.length > 1 && argv[1].endsWith('.js')) {
      return { ...base, subtype: 'script' };
    }

    return { ...base, subtype: 'runtime' };
  }

  /**
   * Check if current environment is development
   */
  isDevelopmentEnvironment(cwd, argv) {
    // Check NODE_ENV
    if (process.env.NODE_ENV === 'development') return true;
    if (process.env.NODE_ENV === 'production') return false;

    // Check for development indicators
    const command = argv.join(' ').toLowerCase();
    const devIndicators = ['dev', 'start', 'serve', 'watch', 'hot-reload'];

    return devIndicators.some(indicator => command.includes(indicator));
  }

  /**
   * Find project root by looking for .context-kit directory
   */
  findProjectRoot() {
    let currentDir = process.cwd();

    while (currentDir !== path.dirname(currentDir)) {
      const contextKitPath = path.join(currentDir, '.context-kit');
      if (fs.existsSync(contextKitPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    return null; // No .context-kit found
  }

  /**
   * Check if current process should be filtered out
   */
  shouldFilter() {
    // Use cached result for performance
    if (this.shouldFilterCache !== null) {
      return this.shouldFilterCache;
    }

    const result = this._calculateShouldFilter();
    this.shouldFilterCache = result;

    if (this.options.verboseLogging) {
      console.log(`[ProcessFilter] Process ${this.processInfo.pid} filter decision: ${result ? 'FILTERED' : 'ALLOWED'}`, {
        type: this.processInfo.type,
        subtype: this.processInfo.subtype,
        matchedFilter: this.processInfo.matchedFilter,
        projectRoot: this.projectRoot,
        cwd: this.processInfo.cwd
      });
    }

    return result;
  }

  /**
   * Internal method to calculate filter decision
   */
  _calculateShouldFilter() {
    // Check if logging is disabled entirely
    if (process.env.TKR_LOG_ENABLED === 'false') {
      return true;
    }

    // Project-only mode: filter if not in a .context-kit project
    if (this.options.projectOnlyMode && !this.projectRoot) {
      return true;
    }

    // Check if process type matches filter
    if (!this.processInfo.matchedFilter) {
      return true; // Process not in allowed list
    }

    // Check skip patterns in current working directory
    if (this.matchesSkipPatterns(this.processInfo.cwd)) {
      return true;
    }

    // Check skip patterns in command arguments
    const command = this.processInfo.command;
    const skipPatternsArray = Array.isArray(this.options.skipPatterns)
      ? this.options.skipPatterns
      : [];
    if (skipPatternsArray.some(pattern => command.includes(pattern))) {
      return true;
    }

    // Special handling for build processes in production
    if (!this.processInfo.isDevelopment &&
        ['build', 'install'].includes(this.processInfo.subtype)) {
      return true; // Filter build/install processes in production
    }

    return false; // Allow logging
  }

  /**
   * Check if current working directory matches skip patterns
   */
  matchesSkipPatterns(cwd) {
    const skipPatternsArray = Array.isArray(this.options.skipPatterns)
      ? this.options.skipPatterns
      : [];
    return skipPatternsArray.some(pattern => {
      // Simple string matching for patterns
      return cwd.includes(pattern) ||
             cwd.includes(path.sep + pattern + path.sep) ||
             cwd.endsWith(path.sep + pattern);
    });
  }

  /**
   * Get service name for logging based on process type
   */
  getServiceName(defaultName = 'AutoDetectedService') {
    if (this.processInfo.matchedFilter) {
      return `${this.processInfo.type}-${this.processInfo.subtype}`;
    }

    // Extract service name from package.json if available
    try {
      const packageJsonPath = path.join(this.processInfo.cwd, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        if (packageJson.name) {
          return packageJson.name;
        }
      }
    } catch (error) {
      // Ignore errors reading package.json
    }

    return defaultName;
  }

  /**
   * Get component name for logging
   */
  getComponentName() {
    const relativePath = this.projectRoot ?
      path.relative(this.projectRoot, this.processInfo.cwd) :
      path.basename(this.processInfo.cwd);

    return relativePath || 'root';
  }

  /**
   * Check if child processes should inherit logging
   */
  shouldEnableChildProcesses() {
    return this.options.enableChildProcesses &&
           !this.shouldFilter() &&
           this.processInfo.isDevelopment;
  }

  /**
   * Get comprehensive process information for debugging
   */
  getProcessInfo() {
    return {
      ...this.processInfo,
      projectRoot: this.projectRoot,
      shouldFilter: this.shouldFilter(),
      shouldEnableChildProcesses: this.shouldEnableChildProcesses(),
      configuration: {
        processFilter: this.options.processFilter,
        skipPatterns: this.options.skipPatterns,
        enableChildProcesses: this.options.enableChildProcesses,
        projectOnlyMode: this.options.projectOnlyMode
      }
    };
  }

  /**
   * Update configuration dynamically
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.shouldFilterCache = null; // Clear cache

    if (this.options.verboseLogging) {
      console.log('[ProcessFilter] Configuration updated:', newOptions);
    }
  }
}

/**
 * Create a process filter with environment-based configuration
 */
function createProcessFilter(options = {}) {
  const envOptions = {
    processFilter: options.processFilter ||
      (process.env.TKR_NODE_PROCESS_FILTER ?
        process.env.TKR_NODE_PROCESS_FILTER.split(',').map(p => p.trim()) :
        undefined),
    skipPatterns: options.skipPatterns ||
      (process.env.TKR_NODE_SKIP_PATTERNS ?
        process.env.TKR_NODE_SKIP_PATTERNS.split(',').map(p => p.trim()) :
        undefined),
    enableChildProcesses: options.enableChildProcesses !== undefined ?
      options.enableChildProcesses :
      process.env.TKR_NODE_ENABLE_CHILD_PROCESSES !== 'false',
    projectOnlyMode: options.projectOnlyMode !== undefined ?
      options.projectOnlyMode :
      process.env.TKR_LOG_PROJECT_ONLY !== 'false',
    verboseLogging: options.verboseLogging !== undefined ?
      options.verboseLogging :
      process.env.TKR_LOG_VERBOSE_INIT === 'true'
  };

  return new ProcessFilter(envOptions);
}

module.exports = {
  ProcessFilter,
  createProcessFilter
};