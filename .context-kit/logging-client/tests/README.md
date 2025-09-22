# TKR Logging Integration Tests

Comprehensive integration test suite for the TKR Context Kit logging system. This test suite validates all Wave 1 & 2 components and ensures compliance with the interface specification.

## Overview

The test suite consists of 6 comprehensive test modules that validate:

- **Terminal Tests** (`terminal.test.sh`) - Shell logging functionality
- **Browser Tests** (`browser.test.js`) - Browser client functionality
- **Vite Plugin Tests** (`vite.test.js`) - Vite plugin integration
- **Webpack Plugin Tests** (`webpack.test.js`) - Webpack plugin integration
- **Integration Tests** (`integration.test.js`) - End-to-end workflows
- **Performance Tests** (`performance.test.js`) - Performance benchmarks

## Performance Targets

All tests validate against these specification targets:

- **Log overhead**: < 1ms per log call
- **Batch latency**: < 100ms to send batch
- **CPU usage**: < 1% additional CPU
- **Memory usage**: < 10MB additional memory
- **Network bandwidth**: < 10KB/s average

## Quick Start

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run specific test suite
npm run test:terminal
npm run test:browser
npm run test:vite
npm run test:webpack
npm run test:integration
npm run test:performance

# Quick smoke test
npm run test:quick
```

## Test Runner Options

The main test runner supports various options:

```bash
# Basic usage
node run-all-tests.js

# CI mode (non-interactive)
node run-all-tests.js --ci

# Verbose output
node run-all-tests.js --verbose

# Continue on failure
node run-all-tests.js --continue-on-failure

# Run specific suite
node run-all-tests.js --suite=browser

# Custom timeout (seconds)
node run-all-tests.js --timeout=600

# Parallel execution (experimental)
node run-all-tests.js --parallel

# Skip cleanup
node run-all-tests.js --no-cleanup
```

## Test Suite Details

### Terminal Tests (`terminal.test.sh`)

Tests the shell logging functionality including:

- Project detection (`.context-kit` awareness)
- Configuration loading and validation
- Log level filtering
- Batch system functionality
- Command wrapping and monitoring
- Performance overhead validation
- Environment variable handling
- Shell integration functions

**Dependencies**: `../../shell/tkr-logging.sh`, `../../shell/config.sh`

**Performance Tests**: Log call overhead, project detection speed, batch processing

### Browser Tests (`browser.test.js`)

Tests the browser client functionality including:

- Console interception with perfect passthrough
- Session management across page reloads
- Batch sending with retry logic
- Performance monitoring and thresholds
- Error capture (global errors, unhandled rejections)
- API compliance with interface specification
- Browser compatibility across environments
- Memory leak prevention

**Dependencies**: `../../browser-client/logging-client.js`

**Performance Tests**: Console overhead, batch latency, memory usage

### Vite Plugin Tests (`vite.test.js`)

Tests the Vite plugin functionality including:

- Plugin registration and configuration
- HTML injection at different positions
- Development server middleware setup
- Hot module replacement integration
- Build process integration
- Configuration validation
- Error handling and graceful degradation
- Multi-environment compatibility

**Dependencies**: `../../plugins/vite/index.js`

**Integration Tests**: HTML modification, middleware endpoints, build process

### Webpack Plugin Tests (`webpack.test.js`)

Tests the Webpack plugin functionality including:

- Plugin registration and configuration
- HTML modification through HtmlWebpackPlugin hooks
- Build process integration
- Loader functionality
- Chunk-specific injection
- Development vs production behavior
- Error handling and graceful degradation
- Multi-environment compatibility

**Dependencies**: `../../plugins/webpack/index.js`

**Integration Tests**: HTML modification, build hooks, chunk handling

### Integration Tests (`integration.test.js`)

Tests full system end-to-end workflows including:

- API contract compliance (interface specification)
- Real backend integration
- Browser to backend data flow
- Terminal to backend integration
- Plugin integration workflows
- Data integrity across components
- Error handling and recovery
- Installation/uninstallation workflows
- Multi-environment compatibility

**Dependencies**: All Wave 1 & 2 components

**End-to-End Tests**: Complete data flow, cross-component communication

### Performance Tests (`performance.test.js`)

Comprehensive performance validation including:

- Individual component performance
- System-wide performance under load
- Memory leak detection
- CPU usage monitoring
- Network bandwidth measurement
- Latency and throughput benchmarks
- Stress testing and breaking points
- Performance regression detection

**Dependencies**: All logging components

**Benchmarks**: All specification targets validated

## CI/CD Integration

The test suite supports CI/CD environments:

```bash
# CI mode with JUnit XML output
npm run test:ci

