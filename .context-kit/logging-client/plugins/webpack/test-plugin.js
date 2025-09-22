/**
 * Basic test runner for TkrLoggingPlugin
 *
 * Run with: node test-plugin.js
 */

const TkrLoggingPlugin = require('./index.js');

console.log('🧪 Testing TkrLoggingPlugin...\n');

// Test 1: Default configuration
console.log('Test 1: Default configuration');
try {
  const plugin1 = new TkrLoggingPlugin();
  console.log('✅ Default plugin created successfully');
  console.log('   Options:', {
    enabled: plugin1.options.enabled,
    clientUrl: plugin1.options.clientUrl,
    chunks: plugin1.options.chunks
  });
} catch (error) {
  console.log('❌ Default plugin creation failed:', error.message);
}

// Test 2: Custom configuration
console.log('\nTest 2: Custom configuration');
try {
  const plugin2 = new TkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://localhost:8080/logging.js',
    chunks: ['app', 'vendor'],
    debug: true
  });
  console.log('✅ Custom plugin created successfully');
  console.log('   Options:', {
    enabled: plugin2.options.enabled,
    clientUrl: plugin2.options.clientUrl,
    chunks: plugin2.options.chunks,
    debug: plugin2.options.debug
  });
} catch (error) {
  console.log('❌ Custom plugin creation failed:', error.message);
}

// Test 3: Validation - Valid options
console.log('\nTest 3: Option validation (valid)');
const validOptions = {
  enabled: true,
  clientUrl: 'http://localhost:42003/api/logging-client.js',
  chunks: ['main']
};
const validationErrors1 = TkrLoggingPlugin.validateOptions(validOptions);
if (validationErrors1.length === 0) {
  console.log('✅ Valid options passed validation');
} else {
  console.log('❌ Valid options failed validation:', validationErrors1);
}

// Test 4: Validation - Invalid options
console.log('\nTest 4: Option validation (invalid)');
const invalidOptions = {
  enabled: 'not-a-boolean',
  clientUrl: 123,
  chunks: 'not-an-array'
};
const validationErrors2 = TkrLoggingPlugin.validateOptions(invalidOptions);
if (validationErrors2.length > 0) {
  console.log('✅ Invalid options correctly caught:', validationErrors2);
} else {
  console.log('❌ Invalid options not caught by validation');
}

// Test 5: Factory method with validation
console.log('\nTest 5: Factory method with validation');
try {
  const plugin3 = TkrLoggingPlugin.create({
    enabled: false,
    clientUrl: 'http://test.local/script.js',
    chunks: ['test']
  });
  console.log('✅ Factory method created plugin successfully');
} catch (error) {
  console.log('❌ Factory method failed:', error.message);
}

// Test 6: Factory method with invalid options
console.log('\nTest 6: Factory method with invalid options');
try {
  const plugin4 = TkrLoggingPlugin.create({
    enabled: 'invalid',
    clientUrl: null,
    chunks: 'invalid'
  });
  console.log('❌ Factory method should have thrown error');
} catch (error) {
  console.log('✅ Factory method correctly rejected invalid options:', error.message);
}

// Test 7: Plugin name
console.log('\nTest 7: Plugin name');
const plugin = new TkrLoggingPlugin();
if (plugin.pluginName === 'TkrLoggingPlugin') {
  console.log('✅ Plugin name is correct');
} else {
  console.log('❌ Plugin name is incorrect:', plugin.pluginName);
}

// Test 8: Environment detection
console.log('\nTest 8: Environment detection');
const originalEnv = process.env.NODE_ENV;

process.env.NODE_ENV = 'development';
const devPlugin = new TkrLoggingPlugin();
const devEnabled = devPlugin.options.enabled;

process.env.NODE_ENV = 'production';
const prodPlugin = new TkrLoggingPlugin();
const prodEnabled = prodPlugin.options.enabled;

process.env.NODE_ENV = originalEnv; // Restore

if (devEnabled && !prodEnabled) {
  console.log('✅ Environment detection working correctly');
  console.log('   Development enabled:', devEnabled);
  console.log('   Production enabled:', prodEnabled);
} else {
  console.log('❌ Environment detection not working correctly');
  console.log('   Development enabled:', devEnabled);
  console.log('   Production enabled:', prodEnabled);
}

console.log('\n🎉 Plugin tests completed!');

// Export for use in other test files
module.exports = {
  testBasicCreation: () => {
    return new TkrLoggingPlugin();
  },
  testValidation: (options) => {
    return TkrLoggingPlugin.validateOptions(options);
  },
  testFactory: (options) => {
    return TkrLoggingPlugin.create(options);
  }
};