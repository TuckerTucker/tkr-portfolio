# Port Allocation Architecture Document

## Overview

This document defines the port allocation strategy for our localhost development environment. All services follow a systematic numbering scheme using the 42xxx port range to ensure consistency, avoid conflicts, and maintain clear service identification.

## Port Range Selection

**Primary Range:** 42000-42999

This range was selected because:
- Falls within the registered ports range (1024-49151)
- Avoids conflicts with well-known ports (0-1023)
- Stays clear of ephemeral/dynamic ports (49152-65535)
- Provides 1000 available ports for future expansion
- Creates an easily memorable pattern for developers

## Port Allocation Schema

### Core Infrastructure (42000-42099)
Reserved for essential system-wide services and management tools.

| Port | Service | Description | Protocol |
|------|---------|-------------|----------|
| 42000 | Main Dashboard | Central management portal and service directory | HTTP |
| 42001 | UI Dev Server | Knowledge graph UI development server (Vite) | HTTP |
| 42002 | Logging API | Centralized log aggregation and query service | HTTP |
| 42003 | HTTP API Server | Knowledge graph HTTP API for UI communication | HTTP |
| 42004 | Configuration API | Dynamic configuration management | HTTP |
| 42005-42099 | Reserved | Future core services | - |

### MCP Services (STDIO Protocol)
MCP servers use STDIO protocol, not TCP ports, but are listed for reference:

| Service | Description | Protocol | Location |
|---------|-------------|----------|----------|
| context-kit | Consolidated MCP server for all project operations | STDIO | `.context-kit/mcp/` |
| context7 | Third-party library ID resolution | STDIO | External |

### API Services (42100-42199)
REST and GraphQL APIs for business logic.

| Port | Service | Description |
|------|---------|-------------|
| 42100 | Main REST API | Primary application API gateway |
| 42101 | GraphQL API | GraphQL endpoint for flexible queries |
| 42102 | Webhook Service | Incoming webhook processor |
| 42103-42199 | Reserved | Additional API endpoints |

### Web Applications (42200-42299)
Frontend applications and user interfaces.

| Port | Service | Description |
|------|---------|-------------|
| 42200 | Main Web App | Primary user-facing application |
| 42201 | Admin Portal | Administrative interface |
| 42202 | Mobile Web App | Responsive mobile interface |
| 42203-42299 | Reserved | Additional web applications |

### Development/Staging (42300-42399)
Parallel environments for testing and staging.

| Port | Service | Description |
|------|---------|-------------|
| 42300 | Dev Server | Development server for hot-reload environments |
| 42301 | Staging API | Staging environment API |
| 42302-42399 | Reserved | Additional dev/staging services |

### Data Services (42400-42499)
Databases, caches, and data processing services.

| Port | Service | Description |
|------|---------|-------------|
| 42400 | PostgreSQL Proxy | Database connection proxy |
| 42401 | Redis Interface | Cache management interface |
| 42402 | ElasticSearch API | Search service endpoint |
| 42403-42499 | Reserved | Additional data services |

### Real-time Services (42500-42599)
WebSockets, message queues, and streaming services.

| Port | Service | Description |
|------|---------|-------------|
| 42500 | WebSocket Gateway | Primary WebSocket endpoint |
| 42501 | Message Queue UI | RabbitMQ/Kafka management |
| 42502 | Event Stream API | Server-sent events endpoint |
| 42503-42599 | Reserved | Additional real-time services |

### Testing/Temporary (42900-42999)
Ephemeral services for testing and experimentation.

| Port | Service | Description |
|------|---------|-------------|
| 42900 | Testing | Temporary test services |
| 42901-42999 | Dynamic | Additional temporary services |

### Legacy Services
Services using non-standard ports that should be migrated to the 42xxx range.

| Port | Service | Description | Migration Target |
|------|---------|-------------|------------------|
| *None* | *No legacy services currently identified* | | |

## Current Project-Kit Services

