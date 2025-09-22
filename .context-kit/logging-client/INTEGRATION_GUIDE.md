# tkr-context-kit Logging Integration Guide

This guide explains how to integrate any project with the tkr-context-kit logging system.

## Setup

1. **Install tkr-context-kit** (if not already done):
   ```bash
   # Run the setup script from the tkr-context-kit directory
   ./setup
   ```

2. **Start the logging system**:
   ```bash
   cd .context-kit/knowledge-graph
   npm install  # Install dependencies if needed
   npm run serve  # Start API server on port 42003
   ```

3. **Verify the system is running**:
   ```bash
   curl http://localhost:42003/health
   # Should return: {"status":"healthy","timestamp":"...","database":"connected"}
   ```

4. **Access the logging dashboard** (optional):
   ```bash
   # In another terminal
   cd .context-kit/knowledge-graph
   npm run dev:ui  # Start UI on port 42001 (minimal logging)
   # Open http://localhost:42001#logs
   
   # Alternative UI logging options:
   # npm run dev:ui:verbose  # Full Vite logging
   # npm run dev:ui:quiet    # Warnings and errors only
   # npm run dev:ui:silent   # No Vite logs
   ```

## Quick Start

### Option 1: Using the Client Library (Recommended)

The logging client is included with tkr-context-kit at `.context-kit/logging-client/`.

**For TypeScript/JavaScript projects:**
```javascript
// Import from the tkr-context-kit installation
const { createTkrLogger } = require('./.context-kit/logging-client/index.js');
// OR for ES modules:
import { createTkrLogger } from './.context-kit/logging-client/index.js';

const logger = createTkrLogger({
  service: 'MyApp',
  serviceType: 'backend'
});

logger.info('Application started');
```

**For Bash scripts:**
```bash
# Source the logging functions
source ./.context-kit/logging-client/tkr-logger.sh

# Configure and use
export TKR_LOG_SERVICE="MyScript"
tkr_info "Script started"
```

### Option 2: Direct HTTP Integration

Send POST requests to `http://localhost:42003/api/logs`:

```javascript
fetch('http://localhost:42003/api/logs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    level: 'INFO',
    message: 'Your log message',
    service: 'YourApp',
    service_type: 'backend',
    timestamp: Math.floor(Date.now() / 1000)
  })
});
```

## Integration Examples by Framework

### Node.js / Express

```javascript
const { createTkrLogger } = require('./.context-kit/logging-client/index.js');

const logger = createTkrLogger({
  service: 'ExpressAPI',
  serviceType: 'backend'
});

// Middleware for request logging
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    logger.info(`${req.method} ${req.path} - ${res.statusCode}`, {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      ip: req.ip
    }, 'HTTP');
  });
  
  next();
});

// Error handling
app.use((err, req, res, next) => {
  logger.error('Request error', err, {
    path: req.path,
    method: req.method
  }, 'ErrorHandler');
  
  res.status(500).json({ error: 'Internal Server Error' });
});
```

### React / Frontend Applications

```javascript
import { createTkrLogger } from './.context-kit/logging-client/index.js';

// Initialize logger
const logger = createTkrLogger({
  service: 'ReactApp',
  serviceType: 'frontend',
  defaultComponent: 'App'
});

// Log app initialization
logger.info('React app initialized', {
  env: process.env.NODE_ENV,
  version: process.env.REACT_APP_VERSION
});

// Error boundary integration
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logger.fatal('React error boundary triggered', error, {
      componentStack: errorInfo.componentStack
    }, 'ErrorBoundary');
  }
}

// Hook for component logging
function useComponentLogger(componentName) {
  const componentLogger = useMemo(() => 
    logger.child(componentName), 
    [componentName]
  );
  
  useEffect(() => {
    componentLogger.debug('Component mounted');
    return () => componentLogger.debug('Component unmounted');
  }, []);
  
  return componentLogger;
}
```

### Python / Django / Flask

