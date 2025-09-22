/**
 * Integration Examples for TKR Logging Configuration System
 *
 * This file demonstrates how different components can integrate
 * with the centralized configuration system.
 */

const { load, getServiceConfig, getEnvironmentExport } = require('./loader');

console.log('🔧 TKR Logging Configuration Integration Examples\n');

// Example 1: Wave 1 - Enhanced Logging Client Integration
console.log('1️⃣ Enhanced Logging Client Integration:');
function initializeTkrLogger() {
  const config = getServiceConfig('node', {
    // Optional component-specific overrides
    service: 'my-app',
    component: 'api-server'
  });

  // Simulate TkrLogger initialization
  console.log('   Initializing TkrLogger with:');
  console.log(`   - Base URL: ${config.endpoints.httpEndpoint.replace('/api/logs', '')}`);
  console.log(`   - Service: ${config.service}`);
  console.log(`   - Component: ${config.component}`);
  console.log(`   - Min Level: ${config.logLevels.default.toLowerCase()}`);
  console.log(`   - Fail Silently: ${config.behavior.failSilently}`);
  console.log(`   - Log to Console: ${config.behavior.logToConsole}`);

  return {
    baseUrl: config.endpoints.httpEndpoint.replace('/api/logs', ''),
    service: config.service,
    defaultComponent: config.component,
    minLevel: config.logLevels.default.toLowerCase(),
    failSilently: config.behavior.failSilently,
    logToConsole: config.behavior.logToConsole,
    autoCapture: config.autoCapture || {}
  };
}

const loggerConfig = initializeTkrLogger();
console.log('');

// Example 2: Wave 1 - Browser Client Integration
console.log('2️⃣ Browser Client Integration:');
function initializeBrowserClient() {
  const config = getServiceConfig('browser');

  console.log('   Browser client initialization object:');
  const initConfig = {
    endpoint: config.endpoints.batchEndpoint,
    batchSize: config.batching.batchSize,
    flushInterval: config.batching.flushInterval,
    captureErrors: config.autoCapture.unhandledErrors,
    sessionTracking: config.session.tracking,
    performanceThreshold: config.performance.threshold,
    enabled: config.behavior.enabled,
    service: config.service,
    component: config.component
  };

  console.log(JSON.stringify(initConfig, null, 6));
  return initConfig;
}

initializeBrowserClient();
console.log('');

// Example 3: Wave 1 - Shell Integration
console.log('3️⃣ Shell Integration - Environment Export:');
function generateShellExport() {
  const envVars = getEnvironmentExport();

  console.log('   Environment variables for shell sourcing:');
  Object.entries(envVars).slice(0, 8).forEach(([key, value]) => {
    console.log(`   export ${key}='${value}'`);
  });
  console.log('   ... and more');

  return envVars;
}

generateShellExport();
console.log('');

// Example 4: Wave 1 - Vite Plugin Integration
console.log('4️⃣ Vite Plugin Integration:');
function createVitePluginConfig() {
  const config = getServiceConfig('vite');

  console.log('   Vite plugin configuration:');
  const pluginConfig = {
    enabled: config.enabled && config.development,
    clientUrl: config.endpoints?.clientScriptUrl || config.endpoints.httpEndpoint.replace('/api/logs', '/api/logging-client.js'),
    injectPosition: config.injectPosition
  };

  console.log(JSON.stringify(pluginConfig, null, 6));
  return pluginConfig;
}

createVitePluginConfig();
console.log('');

// Example 5: Wave 2 - Knowledge Graph API Integration
console.log('5️⃣ Knowledge Graph API Integration:');
function setupLoggingEndpoints() {
  const config = load();

  console.log('   API endpoint configuration:');
  console.log(`   - Max message length: ${config.format.maxMessageLength}`);
  console.log(`   - Max metadata size: ${config.format.maxMetadataSize} bytes`);
  console.log(`   - Batch timeout: ${config.batching.timeout}ms`);
  console.log(`   - HTTP timeout: ${config.performance.httpTimeout}ms`);

  // Simulate middleware configuration
  const middlewareConfig = {
    validation: {
      maxMessageLength: config.format.maxMessageLength,
      maxServiceLength: config.format.maxServiceLength,
      maxComponentLength: config.format.maxComponentLength,
      maxMetadataSize: config.format.maxMetadataSize,
      validLevels: config.logLevels.available
    },
    batching: {
      maxItems: config.batching.maxItems,
      timeout: config.batching.timeout
    },
    performance: {
      timeout: config.performance.httpTimeout,
      retries: config.performance.maxRetries
    }
  };

  return middlewareConfig;
}

