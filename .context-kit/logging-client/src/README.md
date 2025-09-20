# Enhanced Logging Client

This directory contains enhanced logging capabilities for the tkr-context-kit that provide smart process detection, intelligent filtering, efficient batching, and rich metadata enrichment for Node.js environments.

## Components

### 1. `process-detector.js` - Process Type Detection
- **Purpose**: Analyzes the current Node.js process to determine type and characteristics
- **Features**:
  - Detects process types: npm, yarn, node, dev-server, test-runner, build-tool, etc.
  - Identifies development vs production environments
  - Handles child process detection
  - Auto-generates service names based on process type
  - Smart filtering recommendations

```javascript
const { getProcessDetector } = require('./process-detector');
const detector = getProcessDetector();
console.log(detector.getProcessInfo());
```

### 2. `filter-manager.js` - Intelligent Log Filtering
- **Purpose**: Reduces noise by filtering out irrelevant logs while preserving important information
- **Features**:
  - Node modules filtering
  - Build tool noise reduction
  - Development-specific filtering
  - Project-only mode
  - Configurable skip/allow patterns
  - Multiple preset configurations

```javascript
const { FilterManager } = require('./filter-manager');
const filter = FilterManager.createPreset('development');
const shouldFilter = filter.shouldFilter('info', 'webpack compiled successfully');
```

### 3. `batch-manager.js` - Efficient Log Batching
- **Purpose**: Batches logs efficiently to avoid blocking and reduce network overhead
- **Features**:
  - Configurable batch sizes and flush intervals
  - Retry logic with exponential backoff
  - Memory management and leak prevention
  - Graceful shutdown handling
  - Compression support for large payloads
  - Fallback mechanisms

```javascript
const { BatchManager } = require('./batch-manager');
const batch = BatchManager.createFromEnvironment();
batch.add(logData);
```

### 4. `metadata-enricher.js` - Context Enhancement
- **Purpose**: Adds rich context information to logs for better debugging and monitoring
- **Features**:
  - Process information (PID, type, command)
  - Environment variables (filtered for security)
  - Git information (branch, commit, status)
  - Package.json details
  - Performance metrics (memory, CPU)
  - Stack traces for errors
  - Request and correlation IDs

```javascript
const { MetadataEnricher } = require('./metadata-enricher');
const enricher = MetadataEnricher.createPreset('development');
const enriched = enricher.enrichMetadata(metadata, 'info', 'message', 'component');
```

### 5. `auto-init-enhanced.js` - Enhanced Auto-Initialization
- **Purpose**: Smart auto-initialization with all enhanced features
- **Features**:
  - Environment-based configuration
  - Automatic process detection and filtering
  - Integrated batching and enrichment
  - Graceful error handling
  - Statistics tracking
  - Global logger access

## Usage

### Method 1: Auto-initialization via NODE_OPTIONS (Recommended)
```bash
export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
node your-app.js
```

### Method 2: Manual initialization
```javascript
const enhancedLogger = require('.context-kit/logging-client/src/auto-init-enhanced.js');

if (enhancedLogger) {
  enhancedLogger.info('Application started');
  enhancedLogger.error('Something went wrong', new Error('Details'));

  const authLogger = enhancedLogger.child('Authentication');
  authLogger.info('User login', { userId: '12345' });
}
```

### Method 3: Direct component usage
```javascript
const { getProcessDetector } = require('./process-detector');
const { FilterManager } = require('./filter-manager');
const { BatchManager } = require('./batch-manager');
const { MetadataEnricher } = require('./metadata-enricher');

// Use components individually
```

## Environment Variables

### Basic Configuration
```bash
export TKR_LOG_LEVEL=info                    # debug, info, warn, error, fatal
export TKR_LOG_URL=http://localhost:42003    # Logging endpoint URL
export TKR_LOG_TO_CONSOLE=true               # Also log to console
export TKR_LOG_SILENT_INIT=false             # Show initialization message
```

### Filtering Configuration
```bash
export TKR_LOG_FILTER_PRESET=development     # minimal, development, production, strict, debug
export TKR_LOG_PROJECT_ONLY=true             # Only log project files
export TKR_LOG_FILTER_NODE_MODULES=true      # Filter node_modules noise
export TKR_LOG_FILTER_BUILD_TOOLS=true       # Filter build tool noise
export TKR_LOG_FILTER_DEV_NOISE=true         # Filter development noise
```

