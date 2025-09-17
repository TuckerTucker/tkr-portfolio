# @ Mentions and Output Styles Recommendations for Context-Kit

## Overview

Claude Code's @ mentions and output styles features provide opportunities to enhance our context-kit agents and commands for better file referencing and programmatic integration.

## @ Mentions Analysis

### Current Capability
- @ mentions are for **file and directory references only**, not agent-to-agent communication
- Agent-to-agent communication still requires the `Task` tool
- Syntax: `@filename.ts`, `@src/`, `@.claude/agents/`

### Recommended @ Mention Integrations

#### 1. Enhanced Agent File References

**Current Pattern:**
```markdown
# Old: "Use the Read tool to examine analysis outputs"
```

**Enhanced Pattern:**
```markdown
# New: "Examine @.context-kit/analysis/ outputs and @_context-kit.yml"
```

#### 2. Agent-Specific @ Mention Patterns

**kg-update.md:**
```markdown
1. Examine @.context-kit/knowledge-graph/src/ for entity changes
2. Review @.claude/agents/ for agent modifications  
3. Check @_context-kit.yml for existing context
4. Analyze @.context-kit/knowledge-graph/knowledge-graph.db for data changes
```

**project-yaml-builder.md:**
```markdown
1. Consolidate @.context-kit/analysis/docs-context7-output.yml
2. Merge @.context-kit/analysis/dir-structure-output.yml
3. Integrate @.context-kit/analysis/design-system-output.yml
4. Reference @_context-kit.yml for existing structure
```

**design-system.md:**
```markdown
1. Analyze @.context-kit/knowledge-graph/src/ui/styles.css
2. Review @.context-kit/knowledge-graph/src/ui/components/ for patterns
3. Extract tokens from @.context-kit/knowledge-graph/src/ui/
```

**port-consistency.md:**
```markdown
1. Scan @.context-kit/knowledge-graph/package.json for port configurations
2. Check @.context-kit/scripts/ for port usage
3. Review @.context-kit/knowledge-graph/src/ for hardcoded ports
```

## Output Styles Analysis

### Available Formats
- `text` (default) - Human-readable output
- `json` (single result) - Structured data for APIs
- `stream-json` (realtime streaming) - Live updates

### Recommended Output Style Integrations

#### 1. Project YAML Command Enhancement

**Current Command:**
```bash
/project-yaml [output-path]
```

**Enhanced Command with Output Options:**
```bash
/project-yaml [output-path] [--format=text|json|yaml|stream]
```

**Use Cases:**
- `--format=yaml` - Current human-readable YAML (default)
- `--format=json` - API consumption and MCP server integration
- `--format=stream` - Real-time progress for long analyses
- `--format=text` - Simplified summary output

#### 2. JSON Output Agents

Create JSON variants of key agents:

**kg-initial-analyzer-json.md:**
```markdown
---
name: kg-initial-analyzer-json
description: Analyze project and output JSON for direct SQLite insertion
tools: Read, Glob, Grep, mcp__context-kit__*
output-format: json
---
```

**port-consistency-json.md:**
```markdown
---
name: port-consistency-json
description: Generate JSON report of port conflicts and recommendations
tools: Read, Write, Grep, Glob, Bash
output-format: json
---
```

**docs-context7-json.md:**
```markdown
---
name: docs-context7-json
description: Map dependencies to Context7 IDs in JSON format
tools: Read, mcp__context7__*, Write
output-format: json
---
```

#### 3. Stream Output for Real-Time Analysis

**Use Cases:**
- Long-running project analyses
- Knowledge graph updates with progress feedback
- Multi-phase agent execution monitoring

**Implementation:**
```bash
claude -p "/project-yaml" --output-format=stream-json
```

## Implementation Strategy

### Phase 1: Update Existing Agents
1. **meta-agent.md** - Include @ mention patterns in generated agents
2. **project-yaml-builder.md** - Use @ mentions for analysis file references
3. **kg-update.md** - Reference specific directories with @ mentions

### Phase 2: Create Output Style Variants
1. Create JSON variants of core analysis agents
2. Update command documentation with output format options
3. Test integration with MCP server workflows

### Phase 3: Integration Testing
1. Verify @ mentions work in agent workflows
2. Test JSON output with MCP server ingestion
3. Validate stream output for long-running processes

## Practical Examples

### Enhanced Agent Workflow
```markdown
# In kg-update.md workflow:
1. Check git status with `git diff --name-only`
2. If changes in @.context-kit/knowledge-graph/src/, update entities
3. If changes in @.claude/agents/, update agent registry
4. If changes in @_context-kit.yml, sync project context
```

### JSON Output Integration
```bash
# Generate project analysis as JSON for MCP server
claude -p "/project-yaml --format=json" --output-format=json > project-analysis.json

# Stream real-time analysis updates
claude -p "/project-yaml --format=stream" --output-format=stream-json
```

### Command Argument Extensions
```markdown
# Enhanced project-yaml.md argument handling:
argument-hint: [output-path] [--format=text|json|yaml|stream] - Output path and format options
```

## Benefits

### @ Mentions Benefits
- **Cleaner Workflows**: More explicit file references
- **Reduced Context**: Direct file access without intermediate reads
- **Better Documentation**: Clear dependencies in agent instructions

### Output Styles Benefits
- **API Integration**: JSON output for programmatic consumption
- **Real-Time Updates**: Stream output for long-running analyses
- **Flexible Consumption**: Multiple formats for different use cases
- **MCP Integration**: Direct JSON ingestion into knowledge graph

## Conclusion

@ mentions will significantly improve file reference patterns in our agents, while output styles enable better automation integration with our MCP server and knowledge graph architecture. The combination provides both developer experience improvements and enhanced programmatic capabilities.