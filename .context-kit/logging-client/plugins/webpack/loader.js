/**
 * TKR Logging Webpack Loader - Optional module-level logging injection
 *
 * This loader can be used as an alternative or complement to the HTML injection
 * approach. It transforms modules at build time to include logging capabilities.
 *
 * Usage in webpack.config.js:
 * {
 *   test: /\.(js|jsx|ts|tsx)$/,
 *   use: [
 *     'babel-loader', // or other loaders
 *     './.context-kit/plugins/webpack/loader.js'
 *   ]
 * }
 *
 * @author Tucker <github.com/tuckertucker>
 * @version 1.0.0
 */

const path = require('path');

module.exports = function tkrLoggingLoader(source) {
  // Get loader options
  const options = this.getOptions() || {};

  // Default configuration
  const config = {
    enabled: options.enabled !== undefined ? options.enabled : process.env.NODE_ENV === 'development',
    clientUrl: options.clientUrl || 'http://localhost:42003/api/logging-client.js',
    autoInit: options.autoInit !== false,
    debugMode: options.debugMode || false,
    ...options
  };

  // Skip if disabled
  if (!config.enabled) {
    return source;
  }

  // Skip if not in development mode
  if (this.mode !== 'development') {
    return source;
  }

  // Get current file path
  const filePath = this.resourcePath;
  const fileName = path.basename(filePath);

  // Skip node_modules and specific file types
  if (shouldSkipFile(filePath, fileName, config)) {
    return source;
  }

  // Check if this is an entry point or main application file
  const isEntryPoint = isMainEntryFile(filePath, fileName, this.rootContext);

  if (isEntryPoint && config.autoInit) {
    // Inject logging client initialization at the top of entry files
    const initCode = generateInitializationCode(config);
    const transformedSource = initCode + '\n' + source;

    if (config.debugMode) {
      console.log(`[TkrLoggingLoader] Injected init code into entry point: ${fileName}`);
    }

    return transformedSource;
  }

  // For other files, optionally inject module-level logging
  if (config.injectModuleLogs) {
    return injectModuleLevelLogging(source, filePath, fileName, config);
  }

  // Return source unchanged
  return source;
};

/**
 * Check if file should be skipped
 */
function shouldSkipFile(filePath, fileName, config) {
  // Skip node_modules
  if (filePath.includes('node_modules')) {
    return true;
  }

  // Skip test files
  if (fileName.includes('.test.') || fileName.includes('.spec.')) {
    return true;
  }

  // Skip specific file types
  const skipExtensions = ['.css', '.scss', '.sass', '.less', '.svg', '.png', '.jpg', '.jpeg', '.gif'];
  if (skipExtensions.some(ext => fileName.endsWith(ext))) {
    return true;
  }

  // Skip if in exclude patterns
  if (config.exclude && Array.isArray(config.exclude)) {
    return config.exclude.some(pattern => {
      if (typeof pattern === 'string') {
        return filePath.includes(pattern);
      }
      if (pattern instanceof RegExp) {
        return pattern.test(filePath);
      }
      return false;
    });
  }

  return false;
}

/**
 * Check if this is a main entry file
 */
function isMainEntryFile(filePath, fileName, rootContext) {
  // Common entry point file names
  const entryFileNames = [
    'index.js', 'index.jsx', 'index.ts', 'index.tsx',
    'main.js', 'main.jsx', 'main.ts', 'main.tsx',
    'app.js', 'app.jsx', 'app.ts', 'app.tsx',
    'App.js', 'App.jsx', 'App.ts', 'App.tsx'
  ];

  // Check if filename matches common entry patterns
  if (entryFileNames.includes(fileName)) {
    return true;
  }

  // Check if in src root directory
  const relativePath = path.relative(rootContext, filePath);
  const isInSrcRoot = relativePath.startsWith('src/') && !relativePath.includes('/', 4);

  return isInSrcRoot && entryFileNames.includes(fileName);
}

/**
 * Generate initialization code for logging client
 */
function generateInitializationCode(config) {
  const initCode = `
// TKR Logging Client Auto-Initialization
(function() {
  'use strict';

  // Check if already initialized
  if (typeof window !== 'undefined' && window.TkrLogging) {
    return;
  }

  // Create script element for dynamic loading
  const script = document.createElement('script');
  script.src = '${config.clientUrl}';
  script.async = true;
  script.defer = true;

  // Error handling
  script.onerror = function() {
    console.warn('TKR Logging client failed to load from: ${config.clientUrl}');
  };

  // Success handling
  script.onload = function() {
    if (typeof window.TkrLogging !== 'undefined' && window.TkrLogging.init) {
      // Auto-initialize with default config
      window.TkrLogging.init({
        endpoint: '${config.clientUrl.replace('/api/logging-client.js', '/api/logs')}',
        batchSize: 10,
        flushInterval: 5000,
        captureErrors: true,
        sessionTracking: true
      });

      if (${config.debugMode}) {
        console.log('TKR Logging client initialized successfully');
      }
    }
  };

  // Inject script into document
  if (typeof document !== 'undefined') {
    const head = document.head || document.getElementsByTagName('head')[0];
    head.appendChild(script);
  }
})();
`.trim();

  return initCode;
}

/**
 * Inject module-level logging (advanced feature)
 */
function injectModuleLevelLogging(source, filePath, fileName, config) {
  // This is an advanced feature that could wrap functions with logging
  // For now, just return the source unchanged
  // Could be extended to add automatic function entry/exit logging

  if (config.debugMode) {
    console.log(`[TkrLoggingLoader] Module-level logging not yet implemented for: ${fileName}`);
  }

  return source;
}

/**
 * Webpack loader helper to mark as cacheable
 */
module.exports.raw = false; // This loader handles text
module.exports.default = module.exports;

// Mark loader as cacheable for better performance
if (typeof module.exports.cacheable === 'undefined') {
  module.exports.cacheable = function() {
    this.cacheable && this.cacheable();
  };
}