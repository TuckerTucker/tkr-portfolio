# AI Agent-Optimized YAML Specification

## Purpose
This specification defines a YAML structure optimized for AI agent context windows. It prioritizes navigation efficiency, pattern recognition, and task-oriented information while minimizing verbosity.

## Core Principle: Maximum Utility, Minimum Tokens

Unlike human-oriented documentation, AI agents need:
- **Quick navigation** to find files and understand structure
- **Pattern references** to maintain consistency
- **Semantic markers** over verbose explanations
- **Task-oriented context** relevant to their current work

## Essential Context Structure

### 1. Project Identity & Purpose
```yaml
project:
  name: "Project Name"
  type: "web-app|library|tool|framework|platform"
  description: "What this project does and why it exists"
  entry_point: "src/main.ts"  # Where code execution begins
  primary_commands: ["build", "test", "dev", "lint"]
```

**Purpose**: Immediate orientation about what the project is and how to interact with it.

### 2. Navigation Map
```yaml
structure:
  key_paths:
    - "src/": "Application source code"
      - "components/": "UI components by complexity (ui/, forms/, features/)"
      - "pages/": "Route-level components"
      - "api/": "API client and endpoints"
      - "types/": "TypeScript definitions"
      - "hooks/": "Custom React hooks"
      - "utils/": "Pure utility functions"
    - "tests/": "Test files parallel to src structure"
    - "docs/": "Human documentation (if relevant to code)"
  
  find_patterns:
    component: "src/components/{complexity}/{ComponentName}.tsx"
    page: "src/pages/{PageName}.tsx"
    api_endpoint: "src/api/{resource}.ts"
    type_definition: "src/types/{domain}.ts"
    hook: "src/hooks/use{HookName}.ts"
    test: "tests/{path}/{name}.test.ts"
```

**Purpose**: Enables agents to quickly locate files based on type and purpose.

### 3. Architecture Patterns
```yaml
patterns:
  component_hierarchy: "functional components with React 19 hooks"
  state_location: "useState for local, Context for shared, URL hash for routing"
  error_boundaries: "At feature level with graceful fallbacks"
  file_naming: "PascalCase components, camelCase utilities, kebab-case files"
  import_conventions: "ES6 modules, relative imports for same directory"
  data_flow: "Props down, events up, centralized state for cross-cutting"
  testing_pattern: "Unit for logic, integration for features, E2E for flows"
  
  # ReactFlow visualization patterns
  reactflow_patterns: "Custom node types, dynamic layouts, interactive controls"
  url_routing: "Hash-based navigation with browser history support"
  component_separation: "Props-based communication, single responsibility"
  state_management: "Centralized in App component, props-based distribution"
  
  # Agent Architecture Patterns
  agent_architecture: "specialized analyzers with consolidation pattern"
  security_model: "path validation with allowlist protection"
  mcp_integration: "STDIO transport with JSON schema validation"
  port_allocation: "42xxx range with conflict detection"
```

**Purpose**: Defines conventions agents must follow when creating or modifying code.

### 4. Technology Context
```yaml
stack:
  language: "TypeScript strict mode + Bash scripting"
  framework: "React 19 with Vite"
  styling: "CSS Custom Properties with component scoping"
  state: "React useState + Context + URL hash routing"
  testing: "Vitest + React Testing Library"
  visualization: "ReactFlow with custom node types and layouts"
  
  # MCP and Security Context
  protocol: "MCP (Model Context Protocol) over STDIO"
  persistence: "SQLite+FTS5 full-text search with database storage"
  security: "Path allowlist validation with input sanitization"
  
  key_libs:
    - "react@^19.1.1": "Modern React with concurrent features"
    - "reactflow@^11.11.4": "Interactive graph visualization"
    - "better-sqlite3@^9.0.0": "SQLite database with FTS5 search"
    - "@modelcontextprotocol/sdk@^0.5.0": "AI model integration protocol"
    - "vite@^7.0.6": "Fast build tool with HMR"
    - "typescript@>=4.5.0": "Type-safe development"
```

