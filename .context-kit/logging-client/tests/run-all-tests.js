#!/usr/bin/env node

/**
 * TKR Logging Test Runner
 * Comprehensive test suite runner for all logging components
 *
 * Features:
 * - Runs all test suites in proper order
 * - Aggregates results across all test types
 * - Provides detailed reporting
 * - Supports CI/CD integration
 * - Handles test dependencies and cleanup
 */

const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const { fileURLToPath } = require('url');

// Configuration
const TEST_CONFIG = {
  timeout: 300000, // 5 minutes per test suite
  parallel: false, // Run tests sequentially by default
  cleanup: true,   // Clean up after tests
  verbose: false,  // Verbose output
  ci: false,       // CI mode
  exitOnFailure: true
};

// Test suite definitions
const TEST_SUITES = [
  {
    name: 'Terminal Logging',
    script: 'terminal.test.sh',
    type: 'shell',
    description: 'Shell logging functionality, project detection, batching',
    dependencies: ['../../shell/tkr-logging.sh', '../../shell/config.sh'],
    timeout: 60000
  },
  {
    name: 'Browser Client',
    script: 'browser.test.js',
    type: 'node',
    description: 'Browser console interception, session management, batch sending',
    dependencies: ['../../browser-client/logging-client.js'],
    timeout: 120000
  },
  {
    name: 'Vite Plugin',
    script: 'vite.test.js',
    type: 'node',
    description: 'Vite plugin HTML injection and middleware',
    dependencies: ['../../plugins/vite/index.js'],
    timeout: 90000
  },
  {
    name: 'Webpack Plugin',
    script: 'webpack.test.js',
    type: 'node',
    description: 'Webpack plugin HTML modification and build integration',
    dependencies: ['../../plugins/webpack/index.js'],
    timeout: 120000
  },
  {
    name: 'Integration Tests',
    script: 'integration.test.js',
    type: 'node',
    description: 'End-to-end workflows and component interaction',
    dependencies: ['All Wave 1 & 2 components'],
    timeout: 180000
  },
  {
    name: 'Performance Tests',
    script: 'performance.test.js',
    type: 'node',
    description: 'Performance benchmarks against specification targets',
    dependencies: ['All logging components'],
    timeout: 300000
  }
];

// Test results aggregation
let totalResults = {
  suites: [],
  totalTests: 0,
  totalPassed: 0,
  totalFailed: 0,
  totalSkipped: 0,
  startTime: null,
  endTime: null,
  duration: 0,
  success: false
};

// Console colors
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m',
  reset: '\x1b[0m'
};

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const config = { ...TEST_CONFIG };

  for (const arg of args) {
    switch (arg) {
      case '--ci':
        config.ci = true;
        config.verbose = false;
        config.parallel = false;
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--parallel':
        config.parallel = true;
        break;
      case '--no-cleanup':
        config.cleanup = false;
        break;
      case '--continue-on-failure':
        config.exitOnFailure = false;
        break;
      case '--help':
        printHelp();
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--timeout=')) {
          config.timeout = parseInt(arg.split('=')[1]) * 1000;
        } else if (arg.startsWith('--suite=')) {
          const suiteName = arg.split('=')[1];
          config.specificSuite = suiteName;
        } else {
          console.log(`${colors.yellow}Unknown argument: ${arg}${colors.reset}`);
        }
    }
  }

  return config;
}

/**
 * Print help information
 */
function printHelp() {
  console.log(`${colors.bold}TKR Logging Test Runner${colors.reset}`);
  console.log(`${colors.bold}======================${colors.reset}`);
  console.log();
  console.log('Usage: node run-all-tests.js [options]');
  console.log();
  console.log('Options:');
  console.log('  --ci                    Run in CI mode (non-interactive)');
  console.log('  --verbose               Enable verbose output');
  console.log('  --parallel              Run tests in parallel (experimental)');
  console.log('  --no-cleanup            Skip cleanup after tests');
  console.log('  --continue-on-failure   Continue running tests after failures');
  console.log('  --timeout=<seconds>     Set global timeout (default: 300)');
  console.log('  --suite=<name>          Run only specific test suite');
  console.log('  --help                  Show this help message');
  console.log();
  console.log('Available test suites:');
  TEST_SUITES.forEach(suite => {
    console.log(`  ${suite.name.padEnd(20)} - ${suite.description}`);
  });
}

/**
 * Check test dependencies
 */
async function checkDependencies(suite) {
  const missing = [];

  for (const dep of suite.dependencies) {
    if (dep === 'All Wave 1 & 2 components' || dep === 'All logging components') {
      continue; // Skip meta-dependencies
    }

    const depPath = path.join(__dirname, dep);
    if (!fs.existsSync(depPath)) {
      missing.push(dep);
    }
  }

  return missing;
}

