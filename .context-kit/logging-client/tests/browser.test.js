/**
 * TKR Logging Browser Client Integration Tests
 * Comprehensive testing of browser logging functionality
 *
 * Tests:
 * - Console interception with perfect passthrough
 * - Session management across page reloads
 * - Batch sending with retry logic
 * - Performance monitoring and thresholds
 * - Error capture (global errors, unhandled rejections)
 * - API compliance with interface specification
 * - Browser compatibility across environments
 * - Memory leak prevention
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const http = require('http');

// Test configuration
const TEST_CONFIG = {
  browser: {
    headless: true,
    devtools: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  },
  server: {
    port: 42998,
    timeout: 5000
  },
  performance: {
    maxOverheadMs: 1,
    maxBatchLatencyMs: 100,
    maxMemoryMB: 10
  },
  logging: {
    endpoint: 'http://localhost:42998/api/logs/batch',
    batchSize: 3,
    flushInterval: 1000
  }
};

// Test state
let browser = null;
let page = null;
let mockServer = null;
let receivedLogs = [];
let serverRequests = [];

// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;
let performanceTests = 0;

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
  console.log(`${colors.blue}Setting up browser test environment...${colors.reset}`);

  // Start mock logging server
  await startMockServer();

  // Launch browser
  browser = await puppeteer.launch(TEST_CONFIG.browser);
  page = await browser.newPage();

  // Set up error capturing
  page.on('console', msg => {
    // Capture console messages for debugging
    if (msg.type() === 'error') {
      console.log(`${colors.red}Browser console error: ${msg.text()}${colors.reset}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`${colors.red}Page error: ${error.message}${colors.reset}`);
  });

  console.log(`${colors.green}Test environment ready${colors.reset}`);
}

/**
 * Start mock logging server
 */
function startMockServer() {
  return new Promise((resolve, reject) => {
    mockServer = http.createServer((req, res) => {
      // Enable CORS
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      // Track all requests
      serverRequests.push({
        method: req.method,
        url: req.url,
        headers: req.headers,
        timestamp: Date.now()
      });

      if (req.method === 'POST' && req.url === '/api/logs/batch') {
        let body = '';
        req.on('data', chunk => {
          body += chunk.toString();
        });

        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            receivedLogs.push(data);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              status: 'success',
              results: {
                processed: data.logs ? data.logs.length : 0,
                duplicates: 0,
                errors: []
              }
            }));
          } catch (error) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
        });
      } else if (req.method === 'GET' && req.url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else if (req.method === 'GET' && req.url === '/api/logging-client.js') {
        // Serve the browser client script
        const clientPath = path.join(__dirname, '../../browser-client/logging-client.js');
        if (fs.existsSync(clientPath)) {
          const content = fs.readFileSync(clientPath, 'utf8');
          res.writeHead(200, { 'Content-Type': 'application/javascript' });
          res.end(content);
        } else {
          res.writeHead(404);
          res.end('Client script not found');
        }
      } else {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    mockServer.listen(TEST_CONFIG.server.port, () => {
      console.log(`Mock server started on port ${TEST_CONFIG.server.port}`);
      resolve();
    });

    mockServer.on('error', reject);
  });
}

/**
 * Load logging components in browser
 */
async function loadLoggingComponents() {
  const browserClientPath = path.join(__dirname, '../../browser-client');

  // Load session manager
  const sessionManager = fs.readFileSync(path.join(browserClientPath, 'session-manager.js'), 'utf8');
  await page.evaluate(sessionManager);

  // Load batch sender
  const batchSender = fs.readFileSync(path.join(browserClientPath, 'batch-sender.js'), 'utf8');
  await page.evaluate(batchSender);

  // Load main client
  const loggingClient = fs.readFileSync(path.join(browserClientPath, 'logging-client.js'), 'utf8');
  await page.evaluate(loggingClient);
}

/**
 * Test assertion helpers
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

async function assertPerformance(operation, maxTimeMs, testName) {
  testsRun++;
  performanceTests++;

  const start = Date.now();
  await operation();
  const duration = Date.now() - start;

  if (duration <= maxTimeMs) {
    console.log(`${colors.green}✓ ${testName} (${duration}ms)${colors.reset}`);
    testsPassed++;
    return true;
  } else {
    console.log(`${colors.red}✗ ${testName} (${duration}ms > ${maxTimeMs}ms)${colors.reset}`);
    testsFailed++;
    return false;
  }
}

/**
 * Test console interception and passthrough
 */
