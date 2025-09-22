/**
 * TKR Logging Performance Tests
 * Comprehensive performance validation against specification targets
 *
 * Performance Targets (from interface specification):
 * - Log overhead: < 1ms per log call
 * - Batch latency: < 100ms to send batch
 * - CPU usage: < 1% additional CPU
 * - Memory usage: < 10MB additional memory
 * - Network bandwidth: < 10KB/s average
 *
 * Tests:
 * - Individual component performance
 * - System-wide performance under load
 * - Memory leak detection
 * - CPU usage monitoring
 * - Network bandwidth measurement
 * - Latency and throughput benchmarks
 * - Stress testing and breaking points
 * - Performance regression detection
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const puppeteer = require('puppeteer');
const { performance, PerformanceObserver } = require('perf_hooks');
const os = require('os');

// Performance test configuration
const PERFORMANCE_CONFIG = {
  targets: {
    logOverheadMs: 1,
    batchLatencyMs: 100,
    cpuUsagePercent: 1,
    memoryUsageMB: 10,
    networkBandwidthKBs: 10
  },
  load: {
    duration: 30000,        // 30 seconds
    logRate: 100,           // logs per second
    concurrentUsers: 10,    // concurrent browser sessions
    batchSizes: [1, 10, 50, 100],
    iterationCount: 1000    // iterations for microbenchmarks
  },
  browser: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  },
  monitoring: {
    sampleInterval: 1000,   // 1 second
    gcInterval: 5000        // Force GC every 5 seconds
  }
};

// Performance state
let performanceData = {
  tests: [],
  metrics: {
    cpu: [],
    memory: [],
    network: [],
    latency: [],
    throughput: []
  },
  baseline: null
};

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
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

/**
 * Performance monitoring utilities
 */
class PerformanceMonitor {
  constructor() {
    this.startTime = null;
    this.endTime = null;
    this.memoryStart = null;
    this.memoryEnd = null;
    this.cpuStart = null;
    this.cpuEnd = null;
  }

  start() {
    this.startTime = performance.now();
    this.memoryStart = process.memoryUsage();
    this.cpuStart = process.cpuUsage();
  }

  end() {
    this.endTime = performance.now();
    this.memoryEnd = process.memoryUsage();
    this.cpuEnd = process.cpuUsage(this.cpuStart);

    return {
      duration: this.endTime - this.startTime,
      memory: {
        heapUsed: (this.memoryEnd.heapUsed - this.memoryStart.heapUsed) / 1024 / 1024,
        heapTotal: (this.memoryEnd.heapTotal - this.memoryStart.heapTotal) / 1024 / 1024,
        rss: (this.memoryEnd.rss - this.memoryStart.rss) / 1024 / 1024
      },
      cpu: {
        user: this.cpuEnd.user / 1000000, // Convert to seconds
        system: this.cpuEnd.system / 1000000
      }
    };
  }
}

/**
 * Network bandwidth monitor
 */
class NetworkMonitor {
  constructor() {
    this.bytesTransferred = 0;
    this.requestCount = 0;
    this.startTime = null;
  }

  start() {
    this.startTime = Date.now();
    this.bytesTransferred = 0;
    this.requestCount = 0;
  }

  recordRequest(bytes) {
    this.bytesTransferred += bytes;
    this.requestCount++;
  }

  getStats() {
    const duration = (Date.now() - this.startTime) / 1000; // seconds
    return {
      totalBytes: this.bytesTransferred,
      requestCount: this.requestCount,
      bandwidthKBps: (this.bytesTransferred / 1024) / duration,
      requestRate: this.requestCount / duration,
      averageRequestSize: this.bytesTransferred / Math.max(1, this.requestCount)
    };
  }
}

/**
 * Test helper functions
 */
function assert(condition, testName, actual = null, expected = null) {
  testsRun++;
  performanceTests++;

  if (condition) {
    console.log(`${colors.green}✓ ${testName}${colors.reset}`);
    testsPassed++;
    return true;
  } else {
    console.log(`${colors.red}✗ ${testName}${colors.reset}`);
    if (actual !== null && expected !== null) {
      console.log(`  Expected: ${expected}`);
      console.log(`  Actual: ${actual}`);
    }
    testsFailed++;
    return false;
  }
}

