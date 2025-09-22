/**
 * Batch Sender for TKR Browser Logging Client
 * Handles batch queue management, network failure handling, and offline storage
 */

class BatchSender {
  constructor(config = {}) {
    this.endpoint = config.endpoint || 'http://localhost:42003/api/logs/batch';
    this.batchSize = config.batchSize || 10;
    this.flushInterval = config.flushInterval || 5000;
    this.maxRetries = config.maxRetries || 3;
    this.retryDelay = config.retryDelay || 1000;
    this.maxQueueSize = config.maxQueueSize || 1000;
    this.performanceThreshold = config.performanceThreshold || 1; // 1ms

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

  /**
   * Initialize network and visibility event listeners
   */
  initializeEventListeners() {
    // Network status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processOfflineQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility for batch flushing
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flush(true); // Force flush when page becomes hidden
      }
    });

    // Before unload - final flush
    window.addEventListener('beforeunload', () => {
      this.flush(true);
    });
  }

  /**
   * Add log entry to batch queue
   * @param {object} logEntry - Log entry to queue
   */
  add(logEntry) {
    const startTime = performance.now();

    // Check performance threshold
    if (this.stats.avgTime > this.performanceThreshold) {
      console.warn('TkrLogging: Performance threshold exceeded, dropping log');
      return;
    }

    // Check queue size limits
    if (this.queue.length >= this.maxQueueSize) {
      console.warn('TkrLogging: Queue size limit reached, dropping oldest log');
      this.queue.shift();
    }

    // Add timestamp and trace ID if not present
    const enrichedEntry = {
      timestamp: Date.now(),
      traceId: this.generateTraceId(),
      ...logEntry
    };

    this.queue.push(enrichedEntry);

    // Update performance stats
    const endTime = performance.now();
    const duration = endTime - startTime;
    this.updatePerformanceStats(duration);

    // Check if we should flush immediately
    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush current queue
   * @param {boolean} force - Force flush even if batch size not reached
   * @returns {Promise<void>}
   */
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

  /**
   * Send batch to server (supports both legacy and unified core API formats)
   * @param {object} payload - Batch payload
   * @param {number} retryCount - Current retry attempt
   * @returns {Promise<void>}
   */
  async sendBatch(payload, retryCount = 0) {
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Transform payload to match unified core API format
      const corePayload = {
        entries: payload.logs.map(log => ({
          id: log.traceId || this.generateTraceId(),
          timestamp: log.timestamp,
          level: log.level.toLowerCase(), // Core expects lowercase levels
          service: log.service,
          source: log.component || log.source || 'browser',
          message: log.message,
          metadata: {
            ...log.metadata,
            originalLevel: log.level, // Preserve original case
            batchId: payload.metadata.batchId,
            userAgent: payload.metadata.userAgent,
            url: payload.metadata.url
          }
        })),
        timestamp: payload.metadata.timestamp,
        source: payload.metadata.source
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(corePayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Success
      this.stats.sent += payload.logs.length;
      const duration = performance.now() - startTime;
      this.updatePerformanceStats(duration);

      // Clear any retry timeout for this batch
      if (this.retryTimeouts.has(payload.metadata.batchId)) {
        clearTimeout(this.retryTimeouts.get(payload.metadata.batchId));
        this.retryTimeouts.delete(payload.metadata.batchId);
      }

    } catch (error) {
      const duration = performance.now() - startTime;
      this.updatePerformanceStats(duration);

      // Handle retry logic
      if (retryCount < this.maxRetries) {
        this.stats.retries++;
        const delay = this.retryDelay * Math.pow(2, retryCount); // Exponential backoff

        const timeoutId = setTimeout(() => {
          this.sendBatch(payload, retryCount + 1);
        }, delay);

        this.retryTimeouts.set(payload.metadata.batchId, timeoutId);
      } else {
        // Max retries exceeded, queue offline
        this.stats.failed += payload.logs.length;
        this.queueOffline(payload);
        console.warn('TkrLogging: Failed to send batch after retries:', error.message);
      }
    }
  }

  /**
   * Queue batch for offline storage
   * @param {object} payload - Batch payload
   */
  queueOffline(payload) {
    this.offlineQueue.push(payload);

    // Limit offline queue size
    while (this.offlineQueue.length > 100) {
      this.offlineQueue.shift();
    }

    this.saveOfflineQueue();
  }

  /**
   * Process offline queue when back online
   */
  async processOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      return;
    }

    console.log('TkrLogging: Processing offline queue, count:', this.offlineQueue.length);

    // Process batches with delays to avoid overwhelming the server
    for (let i = 0; i < this.offlineQueue.length; i++) {
      const payload = this.offlineQueue[i];
      await this.sendBatch(payload);

      // Small delay between batches
      if (i < this.offlineQueue.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    this.offlineQueue = [];
    this.saveOfflineQueue();
  }

  /**
   * Save offline queue to localStorage
   */
  saveOfflineQueue() {
    try {
      localStorage.setItem('tkr_logging_offline_queue', JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.warn('TkrLogging: Failed to save offline queue:', error.message);
    }
  }

  /**
   * Load offline queue from localStorage
   */
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

  /**
   * Start flush timer
   */
  startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop flush timer
   */
  stopFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Update performance statistics
   * @param {number} duration - Operation duration in ms
   */
  updatePerformanceStats(duration) {
    this.stats.totalTime += duration;
    const totalOps = this.stats.sent + this.stats.failed + this.stats.retries;
    this.stats.avgTime = totalOps > 0 ? this.stats.totalTime / totalOps : 0;
  }

  /**
   * Generate batch ID
   * @returns {string} Batch ID
   */
  generateBatchId() {
    return 'batch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate trace ID
   * @returns {string} Trace ID
   */
  generateTraceId() {
    return 'trace_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Get current statistics
   * @returns {object} Statistics object
   */
  getStats() {
    return {
      ...this.stats,
      queueSize: this.queue.length,
      offlineQueueSize: this.offlineQueue.length,
      isOnline: this.isOnline
    };
  }

  /**
   * Clear all queues and reset
   */
  clear() {
    this.queue = [];
    this.offlineQueue = [];
    this.saveOfflineQueue();

    // Clear retry timeouts
    this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.retryTimeouts.clear();

    // Reset stats
    this.stats = {
      sent: 0,
      failed: 0,
      retries: 0,
      totalTime: 0,
      avgTime: 0
    };
  }

  /**
   * Destroy batch sender and clean up
   */
  destroy() {
    this.stopFlushTimer();
    this.flush(true);

    // Clear retry timeouts
    this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.retryTimeouts.clear();

    // Remove event listeners
    window.removeEventListener('online', this.processOfflineQueue);
    window.removeEventListener('offline', () => this.isOnline = false);
  }
}

// Export for browser environments
if (typeof window !== 'undefined') {
  window.BatchSender = BatchSender;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BatchSender;
}