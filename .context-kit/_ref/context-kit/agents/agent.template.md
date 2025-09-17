---
name: agent-name
description: Brief action-oriented description for automatic delegation
tools: [Read, Write]
color: Blue
expected_output: .context-kit/analysis/agent-name-output.yml
---

# Purpose

Sole Purpose: [Primary function 2-3 words]. [One sentence describing what it creates/produces].

## Instructions

When invoked, you must follow these steps:

1. **[Action Verb] + [Primary Task]**
   - Specific sub-task or implementation detail
   - Expected outcome or validation criteria
   - Error handling if applicable

2. **[Next Major Step]**
   - Prerequisite checks
   - Main processing logic
   - Progress indicators

3. **[Final Step]**
   - Result compilation
   - Output generation
   - Cleanup operations

## Best Practices

* [Specific domain best practice relevant to this agent]
* [Error handling approach for common failure modes]
* [Performance consideration for large-scale operations]
* [Output quality guideline to ensure consistency]

## Output Format

[Brief description of what the output represents and how it should be used]

```yaml
# Example output structure
_meta:
  agent: "agent-name"
  timestamp: "2025-07-31T10:00:00Z"
  version: "1.0"

# Main content section
data:
  key1:
    nested_key: "value"
    array_key: ["item1", "item2", "item3"]
  key2:
    property: "value"
    count: 42
    
# Use YAML anchors for repeated structures if applicable
common_config: &defaults
  setting1: "value"
  setting2: true
  
instance1:
  <<: *defaults
  specific: "override"
```

### Output Location

The output will be written to: `.context-kit/analysis/agent-name-output.yml`

### Incremental Update Pattern

For agents that support incremental updates:

```yaml
# Include git context in analysis
_meta:
  agent: "agent-name"
  timestamp: "2025-08-03T10:00:00Z"
  version: "1.0"
  git_commit: "abc123"
  changed_files: ["src/component.ts", "docs/readme.md"]
  
# Track what changed since last run
incremental:
  added: ["new-feature"]
  modified: ["existing-component"]
  removed: ["deprecated-api"]
  
# Main analysis data
data:
  # ... existing structure
```

### Parallel Execution Integration

For agents used in orchestrated workflows:

```yaml
# Enable parallel execution compatibility
orchestration:
  can_run_parallel: true
  dependencies: ["prerequisite-agent"]
  provides: ["analysis-type"]
  conflicts_with: ["mutually-exclusive-agent"]
```

### Key Abbreviations Used

If using abbreviated keys for compression, document them here:
- `deps`: dependencies
- `struct`: structure  
- `comp`: components
- `props`: properties
- `a11y`: accessibility
- `cfg`: configuration
- `pkg`: package
- `repo`: repository
- `impl`: implementation
- `spec`: specification

### Modern Compression Techniques

```yaml
# Use YAML anchors for repeated structures
common_patterns: &patterns
  format: "typescript"
  framework: "react"
  
# Reference anchors to reduce duplication
components:
  Button:
    <<: *patterns
    specific: "override"
    
# Compact arrays when appropriate
file_types: ["ts", "tsx", "js", "jsx"]

# Group related data for better token efficiency
metrics:
  size: {files: 42, lines: 1205, bytes: 45123}
  complexity: {avg: 3.2, max: 15, files_over_10: 2}
```