**Purpose**: Technology constraints, security requirements, and available tools for code generation.

## Conditional Context Structure

### Integration Details (When Working with External Systems)
```yaml
integrations:
  auth:
    type: "JWT with refresh"
    location: "src/auth/"
    entry: "src/auth/AuthProvider.tsx"
    
  api:
    type: "REST with React Query"
    location: "src/api/"
    client: "src/api/client.ts"
    
  # MCP (Model Context Protocol) Integration Pattern
  ai_models:
    type: "MCP protocol over STDIO"
    location: ".context-kit/knowledge-graph/"
    entry: "src/mcp/server.ts"
    db_path: ".context-kit/knowledge-graph/knowledge-graph.db"
    storage: "SQLite+FTS5 with entity/relation/observation tables"
    ui_viz:
      type: "ReactFlow with Vite dev server"
      port: "42001 (Vite dev server)"
      api_port: "42003 (HTTP API server)"
      layouts: [circular, grid, hierarchical]
      routing: "Hash-based navigation (#graph, #logs)"
    
  # Claude Code Agent Integration
  claude_code:
    agents: ".claude/agents/"
    commands: ".claude/commands/"
    config: ".claude/settings.local.json"
    permissions: ["Read", "Write", "Task", "mcp__*"]
    
  external:
    - service: "Stripe"
      location: "src/payments/"
    - service: "S3"
      location: "src/storage/"
```

### Code Generation Hints (When Creating New Code)
```yaml
when_creating:
  new_react_component:
    check_patterns: ".context-kit/knowledge-graph/src/ui/components/"
    follow_structure: "Props interface → functional component → export"
    modern_patterns: "React 19 hooks, props-based state, URL hash routing"
    
  new_reactflow_component:
    example: ".context-kit/knowledge-graph/src/ui/components/NodeTypes.tsx"
    pattern: "Custom node types → ReactFlow integration → event handling"
    
  new_ui_view:
    location: ".context-kit/knowledge-graph/src/ui/App.tsx"
    routing: "URL hash-based navigation with browser history"
    pattern: "View component with centralized state management"
    
  new_reactflow_layout:
    example: ".context-kit/knowledge-graph/src/ui/services/KnowledgeGraphService.ts"
    pattern: "Data transformation → Layout algorithm → ReactFlow nodes/edges"
    
  # Agent and MCP Patterns
  new_agent:
    check_patterns: ".claude/agents/project-yaml-consolidator.md"
    follow_structure: "Purpose → Tools → Instructions → Best practices"
    
  new_mcp_tool:
    example: ".context-kit/knowledge-graph/src/mcp/server.ts"
    pattern: "Define tool schema → Implement handler → Add to server tools array"
    storage: "SQLite operations with entity/relation management"
    
  new_command:
    location: ".claude/commands/"
    pattern: "Define invocation → Set parameters → Document usage"
```

## Compression Techniques

### Semantic Markers
```yaml
# Instead of verbose descriptions
components:
  Button: "ui/atomic/stateless/styled"
  UserProfile: "feature/stateful/api-connected/authenticated"
  DataTable: "organism/complex/virtualized/sortable"

# Semantic keys for complex concepts (tilde-prefixed)
semantic_keys:
  ~mcp: "Model Context Protocol for AI model integration"
  ~agent_analyzer: "Specialized Claude Code agent for project analysis with consolidation"
  ~kg: "Comprehensive app state management system using SQLite with ReactFlow visualization"
  ~port_42xxx: "Organized port allocation schema (UI:42001, API:42003) for tkr-context-kit services"
  ~security_validation: "Path traversal protection with allowlist directories"
  ~reactflow_viz: "Interactive graph visualization with multiple layouts and custom node types"
  ~self_destructing: "Setup script that removes itself after successful execution"
  ~sqlite_storage: "SQLite database with FTS5 for efficient knowledge graph persistence"
  ~consolidator_pattern: "Multiple specialized agents (docs-context7, dir-structure, design-system) feeding into single consolidator"
  ~hash_routing: "URL hash-based view switching with browser navigation support"
  ~centralized_state: "React state management pattern with props-based communication"
  ~component_separation: "UI component modularization with single responsibility principle"
```

