#!/usr/bin/env node
/**
 * Simple test for TKR Logging Configuration System
 * Validates that the configuration loader and validator work correctly
 */

const { load, getServiceConfig, getEnvironmentExport, clearCache } = require('./loader');
const LoggingConfigValidator = require('./validator');

console.log('🧪 Testing TKR Logging Configuration System...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    console.log(`⏳ ${name}...`);
    fn();
    console.log(`✅ ${name} - PASSED\n`);
    passed++;
  } catch (error) {
    console.log(`❌ ${name} - FAILED: ${error.message}\n`);
    failed++;
  }
}

// Test 1: Load default configuration
test('Load default configuration', () => {
  const config = load();

  if (!config || typeof config !== 'object') {
    throw new Error('Config should be an object');
  }

  if (!config.version) {
    throw new Error('Config should have version');
  }

  if (!config.endpoints || !config.endpoints.httpEndpoint) {
    throw new Error('Config should have endpoints');
  }

  if (!config.logLevels || !config.logLevels.default) {
    throw new Error('Config should have log levels');
  }

  console.log('   Version:', config.version);
  console.log('   Default log level:', config.logLevels.default);
  console.log('   HTTP endpoint:', config.endpoints.httpEndpoint);
});

// Test 2: Environment variable override
test('Environment variable override', () => {
  // Set test environment variable
  process.env.TKR_LOG_LEVEL = 'DEBUG';
  process.env.TKR_LOG_BATCH_SIZE = '25';
  process.env.TKR_LOG_ENABLED = 'false';

  clearCache(); // Clear cache to force reload
  const config = load();

  if (config.logLevels.default !== 'DEBUG') {
    throw new Error(`Expected DEBUG, got ${config.logLevels.default}`);
  }

  if (config.batching.batchSize !== 25) {
    throw new Error(`Expected 25, got ${config.batching.batchSize}`);
  }

  if (config.behavior.enabled !== false) {
    throw new Error(`Expected false, got ${config.behavior.enabled}`);
  }

  console.log('   Log level override:', config.logLevels.default);
  console.log('   Batch size override:', config.batching.batchSize);
  console.log('   Enabled override:', config.behavior.enabled);

  // Clean up
  delete process.env.TKR_LOG_LEVEL;
  delete process.env.TKR_LOG_BATCH_SIZE;
  delete process.env.TKR_LOG_ENABLED;
  clearCache();
});

// Test 3: Service-specific configuration
test('Service-specific configuration', () => {
  const browserConfig = getServiceConfig('browser');
  const shellConfig = getServiceConfig('shell');

  if (browserConfig.service !== 'browser') {
    throw new Error('Browser config should have service=browser');
  }

  if (shellConfig.service !== 'shell') {
    throw new Error('Shell config should have service=shell');
  }

  if (!browserConfig.autoCapture) {
    throw new Error('Browser config should have autoCapture settings');
  }

  if (!shellConfig.monitoredCommands || !Array.isArray(shellConfig.monitoredCommands)) {
    throw new Error('Shell config should have monitoredCommands array');
  }

  console.log('   Browser service:', browserConfig.service);
  console.log('   Browser component:', browserConfig.component);
  console.log('   Shell monitored commands:', shellConfig.monitoredCommands.join(', '));
});

// Test 4: Configuration validation
test('Configuration validation', () => {
  const validator = new LoggingConfigValidator();
  const config = load();

  const isValid = validator.validate(config);

  if (!isValid) {
    const errors = validator.getFormattedErrors();
    throw new Error(`Validation failed: ${errors.join(', ')}`);
  }

  console.log('   Configuration is valid');

  // Test invalid configuration
  const invalidConfig = { ...config, logLevels: { default: 'INVALID' } };
  const isInvalid = validator.validate(invalidConfig);

  if (isInvalid) {
    throw new Error('Should have detected invalid log level');
  }

  console.log('   Invalid configuration correctly rejected');
});

// Test 5: Environment export
test('Environment export', () => {
  const envExport = getEnvironmentExport();

  if (!envExport || typeof envExport !== 'object') {
    throw new Error('Environment export should be an object');
  }

  if (!envExport.TKR_LOG_ENDPOINT) {
    throw new Error('Should export TKR_LOG_ENDPOINT');
  }

  if (!envExport.TKR_LOG_LEVEL) {
    throw new Error('Should export TKR_LOG_LEVEL');
  }

  console.log('   Exported variables:', Object.keys(envExport).length);
  console.log('   Sample export:', `TKR_LOG_ENDPOINT=${envExport.TKR_LOG_ENDPOINT}`);
});

// Test 6: Configuration overrides
test('Configuration overrides', () => {
  const overrides = {
    endpoints: {
      httpEndpoint: 'http://test.example.com/logs'
    },
    logLevels: {
      default: 'ERROR'
    }
  };

  const config = load(overrides);

  if (config.endpoints.httpEndpoint !== 'http://test.example.com/logs') {
    throw new Error('Override not applied to endpoint');
  }

  if (config.logLevels.default !== 'ERROR') {
    throw new Error('Override not applied to log level');
  }

  // Should not affect cached config
  const originalConfig = load();
  if (originalConfig.endpoints.httpEndpoint === 'http://test.example.com/logs') {
    throw new Error('Override should not affect cached config');
  }

  console.log('   Override endpoint:', config.endpoints.httpEndpoint);
  console.log('   Override log level:', config.logLevels.default);
});

// Summary
console.log('📊 Test Results:');
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   📈 Success Rate: ${Math.round((passed / (passed + failed)) * 100)}%`);

if (failed === 0) {
  console.log('\n🎉 All tests passed! Configuration system is working correctly.');
  process.exit(0);
} else {
  console.log('\n💥 Some tests failed. Please check the configuration system.');
  process.exit(1);
}