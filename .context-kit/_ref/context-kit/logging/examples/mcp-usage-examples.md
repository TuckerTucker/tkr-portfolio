# MCP Tools Usage Examples - 📋 Planned Features

**Implementation Status**: These MCP tools are planned but not yet integrated into the main MCP server.

**Current Alternative**: Use HTTP API endpoints for logging functionality:
- `POST http://localhost:42003/api/logs` - Submit logs
- `GET http://localhost:42003/api/logs/stream` - Query logs  
- `GET http://localhost:42003/api/logs/search` - Search logs
- `GET http://localhost:42003/api/logs/health` - Service health

This document provides practical examples of the planned MCP logging tools for AI agents (when available).

## Basic Logging Examples - 📋 Planned Features

### 1. Application Lifecycle Events - 📋 Planned

**Current Alternative**: Use HTTP API
```bash
curl -X POST "http://localhost:42003/api/logs" -H "Content-Type: application/json" \
  -d '{"level":"INFO","message":"Application starting up","service":"MyApp","component":"Bootstrap","metadata":{"version":"1.2.3","environment":"production"}}'
```

**Planned MCP Usage**:
```
# Application startup (when available)
mcp__context-kit__log_create level="INFO" message="Application starting up" service="MyApp" component="Bootstrap" data='{"version": "1.2.3", "environment": "production", "config": "app.prod.json"}'

# Service initialization
mcp__context-kit__log_create level="INFO" message="Database connection pool initialized" service="MyApp" component="DatabaseManager" data='{"poolSize": 20, "host": "db.example.com", "database": "myapp_prod"}'

# Application ready
mcp__context-kit__log_create level="INFO" message="Application startup complete, ready to serve requests" service="MyApp" component="WebServer" data='{"port": 8080, "startupTimeMs": 2150}'

# Graceful shutdown
mcp__context-kit__log_create level="INFO" message="Received shutdown signal, beginning graceful shutdown" service="MyApp" component="SignalHandler" data='{"signal": "SIGTERM", "activeConnections": 12}'
```

### 2. User Authentication Flow - 📋 Planned

```
# Login attempt
mcp__context-kit__log_create level="INFO" message="User login attempt initiated" service="AuthService" component="LoginController" traceId="auth-abc-123" spanId="login-1" data='{"email": "user@example.com", "userAgent": "Mozilla/5.0...", "ip": "192.168.1.100"}'

# Password validation
mcp__context-kit__log_create level="DEBUG" message="Password validation started" service="AuthService" component="PasswordValidator" traceId="auth-abc-123" spanId="login-2" userId="user-456"

# Successful authentication
mcp__context-kit__log_create level="INFO" message="User authentication successful" service="AuthService" component="TokenGenerator" traceId="auth-abc-123" spanId="login-3" userId="user-456" sessionId="sess-789" data='{"tokenType": "JWT", "expiresIn": 3600}'

# Failed authentication
mcp__context-kit__log_create level="WARN" message="User authentication failed" service="AuthService" component="LoginController" traceId="auth-abc-124" data='{"email": "user@example.com", "reason": "invalid_password", "attemptCount": 3, "ip": "192.168.1.100"}'
```

### 3. API Request Processing - 📋 Planned

```
# Request received
mcp__context-kit__log_create level="INFO" message="API request received" service="ApiGateway" component="RequestHandler" traceId="req-def-456" spanId="gateway-1" data='{"method": "POST", "path": "/api/orders", "contentLength": 1024, "userAgent": "curl/7.68.0"}'

# Request validation
mcp__context-kit__log_create level="DEBUG" message="Request validation completed" service="ApiGateway" component="Validator" traceId="req-def-456" spanId="gateway-2" data='{"validationTimeMs": 15, "rulesChecked": 8}'

# Forwarding to service
mcp__context-kit__log_create level="INFO" message="Forwarding request to order service" service="ApiGateway" component="ServiceRouter" traceId="req-def-456" spanId="gateway-3" data='{"targetService": "OrderService", "endpoint": "/orders", "timeoutMs": 30000}'

# Service processing
mcp__context-kit__log_create level="INFO" message="Processing order creation request" service="OrderService" component="OrderController" traceId="req-def-456" spanId="order-1" userId="user-456" data='{"customerId": "cust-789", "items": 3, "totalAmount": 99.99}'

# Database operation
mcp__context-kit__log_create level="DEBUG" message="Executing database insert" service="OrderService" component="OrderRepository" traceId="req-def-456" spanId="order-2" data='{"table": "orders", "queryTimeMs": 25}'

# Response generation
mcp__context-kit__log_create level="INFO" message="Order created successfully" service="OrderService" component="OrderController" traceId="req-def-456" spanId="order-3" data='{"orderId": "order-12345", "processingTimeMs": 150}'
```

