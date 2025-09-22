/**
 * Batch Manager for Enhanced Logging
 * Efficient batching system to avoid blocking and network overload
 */

class BatchManager {
  constructor(options = {}) {
    this.options = {
      // Batch configuration
      batchSize: options.batchSize || 10,
      flushInterval: options.flushInterval || 5000, // 5 seconds
      maxBatchSize: options.maxBatchSize || 100,
      maxMemoryUsage: options.maxMemoryUsage || 50 * 1024 * 1024, // 50MB

      // Network configuration
      maxRetries: options.maxRetries || 3,
      retryDelay: options.retryDelay || 1000,
      retryBackoff: options.retryBackoff || 2,
      requestTimeout: options.requestTimeout || 10000,

      // Fallback configuration
      fallbackToConsole: options.fallbackToConsole !== false,
      dropOnFailure: options.dropOnFailure || false,
      persistToDisk: options.persistToDisk || false,

      // Performance configuration
      enableCompression: options.enableCompression || false,
      prioritizeErrors: options.prioritizeErrors !== false,

      ...options
    };

    this.batch = [];
    this.flushTimer = null;
    this.isDestroyed = false;
    this.stats = {
      totalLogs: 0,
      batchesSent: 0,
      batchesFailed: 0,
      bytesProcessed: 0,
      averageBatchSize: 0,
      lastFlush: Date.now(),
      retryAttempts: 0
    };

    // Graceful shutdown handling
    this.setupGracefulShutdown();

    // Start the flush timer
    this.resetFlushTimer();
  }

  /**
   * Add a log entry to the batch
   */
  add(logData) {
    if (this.isDestroyed) {
      this.handleFallback([logData]);
      return;
    }

    // Priority handling: errors go to front of batch
    if (this.options.prioritizeErrors && this.isErrorLevel(logData.level)) {
      this.batch.unshift(logData);
    } else {
      this.batch.push(logData);
    }

    this.stats.totalLogs++;

    // Check if we should flush immediately
    if (this.shouldFlushImmediately()) {
      this.flush();
    }

    // Check memory usage
    if (this.isMemoryUsageHigh()) {
      this.flush();
    }
  }

  /**
   * Check if we should flush immediately
   */
  shouldFlushImmediately() {
    // Flush if batch is full
    if (this.batch.length >= this.options.batchSize) {
      return true;
    }

    // Flush if batch is at max size
    if (this.batch.length >= this.options.maxBatchSize) {
      return true;
    }

    // Flush immediately for fatal errors
    if (this.batch.some(log => log.level === 'fatal')) {
      return true;
    }

    return false;
  }

  /**
   * Check if memory usage is high
   */
  isMemoryUsageHigh() {
    try {
      if (typeof process !== 'undefined' && process.memoryUsage) {
        const usage = process.memoryUsage();
        return usage.heapUsed > this.options.maxMemoryUsage;
      }
    } catch (error) {
      // Ignore memory check errors
    }
    return false;
  }

  /**
   * Check if log level is an error
   */
  isErrorLevel(level) {
    return ['error', 'fatal'].includes(level?.toLowerCase());
  }

  /**
   * Flush the current batch
   */
  async flush() {
    if (this.batch.length === 0 || this.isDestroyed) {
      return;
    }

    const batchToSend = [...this.batch];
    this.batch = [];
    this.resetFlushTimer();

    try {
      await this.sendBatch(batchToSend);
      this.updateStats(batchToSend, true);
    } catch (error) {
      this.updateStats(batchToSend, false);
      await this.handleBatchFailure(batchToSend, error);
    }
  }

