# Context-Kit YAML Specification

**Version:** 1.0
**Based on:** Repo-Context Format v1.0
**Status:** Production
**Last Updated:** 2025-09-30

## Overview

The Context-Kit YAML format (`_context-kit.yml`) is a specialized implementation of the Repo-Context Format v1.0 specification, optimized for AI agent consumption in development toolkit projects. It provides a highly compressed, token-efficient representation of project structure, dependencies, architecture, and design systems.

### Key Features

- **40-60% token reduction** through systematic compression
- **YAML 1.2 compliant** with full anchor/alias support
- **AI-optimized** structure for Claude Code and other AI agents
- **Multi-service architecture** support with port allocation
- **W3C design system** integration
- **Context7 documentation** mapping

## Format Structure

### Required Metadata (`meta`)

```yaml
meta:
  kit: string                    # Project identifier (required)
  fmt: integer                   # Format version number (required)
  type: string                   # Project type (required)
  desc: string                   # Brief description (required)
  ver: string                    # Semantic version (required)
  ts: string                     # ISO 8601 UTC timestamp (required)
  author: string                 # Author identifier (optional)
  status: string                 # Project status (optional)
  entry: string                  # Main entry point (optional)
  stack: string                  # Technology stack summary (optional)
  cmds: array                    # Key commands (optional)
  achievements: array            # Notable milestones (optional)
```

**Field Requirements:**
- `fmt`: Integer representing format version (current: 14+)
- `ts`: ISO 8601 format in UTC (e.g., `"2025-09-30T14:30:00Z"`)
- `type`: One of: `development-toolkit`, `library`, `application`, `monorepo`
- `status`: One of: `development`, `production-ready`, `archived`, `experimental`

### Dependencies (`deps`)

Dependencies section with Context7 documentation IDs for AI reference.

```yaml
deps: &deps
  js: &js-deps                  # JavaScript/TypeScript dependencies
    prod:                       # Production dependencies
      package-name: {id: string, v: string}
    dev:                        # Development dependencies
      package-name: {id: string, v: string}
    peer:                       # Peer dependencies (optional)
      package-name: {id: string, v: string}

  py:                          # Python dependencies (optional)
    prod:
      package-name: {id: string, v: string}

  internal:                    # Internal/workspace dependencies
    package-name:
      type: workspace
      path: string
      desc: string
```

**Field Format:**
- `id`: Context7 documentation ID (e.g., `"ctx7-12345"`) or `"not found"`
- `v`: Version string with proper quoting (e.g., `"^18.2.0"`)

### Structure (`struct`)

Directory structure using `_:` pattern for aggregates.

```yaml
struct:
  _: {n: integer, t: {ext: count}, modules: integer}  # Root aggregate

  directory-name:
    _: {n: integer, t: {ext: count}}                  # Directory aggregate
    subdirectory:
      _: {n: integer}
      files: [file1, file2, ...]                      # File list (optional)

    file.ext: tracked                                 # Tracked files
```

**Aggregate Fields:**
- `n`: Total file count in directory
- `t`: Type breakdown by file extension
- `modules`: Number of independent modules (optional)

**File Tracking:**
- Use `tracked` for important tracked files
- Use `modified` for files with uncommitted changes
- Use file arrays for grouped related files

### Design System (`design`)

W3C Design Token Format 3.0 compliant design specifications.

```yaml
design:
  tokens:                      # Design tokens
    color: &colors
      category:
        token-name: {val: string, type: type, desc: string}

    typography: &typography
      font_family:
        name: {val: string, type: fontFamily}
      font_size:
        name: {val: string, type: dimension, desc: string}
      font_weight:
        name: {val: string, type: fontWeight}
      line_height:
        name: {val: string, type: number}

    spacing: &spacing
      name: {val: string, type: dimension, desc: string}

    border:
      width:
        name: {val: string, type: dimension}
      radius:
        name: {val: string, type: dimension, desc: string}

    shadow:
      name: {val: string, type: shadow}

    opacity:
      name: {val: string, type: number}

  dark:                        # Dark mode overrides (optional)
    color:
      category:
        token-name: {val: string, type: color, desc: string}

  comp:                        # Component specifications
    ComponentName:
      p: {prop: type|[values]}              # Props (abbreviated)
      s: [state1, state2, ...]              # States (abbreviated)
      variants: {name: string}              # Variants (optional)
      a11y: {feature: value}                # Accessibility (abbreviated)
      interactions: {action: effect}        # Interactions (optional)
      design_tokens: [token-refs]           # Token references (optional)

  a11y:                        # Accessibility specifications
    compliance: string         # WCAG level (e.g., "WCAG 2.1 AA")
    keyboard_navigation: object
    screen_reader: object
    focus_management: object
    color_contrast: object

  animations:                  # Animation specifications (optional)
    transitions: object
    animations: object

  layout:                      # Layout specifications (optional)
    breakpoints: object
    grid: object
    responsive_patterns: object

  metadata:                    # Design system metadata
    version: string
    generated_from: string
    framework: string
    styling: string
    icons: string
    date_generated: string
    token_format: string
    components_analyzed: integer
    design_tokens_extracted: integer
    accessibility_features: string
```

