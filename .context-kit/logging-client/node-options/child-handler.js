/**
 * Child Process Handler for NODE_OPTIONS Integration
 * Manages logging inheritance for child processes in tkr-context-kit
 *
 * Features:
 * - Automatic child process detection
 * - NODE_OPTIONS inheritance and modification
 * - Smart filtering for child processes
 * - Performance-conscious child process handling
 * - Integration with Wave 1 enhanced logging client
 */

const { spawn, exec, fork } = require('child_process');
const path = require('path');
const { createProcessFilter } = require('./process-filter');

class ChildProcessHandler {
  constructor(options = {}) {
    this.options = {
      enableChildProcesses: options.enableChildProcesses !== false,
      inheritNodeOptions: options.inheritNodeOptions !== false,
      verboseLogging: options.verboseLogging === true,
      maxChildDepth: options.maxChildDepth || 3,
      ...options
    };

    this.processFilter = createProcessFilter(options);
    this.childProcesses = new Map(); // Track child processes
    this.setupChildProcessMonitoring();
  }

  /**
   * Setup monitoring for child processes
   */
  setupChildProcessMonitoring() {
    if (!this.options.enableChildProcesses) {
      return;
    }

    // Only setup if current process should enable child processes
    if (!this.processFilter.shouldEnableChildProcesses()) {
      return;
    }

    this.patchChildProcessMethods();
  }

  /**
   * Patch Node.js child process methods to enable logging inheritance
   */
  patchChildProcessMethods() {
    const originalSpawn = require('child_process').spawn;
    const originalExec = require('child_process').exec;
    const originalFork = require('child_process').fork;

    const self = this;

    // Patch spawn
    require('child_process').spawn = function(command, args, options) {
      const modifiedOptions = self.prepareChildProcessOptions(command, args, options);
      const child = originalSpawn.call(this, command, args, modifiedOptions);
      self.registerChildProcess(child, { command, args, type: 'spawn' });
      return child;
    };

    // Patch exec
    require('child_process').exec = function(command, options, callback) {
      const modifiedOptions = self.prepareChildProcessOptions(command, [], options);
      const child = originalExec.call(this, command, modifiedOptions, callback);
      self.registerChildProcess(child, { command, type: 'exec' });
      return child;
    };

    // Patch fork
    require('child_process').fork = function(modulePath, args, options) {
      const modifiedOptions = self.prepareChildProcessOptions(modulePath, args, options, 'fork');
      const child = originalFork.call(this, modulePath, args, modifiedOptions);
      self.registerChildProcess(child, { modulePath, args, type: 'fork' });
      return child;
    };

    if (this.options.verboseLogging) {
      console.log('[ChildProcessHandler] Child process methods patched for logging inheritance');
    }
  }

  /**
   * Prepare child process options with NODE_OPTIONS inheritance
   */
  prepareChildProcessOptions(command, args = [], options = {}, type = 'spawn') {
    const modifiedOptions = { ...options };

    // Ensure env object exists
    if (!modifiedOptions.env) {
      modifiedOptions.env = { ...process.env };
    }

    // Determine if child process should inherit logging
    const shouldInherit = this.shouldChildProcessInheritLogging(command, args, type);

    if (shouldInherit && this.options.inheritNodeOptions) {
      const enhancedLoggerPath = this.getEnhancedLoggerPath();

      if (enhancedLoggerPath) {
        // Preserve existing NODE_OPTIONS if present
        const existingNodeOptions = modifiedOptions.env.NODE_OPTIONS || '';
        const requireFlag = `--require ${enhancedLoggerPath}`;

        // Check if already included to avoid duplication
        if (!existingNodeOptions.includes(enhancedLoggerPath)) {
          modifiedOptions.env.NODE_OPTIONS = existingNodeOptions ?
            `${existingNodeOptions} ${requireFlag}` :
            requireFlag;
        }

        // Pass through relevant environment variables
        this.inheritLoggingEnvironment(modifiedOptions.env);

        if (this.options.verboseLogging) {
          console.log(`[ChildProcessHandler] Inherited logging for child process: ${command}`, {
            NODE_OPTIONS: modifiedOptions.env.NODE_OPTIONS,
            type
          });
        }
      }
    }

    return modifiedOptions;
  }

  /**
   * Determine if child process should inherit logging
   */
  shouldChildProcessInheritLogging(command, args, type) {
    // Don't inherit if child processes are disabled
    if (!this.options.enableChildProcesses) {
      return false;
    }

    // Don't inherit if current process is filtered
    if (this.processFilter.shouldFilter()) {
      return false;
    }

    // Check child depth to prevent infinite recursion
    const currentDepth = this.getCurrentChildDepth();
    if (currentDepth >= this.options.maxChildDepth) {
      return false;
    }

    // Create a temporary filter for the child process
    const childFilter = this.createChildProcessFilter(command, args, type);
    return !childFilter.shouldFilter();
  }

  /**
   * Create a process filter for child process evaluation
   */
  createChildProcessFilter(command, args, type) {
    // Simulate child process environment for filtering
    const childArgv = [process.execPath, command, ...(args || [])];

    // Create temporary process info for child
    const originalArgv = process.argv;
    const originalCwd = process.cwd;

    try {
      // Temporarily modify process info
      process.argv = childArgv;

      // Create filter with child process context
      const childFilter = createProcessFilter({
        ...this.options,
        verboseLogging: false // Reduce noise for child evaluation
      });

      return childFilter;
    } finally {
      // Restore original process info
      process.argv = originalArgv;
    }
  }