```python
import requests
import json
import traceback
from datetime import datetime
from functools import wraps

class TkrLogger:
    def __init__(self, service, service_type='backend', base_url='http://localhost:42003'):
        self.service = service
        self.service_type = service_type
        self.base_url = base_url
    
    def _send_log(self, level, message, component='Main', metadata=None):
        try:
            payload = {
                'level': level.upper(),
                'message': message,
                'service': self.service,
                'service_type': self.service_type,
                'component': component,
                'metadata': metadata or {},
                'timestamp': int(datetime.now().timestamp())
            }
            requests.post(f'{self.base_url}/api/logs', json=payload, timeout=1)
        except:
            pass  # Fail silently
    
    def info(self, message, component='Main', **metadata):
        self._send_log('info', message, component, metadata)
    
    def error(self, message, component='Main', exception=None, **metadata):
        if exception:
            metadata['error'] = {
                'type': type(exception).__name__,
                'message': str(exception),
                'traceback': traceback.format_exc()
            }
        self._send_log('error', message, component, metadata)

# Flask integration
logger = TkrLogger('FlaskApp', 'backend')

@app.before_request
def log_request():
    logger.info(f'{request.method} {request.path}', 'HTTP', 
                method=request.method, 
                path=request.path,
                ip=request.remote_addr)

@app.errorhandler(Exception)
def handle_error(e):
    logger.error('Request failed', 'ErrorHandler', exception=e,
                 path=request.path, method=request.method)
    return {'error': 'Internal Server Error'}, 500

# Django middleware
class TkrLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.logger = TkrLogger('DjangoApp', 'backend')
    
    def __call__(self, request):
        self.logger.info(f'{request.method} {request.path}', 'HTTP',
                        method=request.method,
                        path=request.path,
                        user=str(request.user))
        
        response = self.get_response(request)
        return response
```

### Bash Scripts

```bash
#!/bin/bash
# Source the logging functions
source ./.context-kit/logging-client/tkr-logger.sh

# Configure service name
export TKR_LOG_SERVICE="MyScript"
export TKR_LOG_SERVICE_TYPE="cli"

# Use logging functions
tkr_info "Script started"
tkr_info "Processing files" "FileProcessor"

# Log with metadata
tkr_error "File not found" "FileProcessor" '{"file": "/tmp/data.txt"}'

# Log command results
if ! command_that_might_fail; then
    tkr_error "Command failed" "CommandRunner" "{\"exit_code\": $?}"
fi

tkr_info "Script completed"
```

### Ruby / Rails

```ruby
require 'net/http'
require 'json'
require 'time'

class TkrLogger
  def initialize(service, service_type = 'backend', base_url = 'http://localhost:42003')
    @service = service
    @service_type = service_type
    @base_url = base_url
  end
  
  def log(level, message, component = 'Main', metadata = {})
    payload = {
      level: level.upcase,
      message: message,
      service: @service,
      service_type: @service_type,
      component: component,
      metadata: metadata,
      timestamp: Time.now.to_i
    }
    
    begin
      uri = URI("#{@base_url}/api/logs")
      http = Net::HTTP.new(uri.host, uri.port)
      request = Net::HTTP::Post.new(uri)
      request['Content-Type'] = 'application/json'
      request.body = payload.to_json
      http.request(request)
    rescue
      # Fail silently
    end
  end
  
  def info(message, component = 'Main', metadata = {})
    log('info', message, component, metadata)
  end
  
  def error(message, component = 'Main', exception = nil, metadata = {})
    if exception
      metadata[:error] = {
        type: exception.class.name,
        message: exception.message,
        backtrace: exception.backtrace&.first(10)
      }
    end
    log('error', message, component, metadata)
  end
end

# Rails integration
class ApplicationController < ActionController::Base
  before_action :log_request
  
  rescue_from StandardError do |exception|
    logger.error('Request failed', 'ErrorHandler', exception,
                 path: request.path,
                 method: request.method)
    render json: { error: 'Internal Server Error' }, status: 500
  end
  
  private
  
  def logger
    @logger ||= TkrLogger.new('RailsApp', 'backend')
  end
  
  def log_request
    logger.info("#{request.method} #{request.path}", 'HTTP',
                method: request.method,
                path: request.path,
                ip: request.remote_ip)
  end
end
```