### Active Services:
- **42001**: Vite development server for knowledge graph UI (`.context-kit/knowledge-graph/`)
- **42003**: HTTP API server for knowledge graph operations
- **STDIO**: Project-kit MCP server (consolidated, not using TCP port)
- **STDIO**: Context7 MCP server (third-party library resolution)

### Service Configuration:
```yaml
# .context-kit/_context-kit.yml - Current port configuration
development:
  ports:
    services:
      ui_dev_server: 42001    # Vite dev server
      api_server: 42003       # HTTP API server
    
  mcp_servers:
    project_kit:
      protocol: "STDIO"
      location: ".context-kit/mcp/"
      tools: "mcp__context-kit__*"
    
    context7:
      protocol: "STDIO"  
      location: "external"
      tools: "mcp__context7__*"
```

## Implementation Guidelines

### 1. Service Configuration
All services must support configurable ports via environment variables:

```bash
# Default to assigned port, allow override
PORT=${PORT:-42001}
API_PORT=${API_PORT:-42003}
```

### 2. Docker Compose Example
```yaml
version: '3.8'
services:
  ui_dev:
    image: node:18
    working_dir: /app/.context-kit/knowledge-graph
    command: npm run dev
    ports:
      - "42001:42001"
    environment:
      - PORT=42001
      - VITE_API_URL=http://localhost:42003
  
  api_server:
    image: node:18
    working_dir: /app/.context-kit/knowledge-graph
    command: npm run api
    ports:
      - "42003:42003"
    environment:
      - PORT=42003
```

### 3. Port Conflict Detection
Use the centralized port checking system for comprehensive conflict detection:

```bash
# Use the project's port checking script
./.context-kit/scripts/check-ports.sh --verbose

# Or check specific ports programmatically
#!/bin/bash
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "Port $1 is already in use"
        exit 1
    fi
}

check_port 42001
check_port 42003
```

**Automated Port Configuration:**
The system automatically reads port assignments from `.context-kit/_context-kit.yml`:

```yaml
development:
  ports:
    services:
      ui_dev_server: 42001   # Vite development server  
      api_server: 42003      # HTTP API server
      dashboard: 42000       # Future: Main project dashboard
      api_gateway: 42100     # Future: API gateway
      web_app: 42200         # Future: Main web application
      dev_server: 42300      # Future: Additional dev server
      testing: 42900         # Testing services
```

### 4. Service Discovery
Service configuration is managed through the centralized `_context-kit.yml` system:

```yaml
# .context-kit/_context-kit.yml - centralized service configuration
development:
  ports:
    services:
      ui_dev_server: 42001   # Knowledge graph UI (Vite)
      api_server: 42003      # Knowledge graph HTTP API
      dashboard: 42000       # Future: Main project dashboard
      api_gateway: 42100     # Future: API services
      web_app: 42200         # Future: Main web application
      dev_server: 42300      # Future: Development server
      testing: 42900         # Temporary test services
    
    conflict_resolution:
      auto_increment: true   # Auto-find next available port
      check_script: ".context-kit/scripts/check-ports.sh"
      fallback_range: "42950-42999"
  
  mcp_servers:
    project_kit:
      protocol: "STDIO"
      entry: ".context-kit/mcp/dist/server.js"
      tools_prefix: "mcp__context-kit__"
    
    context7:
      protocol: "STDIO"
      external: true
      tools_prefix: "mcp__context7__"
```

### 5. Reverse Proxy Configuration
For production deployment, use nginx to map services to standard ports:

```nginx
server {
    listen 80;
    
    location / {
        proxy_pass http://localhost:42001;  # UI dev server
    }
    
    location /api {
        proxy_pass http://localhost:42003;  # API server
    }
    
    location /ws {
        proxy_pass http://localhost:42500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Port Assignment Process

1. **Check Registry**: Consult this document for the next available port in the appropriate range
2. **Verify Availability**: Ensure no system service is using the port
3. **Update Documentation**: Add the new service to this document
4. **Configure Service**: Set up the service with environment variable support
5. **Update Project YAML**: Add to `.context-kit/_context-kit.yml` configuration
6. **Test Integration**: Verify the service can communicate with other services

## Monitoring and Maintenance

### Centralized Port Management
The project includes a comprehensive port management system:

```bash
# Check all configured ports for conflicts
./.context-kit/scripts/check-ports.sh --verbose

