# API Reference - Centralized Logging System

## Implementation Status Overview

- ✅ **HTTP API Endpoints**: Fully implemented and working
- 📋 **MCP Tools**: Planned but not yet integrated into main server
- ✅ **Database Setup**: Schema available, manual setup required

## HTTP API Endpoints - ✅ Fully Implemented

All logging endpoints are served from the main knowledge graph HTTP server on port 42003.

### Verification Steps
1. Start the API server: `cd .context-kit/knowledge-graph && npm run dev:api`
2. Test health endpoint: `curl http://localhost:42003/health`
3. Test logging endpoint: `curl "http://localhost:42003/api/logs/stream?format=text"`

### Base URL
```
http://localhost:42003/api/logs
```

### 1. Stream Logs - ✅ Fully Implemented

**Endpoint**: `GET /api/logs/stream`

Stream logs with optional filtering and format selection. Returns mock data if no logs exist in database.

**Query Parameters**:
- `service` (optional): Filter by service name
- `level` (optional): Filter by log level (DEBUG, INFO, WARN, ERROR, FATAL)
- `timeWindow` (optional): Time window in seconds (default: 3600)
- `format` (optional): Response format - "text" or "json" (default: "json")
- `limit` (optional): Maximum number of logs to return (default: 1000)

**Examples**:
```bash
# Get recent logs as text
curl "http://localhost:42003/api/logs/stream?format=text&timeWindow=3600"

# Get errors from a specific service
curl "http://localhost:42003/api/logs/stream?service=React%20UI&level=ERROR&format=json"

# Get last 100 logs
curl "http://localhost:42003/api/logs/stream?limit=100&format=text"
```

**Response (text format)**:
```
2025-08-02T17:27:32.253Z [INFO] React UI App - Application started
2025-08-02T17:27:27.253Z [INFO] MCP Server KnowledgeGraph - Knowledge graph initialized
2025-08-02T17:27:22.253Z [WARN] API Server HealthCheck - High memory usage detected
```

**Response (json format)**:
```json
{
  "data": [
    {
      "timestamp": 1725302852,
      "level": "INFO",
      "message": "Application started",
      "service": "React UI",
      "component": "App",
      "data": null,
      "trace_id": null,
      "span_id": null,
      "user_id": null,
      "session_id": null
    }
  ]
}
```

### 2. Get Services - ✅ Fully Implemented

**Endpoint**: `GET /api/logs/services`

Get list of available services that have logged entries. Returns mock services if database is empty.

**Response**:
```json
{
  "services": ["React UI", "MCP Server", "API Server"]
}
```

### 3. Search Logs - ✅ Fully Implemented

**Endpoint**: `GET /api/logs/search`

Full-text search across log messages and data using SQLite FTS5.

**Query Parameters**:
- `q` or `query` (required): Search query string
- `service` (optional): Filter by service name
- `level` (optional): Filter by log level
- `limit` (optional): Maximum results (default: 50)
- `format` (optional): "text" or "json" (default: "json")

**Examples**:
```bash
# Search for errors containing "timeout"
curl "http://localhost:42003/api/logs/search?q=timeout&level=ERROR"

# Search across all logs for "database"
curl "http://localhost:42003/api/logs/search?query=database&format=text"
```

### 4. Service Health - ✅ Fully Implemented

**Endpoint**: `GET /api/logs/health`

Get service health metrics and error rates. Returns empty array if no logs exist.

### 5. Submit Log Entry - ✅ Fully Implemented

**Endpoint**: `POST /api/logs`

Submit a new log entry to the centralized logging system.

**Body Parameters**:
- `level` (required): Log level - "DEBUG", "INFO", "WARN", "ERROR", or "FATAL"
- `message` (required): Log message text
- `service` (required): Service name
- `component` (optional): Component within the service
- `metadata` (optional): Additional data as JSON object

**Example**:
```bash
curl -X POST "http://localhost:42003/api/logs" \
  -H "Content-Type: application/json" \
  -d '{
    "level": "INFO",
    "message": "User login successful",
    "service": "AuthService",
    "component": "LoginHandler",
    "metadata": {"userId": "12345", "ip": "192.168.1.100"}
  }'
```

**Query Parameters**:
- `timeWindow` (optional): Time window in seconds (default: 3600)

**Response**:
```json
{
  "data": [
    {
      "service": "React UI",
      "service_type": "frontend",
      "error_count": 2,
      "warning_count": 5,
      "info_count": 23,
      "debug_count": 45,
      "total_logs": 75,
      "last_log": 1725302852,
      "first_log": 1725299252
    }
  ]
}
```

## MCP Tools Reference - 📋 Planned Features

**Implementation Status**: These tools are documented and planned but not yet integrated into the main MCP server. The schema and implementation plan exist, but the tools are not currently available in Claude Code.

**Alternative**: Use the HTTP API endpoints above for current logging functionality.

**When Available**: These tools will be accessible through the Model Context Protocol once integrated.

### 1. log_create - 📋 Planned Feature

Create a new log entry in the system.

**Parameters**:
- `level` (required): Log level - "DEBUG", "INFO", "WARN", "ERROR", or "FATAL"
- `message` (required): Log message text
- `service` (required): Service name generating the log
- `component` (optional): Specific component within the service
- `data` (optional): Additional structured data as JSON object
- `traceId` (optional): Trace ID for request correlation
- `spanId` (optional): Span ID for distributed tracing
- `userId` (optional): User ID if applicable
- `sessionId` (optional): Session ID if applicable

