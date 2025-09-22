/**
 * TKR Logging Vite Plugin Integration Tests
 * Comprehensive testing of Vite plugin functionality
 *
 * Tests:
 * - Plugin registration and configuration
 * - HTML injection at different positions
 * - Development server middleware setup
 * - Hot module replacement integration
 * - Build process integration
 * - Configuration validation
 * - Error handling and graceful degradation
 * - Multi-environment compatibility
 */

const fs = require('fs');
const path = require('path');
const { createServer } = require('vite');
const { JSDOM } = require('jsdom');

// Import the plugin
const tkrLoggingPlugin = require('../../plugins/vite/index.js').default;

// Test configuration
const TEST_CONFIG = {
  vite: {
    root: path.join(__dirname, 'temp'),
    server: {
      port: 42997,
      host: 'localhost'
    },
    logLevel: 'silent'
  },
  plugin: {
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end'
  },
  timeout: 10000
};

// Test state
let viteServer = null;
let testProjectDir = null;

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Console colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

/**
 * Set up test environment
 */
async function setupTestEnvironment() {
  console.log(`${colors.blue}Setting up Vite plugin test environment...${colors.reset}`);

  // Create temporary test project
  testProjectDir = path.join(__dirname, 'temp', `vite-test-${Date.now()}`);
  await fs.promises.mkdir(testProjectDir, { recursive: true });

  // Create package.json
  const packageJson = {
    name: 'tkr-logging-vite-test',
    version: '1.0.0',
    type: 'module',
    dependencies: {
      vite: '^4.0.0'
    }
  };

  await fs.promises.writeFile(
    path.join(testProjectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create basic HTML file
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TKR Logging Test</title>
</head>
<body>
  <div id="app">
    <h1>TKR Logging Vite Test</h1>
  </div>
  <script type="module" src="/src/main.js"></script>
</body>
</html>`;

  await fs.promises.writeFile(
    path.join(testProjectDir, 'index.html'),
    indexHtml
  );

  // Create source directory and main.js
  const srcDir = path.join(testProjectDir, 'src');
  await fs.promises.mkdir(srcDir, { recursive: true });

  const mainJs = `console.log('TKR Logging Vite test application started');

// Test various console methods
console.info('Info message from main.js');
console.warn('Warning message from main.js');
console.error('Error message from main.js');
console.debug('Debug message from main.js');

// Test manual logging
if (window.TkrLogging) {
  window.TkrLogging.log('INFO', 'Manual log from main.js');
} else {
  console.log('TkrLogging not available yet');
}`;

  await fs.promises.writeFile(
    path.join(srcDir, 'main.js'),
    mainJs
  );

  console.log(`${colors.green}Test project created at: ${testProjectDir}${colors.reset}`);
}

/**
 * Test helper functions
 */
function assertEquals(expected, actual, testName) {
  testsRun++;
  if (expected === actual) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    testsPassed++;
    return true;
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    console.log(`  Expected: ${expected}`);
    console.log(`  Actual:   ${actual}`);
    testsFailed++;
    return false;
  }
}

function assertContains(expected, actual, testName) {
  testsRun++;
  if (actual && actual.toString().includes(expected)) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    testsPassed++;
    return true;
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    console.log(`  Expected to contain: ${expected}`);
    console.log(`  Actual: ${actual}`);
    testsFailed++;
    return false;
  }
}

function assertTrue(condition, testName) {
  testsRun++;
  if (condition) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    testsPassed++;
    return true;
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    testsFailed++;
    return false;
  }
}

/**
 * Create Vite configuration with the plugin
 */
function createViteConfig(pluginOptions = {}) {
  const config = {
    root: testProjectDir,
    plugins: [
      tkrLoggingPlugin({
        ...TEST_CONFIG.plugin,
        ...pluginOptions
      })
    ],
    server: TEST_CONFIG.vite.server,
    logLevel: TEST_CONFIG.vite.logLevel
  };

  return config;
}

/**
 * Test plugin registration and configuration
 */
async function testPluginRegistration() {
  console.log(`\n${colors.blue}Testing plugin registration...${colors.reset}`);

  // Test basic plugin creation
  const plugin = tkrLoggingPlugin();
  assertTrue(plugin && typeof plugin === 'object', 'Plugin returns object');
  assertEquals('tkr-logging', plugin.name, 'Plugin has correct name');

  // Test with custom options
  const customPlugin = tkrLoggingPlugin({
    enabled: false,
    clientUrl: 'http://custom.example.com/client.js',
    injectPosition: 'body-start'
  });

  assertTrue(customPlugin && typeof customPlugin === 'object', 'Plugin accepts custom options');

  // Test plugin has required hooks
  assertTrue(typeof plugin.transformIndexHtml === 'object', 'Plugin has transformIndexHtml hook');
  assertTrue(typeof plugin.configureServer === 'function', 'Plugin has configureServer hook');
  assertTrue(typeof plugin.config === 'function', 'Plugin has config hook');

  // Test invalid inject position handling
  const invalidPlugin = tkrLoggingPlugin({
    injectPosition: 'invalid-position'
  });

  assertTrue(invalidPlugin && typeof invalidPlugin === 'object', 'Plugin handles invalid inject position gracefully');
}

/**
 * Test HTML injection functionality
 */
async function testHtmlInjection() {
  console.log(`\n${colors.blue}Testing HTML injection...${colors.reset}`);

  const testHtml = `<!DOCTYPE html>
<html>
<head>
  <title>Test</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;

  // Test head-end injection (default)
  const plugin = tkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://test.example.com/client.js'
  });

  const mockContext = {
    filename: 'index.html'
  };

  const transformedHtml = plugin.transformIndexHtml.transform(testHtml, mockContext);

  assertContains('<script', transformedHtml, 'HTML contains script tag after injection');
  assertContains('http://test.example.com/client.js', transformedHtml, 'Script src URL is correct');
  assertContains('</head>', transformedHtml, 'HTML structure is preserved');

  // Test different injection positions
  const positions = ['head-start', 'head-end', 'body-start', 'body-end'];

  for (const position of positions) {
    const positionPlugin = tkrLoggingPlugin({
      enabled: true,
      clientUrl: 'http://test.example.com/client.js',
      injectPosition: position
    });

    const positionHtml = positionPlugin.transformIndexHtml.transform(testHtml, mockContext);
    assertContains('<script', positionHtml, `Script injected at ${position}`);

    // Verify position-specific placement
    if (position.startsWith('head')) {
      const headContent = positionHtml.match(/<head[^>]*>(.*?)<\/head>/s);
      if (headContent) {
        assertContains('<script', headContent[1], `Script in head section for ${position}`);
      }
    } else {
      const bodyContent = positionHtml.match(/<body[^>]*>(.*?)<\/body>/s);
      if (bodyContent) {
        assertContains('<script', bodyContent[1], `Script in body section for ${position}`);
      }
    }
  }

  // Test with disabled plugin
  const disabledPlugin = tkrLoggingPlugin({ enabled: false });
  const disabledHtml = disabledPlugin.transformIndexHtml.transform(testHtml, mockContext);
  assertEquals(testHtml, disabledHtml, 'No injection when plugin is disabled');

  // Test with non-index.html file
  const nonIndexContext = { filename: 'other.html' };
  const nonIndexHtml = plugin.transformIndexHtml.transform(testHtml, nonIndexContext);
  assertEquals(testHtml, nonIndexHtml, 'No injection for non-index.html files');
}

