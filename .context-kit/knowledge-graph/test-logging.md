# Centralized Logging Test Instructions

## ✅ Implementation Complete

The centralized logging system is now fully implemented with:

1. **SQLite Database**: Extended with logging tables and FTS5 search
2. **MCP Tools**: 6 new tools for AI agents to interact with logs
3. **HTTP API**: Endpoints for log streaming, search, and service health  
4. **React UI**: LazyLog viewer with filtering and real-time following
5. **Mock Data**: Fallback data when no real logs exist

## 🧪 Testing Steps

### 1. Start the Development Servers

```bash
cd .context-kit/knowledge-graph

# Terminal 1: Start the React UI
npm run dev:ui

# Terminal 2: Start the API server  
npm run dev:api
```

### 2. Access the UI

Open http://localhost:42001 in your browser

1. Click "📝 System Logs" button in the header
2. You should see mock log data in the LazyLog viewer
3. Try the filters:
   - Service: All Services / React UI / MCP Server / API Server
   - Level: All Levels / Fatal / Error / Warning / Info / Debug
   - Time Window: 5 minutes / 15 minutes / 1 hour / 6 hours / 24 hours

### 3. Test MCP Tools with Claude

Use the MCP tools to create and query logs:

```
# Create a log entry
mcp_tkr-knowledge-graph_log_create level="INFO" message="Test log from Claude" service="Claude Test"

# Query logs
mcp_tkr-knowledge-graph_log_query service="Claude Test"

# Search logs
mcp_tkr-knowledge-graph_log_search query="Test"

# Get service health
mcp_tkr-knowledge-graph_service_health
```

### 4. API Endpoints

Test the HTTP API directly:

```bash
# Get services
curl http://localhost:42003/api/logs/services

# Get logs as text
curl "http://localhost:42003/api/logs/stream?format=text"

# Get logs as JSON
curl "http://localhost:42003/api/logs/stream?format=json"

# Search logs
curl "http://localhost:42003/api/logs/search?q=error&format=text"

# Service health
curl http://localhost:42003/api/logs/health
```

## 🎯 Key Features

- **Real-time Following**: LazyLog auto-refreshes every 2 seconds when "Auto-follow" is checked
- **Color Coding**: Log levels are color-coded (ERROR=red, WARN=yellow, INFO=blue, DEBUG=gray)
- **Full-text Search**: Use the search box in LazyLog to find specific logs
- **Service Filtering**: Filter by service to focus on specific components
- **Mock Data**: When no real logs exist, the system shows realistic mock data

## 🐛 Troubleshooting

1. **"Failed to fetch logs" error**: Make sure the API server is running on port 42003
2. **Empty log viewer**: The system shows mock data when no real logs exist
3. **React errors**: Fixed the LazyLog formatPart issue - should work now

## 📊 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React UI  │────▶│  HTTP API   │────▶│   SQLite    │
│  (LazyLog)  │     │  (42003)    │     │  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  MCP Tools  │
                    │ (AI Agents) │
                    └─────────────┘
```

The system provides both human-friendly log viewing (React UI) and AI agent access (MCP tools).