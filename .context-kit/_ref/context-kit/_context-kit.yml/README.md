# Context-Kit YAML Documentation

**Version:** 1.0
**Standard:** Repo-Context Format v1.0
**Status:** Production

## Overview

The Context-Kit YAML format (`_context-kit.yml`) is a highly optimized, AI-friendly project configuration format that achieves **40-60% token reduction** while maintaining complete project information. It's designed for consumption by Claude Code and other AI agents.

## Quick Start

### Generating a Context-Kit YAML

```bash
# Run the project-yaml command
/project-yaml

# Output: .context-kit/_context-kit.yml
```

### Updating Incrementally

```bash
# After making changes, update based on git diff
# Use project-yaml-update agent
```

### Basic Structure

```yaml
meta:
  kit: your-project
  fmt: 1
  type: development-toolkit
  desc: "Brief description"
  ver: "1.0.0"
  ts: "2025-09-30T14:30:00Z"

deps: &deps
  js:
    prod:
      package: {id: "ctx7-xxxxx", v: "^1.0.0"}

struct:
  _: {n: 100, t: {ts: 50, js: 30}}
  src:
    _: {n: 80}

arch:
  patterns:
    - "Pattern description"

ops:
  paths:
    "path/": "Description"

semantic:
  ~pattern_name: "AI hint"
```

## Documentation Files

### [specification.md](./specification.md)
**Complete format specification**
- Required and optional sections
- Field formats and types
- Validation rules
- YAML 1.2 compliance requirements

**Read this for:**
- Understanding the full format
- Required vs optional fields
- Validation requirements
- Section-by-section reference

### [compression-techniques.md](./compression-techniques.md)
**Detailed compression strategies**
- Anchors and aliases
- Standard abbreviations
- Compact notation
- Strategic omissions
- Complete optimization examples

**Read this for:**
- How to achieve 40-60% token reduction
- YAML anchor/alias patterns
- Abbreviation guidelines
- Validation checklist

### [examples.md](./examples.md)
**Real-world examples and best practices**
- Minimal project example
- Development toolkit example
- React component library example
- Multi-service architecture example
- Best practices by project type
- Troubleshooting common issues

**Read this for:**
- Concrete examples
- Project-type specific patterns
- Common mistakes to avoid
- Quick reference patterns

### [v2.md](./v2.md)
**Original Repo-Context Format specification**
- Base specification this format extends
- CommonMark structure
- Token budget guidelines
- AI agent guidance

**Read this for:**
- Understanding the foundational spec
- Broader context format concepts
- Additional optimization techniques

## Key Features

### 🎯 Token Efficiency
- **40-60% reduction** through systematic compression
- YAML 1.2 anchors and aliases
- Standard abbreviations
- Compact notation

### 🤖 AI-Optimized
- Semantic hints with `~` prefix
- Structured for Claude Code consumption
- Context7 documentation integration
- Clear patterns for agent understanding

### 📐 Standards-Based
- YAML 1.2 compliant
- W3C Design Token Format 3.0 (for design systems)
- ISO 8601 timestamps
- Semantic versioning

### 🔧 Multi-Service Support
- Service-oriented architecture patterns
- Port allocation (42xxx scheme)
- Build coordination
- Health monitoring integration

## Compression Quick Reference

### Standard Abbreviations

```yaml
dependencies  → deps
structure     → struct
components    → comp
properties    → props (or p)
description   → desc
language      → lang
imports       → imp
exports       → exp
accessibility → a11y
states        → s
```

### Compact Patterns

```yaml
# Arrays (< 5 items)
files: [file1, file2, file3]

# Simple objects
meta: {ln: 450, cls: 5, fn: 12}

# Directory aggregates
_: {n: 120, t: {ts: 40, tsx: 35}}
```

### Anchors and Aliases

```yaml
# Define
colors: &base-colors
  primary: "#0066cc"

# Reference
theme: *base-colors

# Merge
dark:
  <<: *base-colors
  accent: "#ff9900"
```

## Workflow Integration

### Generation Flow

```
1. Run analysis agents (docs-context7, dir-mapper, design-system)
   ↓
2. Execute project-yaml-builder to synthesize
   ↓
3. Output to .context-kit/_context-kit.yml
   ↓
4. Update persistent context in claude.local.md
```