# Generate JUnit report
node run-all-tests.js --ci
# Outputs: test-results.xml
```

### GitHub Actions Example

```yaml
name: TKR Logging Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd .context-kit/tests/logging
          npm install
      - name: Run tests
        run: |
          cd .context-kit/tests/logging
          npm run test:ci
      - name: Upload test results
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: .context-kit/tests/logging/test-results.xml
```

## Development

### Running Individual Components

Each test can be run independently:

```bash
# Terminal tests (requires bash)
bash terminal.test.sh

# Node.js tests
node browser.test.js
node vite.test.js
node webpack.test.js
node integration.test.js
node performance.test.js
```

### Mock Server

Tests include a mock logging server for isolated testing:

- **Port**: 42998 (browser tests), 42999 (terminal tests)
- **Endpoints**: `/api/logs/batch`, `/health`, `/api/logging-client.js`
- **Auto-cleanup**: Automatically started/stopped with tests

### Test Environment

Tests create temporary environments:

- **Temp directories**: `temp/`, `output/`
- **Mock projects**: Created with `.context-kit` directories
- **Browser instances**: Headless Puppeteer instances
- **Build artifacts**: Memory-based for Webpack/Vite tests

### Adding New Tests

To add a new test suite:

1. Create test file (`.js` for Node.js, `.sh` for shell)
2. Add to `TEST_SUITES` array in `run-all-tests.js`
3. Include npm script in `package.json`
4. Update this README

Test structure should include:

```javascript
// Test counters
let testsRun = 0;
let testsPassed = 0;
let testsFailed = 0;

// Assertion helpers
function assertEquals(expected, actual, testName) { ... }
function assertTrue(condition, testName) { ... }

// Test suites
async function testFeatureX() { ... }

// Main execution
async function main() {
  // Run test suites
  // Print results
  // Return success/failure
}

if (require.main === module) {
  main().then(success => process.exit(success ? 0 : 1));
}
```

## Troubleshooting

### Common Issues

**Tests timeout**
- Increase timeout: `--timeout=600`
- Check for hanging processes
- Verify dependencies are available

**Port conflicts**
- Mock servers use specific ports
- Kill existing processes: `pkill -f "mock.*server"`
- Check port availability: `netstat -tulpn | grep 429`

**Missing dependencies**
- Install: `npm install`
- Check component paths in dependencies
- Verify Wave 1 & 2 components exist

**Browser tests fail**
- Install Puppeteer dependencies: `sudo apt-get install -y gconf-service ...`
- Run in headful mode for debugging
- Check console output for errors

**Performance tests fail**
- System under load may affect results
- Run on dedicated test environment
- Adjust targets for slower systems

### Debug Mode

For detailed debugging:

```bash
# Verbose output
npm run test:verbose

# Keep temp files
node run-all-tests.js --no-cleanup --verbose

# Single suite with full output
node run-all-tests.js --suite=browser --verbose
```

### Log Analysis

Tests generate detailed logs:

- **Console output**: Real-time test progress
- **temp/**: Temporary test artifacts
- **output/**: Test output files
- **test-results.xml**: JUnit format (CI mode)

## Architecture

The test suite follows a modular architecture:

```
tests/logging/
├── run-all-tests.js    # Main test runner
├── package.json        # Dependencies and scripts
├── terminal.test.sh    # Shell tests
├── browser.test.js     # Browser client tests
├── vite.test.js        # Vite plugin tests
├── webpack.test.js     # Webpack plugin tests
├── integration.test.js # End-to-end tests
├── performance.test.js # Performance benchmarks
└── README.md          # This file
```

Each test module is self-contained with:

- **Setup/teardown**: Environment management
- **Assertions**: Standardized test helpers
- **Test suites**: Grouped functionality tests
- **Results**: Consistent output format
- **Error handling**: Graceful failure modes

## Interface Compliance

All tests validate against the interface specification in `../../_specs/logging-interfaces.json`:

- **Log format**: Required and optional fields
- **Batch format**: Structure and limits
- **Environment variables**: All specified variables
- **Browser API**: Global methods and behavior
- **Shell API**: Function contracts
- **Plugin APIs**: Vite and Webpack integration
- **Performance targets**: All benchmarks

## Contributing

When contributing tests:

1. Follow existing patterns and naming
2. Include comprehensive assertions
3. Test both success and failure cases
4. Validate performance where applicable
5. Update documentation
6. Ensure CI compatibility

Tests should be:

- **Isolated**: No dependencies between tests
- **Deterministic**: Same input = same output
- **Fast**: Complete within reasonable time
- **Comprehensive**: Cover all code paths
- **Clear**: Descriptive test names and output

---

For questions or issues with the test suite, please see the main project documentation or create an issue.