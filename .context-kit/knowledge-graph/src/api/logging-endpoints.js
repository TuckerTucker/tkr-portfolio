/**
 * Enhanced Logging API Endpoints for Knowledge Graph
 *
 * Provides comprehensive logging API with:
 * - Batch log submission
 * - Browser client script serving
 * - Rate limiting
 * - Deduplication
 * - Enhanced analytics
 *
 * @fileoverview Wave 2 logging endpoints for integration with Wave 1 components
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createHash } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Rate limiting store - simple in-memory implementation
 * In production, this should be replaced with Redis or similar
 */
class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.store = new Map();
  }

  /**
   * Check if request is within rate limit
   * @param {string} key - Rate limiting key (IP or user identifier)
   * @returns {boolean} - True if within limit, false if exceeded
   */
  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries
    if (Math.random() < 0.01) { // 1% chance to cleanup
      this.cleanup(windowStart);
    }

    // Get or create record for this key
    if (!this.store.has(key)) {
      this.store.set(key, []);
    }

    const requests = this.store.get(key);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    // Check if we're within the limit
    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add this request
    validRequests.push(now);
    this.store.set(key, validRequests);

    return true;
  }

  /**
   * Clean up old entries from the store
   * @param {number} windowStart - Timestamp before which entries are old
   */
  cleanup(windowStart) {
    for (const [key, requests] of this.store.entries()) {
      const validRequests = requests.filter(timestamp => timestamp > windowStart);
      if (validRequests.length === 0) {
        this.store.delete(key);
      } else {
        this.store.set(key, validRequests);
      }
    }
  }

  /**
   * Get current stats for monitoring
   * @returns {object} Rate limiter statistics
   */
  getStats() {
    return {
      totalKeys: this.store.size,
      totalRequests: Array.from(this.store.values()).reduce((sum, requests) => sum + requests.length, 0),
      windowMs: this.windowMs,
      maxRequests: this.maxRequests
    };
  }
}

/**
 * Log deduplication service
 * Prevents spam by tracking message hashes and frequencies
 */
class LogDeduplicator {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 30000; // 30 seconds
    this.maxDuplicates = options.maxDuplicates || 5;
    this.store = new Map();
  }

  /**
   * Generate a hash for deduplication
   * @param {object} logEntry - Log entry to hash
   * @returns {string} - Hash string
   */
  generateHash(logEntry) {
    const key = `${logEntry.service}:${logEntry.level}:${logEntry.message}`;
    return createHash('md5').update(key).digest('hex');
  }

  /**
   * Check if log entry should be processed or is a duplicate
   * @param {object} logEntry - Log entry to check
   * @returns {object} - { allowed: boolean, count?: number, suppressed?: boolean }
   */
  shouldProcess(logEntry) {
    const hash = this.generateHash(logEntry);
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up old entries periodically
    if (Math.random() < 0.02) { // 2% chance
      this.cleanup(windowStart);
    }

    // Get or create record
    if (!this.store.has(hash)) {
      this.store.set(hash, {
        count: 0,
        firstSeen: now,
        lastSeen: now,
        suppressed: false
      });
    }

    const record = this.store.get(hash);

    // If outside window, reset
    if (record.lastSeen < windowStart) {
      record.count = 0;
      record.firstSeen = now;
      record.suppressed = false;
    }

    record.count++;
    record.lastSeen = now;

    // Check if we should suppress
    if (record.count > this.maxDuplicates) {
      record.suppressed = true;
      return {
        allowed: false,
        count: record.count,
        suppressed: true,
        firstSeen: record.firstSeen
      };
    }

    // Allow, but add metadata about duplicates
    return {
      allowed: true,
      count: record.count,
      suppressed: false,
      firstSeen: record.count > 1 ? record.firstSeen : undefined
    };
  }

  /**
   * Clean up old entries
   * @param {number} windowStart - Timestamp before which entries are old
   */
  cleanup(windowStart) {
    for (const [hash, record] of this.store.entries()) {
      if (record.lastSeen < windowStart) {
        this.store.delete(hash);
      }
    }
  }

  /**
   * Get deduplication statistics
   * @returns {object} Deduplication stats
   */
  getStats() {
    const now = Date.now();
    let activeDuplicates = 0;
    let suppressedMessages = 0;

    for (const record of this.store.values()) {
      if (record.lastSeen > now - this.windowMs) {
        if (record.count > 1) activeDuplicates++;
        if (record.suppressed) suppressedMessages++;
      }
    }

    return {
      totalHashes: this.store.size,
      activeDuplicates,
      suppressedMessages,
      windowMs: this.windowMs,
      maxDuplicates: this.maxDuplicates
    };
  }
}

