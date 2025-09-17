# Centralized Logging System

A comprehensive logging solution that provides both AI agent integration via MCP tools and human-friendly log viewing through a React UI interface.

## Overview

The centralized logging system extends the tkr-context-kit knowledge graph with enterprise-grade logging capabilities:

- **Dual Interface**: AI agents access logs via MCP tools, humans via React UI
- **Real-time Monitoring**: Live log streaming with filtering and search
- **Structured Storage**: SQLite database with FTS5 full-text search
- **Service Health**: Monitor error rates and system performance
- **Mock Data Fallback**: Development-friendly with realistic sample data

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React UI      │────▶│   HTTP API      │────▶│   SQLite DB     │
│   (Human View)  │     │   (Port 42003)  │     │   + FTS5        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │                         ▲
                                ▼                         │
                        ┌─────────────────┐               │
                        │   MCP Tools     │───────────────┘
                        │  (AI Agents)    │
                        └─────────────────┘
```

## Key Components

### 1. Database Schema
- **`log_entries`**: Core log storage with structured data
- **`log_sources`**: Service/component registry
- **`log_aggregations`**: Pre-computed metrics for performance
- **FTS5 Virtual Tables**: Full-text search across messages and data

### 2. MCP Tools (AI Agent Interface) - 📋 Planned Feature
- `log_create`: Create new log entries
- `log_query`: Query logs with filters
- `log_search`: Full-text search across logs
- `log_aggregate`: Get metrics and aggregations
- `log_trace`: Follow request traces across services
- `service_health`: Monitor service health metrics

**Note**: MCP tools are currently planned but not yet integrated into the main MCP server. The logging system currently works through HTTP API endpoints and React UI.

### 3. React UI (Human Interface) - ✅ Fully Implemented
- **LogViewer**: LazyLog component with search and filtering
- **LogDashboard**: Main interface with service/level filters
- **LogFilters**: Separate component for filtering controls
- **Real-time Following**: Auto-refresh with 2-second polling
- **Dual View**: Toggle between Knowledge Graph and System Logs

### 4. HTTP API - ✅ Fully Implemented
- `GET /api/logs/stream`: Stream logs (text/json format)
- `GET /api/logs/services`: List available services
- `GET /api/logs/search`: Search logs with full-text
- `GET /api/logs/health`: Service health metrics
- `POST /api/logs`: Submit new log entries

## Documentation Structure

```
.context-kit/_ref/logging/
├── README.md                          # This overview
├── logging-implementation-plan.md     # Complete technical implementation
├── api-reference.md                   # HTTP API and MCP tools reference
├── usage-guide.md                     # User guide for both interfaces
└── examples/                          # Code examples and patterns
    ├── mcp-usage-examples.md
    ├── api-usage-examples.md
    └── integration-patterns.md
```

## Quick Start

### For Developers - ✅ Working
```bash
cd .context-kit/knowledge-graph

# Start the React UI (port 42001)
npm run dev

# Start the API server (port 42003) - in separate terminal
npm run dev:api
```

### For AI Agents - 📋 Planned Feature
```
# Note: MCP tools are not yet implemented. Use HTTP API instead.

# Create a log entry (planned)
mcp__context-kit__log_create level="INFO" message="System startup complete" service="MyService"

# Query recent errors (planned)
mcp__context-kit__log_query level="ERROR" timeWindow=3600

# Search for specific issues (planned)
mcp__context-kit__log_search query="timeout OR failed"
```

### For API Users - ✅ Working
```bash
# Get logs as text (works with mock data if no logs exist)
curl "http://localhost:42003/api/logs/stream?format=text&timeWindow=3600"

# Search logs (implemented with FTS5)
curl "http://localhost:42003/api/logs/search?q=error&format=json"

# Check service health (implemented)
curl "http://localhost:42003/api/logs/health"

# Submit a log entry (implemented)
curl -X POST "http://localhost:42003/api/logs" \
  -H "Content-Type: application/json" \
  -d '{"level":"INFO","message":"Test log","service":"TestService"}'
```

## Features

### ✅ **Core Capabilities - Fully Implemented**
- Structured logging with JSON data support
- Full-text search across all log content (FTS5)
- Real-time log streaming and following
- Service-based filtering and organization
- Log level classification (DEBUG→FATAL)
- Time-window based queries
- Mock data fallback for development

### 📋 **AI Agent Integration - Planned**
- 6 MCP tools for comprehensive log management
- Structured query capabilities with filters
- Automated service health monitoring
- Request tracing across distributed services
- Error pattern analysis and aggregation

### ✅ **Human Interface - Fully Implemented**
- Professional log viewer with LazyLog
- Advanced search and filtering controls
- Real-time log following with auto-refresh
- Service and log level filtering
- Responsive design with dark theme
- Dual view (Knowledge Graph + System Logs)

### 🚧 **Performance & Reliability - Partially Implemented**
- ✅ SQLite with FTS5 for efficient search
- ✅ Indexed queries for fast filtering
- ✅ Mock data fallback for development
- ✅ Error handling with graceful degradation
- 📋 Configurable retention policies (schema ready, cleanup not automated)

## Integration with tkr-context-kit

### ✅ Current Integration Status
- **HTTP API**: Fully integrated `/api/logs/*` endpoints in http-server.ts
- **React UI**: Fully integrated "System Logs" view alongside Knowledge Graph
- **Database**: Logging schema available in schemas/logging-schema.sql
- **Frontend Logging**: FrontendLogger service for React components

### 📋 Planned Integration
- **Knowledge Graph**: Logs can reference entities and relations
- **MCP Server**: Extend existing server with 6 new logging tools
- **Database Migration**: Automatic schema application and data migration

## Security & Privacy

- **Path Validation**: Follows existing tkr-context-kit security patterns
- **CORS Configuration**: Proper headers for cross-origin requests
- **Input Sanitization**: All user inputs are validated and sanitized
- **No Sensitive Data**: Automatic filtering of potential secrets
- **Local Storage**: All data remains on the local system

## Next Steps

1. **Review Documentation**: Start with `usage-guide.md` for practical examples
2. **API Reference**: See `api-reference.md` for complete endpoint documentation
3. **Integration Examples**: Check `examples/` for common usage patterns
4. **Testing**: Follow `test-logging.md` for comprehensive testing procedures

The centralized logging system provides enterprise-grade observability while maintaining the simplicity and self-contained nature of tkr-context-kit.