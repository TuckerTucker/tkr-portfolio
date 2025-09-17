# Usage Guide - Centralized Logging System

This guide covers practical usage of the centralized logging system for both AI agents and human users.

## Implementation Status
- ✅ **Human Interface (React UI)**: Fully working
- ✅ **HTTP API Usage**: Fully implemented with mock data fallback
- 📋 **AI Agent Usage (MCP Tools)**: Planned but not yet available
- 🚧 **Integration Patterns**: Partially implemented

## Table of Contents

1. [Quick Start](#quick-start)
2. [AI Agent Usage (MCP Tools)](#ai-agent-usage-mcp-tools) - 📋 Planned
3. [Human Interface (React UI)](#human-interface-react-ui) - ✅ Working
4. [HTTP API Usage](#http-api-usage) - ✅ Working
5. [Integration Patterns](#integration-patterns) - 🚧 Partial
6. [Troubleshooting](#troubleshooting) - ✅ Updated

## Quick Start

### Starting the System - ✅ Working

```bash
cd .context-kit/knowledge-graph

# Terminal 1: Start React UI (http://localhost:42001)
npm run dev

# Terminal 2: Start API server (http://localhost:42003)
npm run dev:api
```

### First Steps - ✅ Working

1. **Access the UI**: Open http://localhost:42001
2. **Switch to Logs**: Click "📝 System Logs" in the header 
3. **View Mock Data**: See realistic sample logs (automatic fallback if no real logs)
4. **Test Filters**: Try different service and level filters
5. **Test API**: Try `curl "http://localhost:42003/api/logs/stream?format=text"`

## AI Agent Usage (MCP Tools) - 📋 Planned Features

**Status**: MCP tools are planned but not yet integrated into the main MCP server.

**Alternative**: Use HTTP API endpoints for current functionality (see section below).

**Future Usage**: Once implemented, AI agents will access the logging system through 6 MCP tools integrated into Claude Code.

### Creating Log Entries - 📋 Planned Feature

Use `log_create` to add new log entries (when available):

```
# Basic log entry (planned)
mcp__context-kit__log_create level="INFO" message="Application started successfully" service="MyApp"

# Detailed log with structured data
mcp__context-kit__log_create level="ERROR" message="Database connection failed" service="UserService" component="DatabaseConnector" data='{"host": "db.example.com", "port": 5432, "error": "Connection timeout", "retryAttempt": 3}'

# Log with tracing information
mcp__context-kit__log_create level="INFO" message="User authentication successful" service="AuthService" component="LoginHandler" traceId="req-123-abc" spanId="auth-span-1" userId="user-456" sessionId="sess-789"
```

### Querying Logs - 📋 Planned Feature

Use `log_query` for structured log retrieval (when available):

```
# Get recent errors
mcp__context-kit__log_query level="ERROR" timeWindow=3600

# Get logs from specific service
mcp__context-kit__log_query service="UserService" startTime=1725299252 limit=50

# Get logs for a specific trace
mcp__context-kit__log_query traceId="req-123-abc"

# Get logs from specific component
mcp__context-kit__log_query service="AuthService" component="TokenValidator" level="DEBUG"
```

### Searching Logs - 📋 Planned Feature

Use `log_search` for full-text search across all log content (when available):

```
# Search for specific keywords
mcp__context-kit__log_search query="timeout"

# Complex search with multiple terms
mcp__context-kit__log_search query="database AND (failed OR error)"

# Search within specific service
mcp__context-kit__log_search query="user login" service="AuthService"

# Search for exact phrases
mcp__context-kit__log_search query='"connection refused"'
```

### Getting Metrics - 📋 Planned Feature

Use `log_aggregate` for metrics and analysis (when available):

```
# Get error counts by service
mcp__context-kit__log_aggregate level="ERROR" period="hour"

# Get all metrics for a specific service
mcp__context-kit__log_aggregate service="UserService" period="day"

# Get metrics for a time range
mcp__context-kit__log_aggregate startTime=1725299252 endTime=1725302852
```

### Tracing Requests - 📋 Planned Feature

Use `log_trace` to follow request flows (when available):

```
# Follow a complete request trace
mcp__context-kit__log_trace traceId="req-123-abc"
```

### Monitoring Service Health - 📋 Planned Feature

Use `service_health` for health monitoring (when available):

```
# Get health for all services
mcp__context-kit__service_health

# Get health for specific service
mcp__context-kit__service_health service="UserService" timeWindow=7200

# Quick health check (last hour)
mcp__context-kit__service_health timeWindow=3600
```

## Human Interface (React UI) - ✅ Fully Working

The React UI provides a professional log viewer interface for human users.

### Accessing the Log Viewer

1. Open http://localhost:42001 in your browser
2. Click "📝 System Logs" in the header to switch from Knowledge Graph view
3. The LogViewer will load with current logs or mock data

### Using the Log Viewer

#### Basic Navigation
- **Scroll**: Use mouse wheel or scrollbar to navigate through logs
- **Search**: Use the search box in LazyLog to find specific text
- **Select Lines**: Click to select individual log lines
- **Copy**: Selected lines can be copied to clipboard

#### Filtering Options

**Service Filter**:
- Select "All Services" or choose specific service
- Available services: React UI, MCP Server, API Server (or actual services with logs)

**Log Level Filter**:
- All Levels, Fatal, Error, Warning, Info, Debug
- Higher levels include lower levels (e.g., Warning shows Warning + Error + Fatal)

**Time Window**:
- 5 minutes, 15 minutes, 1 hour, 6 hours, 24 hours
- Controls how far back in time to show logs

#### Real-time Following

- **Auto-follow checkbox**: Enable/disable real-time log updates
- **Refresh button**: Manual refresh of log data
- **2-second polling**: Automatic updates every 2 seconds when following

#### Search Features

LazyLog provides built-in search capabilities:
- **Case-insensitive search**: Search ignores letter case
- **Highlight matches**: Found text is highlighted in the log
- **Navigation**: Use arrow keys to jump between matches
- **RegEx support**: Advanced users can use regular expressions

### UI Layout

```
┌─────────────────────────────────────────────────────────┐
│ Knowledge Graph System                                  │
│ [📊 Knowledge Graph] [📝 System Logs] <- View Selector │
├─────────────────────────────────────────────────────────┤
│ System Logs                                             │
│ Service: [All Services▼] Level: [All Levels▼]         │
│ Time: [1 hour▼] [☑] Auto-follow                       │
├─────────────────────────────────────────────────────────┤
│ ┌─ System Logs ─────────────────────── [🔄 Refresh] ┐ │
│ │ Search: [_______________] 🔍                      │ │
│ │ ──────────────────────────────────────────────────  │ │
│ │ 2025-08-02T17:27:32Z [INFO] React UI - App started │ │
│ │ 2025-08-02T17:27:27Z [INFO] MCP Server - KG init   │ │
│ │ 2025-08-02T17:27:22Z [WARN] API Server - High mem  │ │
│ │ 2025-08-02T17:27:17Z [ERROR] React UI - Fetch fail │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## HTTP API Usage - ✅ Fully Working

For programmatic access, use the HTTP API endpoints. All endpoints return mock data if the database is empty.

### Basic Curl Examples

```bash
# Get recent logs as text
curl "http://localhost:42003/api/logs/stream?format=text&timeWindow=3600"

# Get errors from last 6 hours as JSON
curl "http://localhost:42003/api/logs/stream?level=ERROR&timeWindow=21600&format=json"

# Search for database issues
curl "http://localhost:42003/api/logs/search?q=database&format=text"

# Get service health summary
curl "http://localhost:42003/api/logs/health"

# List available services
curl "http://localhost:42003/api/logs/services"
```

### Programming Language Examples

#### JavaScript/Node.js

```javascript
// Fetch recent logs
async function getRecentLogs() {
  const response = await fetch('http://localhost:42003/api/logs/stream?format=json&timeWindow=3600');
  const logs = await response.json();
  return logs.data;
}

// Search logs
async function searchLogs(query) {
  const response = await fetch(`http://localhost:42003/api/logs/search?q=${encodeURIComponent(query)}&format=json`);
  const results = await response.json();
  return results.data;
}

// Monitor service health
async function getServiceHealth() {
  const response = await fetch('http://localhost:42003/api/logs/health');
  const health = await response.json();
  return health.data;
}
```

#### Python

```python
import requests
import json

# Get recent error logs
def get_recent_errors():
    response = requests.get('http://localhost:42003/api/logs/stream', 
                          params={'level': 'ERROR', 'timeWindow': 3600, 'format': 'json'})
    return response.json()['data']

# Search logs with filters
def search_logs(query, service=None):
    params = {'q': query, 'format': 'json'}
    if service:
        params['service'] = service
    
    response = requests.get('http://localhost:42003/api/logs/search', params=params)
    return response.json()['data']

# Get service health metrics
def get_service_health(time_window=3600):
    response = requests.get('http://localhost:42003/api/logs/health',
                          params={'timeWindow': time_window})
    return response.json()['data']
```

## Integration Patterns

### Structured Logging Best Practices

#### Log Levels
- **FATAL**: System is unusable, immediate attention required
- **ERROR**: Error conditions, but system continues operating
- **WARN**: Warning conditions, potential issues
- **INFO**: Informational messages, normal operation
- **DEBUG**: Debug-level messages, detailed diagnostics

#### Message Format
```
# Good: Clear, actionable messages
"User authentication failed for email: user@example.com"
"Database connection pool exhausted, current: 50, max: 50"
"Order processing completed successfully, orderId: 12345"

# Avoid: Vague or uninformative messages
"Error occurred"
"Process finished"
"Something went wrong"
```

#### Structured Data
```javascript
// Include relevant context in data field
{
  level: "ERROR",
  message: "Payment processing failed",
  service: "PaymentService",
  component: "StripeHandler", 
  data: {
    orderId: "order-12345",
    amount: 99.99,
    currency: "USD",
    customerId: "cust-67890",
    errorCode: "card_declined",
    errorMessage: "Your card was declined",
    retryAttempt: 2,
    processingTime: 1250
  },
  traceId: "trace-abc-123",
  userId: "user-456"
}
```

### Correlation and Tracing

#### Request Tracing
```javascript
// Generate trace ID at request entry point
const traceId = `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Pass trace ID through all services
logger.info("Request received", {
  traceId,
  spanId: "gateway-span-1",
  requestPath: "/api/users/12345",
  method: "GET"
});

// Include in downstream service calls
logger.info("Calling user service", {
  traceId,
  spanId: "gateway-span-2", 
  targetService: "UserService",
  endpoint: "/users/12345"
});
```

#### Error Correlation
```javascript
// Link related errors with same trace ID
logger.error("Database query failed", {
  traceId: "trace-abc-123",
  spanId: "db-span-1",
  query: "SELECT * FROM users WHERE id = ?",
  error: "Connection timeout",
  retryAttempt: 3
});

logger.error("User lookup failed", {
  traceId: "trace-abc-123", // Same trace ID
  spanId: "service-span-1",
  userId: "12345",
  errorCause: "Database unavailable"
});
```

### Monitoring and Alerting

#### Health Checks
```javascript
// Regular health monitoring
setInterval(async () => {
  const health = await getServiceHealth(300); // Last 5 minutes
  
  for (const service of health) {
    const errorRate = service.error_count / service.total_logs;
    
    if (errorRate > 0.1) { // 10% error rate
      logger.warn("High error rate detected", {
        service: service.service,
        errorRate: errorRate,
        errorCount: service.error_count,
        totalLogs: service.total_logs
      });
    }
  }
}, 60000); // Check every minute
```

#### Custom Metrics
```javascript
// Track business metrics alongside system logs
logger.info("Order completed", {
  service: "OrderService",
  data: {
    orderId: "order-12345",
    customerId: "cust-67890", 
    amount: 99.99,
    processingTime: 850,
    paymentMethod: "credit_card"
  },
  metrics: {
    orderValue: 99.99,
    processingTimeMs: 850,
    paymentType: "credit_card"
  }
});
```

## Troubleshooting - ✅ Updated for Current Implementation

### Common Issues with Implemented Features

#### 1. "Failed to fetch logs" Error

**Symptoms**: React UI shows error message
**Causes**: API server not running or wrong port
**Solutions**:
```bash
# Check if API server is running
curl http://localhost:42003/health

# Restart API server
npm run dev:api

# Check for port conflicts
lsof -i :42003
```

#### 2. Empty Log Viewer

**Symptoms**: No logs displayed in UI
**Causes**: No logs in database, filter too restrictive
**Solutions**:
- Check "All Services" and "All Levels" filters
- Increase time window to 24 hours
- Create test logs via HTTP API: `curl -X POST "http://localhost:42003/api/logs" -H "Content-Type: application/json" -d '{"level":"INFO","message":"Test log","service":"TestService"}'`
- Verify mock data is loading

#### 3. MCP Tools Not Available

**Symptoms**: MCP logging tools not found in Claude Code
**Cause**: MCP tools are planned but not yet implemented
**Solution**: Use HTTP API endpoints instead:
```bash
# Instead of MCP tools, use:
curl -X POST "http://localhost:42003/api/logs" \
  -H "Content-Type: application/json" \
  -d '{"level":"INFO","message":"Test","service":"MyService"}'

# Query logs:
curl "http://localhost:42003/api/logs/stream?format=text"

# Search logs:
curl "http://localhost:42003/api/logs/search?q=test"
```

#### 4. Search Not Working

**Symptoms**: Search returns no results for known content
**Causes**: FTS5 table not populated, SQLite version
**Solutions**:
- Check SQLite version supports FTS5
- Verify FTS5 triggers are working
- Rebuild FTS5 index if needed

#### 5. Performance Issues

**Symptoms**: Slow queries, UI lag
**Causes**: Large log volume, missing indexes
**Solutions**:
- Use time window filters
- Limit result sets with `limit` parameter
- Consider log retention cleanup
- Monitor database size

### Debug Commands

```bash
# Check database schema
sqlite3 knowledge-graph.db ".schema log_entries"

# Check log count
sqlite3 knowledge-graph.db "SELECT COUNT(*) FROM log_entries;"

# Check FTS5 table
sqlite3 knowledge-graph.db "SELECT COUNT(*) FROM log_entries_fts;"

# Test FTS5 search
sqlite3 knowledge-graph.db "SELECT * FROM log_entries_fts WHERE log_entries_fts MATCH 'error' LIMIT 5;"

# Check indexes
sqlite3 knowledge-graph.db ".indexes log_entries"
```

### Performance Tuning

#### Database Optimization
```sql
-- Analyze query performance
EXPLAIN QUERY PLAN SELECT * FROM log_entries WHERE level = 'ERROR' AND timestamp > 1725299252;

-- Rebuild FTS5 index
INSERT INTO log_entries_fts(log_entries_fts) VALUES('rebuild');

-- Vacuum database
VACUUM;

-- Analyze for query planner
ANALYZE;
```

#### Application Tuning
```javascript
// Batch log creation for high volume
const logs = [];
for (let i = 0; i < 1000; i++) {
  logs.push({
    level: 'INFO',
    message: `Batch message ${i}`,
    service: 'BatchService'
  });
}

// Process in batches of 100
for (let i = 0; i < logs.length; i += 100) {
  const batch = logs.slice(i, i + 100);
  await createLogsBatch(batch);
}
```

### Getting Help

1. **Check Documentation**: Review API reference and examples
2. **Test with Curl**: Verify API endpoints work directly
3. **Check Logs**: Look at API server console output
4. **Database Inspection**: Use SQLite CLI to inspect data
5. **Mock Data**: Verify system works with sample data

The centralized logging system is designed to be robust and self-healing, with fallback mechanisms for development and comprehensive error handling for production use.