### 4. Error Scenarios - 📋 Planned

```
# Database connection error
mcp__context-kit__log_create level="ERROR" message="Database connection failed" service="OrderService" component="DatabaseConnector" traceId="req-ghi-789" data='{"host": "db.example.com", "port": 5432, "error": "Connection timeout", "retryAttempt": 1, "timeoutMs": 5000}'

# Retry attempt
mcp__context-kit__log_create level="WARN" message="Retrying database connection" service="OrderService" component="DatabaseConnector" traceId="req-ghi-789" data='{"retryAttempt": 2, "backoffMs": 2000}'

# Circuit breaker triggered
mcp__context-kit__log_create level="ERROR" message="Circuit breaker opened due to high failure rate" service="OrderService" component="CircuitBreaker" data='{"failureRate": 0.75, "threshold": 0.5, "requestsInWindow": 100, "failuresInWindow": 75}'

# External API error
mcp__context-kit__log_create level="ERROR" message="Payment processing failed" service="PaymentService" component="StripeClient" traceId="pay-jkl-012" data='{"amount": 99.99, "currency": "USD", "errorCode": "card_declined", "errorMessage": "Your card was declined", "stripeRequestId": "req_abc123"}'

# System resource exhaustion
mcp__context-kit__log_create level="FATAL" message="Out of memory error detected" service="OrderService" component="MemoryMonitor" data='{"memoryUsageBytes": 1073741824, "maxHeapBytes": 1073741824, "gcAttempts": 5, "action": "emergency_shutdown"}'
```

## Querying and Analysis Examples - 📋 Planned Features

### 1. Finding Recent Errors - 📋 Planned

```
**Current Alternative**: Use HTTP API
```bash
curl "http://localhost:42003/api/logs/stream?level=ERROR&timeWindow=3600&format=json"
```

**Planned MCP Usage**:
```
# Get all errors from last hour (when available)
mcp__context-kit__log_query level="ERROR" timeWindow=3600

# Get errors from specific service
mcp__context-kit__log_query level="ERROR" service="OrderService" timeWindow=7200

# Get fatal errors (critical issues)
mcp__context-kit__log_query level="FATAL" timeWindow=86400

# Get errors with pagination
mcp__context-kit__log_query level="ERROR" limit=50
```

### 2. Searching for Specific Issues - 📋 Planned

```
**Current Alternative**: Use HTTP API
```bash
curl "http://localhost:42003/api/logs/search?q=database&format=json"
curl "http://localhost:42003/api/logs/search?q=timeout+OR+timed_out&format=json"
```

**Planned MCP Usage**:
```
# Search for database-related issues (when available)
mcp__context-kit__log_search query="database"

# Search for timeout problems
mcp__context-kit__log_search query="timeout OR timed_out"

# Search for payment failures
mcp__context-kit__log_search query="payment AND (failed OR declined OR error)"

# Search for specific error codes
mcp__context-kit__log_search query="card_declined"

# Search within specific service
mcp__context-kit__log_search query="connection" service="OrderService"

# Complex search with multiple conditions
mcp__context-kit__log_search query="(database OR db) AND (timeout OR connection) AND error"
```

### 3. Request Tracing - 📋 Planned

```
# Follow complete request trace
mcp__context-kit__log_trace traceId="req-def-456"

# Get all logs for a specific trace
mcp__context-kit__log_query traceId="auth-abc-123"

# Find traces with errors
mcp__context-kit__log_search query="traceId" level="ERROR"
```

### 4. Service Health Monitoring - 📋 Planned

```
**Current Alternative**: Use HTTP API
```bash
curl "http://localhost:42003/api/logs/health"
curl "http://localhost:42003/api/logs/health?timeWindow=43200"
```

**Planned MCP Usage**:
```
# Overall service health (when available)
mcp__context-kit__service_health

# Specific service health
mcp__context-kit__service_health service="OrderService"

# Health over extended period
mcp__context-kit__service_health timeWindow=43200

# Quick health check (last 5 minutes)
mcp__context-kit__service_health timeWindow=300
```

### 5. Performance Analysis - 📋 Planned

```
# Get aggregated metrics by hour
mcp__context-kit__log_aggregate period="hour"

# Daily error counts
mcp__context-kit__log_aggregate level="ERROR" period="day"

# Service-specific metrics
mcp__context-kit__log_aggregate service="OrderService" period="hour"

# Time-range analysis
mcp__context-kit__log_aggregate startTime=1725299252 endTime=1725302852
```

## Advanced Use Cases

### 1. Incident Investigation

```
# Step 1: Find when issue started
mcp__context-kit__log_search query="error OR failed" limit=100