### Pattern References
```yaml
# Instead of explaining each implementation
all_components_follow: "atomic-design"
all_api_calls_use: "react-query"
all_forms_implement: "controlled-inputs"
all_routes_require: "auth-wrapper"
```

### Location Formulas
```yaml
# Dynamic path templates
file_locations:
  component: "{name}.tsx → src/components/{category}/{name}.tsx"
  test: "{name}.test.tsx → tests/{mirror-src-path}/{name}.test.tsx"
  story: "{name}.stories.tsx → src/components/{category}/{name}.stories.tsx"
  agent: "{agent-name}.md → .claude/agents/{agent-name}.md"
  mcp_tool: "{tool}.ts → .context-kit/mcp-{service}/{tool}.ts"
  
# Wildcard consolidation for file patterns
structure_patterns:
  "**/components/**/*.tsx": "ui_components"
  "**/agents/**/*.md": "claude_agents"
  "**/mcp-*/**/*.ts": "mcp_servers"
  "**/scripts/**/*": "automation_scripts"
```

## Task-Oriented Helpers

### Common Task Maps
```yaml
task_locations:
  add_new_react_view:
    files: [".context-kit/knowledge-graph/src/ui/App.tsx"]
    pattern: "Add view state → Update URL routing → Create view component"
    
  modify_reactflow_visualization:
    files: [".context-kit/knowledge-graph/src/ui/services/KnowledgeGraphService.ts"]
    pattern: "Update data transformation → Modify layout → Update node types"
    
  create_ui_component:
    files: [".context-kit/knowledge-graph/src/ui/components/", ".context-kit/knowledge-graph/src/ui/styles.css"]
    pattern: "Component → Props interface → Styling → Integration"
    
  modify_sqlite_schema:
    files: [".context-kit/knowledge-graph/src/core/database.ts", ".context-kit/knowledge-graph/schemas/"]
    pattern: "Update schema → Migration script → Update types → Test"
    
  # Agent and Project Analysis Tasks
  add_new_agent:
    files: [".claude/agents/{agent-name}.md"]
    pattern: "Define purpose → List tools → Set responsibilities"
    
  analyze_codebase:
    files: [".claude/commands/project-yaml.md"]
    pattern: "Run /project-yaml command → Generate consolidated YAML"
    
  setup_knowledge_graph:
    files: [".context-kit/knowledge-graph/", ".claude/settings.local.json"]
    pattern: "Setup MCP server → Configure Claude → Create entities/relations"
    
  run_ui_dev:
    files: [".context-kit/knowledge-graph/"]
    pattern: "cd .context-kit/knowledge-graph → npm run dev → Open localhost:42001"
```

### Quick Reference Patterns
```yaml
common_patterns:
  loading_state: "Centralized loading state in App component with conditional rendering"
  error_handling: "Error boundaries with retry actions and fallback to mock data"
  data_fetching: "KnowledgeGraphService with live/mock toggle for development"
  state_management: "Centralized state in App component, props-based distribution"
  url_routing: "Hash-based navigation with browser history support"
  component_communication: "Props down, callbacks up, centralized event handling"
  
  # ReactFlow Patterns
  reactflow_integration: "Custom node types, dynamic layouts, interactive controls"
  node_visualization: "Color-coded node types with icons and semantic styling"
  graph_interaction: "Click handlers, search/filter, detail panels"
  layout_algorithms: "Circular, grid, hierarchical positioning with dynamic sizing"
  
  # Agent and MCP Patterns
  agent_invocation: "Use Task tool with specific agent parameters"
  path_validation: "Always validate against allowlist in MCP server"
  knowledge_persistence: "Store as entities/relations/observations in SQLite+FTS5"
  security_first: "Validate all inputs and prevent directory traversal"
  project_analysis: "Run /project-yaml command for updated analysis"
  sqlite_operations: "Entity/relation CRUD with FTS5 search capabilities"
```