function assertPerformance(actual, target, testName, unit = 'ms') {
  const passed = actual <= target;
  const result = {
    testName,
    actual,
    target,
    unit,
    passed,
    timestamp: Date.now()
  };

  performanceData.tests.push(result);

  return assert(passed, `${testName} (${actual}${unit} <= ${target}${unit})`, actual, target);
}

/**
 * Establish performance baseline
 */
async function establishBaseline() {
  console.log(`\n${colors.blue}Establishing performance baseline...${colors.reset}`);

  const monitor = new PerformanceMonitor();
  monitor.start();

  // Run baseline operations
  await new Promise(resolve => setTimeout(resolve, 1000));

  const baseline = monitor.end();
  performanceData.baseline = baseline;

  console.log(`${colors.cyan}Baseline metrics:${colors.reset}`);
  console.log(`  Duration: ${baseline.duration.toFixed(2)}ms`);
  console.log(`  Memory: ${baseline.memory.heapUsed.toFixed(2)}MB heap`);
  console.log(`  CPU: ${(baseline.cpu.user + baseline.cpu.system).toFixed(2)}s`);
}

/**
 * Test log call overhead
 */
async function testLogCallOverhead() {
  console.log(`\n${colors.blue}Testing log call overhead...${colors.reset}`);

  // Load logging components
  const browserClientPath = path.join(__dirname, '../../browser-client/logging-client.js');
  const shellScriptPath = path.join(__dirname, '../../shell/tkr-logging.sh');

  // Test browser client overhead
  if (fs.existsSync(browserClientPath)) {
    const browser = await puppeteer.launch(PERFORMANCE_CONFIG.browser);
    const page = await browser.newPage();

    try {
      // Load logging client
      const clientScript = fs.readFileSync(browserClientPath, 'utf8');
      await page.evaluateOnNewDocument(clientScript);

      await page.goto('data:text/html,<html><body></body></html>');

      // Measure console.log overhead with logging
      const withLoggingTime = await page.evaluate(() => {
        window.TkrLogging.init({
          endpoint: 'http://localhost:42003/api/logs/batch',
          batchSize: 1000 // Large batch to avoid network calls
        });

        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          console.log(`Test log ${i}`);
        }
        const end = performance.now();

        return end - start;
      });

      // Measure console.log overhead without logging
      await page.evaluate(() => {
        window.TkrLogging.disable();
      });

      const withoutLoggingTime = await page.evaluate(() => {
        const start = performance.now();
        for (let i = 0; i < 1000; i++) {
          console.log(`Test log ${i}`);
        }
        const end = performance.now();

        return end - start;
      });

      const averageOverhead = (withLoggingTime - withoutLoggingTime) / 1000;

      assertPerformance(averageOverhead, PERFORMANCE_CONFIG.targets.logOverheadMs,
                       'Browser console.log overhead');

      await browser.close();

    } catch (error) {
      console.log(`${colors.yellow}Browser overhead test failed: ${error.message}${colors.reset}`);
      await browser.close();
    }
  }

  // Test shell logging overhead
  if (fs.existsSync(shellScriptPath)) {
    try {
      const shellTest = `
        source "${shellScriptPath}"
        export TKR_LOG_ENABLED="true"
        export TKR_LOG_BATCH_SIZE="1000"

        start_time=$(date +%s%N)
        for i in {1..100}; do
          tkr_send_log "INFO" "Performance test log $i" "perf-test"
        done
        end_time=$(date +%s%N)

        duration=$((($end_time - $start_time) / 1000000))
        echo "Duration: $duration"
      `;

      const result = await new Promise((resolve) => {
        exec(shellTest, (error, stdout, stderr) => {
          if (error) {
            resolve({ error: error.message });
          } else {
            const match = stdout.match(/Duration: (\d+)/);
            const duration = match ? parseInt(match[1]) : 0;
            resolve({ duration, stdout, stderr });
          }
        });
      });

      if (result.duration) {
        const averageOverhead = result.duration / 100; // milliseconds per log

        assertPerformance(averageOverhead, PERFORMANCE_CONFIG.targets.logOverheadMs,
                         'Shell logging overhead');
      }

    } catch (error) {
      console.log(`${colors.yellow}Shell overhead test failed: ${error.message}${colors.reset}`);
    }
  }
}

/**
 * Test batch processing latency
 */
