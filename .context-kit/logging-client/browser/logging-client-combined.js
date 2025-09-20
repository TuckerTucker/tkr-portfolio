/**
 * TKR Browser Logging Client - Combined Version
 * Includes SessionManager, BatchSender, and LoggingClient in a single file
 * Perfect for single-script deployment
 */

(function() {
  'use strict';

  // Check if already initialized
  if (window.TkrLogging && window.TkrLogging._initialized) {
    return;
  }

  // === SESSION MANAGER ===
  class SessionManager {
    constructor() {
      this.sessionId = null;
      this.storageKey = 'tkr_logging_session';
      this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
    }

    generateUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }

    initialize() {
      try {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
          const sessionData = JSON.parse(stored);
          const now = Date.now();
          if (sessionData.timestamp && (now - sessionData.timestamp) < this.sessionDuration) {
            this.sessionId = sessionData.sessionId;
            return this.sessionId;
          }
        }
      } catch (error) {
        console.warn('TkrLogging: Failed to read session from localStorage:', error.message);
      }

      this.sessionId = this.generateUUID();
      this.persistSession();
      return this.sessionId;
    }

    persistSession() {
      try {
        const sessionData = {
          sessionId: this.sessionId,
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        localStorage.setItem(this.storageKey, JSON.stringify(sessionData));
      } catch (error) {
        console.warn('TkrLogging: Failed to persist session to localStorage:', error.message);
      }
    }

    getSessionId() {
      return this.sessionId;
    }

    renewSession() {
      this.sessionId = this.generateUUID();
      this.persistSession();
      return this.sessionId;
    }

    clearSession() {
      this.sessionId = null;
      try {
        localStorage.removeItem(this.storageKey);
      } catch (error) {
        // Ignore localStorage errors
      }
    }

    generateTraceId() {
      return this.generateUUID();
    }

    getSessionMetadata() {
      return {
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: Date.now(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      };
    }
  }

  // === BATCH SENDER ===
  class BatchSender {
    constructor(config = {}) {
      this.endpoint = config.endpoint || 'http://localhost:42003/api/logs/batch';
      this.batchSize = config.batchSize || 10;
      this.flushInterval = config.flushInterval || 5000;
      this.maxRetries = config.maxRetries || 3;
      this.retryDelay = config.retryDelay || 1000;
      this.maxQueueSize = config.maxQueueSize || 1000;
      this.performanceThreshold = config.performanceThreshold || 1;

      this.queue = [];
      this.offlineQueue = [];
      this.flushTimer = null;
      this.isOnline = navigator.onLine;
      this.retryTimeouts = new Map();
      this.stats = {
        sent: 0,
        failed: 0,
        retries: 0,
        totalTime: 0,
        avgTime: 0
      };

      this.initializeEventListeners();
      this.loadOfflineQueue();
      this.startFlushTimer();
    }

    initializeEventListeners() {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });

      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.flush(true);
        }
      });

      window.addEventListener('beforeunload', () => {
        this.flush(true);
      });
    }

    add(logEntry) {
      const startTime = performance.now();

      if (this.stats.avgTime > this.performanceThreshold) {
        console.warn('TkrLogging: Performance threshold exceeded, dropping log');
        return;
      }

      if (this.queue.length >= this.maxQueueSize) {
        console.warn('TkrLogging: Queue size limit reached, dropping oldest log');
        this.queue.shift();
      }

      const enrichedEntry = {
        timestamp: Date.now(),
        traceId: this.generateTraceId(),
        ...logEntry
      };

      this.queue.push(enrichedEntry);

      const endTime = performance.now();
      const duration = endTime - startTime;
      this.updatePerformanceStats(duration);

      if (this.queue.length >= this.batchSize) {
        this.flush();
      }
    }

    async flush(force = false) {
      if (this.queue.length === 0) {
        return;
      }

      if (!force && this.queue.length < this.batchSize) {
        return;
      }

      const batch = this.queue.splice(0, this.batchSize);
      const batchId = this.generateBatchId();

      const payload = {
        logs: batch,
        metadata: {
          batchId,
          source: 'browser',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }
      };

      if (this.isOnline) {
        await this.sendBatch(payload);
      } else {
        this.queueOffline(payload);
      }
    }

    async sendBatch(payload, retryCount = 0) {
      const startTime = performance.now();

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(this.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        this.stats.sent += payload.logs.length;
        const duration = performance.now() - startTime;
        this.updatePerformanceStats(duration);

        if (this.retryTimeouts.has(payload.metadata.batchId)) {
          clearTimeout(this.retryTimeouts.get(payload.metadata.batchId));
          this.retryTimeouts.delete(payload.metadata.batchId);
        }

      } catch (error) {
        const duration = performance.now() - startTime;
        this.updatePerformanceStats(duration);

        if (retryCount < this.maxRetries) {
          this.stats.retries++;
          const delay = this.retryDelay * Math.pow(2, retryCount);

          const timeoutId = setTimeout(() => {
            this.sendBatch(payload, retryCount + 1);
          }, delay);

          this.retryTimeouts.set(payload.metadata.batchId, timeoutId);
        } else {
          this.stats.failed += payload.logs.length;
          this.queueOffline(payload);
          console.warn('TkrLogging: Failed to send batch after retries:', error.message);
        }
      }
    }

    queueOffline(payload) {
      this.offlineQueue.push(payload);
      while (this.offlineQueue.length > 100) {
        this.offlineQueue.shift();
      }
      this.saveOfflineQueue();
    }

    async processOfflineQueue() {
      if (this.offlineQueue.length === 0) {
        return;
      }

      console.log('TkrLogging: Processing offline queue, count:', this.offlineQueue.length);

      for (let i = 0; i < this.offlineQueue.length; i++) {
        const payload = this.offlineQueue[i];
        await this.sendBatch(payload);

        if (i < this.offlineQueue.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      this.offlineQueue = [];
      this.saveOfflineQueue();
    }

    saveOfflineQueue() {
      try {
        localStorage.setItem('tkr_logging_offline_queue', JSON.stringify(this.offlineQueue));
      } catch (error) {
        console.warn('TkrLogging: Failed to save offline queue:', error.message);
      }
    }

    loadOfflineQueue() {
      try {
        const stored = localStorage.getItem('tkr_logging_offline_queue');
        if (stored) {
          this.offlineQueue = JSON.parse(stored);
        }
      } catch (error) {
        console.warn('TkrLogging: Failed to load offline queue:', error.message);
        this.offlineQueue = [];
      }
    }

    startFlushTimer() {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
      }
      this.flushTimer = setInterval(() => {
        this.flush();
      }, this.flushInterval);
    }

    stopFlushTimer() {
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }
    }

    updatePerformanceStats(duration) {
      this.stats.totalTime += duration;
      const totalOps = this.stats.sent + this.stats.failed + this.stats.retries;
      this.stats.avgTime = totalOps > 0 ? this.stats.totalTime / totalOps : 0;
    }

    generateBatchId() {
      return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTraceId() {
      return 'trace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getStats() {
      return {
        ...this.stats,
        queueSize: this.queue.length,
        offlineQueueSize: this.offlineQueue.length,
        isOnline: this.isOnline
      };
    }

    clear() {
      this.queue = [];
      this.offlineQueue = [];
      this.saveOfflineQueue();
      this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      this.retryTimeouts.clear();
      this.stats = {
        sent: 0,
        failed: 0,
        retries: 0,
        totalTime: 0,
        avgTime: 0
      };
    }

    destroy() {
      this.stopFlushTimer();
      this.flush(true);
      this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      this.retryTimeouts.clear();
    }
  }

  // === LOGGING CLIENT ===
  const DEFAULT_CONFIG = {
    endpoint: 'http://localhost:42003/api/logs/batch',
    batchSize: 10,
    flushInterval: 5000,
    captureErrors: true,
    sessionTracking: true,
    performanceThreshold: 1,
    enabled: true,
    service: 'browser',
    component: 'browser-console'
  };

  const LOG_LEVELS = {
    log: 'INFO',
    info: 'INFO',
    warn: 'WARN',
    error: 'ERROR',
    debug: 'DEBUG',
    trace: 'DEBUG'
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

      this.init = this.init.bind(this);
      this.log = this.log.bind(this);
      this.flush = this.flush.bind(this);
      this.enable = this.enable.bind(this);
      this.disable = this.disable.bind(this);
    }

    init(config = {}) {
      this.config = { ...this.config, ...config };

      if (!this.config.enabled) {
        return;
      }

      try {
        this.sessionManager = new SessionManager();
        this.sessionManager.initialize();

        this.batchSender = new BatchSender({
          endpoint: this.config.endpoint,
          batchSize: this.config.batchSize,
          flushInterval: this.config.flushInterval,
          performanceThreshold: this.config.performanceThreshold
        });

        this.interceptConsole();

        if (this.config.captureErrors) {
          this.setupErrorCapture();
        }

        this.enabled = true;

        this.sendLogDirectly('INFO', 'TkrLogging client initialized', {
          config: { ...this.config, endpoint: '[redacted]' },
          sessionId: this.sessionManager.getSessionId()
        });

      } catch (error) {
        console.error('TkrLogging: Failed to initialize:', error);
      }
    }

    interceptConsole() {
      const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'trace'];

      consoleMethods.forEach(method => {
        if (typeof console[method] === 'function') {
          this.originalConsole[method] = console[method];

          console[method] = (...args) => {
            const startTime = performance.now();

            // Call original method FIRST for perfect passthrough
            this.originalConsole[method].apply(console, args);

            // Then handle logging
            if (this.enabled && !this.performanceStats.disabled) {
              try {
                this.handleConsoleCall(method, args);
              } catch (error) {
                // Silently fail
              }
            }

            const endTime = performance.now();
            this.updatePerformanceStats(endTime - startTime);
          };
        }
      });
    }

    handleConsoleCall(method, args) {
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

      const stack = this.getStackTrace();

      const logEntry = {
        level: LOG_LEVELS[method] || 'INFO',
        message: message.slice(0, 10000),
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

      if (this.batchSender) {
        this.batchSender.add(logEntry);
      }
    }

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

    setupErrorCapture() {
      window.addEventListener('error', (event) => {
        if (!this.enabled) return;

        const logEntry = {
          level: 'ERROR',
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
          level: 'ERROR',
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

    getStackTrace() {
      try {
        throw new Error();
      } catch (e) {
        const lines = e.stack.split('\n');
        return lines.slice(3).join('\n');
      }
    }

    updatePerformanceStats(duration) {
      this.performanceStats.calls++;
      this.performanceStats.totalTime += duration;
      this.performanceStats.avgTime = this.performanceStats.totalTime / this.performanceStats.calls;

      if (this.performanceStats.avgTime > this.config.performanceThreshold) {
        this.performanceStats.disabled = true;
        console.warn(`TkrLogging: Performance threshold exceeded (${this.performanceStats.avgTime.toFixed(2)}ms avg), disabling logging`);
      }
    }

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

    async flush() {
      if (this.batchSender) {
        await this.batchSender.flush(true);
      }
    }

    disable() {
      this.enabled = false;
      this.sendLogDirectly('INFO', 'TkrLogging client disabled');
    }

    enable() {
      if (!this.performanceStats.disabled) {
        this.enabled = true;
        this.sendLogDirectly('INFO', 'TkrLogging client enabled');
      } else {
        console.warn('TkrLogging: Cannot enable, performance threshold exceeded');
      }
    }

    getStats() {
      const stats = {
        enabled: this.enabled,
        performance: this.performanceStats,
        session: this.sessionManager ? this.sessionManager.getSessionMetadata() : null,
        batch: this.batchSender ? this.batchSender.getStats() : null
      };

      return stats;
    }

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
      this.sendLogDirectly('INFO', 'TkrLogging client restored original console');
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
    _client: loggingClient
  };

  // Auto-initialize if in development
  if (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.search.includes('tkr_logging=true') ||
      localStorage.getItem('tkr_logging_enabled') === 'true') {

    setTimeout(() => {
      window.TkrLogging.init();
    }, 100);
  }

})();