# Step 2: Focus on specific timeframe
mcp__context-kit__log_query level="ERROR" startTime=1725300000 endTime=1725301800

# Step 3: Analyze affected services
mcp__context-kit__log_aggregate level="ERROR" startTime=1725300000 endTime=1725301800

# Step 4: Find root cause traces
mcp__context-kit__log_search query="database AND timeout" startTime=1725300000 endTime=1725301800

# Step 5: Follow specific incident trace
mcp__context-kit__log_trace traceId="incident-trace-123"
```

### 2. Performance Monitoring

```
# Monitor error rates over time
mcp__context-kit__log_aggregate level="ERROR" period="hour"

# Check slow operations
mcp__context-kit__log_search query="slow OR timeout OR exceeded"

# Database performance issues
mcp__context-kit__log_search query="database" service="OrderService"

# External API issues
mcp__context-kit__log_search query="payment OR stripe OR api" level="ERROR"
```

### 3. User Experience Monitoring

```
# Failed user operations
mcp__context-kit__log_search query="user AND (failed OR error)"

# Authentication issues
mcp__context-kit__log_search query="auth OR login OR password" level="WARN"

# Specific user session issues
mcp__context-kit__log_query userId="user-456" level="ERROR"

# Session-related problems
mcp__context-kit__log_query sessionId="sess-789"
```

### 4. System Health Checks

```
# Daily health report
mcp__context-kit__service_health timeWindow=86400

# Service availability check
mcp__context-kit__log_search query="startup OR shutdown OR restart"

# Resource usage alerts
mcp__context-kit__log_search query="memory OR cpu OR disk" level="WARN"

# Configuration issues
mcp__context-kit__log_search query="config OR configuration" level="ERROR"
```

## Best Practices for AI Agents

### 1. Structured Logging

Always include relevant context in log entries:

```
# Good: Detailed context
mcp__context-kit__log_create level="ERROR" message="Order validation failed" service="OrderService" component="OrderValidator" traceId="req-123" data='{"orderId": "order-456", "customerId": "cust-789", "validationErrors": ["invalid_email", "missing_address"], "orderTotal": 99.99, "validationTimeMs": 45}'

# Avoid: Minimal context
mcp__context-kit__log_create level="ERROR" message="Validation failed" service="OrderService"
```

### 2. Consistent Naming

Use consistent service and component names:

```
# Service naming convention
service="OrderService"          # PascalCase for services
service="PaymentService"
service="UserManagementService"

# Component naming convention  
component="OrderController"     # PascalCase for components
component="DatabaseConnector"
component="EmailSender"
```

### 3. Meaningful Messages

Write clear, actionable log messages:

```
# Good: Clear and actionable
mcp__context-kit__log_create level="ERROR" message="Failed to send order confirmation email to customer" service="OrderService" component="EmailSender" data='{"orderId": "order-123", "customerEmail": "user@example.com", "smtpError": "Connection refused", "retryScheduled": true}'

# Avoid: Vague messages
mcp__context-kit__log_create level="ERROR" message="Email error" service="OrderService"
```

### 4. Appropriate Log Levels

Use log levels consistently:

```
# FATAL: System unusable
mcp__context-kit__log_create level="FATAL" message="Database connection pool exhausted, shutting down" service="OrderService"

# ERROR: Error conditions
mcp__context-kit__log_create level="ERROR" message="Payment processing failed for order" service="PaymentService"

# WARN: Warning conditions  
mcp__context-kit__log_create level="WARN" message="High memory usage detected, consider scaling" service="OrderService"

# INFO: Normal operations
mcp__context-kit__log_create level="INFO" message="Order processed successfully" service="OrderService"

# DEBUG: Detailed diagnostics
mcp__context-kit__log_create level="DEBUG" message="Cache hit for user preferences" service="UserService"
```

### 5. Correlation IDs

Always use trace IDs for request correlation:

```
# Generate trace ID at entry point
traceId="req-" + timestamp + "-" + randomString

# Use same trace ID throughout request flow
mcp__context-kit__log_create level="INFO" message="Request received" service="ApiGateway" traceId="req-1725302852-abc123"
mcp__context-kit__log_create level="INFO" message="Processing order" service="OrderService" traceId="req-1725302852-abc123"
mcp__context-kit__log_create level="INFO" message="Payment processed" service="PaymentService" traceId="req-1725302852-abc123"
```

These examples demonstrate comprehensive usage of the centralized logging system through MCP tools, enabling AI agents to effectively monitor, debug, and analyze system behavior.