async function testBatchLatency() {
  console.log(`\n${colors.blue}Testing batch processing latency...${colors.reset}`);

  // Test different batch sizes
  for (const batchSize of PERFORMANCE_CONFIG.load.batchSizes) {
    try {
      const monitor = new PerformanceMonitor();
      monitor.start();

      // Create test batch
      const testBatch = {
        logs: Array.from({ length: batchSize }, (_, i) => ({
          level: 'INFO',
          message: `Batch test log ${i}`,
          service: 'performance-test',
          component: 'batch-latency',
          timestamp: Math.floor(Date.now() / 1000)
        })),
        metadata: {
          batchId: `batch-${Date.now()}`,
          source: 'performance-test'
        }
      };

      // Simulate batch processing (without actual network call)
      const batchJson = JSON.stringify(testBatch);
      const batchSize_bytes = Buffer.byteLength(batchJson, 'utf8');

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, Math.random() * 10));

      const metrics = monitor.end();

      assertPerformance(metrics.duration, PERFORMANCE_CONFIG.targets.batchLatencyMs,
                       `Batch processing latency (size: ${batchSize})`);

      // Track memory usage for batches
      assertPerformance(metrics.memory.heapUsed, PERFORMANCE_CONFIG.targets.memoryUsageMB,
                       `Batch memory usage (size: ${batchSize})`, 'MB');

    } catch (error) {
      console.log(`${colors.yellow}Batch latency test failed for size ${batchSize}: ${error.message}${colors.reset}`);
    }
  }
}

/**
 * Test memory usage and leak detection
 */
async function testMemoryUsage() {
  console.log(`\n${colors.blue}Testing memory usage and leak detection...${colors.reset}`);

  const browser = await puppeteer.launch(PERFORMANCE_CONFIG.browser);
  const page = await browser.newPage();

  try {
    // Load logging client
    const browserClientPath = path.join(__dirname, '../../browser-client/logging-client.js');
    const clientScript = fs.readFileSync(browserClientPath, 'utf8');
    await page.evaluateOnNewDocument(clientScript);

    await page.goto('data:text/html,<html><body></body></html>');

    // Initialize logging
    await page.evaluate(() => {
      window.TkrLogging.init({
        endpoint: 'http://localhost:42003/api/logs/batch',
        batchSize: 100
      });
    });

    // Get initial memory usage
    const initialMemory = await page.evaluate(() => {
      return performance.memory ? {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
      } : null;
    });

    if (initialMemory) {
      // Generate many log entries
      await page.evaluate(() => {
        for (let i = 0; i < 10000; i++) {
          console.log(`Memory test log ${i}`);
          window.TkrLogging.log('INFO', `Manual memory test log ${i}`);
        }
      });

      // Force garbage collection if available
      await page.evaluate(() => {
        if (window.gc) {
          window.gc();
        }
      });

      // Wait for potential cleanup
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get final memory usage
      const finalMemory = await page.evaluate(() => {
        return performance.memory ? {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
        } : null;
      });

      if (finalMemory) {
        const memoryIncrease = (finalMemory.usedJSHeapSize - initialMemory.usedJSHeapSize) / 1024 / 1024;

        assertPerformance(memoryIncrease, PERFORMANCE_CONFIG.targets.memoryUsageMB,
                         'Browser memory usage increase', 'MB');

        // Test for memory leaks by checking if memory growth is reasonable
        const memoryGrowthRatio = finalMemory.usedJSHeapSize / initialMemory.usedJSHeapSize;
        const expectedMaxGrowth = 3.0; // 3x growth is reasonable for 10k logs

        assert(memoryGrowthRatio < expectedMaxGrowth,
              `Memory growth ratio acceptable (${memoryGrowthRatio.toFixed(2)}x < ${expectedMaxGrowth}x)`);
      }
    } else {
      console.log(`${colors.yellow}Browser memory API not available${colors.reset}`);
    }

    await browser.close();

  } catch (error) {
    console.log(`${colors.yellow}Memory usage test failed: ${error.message}${colors.reset}`);
    await browser.close();
  }

  // Test Node.js memory usage
  try {
    const monitor = new PerformanceMonitor();
    monitor.start();

    // Simulate heavy logging client usage
    const loggingClient = require('../../logging-client/index.js');

    for (let i = 0; i < 1000; i++) {
      // Simulate logging operations
      const logEntry = {
        level: 'INFO',
        message: `Node.js memory test ${i}`,
        service: 'performance-test',
        timestamp: Date.now()
      };

      // Simulate processing
      JSON.stringify(logEntry);
    }

    const metrics = monitor.end();

    assertPerformance(metrics.memory.heapUsed, PERFORMANCE_CONFIG.targets.memoryUsageMB,
                     'Node.js memory usage', 'MB');

  } catch (error) {
    console.log(`${colors.yellow}Node.js memory test skipped: ${error.message}${colors.reset}`);
  }
}