/**
 * Run a shell test suite
 */
function runShellTest(suite, config) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, suite.script);
    const startTime = Date.now();

    if (!fs.existsSync(scriptPath)) {
      resolve({
        name: suite.name,
        success: false,
        error: 'Test script not found',
        duration: 0,
        output: '',
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      });
      return;
    }

    const child = spawn('bash', [scriptPath], {
      stdio: 'pipe',
      env: { ...process.env, CI: config.ci ? 'true' : 'false' }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (config.verbose) {
        process.stdout.write(text);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      if (config.verbose) {
        process.stderr.write(text);
      }
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      // Parse test results from output
      const testResults = parseShellTestOutput(output);

      resolve({
        name: suite.name,
        success,
        exitCode: code,
        duration,
        output,
        errorOutput,
        ...testResults
      });
    });

    child.on('error', (error) => {
      resolve({
        name: suite.name,
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        output,
        errorOutput,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      });
    });

    // Set timeout
    setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, suite.timeout || config.timeout);
  });
}

/**
 * Run a Node.js test suite
 */
function runNodeTest(suite, config) {
  return new Promise((resolve) => {
    const scriptPath = path.join(__dirname, suite.script);
    const startTime = Date.now();

    if (!fs.existsSync(scriptPath)) {
      resolve({
        name: suite.name,
        success: false,
        error: 'Test script not found',
        duration: 0,
        output: '',
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      });
      return;
    }

    const child = spawn('node', [scriptPath], {
      stdio: 'pipe',
      env: { ...process.env, CI: config.ci ? 'true' : 'false' }
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      if (config.verbose) {
        process.stdout.write(text);
      }
    });

    child.stderr.on('data', (data) => {
      const text = data.toString();
      errorOutput += text;
      if (config.verbose) {
        process.stderr.write(text);
      }
    });

    child.on('close', (code) => {
      const duration = Date.now() - startTime;
      const success = code === 0;

      // Parse test results from output
      const testResults = parseNodeTestOutput(output);

      resolve({
        name: suite.name,
        success,
        exitCode: code,
        duration,
        output,
        errorOutput,
        ...testResults
      });
    });

    child.on('error', (error) => {
      resolve({
        name: suite.name,
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        output,
        errorOutput,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      });
    });

    // Set timeout
    setTimeout(() => {
      child.kill('SIGTERM');
      setTimeout(() => child.kill('SIGKILL'), 5000);
    }, suite.timeout || config.timeout);
  });
}

/**
 * Parse shell test output for statistics
 */
function parseShellTestOutput(output) {
  const lines = output.split('\n');
  let tests = 0, passed = 0, failed = 0, skipped = 0;

  for (const line of lines) {
    if (line.includes('Total tests run:')) {
      const match = line.match(/Total tests run:\s*(\d+)/);
      if (match) tests = parseInt(match[1]);
    }
    if (line.includes('Passed:')) {
      const match = line.match(/Passed:\s*(\d+)/);
      if (match) passed = parseInt(match[1]);
    }
    if (line.includes('Failed:')) {
      const match = line.match(/Failed:\s*(\d+)/);
      if (match) failed = parseInt(match[1]);
    }
    if (line.includes('✓')) {
      // Count individual test passes if no summary found
      if (tests === 0) passed++;
    }
    if (line.includes('✗')) {
      // Count individual test failures if no summary found
      if (tests === 0) failed++;
    }
  }

  // Calculate total if not explicitly provided
  if (tests === 0) {
    tests = passed + failed + skipped;
  }

  return { tests, passed, failed, skipped };
}

/**
 * Parse Node.js test output for statistics
 */
function parseNodeTestOutput(output) {
  const lines = output.split('\n');
  let tests = 0, passed = 0, failed = 0, skipped = 0;

  for (const line of lines) {
    if (line.includes('Total tests run:')) {
      const match = line.match(/Total tests run:\s*(\d+)/);
      if (match) tests = parseInt(match[1]);
    }
    if (line.includes('Passed:')) {
      const match = line.match(/Passed:\s*(\d+)/);
      if (match) passed = parseInt(match[1]);
    }
    if (line.includes('Failed:')) {
      const match = line.match(/Failed:\s*(\d+)/);
      if (match) failed = parseInt(match[1]);
    }
    if (line.includes('✓')) {
      // Count individual test passes if no summary found
      if (tests === 0) passed++;
    }
    if (line.includes('✗')) {
      // Count individual test failures if no summary found
      if (tests === 0) failed++;
    }
  }

  // Calculate total if not explicitly provided
  if (tests === 0) {
    tests = passed + failed + skipped;
  }

  return { tests, passed, failed, skipped };
}