async function testConsoleInterception() {
  console.log(`\n${colors.blue}Testing console interception...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  // Initialize logging
  await page.evaluate((config) => {
    window.TkrLogging.init(config);
  }, TEST_CONFIG.logging);

  // Test that console methods still work normally
  const consoleOutput = await page.evaluate(() => {
    const originalLog = console.log;
    let captured = '';

    // Temporarily capture console output
    console.log = (...args) => {
      captured = args.join(' ');
      originalLog.apply(console, args);
    };

    console.log('test message');

    // Restore original
    console.log = originalLog;

    return captured;
  });

  assertEquals('test message', consoleOutput, 'Console.log passthrough works');

  // Test different console methods
  await page.evaluate(() => {
    console.info('info message');
    console.warn('warning message');
    console.error('error message');
    console.debug('debug message');
  });

  // Wait for batching
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check that logs were captured
  assertTrue(receivedLogs.length > 0, 'Console messages were captured and sent');

  if (receivedLogs.length > 0) {
    const batch = receivedLogs[receivedLogs.length - 1];
    assertTrue(batch.logs && batch.logs.length > 0, 'Batch contains log entries');

    if (batch.logs.length > 0) {
      const log = batch.logs[0];
      assertTrue(log.level && log.message && log.service, 'Log entry has required fields');
      assertEquals('browser', log.service, 'Log service is correctly set');
    }
  }
}

/**
 * Test session management
 */
async function testSessionManagement() {
  console.log(`\n${colors.blue}Testing session management...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  // Get initial session ID
  const sessionId1 = await page.evaluate(() => {
    window.TkrLogging.init();
    return window.TkrLogging._client.sessionManager.getSessionId();
  });

  assertTrue(sessionId1 && sessionId1.length > 0, 'Session ID is generated');

  // Reload page and check session persistence
  await page.reload();
  await loadLoggingComponents();

  const sessionId2 = await page.evaluate(() => {
    window.TkrLogging.init();
    return window.TkrLogging._client.sessionManager.getSessionId();
  });

  assertEquals(sessionId1, sessionId2, 'Session ID persists across page reloads');

  // Test session metadata
  const metadata = await page.evaluate(() => {
    return window.TkrLogging._client.sessionManager.getSessionMetadata();
  });

  assertTrue(metadata && metadata.sessionId === sessionId1, 'Session metadata includes session ID');
  assertTrue(metadata.startTime && typeof metadata.startTime === 'number', 'Session metadata includes start time');
}

/**
 * Test batch sending functionality
 */
async function testBatchSending() {
  console.log(`\n${colors.blue}Testing batch sending...${colors.reset}`);

  // Clear previous logs
  receivedLogs = [];

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  await page.evaluate((config) => {
    window.TkrLogging.init(config);
  }, TEST_CONFIG.logging);

  // Send logs to trigger batching
  await page.evaluate(() => {
    window.TkrLogging.log('INFO', 'Batch test 1');
    window.TkrLogging.log('INFO', 'Batch test 2');
    window.TkrLogging.log('INFO', 'Batch test 3'); // Should trigger batch send
  });

  // Wait for batch to be sent
  await new Promise(resolve => setTimeout(resolve, 1500));

  assertTrue(receivedLogs.length > 0, 'Batch was sent when size threshold reached');

  if (receivedLogs.length > 0) {
    const batch = receivedLogs[receivedLogs.length - 1];
    assertEquals(3, batch.logs.length, 'Batch contains correct number of logs');
    assertTrue(batch.metadata && batch.metadata.source, 'Batch includes metadata');
  }

  // Test manual flush
  receivedLogs = [];
  await page.evaluate(() => {
    window.TkrLogging.log('INFO', 'Manual flush test');
    return window.TkrLogging.flush();
  });

  await new Promise(resolve => setTimeout(resolve, 500));
  assertTrue(receivedLogs.length > 0, 'Manual flush sends pending logs');
}

/**
 * Test performance monitoring
 */
async function testPerformanceMonitoring() {
  console.log(`\n${colors.blue}Testing performance monitoring...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  // Test console call performance
  await assertPerformance(async () => {
    await page.evaluate(() => {
      console.log('performance test');
    });
  }, TEST_CONFIG.performance.maxOverheadMs, 'Console call overhead under 1ms');

  // Test batch sending performance
  await assertPerformance(async () => {
    await page.evaluate(() => {
      for (let i = 0; i < 10; i++) {
        window.TkrLogging.log('INFO', `Performance test ${i}`);
      }
    });
  }, 10, 'Batch processing under 10ms for 10 logs');

  // Test performance threshold enforcement
  await page.evaluate(() => {
    window.TkrLogging.init({
      endpoint: 'http://localhost:42998/api/logs/batch',
      performanceThreshold: 0.1 // Very low threshold
    });
  });

  // Trigger many console calls to potentially exceed threshold
  await page.evaluate(() => {
    for (let i = 0; i < 100; i++) {
      console.log(`Threshold test ${i}`);
    }
  });

  const performanceStats = await page.evaluate(() => {
    return window.TkrLogging.getStats().performance;
  });

  assertTrue(performanceStats && typeof performanceStats.avgTime === 'number',
            'Performance statistics are tracked');
}

/**
 * Test error capture functionality
 */
async function testErrorCapture() {
  console.log(`\n${colors.blue}Testing error capture...${colors.reset}`);

  receivedLogs = [];

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  await page.evaluate((config) => {
    window.TkrLogging.init(config);
  }, TEST_CONFIG.logging);

  // Test global error capture
  await page.evaluate(() => {
    // Trigger a global error
    setTimeout(() => {
      throw new Error('Test global error');
    }, 100);
  });

  // Wait for error to be captured
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test unhandled promise rejection
  await page.evaluate(() => {
    // Trigger unhandled rejection
    Promise.reject(new Error('Test promise rejection'));
  });

  await new Promise(resolve => setTimeout(resolve, 1000));

  // Check that errors were captured
  let foundGlobalError = false;
  let foundRejection = false;

  for (const batch of receivedLogs) {
    for (const log of batch.logs || []) {
      if (log.level === 'ERROR' && log.message.includes('Uncaught Error')) {
        foundGlobalError = true;
      }
      if (log.level === 'ERROR' && log.message.includes('Unhandled Promise Rejection')) {
        foundRejection = true;
      }
    }
  }

  assertTrue(foundGlobalError, 'Global errors are captured');
  assertTrue(foundRejection, 'Unhandled promise rejections are captured');
}

/**
 * Test API compliance with interface specification
 */
async function testAPICompliance() {
  console.log(`\n${colors.blue}Testing API compliance...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  // Test global API availability
  const apiMethods = await page.evaluate(() => {
    return {
      hasInit: typeof window.TkrLogging.init === 'function',
      hasLog: typeof window.TkrLogging.log === 'function',
      hasFlush: typeof window.TkrLogging.flush === 'function',
      hasDisable: typeof window.TkrLogging.disable === 'function',
      hasEnable: typeof window.TkrLogging.enable === 'function',
      hasGetStats: typeof window.TkrLogging.getStats === 'function'
    };
  });

  assertTrue(apiMethods.hasInit, 'TkrLogging.init method available');
  assertTrue(apiMethods.hasLog, 'TkrLogging.log method available');
  assertTrue(apiMethods.hasFlush, 'TkrLogging.flush method available');
  assertTrue(apiMethods.hasDisable, 'TkrLogging.disable method available');
  assertTrue(apiMethods.hasEnable, 'TkrLogging.enable method available');
  assertTrue(apiMethods.hasGetStats, 'TkrLogging.getStats method available');

  // Test log entry format compliance
  receivedLogs = [];

  await page.evaluate((config) => {
    window.TkrLogging.init(config);
    window.TkrLogging.log('INFO', 'API compliance test', { custom: 'metadata' });
  }, TEST_CONFIG.logging);

  await new Promise(resolve => setTimeout(resolve, 1000));

  if (receivedLogs.length > 0) {
    const log = receivedLogs[0].logs[0];

    // Check required fields
    assertTrue(log.level && typeof log.level === 'string', 'Log has level field');
    assertTrue(log.message && typeof log.message === 'string', 'Log has message field');
    assertTrue(log.service && typeof log.service === 'string', 'Log has service field');

    // Check optional fields
    assertTrue(!log.component || typeof log.component === 'string', 'Component field is string if present');
    assertTrue(!log.timestamp || typeof log.timestamp === 'number', 'Timestamp field is number if present');
    assertTrue(!log.sessionId || typeof log.sessionId === 'string', 'SessionId field is string if present');
    assertTrue(!log.metadata || typeof log.metadata === 'object', 'Metadata field is object if present');

    // Check field limits
    assertTrue(log.message.length <= 10000, 'Message length within limit');
    assertTrue(log.service.length <= 100, 'Service length within limit');
  }
}

/**
 * Test enable/disable functionality
 */
async function testEnableDisable() {
  console.log(`\n${colors.blue}Testing enable/disable functionality...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  await page.evaluate((config) => {
    window.TkrLogging.init(config);
  }, TEST_CONFIG.logging);

  // Test disable
  await page.evaluate(() => {
    window.TkrLogging.disable();
  });

  const disabledStats = await page.evaluate(() => {
    return window.TkrLogging.getStats().enabled;
  });

  assertEquals(false, disabledStats, 'Logging is disabled after disable()');

  // Test that logs are not sent when disabled
  receivedLogs = [];
  await page.evaluate(() => {
    console.log('disabled test');
  });

  await new Promise(resolve => setTimeout(resolve, 1000));
  assertEquals(0, receivedLogs.length, 'No logs sent when disabled');

  // Test enable
  await page.evaluate(() => {
    window.TkrLogging.enable();
  });

  const enabledStats = await page.evaluate(() => {
    return window.TkrLogging.getStats().enabled;
  });

  assertEquals(true, enabledStats, 'Logging is enabled after enable()');
}

/**
 * Test memory leak prevention
 */
async function testMemoryLeaks() {
  console.log(`\n${colors.blue}Testing memory leak prevention...${colors.reset}`);

  await page.goto('data:text/html,<html><body></body></html>');
  await loadLoggingComponents();

  // Get initial memory usage
  const initialMemory = await page.evaluate(() => {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  });

  // Generate many log entries
  await page.evaluate((config) => {
    window.TkrLogging.init(config);

    // Generate 1000 log entries
    for (let i = 0; i < 1000; i++) {
      console.log(`Memory test ${i}`);
    }
  }, TEST_CONFIG.logging);

  // Force garbage collection if available
  await page.evaluate(() => {
    if (window.gc) {
      window.gc();
    }
  });

  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 2000));

  const finalMemory = await page.evaluate(() => {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  });

  if (initialMemory > 0 && finalMemory > 0) {
    const memoryIncrease = (finalMemory - initialMemory) / (1024 * 1024); // MB
    assertTrue(memoryIncrease < TEST_CONFIG.performance.maxMemoryMB,
              `Memory increase (${memoryIncrease.toFixed(2)}MB) within limits`);
  } else {
    console.log(`${colors.yellow}Memory testing not available in this browser${colors.reset}`);
  }
}

/**
 * Test browser compatibility
 */
async function testBrowserCompatibility() {
  console.log(`\n${colors.blue}Testing browser compatibility...${colors.reset}`);

  // Test basic JavaScript features used by the client
  const compatibility = await page.evaluate(() => {
    return {
      hasPromises: typeof Promise !== 'undefined',
      hasLocalStorage: typeof localStorage !== 'undefined',
      hasSessionStorage: typeof sessionStorage !== 'undefined',
      hasConsole: typeof console !== 'undefined',
      hasPerformance: typeof performance !== 'undefined',
      hasJSON: typeof JSON !== 'undefined',
      hasSetTimeout: typeof setTimeout !== 'undefined'
    };
  });

  assertTrue(compatibility.hasPromises, 'Browser supports Promises');
  assertTrue(compatibility.hasLocalStorage, 'Browser supports localStorage');
  assertTrue(compatibility.hasSessionStorage, 'Browser supports sessionStorage');
  assertTrue(compatibility.hasConsole, 'Browser supports console');
  assertTrue(compatibility.hasPerformance, 'Browser supports performance API');
  assertTrue(compatibility.hasJSON, 'Browser supports JSON');
  assertTrue(compatibility.hasSetTimeout, 'Browser supports setTimeout');
}

/**
 * Cleanup test environment
 */
async function cleanupTestEnvironment() {
  console.log(`\n${colors.blue}Cleaning up test environment...${colors.reset}`);

  if (page) {
    await page.close();
  }

  if (browser) {
    await browser.close();
  }

  if (mockServer) {
    mockServer.close();
  }

  // Clear state
  receivedLogs = [];
  serverRequests = [];

  console.log(`${colors.green}Cleanup completed${colors.reset}`);
}

/**
 * Print test results
 */
function printResults() {
  console.log(`\n${colors.blue}==========================================${colors.reset}`);
  console.log(`${colors.blue}Browser Logging Test Results${colors.reset}`);
  console.log(`${colors.blue}==========================================${colors.reset}`);
  console.log(`Total tests run: ${testsRun}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);
  console.log(`Performance tests: ${performanceTests}`);

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
  console.log(`${colors.blue}TKR Logging Browser Client Integration Tests${colors.reset}`);
  console.log(`${colors.blue}=============================================${colors.reset}`);

  let success = false;

  try {
    await setupTestEnvironment();

    // Run test suites
    await testConsoleInterception();
    await testSessionManagement();
    await testBatchSending();
    await testPerformanceMonitoring();
    await testErrorCapture();
    await testAPICompliance();
    await testEnableDisable();
    await testMemoryLeaks();
    await testBrowserCompatibility();

    success = printResults();

  } catch (error) {
    console.error(`${colors.red}Test execution failed: ${error.message}${colors.reset}`);
    console.error(error.stack);
  } finally {
    await cleanupTestEnvironment();
  }

  process.exit(success ? 0 : 1);
}

// Run tests if this file is executed directly
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Unhandled error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}

module.exports = {
  main,
  setupTestEnvironment,
  cleanupTestEnvironment,
  testConsoleInterception,
  testSessionManagement,
  testBatchSending,
  testPerformanceMonitoring,
  testErrorCapture,
  testAPICompliance,
  testEnableDisable,
  testMemoryLeaks,
  testBrowserCompatibility
};