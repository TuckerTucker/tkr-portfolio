/**
 * Metadata Enricher for Enhanced Logging
 * Adds rich context information to logs for better debugging and monitoring
 */

const { getProcessDetector } = require('./process-detector');

class MetadataEnricher {
  constructor(options = {}) {
    this.options = {
      // Context enrichment options
      includeProcessInfo: options.includeProcessInfo !== false,
      includeEnvironmentInfo: options.includeEnvironmentInfo !== false,
      includeGitInfo: options.includeGitInfo !== false,
      includePackageInfo: options.includePackageInfo !== false,
      includePerformanceInfo: options.includePerformanceInfo !== false,
      includeStackTrace: options.includeStackTrace !== false,

      // Performance and privacy options
      maxStackDepth: options.maxStackDepth || 10,
      excludeEnvVars: options.excludeEnvVars || [
        'PATH', 'HOME', 'USER', 'PWD', 'SHELL', 'TERM',
        'PASSWORD', 'SECRET', 'TOKEN', 'KEY', 'AUTH'
      ],
      cacheGitInfo: options.cacheGitInfo !== false,
      cachePackageInfo: options.cachePackageInfo !== false,

      ...options
    };

    this.processDetector = getProcessDetector();
    this.cache = {
      gitInfo: null,
      packageInfo: null,
      environmentInfo: null,
      processInfo: null,
      lastCacheUpdate: 0
    };

    this.cacheTimeout = 60000; // 1 minute cache
  }

  /**
   * Enrich log metadata with additional context
   */
  enrichMetadata(originalMetadata = {}, level, message, component) {
    const enriched = { ...originalMetadata };

    // Add timestamp if not present
    if (!enriched.timestamp) {
      enriched.timestamp = Date.now();
    }

    // Add log context
    enriched.logContext = this.getLogContext(level, message, component);

    // Add process information
    if (this.options.includeProcessInfo) {
      enriched.process = this.getProcessInfo();
    }

    // Add environment information
    if (this.options.includeEnvironmentInfo) {
      enriched.environment = this.getEnvironmentInfo();
    }

    // Add git information
    if (this.options.includeGitInfo) {
      enriched.git = this.getGitInfo();
    }

    // Add package information
    if (this.options.includePackageInfo) {
      enriched.package = this.getPackageInfo();
    }

    // Add performance information
    if (this.options.includePerformanceInfo) {
      enriched.performance = this.getPerformanceInfo();
    }

    // Add stack trace for errors
    if (this.options.includeStackTrace && this.shouldIncludeStackTrace(level, originalMetadata)) {
      enriched.stack = this.getStackTrace();
    }

    // Add request ID if available
    enriched.requestId = this.getRequestId(originalMetadata);

    // Add correlation ID
    enriched.correlationId = this.getCorrelationId(originalMetadata);

    return enriched;
  }

  /**
   * Get basic log context information
   */
  getLogContext(level, message, component) {
    return {
      level: level?.toUpperCase(),
      component: component || 'Unknown',
      messageLength: message?.length || 0,
      messageHash: this.simpleHash(message || ''),
      caller: this.getCaller()
    };
  }

  /**
   * Get process information
   */
  getProcessInfo() {
    if (this.cache.processInfo && this.isCacheValid()) {
      return this.cache.processInfo;
    }

    const processInfo = this.processDetector.getProcessInfo();
    if (!processInfo) return null;

    const info = {
      pid: processInfo.pid,
      ppid: processInfo.ppid,
      type: processInfo.type,
      subtype: processInfo.subtype,
      command: processInfo.command,
      isDevelopment: processInfo.isDevelopment,
      isChildProcess: processInfo.isChildProcess,
      nodeVersion: processInfo.nodeVersion,
      platform: processInfo.platform,
      arch: processInfo.arch,
      uptime: process.uptime ? process.uptime() : null
    };

    this.cache.processInfo = info;
    return info;
  }

  /**
   * Get environment information
   */
  getEnvironmentInfo() {
    if (this.cache.environmentInfo && this.isCacheValid()) {
      return this.cache.environmentInfo;
    }

    const env = process.env || {};
    const filteredEnv = {};

    // Include relevant environment variables, excluding sensitive ones
    for (const [key, value] of Object.entries(env)) {
      const keyUpper = key.toUpperCase();
      const shouldExclude = this.options.excludeEnvVars.some(excluded =>
        keyUpper.includes(excluded.toUpperCase())
      );

      if (!shouldExclude && this.isRelevantEnvVar(key)) {
        filteredEnv[key] = value;
      }
    }

    const info = {
      nodeEnv: env.NODE_ENV || 'development',
      platform: process.platform,
      arch: process.arch,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      locale: Intl.DateTimeFormat().resolvedOptions().locale,
      cwd: process.cwd(),
      relevantEnvVars: filteredEnv
    };

    this.cache.environmentInfo = info;
    return info;
  }

