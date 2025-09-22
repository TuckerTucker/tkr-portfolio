/**
 * Filter Manager for Enhanced Logging
 * Intelligent filtering to reduce noise and focus on relevant logs
 */

const { getProcessDetector } = require('./process-detector');

class FilterManager {
  constructor(options = {}) {
    this.options = {
      // Default settings
      enableNodeModulesFilter: options.enableNodeModulesFilter !== false,
      enableBuildToolFilter: options.enableBuildToolFilter !== false,
      enableDevelopmentFilter: options.enableDevelopmentFilter !== false,
      projectOnlyMode: options.projectOnlyMode || false,
      minLogLevel: options.minLogLevel || null, // null means use logger default
      customFilters: options.customFilters || [],
      allowPatterns: options.allowPatterns || [],
      skipPatterns: options.skipPatterns || [],

      // Environment-based filtering
      filterInProduction: options.filterInProduction !== false,
      ...options
    };

    this.processDetector = getProcessDetector();
    this.stats = {
      totalLogs: 0,
      filteredLogs: 0,
      lastReset: Date.now()
    };

    // Default skip patterns for noise reduction
    this.defaultSkipPatterns = [
      // Node.js internal noise
      /node_modules/i,
      /\/\.npm\//i,
      /npm WARN/i,
      /deprecation warning/i,

      // Build tool noise
      /webpack compiled/i,
      /vite.*ready in/i,
      /local:.*https?:\/\//i,
      /ready on http/i,
      /compiled successfully/i,

      // Development server noise
      /hot update/i,
      /hmr update/i,
      /assets by path/i,
      /chunk.*\(runtime\)/i,

      // Common log pollution
      /\[nodemon\]/i,
      /\[ts-node\]/i,
      /\[tsx\]/i,
      /waiting for changes/i,
      /restarting due to changes/i,

      // Performance/debug noise (in development)
      /time to first byte/i,
      /total time/i,
      /memory usage/i,

      // Test runner noise
      /jest worker/i,
      /vitest.*worker/i,
      /test.*passed/i,
      /coverage report/i
    ];

    // Default allow patterns (these override skip patterns)
    this.defaultAllowPatterns = [
      // Important error/warning patterns that should never be filtered
      /error/i,
      /exception/i,
      /failed/i,
      /timeout/i,
      /refused/i,
      /denied/i,

      // Important application events
      /server.*start/i,
      /listening on/i,
      /connection.*established/i,
      /authentication/i,
      /authorization/i,

      // Business logic logs
      /user.*created/i,
      /order.*processed/i,
      /payment.*received/i
    ];
  }

  /**
   * Check if a log should be filtered (return true to filter out)
   */
  shouldFilter(level, message, metadata = {}, component = '') {
    this.stats.totalLogs++;

    // Quick exit for production if filtering is disabled
    if (!this.processDetector.isDevelopment() && !this.options.filterInProduction) {
      return false;
    }

    // Check log level filtering
    if (this.shouldFilterByLevel(level)) {
      this.stats.filteredLogs++;
      return true;
    }

    // Check if we should skip this process entirely
    if (this.shouldFilterByProcess()) {
      this.stats.filteredLogs++;
      return true;
    }

    // Project-only mode: filter out anything outside project directory
    if (this.options.projectOnlyMode && this.shouldFilterByProject(metadata)) {
      this.stats.filteredLogs++;
      return true;
    }

    // Check custom filters first
    for (const customFilter of this.options.customFilters) {
      if (typeof customFilter === 'function') {
        if (customFilter(level, message, metadata, component)) {
          this.stats.filteredLogs++;
          return true;
        }
      }
    }

    // Check allow patterns first (these override skip patterns)
    const combinedAllowPatterns = [
      ...this.defaultAllowPatterns,
      ...this.options.allowPatterns
    ];

    for (const pattern of combinedAllowPatterns) {
      if (this.matchesPattern(pattern, message, metadata, component)) {
        return false; // Don't filter - this is explicitly allowed
      }
    }

    // Check skip patterns
    const combinedSkipPatterns = [
      ...(this.options.enableNodeModulesFilter ? this.getNodeModulesPatterns() : []),
      ...(this.options.enableBuildToolFilter ? this.getBuildToolPatterns() : []),
      ...(this.options.enableDevelopmentFilter && this.processDetector.isDevelopment() ? this.getDevelopmentPatterns() : []),
      ...this.defaultSkipPatterns,
      ...this.options.skipPatterns
    ];

    for (const pattern of combinedSkipPatterns) {
      if (this.matchesPattern(pattern, message, metadata, component)) {
        this.stats.filteredLogs++;
        return true;
      }
    }

    return false; // Don't filter
  }

  /**
   * Check if log should be filtered by level
   */
  shouldFilterByLevel(level) {
    if (!this.options.minLogLevel) return false;

    const logLevels = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
      fatal: 4
    };

    const messageLevel = logLevels[level.toLowerCase()] || 0;
    const minLevel = logLevels[this.options.minLogLevel.toLowerCase()] || 0;