/**
 * Enhanced logging endpoints class
 * Provides Wave 2 functionality integrating with Wave 1 components
 */
export class LoggingEndpoints {
  constructor(options = {}) {
    // Dependencies from main server
    this.kg = options.kg;
    this.logService = options.logService;
    this.logger = options.logger;

    // Rate limiting for log endpoints
    this.rateLimiter = new RateLimiter({
      windowMs: 60000,  // 1 minute
      maxRequests: 1000  // 1000 requests per minute per IP
    });

    // Deduplication for log messages
    this.deduplicator = new LogDeduplicator({
      windowMs: 30000,   // 30 second window
      maxDuplicates: 5   // Allow 5 duplicates before suppressing
    });

    // Cache for browser client script
    this.browserClientCache = null;
    this.browserClientPath = join(__dirname, '../../../browser-client/logging-client.js');

    // Performance monitoring
    this.stats = {
      batchRequests: 0,
      individualRequests: 0,
      rateLimitHits: 0,
      duplicatesSuppressed: 0,
      clientScriptServed: 0,
      averageProcessingTime: 0,
      totalProcessingTime: 0
    };
  }

  /**
   * Middleware to check rate limits
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   * @returns {boolean} - True if request should continue, false if rate limited
   */
  checkRateLimit(req, res) {
    const clientIP = req.socket.remoteAddress || 'unknown';
    const isAllowed = this.rateLimiter.isAllowed(clientIP);

    if (!isAllowed) {
      this.stats.rateLimitHits++;
      this.logger?.warn('Rate limit exceeded', {
        clientIP,
        userAgent: req.headers['user-agent'],
        path: req.url
      }, { component: 'RateLimiter' });

      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: 60
      }));
      return false;
    }

    return true;
  }

  /**
   * Validate log entry according to interface specification
   * @param {object} logEntry - Log entry to validate
   * @returns {object} - { valid: boolean, errors?: string[] }
   */
  validateLogEntry(logEntry) {
    const errors = [];

    // Required fields
    if (!logEntry.level || typeof logEntry.level !== 'string') {
      errors.push('level is required and must be a string');
    } else if (!['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'].includes(logEntry.level.toUpperCase())) {
      errors.push('level must be one of: DEBUG, INFO, WARN, ERROR, FATAL');
    }

    if (!logEntry.message || typeof logEntry.message !== 'string') {
      errors.push('message is required and must be a string');
    } else if (logEntry.message.length > 10000) {
      errors.push('message must be 10000 characters or less');
    }

    if (!logEntry.service || typeof logEntry.service !== 'string') {
      errors.push('service is required and must be a string');
    } else if (logEntry.service.length > 100) {
      errors.push('service must be 100 characters or less');
    }

    // Optional fields validation
    if (logEntry.component && (typeof logEntry.component !== 'string' || logEntry.component.length > 100)) {
      errors.push('component must be a string of 100 characters or less');
    }

    if (logEntry.timestamp && typeof logEntry.timestamp !== 'number') {
      errors.push('timestamp must be a number (Unix timestamp)');
    }

    if (logEntry.metadata && typeof logEntry.metadata !== 'object') {
      errors.push('metadata must be an object');
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Handle batch log submission
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   */
  async handleBatchLogs(req, res) {
    const startTime = Date.now();

    // Check rate limiting first
    if (!this.checkRateLimit(req, res)) {
      return;
    }

    try {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        try {
          const batchData = JSON.parse(body);

          // Validate batch structure
          if (!batchData.logs || !Array.isArray(batchData.logs)) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Invalid batch format',
              message: 'Request must contain a "logs" array'
            }));
            return;
          }

          if (batchData.logs.length > 100) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              error: 'Batch too large',
              message: 'Maximum 100 logs per batch'
            }));
            return;
          }

          const results = {
            processed: 0,
            duplicates: 0,
            errors: [],
            batchId: batchData.metadata?.batchId || `batch_${Date.now()}`
          };

          // Process each log in the batch
          for (let i = 0; i < batchData.logs.length; i++) {
            const logEntry = batchData.logs[i];

            // Validate log entry
            const validation = this.validateLogEntry(logEntry);
            if (!validation.valid) {
              results.errors.push({
                index: i,
                errors: validation.errors
              });
              continue;
            }

            // Check for duplicates
            const dedupResult = this.deduplicator.shouldProcess(logEntry);
            if (!dedupResult.allowed) {
              results.duplicates++;
              this.stats.duplicatesSuppressed++;
              continue;
            }

            // Add deduplication metadata if this is a repeat
            if (dedupResult.count > 1) {
              logEntry.metadata = logEntry.metadata || {};
              logEntry.metadata.duplicateCount = dedupResult.count;
              logEntry.metadata.firstSeen = dedupResult.firstSeen;
            }

            // Add batch metadata
            logEntry.metadata = logEntry.metadata || {};
            logEntry.metadata.batchId = results.batchId;
            logEntry.metadata.source = batchData.metadata?.source || 'unknown';
            logEntry.metadata.batchIndex = i;

            // Set timestamp if not provided
            if (!logEntry.timestamp) {
              logEntry.timestamp = Math.floor(Date.now() / 1000);
            }

            // Process the log entry through the existing logger
            await this.processLogEntry(logEntry);
            results.processed++;
          }

          // Update statistics
          this.stats.batchRequests++;
          const processingTime = Date.now() - startTime;
          this.updatePerformanceStats(processingTime);

          // Log the batch processing
          this.logger?.info('Batch logs processed', {
            batchId: results.batchId,
            totalLogs: batchData.logs.length,
            processed: results.processed,
            duplicates: results.duplicates,
            errors: results.errors.length,
            processingTimeMs: processingTime,
            source: batchData.metadata?.source
          }, { component: 'BatchProcessor' });

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            status: 'success',
            results
          }));

        } catch (parseError) {
          this.logger?.error('Failed to parse batch log submission', parseError, {
            bodyLength: body.length,
            contentType: req.headers['content-type']
          }, { component: 'BatchProcessor' });

          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'Invalid JSON',
            message: 'Could not parse request body as JSON'
          }));
        }
      });

    } catch (error) {
      this.logger?.error('Error handling batch log submission', error, {}, { component: 'BatchProcessor' });

      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to process batch logs'
      }));
    }
  }

  /**
   * Serve the browser logging client script
   * @param {IncomingMessage} req - HTTP request
   * @param {ServerResponse} res - HTTP response
   */
  async handleClientScript(req, res) {
    try {
      // Load and cache the browser client script
      if (!this.browserClientCache) {
        try {
          this.browserClientCache = readFileSync(this.browserClientPath, 'utf8');
          this.logger?.debug('Browser client script loaded from disk', {
            path: this.browserClientPath,
            size: this.browserClientCache.length
          }, { component: 'ClientScriptServer' });
        } catch (readError) {
          this.logger?.error('Failed to read browser client script', readError, {
            path: this.browserClientPath
          }, { component: 'ClientScriptServer' });

          res.writeHead(404, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            error: 'Client script not found',
            message: 'Browser logging client script is not available'
          }));
          return;
        }
      }

      // Update statistics
      this.stats.clientScriptServed++;

      // Set appropriate headers for JavaScript
      res.writeHead(200, {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=300', // 5 minute cache
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });

      res.end(this.browserClientCache);

      this.logger?.debug('Browser client script served', {
        userAgent: req.headers['user-agent'],
        referer: req.headers.referer,
        size: this.browserClientCache.length
      }, { component: 'ClientScriptServer' });

    } catch (error) {
      this.logger?.error('Error serving browser client script', error, {}, { component: 'ClientScriptServer' });

      res.writeHead(500, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      });
      res.end(JSON.stringify({
        error: 'Internal server error',
        message: 'Failed to serve client script'
      }));
    }
  }

  /**
   * Process a single log entry through the existing logger
   * @param {object} logEntry - Validated log entry
   */
  async processLogEntry(logEntry) {
    // Insert directly into database to preserve service information
    if (this.logService) {
      await this.logService.addLog({
        level: logEntry.level.toUpperCase(),
        message: logEntry.message,
        service: logEntry.service || 'Unknown',
        component: logEntry.component || 'RemoteClient',
        data: JSON.stringify(logEntry.metadata || {}),
        timestamp: logEntry.timestamp || Math.floor(Date.now() / 1000)
      });
    } else {
      // Fallback to logger if logService not available
      const level = logEntry.level.toLowerCase();
      const metadata = logEntry.metadata || {};
      const options = { component: logEntry.component || 'RemoteClient' };

      switch (level) {
        case 'debug':
          this.logger?.debug(logEntry.message, metadata, options);
          break;
        case 'info':
          this.logger?.info(logEntry.message, metadata, options);
          break;
        case 'warn':
          this.logger?.warn(logEntry.message, metadata, options);
          break;
        case 'error':
          this.logger?.error(logEntry.message, undefined, metadata, options);
          break;
        case 'fatal':
          this.logger?.fatal(logEntry.message, undefined, metadata, options);
          break;
        default:
          this.logger?.info(logEntry.message, metadata, options);
      }
    }
  }

  /**
   * Update performance statistics
   * @param {number} processingTime - Processing time in milliseconds
   */
  updatePerformanceStats(processingTime) {
    this.stats.totalProcessingTime += processingTime;
    const totalRequests = this.stats.batchRequests + this.stats.individualRequests;
    this.stats.averageProcessingTime = totalRequests > 0
      ? this.stats.totalProcessingTime / totalRequests
      : 0;
  }

  /**
   * Get enhanced analytics and statistics
   * @returns {object} Comprehensive statistics object
   */
  getStats() {
    return {
      performance: {
        batchRequests: this.stats.batchRequests,
        individualRequests: this.stats.individualRequests,
        averageProcessingTime: this.stats.averageProcessingTime,
        totalProcessingTime: this.stats.totalProcessingTime
      },
      rateLimiting: {
        rateLimitHits: this.stats.rateLimitHits,
        ...this.rateLimiter.getStats()
      },
      deduplication: {
        duplicatesSuppressed: this.stats.duplicatesSuppressed,
        ...this.deduplicator.getStats()
      },
      clientScript: {
        served: this.stats.clientScriptServed,
        cached: this.browserClientCache !== null
      }
    };
  }

  /**
   * Get a health summary for monitoring
   * @returns {object} Health status object
   */
  getHealth() {
    const stats = this.getStats();
    const now = Date.now();

    // Determine health based on error rates and performance
    const errorRate = stats.rateLimiting.rateLimitHits / Math.max(1, stats.performance.batchRequests + stats.performance.individualRequests);
    const avgProcessingTime = stats.performance.averageProcessingTime;

    let status = 'healthy';
    const issues = [];

    if (errorRate > 0.1) { // 10% error rate
      status = 'degraded';
      issues.push('High rate limit hit rate');
    }

    if (avgProcessingTime > 100) { // 100ms average
      status = 'degraded';
      issues.push('High average processing time');
    }

    if (!stats.clientScript.cached) {
      issues.push('Browser client script not cached');
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      issues,
      stats
    };
  }
}

export default LoggingEndpoints;