**Example**:
```
mcp_tkr-knowledge-graph_log_create level="INFO" message="User login successful" service="AuthService" component="LoginHandler" data='{"userId": "12345", "ip": "192.168.1.100"}' traceId="trace-abc-123"
```

**Response**:
```
Log entry created: log_1725302852_abc123def [INFO] AuthService - User login successful
```

### 2. log_query - 📋 Planned Feature

Query log entries with flexible filtering options.

**Parameters**:
- `level` (optional): Filter by log level
- `service` (optional): Filter by service name
- `component` (optional): Filter by component name
- `traceId` (optional): Filter by trace ID
- `startTime` (optional): Start timestamp (Unix epoch)
- `endTime` (optional): End timestamp (Unix epoch)
- `limit` (optional): Maximum results (default: 100)

**Example**:
```
mcp_tkr-knowledge-graph_log_query level="ERROR" service="AuthService" startTime=1725299252 limit=50
```

**Response**:
```json
Found 3 log entries:
[
  {
    "timestamp": 1725302852,
    "level": "ERROR",
    "message": "Database connection failed",
    "service": "AuthService",
    "component": "DatabaseConnector",
    "data": "{\"error\": \"Connection timeout\", \"retryAttempt\": 3}",
    "trace_id": "trace-def-456"
  }
]
```

### 3. log_search - 📋 Planned Feature

Full-text search across all log entries.

**Parameters**:
- `query` (required): Search query string (supports SQLite FTS5 syntax)
- `service` (optional): Filter by service name
- `level` (optional): Filter by log level
- `limit` (optional): Maximum results (default: 50)

**Example**:
```
mcp_tkr-knowledge-graph_log_search query="timeout OR failed" service="AuthService" limit=20
```

**Response**:
```json
Search results for "timeout OR failed":
[
  {
    "timestamp": 1725302852,
    "level": "ERROR",
    "message": "Database connection failed",
    "service": "AuthService",
    "component": "DatabaseConnector",
    "data": "{\"error\": \"Connection timeout\"}"
  }
]
```

### 4. log_aggregate - 📋 Planned Feature

Get log aggregations and metrics for analysis.

**Parameters**:
- `period` (optional): Aggregation period - "minute", "hour", or "day" (default: "hour")
- `service` (optional): Filter by service name
- `level` (optional): Filter by log level
- `startTime` (optional): Start timestamp
- `endTime` (optional): End timestamp

**Example**:
```
mcp_tkr-knowledge-graph_log_aggregate period="hour" service="AuthService"
```

**Response**:
```json
Log aggregations (hour):
[
  {
    "service": "AuthService",
    "level": "ERROR",
    "count": 5,
    "first_occurrence": 1725299252,
    "last_occurrence": 1725302852
  },
  {
    "service": "AuthService", 
    "level": "INFO",
    "count": 45,
    "first_occurrence": 1725299252,
    "last_occurrence": 1725302852
  }
]
```

### 5. log_trace - 📋 Planned Feature

Trace a request flow across services using trace ID.

**Parameters**:
- `traceId` (required): Trace ID to follow

**Example**:
```
mcp_tkr-knowledge-graph_log_trace traceId="trace-abc-123"
```

**Response**:
```json
Trace flow for trace-abc-123:
[
  {
    "timestamp": 1725302850,
    "service": "Gateway",
    "component": "RequestHandler",
    "message": "Request received",
    "level": "INFO",
    "span_id": "span-1"
  },
  {
    "timestamp": 1725302851,
    "service": "AuthService",
    "component": "TokenValidator", 
    "message": "Token validation started",
    "level": "DEBUG",
    "span_id": "span-2"
  },
  {
    "timestamp": 1725302852,
    "service": "AuthService",
    "component": "LoginHandler",
    "message": "User login successful",
    "level": "INFO",
    "span_id": "span-3"
  }
]
```

### 6. service_health - 📋 Planned Feature

Get comprehensive service health metrics.

**Parameters**:
- `service` (optional): Filter by specific service name
- `timeWindow` (optional): Time window in seconds (default: 3600)

**Example**:
```
mcp_tkr-knowledge-graph_service_health service="AuthService" timeWindow=7200
```

**Response**:
```json
Service health metrics (7200s window):
[
  {
    "service": "AuthService",
    "error_count": 5,
    "warning_count": 12,
    "info_count": 234,
    "total_logs": 251,
    "last_log": 1725302852
  }
]
```

## Error Handling

### HTTP API Errors

**400 Bad Request**:
```json
{
  "error": "Query parameter is required"
}
```

**404 Not Found**:
```json
{
  "error": "Not found"
}
```

**500 Internal Server Error**:
```json
{
  "error": "Internal server error",
  "message": "Database connection failed"
}
```

### MCP Tool Errors

MCP tools return errors in the standard MCP error format with descriptive messages about validation failures or database issues.

## Rate Limiting

Currently no rate limiting is implemented. In production environments, consider implementing:
- Request rate limiting per IP/user
- Query complexity limits for search operations
- Bulk operation throttling

## Authentication

The current implementation does not include authentication. For production use:
- Add API key authentication for HTTP endpoints
- Implement user-based access control for sensitive logs
- Add audit logging for administrative operations

## Performance Considerations

- **FTS5 Search**: Full-text search is optimized with SQLite FTS5 virtual tables
- **Indexing**: All filter fields (timestamp, level, service) are indexed
- **Pagination**: Use `limit` parameter to control response size
- **Time Windows**: Prefer time-based filtering over large result sets
- **Aggregations**: Pre-computed aggregations available for common metrics