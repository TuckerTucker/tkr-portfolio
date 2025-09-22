/**
 * Dev server middleware for TKR Logging plugin
 */

/**
 * Creates middleware for handling logging-related requests
 * @param {Object} options - Middleware options
 * @param {string} options.clientUrl - URL to logging client
 * @param {boolean} options.enabled - Whether middleware is enabled
 * @returns {Function} Middleware function
 */
export function createLoggingMiddleware(options = {}) {
  const {
    clientUrl = 'http://localhost:42003/api/logging-client.js',
    enabled = true
  } = options;

  return function loggingMiddleware(req, res, next) {
    // Skip if middleware is disabled
    if (!enabled) {
      return next();
    }

    const url = req.url;

    // Handle status endpoint
    if (url === '/tkr-logging-status') {
      handleStatusEndpoint(res, { clientUrl, enabled });
      return;
    }

    // Handle health check
    if (url === '/tkr-logging-health') {
      handleHealthEndpoint(res, { clientUrl });
      return;
    }

    // Continue to next middleware
    next();
  };
}

/**
 * Handles the status endpoint
 * @param {Object} res - Response object
 * @param {Object} config - Configuration
 */
function handleStatusEndpoint(res, config) {
  try {
    const status = {
      plugin: 'tkr-logging-vite-plugin',
      version: '1.0.0',
      enabled: config.enabled,
      clientUrl: config.clientUrl,
      timestamp: new Date().toISOString(),
      mode: process.env.NODE_ENV || 'development'
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (res.req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify(status, null, 2));
  } catch (error) {
    console.error('TKR Logging Plugin: Error in status endpoint:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

/**
 * Handles the health check endpoint
 * @param {Object} res - Response object
 * @param {Object} config - Configuration
 */
async function handleHealthEndpoint(res, config) {
  try {
    // Check if logging service is available
    const health = await checkLoggingServiceHealth(config.clientUrl);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (res.req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    res.statusCode = health.available ? 200 : 503;
    res.end(JSON.stringify(health, null, 2));
  } catch (error) {
    console.error('TKR Logging Plugin: Error in health endpoint:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({
      available: false,
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    }));
  }
}

/**
 * Checks if the logging service is available
 * @param {string} clientUrl - URL to check
 * @returns {Promise<Object>} Health status
 */
async function checkLoggingServiceHealth(clientUrl) {
  try {
    const url = new URL(clientUrl);
    const healthUrl = `${url.protocol}//${url.host}/health`;

    // Use fetch if available (Node 18+), otherwise assume unavailable
    if (typeof fetch === 'undefined') {
      return {
        available: false,
        reason: 'fetch not available',
        clientUrl,
        timestamp: new Date().toISOString()
      };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2 second timeout

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'tkr-logging-vite-plugin/1.0.0'
      }
    });

    clearTimeout(timeoutId);

    return {
      available: response.ok,
      status: response.status,
      statusText: response.statusText,
      clientUrl,
      healthUrl,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
      clientUrl,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Default middleware options
 * @returns {Object} Default options
 */
export function getDefaultMiddlewareOptions() {
  return {
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    enabled: process.env.NODE_ENV === 'development'
  };
}