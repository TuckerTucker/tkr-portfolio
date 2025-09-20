/**
 * Session Manager for TKR Browser Logging Client
 * Handles session ID generation, persistence, and tab correlation
 */

class SessionManager {
  constructor() {
    this.sessionId = null;
    this.storageKey = 'tkr_logging_session';
    this.sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Generate a UUID v4
   * @returns {string} UUID string
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Initialize session - get existing or create new
   * @returns {string} Session ID
   */
  initialize() {
    try {
      // Check for existing session in localStorage
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const sessionData = JSON.parse(stored);
        const now = Date.now();

        // Check if session is still valid (within duration)
        if (sessionData.timestamp && (now - sessionData.timestamp) < this.sessionDuration) {
          this.sessionId = sessionData.sessionId;
          return this.sessionId;
        }
      }
    } catch (error) {
      // localStorage not available or corrupted, continue to create new session
      console.warn('TkrLogging: Failed to read session from localStorage:', error.message);
    }

    // Create new session
    this.sessionId = this.generateUUID();
    this.persistSession();
    return this.sessionId;
  }

  /**
   * Persist session to localStorage
   */
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
      // localStorage not available, session will be ephemeral
      console.warn('TkrLogging: Failed to persist session to localStorage:', error.message);
    }
  }

  /**
   * Get current session ID
   * @returns {string|null} Current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Force create new session
   * @returns {string} New session ID
   */
  renewSession() {
    this.sessionId = this.generateUUID();
    this.persistSession();
    return this.sessionId;
  }

  /**
   * Clear current session
   */
  clearSession() {
    this.sessionId = null;
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  /**
   * Generate trace ID for request correlation
   * @returns {string} Trace ID
   */
  generateTraceId() {
    return this.generateUUID();
  }

  /**
   * Get session metadata for logging
   * @returns {object} Session metadata
   */
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

// Export for browser environments
if (typeof window !== 'undefined') {
  window.SessionManager = SessionManager;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SessionManager;
}