**Token Types:**
- `color`: Color values (hex, rgb, hsl)
- `dimension`: Size values with units
- `fontFamily`: Font stack
- `fontWeight`: Weight value
- `number`: Unitless numbers
- `shadow`: Box shadow values

**Component Abbreviations:**
- `p`: props/properties
- `s`: states
- `a11y`: accessibility

### Architecture (`arch`)

Architecture patterns and technical stack.

```yaml
arch:
  stack: string|&tech-stack    # Technology stack (can reference meta.stack)
  patterns: &arch-patterns     # Architecture patterns
    - pattern-name

  services:                    # Service definitions (optional)
    service-name:
      type: string
      port: integer            # Port number (42xxx scheme)
      responsibility: string
      features: array
      build: string

  modules:                     # Module descriptions (optional)
    - module-name
```

### Operations (`ops`)

Operational patterns and workflows.

```yaml
ops:
  paths: &key-paths           # Important paths
    path: description

  service_patterns:           # Service management patterns
    development: object
    production: object
    analysis: object

  build_patterns:             # Build patterns (optional)
    pattern-name: description

  port_allocation: &ports     # Port assignments
    service-name: integer     # Port number (42xxx)
    scheme: string
    validation: string

  common_patterns: &common-ops  # Common operational patterns
    pattern-name: description
```

### Tasks (`tasks`)

Common task execution patterns.

```yaml
tasks:
  task-name:
    files: array              # Related files
    pattern: string           # Execution pattern
```

### Semantic Hints (`semantic`)

AI consumption hints using `~` prefix.

```yaml
semantic:
  ~pattern_name: "Description for AI understanding"
```

**Naming Convention:**
- Prefix all keys with `~`
- Use snake_case for multi-word patterns
- Keep descriptions concise and meaningful

### Notes (`notes`)

Evolution and changelog entries.

```yaml
notes:
  - "UPDATE: Description of change"
  - "FEATURE: New capability added"
  - "FIX: Issue resolved"
```

## Validation Rules

### YAML 1.2 Compliance

1. **Anchors must be defined before aliases**
   ```yaml
   # ✅ Correct
   deps: &deps
     js: &js-deps

   arch:
     stack: *tech-stack

   # ❌ Wrong - anchor not defined
   arch:
     stack: *tech-stack  # Error: anchor not found
   ```

2. **Quotes required for ISO 8601 timestamps**
   ```yaml
   # ✅ Correct
   meta:
     ts: "2025-09-30T14:30:00Z"

   # ❌ Wrong
   meta:
     ts: 2025-09-30T14:30:00Z  # Syntax error
   ```

3. **Quotes required for version strings**
   ```yaml
   # ✅ Correct
   deps:
     js:
       prod:
         react: {id: "ctx7-12345", v: "^18.2.0"}

   # ❌ Wrong
   deps:
     js:
       prod:
         react: {id: ctx7-12345, v: ^18.2.0}  # Syntax error
   ```

### Structural Requirements

1. **Required sections**: `meta`, at least one content section
2. **Recommended sections**: `deps`, `struct`, `arch`, `ops`, `semantic`
3. **Optional sections**: `design`, `tasks`, `notes`, `agents`
4. **Section order**: No strict requirement, but consistent ordering improves readability

### Metadata Validation

1. **Format version** must be integer ≥ 1
2. **Timestamp** must be valid ISO 8601 UTC
3. **Version** should follow semantic versioning
4. **Type** should be from standard vocabulary

## Compression Guidelines

See [compression-techniques.md](./compression-techniques.md) for detailed compression strategies.

### Quick Reference

**Standard Abbreviations:**
- dependencies → deps
- structure → struct
- components → comp
- properties → props (or p)
- description → desc
- language → lang
- imports → imp
- exports → exp
- accessibility → a11y
- configuration → cfg
- environment → env

**Compact Patterns:**
- Arrays under 5 items: `[a, b, c]`
- Simple objects: `{key: val, key2: val2}`
- Directory aggregates: `_: {n: count, t: {ext: count}}`

## Tooling Support

### Generation

- **Command**: `/project-yaml`
- **Agent**: `project-yaml-builder`
- **Output**: `.context-kit/_context-kit.yml`

### Updates

- **Agent**: `project-yaml-update`
- **Mode**: Incremental updates based on git diff
- **Preservation**: Maintains anchors, aliases, and compression

### Validation

```bash
# Validate YAML syntax
yaml-validator .context-kit/_context-kit.yml

# Check anchor resolution
yq eval '.' .context-kit/_context-kit.yml > /dev/null
```

## Version History

- **v1.0** (2025-09-30): Initial specification based on Repo-Context Format v1.0

## See Also

- [compression-techniques.md](./compression-techniques.md) - Detailed compression strategies
- [examples.md](./examples.md) - Real-world examples and patterns
- [v2.md](./v2.md) - Original Repo-Context Format specification