## Usage Guidelines

### What to Include
- **Navigation essentials**: How to find any file type
- **Pattern definitions**: Conventions that must be followed
- **Technology constraints**: What's available to use
- **Task-specific helpers**: Common modification patterns
- **MCP integration details**: Server configurations and tool definitions
- **Agent architecture**: Specialized analysis and consolidation patterns
- **Security patterns**: Path validation and input sanitization

### What to Exclude
- Setup instructions (agents don't install)
- Performance metrics (unless performance task)
- Historical decisions (unless affecting current patterns)
- Deployment details (unless deployment task)
- Human workflow processes
- Verbose explanations (use semantic compression instead)

### When to Update
- New architectural patterns introduced
- Directory structure changes
- New technology additions
- Pattern conventions change
- Agent configurations modified
- MCP server integrations added/changed
- Security validation patterns updated
- Command workflows restructured

## Example Complete YAML

```yaml
# AI-optimized project context with agent consolidation pattern
project:
  name: "tkr-context-kit"
  type: "development-toolkit"
  description: "Claude Code enhancement toolkit with AI integration, ReactFlow knowledge graphs, and project analysis capabilities"
  entry_point: "setup"
  primary_commands: ["./setup", "npm run build", "npm run serve", ".context-kit/scripts/setup-context-kit-mcp"]
  version: "1.2.0"
  status: "production-ready"

structure:
  key_paths:
    ".claude/agents/": "Analysis agents (consolidator, api/ui/code/structure/dependency analyzers)"
    ".claude/commands/": "Custom Claude Code commands (project-yaml, security-review)"
    ".context-kit/mcp-knowledge-graph/": "MCP server for persistent AI memory (TypeScript)"
    ".context-kit/scripts/": "Setup and utility automation scripts (Bash)"
    
  find_patterns:
    agent: ".claude/agents/{agent-name}.md"
    command: ".claude/commands/{command-name}.md"
    mcp_server: ".context-kit/mcp-knowledge-graph/{file}.ts"

patterns:
  agent_architecture: "specialized analyzers with consolidation pattern"
  security_model: "path validation with allowlist protection"
  mcp_integration: "STDIO transport with JSON schema validation"
  port_allocation: "42xxx range with conflict detection"

stack:
  language: "TypeScript strict mode + Bash scripting"
  protocol: "MCP (Model Context Protocol) over STDIO"
  persistence: "JSONL file-based knowledge graph storage"

integrations:
  ai_models:
    type: "MCP protocol over STDIO"
    location: ".context-kit/mcp-knowledge-graph/"
    entry: "index.ts"
    memory_path: "$HOME/.claude-memory/knowledge-graph.jsonl"
    
  claude_code:
    agents: ".claude/agents/"
    commands: ".claude/commands/"
    permissions: ["Read", "Write", "Task", "mcp__context-kit__*"]

architecture:
  core_patterns:
    - "MCP server architecture for persistent AI memory"
    - "Agent specialization with consolidation workflows" 
    - "Security-first design with path validation"

semantic_keys:
  ~mcp: "Model Context Protocol for AI model integration"
  ~consolidator_pattern: "Multiple specialized agents feeding into single consolidator"
  ~security_validation: "Path traversal protection with allowlist directories"

# Only include task-specific sections when relevant
```

This specification ensures AI agents receive maximum navigational and pattern information with minimum token usage, optimizing their ability to understand and modify the codebase effectively.