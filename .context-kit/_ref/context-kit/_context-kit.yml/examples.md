# Context-Kit YAML Examples and Best Practices

Real-world examples and patterns for generating optimal Context-Kit YAML files.

## Table of Contents

- [Minimal Project Example](#minimal-project-example)
- [Development Toolkit Example](#development-toolkit-example)
- [React Component Library Example](#react-component-library-example)
- [Multi-Service Architecture Example](#multi-service-architecture-example)
- [Best Practices by Project Type](#best-practices-by-project-type)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

---

## Minimal Project Example

Basic structure for a simple project:

```yaml
# Project configuration for AI agents - simple-api
# Optimized per Repo-Context Format v1.0 - YAML 1.2 compliant
meta:
  kit: simple-api
  fmt: 1
  type: application
  desc: "REST API for todo management"
  ver: "1.0.0"
  ts: "2025-09-30T14:30:00Z"
  status: production-ready
  entry: "main.py"

deps: &deps
  py:
    prod:
      fastapi: {id: "ctx7-12345", v: "^0.104.0"}
      uvicorn: {id: "ctx7-12346", v: "^0.24.0"}
    dev:
      pytest: {id: "ctx7-12347", v: "^7.4.0"}

struct:
  _: {n: 8, t: {py: 6, txt: 1, md: 1}}
  main.py: tracked
  models.py: tracked
  database.py: tracked
  tests:
    _: {n: 3}
    files: [test_api.py, test_models.py, test_db.py]
  requirements.txt: tracked
  README.md: tracked

arch:
  stack: "FastAPI + SQLite + pytest"
  patterns:
    - "RESTful API design"
    - "Dependency injection"

ops:
  paths:
    "main.py": "Application entry point"
    "models.py": "Pydantic data models"
    "database.py": "SQLite operations"

semantic:
  ~simple_crud: "Basic CRUD operations on single entity"
  ~sqlite_backend: "File-based SQLite database"
```

**Token count:** ~180 tokens (vs ~450 unoptimized, 60% reduction)

---

## Development Toolkit Example

Structure for development tools and utilities:

```yaml
# Project configuration for AI agents - dev-toolkit
# Optimized per Repo-Context Format v1.0 - YAML 1.2 compliant
meta:
  kit: dev-toolkit
  fmt: 14
  type: development-toolkit
  desc: "Multi-service development toolkit with MCP integration"
  ver: "2.0.0"
  ts: "2025-09-30T15:00:00Z"
  status: production-ready
  stack: &tech-stack "TypeScript + Node.js + SQLite + MCP"
  cmds: ["npm run build", "npm run serve", "./scripts/start-all"]

deps: &deps
  js: &js-deps
    prod:
      typescript: &ts-dep {id: "ctx7-001", v: "^5.2.2"}
      better-sqlite3: {id: "ctx7-002", v: "^9.0.0"}
      "@modelcontextprotocol/sdk": {id: "ctx7-003", v: "^0.5.0"}
    dev:
      vitest: &vitest {id: "ctx7-004", v: "^1.0.0"}
      "@vitest/coverage-v8": {<<: *vitest}

struct:
  _: {n: 45, t: {ts: 20, js: 10, md: 8, json: 5, sh: 2}}
  src:
    _: {n: 30, t: {ts: 20, js: 10}}
    server: {n: 8, files: [server.ts, types.ts, handlers.ts]}
    tools: {n: 12, files: [dev.ts, build.ts, test.ts]}
    utils: {n: 10, files: [logger.ts, config.ts, db.ts]}
  scripts:
    _: {n: 5, t: {sh: 2, js: 3}}
    files: [start-all, stop-all, dev]
  package.json: tracked
  tsconfig.json: tracked

arch:
  stack: *tech-stack
  patterns:
    - "Service-Oriented Architecture"
    - "TypeScript strict mode"
    - "MCP protocol integration"

  services:
    mcp-server:
      type: "MCP STDIO server"
      responsibility: "AI model context protocol"
      features: ["Entity management", "Tool execution"]
      build: "TypeScript compilation"

ops:
  paths:
    "src/server/": "MCP server implementation"
    "src/tools/": "Development tools"
    "scripts/": "Utility scripts"

  build_patterns:
    multi_module: "Independent TypeScript compilation"

  port_allocation:
    scheme: "42xxx for all services"

semantic:
  ~mcp_integration: "Model Context Protocol server for AI agents"
  ~typescript_strict: "Strict TypeScript for type safety"
```

**Token count:** ~320 tokens (vs ~850 unoptimized, 62% reduction)

---

## React Component Library Example

Structure for UI component libraries with design system:

```yaml
# Project configuration for AI agents - ui-library
# Optimized per Repo-Context Format v1.0 - YAML 1.2 compliant
meta:
  kit: ui-library
  fmt: 1
  type: library
  desc: "React component library with W3C design tokens"
  ver: "1.5.0"
  ts: "2025-09-30T16:00:00Z"
  status: production-ready
  stack: "React 18 + TypeScript + Tailwind + Storybook"

deps: &deps
  js: &js-deps
    prod:
      react: &react-dep {id: "ctx7-101", v: "^18.2.0"}
      react-dom: {<<: *react-dep}
      clsx: {id: "ctx7-102", v: "^2.0.0"}
    dev:
      "@types/react": {id: "ctx7-103", v: "^18.2.43"}
      storybook: {id: "ctx7-104", v: "^7.5.0"}
    peer:
      react: {<<: *react-dep}
      react-dom: {<<: *react-dep}

struct:
  _: {n: 60, t: {tsx: 25, ts: 15, css: 10, md: 5, json: 3}}
  src:
    _: {n: 50, t: {tsx: 25, ts: 15, css: 10}}
    components:
      _: {n: 35}
      Button: [.tsx, .test.tsx, .stories.tsx, .module.css]
      Card: [.tsx, .test.tsx, .stories.tsx, .module.css]
      Input: [.tsx, .test.tsx, .stories.tsx, .module.css]
    hooks: {n: 8, files: [useTheme.ts, useMedia.ts]}
    utils: {n: 7, files: [cn.ts, types.ts]}
  stories:
    _: {n: 10, t: {md: 5, tsx: 5}}

design:
  tokens:
    color: &colors
      bg:
        primary: &bg-primary {val: "#ffffff", type: color, desc: "Main bg"}
        secondary: {val: "#f5f5f5", type: color, desc: "Card bg"}
      text:
        primary: &text-primary {val: "#1a1a1a", type: color, desc: "Body text"}
        secondary: {val: "#666666", type: color, desc: "Muted text"}
      interactive:
        primary: {val: "#0066cc", type: color, desc: "Primary actions"}
        hover: {val: "#0052a3", type: color, desc: "Hover state"}

    spacing: &spacing
      xs: {val: "0.25rem", type: dimension, desc: "4px"}
      sm: {val: "0.5rem", type: dimension, desc: "8px"}
      md: {val: "1rem", type: dimension, desc: "16px"}
      lg: {val: "1.5rem", type: dimension, desc: "24px"}
      xl: {val: "2rem", type: dimension, desc: "32px"}

  comp:
    Button:
      p: {variant: [primary, secondary, ghost], size: [sm, md, lg], disabled: boolean}
      s: [default, hover, active, disabled, loading]
      a11y: {role: button, kbd: [Enter, Space]}

    Card:
      p: {elevation: [flat, raised, floating], padding: [sm, md, lg]}
      s: [default, hover]
      a11y: {role: article}

    Input:
      p: {type: [text, email, password], size: [sm, md, lg], error: boolean}
      s: [default, focus, error, disabled]
      a11y: {role: textbox, kbd: [Tab, Enter]}

  a11y:
    compliance: "WCAG 2.1 AA"
    focus: {style: "2px solid", color: *text-primary}

  metadata:
    version: "1.5.0"
    framework: "React 18"
    styling: "Tailwind CSS"
    token_format: "W3C Design Token Format 3.0"
    components_analyzed: 3

arch:
  patterns:
    - "Compound component pattern"
    - "Controlled/uncontrolled components"
    - "Design token system"

ops:
  paths:
    "src/components/": "React components"
    "src/hooks/": "Custom React hooks"
    "stories/": "Storybook documentation"

semantic:
  ~design_system: "W3C-compliant token-based design system"
  ~a11y_first: "Accessibility-first component design"
  ~compound_pattern: "Flexible compound component API"
```

**Token count:** ~480 tokens (vs ~1200 unoptimized, 60% reduction)

---

## Multi-Service Architecture Example

Structure for projects with multiple coordinated services:

```yaml
# Project configuration for AI agents - app-platform
# Optimized per Repo-Context Format v1.0 - YAML 1.2 compliant
meta:
  kit: app-platform
  fmt: 14
  type: monorepo
  desc: "Multi-service application platform with dashboard, API, and workers"
  ver: "3.0.0"
  ts: "2025-09-30T17:00:00Z"
  status: production-ready
  stack: &tech-stack "React + Node.js + PostgreSQL + Redis + Docker"
  cmds: ["docker-compose up", "npm run dev", "npm run test:all"]

deps: &deps
  js: &js-deps
    prod:
      react: &react-dep {id: "ctx7-201", v: "^18.2.0"}
      express: &express-dep {id: "ctx7-202", v: "^4.18.0"}
      pg: {id: "ctx7-203", v: "^8.11.0"}
      redis: {id: "ctx7-204", v: "^4.6.0"}
      bull: {id: "ctx7-205", v: "^4.11.0"}
    dev:
      vitest: &vitest {id: "ctx7-206", v: "^1.0.0"}
      supertest: {id: "ctx7-207", v: "^6.3.0"}

struct:
  _: {n: 180, t: {ts: 70, tsx: 30, js: 40, sql: 15, md: 10}, modules: 3}

  services:
    _: {n: 150}
    dashboard:
      _: {n: 50, t: {tsx: 25, ts: 15, css: 10}, port: 42001}
      src:
        components: {n: 30}
        hooks: {n: 10}
        utils: {n: 10}

    api:
      _: {n: 60, t: {ts: 50, sql: 10}, port: 42002}
      src:
        routes: {n: 15, files: [users.ts, auth.ts, data.ts]}
        middleware: {n: 8, files: [auth.ts, error.ts, validate.ts]}
        models: {n: 12}
        db: {n: 10, files: [connection.ts, migrations/]}

    workers:
      _: {n: 40, t: {ts: 35, js: 5}, port: 42003}
      src:
        jobs: {n: 20, files: [email.ts, reports.ts, cleanup.ts]}
        queue: {n: 10}
        utils: {n: 10}

  shared:
    _: {n: 30, t: {ts: 25, json: 5}}
    types: {n: 15, files: [user.ts, api.ts, events.ts]}
    utils: {n: 10}

arch:
  stack: *tech-stack
  patterns:
    - "Microservices architecture"
    - "Event-driven job processing"
    - "Shared TypeScript types"
    - "Docker containerization"

  services:
    dashboard:
      type: "React SPA"
      port: 42001
      responsibility: "User interface"
      features: ["Real-time updates", "Data visualization"]
      build: "Vite + React"

    api:
      type: "Express REST API"
      port: 42002
      responsibility: "Business logic and data access"
      features: ["Authentication", "CRUD operations", "WebSocket support"]
      build: "TypeScript + Express"

    workers:
      type: "Bull queue workers"
      port: 42003
      responsibility: "Background job processing"
      features: ["Email sending", "Report generation", "Data cleanup"]
      build: "TypeScript + Bull"

ops:
  service_patterns:
    development:
      dashboard: "cd services/dashboard && npm run dev"
      api: "cd services/api && npm run dev"
      workers: "cd services/workers && npm run dev"
      all: "docker-compose up"

    production:
      build: "docker-compose build"
      deploy: "docker-compose up -d"

  port_allocation: &ports
    dashboard: 42001
    api: 42002
    workers: 42003
    postgres: 5432
    redis: 6379
    scheme: "42xxx for application services"

  common_patterns:
    shared_types: "TypeScript types shared across services"
    event_bus: "Redis pub/sub for service communication"
    health_checks: "HTTP endpoints for service health monitoring"

semantic:
  ~microservices: "Independent services with clear boundaries"
  ~event_driven: "Asynchronous job processing via Bull queues"
  ~port_consistency: "42xxx allocation for all application services"
  ~shared_types: "Type-safe communication with shared TypeScript definitions"
```

**Token count:** ~580 tokens (vs ~1500 unoptimized, 61% reduction)

---

## Best Practices by Project Type

### Simple Applications

**Focus:** Clarity over aggressive compression

```yaml
meta:
  kit: app-name
  fmt: 1
  type: application
  desc: "Clear, concise description"
  ver: "1.0.0"
  ts: "2025-09-30T14:30:00Z"

# Use basic compression
deps:
  lang:
    prod: {pkg1: {id: "...", v: "..."}}
    dev: {pkg2: {id: "...", v: "..."}}

# Simple structure
struct:
  _: {n: total, t: {ext: count}}
  file.ext: tracked
```

**Priorities:**
1. Readability
2. Completeness
3. Token efficiency

### Libraries

**Focus:** API documentation and design system

```yaml
meta:
  type: library
  desc: "What it provides and who uses it"

# Document peer dependencies
deps:
  js:
    peer:  # Important for libraries
      package: {id: "...", v: "..."}

# Emphasize public API
struct:
  src:
    components: {n: X}  # Public components
    internal: {n: Y}    # Private utilities

# Full design system
design:
  tokens: [...]
  comp: [...]
  a11y: [...]
```

**Priorities:**
1. API documentation
2. Design system completeness
3. Peer dependencies clarity

### Development Toolkits

**Focus:** Service architecture and orchestration

```yaml
meta:
  type: development-toolkit
  cmds: ["key", "commands", "list"]

# Service organization
arch:
  services:
    service-name:
      type: "..."
      port: 42xxx
      responsibility: "..."

# Operational patterns
ops:
  service_patterns: [...]
  port_allocation: [...]
```

**Priorities:**
1. Service architecture clarity
2. Port allocation consistency
3. Command documentation

### Monorepos

**Focus:** Module relationships and shared dependencies

```yaml
meta:
  type: monorepo
  modules: X

# Module structure
struct:
  packages:
    pkg-a: {n: X, deps: [shared]}
    pkg-b: {n: Y, deps: [shared]}
  shared: {n: Z}

# Shared dependencies
deps:
  internal:
    "@org/shared": {type: workspace, path: "..."}
```

**Priorities:**
1. Module boundaries
2. Shared dependencies
3. Build coordination

---

## Common Patterns

### Anchors for Versions

When multiple packages share versions:

```yaml
deps:
  js:
    prod:
      react: &react-dep {id: "ctx7-001", v: "^18.2.0"}
      react-dom: {<<: *react-dep}
    peer:
      react: {<<: *react-dep}  # Same version
      react-dom: {<<: *react-dep}
```

### Component Families

Group related components:

```yaml
design:
  comp:
    # Button family
    Button: &button-base
      p: {variant: [primary, secondary], size: [sm, md, lg]}
      s: [default, hover, active, disabled]

    IconButton:
      <<: *button-base  # Inherit base props
      p: {icon: string}  # Add specific props
```

### Service Port Patterns

Consistent port allocation:

```yaml
ops:
  port_allocation: &ports
    # 42xxx scheme
    dashboard: 42001
    api: 42002
    workers: 42003
    mcp: 42004

arch:
  services:
    dashboard:
      port: *ports.dashboard  # Reference specific port
```

### Token Reference

Reference tokens in component specs:

```yaml
design:
  tokens:
    color: &colors
      text:
        primary: &text-primary {val: "#1a1a1a", type: color}

  comp:
    Button:
      design_tokens: [*text-primary]  # Reference token
```

---

## Troubleshooting

### Common Issues

**Issue:** Anchor not found error

```yaml
# ❌ Problem
arch:
  stack: *tech-stack  # Error: anchor not defined yet

meta:
  stack: &tech-stack "..."

# ✅ Solution: Define anchor first
meta:
  stack: &tech-stack "..."

arch:
  stack: *tech-stack
```

**Issue:** YAML syntax error on timestamp

```yaml
# ❌ Problem
meta:
  ts: 2025-09-30T14:30:00Z  # Syntax error

# ✅ Solution: Add quotes
meta:
  ts: "2025-09-30T14:30:00Z"
```

**Issue:** Over-compressed and unclear

```yaml
# ❌ Problem
c:
  B: {p: {v: [p, s], s: [s, m]}, s: [d, h]}

# ✅ Solution: Balance compression
comp:
  Button:
    p: {variant: [primary, secondary], size: [sm, md]}
    s: [default, hover]
```

**Issue:** Inconsistent abbreviations

```yaml
# ❌ Problem
struct:
  components: {n: 25}  # Full name
  comp: {n: 15}        # Abbreviated

# ✅ Solution: Be consistent
struct:
  comp: {n: 25}
  utils: {n: 15}
```

### Validation Commands

```bash
# Check YAML syntax
yq eval '.' .context-kit/_context-kit.yml

# Verify anchor resolution
yq eval '.deps.js.prod' .context-kit/_context-kit.yml

# Count tokens (rough estimate)
wc -w .context-kit/_context-kit.yml

# Check for common issues
grep -E 'ts:|v:' .context-kit/_context-kit.yml | grep -v '"'
```

---

## See Also

- [specification.md](./specification.md) - Full format specification
- [compression-techniques.md](./compression-techniques.md) - Detailed compression strategies
- [v2.md](./v2.md) - Original Repo-Context Format specification
