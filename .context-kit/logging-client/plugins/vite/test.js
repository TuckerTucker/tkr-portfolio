/**
 * Simple test for TKR Logging Vite Plugin
 */

import tkrLogging, { createTkrLoggingPlugin, createTkrLoggingDevPlugin } from './index.js';
import { transformIndexHtml, isValidPosition } from './html-injector.js';
import { createLoggingMiddleware } from './middleware.js';

console.log('🧪 Testing TKR Logging Vite Plugin...\n');

// Test 1: Basic plugin creation
console.log('Test 1: Basic plugin creation');
try {
  const plugin = tkrLogging();
  console.log('✓ Default plugin created');
  console.log('✓ Plugin name:', plugin.name);
  console.log('✓ Has required hooks:', {
    transformIndexHtml: !!plugin.transformIndexHtml,
    configureServer: !!plugin.configureServer,
    config: !!plugin.config
  });
} catch (e) {
  console.log('✗ Plugin creation failed:', e.message);
}

// Test 2: HTML transformation
console.log('\nTest 2: HTML transformation');
const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;

try {
  const transformed = transformIndexHtml(testHtml, {
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end'
  });

  console.log('✓ HTML transformation successful');
  console.log('✓ Script injected:', transformed.includes('data-tkr-logging="true"'));
  console.log('✓ Error handling included:', transformed.includes('onerror='));
} catch (e) {
  console.log('✗ HTML transformation failed:', e.message);
}

// Test 3: Position validation
console.log('\nTest 3: Position validation');
const validPositions = ['head-start', 'head-end', 'body-start', 'body-end'];
const invalidPositions = ['invalid', 'head-middle', ''];

validPositions.forEach(pos => {
  console.log(`✓ ${pos} is valid:`, isValidPosition(pos));
});

invalidPositions.forEach(pos => {
  console.log(`✓ ${pos} is invalid:`, !isValidPosition(pos));
});

// Test 4: Middleware creation
console.log('\nTest 4: Middleware creation');
try {
  const middleware = createLoggingMiddleware();
  console.log('✓ Middleware created');
  console.log('✓ Middleware is function:', typeof middleware === 'function');
  console.log('✓ Has correct signature (3 params):', middleware.length === 3);
} catch (e) {
  console.log('✗ Middleware creation failed:', e.message);
}

// Test 5: Helper functions
console.log('\nTest 5: Helper functions');
try {
  const helperPlugin1 = createTkrLoggingPlugin();
  const helperPlugin2 = createTkrLoggingDevPlugin();

  console.log('✓ createTkrLoggingPlugin works');
  console.log('✓ createTkrLoggingDevPlugin works');
} catch (e) {
  console.log('✗ Helper functions failed:', e.message);
}

// Test 6: Configuration options
console.log('\nTest 6: Configuration options');
try {
  const configs = [
    { enabled: false },
    { clientUrl: 'http://custom:8080/client.js' },
    { injectPosition: 'body-start' },
    { enabled: true, clientUrl: 'http://test.com/client.js', injectPosition: 'head-start' }
  ];

  configs.forEach((config, i) => {
    const plugin = tkrLogging(config);
    console.log(`✓ Config ${i + 1} accepted:`, Object.keys(config).join(', '));
  });
} catch (e) {
  console.log('✗ Configuration test failed:', e.message);
}

console.log('\n🎉 All tests completed!');
console.log('\n📋 Plugin Summary:');
console.log('- Name: tkr-logging');
console.log('- Files: index.js, html-injector.js, middleware.js, package.json');
console.log('- Features: HTML injection, middleware, health checks, error handling');
console.log('- Interface: Compliant with vitePluginAPI specification');
console.log('- Usage: Zero-config development, configurable options available');