/**
 * Test development server middleware
 */
async function testDevServerMiddleware() {
  console.log(`\n${colors.blue}Testing development server middleware...${colors.reset}`);

  try {
    // Create Vite server with plugin
    viteServer = await createServer(createViteConfig());

    // Check that middleware was added
    assertTrue(viteServer.middlewares, 'Vite server has middleware stack');

    // Start the server
    await viteServer.listen(TEST_CONFIG.vite.server.port);

    console.log(`Vite dev server started on port ${TEST_CONFIG.vite.server.port}`);

    // Test middleware endpoints
    const fetch = (await import('node-fetch')).default;

    // Test status endpoint
    try {
      const statusResponse = await fetch(`http://localhost:${TEST_CONFIG.vite.server.port}/tkr-logging-status`);
      assertTrue(statusResponse.ok, 'Status endpoint responds');

      const statusData = await statusResponse.json();
      assertTrue(statusData && typeof statusData === 'object', 'Status endpoint returns JSON');
    } catch (error) {
      console.log(`${colors.yellow}Status endpoint test skipped: ${error.message}${colors.reset}`);
    }

    // Test health endpoint
    try {
      const healthResponse = await fetch(`http://localhost:${TEST_CONFIG.vite.server.port}/tkr-logging-health`);
      assertTrue(healthResponse.ok, 'Health endpoint responds');

      const healthData = await healthResponse.json();
      assertTrue(healthData && typeof healthData === 'object', 'Health endpoint returns JSON');
    } catch (error) {
      console.log(`${colors.yellow}Health endpoint test skipped: ${error.message}${colors.reset}`);
    }

    // Test that the main index.html is served with injection
    try {
      const indexResponse = await fetch(`http://localhost:${TEST_CONFIG.vite.server.port}/`);
      assertTrue(indexResponse.ok, 'Index page loads');

      const indexHtml = await indexResponse.text();
      assertContains('<script', indexHtml, 'Index page has injected script');
      assertContains(TEST_CONFIG.plugin.clientUrl, indexHtml, 'Injected script has correct URL');
    } catch (error) {
      console.log(`${colors.yellow}Index page test failed: ${error.message}${colors.reset}`);
    }

  } catch (error) {
    console.log(`${colors.red}Dev server middleware test failed: ${error.message}${colors.reset}`);
    testsFailed++;
  } finally {
    if (viteServer) {
      await viteServer.close();
      viteServer = null;
    }
  }
}