# Check with automatic YAML configuration reading
./.context-kit/scripts/check-ports.sh --yaml .context-kit/_context-kit.yml

# Get suggested alternatives for conflicting ports
./.context-kit/scripts/check-ports.sh --fix
```

**Health Check Script:**
```bash
#!/bin/bash
# Enhanced service health checking using centralized configuration
source ./.context-kit/scripts/utils.sh

# Initialize project environment to get port configurations
init_project_env

# Read ports from YAML configuration
if command -v yq >/dev/null 2>&1; then
    YAML_PORTS=$(yq eval '.development.ports.services | to_entries | .[].value' "$PROJECT_CONFIG" 2>/dev/null)
    ports=()
    while IFS= read -r port; do
        [[ "$port" =~ ^[0-9]+$ ]] && ports+=("$port")
    done <<< "$YAML_PORTS"
else
    # Fallback to current ports
    ports=(42001 42003)
fi

for port in "${ports[@]}"; do
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health | grep -q "200"; then
        print_status "success" "✓ Service on port $port is healthy"
    else
        print_status "error" "✗ Service on port $port is not responding"
    fi
done
```

### Port Usage Report
Generate a report of all ports in use within our range:

```bash
netstat -tulpn 2>/dev/null | grep -E ":(420[0-9]{2}|42[1-9][0-9]{2})" | awk '{print $4}' | sort
```

## MCP Server Protocol Clarification

### STDIO vs TCP Ports:
- **MCP Servers**: Use STDIO protocol for communication with Claude Code
- **No TCP Ports**: MCP servers don't bind to network ports
- **Process Communication**: Communication happens through stdin/stdout
- **Configuration**: Defined in `.claude/claude_desktop_config.json`

### Current MCP Configuration:
```json
{
  "mcpServers": {
    "context-kit": {
      "command": "node",
      "args": [".context-kit/mcp/dist/server.js"],
      "cwd": "/path/to/project"
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@context7/mcp-server"],
      "cwd": "/path/to/project"
    }
  }
}
```

## Security Considerations

1. **Localhost Only**: By default, services should bind to 127.0.0.1, not 0.0.0.0
2. **Firewall Rules**: Ensure firewall blocks external access to the 42xxx range
3. **Authentication**: Services should validate auth tokens even in development
4. **HTTPS in Production**: Use TLS termination at the reverse proxy level
5. **MCP Security**: STDIO-based MCP servers are isolated from network access

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Find process using port
lsof -i :42001
# or
netstat -tulpn | grep 42001
```

**Service Discovery Failures**
- Verify service is running: `curl http://localhost:42001/`
- Check environment variables are set correctly
- Ensure `.context-kit/_context-kit.yml` is up to date

**Cross-Service Communication**
- Use full URLs including port: `http://localhost:42003/api/v1/data`
- Consider using environment variables for service URLs
- Implement retry logic for service startup race conditions

**MCP Server Issues**
- MCP servers don't use network ports - check process status instead
- Verify STDIO communication: `pgrep -f "context-kit"`
- Check Claude Code configuration and restart if needed

## Future Considerations

1. **Service Mesh**: Consider implementing Consul or similar for dynamic service discovery
2. **Port Ranges**: Reserve additional ranges (43xxx, 44xxx) for future expansion
3. **Automated Assignment**: Build tooling to automatically assign and track ports
4. **Development Containers**: Create a dev container specification with all ports pre-configured
5. **MCP Extensions**: Consider HTTP-based MCP server alternatives for specific use cases

---

*Document Version: 2.0*  
*Last Updated: 2025-08-03*  
*Maintained by: TKR Project Kit Team*