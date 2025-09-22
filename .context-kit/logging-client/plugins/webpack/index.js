/**
 * TkrLoggingPlugin - Webpack plugin for automatic browser logging client injection
 *
 * Integrates with HtmlWebpackPlugin to inject the TKR logging client script
 * into HTML files during development builds.
 *
 * @author Tucker <github.com/tuckertucker>
 * @version 1.0.0
 */

const { setupHtmlPluginHooks } = require('./html-plugin-hooks');

class TkrLoggingPlugin {
  constructor(options = {}) {
    this.options = {
      // Only enable in development by default
      enabled: options.enabled !== undefined ? options.enabled : process.env.NODE_ENV === 'development',

      // Default client script URL
      clientUrl: options.clientUrl || 'http://localhost:42003/api/logging-client.js',

      // Which chunks to inject logging into
      chunks: options.chunks || ['main'],

      // Additional configuration
      injectAsync: options.injectAsync !== false, // Default to async loading
      defer: options.defer !== false, // Default to defer loading

      // Debug mode for plugin development
      debug: options.debug || false
    };

    this.pluginName = 'TkrLoggingPlugin';
  }

  apply(compiler) {
    // Only activate if enabled
    if (!this.options.enabled) {
      if (this.options.debug) {
        console.log(`[${this.pluginName}] Plugin disabled, skipping injection`);
      }
      return;
    }

    // Only activate in development mode
    const mode = compiler.options.mode;
    if (mode !== 'development') {
      if (this.options.debug) {
        console.log(`[${this.pluginName}] Not in development mode (${mode}), skipping injection`);
      }
      return;
    }

    if (this.options.debug) {
      console.log(`[${this.pluginName}] Initializing with options:`, {
        enabled: this.options.enabled,
        clientUrl: this.options.clientUrl,
        chunks: this.options.chunks,
        mode: mode
      });
    }

    // Hook into compilation process
    compiler.hooks.compilation.tap(this.pluginName, (compilation) => {
      // Check if HtmlWebpackPlugin is available
      const HtmlWebpackPlugin = this.getHtmlWebpackPlugin(compilation);

      if (!HtmlWebpackPlugin) {
        this.handleMissingHtmlWebpackPlugin();
        return;
      }

      // Setup HTML plugin hooks for script injection
      setupHtmlPluginHooks(compilation, HtmlWebpackPlugin, this.options, this.pluginName);
    });
  }

  /**
   * Get HtmlWebpackPlugin constructor from compilation
   */
  getHtmlWebpackPlugin(compilation) {
    try {
      // Try to get HtmlWebpackPlugin from the compilation
      const HtmlWebpackPlugin = require('html-webpack-plugin');

      // Verify the plugin is actually being used
      if (HtmlWebpackPlugin.getHooks) {
        return HtmlWebpackPlugin;
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Handle missing HtmlWebpackPlugin gracefully
   */
  handleMissingHtmlWebpackPlugin() {
    const message = `[${this.pluginName}] HtmlWebpackPlugin not found. ` +
      'Please install html-webpack-plugin to use automatic script injection.';

    if (this.options.debug) {
      console.warn(message);
      console.warn(`[${this.pluginName}] Available alternatives:`);
      console.warn('1. Install html-webpack-plugin: npm install --save-dev html-webpack-plugin');
      console.warn('2. Manually include the script in your HTML: <script src="' + this.options.clientUrl + '"></script>');
    } else {
      console.warn(message);
    }
  }
}

/**
 * Static method to validate configuration
 */
TkrLoggingPlugin.validateOptions = function(options) {
  const errors = [];

  if (options.clientUrl && typeof options.clientUrl !== 'string') {
    errors.push('clientUrl must be a string');
  }

  if (options.chunks && !Array.isArray(options.chunks)) {
    errors.push('chunks must be an array');
  }

  if (options.enabled !== undefined && typeof options.enabled !== 'boolean') {
    errors.push('enabled must be a boolean');
  }

  return errors;
};

/**
 * Helper method to create plugin instance with validation
 */
TkrLoggingPlugin.create = function(options = {}) {
  const errors = TkrLoggingPlugin.validateOptions(options);

  if (errors.length > 0) {
    throw new Error(`TkrLoggingPlugin configuration errors: ${errors.join(', ')}`);
  }

  return new TkrLoggingPlugin(options);
};

module.exports = TkrLoggingPlugin;