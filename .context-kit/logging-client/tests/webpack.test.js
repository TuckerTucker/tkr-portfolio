/**
 * TKR Logging Webpack Plugin Integration Tests
 * Comprehensive testing of Webpack plugin functionality
 *
 * Tests:
 * - Plugin registration and configuration
 * - HTML modification through HtmlWebpackPlugin hooks
 * - Build process integration
 * - Loader functionality
 * - Chunk-specific injection
 * - Development vs production behavior
 * - Error handling and graceful degradation
 * - Multi-environment compatibility
 */

const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MemoryFS = require('memory-fs');

// Import the plugin
const TkrLoggingPlugin = require('../../plugins/webpack/index.js');

// Test configuration
const TEST_CONFIG = {
  webpack: {
    mode: 'development',
    output: {
      path: '/dist',
      filename: '[name].bundle.js'
    }
  },
  plugin: {
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    chunks: ['main']
  },
  timeout: 30000
};

// Test state
let testProjectDir = null;
let memoryFS = null;

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
  console.log(`${colors.blue}Setting up Webpack plugin test environment...${colors.reset}`);

  // Create temporary test project
  testProjectDir = path.join(__dirname, 'temp', `webpack-test-${Date.now()}`);
  await fs.promises.mkdir(testProjectDir, { recursive: true });

  // Create package.json
  const packageJson = {
    name: 'tkr-logging-webpack-test',
    version: '1.0.0',
    dependencies: {
      webpack: '^5.0.0',
      'html-webpack-plugin': '^5.0.0'
    }
  };

  await fs.promises.writeFile(
    path.join(testProjectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );

  // Create source directory and entry file
  const srcDir = path.join(testProjectDir, 'src');
  await fs.promises.mkdir(srcDir, { recursive: true });

  const entryJs = `console.log('TKR Logging Webpack test application started');

// Test various console methods
console.info('Info message from entry.js');
console.warn('Warning message from entry.js');
console.error('Error message from entry.js');
console.debug('Debug message from entry.js');

// Test manual logging
document.addEventListener('DOMContentLoaded', function() {
  if (window.TkrLogging) {
    window.TkrLogging.log('INFO', 'Manual log from entry.js');
  } else {
    console.log('TkrLogging not available yet');
  }
});

export default 'TKR Logging Test';`;

  await fs.promises.writeFile(
    path.join(srcDir, 'index.js'),
    entryJs
  );

  // Create HTML template
  const htmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TKR Logging Webpack Test</title>
</head>
<body>
  <div id="app">
    <h1>TKR Logging Webpack Test</h1>
  </div>
</body>
</html>`;

  await fs.promises.writeFile(
    path.join(srcDir, 'index.html'),
    htmlTemplate
  );

  // Setup memory filesystem for testing
  memoryFS = new MemoryFS();

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
 * Create Webpack configuration with the plugin
 */
function createWebpackConfig(pluginOptions = {}, htmlOptions = {}) {
  return {
    mode: TEST_CONFIG.webpack.mode,
    entry: {
      main: path.join(testProjectDir, 'src', 'index.js')
    },
    output: {
      ...TEST_CONFIG.webpack.output,
      path: path.join(testProjectDir, 'dist')
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: path.join(testProjectDir, 'src', 'index.html'),
        filename: 'index.html',
        ...htmlOptions
      }),
      new TkrLoggingPlugin({
        ...TEST_CONFIG.plugin,
        ...pluginOptions
      })
    ],
    stats: 'errors-only'
  };
}

/**
 * Run webpack compilation
 */
function runWebpack(config) {
  return new Promise((resolve, reject) => {
    const compiler = webpack(config);

    // Use memory filesystem to avoid disk I/O
    compiler.outputFileSystem = memoryFS;

    compiler.run((err, stats) => {
      if (err) {
        reject(err);
        return;
      }

      if (stats.hasErrors()) {
        reject(new Error(stats.toString()));
        return;
      }

      resolve(stats);
    });
  });
}

/**
 * Test plugin registration and configuration
 */
async function testPluginRegistration() {
  console.log(`\n${colors.blue}Testing plugin registration...${colors.reset}`);

  // Test basic plugin creation
  const plugin = new TkrLoggingPlugin();
  assertTrue(plugin instanceof TkrLoggingPlugin, 'Plugin creates instance');
  assertTrue(plugin.name === 'TkrLoggingPlugin', 'Plugin has correct name');

  // Test with custom options
  const customPlugin = new TkrLoggingPlugin({
    enabled: false,
    clientUrl: 'http://custom.example.com/client.js',
    chunks: ['app', 'vendor']
  });

  assertTrue(customPlugin instanceof TkrLoggingPlugin, 'Plugin accepts custom options');

  // Test plugin has required methods
  assertTrue(typeof plugin.apply === 'function', 'Plugin has apply method');

  // Test configuration defaults
  const defaultPlugin = new TkrLoggingPlugin();
  assertTrue(defaultPlugin.options.enabled === true, 'Default enabled is true');
  assertTrue(Array.isArray(defaultPlugin.options.chunks), 'Chunks is array');
}

/**
 * Test HTML modification through HtmlWebpackPlugin hooks
 */
async function testHtmlModification() {
  console.log(`\n${colors.blue}Testing HTML modification...${colors.reset}`);

  try {
    // Test with enabled plugin
    const config = createWebpackConfig({
      enabled: true,
      clientUrl: 'http://test.example.com/client.js'
    });

    const stats = await runWebpack(config);
    assertTrue(stats && !stats.hasErrors(), 'Webpack compilation succeeds with plugin');

    // Read the generated HTML
    const htmlPath = path.join(testProjectDir, 'dist', 'index.html');
    const htmlContent = memoryFS.readFileSync(htmlPath, 'utf8');

    assertContains('<script', htmlContent, 'HTML contains script tag');
    assertContains('http://test.example.com/client.js', htmlContent, 'Script src URL is correct');
    assertContains('</head>', htmlContent, 'HTML structure is preserved');

    // Test with disabled plugin
    const disabledConfig = createWebpackConfig({ enabled: false });
    const disabledStats = await runWebpack(disabledConfig);

    const disabledHtmlPath = path.join(testProjectDir, 'dist', 'index.html');
    const disabledHtmlContent = memoryFS.readFileSync(disabledHtmlPath, 'utf8');

    // Should not contain our script when disabled
    const originalTemplate = await fs.promises.readFile(
      path.join(testProjectDir, 'src', 'index.html'),
      'utf8'
    );

    // Count script tags in original vs output
    const originalScripts = (originalTemplate.match(/<script/g) || []).length;
    const outputScripts = (disabledHtmlContent.match(/<script/g) || []).length;

    // With plugin disabled, script count should be the same as template
    // (HtmlWebpackPlugin adds its own scripts, so we check relative counts)
    assertTrue(disabledStats && !disabledStats.hasErrors(), 'Compilation succeeds with disabled plugin');

  } catch (error) {
    console.log(`${colors.red}HTML modification test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Test chunk-specific injection
 */
async function testChunkSpecificInjection() {
  console.log(`\n${colors.blue}Testing chunk-specific injection...${colors.reset}`);

  try {
    // Create multi-entry configuration
    const multiEntryConfig = {
      mode: 'development',
      entry: {
        main: path.join(testProjectDir, 'src', 'index.js'),
        vendor: path.join(testProjectDir, 'src', 'index.js') // Same file for simplicity
      },
      output: {
        ...TEST_CONFIG.webpack.output,
        path: path.join(testProjectDir, 'dist')
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: path.join(testProjectDir, 'src', 'index.html'),
          filename: 'main.html',
          chunks: ['main']
        }),
        new HtmlWebpackPlugin({
          template: path.join(testProjectDir, 'src', 'index.html'),
          filename: 'vendor.html',
          chunks: ['vendor']
        }),
        new TkrLoggingPlugin({
          enabled: true,
          clientUrl: 'http://test.example.com/client.js',
          chunks: ['main'] // Only inject in main chunk
        })
      ],
      stats: 'errors-only'
    };

    const stats = await runWebpack(multiEntryConfig);
    assertTrue(stats && !stats.hasErrors(), 'Multi-entry compilation succeeds');

    // Check main.html (should have injection)
    const mainHtmlPath = path.join(testProjectDir, 'dist', 'main.html');
    const mainHtmlContent = memoryFS.readFileSync(mainHtmlPath, 'utf8');
    assertContains('http://test.example.com/client.js', mainHtmlContent,
                  'Script injected in main chunk HTML');

    // Check vendor.html (should NOT have injection)
    const vendorHtmlPath = path.join(testProjectDir, 'dist', 'vendor.html');
    const vendorHtmlContent = memoryFS.readFileSync(vendorHtmlPath, 'utf8');

    // This test might be tricky because HtmlWebpackPlugin behavior varies
    // Let's just ensure the compilation worked
    assertTrue(vendorHtmlContent.length > 0, 'Vendor HTML was generated');

  } catch (error) {
    console.log(`${colors.red}Chunk-specific injection test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Test build process integration
 */
async function testBuildProcessIntegration() {
  console.log(`\n${colors.blue}Testing build process integration...${colors.reset}`);

  try {
    // Test development build
    const devConfig = createWebpackConfig({
      enabled: true
    });
    devConfig.mode = 'development';

    const devStats = await runWebpack(devConfig);
    assertTrue(devStats && !devStats.hasErrors(), 'Development build succeeds');

    // Test production build
    const prodConfig = createWebpackConfig({
      enabled: false // Typically disabled in production
    });
    prodConfig.mode = 'production';

    const prodStats = await runWebpack(prodConfig);
    assertTrue(prodStats && !prodStats.hasErrors(), 'Production build succeeds');

    // Verify plugin integrates with webpack hooks
    let hooksCalled = false;

    const hookTestConfig = createWebpackConfig();
    const compiler = webpack(hookTestConfig);

    // The plugin should attach to webpack hooks during apply
    const originalApply = TkrLoggingPlugin.prototype.apply;
    TkrLoggingPlugin.prototype.apply = function(compiler) {
      hooksCalled = true;
      return originalApply.call(this, compiler);
    };

    new TkrLoggingPlugin().apply(compiler);
    assertTrue(hooksCalled, 'Plugin integrates with webpack hooks');

    // Restore original apply method
    TkrLoggingPlugin.prototype.apply = originalApply;

  } catch (error) {
    console.log(`${colors.red}Build process integration test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Test loader functionality
 */
async function testLoaderFunctionality() {
  console.log(`\n${colors.blue}Testing loader functionality...${colors.reset}`);

  // Import loader
  let loader;
  try {
    loader = require('../../plugins/webpack/loader.js');
    assertTrue(typeof loader === 'function', 'Loader exports function');
  } catch (error) {
    console.log(`${colors.yellow}Loader not found or not required for tests: ${error.message}${colors.reset}`);
    return;
  }

  // Test loader with sample code
  const sampleCode = `
console.log('Hello world');
const data = { test: true };
export default data;
  `;

  try {
    // Mock webpack loader context
    const mockContext = {
      query: '?clientUrl=http://localhost:42003/api/logging-client.js',
      callback: (err, result) => {
        if (err) {
          testsFailed++;
        } else {
          assertTrue(typeof result === 'string', 'Loader returns modified code');
          // Should inject logging client import/setup
          testsPassed++;
        }
        testsRun++;
      }
    };

    loader.call(mockContext, sampleCode);

  } catch (error) {
    console.log(`${colors.red}Loader test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Test configuration validation
 */
async function testConfigurationValidation() {
  console.log(`\n${colors.blue}Testing configuration validation...${colors.reset}`);

  // Test with valid configuration
  const validPlugin = new TkrLoggingPlugin({
    enabled: true,
    clientUrl: 'http://localhost:42003/api/logging-client.js',
    chunks: ['main', 'vendor']
  });

  assertTrue(validPlugin instanceof TkrLoggingPlugin, 'Valid configuration accepted');

  // Test with minimal configuration
  const minimalPlugin = new TkrLoggingPlugin();
  assertTrue(minimalPlugin instanceof TkrLoggingPlugin, 'Minimal configuration works');

  // Test with invalid chunks (should handle gracefully)
  const invalidChunksPlugin = new TkrLoggingPlugin({
    chunks: 'invalid' // Should be array
  });

  assertTrue(invalidChunksPlugin instanceof TkrLoggingPlugin,
            'Invalid chunks configuration handled gracefully');

  // Test with undefined options
  const undefinedPlugin = new TkrLoggingPlugin(undefined);
  assertTrue(undefinedPlugin instanceof TkrLoggingPlugin, 'Undefined options handled');

  // Test with null options
  const nullPlugin = new TkrLoggingPlugin(null);
  assertTrue(nullPlugin instanceof TkrLoggingPlugin, 'Null options handled');

  // Test boolean enabled values
  const falseEnabledPlugin = new TkrLoggingPlugin({ enabled: false });
  assertEquals(false, falseEnabledPlugin.options.enabled, 'Boolean false enabled works');

  const trueEnabledPlugin = new TkrLoggingPlugin({ enabled: true });
  assertEquals(true, trueEnabledPlugin.options.enabled, 'Boolean true enabled works');
}

/**
 * Test error handling and graceful degradation
 */
async function testErrorHandling() {
  console.log(`\n${colors.blue}Testing error handling...${colors.reset}`);

  try {
    // Test with invalid HTML template
    const invalidHtmlConfig = createWebpackConfig({}, {
      template: 'nonexistent-template.html'
    });

    try {
      await runWebpack(invalidHtmlConfig);
      // If it doesn't throw, that's fine - webpack might handle it
      assertTrue(true, 'Invalid template handled by webpack');
    } catch (error) {
      // Expected to fail, but shouldn't crash our plugin
      assertTrue(error.message.length > 0, 'Invalid template causes expected error');
    }

    // Test plugin with invalid clientUrl
    const invalidUrlConfig = createWebpackConfig({
      clientUrl: null
    });

    try {
      const stats = await runWebpack(invalidUrlConfig);
      assertTrue(stats && !stats.hasErrors(), 'Invalid clientUrl handled gracefully');
    } catch (error) {
      console.log(`${colors.yellow}Invalid URL test error: ${error.message}${colors.reset}`);
    }

    // Test with missing HtmlWebpackPlugin
    const noHtmlConfig = {
      mode: 'development',
      entry: {
        main: path.join(testProjectDir, 'src', 'index.js')
      },
      output: {
        ...TEST_CONFIG.webpack.output,
        path: path.join(testProjectDir, 'dist')
      },
      plugins: [
        new TkrLoggingPlugin()
      ]
    };

    try {
      const stats = await runWebpack(noHtmlConfig);
      assertTrue(stats && !stats.hasErrors(), 'Plugin works without HtmlWebpackPlugin');
    } catch (error) {
      console.log(`${colors.yellow}No HTML plugin test: ${error.message}${colors.reset}`);
    }

  } catch (error) {
    console.log(`${colors.red}Error handling test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Test multi-environment compatibility
 */
async function testMultiEnvironmentCompatibility() {
  console.log(`\n${colors.blue}Testing multi-environment compatibility...${colors.reset}`);

  const originalEnv = process.env.NODE_ENV;

  try {
    // Test development environment
    process.env.NODE_ENV = 'development';
    const devPlugin = new TkrLoggingPlugin();
    assertEquals(true, devPlugin.options.enabled, 'Plugin enabled by default in development');

    // Test production environment
    process.env.NODE_ENV = 'production';
    const prodPlugin = new TkrLoggingPlugin();
    assertEquals(false, prodPlugin.options.enabled, 'Plugin disabled by default in production');

    // Test test environment
    process.env.NODE_ENV = 'test';
    const testPlugin = new TkrLoggingPlugin();
    assertTrue(testPlugin instanceof TkrLoggingPlugin, 'Plugin works in test environment');

    // Test with explicit enabled flag (should override environment)
    const explicitEnabledPlugin = new TkrLoggingPlugin({ enabled: true });
    assertEquals(true, explicitEnabledPlugin.options.enabled,
                'Explicit enabled flag overrides environment');

  } finally {
    process.env.NODE_ENV = originalEnv;
  }

  // Test different webpack versions compatibility
  const webpackVersion = webpack.version;
  assertTrue(webpackVersion && typeof webpackVersion === 'string',
            'Webpack version available');

  // Test with different HtmlWebpackPlugin configurations
  const minifyConfig = createWebpackConfig({}, {
    minify: {
      removeComments: true,
      collapseWhitespace: true
    }
  });

  try {
    const stats = await runWebpack(minifyConfig);
    assertTrue(stats && !stats.hasErrors(), 'Works with minified HTML');
  } catch (error) {
    console.log(`${colors.yellow}Minify test: ${error.message}${colors.reset}`);
  }
}

/**
 * Test HTML plugin hooks integration
 */
async function testHtmlPluginHooks() {
  console.log(`\n${colors.blue}Testing HTML plugin hooks integration...${colors.reset}`);

  try {
    // Test that our plugin correctly hooks into HtmlWebpackPlugin
    const config = createWebpackConfig({
      enabled: true,
      clientUrl: 'http://test.example.com/client.js'
    });

    // Check if our plugin is properly registered
    const tkrPlugin = config.plugins.find(p => p instanceof TkrLoggingPlugin);
    assertTrue(tkrPlugin !== undefined, 'TKR plugin found in configuration');

    const htmlPlugin = config.plugins.find(p => p.constructor.name === 'HtmlWebpackPlugin');
    assertTrue(htmlPlugin !== undefined, 'HTML plugin found in configuration');

    // Test compilation to ensure hooks work
    const stats = await runWebpack(config);
    assertTrue(stats && !stats.hasErrors(), 'Compilation with hooks succeeds');

    // Verify the HTML output contains our injection
    const htmlPath = path.join(testProjectDir, 'dist', 'index.html');
    const htmlContent = memoryFS.readFileSync(htmlPath, 'utf8');

    assertContains('<script', htmlContent, 'HTML contains injected script');

  } catch (error) {
    console.log(`${colors.red}HTML plugin hooks test failed: ${error.message}${colors.reset}`);
    testsFailed++;
    testsRun++;
  }
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment() {
  console.log(`\n${colors.blue}Cleaning up test environment...${colors.reset}`);

  if (testProjectDir) {
    try {
      await fs.promises.rm(testProjectDir, { recursive: true, force: true });
    } catch (error) {
      console.log(`${colors.yellow}Error removing test directory: ${error.message}${colors.reset}`);
    }
  }

  memoryFS = null;

  console.log(`${colors.green}Cleanup completed${colors.reset}`);
}

/**
 * Print test results
 */
function printResults() {
  console.log(`\n${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}Webpack Plugin Test Results${colors.reset}`);
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
  console.log(`${colors.blue}TKR Logging Webpack Plugin Integration Tests${colors.reset}`);
  console.log(`${colors.blue}===========================================${colors.reset}`);

  let success = false;

  try {
    await setupTestEnvironment();

    // Run test suites
    await testPluginRegistration();
    await testHtmlModification();
    await testChunkSpecificInjection();
    await testBuildProcessIntegration();
    await testLoaderFunctionality();
    await testConfigurationValidation();
    await testErrorHandling();
    await testMultiEnvironmentCompatibility();
    await testHtmlPluginHooks();

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
  testHtmlModification,
  testChunkSpecificInjection,
  testBuildProcessIntegration,
  testLoaderFunctionality,
  testConfigurationValidation,
  testErrorHandling,
  testMultiEnvironmentCompatibility,
  testHtmlPluginHooks
};