  /**
   * Get current child process depth from environment
   */
  getCurrentChildDepth() {
    const depthStr = process.env.TKR_CHILD_DEPTH || '0';
    return parseInt(depthStr, 10);
  }

  /**
   * Get path to Wave 1 enhanced logger
   */
  getEnhancedLoggerPath() {
    const projectRoot = this.processFilter.projectRoot;
    if (!projectRoot) {
      return null;
    }

    const enhancedLoggerPath = path.join(
      projectRoot,
      '.context-kit',
      'logging-client',
      'src',
      'auto-init-enhanced.js'
    );

    // Check if file exists
    try {
      require.resolve(enhancedLoggerPath);
      return enhancedLoggerPath;
    } catch (error) {
      if (this.options.verboseLogging) {
        console.warn(`[ChildProcessHandler] Enhanced logger not found at: ${enhancedLoggerPath}`);
      }
      return null;
    }
  }

  /**
   * Inherit relevant logging environment variables for child processes
   */
  inheritLoggingEnvironment(childEnv) {
    // Core logging configuration
    const loggingVars = [
      'TKR_LOG_ENDPOINT',
      'TKR_LOG_LEVEL',
      'TKR_LOG_ENABLED',
      'TKR_LOG_PROJECT_ONLY',
      'TKR_LOG_BATCH_SIZE',
      'TKR_LOG_FLUSH_INTERVAL',
      'TKR_LOG_SILENT_INIT',
      'TKR_LOG_VERBOSE_INIT',
      'TKR_LOG_TO_CONSOLE',
      'TKR_LOG_FAIL_SILENTLY',
      'TKR_NODE_PROCESS_FILTER',
      'TKR_NODE_SKIP_PATTERNS',
      'TKR_NODE_ENABLE_CHILD_PROCESSES'
    ];

    // Copy logging environment variables
    loggingVars.forEach(varName => {
      if (process.env[varName] !== undefined) {
        childEnv[varName] = process.env[varName];
      }
    });

    // Increment child depth to prevent infinite recursion
    const currentDepth = this.getCurrentChildDepth();
    childEnv.TKR_CHILD_DEPTH = String(currentDepth + 1);

    // Mark as child process for identification
    childEnv.TKR_IS_CHILD_PROCESS = 'true';
  }

  /**
   * Register and monitor a child process
   */
  registerChildProcess(child, metadata) {
    if (!child || !child.pid) {
      return;
    }

    const childInfo = {
      pid: child.pid,
      startTime: Date.now(),
      metadata,
      status: 'running'
    };

    this.childProcesses.set(child.pid, childInfo);

    // Setup cleanup on child exit
    child.on('exit', (code, signal) => {
      if (this.childProcesses.has(child.pid)) {
        const info = this.childProcesses.get(child.pid);
        info.status = 'exited';
        info.exitCode = code;
        info.exitSignal = signal;
        info.endTime = Date.now();

        if (this.options.verboseLogging) {
          console.log(`[ChildProcessHandler] Child process ${child.pid} exited`, {
            code,
            signal,
            runtime: info.endTime - info.startTime,
            command: info.metadata.command
          });
        }

        // Remove after a delay to allow for final logging
        setTimeout(() => {
          this.childProcesses.delete(child.pid);
        }, 5000);
      }
    });

    child.on('error', (error) => {
      if (this.childProcesses.has(child.pid)) {
        const info = this.childProcesses.get(child.pid);
        info.status = 'error';
        info.error = error;

        if (this.options.verboseLogging) {
          console.error(`[ChildProcessHandler] Child process ${child.pid} error:`, error);
        }
      }
    });

    if (this.options.verboseLogging) {
      console.log(`[ChildProcessHandler] Registered child process ${child.pid}`, metadata);
    }
  }

  /**
   * Get information about all child processes
   */
  getChildProcessInfo() {
    const children = Array.from(this.childProcesses.values());
    const running = children.filter(c => c.status === 'running').length;
    const exited = children.filter(c => c.status === 'exited').length;
    const errors = children.filter(c => c.status === 'error').length;

    return {
      total: children.length,
      running,
      exited,
      errors,
      processes: children,
      currentDepth: this.getCurrentChildDepth(),
      maxDepth: this.options.maxChildDepth,
      enabled: this.options.enableChildProcesses
    };
  }

  /**
   * Cleanup child process monitoring
   */
  cleanup() {
    // Force cleanup of any remaining child processes
    this.childProcesses.clear();

    if (this.options.verboseLogging) {
      console.log('[ChildProcessHandler] Cleanup completed');
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };

    if (this.processFilter) {
      this.processFilter.updateConfig(newOptions);
    }

    if (this.options.verboseLogging) {
      console.log('[ChildProcessHandler] Configuration updated:', newOptions);
    }
  }
}

/**
 * Create a child process handler with environment-based configuration
 */
function createChildProcessHandler(options = {}) {
  const envOptions = {
    enableChildProcesses: options.enableChildProcesses !== undefined ?
      options.enableChildProcesses :
      process.env.TKR_NODE_ENABLE_CHILD_PROCESSES !== 'false',
    inheritNodeOptions: options.inheritNodeOptions !== undefined ?
      options.inheritNodeOptions :
      process.env.TKR_NODE_INHERIT_OPTIONS !== 'false',
    verboseLogging: options.verboseLogging !== undefined ?
      options.verboseLogging :
      process.env.TKR_LOG_VERBOSE_INIT === 'true',
    maxChildDepth: options.maxChildDepth ||
      parseInt(process.env.TKR_NODE_MAX_CHILD_DEPTH || '3', 10)
  };

  return new ChildProcessHandler(envOptions);
}

module.exports = {
  ChildProcessHandler,
  createChildProcessHandler
};