### Update Flow

```
1. Make code changes
   ↓
2. Stage changes (git add)
   ↓
3. Run project-yaml-update agent
   ↓
4. Incremental YAML update with compression maintained
```

## Validation

### Pre-Generation Checklist

- [ ] All required metadata fields present
- [ ] ISO 8601 timestamp format
- [ ] Semantic versioning format
- [ ] Context7 IDs mapped (if available)

### Post-Generation Checklist

- [ ] Valid YAML 1.2 syntax
- [ ] All anchors resolve correctly
- [ ] Timestamps and versions quoted
- [ ] 40-60% token reduction achieved
- [ ] Readability maintained

### Validation Commands

```bash
# Validate YAML syntax
yq eval '.' .context-kit/_context-kit.yml

# Check anchor resolution
yq eval '.deps' .context-kit/_context-kit.yml

# Count tokens (rough estimate)
wc -w .context-kit/_context-kit.yml

# Find unquoted strings
grep -E 'ts:|v:' .context-kit/_context-kit.yml | grep -v '"'
```

## Tooling

### Claude Code Agents

- **project-yaml-builder** - Generate complete YAML from analysis outputs
- **project-yaml-update** - Incremental updates based on git changes
- **docs-context7** - Map dependencies to Context7 IDs
- **dir-mapper** - Generate structure information
- **design-system** - Extract design tokens and components

### Commands

- **/project-yaml** - Orchestrate full generation workflow
- **/context-init** - Initialize project context (includes YAML generation)

## Common Issues

### Anchor Not Found
```yaml
# ❌ Problem: Alias before anchor
arch:
  stack: *tech-stack
meta:
  stack: &tech-stack "..."

# ✅ Solution: Define anchor first
meta:
  stack: &tech-stack "..."
arch:
  stack: *tech-stack
```

### Syntax Error on Timestamp
```yaml
# ❌ Problem: No quotes
meta:
  ts: 2025-09-30T14:30:00Z

# ✅ Solution: Add quotes
meta:
  ts: "2025-09-30T14:30:00Z"
```

### Over-Compression
```yaml
# ❌ Problem: Unclear
c: {p: {v: [p, s]}, s: [d, h]}

# ✅ Solution: Balance compression
comp:
  Button:
    p: {variant: [primary, secondary]}
    s: [default, hover]
```

## Best Practices

### By Project Type

**Simple Applications**
- Focus on clarity over aggressive compression
- Basic anchor usage
- Simple structure with file counts

**Libraries**
- Emphasize public API documentation
- Full design system specs
- Clear peer dependencies

**Development Toolkits**
- Service architecture clarity
- Port allocation consistency
- Command documentation

**Monorepos**
- Module boundaries clear
- Shared dependencies explicit
- Build coordination patterns

### General Guidelines

1. **Define anchors first** before using aliases
2. **Use abbreviations consistently** throughout
3. **Prefer inline notation** for arrays < 5 items
4. **Omit empty values** strategically
5. **Balance compression with readability**
6. **Validate YAML 1.2 syntax** before writing
7. **Target 40-60% token reduction** while maintaining completeness

## Token Reduction Metrics

| Technique | Reduction |
|-----------|-----------|
| Anchors/aliases | 10-20% |
| Abbreviations | 15-25% |
| Compact notation | 10-15% |
| Strategic omissions | 5-15% |
| **Combined** | **40-60%** |

## Project Status

- ✅ Specification complete
- ✅ Compression techniques documented
- ✅ Examples and patterns provided
- ✅ Agents and commands updated
- ✅ Production ready

## Contributing

When updating this format:

1. **Maintain YAML 1.2 compliance**
2. **Preserve token efficiency goals**
3. **Document all changes**
4. **Update agents and commands**
5. **Provide migration examples**

## Version History

- **v1.0** (2025-09-30): Initial specification with Repo-Context Format v1.0 base

## License

Part of tkr-project-kit - see project LICENSE

---

**Need help?** See [examples.md](./examples.md) for real-world patterns or [specification.md](./specification.md) for complete format reference.