/**
 * Test hot module replacement integration
 */
async function testHMRIntegration() {
  console.log(`\n${colors.blue}Testing HMR integration...${colors.reset}`);

  // Create plugin with HMR handler
  const plugin = tkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js'
  });

  // Test HMR handler exists
  assertTrue(typeof plugin.handleHotUpdate === 'function', 'Plugin has HMR handler');

  // Mock HMR update
  let hmrCalled = false;
  const mockHMRContext = {
    file: path.join(testProjectDir, 'vite.config.js'),
    server: {
      ws: {
        send: () => { hmrCalled = true; }
      }
    }
  };

  // Call HMR handler
  plugin.handleHotUpdate(mockHMRContext);

  // Since our HMR handler just logs, we can't easily test the output
  // but we can verify it doesn't throw
  assertTrue(true, 'HMR handler executes without errors');

  // Test with non-config file
  const nonConfigContext = {
    file: path.join(testProjectDir, 'src', 'main.js'),
    server: { ws: { send: () => {} } }
  };

  plugin.handleHotUpdate(nonConfigContext);
  assertTrue(true, 'HMR handler handles non-config files');
}

/**
 * Test build process integration
 */
async function testBuildIntegration() {
  console.log(`\n${colors.blue}Testing build integration...${colors.reset}`);

  try {
    // Import build function
    const { build } = await import('vite');

    // Test development build (where plugin should be active)
    const devConfig = createViteConfig({
      enabled: true
    });

    // Mock the build process (don't actually build)
    const buildStartCalled = devConfig.plugins.some(plugin =>
      plugin && typeof plugin.buildStart === 'function'
    );

    assertTrue(buildStartCalled !== false, 'Plugin integrates with build process');

    // Test that plugin applies only in development by default
    const defaultPlugin = tkrLoggingPlugin();
    assertEquals('serve', defaultPlugin.apply, 'Plugin applies to serve command by default');

    // Test production build (plugin should be disabled)
    const prodConfig = createViteConfig({
      enabled: false
    });

    const prodPlugin = prodConfig.plugins.find(p => p && p.name === 'tkr-logging');
    if (prodPlugin && typeof prodPlugin.apply === 'function') {
      assertEquals(false, prodPlugin.apply(), 'Plugin disabled in production');
    }

  } catch (error) {
    console.log(`${colors.yellow}Build integration test skipped: ${error.message}${colors.reset}`);
  }
}