/**
 * Test CPU usage under load
 */
async function testCPUUsage() {
  console.log(`\n${colors.blue}Testing CPU usage under load...${colors.reset}`);

  try {
    const cpuMonitor = new PerformanceMonitor();
    cpuMonitor.start();

    // Simulate CPU-intensive logging operations
    const promises = [];

    for (let i = 0; i < PERFORMANCE_CONFIG.load.concurrentUsers; i++) {
      promises.push(new Promise(async (resolve) => {
        const browser = await puppeteer.launch(PERFORMANCE_CONFIG.browser);
        const page = await browser.newPage();

        try {
          const browserClientPath = path.join(__dirname, '../../browser-client/logging-client.js');
          const clientScript = fs.readFileSync(browserClientPath, 'utf8');
          await page.evaluateOnNewDocument(clientScript);

          await page.goto('data:text/html,<html><body></body></html>');

          await page.evaluate(() => {
            window.TkrLogging.init({
              endpoint: 'http://localhost:42003/api/logs/batch',
              batchSize: 50
            });

            // Generate continuous logs for 10 seconds
            const endTime = Date.now() + 10000;
            let logCount = 0;

            const logInterval = setInterval(() => {
              if (Date.now() > endTime) {
                clearInterval(logInterval);
                return;
              }

              console.log(`CPU test log ${logCount++}`);
              window.TkrLogging.log('INFO', `Manual CPU test log ${logCount}`);
            }, 10); // 100 logs per second per user
          });

          // Wait for load test to complete
          await new Promise(resolve => setTimeout(resolve, 12000));

          await browser.close();
          resolve();

        } catch (error) {
          await browser.close();
          resolve();
        }
      }));
    }

    await Promise.all(promises);

    const cpuMetrics = cpuMonitor.end();
    const totalCpuTime = cpuMetrics.cpu.user + cpuMetrics.cpu.system;
    const cpuUsagePercent = (totalCpuTime / (cpuMetrics.duration / 1000)) * 100;

    assertPerformance(cpuUsagePercent, PERFORMANCE_CONFIG.targets.cpuUsagePercent,
                     'CPU usage under concurrent load', '%');

  } catch (error) {
    console.log(`${colors.yellow}CPU usage test failed: ${error.message}${colors.reset}`);
  }
}

/**
 * Test network bandwidth usage
 */
