/**
 * TKR Browser Logging Client
 * Intercepts console methods with perfect passthrough while logging to backend
 *
 * Features:
 * - Zero visible impact on DevTools console experience
 * - Preserves line numbers and stack traces
 * - Session tracking across page reloads
 * - Graceful offline handling
 * - Performance monitoring (stops if overhead > 1ms)
 * - Error and unhandled rejection capture
 */

(function() {
  'use strict';

  // Check if already initialized to prevent double initialization
  if (window.TkrLogging && window.TkrLogging._initialized) {
    return;
  }

  // Configuration defaults
  const DEFAULT_CONFIG = {
    endpoint: 'http://localhost:42003/api/logs/batch',
    batchSize: 10,
    flushInterval: 5000,
    captureErrors: true,
    sessionTracking: true,
    performanceThreshold: 1, // 1ms max overhead
    enabled: true,
    service: 'browser',
    component: 'browser-console'
  };

  // Log level mapping (compatible with unified core module)
  const LOG_LEVELS = {
    log: 'info',
    info: 'info',
    warn: 'warn',
    error: 'error',
    debug: 'debug',
    trace: 'trace'
  };

  class TkrLoggingClient {
    constructor() {
      this.config = { ...DEFAULT_CONFIG };
      this.sessionManager = null;
      this.batchSender = null;
      this.originalConsole = {};
      this.enabled = false;
      this.performanceStats = {
        calls: 0,
        totalTime: 0,
        avgTime: 0,
        disabled: false
      };

      // Bind methods to preserve context
      this.init = this.init.bind(this);
      this.log = this.log.bind(this);
      this.flush = this.flush.bind(this);
      this.enable = this.enable.bind(this);
      this.disable = this.disable.bind(this);
    }

    /**
     * Initialize the logging client
     * @param {object} config - Configuration options
     */
    init(config = {}) {
      // Merge configuration
      this.config = { ...this.config, ...config };

      if (!this.config.enabled) {
        return;
      }

      try {
        // Initialize session manager
        if (!window.SessionManager) {
          console.warn('TkrLogging: SessionManager not available');
          return;
        }
        this.sessionManager = new window.SessionManager();
        this.sessionManager.initialize();

        // Initialize batch sender
        if (!window.BatchSender) {
          console.warn('TkrLogging: BatchSender not available');
          return;
        }
        this.batchSender = new window.BatchSender({
          endpoint: this.config.endpoint,
          batchSize: this.config.batchSize,
          flushInterval: this.config.flushInterval,
          performanceThreshold: this.config.performanceThreshold
        });

        // Intercept console methods
        this.interceptConsole();

        // Set up error capturing
        if (this.config.captureErrors) {
          this.setupErrorCapture();
        }

        this.enabled = true;

        // Log initialization (but don't log this specific message to avoid recursion)
        this.sendLogDirectly('info', 'TkrLogging client initialized', {
          config: { ...this.config, endpoint: '[redacted]' },
          sessionId: this.sessionManager.getSessionId()
        });

      } catch (error) {
        console.error('TkrLogging: Failed to initialize:', error);
      }
    }

    /**
     * Intercept console methods with perfect passthrough
     */
    interceptConsole() {
      const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'trace'];

      consoleMethods.forEach(method => {
        if (typeof console[method] === 'function') {
          // Store original method
          this.originalConsole[method] = console[method];

          // Create intercepted version
          console[method] = (...args) => {
            const startTime = performance.now();

            // Call original method FIRST for perfect passthrough
            // This preserves line numbers, stack traces, and DevTools experience
            this.originalConsole[method].apply(console, args);

            // Then handle logging if enabled and performance allows
            if (this.enabled && !this.performanceStats.disabled) {
              try {
                this.handleConsoleCall(method, args);
              } catch (error) {
                // Silently fail to avoid disrupting user's console experience
              }
            }

            // Update performance stats
            const endTime = performance.now();
            this.updatePerformanceStats(endTime - startTime);
          };
        }
      });
    }

    /**
     * Handle console method call for logging
     * @param {string} method - Console method name
     * @param {array} args - Console arguments
     */
    handleConsoleCall(method, args) {
      // Convert arguments to string message
      const message = args.map(arg => {
        if (typeof arg === 'string') {
          return arg;
        } else if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack}`;
        } else {
          try {
            return JSON.stringify(arg, null, 2);
          } catch (e) {
            return String(arg);
          }
        }
      }).join(' ');

      // Get stack trace for source location
      const stack = this.getStackTrace();

      // Create log entry
      const logEntry = {
        level: LOG_LEVELS[method] || 'INFO',
        message: message.slice(0, 10000), // Truncate very long messages
        service: this.config.service,
        component: this.config.component,
        sessionId: this.sessionManager ? this.sessionManager.getSessionId() : null,
        metadata: {
          source: 'console',
          method: method,
          argCount: args.length,
          stack: stack,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        }
      };

      // Add to batch
      if (this.batchSender) {
        this.batchSender.add(logEntry);
      }
    }

    /**
     * Send log directly (for internal logging)
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {object} metadata - Additional metadata
     */
    sendLogDirectly(level, message, metadata = {}) {
      if (!this.enabled || !this.batchSender) {
        return;
      }

      const logEntry = {
        level,
        message,
        service: this.config.service,
        component: this.config.component,
        sessionId: this.sessionManager ? this.sessionManager.getSessionId() : null,
        metadata: {
          source: 'client',
          url: window.location.href,
          timestamp: Date.now(),
          ...metadata
        }
      };

      this.batchSender.add(logEntry);
    }

    /**
     * Setup error and unhandled rejection capture
     */
    setupErrorCapture() {
      // Global error handler
      window.addEventListener('error', (event) => {
        if (!this.enabled) return;

        const logEntry = {
          level: 'error',
          message: `Uncaught Error: ${event.message}`,
          service: this.config.service,
          component: this.config.component,
          sessionId: this.sessionManager ? this.sessionManager.getSessionId() : null,
          metadata: {
            source: 'global-error',
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            stack: event.error ? event.error.stack : null,
            url: window.location.href,
            timestamp: Date.now()
          }
        };

        if (this.batchSender) {
          this.batchSender.add(logEntry);
        }
      });

      // Unhandled promise rejection handler
      window.addEventListener('unhandledrejection', (event) => {
        if (!this.enabled) return;

        const reason = event.reason;
        let message = 'Unhandled Promise Rejection';
        let stack = null;

        if (reason instanceof Error) {
          message = `Unhandled Promise Rejection: ${reason.message}`;
          stack = reason.stack;
        } else {
          message = `Unhandled Promise Rejection: ${String(reason)}`;
        }

        const logEntry = {
          level: 'error',
          message: message,
          service: this.config.service,
          component: this.config.component,
          sessionId: this.sessionManager ? this.sessionManager.getSessionId() : null,
          metadata: {
            source: 'unhandled-rejection',
            reason: typeof reason === 'object' ? JSON.stringify(reason) : String(reason),
            stack: stack,
            url: window.location.href,
            timestamp: Date.now()
          }
        };

        if (this.batchSender) {
          this.batchSender.add(logEntry);
        }
      });
    }

    /**
     * Get stack trace for source location
     * @returns {string} Stack trace
     */
    getStackTrace() {
      try {
        throw new Error();
      } catch (e) {
        // Remove this function and the console wrapper from stack
        const lines = e.stack.split('\n');
        return lines.slice(3).join('\n');
      }
    }

    /**
     * Update performance statistics
     * @param {number} duration - Operation duration in ms
     */
    updatePerformanceStats(duration) {
      this.performanceStats.calls++;
      this.performanceStats.totalTime += duration;
      this.performanceStats.avgTime = this.performanceStats.totalTime / this.performanceStats.calls;

      // Disable if performance threshold exceeded
      if (this.performanceStats.avgTime > this.config.performanceThreshold) {
        this.performanceStats.disabled = true;
        console.warn(`TkrLogging: Performance threshold exceeded (${this.performanceStats.avgTime.toFixed(2)}ms avg), disabling logging`);
      }
    }

    /**
     * Manual log method for direct logging
     * @param {string} level - Log level
     * @param {string} message - Log message
     * @param {object} metadata - Additional metadata
     */
    log(level, message, metadata = {}) {
      if (!this.enabled) {
        return;
      }

      const logEntry = {
        level: level.toUpperCase(),
        message: String(message).slice(0, 10000),
        service: this.config.service,
        component: this.config.component,
        sessionId: this.sessionManager ? this.sessionManager.getSessionId() : null,
        metadata: {
          source: 'manual',
          url: window.location.href,
          timestamp: Date.now(),
          ...metadata
        }
      };

      if (this.batchSender) {
        this.batchSender.add(logEntry);
      }
    }

    /**
     * Flush all pending logs
     * @returns {Promise<void>}
     */
    async flush() {
      if (this.batchSender) {
        await this.batchSender.flush(true);
      }
    }

    /**
     * Disable logging
     */
    disable() {
      this.enabled = false;
      this.sendLogDirectly('info', 'TkrLogging client disabled');
    }

    /**
     * Enable logging
     */
    enable() {
      if (!this.performanceStats.disabled) {
        this.enabled = true;
        this.sendLogDirectly('info', 'TkrLogging client enabled');
      } else {
        console.warn('TkrLogging: Cannot enable, performance threshold exceeded');
      }
    }

    /**
     * Get client statistics
     * @returns {object} Statistics
     */
    getStats() {
      const stats = {
        enabled: this.enabled,
        performance: this.performanceStats,
        session: this.sessionManager ? this.sessionManager.getSessionMetadata() : null,
        batch: this.batchSender ? this.batchSender.getStats() : null
      };

      return stats;
    }

    /**
     * Restore original console methods
     */
    restore() {
      Object.keys(this.originalConsole).forEach(method => {
        if (this.originalConsole[method]) {
          console[method] = this.originalConsole[method];
        }
      });

      if (this.batchSender) {
        this.batchSender.destroy();
      }

      this.enabled = false;
      this.sendLogDirectly('info', 'TkrLogging client restored original console');
    }
  }

  // Create global instance
  const loggingClient = new TkrLoggingClient();

  // Export global API
  window.TkrLogging = {
    init: loggingClient.init,
    log: loggingClient.log,
    flush: loggingClient.flush,
    disable: loggingClient.disable,
    enable: loggingClient.enable,
    getStats: () => loggingClient.getStats(),
    restore: () => loggingClient.restore(),
    _initialized: true,
    _client: loggingClient // For debugging only
  };

  // Auto-initialize if in development or if TKR_LOG_ENABLED is set
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('tkr_logging=true') ||
      localStorage.getItem('tkr_logging_enabled') === 'true') {

    // Small delay to ensure dependencies are loaded
    setTimeout(() => {
      if (window.SessionManager && window.BatchSender) {
        window.TkrLogging.init();
      }
    }, 100);
  }

})();