### Batching Configuration
```bash
export TKR_LOG_BATCH_SIZE=10                 # Number of logs per batch
export TKR_LOG_FLUSH_INTERVAL=5000           # Flush interval in ms
export TKR_LOG_MAX_RETRIES=3                 # Max retry attempts
export TKR_LOG_COMPRESSION=true              # Enable compression
export TKR_LOG_FALLBACK=true                 # Fallback to console
export TKR_LOG_DROP_ON_FAILURE=false         # Drop logs on final failure
```

### Metadata Enrichment Configuration
```bash
export TKR_LOG_METADATA_PRESET=development   # minimal, development, production, performance
export TKR_LOG_INCLUDE_GIT=true              # Include git information
export TKR_LOG_INCLUDE_PACKAGE=true          # Include package.json info
export TKR_LOG_INCLUDE_PERFORMANCE=true      # Include performance metrics
export TKR_LOG_INCLUDE_STACK=true            # Include stack traces for errors
```

### Auto-capture Features
```bash
export TKR_LOG_CAPTURE_CONSOLE=true          # Capture console.log/warn/error
export TKR_LOG_CAPTURE_ERRORS=true           # Capture unhandled errors
export TKR_LOG_CAPTURE_EXPRESS=true          # Express.js middleware
export TKR_LOG_CAPTURE_REACT=true            # React error boundaries
```

### Debug and Monitoring
```bash
export TKR_LOG_STATS_ENDPOINT=true           # Enable stats logging
export TKR_LOG_STATS_INTERVAL=30000          # Stats logging interval
export TKR_LOG_VERBOSE_INIT=true             # Verbose initialization
```

## Filter Presets

### minimal
- Only filters obvious noise (node_modules)
- Minimal performance impact

### development (default)
- Filters node_modules, build tools, and development noise
- Balanced filtering for clean development logs

### production
- Minimal filtering to preserve all important information
- Security-focused environment variable filtering

### strict
- Heavy filtering for very clean logs
- Project-only mode enabled
- Higher minimum log level

### debug
- No filtering except explicit skips
- All debug information preserved

## Metadata Enrichment Presets

### minimal
- Basic process information only
- Fastest performance

### development (default)
- Full context including git, package, and performance info
- Best for debugging

### production
- Security-focused with filtered environment variables
- Includes git and package info but not performance metrics

### performance
- Optimized for minimal overhead
- Cached git and package information

## Architecture

The enhanced logging client follows a modular architecture:

1. **Process Detection**: Identifies the current process type and characteristics
2. **Filtering**: Intelligently filters out noise based on configurable rules
3. **Enrichment**: Adds rich metadata context to each log entry
4. **Batching**: Efficiently batches and sends logs to the backend
5. **Auto-initialization**: Ties everything together with smart defaults

## Backward Compatibility

The enhanced logging client maintains full backward compatibility with the existing TkrLogger class. All existing logging code will continue to work without modification.

## Performance Considerations

- **Memory**: Batch manager includes memory monitoring and leak prevention
- **CPU**: Metadata enrichment uses caching to minimize overhead
- **Network**: Batching reduces HTTP requests and includes compression
- **Filtering**: Early filtering prevents unnecessary processing

## Error Handling

- Graceful degradation when backend is unavailable
- Fallback to console logging
- Retry logic with exponential backoff
- Prevents logging errors from crashing applications

## Testing

Run the test suite:
```bash
cd .context-kit/logging-client
node src/test-enhanced.js
```

## Integration Examples

### Express.js Application
```bash
export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
export TKR_LOG_CAPTURE_EXPRESS=true
export TKR_LOG_FILTER_PRESET=production
node server.js
```

### Development Environment
```bash
export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
export TKR_LOG_FILTER_PRESET=development
export TKR_LOG_VERBOSE_INIT=true
npm run dev
```

### CI/CD Pipeline
```bash
export NODE_OPTIONS="--require .context-kit/logging-client/src/auto-init-enhanced.js"
export TKR_LOG_FILTER_PRESET=strict
export TKR_LOG_LEVEL=warn
export TKR_LOG_SILENT_INIT=true
npm test
```