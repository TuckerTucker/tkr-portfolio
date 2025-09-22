# TKR Context Kit - Consolidated Logging System

A comprehensive enterprise-grade logging solution that provides automatic log capture from browser console, terminal commands, and Node.js processes with minimal configuration required.

## Overview

The consolidated logging system is a complete ecosystem located in `.context-kit/logging-client/` that enables:

- **🌐 Browser Console Capture**: Automatic console interception with perfect passthrough
- **💻 Terminal Integration**: Project-aware command logging with shell functions
- **⚙️ Node.js Process Logging**: Automatic capture via NODE_OPTIONS with smart filtering
- **🔧 Build Tool Plugins**: Vite and Webpack plugins for automatic injection
- **📊 Real-time Monitoring**: Live log streaming with comprehensive analytics
- **🎛️ Centralized Configuration**: Single source of truth for all logging settings

## Consolidated Architecture

```
.context-kit/logging-client/          # 🎯 Everything in one place
├── browser/                          # Browser console client
├── shell/                            # Terminal logging scripts
├── plugins/                          # Build tool integrations
│   ├── vite/                        # Vite plugin
│   └── webpack/                     # Webpack plugin
├── node-options/                     # NODE_OPTIONS setup
├── config/                          # Centralized configuration
├── tests/                           # Integration test suite
├── installation-scripts/            # Setup automation
├── src/                             # Enhanced logging client
├── setup-logging.sh                 # Main setup script
└── logging-interfaces.json          # Interface specification
```

## Key Features

### 🔄 **Passthrough Design**
- Console output appears exactly as normal in browser DevTools
- Terminal commands display unchanged to the user
- Logging is an addition, not a replacement

### 🎯 **Project-Aware Activation**
- Only activates in directories with `.context-kit`
- Respects project boundaries
- No global system changes without consent

### ⚡ **Performance Optimized**
- < 1ms overhead per log call
- Intelligent batching and filtering
- Smart process detection
- Minimal memory footprint

### 🔧 **Zero Configuration**
- Works out of the box after setup
- Automatic build tool detection
- Smart defaults for all settings
- Environment variable overrides

## Quick Start

### 1. Complete Setup (Recommended)
```bash
# Run the comprehensive setup wizard
.context-kit/logging-client/setup-logging.sh

# Follow the interactive prompts for:
# - Terminal logging setup
# - Browser integration (Vite/Webpack)
# - NODE_OPTIONS configuration
```

### 2. Individual Component Setup

**Terminal Logging:**
```bash
.context-kit/logging-client/installation-scripts/enable-terminal.sh
```

**NODE_OPTIONS (Node.js processes):**
```bash
.context-kit/logging-client/installation-scripts/enable-node-options.sh
```

**Browser Integration:**
```javascript
// Vite projects
import tkrLogging from './.context-kit/logging-client/plugins/vite/index.js';

export default {
  plugins: [tkrLogging()]
}

// Webpack projects
const TkrLogging = require('./.context-kit/logging-client/plugins/webpack/index.js');

module.exports = {
  plugins: [new TkrLogging()]
}
```

## Component Details

### Browser Console Integration
- **Location**: `.context-kit/logging-client/browser/`
- **Features**: Console method interception, session tracking, batch sending
- **Served by**: Knowledge-graph API at `/api/logging-client.js`

### Terminal Shell Integration
- **Location**: `.context-kit/logging-client/shell/`
- **Features**: Command wrapping, project detection, output passthrough
- **Activation**: Source script in shell RC files

### Build Tool Plugins
- **Location**: `.context-kit/logging-client/plugins/`
- **Vite Plugin**: Automatic script injection via `transformIndexHtml`
- **Webpack Plugin**: Integration with `HtmlWebpackPlugin`

### NODE_OPTIONS Integration
- **Location**: `.context-kit/logging-client/node-options/`
- **Features**: Automatic Node.js process logging, smart filtering
- **Setup**: Environment variable configuration

### Configuration System
- **Location**: `.context-kit/logging-client/config/`
- **Features**: Centralized settings, environment overrides, validation
- **Files**: `defaults.json`, `schema.json`, `loader.js`, `validator.js`

### Installation Scripts
- **Location**: `.context-kit/logging-client/installation-scripts/`
- **Features**: Automated setup, build tool detection, validation
- **Scripts**: Terminal setup, NODE_OPTIONS config, verification

### Integration Tests
- **Location**: `.context-kit/logging-client/tests/`
- **Coverage**: All components, performance benchmarks, end-to-end workflows
- **Run**: `node .context-kit/logging-client/tests/run-all-tests.js`

## Environment Variables

All components respect the TKR_LOG_* environment variables:

```bash
# Core settings
export TKR_LOG_ENDPOINT="http://localhost:42003/api/logs"
export TKR_LOG_LEVEL="INFO"
export TKR_LOG_ENABLED="true"

# Batching configuration
export TKR_LOG_BATCH_SIZE="10"
export TKR_LOG_FLUSH_INTERVAL="5000"

# Behavior controls
export TKR_LOG_PROJECT_ONLY="true"
export TKR_LOG_FAIL_SILENTLY="true"

# Performance tuning
export TKR_LOG_PERFORMANCE_THRESHOLD="1000"
export TKR_LOG_MAX_RETRIES="3"
```

## API Endpoints

The knowledge-graph service provides enhanced logging endpoints:

- `GET /api/logs` - Retrieve logs with filtering
- `POST /api/logs` - Submit individual log entries
- `POST /api/logs/batch` - Submit batch log entries
- `GET /api/logs/stats` - Comprehensive log statistics
- `GET /api/logs/health` - Service health monitoring
- `GET /api/logging-client.js` - Serve browser client script

## Performance Targets

All components meet the following performance requirements:

- **Log Overhead**: < 1ms per log call
- **Batch Latency**: < 100ms to send batch
- **CPU Usage**: < 1% additional CPU
- **Memory Usage**: < 10MB additional memory
- **Network Bandwidth**: < 10KB/s average

## Troubleshooting

### Common Issues

**Logs not appearing:**
1. Check if `.context-kit` directory exists in project
2. Verify knowledge-graph service is running on port 42003
3. Check TKR_LOG_ENABLED environment variable

**Terminal logging not working:**
1. Restart terminal after installation
2. Check RC file markers: `grep -A5 -B5 "tkr-context-kit-logging" ~/.bashrc`
3. Verify script permissions: `ls -la ~/.context-kit/shell/tkr-logging.sh`

**Browser logging issues:**
1. Check browser console for script loading errors
2. Verify Vite/Webpack plugin configuration
3. Ensure development mode is enabled

### Verification Commands

```bash
# Test all components
.context-kit/logging-client/installation-scripts/verify-installation.sh

# Run comprehensive tests
.context-kit/logging-client/tests/run-all-tests.js

# Check configuration
node -e "console.log(require('./.context-kit/logging-client/config/loader').load())"
```

## Migration Notes

If upgrading from the previous scattered structure:

1. All components are now in `.context-kit/logging-client/`
2. Path references have been updated automatically
3. Interface specification moved to `logging-client/logging-interfaces.json`
4. Run setup script to validate new structure

## Related Documentation

- **Implementation Plan**: `.context-kit/_ref/logging-integration-plan.md`
- **API Reference**: `.context-kit/_ref/context-kit/logging/api-reference.md`
- **Usage Guide**: `.context-kit/_ref/context-kit/logging/usage-guide.md`
- **Interface Specification**: `.context-kit/logging-client/logging-interfaces.json`

---

**Status**: Production Ready ✅
**Last Updated**: September 2025
**Version**: 2.0.0 (Consolidated Structure)