  /**
   * Send a batch to the logging endpoint (core module format)
   */
  async sendBatch(batch, attempt = 1) {
    const payload = {
      entries: batch.map(log => ({
        id: log.id || `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: log.timestamp,
        level: log.level,
        service: log.service,
        source: log.source,
        message: log.message,
        metadata: {
          ...log.metadata,
          batchId: this.generateBatchId(),
          attempt,
          batchSource: 'batch-manager'
        }
      })),
      timestamp: Date.now(),
      source: 'batch-manager'
    };

    // Add compression if enabled
    let body = JSON.stringify(payload);
    let headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'tkr-context-kit-logging-client/1.0.0'
    };

    if (this.options.enableCompression && body.length > 1024) {
      // Simple compression for large payloads
      try {
        const zlib = require('zlib');
        body = zlib.gzipSync(body);
        headers['Content-Encoding'] = 'gzip';
      } catch (error) {
        // Fallback to uncompressed if compression fails
      }
    }

    // Get the base URL from the first log entry or use default
    const baseUrl = batch[0]?.baseUrl || 'http://localhost:42003';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.requestTimeout);

    try {
      const response = await fetch(`${baseUrl}/api/logs/batch`, {
        method: 'POST',
        headers,
        body,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Handle batch failure with retry logic
   */
  async handleBatchFailure(batch, error) {
    const isNetworkError = error.name === 'TypeError' || error.code === 'ECONNREFUSED';
    const isTimeoutError = error.name === 'AbortError';
    const isRetryable = isNetworkError || isTimeoutError;

    // Try single log endpoint as fallback
    if (!isRetryable) {
      await this.sendIndividualLogs(batch);
      return;
    }

    // Implement retry with exponential backoff
    for (let attempt = 1; attempt <= this.options.maxRetries; attempt++) {
      try {
        const delay = this.options.retryDelay * Math.pow(this.options.retryBackoff, attempt - 1);
        await this.sleep(delay);

        await this.sendBatch(batch, attempt + 1);
        this.stats.retryAttempts += attempt;
        return; // Success!
      } catch (retryError) {
        if (attempt === this.options.maxRetries) {
          // Final attempt failed
          if (this.options.dropOnFailure) {
            console.warn(`Dropping ${batch.length} logs after ${this.options.maxRetries} retry attempts`);
          } else {
            await this.handleFinalFailure(batch, retryError);
          }
        }
      }
    }
  }

  /**
   * Send logs individually as fallback (core module format)
   */
  async sendIndividualLogs(batch) {
    for (const log of batch) {
      try {
        const baseUrl = log.baseUrl || 'http://localhost:42003';
        const coreLog = {
          timestamp: log.timestamp,
          level: log.level,
          service: log.service,
          source: log.source,
          message: log.message,
          metadata: log.metadata || {}
        };

        await fetch(`${baseUrl}/api/logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coreLog),
          signal: AbortSignal.timeout(this.options.requestTimeout)
        });
      } catch (error) {
        // Individual log failed, use fallback
        this.handleFallback([log]);
      }
    }
  }

  /**
   * Handle final failure after all retries
   */
  async handleFinalFailure(batch, error) {
    if (this.options.persistToDisk) {
      await this.persistBatchToDisk(batch);
    } else {
      this.handleFallback(batch);
    }
  }

  /**
   * Persist batch to disk for later retry
   */
  async persistBatchToDisk(batch) {
    try {
      const fs = require('fs').promises;
      const path = require('path');
      const os = require('os');

      const logDir = path.join(os.tmpdir(), 'tkr-context-kit-logs');
      await fs.mkdir(logDir, { recursive: true });

      const filename = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}.json`;
      const filepath = path.join(logDir, filename);

      await fs.writeFile(filepath, JSON.stringify(batch, null, 2));
      console.warn(`Persisted ${batch.length} logs to ${filepath}`);
    } catch (error) {
      console.error('Failed to persist logs to disk:', error);
      this.handleFallback(batch);
    }
  }

  /**
   * Handle fallback logging (usually to console)
   */
  handleFallback(batch) {
    if (!this.options.fallbackToConsole) return;

    for (const log of batch) {
      const level = (log.level || 'info').toLowerCase();
      const consoleMethod = level === 'fatal' ? 'error' : level;

      if (console[consoleMethod]) {
        console[consoleMethod](
          `[${log.level}] ${log.service}/${log.source}: ${log.message}`,
          log.metadata || ''
        );
      }
    }
  }

  /**
   * Update statistics
   */
  updateStats(batch, success) {
    const batchSize = batch.length;
    const batchBytes = JSON.stringify(batch).length;

    this.stats.bytesProcessed += batchBytes;

    if (success) {
      this.stats.batchesSent++;
    } else {
      this.stats.batchesFailed++;
    }

    // Update average batch size
    const totalBatches = this.stats.batchesSent + this.stats.batchesFailed;
    this.stats.averageBatchSize = totalBatches > 0
      ? (this.stats.averageBatchSize * (totalBatches - 1) + batchSize) / totalBatches
      : batchSize;

    this.stats.lastFlush = Date.now();
  }

  /**
   * Reset the flush timer
   */
  resetFlushTimer() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }

    this.flushTimer = setTimeout(() => {
      this.flush();
    }, this.options.flushInterval);
  }

  /**
   * Generate a unique batch ID
   */
  generateBatchId() {
    return `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep for a given number of milliseconds
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Setup graceful shutdown handling
   */
  setupGracefulShutdown() {
    if (typeof process !== 'undefined') {
      const shutdownHandler = () => {
        this.destroy();
      };

      process.on('SIGINT', shutdownHandler);
      process.on('SIGTERM', shutdownHandler);
      process.on('beforeExit', shutdownHandler);
    }
  }

  /**
   * Force flush and destroy the batch manager
   */
  async destroy() {
    if (this.isDestroyed) return;

    this.isDestroyed = true;

    // Clear the timer
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush any remaining logs
    if (this.batch.length > 0) {
      try {
        await this.flush();
      } catch (error) {
        console.warn('Failed to flush logs during shutdown:', error);
      }
    }
  }

  /**
   * Get current statistics
   */
  getStats() {
    const now = Date.now();
    const timeSinceLastFlush = now - this.stats.lastFlush;

    return {
      ...this.stats,
      currentBatchSize: this.batch.length,
      timeSinceLastFlush,
      successRate: this.stats.batchesSent + this.stats.batchesFailed > 0
        ? this.stats.batchesSent / (this.stats.batchesSent + this.stats.batchesFailed)
        : 0,
      averageBytesPerLog: this.stats.totalLogs > 0
        ? this.stats.bytesProcessed / this.stats.totalLogs
        : 0
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.resetFlushTimer();
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.options };
  }

  /**
   * Clear all pending logs
   */
  clear() {
    this.batch = [];
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.resetFlushTimer();
  }

  /**
   * Create a batch manager with environment-based defaults
   */
  static createFromEnvironment(customOptions = {}) {
    const env = process.env || {};

    const options = {
      batchSize: parseInt(env.TKR_LOG_BATCH_SIZE) || 10,
      flushInterval: parseInt(env.TKR_LOG_FLUSH_INTERVAL) || 5000,
      maxRetries: parseInt(env.TKR_LOG_MAX_RETRIES) || 3,
      fallbackToConsole: env.TKR_LOG_FALLBACK !== 'false',
      dropOnFailure: env.TKR_LOG_DROP_ON_FAILURE === 'true',
      enableCompression: env.TKR_LOG_COMPRESSION === 'true',
      ...customOptions
    };

    return new BatchManager(options);
  }
}

module.exports = {
  BatchManager
};