### Go

```go
package tkrlogger

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type Logger struct {
    Service     string
    ServiceType string
    BaseURL     string
}

type LogEntry struct {
    Level       string                 `json:"level"`
    Message     string                 `json:"message"`
    Service     string                 `json:"service"`
    ServiceType string                 `json:"service_type"`
    Component   string                 `json:"component"`
    Metadata    map[string]interface{} `json:"metadata"`
    Timestamp   int64                  `json:"timestamp"`
}

func NewLogger(service, serviceType string) *Logger {
    return &Logger{
        Service:     service,
        ServiceType: serviceType,
        BaseURL:     "http://localhost:42003",
    }
}

func (l *Logger) log(level, message, component string, metadata map[string]interface{}) {
    entry := LogEntry{
        Level:       level,
        Message:     message,
        Service:     l.Service,
        ServiceType: l.ServiceType,
        Component:   component,
        Metadata:    metadata,
        Timestamp:   time.Now().Unix(),
    }
    
    data, err := json.Marshal(entry)
    if err != nil {
        return
    }
    
    go func() {
        http.Post(l.BaseURL+"/api/logs", "application/json", bytes.NewReader(data))
    }()
}

func (l *Logger) Info(message string, component string, metadata map[string]interface{}) {
    l.log("INFO", message, component, metadata)
}

func (l *Logger) Error(message string, component string, err error, metadata map[string]interface{}) {
    if err != nil && metadata == nil {
        metadata = make(map[string]interface{})
    }
    if err != nil {
        metadata["error"] = map[string]string{
            "type":    fmt.Sprintf("%T", err),
            "message": err.Error(),
        }
    }
    l.log("ERROR", message, component, metadata)
}

// HTTP middleware
func LoggingMiddleware(logger *Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()
            
            logger.Info(fmt.Sprintf("%s %s", r.Method, r.URL.Path), "HTTP", map[string]interface{}{
                "method": r.Method,
                "path":   r.URL.Path,
                "ip":     r.RemoteAddr,
            })
            
            next.ServeHTTP(w, r)
            
            logger.Info("Request completed", "HTTP", map[string]interface{}{
                "duration": time.Since(start).Milliseconds(),
            })
        })
    }
}
```

## Viewing Logs

Once integrated, view your logs at: `http://localhost:42001#logs`

The dashboard provides:
- Real-time log streaming
- Filtering by service, level, and time window
- Full-text search
- Service health monitoring

## Best Practices

1. **Use appropriate log levels:**
   - `debug`: Development/debugging information
   - `info`: General operational messages
   - `warn`: Warning conditions
   - `error`: Error conditions
   - `fatal`: Critical failures

2. **Include relevant metadata:**
   - User IDs
   - Request IDs
   - Error details
   - Performance metrics

3. **Use component names:**
   - Helps identify which part of your app generated the log
   - Makes filtering and debugging easier

4. **Handle failures gracefully:**
   - The logging system should never crash your app
   - Use fail-silent approach for production

5. **Don't log sensitive data:**
   - Avoid passwords, tokens, or PII
   - Sanitize data before logging

## Troubleshooting

1. **Logs not appearing:**
   - Check API server is running: `curl http://localhost:42003/health`
   - Verify network connectivity
   - Check browser console for errors

2. **Performance issues:**
   - Logs are sent asynchronously
   - Consider batching for high-volume apps
   - Use appropriate log levels to reduce volume

3. **CORS errors:**
   - The API server allows all origins by default
   - Check if a firewall is blocking the connection