  /**
   * Check if an environment variable is relevant for logging
   */
  isRelevantEnvVar(key) {
    const relevantPrefixes = [
      'NPM_', 'YARN_', 'NODE_', 'TKR_', 'LOG_', 'DEBUG_',
      'APP_', 'API_', 'DB_', 'REDIS_', 'PORT', 'HOST'
    ];

    return relevantPrefixes.some(prefix => key.startsWith(prefix));
  }

  /**
   * Get git repository information
   */
  getGitInfo() {
    if (this.cache.gitInfo && this.options.cacheGitInfo && this.isCacheValid()) {
      return this.cache.gitInfo;
    }

    try {
      const { execSync } = require('child_process');
      const path = require('path');

      const gitDir = this.findGitDirectory();
      if (!gitDir) return null;

      const execOptions = { cwd: gitDir, encoding: 'utf8', timeout: 2000 };

      const info = {
        branch: this.safeExec('git rev-parse --abbrev-ref HEAD', execOptions),
        commit: this.safeExec('git rev-parse HEAD', execOptions),
        shortCommit: this.safeExec('git rev-parse --short HEAD', execOptions),
        isDirty: this.safeExec('git status --porcelain', execOptions)?.trim() !== '',
        lastCommitDate: this.safeExec('git log -1 --format=%ci', execOptions),
        author: this.safeExec('git log -1 --format=%an', execOptions),
        repository: this.getRepositoryUrl(execOptions)
      };

      if (this.options.cacheGitInfo) {
        this.cache.gitInfo = info;
        this.updateCacheTimestamp();
      }

      return info;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find git directory starting from current directory
   */
  findGitDirectory() {
    try {
      const fs = require('fs');
      const path = require('path');

      let currentDir = process.cwd();
      while (currentDir !== path.dirname(currentDir)) {
        const gitDir = path.join(currentDir, '.git');
        if (fs.existsSync(gitDir)) {
          return currentDir;
        }
        currentDir = path.dirname(currentDir);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Safely execute a command
   */
  safeExec(command, options) {
    try {
      const { execSync } = require('child_process');
      return execSync(command, options)?.toString()?.trim();
    } catch (error) {
      return null;
    }
  }

  /**
   * Get repository URL
   */
  getRepositoryUrl(execOptions) {
    const remoteUrl = this.safeExec('git config --get remote.origin.url', execOptions);
    if (!remoteUrl) return null;

    // Clean up the URL
    return remoteUrl
      .replace(/^git@/, 'https://')
      .replace(/\.git$/, '')
      .replace(/:([^\/])/, '/$1');
  }

  /**
   * Get package information
   */
  getPackageInfo() {
    if (this.cache.packageInfo && this.options.cachePackageInfo && this.isCacheValid()) {
      return this.cache.packageInfo;
    }

    try {
      const fs = require('fs');
      const path = require('path');

      const packagePath = this.findPackageJson();
      if (!packagePath) return null;

      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      const info = {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
        main: packageJson.main,
        scripts: Object.keys(packageJson.scripts || {}),
        dependencies: Object.keys(packageJson.dependencies || {}),
        devDependencies: Object.keys(packageJson.devDependencies || {}),
        author: packageJson.author,
        license: packageJson.license,
        repository: packageJson.repository,
        packagePath: path.dirname(packagePath)
      };

      if (this.options.cachePackageInfo) {
        this.cache.packageInfo = info;
        this.updateCacheTimestamp();
      }

      return info;
    } catch (error) {
      return null;
    }
  }

  /**
   * Find package.json starting from current directory
   */
  findPackageJson() {
    try {
      const fs = require('fs');
      const path = require('path');

      let currentDir = process.cwd();
      while (currentDir !== path.dirname(currentDir)) {
        const packagePath = path.join(currentDir, 'package.json');
        if (fs.existsSync(packagePath)) {
          return packagePath;
        }
        currentDir = path.dirname(currentDir);
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get performance information
   */
  getPerformanceInfo() {
    try {
      const info = {
        timestamp: Date.now(),
        hrtime: process.hrtime ? process.hrtime() : null
      };

      // Add memory usage if available
      if (process.memoryUsage) {
        const usage = process.memoryUsage();
        info.memory = {
          heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
          heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
          external: Math.round(usage.external / 1024 / 1024), // MB
          rss: Math.round(usage.rss / 1024 / 1024) // MB
        };
      }

      // Add CPU usage if available
      if (process.cpuUsage) {
        const usage = process.cpuUsage();
        info.cpu = {
          user: usage.user,
          system: usage.system
        };
      }

      // Add uptime
      if (process.uptime) {
        info.uptime = Math.round(process.uptime());
      }

      return info;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if we should include stack trace
   */
  shouldIncludeStackTrace(level, metadata) {
    // Always include for errors and fatals
    if (['ERROR', 'FATAL'].includes(level?.toUpperCase())) {
      return true;
    }

    // Include if error object is present in metadata
    if (metadata.error) {
      return true;
    }

    return false;
  }

  /**
   * Get stack trace
   */
  getStackTrace() {
    try {
      const error = new Error();
      const stack = error.stack?.split('\n') || [];

      // Remove the first few lines that are from this enricher
      const relevantStack = stack.slice(3, 3 + this.options.maxStackDepth);

      return relevantStack.map(line => {
        // Clean up the stack trace line
        return line.trim().replace(/^at\s+/, '');
      });
    } catch (error) {
      return null;
    }
  }

  /**
   * Get the calling function/file
   */
  getCaller() {
    try {
      const error = new Error();
      const stack = error.stack?.split('\n') || [];

      // Look for the first non-enricher line
      for (let i = 1; i < stack.length; i++) {
        const line = stack[i];
        if (line && !line.includes('metadata-enricher') && !line.includes('TkrLogger')) {
          const match = line.match(/at\s+([^(]+)\s+\(([^)]+)\)/);
          if (match) {
            return {
              function: match[1].trim(),
              location: match[2].trim()
            };
          }
        }
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get or generate request ID
   */
  getRequestId(metadata) {
    // Check if request ID is already in metadata
    if (metadata.requestId || metadata.reqId || metadata.request_id) {
      return metadata.requestId || metadata.reqId || metadata.request_id;
    }

    // Try to get from express request object
    if (metadata.req && metadata.req.id) {
      return metadata.req.id;
    }

    // Try to get from context or continuation-local-storage
    if (typeof process !== 'undefined' && process.domain?.active?.requestId) {
      return process.domain.active.requestId;
    }

    return null;
  }

  /**
   * Get or generate correlation ID
   */
  getCorrelationId(metadata) {
    // Check if correlation ID is already in metadata
    if (metadata.correlationId || metadata.corrId || metadata.correlation_id) {
      return metadata.correlationId || metadata.corrId || metadata.correlation_id;
    }

    // Generate a simple correlation ID based on timestamp and random
    return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Simple hash function for message deduplication
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    return (Date.now() - this.cache.lastCacheUpdate) < this.cacheTimeout;
  }

  /**
   * Update cache timestamp
   */
  updateCacheTimestamp() {
    this.cache.lastCacheUpdate = Date.now();
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      gitInfo: null,
      packageInfo: null,
      environmentInfo: null,
      processInfo: null,
      lastCacheUpdate: 0
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.options };
  }

  /**
   * Create enricher with preset configurations
   */
  static createPreset(presetName, customOptions = {}) {
    const presets = {
      minimal: {
        includeProcessInfo: true,
        includeEnvironmentInfo: false,
        includeGitInfo: false,
        includePackageInfo: false,
        includePerformanceInfo: false,
        includeStackTrace: false
      },

      development: {
        includeProcessInfo: true,
        includeEnvironmentInfo: true,
        includeGitInfo: true,
        includePackageInfo: true,
        includePerformanceInfo: true,
        includeStackTrace: true
      },

      production: {
        includeProcessInfo: true,
        includeEnvironmentInfo: true,
        includeGitInfo: true,
        includePackageInfo: true,
        includePerformanceInfo: false,
        includeStackTrace: true,
        excludeEnvVars: [
          'PATH', 'HOME', 'USER', 'PWD', 'SHELL', 'TERM',
          'PASSWORD', 'SECRET', 'TOKEN', 'KEY', 'AUTH',
          'API_KEY', 'DATABASE_URL', 'PRIVATE_KEY'
        ]
      },

      performance: {
        includeProcessInfo: true,
        includeEnvironmentInfo: false,
        includeGitInfo: false,
        includePackageInfo: false,
        includePerformanceInfo: true,
        includeStackTrace: false,
        cacheGitInfo: true,
        cachePackageInfo: true
      }
    };

    const preset = presets[presetName] || presets.development;
    return new MetadataEnricher({ ...preset, ...customOptions });
  }
}

module.exports = {
  MetadataEnricher
};