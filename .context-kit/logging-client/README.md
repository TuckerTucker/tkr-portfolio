# tkr-context-kit Logging Client

A lightweight client library for sending logs from external projects to the tkr-context-kit logging system.

The logging client is automatically included when you install tkr-context-kit via `./setup` and is available at `.context-kit/logging-client/`.

## Usage

### Basic Usage

```typescript
import { createTkrLogger } from './.context-kit/logging-client/index.js';

// Create a logger instance
const logger = createTkrLogger({
  service: 'MyApp',
  serviceType: 'backend' // frontend, backend, cli, etc.
});

// Log messages
logger.info('Application started');
logger.debug('Debug information', { userId: 123 });
logger.warn('Warning message');
logger.error('An error occurred', new Error('Something went wrong'));
logger.fatal('Fatal error', new Error('Critical failure'), { system: 'auth' });
```

### Advanced Configuration

```typescript
const logger = createTkrLogger({
  service: 'MyApp',
  serviceType: 'backend',
  baseUrl: 'http://localhost:42003', // Custom API URL
  defaultComponent: 'Main',           // Default component name
  failSilently: true,                 // Don't throw on logging errors
  logToConsole: true,                 // Also log to console
  minLevel: 'info'                    // Only send info and above
});
```

### Auto-Capture (Zero-Config Logging)

#### Global Auto-Initialization (Recommended)

Enable automatic logging for your entire project with a single import:

```javascript
// In your main entry file (index.js, app.js, server.js)
require('./.context-kit/logging-client/auto-init');

// That's it! All console.log calls are now automatically captured
console.log('This goes to both console AND tkr dashboard!');
console.error('Errors captured automatically');
```

Or use `-r` flag:
```bash
node -r ./.context-kit/logging-client/auto-init.js server.js
```

#### Manual Configuration

For custom configuration, create your own logger:

```typescript
import { createAutoTkrLogger } from './.context-kit/logging-client/index.js';

const logger = createAutoTkrLogger({
  service: 'MyApp',
  autoCapture: {
    console: true,          // Capture all console.log/warn/error calls
    unhandledErrors: true   // Capture uncaught exceptions and promises
  }
});

// Now ALL existing console.log calls are automatically captured
console.log('This goes to both console AND tkr dashboard!');
console.error('Errors captured automatically');
```

### Component-based Logging

```typescript
// Create child loggers for different components
const authLogger = logger.child('Auth');
const dbLogger = logger.child('Database');

authLogger.info('User logged in', { userId: 123 });
dbLogger.error('Connection failed', new Error('Timeout'));
```

### Error Handling

By default, the logger fails silently to prevent logging issues from crashing your application:

```typescript
// This won't throw even if the logging server is down
logger.info('Safe logging');

// To throw on errors, set failSilently to false
const strictLogger = createTkrLogger({
  service: 'MyApp',
  failSilently: false
});
```

## Requirements

- The tkr-context-kit API server must be running on port 42003
- Your project must be able to reach `http://localhost:42003`

## Log Levels

- `debug`: Detailed debugging information
- `info`: General informational messages
- `warn`: Warning messages
- `error`: Error messages (with optional Error object)
- `fatal`: Fatal errors that might cause application shutdown

## Viewing Logs

Access the logging dashboard at `http://localhost:42001#logs` to view all logs from integrated projects.

## Examples

### Express.js Integration

```typescript
import express from 'express';
import { createTkrLogger } from './.context-kit/logging-client/index.js';

const app = express();
const logger = createTkrLogger({ service: 'ExpressAPI', serviceType: 'backend' });

// Log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    method: req.method,
    path: req.path,
    ip: req.ip
  }, 'RequestHandler');
  next();
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Request failed', err, {
    method: req.method,
    path: req.path
  }, 'ErrorHandler');
  res.status(500).send('Internal Server Error');
});
```

### Express Auto-Capture

```typescript
import express from 'express';
import { createAutoTkrLogger } from './.context-kit/logging-client/index.js';

const app = express();
const logger = createAutoTkrLogger({
  service: 'ExpressAPI',
  serviceType: 'backend',
  autoCapture: {
    console: true,          // Capture console.log in routes
    unhandledErrors: true,  // Capture crashes
    express: true           // Enable Express middleware
  }
});

// Apply auto-capture middleware
const { requestLogger, errorHandler } = logger.createExpressMiddleware();
app.use(requestLogger);    // Automatic request/response logging
app.use(errorHandler);     // Automatic error logging

// All console.log calls are now automatically captured
app.get('/users', (req, res) => {
  console.log('Fetching users...');  // Automatically sent to tkr dashboard!
  res.json({ users: [] });
});
```

### React Integration

```typescript
import { createTkrLogger } from './.context-kit/logging-client/index.js';

const logger = createTkrLogger({ 
  service: 'ReactApp', 
  serviceType: 'frontend' 
});

// Log component lifecycle
function MyComponent() {
  const componentLogger = logger.child('MyComponent');
  
  useEffect(() => {
    componentLogger.info('Component mounted');
    return () => {
      componentLogger.info('Component unmounted');
    };
  }, []);
  
  // ... component logic
}
```

### Python Integration (using fetch API)

```python
import requests
import json
from datetime import datetime

class TkrLogger:
    def __init__(self, service, service_type='backend', base_url='http://localhost:42003'):
        self.service = service
        self.service_type = service_type
        self.base_url = base_url
    
    def log(self, level, message, metadata=None, component='Main'):
        try:
            requests.post(f'{self.base_url}/api/logs', json={
                'level': level.upper(),
                'message': message,
                'service': self.service,
                'service_type': self.service_type,
                'metadata': metadata or {},
                'component': component,
                'timestamp': int(datetime.now().timestamp())
            })
        except:
            pass  # Fail silently
    
    def info(self, message, metadata=None, component='Main'):
        self.log('info', message, metadata, component)
    
    def error(self, message, metadata=None, component='Main'):
        self.log('error', message, metadata, component)

# Usage
logger = TkrLogger('PythonApp')
logger.info('Application started')
logger.error('Database connection failed', {'host': 'localhost'})
```