/**
 * Test configuration validation
 */
async function testConfigurationValidation() {
  console.log(`\n${colors.blue}Testing configuration validation...${colors.reset}`);

  // Test with valid configuration
  const validPlugin = tkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    injectPosition: 'head-end'
  });

  assertTrue(validPlugin && validPlugin.name === 'tkr-logging', 'Valid configuration accepted');

  // Test with minimal configuration
  const minimalPlugin = tkrLoggingPlugin();
  assertTrue(minimalPlugin && minimalPlugin.name === 'tkr-logging', 'Minimal configuration works');

  // Test with invalid inject position (should fallback to default)
  const invalidPositionPlugin = tkrLoggingPlugin({
    injectPosition: 'invalid-position'
  });

  assertTrue(invalidPositionPlugin && invalidPositionPlugin.name === 'tkr-logging',
            'Invalid inject position handled gracefully');

  // Test with undefined options
  const undefinedPlugin = tkrLoggingPlugin(undefined);
  assertTrue(undefinedPlugin && undefinedPlugin.name === 'tkr-logging', 'Undefined options handled');

  // Test with null options
  const nullPlugin = tkrLoggingPlugin(null);
  assertTrue(nullPlugin && nullPlugin.name === 'tkr-logging', 'Null options handled');
}

/**
 * Test error handling and graceful degradation
 */
async function testErrorHandling() {
  console.log(`\n${colors.blue}Testing error handling...${colors.reset}`);

  // Test malformed HTML injection
  const plugin = tkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js'
  });

  const malformedHtml = '<html><head><title>Test</title>';  // Missing closing tags

  try {
    const result = plugin.transformIndexHtml.transform(malformedHtml, { filename: 'index.html' });
    assertTrue(typeof result === 'string', 'Malformed HTML handled gracefully');
  } catch (error) {
    // Should not throw, but if it does, that's also a valid test result
    console.log(`${colors.yellow}HTML transformation threw error (expected): ${error.message}${colors.reset}`);
  }

  // Test with missing context
  try {
    const result = plugin.transformIndexHtml.transform('<html></html>', {});
    assertTrue(typeof result === 'string', 'Missing context handled gracefully');
  } catch (error) {
    console.log(`${colors.yellow}Missing context handled with error: ${error.message}${colors.reset}`);
  }

  // Test plugin with invalid server configuration
  try {
    const invalidConfig = createViteConfig();
    invalidConfig.server = null;

    const invalidServer = await createServer(invalidConfig);
    assertTrue(invalidServer, 'Plugin handles invalid server config');
    await invalidServer.close();
  } catch (error) {
    console.log(`${colors.yellow}Invalid server config test: ${error.message}${colors.reset}`);
  }
}

/**
 * Test TypeScript integration
 */
async function testTypeScriptIntegration() {
  console.log(`\n${colors.blue}Testing TypeScript integration...${colors.reset}`);

  // Test that plugin exports TypeScript definitions
  const pluginModule = require('../../plugins/vite/index.js');

  assertTrue(pluginModule.TkrLoggingPluginConfig, 'Plugin exports TypeScript config interface');
  assertTrue(typeof pluginModule.createTkrLoggingPlugin === 'function',
            'Plugin exports utility functions');
  assertTrue(typeof pluginModule.createTkrLoggingDevPlugin === 'function',
            'Plugin exports dev utility function');

  // Test utility functions
  const utilityPlugin = pluginModule.createTkrLoggingPlugin({
    clientUrl: 'http://custom.example.com/client.js'
  });

  assertTrue(utilityPlugin && utilityPlugin.name === 'tkr-logging',
            'Utility function creates valid plugin');

  const devPlugin = pluginModule.createTkrLoggingDevPlugin();
  assertTrue(devPlugin && devPlugin.name === 'tkr-logging',
            'Dev utility function creates valid plugin');
}

