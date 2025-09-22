# TKR Browser Logging Client

Browser-based logging client that intercepts console methods with perfect passthrough while sending logs to the TKR logging backend.

## Features

- **Perfect Console Passthrough**: Zero visible impact on DevTools console experience
- **Preserves Line Numbers**: Stack traces and source locations remain intact
- **Session Tracking**: Correlates logs across page reloads and tabs
- **Offline Support**: Queues logs when network is unavailable
- **Performance Monitoring**: Automatically disables if overhead exceeds 1ms
- **Error Capture**: Catches global errors and unhandled promise rejections
- **Batch Processing**: Efficiently batches logs before sending to reduce network overhead

## Files

- **`logging-client.js`** - Main client (requires SessionManager and BatchSender)
- **`logging-client-combined.js`** - Self-contained version with all dependencies
- **`logging-client.min.js`** - Minified version of main client
- **`session-manager.js`** - Session ID handling and persistence
- **`batch-sender.js`** - Batch queue management and network handling

## Quick Start

### Option 1: Combined Script (Recommended)
```html
<script src="http://localhost:42003/api/logging-client-combined.js"></script>
```

### Option 2: Individual Scripts
```html
<script src="session-manager.js"></script>
<script src="batch-sender.js"></script>
<script src="logging-client.js"></script>
```

## Usage

### Auto-Initialization
The client auto-initializes on:
- `localhost` or `127.0.0.1`
- URL contains `?tkr_logging=true`
- `localStorage.getItem('tkr_logging_enabled') === 'true'`

### Manual Initialization
```javascript
// Basic initialization
TkrLogging.init();

// Custom configuration
TkrLogging.init({
  endpoint: 'http://localhost:42003/api/logs/batch',
  batchSize: 20,
  flushInterval: 3000,
  captureErrors: true,
  sessionTracking: true,
  service: 'my-app',
  component: 'frontend'
});
```

### Manual Logging
```javascript
// Direct logging
TkrLogging.log('INFO', 'User clicked button', { userId: 123 });
TkrLogging.log('ERROR', 'API request failed', { endpoint: '/api/users' });

// Console methods are automatically intercepted
console.log('This will appear in DevTools AND be sent to logging backend');
console.error('Errors are captured with full stack traces');
```

### Control Methods
```javascript
// Flush pending logs immediately
await TkrLogging.flush();

// Temporarily disable logging
TkrLogging.disable();

// Re-enable logging
TkrLogging.enable();

// Get performance statistics
const stats = TkrLogging.getStats();
console.log(stats);

// Restore original console (removes interception)
TkrLogging.restore();
```

## Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `endpoint` | `http://localhost:42003/api/logs/batch` | Backend endpoint for log submission |
| `batchSize` | `10` | Number of logs to batch before sending |
| `flushInterval` | `5000` | Milliseconds between automatic flushes |
| `captureErrors` | `true` | Capture global errors and unhandled rejections |
| `sessionTracking` | `true` | Track session across page reloads |
| `performanceThreshold` | `1` | Max overhead in ms before disabling |
| `service` | `'browser'` | Service name for log entries |
| `component` | `'browser-console'` | Component name for log entries |

## Log Format

Logs are sent in this format:
```javascript
{
  level: 'INFO',           // DEBUG, INFO, WARN, ERROR, FATAL
  message: 'Log message',
  service: 'browser',
  component: 'browser-console',
  sessionId: 'uuid',
  traceId: 'uuid',
  timestamp: 1234567890,
  metadata: {
    source: 'console',
    method: 'log',
    stack: 'Error stack trace',
    url: 'https://example.com',
    userAgent: 'Mozilla/5.0...'
  }
}
```

## Performance Characteristics

- **Overhead**: < 1ms per log call (auto-disables if exceeded)
- **Memory**: < 10MB additional usage
- **Network**: Efficient batching reduces requests
- **CPU**: < 1% additional CPU usage

## Console Method Mapping

| Console Method | Log Level |
|----------------|-----------|
| `console.log()` | `INFO` |
| `console.info()` | `INFO` |
| `console.warn()` | `WARN` |
| `console.error()` | `ERROR` |
| `console.debug()` | `DEBUG` |
| `console.trace()` | `DEBUG` |

## Error Capture

The client automatically captures:
- **Global Errors**: `window.addEventListener('error')`
- **Unhandled Rejections**: `window.addEventListener('unhandledrejection')`
- **Console Errors**: Any `console.error()` calls

## Session Management

- **UUID Generation**: RFC 4122 compliant UUIDs
- **Persistence**: 24-hour session duration in localStorage
- **Tab Correlation**: Same session across browser tabs
- **Metadata**: Includes user agent, timezone, language, platform

## Offline Support

- **Automatic Detection**: Uses `navigator.onLine` and network events
- **Queue Management**: Stores up to 100 batches offline
- **Auto-Retry**: Processes offline queue when connection restored
- **Exponential Backoff**: Smart retry logic for failed requests

## Browser Compatibility

- **Modern Browsers**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **ES6 Features**: Arrow functions, template literals, classes
- **APIs Used**: `fetch`, `localStorage`, `performance.now()`, `AbortController`

## Development

The client includes debugging features:
```javascript
// Access internal client for debugging
const client = TkrLogging._client;

// Get detailed statistics
const stats = TkrLogging.getStats();
console.log('Performance:', stats.performance);
console.log('Session:', stats.session);
console.log('Batch queue:', stats.batch);
```

## Security Considerations

- **Endpoint Validation**: Only sends to configured endpoints
- **Message Truncation**: Limits message size to 10KB
- **Stack Trace Filtering**: Removes internal logging code from traces
- **Error Handling**: Graceful failure with no user impact

## Integration with TKR Context Kit

This client is part of the TKR Context Kit logging orchestration:
- **Backend**: Sends to Knowledge Graph API at port 42003
- **Dashboard**: Logs viewable in monitoring dashboard at port 42001
- **MCP Integration**: Logs accessible via Model Context Protocol
- **Shell Integration**: Correlates with terminal/shell logging