/**
 * tkr-project-kit Logging Client (JavaScript version)
 * A lightweight client library for sending logs to the tkr-project-kit logging system
 */

const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4
};

class TkrLogger {
  constructor(config) {
    this.config = {
      baseUrl: config.baseUrl || 'http://localhost:42003',
      service: config.service,
      serviceType: config.serviceType || 'backend',
      defaultComponent: config.defaultComponent || 'Main',
      failSilently: config.failSilently !== false,
      logToConsole: config.logToConsole !== false,
      minLevel: config.minLevel || 'debug'
    };
  }

  shouldLog(level) {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  async sendLog(level, message, metadata, component) {
    if (!this.shouldLog(level)) {
      return;
    }

    // Log to console if enabled
    if (this.config.logToConsole) {
      const consoleMethod = level === 'fatal' ? 'error' : level;
      console[consoleMethod](`[${level.toUpperCase()}] ${this.config.service}/${component || this.config.defaultComponent}: ${message}`, metadata || '');
    }

    const logData = {
      timestamp: Math.floor(Date.now() / 1000),
      level: level.toUpperCase(),
      service: this.config.service,
      service_type: this.config.serviceType,
      message,
      metadata: metadata || {},
      component: component || this.config.defaultComponent
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logData)
      });

      if (!response.ok && !this.config.failSilently) {
        throw new Error(`Failed to send log: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      if (!this.config.failSilently) {
        throw error;
      }
      // Silently fail - maybe log to console as fallback
      if (this.config.logToConsole) {
        console.warn('Failed to send log to tkr-project-kit:', error);
      }
    }
  }

  debug(message, metadata, component) {
    this.sendLog('debug', message, metadata, component).catch(() => {});
  }

  info(message, metadata, component) {
    this.sendLog('info', message, metadata, component).catch(() => {});
  }

  warn(message, metadata, component) {
    this.sendLog('warn', message, metadata, component).catch(() => {});
  }

  error(message, error, metadata, component) {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.sendLog('error', message, errorMetadata, component).catch(() => {});
  }

  fatal(message, error, metadata, component) {
    const errorMetadata = {
      ...metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };
    this.sendLog('fatal', message, errorMetadata, component).catch(() => {});
  }

  child(component) {
    const parent = this;
    return {
      debug: (message, metadata) => parent.debug(message, metadata, component),
      info: (message, metadata) => parent.info(message, metadata, component),
      warn: (message, metadata) => parent.warn(message, metadata, component),
      error: (message, error, metadata) => parent.error(message, error, metadata, component),
      fatal: (message, error, metadata) => parent.fatal(message, error, metadata, component)
    };
  }
}

function createTkrLogger(config) {
  return new TkrLogger(config);
}

// CommonJS exports
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TkrLogger, createTkrLogger };
  module.exports.default = TkrLogger;
}

// ES Module exports
if (typeof exports !== 'undefined') {
  exports.TkrLogger = TkrLogger;
  exports.createTkrLogger = createTkrLogger;
  exports.default = TkrLogger;
}