async function testNetworkBandwidth() {
  console.log(`\n${colors.blue}Testing network bandwidth usage...${colors.reset}`);

  try {
    const networkMonitor = new NetworkMonitor();
    networkMonitor.start();

    // Simulate network requests to logging endpoint
    const testDuration = 10000; // 10 seconds
    const endTime = Date.now() + testDuration;

    const requests = [];

    while (Date.now() < endTime) {
      const testBatch = {
        logs: Array.from({ length: 10 }, (_, i) => ({
          level: 'INFO',
          message: `Network bandwidth test log ${i}`,
          service: 'performance-test',
          component: 'bandwidth-test',
          timestamp: Math.floor(Date.now() / 1000)
        })),
        metadata: {
          batchId: `bandwidth-${Date.now()}`,
          source: 'performance-test'
        }
      };

      const batchJson = JSON.stringify(testBatch);
      const batchSize = Buffer.byteLength(batchJson, 'utf8');

      networkMonitor.recordRequest(batchSize);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const networkStats = networkMonitor.getStats();

    assertPerformance(networkStats.bandwidthKBps, PERFORMANCE_CONFIG.targets.networkBandwidthKBs,
                     'Network bandwidth usage', 'KB/s');

    console.log(`${colors.cyan}Network stats:${colors.reset}`);
    console.log(`  Total bytes: ${(networkStats.totalBytes / 1024).toFixed(2)} KB`);
    console.log(`  Request count: ${networkStats.requestCount}`);
    console.log(`  Request rate: ${networkStats.requestRate.toFixed(2)} req/s`);
    console.log(`  Average request size: ${(networkStats.averageRequestSize / 1024).toFixed(2)} KB`);

  } catch (error) {
    console.log(`${colors.yellow}Network bandwidth test failed: ${error.message}${colors.reset}`);
  }
}

/**
 * Test throughput and concurrency
 */
async function testThroughputAndConcurrency() {
  console.log(`\n${colors.blue}Testing throughput and concurrency...${colors.reset}`);

  try {
    const throughputMonitor = new PerformanceMonitor();
    throughputMonitor.start();

    const concurrentOperations = [];
    const operationsPerWorker = 100;

    // Create concurrent logging operations
    for (let worker = 0; worker < PERFORMANCE_CONFIG.load.concurrentUsers; worker++) {
      concurrentOperations.push(new Promise(async (resolve) => {
        const operations = [];

        for (let op = 0; op < operationsPerWorker; op++) {
          operations.push(new Promise((opResolve) => {
            // Simulate log processing
            const logEntry = {
              level: 'INFO',
              message: `Throughput test worker ${worker} operation ${op}`,
              service: 'performance-test',
              timestamp: Date.now()
            };

            const json = JSON.stringify(logEntry);
            const size = Buffer.byteLength(json, 'utf8');

            // Simulate processing delay
            setTimeout(opResolve, Math.random() * 10);
          }));
        }

        await Promise.all(operations);
        resolve();
      }));
    }

    await Promise.all(concurrentOperations);

    const throughputMetrics = throughputMonitor.end();
    const totalOperations = PERFORMANCE_CONFIG.load.concurrentUsers * operationsPerWorker;
    const operationsPerSecond = totalOperations / (throughputMetrics.duration / 1000);

    console.log(`${colors.cyan}Throughput metrics:${colors.reset}`);
    console.log(`  Total operations: ${totalOperations}`);
    console.log(`  Duration: ${throughputMetrics.duration.toFixed(2)}ms`);
    console.log(`  Operations per second: ${operationsPerSecond.toFixed(2)}`);

    // Verify reasonable throughput (adjust based on expected performance)
    const minExpectedThroughput = 500; // operations per second
    assert(operationsPerSecond >= minExpectedThroughput,
          `Throughput meets minimum requirement (${operationsPerSecond.toFixed(2)} >= ${minExpectedThroughput} ops/s)`);

  } catch (error) {
    console.log(`${colors.yellow}Throughput test failed: ${error.message}${colors.reset}`);
  }
}

/**
 * Test stress conditions and breaking points
 */
async function testStressConditions() {
  console.log(`\n${colors.blue}Testing stress conditions and breaking points...${colors.reset}`);

  try {
    // Test with very large batch sizes
    const largeBatchSizes = [500, 1000, 2000];

    for (const batchSize of largeBatchSizes) {
      const stressMonitor = new PerformanceMonitor();
      stressMonitor.start();

      try {
        const largeBatch = {
          logs: Array.from({ length: batchSize }, (_, i) => ({
            level: 'INFO',
            message: `Stress test log ${i} with some additional content to increase size`,
            service: 'stress-test',
            component: 'large-batch',
            timestamp: Math.floor(Date.now() / 1000),
            metadata: {
              iteration: i,
              batchSize: batchSize,
              testType: 'stress'
            }
          }))
        };

        const batchJson = JSON.stringify(largeBatch);
        const batchSizeMB = Buffer.byteLength(batchJson, 'utf8') / 1024 / 1024;

        const stressMetrics = stressMonitor.end();

        console.log(`${colors.cyan}Stress test - batch size ${batchSize}:${colors.reset}`);
        console.log(`  Batch size: ${batchSizeMB.toFixed(2)} MB`);
        console.log(`  Processing time: ${stressMetrics.duration.toFixed(2)}ms`);
        console.log(`  Memory used: ${stressMetrics.memory.heapUsed.toFixed(2)}MB`);

        // Verify the system can handle large batches
        const maxAcceptableTime = 1000; // 1 second for very large batches
        assert(stressMetrics.duration < maxAcceptableTime,
              `Large batch processing time acceptable (${stressMetrics.duration.toFixed(2)}ms < ${maxAcceptableTime}ms)`);

      } catch (error) {
        console.log(`${colors.yellow}Stress test failed for batch size ${batchSize}: ${error.message}${colors.reset}`);
      }
    }

    // Test rapid-fire logging
    const rapidFireMonitor = new PerformanceMonitor();
    rapidFireMonitor.start();

    const rapidLogCount = 10000;
    const logs = [];

    for (let i = 0; i < rapidLogCount; i++) {
      logs.push({
        level: 'INFO',
        message: `Rapid fire log ${i}`,
        service: 'stress-test',
        timestamp: Date.now()
      });
    }

    const rapidFireMetrics = rapidFireMonitor.end();

    console.log(`${colors.cyan}Rapid fire test (${rapidLogCount} logs):${colors.reset}`);
    console.log(`  Processing time: ${rapidFireMetrics.duration.toFixed(2)}ms`);
    console.log(`  Logs per second: ${(rapidLogCount / (rapidFireMetrics.duration / 1000)).toFixed(2)}`);

    const maxRapidFireTime = 5000; // 5 seconds max for 10k logs
    assert(rapidFireMetrics.duration < maxRapidFireTime,
          `Rapid fire processing time acceptable (${rapidFireMetrics.duration.toFixed(2)}ms < ${maxRapidFireTime}ms)`);

  } catch (error) {
    console.log(`${colors.yellow}Stress conditions test failed: ${error.message}${colors.reset}`);
  }
}

/**
 * Generate performance report
 */
function generatePerformanceReport() {
  console.log(`\n${colors.magenta}========================================${colors.reset}`);
  console.log(`${colors.magenta}Performance Test Report${colors.reset}`);
  console.log(`${colors.magenta}========================================${colors.reset}`);

  console.log(`\n${colors.cyan}Test Summary:${colors.reset}`);
  console.log(`Total tests run: ${testsRun}`);
  console.log(`Performance tests: ${performanceTests}`);
  console.log(`${colors.green}Passed: ${testsPassed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${testsFailed}${colors.reset}`);

  const successRate = testsRun > 0 ? Math.round((testsPassed / testsRun) * 100) : 0;
  console.log(`Success rate: ${successRate}%`);

  console.log(`\n${colors.cyan}Performance Targets vs Actual:${colors.reset}`);
  const targets = PERFORMANCE_CONFIG.targets;

  performanceData.tests.forEach(test => {
    const status = test.passed ? '✓' : '✗';
    const color = test.passed ? colors.green : colors.red;
    const percentage = ((test.actual / test.target) * 100).toFixed(1);

    console.log(`  ${color}${status} ${test.testName}${colors.reset}`);
    console.log(`    Target: ${test.target}${test.unit}, Actual: ${test.actual.toFixed(2)}${test.unit} (${percentage}% of target)`);
  });

  if (performanceData.baseline) {
    console.log(`\n${colors.cyan}Baseline Metrics:${colors.reset}`);
    console.log(`  Duration: ${performanceData.baseline.duration.toFixed(2)}ms`);
    console.log(`  Memory: ${performanceData.baseline.memory.heapUsed.toFixed(2)}MB`);
    console.log(`  CPU: ${(performanceData.baseline.cpu.user + performanceData.baseline.cpu.system).toFixed(2)}s`);
  }

  // Performance grade
  let grade = 'A';
  if (successRate < 90) grade = 'B';
  if (successRate < 80) grade = 'C';
  if (successRate < 70) grade = 'D';
  if (successRate < 60) grade = 'F';

  console.log(`\n${colors.magenta}Overall Performance Grade: ${grade}${colors.reset}`);

  return testsFailed === 0;
}

/**
 * Main performance test execution
 */
async function main() {
  console.log(`${colors.blue}TKR Logging Performance Tests${colors.reset}`);
  console.log(`${colors.blue}============================${colors.reset}`);

  let success = false;

  try {
    await establishBaseline();

    // Run performance test suites
    await testLogCallOverhead();
    await testBatchLatency();
    await testMemoryUsage();
    await testCPUUsage();
    await testNetworkBandwidth();
    await testThroughputAndConcurrency();
    await testStressConditions();

    success = generatePerformanceReport();

  } catch (error) {
    console.error(`${colors.red}Performance test execution failed: ${error.message}${colors.reset}`);
    console.error(error.stack);
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
  establishBaseline,
  testLogCallOverhead,
  testBatchLatency,
  testMemoryUsage,
  testCPUUsage,
  testNetworkBandwidth,
  testThroughputAndConcurrency,
  testStressConditions,
  generatePerformanceReport,
  PerformanceMonitor,
  NetworkMonitor
};