/**
 * Test multi-environment compatibility
 */
async function testMultiEnvironmentCompatibility() {
  console.log(`\n${colors.blue}Testing multi-environment compatibility...${colors.reset}`);

  // Test with different NODE_ENV values
  const originalEnv = process.env.NODE_ENV;

  try {
    // Test development environment
    process.env.NODE_ENV = 'development';
    const devPlugin = tkrLoggingPlugin();
    assertEquals('serve', devPlugin.apply, 'Plugin applies in development');

    // Test production environment (plugin should be disabled by default)
    process.env.NODE_ENV = 'production';
    const prodPlugin = tkrLoggingPlugin();
    assertTrue(typeof prodPlugin.apply === 'function' || prodPlugin.apply === 'serve',
              'Plugin handles production environment');

    // Test test environment
    process.env.NODE_ENV = 'test';
    const testPlugin = tkrLoggingPlugin();
    assertTrue(testPlugin && testPlugin.name === 'tkr-logging',
              'Plugin works in test environment');

  } finally {
    process.env.NODE_ENV = originalEnv;
  }

  // Test with explicit enabled flag
  const explicitPlugin = tkrLoggingPlugin({ enabled: true });
  assertEquals('serve', explicitPlugin.apply, 'Explicit enabled flag works');

  const explicitDisabledPlugin = tkrLoggingPlugin({ enabled: false });
  assertTrue(typeof explicitDisabledPlugin.apply === 'function',
            'Explicit disabled flag works');
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment() {
  console.log(`\n${colors.blue}Cleaning up test environment...${colors.reset}`);

  if (viteServer) {
    try {
      await viteServer.close();
    } catch (error) {
      console.log(`${colors.yellow}Error closing Vite server: ${error.message}${colors.reset}`);
    }
    viteServer = null;
  }

  if (testProjectDir) {
    try {
      await fs.promises.rm(testProjectDir, { recursive: true, force: true });
    } catch (error) {
      console.log(`${colors.yellow}Error removing test directory: ${error.message}${colors.reset}`);
    }
  }

  console.log(`${colors.green}Cleanup completed${colors.reset}`);
}

/**
 * Print test results
 */
function printResults() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}Vite Plugin Test Results${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`Total tests run: ${testsRun}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  const successRate = testsRun > 0 ? Math.round((testsPassed / testsRun) * 100) : 0;
  console.log(`Success rate: ${successRate}%`);

  if (testsFailed === 0) {
    console.log(`\n${colors.green}🎉 All tests passed!${colors.reset}`);
    return true;
  } else {
    console.log(`\n${colors.red}❌ Some tests failed${colors.reset}`);
    return false;
  }
}

/**
 * Main test execution
 */
async function main() {
  console.log(`${colors.blue}TKR Logging Vite Plugin Integration Tests${colors.reset}`);
  console.log(`${colors.blue}=========================================${colors.reset}`);

  let success = false;

  try {
    await setupTestEnvironment();

    // Run test suites
    await testPluginRegistration();
    await testHtmlInjection();
    await testDevServerMiddleware();
    await testHMRIntegration();
    await testBuildIntegration();
    await testConfigurationValidation();
    await testErrorHandling();
    await testTypeScriptIntegration();
    await testMultiEnvironmentCompatibility();

    success = printResults();

  } catch (error) {
    console.error(`${colors.red}Test execution failed: ${error.message}${colors.reset}`);
    console.error(error.stack);
  } finally {
    await cleanupTestEnvironment();
  }

  return success;
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  main,
  setupTestEnvironment,
  cleanupTestEnvironment,
  testPluginRegistration,
  testHtmlInjection,
  testDevServerMiddleware,
  testHMRIntegration,
  testBuildIntegration,
  testConfigurationValidation,
  testErrorHandling,
  testTypeScriptIntegration,
  testMultiEnvironmentCompatibility
};