/**
 * Print test progress
 */
function printProgress(current, total, suiteName) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.round(percentage / 5)) + '░'.repeat(20 - Math.round(percentage / 5));

  process.stdout.write(`\r${colors.cyan}[${bar}] ${percentage}% - Running: ${suiteName}${colors.reset}`);

  if (current === total) {
    process.stdout.write('\n');
  }
}

/**
 * Run all test suites
 */
async function runAllTests(config) {
  totalResults.startTime = Date.now();

  console.log(`${colors.bold}TKR Logging Test Suite${colors.reset}`);
  console.log(`${colors.bold}=====================${colors.reset}`);
  console.log();

  if (config.ci) {
    console.log(`${colors.blue}Running in CI mode${colors.reset}`);
  }

  // Filter test suites if specific suite requested
  let suitesToRun = TEST_SUITES;
  if (config.specificSuite) {
    suitesToRun = TEST_SUITES.filter(suite =>
      suite.name.toLowerCase().includes(config.specificSuite.toLowerCase())
    );

    if (suitesToRun.length === 0) {
      console.log(`${colors.red}No test suite found matching: ${config.specificSuite}${colors.reset}`);
      process.exit(1);
    }
  }

  console.log(`Running ${suitesToRun.length} test suite(s):\n`);

  // Check dependencies
  for (const suite of suitesToRun) {
    const missing = await checkDependencies(suite);
    if (missing.length > 0) {
      console.log(`${colors.yellow}Warning: ${suite.name} has missing dependencies:${colors.reset}`);
      missing.forEach(dep => console.log(`  - ${dep}`));
    }
  }

  console.log();

  // Run test suites
  for (let i = 0; i < suitesToRun.length; i++) {
    const suite = suitesToRun[i];

    if (!config.verbose) {
      printProgress(i, suitesToRun.length, suite.name);
    } else {
      console.log(`${colors.blue}Running ${suite.name}...${colors.reset}`);
    }

    let result;
    try {
      if (suite.type === 'shell') {
        result = await runShellTest(suite, config);
      } else {
        result = await runNodeTest(suite, config);
      }
    } catch (error) {
      result = {
        name: suite.name,
        success: false,
        error: error.message,
        duration: 0,
        tests: 0,
        passed: 0,
        failed: 1,
        skipped: 0
      };
    }

    totalResults.suites.push(result);
    totalResults.totalTests += result.tests;
    totalResults.totalPassed += result.passed;
    totalResults.totalFailed += result.failed;
    totalResults.totalSkipped += result.skipped;

    // Print immediate result
    const status = result.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const duration = `${(result.duration / 1000).toFixed(2)}s`;

    if (config.verbose || !result.success) {
      console.log(`${status} ${suite.name} (${duration}) - ${result.passed}/${result.tests} passed`);

      if (!result.success && result.error) {
        console.log(`  Error: ${result.error}`);
      }
    }

    // Exit early on failure if configured
    if (!result.success && config.exitOnFailure) {
      console.log(`\n${colors.red}Test suite failed, exiting early${colors.reset}`);
      break;
    }
  }

  if (!config.verbose) {
    printProgress(suitesToRun.length, suitesToRun.length, 'Complete');
  }

  totalResults.endTime = Date.now();
  totalResults.duration = totalResults.endTime - totalResults.startTime;
  totalResults.success = totalResults.totalFailed === 0;
}

/**
 * Print comprehensive test results
 */