setupLoggingEndpoints();
console.log('');

// Example 6: Wave 2 - NODE_OPTIONS Auto-Init
console.log('6️⃣ NODE_OPTIONS Auto-Init Integration:');
function shouldEnableLogging() {
  const config = getServiceConfig('node');

  // Check if current process should have logging enabled
  const processName = process.title || 'node';
  const currentDir = process.cwd();

  console.log(`   Current process: ${processName}`);
  console.log(`   Current directory: ${currentDir}`);

  // Check process filter
  const processMatches = config.processFilter.some(filter =>
    processName.includes(filter)
  );

  // Check skip patterns
  const shouldSkip = config.skipPatterns.some(pattern =>
    currentDir.includes(pattern)
  );

  // Check project-only setting
  const hasContextKit = require('fs').existsSync(require('path').join(currentDir, '.context-kit'));
  const projectCheck = !config.behavior.projectOnly || hasContextKit;

  const shouldEnable = config.behavior.enabled &&
                      processMatches &&
                      !shouldSkip &&
                      projectCheck;

  console.log(`   - Process matches filter: ${processMatches}`);
  console.log(`   - Should skip directory: ${shouldSkip}`);
  console.log(`   - Has .context-kit: ${hasContextKit}`);
  console.log(`   - Project check passed: ${projectCheck}`);
  console.log(`   - Final decision: ${shouldEnable ? 'ENABLE' : 'SKIP'} logging`);

  return shouldEnable;
}

shouldEnableLogging();
console.log('');

// Example 7: Configuration Validation in Components
console.log('7️⃣ Configuration Validation Example:');
function validateComponentConfig() {
  const config = load();
  const LoggingConfigValidator = require('./validator');
  const validator = new LoggingConfigValidator();

  console.log('   Running configuration validation...');

  if (validator.validate(config)) {
    console.log('   ✅ Configuration is valid');
  } else {
    console.log('   ❌ Configuration has errors:');
    validator.getFormattedErrors().forEach(error => {
      console.log(`      - ${error}`);
    });
  }

  // Example of checking specific requirements
  const requirements = [
    {
      name: 'HTTP endpoint accessibility',
      check: () => config.endpoints.httpEndpoint.startsWith('http'),
      message: 'HTTP endpoint must be a valid URL'
    },
    {
      name: 'Valid log level',
      check: () => config.logLevels.available.includes(config.logLevels.default),
      message: 'Default log level must be in available levels'
    },
    {
      name: 'Reasonable batch size',
      check: () => config.batching.batchSize >= 1 && config.batching.batchSize <= 100,
      message: 'Batch size must be between 1 and 100'
    }
  ];

  console.log('   Component-specific validation:');
  requirements.forEach(req => {
    const passed = req.check();
    console.log(`   ${passed ? '✅' : '❌'} ${req.name}`);
    if (!passed) {
      console.log(`      ${req.message}`);
    }
  });
}

validateComponentConfig();
console.log('');

// Example 8: Dynamic Configuration Updates
console.log('8️⃣ Dynamic Configuration Updates:');
function demonstrateConfigUpdates() {
  const { clearCache } = require('./loader');

  console.log('   Original log level:', load().logLevels.default);

  // Simulate environment change
  process.env.TKR_LOG_LEVEL = 'ERROR';
  clearCache(); // Clear cache to pick up changes

  console.log('   Updated log level:', load().logLevels.default);

  // Simulate override
  const overrideConfig = load({
    logLevels: { default: 'FATAL' },
    behavior: { enabled: false }
  });

  console.log('   Override log level:', overrideConfig.logLevels.default);
  console.log('   Override enabled:', overrideConfig.behavior.enabled);

  // Clean up
  delete process.env.TKR_LOG_LEVEL;
  clearCache();

  console.log('   Restored log level:', load().logLevels.default);
}

demonstrateConfigUpdates();

console.log('\n🎯 All examples completed successfully!');
console.log('💡 Copy these patterns into your Wave 1 & 2 components for easy integration.');