    return messageLevel < minLevel;
  }

  /**
   * Check if the current process should be filtered
   */
  shouldFilterByProcess() {
    const processInfo = this.processDetector.getProcessInfo();
    if (!processInfo) return false;

    // In development, filter out noisy processes
    if (this.processDetector.isDevelopment()) {
      const { type, subtype } = processInfo;

      // Filter npm audit, ls, etc.
      if (type === 'npm' && ['audit', 'ls', 'outdated', 'fund'].includes(subtype)) {
        return true;
      }

      // Filter background test workers
      if (type === 'test-runner' && processInfo.isChildProcess) {
        return true;
      }

      // Filter build tool workers
      if (type === 'build-tool' && processInfo.isChildProcess) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check if log should be filtered based on project scope
   */
  shouldFilterByProject(metadata) {
    // If no file information is available, don't filter
    if (!metadata.file && !metadata.filename && !metadata.stack) return false;

    const projectRoot = this.processDetector.getProcessInfo()?.cwd || process.cwd();

    // Check file paths in metadata
    const filePaths = [
      metadata.file,
      metadata.filename,
      metadata.filepath,
      ...(metadata.stack ? [metadata.stack] : [])
    ].filter(Boolean);

    for (const filePath of filePaths) {
      if (typeof filePath === 'string') {
        // Filter out node_modules
        if (filePath.includes('node_modules')) return true;

        // Filter out system/temp files
        if (filePath.startsWith('/tmp/') || filePath.startsWith('/var/')) return true;

        // Keep files within project
        if (filePath.startsWith(projectRoot)) return false;
      }
    }

    return false;
  }

  /**
   * Check if text matches a pattern (string or regex)
   */
  matchesPattern(pattern, message, metadata, component) {
    const searchText = `${message} ${JSON.stringify(metadata)} ${component}`.toLowerCase();

    if (pattern instanceof RegExp) {
      return pattern.test(searchText);
    }

    if (typeof pattern === 'string') {
      return searchText.includes(pattern.toLowerCase());
    }

    return false;
  }

  /**
   * Get node_modules related patterns
   */
  getNodeModulesPatterns() {
    return [
      /node_modules/i,
      /\/\.npm\//i,
      /package-lock\.json/i,
      /yarn\.lock/i,
      /npm-shrinkwrap\.json/i
    ];
  }

  /**
   * Get build tool specific patterns
   */
  getBuildToolPatterns() {
    const processInfo = this.processDetector.getProcessInfo();
    const patterns = [];

    if (processInfo?.type === 'build-tool' || processInfo?.subtype?.includes('build')) {
      patterns.push(
        /compiled with \d+ warnings?/i,
        /asset.*emitted/i,
        /chunk.*\(runtime\)/i,
        /entrypoint/i,
        /webpack.*compiled/i,
        /vite.*build/i,
        /rollup.*bundle/i
      );
    }

    return patterns;
  }

  /**
   * Get development-specific patterns
   */
  getDevelopmentPatterns() {
    return [
      // Development server chatter
      /ready in \d+ms/i,
      /compiled in \d+ms/i,
      /updating chunk/i,
      /hot update/i,
      /hmr update/i,

      // File watcher noise
      /file change detected/i,
      /reloading/i,
      /restarting/i,

      // Performance info that's not critical
      /memory usage/i,
      /cpu usage/i,
      /time to first byte/i,

      // Common development tool output
      /watching for file changes/i,
      /press.*to restart/i,
      /press.*to quit/i
    ];
  }

  /**
   * Add a custom filter function
   */
  addFilter(filterFunction) {
    if (typeof filterFunction === 'function') {
      this.options.customFilters.push(filterFunction);
    }
  }

  /**
   * Add an allow pattern
   */
  addAllowPattern(pattern) {
    this.options.allowPatterns.push(pattern);
  }

  /**
   * Add a skip pattern
   */
  addSkipPattern(pattern) {
    this.options.skipPatterns.push(pattern);
  }

  /**
   * Set minimum log level
   */
  setMinLogLevel(level) {
    this.options.minLogLevel = level;
  }

  /**
   * Enable/disable project-only mode
   */
  setProjectOnlyMode(enabled) {
    this.options.projectOnlyMode = enabled;
  }

  /**
   * Get filter statistics
   */
  getStats() {
    const now = Date.now();
    const timeElapsed = now - this.stats.lastReset;

    return {
      ...this.stats,
      filterRate: this.stats.totalLogs > 0 ? (this.stats.filteredLogs / this.stats.totalLogs) : 0,
      logsPerSecond: timeElapsed > 0 ? (this.stats.totalLogs / (timeElapsed / 1000)) : 0,
      timeElapsed
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalLogs: 0,
      filteredLogs: 0,
      lastReset: Date.now()
    };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.options };
  }

  /**
   * Update configuration
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Create a filter preset for common use cases
   */
  static createPreset(presetName, customOptions = {}) {
    const presets = {
      // Minimal filtering - only filter obvious noise
      minimal: {
        enableNodeModulesFilter: true,
        enableBuildToolFilter: false,
        enableDevelopmentFilter: false,
        projectOnlyMode: false
      },

      // Development mode - filter out development noise
      development: {
        enableNodeModulesFilter: true,
        enableBuildToolFilter: true,
        enableDevelopmentFilter: true,
        projectOnlyMode: false,
        minLogLevel: 'debug'
      },

      // Production mode - minimal filtering, keep everything important
      production: {
        enableNodeModulesFilter: false,
        enableBuildToolFilter: false,
        enableDevelopmentFilter: false,
        projectOnlyMode: false,
        filterInProduction: false,
        minLogLevel: 'info'
      },

      // Strict mode - heavy filtering for clean logs
      strict: {
        enableNodeModulesFilter: true,
        enableBuildToolFilter: true,
        enableDevelopmentFilter: true,
        projectOnlyMode: true,
        minLogLevel: 'info'
      },

      // Debug mode - no filtering except explicit skips
      debug: {
        enableNodeModulesFilter: false,
        enableBuildToolFilter: false,
        enableDevelopmentFilter: false,
        projectOnlyMode: false,
        minLogLevel: 'debug'
      }
    };

    const preset = presets[presetName] || presets.development;
    return new FilterManager({ ...preset, ...customOptions });
  }
}

module.exports = {
  FilterManager
};