/**
 * TKR Logging Vite Plugin
 * Automatically injects browser logging client into development builds
 */

import { transformIndexHtml, isValidPosition, getDefaultOptions } from './html-injector.js';
import { createLoggingMiddleware, getDefaultMiddlewareOptions } from './middleware.js';

/**
 * TKR Logging Vite Plugin
 * @param {Object} userOptions - Plugin configuration
 * @param {boolean} userOptions.enabled - Enable/disable plugin (default: NODE_ENV === 'development')
 * @param {string} userOptions.clientUrl - URL to logging client script
 * @param {string} userOptions.injectPosition - Where to inject script (head-start, head-end, body-start, body-end)
 * @returns {Object} Vite plugin
 */
export default function tkrLogging(userOptions = {}) {
  // Merge user options with defaults
  const defaultOptions = getDefaultOptions();
  const options = {
    ...defaultOptions,
    ...userOptions
  };

  // Validate configuration
  if (!isValidPosition(options.injectPosition)) {
    console.warn(`TKR Logging Plugin: Invalid inject position "${options.injectPosition}", using "head-end"`);
    options.injectPosition = 'head-end';
  }

  // Plugin name for Vite
  const pluginName = 'tkr-logging';

  return {
    name: pluginName,

    // Plugin applies only in development mode by default
    apply: options.enabled ? 'serve' : () => false,

    /**
     * Configure development server
     */
    configureServer(server) {
      if (!options.enabled) return;

      // Add our middleware
      const middlewareOptions = {
        ...getDefaultMiddlewareOptions(),
        clientUrl: options.clientUrl,
        enabled: options.enabled
      };

      const middleware = createLoggingMiddleware(middlewareOptions);
      server.middlewares.use(middleware);

      console.log(`TKR Logging Plugin: Middleware configured`);
      console.log(`  - Status endpoint: /tkr-logging-status`);
      console.log(`  - Health endpoint: /tkr-logging-health`);
      console.log(`  - Client URL: ${options.clientUrl}`);
    },

    /**
     * Transform index.html to include logging script
     */
    transformIndexHtml: {
      enforce: 'pre', // Run before other transformations
      transform(html, context) {
        // Only inject in development
        if (!options.enabled) {
          return html;
        }

        // Skip injection for non-main entries or if not a browser target
        if (!context.filename.includes('index.html')) {
          return html;
        }

        try {
          const transformed = transformIndexHtml(html, {
            clientUrl: options.clientUrl,
            injectPosition: options.injectPosition,
            enabled: options.enabled
          });

          return transformed;
        } catch (error) {
          console.error('TKR Logging Plugin: Failed to transform HTML:', error);
          return html; // Return original HTML on error
        }
      }
    },

    /**
     * Plugin configuration
     */
    config(config, { command }) {
      // Only activate for dev command
      if (command !== 'serve' || !options.enabled) {
        return;
      }

      // Ensure we have a server configuration
      config.server = config.server || {};

      // Add to Vite's server configuration for logging
      console.log(`TKR Logging Plugin: Activated for development`);
      console.log(`  - Inject position: ${options.injectPosition}`);
      console.log(`  - Client URL: ${options.clientUrl}`);
    },

    /**
     * Build start hook
     */
    buildStart() {
      if (options.enabled) {
        console.log('TKR Logging Plugin: Build started with logging injection enabled');
      }
    },

    /**
     * Handle Hot Module Replacement updates
     */
    handleHotUpdate({ file, server }) {
      if (!options.enabled) return;

      // If the plugin configuration files change, we might want to log it
      if (file.includes('vite.config') || file.includes('tkr-logging')) {
        console.log(`TKR Logging Plugin: Configuration file updated: ${file}`);
      }
    }
  };
}

/**
 * Named export for CommonJS compatibility
 */
export { tkrLogging };

/**
 * Export plugin configuration interface for TypeScript
 */
export const TkrLoggingPluginConfig = {
  enabled: Boolean,
  clientUrl: String,
  injectPosition: ['head-start', 'head-end', 'body-start', 'body-end']
};

/**
 * Utility function to create plugin with common configurations
 */
export function createTkrLoggingPlugin(overrides = {}) {
  const baseConfig = {
    enabled: process.env.NODE_ENV === 'development',
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end'
  };

  return tkrLogging({
    ...baseConfig,
    ...overrides
  });
}

/**
 * Development helper - creates plugin with enhanced logging
 */
export function createTkrLoggingDevPlugin(customClientUrl) {
  return createTkrLoggingPlugin({
    enabled: true,
    clientUrl: customClientUrl || 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end'
  });
}