function printResults() {
  console.log(`\n${colors.bold}Test Results Summary${colors.reset}`);
  console.log(`${colors.bold}===================${colors.reset}`);

  console.log(`\nOverall Results:`);
  console.log(`  Total test suites: ${totalResults.suites.length}`);
  console.log(`  Total tests: ${totalResults.totalTests}`);
  console.log(`  ${colors.green}Passed: ${totalResults.totalPassed}${colors.reset}`);
  console.log(`  ${colors.red}Failed: ${totalResults.totalFailed}${colors.reset}`);
  console.log(`  ${colors.yellow}Skipped: ${totalResults.totalSkipped}${colors.reset}`);
  console.log(`  Duration: ${(totalResults.duration / 1000).toFixed(2)}s`);

  const successRate = totalResults.totalTests > 0
    ? Math.round((totalResults.totalPassed / totalResults.totalTests) * 100)
    : 0;
  console.log(`  Success rate: ${successRate}%`);

  console.log(`\nSuite Breakdown:`);
  totalResults.suites.forEach(suite => {
    const status = suite.success ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    const duration = `${(suite.duration / 1000).toFixed(2)}s`;
    const rate = suite.tests > 0 ? `${Math.round((suite.passed / suite.tests) * 100)}%` : 'N/A';

    console.log(`  ${status} ${suite.name.padEnd(20)} ${duration.padStart(8)} ${rate.padStart(6)} (${suite.passed}/${suite.tests})`);
  });

  // Performance summary if available
  const performanceSuite = totalResults.suites.find(s => s.name === 'Performance Tests');
  if (performanceSuite && performanceSuite.success) {
    console.log(`\n${colors.cyan}Performance Summary:${colors.reset}`);
    console.log(`  All performance targets met ✓`);
  }

  if (totalResults.success) {
    console.log(`\n${colors.green}${colors.bold}🎉 All tests passed!${colors.reset}`);
  } else {
    console.log(`\n${colors.red}${colors.bold}❌ Some tests failed${colors.reset}`);

    // Show failed suites
    const failedSuites = totalResults.suites.filter(s => !s.success);
    if (failedSuites.length > 0) {
      console.log(`\nFailed suites:`);
      failedSuites.forEach(suite => {
        console.log(`  ${colors.red}• ${suite.name}${colors.reset}`);
        if (suite.error) {
          console.log(`    Error: ${suite.error}`);
        }
      });
    }
  }
}

/**
 * Clean up after tests
 */
async function cleanup(config) {
  if (!config.cleanup) {
    return;
  }

  console.log(`\n${colors.blue}Cleaning up...${colors.reset}`);

  try {
    // Clean up temp directories
    const tempDirs = ['temp', 'output', '.tmp'];

    for (const dir of tempDirs) {
      const dirPath = path.join(__dirname, dir);
      if (fs.existsSync(dirPath)) {
        await fs.promises.rm(dirPath, { recursive: true, force: true });
      }
    }

    // Kill any remaining processes
    try {
      exec('pkill -f "tkr-logging" || true');
      exec('pkill -f "mock.*server" || true');
    } catch (error) {
      // Ignore cleanup errors
    }

    console.log(`${colors.green}Cleanup completed${colors.reset}`);

  } catch (error) {
    console.log(`${colors.yellow}Cleanup warning: ${error.message}${colors.reset}`);
  }
}

/**
 * Generate JUnit XML report for CI
 */
function generateJUnitReport() {
  if (!totalResults.suites.length) return;

  const xml = [];
  xml.push('<?xml version="1.0" encoding="UTF-8"?>');
  xml.push(`<testsuites name="TKR Logging Tests" tests="${totalResults.totalTests}" failures="${totalResults.totalFailed}" time="${totalResults.duration / 1000}">`);

  totalResults.suites.forEach(suite => {
    xml.push(`  <testsuite name="${suite.name}" tests="${suite.tests}" failures="${suite.failed}" time="${suite.duration / 1000}">`);

    // Add individual test cases (simplified)
    for (let i = 0; i < suite.passed; i++) {
      xml.push(`    <testcase name="${suite.name} Test ${i + 1}" classname="${suite.name}"/>`);
    }

    for (let i = 0; i < suite.failed; i++) {
      xml.push(`    <testcase name="${suite.name} Test ${suite.passed + i + 1}" classname="${suite.name}">`);
      xml.push(`      <failure message="Test failed">${suite.errorOutput || 'Test failed'}</failure>`);
      xml.push(`    </testcase>`);
    }

    xml.push('  </testsuite>');
  });

  xml.push('</testsuites>');

  const reportPath = path.join(__dirname, 'test-results.xml');
  fs.writeFileSync(reportPath, xml.join('\n'));

  console.log(`\nJUnit report written to: ${reportPath}`);
}

/**
 * Main execution
 */
async function main() {
  const config = parseArguments();

  try {
    await runAllTests(config);
    printResults();

    if (config.ci) {
      generateJUnitReport();
    }

    await cleanup(config);

    // Exit with appropriate code
    process.exit(totalResults.success ? 0 : 1);

  } catch (error) {
    console.error(`\n${colors.red}Test runner failed: ${error.message}${colors.reset}`);
    console.error(error.stack);

    await cleanup(config);
    process.exit(1);
  }
}

// Handle interruption
process.on('SIGINT', async () => {
  console.log(`\n${colors.yellow}Test run interrupted${colors.reset}`);
  await cleanup(parseArguments());
  process.exit(130);
});

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  parseArguments,
  TEST_SUITES,
  totalResults
};